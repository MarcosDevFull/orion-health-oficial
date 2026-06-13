/* ==========================================================
   FICHEIRO: relatorio-paciente.js
   Gera relatórios visuais para o paciente usando Chart.js.
   ========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, collection, query, where, orderBy, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIGURAÇÃO DO FIREBASE (Sua config habitual) ---
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
let chartBemEstar = null;
let chartTipos = null;

document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar Mobile ---
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('profile-sidebar');
    const backdrop = document.getElementById('menu-backdrop');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            backdrop.classList.toggle('active');
        });
    }
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            sidebar.classList.remove('active');
            backdrop.classList.remove('active');
        });
    }

    // --- Logout ---
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => window.location.href = 'index.html');
        });
    }

    // --- Auth & Inicialização ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            loadHeaderInfo(user.uid);
            initReportsPage(user.uid);
        } else {
            window.location.href = 'index.html';
        }
    });
});

// --- Função 1: Carrega Header ---
// --- Função 1: Carrega Header (Versão Segura) ---
async function loadHeaderInfo(uid) {
    try {
        const docSnap = await getDoc(doc(db, 'pacientes', uid));
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Verifica se o elemento existe antes de escrever
            const nomeEl = document.getElementById('header-patient-name');
            const fotoEl = document.getElementById('header-patient-photo');

            if (nomeEl) nomeEl.textContent = data.nome || "Paciente";
            if (fotoEl && data.foto_url) fotoEl.src = data.foto_url;
        }
    } catch (e) { console.error("Erro header:", e); }
}

// --- Função Principal: Inicializa os Relatórios ---
async function initReportsPage(uid) {
    const tableBody = document.getElementById('history-table-body');
    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Carregando dados...</td></tr>';

    try {
        // 1. Busca Consultas e Registros em paralelo
        const qConsultas = query(collection(db, 'agendamentos'), where('paciente_id', '==', uid), orderBy('data_hora', 'desc'));
        // CORREÇÃO: Busca na subcoleção do paciente, não na raiz
            const qRegistros = query(
                collection(db, 'pacientes', uid, 'registrosDiarios'), 
                orderBy('timestamp', 'desc')
            );
                    const [snapConsultas, snapRegistros] = await Promise.all([
            getDocs(qConsultas),
            getDocs(qRegistros)
        ]);

        const consultas = snapConsultas.docs.map(d => ({ id: d.id, ...d.data() }));
        const registros = snapRegistros.docs.map(d => ({ id: d.id, ...d.data() }));

        // 2. Processa e Renderiza
        processStatsCards(consultas);
        renderWellnessChart(registros);
        renderAppointmentTypesChart(consultas);
        renderHistoryTable(consultas, registros);

    } catch (error) {
        console.error("Erro ao gerar relatórios:", error);
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Erro ao carregar dados.</td></tr>';
    }
    // --- LÓGICA DO MENU MOBILE & NAVEGAÇÃO ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileBackBtn = document.getElementById('mobile-back-btn');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('menu-backdrop');
    const closeMenuBtn = document.getElementById('close-menu-btn');

    // Abrir Menu
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.add('active');
            backdrop.classList.remove('hidden'); // Se usar a classe hidden
            backdrop.style.display = 'block'; // Ou display direto
        });
    }

    // Fechar Menu (X ou Backdrop)
    const closeMenu = () => {
        sidebar.classList.remove('active');
        backdrop.classList.add('hidden');
        backdrop.style.display = 'none';
    };

    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
    if (backdrop) backdrop.addEventListener('click', closeMenu);

    // Botão Voltar
    if (mobileBackBtn) {
        mobileBackBtn.addEventListener('click', () => {
            // Volta para a página anterior ou para o Dashboard
            window.location.href = 'paciente-perfil.html'; 
        });
    }
}

// --- A. Processa os Cards de Métricas ---
function processStatsCards(consultas) {
    const total = consultas.length;
    // Conta status normalizados (case-insensitive)
    const realizadas = consultas.filter(c => (c.status || '').toLowerCase() === 'realizada' || (c.status || '').toLowerCase() === 'concluída').length;
    const canceladas = consultas.filter(c => (c.status || '').toLowerCase().includes('cancelad')).length;

    document.getElementById('total-consultas').textContent = total;
    document.getElementById('consultas-realizadas').textContent = realizadas;
    document.getElementById('consultas-canceladas').textContent = canceladas;
}

/**
 * B. GRÁFICO DE LINHA (BEM-ESTAR) - DIAGNÓSTICO EXTREMO
 */
function renderWellnessChart(registros) {
    const ctx = document.getElementById('bemEstarChart');
    if (!ctx) return;

    console.log(">>> DIAGNÓSTICO GRÁFICO BEM-ESTAR <<<");
    
    if (registros.length > 0) {
        console.log("Exemplo de Registo Diário:", registros[0]);
    } else {
        console.warn("Nenhum registo diário encontrado para desenhar.");
    }

    const dailyScores = {}; 

    registros.forEach(reg => {
        if (!reg.timestamp) return;
        const dateObj = reg.timestamp.toDate ? reg.timestamp.toDate() : new Date(reg.timestamp);
        const dateKey = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        let sum = 0, count = 0;

        // TENTA TODAS AS VARIAÇÕES POSSÍVEIS
        // Humor
        const h1 = Number(reg.humor_score);
        const h2 = reg.humor ? Number(reg.humor.nivel || reg.humor.slider || reg.humor.valor) : 0;
        const hFinal = h1 || h2 || 0;
        if (hFinal > 0) { sum += hFinal; count++; }

        // Sono
        const s1 = Number(reg.sono_score);
        const s2 = reg.sono ? Number(reg.sono.horas || reg.sono.qualidade) : 0;
        // Normaliza sono (se for horas, converte para escala 1-5)
        let sFinal = s1 || s2 || 0;
        if (sFinal > 5) sFinal = 5; // Capa em 5 se for horas

        if (sFinal > 0) { sum += sFinal; count++; }

        // Energia
        const e1 = Number(reg.energia_score);
        const e2 = reg.energia ? Number(reg.energia.nivel) : 0;
        const eFinal = e1 || e2 || 0;
        if (eFinal > 0) { sum += eFinal; count++; }

        if (count > 0) {
            const avg = sum / count;
            if (!dailyScores[dateKey]) dailyScores[dateKey] = [];
            dailyScores[dateKey].push(avg);
            // Log para ver se calculou algo
            console.log(`Dia ${dateKey}: Humor=${hFinal}, Sono=${sFinal}, Média=${avg}`);
        }
    });

    // ... (resto da função de desenho do gráfico mantém-se igual) ...
    // Prepara dados e desenha...
    const sortedDates = Object.keys(dailyScores).sort((a, b) => {
        const [da, ma] = a.split('/'); const [db, mb] = b.split('/');
        return new Date(ma + '/' + da) - new Date(mb + '/' + db);
    });

    const labels = sortedDates.slice(-14); 
    const dataPoints = labels.map(date => {
        const scores = dailyScores[date];
        const dayAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return dayAvg.toFixed(1);
    });

    if (chartBemEstar) chartBemEstar.destroy();

    chartBemEstar = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bem-Estar (1-5)',
                data: dataPoints,
                borderColor: '#41b8d5',
                backgroundColor: 'rgba(65, 184, 213, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}
// --- C. Gráfico de Rosca (Tipos de Consulta) ---
function renderAppointmentTypesChart(consultas) {
    const ctx = document.getElementById('tiposConsultaChart').getContext('2d');
    
    let online = 0, presencial = 0;
    consultas.forEach(c => {
        const tipo = (c.tipo || '').toLowerCase();
        if (tipo === 'online') online++;
        else presencial++; // Assume presencial se não for online
    });

    if (chartTipos) chartTipos.destroy();

    // Se não houver dados, mostra um gráfico vazio ou placeholder
    if (online === 0 && presencial === 0) {
        // Opcional: desenhar um gráfico cinza
    }

    chartTipos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Online', 'Presencial'],
            datasets: [{
                data: [online, presencial],
                backgroundColor: ['#41b8d5', '#3197b1'], // Cores da marca
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
            }
        }
    });
}

// --- D. Tabela de Histórico Combinado ---
function renderHistoryTable(consultas, registros) {
    const tableBody = document.getElementById('history-table-body');
    
    // 1. Normaliza os dados para um formato comum
    const listaCombined = [];

    // Adiciona Consultas
    consultas.forEach(c => {
        const dateObj = c.data_hora ? new Date(c.data_hora) : (c.data?.toDate ? c.data.toDate() : new Date());
        listaCombined.push({
            dateObj: dateObj,
            type: 'Consulta',
            details: c.medico_nome || "Profissional de Saúde",
            statusRaw: c.status,
            isRegistro: false
        });
    });

    // Adiciona Registros Diários
    registros.forEach(r => {
        const dateObj = r.timestamp ? (r.timestamp.toDate ? r.timestamp.toDate() : new Date(r.timestamp)) : new Date();
        // Calcula média do registro
        let sum = 0, count = 0;
        if (r.humor_score) { sum += Number(r.humor_score); count++; }
        if (r.sono_score) { sum += Number(r.sono_score); count++; }
        if (r.energia_score) { sum += Number(r.energia_score); count++; }
        const avg = count > 0 ? (sum / count).toFixed(1) : 'N/D';

        listaCombined.push({
            dateObj: dateObj,
            type: 'Check-in Diário',
            details: r.notas || "Sem anotações",
            statusRaw: avg,
            isRegistro: true
        });
    });

    // 2. Ordena tudo por data (mais recente primeiro)
    listaCombined.sort((a, b) => b.dateObj - a.dateObj);

    // 3. Gera o HTML
    if (listaCombined.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhuma atividade recente.</td></tr>';
        return;
    }

    tableBody.innerHTML = listaCombined.map(item => {
        const dateFmt = item.dateObj.toLocaleDateString('pt-BR');
        const badgeType = item.isRegistro ? 'badge-checkin' : 'badge-consulta';
        const iconType = item.isRegistro ? 'fa-heart-pulse' : 'fa-user-doctor';
        
        // Coluna Status/Score
        let statusHtml = '';
        if (item.isRegistro) {
            const score = Number(item.statusRaw);
            let scoreClass = 'score-mid';
            let scoreIcon = 'fa-meh';
            if (score >= 4) { scoreClass = 'score-high'; scoreIcon = 'fa-smile-beam'; }
            else if (score <= 2.5) { scoreClass = 'score-low'; scoreIcon = 'fa-frown'; }
            
            statusHtml = `<span class="score-indicator ${scoreClass}"><i class="fa-regular ${scoreIcon}"></i> Score: ${item.statusRaw}</span>`;
        } else {
            const status = (item.statusRaw || '').toLowerCase();
            let color = '#718096';
            if (status.includes('confirm') || status.includes('realiz')) color = '#16a34a';
            if (status.includes('cancel')) color = '#dc2626';
            if (status.includes('pendente')) color = '#ca8a04';
            
            statusHtml = `<span style="font-weight:600; color:${color}; text-transform:capitalize;">${status || 'Agendada'}</span>`;
        }

        return `
            <tr>
                <td><strong style="color:#333;">${dateFmt}</strong></td>
                <td><span class="badge-tipo ${badgeType}"><i class="fa-solid ${iconType}"></i> ${item.type}</span></td>
                <td style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.details}</td>
                <td>${statusHtml}</td>
            </tr>
        `;
    }).join('');
}