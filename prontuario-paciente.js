
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// Linha CORRIGIDA (adicione query, where, orderBy,updateDoc):
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    getDocs, 
    collection, 
    addDoc, 
    serverTimestamp, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    updateDoc, 
    limit  // <--- AQUI ESTÁ O QUE FALTAVA!
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';


// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyB3Gxc-8jjYyeJSQyhrWv7YzHOIO3v38JY",
    authDomain: "orion-8be51.firebaseapp.com",
    projectId: "orion-8be51",
    storageBucket: "orion-8be51.firebasestorage.app",
    messagingSenderId: "121485013135",
    appId: "1:121485013135:web:5c97776b4fbde4ef9fc0fa"
};

// --- INICIALIZAÇÃO DO FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES GLOBAIS ---
    let charts = {};
    const loadingOverlay = document.getElementById('loading-overlay');
    const pageWrapper = document.getElementById('page-wrapper');
    const patientPhoto = document.getElementById('patient-photo');
    const patientName = document.getElementById('patient-name');
    const patientMetaInfo = document.getElementById('patient-meta-info');
    const tabNav = document.querySelector('.tab-nav');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu-button');
    const backdrop = document.getElementById('backdrop');
    const headerActions = document.querySelector('.header-actions.desktop-only');
    const actionFooter = document.querySelector('.action-footer');
    
    // --- SELETORES DE ABAS E SUB-ABAS (COMPLETO) ---
    const recipeSearchInput = document.getElementById('recipe-search-input');
    const recipeFilterGroup = document.getElementById('recipe-filter-group');
    const recipeListContainer = document.getElementById('recipe-list');
    const encaminhamentoSearchInput = document.getElementById('encaminhamento-search-input');
    const examesSubTabNav = document.querySelector('#tab-exames .sub-tab-nav');
    const exameSolicitacaoSearchInput = document.getElementById('exame-solicitacao-search-input');
    const exameResultadoSearchInput = document.getElementById('exame-resultado-search-input');
    const exameFilterGroup = document.getElementById('exame-filter-group');
    const registrosDiariosSubTabNav = document.getElementById('registros-diarios-sub-tab-nav');
    const anamneseSearchInput = document.getElementById('anamnese-search-input');
    const medicamentoFilter = document.getElementById('medicamento-filter');
    const medicacaoListContainer = document.getElementById('medicacao-list-container');
    const medicacaoPeriodFilters = document.querySelector('.medicacao-period-filters');
    const atestadosListContainer = document.getElementById('atestados-list-container');
    const atestadoSearchInput = document.getElementById('atestado-search-input');

    // --- SELETORES DE MODAIS E FORMULÁRIOS (COMPLETO) ---
    const encaminharModal = document.getElementById('encaminhar-modal');
    // Modal Encaminhamento
    const formEncaminhamentoModal = document.getElementById('form-encaminhamento-modal');
    const formEncaminhamento = document.getElementById('form-encaminhamento');
    const cancelEncaminhamentoButton = document.getElementById('cancel-encaminhamento-button');
    // Modal Exame
    const formExameModal = document.getElementById('form-exame-modal');
    const formExame = document.getElementById('form-exame');
    const exameSearchInput = document.getElementById('exame-search-input');
    const exameSuggestionsContainer = document.getElementById('exame-suggestions-container');
    const selectedExamsContainer = document.getElementById('selected-exams-container');
    const cancelExameButton = document.getElementById('cancel-exame-button');
    // Modais de Receita (Multi)
    const btnSolicitarReceita = document.getElementById('btn-solicitar-receita');
    const formReceitaModal = document.getElementById('form-receita-modal');
    const formAddMedicamento = document.getElementById('form-add-medicamento');
    const formReceitaFinal = document.getElementById('form-receita-final');
    const medicamentosAdicionadosList = document.getElementById('medicamentos-adicionados-list');
    const medicamentosAdicionadosPlaceholder = document.getElementById('medicamentos-adicionados-placeholder');
    const observacoesGeraisInput = document.getElementById('observacoes-gerais');
    const closeFormReceitaModalButton = document.getElementById('close-form-receita-modal');
    const cancelReceitaButton = document.getElementById('cancel-receita-button');
    const receitaErrorMessage = document.getElementById('receita-error-message');
    const receitaSignatureNameModal = document.getElementById('receita-signature-name-modal');
    // Modal Detalhe Medicação
    const medicacaoDetalheModal = document.getElementById('medicacao-detalhe-modal');
    const closeMedicacaoDetalheModalButton = document.getElementById('close-medicacao-detalhe-modal');
    const fecharMedicacaoDetalheBtn = document.getElementById('fechar-medicacao-detalhe-btn');
    // Modal Atestado
    const btnModalAbrirAtestado = document.getElementById('btn-modal-abrir-atestado');
    const formAtestadoModal = document.getElementById('form-atestado-modal');
    const formAtestado = document.getElementById('form-atestado');
    const closeFormAtestadoModalButton = document.getElementById('close-form-atestado-modal');
    const cancelAtestadoButton = document.getElementById('cancel-atestado-button');
    const atestadoSignatureNameModal = document.getElementById('atestado-signature-name-modal');
    // Modal Painel Clínico
    const painelClinicoSubTabNav = document.getElementById('painel-clinico-sub-tab-nav');
    const historicoConsultasLista = document.querySelector('.historico-consultas-lista');
    const consultaModal = document.getElementById('consulta-modal');
    const btnIniciarAtendimentoPainel = document.getElementById('btn-iniciar-atendimento-painel'); 
    const closeConsultaModalButton = document.getElementById('close-consulta-modal');
    const consultaSubTabNav = document.getElementById('consulta-sub-tab-nav');
    const btnModalAbrirReceita = document.getElementById('btn-modal-abrir-receita'); // Já declarado, mas ok
    const btnModalAbrirEncaminhamento = document.getElementById('btn-modal-abrir-encaminhamento');
    const salvarNotasBtn = document.getElementById('salvar-notas-btn');
    const consultaGerarPdfBtn = document.getElementById('consulta-gerar-pdf');
    const consultaConfirmarBtn = document.getElementById('consulta-confirmar-atendimento');
    const consultaSalvarBtn = document.getElementById('consulta-salvar-alteracoes');
    const btnModalAbrirExames = document.getElementById('btn-modal-abrir-exames');
    const duracaoAcompanhamentoSelect = document.getElementById('duracao-acompanhamento');
    const progressoDiasLabel = document.getElementById('progresso-dias-label');
    

    // --- VARIÁVEIS DE ESTADO ---
    let currentUser = null;
    let currentPatientId = null;
    let currentPatientData = {};
    let currentProfessionalData = {};
    let allRecipes = [];
    let mockExames = [];
    let mockMedicacaoRegistros = [];
    let allAtestados = []; // Array para Atestados
    let medicamentosDaReceitaAtual = []; // Array temporário para a receita em criação
    let historicoConsultas = []; // Array para guardar os dados das consultas
    let receitasDaSessaoAtual = []; 
    let examesDaSessaoAtual = [];
    let atestadosDaSessaoAtual = []; 
    let sinaisVitaisDaSessaoAtual = []; 
    let encaminhamentosDaSessaoAtual = []; 
    let acompanhamentosDaSessaoAtual = []; 
    let allExames = [];
    let allEncaminhamentos = [];
    let allPatientRecords = [];
    let currentConsultationType = 'Presencial'; // Valor padrão
    
    const EXAMES_COMUNS = [
        "Hemograma Completo", "Glicemia em Jejum", "Colesterol Total e Frações",
        "TSH e T4 Livre", "Creatinina", "Urina tipo I", "Raio-X de Tórax", "Ultrassonografia Abdominal"
    ];







    // ==========================================================================
    // --- DECLARAÇÃO DE TODAS AS FUNÇÕES AUXILIARES ---
    // (Definidas ANTES de serem chamadas por initializePage ou addEventListeners)
    // ==========================================================================
    

    

    const switchTab = (tabId) => {
        document.querySelectorAll('.tab-btn, .mobile-nav-link').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`)?.classList.add('active');
        document.querySelector(`.mobile-nav-link[data-tab="${tabId}"]`)?.classList.add('active');
        const activePanel = document.getElementById(`tab-${tabId}`);
        if (activePanel) activePanel.classList.remove('hidden');
    };

    const switchExameSubTab = (subTabId) => {
        if (examesSubTabNav) {
            examesSubTabNav.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('#tab-exames .sub-tab-panel').forEach(panel => panel.classList.add('hidden'));
            examesSubTabNav.querySelector(`.sub-tab-btn[data-subtab="${subTabId}"]`)?.classList.add('active');
            const activePanel = document.getElementById(`subtab-exames-${subTabId}`);
            if (activePanel) activePanel.classList.remove('hidden');
        }
    };

    const switchRegistrosSubTab = (subTabId) => {
        if (registrosDiariosSubTabNav) {
            registrosDiariosSubTabNav.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('#tab-registros-diarios .sub-tab-panel').forEach(panel => panel.classList.add('hidden'));
            registrosDiariosSubTabNav.querySelector(`.sub-tab-btn[data-subtab="${subTabId}"]`)?.classList.add('active');
            const activePanel = document.getElementById(`subtab-registros-${subTabId}`);
            if (activePanel) activePanel.classList.remove('hidden');
        }
    };

    // Função para alternar as sub-abas DENTRO do Modal de Consulta
    const switchConsultaSubTab = (subTabId) => {
        if (consultaSubTabNav) {
            consultaSubTabNav.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('#consulta-modal .sub-tab-panel').forEach(panel => panel.classList.add('hidden'));
            consultaSubTabNav.querySelector(`.sub-tab-btn[data-subtab="${subTabId}"]`)?.classList.add('active');
            const activePanel = document.getElementById(`subtab-consulta-${subTabId}`);
            if (activePanel) activePanel.classList.remove('hidden');
        }
    };
    

    const openModal = (modal) => {
    if (modal) {
        modal.classList.remove('hidden');
        // Adiciona display flex para garantir visibilidade e centralização (se usar flexbox no CSS)
        modal.style.display = 'flex';
        // Mostra o backdrop se ele existir
        if (backdrop) backdrop.classList.remove('hidden');
        console.log(`openModal: Modal ${modal.id} tornado visível.`); // Log extra
    } else {
        console.error("openModal: Tentativa de abrir um modal nulo/inválido.");
    }
};

const closeModal = (modal) => {
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none'; // Garante que está escondido
        // Esconde o backdrop se ele existir E nenhum outro modal estiver aberto
        // (Lógica simples, pode precisar de ajuste se tiver múltiplos modais sobrepostos)
        const anyModalOpen = document.querySelector('.modal:not(.hidden)');
        if (backdrop && !anyModalOpen) backdrop.classList.add('hidden');
        console.log(`closeModal: Modal ${modal.id} escondido.`); // Log extra
    } else {
         console.error("closeModal: Tentativa de fechar um modal nulo/inválido.");
    }
};
    const openMobileMenu = () => { if (mobileNavMenu) mobileNavMenu.classList.add('open'); if (backdrop) backdrop.classList.remove('hidden'); };
    const closeMobileMenu = () => { if (mobileNavMenu) mobileNavMenu.classList.remove('open'); if (backdrop) backdrop.classList.add('hidden'); };
    

    // INÍCIO DA NOVA FUNÇÃO (para colar fora de addEventListeners)

// Função para alternar as sub-abas NÍVEL 2 (dentro de "Dados da Consulta")
const switchDadosConsultaSubTab = (subTabId) => {
    const nav = document.getElementById('dados-consulta-sub-nav');
    const contentContainer = document.querySelector('#subtab-consulta-dados-clinicos .sub-tab-content-level2');

    if (!nav || !contentContainer) {
        console.error("Erro: Não foi possível encontrar a navegação ou o container das sub-abas de 'Dados da Consulta'.");
        return;
    }

    // 1. Esconde todos os painéis Nível 2
    contentContainer.querySelectorAll('.sub-tab-panel-level2').forEach(panel => {
        panel.classList.add('hidden');
    });

    // 2. Mostra o painel Nível 2 ativo
    const activePanel = document.getElementById(`panel-${subTabId}`);
    if (activePanel) {
        activePanel.classList.remove('hidden');
    } else {
        console.warn(`Painel Nível 2 'panel-${subTabId}' não encontrado.`);
    }

    // 3. Atualiza os botões Nível 2
    nav.querySelectorAll('.sub-tab-btn-level2').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = nav.querySelector(`.sub-tab-btn-level2[data-subtab-target="${subTabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // 4. TODO: Adicionar lógica para carregar dados específicos quando a aba for clicada
    // (Por enquanto, a aba Sinais Vitais é preenchida ao salvar)
    // Exemplo:
    // if (subTabId === 'dc-receitas') {
    //    renderizarReceitasDaSessao();
    // }
};
// FIM DA NOVA FUNÇÃO

/**
 * CARREGA O HISTÓRICO COMPLETO DE UM ACOMPANHAMENTO
 */
async function openHistoricoAcompanhamento(planoId, tituloPlano) {
    const modal = document.getElementById('historico-acompanhamento-modal');
    const container = document.getElementById('lista-historico-checkins');
    const tituloEl = document.getElementById('historico-acomp-title');
    
    // Elementos de estatística
    const totalDiasEl = document.getElementById('hist-total-dias');
    const mediaAdesaoEl = document.getElementById('hist-media-adesao');

    if (!modal || !container || !currentPatientId) return;

    // 1. Configura Modal
    if (tituloEl) tituloEl.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> Histórico: ${tituloPlano}`;
    container.innerHTML = '<p class="placeholder"><i class="fa-solid fa-spinner fa-spin"></i> Carregando dados...</p>';
    openModal(modal);

    try {
        // 2. Busca Check-ins do Firestore (Ordenados por data)
        const checkinsRef = collection(db, 'pacientes', currentPatientId, 'acompanhamentos', planoId, 'checkins');
        const q = query(checkinsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);

        container.innerHTML = '';

        if (querySnapshot.empty) {
            container.innerHTML = '<div class="empty-state-mini" style="text-align:center; padding:30px;"><i class="fa-solid fa-calendar-xmark" style="font-size:2rem; opacity:0.5;"></i><p>Nenhum check-in realizado pelo paciente ainda.</p></div>';
            if (totalDiasEl) totalDiasEl.textContent = "0";
            if (mediaAdesaoEl) mediaAdesaoEl.textContent = "0%";
            return;
        }

        // 3. Processa Estatísticas
        let somaPercentuais = 0;
        let totalRegistros = querySnapshot.size;

        // 4. Renderiza a Lista
        querySnapshot.forEach(doc => {
            const data = doc.data();
            
            // Calcula % deste dia
            const concluidas = data.metasConcluidas?.length || 0;
            const total = (data.metasConcluidas?.length || 0) + (data.metasPendentes?.length || 0);
            const percentualDia = total > 0 ? Math.round((concluidas / total) * 100) : 0;
            
            somaPercentuais += percentualDia;

            // Formata Data
            let dataLabel = "Data desconhecida";
            if (data.timestamp?.toDate) {
                dataLabel = data.timestamp.toDate().toLocaleDateString('pt-BR', { 
                    weekday: 'long', day: 'numeric', month: 'long' 
                });
            }

            // Gera HTML das Metas (Verde ou Cinza)
            let metasHtml = '';
            // Concluídas
            if (data.metasConcluidas) {
                data.metasConcluidas.forEach(m => {
                    // Tenta limpar o texto (remover meta_) ou usa o texto salvo
                    let texto = m.texto || m.id || "Meta";
                    // Se tivermos a função formatadora disponível, usamos
                    if (typeof formatarNomeMeta === 'function') texto = formatarNomeMeta(m.id || m.texto);
                    
                    metasHtml += `<div style="display:flex; align-items:center; gap:8px; color:#28a745; font-size:0.9rem; margin-bottom:4px;">
                        <i class="fa-solid fa-check-circle"></i> <span>${texto}</span>
                    </div>`;
                });
            }
            // Pendentes (Falhou)
            if (data.metasPendentes) {
                data.metasPendentes.forEach(m => {
                    let texto = m.texto || m.id || "Meta";
                    if (typeof formatarNomeMeta === 'function') texto = formatarNomeMeta(m.id || m.texto);

                    metasHtml += `<div style="display:flex; align-items:center; gap:8px; color:#a0aec0; font-size:0.9rem; margin-bottom:4px;">
                        <i class="fa-regular fa-circle"></i> <span>${texto}</span>
                    </div>`;
                });
            }

            // Card do Dia
            const cardHtml = `
                <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px dashed #eee; padding-bottom: 8px;">
                        <strong style="text-transform: capitalize; color: #2d3748;">${dataLabel}</strong>
                        <span class="badge" style="background:${percentualDia === 100 ? '#c6f6d5' : '#ebf8ff'}; color:${percentualDia === 100 ? '#2f855a' : '#2b6cb0'};">
                            ${percentualDia}% Concluído
                        </span>
                    </div>
                    <div>${metasHtml}</div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });

        // Atualiza Estatísticas do Topo
        if (totalDiasEl) totalDiasEl.textContent = totalRegistros;
        if (mediaAdesaoEl) mediaAdesaoEl.textContent = Math.round(somaPercentuais / totalRegistros) + "%";

    } catch (error) {
        console.error("Erro ao carregar histórico de check-ins:", error);
        container.innerHTML = '<p class="error-message">Erro ao carregar dados.</p>';
    }
}
/**
 * CARREGA O HISTÓRICO DE EXAMES (Aba Pré-Consulta)
 * Lê de: pacientes/{currentPatientId}/exames
 */
async function loadExamesDoPaciente() {
    const container = document.getElementById('exames-solicitacoes-container');
    if (!container || !currentPatientId) return;

    // Mostra loading ou limpa
    container.innerHTML = '<p class="placeholder">A carregar histórico de exames...</p>';

    try {
        // 1. Busca na coleção do Paciente (onde acabaste de salvar)
        const examesRef = collection(db, 'pacientes', currentPatientId, 'exames');
        
        // Ordena por data (mais recente primeiro) se possível, senão traz tudo
        const q = query(examesRef, orderBy('timestamp', 'desc'));
        
        const querySnapshot = await getDocs(q);

        container.innerHTML = ''; // Limpa o loading

        if (querySnapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-flask-vial"></i><p>Nenhum exame registrado para este paciente.</p></div>';
            return;
        }

        // 2. Desenha os cartões
        querySnapshot.forEach((doc) => {
            const exame = doc.data();
            const exameId = doc.id;

            // Formata Data
            let dataFmt = 'Data N/D';
            let dataRaw = exame.dataSolicitacao || exame.timestamp;
            if (dataRaw) {
                try {
                    const d = dataRaw.toDate ? dataRaw.toDate() : new Date(dataRaw);
                    dataFmt = d.toLocaleDateString('pt-BR');
                } catch(e){}
            }

            // Formata Título (Lista ou Único)
            let titulo = "Solicitação de Exames";
            let listaHtml = "";
            
            if (exame.tiposExame && Array.isArray(exame.tiposExame)) {
                // Se for uma lista, mostra o primeiro e conta os outros
                titulo = exame.tiposExame[0];
                if (exame.tiposExame.length > 1) {
                    titulo += ` + ${exame.tiposExame.length - 1} outros`;
                }
                // Cria a lista para o corpo do card
                listaHtml = `<ul style="padding-left: 20px; margin: 5px 0;">${exame.tiposExame.map(t => `<li>${t}</li>`).join('')}</ul>`;
            } else if (exame.titulo) {
                titulo = exame.titulo;
            }

            // Define Classe de Status
            let statusClass = 'status-solicitado';
            if (exame.status === 'Realizado') statusClass = 'status-realizado';
            
            // Cria o HTML do Card
            const cardHTML = `
                <div class="exame-card" data-exame-id="${exameId}">
                    <div class="recipe-header">
                        <h3><i class="fa-solid fa-flask-vial"></i> ${titulo}</h3>
                        <span class="badge ${statusClass}">${exame.status || 'Solicitado'}</span>
                    </div>
                    
                    <p class="recipe-doctor">Solicitado por: ${exame.nome_profissional || exame.solicitadoPor || 'Profissional'}</p>
                    
                    ${listaHtml}
                    
                    <p style="font-size: 0.9rem; color: #666; margin-top: 8px;">
                        <strong>Motivo:</strong> ${exame.motivo || 'N/A'}
                    </p>

                    <div class="recipe-footer">
                        <small>Data: ${dataFmt}</small>
                        <div class="card-footer-actions">
                            <button class="btn-pdf" data-action="gerar-pdf-exame" data-exame-id="${exameId}">
                                <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

        // IMPORTANTE: Atualiza a variável global mockExames/allExames para o botão PDF funcionar
        // (O botão PDF procura nesta lista para gerar o documento)
        // Mapeia os docs para o formato de objeto e guarda na memória
        mockExames = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    } catch (error) {
        console.error("Erro ao carregar exames do paciente:", error);
        container.innerHTML = '<p class="error-message">Erro ao carregar histórico.</p>';
    }
}
// ==========================================================
// NOVA FUNÇÃO PARA CARREGAR DADOS E ABRIR MODAL DE EDIÇÃO
// (Cole esta função no seu prontuario-paciente.js)
// ==========================================================
async function handleEditarConsulta(consultaId) {
    console.log(`handleEditarConsulta: Iniciando carregamento para edição. Consulta ID: ${consultaId}`);

    // Verifica IDs e DB
    if (!db || !currentPatientId || !consultaId || !currentUser) {
        alert("Erro: Informações insuficientes para editar a consulta.");
        console.error("handleEditarConsulta: DB, currentPatientId, consultaId ou currentUser está faltando.");
        return;
    }

    // Mostra feedback de carregamento
    loadingOverlay?.classList.remove('hidden');

    try {
        // --- 1. Buscar o Documento Principal da Consulta ---
        const consultaDocRef = doc(db, 'consultas', consultaId);
        const consultaDocSnap = await getDoc(consultaDocRef);

        if (!consultaDocSnap.exists()) {
            throw new Error(`Consulta com ID ${consultaId} não encontrada para edição.`);
        }

        const consultaData = consultaDocSnap.data();
        console.log("handleEditarConsulta: Documento principal da consulta encontrado:", consultaData);

        // Verifica se o médico logado é o mesmo que criou a consulta (segurança extra)
        if (consultaData.medico_id !== currentUser.uid) {
             alert("Aviso: Você só pode editar consultas que você mesmo criou.");
             console.warn(`handleEditarConsulta: Tentativa de editar consulta (${consultaId}) por médico diferente (${currentUser.uid} != ${consultaData.medico_id}).`);
             loadingOverlay?.classList.add('hidden'); // Esconde o loading
             return; // Interrompe a função
        }


        // --- 2. Limpar os Arrays da Sessão ATUAL ---
        //    (Importante para não misturar dados de consultas diferentes)
        console.log("handleEditarConsulta: Limpando arrays da sessão atual antes de carregar dados antigos...");
        receitasDaSessaoAtual = [];
        examesDaSessaoAtual = [];
        atestadosDaSessaoAtual = [];
        sinaisVitaisDaSessaoAtual = [];
        encaminhamentosDaSessaoAtual = [];
        acompanhamentosDaSessaoAtual = [];
        // Limpa também as UIs correspondentes em "Dados da Consulta"
        renderReceitasEmDadosDaConsulta();
        renderExamesEmDadosDaConsulta();
        renderAtestadosEmDadosDaConsulta();
        renderSinaisVitaisDaSessao();
        renderEncaminhamentosEmDadosDaConsulta();
        renderAcompanhamentoEmDadosDaConsulta();


        // --- 3. Buscar Documentos Associados (Reutilizando fetchDocById/fetchDocsByIds) ---

        // Objeto temporário para guardar os dados buscados ANTES de colocá-los nos arrays de sessão
        const dadosConsultaAntiga = {
            evolucao: null,
            receitas: [],
            pedidosExame: [],
            atestados: [],
            sinaisVitais: [],
            encaminhamentos: [],
            acompanhamentos: []
        };

         // Função auxiliar para buscar um único documento (COPIE SE AINDA NÃO EXISTIR GLOBALMENTE)
        const fetchDocById = async (collectionPath, docId) => {
            // ... (cole aqui a função fetchDocById que usamos em handleVisualizarConsulta) ...
            // OU garanta que ela esteja definida num escopo acessível por ambas as funções
             if (!docId) return null;
             try {
                 const docRef = doc(db, collectionPath, docId);
                 const docSnap = await getDoc(docRef);
                 if (docSnap.exists()) { return { id: docSnap.id, ...docSnap.data() }; }
                 else { console.warn(`Documento não encontrado em ${collectionPath}/${docId}`); return null; }
             } catch (error) { console.error(`Erro ao buscar ${collectionPath}/${docId}:`, error); return null; }
        };

        // Função auxiliar para buscar múltiplos documentos (COPIE SE AINDA NÃO EXISTIR GLOBALMENTE)
        const fetchDocsByIds = async (basePath, ids) => {
            // ... (cole aqui a função fetchDocsByIds que usamos em handleVisualizarConsulta) ...
            // OU garanta que ela esteja definida num escopo acessível
             if (!ids || ids.length === 0) return [];
             const promises = ids.map(id => fetchDocById(basePath, id));
             const results = await Promise.all(promises);
             return results.filter(doc => doc !== null);
        };

        // Busca Evolução
        if (consultaData.evolucao_id) {
            const evolucaoPath = `pacientes/${currentPatientId}/evolucao`;
            dadosConsultaAntiga.evolucao = await fetchDocById(evolucaoPath, consultaData.evolucao_id);
        }
        // Busca Receitas
        if (consultaData.receita_ids && consultaData.receita_ids.length > 0) {
            const receitasPath = `pacientes/${currentPatientId}/receitas`;
            dadosConsultaAntiga.receitas = await fetchDocsByIds(receitasPath, consultaData.receita_ids);
        }
        // Busca Exames
         if (consultaData.pedido_exame_ids && consultaData.pedido_exame_ids.length > 0) {
            const examesPath = `pedidos_exame`; // Coleção raiz
            dadosConsultaAntiga.pedidosExame = await fetchDocsByIds(examesPath, consultaData.pedido_exame_ids);
        }
         // Busca Atestados
         if (consultaData.atestado_ids && consultaData.atestado_ids.length > 0) {
            const atestadosPath = `pacientes/${currentPatientId}/atestados`;
            dadosConsultaAntiga.atestados = await fetchDocsByIds(atestadosPath, consultaData.atestado_ids);
        }
        // Busca Sinais Vitais
         if (consultaData.sinais_vitais_ids && consultaData.sinais_vitais_ids.length > 0) {
            const sinaisPath = `pacientes/${currentPatientId}/sinaisVitais`;
            dadosConsultaAntiga.sinaisVitais = await fetchDocsByIds(sinaisPath, consultaData.sinais_vitais_ids);
         }
        // Busca Encaminhamentos
        if (consultaData.encaminhamento_ids && consultaData.encaminhamento_ids.length > 0) {
             const encaminhamentosPath = `encaminhamentos/${currentPatientId}/registros`; // Atenção ao path!
             dadosConsultaAntiga.encaminhamentos = await fetchDocsByIds(encaminhamentosPath, consultaData.encaminhamento_ids);
        }
        // Busca Acompanhamentos
        if (consultaData.acompanhamento_ids && consultaData.acompanhamento_ids.length > 0) {
             const acompanhamentosPath = `acompanhamentos`; // Coleção raiz
             dadosConsultaAntiga.acompanhamentos = await fetchDocsByIds(acompanhamentosPath, consultaData.acompanhamento_ids);
        }

        console.log("handleEditarConsulta: Dados antigos carregados:", dadosConsultaAntiga);

        // --- 4. Preencher o Modal de Atendimento (#consulta-modal) ---

        // Guarda o ID da consulta que está a ser editada (num campo oculto ou variável global)
        const consultaEditIdInput = document.getElementById('consulta-edit-id'); // <<< PRECISAMOS CRIAR ESTE INPUT NO HTML
        if (consultaEditIdInput) {
            consultaEditIdInput.value = consultaId;
            console.log("handleEditarConsulta: ID da consulta setado no campo oculto para atualização.");
        } else {
            console.warn("handleEditarConsulta: Campo oculto #consulta-edit-id não encontrado no modal de consulta. A atualização pode falhar.");
            // Poderíamos usar uma variável global como fallback, mas o input é melhor.
            // window.consultaEmEdicaoId = consultaId;
        }

        // Preenche a Evolução Clínica
        const evolucaoTextarea = consultaModal?.querySelector('#evolucao-texto-input');
        if (evolucaoTextarea && dadosConsultaAntiga.evolucao) {
            evolucaoTextarea.value = dadosConsultaAntiga.evolucao.texto || '';
        } else if(evolucaoTextarea) {
             evolucaoTextarea.value = ''; // Limpa se não havia evolução salva
        }

        // Preenche os Arrays da Sessão ATUAL com os dados ANTIGOS
        // (Convertendo timestamps do Firestore para Date ou ISO string, se necessário para as funções render...)
        receitasDaSessaoAtual = dadosConsultaAntiga.receitas.map(r => ({ ...r, emissao: r.timestamp?.toDate ? r.timestamp.toDate().toISOString() : r.emissao })); // Ajusta timestamp
        examesDaSessaoAtual = dadosConsultaAntiga.pedidosExame.map(ex => ({...ex, timestamp: ex.timestamp?.toDate ? ex.timestamp.toDate().toISOString() : ex.timestamp}));
        atestadosDaSessaoAtual = dadosConsultaAntiga.atestados.map(at => ({...at, emissao: at.timestamp?.toDate ? at.timestamp.toDate().toISOString() : at.emissao}));
        sinaisVitaisDaSessaoAtual = dadosConsultaAntiga.sinaisVitais.map(sv => ({...sv, dataRegistro: sv.timestamp?.toDate ? sv.timestamp.toDate().toISOString() : sv.dataRegistro}));
        encaminhamentosDaSessaoAtual = dadosConsultaAntiga.encaminhamentos.map(enc => ({...enc, timestamp: enc.timestamp?.toDate ? enc.timestamp.toDate().toISOString() : enc.timestamp}));
        acompanhamentosDaSessaoAtual = dadosConsultaAntiga.acompanhamentos.map(ac => ({...ac, timestamp: ac.timestamp?.toDate ? ac.timestamp.toDate() : ac.timestamp})); // Mantém como Date aqui? Verifique renderAcompanhamento

        console.log("handleEditarConsulta: Arrays da sessão atual preenchidos com dados antigos.");

        // Re-renderiza as listas na aba "Dados da Consulta" com os dados carregados
        renderReceitasEmDadosDaConsulta();
        renderExamesEmDadosDaConsulta();
        renderAtestadosEmDadosDaConsulta();
        renderSinaisVitaisDaSessao();
        renderEncaminhamentosEmDadosDaConsulta();
        renderAcompanhamentoEmDadosDaConsulta();

        // --- 5. Ajustar o Modal para Modo Edição ---

        // Muda o Título do Modal (Opcional)
        const tituloModal = consultaModal.querySelector('#consulta-modal-title');
         let dataConsultaAntigaFmt = 'Data N/D';
         if (consultaData.data_consulta?.toDate) {
             dataConsultaAntigaFmt = consultaData.data_consulta.toDate().toLocaleDateString('pt-BR');
         }
        if (tituloModal) {
             tituloModal.textContent = `Editando Consulta - ${dataConsultaAntigaFmt}`;
        }

        // Muda o Texto do Botão Salvar
        const btnSalvar = document.getElementById('consulta-salvar-alteracoes');
        if (btnSalvar) {
            btnSalvar.innerHTML = '<i class="fa-solid fa-sync-alt"></i> Atualizar Consulta'; // Ou só texto: 'Atualizar Consulta'
        }

        // Garante que a aba "Evolução" esteja ativa ao abrir
        if (typeof switchConsultaSubTab === 'function') {
            switchConsultaSubTab('evolucao');
        }

        // --- 6. Abrir o Modal de Atendimento ---
        if (consultaModal && typeof openModal === 'function') {
            openModal(consultaModal);
            console.log("handleEditarConsulta: Modal de atendimento aberto em modo de edição.");
        } else {
             console.error("handleEditarConsulta: Modal de consulta (#consulta-modal) ou função openModal não encontrada!");
        }

    } catch (error) {
        console.error("Erro detalhado ao carregar dados da consulta para edição:", error);
        alert("Ocorreu um erro ao carregar os dados desta consulta para edição. Verifique o console.");
    } finally {
        // Esconde o feedback de carregamento
        loadingOverlay?.classList.add('hidden');
    }
}
// ==========================================================
// FIM DA NOVA FUNÇÃO handleEditarConsulta
// ==========================================================

// ==========================================================
// NOVA FUNÇÃO PARA CARREGAR HISTÓRICO DO FIRESTORE
// (Cole esta função no seu prontuario-paciente.js)
// ==========================================================
async function loadHistoricoConsultasFromFirestore() {
    console.log("loadHistoricoConsultasFromFirestore: Iniciando busca no Firestore...");

    const listaContainer = document.querySelector('.historico-consultas-lista');
    const totalConsultasEl = document.querySelector('.total-consultas');

    if (!listaContainer) {
        console.error("loadHistoricoConsultasFromFirestore: Elemento '.historico-consultas-lista' não encontrado. Abortando.");
        return;
    }

    // Limpa a lista atual e mostra estado de carregamento
    listaContainer.innerHTML = '<p style="padding: 10px;">Carregando histórico...</p>';
    if (totalConsultasEl) totalConsultasEl.textContent = 'Carregando...';

    // Verifica IDs essenciais
    if (!db || !currentPatientId) {
        console.error("loadHistoricoConsultasFromFirestore: Conexão com DB ou ID do Paciente ausente.");
        listaContainer.innerHTML = '<p class="error-message" style="padding: 10px;">Erro ao carregar histórico: Informações ausentes.</p>';
        return;
    }

    try {
        // 1. Define a referência da coleção e a query
        const consultasRef = collection(db, 'consultas');
        const q = query(consultasRef,
                      where("paciente_id", "==", currentPatientId), // Filtra pelo paciente atual
                      where("medico_id", "==", currentUser.uid),     // E TAMBÉM filtra pelo médico logado
                      orderBy("data_consulta", "desc"));        // Ordena pela data (mais recentes primeiro)

        console.log("loadHistoricoConsultasFromFirestore: Executando query para paciente:", currentPatientId);

        // 2. Executa a query
        const querySnapshot = await getDocs(q);
        console.log(`loadHistoricoConsultasFromFirestore: Query retornou ${querySnapshot.size} documentos.`);

        // 3. Processa os resultados
        const consultasDoFirestore = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Formata a data para exibição (ex: 27/10/2025)
            let dataDisplay = 'Data inválida';
            if (data.data_consulta && typeof data.data_consulta.toDate === 'function') {
                try {
                     dataDisplay = data.data_consulta.toDate().toLocaleDateString('pt-BR');
                } catch (e) { console.error("Erro ao formatar data_consulta:", e, data.data_consulta); }
            }

            // Cria o objeto para a função renderHistoricoConsultas
            consultasDoFirestore.push({
                id: doc.id, // O ID do documento principal da consulta
                data: data.data_consulta?.toDate().toISOString().slice(0, 10) || '', // YYYY-MM-DD (para ordenação se necessário)
                dataDisplay: dataDisplay,
                tipo: data.tipo || 'N/A', // Usa o campo 'tipo' salvo
                resumo: data.resumo || 'Nenhuma evolução registrada.', // Usa o campo 'resumo' salvo
                // Passa as flags 'tem_...' diretamente para o renderizador saber quais tags mostrar
                tem_receita: data.tem_receita || false,
                tem_exame: data.tem_exame || false,
                tem_atestado: data.tem_atestado || false,
                tem_encaminhamento: data.tem_encaminhamento || false,
                tem_acompanhamento: data.tem_acompanhamento || false,
                tem_sinais_vitais: data.tem_sinais_vitais || false,
                // Poderíamos adicionar outros campos aqui se o renderizador precisar
                medico_nome: data.medico_nome || 'Médico' // Pode ser útil no futuro
            });
        });

        console.log("loadHistoricoConsultasFromFirestore: Dados processados:", consultasDoFirestore);

        // 4. Chama a função que desenha os cards com os dados do Firestore
        renderHistoricoConsultas(consultasDoFirestore); // Passa o array processado

    } catch (error) {
        console.error("Erro ao carregar histórico de consultas do Firestore:", error);
        listaContainer.innerHTML = '<p class="error-message" style="padding: 10px;">Ocorreu um erro ao carregar o histórico.</p>';
        if (totalConsultasEl) totalConsultasEl.textContent = 'Erro';
        // Verificar erros de permissão especificamente pode ser útil
         if (error.code === 'permission-denied') {
             console.error("Erro de permissão! Verifique as regras de segurança para a coleção 'consultas'.");
             listaContainer.innerHTML = '<p class="error-message" style="padding: 10px;">Erro de permissão ao carregar histórico.</p>';
         }
    }
}
// ==========================================================
// FIM DA NOVA FUNÇÃO
// ==========================================================
/**
 * COORDENADOR DE ABAS (Versão Completa)
 * Decide o que carregar quando clicas numa aba
 */
function loadDataForTab(tabId) {
    console.log(`Carregando dados para a aba: ${tabId}`);
    
    switch(tabId) {
        case 'receitas':
            loadReceitas();
            break;

        case 'exames':
            // Carrega a lista de exames
            if (typeof loadExames === 'function') loadExames();
            break;

        case 'encaminhamentos':
            // <--- ISTO ERA O QUE FALTAVA
            if (typeof loadEncaminhamentos === 'function') loadEncaminhamentos();
            break;

        case 'atestados':
            if (typeof loadAtestados === 'function') loadAtestados();
            break;

        case 'acompanhamentos':
            // Se tiveres esta função
            if (typeof loadAcompanhamentos === 'function') loadAcompanhamentos();
            break;

        case 'anamnese':
            loadAnamnese(); // <--- Chama a função nova
            break;

        case 'registros-diarios':
        console.log("Aba Registros selecionada. Desenhando gráficos reais...");
        // Garante que temos os dados e depois desenha
        loadHistoricoRegistrosCompleto().then(() => {
             renderHistoricoModal(); // <--- Esta chama a drawHistoricoChart NOVA
        });
        break;

        case 'vacinas':
            if (typeof loadVacinas === 'function') loadVacinas();
            break;
            
        default:
            console.log(`Nenhuma ação definida para a aba: ${tabId}`);
    }
}

// ==========================================================
// NOVA FUNÇÃO PARA CARREGAR NOTAS MÉDICAS DO FIRESTORE
// (Cole esta função no seu prontuario-paciente.js)
// ==========================================================
async function loadNotasMedicasFromFirestore() {
    console.log("loadNotasMedicasFromFirestore: Iniciando busca no Firestore...");

    const listaContainer = document.getElementById('registros-notas-medicas-lista');
    // const totalNotasEl = document.getElementById('total-notas'); // Se tiver contador

    if (!listaContainer) {
        console.error("loadNotasMedicasFromFirestore: Elemento '#registros-notas-medicas-lista' não encontrado. Abortando.");
        return;
    }

    // Limpa a lista atual e mostra estado de carregamento
    listaContainer.innerHTML = '<p style="padding: 10px; text-align: center;">Carregando notas...</p>';
    // if (totalNotasEl) totalNotasEl.textContent = 'Carregando...';

    // Verifica IDs essenciais
    if (!db || !currentPatientId) {
        console.error("loadNotasMedicasFromFirestore: Conexão com DB ou ID do Paciente ausente.");
        listaContainer.innerHTML = '<p class="error-message" style="padding: 10px; text-align: center;">Erro ao carregar notas: Informações ausentes.</p>';
        return;
    }

    try {
        // 1. Define a referência da subcoleção e a query
        const notasMedicasRef = collection(db, 'pacientes', currentPatientId, 'notasMedicas');
        // Busca apenas as notas criadas pelo médico logado E ordena
        const q = query(notasMedicasRef,
                      where("id_profissional", "==", currentUser.uid), // <<< Filtra pelas notas DESTE médico
                      orderBy("timestamp", "desc"));        // Ordena pela data (mais recentes primeiro)

        console.log(`loadNotasMedicasFromFirestore: Executando query para paciente ${currentPatientId} e médico ${currentUser.uid}`);

        // 2. Executa a query
        const querySnapshot = await getDocs(q);
        console.log(`loadNotasMedicasFromFirestore: Query retornou ${querySnapshot.size} notas médicas.`);

        // 3. Processa os resultados
        const notasDoFirestore = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Adiciona o ID do documento aos dados
            notasDoFirestore.push({
                id: doc.id,
                ...data
                // O timestamp já vem no formato correto do Firestore
            });
        });

        console.log("loadNotasMedicasFromFirestore: Dados processados:", notasDoFirestore);

        // 4. Chama a função que desenha os cards com os dados do Firestore
        renderNotasMedicas(notasDoFirestore); // Passa o array processado

        // Atualiza contador (se tiver)
        // if (totalNotasEl) totalNotasEl.textContent = `${notasDoFirestore.length} nota(s) registrada(s)`;

    } catch (error) {
        console.error("Erro ao carregar Notas Médicas do Firestore:", error);
        listaContainer.innerHTML = '<p class="error-message" style="padding: 10px; text-align: center;">Ocorreu um erro ao carregar as notas.</p>';
        // if (totalNotasEl) totalNotasEl.textContent = 'Erro';

         // Verifica especificamente o erro de índice composto
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
             console.error("Erro: A query requer um índice composto no Firestore. Verifique a mensagem de erro completa no console para o link de criação.");
             listaContainer.innerHTML = '<p class="error-message" style="padding: 10px; text-align: center;">Erro de configuração: Índice do banco de dados necessário. Contacte o suporte.</p>';
             // Mostra a URL do índice no console (se disponível)
             const match = error.message.match(/(https:\/\/[^\s]+)/);
             if (match) console.log("Link para criar índice:", match[0]);
        }
         // Verifica erros de permissão
         else if (error.code === 'permission-denied') {
             console.error("Erro de permissão! Verifique as regras de segurança para a subcoleção 'notasMedicas'.");
             listaContainer.innerHTML = '<p class="error-message" style="padding: 10px; text-align: center;">Erro de permissão ao carregar notas.</p>';
         }
    }
}
// ==========================================================
// FIM DA FUNÇÃO loadNotasMedicasFromFirestore
// ==========================================================





// ==========================================================
// NOVA FUNÇÃO PARA BUSCAR DADOS E ABRIR VISUALIZAÇÃO
// (Cole esta função no seu prontuario-paciente.js)
// ==========================================================
async function handleVisualizarConsulta(consultaId) {
    console.log(`handleVisualizarConsulta: Iniciando busca para consulta ID: ${consultaId}`);

    // Verifica se temos os IDs necessários
    if (!db || !currentPatientId || !consultaId) {
        alert("Erro: Não foi possível obter as informações necessárias para visualizar a consulta.");
        console.error("handleVisualizarConsulta: DB, currentPatientId ou consultaId está faltando.");
        return;
    }

    // Mostra feedback de carregamento
    loadingOverlay?.classList.remove('hidden');

    try {
        // --- 1. Buscar o Documento Principal da Consulta ---
        const consultaDocRef = doc(db, 'consultas', consultaId);
        const consultaDocSnap = await getDoc(consultaDocRef);

        if (!consultaDocSnap.exists()) {
            throw new Error(`Consulta com ID ${consultaId} não encontrada.`);
        }

        const consultaData = consultaDocSnap.data();
        console.log("handleVisualizarConsulta: Documento principal da consulta encontrado:", consultaData);

        // Objeto para agregar todos os dados
        const dadosCompletosConsulta = {
            consultaPrincipal: consultaData, // Guarda os dados principais (data, tipo, resumo, etc.)
            evolucao: null,
            receitas: [],
            pedidosExame: [],
            atestados: [],
            sinaisVitais: [],
            encaminhamentos: [],
            acompanhamentos: []
        };

        // --- 2. Buscar Documentos Associados (Usando os IDs) ---

        // Função auxiliar para buscar um único documento
        const fetchDocById = async (collectionPath, docId) => {
            if (!docId) return null;
            try {
                const docRef = doc(db, collectionPath, docId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return { id: docSnap.id, ...docSnap.data() };
                } else {
                    console.warn(`Documento não encontrado em ${collectionPath}/${docId}`);
                    return null;
                }
            } catch (error) {
                console.error(`Erro ao buscar documento em ${collectionPath}/${docId}:`, error);
                return null; // Retorna null em caso de erro para não quebrar tudo
            }
        };

        // Função auxiliar para buscar múltiplos documentos por IDs
        const fetchDocsByIds = async (basePath, ids) => {
            if (!ids || ids.length === 0) return [];
            const promises = ids.map(id => fetchDocById(basePath, id));
            const results = await Promise.all(promises);
            return results.filter(doc => doc !== null); // Remove nulos (documentos não encontrados ou erros)
        };

        // Buscar Evolução (se o ID existir)
        if (consultaData.evolucao_id) {
            console.log("Buscando Evolução ID:", consultaData.evolucao_id);
            // A evolução está em /pacientes/{patientId}/evolucao/{evolucaoId}
            const evolucaoPath = `pacientes/${currentPatientId}/evolucao`;
            dadosCompletosConsulta.evolucao = await fetchDocById(evolucaoPath, consultaData.evolucao_id);
        }

        // Buscar Receitas (se houver IDs)
        if (consultaData.receita_ids && consultaData.receita_ids.length > 0) {
            console.log("Buscando Receitas IDs:", consultaData.receita_ids);
             // Receitas estão em /pacientes/{patientId}/receitas/{receitaId}
            const receitasPath = `pacientes/${currentPatientId}/receitas`;
            dadosCompletosConsulta.receitas = await fetchDocsByIds(receitasPath, consultaData.receita_ids);
        }

        // Buscar Pedidos de Exame (se houver IDs)
        if (consultaData.pedido_exame_ids && consultaData.pedido_exame_ids.length > 0) {
             console.log("Buscando Pedidos de Exame IDs:", consultaData.pedido_exame_ids);
            // Pedidos de exame estão em /pedidos_exame/{exameId} (coleção raiz)
            const examesPath = `pedidos_exame`; // Caminho para a coleção raiz
            dadosCompletosConsulta.pedidosExame = await fetchDocsByIds(examesPath, consultaData.pedido_exame_ids);
        }

        // Buscar Atestados (se houver IDs)
         if (consultaData.atestado_ids && consultaData.atestado_ids.length > 0) {
             console.log("Buscando Atestados IDs:", consultaData.atestado_ids);
             // Atestados estão em /pacientes/{patientId}/atestados/{atestadoId}
            const atestadosPath = `pacientes/${currentPatientId}/atestados`;
            dadosCompletosConsulta.atestados = await fetchDocsByIds(atestadosPath, consultaData.atestado_ids);
        }

        // Buscar Sinais Vitais (se houver IDs)
         if (consultaData.sinais_vitais_ids && consultaData.sinais_vitais_ids.length > 0) {
             console.log("Buscando Sinais Vitais IDs:", consultaData.sinais_vitais_ids);
            // Sinais Vitais estão em /pacientes/{patientId}/sinaisVitais/{registroId}
            const sinaisPath = `pacientes/${currentPatientId}/sinaisVitais`;
            dadosCompletosConsulta.sinaisVitais = await fetchDocsByIds(sinaisPath, consultaData.sinais_vitais_ids);
         }

        // Buscar Encaminhamentos (se houver IDs)
        if (consultaData.encaminhamento_ids && consultaData.encaminhamento_ids.length > 0) {
             console.log("Buscando Encaminhamentos IDs:", consultaData.encaminhamento_ids);
             // Encaminhamentos estão em /encaminhamentos/{patientId}/registros/{encId}
             // ATENÇÃO: O caminho aqui é diferente! Ajustar se a estrutura mudou.
             // Assumindo que o ID salvo é o {encId} e a busca precisa do {patientId}
             const encaminhamentosPath = `encaminhamentos/${currentPatientId}/registros`; // Adapte se a estrutura for outra
             dadosCompletosConsulta.encaminhamentos = await fetchDocsByIds(encaminhamentosPath, consultaData.encaminhamento_ids);
        }

        // Buscar Acompanhamentos (se houver IDs)
        if (consultaData.acompanhamento_ids && consultaData.acompanhamento_ids.length > 0) {
             console.log("Buscando Acompanhamentos IDs:", consultaData.acompanhamento_ids);
             // Acompanhamentos estão em /acompanhamentos/{acompanhamentoId} (coleção raiz)
            const acompanhamentosPath = `acompanhamentos`;
            dadosCompletosConsulta.acompanhamentos = await fetchDocsByIds(acompanhamentosPath, consultaData.acompanhamento_ids);
        }

        console.log("handleVisualizarConsulta: Dados completos agregados:", dadosCompletosConsulta);

        // --- 3. Chamar a função que abre o modal de visualização ---
        // (Esta função ainda será criada)
        abrirModalVisualizacao(dadosCompletosConsulta);

    } catch (error) {
        console.error("Erro ao carregar dados da consulta para visualização:", error);
        alert("Ocorreu um erro ao carregar os detalhes da consulta. Verifique o console.");
    } finally {
        // Esconde o feedback de carregamento
        loadingOverlay?.classList.add('hidden');
    }
}
// ==========================================================
// FIM DA NOVA FUNÇÃO handleVisualizarConsulta
// ==========================================================

// ==========================================================
// NOVA FUNÇÃO PARA PREENCHER E ABRIR O MODAL DE VISUALIZAÇÃO
// (Cole esta função no seu prontuario-paciente.js)
// ==========================================================
function abrirModalVisualizacao(dadosCompletosConsulta) {
    console.log("abrirModalVisualizacao: Recebendo dados completos:", dadosCompletosConsulta);

    const modal = document.getElementById('visualizar-consulta-modal');
    if (!modal) {
        console.error("Erro fatal: Modal #visualizar-consulta-modal não encontrado no HTML!");
        alert("Erro ao tentar abrir a visualização da consulta.");
        return;
    }

    // --- 1. Resetar o Modal (Esconder seções, limpar listas) ---
    modal.querySelectorAll('.vis-section').forEach(section => section.classList.add('hidden'));
    modal.querySelectorAll('.vis-content-box').forEach(box => {
        const list = box.querySelector('ul, div[id$="-lista"]'); // Pega listas ou divs com ID terminando em -lista
        const placeholder = box.querySelector('.placeholder');
        if (list) list.innerHTML = ''; // Limpa conteúdo dinâmico anterior
        if (placeholder) placeholder.classList.remove('hidden'); // Mostra placeholder por padrão
    });
    // Limpa texto específico da evolução
    const evolucaoTextoEl = document.getElementById('vis-evolucao-texto');
    if (evolucaoTextoEl) evolucaoTextoEl.textContent = '';


    // --- 2. Preencher Cabeçalho ---
    const consultaPrincipal = dadosCompletosConsulta.consultaPrincipal;
    document.getElementById('vis-doctor-name').textContent = consultaPrincipal?.medico_nome || "Médico N/D";
    // Assumindo que os dados do médico logado estão em currentProfessionalData
    document.getElementById('vis-doctor-specialty').textContent = currentProfessionalData?.especialidade || "Especialidade N/D";
    document.getElementById('vis-doctor-crm').textContent = currentProfessionalData?.registro_profissional || "CRM N/D";
    // Dados do Paciente (do objeto global)
    document.getElementById('vis-patient-name').textContent = currentPatientData?.nome || "Paciente N/D";
    // Data e Tipo da Consulta
    let dataConsultaFormatada = 'Data N/D';
    if (consultaPrincipal?.data_consulta?.toDate) {
         try {
              dataConsultaFormatada = consultaPrincipal.data_consulta.toDate().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
         } catch(e) { console.error("Erro formatando data_consulta para visualização:", e); }
    }
    document.getElementById('vis-consulta-date').textContent = dataConsultaFormatada;
    document.getElementById('vis-consulta-tipo').textContent = consultaPrincipal?.tipo || 'N/D';


    // --- 3. Preencher Secção: Evolução Clínica ---
    if (dadosCompletosConsulta.evolucao && dadosCompletosConsulta.evolucao.texto) {
        if (evolucaoTextoEl) evolucaoTextoEl.textContent = dadosCompletosConsulta.evolucao.texto;
        document.getElementById('vis-section-evolucao')?.classList.remove('hidden');
    }

    // --- 4. Preencher Secção: Sinais Vitais ---
    const sinaisListaEl = document.getElementById('vis-sinaisvitais-lista');
    if (sinaisListaEl && dadosCompletosConsulta.sinaisVitais && dadosCompletosConsulta.sinaisVitais.length > 0) {
        sinaisListaEl.innerHTML = ''; // Limpa placeholder
        dadosCompletosConsulta.sinaisVitais.forEach(sv => {
            // Reutiliza a lógica de formatação (simplificada aqui)
            const pa = (sv.pressaoSistolica || sv.pressaoDiastolica) ? `${sv.pressaoSistolica || '--'}/${sv.pressaoDiastolica || '--'} mmHg` : 'N/R';
            const temp = sv.temperatura ? `${parseFloat(sv.temperatura).toFixed(1)} °C` : 'N/R';
            const fc = sv.freqCardiaca ? `${sv.freqCardiaca} bpm` : 'N/R';
            const spo2 = sv.saturacaoO2 ? `${sv.saturacaoO2} %` : 'N/R';
            // Adicione outros se necessário (Peso, Altura, Glicemia, FR)

             // Formata a data/hora do registro específico de SV
             let dataRegistroSV = 'Data N/D';
             if (sv.timestamp?.toDate) { // Usa o timestamp se existir
                 dataRegistroSV = sv.timestamp.toDate().toLocaleTimeString('pt-BR', { timeStyle: 'short' });
             } else if (sv.dataRegistro) { // Fallback para campo antigo
                 try { dataRegistroSV = new Date(sv.dataRegistro).toLocaleTimeString('pt-BR', {timeStyle: 'short'}); } catch(e){}
             }

            const svHtml = `
                <div class="sv-item-vis">
                     <small>${dataRegistroSV}</small> 
                     <span>PA: <strong>${pa}</strong></span>
                     <span>Temp: <strong>${temp}</strong></span>
                     <span>FC: <strong>${fc}</strong></span>
                     <span>SpO₂: <strong>${spo2}</strong></span>
                     
                </div>`;
            sinaisListaEl.insertAdjacentHTML('beforeend', svHtml);
        });
        document.getElementById('vis-section-sinaisvitais')?.classList.remove('hidden');
    }

    // --- 5. Preencher Secção: Receitas ---
    const receitasListaEl = document.getElementById('vis-receitas-lista');
    if (receitasListaEl && dadosCompletosConsulta.receitas && dadosCompletosConsulta.receitas.length > 0) {
        receitasListaEl.innerHTML = ''; // Limpa placeholder
        dadosCompletosConsulta.receitas.forEach(rec => {
            let medsHtml = '<p><i>Medicamentos não detalhados.</i></p>';
            if (rec.medicamentos && rec.medicamentos.length > 0) {
                medsHtml = rec.medicamentos.map(med => `
                    <li>
                        <strong>${med.nome || 'Medicamento'}</strong><br/>
                        <small>${med.dosagem || ''} | ${med.frequencia || ''} | ${med.duracao || ''}</small>
                    </li>
                `).join('');
                medsHtml = `<ul style="list-style-position: inside; padding-left: 0; margin-top: 5px;">${medsHtml}</ul>`;
            }
            const obs = rec.observacoesGerais ? `<p style="margin-top: 8px;"><small><strong>Obs:</strong> ${rec.observacoesGerais}</small></p>` : '';
            const receitaHtml = `<div class="vis-item-box">${medsHtml}${obs}</div>`;
            receitasListaEl.insertAdjacentHTML('beforeend', receitaHtml);
        });
        document.getElementById('vis-section-receitas')?.classList.remove('hidden');
    }

    // --- 6. Preencher Secção: Pedidos de Exame ---
    const examesListaEl = document.getElementById('vis-exames-lista');
    if (examesListaEl && dadosCompletosConsulta.pedidosExame && dadosCompletosConsulta.pedidosExame.length > 0) {
        examesListaEl.innerHTML = '';
        dadosCompletosConsulta.pedidosExame.forEach(ex => {
             let tiposHtml = '<p><i>Exames não detalhados.</i></p>';
             if (ex.tiposExame && ex.tiposExame.length > 0) {
                 tiposHtml = ex.tiposExame.map(tipo => `<li>${tipo}</li>`).join('');
                 tiposHtml = `<ul style="list-style-position: inside; padding-left: 0; margin-top: 5px;">${tiposHtml}</ul>`;
             }
             const motivo = ex.motivo ? `<p style="margin-top: 8px;"><small><strong>Motivo:</strong> ${ex.motivo}</small></p>` : '';
             const jejum = ex.jejumNecessario ? `<p style="margin-top: 5px;"><small><strong>Jejum:</strong> Sim</small></p>` : '';
             const exameHtml = `<div class="vis-item-box">${tiposHtml}${motivo}${jejum}</div>`;
             examesListaEl.insertAdjacentHTML('beforeend', exameHtml);
        });
        document.getElementById('vis-section-exames')?.classList.remove('hidden');
    }

    // --- 7. Preencher Secção: Atestados ---
    const atestadosListaEl = document.getElementById('vis-atestados-lista');
    if (atestadosListaEl && dadosCompletosConsulta.atestados && dadosCompletosConsulta.atestados.length > 0) {
        atestadosListaEl.innerHTML = '';
        dadosCompletosConsulta.atestados.forEach(at => {
             const dataInicioFmt = at.dataInicio ? new Date(at.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A';
             const atestadoHtml = `
                 <div class="vis-item-box">
                     <p><strong>Tipo:</strong> ${at.tipo || 'N/A'} - ${at.diasAfastamento || 'N/A'} dia(s)</p>
                     <p><small><strong>Início:</strong> ${dataInicioFmt} | <strong>CID:</strong> ${at.cid || 'N/A'}</small></p>
                     <p><small><strong>Motivo:</strong> ${at.motivo || 'N/A'}</small></p>
                     ${at.observacoes ? `<p style="margin-top: 5px;"><small><strong>Obs:</strong> ${at.observacoes}</small></p>` : ''}
                 </div>`;
             atestadosListaEl.insertAdjacentHTML('beforeend', atestadoHtml);
        });
        document.getElementById('vis-section-atestados')?.classList.remove('hidden');
    }

    // --- 8. Preencher Secção: Encaminhamentos ---
    const encaminhamentosListaEl = document.getElementById('vis-encaminhamentos-lista');
     if (encaminhamentosListaEl && dadosCompletosConsulta.encaminhamentos && dadosCompletosConsulta.encaminhamentos.length > 0) {
         encaminhamentosListaEl.innerHTML = '';
         dadosCompletosConsulta.encaminhamentos.forEach(enc => {
             const dataFmt = enc.timestamp?.toDate ? enc.timestamp.toDate().toLocaleDateString('pt-BR') : (enc.data ? new Date(enc.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A');
             const encHtml = `
                 <div class="vis-item-box">
                      <p><strong>Para:</strong> ${enc.especialidade || 'N/A'}</p>
                      <p><small><strong>Data:</strong> ${dataFmt}</small></p>
                      <p><small><strong>Motivo:</strong> ${enc.motivo || 'N/A'}</small></p>
                      ${enc.recomendacoes ? `<p style="margin-top: 5px;"><small><strong>Recomendações:</strong> ${enc.recomendacoes}</small></p>` : ''}
                 </div>`;
             encaminhamentosListaEl.insertAdjacentHTML('beforeend', encHtml);
         });
         document.getElementById('vis-section-encaminhamentos')?.classList.remove('hidden');
     }

    // --- 9. Preencher Secção: Acompanhamentos ---
     const acompanhamentosListaEl = document.getElementById('vis-acompanhamentos-lista');
     if (acompanhamentosListaEl && dadosCompletosConsulta.acompanhamentos && dadosCompletosConsulta.acompanhamentos.length > 0) {
         acompanhamentosListaEl.innerHTML = '';
         dadosCompletosConsulta.acompanhamentos.forEach(acomp => {
             let metasHtml = '<li>Nenhuma meta definida</li>';
             if (acomp.metas && acomp.metas.length > 0) {
                 // Tenta usar a função formatarMeta se ela existir globalmente
                 metasHtml = acomp.metas.map(meta => `<li>${typeof formatarMeta === 'function' ? formatarMeta(meta) : meta}</li>`).join('');
             }
             const duracao = acomp.duracao_dias > 0 ? `${acomp.duracao_dias} dias` : 'Contínuo';
             const acompHtml = `
                 <div class="vis-item-box">
                     <p><strong>Duração:</strong> ${duracao}</p>
                     <p><small><strong>Metas:</strong></small></p>
                     <ul style="list-style-position: inside; padding-left: 0; margin-top: 0; font-size: 0.85rem;">${metasHtml}</ul>
                     <p><small><strong>Lembretes:</strong> ${acomp.notificacoes_ativas ? 'Sim' : 'Não'}</small></p>
                 </div>`;
             acompanhamentosListaEl.insertAdjacentHTML('beforeend', acompHtml);
         });
         document.getElementById('vis-section-acompanhamentos')?.classList.remove('hidden');
     }

   

    // --- 11. Adicionar Listeners de Fechar (se ainda não foram adicionados) ---
    // É melhor adicionar fora desta função, talvez em addEventListeners, para evitar duplicação.
    // Mas podemos adicionar aqui por simplicidade por enquanto:
    const closeModalHandler = () => closeModal(modal);
    modal.querySelector('#close-visualizar-modal')?.addEventListener('click', closeModalHandler, { once: true }); // {once: true} remove o listener após o 1º clique
    modal.querySelector('#fechar-visualizar-modal-footer')?.addEventListener('click', closeModalHandler, { once: true });
    // Adicionar listener para fechar clicando fora (se a função closeModal já não fizer isso)
    // modal.addEventListener('click', (e) => { if (e.target === modal) closeModalHandler(); }, { once: true }); // Cuidado com {once: true} aqui

    // --- 12. Abrir o Modal ---
    openModal(modal);
    console.log("abrirModalVisualizacao: Modal preenchido e aberto.");
}
// ==========================================================
// FIM DA NOVA FUNÇÃO abrirModalVisualizacao
// ==========================================================



    // --- FUNÇÃO PARA RENDERIZAR UM CARD DE SINAIS VITAIS NA ABA DADOS CLÍNICOS ---
// INÍCIO DO CÓDIGO PARA COLAR (Função renderSinaisVitaisNoPainelClinico COMPLETA e CORRIGIDA)
// --- FUNÇÃO PARA RENDERIZAR UM CARD DE SINAIS VITAIS NA ABA DADOS CLÍNICOS ---
const renderSinaisVitaisNoPainelClinico = (sinaisData, registroId) => {
    const container = document.getElementById('dados-clinicos-sinais-vitais-lista');
    const emptyState = document.getElementById('empty-state-sinais-vitais'); // Mantém referência ao estado vazio original
    if (!container) {
        console.error("renderSinaisVitaisNoPainelClinico: Container '#dados-clinicos-sinais-vitais-lista' não encontrado.");
        return; // Interrompe se o container sumiu
    }

    // Remove o estado de vazio se ele estiver presente no container
    const currentEmptyState = container.querySelector('#empty-state-sinais-vitais, .empty-state-mini');
    if (currentEmptyState) {
        currentEmptyState.remove();
        console.log("renderSinaisVitaisNoPainelClinico: Estado vazio removido.");
    }

    // --- Início das Correções de Formatação ---
    // Valor padrão para exibição caso o dado esteja ausente ou inválido
    const valorPadrao = 'N/R'; // (Não Registrado)

    // Pressão Arterial (mantém lógica original, pois não usa toFixed)
    const paFormatada = (sinaisData.pressaoSistolica || sinaisData.pressaoDiastolica)
        ? `${sinaisData.pressaoSistolica || '--'}/${sinaisData.pressaoDiastolica || '--'} mmHg`
        : valorPadrao;

    // Glicemia (mantém lógica original)
    const glicemiaFormatada = sinaisData.glicemia ? `${sinaisData.glicemia} mg/dL` : valorPadrao;

    // Peso (CORRIGIDO com parseFloat e validação)
    let pesoFormatado = valorPadrao;
    if (sinaisData.peso !== null && sinaisData.peso !== undefined && sinaisData.peso !== '' && !isNaN(parseFloat(sinaisData.peso))) {
        try {
            pesoFormatado = `${parseFloat(sinaisData.peso).toFixed(1)} kg`; // Converte e formata
        } catch (e) { console.error(`Erro ao formatar peso (${sinaisData.peso}):`, e); }
    }

    // Altura (CORRIGIDO com parseFloat e validação)
    let alturaFormatada = valorPadrao;
    if (sinaisData.altura !== null && sinaisData.altura !== undefined && sinaisData.altura !== '' && !isNaN(parseFloat(sinaisData.altura))) {
         try {
            alturaFormatada = `${parseFloat(sinaisData.altura).toFixed(2)} m`; // Converte e formata
         } catch (e) { console.error(`Erro ao formatar altura (${sinaisData.altura}):`, e); }
    }

    // Temperatura (CORRIGIDO com parseFloat e validação)
    let tempFormatada = valorPadrao;
    if (sinaisData.temperatura !== null && sinaisData.temperatura !== undefined && sinaisData.temperatura !== '' && !isNaN(parseFloat(sinaisData.temperatura))) {
         try {
            tempFormatada = `${parseFloat(sinaisData.temperatura).toFixed(1)} °C`; // Converte e formata
         } catch (e) { console.error(`Erro ao formatar temperatura (${sinaisData.temperatura}):`, e); }
    }

    // Frequência Cardíaca (mantém lógica original)
    const fcFormatada = sinaisData.freqCardiaca ? `${sinaisData.freqCardiaca} bpm` : valorPadrao;

    // Frequência Respiratória (mantém lógica original)
    const frFormatada = sinaisData.freqRespiratoria ? `${sinaisData.freqRespiratoria} rpm` : valorPadrao;

    // Saturação O2 (mantém lógica original)
    const spo2Formatada = sinaisData.saturacaoO2 ? `${sinaisData.saturacaoO2} %` : valorPadrao;

    // Data/Hora do Registro (Tratamento robusto)
    let dataRegistro = 'Data N/D';
    const dataRegistroRaw = sinaisData.dataRegistro; // Pega o campo do Firestore
    if (dataRegistroRaw) {
         try {
             let dateObject;
             // Verifica se é um Timestamp do Firestore
             if (typeof dataRegistroRaw.toDate === 'function') {
                 dateObject = dataRegistroRaw.toDate();
             }
             // Verifica se é uma string ISO válida
             else if (typeof dataRegistroRaw === 'string' && !isNaN(Date.parse(dataRegistroRaw))) {
                 dateObject = new Date(dataRegistroRaw);
             }

             // Se conseguimos um objeto Date válido, formata
             if (dateObject instanceof Date && !isNaN(dateObject)) {
                  dataRegistro = dateObject.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
             } else {
                  console.warn(`Formato de dataRegistro inválido para registro ${registroId}:`, dataRegistroRaw);
             }
         } catch (dateError) {
              console.error(`Erro ao processar dataRegistro (${dataRegistroRaw}) para registro ${registroId}:`, dateError);
         }
    }
    // --- Fim das Correções de Formatação ---


    // Cria o HTML do Card (Usa as variáveis formatadas e corrigidas)
    const cardHTML = `
        <div class="sinais-vitais-card" data-registro-id="${registroId}">
            <div class="sv-card-header">
                <i class="fa-solid fa-heart-pulse"></i>
                <strong>Sinais Vitais</strong>
                <span class="sv-card-time">${dataRegistro}</span>
            </div>
            <div class="sv-card-grid">
                <span>PA: <strong>${paFormatada}</strong></span>
                <span>Glic: <strong>${glicemiaFormatada}</strong></span>
                <span>Peso: <strong>${pesoFormatado}</strong></span>
                <span>Alt: <strong>${alturaFormatada}</strong></span>
                <span>Temp: <strong>${tempFormatada}</strong></span>
                <span>FC: <strong>${fcFormatada}</strong></span>
                <span>FR: <strong>${frFormatada}</strong></span>
                <span>SpO₂: <strong>${spo2Formatada}</strong></span>
            </div>
            <div class="sv-card-footer">
                 <button type="button" class="btn-edit-sv mini-btn" aria-label="Editar registro"><i class="fa-solid fa-pencil"></i></button>
                 <button type="button" class="btn-delete-sv mini-btn" aria-label="Excluir registro"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
    `;
    
    // Adiciona o card ao início do container
    try {
        container.insertAdjacentHTML('afterbegin', cardHTML); // 'afterbegin' para adicionar no topo (mais recentes primeiro)
    } catch(insertError){
         console.error(`Erro ao inserir HTML do card ${registroId} no container:`, insertError, cardHTML);
    }
};
// FIM DO CÓDIGO PARA COLAR (renderSinaisVitaisNoPainelClinico COMPLETA e CORRIGIDA)

// --- FUNÇÃO PARA CARREGAR E RENDERIZAR SINAIS VITAIS DA CONSULTA ATUAL (do Firestore) ---
// SUBSTITUA a função loadAndRenderSinaisVitais por esta versão com LOGS:
const loadAndRenderSinaisVitais = async () => {
    const container = document.getElementById('dados-clinicos-sinais-vitais-lista');
    const emptyState = document.getElementById('empty-state-sinais-vitais');

    // Log 1: Verifica IDs e existência do container
    console.log(`loadAndRenderSinaisVitais: Iniciando... currentUser=${currentUser?.uid}, currentPatientId=${currentPatientId}`);
    if (!container) {
        console.error("loadAndRenderSinaisVitais: ERRO CRÍTICO - Container '#dados-clinicos-sinais-vitais-lista' não encontrado.");
        return; // Interrompe se o container não existe
    }
    if(!currentUser || !currentPatientId){
         console.error("loadAndRenderSinaisVitais: ERRO - Usuário ou ID do Paciente não definido.");
         container.innerHTML = '<p class="error-message">Erro: Informações do paciente ausentes.</p>';
         return;
    }

    console.log(`loadAndRenderSinaisVitais: Limpando container e buscando dados para paciente ${currentPatientId}...`);
    container.innerHTML = '<p>Carregando registros...</p>'; // Mensagem de carregamento

    try {
        // Define a referência da subcoleção
        const sinaisVitaisCollectionRef = collection(db, 'pacientes', currentPatientId, 'sinaisVitais');

        // Log 2: Antes de buscar no Firestore
        console.log("loadAndRenderSinaisVitais: Executando getDocs na referência:", sinaisVitaisCollectionRef.path);

        // Busca os documentos na subcoleção
        const querySnapshot = await getDocs(sinaisVitaisCollectionRef);

        // Log 3: Após buscar no Firestore
        console.log(`loadAndRenderSinaisVitais: getDocs concluído. querySnapshot.empty = ${querySnapshot.empty}, querySnapshot.size = ${querySnapshot.size}`);

        // Limpa o container DEPOIS da busca, antes de renderizar
         container.innerHTML = '';
         console.log("loadAndRenderSinaisVitais: Container limpo (innerHTML = '')."); // Log para confirmar


        if (querySnapshot.empty) {
            console.log("loadAndRenderSinaisVitais: Nenhum registro encontrado. Exibindo estado vazio.");
            if (emptyState) {
                // Clona o nó do estado vazio para evitar problemas se ele for removido/readicionado
                const clonedEmptyState = emptyState.cloneNode(true);
                clonedEmptyState.classList.remove('hidden'); // Garante visibilidade
                container.appendChild(clonedEmptyState);
            } else {
                container.innerHTML = '<div class="empty-state-mini" style="text-align: left; padding: 10px 0;"><i class="fa-solid fa-heart-pulse"></i><p>Nenhum sinal vital registrado.</p></div>'; // Fallback
            }
            return; // Sai da função
        }

        // Verifica se a função de renderização existe
        if (typeof renderSinaisVitaisNoPainelClinico !== 'function') {
             console.error("loadAndRenderSinaisVitais: ERRO - Função 'renderSinaisVitaisNoPainelClinico' não está definida!");
             throw new Error("Função de renderização não encontrada."); // Joga erro para o catch
        }

        // Itera sobre os documentos encontrados
        let renderCount = 0;
        querySnapshot.forEach((docSnap) => {
            const sinaisData = docSnap.data();
            const docId = docSnap.id;
            // Log 4: Para cada documento encontrado
            console.log(`loadAndRenderSinaisVitais: Processando documento ID: ${docId}, Dados:`, sinaisData);

             // Tentativa de renderizar
             try {
                 renderSinaisVitaisNoPainelClinico(sinaisData, docId); // Chama a função que desenha
                 renderCount++;
             } catch (renderError) {
                  console.error(`loadAndRenderSinaisVitais: Erro ao chamar renderSinaisVitaisNoPainelClinico para doc ${docId}:`, renderError);
                  // Adiciona uma mensagem de erro visual para este item específico
                  container.insertAdjacentHTML('beforeend', `<p class="error-message">Erro ao renderizar registro ${docId}.</p>`);
             }
        });
         console.log(`loadAndRenderSinaisVitais: Renderização concluída para ${renderCount} registros.`);


    } catch (error) {
        // Log 5: Se ocorrer QUALQUER erro no bloco try (incluindo permissão ou erro na renderização)
        console.error("loadAndRenderSinaisVitais: ERRO no bloco try/catch:", error);
        // Verifica se é erro de permissão especificamente
        if (error.code === 'permission-denied') {
             container.innerHTML = '<p class="error-message" style="text-align: left;">Erro de permissão ao ler Sinais Vitais. Verifique as Regras de Segurança do Firestore.</p>';
        } else {
             container.innerHTML = '<p class="error-message" style="text-align: left;">Ocorreu um erro inesperado ao carregar os registros de Sinais Vitais.</p>';
        }
    }
};
// FIM DA FUNÇÃO SUBSTITUÍDA

// --- FUNÇÃO PARA RENDERIZAR SINAIS VITAIS (DA SESSÃO) NA SUB-ABA "DADOS DA CONSULTA" ---
const renderSinaisVitaisDaSessao = () => {
    const container = document.getElementById('dados-clinicos-sinais-vitais-lista');
    const emptyState = document.getElementById('empty-state-sinais-vitais');
    if (!container) return;

    container.innerHTML = '';
    const registros = sinaisVitaisDaSessaoAtual; // Lê do array da sessão

    if (!registros || registros.length === 0) {
        const clonedEmptyState = emptyState ? emptyState.cloneNode(true) : null;
        if (clonedEmptyState) {
            clonedEmptyState.classList.remove('hidden');
            container.appendChild(clonedEmptyState);
        } else {
            container.innerHTML = '<div class="empty-state-mini" ...><p>Nenhum sinal vital registrado nesta consulta ainda.</p></div>';
        }
        return;
    }

    console.log(`Renderizando ${registros.length} Sinais Vitais DA SESSÃO.`);
    // Ordena pela data (mais recentes primeiro)
    registros.sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));

    registros.forEach(registro => {
        // Chama a função que já sabe desenhar o card
        renderSinaisVitaisNoPainelClinico(registro, registro.id);
    });
};
// FIM DA NOVA FUNÇÃO



// --- FUNÇÃO PARA PREPARAR A EDIÇÃO DE UM REGISTRO DE SINAIS VITAIS ---
const handleEditSinaisVitais = async (registroId) => {
    if (!registroId || !currentPatientId || !db) {
        console.error("ERRO: ID do registro, ID do paciente ou conexão DB ausente para edição.");
        alert("Não foi possível carregar os dados para edição.");
        return;
    }

    console.log(`Iniciando edição para Sinais Vitais ID: ${registroId}`);
    // Mostra loading se aplicável
    // loadingOverlay?.classList.remove('hidden');

    try {
        // 1. Busca os dados do documento específico no Firestore
        const docRef = doc(db, 'pacientes', currentPatientId, 'sinaisVitais', registroId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error("Registro não encontrado no Firestore.");
        }

        const data = docSnap.data();
        console.log("Dados carregados para edição:", data);

        // 2. Preenche o formulário na aba "Sinais Vitais"
        document.getElementById('sv-glicemia').value = data.glicemia ?? '';
        document.getElementById('sv-peso').value = data.peso ?? '';
        document.getElementById('sv-pressao-sistolica').value = data.pressaoSistolica ?? '';
        document.getElementById('sv-pressao-diastolica').value = data.pressaoDiastolica ?? '';
        document.getElementById('sv-temperatura').value = data.temperatura ?? '';
        document.getElementById('sv-freq-cardiaca').value = data.freqCardiaca ?? '';
        document.getElementById('sv-freq-respiratoria').value = data.freqRespiratoria ?? '';
        document.getElementById('sv-saturacao-o2').value = data.saturacaoO2 ?? '';
        document.getElementById('sv-altura').value = data.altura ?? '';

        // 3. Armazena o ID no campo oculto
        // --- LINHA CRUCIAL ---
        // 3. Armazena o ID no campo oculto
        const editIdField = document.getElementById('sv-edit-registro-id');
        if(editIdField) {
             editIdField.value = registroId; // <<< VERIFIQUE SE ESTA LINHA EXISTE E ESTÁ CORRETA
             console.log(`Campo oculto sv-edit-registro-id preenchido com: ${registroId}`); // Log
        } else {
             console.error("Campo oculto #sv-edit-registro-id NÃO encontrado no HTML!");
        }
        // --- FIM DA LINHA CRUCIAL ---
        

        // 4. Muda o texto do botão para "Atualizar"
        const submitBtn = document.getElementById('salvar-sinais-vitais-btn');
        if (submitBtn) {
             // submitBtn.textContent = 'Atualizar Sinais Vitais'; // Altera só o texto
             submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> Atualizar Sinais Vitais'; // Altera HTML com ícone
             console.log("Texto do botão alterado para 'Atualizar Sinais Vitais'"); // Log
        } else {
             console.error("Botão #salvar-sinais-vitais-btn NÃO encontrado para alterar texto!");
        }

         // 5. Muda para a aba "Sinais Vitais"
         switchConsultaSubTab('sinais-vitais');
        console.log("Mudou para a sub-aba 'sinais-vitais'"); // Log

         // Opcional: Rola a aba para o topo para garantir visibilidade do form
         const tabPanel = document.getElementById('subtab-consulta-sinais-vitais');
         if(tabPanel) tabPanel.scrollTop = 0;


    } catch (error) {
        console.error("Erro ao carregar dados para edição de Sinais Vitais:", error);
        alert("Ocorreu um erro ao carregar os dados para edição.");
    } finally {
        // Esconde loading se aplicável
        // loadingOverlay?.classList.add('hidden');
    }
};



    // === INÍCIO DO BLOCO PARA COPIAR E SUBSTITUIR ===

// ==========================================================
// SUBSTITUA SUA FUNÇÃO handleActionClick INTEIRA POR ESTA:
// (Inclui 'pre-consulta' e ajusta 'abrir-painel-clinico')
// ==========================================================
const handleActionClick = (action) => {
    // Objeto que mapeia a ação (data-action) para a função a ser executada
    const actions = {
        'nova-receita': () => {
            console.log("Ação 'nova-receita' disparada.");
            formAddMedicamento?.reset();
            formReceitaFinal?.reset();
            medicamentosDaReceitaAtual = [];
            renderMedicamentosNoModal();
            receitaErrorMessage?.classList.add('hidden');
            if (formReceitaModal) formReceitaModal.querySelector('.modal-title').innerHTML = '<i class="fa-solid fa-prescription-bottle-medical"></i> Criar Nova Receita';
            if (formReceitaFinal) formReceitaFinal.querySelector('button[type="submit"]').textContent = 'Salvar Receita Completa';
            if (receitaSignatureNameModal && currentProfessionalData) {
                receitaSignatureNameModal.textContent = currentProfessionalData.nome || "Profissional";
            }
            openModal(formReceitaModal);
        },
        'encaminhar': () => {
            console.log("Ação 'encaminhar' disparada.");
            openModal(encaminharModal); // Abre o modal de decisão (Receita/Exame/Encaminhamento)
        },

        // --- AÇÃO 'pre-consulta' (Substitui 'relatorio') ---
        'pre-consulta': () => {
             console.log("Ação 'pre-consulta' disparada.");
             const preConsultaSection = document.getElementById('pre-consulta-section');
             const painelClinicoTab = document.getElementById('tab-painel-clinico'); // Pega o painel clínico

             if (preConsultaSection) {
                 // Toggle: mostra/esconde a secção pré-consulta
                 preConsultaSection.classList.toggle('hidden');
                 console.log(`Secção Pré-consulta agora está ${preConsultaSection.classList.contains('hidden') ? 'escondida' : 'visível'}.`);

                 // Se a secção pré-consulta foi ABERTA
                 if (!preConsultaSection.classList.contains('hidden')) {
                      // Esconde o Painel Clínico (se estiver visível)
                      if (painelClinicoTab && !painelClinicoTab.classList.contains('hidden')) {
                          painelClinicoTab.classList.add('hidden');
                          // Desativa o botão da aba Painel Clínico (se existir na nav principal)
                          document.querySelector('.tab-btn[data-tab="painel-clinico"]')?.classList.remove('active');
                          // Desativa também o botão no menu mobile
                           document.querySelector('.mobile-nav-link[data-tab="painel-clinico"]')?.classList.remove('active');
                      }
                      // Ativa a primeira aba da pré-consulta (ex: Receitas)
                      if (typeof switchTab === 'function') {
                          switchTab('receitas'); // Tenta ativar a aba Receitas (ajuste se necessário)
                      }
                 }
                 // Se a secção pré-consulta foi FECHADA, garante que o Painel Clínico abra (Opcional, mas recomendado)
                 else {
                      if (typeof switchTab === 'function') {
                           switchTab('painel-clinico'); // Garante que o painel clínico reapareça ao fechar pré-consulta
                      }
                 }

             } else {
                 console.error("Elemento #pre-consulta-section não encontrado!");
             }
             // Fecha menu mobile se aberto
             if (typeof closeMobileMenu === 'function') { closeMobileMenu(); }
        },
        // --- FIM DA AÇÃO 'pre-consulta' ---

        'acompanhar': () => {
            console.log("Ação 'acompanhar' disparada.");
            alert('Funcionalidade "Oferecer Acompanhamento" em desenvolvimento.');
        },
        'confirmar': () => {
            console.log("Ação 'confirmar' disparada.");
            alert('Funcionalidade "Confirmar Atendimento" em desenvolvimento.');
        },

        // --- AÇÃO 'abrir-painel-clinico' AJUSTADA ---
        'abrir-painel-clinico': () => {
            console.log("Ação 'abrir-painel-clinico' disparada.");
            // Garante que a secção pré-consulta seja escondida
            const preConsultaSection = document.getElementById('pre-consulta-section');
            if (preConsultaSection) {
                preConsultaSection.classList.add('hidden'); // <<< Garante que fecha a pré-consulta
                 // Opcional: Resetar o botão pré-consulta para o estado inicial (se ele muda de texto)
                 // const btnPreConsulta = document.querySelector('button[data-action="pre-consulta"]');
                 // if (btnPreConsulta) btnPreConsulta.innerHTML = '<i class="fa-solid fa-folder-open"></i> Pré-consulta';
            }
            // Muda para a aba Painel Clínico (sua lógica original)
            if (typeof switchTab === 'function') {
                switchTab('painel-clinico');
            }
             // Fecha menu mobile se aberto
            if (typeof closeMobileMenu === 'function') { closeMobileMenu(); }
        }
        // --- FIM DA AÇÃO 'abrir-painel-clinico' ---
    };

    // Executa a ação correspondente, se existir
    if (actions[action]) {
        actions[action]();
    } else {
        console.warn(`Ação desconhecida: ${action}`);
    }
};
// ==========================================================
// FIM DA SUBSTITUIÇÃO DA FUNÇÃO handleActionClick
// ==========================================================

// === FIM DO BLOCO PARA COPIAR E SUBSTITUIR ===

//GRAFICOS AQUIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII

    
    
    // --- Funções de Receita ---
    const renderRecipes = (recipesToRender) => {
        if (!recipeListContainer) return;
        recipeListContainer.innerHTML = '';
        if (!recipesToRender || recipesToRender.length === 0) {
             recipeListContainer.innerHTML = '<div class="empty-state"><i class="fa-solid fa-file-prescription"></i><p>Nenhuma receita encontrada.</p></div>';
            return;
        }

        recipesToRender.forEach(recipe => {
            let tituloMedicamento = "Receita";
            let detalhesMedicamento = "";

            if (recipe.medicamentos && recipe.medicamentos.length > 0) {
                tituloMedicamento = recipe.medicamentos[0].nome;
                if (recipe.medicamentos.length > 1) {
                    tituloMedicamento += ` + ${recipe.medicamentos.length - 1} outro(s)`;
                }
                detalhesMedicamento = `
                    <span><i class="fa-solid fa-pills"></i>Dosagem: <strong>${recipe.medicamentos[0].dosagem}</strong></span>
                    <span><i class="fa-solid fa-clock"></i>Frequência: <strong>${recipe.medicamentos[0].frequencia}</strong></span>
                    <span><i class="fa-solid fa-calendar-days"></i>Duração: <strong>${recipe.medicamentos[0].duracao}</strong></span>
                `;
            } else if (recipe.medicamento) {
                tituloMedicamento = recipe.medicamento;
                detalhesMedicamento = `
                    <span><i class="fa-solid fa-pills"></i>Dosagem: <strong>${recipe.dosagem}</strong></span>
                    <span><i class="fa-solid fa-clock"></i>Frequência: <strong>${recipe.frequencia}</strong></span>
                    <span><i class="fa-solid fa-calendar-days"></i>Duração: <strong>${recipe.duracao}</strong></span>
                `;
            }

            const statusClass = `status-${recipe.status.toLowerCase()}`;
            let deleteButtonHtml = '';
            const canDelete = currentUser && currentUser.uid === recipe.id_profissional;

            if (canDelete) { 
                deleteButtonHtml = `<button class="btn-delete" data-recipe-id="${recipe.id}" aria-label="Apagar Receita"><i class="fa-solid fa-trash"></i></button>`;
            }

            const cardHTML = `
                <div class="recipe-card">
                    <div class="recipe-header"><h3>${tituloMedicamento}</h3><span class="badge ${statusClass}">${recipe.status}</span></div>
                    <p class="recipe-doctor">Prescrição de ${recipe.medico}</p>
                    <div class="recipe-details">
                        ${detalhesMedicamento}
                    </div>
                    <div class="recipe-footer">
                        <small>Emitida em ${recipe.emissao}</small>
                        <div class="card-footer-actions">
                            <a href="#" class="pdf-link" data-recipe-id="${recipe.id}"><i class="fa-solid fa-file-pdf"></i> PDF</a>
                            ${deleteButtonHtml} 
                        </div>
                    </div>
                </div>`;
            recipeListContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    };

    const applyRecipeFilters = () => {
        if (!recipeSearchInput || !recipeFilterGroup) return;
        const searchTerm = recipeSearchInput.value.toLowerCase();
        const activeFilterBtn = recipeFilterGroup.querySelector('.filter-btn-small.active');
        const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'todas';
        let filteredRecipes = allRecipes.filter(recipe => 
            (recipe.medicamento && recipe.medicamento.toLowerCase().includes(searchTerm)) || 
            (recipe.medicamentos && recipe.medicamentos.some(m => m.nome.toLowerCase().includes(searchTerm))) || 
            (recipe.medico && recipe.medico.toLowerCase().includes(searchTerm))
        );
        if (activeFilter !== 'todas') {
            filteredRecipes = filteredRecipes.filter(recipe => recipe.status.toLowerCase() === activeFilter);
        }
        renderRecipes(filteredRecipes);
    };

    const loadInitialMockRecipes = () => {
         const medicoLogadoId = currentUser ? currentUser.uid : 'id_desconhecido';
         allRecipes = [
            { id: 1, medicamento: 'Metformina 850mg', medico: 'Dr. João Silva', id_profissional: 'outro-medico-id-1', status: 'Ativa', dosagem: '1 comprimido', frequencia: '2x ao dia', duracao: 'Uso contínuo', emissao: '19/09/2024' },
            { id: 2, medicamento: 'Losartana 50mg', medico: 'Dr. João Silva', id_profissional: 'outro-medico-id-1', status: 'Ativa', dosagem: '1 comprimido', frequencia: '1x ao dia', duracao: 'Uso contínuo', emissao: '19/09/2024' },
            { id: 3, medicamento: 'Atenolol 25mg', medico: 'Dr. Carlos Andrade', id_profissional: 'outro-medico-id-2', status: 'Arquivada', dosagem: '1 comprimido', frequencia: '1x ao dia', duracao: '30 dias', emissao: '10/05/2024' }
        ];
    };

    const loadRecipeData = async () => {
    // Esta função agora é assíncrona e lê do Firestore
    if (!currentPatientId) {
         console.log("loadRecipeData: ID do paciente ainda não disponível.");
         allRecipes = []; // Garante que esteja vazio
         return;
    }

    console.log(`Carregando receitas do Firestore para paciente: ${currentPatientId}`);
    const recipesStorageKey = 'orionHealth_allRecipes'; // Chave antiga (para backup/migração futura)

    try {
        const receitasRef = collection(db, 'pacientes', currentPatientId, 'receitas');
        const querySnapshot = await getDocs(receitasRef);

        if (querySnapshot.empty) {
            console.log("Nenhuma receita encontrada no Firestore. Verificando localStorage (backup)...");
            // Tenta carregar do localStorage (migração suave)
            const storedRecipes = localStorage.getItem(recipesStorageKey);
            if (storedRecipes) {
                allRecipes = JSON.parse(storedRecipes);
            } else {
                allRecipes = []; // Começa vazio
            }
        } else {
            // Mapeia os dados do Firestore
            allRecipes = querySnapshot.docs.map(doc => {
                const data = doc.data();
                // Garante que a data de emissão seja uma string ISO (para consistência)
                let emissaoStr = data.emissao;
                if (data.emissao && typeof data.emissao.toDate === 'function') {
                     emissaoStr = data.emissao.toDate().toISOString();
                } else if (typeof data.emissao !== 'string') {
                     emissaoStr = new Date().toISOString(); // Fallback
                }

                return {
                    ...data,
                    id: doc.id, // Adiciona o ID do documento
                    emissao: emissaoStr // Garante que 'emissao' seja string
                };
            });
            console.log(`Receitas carregadas do Firestore: ${allRecipes.length} encontradas.`);
        }

        // Ordena (mais recentes primeiro, usando o ID numérico antigo ou timestamp)
        allRecipes.sort((a, b) => (b.id_numerico || b.id) - (a.id_numerico || a.id)); // Ajuste se seu ID antigo não for Date.now()

    } catch (error) {
        console.error("Erro ao carregar receitas do Firestore:", error);
        // Se falhar (ex: permissão), tenta carregar do localStorage
        const storedRecipes = localStorage.getItem(recipesStorageKey);
        if (storedRecipes) {
             allRecipes = JSON.parse(storedRecipes);
             console.warn("Firestore falhou, carregando do localStorage.");
        } else {
             allRecipes = [];
        }
    }

    // A chamada applyRecipeFilters() já está na initializePage
};

    const renderMedicamentosNoModal = () => {
        if (!medicamentosAdicionadosList || !medicamentosAdicionadosPlaceholder) return;
        medicamentosAdicionadosList.innerHTML = ''; 
        if (medicamentosDaReceitaAtual.length === 0) {
            if (medicamentosAdicionadosPlaceholder) {
                medicamentosAdicionadosList.appendChild(medicamentosAdicionadosPlaceholder);
            }
        } else {
            medicamentosDaReceitaAtual.forEach((med, index) => {
                const itemHtml = `
                    <div class="medicamento-item-modal">
                        <p>
                            <strong>${med.nome}</strong>
                            ${med.dosagem} | ${med.frequencia} | ${med.duracao}
                        </p>
                        <button type="button" class="btn-delete-mini" data-index="${index}" aria-label="Remover ${med.nome}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
                medicamentosAdicionadosList.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    };

    const handleAddMedicamento = (e) => {
        e.preventDefault(); 
        const nomeInput = document.getElementById('medicamento-nome');
        const dosagemInput = document.getElementById('medicamento-dosagem');
        const frequenciaInput = document.getElementById('medicamento-frequencia');
        const duracaoInput = document.getElementById('medicamento-duracao');
        if (!nomeInput.value || !dosagemInput.value || !frequenciaInput.value || !duracaoInput.value) {
            alert("Por favor, preencha todos os campos do medicamento.");
            return;
        }
        medicamentosDaReceitaAtual.push({
            nome: nomeInput.value,
            dosagem: dosagemInput.value,
            frequencia: frequenciaInput.value,
            duracao: duracaoInput.value
        });
        renderMedicamentosNoModal();
        if(formAddMedicamento) formAddMedicamento.reset();
        if(nomeInput) nomeInput.focus();
    };

    // --- Funções de Encaminhamento (ATUALIZADAS) ---
// --- Funções de Encaminhamento (ATUALIZADAS) ---

/**
 * CARREGA HISTÓRICO DE ENCAMINHAMENTOS (Prontuário do Médico)
 * Lê da pasta correta: pacientes/{id}/encaminhamentos
 */
async function loadEncaminhamentos() {
    const container = document.getElementById('encaminhamento-container');
    
    if (!container || !currentPatientId) return;

    container.innerHTML = '<p class="placeholder">A carregar histórico...</p>';

    try {
        console.log(`Lendo Encaminhamentos de: pacientes/${currentPatientId}/encaminhamentos`);

        // 1. Busca na Coleção do Paciente
        const encRef = collection(db, 'pacientes', currentPatientId, 'encaminhamentos');
        // Ordena por data
        const q = query(encRef, orderBy('timestamp', 'desc'));
        
        const querySnapshot = await getDocs(q);

        container.innerHTML = ''; 

        if (querySnapshot.empty) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-share-from-square"></i><p>Nenhum encaminhamento registrado.</p></div>';
            return;
        }

        // 2. Atualiza a variável global (Importante para o PDF funcionar)
        allEncaminhamentos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 3. Desenha os cartões na lista
        allEncaminhamentos.forEach(enc => {
            // Formatação de Data
            let dataFmt = 'N/D';
            let dataRaw = enc.data || enc.timestamp;
            if (dataRaw) {
                try {
                    const d = dataRaw.toDate ? dataRaw.toDate() : new Date(dataRaw);
                    dataFmt = d.toLocaleDateString('pt-BR');
                } catch(e){}
            }

            // Status e Cor
            let statusClass = 'status-solicitado'; // Amarelo (Padrão)
            if (enc.status === 'Agendado') statusClass = 'status-ativa'; // Azul

            const cardHTML = `
                <div class="recipe-card" data-enc-id="${enc.id}">
                    <div class="recipe-header">
                        <h3><i class="fa-solid fa-share-from-square"></i> ${enc.especialidade || 'Encaminhamento'}</h3>
                        <span class="badge ${statusClass}">${enc.status || 'Pendente'}</span>
                    </div>
                    
                    <p class="recipe-doctor">Solicitado por: ${enc.nome_profissional || 'Profissional'}</p>
                    
                    <div class="recipe-details">
                        <span><i class="fa-solid fa-calendar-days"></i> Data: <strong>${dataFmt}</strong></span>
                        <span><i class="fa-solid fa-file-medical"></i> Motivo: <strong>${enc.motivo || 'N/A'}</strong></span>
                    </div>

                    <div class="recipe-footer">
                        <small>Emitido em: ${dataFmt}</small>
                        <div class="card-footer-actions">
                            <button class="btn-pdf" data-action="gerar-pdf-encaminhamento" data-enc-id="${enc.id}">
                                <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                            </button>
                            
                            ${(currentUser && enc.id_profissional === currentUser.uid) ? 
                            `<button class="btn-delete" data-action="apagar-enc" data-enc-id="${enc.id}"><i class="fa-solid fa-trash"></i></button>` 
                            : ''}
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error("Erro ao carregar encaminhamentos no prontuário:", error);
        // Se der erro de índice (orderBy), tenta carregar sem ordem
        if (error.code === 'failed-precondition') {
             console.warn("Tentando carregar sem ordenação...");
             // ... (código de fallback simplificado se necessário)
             container.innerHTML = '<p class="error-message">Necessário criar índice no Firebase (ver console).</p>';
        } else {
             container.innerHTML = '<p class="error-message">Erro ao carregar lista.</p>';
        }
    }
}

// Filtro Simples para a Barra de Busca
const aplicarFiltroEncaminhamentos = () => {
    if (!encaminhamentoSearchInput) return;
    const termoBusca = encaminhamentoSearchInput.value.toLowerCase();
    const todosCards = document.querySelectorAll('#encaminhamento-container .recipe-card'); 
    
    todosCards.forEach(card => {
        const textoCard = card.textContent.toLowerCase();
        card.style.display = textoCard.includes(termoBusca) ? '' : 'none';
    });
};
    // --- Funções de Exame (com localStorage) ---
    const renderSolicitacoesDeExames = (examesParaRenderizar) => {
        const container = document.getElementById('exames-solicitacoes-container');
        if (!container) return;
        container.innerHTML = '';
        if (!examesParaRenderizar || examesParaRenderizar.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-flask-vial"></i><p>Nenhuma solicitação de exame encontrada.</p></div>';
            return;
        }
        examesParaRenderizar.forEach(dados => {
            let deleteButtonHtml = '';
            const canDelete = currentUser && currentUser.uid === dados.id_profissional;
            if (canDelete) { 
                deleteButtonHtml = `<button class="btn-delete" data-exame-id="${dados.id}" aria-label="Apagar Solicitação de Exame"><i class="fa-solid fa-trash"></i></button>`;
            }
            const statusClass = `status-${dados.status.toLowerCase().replace(/\s+/g, '-')}`;
            const card = document.createElement('div');
            card.className = 'exame-card';
            const listaExamesHtml = `<ul>${dados.tiposExame.map(exame => `<li>${exame}</li>`).join('')}</ul>`;
            card.innerHTML = `<div class="recipe-header"><h3>Solicitação de Exames</h3><span class="badge ${statusClass}">${dados.status}</span></div><p class="recipe-doctor">Solicitado por ${dados.nome_profissional}</p>${listaExamesHtml}<p><strong>Motivo:</strong> ${dados.motivo}</p><div class="recipe-footer"><small>Solicitado em ${new Date(dados.dataSolicitacao).toLocaleDateString('pt-BR')}</small><div class="card-footer-actions"><button class="btn-pdf" data-exame-id="${dados.id}"><i class="fa-solid fa-file-pdf"></i> Gerar PDF</button>${deleteButtonHtml}</div></div>`;
            container.appendChild(card);
        });
    };
    
    const aplicarFiltroExames = () => {
        if (!exameSolicitacaoSearchInput || !exameFilterGroup) return;
        const termoBusca = exameSolicitacaoSearchInput.value.toLowerCase();
        const activeFilterBtn = exameFilterGroup.querySelector('.filter-btn-small.active');
        const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'todos';
        let examesFiltrados = mockExames.filter(exame => {
            const textoDoExame = [...exame.tiposExame, exame.motivo, exame.nome_profissional].join(' ').toLowerCase();
            return textoDoExame.includes(termoBusca);
        });
        if (activeFilter !== 'todos') {
            examesFiltrados = examesFiltrados.filter(exame => exame.status.toLowerCase().replace(/\s+/g, '-') === activeFilter);
        }
        renderSolicitacoesDeExames(examesFiltrados);
    };

    const loadInitialMockExams = () => {
        mockExames = [
            { id: 'ex002', id_profissional: 'outro-medico-id', nome_profissional: 'Dra. Ana Costa', especialidade_profissional: 'Cardiologista', registro_profissional: 'CRM/SP 654321', tiposExame: ['Glicemia em Jejum', 'Colesterol Total'], motivo: 'Controle de Diabetes', status: 'Aguardando resultado', dataSolicitacao: '2025-10-10', jejumNecessario: true }
        ];
    };
    
    const mostrarSolicitacoesDeExames = async () => {
        const examsStorageKey = 'orionHealth_mockExames';
        const storedExams = localStorage.getItem(examsStorageKey);
        if (storedExams) {
            try {
                mockExames = JSON.parse(storedExams);
                console.log("Solicitações de Exames carregadas do localStorage.");
            } catch (error) {
                console.error("Erro ao ler solicitações do localStorage:", error);
                loadInitialMockExams();
                localStorage.setItem(examsStorageKey, JSON.stringify(mockExames));
            }
        } else {
            loadInitialMockExams();
            localStorage.setItem(examsStorageKey, JSON.stringify(mockExames));
            console.log("Mock inicial de solicitações de exames carregado e salvo no localStorage.");
        }
        // aplicarFiltroExames(); // Chamado em initializePage
    };
    
    const aplicarFiltroResultadosExames = () => {
        if (!exameResultadoSearchInput) return;
        // Lógica futura...
    };

    const renderExameSuggestions = () => {
        if (!exameSearchInput || !exameSuggestionsContainer) return;
        const searchTerm = exameSearchInput.value.toLowerCase();
        exameSuggestionsContainer.innerHTML = '';
        if (!searchTerm) {
            exameSuggestionsContainer.classList.add('hidden');
            return;
        }
        const filteredExams = EXAMES_COMUNS.filter(exame => exame.toLowerCase().includes(searchTerm));
        if (filteredExams.length > 0) {
            filteredExams.forEach(exame => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = exame;
                item.onclick = () => addExameToList(exame);
                exameSuggestionsContainer.appendChild(item);
            });
            exameSuggestionsContainer.classList.remove('hidden');
        } else {
            exameSuggestionsContainer.classList.add('hidden');
        }
    };

    const addExameToList = (exameName) => {
        if (!exameName.trim() || !selectedExamsContainer) return;
        const existingTags = selectedExamsContainer.querySelectorAll('.selected-exam-tag');
        for (let tag of existingTags) {
            if (tag.firstChild.textContent.trim().toLowerCase() === exameName.toLowerCase()) {
                if(exameSearchInput) exameSearchInput.value = '';
                if(exameSuggestionsContainer) exameSuggestionsContainer.classList.add('hidden');
                return; 
            }
        }
        const tag = document.createElement('div');
        tag.className = 'selected-exam-tag';
        const text = document.createElement('span');
        text.textContent = exameName;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-exam-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = () => tag.remove();
        tag.appendChild(text);
        tag.appendChild(removeBtn);
        selectedExamsContainer.appendChild(tag);
        if(exameSearchInput) {
            exameSearchInput.value = '';
            exameSearchInput.focus();
        }
        if(exameSuggestionsContainer) exameSuggestionsContainer.classList.add('hidden');
    };


    

// --- FUNÇÃO PARA RENDERIZAR RECEITAS NA SUB-ABA "DADOS DA CONSULTA" ---
const renderReceitasEmDadosDaConsulta = () => {
    // 1. Encontra o container na aba "Dados da Consulta"
    const container = document.getElementById('dados-clinicos-receitas-lista');

    if (!container) {
        console.error("Container '#dados-clinicos-receitas-lista' não foi encontrado.");
        return;
    }

    // 2. Limpa o container
    container.innerHTML = '';

    const receitasParaRenderizar = receitasDaSessaoAtual;

    // 4. Verifica se está vazio e mostra o empty state
    if (!receitasParaRenderizar || receitasParaRenderizar.length === 0) {
        const emptyStateHTML = `
            <div class="empty-state-mini" style="text-align: left; padding: 10px 0;">
                <i class="fa-solid fa-prescription-bottle-medical" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
                <p>Nenhuma receita criada nesta consulta ainda.</p>
            </div>
        `;
        container.innerHTML = emptyStateHTML;
        return;
    }

    // 5. Ordena e Cria os cards (mais recentes primeiro)
    console.log(`Renderizando ${receitasParaRenderizar.length} receita(s) em 'Dados da Consulta'.`);
    const receitasOrdenadas = [...receitasParaRenderizar].sort((a, b) => (b.id - a.id)); // Ordena pelo ID (Date.now())

    receitasOrdenadas.forEach(recipe => {
        // Formata a data de emissão (que agora é ISO string)
        const dataEmissaoObj = new Date(recipe.emissao);
        const dataEmissaoFormatada = dataEmissaoObj.toLocaleString('pt-BR', {
            dateStyle: 'short', // Ex: 25/10/2025
            timeStyle: 'short'  // Ex: 20:30
        });

        // Pega o nome do primeiro medicamento para o título
        let tituloReceita = "Receita";
        if (recipe.medicamentos && recipe.medicamentos.length > 0) {
            tituloReceita = recipe.medicamentos[0].nome;
            if (recipe.medicamentos.length > 1) {
                tituloReceita += ` + ${recipe.medicamentos.length - 1} outro(s)`;
            }
        } else if (recipe.medicamento) { // Fallback para formato antigo
             tituloReceita = recipe.medicamento;
        }

        // HTML do Card (reutilizando estilo .sinais-vitais-card)
        const cardHTML = `
            <div class="sinais-vitais-card" data-recipe-id="${recipe.id}">
                <div class="sv-card-header">
                    <i class="fa-solid fa-prescription-bottle-medical"></i>
                    <strong>${tituloReceita}</strong>
                    <span class="sv-card-time">${dataEmissaoFormatada}</span>
                </div>
                <div class="sv-card-grid" style="grid-template-columns: 1fr;">
                    <p style="margin: 0; font-size: 0.9rem;">
                        <strong>Solicitado por:</strong> ${recipe.medico}
                    </p>
                </div>
                <div class="sv-card-footer">
                    <button type="button" class="btn-pdf mini-btn" data-recipe-id="${recipe.id}" aria-label="Gerar PDF da Receita">
                        <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                    </button>
                    <button type="button" class="btn-delete mini-btn" data-recipe-id="${recipe.id}" aria-label="Apagar Receita">
                        <i class="fa-solid fa-trash"></i> Apagar
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
};
// FIM DA NOVA FUNÇÃO

// --- FUNÇÃO PARA RENDERIZAR ENCAMINHAMENTOS (DA SESSÃO) NA SUB-ABA "DADOS DA CONSULTA" ---
const renderEncaminhamentosEmDadosDaConsulta = () => {
    const container = document.getElementById('dados-clinicos-encaminhamentos-lista');
    if (!container) {
        console.error("Container '#dados-clinicos-encaminhamentos-lista' não foi encontrado.");
        return;
    }

    container.innerHTML = '';

    // Lê do array temporário 'encaminhamentosDaSessaoAtual'
    const encaminhamentosParaRenderizar = encaminhamentosDaSessaoAtual; 

    if (!encaminhamentosParaRenderizar || encaminhamentosParaRenderizar.length === 0) {
        const emptyStateHTML = `
            <div class="empty-state-mini" style="text-align: left; padding: 10px 0;">
                <i class="fa-solid fa-share-from-square" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
                <p>Nenhum encaminhamento criado nesta consulta ainda.</p>
            </div>
        `;
        container.innerHTML = emptyStateHTML;
        return;
    }

    console.log(`Renderizando ${encaminhamentosParaRenderizar.length} encaminhamento(s) DA SESSÃO.`);
    // Ordena (mais recentes primeiro, usando o timestamp)
    const encaminhamentosOrdenados = [...encaminhamentosParaRenderizar].sort((a, b) => (new Date(b.timestamp) - new Date(a.timestamp)));

    encaminhamentosOrdenados.forEach(enc => {
        // Formata a data/hora de emissão (do timestamp)
        const dataEmissaoObj = new Date(enc.timestamp);
        const dataEmissaoFormatada = dataEmissaoObj.toLocaleString('pt-BR', {
            dateStyle: 'short', 
            timeStyle: 'short'
        });

        // HTML do Card
        const cardHTML = `
            <div class="sinais-vitais-card" data-encaminhamento-id="${enc.id}">
                <div class="sv-card-header">
                    <i class="fa-solid fa-share-from-square"></i>
                    <strong>Encaminhamento</strong>
                    <span class="sv-card-time">${dataEmissaoFormatada}</span>
                </div>
                <div class="sv-card-grid" style="grid-template-columns: 1fr;">
                    <p style="margin: 0 0 8px 0; font-size: 0.9rem;"><strong>Para:</strong> ${enc.especialidade || 'N/A'}</p>
                    <p style="margin: 0; font-size: 0.9rem;"><strong>Motivo:</strong> ${enc.motivo || 'N/A'}</p>
                </div>
                <div class="sv-card-footer">
                    <button type="button" class="btn-pdf mini-btn" data-encaminhamento-id="${enc.id}" aria-label="Gerar PDF do Encaminhamento">
                        <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                    </button>
                    <button type="button" class="btn-delete mini-btn" data-encaminhamento-id="${enc.id}" aria-label="Apagar Encaminhamento">
                        <i class="fa-solid fa-trash"></i> Apagar
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
};
// FIM DA NOVA FUNÇÃO



// --- FUNÇÃO PARA RENDERIZAR EXAMES (DA SESSÃO) NA SUB-ABA "DADOS DA CONSULTA" ---
const renderExamesEmDadosDaConsulta = () => {
    const container = document.getElementById('dados-clinicos-exames-lista');
    if (!container) {
        console.error("Container '#dados-clinicos-exames-lista' não foi encontrado.");
        return;
    }

    container.innerHTML = '';

    // Lê do array temporário 'examesDaSessaoAtual'
    const examesParaRenderizar = examesDaSessaoAtual; 

    if (!examesParaRenderizar || examesParaRenderizar.length === 0) {
        const emptyStateHTML = `
            <div class="empty-state-mini" style="text-align: left; padding: 10px 0;">
                <i class="fa-solid fa-flask-vial" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
                <p>Nenhuma solicitação de exame criada nesta consulta ainda.</p>
            </div>
        `;
        container.innerHTML = emptyStateHTML;
        return;
    }

    console.log(`Renderizando ${examesParaRenderizar.length} exame(s) DA SESSÃO em 'Dados da Consulta'.`);
    const examesOrdenados = [...examesParaRenderizar].sort((a, b) => (b.id_numerico - a.id_numerico)); // Ordena pelo ID (Date.now())

    examesOrdenados.forEach(exame => {
        // Formata a data/hora de emissão (que salvamos como 'timestamp')
        const dataEmissaoObj = new Date(exame.timestamp); // Usa o timestamp que vamos adicionar
        const dataEmissaoFormatada = dataEmissaoObj.toLocaleString('pt-BR', {
            dateStyle: 'short', // Ex: 25/10/2025
            timeStyle: 'short'  // Ex: 20:30
        });

        // Pega o nome do primeiro exame para o título
        let tituloExame = "Solicitação de Exames";
        if (exame.tiposExame && exame.tiposExame.length > 0) {
            tituloExame = exame.tiposExame[0];
            if (exame.tiposExame.length > 1) {
                tituloExame += ` + ${exame.tiposExame.length - 1} outro(s)`;
            }
        }

        // HTML do Card
        const cardHTML = `
            <div class="sinais-vitais-card" data-exame-id="${exame.id}">
                <div class="sv-card-header">
                    <i class="fa-solid fa-flask-vial"></i>
                    <strong>${tituloExame}</strong>
                    <span class="sv-card-time">${dataEmissaoFormatada}</span>
                </div>
                <div class="sv-card-grid" style="grid-template-columns: 1fr;">
                    <p style="margin: 0; font-size: 0.9rem;">
                        <strong>Motivo:</strong> ${exame.motivo || 'N/A'}
                    </p>
                </div>
                <div class="sv-card-footer">
                    <button type="button" class="btn-pdf mini-btn" data-exame-id="${exame.id}" aria-label="Gerar PDF do Exame">
                        <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                    </button>
                    <button type="button" class="btn-delete mini-btn" data-exame-id="${exame.id}" aria-label="Apagar Exame">
                        <i class="fa-solid fa-trash"></i> Apagar
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
};
// FIM DA NOVA FUNÇÃO

// --- FUNÇÃO PARA RENDERIZAR ACOMPANHAMENTO (DA SESSÃO) NA SUB-ABA "DADOS DA CONSULTA" (CORRIGIDA) ---
const renderAcompanhamentoEmDadosDaConsulta = () => {
    const container = document.getElementById('dados-clinicos-acompanhamento-resumo');
    if (!container) {
        console.error("Container '#dados-clinicos-acompanhamento-resumo' não foi encontrado.");
        return;
    }

    container.innerHTML = '';

    const acompanhamentosParaRenderizar = acompanhamentosDaSessaoAtual; 

    if (!acompanhamentosParaRenderizar || acompanhamentosParaRenderizar.length === 0) {
        const emptyStateHTML = `
            <div class="empty-state-mini" style="text-align: left; padding: 10px 0;">
                <i class="fa-solid fa-star-of-life" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
                <p>Nenhum plano de acompanhamento definido para esta consulta.</p>
            </div>
        `;
        container.innerHTML = emptyStateHTML;
        return;
    }

    console.log(`Renderizando ${acompanhamentosParaRenderizar.length} acompanhamento(s) DA SESSÃO.`);
    // Ordena pela data/hora (timestamp)
    const acompanhamentosOrdenados = [...acompanhamentosParaRenderizar].sort((a, b) => (new Date(b.timestamp) - new Date(a.timestamp)));

    acompanhamentosOrdenados.forEach(acomp => {

        let dataEmissaoObj = acomp.timestamp || new Date(acomp.data_inicio);
        let dataEmissaoFormatada = 'Data N/D';

        if (dataEmissaoObj instanceof Date && !isNaN(dataEmissaoObj)) {
             dataEmissaoFormatada = dataEmissaoObj.toLocaleString('pt-BR', {
                dateStyle: 'short', 
                timeStyle: 'short'
            });
        }

        // Linha de metas revertida para o original
        const metasHtml = acomp.metas && Array.isArray(acomp.metas) 
            ? acomp.metas.map(meta => `<li>${meta}</li>`).join('') 
            : '<li>Nenhuma meta definida</li>';

        // HTML do Card revertido para o original (com 'sv-card-grid')
        const cardHTML = `
            <div class="sinais-vitais-card" data-acompanhamento-id="${acomp.id}">
                <div class="sv-card-header">
                    <i class="fa-solid fa-star-of-life"></i>
                    <strong>Acompanhamento (${acomp.duracao_dias > 0 ? `${acomp.duracao_dias} dias` : 'Contínuo'})</strong>
                    <span class="sv-card-time">${dataEmissaoFormatada}</span>
                </div>
                <div class="sv-card-grid" style="grid-template-columns: 1fr;">
                    <p style="margin: 0 0 8px 0; font-size: 0.9rem;"><strong>Metas:</strong></p>
                    <ul style="font-size: 0.9rem; margin-top: 0; padding-left: 20px;">
                        ${metasHtml}
                    </ul>
                </div>
                <div class="sv-card-footer">
                    <button type="button" class="btn-pdf mini-btn" data-acompanhamento-id="${acomp.id}" aria-label="Gerar PDF do Acompanhamento">
                        <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                    </button>
                    <button type="button" class="btn-delete mini-btn" data-acompanhamento-id="${acomp.id}" aria-label="Apagar Acompanhamento">
                        <i class="fa-solid fa-trash"></i> Apagar
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
};
// FIM DA FUNÇÃO CORRIGIDA

// --- FUNÇÃO PARA RENDERIZAR ATESTADOS NA SUB-ABA "DADOS DA CONSULTA" (CORRIGIDA) ---
const renderAtestadosEmDadosDaConsulta = () => {
    const container = document.getElementById('dados-clinicos-atestados-lista');

    if (!container) {
        console.error("Container '#dados-clinicos-atestados-lista' não foi encontrado.");
        return;
    }

    container.innerHTML = '';
    const atestadosParaRenderizar = atestadosDaSessaoAtual; // <<< MODIFIQUE PARA ESTA

    if (!atestadosParaRenderizar || atestadosParaRenderizar.length === 0) {
        const emptyStateHTML = `
            <div class="empty-state-mini" style="text-align: left; padding: 10px 0;">
                <i class="fa-solid fa-file-invoice" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
                <p>Nenhum atestado criado nesta consulta ainda.</p>
            </div>
        `;
        container.innerHTML = emptyStateHTML;
        return;
    }

    console.log(`Renderizando ${atestadosParaRenderizar.length} atestado(s) em 'Dados da Consulta'.`);
    const atestadosOrdenados = [...atestadosParaRenderizar].sort((a, b) => (b.id - a.id));

    atestadosOrdenados.forEach(atestado => {
        // Formata data de início (continua igual)
        const dataInicioFormatada = atestado.dataInicio 
            ? new Date(atestado.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')
            : 'N/A';

        // --- LÓGICA DE FORMATAÇÃO DE DATA DE EMISSÃO (CORRIGIDA) ---
        let dataEmissaoFormatada = 'Data N/D'; // Padrão
        const dataEmissaoRaw = atestado.emissao; // Pega o dado salvo

        if (dataEmissaoRaw) {
            let dataEmissaoObj;

            // Verifica se é o formato NOVO (ISO String, ex: "2025-10-25T20:19:00.000Z")
            if (typeof dataEmissaoRaw === 'string' && dataEmissaoRaw.includes('T')) {
                dataEmissaoObj = new Date(dataEmissaoRaw);
            }
            // Verifica se é o formato ANTIGO (String DD/MM/AAAA)
            else if (typeof dataEmissaoRaw === 'string' && dataEmissaoRaw.includes('/')) {
                // Converte "DD/MM/AAAA" para "AAAA-MM-DD" que o 'new Date()' entende
                const parts = dataEmissaoRaw.split('/');
                if (parts.length === 3) {
                     // Formato "YYYY-MM-DD"
                    dataEmissaoObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
            }

            // Agora, tenta formatar o objeto Date
            if (dataEmissaoObj instanceof Date && !isNaN(dataEmissaoObj)) {
                // Se o dado original tinha hora, mostra data e hora
                if (typeof dataEmissaoRaw === 'string' && dataEmissaoRaw.includes('T')) {
                    dataEmissaoFormatada = dataEmissaoObj.toLocaleString('pt-BR', {
                        dateStyle: 'short', // Ex: 25/10/2025
                        timeStyle: 'short'  // Ex: 20:19
                    });
                } else {
                    // Se era o formato antigo (só data), mostra só a data
                    dataEmissaoFormatada = dataEmissaoObj.toLocaleDateString('pt-BR', {
                        dateStyle: 'short' // Ex: 25/10/2025
                    });
                }
            } else {
                 // Se ainda assim falhar, mostra o dado cru (que pode ser "25/10/2025")
                 dataEmissaoFormatada = dataEmissaoRaw;
            }
        }
        // --- FIM DA LÓGICA DE FORMATAÇÃO ---

        // HTML do Card (agora com os botões)
        const cardHTML = `
            <div class="sinais-vitais-card" data-atestado-id="${atestado.id}">
                <div class="sv-card-header">
                    <i class="fa-solid fa-file-invoice"></i>
                    <strong>Atestado (${atestado.tipo})</strong>
                    <span class="sv-card-time">${dataEmissaoFormatada}</span> </div>
                <div class="sv-card-grid" style="grid-template-columns: 1fr;">
                    <p style="margin: 0 0 8px 0; font-size: 0.9rem;"><strong>Motivo:</strong> ${atestado.motivo}</p>
                    <span style="font-size: 0.9rem;"><strong>Início:</strong> ${dataInicioFormatada}</span>
                    <span style="font-size: 0.9rem;"><strong>Dias:</strong> ${atestado.diasAfastamento || 'N/A'}</span>
                    <span style="font-size: 0.9rem;"><strong>CID:</strong> ${atestado.cid || 'N/A'}</span>
                </div>
                <div class="sv-card-footer">
                     <button type="button" class="btn-pdf mini-btn" data-atestado-id="${atestado.id}" aria-label="Gerar PDF do Atestado">
                        <i class="fa-solid fa-file-pdf"></i> Gerar PDF
                    </button>
                    <button type="button" class="btn-delete mini-btn" data-atestado-id="${atestado.id}" aria-label="Apagar Atestado">
                        <i class="fa-solid fa-trash"></i> Apagar
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
};

// FIM DA NOVA FUNÇÃO





async function gerarPDFAtestado(atestadoIdStr) {
    const atestadoId = parseInt(atestadoIdStr, 10);
    const atestadoData = allAtestados.find(a => a.id === atestadoId);

    if (!atestadoData) {
        alert("Erro: Atestado não encontrado.");
        return;
    }

    const template = document.getElementById('pdf-atestado-template');
    if (!template) {
        alert("Erro: Template PDF 'pdf-atestado-template' não encontrado no HTML.");
        return;
    }

    // Popula os campos do template
    document.getElementById('pdf-atestado-doctor-name').textContent = atestadoData.medico;
    document.getElementById('pdf-atestado-doctor-specialty').textContent = atestadoData.especialidade_profissional;
    document.getElementById('pdf-atestado-doctor-crm').textContent = atestadoData.registro_profissional;
    
    document.getElementById('pdf-atestado-patient-name').textContent = atestadoData.pacienteNome;
    document.getElementById('pdf-atestado-emission-date').textContent = new Date(atestadoData.emissao).toLocaleDateString('pt-BR');
    
    document.getElementById('pdf-atestado-patient-name-body').textContent = atestadoData.pacienteNome;
    document.getElementById('pdf-atestado-dias').textContent = atestadoData.diasAfastamento;
    document.getElementById('pdf-atestado-data-inicio').textContent = new Date(atestadoData.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR');
    
    document.getElementById('pdf-atestado-motivo').textContent = atestadoData.motivo;
    document.getElementById('pdf-atestado-cid').textContent = atestadoData.cid;
    document.getElementById('pdf-atestado-observacoes').textContent = atestadoData.observacoes || "Nenhuma.";
    
    document.getElementById('pdf-atestado-signature-name').textContent = atestadoData.medico;

    loadingOverlay.classList.remove('hidden');
    template.style.left = '0'; 
    try {
        await new Promise(r => setTimeout(r, 100)); 
        const canvas = await html2canvas(template, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`atestado-${atestadoData.pacienteNome.split(' ')[0]}.pdf`);
    } catch (error) {
        console.error("Erro ao gerar PDF do atestado:", error);
        alert("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
        template.style.left = '-9999px'; 
        loadingOverlay.classList.add('hidden');
    }
}
// --- FIM DA NOVA FUNÇÃO ---
    // --- Funções de Geração de PDF ---
    const generateRecipePDF = async (recipeData) => {
        const template = document.getElementById('pdf-receipt-template');
        if(!template) { console.error("Template PDF 'pdf-receipt-template' não encontrado."); return; }
        
        const pdfDoctorName = document.getElementById('pdf-doctor-name');
        const pdfDoctorSpecialty = document.getElementById('pdf-doctor-specialty');
        const pdfDoctorCrm = document.getElementById('pdf-doctor-crm');
        const pdfPatientName = document.getElementById('pdf-patient-name');
        const pdfEmissionDate = document.getElementById('pdf-emission-date');
        const medicationListEl = document.getElementById('pdf-medication-list');
        const pdfSignatureName = document.getElementById('pdf-signature-name');

        if (!pdfDoctorName || !pdfDoctorSpecialty || !pdfDoctorCrm || !pdfPatientName || !pdfEmissionDate || !medicationListEl || !pdfSignatureName) {
            console.error("Um ou mais elementos do template PDF de Receita estão em falta no HTML.");
            alert("Erro ao gerar PDF: template incompleto.");
            return;
        }

        pdfDoctorName.textContent = recipeData.medico || "";
        pdfDoctorSpecialty.textContent = recipeData.especialidade_profissional || "Especialidade"; 
        pdfDoctorCrm.textContent = recipeData.registro_profissional || "CRM/UF XXXXX";
        pdfPatientName.textContent = currentPatientData.nome;
        pdfEmissionDate.textContent = recipeData.emissao;
        medicationListEl.innerHTML = ''; 

        if (recipeData.medicamentos && recipeData.medicamentos.length > 0) {
            recipeData.medicamentos.forEach(med => {
                medicationListEl.innerHTML += `<li><strong>${med.nome}</strong><br><span>${med.dosagem}, ${med.frequencia}</span><br><span>Duração: ${med.duracao}</span></li>`;
            });
        } else if (recipeData.medicamento) {
             medicationListEl.innerHTML = `<li><strong>${recipeData.medicamento}</strong><br><span>${recipeData.dosagem}, ${recipeData.frequencia}</span><br><span>Duração: ${recipeData.duracao}</span></li>`;
        }

        pdfSignatureName.textContent = recipeData.medico;
        
        loadingOverlay.classList.remove('hidden');
        template.style.left = '0'; 
        try {
            await new Promise(r => setTimeout(r, 100)); 
            const canvas = await html2canvas(template, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`receita-${currentPatientData.nome.split(' ')[0]}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar PDF da receita:", error);
            alert("Não foi possível gerar o PDF. Tente novamente.");
        } finally {
            template.style.left = '-9999px'; 
            loadingOverlay.classList.add('hidden');
        }
    };

    async function gerarPDFEncaminhamento(encaminhamentoId) {
        const template = document.getElementById('pdf-encaminhamento-template');
        if (!template) { alert("Template PDF 'pdf-encaminhamento-template' não encontrado."); return; }
        
        const doctorNameEl = document.getElementById('pdf-encaminhamento-doctor-name');
        const patientNameEl = document.getElementById('pdf-encaminhamento-patient-name');
        const listEl = document.getElementById('pdf-encaminhamento-list');
        if (!doctorNameEl || !patientNameEl || !listEl) {
            console.error("Elementos do template PDF de Encaminhamento em falta no HTML.");
            alert("Erro ao gerar PDF: template incompleto.");
            return;
        }

        loadingOverlay.classList.remove('hidden');
        template.style.left = '0';
        try {
            const docRef = doc(db, 'encaminhamentos', currentPatientId, 'registros', encaminhamentoId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) { alert('Encaminhamento não encontrado.'); return; }
            const dados = docSnap.data();
            
            doctorNameEl.textContent = dados.nome_profissional || "";
            document.getElementById('pdf-encaminhamento-doctor-specialty').textContent = dados.especialidade_profissional || "";
            document.getElementById('pdf-encaminhamento-doctor-crm').textContent = dados.registro_profissional || "";
            patientNameEl.textContent = currentPatientData.nome;
            document.getElementById('pdf-encaminhamento-emission-date').textContent = new Date(dados.data).toLocaleDateString('pt-BR');
            listEl.innerHTML = `<li style="margin-bottom: 10px;"><strong>Especialidade:</strong> ${dados.especialidade}</li><li style="margin-bottom: 10px;"><strong>Motivo:</strong> ${dados.motivo}</li><li><strong>Recomendações:</strong> ${dados.recomendacoes || 'Nenhuma recomendação adicional.'}</li>`;
            document.getElementById('pdf-encaminhamento-signature-name').textContent = dados.nome_profissional || "";
            
            await new Promise(r => setTimeout(r, 100));
            const canvas = await html2canvas(template, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`encaminhamento-${currentPatientData.nome.split(' ')[0]}-${encaminhamentoId.substring(0, 5)}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar PDF do encaminhamento:", error);
            alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
        } finally {
            template.style.left = '-9999px';
            loadingOverlay.classList.add('hidden');
        }
    }

    async function gerarPDFExame(exameId) {
        const template = document.getElementById('pdf-exame-template');
        if (!template) { alert("Template PDF 'pdf-exame-template' não encontrado."); return; }
        
        const doctorNameEl = document.getElementById('pdf-exame-doctor-name');
        const patientNameEl = document.getElementById('pdf-exame-patient-name');
        const listEl = document.getElementById('pdf-exame-list');
        if (!doctorNameEl || !patientNameEl || !listEl) {
             console.error("Elementos do template PDF de Exame em falta no HTML.");
             alert("Erro ao gerar PDF: template incompleto.");
            return;
        }

        loadingOverlay.classList.remove('hidden');
        template.style.left = '0';
        try {
            const exameData = mockExames.find(ex => ex.id === exameId || ex.id.toString() === exameId); 
            if (!exameData) { alert('Solicitação de exame não encontrada.'); return; }
            
            doctorNameEl.textContent = exameData.nome_profissional || "";
            document.getElementById('pdf-exame-doctor-specialty').textContent = exameData.especialidade_profissional || "";
            document.getElementById('pdf-exame-doctor-crm').textContent = exameData.registro_profissional || "";
            patientNameEl.textContent = currentPatientData.nome;
            document.getElementById('pdf-exame-emission-date').textContent = new Date(exameData.dataSolicitacao).toLocaleDateString('pt-BR');
            listEl.innerHTML = exameData.tiposExame.map(exame => `<li>${exame}</li>`).join('');
            document.getElementById('pdf-exame-motivo').textContent = exameData.motivo;
            document.getElementById('pdf-exame-jejum').textContent = exameData.jejumNecessario ? "Jejum necessário." : "";
            document.getElementById('pdf-exame-signature-name').textContent = exameData.nome_profissional || "";
            
            await new Promise(r => setTimeout(r, 100));
            const canvas = await html2canvas(template, { scale: 3, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`pedido-exame-${currentPatientData.nome.split(' ')[0]}-${exameId.toString().substring(0, 5)}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar PDF do pedido de exame:", error);
            alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
        } finally {
            template.style.left = '-9999px';
            loadingOverlay.classList.add('hidden');
        }
    }
    
    

    const generateStarsHtml = (nota) => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<i class="fa ${i <= nota ? 'fa-star' : 'fa-star-o'}"></i>`;
        }
        return starsHtml;
    };

    /**
 * DESENHA A LISTA DE ADESÃO À MEDICAÇÃO (Dados Reais)
 * Mostra dia a dia o que o paciente registrou.
 */
function renderMedicacaoList(registros) {
    const container = document.getElementById('medicacao-list-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Filtra apenas registros que tenham dados de medicação
    const registrosMed = registros.filter(reg => reg.medicacao);

    if (registrosMed.length === 0) {
        container.innerHTML = `
            <div class="empty-state-mini" style="text-align: center; padding: 20px;">
                <i class="fa-solid fa-pills" style="font-size: 1.5rem; opacity: 0.5; margin-bottom: 8px;"></i>
                <p>Nenhum registro de medicação neste período.</p>
            </div>`;
        return;
    }
    
    // Ordena (recente -> antigo)
    registrosMed.sort((a, b) => b.jsDate - a.jsDate);

    registrosMed.forEach(reg => {
        const dataFmt = reg.jsDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        
        // 1. Analisa o status (Tomou ou Não?)
        const tomou = reg.medicacao.tomou;
        const iconClass = tomou ? "fa-check-circle" : "fa-times-circle";
        const colorStyle = tomou ? "color: #28a745;" : "color: #e53e3e;"; 
        const tituloTexto = tomou ? "Tomou a medicação" : "Não tomou a medicação";

        // 2. Verifica Efeitos Colaterais
        let efeitosHtml = '';
        if (reg.medicacao.sentiuEfeitos) {
            efeitosHtml = `
                <div style="margin-top: 4px; font-size: 0.85rem; color: #c53030; background: #fff5f5; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                    <i class="fa-solid fa-triangle-exclamation"></i> 
                    Efeitos Colaterais (Nível ${reg.medicacao.efeitosEscala || '?'})
                </div>`;
        }

        // 3. Lista detalhada dos medicamentos (se houver)
        let listaMedsHtml = '';
        if (reg.medicacao.listaConfirmada && reg.medicacao.listaConfirmada.length > 0) {
            const nomesMeds = reg.medicacao.listaConfirmada.map(m => m.nome).join(', ');
            listaMedsHtml = `<p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #666;">Confimados: ${nomesMeds}</p>`;
        }

        // 4. Monta o HTML do Item
        const itemHTML = `
            <div class="medicacao-list-item" style="display: flex; align-items: flex-start; gap: 12px; padding: 12px; border-bottom: 1px solid #eee;">
                <div style="font-weight: 700; color: #41b8d5; min-width: 50px;">${dataFmt}</div>
                
                <div style="flex-grow: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #333;">
                        <i class="fa-solid ${iconClass}" style="${colorStyle}"></i>
                        <span>${tituloTexto}</span>
                    </div>
                    ${listaMedsHtml}
                    ${efeitosHtml}
                    ${reg.medicacao.efeitosObs ? `<p style="font-size: 0.8rem; color: #666; margin-top: 4px;"><em>"${reg.medicacao.efeitosObs}"</em></p>` : ''}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });
}
    const showMedicacaoDetalhe = (registroId) => {
        const registro = mockMedicacaoRegistros.find(r => r.id === registroId);
        if (registro && medicacaoDetalheModal) {
            document.getElementById('detalhe-medicamento').textContent = registro.medicamento;
            document.getElementById('detalhe-data').textContent = new Date(registro.data).toLocaleDateString('pt-BR');
            document.getElementById('detalhe-nota').innerHTML = generateStarsHtml(registro.nota);
            document.getElementById('detalhe-texto').textContent = registro.texto;
            openModal(medicacaoDetalheModal);
        } else {
            alert("Erro ao carregar detalhes do registro.");
        }
    };

    // PROCURE E SUBSTITUA A FUNÇÃO INTEIRA POR ESTA VERSÃO COM LOGS:
const updateMedicacaoNotaChart = (registros, period = 7) => {
    const chartId = 'medicacaoNotaChart';
    console.log(`updateMedicacaoNotaChart: Chamada com period = ${period}`); // Log 1: Verifica o período recebido

    if (charts[chartId]) { charts[chartId].destroy(); }
    const ctx = document.getElementById(chartId)?.getContext('2d');
    if (!ctx) {
         console.error(`updateMedicacaoNotaChart: Contexto do canvas '${chartId}' não encontrado.`);
         return;
    }

    const dataLimite = new Date();
    dataLimite.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas dias
    dataLimite.setDate(dataLimite.getDate() - period); // Subtrai o período (7, 15, 30...)
    console.log(`updateMedicacaoNotaChart: Data Limite calculada (${period} dias atrás):`, dataLimite.toISOString().slice(0, 10)); // Log 2: Verifica a data limite

    // Filtra os registros: pega apenas os MAIORES OU IGUAIS à dataLimite
    const filteredData = registros.filter(reg => {
        const dataReg = new Date(reg.data + 'T00:00:00'); // Adiciona T00:00 para garantir comparação correta
        return dataReg >= dataLimite;
    }).sort((a, b) => new Date(a.data) - new Date(b.data)); // Ordena por data
    console.log(`updateMedicacaoNotaChart: ${filteredData.length} registros encontrados dentro do período de ${period} dias.`); // Log 3: Verifica quantos registros passaram no filtro

    // Limpa o canvas se não houver dados
    if (filteredData.length === 0) {
        console.log("updateMedicacaoNotaChart: Nenhum dado no período, limpando o gráfico."); // Log
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // Opcional: Mostrar uma mensagem no lugar do gráfico
        // ctx.font = "16px Inter";
        // ctx.fillStyle = "grey";
        // ctx.textAlign = "center";
        // ctx.fillText("Sem dados para este período", ctx.canvas.width / 2, ctx.canvas.height / 2);
        return; // Interrompe se não há dados
    }

    // Prepara labels e data points para o gráfico
    const labels = filteredData.map(reg => new Date(reg.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    const dataPoints = filteredData.map(reg => reg.nota);
    console.log("updateMedicacaoNotaChart: Labels:", labels); // Log 4: Verifica os labels
    console.log("updateMedicacaoNotaChart: Data Points:", dataPoints); // Log 5: Verifica os dados a plotar

    // Cria o gráfico
    charts[chartId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nota de Impacto',
                data: dataPoints,
                borderColor: '#41b8d5',
                backgroundColor: 'rgba(65, 184, 213, 0.1)',
                fill: true,
                tension: 0.1, // Linha um pouco curvada
                borderWidth: 2,
                pointBackgroundColor: '#41b8d5',
                pointRadius: 4 // Pontos um pouco maiores
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: false, min: 1, max: 5, ticks: { stepSize: 1 } },
                x: { ticks: { maxTicksLimit: period > 30 ? 10 : (period > 15 ? 15 : period) } } // Limita ticks no eixo X
            }
        }
    });
    console.log("updateMedicacaoNotaChart: Gráfico renderizado."); // Log
};
// FIM DA FUNÇÃO SUBSTITUÍDA
    /**
 * Filtra e exibe dados de Medicação (Lista e Gráfico) usando DADOS REAIS
 */
/**
 * CONECTOR: Recebe os dados filtrados por data e atualiza Lista e Gráfico
 */
/**
 * FILTRA E EXIBE DADOS DE MEDICAÇÃO (Versão Simplificada)
 * Ignora filtros de nome, mostra apenas o histórico cronológico.
 */
function applyMedicamentoFilter(dadosOpcionais) {
    // Usa os dados filtrados por data (se vierem do gráfico) ou todos
    const dadosBase = dadosOpcionais || allPatientRecords;
    
    // Filtra apenas registros que tenham dados de medicação
    const registrosMed = dadosBase.filter(reg => reg.medicacao);
    
    // Renderiza a lista
    renderMedicacaoList(registrosMed);
    
    // Renderiza o gráfico de efeitos colaterais
    drawHistoricoChart(registrosMed, 'medicacoes');
}

  
// SUBSTITUA a função loadInitialMockMedicacao por esta versão mais completa:
const loadInitialMockMedicacao = () => {
    // Gera os mocks apenas se o array estiver vazio
    if (mockMedicacaoRegistros.length === 0) {
        console.log("Gerando mock data dinâmico ABRANGENTE para Medicação (90 dias)..."); // Log atualizado
        const hoje = new Date();
        const registros = [];

        // Função auxiliar para formatar data como YYYY-MM-DD
        const formatDate = (date) => date.toISOString().slice(0, 10);

        // Adiciona registros para os últimos 90 dias
        for (let i = 0; i < 90; i++) {
            const dataRegistro = new Date(hoje);
            dataRegistro.setDate(hoje.getDate() - i); // Subtrai 'i' dias da data atual
            const dataFormatada = formatDate(dataRegistro);

            // Adiciona Losartana a cada dia ímpar
            if (i % 2 !== 0) {
                 registros.push({
                    id: `medL${i}`,
                    medicamento: 'Losartana 50mg',
                    data: dataFormatada,
                    nota: Math.floor(Math.random() * 3) + 2, // Nota aleatória entre 2 e 4
                    texto: `Registro Losartana dia ${90-i}. Efeito: ${['Normal', 'Leve tontura', 'Sem queixas'][i % 3]}. Data: ${dataFormatada}`
                });
            }

            // Adiciona Metformina a cada dia par
            if (i % 2 === 0) {
                registros.push({
                    id: `medM${i}`,
                    medicamento: 'Metformina 850mg',
                    data: dataFormatada,
                    nota: Math.floor(Math.random() * 2) + 4, // Nota aleatória entre 4 e 5
                    texto: `Registro Metformina dia ${90-i}. Efeito: ${['Sem queixas', 'Náusea leve'][i % 4 / 2]}. Data: ${dataFormatada}`
                });
            }

             // Adiciona Amoxicilina a cada 15 dias (exemplo)
             if (i > 0 && i % 15 === 0) {
                 registros.push({
                    id: `medA${i}`,
                    medicamento: 'Amoxicilina 500mg',
                    data: dataFormatada,
                    nota: Math.floor(Math.random() * 2) + 4, // Nota 4 ou 5
                    texto: `Registro Amoxicilina dia ${90-i}. Data: ${dataFormatada}`
                });
             }
        }

        mockMedicacaoRegistros = registros; // Atribui os registros gerados
        console.log(`Mock data dinâmico ABRANGENTE gerado (${mockMedicacaoRegistros.length} registros).`); // Log atualizado
    }
};
// FIM DA FUNÇÃO SUBSTITUÍDA

    /**
 * FILTRA AS SEÇÕES DA ANAMNESE (Busca Inteligente)
 * Procura no Título (H3) e no Conteúdo (Labels e Parágrafos)
 */
function aplicarFiltroAnamnese() {
    const searchInput = document.getElementById('anamnese-search-input');
    const container = document.getElementById('anamnese-conteudo-real');
    
    if (!searchInput || !container) return;

    const termo = searchInput.value.toLowerCase().trim();
    const secoes = container.querySelectorAll('.anamnese-section');

    secoes.forEach(secao => {
        // Pega todo o texto dentro desta seção (Título + Perguntas + Respostas)
        const textoSecao = secao.textContent.toLowerCase();

        // Se o termo estiver vazio OU se o texto da seção incluir o termo
        if (termo === '' || textoSecao.includes(termo)) {
            secao.style.display = ''; // Mostra (remove o display: none)
            secao.classList.remove('hidden');
        } else {
            secao.style.display = 'none'; // Esconde
            secao.classList.add('hidden');
        }
    });
}

    // --- Funções de Deleção ---
    // INÍCIO DO BLOCO PARA SUBSTITUIR (handleDeleteEncaminhamento)

async function handleDeleteEncaminhamento(encaminhamentoId) {
    if (!confirm("Tem certeza que deseja apagar este encaminhamento permanentemente?")) return;

    if (!currentPatientId) {
         alert("Erro: ID do Paciente não encontrado. Não é possível apagar.");
         return;
    }

    console.log("handleDeleteEncaminhamento: Iniciando exclusão do Firestore. ID:", encaminhamentoId);

    try {
        // 1. Define a referência e apaga do Firestore
        const docRef = doc(db, 'encaminhamentos', currentPatientId, 'registros', encaminhamentoId);
        await deleteDoc(docRef);

        console.log("Encaminhamento apagado do Firestore.");

        // 2. Remove do array 'encaminhamentosDaSessaoAtual' (Consulta)
        encaminhamentosDaSessaoAtual = encaminhamentosDaSessaoAtual.filter(enc => enc.id !== encaminhamentoId);

        // 3. Atualiza TODAS as UIs de Encaminhamento
        await mostrarEncaminhamentos(); // Atualiza a aba principal "Encaminhamentos" (lê do Firestore)
        renderEncaminhamentosEmDadosDaConsulta(); // Atualiza a sub-aba "Dados da Consulta"

        console.log("handleDeleteEncaminhamento: Todas as UIs de encaminhamento foram atualizadas.");
        alert("Encaminhamento removido com sucesso.");

    } catch (error) {
         console.error("Erro ao apagar encaminhamento do Firestore:", error);
         alert("Ocorreu um erro ao apagar o encaminhamento. Verifique o console.");
    }
}
// FIM DO BLOCO PARA SUBSTITUIR
    // INÍCIO DO BLOCO PARA SUBSTITUIR (handleDeleteExame)

async function handleDeleteExame(exameId) { // Recebe o ID do Firestore
    // 1. Confirmação
    if (!confirm("Tem certeza que deseja apagar esta solicitação de exame permanentemente?")) return;

    console.log("handleDeleteExame: Iniciando exclusão do Firestore. ID:", exameId);

    // Verifica se temos o ID
    if (!exameId) {
        alert("Erro: Não foi possível identificar o exame para apagar.");
        console.error("handleDeleteExame: exameId está faltando.");
        return;
    }

    try {
        // 2. Define a referência do documento na coleção RAIZ e apaga
        const docRef = doc(db, 'pedidos_exame', exameId); // Referência na coleção raiz
        await deleteDoc(docRef);
        console.log("Pedido de Exame apagado do Firestore com sucesso.");

        // 3. Remove do array 'examesDaSessaoAtual' (Consulta)
        // Filtra pelo ID que foi apagado
        examesDaSessaoAtual = examesDaSessaoAtual.filter(ex => ex.id !== exameId);

        // 4. ATUALIZA A UI DA SUB-ABA "DADOS DA CONSULTA"
        renderExamesEmDadosDaConsulta();

        // (Nota: A atualização da aba principal 'Exames' precisará ser refeita
        // para ler do Firestore quando implementarmos essa parte)

        console.log("handleDeleteExame: UI de exames (Dados da Consulta) atualizada.");
        alert("Solicitação de exame removida com sucesso.");

    } catch (error) {
        console.error("Erro ao apagar pedido de exame do Firestore:", error);
        // Verifica erro de permissão (útil para debug das regras)
        if (error.code === 'permission-denied') {
             alert("Erro de permissão ao apagar o exame. Verifique as Regras de Segurança.");
        } else {
             alert("Ocorreu um erro ao apagar a solicitação de exame. Verifique o console.");
        }
    }
}
    // FIM DO BLOCO PARA SUBSTITUIR
    
    // --- Funções de Atestado (NOVAS) ---
    const loadInitialMockAtestados = () => {
        allAtestados = []; // Começa vazio
    };

    const loadAtestadosData = () => {
        const atestadosStorageKey = 'orionHealth_allAtestados';
        const storedAtestados = localStorage.getItem(atestadosStorageKey);
        if (storedAtestados) {
            try {
                allAtestados = JSON.parse(storedAtestados);
                console.log("Atestados carregados do localStorage.");
            } catch (error) {
                console.error("Erro ao ler atestados do localStorage:", error);
                loadInitialMockAtestados();
                localStorage.setItem(atestadosStorageKey, JSON.stringify(allAtestados));
            }
        } else {
            loadInitialMockAtestados();
            localStorage.setItem(atestadosStorageKey, JSON.stringify(allAtestados));
            console.log("Mock inicial de atestados (vazio) salvo no localStorage.");
        }
    };
    
    const renderAtestados = (atestadosParaRenderizar) => {
        if (!atestadosListContainer) return;
        atestadosListContainer.innerHTML = '';
        if (!atestadosParaRenderizar || atestadosParaRenderizar.length === 0) {
            atestadosListContainer.innerHTML = '<div class="empty-state"><i class="fa-solid fa-file-invoice"></i><p>Nenhum atestado emitido para este paciente.</p></div>';
            return;
        }
        atestadosParaRenderizar.sort((a, b) => new Date(b.dataInicio || b.emissao).getTime() - new Date(a.dataInicio || a.emissao).getTime()); // Ordena
        atestadosParaRenderizar.forEach(atestado => {
            const card = document.createElement('div');
            card.className = 'exame-card'; 
            let deleteButtonHtml = '';
            if (currentUser && currentUser.uid === atestado.id_profissional) {
                deleteButtonHtml = `<button class="btn-delete" data-atestado-id="${atestado.id}" aria-label="Apagar Atestado"><i class="fa-solid fa-trash"></i></button>`;
            }
            
            // Formata a data de início (que pode estar em 'YYYY-MM-DD')
            const dataInicioFormatada = atestado.dataInicio 
                ? new Date(atestado.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') // Adiciona T00:00 para evitar erro de fuso
                : 'N/A';

            card.innerHTML = `
                <div class="recipe-header">
                    <h3>Atestado de ${atestado.diasAfastamento || 'N/A'} dia(s)</h3>
                    <span class="badge" style="background-color: var(--borda-suave); color: var(--texto-secundario);">${atestado.tipo}</span>
                </div>
                <p class="recipe-doctor">Emitido por ${atestado.medico}</p>
                <p><strong>Início:</strong> ${dataInicioFormatada} | <strong>CID:</strong> ${atestado.cid || 'Não informado'}</p>
                <p><strong>Motivo:</strong> ${atestado.motivo}</p>
                <div class="recipe-footer">
                    <small>Emitido em ${atestado.emissao}</small>
                    <div class="card-footer-actions">
                        <button class="btn-pdf" data-atestado-id="${atestado.id}"><i class="fa-solid fa-file-pdf"></i> Gerar PDF</button>
                        ${deleteButtonHtml}
                    </div>
                </div>
            `;
            atestadosListContainer.appendChild(card);
        });
    };

    const applyAtestadoFilters = () => {
        if (!atestadoSearchInput) {
            if(typeof allAtestados !== 'undefined' && allAtestados) renderAtestados(allAtestados);
            return;
        }
        const searchTerm = atestadoSearchInput.value.toLowerCase();
        let filteredAtestados = allAtestados;
        if (searchTerm && allAtestados) {
            filteredAtestados = allAtestados.filter(atestado =>
                atestado.motivo.toLowerCase().includes(searchTerm) ||
                (atestado.cid && atestado.cid.toLowerCase().includes(searchTerm)) ||
                atestado.medico.toLowerCase().includes(searchTerm)
            );
        }
        renderAtestados(filteredAtestados);
    };


    // --- FUNÇÃO PARA APAGAR RECEITA E ATUALIZAR TODAS AS UIs ---
async function handleDeleteReceita(recipeIdStr) {
    if (!confirm("Tem certeza que deseja apagar esta receita permanentemente?")) return;

    console.log("handleDeleteReceita: Iniciando exclusão do ID:", recipeIdStr);
    const recipeId = parseInt(recipeIdStr, 10); // ID é um Date.now() (número)

    // 1. Remove do array global 'allRecipes'
    allRecipes = allRecipes.filter(r => r.id !== recipeId && r.id.toString() !== recipeIdStr);

    // 2. Salva o array atualizado no localStorage
    localStorage.setItem('orionHealth_allRecipes', JSON.stringify(allRecipes));

    // 3. Atualiza TODAS as UIs que mostram receitas

    // Atualiza a UI da aba principal "Receitas"
    applyRecipeFilters(); 

    // Atualiza a UI da sub-aba "Receitas" em "Dados da Consulta"
    renderReceitasEmDadosDaConsulta(); 

    console.log("handleDeleteReceita: Todas as UIs de receita foram atualizadas.");

    alert("Receita removida com sucesso.");
}
// FIM DA NOVA FUNÇÃO

// --- FUNÇÃO PARA APAGAR ACOMPANHAMENTO (DO FIRESTORE E DA UI) ---
async function handleDeleteAcompanhamento(acompanhamentoId) {
    if (!confirm("Tem certeza que deseja apagar este Plano de Acompanhamento permanentemente?")) return;

    console.log("handleDeleteAcompanhamento: Iniciando exclusão do Firestore. ID:", acompanhamentoId);

    try {
        // 1. Define a referência na COLEÇÃO RAIZ e apaga do Firestore
        const docRef = doc(db, 'acompanhamentos', acompanhamentoId);
        await deleteDoc(docRef);

        console.log("Acompanhamento apagado do Firestore.");

        // 2. Remove do array 'acompanhamentosDaSessaoAtual' (Consulta)
        acompanhamentosDaSessaoAtual = acompanhamentosDaSessaoAtual.filter(ac => ac.id !== acompanhamentoId);

        // 3. Atualiza a UI da sub-aba "Dados da Consulta"
        renderAcompanhamentoEmDadosDaConsulta(); 

        console.log("handleDeleteAcompanhamento: UI de acompanhamento atualizada.");
        alert("Plano de Acompanhamento removido com sucesso.");

    } catch (error) {
         console.error("Erro ao apagar acompanhamento do Firestore:", error);
         alert("Ocorreu um erro ao apagar o plano. Verifique o console.");
    }
}
// FIM DA NOVA FUNÇÃO

// --- FUNÇÃO PARA GERAR PDF DO ACOMPANHAMENTO ---
async function gerarPDFAcompanhamento(acompanhamentoId) {
    if (!currentPatientId || !acompanhamentoId) {
        alert("Erro: Não foi possível identificar o paciente ou o acompanhamento.");
        return;
    }

    const template = document.getElementById('pdf-acompanhamento-template');
    if (!template) {
        alert("Erro: Template PDF 'pdf-acompanhamento-template' não encontrado no HTML.");
        return;
    }

    // 1. Encontra os dados do acompanhamento
    // Busca no array da sessão atual (pois o botão está na aba Dados da Consulta)
    const acompData = acompanhamentosDaSessaoAtual.find(ac => ac.id === acompanhamentoId);

    if (!acompData) {
         alert("Erro: Dados do acompanhamento não encontrados na sessão atual.");
         // (No futuro, poderíamos buscar no Firestore como fallback)
         return;
    }

    console.log("Gerando PDF para Acompanhamento:", acompData);

    // 2. Popula os campos do template
    try {
        // Dados do Profissional (da assinatura digital salva no objeto)
        document.getElementById('pdf-acomp-doctor-name').textContent = acompData.assinatura_digital?.nome || "Profissional";
        document.getElementById('pdf-acomp-doctor-specialty').textContent = acompData.assinatura_digital?.especialidade || "Especialidade";
        document.getElementById('pdf-acomp-doctor-crm').textContent = acompData.assinatura_digital?.crm || "CRM/UF";

        // Dados do Paciente (do 'currentPatientData' global)
        document.getElementById('pdf-acomp-patient-name').textContent = currentPatientData.nome || "Paciente";

        // Formata a data de início
        const dataInicioObj = new Date(acompData.data_inicio);
        document.getElementById('pdf-acomp-emission-date').textContent = dataInicioObj.toLocaleDateString('pt-BR');

        // Popula a lista de Metas
        const metasListEl = document.getElementById('pdf-acomp-metas-list');
        if (metasListEl) {
            if (acompData.metas && acompData.metas.length > 0) {
                 metasListEl.innerHTML = acompData.metas.map(meta => `<li>${meta}</li>`).join('');
            } else {
                 metasListEl.innerHTML = "<li>Nenhuma meta específica definida.</li>";
            }
        }

        // Popula Duração e Lembretes
        document.getElementById('pdf-acomp-duracao').textContent = acompData.duracao_dias > 0 ? `${acompData.duracao_dias} dias` : 'Contínuo';
        document.getElementById('pdf-acomp-lembretes').textContent = acompData.notificacoes_ativas ? 'Sim, via app' : 'Não';

        // Assinatura
        document.getElementById('pdf-acomp-signature-name').textContent = acompData.assinatura_digital?.nome || "Profissional";

    } catch (populateError) {
         console.error("Erro ao popular o template PDF do Acompanhamento:", populateError);
         alert("Erro ao preparar dados para o PDF.");
         return;
    }


    // 3. Lógica de Geração do PDF (igual às outras)
    loadingOverlay.classList.remove('hidden');
    template.style.left = '0';
    try {
        await new Promise(r => setTimeout(r, 100)); // Delay para renderização
        const canvas = await html2canvas(template, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`plano-acompanhamento-${currentPatientData.nome.split(' ')[0]}.pdf`);
    } catch (error) {
        console.error("Erro ao gerar PDF do Acompanhamento:", error);
        alert("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
        template.style.left = '-9999px';
        loadingOverlay.classList.add('hidden');
    }
}
// FIM DA NOVA FUNÇÃO

// INÍCIO DA NOVA FUNÇÃO (para colar no JS)

// --- FUNÇÃO PARA APAGAR RECEITA (DA SESSÃO E DO LOCALSTORAGE) ---
async function handleDeleteReceita(recipeIdStr) {
    // 1. Confirmação
    if (!confirm("Tem certeza que deseja apagar esta receita permanentemente?\n(Ela será removida desta consulta E do histórico principal)")) return;

    console.log("handleDeleteReceita: Iniciando exclusão do ID:", recipeIdStr);
    const recipeId = parseInt(recipeIdStr, 10);

    // 2. Remove do array global 'allRecipes' (Histórico)
    allRecipes = allRecipes.filter(r => r.id !== recipeId && r.id.toString() !== recipeIdStr);

    // 3. Remove do array 'receitasDaSessaoAtual' (Consulta)
    receitasDaSessaoAtual = receitasDaSessaoAtual.filter(r => r.id !== recipeId && r.id.toString() !== recipeIdStr);

    // 4. Salva o array histórico atualizado no localStorage
    localStorage.setItem('orionHealth_allRecipes', JSON.stringify(allRecipes));

    // 5. Atualiza TODAS as UIs de receita
    applyRecipeFilters(); // Atualiza a aba principal "Receitas"
    renderReceitasEmDadosDaConsulta(); // Atualiza a sub-aba "Dados da Consulta"

    console.log("handleDeleteReceita: Todas as UIs de receita foram atualizadas.");

    alert("Receita removida com sucesso.");
}
// FIM DA NOVA FUNÇÃO


// ==========================================================
// NOVA FUNÇÃO PARA APAGAR NOTA MÉDICA DO FIRESTORE
// (Cole esta função no seu prontuario-paciente.js)
// ==========================================================
async function handleDeleteNotaMedica(notaId) {
    // 1. Confirmação
    if (!confirm("Tem certeza que deseja apagar esta nota médica permanentemente?")) {
        return; // Usuário cancelou
    }

    console.log(`handleDeleteNotaMedica: Iniciando exclusão da nota ID: ${notaId}`);

    // Verifica IDs necessários
    if (!db || !currentPatientId || !notaId) {
        alert("Erro: Não foi possível identificar a nota ou o paciente para apagar.");
        console.error("handleDeleteNotaMedica: DB, currentPatientId ou notaId está faltando.");
        return;
    }

    // Mostra feedback (opcional)
    // loadingOverlay?.classList.remove('hidden');

    try {
        // 2. Define a referência do documento na subcoleção e apaga
        const notaDocRef = doc(db, 'pacientes', currentPatientId, 'notasMedicas', notaId);
        await deleteDoc(notaDocRef);
        console.log("handleDeleteNotaMedica: Nota apagada do Firestore com sucesso.");

        // 3. Recarrega a lista de notas para atualizar a UI
        //    (Garante que a função loadNotasMedicasFromFirestore existe)
        if (typeof loadNotasMedicasFromFirestore === 'function') {
            await loadNotasMedicasFromFirestore();
            console.log("handleDeleteNotaMedica: Lista de notas atualizada.");
        } else {
             console.warn("handleDeleteNotaMedica: Função loadNotasMedicasFromFirestore não encontrada para atualizar a lista.");
             // Como fallback, podemos tentar remover o card manualmente, mas recarregar é mais seguro
             // const cardToRemove = document.querySelector(`.nota-medica-card[data-nota-id="${notaId}"]`);
             // if (cardToRemove) cardToRemove.remove();
        }

        alert("Nota médica apagada com sucesso.");

    } catch (error) {
        console.error("Erro ao apagar nota médica do Firestore:", error);
        alert("Ocorreu um erro ao apagar a nota. Verifique o console.");
         // Verificar erro de permissão pode ser útil
         if (error.code === 'permission-denied') {
             alert("Erro de permissão ao apagar a nota. Verifique as Regras de Segurança.");
         }
    } finally {
        // Esconde feedback (opcional)
        // loadingOverlay?.classList.add('hidden');
    }
}
// ==========================================================
// FIM DA FUNÇÃO handleDeleteNotaMedica
// ==========================================================


// ==========================================================
// NOVA FUNÇÃO PARA PREPARAR A EDIÇÃO DE NOTA MÉDICA
// (Cole esta função no seu prontuario-paciente.js)
// ==========================================================
async function handleEditNotaMedica(notaId) {
    console.log(`handleEditNotaMedica: Preparando edição para nota ID: ${notaId}`);

    // Verifica IDs e DB
    if (!db || !currentPatientId || !notaId) {
        alert("Erro: Não foi possível carregar a nota para edição.");
        console.error("handleEditNotaMedica: DB, currentPatientId ou notaId está faltando.");
        return;
    }

    // Referências aos elementos de edição (na coluna da direita)
    const textareaNotasMedico = document.getElementById('notas-medico-texto');
    const btnSalvar = document.getElementById('salvar-notas-btn');
    const formNotasMedico = document.getElementById('form-notas-medico'); // Precisamos do form para guardar o ID

    if (!textareaNotasMedico || !btnSalvar || !formNotasMedico) {
        alert("Erro: Área de edição de notas não encontrada na página.");
        console.error("handleEditNotaMedica: Textarea, botão de salvar ou formulário de notas não encontrado.");
        return;
    }

    // Mostra feedback (opcional)
    // loadingOverlay?.classList.remove('hidden');

    try {
        // 1. Busca os dados da nota específica no Firestore
        const notaDocRef = doc(db, 'pacientes', currentPatientId, 'notasMedicas', notaId);
        const docSnap = await getDoc(notaDocRef);

        if (!docSnap.exists()) {
            throw new Error("Nota médica não encontrada no banco de dados.");
        }

        const notaData = docSnap.data();
        console.log("handleEditNotaMedica: Dados da nota carregados:", notaData);

        // 2. Preenche a textarea com o texto da nota
        textareaNotasMedico.value = notaData.texto || '';
        textareaNotasMedico.focus(); // Coloca o cursor na textarea
        // (Opcional) Rola a página para a área de edição ficar visível
         formNotasMedico.scrollIntoView({ behavior: 'smooth', block: 'center' });


        // 3. Muda o texto do botão para "Atualizar"
        btnSalvar.innerHTML = '<i class="fa-solid fa-sync-alt"></i> Atualizar Anotação';

        // 4. Armazena o ID da nota que está sendo editada
        // Usaremos um atributo 'data-' no próprio formulário para guardar o ID
        formNotasMedico.dataset.editingNotaId = notaId;
        console.log(`handleEditNotaMedica: ID ${notaId} armazenado em formNotasMedico.dataset.editingNotaId`);

        // (Opcional) Atualiza contador de caracteres, se houver
        const charCountEl = document.getElementById('notas-char-count');
        if (charCountEl) {
             const currentLength = textareaNotasMedico.value.length;
             // Supondo que o limite é 407 (do seu HTML)
             charCountEl.textContent = `${currentLength}`;
             // Poderíamos adicionar lógica para mudar a cor se exceder o limite
        }


    } catch (error) {
        console.error("Erro ao carregar nota médica para edição:", error);
        alert("Ocorreu um erro ao carregar a nota para edição. Verifique o console.");
        // Resetar o estado de edição em caso de erro
        formNotasMedico.dataset.editingNotaId = '';
        btnSalvar.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Anotações';
    } finally {
        // Esconde feedback (opcional)
        // loadingOverlay?.classList.add('hidden');
    }
}
// ==========================================================
// FIM DA FUNÇÃO handleEditNotaMedica
// ==========================================================

       // INÍCIO DO BLOCO COMPLETO E CORRETO PARA APAGAR  ATESTADO
async function handleDeleteAtestado(atestadoId) { // Recebe o ID do Firestore
    // 1. Confirmação
    if (!confirm("Tem certeza que deseja apagar este atestado permanentemente?")) return;

    console.log("handleDeleteAtestado: Iniciando exclusão do Firestore. ID:", atestadoId);

    // Verifica se temos os IDs necessários
    if (!currentPatientId || !atestadoId) {
        alert("Erro: Não foi possível identificar o paciente ou o atestado para apagar.");
        console.error("handleDeleteAtestado: currentPatientId ou atestadoId está faltando.");
        return;
    }

    try {
        // 2. Define a referência do documento na subcoleção e apaga
        const docRef = doc(db, 'pacientes', currentPatientId, 'atestados', atestadoId);
        await deleteDoc(docRef);
        console.log("Atestado apagado do Firestore com sucesso.");

        // 3. Remove do array 'atestadosDaSessaoAtual' (Consulta)
        atestadosDaSessaoAtual = atestadosDaSessaoAtual.filter(a => a.id !== atestadoId);

        // 4. ATUALIZA A UI DA SUB-ABA "DADOS DA CONSULTA"
        renderAtestadosEmDadosDaConsulta();

        console.log("handleDeleteAtestado: UI de atestados atualizada.");
        alert("Atestado removido com sucesso.");

    } catch (error) {
        console.error("Erro ao apagar atestado do Firestore:", error);
        alert("Ocorreu um erro ao apagar o atestado. Verifique o console.");
    }
}

// FIM DO BLOCO COMPLETO 


   async function gerarPDFAtestado(atestadoIdStr) {
    const atestadoId = parseInt(atestadoIdStr, 10);
    // Usamos o 'allAtestados' que já está na memória
    const atestadoData = allAtestados.find(a => a.id === atestadoId);

    if (!atestadoData) {
        alert("Erro: Atestado não encontrado.");
        return;
    }

    const template = document.getElementById('pdf-atestado-template');
    if (!template) {
        alert("Erro: Template PDF 'pdf-atestado-template' não encontrado no HTML.");
        return;
    }

    // Popula os campos do template
    document.getElementById('pdf-atestado-doctor-name').textContent = atestadoData.medico;
    document.getElementById('pdf-atestado-doctor-specialty').textContent = atestadoData.especialidade_profissional;
    document.getElementById('pdf-atestado-doctor-crm').textContent = atestadoData.registro_profissional;

    document.getElementById('pdf-atestado-patient-name').textContent = atestadoData.pacienteNome;
    // Formata a data de emissão que está em ISO
    document.getElementById('pdf-atestado-emission-date').textContent = new Date(atestadoData.emissao).toLocaleDateString('pt-BR');

    // Popula o corpo do atestado
    const pacienteBody = template.querySelector('#pdf-atestado-patient-name-body');
    if (pacienteBody) pacienteBody.textContent = atestadoData.pacienteNome;

    const diasBody = template.querySelector('#pdf-atestado-dias');
    if (diasBody) diasBody.textContent = atestadoData.diasAfastamento;

    const dataInicioBody = template.querySelector('#pdf-atestado-data-inicio');
    if (dataInicioBody) dataInicioBody.textContent = new Date(atestadoData.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR');

    document.getElementById('pdf-atestado-motivo').textContent = atestadoData.motivo;
    document.getElementById('pdf-atestado-cid').textContent = atestadoData.cid;
    document.getElementById('pdf-atestado-observacoes').textContent = atestadoData.observacoes || "Nenhuma.";

    document.getElementById('pdf-atestado-signature-name').textContent = atestadoData.medico;

    loadingOverlay.classList.remove('hidden');
    template.style.left = '0'; 
    try {
        await new Promise(r => setTimeout(r, 100)); 
        const canvas = await html2canvas(template, { scale: 3, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`atestado-${atestadoData.pacienteNome.split(' ')[0]}.pdf`);
    } catch (error) {
        console.error("Erro ao gerar PDF do atestado:", error);
        alert("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
        template.style.left = '-9999px'; 
        loadingOverlay.classList.add('hidden');
    }
}



// --- INÍCIO DO LISTENER PARA AÇÕES (PDF/APAGAR) NA ABA DADOS DA CONSULTA (RECEITAS) ---
    const dadosClinicosReceitasLista = document.getElementById('dados-clinicos-receitas-lista');
    if (dadosClinicosReceitasLista) {
        dadosClinicosReceitasLista.addEventListener('click', (e) => {
            const pdfBtn = e.target.closest('.btn-pdf');
            const deleteBtn = e.target.closest('.btn-delete'); 

            // Ação Gerar PDF
            if (pdfBtn && pdfBtn.dataset.recipeId) { 
                e.preventDefault();
                console.log("Gerando PDF (Dados da Consulta) para receita ID:", pdfBtn.dataset.recipeId);

                const recipeIdStr = pdfBtn.dataset.recipeId;
                const recipeId = parseInt(recipeIdStr, 10);
                const recipeData = allRecipes.find(r => r.id === recipeId || r.id.toString() === recipeIdStr);

                if (recipeData) {
                    generateRecipePDF(recipeData); // Chama a função PDF existente
                } else {
                    alert("Erro: Receita não encontrada para gerar PDF.");
                }
                return; 
            }

            // Ação Apagar
            if (deleteBtn && deleteBtn.dataset.recipeId) { 
                // --- SUBSTITUA O CÓDIGO ANTIGO POR ISTO ---
                console.log("Botão Apagar (Aba Principal) clicado...");
                handleDeleteReceita(deleteBtn.dataset.recipeId); // Chama a nova função unificada
                // --- FIM DA SUBSTITUIÇÃO ---
            }
        });
    } else {
        console.warn("Container '#dados-clinicos-receitas-lista' não encontrado. Listeners de ação não adicionados.");
    }
    // --- FIM DO LISTENER ---

    // --- INÍCIO DO LISTENER PARA AÇÕES (PDF/APAGAR) NA ABA DADOS DA CONSULTA (ENCAMINHAMENTOS) ---
    const dadosClinicosEncaminhamentosLista = document.getElementById('dados-clinicos-encaminhamentos-lista');
    if (dadosClinicosEncaminhamentosLista) {
        dadosClinicosEncaminhamentosLista.addEventListener('click', (e) => {
            const pdfBtn = e.target.closest('.btn-pdf');
            const deleteBtn = e.target.closest('.btn-delete'); 

            // Ação Gerar PDF
            if (pdfBtn && pdfBtn.dataset.encaminhamentoId) { 
                e.preventDefault();
                console.log("Gerando PDF (Dados da Consulta) para encaminhamento ID:", pdfBtn.dataset.encaminhamentoId);
                gerarPDFEncaminhamento(pdfBtn.dataset.encaminhamentoId); // Chama a função PDF existente
                return; 
            }

            // Ação Apagar
            if (deleteBtn && deleteBtn.dataset.encaminhamentoId) { 
                console.log("Apagando (Dados da Consulta) encaminhamento ID:", deleteBtn.dataset.encaminhamentoId);
                handleDeleteEncaminhamento(deleteBtn.dataset.encaminhamentoId); // Chama a função de apagar unificada
            }
        });
    } else {
        console.warn("Container '#dados-clinicos-encaminhamentos-lista' não encontrado. Listeners de ação não adicionados.");
    }
    // --- FIM DO LISTENER ---

    // --- INÍCIO DO LISTENER PARA AÇÕES (PDF/APAGAR) NA ABA DADOS DA CONSULTA (EXAMES) ---
    const dadosClinicosExamesLista = document.getElementById('dados-clinicos-exames-lista');
    if (dadosClinicosExamesLista) {
        dadosClinicosExamesLista.addEventListener('click', (e) => {
            const pdfBtn = e.target.closest('.btn-pdf');
            const deleteBtn = e.target.closest('.btn-delete'); 

            // Ação Gerar PDF
            if (pdfBtn && pdfBtn.dataset.exameId) { 
                e.preventDefault();
                console.log("Gerando PDF (Dados da Consulta) para exame ID:", pdfBtn.dataset.exameId);

                // A função gerarPDFExame [cite: 6233-6269] lê do array 'mockExames'
                gerarPDFExame(pdfBtn.dataset.exameId); // Chama a função PDF existente
                return; 
            }

            // Ação Apagar
            if (deleteBtn && deleteBtn.dataset.exameId) { 
                console.log("Apagando (Dados da Consulta) exame ID:", deleteBtn.dataset.exameId);
                handleDeleteExame(deleteBtn.dataset.exameId); // Chama a função de apagar unificada
            }
        });
    } else {
        console.warn("Container '#dados-clinicos-exames-lista' não encontrado. Listeners de ação não adicionados.");
    }
    // --- FIM DO LISTENER ---

    // --- INÍCIO DO LISTENER PARA AÇÕES (PDF/APAGAR) NA ABA DADOS DA CONSULTA (ACOMPANHAMENTO) ---
    const dadosClinicosAcompanhamentoResumo = document.getElementById('dados-clinicos-acompanhamento-resumo');
    if (dadosClinicosAcompanhamentoResumo) {
        dadosClinicosAcompanhamentoResumo.addEventListener('click', (e) => {
            const pdfBtn = e.target.closest('.btn-pdf');
            const deleteBtn = e.target.closest('.btn-delete'); 

            // Ação Gerar PDF
            if (pdfBtn && pdfBtn.dataset.acompanhamentoId) { 
                e.preventDefault();
                console.log("Gerando PDF (Dados da Consulta) para acompanhamento ID:", pdfBtn.dataset.acompanhamentoId);
                // TODO: Criar a função 'gerarPDFAcompanhamento(id)'
                gerarPDFAcompanhamento(pdfBtn.dataset.acompanhamentoId); // <<< gerar pdf acompanhamento 
                return; 
            }

            // Ação Apagar
            if (deleteBtn && deleteBtn.dataset.acompanhamentoId) { 
                console.log("Apagando (Dados da Consulta) acompanhamento ID:", deleteBtn.dataset.acompanhamentoId);
                handleDeleteAcompanhamento(deleteBtn.dataset.acompanhamentoId); // Chama a função de apagar unificada
            }
        });
    } else {
        console.warn("Container '#dados-clinicos-acompanhamento-resumo' não encontrado. Listeners de ação não adicionados.");
    }
    // --- FIM DO LISTENER ---
    
// --- INÍCIO DO LISTENER PARA AÇÕES (PDF/APAGAR) NA ABA DADOS DA CONSULTA (ATESTADOS) ---
    const dadosClinicosAtestadosLista = document.getElementById('dados-clinicos-atestados-lista');
    if (dadosClinicosAtestadosLista) {
        dadosClinicosAtestadosLista.addEventListener('click', (e) => {
            const pdfBtn = e.target.closest('.btn-pdf');
            const deleteBtn = e.target.closest('.btn-delete'); 

            if (pdfBtn && pdfBtn.dataset.atestadoId) { 
                console.log("Gerando PDF (Dados da Consulta) para atestado ID:", pdfBtn.dataset.atestadoId);
                gerarPDFAtestado(pdfBtn.dataset.atestadoId); // Chama a função PDF existente
                return; 
            }

            if (deleteBtn && deleteBtn.dataset.atestadoId) { 
                console.log("Apagando (Dados da Consulta) atestado ID:", deleteBtn.dataset.atestadoId);
                handleDeleteAtestado(deleteBtn.dataset.atestadoId); // Chama a função de apagar existente
            }
        });
    } else {
        console.warn("Container '#dados-clinicos-atestados-lista' não encontrado. Listeners de ação não adicionados.");
    }
    // --- FIM DO LISTENER ---



    // ==========================================================
// CORREÇÃO: BUSCAR DADOS REAIS DO FIRESTORE
// Substitua a função loadPatientData antiga por esta
// ==========================================================

const loadPatientData = async (patientId) => {
    console.log("loadPatientData: Buscando dados reais no Firestore para o ID:", patientId);

    if (!db || !patientId) {
        console.error("Erro: DB não inicializado ou ID inválido.");
        return;
    }

    try {
        // 1. Busca o documento do paciente na coleção 'pacientes'
        const docRef = doc(db, 'pacientes', patientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // 2. Se encontrou, guarda os dados na variável global
            currentPatientData = docSnap.data();
            console.log("Dados do paciente carregados com sucesso:", currentPatientData);

            // 3. Atualiza o Cabeçalho (Foto, Nome, Plano)
            populateHeader(currentPatientData, patientId);

            // 4. Carrega as receitas (agora que temos o paciente confirmado)
            loadRecipeData(); 
            
        } else {
            // 5. Se o documento não existir no Firestore
            console.error("Documento do paciente não encontrado no Firestore.");
            
            // NÃO APAGA O HTML. Mostra apenas um alerta e usa dados genéricos para não quebrar a página
            alert("Aviso: Registo do paciente não encontrado na base de dados. A mostrar modo de visualização.");
            
            currentPatientData = { 
                nome: "Paciente Desconhecido", 
                idade: "--", 
                plano: "Sem Convênio" 
            };
            populateHeader(currentPatientData, patientId);
        }

    } catch (error) {
        console.error("Erro fatal ao buscar paciente no Firestore:", error);
        // Mantém a página viva mesmo com erro
    }
};

    const loadProfessionalData = async (professionalId) => {
        if (!professionalId) return;
        try {
            const profDocRef = doc(db, 'profissionais', professionalId);
            const docSnap = await getDoc(profDocRef);
            if (docSnap.exists()) {
                currentProfessionalData = docSnap.data();
            } else {
                console.warn("Documento do profissional não encontrado no Firestore:", professionalId);
                currentProfessionalData = { nome: "Profissional Desconhecido" }; // Fallback
            }
        } catch (error) {
            console.error("Erro ao carregar dados do profissional:", error);
            currentProfessionalData = { nome: "Erro ao Carregar" }; // Fallback
        }
    };
    
    // --- FUNÇÃO AUXILIAR PARA CALCULAR IDADE ---
  function calcularIdade(dataNascimento) {
      if (!dataNascimento) return '--';
      const hoje = new Date();
      const nasc = new Date(dataNascimento);
      let idade = hoje.getFullYear() - nasc.getFullYear();
      const m = hoje.getMonth() - nasc.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
          idade--;
      }
      return idade;
  }

  // --- FUNÇÃO POPULATE HEADER CORRIGIDA ---
  const populateHeader = (data, uid) => {
      // 1. FOTO: Tenta encontrar a foto em vários campos possíveis
      const fotoUrl = data.foto_url || data.photoURL || data.foto;
      
      if (patientPhoto) {
          if (fotoUrl) {
              patientPhoto.src = fotoUrl;
          } else {
              // Se não tiver foto, cria um placeholder com a inicial do nome
              const initial = (data.nome || 'P').charAt(0).toUpperCase();
              patientPhoto.src = `https://placehold.co/60x60/a0d9e5/41b8d5?text=${initial}`;
          }
          patientPhoto.alt = `Foto de ${data.nome || 'Paciente'}`;
      }

      // 2. NOME
      if (patientName) {
          patientName.textContent = data.nome || 'Paciente Sem Nome';
      }

      // 3. DETALHES (Idade e Convênio)
      if (patientMetaInfo) {
          // Calcula a idade se houver data de nascimento
          const idade = data.data_nascimento ? calcularIdade(data.data_nascimento) : (data.idade || '--');
          
          // Tenta buscar o convênio (pode ser um objeto ou string)
          let convenioNome = "Particular";
          if (data.convenio && typeof data.convenio === 'object') {
              convenioNome = data.convenio.nome || "Particular";
          } else if (data.convenio) {
              convenioNome = data.convenio;
          } else if (data.plano) {
               convenioNome = data.plano; // Suporte a dados antigos
          }

          // Formata o texto final
          patientMetaInfo.textContent = `${idade} anos • ${convenioNome}`;
      }
  };

    // --- FUNÇÃO PARA CONFIGURAR TODOS OS EVENT LISTENERS ---
    const addEventListeners = () => {
        // --- Listeners para Navegação Principal (Abas e Menu Mobile) ---
        if (tabNav) tabNav.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn) switchTab(tabBtn.dataset.tab);
        });
        if (hamburgerMenu) hamburgerMenu.addEventListener('click', openMobileMenu);
        if (closeMobileMenuButton) closeMobileMenuButton.addEventListener('click', closeMobileMenu);
        if (backdrop) backdrop.addEventListener('click', closeMobileMenu);
        if (mobileNavMenu) mobileNavMenu.addEventListener('click', (e) => {
            const navLink = e.target.closest('.mobile-nav-link');
            if (navLink) { e.preventDefault(); switchTab(navLink.dataset.tab); closeMobileMenu(); }
            const actionBtn = e.target.closest('.mobile-action-btn');
            if (actionBtn) { handleActionClick(actionBtn.dataset.action); closeMobileMenu(); }
        });
        
        // --- Listeners para Ações Globais (Header Desktop e Footer Mobile) ---
        if (headerActions) headerActions.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-action]');
            if (btn) handleActionClick(btn.dataset.action);
        });
        if (actionFooter) actionFooter.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (btn) handleActionClick(btn.dataset.action);
        });

        if (examesSubTabNav) {
            examesSubTabNav.addEventListener('click', (e) => {
                const btn = e.target.closest('.sub-tab-btn');
                if (btn && btn.dataset.subtab === 'solicitacoes') {
                    loadExamesDoPaciente(); // <--- Carrega quando clica na sub-aba
                }
            });
        }
        // --- Listeners para Navegação de Sub-Abas ---
        if (examesSubTabNav) {
            examesSubTabNav.addEventListener('click', (e) => {
                const subTabBtn = e.target.closest('.sub-tab-btn');
                if (subTabBtn) switchExameSubTab(subTabBtn.dataset.subtab);
            });
        }
        // --- Listener para as Sub-Abas de Registros (Sono, Humor, Biometria, etc.) ---
    if (registrosDiariosSubTabNav) {
        registrosDiariosSubTabNav.addEventListener('click', (e) => {
            const btn = e.target.closest('.sub-tab-btn');
            if (btn) {
                e.preventDefault(); // Boa prática

                // 1. Atualiza os botões (Visual)
                registrosDiariosSubTabNav.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // 2. Esconde todos os painéis
                document.querySelectorAll('#tab-registros-diarios .sub-tab-panel').forEach(p => p.classList.add('hidden'));
                
                // 3. Mostra o painel certo
                const subTabId = btn.dataset.subtab;
                const painel = document.getElementById(`subtab-registros-${subTabId}`);
                if (painel) painel.classList.remove('hidden');
                
                // 4. A CORREÇÃO MÁGICA: Manda desenhar os gráficos AGORA
                // Como o painel acabou de ficar visível, o Chart.js já consegue desenhar.
                console.log(`Trocando para sub-aba: ${subTabId}. Redesenhando gráficos...`);
                renderHistoricoModal(); 
            }
        });
    }

        // --- Listeners para Buscas e Filtros ---
        if (recipeSearchInput) recipeSearchInput.addEventListener('input', applyRecipeFilters);
        if (recipeFilterGroup) recipeFilterGroup.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn-small')) {
                recipeFilterGroup.querySelector('.active')?.classList.remove('active');
                e.target.classList.add('active');
                applyRecipeFilters();
            }
        });
       // --- LISTENER PARA BUSCA NA ANAMNESE ---
    const anamneseSearchInput = document.getElementById('anamnese-search-input');
    
    if (anamneseSearchInput) {
        // 'input' dispara a cada letra digitada (busca em tempo real)
        anamneseSearchInput.addEventListener('input', aplicarFiltroAnamnese);
        
        console.log("Busca da Anamnese ativada.");
    }
        if (encaminhamentoSearchInput) encaminhamentoSearchInput.addEventListener('input', aplicarFiltroEncaminhamentos);
        if (exameSolicitacaoSearchInput) exameSolicitacaoSearchInput.addEventListener('input', aplicarFiltroExames);
        if (exameResultadoSearchInput) exameResultadoSearchInput.addEventListener('input', aplicarFiltroResultadosExames);
        if (exameFilterGroup) exameFilterGroup.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn-small')) {
                exameFilterGroup.querySelector('.active')?.classList.remove('active');
                e.target.classList.add('active');
                aplicarFiltroExames();
            }
        });
        
        // --- Listeners para Interações dentro das Listas de Cards ---
        if (recipeListContainer) {
            recipeListContainer.addEventListener('click', (e) => {
                const pdfLink = e.target.closest('.pdf-link');
                const deleteBtn = e.target.closest('.btn-delete'); 
                
                if (pdfLink) { 
                    e.preventDefault();
                    const recipeIdStr = pdfLink.dataset.recipeId;
                    const recipeId = parseInt(recipeIdStr, 10);
                    const recipeData = allRecipes.find(r => r.id === recipeId || r.id.toString() === recipeIdStr);
                    if (recipeData) generateRecipePDF(recipeData);
                    return; 
                } 
                
                if (deleteBtn && deleteBtn.dataset.recipeId) { 
            // --- SUBSTITUA O CÓDIGO ANTIGO POR ISTO ---
            console.log("Botão Apagar (Aba Principal) clicado, chamando handleDeleteReceita..."); // Log
            handleDeleteReceita(deleteBtn.dataset.recipeId); // Chama a nova função unificada
            // --- FIM DA SUBSTITUIÇÃO ---
        }
            });
        }

        const encaminhamentoContainer = document.getElementById('encaminhamento-container');
        if (encaminhamentoContainer) {
            encaminhamentoContainer.addEventListener('click', (e) => {
                const pdfBtn = e.target.closest('.btn-pdf');
                const deleteBtn = e.target.closest('.btn-delete'); 
                if (pdfBtn && pdfBtn.dataset.encaminhamentoId) { 
                    gerarPDFEncaminhamento(pdfBtn.dataset.encaminhamentoId);
                    return; 
                }
                if (deleteBtn && deleteBtn.dataset.encaminhamentoId) { 
                    handleDeleteEncaminhamento(deleteBtn.dataset.encaminhamentoId);
                }
            });
        }

        const examesContainer = document.getElementById('exames-solicitacoes-container');
        if (examesContainer) {
            examesContainer.addEventListener('click', (e) => {
                const pdfBtn = e.target.closest('.btn-pdf');
                const deleteBtn = e.target.closest('.btn-delete'); 
                if (pdfBtn && pdfBtn.dataset.exameId) { 
                    gerarPDFExame(pdfBtn.dataset.exameId);
                    return; 
                }
                if (deleteBtn && deleteBtn.dataset.exameId) { 
                    handleDeleteExame(deleteBtn.dataset.exameId);
                }
            });
        }

        // --- Listeners para Filtros de Gráficos ---
        // --- Listener para Filtros de Gráficos (CORRIGIDO) ---
    // (Botões de 7 dias, 30 dias, etc.)
    const registrosDiariosTab = document.getElementById('tab-registros-diarios');
    
    if (registrosDiariosTab) {
        registrosDiariosTab.addEventListener('click', (e) => {
            // Verifica se clicou num botão de filtro
            const filterBtn = e.target.closest('.chart-filters .filter-btn-small');
            
            if (filterBtn) {
                // 1. Atualiza visualmente o botão ativo
                const filterGroup = filterBtn.closest('.chart-filters');
                if (filterGroup) {
                    filterGroup.querySelectorAll('.filter-btn-small').forEach(btn => btn.classList.remove('active'));
                    filterBtn.classList.add('active');
                }

                // 2. Chama a função REAl para redesenhar os gráficos
                // (Ela lê automaticamente qual botão está ativo)
                console.log("Filtro de período alterado. Redesenhando gráficos...");
                renderHistoricoModal();
            }
        });
    }
        
        // --- Listeners para Filtros de Medicação (Gráfico e Lista) ---
        
         if (medicacaoPeriodFilters) {
            medicacaoPeriodFilters.addEventListener('click', (e) => {
                 const filterBtn = e.target.closest('.filter-btn-small');
                 if (filterBtn) {
                    const period = parseInt(filterBtn.dataset.period, 10); // 1. Pega o período do data-period
                     console.log(`Botão de período clicado: ${filterBtn.textContent.trim()}, data-period = ${period}`); // 2. Mostra no console
                     medicacaoPeriodFilters.querySelectorAll('.filter-btn-small').forEach(btn => btn.classList.remove('active'));
                     filterBtn.classList.add('active');
                     applyMedicamentoFilter(); 
                 }
             });
         }
        if (medicacaoListContainer) {
            medicacaoListContainer.addEventListener('click', (e) => {
                const verCompletoBtn = e.target.closest('.ver-completo-btn');
                if (verCompletoBtn && verCompletoBtn.dataset.id) {
                    showMedicacaoDetalhe(verCompletoBtn.dataset.id);
                }
            });
        }
        if (closeMedicacaoDetalheModalButton) {
            closeMedicacaoDetalheModalButton.addEventListener('click', () => closeModal(medicacaoDetalheModal));
        }
         if (fecharMedicacaoDetalheBtn) {
             fecharMedicacaoDetalheBtn.addEventListener('click', () => closeModal(medicacaoDetalheModal));
         }
        if (medicacaoDetalheModal) {
            medicacaoDetalheModal.addEventListener('click', (e) => {
                if (e.target === medicacaoDetalheModal) { closeModal(medicacaoDetalheModal); }
            });
        }

        // --- LISTENER PARA O FORMULÁRIO "SALVAR ANOTAÇÕES" (Notas do Médico) ---
    const formNotasMedico = document.getElementById('form-notas-medico'); // <<< ID do FORMULÁRIO

    if (formNotasMedico) {
        formNotasMedico.addEventListener('submit', async (e) => {
            e.preventDefault();

            // <<< MUDANÇA AQUI: Verifica se estamos editando ANTES >>>
            const notaIdParaAtualizar = formNotasMedico.dataset.editingNotaId;
            const isEditing = !!notaIdParaAtualizar; // True se tiver ID no dataset
            console.log(`Submit formNotasMedico: Modo Edição = ${isEditing}, ID = ${notaIdParaAtualizar}`);

            const textareaNotasMedico = document.getElementById('notas-medico-texto');
            const btnSalvar = document.getElementById('salvar-notas-btn');

            if (!textareaNotasMedico || !btnSalvar) { /* ... erro ... */ return; }

            const notaTexto = textareaNotasMedico.value.trim();
            if (notaTexto === '' && !isEditing) { /* ... alerta ... */ return; } // Só exige texto na criação
            // <<< MUDANÇA AQUI: Permitir salvar texto vazio em edição (para apagar o conteúdo da nota) >>>
            // Se estiver editando e o texto estiver vazio, pode prosseguir (para atualizar com vazio)

            if (!db || !currentUser || !currentPatientId) { /* ... erro ... */ return; }

            btnSalvar.disabled = true;
            const originalBtnHTMLCreate = '<i class="fa-solid fa-save"></i> Salvar Anotações'; // Texto padrão
            const originalBtnHTMLUpdate = '<i class="fa-solid fa-sync-alt"></i> Atualizar Anotação'; // Texto de edição
            btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

            try {
                // 1. Prepara o objeto de dados
                const notaDataFirestore = {
                    texto: notaTexto, // Salva o texto (mesmo que vazio, se estiver editando)
                    id_profissional: currentUser.uid, // Não muda
                    medico_nome: currentProfessionalData?.nome || "Profissional", // Não muda
                    paciente_id: currentPatientId, // Não muda
                    // <<< MUDANÇA AQUI: Timestamp condicional >>>
                    ...(isEditing ? { ultima_atualizacao: serverTimestamp() } : { timestamp: serverTimestamp() })
                };

                console.log(`Dados da Nota para ${isEditing ? 'ATUALIZAR' : 'CRIAR'}:`, notaDataFirestore);

                let docId = null; // Para guardar o ID (novo ou existente)
                let successMessage = '';

                // <<< MUDANÇA AQUI: Lógica IF/ELSE para Criar ou Atualizar >>>
                if (isEditing) {
                    // --- ATUALIZAÇÃO ---
                    console.log("Atualizando Nota Médica no Firestore. ID:", notaIdParaAtualizar);
                    const notaDocRef = doc(db, 'pacientes', currentPatientId, 'notasMedicas', notaIdParaAtualizar);
                    // Usamos updateDoc para atualizar apenas os campos enviados (texto, ultima_atualizacao)
                    await updateDoc(notaDocRef, notaDataFirestore);
                    docId = notaIdParaAtualizar; // Mantém o ID existente
                    successMessage = "Anotação atualizada com sucesso!";
                } else {
                    // --- CRIAÇÃO ---
                    console.log("Criando nova Nota Médica no Firestore...");
                    const notasMedicasRef = collection(db, 'pacientes', currentPatientId, 'notasMedicas');
                    const docRef = await addDoc(notasMedicasRef, notaDataFirestore);
                    docId = docRef.id; // Guarda o ID do novo documento
                    successMessage = "Anotação salva com sucesso!";
                }
                console.log("Operação no Firestore concluída. ID:", docId);

                // 3. Limpa a textarea e o estado de edição
                textareaNotasMedico.value = '';
                const charCountEl = document.getElementById('notas-char-count');
                if(charCountEl) charCountEl.textContent = '0';
                // <<< MUDANÇA AQUI: Limpa o ID de edição do dataset >>>
                formNotasMedico.dataset.editingNotaId = '';

                // 4. Feedback de sucesso
                alert(successMessage);

                // 5. Atualiza a lista de notas (se a aba estiver visível)
                if (!document.getElementById('subtab-painel-notas-medicas')?.classList.contains('hidden')) {
                     await loadNotasMedicasFromFirestore();
                     console.log("Lista de Notas Médicas atualizada após salvar/atualizar.");
                }

            } catch (error) {
                console.error(`Erro ao ${isEditing ? 'atualizar' : 'salvar'} anotação no Firestore:`, error);
                alert(`Ocorreu um erro ao ${isEditing ? 'atualizar' : 'salvar'} a anotação. Verifique o console.`);
                 if (error.code === 'permission-denied') {
                     alert(`Erro de permissão ao ${isEditing ? 'atualizar' : 'salvar'} a nota. Verifique as Regras de Segurança.`);
                 }
            } finally {
                // Reabilita o botão e RESETA o texto para "Salvar Anotações"
                btnSalvar.disabled = false;
                btnSalvar.innerHTML = originalBtnHTMLCreate; // <<< MUDANÇA AQUI: Sempre reseta para o botão de criar
            }
        }); // Fim do listener 'submit'
    } else {
        console.warn("Formulário de Notas do Médico (#form-notas-medico) não encontrado. Listener não adicionado.");
    }

    // --- FIM DO LISTENER "SALVAR ANOTAÇÕES" ---
const historicoAcompModal = document.getElementById('historico-acompanhamento-modal');
const closeHistAcompBtn = document.getElementById('close-historico-acomp-modal');
const btnFecharHistAcomp = document.getElementById('btn-fechar-historico-acomp');

if (closeHistAcompBtn) closeHistAcompBtn.addEventListener('click', () => closeModal(historicoAcompModal));
if (btnFecharHistAcomp) btnFecharHistAcomp.addEventListener('click', () => closeModal(historicoAcompModal));
if (historicoAcompModal) {
    historicoAcompModal.addEventListener('click', (e) => {
        if (e.target === historicoAcompModal) closeModal(historicoAcompModal);
    });
}


// --- LISTENER: BOTÕES DA ABA ENCAMINHAMENTOS (MÉDICO) ---
    const encContainer = document.getElementById('encaminhamento-container');
    if (encContainer) {
        encContainer.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.encId;

            if (!id) return;

            // AÇÃO 1: GERAR PDF
            if (action === 'gerar-pdf-encaminhamento') {
                e.preventDefault();
                console.log("Gerando PDF do Encaminhamento ID:", id);
                // Chama a função de PDF (que vamos criar no Passo 3)
                if (typeof gerarPDFEncaminhamentoMedico === 'function') {
                    gerarPDFEncaminhamentoMedico(id);
                } else {
                    alert("Erro: Função de PDF não encontrada.");
                }
            }

            // AÇÃO 2: APAGAR
            if (action === 'apagar-enc') {
                e.preventDefault();
                if (confirm('Tem certeza que deseja excluir este encaminhamento?')) {
                    try {
                        // Apaga do Firestore
                        await deleteDoc(doc(db, 'pacientes', currentPatientId, 'encaminhamentos', id));
                        // Remove visualmente
                        const card = btn.closest('.recipe-card');
                        if (card) card.remove();
                        alert("Encaminhamento excluído.");
                    } catch (error) {
                        console.error("Erro ao excluir:", error);
                        alert("Erro ao excluir.");
                    }
                }
            }
        });
    }




// --- Listener para o Painel Lateral de Acompanhamentos ---
    const painelAcompContainer = document.getElementById('painel-acompanhamentos-lista');
    
    if (painelAcompContainer) {
        painelAcompContainer.addEventListener('click', (e) => {
            // Procura se o clique foi num botão com data-action
            const btn = e.target.closest('[data-action="ver-historico-acomp"]');
            
            if (btn) {
                e.preventDefault();
                const id = btn.dataset.planoId;
                const titulo = btn.dataset.titulo;
                
                console.log("Abrindo histórico para:", titulo);
                // Chama a função que já criámos
                openHistoricoAcompanhamento(id, titulo);
            }
        });
    }

    // --- LISTENER PARA AÇÕES (EDITAR/APAGAR) NOS CARDS DE NOTAS MÉDICAS ---
    const notasMedicasListaContainer = document.getElementById('registros-notas-medicas-lista');
    if (notasMedicasListaContainer) {
        notasMedicasListaContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-nota');
            const editBtn = e.target.closest('.btn-edit-nota');

            // Ação Apagar
            if (deleteBtn && deleteBtn.dataset.notaId) {
                const notaId = deleteBtn.dataset.notaId;
                console.log("Botão Apagar Nota Médica clicado. ID:", notaId);
                handleDeleteNotaMedica(notaId); // <<< VAMOS CRIAR ESTA FUNÇÃO
            }
            // Ação Editar (preparado para depois)
            else if (editBtn && editBtn.dataset.notaId) {
                const notaId = editBtn.dataset.notaId;
                console.log("Botão Editar Nota Médica clicado. ID:", notaId);
                handleEditNotaMedica(notaId); 
            }
        });
    } else {
        console.warn("Container '#registros-notas-medicas-lista' não encontrado para adicionar listener de ações.");
    }
    // --- FIM DO LISTENER DE AÇÕES DAS NOTAS ---

        // --- LISTENER PARA O BOTÃO "VISUALIZAR CONSULTA" NO HISTÓRICO ---
    const historicoContainer = document.querySelector('.historico-consultas-lista');
    if (historicoContainer) {
        historicoContainer.addEventListener('click', (e) => {
            const visualizarBtn = e.target.closest('.btn-visualizar-consulta');
            const editarBtn = e.target.closest('.btn-editar-consulta'); // <<< ADICIONE ESTA LINHA
            if (visualizarBtn && visualizarBtn.dataset.consultaId) {
                const consultaId = visualizarBtn.dataset.consultaId;
                console.log("Botão Visualizar Consulta clicado. ID:", consultaId);
                // Chama a função que vai buscar os dados e abrir o modal
                handleVisualizarConsulta(consultaId);
            }

            // Poderíamos adicionar o listener para o botão Editar aqui depois
            else if (editarBtn && editarBtn.dataset.consultaId) {
                const consultaId = editarBtn.dataset.consultaId;
                console.log("Botão Editar Consulta clicado. ID:", consultaId);
                // Chama a função que vai buscar os dados e abrir o modal de edição
                handleEditarConsulta(consultaId); 
            }
        
        });
    } else {
        console.warn("Container do histórico '.historico-consultas-lista' não encontrado para adicionar listener de visualização.");
    }
    // --- FIM DO LISTENER DE VISUALIZAÇÃO ---

        // --- Listeners para Ações e Fechamento de Modais ---
        document.getElementById('close-encaminhar-modal')?.addEventListener('click', () => closeModal(encaminharModal));
        document.getElementById('btn-solicitar-encaminhamento')?.addEventListener('click', () => {
            closeModal(encaminharModal);
            document.getElementById('form-encaminhamento')?.reset();
            const dataIndicacao = document.getElementById('data-indicacao');
            if (dataIndicacao) dataIndicacao.value = new Date().toISOString().split('T')[0];
            const signature = document.getElementById('encaminhamento-signature-name-modal');
            if (signature) signature.textContent = currentProfessionalData.nome || "Profissional";
            openModal(formEncaminhamentoModal);
        });
        document.getElementById('btn-solicitar-exames')?.addEventListener('click', () => {
            closeModal(encaminharModal);
            document.getElementById('form-exame')?.reset();
            if (selectedExamsContainer) selectedExamsContainer.innerHTML = '';
            const dataExame = document.getElementById('data-solicitacao-exame');
            if (dataExame) dataExame.value = new Date().toISOString().split('T')[0];
            const signature = document.getElementById('exame-signature-name-modal');
            if (signature) signature.textContent = currentProfessionalData.nome || "Profissional";
            openModal(formExameModal);
        });
        
        // Listener para o botão "Solicitar Receita" DENTRO do modal de decisão
        if (btnSolicitarReceita) {
            btnSolicitarReceita.addEventListener('click', () => {
                closeModal(encaminharModal); 
                formAddMedicamento?.reset(); 
                formReceitaFinal?.reset();
                medicamentosDaReceitaAtual = []; 
                renderMedicamentosNoModal();
                receitaErrorMessage?.classList.add('hidden'); 
                if (formReceitaModal) formReceitaModal.querySelector('.modal-title').innerHTML = '<i class="fa-solid fa-prescription-bottle-medical"></i> Criar Nova Receita';
                if (formReceitaFinal) formReceitaFinal.querySelector('button[type="submit"]').textContent = 'Salvar Receita Completa';
                if (receitaSignatureNameModal) {
                    receitaSignatureNameModal.textContent = currentProfessionalData.nome || "Profissional";
                }
                openModal(formReceitaModal);
            });
        }
        
        // Listeners para fechar modais
        document.getElementById('close-form-encaminhamento-modal')?.addEventListener('click', () => closeModal(formEncaminhamentoModal));
        document.getElementById('close-form-exame-modal')?.addEventListener('click', () => closeModal(formExameModal));
        if (closeFormReceitaModalButton) { closeFormReceitaModalButton.addEventListener('click', () => closeModal(formReceitaModal)); }
        if (cancelReceitaButton) { cancelReceitaButton.addEventListener('click', () => closeModal(formReceitaModal)); }
        if (cancelEncaminhamentoButton) { cancelEncaminhamentoButton.addEventListener('click', () => closeModal(formEncaminhamentoModal)); }
        if (cancelExameButton) { cancelExameButton.addEventListener('click', () => closeModal(formExameModal)); }

        // Fechar modais clicando fora (no overlay)
        if (formReceitaModal) { formReceitaModal.addEventListener('click', (e) => { if (e.target === formReceitaModal) { closeModal(formReceitaModal); } }); }
        if (formEncaminhamentoModal) { formEncaminhamentoModal.addEventListener('click', (e) => { if (e.target === formEncaminhamentoModal) { closeModal(formEncaminhamentoModal); } }); }
        if (formExameModal) { formExameModal.addEventListener('click', (e) => { if (e.target === formExameModal) { closeModal(formExameModal); } }); }
        if (encaminharModal) { encaminharModal.addEventListener('click', (e) => { if (e.target === encaminharModal) { closeModal(encaminharModal); } }); }


        // --- Listeners para Submissão de Formulários ---
        
        // Listener para o mini-form de adicionar medicamento
        if (formAddMedicamento) {
            formAddMedicamento.addEventListener('submit', handleAddMedicamento);
        }

        // Listener para apagar um item da lista DENTRO do modal
        if (medicamentosAdicionadosList) {
            medicamentosAdicionadosList.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.btn-delete-mini');
                if (deleteBtn) {
                    const indexToRemove = parseInt(deleteBtn.dataset.index, 10);
                    medicamentosDaReceitaAtual.splice(indexToRemove, 1);
                    renderMedicamentosNoModal();
                }
            });
        }

        // Listener para o form principal de salvar a receita
        if (formReceitaFinal) {
            formReceitaFinal.addEventListener('submit', async (e) => {
                e.preventDefault(); // Impede o recarregamento da página
                if (!currentUser || !currentPatientId) return;
                
                if (medicamentosDaReceitaAtual.length === 0) {
                    receitaErrorMessage.textContent = "Adicione pelo menos um medicamento à receita antes de salvar.";
                    receitaErrorMessage.classList.remove('hidden');
                    return;
                }
                receitaErrorMessage?.classList.add('hidden');
                loadingOverlay?.classList.remove('hidden');
               try {
            // 1. Pega os dados do profissional
            const nomeMedicoCorreto = currentProfessionalData.nome || "Profissional";

            // 2. Prepara o objeto de dados (sem o 'id' local)
            const novaReceitaData = {
                medico: nomeMedicoCorreto,
                id_profissional: currentUser.uid,
                status: 'Ativa',
                emissao: new Date().toISOString(), // Salva data e hora completas
                observacoesGerais: observacoesGeraisInput.value || "",
                medicamentos: medicamentosDaReceitaAtual, // Array de medicamentos
                especialidade_profissional: currentProfessionalData.especialidade || "",
                registro_profissional: currentProfessionalData.registro_profissional || "",
                pacienteNome: currentPatientData.nome, // Salva o nome do paciente
                // Adiciona timestamp para ordenação
                timestamp: serverTimestamp() 
            };

            // 3. Define a referência e salva no Firestore
            const receitasRef = collection(db, 'pacientes', currentPatientId, 'receitas');
            const docRef = await addDoc(receitasRef, novaReceitaData);

            console.log("Receita salva no Firestore com sucesso! ID:", docRef.id);

            // 4. Prepara os dados para a UI (adicionando o ID do Firestore)
            const novaReceitaUI = {
                ...novaReceitaData,
                id: docRef.id, // Usa o ID real do Firestore
                emissao: novaReceitaData.emissao // (já é string ISO)
            };

            // 5. Atualiza os arrays locais para a UI
            allRecipes.unshift(novaReceitaUI); // Adiciona ao histórico principal
            receitasDaSessaoAtual.push(novaReceitaUI); // Adiciona à sessão atual

            // 6. Atualiza as UIs
            alert('Receita salva com sucesso!');
            applyRecipeFilters(); // Atualiza a aba principal "Receitas"
            renderReceitasEmDadosDaConsulta(); // Atualiza a sub-aba "Dados da Consulta"

            closeModal(formReceitaModal);
            medicamentosDaReceitaAtual = []; // Limpa array temporário

        } catch (error) {
            console.error("Erro ao salvar receita (Firestore):", error);
            if(receitaErrorMessage) {
                receitaErrorMessage.textContent = "Ocorreu um erro ao salvar a receita no banco de dados.";
                receitaErrorMessage.classList.remove('hidden');
            }
        } finally {
            loadingOverlay?.classList.add('hidden');
        }
            });
        }
        
        // --- LISTENER DO FORMULÁRIO DE ENCAMINHAMENTO (Adicione isto) ---
  if (formEncaminhamento) {
      const especialidadeSelect = document.getElementById('especialidade');
      const inputOutra = document.getElementById('especialidade-outra');
      
      // Lógica para mostrar o campo "Outra" quando selecionado
      if (especialidadeSelect) {
          especialidadeSelect.addEventListener('change', (e) => {
              if(inputOutra) inputOutra.classList.toggle('hidden', e.target.value !== 'Outra');
          });
      }

      // O evento de SALVAR
      formEncaminhamento.addEventListener('submit', async (e) => {
          e.preventDefault(); // Impede recarregar a página
          
          if (!currentUser || !currentPatientId) {
             alert("Erro: Dados do paciente ou médico em falta.");
             return;
          }

          // Mostra loading
          if (loadingOverlay) loadingOverlay.classList.remove('hidden');
          
          // Verifica qual especialidade usar (do Select ou do Input "Outra")
          const especialidadeSelectVal = especialidadeSelect ? especialidadeSelect.value : "";
          const especialidadeFinal = especialidadeSelectVal === 'Outra' 
              ? (inputOutra ? inputOutra.value : "") 
              : especialidadeSelectVal;

          try {
              // 1. Prepara o objeto de dados
              const encaminhamentoDataFirestore = {
                  especialidade: especialidadeFinal,
                  motivo: document.getElementById('motivo').value,
                  recomendacoes: document.getElementById('recomendacoes').value,
                  data: document.getElementById('data-indicacao').value,
                  
                  // Metadados
                  criado_por: currentUser.uid,
                  id_profissional: currentUser.uid,
                  nome_profissional: currentProfessionalData.nome || "Profissional",
                  registro_profissional: currentProfessionalData.registro_profissional || "",
                  especialidade_profissional: currentProfessionalData.especialidade || "",
                  
                  status: "Pendente",
                  origem: "medico", // Importante para saber quem criou
                  timestamp: serverTimestamp()
              };

              console.log("Salvando Encaminhamento na pasta do Paciente...", encaminhamentoDataFirestore);

              // 2. CORREÇÃO CRÍTICA: Salvar na pasta 'pacientes/{id}/encaminhamentos'
              const encaminhamentoRef = collection(db, 'pacientes', currentPatientId, 'encaminhamentos');
              const docRef = await addDoc(encaminhamentoRef, encaminhamentoDataFirestore);
              
              console.log("Encaminhamento salvo com sucesso! ID:", docRef.id);

              // 3. Atualiza a UI da Sessão Atual (Modal) para aparecer na lista "Dados da Consulta"
              const novoEncaminhamentoUI = {
                  ...encaminhamentoDataFirestore,
                  id: docRef.id,
                  timestamp: new Date().toISOString()
              };

              if (typeof encaminhamentosDaSessaoAtual !== 'undefined') {
                  encaminhamentosDaSessaoAtual.push(novoEncaminhamentoUI);
                  renderEncaminhamentosEmDadosDaConsulta(); 
              }

              // 4. Atualiza a UI do Perfil do Paciente (Aba Encaminhamentos)
              // Se a variável global da aba existir, adicionamos lá também para aparecer imediatamente
              if (typeof allEncaminhamentos !== 'undefined') {
                  allEncaminhamentos.unshift(novoEncaminhamentoUI);
                  // Se tiveres a função de renderizar a lista principal, chama-a aqui:
                  if (typeof renderEncaminhamentoList === 'function') {
                      renderEncaminhamentoList(allEncaminhamentos);
                  }
              }

              // 5. Fecha e Limpa
              closeModal(formEncaminhamentoModal);
              formEncaminhamento.reset();
              
              // Reseta a data para hoje
              const dataInput = document.getElementById('data-indicacao');
              if (dataInput) dataInput.value = new Date().toISOString().split('T')[0];

              alert('Encaminhamento salvo com sucesso!');

          } catch (error) {
              console.error('Erro ao salvar encaminhamento:', error);
              alert('Erro ao salvar encaminhamento. Tente novamente.');
          } finally {
              if (loadingOverlay) loadingOverlay.classList.add('hidden');
          }
      });
  }
     // --- LISTENER ATUALIZADO (V3): SALVAR E ATUALIZAR UI ---
if (formExame) {
    if (exameSearchInput) {
        exameSearchInput.addEventListener('input', renderExameSuggestions);
        exameSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); addExameToList(exameSearchInput.value); }
        });
    }

    formExame.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        if (!currentUser || !currentPatientId) {
            alert("Erro: Identificação do médico ou paciente em falta.");
            return;
        }

        const selectedExamTags = selectedExamsContainer.querySelectorAll('.selected-exam-tag');
        const examNames = Array.from(selectedExamTags).map(tag => tag.firstChild.textContent.trim());
        
        if (examNames.length === 0) { 
            alert("Por favor, adicione pelo menos um exame à lista."); 
            return; 
        }

        loadingOverlay?.classList.remove('hidden');

        try {
            // 1. Prepara os dados
            const exameDataFirestore = {
                tiposExame: examNames,
                motivo: document.getElementById('motivo-exame').value || "Rotina",
                jejumNecessario: document.getElementById('jejum-necessario').checked,
                dataSolicitacao: document.getElementById('data-solicitacao-exame').value || new Date().toISOString(),
                
                id_profissional: currentUser.uid,
                nome_profissional: currentProfessionalData.nome || "Profissional",
                registro_profissional: currentProfessionalData.registro_profissional || "",
                especialidade_profissional: currentProfessionalData.especialidade || "",
                
                status: "Solicitado",
                origem: "medico",
                timestamp: serverTimestamp()
            };

            // 2. Salva no Firestore
            const examesRef = collection(db, 'pacientes', currentPatientId, 'exames');
            const docRef = await addDoc(examesRef, exameDataFirestore);
            
            // 3. Cria o objeto para a Interface
            const novoExameUI = {
                ...exameDataFirestore,
                id: docRef.id,
                timestamp: new Date().toISOString() 
            };

            // --- ATUALIZAÇÃO 1: Lista do Modal (Dados da Consulta) ---
            examesDaSessaoAtual.push(novoExameUI);
            renderExamesEmDadosDaConsulta();

            // --- ATUALIZAÇÃO 2: Lista da ABA EXAMES (CORREÇÃO AQUI) ---
            // Tenta atualizar a variável 'mockExames' (usada pelo teu código antigo)
            if (typeof mockExames !== 'undefined') {
                mockExames.unshift(novoExameUI);
                console.log("Adicionado à lista 'mockExames'.");
            } 
            // Tenta atualizar 'allExames' (caso já tenhas migrado)
            else if (typeof allExames !== 'undefined') {
                allExames.unshift(novoExameUI);
                console.log("Adicionado à lista 'allExames'.");
            }

            // Força o redesenho da aba usando a tua função original
            if (typeof aplicarFiltroExames === 'function') {
                aplicarFiltroExames(); 
            } else if (typeof applyExameFilters === 'function') {
                applyExameFilters();
            }

            // 4. Limpeza
            closeModal(formExameModal);
            selectedExamsContainer.innerHTML = '';
            formExame.reset();
            
            const dataInput = document.getElementById('data-solicitacao-exame');
            if (dataInput) dataInput.value = new Date().toISOString().split('T')[0];

            alert('Solicitação de exame salva com sucesso!');

        } catch (error) {
            console.error("Erro ao salvar exame:", error);
            alert('Ocorreu um erro ao salvar. Verifique o console.');
        } finally {
            loadingOverlay?.classList.add('hidden');
        }
    });
}
        

        // --- INÍCIO: LISTENERS DO PAINEL CLÍNICO ---
        if (painelClinicoSubTabNav) {
            painelClinicoSubTabNav.addEventListener('click', (e) => {
                const subTabBtn = e.target.closest('.sub-tab-btn');
                if (subTabBtn) {
                    const subTabId = subTabBtn.dataset.subtab;
                    painelClinicoSubTabNav.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
                    subTabBtn.classList.add('active');
                    document.querySelectorAll('.coluna-principal .sub-tab-panel').forEach(panel => panel.classList.add('hidden'));
                    const activePanel = document.getElementById(`subtab-painel-${subTabId}`);
                    if (activePanel) activePanel.classList.remove('hidden');

                        // --- ADICIONE ESTE BLOCO ---
                    // Se a aba clicada for a de Notas Médicas, carrega os dados
                    if (subTabId === 'notas-medicas') {
                        console.log("Aba 'Notas Médicas' ativada. Carregando notas...");
                        loadNotasMedicasFromFirestore(); // Chama a função para buscar e renderizar
                    }
                // --- FIM DO BLOCO ADICIONADO ---
                }
            });
        }
        // CÓDIGO FINAL DO LISTENER historicoConsultasLista:


        // --- LISTENER PARA FECHAR MODAL CLICANDO FORA (VISUALIZAR CONSULTA) ---
    const visualizarModal = document.getElementById('visualizar-consulta-modal');
    if (visualizarModal) {
        visualizarModal.addEventListener('click', (e) => {
            // Verifica se o clique foi DIRETAMENTE no fundo do modal (o overlay)
            // e NÃO em algum elemento dentro dele (como o modal-content ou botões)
            if (e.target === visualizarModal) {
                console.log("Clique fora do conteúdo do modal de visualização detectado. Fechando modal.");
                closeModal(visualizarModal); // Chama a função que já temos para fechar
            }
        });
    } else {
        console.warn("Modal #visualizar-consulta-modal não encontrado para adicionar listener de clique externo.");
    }
    // --- FIM DO LISTENER DE CLIQUE EXTERNO ---

        if (historicoConsultasLista) {
            historicoConsultasLista.addEventListener('click', (e) => {
                const consultaCard = e.target.closest('.consulta-card');

                // --- BLOCO 'IF' MODIFICADO ---
                if (consultaCard) {
                    const consultaId = consultaCard.dataset.consultaId;

                    // Apenas registra o clique, mas não faz mais nada (não abre o modal)
                    console.log('Card da consulta clicado:', consultaId, '- Abertura do modal está DESATIVADA aqui.');
                }
                // --- FIM DO BLOCO 'IF' MODIFICADO ---

            }); // Fim do addEventListener
        } // Fim do if (historicoConsultasLista)

// FIM DO CÓDIGO FINAL
        if (closeConsultaModalButton) {
            closeConsultaModalButton.addEventListener('click', () => closeModal(consultaModal));
        }
        if (consultaModal) {
            consultaModal.addEventListener('click', (e) => {
                if (e.target === consultaModal) { 
                    closeModal(consultaModal);
                }
            });
        }
        if (consultaSubTabNav) {
            consultaSubTabNav.addEventListener('click', (e) => {
                const subTabBtn = e.target.closest('.sub-tab-btn');
                if (subTabBtn) {
                    const subTabId = subTabBtn.dataset.subtab;
                    switchConsultaSubTab(subTabId); // Troca a aba

                    
                }
            });
        }
        if (salvarNotasBtn) salvarNotasBtn.addEventListener('submit', (e) => {
             e.preventDefault(); 
             alert("Lógica para Salvar Anotações (Etapa 3)");
        });
        if (consultaGerarPdfBtn) consultaGerarPdfBtn.addEventListener('click', () => alert("Lógica para Gerar PDF da Consulta (Etapa 4)"));


        // --- LISTENER: CONFIRMAR ATENDIMENTO (LIBERAR PAGAMENTO + NOTIFICAÇÃO) ---
  if (consultaConfirmarBtn) {
      consultaConfirmarBtn.addEventListener('click', async (e) => {
          e.preventDefault();

          if (!currentUser || !currentPatientId) return;

          // 1. Confirmação visual
          if (!confirm("Confirma que o atendimento foi realizado? Isso irá liberar o valor da consulta para a sua conta.")) {
              return;
          }

          const btn = e.target.closest('button');
          const textoOriginal = btn.innerHTML;
          btn.disabled = true;
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';

          try {
              // 2. Procura a transação financeira deste paciente que está "presa" (Aguardando)
              const q = query(
                  collection(db, "transacoes_financeiras"),
                  where("paciente_id", "==", currentPatientId),
                  where("medico_id", "==", currentUser.uid),
                  where("status", "==", "Aguardando Atendimento")
              );

              const snapshot = await getDocs(q);

              if (snapshot.empty) {
                  alert("Aviso: Não foi encontrada nenhuma transação pendente para liberar. (Talvez já tenha sido paga).");
                  btn.disabled = false;
                  btn.innerHTML = textoOriginal;
                  return;
              }

              // 3. Atualiza para "Pago" (Libera o dinheiro)
              let valorLiberado = 0;
              const updatePromises = snapshot.docs.map(doc => {
                  const data = doc.data();
                  valorLiberado = data.valor || 0; // Guarda o valor para a mensagem
                  
                  return updateDoc(doc.ref, { 
                      status: "Pago",
                      data_liberacao: serverTimestamp()
                  });
              });

              await Promise.all(updatePromises);

              // 4. [NOVO] ENVIA NOTIFICAÇÃO DE PAGAMENTO LIBERADO AO MÉDICO
              try {
                  const nomePaciente = currentPatientData.nome || "Paciente";
                  const valorFormatado = valorLiberado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                  const notifData = {
                      titulo: "Pagamento Liberado",
                      mensagem: `O valor de ${valorFormatado} da consulta com ${nomePaciente} foi liberado na sua conta.`,
                      lida: false,
                      tipo: 'financeiro', // Ícone de dinheiro/gráfico
                      link: 'relatorio-profissional.html', // Ao clicar, leva ao extrato
                      timestamp: serverTimestamp()
                  };

                  // Grava na caixa de correio do próprio médico
                  await addDoc(collection(db, 'profissionais', currentUser.uid, 'notificacoes'), notifData);
                  console.log("Notificação de liberação enviada.");

              } catch (errNotif) {
                  console.error("Erro ao enviar notificação (não bloqueante):", errNotif);
              }
              // ------------------------------------------------------------

              // 5. Sucesso Visual
              alert("Consulta confirmada! O valor foi creditado no seu relatório financeiro.");
              
              // Muda o botão para verde (Sucesso)
              btn.innerHTML = '<i class="fa-solid fa-check-double"></i> Atendimento Confirmado';
              btn.classList.remove('btn-secondary-painel');
              btn.classList.add('btn-primary-painel');
              
          } catch (error) {
              console.error("Erro ao confirmar atendimento:", error);
              alert("Erro ao processar a liberação do pagamento.");
              btn.disabled = false;
              btn.innerHTML = textoOriginal;
          }
      });
  }



        
        
        if (btnModalAbrirReceita) btnModalAbrirReceita.addEventListener('click', () => {
            handleActionClick('nova-receita');
            
        });
        if (btnModalAbrirEncaminhamento) btnModalAbrirEncaminhamento.addEventListener('click', () => {
            document.getElementById('form-encaminhamento')?.reset();
            const dataIndicacao = document.getElementById('data-indicacao');
            if (dataIndicacao) dataIndicacao.value = new Date().toISOString().split('T')[0];
            const signature = document.getElementById('encaminhamento-signature-name-modal');
            if (signature) signature.textContent = currentProfessionalData.nome || "Profissional";
            openModal(formEncaminhamentoModal); 
            
        });
        if (btnModalAbrirExames) {
            btnModalAbrirExames.addEventListener('click', () => {
                document.getElementById('form-exame')?.reset();
                if (selectedExamsContainer) selectedExamsContainer.innerHTML = '';
                const dataExame = document.getElementById('data-solicitacao-exame');
                if (dataExame) dataExame.value = new Date().toISOString().split('T')[0];
                const signature = document.getElementById('exame-signature-name-modal');
                if (signature) signature.textContent = currentProfessionalData.nome || "Profissional";
                openModal(formExameModal);
            });
        }
        
        // --- Listeners do Modal de Atestado ---
        if (btnModalAbrirAtestado) {
            btnModalAbrirAtestado.addEventListener('click', () => {
                formAtestado?.reset(); 
                const pacienteNomeInput = document.getElementById('atestado-paciente-nome');
                if (pacienteNomeInput) pacienteNomeInput.value = currentPatientData.nome || "Paciente";
                const dataInicioInput = document.getElementById('atestado-data-inicio');
                if (dataInicioInput) dataInicioInput.value = new Date().toISOString().split('T')[0]; 
                if (atestadoSignatureNameModal) {
                    atestadoSignatureNameModal.textContent = currentProfessionalData.nome || "Profissional";
                }
                openModal(formAtestadoModal);
            });
        }
        if (closeFormAtestadoModalButton) {
            closeFormAtestadoModalButton.addEventListener('click', () => closeModal(formAtestadoModal));
        }
        if (cancelAtestadoButton) {
            cancelAtestadoButton.addEventListener('click', () => closeModal(formAtestadoModal));
        }
        if (formAtestadoModal) {
            formAtestadoModal.addEventListener('click', (e) => {
                if (e.target === formAtestadoModal) { closeModal(formAtestadoModal); }
            });
        }
        // --- LISTENER ATUALIZADO: SALVAR ATESTADO MÉDICO ---
if (formAtestado) {
    formAtestado.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede recarregar a página
        
        if (!currentUser || !currentPatientId) {
            alert("Erro: Identificação do médico ou paciente em falta.");
            return;
        }

        // 1. Coleta os dados do formulário
        const diasAfastamento = document.getElementById('atestado-dias').value;
        const dataInicio = document.getElementById('atestado-data-inicio').value;
        const cid = document.getElementById('atestado-cid').value;
        const motivo = document.getElementById('atestado-motivo').value;
        const observacoes = document.getElementById('atestado-observacoes').value;
        
        // Pega o tipo (radio button)
        const tipoRadio = document.querySelector('input[name="atestado-tipo"]:checked');
        const tipo = tipoRadio ? tipoRadio.value : 'Afastamento Laboral';

        // Validação básica
        if (!motivo || (!diasAfastamento && !dataInicio)) {
            const errorMsg = document.getElementById('atestado-error-message');
            if(errorMsg) {
                errorMsg.textContent = "Preencha o Motivo e a Data de Início.";
                errorMsg.classList.remove('hidden');
            } else {
                alert("Preencha o Motivo e a Data de Início.");
            }
            return;
        }

        loadingOverlay?.classList.remove('hidden');

        try {
            // 2. Prepara o objeto para o Firestore
            // IMPORTANTE: Salvar em 'pacientes/{id}/atestados'
            const atestadoDataFirestore = {
                // Dados do Atestado
                tipo: tipo,
                motivo: motivo,
                cid: cid || "Não informado",
                diasAfastamento: diasAfastamento || "0",
                dataInicio: dataInicio || new Date().toISOString().split('T')[0],
                observacoes: observacoes || "",
                
                // Metadados
                status: "Válido", // Status inicial
                origem: "medico",
                timestamp: serverTimestamp(),
                emissao: new Date().toISOString(), // Data de emissão (ISO)
                
                // Dados do Profissional
                id_profissional: currentUser.uid,
                medico: currentProfessionalData.nome || "Profissional", // Campo 'medico' para compatibilidade
                nome_profissional: currentProfessionalData.nome || "Profissional",
                registro_profissional: currentProfessionalData.registro_profissional || "",
                especialidade_profissional: currentProfessionalData.especialidade || "",
                
                // Dados do Paciente
                pacienteNome: currentPatientData.nome || "Paciente"
            };

            console.log("A salvar Atestado no Firestore...", atestadoDataFirestore);

            // 3. Salva na coleção DO PACIENTE
            const atestadosRef = collection(db, 'pacientes', currentPatientId, 'atestados');
            const docRef = await addDoc(atestadosRef, atestadoDataFirestore);
            
            console.log("Atestado salvo com sucesso! ID:", docRef.id);

            // 4. Cria objeto para a Interface (Sessão Atual)
            const novoAtestadoUI = {
                ...atestadoDataFirestore,
                id: docRef.id,
                // Garante que a data de início está formatada para o card
                dataInicio: atestadoDataFirestore.dataInicio
            };

            // Adiciona à lista da sessão e atualiza a UI "Dados da Consulta"
            // (Certifica-te que atestadosDaSessaoAtual está declarada no topo)
            if (typeof atestadosDaSessaoAtual !== 'undefined') {
                atestadosDaSessaoAtual.push(novoAtestadoUI);
                renderAtestadosEmDadosDaConsulta();
            }

            // --- ATUALIZAÇÃO EXTRA: Lista da ABA ATESTADOS (Pré-Consulta) ---
            // Se quiseres que apareça logo na aba de cima também:
            if (typeof allAtestados !== 'undefined') {
                allAtestados.unshift(novoAtestadoUI);
                // Chama a função que renderiza a aba principal (se existir)
                // if (typeof renderAtestados === 'function') renderAtestados(allAtestados);
            }

            // 5. Limpeza
            closeModal(formAtestadoModal);
            formAtestado.reset();
            
            // Repõe a data de hoje
            const dataInput = document.getElementById('atestado-data-inicio');
            if (dataInput) dataInput.value = new Date().toISOString().split('T')[0];
            
            // Limpa erro
            const errorMsg = document.getElementById('atestado-error-message');
            if(errorMsg) errorMsg.classList.add('hidden');

            alert('Atestado emitido com sucesso!');

        } catch (error) {
            console.error("Erro ao salvar atestado:", error);
            alert('Ocorreu um erro ao salvar o atestado. Verifique o console.');
        } finally {
            loadingOverlay?.classList.add('hidden');
        }
    });
}
                    // --- CÓDIGO PARA COPIAR (Parte A - Listener) ---
            const btnSalvarConsulta = document.getElementById('consulta-salvar-alteracoes');

            if (btnSalvarConsulta) {
                // Vamos mudar de 'submit' para 'click' se o botão não estiver em um <form> ou
                // manter 'submit' se ele estiver dentro de um form que envolve o modal.
                // Assumindo que ele está dentro de um form associado:
                const formConsulta = btnSalvarConsulta.closest('form'); // Tenta encontrar o form pai

                // Se o botão estiver dentro de um <form>
                if (formConsulta) {
                    formConsulta.addEventListener('submit', (e) => {
                        e.preventDefault(); // Impede o envio padrão do form
                        salvarNovaConsulta(); // Chama a função que faz o trabalho
                    });
                } else {
                    // Se o botão NÃO estiver em um form, usa 'click'
                    btnSalvarConsulta.addEventListener('click', () => {
                        salvarNovaConsulta(); // Chama a função que faz o trabalho
                    });
                }
            }
            // --- FIM DO CÓDIGO PARA COPIAR (Parte A) ---

            // Dentro da função addEventListeners() ou junto com outros listeners

    // INÍCIO DO CÓDIGO FINAL PARA COLAR (Listener btnSalvarSinais)            

        // --- LISTENER PARA AÇÕES NOS CARDS DE SINAIS VITAIS (NA ABA DADOS CLÍNICOS) ---
    const sinaisVitaisListaContainer = document.getElementById('dados-clinicos-sinais-vitais-lista');

    if (sinaisVitaisListaContainer) {
        sinaisVitaisListaContainer.addEventListener('click', async (e) => {
            const target = e.target; // O elemento exato que foi clicado


            

            // Verifica se o clique foi no botão APAGAR ou no ícone dentro dele
            const deleteButton = target.closest('.btn-delete-sv');
            if (deleteButton) {
                const card = deleteButton.closest('.sinais-vitais-card');
                const registroId = card?.dataset.registroId;

                if (registroId && currentPatientId && currentUser) {
                    console.log(`Tentando apagar registro de Sinais Vitais ID: ${registroId}`);
                    // Pede confirmação ao usuário
                    if (confirm("Tem certeza que deseja apagar este registro de Sinais Vitais permanentemente?")) {
                        // Mostra loading (se aplicável)
                        // loadingOverlay?.classList.remove('hidden');
                        try {
                            // Define a referência do documento a ser apagado
                            const docRef = doc(db, 'pacientes', currentPatientId, 'sinaisVitais', registroId);
                            // Apaga o documento no Firestore
                            await deleteDoc(docRef);

                            console.log("Registro apagado com sucesso do Firestore.");
                            // Remove o card da interface
                            card.remove();


                            // --- ADICIONE ESTA LINHA AQUI ---
                        // Remove o item do array da sessão para manter a consistência
                        sinaisVitaisDaSessaoAtual = sinaisVitaisDaSessaoAtual.filter(sv => sv.id !== registroId);
                        console.log("Registro removido do array da sessão 'sinaisVitaisDaSessaoAtual'.");
                        // --- FIM DA LINHA ADICIONADA ---

                            alert("Registro de Sinais Vitais apagado com sucesso.");

                            // Verifica se o container ficou vazio e mostra a mensagem
                            const remainingCards = sinaisVitaisListaContainer.querySelector('.sinais-vitais-card');
                            if (!remainingCards) {
                                 const emptyState = document.getElementById('empty-state-sinais-vitais');
                                 if (emptyState) {
                                     sinaisVitaisListaContainer.appendChild(emptyState);
                                     emptyState.classList.remove('hidden');
                                 } else {
                                      sinaisVitaisListaContainer.innerHTML = '<div class="empty-state-mini" style="text-align: left; padding: 10px 0;"><i class="fa-solid fa-heart-pulse" style="font-size: 1.5rem; margin-bottom: 8px;"></i><p>Nenhum sinal vital registrado.</p></div>';
                                 }
                            }

                        } catch (error) {
                            console.error("Erro ao apagar registro de Sinais Vitais:", error);
                            alert("Ocorreu um erro ao tentar apagar o registro. Verifique a consola.");
                        } finally {
                            // Esconde loading (se aplicável)
                            // loadingOverlay?.classList.add('hidden');
                        }
                    }
                } else {
                    console.error("Não foi possível obter o ID do registro para apagar.");
                }
            }

            // Verifica se o clique foi no botão EDITAR ou no ícone dentro dele
            const editButton = target.closest('.btn-edit-sv');
            if (editButton) {
                 const card = editButton.closest('.sinais-vitais-card');
                 const registroId = card?.dataset.registroId;
                 if (registroId) {
                     console.log(`Botão Editar clicado para registro ID: ${registroId}`);
                     handleEditSinaisVitais(registroId);
                     // Futuramente, chamar a função handleEditSinaisVitais(registroId);
                 }
            }
        });
    } else {
        console.warn("Container 'dados-clinicos-sinais-vitais-lista' não encontrado para adicionar listeners de card.");
    }
    // --- FIM DO LISTENER PARA AÇÕES NOS CARDS DE SINAIS VITAIS ---
        


    
        // Listener para cliques nos cards DENTRO DO MODAL DE CONSULTA
        const atestadosEmitidosContainer = document.getElementById('atestados-emitidos-lista');
        if (atestadosEmitidosContainer) {
            atestadosEmitidosContainer.addEventListener('click', (e) => {
                const pdfBtn = e.target.closest('.btn-pdf');
                const deleteBtn = e.target.closest('.btn-delete'); 

                if (pdfBtn && pdfBtn.dataset.atestadoId) { 
                    gerarPDFAtestado(pdfBtn.dataset.atestadoId);
                    return; 
                }
                
                if (deleteBtn && deleteBtn.dataset.atestadoId) { 
                    handleDeleteAtestado(deleteBtn.dataset.atestadoId);
                }
            });
        }




        // Listener para a busca na aba ATESTADOS
        if (atestadoSearchInput) {
            atestadoSearchInput.addEventListener('input', applyAtestadoFilters);
        }

        // Listener para cliques nos cards da aba ATESTADOS (PDF e Apagar)
        if (atestadosListContainer) {
            atestadosListContainer.addEventListener('click', (e) => {
                const pdfBtn = e.target.closest('.btn-pdf');
                const deleteBtn = e.target.closest('.btn-delete'); 

                if (pdfBtn && pdfBtn.dataset.atestadoId) { 
                    gerarPDFAtestado(pdfBtn.dataset.atestadoId);
                    return; 
                }
                
                if (deleteBtn && deleteBtn.dataset.atestadoId) { 
                    handleDeleteAtestado(deleteBtn.dataset.atestadoId);
                }
            });
        }
        
        

    }; // Dentro da função addEventListeners()

    // --- INÍCIO DO LISTENER PARA SUB-ABAS NÍVEL 2 (Dados da Consulta) ---
    const dadosConsultaSubNav = document.getElementById('dados-consulta-sub-nav');
    if (dadosConsultaSubNav) {
        dadosConsultaSubNav.addEventListener('click', (e) => {
            const subTabBtn = e.target.closest('.sub-tab-btn-level2');
            if (subTabBtn && subTabBtn.dataset.subtabTarget) {
                e.preventDefault();
                const subTabId = subTabBtn.dataset.subtabTarget;
                console.log("Trocando sub-aba Nível 2 para:", subTabId); // Log
                switchDadosConsultaSubTab(subTabId);
            }
        });
    } else {
        console.warn("Navegação de sub-abas Nível 2 ('#dados-consulta-sub-nav') não encontrada.");
    }
    // --- FIM DO LISTENER NÍVEL 2 ---

    // --- INÍCIO DO LISTENER PARA SALVAR ACOMPANHAMENTO ---
   // INÍCIO DO BLOCO COMPLETO PARA COLAR (Listener formAcompanhamento)

// --- INÍCIO DO LISTENER PARA SALVAR ACOMPANHAMENTO (CORRIGIDO - GAVETA DO PACIENTE) ---
const formAcompanhamento = document.getElementById('form-acompanhamento');
if (formAcompanhamento) {
    formAcompanhamento.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        console.log("Formulário de Acompanhamento submetido.");

        const btnSalvar = document.getElementById('btn-salvar-acompanhamento');
        const feedbackEl = document.getElementById('acompanhamento-feedback');

        if (!currentUser || !currentPatientId) {
            alert("Erro: Não foi possível identificar o profissional ou o paciente.");
            return;
        }

        // Desabilita botão
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        if(feedbackEl) feedbackEl.classList.add('hidden');

        try {
            // 1. Coletar Metas
            const metasSelecionadas = [];
            const metasCheckboxes = document.querySelectorAll('input[name="meta-acompanhamento"]:checked');
            metasCheckboxes.forEach(checkbox => metasSelecionadas.push(checkbox.value));

            // 2. Coletar Meta Personalizada
            const metaPersonalizadaInput = document.getElementById('meta-personalizada-input');
            if (metaPersonalizadaInput && metaPersonalizadaInput.value.trim() !== '') {
                metasSelecionadas.push(metaPersonalizadaInput.value.trim());
            }

            // 3. Coletar Outros Dados
            const duracaoSelect = document.getElementById('duracao-acompanhamento');
            const duracao_dias = parseInt(duracaoSelect.value, 10);
            const lembretesCheckbox = document.getElementById('enviar-lembretes');
            const notificacoes_ativas = lembretesCheckbox.checked;

            // 4. Montar o Objeto
            const acompanhamentoData = {
                paciente_id: currentPatientId, // ID do paciente
                medico_id: currentUser.uid,
                data_inicio: new Date().toISOString(),
                duracao_dias: duracao_dias,
                metas: metasSelecionadas,
                notificacoes_ativas: notificacoes_ativas,
                status: "Ativo", // Importante: Maiúscula para bater com o filtro
                assinatura_digital: {
                    nome: currentProfessionalData?.nome || "Profissional",
                    crm: currentProfessionalData?.registro_profissional || "N/A",
                    especialidade: currentProfessionalData?.especialidade || "N/A"
                },
                timestamp: serverTimestamp()
            };

            console.log("Salvando Acompanhamento na pasta do Paciente...", acompanhamentoData);

            // 5. CORREÇÃO CRÍTICA: Salvar na subcoleção 'acompanhamentos' DENTRO do paciente
            const acompanhamentoRef = collection(db, 'pacientes', currentPatientId, 'acompanhamentos');
            const docRef = await addDoc(acompanhamentoRef, acompanhamentoData);
            
            console.log("Acompanhamento salvo com sucesso! ID:", docRef.id);

            // 6. Atualiza a UI da Sessão Atual
            const novoAcompanhamentoUI = {
                ...acompanhamentoData,
                id: docRef.id,
                timestamp: new Date()
            };

            if (typeof acompanhamentosDaSessaoAtual !== 'undefined') {
                acompanhamentosDaSessaoAtual.push(novoAcompanhamentoUI);
                renderAcompanhamentoEmDadosDaConsulta();
            }

            // 7. Feedback
            if (feedbackEl) {
                feedbackEl.textContent = "Plano de Acompanhamento salvo com sucesso!";
                feedbackEl.className = 'feedback-message success show';
                feedbackEl.classList.remove('hidden');
                
                formAcompanhamento.reset();
                setTimeout(() => {
                    feedbackEl.classList.add('hidden');
                }, 3000);
            } else {
                alert("Plano de Acompanhamento salvo com sucesso!");
            }

        } catch (error) {
            console.error("Erro ao salvar Acompanhamento:", error);
            alert("Erro ao salvar o Acompanhamento. Verifique o console.");
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Acompanhamento';
        }
    });
}
// --- FIM DO LISTENER PARA SALVAR ACOMPANHAMENTO ---
// FIM DO BLOCO COMPLETO PARA COLAR
    // --- FIM DO LISTENER PARA SALVAR ACOMPANHAMENTO ---


    // --- INÍCIO DO LISTENER PARA ADICIONAR META PERSONALIZADA ---
const btnAdicionarMeta = document.getElementById('btn-adicionar-meta');
const metaPersonalizadaInput = document.getElementById('meta-personalizada-input');

if (btnAdicionarMeta && metaPersonalizadaInput) {
    btnAdicionarMeta.addEventListener('click', () => {
        console.log("Botão +Adicionar Meta clicado."); // Log 1: Verifica o clique

        const metaTexto = metaPersonalizadaInput.value.trim(); // Pega o texto

        // 1. Verifica se o campo não está vazio
        if (metaTexto === '') {
            alert("Por favor, digite o texto da meta antes de adicionar.");
            metaPersonalizadaInput.focus();
            return;
        }

        // 2. Encontra o container da coluna 2
        const targetList = document.getElementById('metas-coluna-2');

        if (!targetList) {
            console.error("ERRO: Não foi possível encontrar o container '#metas-coluna-2'. Verifique o ID no HTML."); // Log 2: Verifica a coluna
            alert("Erro interno: Não foi possível encontrar a lista de metas.");
            return;
        }

        // 3. Cria o HTML para o novo item
        // O HTML gerado agora inclui um <span> com classe e um <button>
        const novaMetaHTML = `
            <label class="meta-item custom-meta">
                <input type="checkbox" name="meta-acompanhamento" value="${metaTexto}" checked>
                <span class="meta-text">${metaTexto}</span>
                <button type="button" class="btn-delete-meta" aria-label="Remover meta ${metaTexto}">&times;</button>
            </label>
        `;
        // --- FIM DA MUDANÇA ---

        // 4. Adiciona o novo HTML ao final da lista
        targetList.insertAdjacentHTML('beforeend', novaMetaHTML);
        console.log("Nova meta adicionada à UI:", metaTexto); // Log 3: Confirma adição

        // 5. Limpa o input
        metaPersonalizadaInput.value = '';
        metaPersonalizadaInput.focus();
    });
} else {
    // Este log aparecerá se o botão ou o input não forem encontrados QUANDO a página carrega
    console.warn("Botão/Input de meta personalizada (#btn-adicionar-meta ou #meta-personalizada-input) não encontrado. O listener não foi adicionado.");
}
// --- FIM DO LISTENER PARA ADICIONAR META PERSONALIZADA ---

// --- INÍCIO DO LISTENER PARA APAGAR META PERSONALIZADA ---
    // Usamos delegação de evento, ouvindo cliques no container das colunas
    const metasGridContainer = document.querySelector('#subtab-consulta-acompanhamento .metas-grid');
    if (metasGridContainer) {
        metasGridContainer.addEventListener('click', (e) => {
            // Verifica se o elemento clicado foi o nosso botão 'x'
            const deleteButton = e.target.closest('.btn-delete-meta');

            if (deleteButton) {
                e.preventDefault();  // Impede qualquer ação padrão
                e.stopPropagation(); // Impede que o clique no 'x' marque/desmarque o checkbox

                // Encontra o <label> (o item da meta) mais próximo e o remove
                const metaLabel = deleteButton.closest('.meta-item');
                if (metaLabel) {
                    const metaText = metaLabel.querySelector('.meta-text')?.textContent || 'meta desconhecida';
                    console.log("Removendo meta personalizada:", metaText);
                    metaLabel.remove(); // Remove o <label> inteiro do HTML
                }
            }
        });
    } else {
         console.warn("Container '.metas-grid' não encontrado. Listener de apagar meta não adicionado.");
    }
    // --- FIM DO LISTENER PARA APAGAR META PERSONALIZADA ---


// --- INÍCIO DO LISTENER PARA ATUALIZAR LABEL DE DURAÇÃO ---
if (duracaoAcompanhamentoSelect && progressoDiasLabel) {
    duracaoAcompanhamentoSelect.addEventListener('change', (e) => {
        // 1. Pega o valor selecionado (ex: "7", "60", "0")
        const selectedValue = e.target.value; 

        let diasTexto;

        // 2. Verifica se é "Contínuo" (que definimos como valor "0" no HTML)
        if (selectedValue === "0") {
            diasTexto = "Contínuo";
        } else {
            diasTexto = `${selectedValue} dias`; // Ex: "60 dias"
        }

        // 3. Atualiza o texto do span
        progressoDiasLabel.textContent = `0/${diasTexto}`;
        console.log(`Label de progresso atualizado para: 0/${diasTexto}`); // Log
    });
} else {
    console.warn("Elementos de duração do acompanhamento (select ou label) não encontrados. Listener não adicionado.");
}
// --- FIM DO LISTENER DE DURAÇÃO ---


// --- LISTENER PARA FORMULÁRIO DE SINAIS VITAIS (SALVA OU ATUALIZA NO FIRESTORE) ---
const formSinaisVitais = document.getElementById('form-sinais-vitais');
const feedbackSinaisVitais = document.getElementById('sinais-vitais-feedback');
const editIdField = document.getElementById('sv-edit-registro-id'); // Campo oculto que guarda o ID
const submitBtn = document.getElementById('salvar-sinais-vitais-btn'); // Botão 'Registrar'/'Atualizar'

if (formSinaisVitais && editIdField && submitBtn) {
    formSinaisVitais.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário
        console.log("Formulário Sinais Vitais submetido.");

        if (!currentUser || !currentPatientId) {
            alert("Erro: Utilizador ou Paciente não identificado.");
            console.error("ERRO: Tentativa de salvar/atualizar Sinais Vitais sem currentUser ou currentPatientId.");
            return;
        }

        // Desabilita botão e mostra feedback de processamento
        submitBtn.disabled = true;
        const originalButtonHTML = submitBtn.innerHTML; // Guarda HTML original (com ícone)
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        if(feedbackSinaisVitais) feedbackSinaisVitais.classList.add('hidden'); // Esconde feedback anterior

        // 1. Coleta os dados dos campos do formulário
        const sinaisVitaisData = {
            glicemia: document.getElementById('sv-glicemia').value ? parseFloat(document.getElementById('sv-glicemia').value) : null,
            peso: document.getElementById('sv-peso').value ? parseFloat(document.getElementById('sv-peso').value) : null,
            pressaoSistolica: document.getElementById('sv-pressao-sistolica').value ? parseInt(document.getElementById('sv-pressao-sistolica').value) : null,
            pressaoDiastolica: document.getElementById('sv-pressao-diastolica').value ? parseInt(document.getElementById('sv-pressao-diastolica').value) : null,
            temperatura: document.getElementById('sv-temperatura').value ? parseFloat(document.getElementById('sv-temperatura').value) : null,
            freqCardiaca: document.getElementById('sv-freq-cardiaca').value ? parseInt(document.getElementById('sv-freq-cardiaca').value) : null,
            freqRespiratoria: document.getElementById('sv-freq-respiratoria').value ? parseInt(document.getElementById('sv-freq-respiratoria').value) : null,
            saturacaoO2: document.getElementById('sv-saturacao-o2').value ? parseInt(document.getElementById('sv-saturacao-o2').value) : null,
            altura: document.getElementById('sv-altura').value ? parseFloat(document.getElementById('sv-altura').value) : null,
            registradoPor: currentUser.uid, // Guarda quem registrou
            nomeProfissional: currentProfessionalData?.nome || "Profissional", // Nome do profissional
            // consultaId: 'ID_DA_CONSULTA_ATUAL' // ** TODO: Vincular à consulta **
        };

        // Remove campos nulos ou vazios e converte tipos (se possível)
         Object.keys(sinaisVitaisData).forEach(key => {
             const value = sinaisVitaisData[key];
             if (value === null || value === '' || (typeof value === 'number' && isNaN(value))) {
                 // Remove se for null, vazio ou NaN (exceto campos que devem ser string)
                  if (!['registradoPor', 'nomeProfissional', 'consultaId'].includes(key)) {
                      delete sinaisVitaisData[key];
                  }
             } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
                  // Se for string numérica, converte (exceto campos específicos)
                  if (!['registradoPor', 'nomeProfissional', 'consultaId'].includes(key)) {
                      if (['peso', 'altura', 'temperatura'].includes(key)) {
                          sinaisVitaisData[key] = parseFloat(value);
                      } else if (['glicemia', 'pressaoSistolica', 'pressaoDiastolica', 'freqCardiaca', 'freqRespiratoria', 'saturacaoO2'].includes(key)) {
                          sinaisVitaisData[key] = parseInt(value, 10);
                      }
                  }
             }
        });


        // --- VERIFICAÇÃO DE EDIÇÃO E TIMESTAMPS ---
        console.log("--- DEBUG EDICAO ---");
        console.log("Valor de editIdField NO MOMENTO DO SUBMIT:", editIdField ? `'${editIdField.value}'` : "CAMPO OCULTO NÃO ENCONTRADO!");
        const isEditing = editIdField && editIdField.value !== ''; // Verifica se estamos editando
        const registroIdParaAtualizar = isEditing ? editIdField.value : null;
        console.log("Resultado da verificação 'isEditing' NO MOMENTO DO SUBMIT:", isEditing);
        console.log("--- FIM DEBUG EDICAO ---");

        if (!isEditing) {
            sinaisVitaisData.timestamp = serverTimestamp(); // Timestamp de criação
        } else {
            delete sinaisVitaisData.timestamp; // Remove timestamp de criação se existir
            sinaisVitaisData.ultimaAtualizacao = serverTimestamp(); // Timestamp de atualização
        }
        // Adiciona Pressão Formatada APÓS limpeza/conversão
        if (sinaisVitaisData.pressaoSistolica || sinaisVitaisData.pressaoDiastolica) {
             sinaisVitaisData.pressao = `${sinaisVitaisData.pressaoSistolica ?? '--'}/${sinaisVitaisData.pressaoDiastolica ?? '--'}`;
        }


        console.log(isEditing ? `Dados para ATUALIZAR (ID: ${registroIdParaAtualizar}):` : "Dados para CRIAR:", sinaisVitaisData);


        try {
            let docRef;
            let successMessage = '';

            // Prepara os dados para o Firestore (já inclui dataRegistro: new Date())
            // O objeto 'sinaisVitaisData' já foi criado acima no seu código

            if (isEditing && registroIdParaAtualizar) {
                // --- ATUALIZAÇÃO ---
                console.log(`Atualizando Sinais Vitais no Firestore... ID: ${registroIdParaAtualizar}`);
                docRef = doc(db, 'pacientes', currentPatientId, 'sinaisVitais', registroIdParaAtualizar);
                await setDoc(docRef, sinaisVitaisData, { merge: true });
                successMessage = 'Sinais Vitais atualizados com sucesso!';

                // Atualiza o array da sessão
                const index = sinaisVitaisDaSessaoAtual.findIndex(sv => sv.id === registroIdParaAtualizar);
                if (index > -1) {
                    sinaisVitaisDaSessaoAtual[index] = { ...sinaisVitaisData, id: registroIdParaAtualizar, dataRegistro: new Date() };
                } else {
                    // Se não encontrou, adiciona (fallback)
                    sinaisVitaisDaSessaoAtual.push({ ...sinaisVitaisData, id: registroIdParaAtualizar, dataRegistro: new Date() });
                }

            } else {
                // --- CRIAÇÃO ---
                console.log("Criando novo registro de Sinais Vitais no Firestore...");
                const sinaisVitaisCollectionRef = collection(db, 'pacientes', currentPatientId, 'sinaisVitais');
                docRef = await addDoc(sinaisVitaisCollectionRef, sinaisVitaisData);
                successMessage = 'Sinais Vitais registrados com sucesso!';

                // Adiciona ao array da sessão (com o novo ID)
                sinaisVitaisDaSessaoAtual.push({ ...sinaisVitaisData, id: docRef.id, dataRegistro: new Date() });
            }

            // 3. Renderiza a lista da sessão
            console.log("Chamando renderSinaisVitaisDaSessao para atualizar a lista...");
            renderSinaisVitaisDaSessao(); // <<< CHAMA A NOVA FUNÇÃO DE RENDERIZAÇÃO

            // 4. Mostra feedback e limpa o formulário
            if (feedbackSinaisVitais) {
                feedbackSinaisVitais.textContent = successMessage;
                feedbackSinaisVitais.className = 'feedback-message success show';
                feedbackSinaisVitais.classList.remove('hidden');
            }
            formSinaisVitais.reset();
            if(editIdField) editIdField.value = '';

            setTimeout(() => {
                if(feedbackSinaisVitais) feedbackSinaisVitais.classList.add('hidden');
            }, 3000);

         } catch (error) { 
            console.error(`Erro ao ${isEditing ? 'atualizar' : 'registrar'} Sinais Vitais:`, error);
            if (feedbackSinaisVitais) {
                feedbackSinaisVitais.textContent = `Erro: ${error.message}`;
                feedbackSinaisVitais.className = 'feedback-message error show';
                feedbackSinaisVitais.classList.remove('hidden');
            }
         } finally {
             // 7. Reabilita o botão (como antes)
            submitBtn.disabled = false;
            submitBtn.innerHTML = isEditing
               ? '<i class="fa-solid fa-save"></i> Atualizar Sinais Vitais'
               : '<i class="fa-solid fa-save"></i> Registrar Sinais Vitais';
         }
    }); // Fim do addEventListener 'submit'
} else {
    console.warn("Elementos do formulário de Sinais Vitais (form, editIdField ou submitBtn) não encontrados ao adicionar listener.");
}
// --- FIM DO LISTENER ATUALIZADO ---








// ... (Restante das suas variáveis globais e a função initializePage vem depois) ...

// ==========================================================
// SUBSTITUA a função renderHistoricoConsultas INTEIRA POR ESTA:
// (Versão que usa flags 'tem_...' e adiciona botão 'Visualizar')
// ==========================================================
function renderHistoricoConsultas(consultas) {
    const listaContainer = document.querySelector('.historico-consultas-lista');
    const totalConsultasEl = document.querySelector('.total-consultas');

    if (!listaContainer) {
        console.error("renderHistoricoConsultas: Elemento '.historico-consultas-lista' não encontrado.");
        return;
    }

    console.log("renderHistoricoConsultas: Renderizando histórico com dados do Firestore...");
    listaContainer.innerHTML = ''; // Limpa a lista atual

    if (!consultas || consultas.length === 0) {
        listaContainer.innerHTML = `
            <div class="consulta-card empty-history">
                <div class="consulta-timeline-icon"><i class="fa-solid fa-notes-medical"></i></div>
                <p>Nenhum histórico de consulta registrado ainda.</p>
                <small>Clique em "Iniciar Atendimento" para registrar a primeira consulta.</small>
            </div>`;
        if (totalConsultasEl) totalConsultasEl.textContent = '0 consultas realizadas';
        console.log("renderHistoricoConsultas: Nenhum histórico encontrado.");
        return;
    }

    // Ordena por data (a query já deve fazer isso, mas garantimos)
    // Usamos o campo 'data' (YYYY-MM-DD) para garantir ordenação correta
    consultas.sort((a, b) => (b.data && a.data) ? b.data.localeCompare(a.data) : 0);

    console.log(`renderHistoricoConsultas: Renderizando ${consultas.length} cards...`);
    consultas.forEach((consulta, index) => {
        // Define a classe da tag de tipo
        const tagTipoClass = consulta.tipo?.toLowerCase() === 'online' ? 'online' : 'presencial';

        // --- GERA O HTML PARA AS TAGS DE DOCUMENTOS USANDO AS FLAGS 'tem_...' ---
        let docsHtml = '';
        if (consulta.tem_receita) { docsHtml += `<span class="doc-tag receita"><i class="fa-solid fa-prescription-bottle-medical"></i> Receita Médica</span>`; }
        if (consulta.tem_atestado) { docsHtml += `<span class="doc-tag atestado"><i class="fa-solid fa-file-invoice"></i> Atestado</span>`; }
        if (consulta.tem_exame) { docsHtml += `<span class="doc-tag exame"><i class="fa-solid fa-flask-vial"></i> Exame</span>`; }
        if (consulta.tem_encaminhamento) { docsHtml += `<span class="doc-tag encaminhamento"><i class="fa-solid fa-share-from-square"></i> Encaminhamento</span>`; }
        if (consulta.tem_acompanhamento) { docsHtml += `<span class="doc-tag acompanhamento"><i class="fa-solid fa-star-of-life"></i> Acompanhamento</span>`; }
        if (consulta.tem_sinais_vitais) { docsHtml += `<span class="doc-tag sinais-vitais"><i class="fa-solid fa-heart-pulse"></i> Sinais Vitais</span>`; }
        // Adicione mais flags aqui se necessário (ex: if (consulta.tem_evolucao)... )

        // Cria o HTML do card completo
        const cardHtml = `
            <div class="consulta-card" data-consulta-id="${consulta.id}" role="article" aria-labelledby="consulta-data-${consulta.id}">
                <div class="consulta-timeline-icon"><i class="fa-solid fa-circle-check"></i></div>
                <div class="consulta-card-header">
                    <span class="consulta-data" id="consulta-data-${consulta.id}">${consulta.dataDisplay}</span>
                    <span class="consulta-tag ${tagTipoClass}">${consulta.tipo}</span>
                </div>
                <p class="consulta-resumo">${consulta.resumo || 'Sem resumo disponível.'}
                ${docsHtml ? `<div class="consulta-docs">${docsHtml}</div>` : ''}

            
                <div class="consulta-card-footer" style="padding-top: 10px; border-top: 1px dashed #eee; margin-top: 10px; display: flex; justify-content: flex-end; gap: 8px;"> 
                     <button type="button" class="btn-visualizar-consulta mini-btn" data-consulta-id="${consulta.id}" aria-label="Visualizar detalhes da consulta de ${consulta.dataDisplay}">
                          <i class="fa-solid fa-eye"></i> Visualizar
                     </button>
                     
                     <button type="button" class="btn-editar-consulta mini-btn" data-consulta-id="${consulta.id}" aria-label="Editar consulta de ${consulta.dataDisplay}">
                          <i class="fa-solid fa-pencil"></i> Editar
                     </button>
                </div>
            </div>
            </div>
        `;
        try {
             listaContainer.insertAdjacentHTML('beforeend', cardHtml);
        } catch (e) {
             console.error(`Erro ao inserir HTML do card ${index} (ID: ${consulta.id}):`, e, cardHtml);
        }
    });

    // Atualiza o contador
    if (totalConsultasEl) {
       const count = consultas.length;
       totalConsultasEl.textContent = `${count} consulta${count !== 1 ? 's' : ''} realizada${count !== 1 ? 's' : ''}`;
    }
    console.log("renderHistoricoConsultas: Renderização do histórico concluída.");
}
// ==========================================================
// FIM DA FUNÇÃO renderHistoricoConsultas PARA SUBSTITUIR
// ==========================================================


// ==========================================================
// NOVA FUNÇÃO PARA RENDERIZAR OS CARDS DE NOTAS MÉDICAS
// (Cole esta função no seu prontuario-paciente.js)
// ==========================================================
function renderNotasMedicas(notas) {
    const listaContainer = document.getElementById('registros-notas-medicas-lista');
    const emptyState = listaContainer?.querySelector('.empty-state-notas'); // Pega o p de estado vazio

    if (!listaContainer) {
        console.error("renderNotasMedicas: Container '#registros-notas-medicas-lista' não encontrado.");
        return;
    }

    console.log(`renderNotasMedicas: Renderizando ${notas ? notas.length : 0} notas...`);
    listaContainer.innerHTML = ''; // Limpa a lista atual (inclusive o empty state se estiver visível)

    if (!notas || notas.length === 0) {
        // Se o emptyState original existe no HTML, clona e adiciona
        const emptyStateHtml = `<p class="empty-state-notas" style="text-align: center; color: #888; padding: 20px;">Nenhuma nota registrada ainda.</p>`;
        listaContainer.innerHTML = emptyStateHtml;
        console.log("renderNotasMedicas: Nenhuma nota para exibir.");
        return;
    }

    // Ordena por data (mais recentes primeiro - assumindo que 'timestamp' é um objeto Date ou ISO string)
    notas.sort((a, b) => {
         const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0);
         const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0);
         return dateB - dateA; // Descendente
    });


    notas.forEach(nota => {
        // Formata a Data/Hora
        let dataHoraFormatada = 'Data N/D';
        if (nota.timestamp) {
             try {
                 const dateObj = nota.timestamp.toDate ? nota.timestamp.toDate() : new Date(nota.timestamp);
                 if (!isNaN(dateObj)) {
                      dataHoraFormatada = dateObj.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
                 }
             } catch(e) { console.error("Erro ao formatar timestamp da nota:", e, nota.timestamp); }
        }

        // Cria o HTML do Card (baseado no layout Sinais Vitais)
        const cardHTML = `
            <div class="sinais-vitais-card nota-medica-card" data-nota-id="${nota.id}"> 
               
                <div class="sv-card-header">
                    <i class="fa-solid fa-file-medical"></i> 
                    <strong>Nota Médica</strong>
                    <span class="sv-card-time">${dataHoraFormatada}</span>
                </div>

                
                <div class="nota-medica-texto" style="padding: 10px 15px; white-space: pre-wrap; font-size: 0.9rem; text-align: height;">
                    ${nota.texto || '<i>Texto da nota não disponível.</i>'}
                </div>

                 
                <div class="sv-card-footer">
                     <button type="button" class="btn-edit-nota mini-btn" data-nota-id="${nota.id}" aria-label="Editar nota">
                          <i class="fa-solid fa-pencil"></i>
                     </button>
                     <button type="button" class="btn-delete-nota mini-btn" data-nota-id="${nota.id}" aria-label="Apagar nota">
                          <i class="fa-solid fa-trash"></i>
                     </button>
                </div>
            </div>
        `;
        try {
             listaContainer.insertAdjacentHTML('beforeend', cardHTML);
        } catch (e) {
             console.error(`Erro ao inserir HTML do card da nota (ID: ${nota.id}):`, e, cardHTML);
        }
    });

    console.log("renderNotasMedicas: Renderização das notas concluída.");
}
// ==========================================================
// FIM DA FUNÇÃO renderNotasMedicas
// ==========================================================



    // ==========================================================================
    // --- FUNÇÃO DE INICIALIZAÇÃO DA PÁGINA ---
    // (Chamada após autenticação e definição das funções auxiliares)
    // ==========================================================================

    const initializePage = async () => {
        // Carrega dados essenciais primeiro
        await loadPatientData(currentPatientId); // Isto chama loadRecipeData
        await loadProfessionalData(currentUser.uid); 
        await loadHistoricoConsultasFromFirestore(); // <<< COLE ESTA LINHA AQUI
        await loadAnamnese();
        await loadHistoricoRegistrosCompleto(true);
        await aplicarPermissoesPaciente();
        loadInitialMockMedicacao(); // Carrega dados de medicação
        loadExamesDoPaciente();
        loadAcompanhamentosPainel();

        
        // Configura os event listeners
        addEventListeners(); 

        // Renderiza conteúdo inicial das abas
        await loadEncaminhamentos();
        await mostrarSolicitacoesDeExames(); // Lê do localStorage ou Mock
        await loadAndRenderSinaisVitais(); // Carrega e renderiza Sinais Vitais do 
        renderAtestadosEmDadosDaConsulta(); // <<< ADICIONE ESTA NOVA LINHA
        renderReceitasEmDadosDaConsulta(); // <<< ADICIONE ESTA LINHA
        renderExamesEmDadosDaConsulta(); // <<< ADICIONE ESTA LINHA
        
        // Ler params
        const params = new URLSearchParams(window.location.search);
        currentPatientId = params.get('id');
        
        // --- NOVO: Captura o tipo ---
        const tipoUrl = params.get('tipo');
        if (tipoUrl) currentConsultationType = tipoUrl;
        console.log("Tipo de Consulta Atual:", currentConsultationType);
       
        
        // Define as abas/sub-abas iniciais
        // Dentro de initializePage
        switchTab('painel-clinico'); // Define a aba principal padrão
        switchTab('receitas'); 
        // NOVO: Calcula as médias reais agora que temos dados
        updatePainelStats();
        applyRecipeFilters(); // Renderiza receitas na aba inicial
        aplicarFiltroExames(); // Renderiza exames na sub-aba
        switchExameSubTab('solicitacoes');
        switchRegistrosSubTab('sono');
        
        // Cria os gráficos
       
        // O gráfico de medicação é renderizado pela primeira vez pela linha abaixo:
        applyMedicamentoFilter(); // Renderiza o gráfico de medicação e lista
        
        // Esconde o overlay de carregamento
        loadingOverlay.classList.add('hidden');
        pageWrapper.classList.remove('hidden');

        // Configura os event listeners
    

    // Define a aba inicial E RENDERIZA O HISTÓRICO SE A ABA FOR O PAINEL
    switchTab('painel-clinico'); // Exemplo: Definindo Painel Clínico como inicial
    if ('painel-clinico' === 'painel-clinico') { // Adapte se a aba inicial for outra
          // Chama a renderização
    }
    // Aplica filtros ou renderiza outras abas se necessário
    applyRecipeFilters();
    aplicarFiltroExames();
    // ... etc ...

    // Esconde o overlay
    loadingOverlay.classList.add('hidden');
    pageWrapper.classList.remove('hidden');

    };


    // --- INÍCIO DO NOVO LISTENER PARA O BOTÃO ---
    // INÍCIO DO BLOCO PARA SUBSTITUIR (btnIniciarAtendimentoPainel)

// --- LISTENER PARA O BOTÃO "INICIAR ATENDIMENTO" (CORRIGIDO) --- //Mudado agora 26/10 ás 15:11
if (btnIniciarAtendimentoPainel) {
    btnIniciarAtendimentoPainel.addEventListener('click', () => {
        console.log("Botão 'Iniciar Atendimento' clicado.");


        // 1. Renderiza os dados que JÁ ESTÃO na sessão atual
        console.log("Renderizando dados da sessão atual (Receitas, Exames, Atestados, Sinais)...");
        renderReceitasEmDadosDaConsulta();
        renderAtestadosEmDadosDaConsulta(); // (Verificar se esta deve ler de allAtestados ou atestadosDaSessaoAtual)
        renderExamesEmDadosDaConsulta();
        renderSinaisVitaisDaSessao(); 
        renderEncaminhamentosEmDadosDaConsulta(); 
        renderAcompanhamentoEmDadosDaConsulta(); 
        

        
        

        // 2. Verifica se o modal de consulta existe
        if (!consultaModal) {
            console.error("Erro: Elemento 'consultaModal' não encontrado!");
            alert("Erro: Não foi possível encontrar o modal de consulta.");
            return;
        }

        // 3. Reseta o campo de Evolução (pois este é digitado a cada vez)
        const evolucaoTextarea = consultaModal.querySelector('#evolucao-texto-input'); // ID CORRIGIDO
        if (evolucaoTextarea) {
            evolucaoTextarea.value = ''; 
            console.log("Campo de evolução clínica limpo.");
        } else {
            console.warn("Textarea de evolução não encontrada para resetar.");
        }

        // 4. Define o título para "Nova Consulta" com a data atual
        const hoje = new Date();
        const dataFormatada = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(hoje);
        const tituloModal = consultaModal.querySelector('#consulta-modal-title');
        if (tituloModal) {
            tituloModal.textContent = `Nova Consulta - ${dataFormatada}`;
        }

        // 5. Garante que a sub-aba "Evolução" esteja ativa
        if (typeof switchConsultaSubTab === 'function') {
            switchConsultaSubTab('evolucao');
        }

        // 6. Abre o modal
        if (typeof openModal === 'function') {
            openModal(consultaModal);
        }
    });
}
    // --- FIM DO NOVO LISTENER PARA O BOTÃO ---

/**
 * CARREGA A ANAMNESE REAL DO PACIENTE (Versão Corrigida - Campos Individuais)
 * Lê de: pacientes/{currentPatientId}/anamnese/principal
 */
async function loadAnamnese() {
    const divConteudo = document.getElementById('anamnese-conteudo-real');
    const divAviso = document.getElementById('anamnese-vazia-aviso');

    if (!currentPatientId) return;

    // Função auxiliar para preencher texto
    const setTxt = (id, valor) => {
        const el = document.getElementById(id);
        if (el) {
            // Se o valor for nulo ou vazio, mantém o "--" ou põe "Não relatado"
            el.textContent = (valor && valor.trim() !== '') ? valor : "Não relatado";
            el.classList.remove('placeholder');
        } else {
            // Log opcional para debug
            // console.warn(`Campo HTML não encontrado: ${id}`);
        }
    };

    try {
        console.log(`Buscando anamnese em: pacientes/${currentPatientId}/anamnese/principal`);
        const anamneseRef = doc(db, 'pacientes', currentPatientId, 'anamnese', 'principal');
        const docSnap = await getDoc(anamneseRef);

        if (!docSnap.exists()) {
            console.log("Anamnese não encontrada.");
            if(divConteudo) divConteudo.classList.add('hidden');
            if(divAviso) divAviso.classList.remove('hidden');
            return;
        }

        const data = docSnap.data();
        console.log("Dados da anamnese carregados:", data);

        if(divConteudo) divConteudo.classList.remove('hidden');
        if(divAviso) divAviso.classList.add('hidden');

        // --- 1. História Patológica ---
        setTxt('view-anamnese-doencas', data.doencas);
        setTxt('view-anamnese-hospitalizacao', data.hospitalizacao);
        setTxt('view-anamnese-cirurgias', data.cirurgias);
        setTxt('view-anamnese-alergias', data.alergias);
        setTxt('view-anamnese-transfusoes', data.transfusoes);
        setTxt('view-anamnese-medicacoes', data.medicamentos_uso);

        // --- 2. História Familiar (A CORREÇÃO ESTÁ AQUI) ---
        // Agora preenchemos cada caixinha individualmente
        setTxt('view-anamnese-fam-hipertensao', data.fam_hipertensao);
        setTxt('view-anamnese-fam-diabetes', data.fam_diabetes);
        setTxt('view-anamnese-fam-cancer', data.fam_cancer);
        setTxt('view-anamnese-fam-cardiacas', data.fam_cardiacas);
        setTxt('view-anamnese-fam-mentais', data.fam_mentais);
        setTxt('view-anamnese-fam-outras', data.fam_outras);

        // --- 3. Hábitos e Psicossocial ---
        setTxt('view-anamnese-humor', data.hab_humor);
        setTxt('view-anamnese-estresse', data.hab_estresse);
        setTxt('view-anamnese-sono', data.hab_sono_rotina);
        setTxt('view-anamnese-apoio', data.hab_apoio);
        setTxt('view-anamnese-alcool', data.hab_alcool);
        setTxt('view-anamnese-drogas', data.hab_drogas);
        setTxt('view-anamnese-fumo', data.hab_fumo);
        setTxt('view-anamnese-alimentacao', data.hab_alimentacao);
        setTxt('view-anamnese-atividade', data.hab_atividade);
        setTxt('view-anamnese-suplementos', data.hab_suplementos);

        // --- 4. Revisão de Sistemas ---
        let sistemasTexto = "";
        if (data.sis_digestivo) sistemasTexto += `• Digestivo: ${data.sis_digestivo}\n`;
        if (data.sis_urinario) sistemasTexto += `• Urinário: ${data.sis_urinario}\n`;
        if (data.sis_cardio) sistemasTexto += `• Cardiovascular: ${data.sis_cardio}\n`;
        if (data.sis_respiratorio) sistemasTexto += `• Respiratório: ${data.sis_respiratorio}\n`;
        if (data.sis_musculo) sistemasTexto += `• Músculo-Esquelético: ${data.sis_musculo}\n`;
        if (data.sis_neuro) sistemasTexto += `• Neurológico: ${data.sis_neuro}\n`;
        if (data.sis_endocrino) sistemasTexto += `• Endócrino: ${data.sis_endocrino}\n`;
        if (data.sis_hemato) sistemasTexto += `• Hematológico: ${data.sis_hemato}\n`;
        
        setTxt('view-anamnese-sistemas', sistemasTexto.trim() || "Nenhuma queixa sistêmica relatada.");

        // --- 5. Exames e Específicos (A OUTRA CORREÇÃO) ---
        // Garante que os IDs batem com o HTML novo
        setTxt('view-anamnese-exames', data.exames_vacinas);
        setTxt('view-anamnese-mulher', data.saude_mulher);
        setTxt('view-anamnese-homem', data.saude_homem);

    } catch (error) {
        console.error("Erro ao carregar anamnese:", error);
    }
}

// ==========================================================
// FUNÇÃO: SALVAR CONSULTA (VERSÃO ARRASTÃO - FORÇA BRUTA)
// ==========================================================
async function salvarNovaConsulta() {
    console.log("salvarNovaConsulta: Iniciando...");

    if (!currentUser || !currentPatientId) {
        alert("Erro: Identificação ausente.");
        return;
    }

    const consultaEditIdInput = document.getElementById('consulta-edit-id');
    const consultaIdParaAtualizar = consultaEditIdInput ? consultaEditIdInput.value : null;
    const isEditing = !!consultaIdParaAtualizar;
    
    const btnSalvar = document.getElementById('consulta-salvar-alteracoes');
    if (btnSalvar) {
        btnSalvar.disabled = true;
        btnSalvar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A processar...';
    }
    loadingOverlay?.classList.remove('hidden');

    try {
        // 1. Salva a Evolução (Sem alterações aqui)
        const evolucaoText = document.getElementById('evolucao-texto-input')?.value || "";
        let evolucaoId = null;
        if (evolucaoText.trim()) {
            const evolucaoRef = collection(db, 'pacientes', currentPatientId, 'evolucao');
            const evoData = {
                texto: evolucaoText,
                id_profissional: currentUser.uid,
                medico_nome: currentProfessionalData?.nome || "Profissional",
                paciente_id: currentPatientId
            };
            if (isEditing) evoData.ultima_atualizacao = serverTimestamp();
            else evoData.timestamp = serverTimestamp();
            const evoDoc = await addDoc(evolucaoRef, evoData);
            evolucaoId = evoDoc.id;
        }

        // 2. Salva a Consulta Principal (Sem alterações aqui)
        const consultaData = {
            paciente_id: currentPatientId,
            medico_id: currentUser.uid,
            medico_nome: currentProfessionalData?.nome || "Profissional",
            tipo: currentConsultationType || "Presencial",
            evolucao_id: evolucaoId,
            resumo: evolucaoText.substring(0, 150) + (evolucaoText.length > 150 ? '...' : ''),
            tem_receita: receitasDaSessaoAtual.length > 0,
            tem_exame: examesDaSessaoAtual.length > 0,
            tem_atestado: atestadosDaSessaoAtual.length > 0,
            tem_encaminhamento: encaminhamentosDaSessaoAtual.length > 0,
            tem_acompanhamento: acompanhamentosDaSessaoAtual.length > 0,
            tem_sinais_vitais: sinaisVitaisDaSessaoAtual.length > 0,
            receita_ids: receitasDaSessaoAtual.map(r => r.id),
            pedido_exame_ids: examesDaSessaoAtual.map(ex => ex.id),
            atestado_ids: atestadosDaSessaoAtual.map(at => at.id),
            sinais_vitais_ids: sinaisVitaisDaSessaoAtual.map(sv => sv.id),
            encaminhamento_ids: encaminhamentosDaSessaoAtual.map(enc => enc.id),
            acompanhamento_ids: acompanhamentosDaSessaoAtual.map(ac => ac.id),
            ...(isEditing ? { ultima_atualizacao: serverTimestamp() } : { data_consulta: serverTimestamp() })
        };

        if (isEditing) {
            await updateDoc(doc(db, 'consultas', consultaIdParaAtualizar), consultaData);
        } else {
            await addDoc(collection(db, 'consultas'), consultaData);
        }
        

        // =================================================================
        // 3. ATUALIZA O STATUS (A CORREÇÃO "ARRASTÃO")
        // =================================================================
        try {
            console.log(`Buscando QUALQUER agendamento para o paciente: ${currentPatientId}`);
            
            // BUSCA AMPLA: Apenas pelo ID do paciente (sem filtrar status ou médico no banco)
            const qAgend = query(
                collection(db, 'agendamentos'),
                where('paciente_id', '==', currentPatientId)
            );

            const snapAgend = await getDocs(qAgend);
            console.log(`Encontrados ${snapAgend.size} agendamentos totais deste paciente.`);
            
            const updates = [];
            
            snapAgend.forEach(docSnap => {
                const dados = docSnap.data();
                const idProf = dados.profissional_id || dados.medico_id;
                const statusAtual = (dados.status || '').toLowerCase();

                // LOG DE DEBUG: Vê o que encontrou
                console.log(`Analisando Agendamento ${docSnap.id}: Médico=${idProf}, Status=${statusAtual}`);

                // VERIFICAÇÕES NO JAVASCRIPT (Mais seguro)
                // 1. É comigo?
                const ehMeu = (idProf === currentUser.uid);
                
                // 2. Está aberto? (Não é cancelada nem realizada)
                const estaAberto = (statusAtual !== 'cancelada' && statusAtual !== 'realizada' && statusAtual !== 'concluída');

                if (ehMeu && estaAberto) {
                    console.log(`>>> ALVO ENCONTRADO! Atualizando ${docSnap.id} para 'realizada' <<<`);
                    updates.push(updateDoc(doc(db, 'agendamentos', docSnap.id), {
                        status: 'realizada', // Vírgula aqui é obrigatória!
                        finalizado_em: serverTimestamp()
                    }));
                }
            });

            if (updates.length > 0) {
                await Promise.all(updates);
                console.log(`${updates.length} agendamento(s) fechado(s) com sucesso.`);
            } else {
                console.warn("Nenhum agendamento pendente encontrado para fechar (via filtro JS).");
            }

        } catch (errAgend) {
            console.error("Erro ao atualizar agendamento:", errAgend);
        }
        // =================================================================

        alert(`Consulta ${isEditing ? 'atualizada' : 'salva'} com sucesso!`);
        if (consultaModal) closeModal(consultaModal);
        
        // Limpa sessão
        receitasDaSessaoAtual = [];
        examesDaSessaoAtual = [];
        atestadosDaSessaoAtual = [];
        sinaisVitaisDaSessaoAtual = [];
        encaminhamentosDaSessaoAtual = [];
        acompanhamentosDaSessaoAtual = [];
        
        renderReceitasEmDadosDaConsulta();
        renderExamesEmDadosDaConsulta();
        renderAtestadosEmDadosDaConsulta();
        renderSinaisVitaisDaSessao();
        renderEncaminhamentosEmDadosDaConsulta();
        renderAcompanhamentoEmDadosDaConsulta();

        if (consultaEditIdInput) consultaEditIdInput.value = '';
        if (btnSalvar) btnSalvar.innerHTML = '<i class="fa-solid fa-save"></i> Salvar consulta';

        if (typeof loadHistoricoConsultasFromFirestore === 'function') {
            loadHistoricoConsultasFromFirestore();
        }

    } catch (error) {
        console.error("Erro ao salvar consulta:", error);
        alert("Erro ao salvar consulta. Verifique o console.");
    } finally {
        loadingOverlay?.classList.add('hidden');
        if (btnSalvar) btnSalvar.disabled = false;
    }
}
// ==========================================================
// FIM DA FUNÇÃO salvarNovaConsulta ATUALIZADA
// ==========================================================

// FIM DA FUNÇÃO SUBSTITUÍDA
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            const params = new URLSearchParams(window.location.search);
            currentPatientId = params.get('id');
            if (currentPatientId) {
                // Chama initializePage AQUI, depois de todas as funções estarem definidas
                initializePage(); 
            } else {
                console.error("ID do paciente não encontrado na URL."); // Mensagem de erro que você viu
                if(pageWrapper) pageWrapper.innerHTML = `<p style="padding: 20px;">ID do paciente não encontrado. Volte para a lista de pacientes.</p>`;
                if(loadingOverlay) loadingOverlay.classList.add('hidden');
            }
        } else {
            window.location.href = 'professional-login.html';
        }
    });










    const salvarAtestadoLocal = (dadosAtestado) => {
  const storageKey = `orionHealth_atestados_${currentPatientId}`;
  let atestados = [];

  const armazenados = localStorage.getItem(storageKey);
  if (armazenados) {
    try {
      atestados = JSON.parse(armazenados);
    } catch (error) {
      console.error("Erro ao ler atestados do localStorage:", error);
    }
  }

  atestados.push(dadosAtestado);
  localStorage.setItem(storageKey, JSON.stringify(atestados));
};

/**
 * CARREGA ACOMPANHAMENTOS NO PAINEL CLÍNICO (Versão Robusta)
 * Busca o ÚLTIMO check-in e verifica se é de hoje.
 */
async function loadAcompanhamentosPainel() {
    const container = document.getElementById('painel-acompanhamentos-lista');
    if (!container || !currentPatientId) return;

    container.innerHTML = '<p class="placeholder" style="color:#888; font-size:0.9rem;">Atualizando dados...</p>';

    try {
        // 1. Busca Planos Ativos
        const acompRef = collection(db, 'pacientes', currentPatientId, 'acompanhamentos');
        // Traz todos os ativos
        const q = query(acompRef, where('status', '==', 'Ativo')); 
        const querySnapshot = await getDocs(q);

        container.innerHTML = '';

        if (querySnapshot.empty) {
            container.innerHTML = '<p class="placeholder" style="color:#888; font-size:0.9rem;">Nenhum acompanhamento ativo.</p>';
            return;
        }

        // Data de hoje (apenas dia/mês/ano para comparação)
        const hojeString = new Date().toLocaleDateString('pt-BR');

        for (const docSnap of querySnapshot.docs) {
            const plano = docSnap.data();
            const planoId = docSnap.id;

            // 2. Busca o ÚLTIMO check-in desta sub-coleção
            const checkinsRef = collection(db, 'pacientes', currentPatientId, 'acompanhamentos', planoId, 'checkins');
            // Ordena por data decrescente e pega só 1
            const qCheckin = query(checkinsRef, orderBy('timestamp', 'desc'), limit(1));
            
            const checkinSnap = await getDocs(qCheckin);
            let checkinHoje = null;
            
            if (!checkinSnap.empty) {
                const dadosCheckin = checkinSnap.docs[0].data();
                
                // Verifica a data
                let dataCheckin = new Date();
                if (dadosCheckin.timestamp && dadosCheckin.timestamp.toDate) {
                    dataCheckin = dadosCheckin.timestamp.toDate();
                }
                
                // SE a data do último check-in for IGUAL a hoje, usamos ele
                if (dataCheckin.toLocaleDateString('pt-BR') === hojeString) {
                    checkinHoje = dadosCheckin;
                }
            }

            // 3. Renderiza o Card
            renderAcompanhamentoLateral(plano, checkinHoje, planoId);
        }

    } catch (error) {
        console.error("Erro ao carregar acompanhamentos do painel:", error);
        container.innerHTML = '<p class="error-message">Erro ao carregar dados.</p>';
    }
}

/**
 * DESENHA O CARD LATERAL (Versão Final - Botão Corrigido)
 */
function renderAcompanhamentoLateral(plano, checkin, planoId) {
    const container = document.getElementById('painel-acompanhamentos-lista');
    
    // --- 1. LÓGICA DE CÁLCULO ---
    let percentual = 0;
    let concluidasSet = new Set(); 

    if (checkin) {
        if (checkin.metasConcluidas && Array.isArray(checkin.metasConcluidas)) {
            checkin.metasConcluidas.forEach(m => {
                if (typeof m === 'object' && m !== null) {
                    if (m.id) concluidasSet.add(m.id.toLowerCase().trim());
                    if (m.texto) concluidasSet.add(m.texto.toLowerCase().trim());
                    if (m.id && m.id.startsWith('meta_')) {
                        concluidasSet.add(m.id.replace('meta_', '').toLowerCase().trim());
                    }
                } else if (typeof m === 'string') {
                    concluidasSet.add(m.toLowerCase().trim());
                }
            });
        }
        const totalReal = (checkin.metasConcluidas?.length || 0) + (checkin.metasPendentes?.length || 0);
        const baseDivisao = totalReal > 0 ? totalReal : (plano.metas?.length || 1);
        percentual = Math.round(((checkin.metasConcluidas?.length || 0) / baseDivisao) * 100);
    }

    // --- 2. Formatação ---
    let dataInicio = 'N/D';
    if (plano.data_inicio) {
        try {
            const d = new Date(plano.data_inicio);
            dataInicio = d.toLocaleDateString('pt-BR');
        } catch(e){}
    }

    // --- 3. Metas ---
    let metasHtml = '';
    if (plano.metas && Array.isArray(plano.metas)) {
        metasHtml = plano.metas.map(metaCodigo => {
            const textoBonito = typeof formatarNomeMeta === 'function' ? formatarNomeMeta(metaCodigo) : metaCodigo;
            const codigoLower = metaCodigo.toLowerCase().trim();
            const textoLower = textoBonito.toLowerCase().trim();
            const isDone = concluidasSet.has(codigoLower) || concluidasSet.has(textoLower);

            const iconClass = isDone ? "fa-solid fa-check-circle" : "fa-regular fa-circle";
            const colorStyle = isDone ? "color: #28a745;" : "color: #ccc;"; 
            const textClass = isDone ? "meta-concluida" : "meta-pendente";
            const textStyle = isDone ? "text-decoration: line-through; color: #888;" : "color: #333;";

            return `<li class="${textClass}" style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 0.9rem; ${textStyle}">
                    <i class="${iconClass}" style="${colorStyle} font-size: 1.1rem; flex-shrink: 0;"></i> 
                    <span>${textoBonito}</span>
                </li>`;
        }).join('');
    } else {
        metasHtml = '<li style="color: #888; font-style: italic;">Nenhuma meta definida.</li>';
    }

    // --- 4. CARD HTML (Botão Atualizado) ---
    // Repara que removi o 'onclick' e adicionei 'data-action' e 'data-id'
    const cardHtml = `
        <div class="acompanhamento-item" style="margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 1rem; font-weight: 600;">${plano.assinatura_digital?.especialidade || 'Acompanhamento'}</h4>
            
            <div class="acompanhamento-progresso" style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #666; margin-bottom: 4px;">
                <span>Início: ${dataInicio}</span>
                <span class="progresso-percentual" style="font-weight: 600; color: #41b8d5;">${percentual}% hoje</span>
            </div>
            
            <div class="progress-bar-container-painel" style="height: 6px; background: #eee; border-radius: 3px; margin-bottom: 16px; overflow: hidden;">
                <div class="progress-bar-fill-painel" style="width: ${percentual}%; height: 100%; background: #41b8d5;"></div>
            </div>
            
            <ul class="metas-lista" style="list-style: none; padding: 0; margin: 0;">
                ${metasHtml}
            </ul>
            
            <button class="btn-secondary-painel" 
                    data-action="ver-historico-acomp"
                    data-plano-id="${planoId}"
                    data-titulo="${plano.assinatura_digital?.especialidade || 'Acompanhamento'}"
                    style="width: 100%; margin-top: 16px; font-size: 0.8rem; padding: 8px; cursor: pointer;">
                Ver Histórico Completo
            </button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', cardHtml);
}
/**
 * Traduz os códigos técnicos para texto legível (IGUAL AO DA IMAGEM DO CHECK-IN)
 */
function formatarNomeMeta(codigo) {
    const mapa = {
        // Códigos do Banco : Textos Exatos da Tela do Paciente
        'tomar_medicacao': 'Tomar medicação prescrita',
        'fazer_exercicios_3x_semana': 'Fazer exercícios físicos',
        'evitar_cafeina_apos_16h': 'Evitar cafeína após as 16h',
        'registrar_humor': 'Registrar humor do dia',
        'alimentacao_saudavel': 'Manter alimentação saudável',
        'consulta_psicologo_semanal': 'Ir à consulta com psicólogo',
        'controlar_glicemia': 'Medir e registrar glicemia',
        'registrar_sono': 'Registrar horas de sono',
        
        // Estes não estavam na imagem, mas mantive por segurança
        'dormir_7_8h': 'Dormir pelo menos 7 horas',
        'praticar_tecnicas_respiracao': 'Praticar técnicas de respiração'
    };
    
    // Se não encontrar no mapa, retorna o código original limpo (substituindo _ por espaço)
    return mapa[codigo] || codigo.replace(/_/g, ' ');
}






/**aqio*/

const mostrarAtestadosConsulta = () => {
  const container = document.getElementById('atestados-list-container');
  if (!container || !currentPatientId) return;

  const storageKey = `orionHealth_atestados_${currentPatientId}`;
  let atestados = [];

  const armazenados = localStorage.getItem(storageKey);
  if (armazenados) {
    try {
      atestados = JSON.parse(armazenados);
    } catch (error) {
      console.error("Erro ao ler atestados do localStorage:", error);
    }
  }

  container.innerHTML = '';
  if (atestados.length === 0) {
    container.innerHTML = '<p>Nenhum atestado registrado.</p>';
    return;
  }

  atestados.forEach((dados, index) => {
    const card = document.createElement('div');
    card.className = 'atestado-card';
    card.innerHTML = `
      <p><strong>Motivo:</strong> ${dados.motivo}</p>
      <p><strong>Data:</strong> ${new Date(dados.data).toLocaleDateString('pt-BR')}</p>
      <p><strong>Assinatura:</strong> ${dados.assinatura}</p>
    `;
    container.appendChild(card);
  });
};



/**
 * 1. CARREGA O HISTÓRICO (Lado do Médico)
 * Vai à pasta: pacientes/{id}/registrosDiarios
 */
async function loadHistoricoRegistrosCompleto(forceRefresh = false) {
    if (allPatientRecords.length > 0 && !forceRefresh) {
        return true; // Já temos dados, não precisa buscar de novo
    }
    
    if (!currentPatientId) return false;

    console.log("Buscando Registros Diários do paciente...");
    
    try {
        const registrosRef = collection(db, 'pacientes', currentPatientId, 'registrosDiarios');
        // Ordena por data (mais recente primeiro)
        const q = query(registrosRef, orderBy("timestamp", "desc"));
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log("Nenhum registro diário encontrado.");
            allPatientRecords = [];
            return true;
        }

        // Processa os dados para o formato correto
        allPatientRecords = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Converte timestamp do Firebase para data Javascript
            if (data.timestamp && data.timestamp.toDate) {
                data.jsDate = data.timestamp.toDate();
            } else {
                data.jsDate = new Date(data.dataCompleta || new Date());
            }
            return data;
        });
        
        console.log(`Sucesso: ${allPatientRecords.length} registros carregados.`);
        return true;

    } catch (error) {
        console.error("Erro ao carregar registros:", error);
        return false;
    }
}

/**
 * 2. PREPARA OS DADOS (Lê filtro e manda desenhar)
 * Agora inclui Atividade e Biometria!
 */
function renderHistoricoModal() {
    // 1. Descobre qual botão de filtro está ativo (7 ou 30 dias)
    const activeBtn = document.querySelector('#tab-registros-diarios .chart-filters .filter-btn-small.active');
    const periodInDays = activeBtn ? parseInt(activeBtn.dataset.period) : 7; 
    
    console.log(`Filtrando histórico para os últimos ${periodInDays} dias...`);

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - periodInDays);
    
    // 2. Filtra os dados globais pela data
    const dadosFiltrados = allPatientRecords.filter(reg => reg.jsDate >= dataLimite);
    
    console.log(`Registros encontrados no período: ${dadosFiltrados.length}`);

    // 3. MANDA DESENHAR TODOS OS GRÁFICOS (Incluindo os novos)
    drawHistoricoChart(dadosFiltrados, 'sono');
    drawHistoricoChart(dadosFiltrados, 'humor');
    drawHistoricoChart(dadosFiltrados, 'dor');
    drawHistoricoChart(dadosFiltrados, 'alimentacao');
    
    // --- AS DUAS LINHAS QUE FALTAVAM ---
    drawHistoricoChart(dadosFiltrados, 'atividade');
    drawHistoricoChart(dadosFiltrados, 'biometria');
    // -----------------------------------

    // Atualiza também a lista de medicação se a função existir
    if (typeof applyMedicamentoFilter === 'function') {
        applyMedicamentoFilter(dadosFiltrados); 
    }
}

/**
 * DESENHA O GRÁFICO (Versão Inteligente - Mapeamento de Dados)
 */
function drawHistoricoChart(dados, tabId) {
    let canvasId = '';
    if (tabId === 'sono') canvasId = 'sonoChart';
    if (tabId === 'humor') canvasId = 'humorChart';
    if (tabId === 'dor') canvasId = 'dorChart';
    if (tabId === 'alimentacao') canvasId = 'alimentacaoChart';
    if (tabId === 'medicacoes') canvasId = 'medicacaoNotaChart';
    if (tabId === 'atividade') canvasId = 'atividadeChart';
    if (tabId === 'biometria') canvasId = 'biometriaChart';
    
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (canvas.chartInstance) canvas.chartInstance.destroy();

    // Ordena
    dados.sort((a, b) => a.jsDate - b.jsDate);
    const labels = dados.map(reg => reg.jsDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));

    // --- LOG DE DEBUG (Para vermos o que está a chegar) ---
    if (tabId === 'biometria' || tabId === 'atividade') {
        console.log(`[DEBUG ${tabId}] Estrutura do último registo:`, dados[dados.length - 1]);
    }

    const chartData = { labels: labels, datasets: [] };
    const chartOptions = {
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    };

    // --- CONFIGURAÇÃO ---

    if (tabId === 'sono') {
        chartData.datasets.push({
            label: 'Horas', 
            data: dados.map(reg => reg.sono?.horas || 0),
            backgroundColor: 'rgba(65, 184, 213, 0.5)', borderColor: '#41b8d5', borderWidth: 2, fill: true, tension: 0.3
        });
        chartOptions.scales.y.suggestedMax = 10;
    }
    else if (tabId === 'humor') {
        chartData.datasets.push({
            label: 'Nível', 
            data: dados.map(reg => reg.humor?.slider || 0),
            borderColor: '#4fd1c5', backgroundColor: 'rgba(79, 209, 197, 0.2)', borderWidth: 2, fill: true, tension: 0.3
        });
        chartOptions.scales.y.suggestedMax = 5;
    }
    else if (tabId === 'dor') {
        chartData.datasets.push({
            label: 'Nível', 
            data: dados.map(reg => reg.dor?.intensidade || 0),
            borderColor: '#e53e3e', backgroundColor: 'rgba(229, 62, 62, 0.2)', borderWidth: 2, fill: true, tension: 0.3
        });
        chartOptions.scales.y.suggestedMax = 10;
    }
    else if (tabId === 'alimentacao') {
        chartData.datasets.push({
            label: 'Qualidade', 
            data: dados.map(reg => reg.alimentacao?.escala || 0),
            borderColor: '#ed8936', backgroundColor: 'rgba(237, 137, 54, 0.5)', borderWidth: 2, type: 'bar'
        });
        chartOptions.scales.y.suggestedMax = 5;
    }
    else if (tabId === 'medicacoes') {
        chartData.datasets.push({
            label: 'Efeitos', 
            data: dados.map(reg => reg.medicacao?.efeitosEscala || 0),
            borderColor: '#805ad5', backgroundColor: 'rgba(128, 90, 213, 0.2)', borderWidth: 2, fill: true, tension: 0.3
        });
        chartOptions.scales.y.suggestedMax = 4;
    }
    
    // --- CORREÇÃO ATIVIDADE ---
   // --- CORREÇÃO: ATIVIDADE FÍSICA (Busca em vários campos) ---
    else if (tabId === 'atividade') {
        
        chartData.datasets.push({
            label: 'Minutos de Exercício',
            
            // Mapeamento Inteligente:
            data: dados.map(reg => {
                // 1. Procura o objeto de atividade (pode estar com nomes diferentes)
                const ativ = reg.atividade || reg.atividadeFisica || reg.exercicio || reg.treino || {};
                
                // 2. Procura o valor dentro do objeto (duracao, tempo, minutos)
                // O parseInt garante que transformamos texto ("30") em número (30)
                const valor = parseInt(ativ.duracao || ativ.tempo || ativ.minutos || 0);
                
                return valor;
            }),
            
            borderColor: '#dd6b20', 
            backgroundColor: 'rgba(221, 107, 32, 0.6)', // Laranja
            borderWidth: 0, 
            borderRadius: 4, 
            type: 'bar' // Gráfico de Barras (melhor para tempo)
        });
        
        // Ajuste visual
        chartOptions.plugins.legend.display = false;
    }
    
    // --- CORREÇÃO BIOMETRIA ---
    else if (tabId === 'biometria') {
        // Função auxiliar para encontrar os dados biométricos
        const getBio = (reg) => reg.biometria || reg.sinaisVitais || reg.dadosBiometricos || {};

        chartData.datasets.push({
            label: 'Peso (kg)', 
            data: dados.map(reg => getBio(reg).peso || null), 
            borderColor: '#38a169', backgroundColor: 'rgba(56, 161, 105, 0.1)', borderWidth: 2, tension: 0.3, yAxisID: 'y', pointRadius: 4
        });

        chartData.datasets.push({
            label: 'Glicemia', 
            data: dados.map(reg => getBio(reg).glicemia || null), 
            borderColor: '#3182ce', backgroundColor: 'rgba(49, 130, 206, 0.1)', borderWidth: 2, tension: 0.3, yAxisID: 'y1', pointStyle: 'rectRot', pointRadius: 5
        });

        chartData.datasets.push({
            label: 'Pressão (Sys)', 
            data: dados.map(reg => getBio(reg).pressaoSistolica || getBio(reg).pressao_sistolica || null), 
            borderColor: '#e53e3e', borderDash: [5, 5], borderWidth: 2, tension: 0.3, yAxisID: 'y1', pointStyle: 'triangle', pointRadius: 5
        });

        chartOptions.scales = {
            y: { type: 'linear', display: true, position: 'left', beginAtZero: false, title: {display: true, text: 'Peso'} },
            y1: { type: 'linear', display: true, position: 'right', grid: {drawOnChartArea: false}, title: {display: true, text: 'Glic/Pressão'} }
        };
        chartOptions.plugins.legend = { display: true, position: 'bottom' };
    }

    canvas.chartInstance = new Chart(ctx, { 
        type: chartData.datasets[0].type || 'line', 
        data: chartData, 
        options: chartOptions 
    });
}

/**
 * GERA PDF DE ENCAMINHAMENTO (VERSÃO NUCLEAR - TUDO VIA JS)
 * Constrói o HTML dinamicamente para garantir que os dados aparecem.
 */
async function gerarPDFEncaminhamentoMedico(encId) {
    console.log("Iniciando PDF Nuclear para ID:", encId);

    // 1. BUSCA DE DADOS
    let encData = allEncaminhamentos.find(enc => enc.id.toString() === encId.toString());
    if (!encData && typeof encaminhamentosDaSessaoAtual !== 'undefined') {
        encData = encaminhamentosDaSessaoAtual.find(enc => enc.id.toString() === encId.toString());
    }

    if (!encData) { alert("Erro: Dados não encontrados."); return; }

    // 2. PREPARAÇÃO DAS VARIÁVEIS (Para injetar no HTML)
    const nomeMedico = encData.nome_profissional || currentProfessionalData.nome || "Profissional";
    const crmMedico = encData.registro_profissional || currentProfessionalData.registro_profissional || "";
    const espMedico = encData.especialidade_profissional || currentProfessionalData.especialidade || "Especialidade";
    const nomePaciente = currentPatientData.nome || "Paciente";
    
    let dataFmt = new Date().toLocaleDateString('pt-BR');
    if (encData.data || encData.timestamp) {
        try { 
            const raw = encData.data || encData.timestamp;
            const d = raw.toDate ? raw.toDate() : new Date(raw.includes('T') ? raw : raw + 'T00:00:00');
            dataFmt = d.toLocaleDateString('pt-BR');
        } catch(e){}
    }

    const especialidadeAlvo = encData.especialidade || "Especialista";
    const motivo = encData.motivo || "Avaliação";
    
    // Lógica para observações
    let htmlObs = '';
    if (encData.recomendacoes && encData.recomendacoes.trim() !== "") {
        htmlObs = `
            <div style="margin-top: 20px;">
                <p style="font-size: 13px; font-weight: bold; color: #2d3748; margin-bottom: 5px;">Observações:</p>
                <p style="font-size: 13px; line-height: 1.6; margin: 0;">${encData.recomendacoes}</p>
            </div>`;
    }

    // 3. ATIVA CORTINA BRANCA
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.style.backgroundColor = '#ffffff';
        loadingOverlay.style.opacity = '1';
        loadingOverlay.style.zIndex = '9999';
    }

    // 4. CONSTRÓI O HTML DINAMICAMENTE (AQUI É A GARANTIA QUE FUNCIONA)
    const divTemp = document.createElement('div');
    divTemp.id = "pdf-gerado-via-js";
    divTemp.style.position = 'fixed'; // Mudado para fixed para garantir visibilidade
    divTemp.style.left = '0';
    divTemp.style.top = '0';
    divTemp.style.width = '210mm';
    divTemp.style.minHeight = '297mm';
    divTemp.style.backgroundColor = '#ffffff';
    divTemp.style.zIndex = '100'; // Atrás do loading
    divTemp.style.padding = '15mm';
    divTemp.style.fontFamily = 'Helvetica, sans-serif';
    divTemp.style.color = '#333';

    // O HTML é injetado já com os valores das variáveis ${...}
    divTemp.innerHTML = `
        <header style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #41b8d5; padding-bottom: 10px; margin-bottom: 20px;">
            <img src="img/Logo.Orion versao oficial.png" style="width: 150px; height: auto;" alt="Logo">
            <div style="text-align: right; font-size: 11px; line-height: 1.4;">
                <strong style="font-size: 12px; display: block;">${nomeMedico}</strong>
                <span>${espMedico}</span><br>
                <span>${crmMedico}</span>
            </div>
        </header>

        <main>
            <h2 style="text-align: center; font-size: 18px; margin: 20px 0; font-weight: bold;">Encaminhamento Clínico</h2>
            
            <div style="border: 1px solid #ccc; padding: 10px; border-radius: 8px; margin-bottom: 20px; font-size: 12px;">
                <div style="margin-bottom: 4px;"><strong>Paciente:</strong> <span>${nomePaciente}</span></div>
                <div><strong>Data:</strong> <span>${dataFmt}</span></div>
            </div>

            <div style="margin-top: 30px;">
                <div style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                    <p style="font-size: 14px; color: #718096; margin-bottom: 5px; text-transform: uppercase; font-weight: bold;">Ao Especialista em:</p>
                    <p style="font-size: 18px; font-weight: bold; color: #41b8d5; margin: 0;">${especialidadeAlvo}</p>
                </div>

                <div style="margin-bottom: 20px;">
                    <p style="font-size: 13px; font-weight: bold; color: #2d3748; margin-bottom: 5px;">Motivo do Encaminhamento:</p>
                    <p style="font-size: 13px; line-height: 1.6; background-color: #f8fafc; padding: 10px; border-radius: 4px; margin: 0;">
                        ${motivo}
                    </p>
                </div>

                ${htmlObs}
            </div>
        </main>

        <footer style="position: absolute; bottom: 15mm; left: 15mm; right: 15mm; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #718096;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
                <span style="font-weight: bold; color: #333;">${nomeMedico}</span>
                <span>Assinatura Digital (Simulado)</span>
            </div>
            <div>www.orion.health</div>
        </footer>
    `;

    document.body.appendChild(divTemp);
    window.scrollTo(0, 0);

    // 5. GERA A FOTO
    try {
        await new Promise(r => setTimeout(r, 800)); // Pausa para renderização

        const canvas = await html2canvas(divTemp, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff',
            scrollY: 0
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Encaminhamento-${(nomePaciente).split(' ')[0]}.pdf`);

    } catch (error) {
        console.error("Erro PDF:", error);
        alert("Erro ao gerar o PDF.");
    } finally {
        // 6. LIMPEZA
        document.body.removeChild(divTemp);
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.backgroundColor = ''; 
            loadingOverlay.style.opacity = '';
            loadingOverlay.style.zIndex = '';
        }
    }
}

/**
 * CALCULA ESTATÍSTICAS DO PAINEL (Consultas, Atividade, Sono, Humor)
 * Usa dados reais carregados em memória.
 */
function updatePainelStats() {
    // 1. CONSULTAS TOTAIS
    // Conta os cards que foram desenhados na lista de histórico
    const totalConsultas = document.querySelectorAll('.historico-consultas-lista .consulta-card').length;
    const elConsultas = document.getElementById('stat-consultas');
    if (elConsultas) elConsultas.textContent = totalConsultas || "0";

    // Se não houver registros diários, paramos aqui (mostra -- nos outros)
    if (!allPatientRecords || allPatientRecords.length === 0) return;

    // Variáveis para soma
    let somaSono = 0, countSono = 0;
    let somaHumor = 0, countHumor = 0;
    let somaAtiv = 0, countAtiv = 0;

    // 2. PERCORRE O HISTÓRICO REAL
    allPatientRecords.forEach(reg => {
        // Sono
        if (reg.sono?.horas) {
            somaSono += parseFloat(reg.sono.horas);
            countSono++;
        }
        // Humor
        if (reg.humor?.slider) {
            somaHumor += parseInt(reg.humor.slider);
            countHumor++;
        }
        // Atividade Física (Procura em vários campos possíveis)
        const ativ = reg.atividade || reg.atividadeFisica || reg.exercicio || {};
        const minutos = parseInt(ativ.duracao || ativ.tempo || ativ.minutos || 0);
        if (minutos > 0) {
            somaAtiv += minutos;
            countAtiv++;
        }
    });

    // 3. ATUALIZA A TELA (Calcula Médias)
    
    // Atividade Física (ex: "45 min")
    const elAtiv = document.getElementById('stat-atividade');
    if (elAtiv) {
        const media = countAtiv > 0 ? Math.round(somaAtiv / countAtiv) : 0;
        elAtiv.textContent = media > 0 ? `${media} min` : "--";
    }

    // Sono (ex: "7.5 h")
    const elSono = document.getElementById('stat-sono');
    if (elSono) {
        const media = countSono > 0 ? (somaSono / countSono).toFixed(1) : 0;
        elSono.textContent = media > 0 ? `${media}h` : "--";
    }

    // Humor (ex: "4.2")
    const elHumor = document.getElementById('stat-humor');
    if (elHumor) {
        const media = countHumor > 0 ? (somaHumor / countHumor).toFixed(1) : 0;
        elHumor.textContent = media > 0 ? media : "--";
    }
}

/**
 * APLICA AS PERMISSÕES DE ACESSO (LGPD)
 * Esconde as abas que o paciente não autorizou no agendamento.
 */
async function aplicarPermissoesPaciente() {
    if (!currentUser || !currentPatientId) return;

    console.log("Verificando permissões de acesso do paciente...");

    try {
        // 1. Busca o agendamento mais recente/ativo para este par Médico-Paciente
        // Ordenamos por data de criação decrescente para pegar o último agendamento feito
        const q = query(
            collection(db, 'agendamentos'),
            where('paciente_id', '==', currentPatientId),
            where('profissional_id', '==', currentUser.uid),
            orderBy('criado_em', 'desc'),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("Nenhum agendamento específico encontrado. Mostrando tudo (Padrão).");
            return;
        }

        const dadosAgendamento = snapshot.docs[0].data();
        const permissoes = dadosAgendamento.permissoes_acesso;

        // Se não tiver permissões gravadas (agendamento antigo), mostra tudo
        if (!permissoes) {
            console.log("Agendamento sem restrições de privacidade.");
            return;
        }

        console.log("Aplicando regras de privacidade:", permissoes);

        // 2. Mapa de Permissões vs. Data-Tab no HTML
        // Chave do banco : Valor do atributo data-tab no HTML
        const mapaAbas = {
            'ver_receitas': 'receitas',
            'ver_exames': 'exames',
            'ver_encaminhamentos': 'encaminhamentos',
            'ver_atestados': 'atestados',
            'ver_acompanhamentos': 'acompanhamentos',
            'ver_anamnese': 'anamnese',
            'ver_registros': 'registros-diarios',
            'ver_vacinas': 'vacinas'
        };

        // 3. Aplica as Regras
        for (const [chavePermissao, idAba] of Object.entries(mapaAbas)) {
            // Encontra o botão da aba
            const abaBtn = document.querySelector(`.tab-btn[data-tab="${idAba}"]`);
            
            if (abaBtn) {
                // Se a permissão for FALSE, esconde a aba
                if (permissoes[chavePermissao] === false) {
                    abaBtn.style.display = 'none'; // Esconde o botão
                    
                    // Se a aba escondida for a que estava ativa, muda para a primeira disponível (Geralmente Painel)
                    if (abaBtn.classList.contains('active')) {
                        switchTab('painel-clinico');
                    }
                } else {
                    abaBtn.style.display = ''; // Garante que está visível
                }
            }
        }

        // Feedback visual para o médico (Opcional)
        // Mostra um aviso discreto que a visualização está restrita
        const avisoPrivacidade = document.getElementById('aviso-privacidade-lgpd');
        if (!avisoPrivacidade) {
            // Cria o aviso se não existir
            const aviso = document.createElement('div');
            aviso.id = 'aviso-privacidade-lgpd';
            aviso.style.cssText = "background: #fff3cd; color: #856404; padding: 10px; text-align: center; font-size: 0.8rem; border-bottom: 1px solid #ffeeba;";
            aviso.innerHTML = '<i class="fa-solid fa-lock"></i> Visualização restrita pelas preferências de privacidade do paciente.';
            
            // Insere no topo do main
            const main = document.querySelector('main');
            if(main) main.insertBefore(aviso, main.firstChild);
        }

    } catch (error) {
        console.error("Erro ao aplicar permissões:", error);
        // Em caso de erro técnico, por segurança/usabilidade, geralmente mantemos aberto ou fechamos tudo. 
        // Aqui, mantemos aberto para não impedir o atendimento em caso de falha de rede.
    }
}
// --- LÓGICA DO MENU MOBILE (CORRIGIDA - Sem Conflitos) ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileBackBtn = document.getElementById('mobile-back-btn');
    
    // Usei nomes novos para não dar erro de "já declarado"
    const navSidebar = document.getElementById('sidebar'); 
    const navBackdrop = document.getElementById('menu-backdrop');
    const navCloseBtn = document.getElementById('close-menu-btn');

    // Função para Abrir
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if(navSidebar) navSidebar.classList.add('active');
            if(navBackdrop) {
                navBackdrop.classList.remove('hidden');
                navBackdrop.style.display = 'block';
            }
        });
    }

    // Função para Fechar
    const closeMobileMenuAction = () => {
        if(navSidebar) navSidebar.classList.remove('active');
        if(navBackdrop) {
            navBackdrop.classList.add('hidden');
            navBackdrop.style.display = 'none';
        }
    };

    if (navCloseBtn) navCloseBtn.addEventListener('click', closeMobileMenuAction);
    if (navBackdrop) navBackdrop.addEventListener('click', closeMobileMenuAction);

    // Botão Voltar (Seta)
    if (mobileBackBtn) {
        mobileBackBtn.addEventListener('click', () => {
            console.log("Voltando para o Dashboard...");
            window.location.href = 'paciente-perfil.html'; 
        });
    }

}); // Fim do 'DOMContentLoaded'
