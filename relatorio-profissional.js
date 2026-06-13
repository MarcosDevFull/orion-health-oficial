import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, collection, getDocs, query, where,
    doc, getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// CONFIGURAÇÃO
const firebaseConfig = {
    apiKey: "AIzaSyB3Gxc-8jjYyeJSQyhrWv7YzHOIO3v38JY",
    authDomain: "orion-8be51.firebaseapp.com",
    projectId: "orion-8be51",
    storageBucket: "orion-8be51.firebasestorage.app",
    messagingSenderId: "121485013135",
    appId: "1:121485013135:web:5c97776b4fbde4ef9fc0fa"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let chartFinance = null;
let chartType = null;

document.addEventListener('DOMContentLoaded', () => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    document.getElementById('data-inicio').value = primeiroDia.toISOString().split('T')[0];
    document.getElementById('data-fim').value = hoje.toISOString().split('T')[0];

    document.getElementById('btn-filtrar').addEventListener('click', loadReports);
    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) btnLogout.addEventListener('click', () => signOut(auth));

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            loadReports();
        } else {
            window.location.href = 'professional-login.html';
        }
    });
});

/**
 * CARREGA E CALCULA TUDO (Correção Final: Faturamento Só Conta Pagos)
 */
async function loadReports() {
    if (!currentUser) return;
    
    const startVal = document.getElementById('data-inicio').value;
    const endVal = document.getElementById('data-fim').value;
    
    const startDate = startVal ? new Date(startVal + 'T00:00:00') : new Date(0);
    const endDate = endVal ? new Date(endVal + 'T23:59:59') : new Date();

    console.log(`Filtrando de ${startDate.toLocaleString()} até ${endDate.toLocaleString()}`);

    const PORCENTAGEM_MEDICO = 0.93; 

    try {
        // 1. BUSCA DADOS
        const qFinanceiro = query(
            collection(db, "transacoes_financeiras"),
            where("medico_id", "==", currentUser.uid)
        );

        const qAgendamentos = query(
            collection(db, "agendamentos"),
            where("profissional_id", "==", currentUser.uid)
        );

        const qConsultas = query(
            collection(db, "consultas"),
            where("medico_id", "==", currentUser.uid)
        );

        const [snapFinanceiro, snapAgendamentos, snapConsultas] = await Promise.all([
            getDocs(qFinanceiro),
            getDocs(qAgendamentos),
            getDocs(qConsultas)
        ]);

        // --- VARIÁVEIS ---
        let faturamentoLiquidoTotal = 0;
        let totalTransacoes = 0;
        let totalCancelados = 0;
        let totalAtendimentos = 0; 
        
        let countOnline = 0;
        let countPresencial = 0;
        let countDomiciliar = 0;
        
        const tableData = [];
        const financeData = {}; 

        // --- A. PROCESSA FINANCEIRO (Dinheiro e Tipos) ---
        const financeiroPromises = snapFinanceiro.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            const dataObj = data.data?.toDate ? data.data.toDate() : new Date(data.data);
            
            if (dataObj >= startDate && dataObj <= endDate) {
                const valorBruto = parseFloat(data.valor || 0);
                const valorLiquido = valorBruto * PORCENTAGEM_MEDICO;

                let nomeReal = data.paciente_nome;
                if ((!nomeReal || nomeReal === 'Paciente') && data.paciente_id) {
                    try {
                        const pDoc = await getDoc(doc(db, 'pacientes', data.paciente_id));
                        if (pDoc.exists()) nomeReal = pDoc.data().nome;
                    } catch(e) {}
                }

                const statusReal = data.status || 'Pago';
                const tipo = data.tipo_servico || data.tipo || "Presencial";

                return {
                    isValid: true,
                    date: dataObj,
                    paciente: nomeReal || 'Paciente',
                    tipo: tipo,
                    valor: valorLiquido,
                    status: statusReal,
                    diaChave: dataObj.toLocaleDateString('pt-BR')
                };
            }
            return { isValid: false };
        });

        const resultadosFinanceiros = await Promise.all(financeiroPromises);

        resultadosFinanceiros.forEach(item => {
            if (item.isValid) {
                // Se não for cancelado, entra na tabela e nos gráficos (visual)
                if (item.status !== 'Cancelado') {
                    
                    // --- CORREÇÃO DO FATURAMENTO TOTAL ---
                    // Só soma ao TOTAL do topo se o dinheiro já estiver na conta (Pago/Concluído)
                    if (item.status === 'Pago' || item.status === 'Concluído') {
                        faturamentoLiquidoTotal += item.valor;
                        totalTransacoes++;
                    }
                    
                    // O Gráfico Financeiro mostra TUDO (incluindo o previsto/aguardando)
                    // Se quiseres que o gráfico mostre só o pago, move esta linha para dentro do if acima.
                    // Vou manter mostrando tudo para o médico ver o "Potencial".
                    financeData[item.diaChave] = (financeData[item.diaChave] || 0) + item.valor;

                    // CONTAGEM DE TIPOS (Para o Gráfico Pizza)
                    const t = item.tipo.toLowerCase();
                    if (t.includes('online')) countOnline++;
                    else if (t.includes('domiciliar')) countDomiciliar++;
                    else countPresencial++;
                }
                tableData.push(item);
            }
        });

        // --- B. PROCESSA ATENDIMENTOS (Consultas Realizadas) ---
        snapConsultas.forEach(doc => {
            const data = doc.data();
            let dataObj = null;
            if (data.data_consulta && data.data_consulta.toDate) dataObj = data.data_consulta.toDate();
            else if (data.data) dataObj = new Date(data.data);

            if (dataObj && dataObj >= startDate && dataObj <= endDate) {
                totalAtendimentos++;
            }
        });

        // --- C. PROCESSA CANCELAMENTOS ---
        snapAgendamentos.forEach(doc => {
            const data = doc.data();
            let dataObj = null;
            if (data.data_hora) dataObj = new Date(data.data_hora);
            else if (data.data && data.data.toDate) dataObj = data.data.toDate();
            
            if (dataObj && dataObj >= startDate && dataObj <= endDate) {
                if (data.status === 'cancelado') {
                    totalCancelados++;
                    tableData.push({
                        date: dataObj,
                        paciente: data.paciente_nome || 'Paciente',
                        tipo: data.tipo || 'Consulta',
                        valor: 0,
                        status: 'Cancelado',
                        diaChave: null
                    });
                }
            }
        });

        tableData.sort((a, b) => b.date - a.date);

        // --- ATUALIZAÇÃO DA TELA ---
        document.getElementById('kpi-faturamento').textContent = faturamentoLiquidoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('kpi-consultas').textContent = totalAtendimentos;
        document.getElementById('kpi-canceladas').textContent = totalCancelados;
        
        const ticketMedio = totalTransacoes > 0 ? faturamentoLiquidoTotal / totalTransacoes : 0;
        document.getElementById('kpi-ticket').textContent = ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        renderTable(tableData);
        renderFinanceChart(financeData);
        
        console.log(`Gráfico Tipos: Online=${countOnline}, Presencial=${countPresencial}, Domiciliar=${countDomiciliar}`);
        renderTypeChart(countOnline, countPresencial, countDomiciliar);

    } catch (error) {
        console.error("Erro ao carregar relatórios:", error);
    }
}
function renderTable(data) {
    const tbody = document.getElementById('transactions-body');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#888;">Sem dados neste período.</td></tr>';
        return;
    }

    data.slice(0, 15).forEach(item => { 
        const tr = document.createElement('tr');
        
        let badgeClass = 'badge-pago';
        let statusTexto = item.status; // Pega o texto original do banco

        // --- TRADUÇÃO VISUAL (Para ficar curto no Mobile) ---
        if (item.status === 'Cancelado' || item.status === 'cancelado') {
            badgeClass = 'badge-cancelado';
            statusTexto = 'Cancelado';
        } 
        else if (item.status === 'Aguardando Atendimento') {
            badgeClass = 'badge-aguardando';
            statusTexto = 'Aguardando'; // <--- MUDANÇA: Texto curto e elegante!
        } 
        else if (item.status === 'Concluído' || item.status === 'Pago') {
            badgeClass = 'badge-pago';
            statusTexto = 'Pago';
        }
        
        const valorFmt = item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        tr.innerHTML = `
            <td>${item.date.toLocaleDateString('pt-BR')}</td>
            <td>${item.paciente}</td>
            <td>${item.tipo}</td>
            <td>${valorFmt}</td>
            <td><span class="badge ${badgeClass}">${statusTexto}</span></td>
        `;
        tbody.appendChild(tr);
    });
}
// --- GRÁFICOS (CHART.JS) ---

function renderFinanceChart(dataObj) {
    const canvas = document.getElementById('financeChart');
    if (!canvas) return;
    const ctxF = canvas.getContext('2d');
    
    const labelsF = Object.keys(dataObj).sort((a, b) => {
        const [da, ma, ya] = a.split('/');
        const [db, mb, yb] = b.split('/');
        return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
    });
    const dataF = labelsF.map(l => dataObj[l]);

    if (chartFinance) chartFinance.destroy();

    chartFinance = new Chart(ctxF, {
        type: 'line',
        data: {
            labels: labelsF,
            datasets: [{
                label: 'Faturamento Líquido (R$)',
                data: dataF,
                borderColor: '#41b8d5',
                backgroundColor: 'rgba(65, 184, 213, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#41b8d5'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function renderTypeChart(online, presencial, domiciliar) {
    const canvas = document.getElementById('typeChart');
    if (!canvas) return;
    const ctxT = canvas.getContext('2d');
    
    if (chartType) chartType.destroy();

    // Se tudo for 0, desenha um gráfico cinza para não ficar vazio
    let dataSet = [online, presencial, domiciliar];
    let colors = ['#41b8d5', '#2d3748', '#9f7aea'];
    
    if (online === 0 && presencial === 0 && domiciliar === 0) {
        dataSet = [1]; // Placeholder
        colors = ['#e2e8f0']; // Cinza
    }

    chartType = new Chart(ctxT, {
        type: 'doughnut',
        data: {
            labels: ['Online', 'Presencial', 'Domiciliar'],
            datasets: [{
                data: dataSet,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 20, font: { size: 12 } }
                } 
            },
            cutout: '70%'
        }
    });

    // --- MENU HAMBÚRGUER (MOBILE) ---
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('menu-backdrop');

    function toggleMenu() {
        sidebar.classList.toggle('active');
        backdrop.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : ''; // Bloqueia scroll
    }

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            // Fecha ao clicar no fundo escuro
            sidebar.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
}