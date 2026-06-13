// ==========================================================
// FICHEIRO: paciente-perfil.js (V9 Modular CORRIGIDO)
// PROBLEMA: Botão Salvar (type="submit") não disparava o listener do formulário.
// SOLUÇÃO: Alterado o listener para 'click' DIRETO no botão 'salvar-novo-registro-btn'
//          e movido todos os listeners e seletores para dentro do DOMContentLoaded
//          para garantir que o HTML existe.
// ==========================================================

// --- 1. IMPORTAÇÕES DO FIREBASE (MODULAR V9) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, collection, query, 
    where, getCountFromServer, onSnapshot, addDoc, serverTimestamp, 
    orderBy, limit, getDocs,writeBatch, 
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- 2. CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyB3Gxc-8jjYyeJSQyhrWv7YzHOIO3v38JY",
    authDomain: "orion-8be51.firebaseapp.com",
    projectId: "orion-8be51",
    storageBucket: "orion-8be51.firebasestorage.app",
    messagingSenderId: "121485013135",
    appId: "1:121485013135:web:5c97776b4fbde4ef9fc0fa"
};

// --- 3. INICIALIZAÇÃO DO FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// FullCalendar e Chart.js são carregados globalmente pelos script tags no HTML
const { Chart } = window; 

// --- 4. VARIÁVEIS DE ESTADO GLOBAIS ---
let currentUser = null;
let currentPatientData = {};
let isPatientOnline = false;
let allPatientRecords = []; // Cache para todos os registros
let progressoCalendarInstance = null;
let allRecipes = [];

// ==========================================================
// --- 5. FUNÇÕES DE LÓGICA (Definições) ---
// (Todas as suas funções lógicas estão aqui, intocadas)
// ==========================================================

function showLoading(show) {
    const loadingOverlay = document.getElementById('loading-overlay-profile');
    if (loadingOverlay) {
        loadingOverlay.classList.toggle('hidden', !show);
    }
}

const openModal = (modal) => {
    const backdrop = document.getElementById('backdrop');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; 
        if (backdrop && !modal.classList.contains('profile-sidebar')) {
            backdrop.classList.remove('hidden');
        }
    } else {
        console.error("openModal: Tentativa de abrir um modal nulo/inválido.");
    }
};

const closeModal = (modal) => {
    const backdrop = document.getElementById('backdrop');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        
        const anyModalOpen = document.querySelector('.modal:not(.hidden), .profile-sidebar.open');
        
        if (backdrop && !anyModalOpen) {
            backdrop.classList.add('hidden');
        }
    } else {
        console.error("closeModal: Tentativa de fechar um modal nulo/inválido.");
    }
};

function openMobileMenu() {
    const sidebarMenu = document.getElementById('patient-sidebar-menu');
    const backdrop = document.getElementById('backdrop');
    if (sidebarMenu) sidebarMenu.classList.add('open');
    if (backdrop) backdrop.classList.remove('hidden');
}

function closeMobileMenu() {
    const sidebarMenu = document.getElementById('patient-sidebar-menu');
    const backdrop = document.getElementById('backdrop');
    if (sidebarMenu) sidebarMenu.classList.remove('open');
    if (backdrop) {
        const anyModalOpen = document.querySelector('.modal:not(.hidden)');
        if (!anyModalOpen) {
            backdrop.classList.add('hidden');
        }
    }
}

// --- 1. CARREGAR DADOS DO PACIENTE (COM AUTO-CRIAÇÃO) ---
    async function loadPatientData(patientId) {
        if (!db || !patientId) return null;
        
        console.log("Buscando perfil para:", patientId);

        try {
            const patientDocRef = doc(db, 'pacientes', patientId);
            const docSnap = await getDoc(patientDocRef);
            
            if (docSnap.exists()) {
                console.log("Dados do paciente carregados.");
                return docSnap.data();
            } else {
                // --- CORREÇÃO: PERFIL NÃO EXISTE -> CRIA AGORA ---
                console.warn(`Perfil não encontrado no perfil-de-saude. Criando emergência...`);
                
                const novoPerfil = {
                    nome: currentUser.displayName || "Paciente Novo",
                    email: currentUser.email || "pendente@email.com",
                    data_cadastro: serverTimestamp(),
                    tipo: "paciente",
                    foto_url: currentUser.photoURL || "https://placehold.co/60x60/a0d9e5/41b8d5?text=P",
                    status_conta: "ativo"
                };
                
                await setDoc(patientDocRef, novoPerfil);
                console.log("Perfil criado no perfil-de-saude com sucesso!");
                
                return novoPerfil; // Retorna o novo para não travar
            }
        } catch (error) {
            console.error("Erro crítico ao carregar dados:", error);
            // Retorna um objeto mínimo para a página abrir
            return { nome: "Paciente", email: "Erro ao carregar" };
        }
    }

/**
 * Salva o formulário de Registro Diário no Firestore.
 * ESTA FUNÇÃO ESTÁ PERFEITA.
 */
async function handleSalvarRegistroDiario() {
    console.log("Iniciando handleSalvarRegistroDiario...");
    
    // Seleciona os elementos DO FORMULÁRIO aqui dentro
    const form = document.getElementById('form-novo-registro-diario');
    const submitButton = document.getElementById('salvar-novo-registro-btn');
    const feedbackEl = document.getElementById('novo-registro-feedback');
    const registroMedListaCheckboxes = document.getElementById('registro-med-lista-checkboxes');
    const registroRefeicoesExternasLista = document.getElementById('registro-refeicoes-externas-lista');

    if (!form || !submitButton || !feedbackEl || !currentUser) {
        console.error("Componentes do formulário de registro ou usuário não encontrados.");
        return;
    }

    feedbackEl.classList.add('hidden');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    try {
        const registroData = {
            paciente_id: currentUser.uid,
            timestamp: serverTimestamp(), 
            dataCompleta: new Date().toISOString(), 
            sono: {
                horas: document.getElementById('registro-horas-sono').value || null,
                qualidade: document.getElementById('registro-qualidade-sono').value || null
            },
            humor: {
                slider: parseInt(document.getElementById('registro-humor-slider').value, 10) || 3,
                observacoes: document.getElementById('registro-humor-obs').value || null
            },
            dor: {
                sentiu: document.getElementById('registro-dor-checkbox').checked,
                local: document.getElementById('registro-dor-checkbox').checked ? (document.getElementById('registro-dor-local').value || null) : null,
                intensidade: document.getElementById('registro-dor-checkbox').checked ? (parseInt(document.getElementById('registro-dor-intensidade').value, 10) || null) : null
            },
            medicacao: {
                tomou: document.getElementById('registro-med-tomou').checked,
                listaConfirmada: Array.from(
                    registroMedListaCheckboxes?.querySelectorAll('input[type="checkbox"]:checked') || []
                ).map(cb => ({ nome: cb.dataset.name, tipo: cb.dataset.tipo })),
                listaNaoConfirmada: Array.from(
                    registroMedListaCheckboxes?.querySelectorAll('input[type="checkbox"]:not(:checked)') || []
                ).map(cb => ({ nome: cb.dataset.name, tipo: cb.dataset.tipo })),
                sentiuEfeitos: document.getElementById('registro-med-efeitos').checked,
                efeitosObs: document.getElementById('registro-med-efeitos').checked ? (document.getElementById('registro-med-efeitos-obs').value || null) : null,
                efeitosEscala: document.getElementById('registro-med-efeitos').checked ? (parseInt(document.getElementById('registro-med-efeitos-escala').value, 10) || null) : null
            },
            alimentacao: {
                cafe: document.getElementById('check-refeicao-cafe').checked ? (document.getElementById('input-refeicao-cafe').value || 'Confirmado') : null,
                almoco: document.getElementById('check-refeicao-almoco').checked ? (document.getElementById('input-refeicao-almoco').value || 'Confirmado') : null,
                tarde: document.getElementById('check-refeicao-tarde').checked ? (document.getElementById('input-refeicao-tarde').value || 'Confirmado') : null,
                janta: document.getElementById('check-refeicao-janta').checked ? (document.getElementById('input-refeicao-janta').value || 'Confirmado') : null,
                extras: Array.from(
                    registroRefeicoesExternasLista?.querySelectorAll('.meal-item-externo') || []
                ).map(item => ({ nome: item.dataset.name, detalhes: item.dataset.detalhes || null })),
                aguaLitros: parseFloat(document.getElementById('registro-alim-agua').value) || null,
                observacoes: document.getElementById('registro-alim-obs').value || null,
                escala: parseInt(document.getElementById('registro-alim-escala').value, 10) || null
            },
            sinaisVitais: {
                pressaoSistolica: parseInt(document.getElementById('reg-pressao-sistolica').value, 10) || null,
                pressaoDiastolica: parseInt(document.getElementById('reg-pressao-diastolica').value, 10) || null,
                glicemia: parseInt(document.getElementById('reg-glicemia').value, 10) || null,
                saturacaoO2: parseInt(document.getElementById('reg-saturacao-o2').value, 10) || null,
                freqCardiaca: parseInt(document.getElementById('reg-freq-cardiaca').value, 10) || null,
                temperatura: parseFloat(document.getElementById('reg-temperatura').value) || null,
                peso: parseFloat(document.getElementById('reg-peso').value) || null
            }
        };

        // 4. Salvar no Firestore
        const registrosRef = collection(db, 'pacientes', currentUser.uid, 'registrosDiarios');
        await addDoc(registrosRef, registroData);

        // 5. Feedback de Sucesso
        feedbackEl.textContent = 'Registro salvo com sucesso!';
        feedbackEl.className = 'feedback-message success';
        feedbackEl.classList.remove('hidden');
        
        // 6. Atualiza o dashboard em tempo real (sem recarregar a página)
        await populateSummaryCards(currentUser.uid); // Atualiza os 3 cards de resumo
        await loadHistoricoRegistrosCompleto(true); // Força o recarregamento dos dados
        loadAndRenderHealthIndicators(); // Recalcula as barras de progresso

        // 7. Fecha e Reseta o modal
        setTimeout(() => {
            const modal = document.getElementById('novo-registro-diario-modal');
            if (modal) closeModal(modal);
            form.reset();
            // Resetar manualmente os campos condicionais
            document.getElementById('registro-dor-detalhes')?.classList.add('hidden');
            document.getElementById('registro-med-lista')?.classList.add('hidden');
            document.getElementById('registro-med-efeitos-detalhes')?.classList.add('hidden');
            document.querySelectorAll('.meal-details').forEach(el => el.classList.add('hidden'));
            if(registroMedListaCheckboxes) registroMedListaCheckboxes.innerHTML = '';
            if(registroRefeicoesExternasLista) registroRefeicoesExternasLista.innerHTML = '';
        }, 1500); 

    } catch (error) {
        // 9. Feedback de Erro
        console.error("Erro ao salvar registro diário:", error);
        if (feedbackEl) {
            feedbackEl.textContent = 'Ocorreu um erro ao salvar. Tente novamente.';
            feedbackEl.className = 'feedback-message error';
            feedbackEl.classList.remove('hidden');
        }
    } finally {
        // 10. Re-habilita o botão
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Registro';
    }
}

/**
 * Carrega TODOS os registros diários do paciente a partir do Firestore
 * e armazena na variável global 'allPatientRecords'.
 */
async function loadHistoricoRegistrosCompleto(forceRefresh = false) {
    if (allPatientRecords.length > 0 && !forceRefresh) {
        console.log("Histórico de registros já está em memória.");
        return true;
    }
    if (!currentUser) {
        console.error("loadHistoricoRegistrosCompleto: Utilizador não encontrado.");
        return false;
    }
    console.log("A carregar histórico completo de Registros Diários do Firestore...");
    try {
        const registrosRef = collection(db, 'pacientes', currentUser.uid, 'registrosDiarios');
        const q = query(registrosRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        allPatientRecords = querySnapshot.docs.map(doc => {
            const data = doc.data();
            if (data.timestamp && data.timestamp.toDate) {
                data.jsDate = data.timestamp.toDate();
            } else {
                data.jsDate = new Date(data.dataCompleta || new Date());
            }
            return data;
        });
        
        console.log(`Carregados ${allPatientRecords.length} registros.`);
        return true;
    } catch (error) {
        console.error("Erro ao carregar histórico completo:", error);
        return false;
    }
}

/**
 * Filtra os registros e atualiza o gráfico e a lista
 * (Esta é a função "mestre" do modal de Histórico)
 */
function renderHistoricoModal() {
    const historicoPeriodoFiltros = document.getElementById('historico-periodo-filtros');
    const historicoSubTabNav = document.getElementById('historico-sub-tab-nav');
    if (!historicoPeriodoFiltros || !historicoSubTabNav) return;

    const activePeriodBtn = historicoPeriodoFiltros.querySelector('.filter-btn-small.active');
    const periodInDays = activePeriodBtn ? parseInt(activePeriodBtn.dataset.period, 10) : 7;
    
    const activeTabBtn = historicoSubTabNav.querySelector('.sub-tab-btn.active');
    const activeTab = activeTabBtn ? activeTabBtn.dataset.subtab : 'sono';
    
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - periodInDays);
    const dadosFiltrados = allPatientRecords.filter(reg => reg.jsDate >= dataLimite);
    
    document.querySelectorAll('#historico-content-container .sub-tab-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    const activePanel = document.getElementById(`historico-tab-${activeTab}`);
    if (activePanel) {
        activePanel.classList.remove('hidden');
        drawHistoricoChart(dadosFiltrados, activeTab);
        populateHistoricoLista(dadosFiltrados, activeTab);
    } else {
        console.warn(`Painel do histórico para a aba '${activeTab}' não encontrado.`);
    }
}

/**
 * Desenha o gráfico (Chart.js) para uma aba específica.
 */
function drawHistoricoChart(dados, tabId) {
    const canvasId = `historico-chart-${tabId}`;
    const canvas = document.getElementById(canvasId);

    if (tabId === 'biometricos') {
        drawAllBiometricCharts(dados); 
        return; 
    }
    
    if (!canvas) {
        console.warn(`Canvas com ID ${canvasId} não encontrado.`);
        return;
    }
    const ctx = canvas.getContext('2d');
    
    if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
    }
    
    const chartData = { labels: [], datasets: [] };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    };
    
    dados.sort((a, b) => a.jsDate - b.jsDate);
    const labels = dados.map(reg => reg.jsDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    
    if (tabId === 'sono') {
        chartData.labels = labels;
        chartData.datasets.push({
            label: 'Horas de Sono',
            data: dados.map(reg => reg.sono?.horas || 0),
            backgroundColor: 'rgba(65, 184, 213, 0.7)',
            borderColor: 'rgba(65, 184, 213, 1)',
            borderWidth: 1,
            type: 'bar',
        });
        chartOptions.scales.y.suggestedMax = 10;
    }
    
    else if (tabId === 'humor') {
        chartData.labels = labels;
        chartData.datasets.push({
            label: 'Nível de Humor (1-5)',
            data: dados.map(reg => reg.humor?.slider || 0),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            tension: 0.3,
            fill: true,
            type: 'line',
        });
        chartOptions.scales.y.suggestedMax = 5;
    }
    
    else if (tabId === 'dor') {
        chartData.labels = labels;
        chartData.datasets.push({
            label: 'Nível de Dor (0-10)',
            data: dados.map(reg => reg.dor?.intensidade || 0),
            backgroundColor: 'rgba(229, 62, 62, 0.2)',
            borderColor: 'rgba(229, 62, 62, 1)',
            tension: 0.3,
            fill: true,
            type: 'line',
        });
        chartOptions.scales.y.suggestedMax = 10;
    }
    
    else if (tabId === 'alimentacao') {
        chartData.labels = labels;
        chartData.datasets.push({
            label: 'Qualidade da Alimentação',
            data: dados.map(reg => reg.alimentacao?.escala || 0),
            backgroundColor: 'rgba(237, 137, 54, 0.7)',
            borderColor: 'rgba(237, 137, 54, 1)',
            type: 'bar',
        });
        chartOptions.scales.y.suggestedMax = 5;
    }
    
    else if (tabId === 'medicacoes') {
        chartData.labels = labels;
        chartData.datasets.push({
            label: 'Intensidade Efeitos Colaterais (0-4)',
            data: dados.map(reg => reg.medicacao?.efeitosEscala || 0),
            backgroundColor: 'rgba(139, 92, 246, 0.2)',
            borderColor: 'rgba(139, 92, 246, 1)',
            type: 'line',
            fill: true,
            tension: 0.3,
        });
        chartOptions.scales.y.suggestedMax = 4;
    }

    else if (tabId === 'atividade') {
        chartData.labels = labels;
        chartData.datasets.push({
            label: 'Minutos de Atividade',
            data: dados.map(reg => reg.atividade?.minutos || 0),
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgba(16, 185, 129, 1)',
            type: 'bar',
        });
        chartOptions.scales.y.suggestedMax = 60; 
    }
    
    canvas.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
}

/**
 * Preenche a lista de "Registros Individuais" para uma aba específica.
 */
function populateHistoricoLista(dados, tabId) {
    const listaId = `historico-lista-${tabId}`;
    const listaContainer = document.getElementById(listaId);
    
    if (tabId === 'biometricos' || !listaContainer) {
        return;
    }
    
    listaContainer.innerHTML = '';
    
    if (dados.length === 0) {
        listaContainer.innerHTML = `<div class="placeholder" style="padding: 20px 0;">Nenhum registro encontrado para este período.</div>`;
        return;
    }
    
    dados.sort((a, b) => b.jsDate - a.jsDate);
    
    dados.forEach(reg => {
        const dataFormatada = reg.jsDate.toLocaleDateString('pt-BR', { dateStyle: 'long' });
        let detalhes = '';
        
        if (tabId === 'sono' && reg.sono) {
            detalhes = `<strong>${reg.sono.horas || 'N/A'}</strong> horas de sono<br>
                        Qualidade: <strong>${reg.sono.qualidade || 'N/A'}</strong>`;
        }
        
        else if (tabId === 'humor' && reg.humor) {
            detalhes = `Nível de humor: <strong>${reg.humor.slider || 'N/A'} de 5</strong><br>
                        Obs: <strong>${reg.humor.observacoes || 'Sem observações'}</strong>`;
        }
        
        else if (tabId === 'dor' && reg.dor) {
            if (reg.dor.sentiu) {
                detalhes = `Nível de dor: <strong>${reg.dor.intensidade || 'N/A'} de 10</strong><br>
                            Local: <strong>${reg.dor.local || 'Não especificado'}</strong>`;
            } else {
                detalhes = `<strong>Não reportou dor</strong> neste dia.`;
            }
        }
        
        else if (tabId === 'alimentacao' && reg.alimentacao) {
            detalhes = `Nota da alimentação: <strong>${reg.alimentacao.escala || 'N/A'} de 5</strong><br>
                        Obs: <strong>${reg.alimentacao.observacoes || 'Sem observações'}</strong>`;
        }
        
        else if (tabId === 'medicacoes' && reg.medicacao) {
            if (reg.medicacao.sentiuEfeitos) {
                detalhes = `Nota dos efeitos: <strong>${reg.medicacao.efeitosEscala || 'N/A'} de 4</strong><br>
                            Obs: <strong>${reg.medicacao.efeitosObs || 'Sem observações'}</strong>`;
            } else {
                detalhes = `<strong>Não reportou efeitos colaterais</strong>.`;
            }
        }
        
        else if (tabId === 'atividade' && reg.atividade) {
            detalhes = `Atividade registrada: <strong>${reg.atividade.minutos || '0'} minutos</strong>.`;
        }
        
        if (detalhes) {
            const itemHTML = `
                <div class="registro-individual-item">
                    <p class="registro-item-data">${dataFormatada}</p>
                    <div class="registro-item-detalhes">
                        ${detalhes}
                    </div>
                </div>
            `;
            listaContainer.insertAdjacentHTML('beforeend', itemHTML);
        }
    });
}

/**
 * Função "mãe" que chama o desenho de todos os 6 gráficos biométricos.
 */
function drawAllBiometricCharts(dados) {
    dados.sort((a, b) => a.jsDate - b.jsDate);
    const labels = dados.map(reg => reg.jsDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));

    drawBiometricChart_Pressao(dados, labels);
    drawBiometricChart_Simples(
        'historico-chart-glicemia',
        labels,
        dados.map(reg => reg.sinaisVitais?.glicemia || null),
        'Glicemia (mg/dL)',
        'rgba(217, 119, 6, 1)' // Laranja
    );
    drawBiometricChart_Simples(
        'historico-chart-freqCardiaca',
        labels,
        dados.map(reg => reg.sinaisVitais?.freqCardiaca || null),
        'Freq. Cardíaca (bpm)',
        'rgba(220, 38, 38, 1)' // Vermelho
    );
    drawBiometricChart_Simples(
        'historico-chart-saturacaoO2',
        labels,
        dados.map(reg => reg.sinaisVitais?.saturacaoO2 || null),
        'Saturação O₂ (%)',
        'rgba(37, 99, 235, 1)' // Azul Escuro
    );
    drawBiometricChart_Simples(
        'historico-chart-temperatura',
        labels,
        dados.map(reg => reg.sinaisVitais?.temperatura || null),
        'Temperatura (°C)',
        'rgba(107, 70, 193, 1)' // Roxo
    );
    drawBiometricChart_Simples(
        'historico-chart-peso',
        labels,
        dados.map(reg => reg.sinaisVitais?.peso || null),
        'Peso (kg)',
        'rgba(74, 85, 104, 1)' // Cinza
    );
}

/**
 * Desenha um gráfico biométrico SIMPLES (1 linha).
 */
function drawBiometricChart_Simples(canvasId, labels, dataPoints, label, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (canvas.chartInstance) canvas.chartInstance.destroy();
    
    canvas.chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: [{ label: label, data: dataPoints, borderColor: color, backgroundColor: color.replace('1)', '0.1)'), tension: 0.3, fill: true, spanGaps: true }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } }
    });
}

/**
 * Desenha o gráfico biométrico ESPECIAL de Pressão Arterial (2 linhas).
 */
function drawBiometricChart_Pressao(dados, labels) {
    const canvasId = 'historico-chart-pressao';
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (canvas.chartInstance) canvas.chartInstance.destroy();
    
    canvas.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Sistólica (Máx)',
                    data: dados.map(reg => reg.sinaisVitais?.pressaoSistolica || null),
                    borderColor: 'rgba(65, 184, 213, 1)', // Azul Orion
                    backgroundColor: 'rgba(65, 184, 213, 0.1)',
                    tension: 0.3,
                    fill: false,
                    spanGaps: true,
                },
                {
                    label: 'Diastólica (Mín)',
                    data: dados.map(reg => reg.sinaisVitais?.pressaoDiastolica || null),
                    borderColor: 'rgba(107, 114, 128, 1)', // Cinza
                    backgroundColor: 'rgba(107, 114, 128, 0.1)',
                    tension: 0.3,
                    fill: false,
                    spanGaps: true,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } }, 
            scales: { y: { beginAtZero: false, suggestedMin: 60, suggestedMax: 140 } }
        }
    });
}

/**
 * Formata os registros do paciente para o formato do FullCalendar.
 */
function formatRecordsForCalendar(records) {
    const datasUnicas = new Set();
    records.forEach(reg => {
        if (reg.jsDate) {
            const dataString = reg.jsDate.toLocaleDateString('en-CA'); 
            datasUnicas.add(dataString);
        }
    });
    
    console.log(`Formatados ${datasUnicas.size} dias únicos para o calendário.`);
    return Array.from(datasUnicas).map(data => ({
        start: data,
        display: 'background',
        color: '#e6f7ff' // Azul clarinho
    }));
}

/**
 * Cria e abre o modal do Calendário de Progresso.
 */
async function openProgressoModal() {
    const calendarEl = document.getElementById('calendario-progresso');
    if (!calendarEl) {
        console.error("Erro: O div '#calendario-progresso' não foi encontrado no HTML.");
        return;
    }
    
    showLoading(true);
    
    if (progressoCalendarInstance) {
        progressoCalendarInstance.destroy();
        progressoCalendarInstance = null;
    }
    
    await loadHistoricoRegistrosCompleto();
    const eventosFormatados = formatRecordsForCalendar(allPatientRecords);
    
    progressoCalendarInstance = new FullCalendar.Calendar(calendarEl, {
        locale: 'pt-br',
        initialView: 'dayGridMonth',
        height: 'auto',
        headerToolbar: {
            left: 'prev',
            center: 'title',
            right: 'next'
        },
        events: eventosFormatados,
        displayEventTime: false,
        eventDisplay: 'background',
    });
    
    const progressoModal = document.getElementById('progresso-modal');
    if (progressoModal) openModal(progressoModal);
    
    setTimeout(() => {
        progressoCalendarInstance.render();
        showLoading(false);
    }, 200);
}

/**
 * Salva o check-in de atividade física no Firestore.
 */
async function handleSalvarCheckinAtividade(event) {
    event.preventDefault(); 
    
    if (!currentUser) return;
    
    const atividadeMinutosInput = document.getElementById('atividade-minutos');
    const checkinAtividadeFeedback = document.getElementById('checkin-atividade-feedback');
    const formCheckinAtividade = document.getElementById('form-checkin-atividade');

    const minutos = parseInt(atividadeMinutosInput.value, 10);
    
    if (isNaN(minutos) || minutos <= 0) {
        if(checkinAtividadeFeedback) {
            checkinAtividadeFeedback.textContent = "Por favor, insira um número de minutos válido.";
            checkinAtividadeFeedback.className = "feedback-message error";
            checkinAtividadeFeedback.classList.remove('hidden');
        }
        return;
    }
    
    if(checkinAtividadeFeedback) checkinAtividadeFeedback.classList.add('hidden');
    
    const registroAtividade = {
        paciente_id: currentUser.uid,
        timestamp: serverTimestamp(),
        dataCompleta: new Date().toISOString(),
        atividade: {
            minutos: minutos
        },
        sono: null, humor: null, dor: null,
        medicacao: null, alimentacao: null, sinaisVitais: null
    };
    
    const registrosRef = collection(db, 'pacientes', currentUser.uid, 'registrosDiarios');
    await addDoc(registrosRef, registroAtividade);
    
    if(checkinAtividadeFeedback) {
        checkinAtividadeFeedback.textContent = "Atividade registrada com sucesso!";
        checkinAtividadeFeedback.className = "feedback-message success";
        checkinAtividadeFeedback.classList.remove('hidden');
    }
    
    await populateSummaryCards(currentUser.uid);
    await loadHistoricoRegistrosCompleto(true); 
    loadAndRenderHealthIndicators(); 
    
    setTimeout(() => {
        const checkinAtividadeModal = document.getElementById('checkin-atividade-modal');
        if(checkinAtividadeModal) closeModal(checkinAtividadeModal);
        if(formCheckinAtividade) formCheckinAtividade.reset();
    }, 1500);
}

/**
 * Adiciona um item (checkbox + label) à lista de confirmação de medicação.
 */
function addMedicationToChecklist(nomeMedicamento, tipo = 'prescrita') {
    const registroMedListaCheckboxes = document.getElementById('registro-med-lista-checkboxes');
    if (!registroMedListaCheckboxes) return;
    
    const placeholder = registroMedListaCheckboxes.querySelector('.placeholder-med-lista');
    if (placeholder) placeholder.remove();
    
    const label = document.createElement('label');
    label.className = 'meta-item'; 
    if (tipo === 'externa') {
        label.classList.add('item-med-externa');
    }
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.name = nomeMedicamento;
    checkbox.dataset.tipo = tipo;
    
    const span = document.createElement('span');
    span.innerHTML = `<strong>${nomeMedicamento}</strong>`;
    if (tipo === 'externa') {
        span.innerHTML += ` <em>(Adicionado manualmente)</em>`;
    }
    
    label.appendChild(checkbox);
    label.appendChild(span);
    
    if (tipo === 'externa') {
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn-delete-med-externa';
        deleteButton.innerHTML = '&times;';
        deleteButton.setAttribute('aria-label', `Remover ${nomeMedicamento}`);
        label.appendChild(deleteButton);
    }
    
    registroMedListaCheckboxes.appendChild(label);
}

/**
 * Busca as receitas ATIVAS do paciente no Firestore
 * e as renderiza como checkboxes na lista.
 */
async function loadAndRenderPrescribedMeds() {
    const registroMedListaCheckboxes = document.getElementById('registro-med-lista-checkboxes');
    if (!currentUser || !registroMedListaCheckboxes) return;
    
    registroMedListaCheckboxes.querySelectorAll('label[data-tipo="prescrita"]').forEach(el => el.remove());
    
    if (registroMedListaCheckboxes.children.length === 0) {
        registroMedListaCheckboxes.innerHTML = `<p class="placeholder-med-lista" style="font-size: 0.85rem; color: var(--texto-suave); text-align: center;">Carregando receitas...</p>`;
    }
    
    try {
        const receitasRef = collection(db, 'pacientes', currentUser.uid, 'receitas');
        const q = query(receitasRef, where("status", "==", "Ativa"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        const placeholder = registroMedListaCheckboxes.querySelector('.placeholder-med-lista');
        if (placeholder) placeholder.remove();
        
        let receitasEncontradas = 0;
        querySnapshot.forEach((doc) => {
            const receita = doc.data();
            
            if (receita.medicamentos && Array.isArray(receita.medicamentos)) {
                receita.medicamentos.forEach(med => {
                    let isAtiva = false;
                    if (med.duracao && med.duracao.toLowerCase() === 'uso contínuo') {
                        isAtiva = true;
                    } else if (med.duracao && receita.timestamp) {
                        const duracaoDias = parseInt(med.duracao.split(' ')[0], 10);
                        if (!isNaN(duracaoDias)) {
                            const dataInicio = receita.timestamp.toDate();
                            const dataFim = new Date(dataInicio);
                            dataFim.setDate(dataFim.getDate() + duracaoDias);
                            if (new Date() <= dataFim) {
                                isAtiva = true;
                            }
                        }
                    }
                    if (isAtiva) {
                        addMedicationToChecklist(med.nome, 'prescrita');
                        receitasEncontradas++;
                    }
                });
            }
            else if (receita.medicamento) {
                addMedicationToChecklist(receita.medicamento, 'prescrita');
                receitasEncontradas++;
            }
        });
        
        if (receitasEncontradas === 0 && registroMedListaCheckboxes.children.length === 0) {
            registroMedListaCheckboxes.innerHTML = `<p class="placeholder-med-lista" style="font-size: 0.85rem; color: var(--texto-suave); text-align: center;">Nenhuma receita ativa encontrada.</p>`;
        }
        
    } catch (error) {
        console.error("Erro ao carregar medicações prescritas:", error);
        registroMedListaCheckboxes.innerHTML = `<p class="placeholder-med-lista" style="font-size: 0.85rem; color: var(--cor-delete); text-align: center;">Erro ao carregar receitas.</p>`;
    }
}

/**
 * Adiciona um item de refeição externa (ex: "Pizza") à lista no modal.
 */
function addExternalMealToList(nomeRefeicao, detalhesRefeicao) {
    const registroRefeicoesExternasLista = document.getElementById('registro-refeicoes-externas-lista');
    if (!registroRefeicoesExternasLista) return;
    
    const card = document.createElement('div');
    card.className = 'meal-item-externo';
    card.dataset.name = nomeRefeicao;
    card.dataset.detalhes = detalhesRefeicao;
    card.innerHTML = `
        <p>
            <strong>${nomeRefeicao}</strong>
            ${detalhesRefeicao || 'Sem detalhes'}
        </p>
        <button type="button" class="btn-delete-refeicao-externa" aria-label="Remover ${nomeRefeicao}">
            &times;
        </button>
    `;
    registroRefeicoesExternasLista.appendChild(card);
}

/**
 * (MOCK DATA - Temporário)
 * Cria dados falsos de consulta para o modal.
 */
function getMockConsultas() {
    console.log("Usando dados MOCK para o Histórico de Consultas.");
    return [
        { id: 'c1', medico: 'Dr. Luiz Nascimento', especialidade: 'Clínico Geral', data: '2025-10-20', tipo: 'Online', status: 'Realizada' },
        { id: 'c2', medico: 'Dra. Ana Costa', especialidade: 'Cardiologista', data: '2025-10-10', tipo: 'Presencial', status: 'Realizada' },
        { id: 'c3', medico: 'Dr. Luiz Nascimento', especialidade: 'Clínico Geral', data: '2025-09-15', tipo: 'Online', status: 'Cancelada' }
    ];
}

/**
 * "Desenha" os cards de consulta no HTML (Modal Histórico).
 */
function renderModalHistoricoConsultas(consultas) {
    const consultasHistoricoLista = document.getElementById('consultas-historico-lista');
    if (!consultasHistoricoLista) return;
    
    consultasHistoricoLista.innerHTML = '';
    
    if (consultas.length === 0) {
        consultasHistoricoLista.innerHTML = `<div class="placeholder" style="padding: 20px 0;">Nenhum histórico de consulta encontrado.</div>`;
        return;
    }
    
    consultas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    consultas.forEach(consulta => {
        const dataFormatada = new Date(consulta.data + 'T00:00:00') 
            .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            
        let statusClass = 'status-agendada'; 
        if (consulta.status === 'Realizada') statusClass = 'status-realizada';
        if (consulta.status === 'Cancelada') statusClass = 'status-cancelada';
        
        const tipoIcon = consulta.tipo === 'Online' ? 'fa-video' : 'fa-hospital';
        
        const cardHTML = `
        <div class="consulta-historico-card" data-consulta-id="${consulta.id}">
            <div class="consulta-card-header">
                <h3>${consulta.medico}</h3>
                <span class="consulta-card-badge ${statusClass}">${consulta.status}</span>
            </div>
            <div class="consulta-card-body">
                <p><i class="fa-solid fa-stethoscope"></i> ${consulta.especialidade}</p>
                <p><i class="fa-solid fa-calendar-day"></i> ${dataFormatada}</p>
                <p><i class="fa-solid ${tipoIcon}"></i> ${consulta.tipo}</p>
            </div>
            <div class="consulta-card-footer">
                <button class="btn-link-detalhes" data-page="consultas">
                    Ver Detalhes
                </button>
            </div>
        </div>
        `;
        consultasHistoricoLista.insertAdjacentHTML('beforeend', cardHTML);
    });
}

/**
 * Função principal: Busca os dados (MOCK) e abre o modal.
 */
async function openConsultasHistoricoModal() {
    const consultasHistoricoModal = document.getElementById('consultas-historico-modal');
    const consultasHistoricoLista = document.getElementById('consultas-historico-lista');
    if (!consultasHistoricoModal || !currentUser) return;
    
    showLoading(true);
    try {
        const consultas = getMockConsultas(); 
        renderModalHistoricoConsultas(consultas);
        openModal(consultasHistoricoModal);
    } catch (error) {
        console.error("Erro ao abrir o histórico de consultas:", error);
        if(consultasHistoricoLista) {
            consultasHistoricoLista.innerHTML = `<div class="placeholder" style="padding: 20px 0; color: var(--cor-delete);">Erro ao carregar histórico.</div>`;
        }
    } finally {
        showLoading(false);
    }
}

/**
 * Atualiza o Header e o Título da Página com os dados do paciente.
 */
function updatePatientUI(patientData, patientId) {
    const patientNameHeaderEl = document.getElementById('patient-name-header');
    const patientPhotoHeader = document.getElementById('patient-photo-header');
    const patientNameDropdown = document.getElementById('patient-name-dropdown');
    const welcomePatientNameEl = document.getElementById('welcome-patient-name');
    const totalRegistrosSubtextEl = document.getElementById('total-registros-subtext');
    const totalConsultasSubtextEl = document.getElementById('total-consultas-subtext');

    if (!patientData) {
        console.warn("updatePatientUI chamada sem dados do paciente.");
        return;
    }

    const patientName = patientData.nome || "Paciente";
    const firstName = patientName.split(' ')[0];

    if (patientNameHeaderEl) patientNameHeaderEl.textContent = patientName;
    if (patientNameDropdown) patientNameDropdown.textContent = patientName;
    
    if (patientPhotoHeader) {
        if (patientData.foto_url) {
            patientPhotoHeader.src = patientData.foto_url;
        } else {
            const initial = firstName.charAt(0).toUpperCase() || 'P';
            patientPhotoHeader.src = `https://placehold.co/40x40/FFFFFF/3197bl?text=${initial}`;
        }
    }

    if (welcomePatientNameEl) {
        welcomePatientNameEl.textContent = firstName;
    }

    if (totalRegistrosSubtextEl || totalConsultasSubtextEl) {
        if (patientData.data_cadastro) {
            try {
                const dataCadastro = new Date(patientData.data_cadastro);
                const dataFormatada = dataCadastro.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                const subtexto = `Desde ${dataFormatada}`;
                if (totalRegistrosSubtextEl) totalRegistrosSubtextEl.textContent = subtexto;
                if (totalConsultasSubtextEl) totalConsultasSubtextEl.textContent = subtexto;
            } catch (error) {
                if (totalRegistrosSubtextEl) totalRegistrosSubtextEl.textContent = "Desde o seu cadastro";
                if (totalConsultasSubtextEl) totalConsultasSubtextEl.textContent = "Desde o seu cadastro";
            }
        } else {
            if (totalRegistrosSubtextEl) totalRegistrosSubtextEl.textContent = "Desde o seu cadastro";
            if (totalConsultasSubtextEl) totalConsultasSubtextEl.textContent = "Desde o seu cadastro";
            atualizarDataCadastroFaltante(patientId);
        }
    }
}

/**
 * (Helper) Adiciona data de cadastro se estiver faltando no Firestore.
 */
async function atualizarDataCadastroFaltante(patientId) {
    if (!patientId || !db) return;
    try {
        const patientDocRef = doc(db, 'pacientes', patientId);
        await setDoc(patientDocRef, {
            data_cadastro: new Date().toISOString()
        }, { merge: true });
        console.log("Campo 'data_cadastro' adicionado ao paciente.");
    } catch (error) {
        console.error("Erro ao tentar atualizar 'data_cadastro' faltante:", error);
    }
}

/**
 * Atualiza a UI do Status (Online/Offline)
 */
function updateStatusUI(online) {
    const statusIndicatorHeader = document.getElementById('patient-status-indicator');
    const statusIconDropdown = document.querySelector('#toggle-patient-status .status-icon-dropdown');
    const statusTextDropdown = document.querySelector('#toggle-patient-status span');

    isPatientOnline = online;
    if (statusIndicatorHeader) {
        statusIndicatorHeader.classList.toggle('status-online', online);
        statusIndicatorHeader.classList.toggle('status-offline', !online);
        statusIndicatorHeader.setAttribute('aria-label', online ? 'Status Online' : 'Status Offline');
    }
    if (statusIconDropdown) {
        statusIconDropdown.classList.toggle('status-online', online);
        statusIconDropdown.classList.toggle('status-offline', !online);
    }
    if (statusTextDropdown) {
        statusTextDropdown.textContent = `Status: ${online ? 'Online' : 'Offline'}`;
    }
}

/**
 * Salva o novo status no Firestore
 */
async function saveStatusToFirestore(onlineStatus) {
    if (!currentUser) return;
    const patientDocRef = doc(db, 'pacientes', currentUser.uid);
    try {
        await setDoc(patientDocRef, { status_online: onlineStatus }, { merge: true });
        console.log("Status online salvo:", onlineStatus);
    } catch (error) {
        console.error("Erro ao salvar o status:", error);
    }
}
 

/**
 * Troca a página visível (Dashboard, Meu Perfil, etc.)
 */
function switchProfilePage(pageId) {
    const sidebarLinks = document.querySelectorAll('.profile-sidebar nav li a');
    const profilePages = document.querySelectorAll('.profile-page');

    // --- NOVO: Redireciona para a página de Relatórios ---
    if (pageId === 'relatorios') {
        console.log("Navegando para relatorio-paciente.html...");
        window.location.href = 'relatorio-paciente.html';
        return; // Para a execução aqui
    }
    // ----------------------------------------------------

    // Redireciona para perfil de saúde (se necessário)
    if (pageId === 'meu-perfil') {
        console.log("Navegando para perfil-de-saude.html...");
        window.location.href = 'perfil-de-saude.html';
        return; 
    }
    
    // Lógica padrão para abas na mesma página (Dashboard, etc.)
    profilePages.forEach(page => {
        // Adicionei uma verificação de segurança (?) para não dar erro se a página não existir
        if(page) page.classList.toggle('hidden', page.id !== `page-${pageId}`);
    });
    
    sidebarLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageId);
    });
    
    if (pageId === 'consultas') {
        // Se tiveres uma função para abrir modal de consultas, chama-a aqui
        if (typeof openConsultasHistoricoModal === 'function') openConsultasHistoricoModal(); 
    }
}

/**
 * Função de Logout
 */
const handleLogout = (e) => {
    if(e) e.preventDefault();
    console.log("Tentando fazer logout...");
    signOut(auth).then(() => {
        console.log("Logout bem-sucedido.");
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao sair. Tente novamente.");
    });
};

/**
 * Carrega e renderiza os lembretes (atualmente com dados MOCK)
 */
function loadAndRenderReminders() {
    const lembretesListaContainer = document.getElementById('lembretes-lista-container');
    if (!lembretesListaContainer) return;

    const mockLembretes = [
        { icon: 'fa-solid fa-notes-medical icon-blue', titulo: 'Registro Diário', subtitulo: 'Registre como você se sente hoje', horario: 'Agora', horarioClass: 'today' },
        { icon: 'fa-solid fa-pills icon-green', titulo: 'Medicação', subtitulo: 'Tomar Losartana 50mg', horario: '16:00', horarioClass: '' },
        { icon: 'fa-solid fa-dumbbell icon-purple', titulo: 'Atividade Física', subtitulo: '30 minutos de caminhada', horario: '18:00', horarioClass: '' },
        { icon: 'fa-solid fa-prescription-bottle-medical icon-blue', titulo: 'Nova Receita', subtitulo: 'Receita de Dipirona (7 dias) disponível.', horario: 'Pendente', horarioClass: '' },
        { icon: 'fa-solid fa-flask-vial icon-red', titulo: 'Novo Pedido de Exame', subtitulo: 'Solicitação de Glicemia disponível.', horario: 'Pendente', horarioClass: '' }
    ];

    lembretesListaContainer.innerHTML = '';
    
    if (mockLembretes.length === 0) {
        lembretesListaContainer.innerHTML = '<p class="placeholder">Nenhum lembrete para hoje.</p>';
    } else {
        mockLembretes.forEach(lembrete => {
            const itemHTML = `
            <div class="reminder-item">
                <div class="reminder-info">
                    <i class="${lembrete.icon}"></i>
                    <div>
                        <strong>${lembrete.titulo}</strong>
                        <span>${lembrete.subtitulo}</span>
                    </div>
                </div>
                <span class="reminder-time ${lembrete.horarioClass}">${lembrete.horario}</span>
            </div>
            `;
            lembretesListaContainer.insertAdjacentHTML('beforeend', itemHTML);
        });
    }
}

/**
 * "Desenha" os cards de consulta no HTML.
 */
function renderUpcomingAppointments(docs, listEl) {
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    if (docs.empty || docs.length === 0) {
        listEl.innerHTML = '<p class="placeholder">Nenhuma consulta agendada.</p>';
        return;
    }
    
    docs.forEach(doc => {
        const consulta = doc.data();
        if (!consulta.data) return;
        
        const dataConsulta = consulta.data.toDate();
        const horaFormatada = dataConsulta.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const diaFormatado = dataConsulta.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        
        const hoje = new Date();
        let dataBadge = diaFormatado;
        let dataClass = '';
        
        if (dataConsulta.toDateString() === hoje.toDateString()) {
            dataBadge = "Hoje";
            dataClass = "today";
        }
        
        const cardHTML = `
        <div class="appointment-item-paciente">
            <div class="appointment-details">
                <strong>${horaFormatada} ${consulta.medico_nome || 'Médico não informado'}</strong>
                <span>${consulta.descricao || 'Consulta de rotina'}</span>
            </div>
            <span class="appointment-date ${dataClass}">${dataBadge}</span>
        </div>
        `;
        listEl.insertAdjacentHTML('beforeend', cardHTML);
    });
}


/**
 * Calcula e atualiza os 3 cards de resumo.
 * ESTA FUNÇÃO CONTINUA COM O CÓDIGO QUE GERA O ERRO DE PERMISSÃO
 */
async function populateSummaryCards(patientId) {
    const totalConsultasEl = document.getElementById('total-consultas-historico');
    const totalRegistrosEl = document.getElementById('total-registros');
    const diasSeguidosEl = document.getElementById('dias-seguidos');
    
    if (!totalConsultasEl || !totalRegistrosEl || !diasSeguidosEl) {
        console.warn("Elementos dos cards de resumo não encontrados.");
        return;
    }
    
    // --- 1. Buscar Total de Consultas (EM TEMPO REAL) ---
    try {
        console.log("Configurando listener em tempo real para Total de Consultas...");
        const consultasRef = collection(db, 'consultas');
        const qConsultas = query(consultasRef, where("paciente_id", "==", patientId));
        
        onSnapshot(qConsultas, (snapshot) => {
            const count = snapshot.size; 
            if (totalConsultasEl) {
                totalConsultasEl.textContent = count;
                console.log(`Contagem de Consultas (Tempo Real) atualizada: ${count}`);
            }
        }, (error) => {
             console.error("Erro no listener de Total de Consultas:", error);
             totalConsultasEl.textContent = "Erro";
        });
        
    } catch (error) {
        console.error("Erro ao configurar listener de Total de Consultas:", error);
        totalConsultasEl.textContent = "Erro";
    }

    // --- 2. Buscar Total de Registros Diários (O CÓDIGO QUE DÁ ERRO) ---
    try {
        console.log("Configurando listener para Total de Registros (com getCount)...");
        const qRegistros = query(collection(db, 'pacientes', patientId, 'registrosDiarios'));
        const snapshotRegistros = await getCountFromServer(qRegistros); 
        totalRegistrosEl.textContent = snapshotRegistros.data().count;
        console.log(`Total de Registros Diários encontrado: ${snapshotRegistros.data().count}`);
    } catch (error) {
        console.error("Erro ao contar Registros Totais:", error);
        totalRegistrosEl.textContent = "Erro";
    }
    
    // --- 3. Buscar Dias Seguidos (Cálculo único) ---
    try {
        const dias = await calcularDiasSeguidos(patientId);
        diasSeguidosEl.textContent = dias;
        console.log(`Dias Seguidos calculados: ${dias}`);
    } catch (error) {
        console.error("Erro ao calcular Dias Seguidos:", error);
        diasSeguidosEl.textContent = "Erro";
    }
}

/**
 * Calcula os dias seguidos de registro.
 */
async function calcularDiasSeguidos(patientId) {
    console.log("Calculando dias seguidos...");
    const registrosRef = collection(db, 'pacientes', patientId, 'registrosDiarios');
    
    let diasSeguidos = 0;
    let hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 
    
    const qHoje = query(registrosRef,
        where("timestamp", ">=", hoje),
        orderBy("timestamp", "desc"),
        limit(1)
    );
    const hojeSnap = await getDocs(qHoje);
    
    if (hojeSnap.empty) {
        const ontem = new Date(hoje);
        ontem.setDate(ontem.getDate() - 1);
        
        const qOntem = query(registrosRef,
            where("timestamp", ">=", ontem),
            where("timestamp", "<", hoje),
            orderBy("timestamp", "desc"),
            limit(1)
        );
        const ontemSnap = await getDocs(qOntem);
        
        if (ontemSnap.empty) {
            console.log("Nenhum registro ontem. Dias seguidos = 0");
            return 0;
        } else {
            diasSeguidos = 1;
            hoje = ontem; 
        }
    } else {
        diasSeguidos = 1;
    }
    
    const qSequencia = query(registrosRef,
        where("timestamp", "<", hoje),
        orderBy("timestamp", "desc")
    );
    
    const sequenciaSnap = await getDocs(qSequencia);
    if (sequenciaSnap.empty) {
        return diasSeguidos;
    }
    
    const datasUnicas = new Set();
    sequenciaSnap.docs.forEach(doc => {
        if (doc.data().timestamp) {
            const dataRegistro = doc.data().timestamp.toDate();
            datasUnicas.add(dataRegistro.toDateString());
        }
    });
    
    let diaAnterior = new Date(hoje);
    for (let i = 0; i < datasUnicas.size; i++) {
        diaAnterior.setDate(diaAnterior.getDate() - 1);
        if (datasUnicas.has(diaAnterior.toDateString())) {
            diasSeguidos++;
        } else {
            break; 
        }
    }
    console.log(`Cálculo final: ${diasSeguidos} dias seguidos.`);
    return diasSeguidos;
}

/**
 * Calcula as médias e atualiza o card "Seus Indicadores de Saúde".
 */
function loadAndRenderHealthIndicators() {
    const indicatorBarSono = document.getElementById('indicator-bar-sono');
    const indicatorValueSono = document.getElementById('indicator-value-sono');
    const indicatorBarHumor = document.getElementById('indicator-bar-humor');
    const indicatorValueHumor = document.getElementById('indicator-value-humor');
    const indicatorBarAtividade = document.getElementById('indicator-bar-atividade');
    const indicatorValueAtividade = document.getElementById('indicator-value-atividade');
    const indicadoresPlaceholder = document.getElementById('indicadores-placeholder');
    
    if (!indicatorBarSono || !indicatorValueSono || !indicatorBarHumor || !indicatorValueHumor || !indicatorBarAtividade || !indicatorValueAtividade || !indicadoresPlaceholder) {
        console.warn("Elementos dos indicadores de saúde não encontrados.");
        return;
    }
    
    if (allPatientRecords.length === 0) {
        indicadoresPlaceholder.textContent = "Nenhum registro encontrado para calcular.";
        return;
    }
    
    indicadoresPlaceholder.classList.add('hidden'); 
    
    // --- 1. Cálculo do SONO ---
    const registrosSono = allPatientRecords.filter(reg => reg.sono && reg.sono.horas);
    let mediaHorasSono = 0;
    if (registrosSono.length > 0) {
        const totalHoras = registrosSono.reduce((sum, reg) => sum + parseFloat(reg.sono.horas), 0);
        mediaHorasSono = totalHoras / registrosSono.length;
    }
    
    const percSono = (mediaHorasSono / 8) * 100;
    indicatorBarSono.style.width = `${Math.min(percSono, 100)}%`;
    indicatorValueSono.textContent = `${mediaHorasSono.toFixed(1)}h`; 
    
    // --- 2. Cálculo do HUMOR ---
    const registrosHumor = allPatientRecords.filter(reg => reg.humor && reg.humor.slider);
    let mediaHumor = 0;
    if (registrosHumor.length > 0) {
        const totalHumor = registrosHumor.reduce((sum, reg) => sum + reg.humor.slider, 0);
        mediaHumor = totalHumor / registrosHumor.length;
    }
    
    const percHumor = (mediaHumor / 5) * 100;
    indicatorBarHumor.style.width = `${percHumor}%`;
    indicatorValueHumor.textContent = `${mediaHumor.toFixed(1)}/5`;
    
    // --- 3. Cálculo da ATIVIDADE ---
    const registrosAtividade = allPatientRecords.filter(reg => reg.atividade && reg.atividade.minutos);
    let mediaMinutos = 0;
    if (registrosAtividade.length > 0) {
        const totalMinutos = registrosAtividade.reduce((sum, reg) => sum + reg.atividade.minutos, 0);
        mediaMinutos = totalMinutos / registrosAtividade.length;
    }
    
    const percAtividade = (mediaMinutos / 30) * 100; // Meta de 30 min
    indicatorBarAtividade.style.width = `${Math.min(percAtividade, 100)}%`;
    indicatorValueAtividade.textContent = `${mediaMinutos.toFixed(0)} min`;
}
// ==========================================================
// FUNÇÃO: CARREGAR PRÓXIMAS CONSULTAS NO DASHBOARD
// ==========================================================

/**
 * CARREGA AS PRÓXIMAS CONSULTAS (Versão Lista - Mostra Várias)
 */
function loadUpcomingAppointments() {
    const container = document.getElementById('proxima-consulta-card');
    if (!container || !currentUser) return;

    // Define Hoje (00:00)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Query Simples
    const q = query(
        collection(db, 'agendamentos'),
        where('paciente_id', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const listaConsultas = [];

        // 1. Coleta e Filtra
        snapshot.forEach(doc => {
            const data = doc.data();
            const status = (data.status || '').toLowerCase();

            // Ignora cancelados/realizados
            if (status === 'cancelado' || status === 'cancelada' || status === 'realizada' || status === 'concluída') {
                return; 
            }

            let dataObj = null;
            if (data.data_hora) dataObj = new Date(data.data_hora);
            else if (data.data && data.data.toDate) dataObj = data.data.toDate();

            // Filtra Futuro
            if (dataObj && dataObj >= hoje) {
                listaConsultas.push({ id: doc.id, ...data, dataObj: dataObj });
            }
        });

        // 2. Ordena por data
        listaConsultas.sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime());

        // --- RENDERIZAÇÃO ---
        container.innerHTML = ''; 

        if (listaConsultas.length === 0) {
            container.innerHTML = `
                <div class="empty-state-mini" style="text-align: center; padding: 30px 20px; color: #888;">
                    <i class="fa-regular fa-calendar-check" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p style="font-size: 1rem; font-weight: 500;">Você não tem consultas agendadas.</p>
                    <button id="btn-agendar-card-dash" class="btn-card-action" style="margin-top: 10px; background: #41b8d5; color: white; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 0.9rem;">
                        Agendar Agora
                    </button>
                </div>`;
            const btn = container.querySelector('#btn-agendar-card-dash');
            if(btn) btn.addEventListener('click', () => window.location.href = 'home.html');
            return;
        }

        // 3. Desenha a Lista (Mostra as próximas 3)
        // Se quiser mostrar todas, remova o .slice(0, 3)
        const consultasParaMostrar = listaConsultas.slice(0, 3); 

        // Cria um wrapper para a lista ficar bonita
        const listaWrapper = document.createElement('div');
        listaWrapper.style.display = 'flex';
        listaWrapper.style.flexDirection = 'column';
        listaWrapper.style.gap = '15px'; // Espaço entre os cards

        for (const consulta of consultasParaMostrar) {
            // Busca nome do médico
            let nomeMedico = consulta.medico_nome || consulta.profissional_nome || "Profissional de Saúde";
            if (!consulta.medico_nome && consulta.profissional_id) {
                try {
                    const pDoc = await getDoc(doc(db, 'profissionais', consulta.profissional_id));
                    if (pDoc.exists()) nomeMedico = pDoc.data().nome;
                } catch(e) {}
            }

            const dia = consulta.dataObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
            const hora = consulta.dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const tipo = consulta.tipo || "Presencial";
            
            // HTML do Card Individual
            const cardHTML = `
                <div class="next-appointment-highlight" style="display: flex; align-items: center; gap: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px;">
                    <div class="calendar-icon-box" style="background: #e6f7ff; color: #41b8d5; padding: 10px; border-radius: 10px; text-align: center; min-width: 60px;">
                        <span style="display: block; font-size: 1.1rem; font-weight: 700;">${consulta.dataObj.getDate()}</span>
                        <span style="display: block; font-size: 0.7rem; text-transform: uppercase;">${consulta.dataObj.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                    </div>
                    
                    <div class="appointment-info" style="flex-grow: 1;">
                        <h3 style="margin: 0; color: #2d3748; font-size: 1rem;">${nomeMedico}</h3>
                        <p style="margin: 2px 0; color: #718096; font-size: 0.85rem;">
                            ${dia} às <strong style="color: #333;">${hora}</strong>
                        </p>
                        <span class="badge status-agendada" style="font-size: 0.7rem; padding: 2px 8px; background: #e6fffa; color: #046c4e; border-radius: 10px;">
                            ${tipo}
                        </span>
                    </div>

                    <button class="btn-card-action" onclick="window.location.href='consultas-paciente.html'" style="background: white; border: 1px solid #e2e8f0; color: #4a5568; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                        <i class="fa-solid fa-chevron-right" style="font-size: 0.8rem;"></i>
                    </button>
                </div>
            `;
            listaWrapper.insertAdjacentHTML('beforeend', cardHTML);
        }

        container.appendChild(listaWrapper);

    }, (error) => {
        console.error("Erro listener:", error);
    });
}
// Função auxiliar para desenhar o HTML do card
function renderDashboardAppointments(consultas, container) {
    container.innerHTML = '';

    if (consultas.length === 0) {
        container.innerHTML = '<p class="placeholder">Nenhuma consulta agendada.</p>';
        return;
    }

    const hoje = new Date();
    hoje.setHours(0,0,0,0);

    consultas.forEach(consulta => {
        // Formatação da data e hora
        const dataFormatada = consulta.dataJS.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
        const horaFormatada = consulta.dataJS.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Verifica se é "Hoje" para destacar
        const isHoje = consulta.dataJS.toDateString() === hoje.toDateString();
        const dataBadge = isHoje ? "Hoje" : dataFormatada;
        const dataClass = isHoje ? "today" : "";

        // Cria o HTML
        const itemHTML = `
            <div class="appointment-item-paciente" onclick="window.location.href='consultas-paciente.html'" style="cursor: pointer;">
                <div class="appointment-details">
                    <strong>${horaFormatada} - ${consulta.medicoNome}</strong>
                    <span>${consulta.tipo.charAt(0).toUpperCase() + consulta.tipo.slice(1)}</span>
                </div>
                <span class="appointment-date ${dataClass}">${dataBadge}</span>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', itemHTML);
    });
}
/**
 * Função principal que arranca a página
 */
async function initializePage(patientId) {
    const pageWrapper = document.getElementById('page-wrapper'); 
    try {
        const patientData = await loadPatientData(patientId);
        if (!patientData) {
            throw new Error("Não foi possível carregar dados do paciente.");
        }
        currentPatientData = patientData;

        updatePatientUI(patientData, patientId);
        
        
        loadAndRenderReminders();
        loadUpcomingAppointments(currentUser.uid);
        
        await loadHistoricoRegistrosCompleto();
        
        // SÓ DEPOIS de carregar o histórico, popula os cards
        await populateSummaryCards(patientId);
        loadAndRenderHealthIndicators(); 

        //setupPatientNotifications();

    } catch (error) {
        console.error("Erro ao inicializar a página:", error);
    } finally {
        showLoading(false);
        if (pageWrapper) {
            pageWrapper.classList.remove('hidden');
        }
    }
}


// ==========================================================
// --- 6. PONTO DE ENTRADA (Início da Aplicação) ---
// (Onde tudo começa)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    
    console.log("DOM Carregado. Iniciando script paciente-perfil.js");

    // ==========================================================
    // --- 7. SELETORES DE ELEMENTOS DO DOM (MOVIDOS PARA CÁ) ---
    // ==========================================================
    
    const loadingOverlay = document.getElementById('loading-overlay-profile'); 
    const pageWrapper = document.getElementById('page-wrapper');
    
    // Header
    const patientNameHeaderEl = document.getElementById('patient-name-header');
    const patientPhotoHeader = document.getElementById('patient-photo-header');
    const statusIndicatorHeader = document.getElementById('patient-status-indicator');
    const welcomePatientNameEl = document.getElementById('welcome-patient-name');
    
    // Dropdown Menu
    const statusIconDropdown = document.querySelector('#toggle-patient-status .status-icon-dropdown');
    const statusTextDropdown = document.querySelector('#toggle-patient-status span');
    const patientNameDropdown = document.getElementById('patient-name-dropdown');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileDropdownMenu = document.getElementById('profile-dropdown-menu');
    // Mobile Menu
    const hamburgerMenu = document.getElementById('patient-hamburger-menu');
    const sidebarMenu = document.getElementById('patient-sidebar-menu');
    const backdrop = document.getElementById('backdrop');
    // Sidebar
    const sidebarLinks = document.querySelectorAll('.profile-sidebar nav li a');
    const profilePages = document.querySelectorAll('.profile-page');
    // Botões de Ação do Dropdown
    const togglePatientStatusButton = document.getElementById('toggle-patient-status');
    const logoutButtonDropdown = document.getElementById('logout-button-dropdown');
    const logoutButtonSidebar = document.getElementById('logout-button-sidebar'); 
    const btnAbrirCheckin = document.getElementById('btn-abrir-checkin');

    // Cards de Resumo
    const totalRegistrosEl = document.getElementById('total-registros');
    const diasSeguidosEl = document.getElementById('dias-seguidos');
    const totalConsultasEl = document.getElementById('total-consultas-historico'); 
    
    // Lista de Próximas Consultas
    const upcomingAppointmentsListEl = document.getElementById('upcoming-appointments-list');
    
    // Indicadores de Saúde (Barras)
    const indicatorBarSono = document.getElementById('indicator-bar-sono');
    const indicatorValueSono = document.getElementById('indicator-value-sono');
    const indicatorBarHumor = document.getElementById('indicator-bar-humor');
    const indicatorValueHumor = document.getElementById('indicator-value-humor');
    const indicatorBarAtividade = document.getElementById('indicator-bar-atividade');
    const indicatorValueAtividade = document.getElementById('indicator-value-atividade');
    const indicadoresPlaceholder = document.getElementById('indicadores-placeholder');

    // --- Seletores do Modal "Master Check-in" ---
    const masterCheckinModal = document.getElementById('master-checkin-modal');
    const closeMasterCheckinModalBtn = document.getElementById('close-master-checkin-modal');
    const fecharMasterCheckinModalBtn = document.getElementById('fechar-master-checkin-modal-btn');
    const checkinBtnRegistro = document.getElementById('checkin-btn-registro');
    const checkinBtnMedicacao = document.getElementById('checkin-btn-medicacao');
    const checkinBtnAtividade = document.getElementById('checkin-btn-atividade');
    const checkinBtnReceita = document.getElementById('checkin-btn-receita');
    const checkinBtnExame = document.getElementById('checkin-btn-exame');
    const checkinBtnAcompanhamento = document.getElementById('checkin-btn-acompanhamento');

    // --- Seletores do Modal de Registro Diário ---
    const btnAbrirRegistroDiario = document.getElementById('btn-novo-registro-diario'); // Botão na página Dashboard
    const novoRegistroModal = document.getElementById('novo-registro-diario-modal');
    const closeNovoRegistroModalBtn = document.getElementById('close-novo-registro-modal');
    const cancelNovoRegistroBtn = document.getElementById('cancel-novo-registro-btn');
    // ESTA É A LINHA MAIS IMPORTANTE
    const formNovoRegistroDiario = document.getElementById('form-novo-registro-diario');
    const salvarNovoRegistroBtn = document.getElementById('salvar-novo-registro-btn'); // O botão em si
    const feedbackEl = document.getElementById('novo-registro-feedback');
    // Inputs do formulário
    const checkDor = document.getElementById('registro-dor-checkbox');
    const detalhesDor = document.getElementById('registro-dor-detalhes');
    const checkMedTomou = document.getElementById('registro-med-tomou');
    const listaMedCheckbox = document.getElementById('registro-med-lista');
    const checkMedEfeitos = document.getElementById('registro-med-efeitos');
    const detalhesMedEfeitos = document.getElementById('registro-med-efeitos-detalhes');
    const registroMedListaCheckboxes = document.getElementById('registro-med-lista-checkboxes');
    const registroRefeicoesExternasLista = document.getElementById('registro-refeicoes-externas-lista');

    // Modal Medicação Externa
    const btnAbrirModalMedExterna = document.getElementById('btn-abrir-modal-med-externa');
    const addMedExternaModal = document.getElementById('add-med-externa-modal');
    const closeAddMedExternaModalBtn = document.getElementById('close-add-med-externa-modal');
    const cancelAddMedExternaBtn = document.getElementById('cancel-add-med-externa-btn');
    const formAddMedExterna = document.getElementById('form-add-med-externa');
    const medExternaNomeInput = document.getElementById('med-externa-nome');
    const salvarAddMedExternaBtn = document.getElementById('salvar-add-med-externa-btn');
    
    // Modal Refeição Externa
    const btnAbrirModalRefeicaoExterna = document.getElementById('btn-abrir-modal-refeicao-externa');
    const addRefeicaoExternaModal = document.getElementById('add-refeicao-externa-modal');
    const closeAddRefeicaoExternaModalBtn = document.getElementById('close-add-refeicao-externa-modal');
    const cancelAddRefeicaoBtn = document.getElementById('cancel-add-refeicao-btn');
    const formAddRefeicaoExterna = document.getElementById('form-add-refeicao-externa');
    const refeicaoExternaNomeInput = document.getElementById('refeicao-externa-nome');
    const refeicaoExternaDetalhesInput = document.getElementById('refeicao-externa-detalhes');
    const salvarAddRefeicaoBtn = document.getElementById('salvar-add-refeicao-btn');

    // --- Seletores do Modal Histórico (Registros) ---
    const btnAbrirHistoricoModal = document.getElementById('btn-abrir-historico-modal');
    const historicoRegistrosModal = document.getElementById('historico-registros-modal');
    const closeHistoricoModalBtn = document.getElementById('close-historico-modal');
    const fecharHistoricoModalBtn = document.getElementById('fechar-historico-modal-btn');
    const historicoPeriodoFiltros = document.getElementById('historico-periodo-filtros');
    const historicoSubTabNav = document.getElementById('historico-sub-tab-nav');

    // --- Seletores do Modal Histórico (Consultas) ---
    const btnAbrirConsultasHistoricoModal = document.getElementById('btn-abrir-consultas-historico-modal');
    const consultasHistoricoModal = document.getElementById('consultas-historico-modal');
    const closeConsultasHistoricoModalBtn = document.getElementById('close-consultas-historico-modal');
    const fecharConsultasHistoricoModalBtn = document.getElementById('fechar-consultas-historico-modal-btn');
    const consultasHistoricoLista = document.getElementById('consultas-historico-lista');
    const btnVerTodasConsultas = document.getElementById('btn-ver-todas-consultas');

    // --- Seletores do Modal Calendário de Progresso ---
    const btnAbrirProgressoModal = document.getElementById('btn-abrir-progresso-modal');
    const progressoModal = document.getElementById('progresso-modal');
    const closeProgressoModalBtn = document.getElementById('close-progresso-modal');
    const fecharProgressoModalBtn = document.getElementById('fechar-progresso-modal-btn');
    const calendarioProgressoEl = document.getElementById('calendario-progresso');

    // --- Seletores do Modal Check-in Atividade Física ---
    const checkinAtividadeModal = document.getElementById('checkin-atividade-modal');
    const closeCheckinAtividadeModalBtn = document.getElementById('close-checkin-atividade-modal');
    const cancelCheckinAtividadeBtn = document.getElementById('cancel-checkin-atividade-btn');
    const formCheckinAtividade = document.getElementById('form-checkin-atividade');
    const atividadeMinutosInput = document.getElementById('atividade-minutos');
    const checkinAtividadeFeedback = document.getElementById('checkin-atividade-feedback');

    // --- Seletores do Card de Lembretes ---
    const lembretesListaContainer = document.getElementById('lembretes-lista-container');
    
    // --- Seletor Botão Ver Relatório (Indicadores) ---
    const btnVerRelatorioCompleto = document.getElementById('btn-ver-relatorio-completo');
    
    
    // ==========================================================
    // --- 8. EVENT LISTENERS ---
    // (Todo o código que reage a cliques e mudanças)
    // ==========================================================

    // --- Listeners de Navegação Principal (Header e Sidebar) ---
    if (profileMenuButton) {
        profileMenuButton.addEventListener('click', () => {
            const isExpanded = profileMenuButton.getAttribute('aria-expanded') === 'true';
            profileMenuButton.setAttribute('aria-expanded', !isExpanded);
            profileDropdownMenu.classList.toggle('hidden');
        });
    }

    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (sidebarMenu.classList.contains('open')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }
    if (backdrop) {
        backdrop.addEventListener('click', closeMobileMenu);
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const pageId = link.dataset.page;
            if (pageId && link.id !== 'logout-button-sidebar') { 
                e.preventDefault();
                switchProfilePage(pageId);
                closeMobileMenu(); 
            }
        });
    });

    // --- Listeners do Dropdown Menu ---
    if (togglePatientStatusButton) {
        togglePatientStatusButton.addEventListener('click', () => {
            const newStatus = !isPatientOnline;
            updateStatusUI(newStatus);
            saveStatusToFirestore(newStatus);
        });
    }

    if (logoutButtonDropdown) {
        logoutButtonDropdown.addEventListener('click', handleLogout);
    }
    if (logoutButtonSidebar) { 
        logoutButtonSidebar.addEventListener('click', handleLogout);
    }

    // --- Listeners dos Modais "Master Check-in" e "Registro Diário" ---
    
    // Botão "+ Novo Registro Diário" (do Dashboard)
    if (btnAbrirRegistroDiario) {
        btnAbrirRegistroDiario.addEventListener('click', () => {
            if (novoRegistroModal) {
                console.log("Abrindo modal de registro diário a partir do DASHBOARD...");
                formNovoRegistroDiario?.reset();
                feedbackEl?.classList.add('hidden');
                detalhesDor?.classList.add('hidden');
                listaMedCheckbox?.classList.add('hidden');
                detalhesMedEfeitos?.classList.add('hidden');
                document.querySelectorAll('.meal-details').forEach(el => el.classList.add('hidden'));
                if(registroMedListaCheckboxes) registroMedListaCheckboxes.innerHTML = '';
                if(registroRefeicoesExternasLista) registroRefeicoesExternasLista.innerHTML = '';
                loadAndRenderPrescribedMeds();
                openModal(novoRegistroModal);
            } else {
                console.error("Modal 'novo-registro-diario-modal' não encontrado!");
            }
        });
    }

    // Botão "Fazer Check-in Agora" (Abre o Master Modal)
    if (btnAbrirCheckin) {
        btnAbrirCheckin.addEventListener('click', () => {
            console.log("Botão 'Fazer Check-in Agora' clicado. Abrindo 'Master Check-in'...");
            if (masterCheckinModal) {
                openModal(masterCheckinModal);
            }
        });
    }
    
    // Botões DENTRO do "Master Check-in"
    if (checkinBtnRegistro) {
        checkinBtnRegistro.addEventListener('click', () => {
            const modalRegistro = document.getElementById('novo-registro-diario-modal');
            if (modalRegistro) {
                formNovoRegistroDiario?.reset();
                feedbackEl?.classList.add('hidden');
                detalhesDor?.classList.add('hidden');
                listaMedCheckbox?.classList.add('hidden');
                detalhesMedEfeitos?.classList.add('hidden');
                document.querySelectorAll('.meal-details').forEach(el => el.classList.add('hidden'));
                if(registroMedListaCheckboxes) registroMedListaCheckboxes.innerHTML = '';
                if(registroRefeicoesExternasLista) registroRefeicoesExternasLista.innerHTML = '';
                loadAndRenderPrescribedMeds();
                openModal(modalRegistro);
            } else {
                console.error("Modal 'novo-registro-diario-modal' não encontrado!");
            }
        });
    }

    // --- AÇÃO: CHECK-IN DE MEDICAÇÃO (COM TRUQUE UX) ---
    const modalCheckinReal = document.getElementById('novo-registro-diario-modal'); 

    if (checkinBtnMedicacao) {
        checkinBtnMedicacao.addEventListener('click', (e) => {
            e.preventDefault(); 
            console.log("Botão Check-in Medicação clicado.");

            if (modalCheckinReal) {
                // 1. Abre o Modal
                openModal(modalCheckinReal);

                // 2. O TRUQUE DE UX (Scroll + Destaque)
                setTimeout(() => {
                    // Estratégia Inteligente: Procura o título h3 que diz "Medicação"
                    const titulos = modalCheckinReal.querySelectorAll('h3');
                    let secaoAlvo = null;

                    titulos.forEach(h3 => {
                        if (h3.textContent.includes('Medicação') || h3.textContent.includes('Medicamentos')) {
                            // Pega o pai desse título (a div da secção)
                            secaoAlvo = h3.closest('.registro-secao') || h3.parentElement;
                        }
                    });

                    // Fallback: Se não achar pelo nome, tenta pegar a 3ª secção da lista
                    if (!secaoAlvo) {
                        const secoes = modalCheckinReal.querySelectorAll('.registro-secao');
                        if (secoes.length > 2) secaoAlvo = secoes[2]; // Índice 2 é a 3ª
                    }

                    // Executa a Animação
                    if (secaoAlvo) {
                        console.log("Secção de medicação encontrada. Rolando...");
                        
                        // Rola suavemente até ficar no meio da tela
                        secaoAlvo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Flash Azul (Destaque Visual)
                        secaoAlvo.style.transition = "background-color 0.5s ease";
                        secaoAlvo.style.backgroundColor = "#e6f7ff"; // Azul clarinho Orion
                        secaoAlvo.style.borderRadius = "8px";
                        secaoAlvo.style.padding = "10px"; // Garante que a cor fica bonita
                        
                        // Remove a cor depois de 1.5 segundos
                        setTimeout(() => {
                            secaoAlvo.style.backgroundColor = ""; 
                        }, 1500);
                    }
                }, 300); // Espera o modal abrir (300ms)
            } else {
                console.error("Modal não encontrado.");
            }
        });
    }

    if (checkinBtnAtividade) {
        checkinBtnAtividade.addEventListener('click', () => {
            formCheckinAtividade?.reset();
            checkinAtividadeFeedback?.classList.add('hidden');
            if (checkinAtividadeModal) openModal(checkinAtividadeModal);
            if (atividadeMinutosInput) atividadeMinutosInput.focus();
        });
    }
    
   // --- AÇÃO: BOTÃO DE RECEITAS (Redireciona para a aba correta) ---
    // Seletor do botão (verifique se a variável checkinBtnReceita já está definida no topo)
    // const checkinBtnReceita = document.getElementById('checkin-btn-receita'); 

    if (checkinBtnReceita) {
        checkinBtnReceita.addEventListener('click', (e) => {
            e.preventDefault(); 
            console.log("Navegando para a aba Receitas...");
            
            // Redireciona para o ficheiro perfil-de-saude.html com um parâmetro na URL
            // O parâmetro '?aba=receitas' serve para avisar a outra página qual aba abrir
            window.location.href = 'perfil-de-saude.html?aba=receitas';
        });
    }
    
   // --- AÇÃO: BOTÃO DE EXAMES (Redireciona para a aba correta) ---
    // Seletor do botão (verifique se a variável checkinBtnExame já está definida no topo)
    // const checkinBtnExame = document.getElementById('checkin-btn-exame');

    if (checkinBtnExame) {
        checkinBtnExame.addEventListener('click', (e) => {
            e.preventDefault(); 
            console.log("Navegando para a aba Exames...");
            
            // Redireciona para a página de saúde, avisando que queremos ver a aba 'exames'
            window.location.href = 'perfil-de-saude.html?aba=exames';
        });
    }
    
    // --- AÇÃO: BOTÃO DE ACOMPANHAMENTO (Redireciona para a aba correta) ---
    // Seletor do botão (confirme se a variável checkinBtnAcompanhamento já está definida)
    // const checkinBtnAcompanhamento = document.getElementById('checkin-btn-acompanhamento');

    if (checkinBtnAcompanhamento) {
        checkinBtnAcompanhamento.addEventListener('click', (e) => {
            e.preventDefault(); 
            console.log("Navegando para a aba Acompanhamentos...");
            
            // Redireciona para a página de saúde, abrindo a aba 'acompanhamentos'
            window.location.href = 'perfil-de-saude.html?aba=acompanhamentos';
        });
    }

    // Botões de Fechar o "Master Check-in"
    if (closeMasterCheckinModalBtn) {
        closeMasterCheckinModalBtn.addEventListener('click', () => closeModal(masterCheckinModal));
    }
    if (fecharMasterCheckinModalBtn) {
        fecharMasterCheckinModalBtn.addEventListener('click', () => closeModal(masterCheckinModal));
    }
    if (masterCheckinModal) {
        masterCheckinModal.addEventListener('click', (e) => {
            if (e.target === masterCheckinModal) closeModal(masterCheckinModal);
        });
    }
    
    // --- Listeners do Modal de Check-in de Atividade Física ---
    if (formCheckinAtividade) {
        formCheckinAtividade.addEventListener('submit', handleSalvarCheckinAtividade);
    }
    if (closeCheckinAtividadeModalBtn) {
        closeCheckinAtividadeModalBtn.addEventListener('click', () => {
            if (checkinAtividadeModal) closeModal(checkinAtividadeModal);
        });
    }
    if (cancelCheckinAtividadeBtn) {
        cancelCheckinAtividadeBtn.addEventListener('click', () => {
            if (checkinAtividadeModal) closeModal(checkinAtividadeModal);
        });
    }
    if (checkinAtividadeModal) {
        checkinAtividadeModal.addEventListener('click', (e) => {
            if (e.target === checkinAtividadeModal) { 
                closeModal(checkinAtividadeModal);
            }
        });
    }

    // --- Listeners do Modal de Registro Diário (Formulário Longo) ---


    // --- BOTÃO AGENDAR CONSULTA (No Card de Atalhos) ---
    const btnAgendarConsulta = document.getElementById('btn-agendar-consulta'); // Verifica se o ID é este no HTML
    if (btnAgendarConsulta) {
        btnAgendarConsulta.addEventListener('click', () => {
            // Redireciona para a Home para iniciar o fluxo
            window.location.href = 'home.html';
        });
    }
    
    // ==========================================================
    // --- A CORREÇÃO CIRÚRGICA ESTÁ AQUI ---
    // ==========================================================
    
    // Em vez de "ouvir" o 'submit' do formulário,
    // vamos "ouvir" o 'click' do BOTÃO "Salvar".
    if (salvarNovoRegistroBtn) {
        console.log("Adicionando listener de 'click' ao salvarNovoRegistroBtn");
        salvarNovoRegistroBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Impede o 'submit' padrão
            console.log("Botão SALVAR REGISTRO clicado.");
            handleSalvarRegistroDiario(); // Chama a sua função de salvar
        });
    } else {
        console.error("DETETIVE: 'salvarNovoRegistroBtn' é nulo. O botão Salvar VAI FALHAR.");
    }
    
    // O listener antigo do formulário (que falhava) é removido/ignorado.
    // if (formNovoRegistroDiario) {
    //     console.log("Adicionando listener de 'submit' ao formNovoRegistroDiario");
    //     formNovoRegistroDiario.addEventListener('submit', (e) => {
    //         e.preventDefault(); 
    //         console.log("Formulário Novo Registro Diário submetido.");
    //         handleSalvarRegistroDiario(); 
    //     });
    // } else {
    //     console.error("DETETIVE: 'formNovoRegistroDiario' é nulo.");
    // }
    
    // ==========================================================
    // --- FIM DA CORREÇÃO ---
    // ==========================================================
    
    // Botões de fechar (O seu código original)
    if (closeNovoRegistroModalBtn) {
        closeNovoRegistroModalBtn.addEventListener('click', () => closeModal(novoRegistroModal));
    }
    if (cancelNovoRegistroBtn) {
        cancelNovoRegistroBtn.addEventListener('click', () => closeModal(novoRegistroModal));
    }
    if (novoRegistroModal) {
        novoRegistroModal.addEventListener('click', (e) => {
            if (e.target === novoRegistroModal) closeModal(novoRegistroModal);
        });
    }
    // Interatividade interna do formulário (O seu código original)
    if (checkDor && detalhesDor) {
        checkDor.addEventListener('change', () => {
            detalhesDor.classList.toggle('hidden', !checkDor.checked);
        });
    }
    if (checkMedTomou && listaMedCheckbox) {
        checkMedTomou.addEventListener('change', () => {
            listaMedCheckbox.classList.toggle('hidden', !checkMedTomou.checked);
        });
    }
    if (checkMedEfeitos && detalhesMedEfeitos) {
        checkMedEfeitos.addEventListener('change', () => {
            detalhesMedEfeitos.classList.toggle('hidden', !checkMedEfeitos.checked);
        });
    }
    document.querySelectorAll('.meal-check-group .meta-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const targetId = checkbox.dataset.target;
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.classList.toggle('hidden', !checkbox.checked);
            }
        });
    });

    // --- Listeners do Mini-Modal de Medicação Externa ---
    if (btnAbrirModalMedExterna) {
        btnAbrirModalMedExterna.addEventListener('click', () => {
            console.log("Abrindo mini-modal para medicação externa...");
            formAddMedExterna?.reset();
            if (addMedExternaModal) openModal(addMedExternaModal);
            if (medExternaNomeInput) medExternaNomeInput.focus();
        });
    }
    if (salvarAddMedExternaBtn) {
        salvarAddMedExternaBtn.addEventListener('click', () => {
            const nome = medExternaNomeInput.value;
            if (nome && nome.trim() !== "") {
                addMedicationToChecklist(nome, 'externa');
                if (addMedExternaModal) closeModal(addMedExternaModal);
            }
        });
    }
    if (registroMedListaCheckboxes) {
        registroMedListaCheckboxes.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-med-externa');
            if (deleteBtn) {
                const itemParaRemover = deleteBtn.closest('.meta-item.item-med-externa');
                if (itemParaRemover) {
                    itemParaRemover.remove();
                    console.log("Medicação externa removida da lista.");
                }
            }
        });
    }
    if (closeAddMedExternaModalBtn) {
        closeAddMedExternaModalBtn.addEventListener('click', () => closeModal(addMedExternaModal));
    }
    if (cancelAddMedExternaBtn) {
        cancelAddMedExternaBtn.addEventListener('click', () => closeModal(addMedExternaModal));
    }
    if (addMedExternaModal) {
        addMedExternaModal.addEventListener('click', (e) => {
            if (e.target === addMedExternaModal) closeModal(addMedExternaModal);
        });
    }

    // --- Listeners do Mini-Modal de Refeição Externa ---
    if (btnAbrirModalRefeicaoExterna) {
        btnAbrirModalRefeicaoExterna.addEventListener('click', () => {
            formAddRefeicaoExterna?.reset();
            if (addRefeicaoExternaModal) openModal(addRefeicaoExternaModal);
            if (refeicaoExternaNomeInput) refeicaoExternaNomeInput.focus();
        });
    }
    if (formAddRefeicaoExterna) {
        formAddRefeicaoExterna.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const nome = refeicaoExternaNomeInput.value;
            const detalhes = refeicaoExternaDetalhesInput.value;
            if (nome && nome.trim() !== "") {
                addExternalMealToList(nome, detalhes);
                if (addRefeicaoExternaModal) closeModal(addRefeicaoExternaModal);
            }
        });
    }
    if(salvarAddRefeicaoBtn) {
        salvarAddRefeicaoBtn.addEventListener('click', () => {
            const nome = refeicaoExternaNomeInput.value;
            const detalhes = refeicaoExternaDetalhesInput.value;
            if (nome && nome.trim() !== "") {
                addExternalMealToList(nome, detalhes);
                if (addRefeicaoExternaModal) closeModal(addRefeicaoExternaModal);
            }
        });
    }
    if (registroRefeicoesExternasLista) {
        registroRefeicoesExternasLista.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-refeicao-externa');
            if (deleteBtn) {
                const itemParaRemover = deleteBtn.closest('.meal-item-externo');
                if (itemParaRemover) {
                    itemParaRemover.remove();
                    console.log("Refeição externa removida da lista.");
                }
            }
        });
    }
    if (closeAddRefeicaoExternaModalBtn) {
        closeAddRefeicaoExternaModalBtn.addEventListener('click', () => closeModal(addRefeicaoExternaModal));
    }
    if (cancelAddRefeicaoBtn) {
        cancelAddRefeicaoBtn.addEventListener('click', () => closeModal(addRefeicaoExternaModal));
    }
    if (addRefeicaoExternaModal) {
        addRefeicaoExternaModal.addEventListener('click', (e) => {
            if (e.target === addRefeicaoExternaModal) closeModal(addRefeicaoExternaModal);
        });
    }

    // --- Listeners dos Modais de Histórico e Progresso ---
    if (btnAbrirHistoricoModal) {
        btnAbrirHistoricoModal.addEventListener('click', async () => {
            showLoading(true);
            await loadHistoricoRegistrosCompleto(); 
            historicoPeriodoFiltros?.querySelector('.active')?.classList.remove('active');
            historicoPeriodoFiltros?.querySelector('[data-period="7"]')?.classList.add('active');
            historicoSubTabNav?.querySelector('.active')?.classList.remove('active');
            historicoSubTabNav?.querySelector('[data-subtab="sono"]')?.classList.add('active');
            renderHistoricoModal();
            if (historicoRegistrosModal) openModal(historicoRegistrosModal);
            showLoading(false); 
        });
    }
    if (closeHistoricoModalBtn) {
        closeHistoricoModalBtn.addEventListener('click', () => {
            if (historicoRegistrosModal) closeModal(historicoRegistrosModal);
        });
    }
    if (fecharHistoricoModalBtn) {
        fecharHistoricoModalBtn.addEventListener('click', () => {
            if (historicoRegistrosModal) closeModal(historicoRegistrosModal);
        });
    }
    if (historicoRegistrosModal) {
        historicoRegistrosModal.addEventListener('click', (e) => {
            if (e.target === historicoRegistrosModal) closeModal(historicoRegistrosModal);
        });
    }
    if (historicoPeriodoFiltros) {
        historicoPeriodoFiltros.addEventListener('click', (e) => {
            const target = e.target.closest('.filter-btn-small');
            if (target) {
                historicoPeriodoFiltros.querySelectorAll('.filter-btn-small').forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                renderHistoricoModal();
            }
        });
    }
    if (historicoSubTabNav) {
        historicoSubTabNav.addEventListener('click', (e) => {
            const target = e.target.closest('.sub-tab-btn');
            if (target) {
                historicoSubTabNav.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                renderHistoricoModal();
            }
        });
    }
    
    // Listeners do Modal de Consultas
    // --- BOTÃO "VER HISTÓRICO" (No Card Azul) ---
    // Substitui o modal pelo redirecionamento para a página completa

    if (btnAbrirConsultasHistoricoModal) {
        // Truque: Clona e substitui para limpar qualquer listener antigo (como o do modal)
        const novoBotao = btnAbrirConsultasHistoricoModal.cloneNode(true);
        btnAbrirConsultasHistoricoModal.parentNode.replaceChild(novoBotao, btnAbrirConsultasHistoricoModal);

        novoBotao.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("Botão Card Histórico clicado. Indo para consultas-paciente.html");
            window.location.href = 'consultas-paciente.html';
        });
    }
    if (closeConsultasHistoricoModalBtn) {
        closeConsultasHistoricoModalBtn.addEventListener('click', () => {
            if (consultasHistoricoModal) closeModal(consultasHistoricoModal);
        });
    }
    if (fecharConsultasHistoricoModalBtn) {
        fecharConsultasHistoricoModalBtn.addEventListener('click', () => {
            if (consultasHistoricoModal) closeModal(consultasHistoricoModal);
        });
    }
    if (consultasHistoricoModal) {
        consultasHistoricoModal.addEventListener('click', (e) => {
            if (e.target === consultasHistoricoModal) {
                closeModal(consultasHistoricoModal);
            }
            const target = e.target.closest('.btn-link-detalhes');
            if (target && target.dataset.page) {
                const pageId = target.dataset.page; 
                console.log(`Botão "Ver Detalhes" clicado. A navegar para: ${pageId}`);
                closeModal(consultasHistoricoModal);
                switchProfilePage(pageId);
            }
        });
    }

    // Listener do Botão "Ver Todas as Consultas"
    if (btnVerTodasConsultas) {
        btnVerTodasConsultas.addEventListener('click', (e) => {
            const pageId = e.currentTarget.dataset.page;
            if (pageId) {
                console.log(`Botão "Ver Todas as Consultas" clicado. Navegando para: ${pageId}`);
                switchProfilePage(pageId);
            }
        });
    }
    
    // Listener do Botão "Ver Relatório Completo" (Indicadores)
    if (btnVerRelatorioCompleto) {
        btnVerRelatorioCompleto.addEventListener('click', () => {
            console.log("Botão 'Ver Relatório Completo' clicado. Abrindo modal de histórico...");
            if (historicoRegistrosModal) {
                loadHistoricoRegistrosCompleto().then(() => {
                    historicoPeriodoFiltros?.querySelector('.active')?.classList.remove('active');
                    historicoPeriodoFiltros?.querySelector('[data-period="7"]')?.classList.add('active');
                    historicoSubTabNav?.querySelector('.active')?.classList.remove('active');
                    historicoSubTabNav?.querySelector('[data-subtab="sono"]')?.classList.add('active');
                    renderHistoricoModal();
                    openModal(historicoRegistrosModal);
                });
            }
        });
    }
    
    
    // Listeners do Modal de Progresso (Calendário)
    if (btnAbrirProgressoModal) {
        btnAbrirProgressoModal.addEventListener('click', openProgressoModal);
    }
    if (closeProgressoModalBtn) {
        closeProgressoModalBtn.addEventListener('click', () => {
            if (progressoModal) closeModal(progressoModal);
        });
    }
    if (fecharProgressoModalBtn) {
        fecharProgressoModalBtn.addEventListener('click', () => {
            if (progressoModal) closeModal(progressoModal);
        });
    }
    if (progressoModal) {
        progressoModal.addEventListener('click', (e) => {
            if (e.target === progressoModal) {
                closeModal(progressoModal);
            }
        });
    }

    // --- Autenticação ---
    // Este é o "gatilho" que inicia a página.
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            console.log("Usuário (Paciente) autenticado:", currentUser.uid);
            
            showLoading(true); 
            
            let patientIdParaCarregar = user.uid; 
            
            const profDocRef = doc(db, 'profissionais', user.uid);
            const profDocSnap = await getDoc(profDocRef);
            
            if (profDocSnap.exists()) {
                console.warn("Um Profissional tentou aceder ao Perfil de Paciente. A redirecionar...");
                window.location.href = 'professional-dashboard.html';
                return; 
            }
            
            initializePage(patientIdParaCarregar); 

        } else {
            currentUser = null;
            console.warn("Usuário não logado, redirecionando...");
            window.location.href = 'index.html';
        }
    });

    // ==========================================================
// SISTEMA DE NOTIFICAÇÕES PACIENTE
// ==========================================================

// ==========================================================
// SISTEMA DE NOTIFICAÇÕES PACIENTE (O CÓDIGO QUE FALTA)
// ==========================================================

/**
 * Inicia o ouvinte de notificações para o paciente
 */
function setupPatientNotifications() {
    if (!currentUser) {
        console.error("Erro: setupPatientNotifications chamado sem usuário logado.");
        return;
    }

    console.log("Iniciando ouvinte de notificações...");

    // Referência: pacientes/{uid}/notificacoes
    const notifRef = collection(db, 'pacientes', currentUser.uid, 'notificacoes');
    
    // Ordena por data (mais recente primeiro) e limita a 20
    const q = query(notifRef, orderBy('timestamp', 'desc'), limit(20));

    // OUVINTE EM TEMPO REAL
    onSnapshot(q, (snapshot) => {
        const lista = [];
        let unreadCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            lista.push({ id: doc.id, ...data });
            if (!data.lida) unreadCount++;
        });

        updatePatientBadge(unreadCount);
        renderPatientNotifications(lista);
    }, (error) => {
        console.error("Erro no listener de notificações:", error);
    });
}

/**
 * Atualiza a bolinha vermelha
 */
function updatePatientBadge(count) {
    const badge = document.getElementById('notification-badge-paciente');
    if (!badge) return;
    
    if (count > 0) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.classList.remove('hidden');
        badge.style.display = 'flex';
    } else {
        badge.classList.add('hidden');
        badge.style.display = 'none';
    }
}

/**
 * Desenha a lista no menu
 */
function renderPatientNotifications(lista) {
    const container = document.getElementById('notification-list-paciente');
    if (!container) return;
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p class="placeholder" style="text-align: center; padding: 20px; color: #888;">Nenhuma notificação.</p>';
        return;
    }

    lista.forEach(notif => {
        // Formata tempo
        let timeAgo = 'Agora';
        if (notif.timestamp) {
            const d = notif.timestamp.toDate ? notif.timestamp.toDate() : new Date(notif.timestamp);
            timeAgo = d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
        }

        const item = document.createElement('div');
        item.className = `notification-item ${notif.lida ? '' : 'unread'}`;
        
        let iconClass = 'fa-info-circle';
        if (notif.tipo === 'agendamento') iconClass = 'fa-calendar-check';
        if (notif.tipo === 'receita') iconClass = 'fa-file-prescription';

        item.innerHTML = `
            <i class="fa-solid ${iconClass} notif-icon"></i>
            <div class="notif-content">
                <strong>${notif.titulo}</strong>
                <p>${notif.mensagem}</p>
                <span class="notif-time">${timeAgo}</span>
            </div>
        `;

        // Clique: Marca como lida e vai para o link
        item.addEventListener('click', async () => {
            try {
                const ref = doc(db, 'pacientes', currentUser.uid, 'notificacoes', notif.id);
                await updateDoc(ref, { lida: true });
                
                if (notif.link) window.location.href = notif.link;
            } catch(e) { console.error(e); }
        });

        container.appendChild(item);
    });
}

// --- LISTENERS DOS BOTÕES DO SINO ---
// (Coloque isto fora de qualquer função, no escopo principal ou dentro do DOMContentLoaded)

const btnNotifPac = document.getElementById('btn-notificacoes-paciente');
const dropNotifPac = document.getElementById('notification-dropdown-paciente');
const btnLimparPac = document.getElementById('btn-limpar-notificacoes');

if (btnNotifPac && dropNotifPac) {
    btnNotifPac.addEventListener('click', (e) => {
        e.stopPropagation();
        dropNotifPac.classList.toggle('hidden');
    });
    
    document.addEventListener('click', (e) => {
        if (!btnNotifPac.contains(e.target) && !dropNotifPac.contains(e.target)) {
            dropNotifPac.classList.add('hidden');
        }
    });
}

if (btnLimparPac) {
    btnLimparPac.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!currentUser) return;
        
        try {
            // Limpa todas (Batch)
            const q = query(collection(db, 'pacientes', currentUser.uid, 'notificacoes'), where('lida', '==', false));
            const snap = await getDocs(q);
            const batch = writeBatch(db);
            snap.forEach(doc => batch.update(doc.ref, { lida: true }));
            await batch.commit();
        } catch(e) { console.error("Erro ao limpar:", e); }
    });
}

}); // Fim do 'DOMContentLoaded'