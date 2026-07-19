// ==========================================================
// FICHEIRO: perfil-de-saude.js (V2 - Organizado)
// ==========================================================

// --- 1. IMPORTAÇÕES DO FIREBASE (MODULAR V9) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, setDoc, serverTimestamp, addDoc,deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL,deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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

// --- 4. CÓDIGO PRINCIPAL (Inicia após o HTML carregar) ---
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================
    // --- 1. VARIÁVEIS GLOBAIS ---
    // (Variáveis que usamos em múltiplas funções)
    // ==========================================================
    let currentUser = null;
    let currentPatientData = {};
    let allPatientRecords = [];
    let allRecipes = [];
    let allExames = [];
    let allEncaminhamentos = [];
    let allAtestados = [];
    let allAcompanhamentos = [];
    let allVacinas = [];
   

    // ==========================================================
    // --- 2. SELETORES DE ELEMENTOS (DOM) ---
    // (Guardamos os elementos do HTML aqui para fácil acesso)
    // ==========================================================
    const loadingOverlay = document.getElementById('loading-overlay');
    const pageWrapper = document.getElementById('page-wrapper');
    // Header
    const patientPhotoEl = document.getElementById('patient-photo');
    const patientNameEl = document.getElementById('patient-name');
    const patientMetaInfoEl = document.getElementById('patient-meta-info');
    // Navegação (Abas)
    const tabNav = document.querySelector('.tab-nav');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const mobileNavListContainer = document.getElementById('mobile-nav-list-container');
    // Navegação (Mobile)
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const closeMobileMenuButton = document.getElementById('close-mobile-menu-button');
    const backdrop = document.getElementById('backdrop');
    // Listas de Conteúdo
    const recipeListContainer = document.getElementById('recipe-list');
    const recipeFilterStatus = document.getElementById('receitas-filter-status');
    const examesListContainer = document.getElementById('exames-lista');
    const examesFilterStatus = document.getElementById('exames-filter-status');
    const recipeSearchInput = document.getElementById('recipe-search-input');
    const recipeFilterGroup = document.getElementById('recipe-filter-group');
    const exameSearchInput = document.getElementById('exame-search-input');
    const exameFilterGroup = document.getElementById('exame-filter-group');
    // Seletores do Modal de Upload de Exame (NOVOS)
    const btnAbrirUploadExame = document.getElementById('btn-abrir-upload-exame');
    const uploadExameModal = document.getElementById('upload-exame-modal');
    const closeUploadExameModalBtn = document.getElementById('close-upload-exame-modal');
    const cancelUploadExameBtn = document.getElementById('cancel-upload-exame-btn');
    const formUploadExame = document.getElementById('form-upload-exame');
    const salvarUploadExameBtn = document.getElementById('salvar-upload-exame-btn');
    const btnAbrirUploadReceita = document.getElementById('btn-abrir-upload-receita');
    const uploadReceitaModal = document.getElementById('upload-receita-modal');
    const closeUploadReceitaModalBtn = document.getElementById('close-upload-receita-modal');
    const cancelUploadReceitaBtn = document.getElementById('cancel-upload-receita-btn');
    const formUploadReceita = document.getElementById('form-upload-receita');
    const salvarUploadReceitaBtn = document.getElementById('salvar-upload-receita-btn');

    // --- Seletores do Modal de Visualização de Anamnese ---
    const anamneseVisualizarModal = document.getElementById('anamnese-visualizar-modal');
    const closeAnamneseVisualizarModalBtn = document.getElementById('close-anamnese-visualizar-modal');
    const fecharAnamneseVisualizarBtn = document.getElementById('fechar-anamnese-visualizar-button');
    const visNomePacienteHeader = document.getElementById('vis-nome-paciente-header');
    const visIdPacienteHeader = document.getElementById('vis-id-paciente-header');
    const visNomePacienteBar = document.getElementById('vis-nome-paciente-bar');
    const visDataAtualizacaoBar = document.getElementById('vis-data-atualizacao-bar');


    // --- Seletores dos Modais de Registro Diário ---
    const btnRegistroDiarioAtalho = document.getElementById('btn-registro-diario-atalho');

    // Modal Registro Diário (Formulário Longo)
    const novoRegistroModal = document.getElementById('novo-registro-diario-modal');
    const closeNovoRegistroModalBtn = document.getElementById('close-novo-registro-modal');
    const cancelNovoRegistroBtn = document.getElementById('cancel-novo-registro-btn');
    const formNovoRegistroDiario = document.getElementById('form-novo-registro-diario');
    const novoRegistroFeedback = document.getElementById('novo-registro-feedback');
    const checkDor = document.getElementById('registro-dor-checkbox');
    const detalhesDor = document.getElementById('registro-dor-detalhes');
    const checkMedTomou = document.getElementById('registro-med-tomou');
    const checkMedEfeitos = document.getElementById('registro-med-efeitos');
    const listaMedCheckbox = document.getElementById('registro-med-lista');
    const detalhesMedEfeitos = document.getElementById('registro-med-efeitos-detalhes');
    const registroMedListaCheckboxes = document.getElementById('registro-med-lista-checkboxes');

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
    const registroRefeicoesExternasLista = document.getElementById('registro-refeicoes-externas-lista');

    // Seletores do Modal de Lembretes (Novo)
    const lembreteModal = document.getElementById('lembrete-modal');
    const closeLembreteModalBtn = document.getElementById('close-lembrete-modal');
    const cancelLembreteBtn = document.getElementById('cancel-lembrete-btn');
    const salvarLembreteBtn = document.getElementById('salvar-lembrete-btn');
    const formLembrete = document.getElementById('form-lembrete');
    const medicamentosLembreteLista = document.getElementById('medicamentos-lembrete-lista');
    const btnAddMedicacaoLembrete = document.getElementById('btn-add-medicacao-lembrete');

    // Seletores do Modal de Agendamento de Exame (NOVOS)
    const agendarExameModal = document.getElementById('agendar-exame-modal');
    const closeAgendarExameModalBtn = document.getElementById('close-agendar-exame-modal');
    const cancelAgendarExameBtn = document.getElementById('cancel-agendar-exame-btn');
    const salvarAgendamentoExameBtn = document.getElementById('salvar-agendamento-exame-btn');
    const listaLaboratoriosMock = document.getElementById('lista-laboratorios-mock');

    // --- Seletores do Modal de Pagamento PIX (Passo 4.3.1) ---
    const pagamentoPixModal = document.getElementById('pagamento-pix-modal');
    const closePagamentoPixModalBtn = document.getElementById('close-pagamento-pix-modal');
    const cancelPagamentoPixBtn = document.getElementById('cancel-pagamento-pix-btn');
    const simularPagamentoBtn = document.getElementById('simular-pagamento-btn');
    const pixResumoLab = document.getElementById('pix-resumo-lab');
    const pixResumoHorario = document.getElementById('pix-resumo-horario');
    const pixStep1QRCode = document.getElementById('pix-step-1-qrcode');
    const pixStep2Sucesso = document.getElementById('pix-step-2-sucesso');
    const pixResumoPreco = document.getElementById('pix-resumo-preco');

        // --- Seletores da Aba Encaminhamentos ---
    // (Certifique-se que o ID 'btn-abrir-upload-encaminhamento' é usado apenas aqui e não colide)
    const encaminhamentoSearchInput = document.getElementById('encaminhamento-search-input');
    const encaminhamentoFilterGroup = document.getElementById('encaminhamento-filter-group');
    const encaminhamentosListContainer = document.getElementById('encaminhamentos-lista'); 
    const encaminhamentosFilterStatus = document.getElementById('encaminhamentos-filter-status');
    const atestadosListContainer = document.getElementById('atestados-lista');

    // --- Seletores do Modal de Adicionar Encaminhamento (NOVO) ---
    const btnAbrirUploadEncaminhamento = document.getElementById('btn-abrir-upload-encaminhamento');
    const uploadEncaminhamentoModal = document.getElementById('upload-encaminhamento-modal');
    const closeUploadEncModalBtn = document.getElementById('close-upload-enc-modal');
    const cancelUploadEncBtn = document.getElementById('cancel-upload-enc-btn');
    const formUploadEncaminhamento = document.getElementById('form-upload-encaminhamento');
    const salvarUploadEncBtn = document.getElementById('salvar-upload-enc-btn');
    const uploadEncFeedback = document.getElementById('upload-enc-feedback');


    // --- Seletores do Modal de Adicionar Atestado (NOVO) ---
    const btnAbrirUploadAtestado = document.getElementById('btn-abrir-upload-atestado');
    const uploadAtestadoModal = document.getElementById('upload-atestado-modal');
    const closeUploadAtestadoModalBtn = document.getElementById('close-upload-atestado-modal');
    const cancelUploadAtestadoBtn = document.getElementById('cancel-upload-atestado-btn');
    const formUploadAtestado = document.getElementById('form-upload-atestado');
    const salvarUploadAtestadoBtn = document.getElementById('salvar-upload-atestado-btn');

    // --- Seletores do Modal de Progresso (NOVO) ---
    const progressoModal = document.getElementById('progresso-modal');
    const closeProgressoModalBtn = document.getElementById('close-progresso-modal');
    const fecharProgressoModalBtn = document.getElementById('fechar-progresso-modal-btn');
    const progressoModalTitulo = document.getElementById('progresso-modal-titulo-acomp');
    const progressoModalBarFill = document.getElementById('progresso-modal-bar-fill');
    const progressoModalTexto = document.getElementById('progresso-modal-texto');

    const acompanhamentoSearchInput = document.getElementById('acompanhamento-search-input');
    const acompanhamentoFilterGroup = document.getElementById('acompanhamento-filter-group');
    const acompanhamentosListContainer = document.getElementById('acompanhamentos-lista'); // <-- A LINHA QUE FALTAVA

    // --- Seletores do Modal de Check-in de Acompanhamento (NOVO) ---
    const checkinModal = document.getElementById('checkin-modal');
    const closeCheckinModalBtn = document.getElementById('close-checkin-modal');
    const checkinDataAtual = document.getElementById('checkin-data-atual');
    const checkinProgressoTexto = document.getElementById('checkin-progresso-texto');
    const checkinProgressoBarra = document.getElementById('checkin-progresso-barra');
    const checkinListaMetas = document.getElementById('checkin-lista-metas');
    const formCheckinDiario = document.getElementById('form-checkin-diario');
    const salvarCheckinBtn = document.getElementById('salvar-checkin-btn');

    // --- Seletores da Aba Vacinas (Modal de Upload) ---
    const btnAbrirUploadVacina = document.getElementById('btn-abrir-upload-vacina');
    const uploadVacinaModal = document.getElementById('upload-vacina-modal');
    const closeUploadVacinaModalBtn = document.getElementById('close-upload-vacina-modal');
    const cancelUploadVacinaBtn = document.getElementById('cancel-upload-vacina-btn');
    const formUploadVacina = document.getElementById('form-upload-vacina');
    const salvarUploadVacinaBtn = document.getElementById('salvar-upload-vacina-btn');
    const uploadVacinaFeedback = document.getElementById('upload-vacina-feedback');

    // ==========================================================
    // (Fim de seletores)
    // ==========================================================
        

    // ==========================================================
    // --- 3. FUNÇÕES AUXILIARES DE UI (Interface) ---
    // (Funções que controlam a aparência da página)
    // ==========================================================
    
    /** Mostra ou esconde o overlay de carregamento */
    function showLoading(show) {
        if (!loadingOverlay) return;
        if (show) {
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.style.opacity = '1';
        } else {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.classList.add('hidden'), 300); // 300ms para a transição
        }
    }

    /** Abre o menu lateral mobile */
    function openMobileMenu() {
        if (mobileNavMenu) mobileNavMenu.classList.add('open');
        if (backdrop) backdrop.classList.remove('hidden');
    }

    /** Fecha o menu lateral mobile */
    function closeMobileMenu() {
        if (mobileNavMenu) mobileNavMenu.classList.remove('open');
        if (backdrop) backdrop.classList.add('hidden');
    }


    // ==========================================================
    // COLE O NOVO BLOCO DE CÓDIGO AQUI (Passo 3.2)
    // ==========================================================
    /**
     * PASSO 3.2
     * Atualiza a barra de progresso e o texto (ex: "1/5")
     * no modal de check-in diário.
     */
    function atualizarProgressoCheckin() {
    // 1. Verifica se os elementos do modal existem
    if (!checkinListaMetas || !checkinProgressoTexto || !checkinProgressoBarra) {
        console.warn("Elementos do modal de check-in não encontrados. A barra de progresso não pode ser atualizada.");
        return;
    }

    // 2. Conta os itens
    const todosOsItens = checkinListaMetas.querySelectorAll('.meta-item-checkin');
    const itensConcluidos = checkinListaMetas.querySelectorAll('.meta-item-checkin.concluido');

    const total = todosOsItens.length;
    const concluidos = itensConcluidos.length;

    // 3. Calcula a percentagem
    // (Evita divisão por zero se a lista estiver vazia)
    const percentagem = (total > 0) ? (concluidos / total) * 100 : 0;

    // 4. Atualiza o HTML
    checkinProgressoTexto.textContent = `${concluidos}/${total}`;
    checkinProgressoBarra.style.width = `${percentagem}%`;

    console.log(`Progresso do Check-in Atualizado: ${concluidos}/${total} (${percentagem}%)`);
    }
    // ==========================================================
    // FIM DO NOVO BLOCO
    // ==========================================================


// ==========================================================
// SUBSTITUA AS SUAS FUNÇÕES openModal/closeModal POR ESTAS
// (Esta é a correção do JS)
// ==========================================================

/** Mostra um modal (flutuante) */
const openModal = (modal) => {
  if (modal) {
    modal.classList.remove('hidden');
    // ESTA LINHA É A CORREÇÃO CRÍTICA:
    // Ela força o modal a aparecer, sobrepondo-se ao 'display: none' do CSS.
    modal.style.display = 'flex'; 
    
    console.log(`openModal: Modal ${modal.id} tornado visível.`);
  } else {
    console.error("openModal: Tentativa de abrir um modal nulo/inválido.");
  }
};

/** Fecha um modal (flutuante) */
const closeModal = (modal) => {
  if (modal) {
    modal.classList.add('hidden');
    // ESTA LINHA É A CORREÇÃO CRÍTICA:
    // Ela esconde o modal, para que o 'hidden' funcione
    modal.style.display = 'none'; 
    
    console.log(`closeModal: Modal ${modal.id} escondido.`);
  }
};
// ==========================================================
// FIM DA SUBSTITUIÇÃO
// ==========================================================

    // ==========================================================
    // COLE ESTAS DUAS FUNÇÕES (Fim)
    // ==========================================================


    


    // ==========================================================
    // --- 4. FUNÇÕES DE LÓGICA DE NAVEGAÇÃO ---
    // (Funções que controlam a troca de abas)
    // ==========================================================

    /** Troca o painel de conteúdo visível (Receitas, Exames, etc.) */
    function switchTab(tabId) {
        // 1. Desativa todos os botões e painéis
        if (tabNav) {
            tabNav.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        }
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
        if (mobileNavListContainer) {
            mobileNavListContainer.querySelectorAll('.mobile-nav-link').forEach(link => link.classList.remove('active'));
        }

        // 2. Ativa o botão e o painel corretos
        const activeBtn = tabNav ? tabNav.querySelector(`.tab-btn[data-tab="${tabId}"]`) : null;
        const activePanel = document.getElementById(`tab-${tabId}`);
        const activeMobileLink = mobileNavListContainer ? mobileNavListContainer.querySelector(`.mobile-nav-link[data-tab="${tabId}"]`) : null;

        if (activeBtn) activeBtn.classList.add('active');
        if (activePanel) activePanel.classList.remove('hidden');
        if (activeMobileLink) activeMobileLink.classList.add('active');

        // 3. Carrega os dados para a aba
        loadDataForTab(tabId);
    }

    /** Copia as abas do desktop para o menu mobile (para não repetir HTML) */
    function populateMobileNav() {
        if (!tabNav || !mobileNavListContainer) return;
        const tabs = tabNav.querySelectorAll('.tab-btn');
        mobileNavListContainer.innerHTML = ''; // Limpa
        tabs.forEach(tab => {
            const tabId = tab.dataset.tab;
            const iconClass = tab.querySelector('i').className;
            const text = tab.querySelector('span').textContent;
            
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'mobile-nav-link';
            if (tab.classList.contains('active')) {
                link.classList.add('active');
            }
            link.dataset.tab = tabId;
            link.innerHTML = `<i class="${iconClass}"></i><span>${text}</span>`;
            mobileNavListContainer.appendChild(link);
        });
    }

    /** Coordenador: Decide quais dados carregar ao trocar de aba */
    function loadDataForTab(tabId) {
        console.log(`Carregando dados para a aba: ${tabId}`);
        switch(tabId) {
            case 'receitas':
                loadReceitas();
                break;
            case 'exames':
                loadExames();
                break;
            case 'encaminhamentos':
                loadEncaminhamentos(); 
                break;
            case 'atestados':
                loadAtestados(); // Vamos criar esta função agora
                break;
            case 'acompanhamentos':
                loadAcompanhamentos(); // Vamos criar esta função agora
                break;
            case 'anamnese':
                loadAnamnese(); // Vamos criar esta função agora
                break;
            case 'registros-diarios':
                // Primeiro, garante que os dados estão carregados (ou carrega-os)
                loadHistoricoRegistrosCompleto().then(() => {
                    // Depois, renderiza o modal
                    renderHistoricoModal();
                });
                break;    
            case 'vacinas':
                loadVacinas();
                break;
            // TODO: Adicionar 'case' para as outras abas
            default:
                console.log(`Nenhuma ação de carregamento definida para ${tabId}`);
        }
    }

    // ==========================================================
    // --- 5. FUNÇÕES DE CARREGAMENTO DE DADOS (Data) ---
    // (Funções que falam com o Firebase para buscar dados)
    // ==========================================================

    // --- 1. CARREGAR DADOS (COM AUTO-CRIAÇÃO DE EMERGÊNCIA) ---
    async function loadPatientData(uid) {
        console.log("Buscando dados para ID:", uid);
        try {
            const docRef = doc(db, 'pacientes', uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                // CENÁRIO A: Perfil existe
                const data = docSnap.data();
                console.log("Perfil carregado com sucesso.");
                currentPatientData = data;
                populateHeader(data);
                return data;
            } else {
                // CENÁRIO B: Perfil não existe (O erro atual)
                console.warn("Perfil não encontrado. Criando perfil automático agora...");
                
                // Cria dados padrão baseados no Login
                const novoPerfil = {
                    nome: currentUser.displayName || "Paciente Novo",
                    email: currentUser.email || "email@pendente.com",
                    data_cadastro: serverTimestamp(),
                    tipo: "paciente",
                    foto_url: currentUser.photoURL || "https://placehold.co/60x60/a0d9e5/41b8d5?text=P",
                    status_conta: "ativo"
                };
                
                // SALVA IMEDIATAMENTE NO FIRESTORE
                await setDoc(docRef, novoPerfil);
                console.log("Perfil de emergência salvo!");
                
                // Atualiza a memória
                currentPatientData = novoPerfil;
                populateHeader(novoPerfil);
                
                // RETORNA OS DADOS NOVOS (Isso impede o erro na próxima função)
                return novoPerfil;
            }
        } catch (e) {
            console.error("Erro crítico ao carregar perfil:", e);
            // Retorna um objeto básico para não travar a página
            return { nome: "Paciente", email: currentUser.email };
        }
    }

    // --- PREENCHER CABEÇALHO (FOTO E NOME) ---
    function populateHeader(data, uid) {
        // Seletores do HTML (perfil-de-saude.html)
        const photoEl = document.getElementById('patient-photo');
        const nameEl = document.getElementById('patient-name');
        const idEl = document.getElementById('patient-id');
        const convenioEl = document.getElementById('patient-convenio');

        // 1. Preenche o Nome
        if (nameEl) {
            nameEl.textContent = data.nome || "Paciente";
        }

        // 2. Preenche a Foto
        if (photoEl) {
            if (data.foto_url && data.foto_url.trim() !== "") {
                // Se tiver foto salva, usa ela
                photoEl.src = data.foto_url;
            } else {
                // Se não tiver, cria um avatar com a inicial do nome
                const letra = (data.nome || 'P').charAt(0).toUpperCase();
                photoEl.src = `https://placehold.co/60x60/a0d9e5/41b8d5?text=${letra}`;
            }
        }

        // 3. Preenche ID e Convênio (se existirem no HTML)
        if (idEl) idEl.textContent = `ID: ${uid ? uid.substring(0, 6) : '...'}`;
        if (convenioEl) convenioEl.textContent = data.convenio?.nome || data.plano || "Particular";
    }

    // ==========================================================
    // --- 6. FUNÇÕES DE MOCK DATA (Dados Falsos) ---
    // (Usado quando o Firestore está vazio)
    // ==========================================================

    function getMockReceitas() {
        console.warn("Usando MOCK DATA para Receitas, pois o Firestore está vazio.");
        const mockDoctorName = "Dr. Carlos Mendes"; 
        const mockDoctorCRM = "CRM/SP 123456";
        return [
            { id: 'mock1', medicamento: 'Losartana 50mg', dosagem: '1 comprimido', frequencia: '1x ao dia', duracao: 'Uso contínuo', medico: mockDoctorName, registro_profissional: mockDoctorCRM, timestamp: new Date('2025-01-15T09:00:00'), status: 'Ativa' },
            { id: 'mock2', medicamento: 'Sinvastatina 20mg', dosagem: '1 comprimido', frequencia: '1x ao dia (noite)', duracao: 'Uso contínuo', medico: mockDoctorName, registro_profissional: mockDoctorCRM, timestamp: new Date('2025-01-15T09:00:00'), status: 'Ativa' },
            { id: 'mock3', medicamento: 'Amoxicilina 500mg', dosagem: '1 cápsula', frequencia: '3x ao dia', duracao: '7 dias', medico: 'Dra. Ana Santos', registro_profissional: 'CRM/SP 789012', timestamp: new Date('2025-01-02T14:00:00'), status: 'Concluída' }
        ];
    }

    function getMockExames() {
        console.warn("Usando MOCK DATA para Exames.");
        return [
            { id: 'mock_ex1', titulo: 'Hemograma Completo', laboratorio: 'Laboratório São Paulo', status: 'Realizado', data: '2025-01-10', solicitadoPor: 'Dr. Carlos Mendes', resultado: 'Valores normais dentro do esperado', url_pdf: '#' },
            { id: 'mock_ex2', titulo: 'Ultrassom Abdominal', laboratorio: 'Clínica Imagem Plus', status: 'Agendado', data: '2025-01-25', solicitadoPor: 'Dr. Carlos Mendes', resultado: null, url_agendamento: '#' },
            { id: 'mock_ex3', titulo: 'Ressonância Magnética - Joelho', laboratorio: 'Upload externo', status: 'Pendente Upload', data: '2024-12-20', solicitadoPor: 'Dr. Pedro Almeida', resultado: null, url_upload: '#' }
        ];
    }

    function getMockEncaminhamentos() {
        console.warn("Usando MOCK DATA para Encaminhamentos.");
        return [
            {
                id: 'mock_enc1',
                especialidade: 'Cardiologia',
                motivo: 'Avaliação de hipertensão arterial',
                status: 'Pendente',
                data: '2025-01-15',
                solicitadoPor: 'Dr. Carlos Mendes',
                observacoes: 'Paciente com hipertensão de difícil controle, necessita ajuste medicamentoso'
            },
            {
                id: 'mock_enc2',
                especialidade: 'Ortopedia',
                motivo: 'Dor no joelho direito',
                status: 'Agendado',
                data: '2024-12-20',
                solicitadoPor: 'Dra. Ana Santos',
                observacoes: 'Avaliação de possível lesão de menisco'
            }
        ];
    }

        function getMockAtestados() {
        console.warn("Usando MOCK DATA para Atestados.");
        return [
            {
                id: 'mock_at1',
                titulo: 'Atestado Médico',
                motivo: 'Gripe e febre',
                status: 'Expirado', // Usaremos "Válido" ou "Expirado"
                dataInicio: '2025-01-05',
                duracao: '3 dias',
                medico: 'Dra. Ana Santos - CRM/SP 789012'
            },
            {
                id: 'mock_at2',
                titulo: 'Atestado de Comparecimento',
                motivo: 'Consulta de rotina',
                status: 'Válido',
                dataInicio: '2025-01-15',
                duracao: '2 horas',
                medico: 'Dr. Carlos Mendes - CRM/SP 123456'
            }
        ];
    }

    function getMockAcompanhamentos() {
        console.warn("Usando MOCK DATA para Acompanhamentos.");
        return [
            {
                id: 'mock_ac1',
                titulo: 'Pós-Consulta Cardiologia',
                motivo: 'Acompanhamento de pressão arterial',
                status: 'Ativo', // Status para filtro
                dataInicio: '2025-01-15',
                medico: 'Dr. Carlos Mendes',
                progresso: '50%' // Dado para a 3ª coluna
            },
            {
                id: 'mock_ac2',
                titulo: 'Tratamento Ortopédico',
                motivo: 'Reabilitação pós-lesão no joelho',
                status: 'Concluído', // Status para filtro
                dataInicio: '2024-12-01',
                medico: 'Dr. Pedro Almeida',
                progresso: '100%' // Dado para a 3ª coluna
            }
        ];
    }


    /**
 * MOCK DATA (Passo 3.1): Lista de laboratórios falsos para
 * a funcionalidade "Agendar Exame".
 */
const mockLaboratorios = [
    {
      id: 'lab1',
      nome: "Laboratório Vida",
      endereco: "Rua das Flores, 123 - Centro",
      preco: 200.00, // <-- NOVO
      datasDisponiveis: ["10/11/2025 09:00", "11/11/2025 14:00", "12/11/2025 08:30"],
      examesQueFaz: ["Hemograma Completo", "Glicemia", "Colesterol", "Exame de Urina"]
    },
    {
      id: 'lab2',
      nome: "Laboratório Central",
      endereco: "Av. Principal, 500 - Bloco A",
      preco: 180.50, // <-- NOVO
      datasDisponiveis: ["10/11/2025 10:00", "10/11/2025 10:30", "13/11/2025 11:00"],
      examesQueFaz: ["Hemograma Completo", "Glicemia", "TSH", "Covid-19 PCR"]
    },
    {
      id: 'lab3',
      nome: "Clínica Diagnóstika",
      endereco: "Rua da Saúde, 789 - Sul",
      preco: 350.00, // <-- NOVO
      datasDisponiveis: ["11/11/2025 07:30", "11/11/2025 07:45", "14/11/2025 15:00"],
      examesQueFaz: ["Raio-X", "Ressonância Magnética", "Tomografia", "Ultrassom"]
    },
    {
      id: 'lab4',
      nome: "Labis",
      endereco: "Av. Norte, 1020 - Sala 3",
      preco: 120.00, // <-- NOVO
      datasDisponiveis: ["10/11/2025 11:00", "12/11/2025 11:00", "13/11/2025 11:00"],
      examesQueFaz: ["Hemograma Completo", "Exame de Urina"]
    },
    {
      id: 'lab5',
      nome: "Centro de Imagem Avançada",
      endereco: "Rua do Hospital, 404 - Leste",
      preco: 450.00, // <-- NOVO
      datasDisponiveis: ["15/11/2025 13:00", "15/11/2025 13:30", "15/11/2025 14:00"],
      examesQueFaz: ["Ressonância Magnética", "Tomografia Computadorizada"]
    },
    {
      id: 'lab6',
      nome: "Lab Saúde Mulher",
      endereco: "Av. das Américas, 2000",
      preco: 210.00, // <-- NOVO
      datasDisponiveis: ["11/11/2025 08:00", "12/11/2025 08:00"],
      examesQueFaz: ["Papanicolau", "Ultrassom Pélvico", "Mamografia"]
    },
    {
      id: 'lab7',
      nome: "Biocenter Análises",
      endereco: "Praça da Sé, 10 - Centro",
      preco: 85.00, // <-- NOVO
      datasDisponiveis: ["10/11/2025 14:00", "10/11/2025 14:30"],
      examesQueFaz: ["Glicemia", "Colesterol", "Triglicerídeos"]
    },
    {
      id: 'lab8',
      nome: "Laboratório Exato",
      endereco: "Rua 7 de Setembro, 77",
      preco: 90.00, // <-- NOVO
      datasDisponiveis: ["11/11/2025 10:00", "12/11/2025 10:00"],
      examesQueFaz: ["Hemograma Completo", "Covid-19 PCR", "Dengue"]
    },
    {
      id: 'lab9',
      nome: "Clínica de Diagnóstico Rápido",
      endereco: "Av. da Azenha, 1234",
      preco: 75.50, // <-- NOVO
      datasDisponiveis: ["13/11/2025 16:00", "14/11/2025 16:00"],
      examesQueFaz: ["Covid-19 Teste Rápido", "Glicemia"]
    },
    {
      id: 'lab10',
      nome: "LabPequeno",
      endereco: "Rua dos Andradas, 567",
      preco: 110.00, // <-- NOVO
      datasDisponiveis: ["10/11/2025 08:00", "11/11/2025 08:00", "12/11/2025 08:00"],
      examesQueFaz: ["Hemograma Completo", "Exame de Urina"]
    }
];


    
/**
 * SUBSTITUIÇÃO (V5 - Remove o Botão "Compartilhar")
 * Esta função agora tem a lógica IF/ELSE para o layout E
 * NÃO inclui o botão "Compartilhar".
 */
// Substitui a tua função renderRecipeList (ou renderRecipes) por esta:

function renderRecipeList(recipesToRender) {
    const container = document.getElementById('recipe-list'); // Confirma se o ID é este no teu HTML
    if (!container) return;

    container.innerHTML = '';

    if (!recipesToRender || recipesToRender.length === 0) {
        container.innerHTML = '<p class="placeholder">Nenhuma receita encontrada.</p>';
        return;
    }

    // Ordena por data (mais recente primeiro)
    recipesToRender.sort((a, b) => {
        const dateA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp)) : new Date(0);
        const dateB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp)) : new Date(0);
        return dateB - dateA;
    });

    recipesToRender.forEach(receita => {
        // 1. Definir Status e Cor
        let statusClass = 'status-arquivada';
        if (receita.status === 'Ativa') statusClass = 'status-ativa';

        // 2. Formatar Data
        let dataJS = new Date();
        if (receita.emissao) {
            dataJS = new Date(receita.emissao); // Tenta ler string ISO
        } else if (receita.timestamp) {
            dataJS = receita.timestamp.toDate ? receita.timestamp.toDate() : new Date(receita.timestamp);
        }
        const dataFormatada = dataJS.toLocaleDateString('pt-BR');

        // 3. LÓGICA INTELIGENTE PARA O TÍTULO (Corrige o "undefined")
        let tituloReceita = "Receita Médica";
        let detalhesHtml = "";

        // CASO A: Receita do Médico (Lista de Medicamentos)
        if (receita.medicamentos && Array.isArray(receita.medicamentos) && receita.medicamentos.length > 0) {
            // Pega o nome do primeiro remédio
            tituloReceita = receita.medicamentos[0].nome;
            
            // Se tiver mais que um, adiciona "+ X outros"
            if (receita.medicamentos.length > 1) {
                tituloReceita += ` + ${receita.medicamentos.length - 1} outro(s)`;
            }

            // Cria uma lista bonita para os detalhes
            const listaMeds = receita.medicamentos.map(m => 
                `<div>• <strong>${m.nome}</strong>: ${m.dosagem || ''} (${m.frequencia || ''})</div>`
            ).join('');
            
            detalhesHtml = `
                <div class="recipe-details-clean" style="display:block; margin-top:10px;">
                    ${listaMeds}
                    <div style="margin-top:8px; font-size:0.85rem; color:#666;">
                        <i class="fa-solid fa-user-doctor"></i> Prescrito por: <strong>${receita.medico || 'Médico'}</strong>
                    </div>
                </div>
            `;
        } 
        // CASO B: Receita Simples / Upload (Campo único)
        else if (receita.medicamento) {
            tituloReceita = receita.medicamento;
            detalhesHtml = `
                <div class="recipe-details-clean">
                   <span><i class="fa-solid fa-user-doctor"></i> Prescrito por: <strong>${receita.medico || 'N/A'}</strong></span>
                   <span><i class="fa-solid fa-calendar-days"></i> Data: <strong>${dataFormatada}</strong></span>
                </div>
            `;
        }
        // CASO C: Fallback (Para garantir que nunca aparece undefined)
        else if (receita.titulo) {
            tituloReceita = receita.titulo;
        }

        // 4. Botões de Ação
        let botoesHtml = `
            <button class="btn-pdf" data-action="gerar-pdf" data-recipe-id="${receita.id}">
                <i class="fa-solid fa-file-pdf"></i> Visualizar PDF
            </button>
        `;

        // Só mostra o ícone de apagar se foi o paciente que fez upload
        if (receita.origem === 'paciente') {
            botoesHtml += `
                <button class="btn-apagar-receita" data-action="apagar" data-recipe-id="${receita.id}" aria-label="Apagar receita" title="Apagar receita">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
        }

        // 5. HTML Final do Card
        const cardHTML = `
            <div class="recipe-card" data-recipe-id="${receita.id}">
                <div class="recipe-header">
                    <h3><i class="fa-solid fa-pills"></i> ${tituloReceita}</h3>
                    <span class="badge ${statusClass}">${receita.status || 'Ativa'}</span>
                </div>
                
                ${detalhesHtml}

                <div class="recipe-footer">
                    <div class="card-footer-actions">
                        ${botoesHtml}
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}
//------------------------------------------------------------------------------------------------------------------------------------------


    /**
 * NOVA FUNÇÃO (Cérebro): Decide qual ação de PDF tomar.
 * Esta é a função que o botão vai chamar.
 */
function handleGerarPdf(recipeId) {
    console.log(`Iniciando geração de PDF para: ${recipeId}`);
    
    // 1. Encontra a receita na nossa lista da memória (allRecipes)
    const receitaData = allRecipes.find(r => r.id.toString() === recipeId.toString());

    if (!receitaData) {
        alert("Erro: Receita não encontrada.");
        return;
    }

    // 2. Verifica se é um upload do paciente (tem fileURL)
    // O seu upload "Firebase" vai entrar aqui.
    if (receitaData.fileURL) {
        console.log("É um upload do paciente. Abrindo o ficheiro original...");
        // Ação Fácil: Apenas abre o link do ficheiro que o paciente guardou
        window.open(receitaData.fileURL, '_blank');
    } 
    // 3. É uma receita do sistema (Mock ou do Médico, não tem fileURL)
    // O seu mock "Losartana" vai entrar aqui.
    else {
        console.log("É uma receita do sistema. Gerando PDF com jsPDF...");
        // Ação Difícil: Chama a função "trabalhadora" para desenhar o PDF
        gerarPdfDeReceitaMock(receitaData);
    }
}
/**
 * GERA PDF DE ATESTADO (Corrigido: Dias e Documento do Paciente)
 */
async function gerarPDFAtestado(atestadoId) {
    // 1. Encontra os dados
    const atestadoData = allAtestados.find(a => a.id.toString() === atestadoId.toString());

    if (!atestadoData) {
        alert("Erro: Atestado não encontrado.");
        return;
    }

    const template = document.getElementById('pdf-atestado-template');
    if (!template) { alert("Erro: Template PDF não encontrado."); return; }

    // --- PREENCHIMENTO DOS DADOS ---
    
    // Cabeçalho
    document.getElementById('pdf-atestado-doctor-name').textContent = atestadoData.medico || atestadoData.nome_profissional || "Profissional";
    document.getElementById('pdf-atestado-doctor-specialty').textContent = atestadoData.especialidade_profissional || "Especialidade";
    document.getElementById('pdf-atestado-doctor-crm').textContent = atestadoData.registro_profissional || "";
    
    document.getElementById('pdf-atestado-patient-name').textContent = currentPatientData.nome || "Paciente";
    
    // Data de Emissão
    let dataEmissao = new Date().toLocaleDateString('pt-BR');
    if (atestadoData.emissao || atestadoData.timestamp) {
        const raw = atestadoData.emissao || atestadoData.timestamp;
        try {
             const d = raw.toDate ? raw.toDate() : new Date(raw);
             dataEmissao = d.toLocaleDateString('pt-BR');
        } catch(e){}
    }
    document.getElementById('pdf-atestado-emission-date').textContent = dataEmissao;

    // --- CORREÇÃO DO TEXTO DO CORPO (DIAS E DOCUMENTO) ---
    const nomePaciente = currentPatientData.nome || "Paciente";
    // Pega o CPF ou RG do paciente logado
    const docPaciente = currentPatientData.cpf || currentPatientData.rg || "Não informado";
    // Pega os dias (do médico ou do paciente)
    const dias = atestadoData.diasAfastamento || atestadoData.duracao || "0";
    
    // Formata Data de Início
    let dataInicio = "N/D";
    if (atestadoData.dataInicio) {
        const d = new Date(atestadoData.dataInicio + 'T00:00:00');
        dataInicio = d.toLocaleDateString('pt-BR');
    }

    // Injeta o texto completo dinamicamente para garantir que as variáveis entram
    const textoCorpo = `
        Atesto para os devidos fins que o(a) paciente <strong>${nomePaciente}</strong>, 
        portador(a) do documento <strong>${docPaciente}</strong>, necessita de 
        <strong>${dias}</strong> dia(s) de afastamento de suas atividades (laborais/escolares), 
        a partir de <strong>${dataInicio}</strong>, por motivos de saúde.
    `;
    
    // Atualiza o HTML do parágrafo principal
    document.getElementById('pdf-atestado-texto').innerHTML = textoCorpo;

    // Detalhes Rodapé
    document.getElementById('pdf-atestado-motivo').textContent = atestadoData.motivo || "";
    document.getElementById('pdf-atestado-cid').textContent = atestadoData.cid || "N/A";
    document.getElementById('pdf-atestado-observacoes').textContent = atestadoData.observacoes || "Nenhuma.";
    
    document.getElementById('pdf-atestado-signature-name').textContent = atestadoData.medico || atestadoData.nome_profissional || "Assinado";

    // --- GERAÇÃO (Técnica Clonagem + Cortina Branca) ---
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.style.backgroundColor = '#ffffff'; 
        loadingOverlay.style.opacity = '1';
    }

    const clone = template.cloneNode(true);
    clone.id = "temp-pdf-clone-atestado";
    clone.style.position = 'fixed';
    clone.style.left = '50%';
    clone.style.top = '50%';
    clone.style.transform = 'translate(-50%, -50%)';
    clone.style.zIndex = '100'; 
    clone.style.display = 'block';
    clone.style.visibility = 'visible';
    clone.style.backgroundColor = '#ffffff';

    document.body.appendChild(clone);

    try {
        await new Promise(r => setTimeout(r, 500));

        const canvas = await html2canvas(clone, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`atestado-${(nomePaciente).split(' ')[0]}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF atestado:", error);
        alert("Não foi possível gerar o PDF.");
    } finally {
        if (document.body.contains(clone)) document.body.removeChild(clone);
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.backgroundColor = ''; 
        }
    }
}
/**
 * GERA PDF DE ENCAMINHAMENTO (Técnica Blindada: Clone + Cortina)
 */
async function gerarPDFEncaminhamento(encId) {
    // 1. Encontra os dados
    const encData = allEncaminhamentos.find(enc => enc.id.toString() === encId.toString());

    if (!encData) {
        alert("Erro: Dados do encaminhamento não encontrados.");
        return;
    }

    const template = document.getElementById('pdf-encaminhamento-template');
    if (!template) { alert("Erro: Template PDF não encontrado."); return; }

    // --- PREENCHIMENTO DOS DADOS ---
    
    // Cabeçalho
    document.getElementById('pdf-enc-doctor-name').textContent = encData.nome_profissional || encData.solicitadoPor || "Profissional";
    document.getElementById('pdf-enc-doctor-spec').textContent = encData.especialidade_profissional || "Especialidade";
    document.getElementById('pdf-enc-doctor-crm').textContent = encData.registro_profissional || "";
    document.getElementById('pdf-enc-patient-name').textContent = currentPatientData.nome || "Paciente";

    // Data
    let dataFmt = 'Data N/D';
    let dataRaw = encData.data || encData.timestamp;
    if (dataRaw) {
        try {
            const d = dataRaw.toDate ? dataRaw.toDate() : new Date(dataRaw);
            dataFmt = d.toLocaleDateString('pt-BR');
        } catch(e){}
    }
    document.getElementById('pdf-enc-date').textContent = dataFmt;

    // Conteúdo Principal
    document.getElementById('pdf-enc-specialty').textContent = encData.especialidade || "Especialidade não informada";
    document.getElementById('pdf-enc-reason').textContent = encData.motivo || "Avaliação clínica";
    
    // Observações / Recomendações
    const obsEl = document.getElementById('pdf-enc-obs');
    const obsContainer = document.getElementById('pdf-enc-obs-container');
    
    // Verifica vários campos possíveis para observações
    const textoObs = encData.recomendacoes || encData.observacoes;
    
    if (textoObs) {
        obsEl.textContent = textoObs;
        obsContainer.style.display = 'block';
    } else {
        obsContainer.style.display = 'none';
    }

    document.getElementById('pdf-enc-signature').textContent = encData.nome_profissional || "Assinado Digitalmente";

    // --- GERAÇÃO (Técnica Clonagem + Cortina) ---
    
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.style.backgroundColor = '#ffffff'; // Cortina Sólida
        loadingOverlay.style.opacity = '1';
    }

    // 1. Cria Clone
    const clone = template.cloneNode(true);
    clone.id = "temp-enc-clone";
    clone.style.position = 'fixed';
    clone.style.left = '50%';
    clone.style.top = '50%';
    clone.style.transform = 'translate(-50%, -50%)';
    clone.style.zIndex = '100'; // Atrás do loading (2000)
    clone.style.display = 'block';
    clone.style.visibility = 'visible';
    clone.style.backgroundColor = '#ffffff';

    document.body.appendChild(clone);

    try {
        await new Promise(r => setTimeout(r, 500));

        const canvas = await html2canvas(clone, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`encaminhamento-${(currentPatientData.nome || 'paciente').split(' ')[0]}.pdf`);

    } catch (error) {
        console.error("Erro PDF Encaminhamento:", error);
        alert("Erro ao gerar PDF.");
    } finally {
        if (document.body.contains(clone)) document.body.removeChild(clone);
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.backgroundColor = ''; // Restaura transparência
        }
    }
}
/**
 * GERA PDF DE PEDIDO DE EXAME (CORRIGIDO: IDs Certos + Cortina Branca)
 */
async function gerarPDFExame(exameId) {
    // 1. Encontra os dados do exame
    const exameData = allExames.find(ex => ex.id.toString() === exameId.toString());

    if (!exameData) {
        alert("Erro: Dados do exame não encontrados.");
        return;
    }

    const template = document.getElementById('pdf-exame-template');
    if (!template) { alert("Erro: Template PDF não encontrado."); return; }

    // --- PREENCHIMENTO DOS DADOS (USANDO OS IDs CURTOS DO TEU HTML) ---
    
    // Cabeçalho
    // (Usa 'pdf-ex-' porque é isso que está no teu HTML)
    const elDocName = document.getElementById('pdf-ex-doctor-name');
    const elDocSpec = document.getElementById('pdf-ex-doctor-spec');
    const elDocCrm = document.getElementById('pdf-ex-doctor-crm');
    
    if (elDocName) elDocName.textContent = exameData.nome_profissional || exameData.solicitadoPor || "Profissional";
    if (elDocSpec) elDocSpec.textContent = exameData.especialidade_profissional || "Especialidade";
    if (elDocCrm) elDocCrm.textContent = exameData.registro_profissional || "";
    
    // Paciente
    const elPatName = document.getElementById('pdf-ex-patient-name');
    if (elPatName) elPatName.textContent = currentPatientData.nome || "Paciente";

    // Data
    const elDate = document.getElementById('pdf-ex-date');
    if (elDate) {
        let dataFmt = 'Data N/D';
        let dataRaw = exameData.dataSolicitacao || exameData.timestamp;
        if (dataRaw) {
            try {
                const d = dataRaw.toDate ? dataRaw.toDate() : new Date(dataRaw);
                dataFmt = d.toLocaleDateString('pt-BR');
            } catch(e){}
        }
        elDate.textContent = dataFmt;
    }

    // Lista de Exames
    const listContainer = document.getElementById('pdf-ex-list');
    if (listContainer) {
        listContainer.innerHTML = '';
        if (exameData.tiposExame && Array.isArray(exameData.tiposExame)) {
            exameData.tiposExame.forEach(tipo => {
                const li = document.createElement('li');
                li.textContent = tipo;
                li.style.marginBottom = "5px";
                listContainer.appendChild(li);
            });
        } else if (exameData.titulo) {
            const li = document.createElement('li');
            li.textContent = exameData.titulo;
            listContainer.appendChild(li);
        }
    }

    // Motivo
    const elMotivo = document.getElementById('pdf-ex-motivo');
    if (elMotivo) elMotivo.textContent = exameData.motivo || "Rotina";
    
    // Jejum
    const elJejum = document.getElementById('pdf-ex-jejum');
    if (elJejum) {
        if (exameData.jejumNecessario) {
            elJejum.textContent = "⚠️ Necessário Jejum de 8 a 12 horas.";
            elJejum.style.display = "block";
        } else {
            elJejum.style.display = "none";
        }
    }

    // Assinatura
    const elSig = document.getElementById('pdf-ex-signature');
    if (elSig) elSig.textContent = exameData.nome_profissional || "Assinado Digitalmente";


    // --- GERAÇÃO DO PDF (Com Cortina Branca) ---
    
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        // TRUQUE: Força o fundo a ser BRANCO SÓLIDO para tapar o PDF "fantasma"
        loadingOverlay.style.backgroundColor = '#ffffff'; 
        loadingOverlay.style.opacity = '1';
    }

    // 1. Cria um Clone
    const clone = template.cloneNode(true);

    // 2. Configura o Clone para ficar ATRÁS do loading (z-index 100 vs 2000)
    clone.id = "temp-pdf-clone";
    clone.style.position = 'fixed';
    clone.style.left = '50%';
    clone.style.top = '50%';
    clone.style.transform = 'translate(-50%, -50%)';
    clone.style.zIndex = '100'; 
    clone.style.display = 'block';
    clone.style.visibility = 'visible';
    clone.style.backgroundColor = '#ffffff';

    // 3. Adiciona ao corpo
    document.body.appendChild(clone);

    try {
        // Pausa para renderização
        await new Promise(r => setTimeout(r, 500));

        // 4. Tira a foto
        const canvas = await html2canvas(clone, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`pedido-exame-${(currentPatientData.nome || 'paciente').split(' ')[0]}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF do exame:", error);
        alert("Não foi possível gerar o PDF.");
    } finally {
        // 5. Limpeza
        if (document.body.contains(clone)) {
            document.body.removeChild(clone);
        }
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            // Restaura o estilo original (transparente) para não estragar outros carregamentos
            loadingOverlay.style.backgroundColor = ''; 
        }
    }
}
// ==========================================================
// COLE O NOVO BLOCO DE CÓDIGO AQUI (Passo 3.3 - Funções Vazias)
// ==========================================================

/**
 * TAREFA: (Passo 3.4) Abre o PDF/Link da vacina.
 */
function handleGerarPdfVacina(vacinaData) {
  // Tenta encontrar o link.
  // 1º: Procura o 'fileURL' (que vem do nosso upload do Storage)
  // 2º: Procura o 'url_pdf' (que vem dos teus mocks)
  const urlParaAbrir = vacinaData.fileURL || vacinaData.url_pdf;

  if (urlParaAbrir) {
    // Se encontrou um link, abre-o numa nova aba
    console.log(`Abrindo URL da vacina: ${urlParaAbrir}`);
    window.open(urlParaAbrir, '_blank');
  } else {
    // Se não encontrou link (ex: um registro antigo sem anexo)
    console.warn("Nenhum URL de ficheiro encontrado para esta vacina.");
    alert("Nenhum arquivo (PDF ou Imagem) está anexado a este registro de vacina.");
  }
}

/**
 * TAREFA: (Passo 3.5) Apaga a vacina do Firestore e Storage.
 * (ESTA É A VERSÃO FUNCIONAL COMPLETA)
 */
async function handleApagarVacina(vacinaId, vacinaData) {
    if (!currentUser) {
        alert("Erro: Utilizador não autenticado.");
        return;
    }

    // 1. REGRA DE NEGÓCIO: Confirma se o paciente pode apagar (origem)
    // (Esta verificação já é feita ao mostrar o botão, mas adicionamos uma segurança extra)
    if (vacinaData.origem !== 'paciente') {
        alert("Não é possível apagar uma vacina registada por um profissional de saúde.");
        return;
    }

    // 2. Confirmação do Utilizador
    if (!confirm("Tem certeza que deseja apagar este registo de vacina permanentemente? Esta ação não pode ser desfeita.")) {
        return;
    }

    console.log(`Iniciando a exclusão da vacina ID: ${vacinaId}`);
    showLoading(true); // Mostra o overlay de carregamento

    try {
        // 3. Apaga o Documento do Firestore
        console.log(`Apagando do Firestore: pacientes/${currentUser.uid}/vacinas/${vacinaId}`);
        const docRef = doc(db, 'pacientes', currentUser.uid, 'vacinas', vacinaId);
        await deleteDoc(docRef);

        // 4. Apaga o Ficheiro do Storage (se existir)
        if (vacinaData.fileURL && vacinaData.fileURL.includes('firebasestorage.googleapis.com')) {
            console.log("Vacina tem um fileURL. A apagar do Storage...");
            try {
                // recria a referência do ficheiro a partir do URL
                const storageRef = ref(getStorage(app), vacinaData.fileURL);
                await deleteObject(storageRef);
                console.log("Ficheiro apagado do Storage com sucesso.");
            } catch (storageError) {
                // Se o ficheiro não for encontrado, não bloqueia a operação,
                // pois o registo do Firestore é o mais importante.
                if (storageError.code === 'storage/object-not-found') {
                    console.warn("O ficheiro no Storage já não existia, mas o registo do Firestore foi apagado.");
                } else {
                    throw storageError; // Lança outros erros do storage
                }
            }
        }

        alert("Vacina apagada com sucesso!");

        // 5. Força o recarregamento da lista na tela (Isto atualiza a UI)
        loadVacinas(true); // O 'true' força a busca de dados e o redesenho

    } catch (error) {
        console.error("Erro ao apagar a vacina:", error);
        alert(`Ocorreu um erro ao apagar a vacina. Por favor, tente novamente.\n\nErro: ${error.message}`);
    } finally {
        showLoading(false); // Esconde o overlay em qualquer cenário
    }
}
// ==========================================================
// FIM DO NOVO BLOCO
// ==========================================================


// [COLE O CÓDIGO ABAIXO AQUI]

/**
 * NOVA FUNÇÃO (AUXILIAR): Gera um PDF "Mock" para um Encaminhamento
 * (Isto é chamado se o encaminhamento NÃO for um upload de ficheiro)
 */
function _generateMockPdfEncaminhamento(encData) {
    console.log("Gerando PDF mock para encaminhamento:", encData.id);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    try {
        const margemEsquerda = 15;
        const margemSuperior = 20;
        let linhaAtual = margemSuperior;

        // 1. Cabeçalho (Info do Médico)
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Dr(a) " + (encData.solicitadoPor || "Nome do Médico"), 210 - margemEsquerda, linhaAtual, { align: 'right' });
        linhaAtual += 4;
        doc.setFont("helvetica", "normal");
        // (Estes campos vêm do mock ou do upload do profissional no futuro)
        doc.text(encData.especialidade_profissional || "Especialidade", 210 - margemEsquerda, linhaAtual, { align: 'right' });
        linhaAtual += 4;
        doc.text(encData.registro_profissional || "CRM 123456", 210 - margemEsquerda, linhaAtual, { align: 'right' });

        // 2. Título "Encaminhamento"
        linhaAtual += 25;
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Encaminhamento Clínico", 105, linhaAtual, { align: 'center' }); // 105 é o meio da folha A4

        // 3. Info do Paciente
        linhaAtual += 20;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Paciente:", margemEsquerda, linhaAtual);
        doc.setFont("helvetica", "normal");
        doc.text(currentPatientData.nome || "Nome do Paciente", margemEsquerda + 20, linhaAtual);
        
        // Lógica de Data
        // Adicionamos 'T00:00:00' para garantir que o fuso horário não mude o dia
        const dataJS = new Date(encData.data + 'T00:00:00'); 
        const dataFormatada = dataJS.toLocaleDateString('pt-BR');
        
        linhaAtual += 7;
        doc.setFont("helvetica", "bold");
        doc.text("Data de Emissão:", margemEsquerda, linhaAtual);
        doc.setFont("helvetica", "normal");
        doc.text(dataFormatada, margemEsquerda + 30, linhaAtual);

        // 4. Secção "Detalhes"
        linhaAtual += 20;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Detalhes do Encaminhamento", margemEsquerda, linhaAtual);
        
        linhaAtual += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        doc.setFont("helvetica", "bold");
        doc.text("Especialidade:", margemEsquerda, linhaAtual);
        doc.setFont("helvetica", "normal");
        doc.text(encData.especialidade || "N/A", margemEsquerda + 35, linhaAtual);
        
        linhaAtual += 8;
        doc.setFont("helvetica", "bold");
        doc.text("Motivo:", margemEsquerda, linhaAtual);
        doc.setFont("helvetica", "normal");
        // 'wrap' (quebra de linha automática)
        const motivoLines = doc.splitTextToSize(encData.motivo || "N/A", 170); // 170mm de largura
        doc.text(motivoLines, margemEsquerda + 35, linhaAtual);
        linhaAtual += (motivoLines.length * 6); // Avança a linha baseado em quantas linhas o motivo ocupou

        linhaAtual += 8;
        doc.setFont("helvetica", "bold");
        doc.text("Recomendações:", margemEsquerda, linhaAtual);
        doc.setFont("helvetica", "normal");
        // Usa 'recomendacoes' (do upload) ou 'observacoes' (do mock)
        const obsLines = doc.splitTextToSize(encData.recomendacoes || encData.observacoes || "Nenhuma.", 170);
        doc.text(obsLines, margemEsquerda + 35, linhaAtual);

        // 5. Salva o ficheiro
        doc.save(`encaminhamento_${currentPatientData.nome.split(' ')[0]}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF com jsPDF (Encaminhamento):", error);
        alert("Ocorreu um erro ao tentar gerar o PDF.");
    }
}
// [COLE O CÓDIGO ABAIXO AQUI]

/**
 * NOVA FUNÇÃO (PRINCIPAL): Ponto de entrada para "Gerar PDF" de Encaminhamento.
 * Decide se abre o ficheiro original ou se gera um novo.
 */
function handleGerarPdfEncaminhamento(encData) {
    if (!encData) {
        alert("Erro: Dados do encaminhamento não encontrados.");
        return;
    }

    // 1. Verifica se é um upload do paciente (tem fileURL)
    // O seu upload de encaminhamento (FormUploadEncaminhamento) salva o URL aqui.
    if (encData.fileURL) {
        console.log("É um upload do paciente. Abrindo o ficheiro original...");
        // Ação Fácil: Apenas abre o link do ficheiro que o paciente guardou
        window.open(encData.fileURL, '_blank');
    }
    // 2. É um encaminhamento do sistema (Mock ou do Médico, não tem fileURL)
    else {
        console.log("É um encaminhamento do sistema. Gerando PDF com jsPDF...");
        // Ação Difícil: Chama a função que acabámos de criar
        _generateMockPdfEncaminhamento(encData);
    }
}


/**
 * NOVA FUNÇÃO (AUXILIAR): Gera um PDF "Mock" para um Atestado
 * (Chamado se o atestado NÃO for um upload de ficheiro)
 * (Baseado no seu template #pdf-atestado-template)
 */
function _generateMockPdfAtestado(atestadoData) {
    console.log("Gerando PDF mock para atestado:", atestadoData.id);
    
    // Encontra o template HTML no `perfil-de-saude.html`
    const template = document.getElementById('pdf-atestado-template');
    if (!template) {
        alert("Erro: Template PDF '#pdf-atestado-template' não encontrado no HTML.");
        return;
    }

    // 1. Preenche os campos do template com os dados do MOCK
    template.querySelector('#pdf-atestado-doctor-name').textContent = atestadoData.medico || "N/A";
    template.querySelector('#pdf-atestado-doctor-specialty').textContent = atestadoData.especialidade_profissional || "Especialidade";
    template.querySelector('#pdf-atestado-doctor-crm').textContent = atestadoData.registro_profissional || "CRM/UF";

    template.querySelector('#pdf-atestado-patient-name').textContent = currentPatientData.nome || "Paciente";
    template.querySelector('#pdf-atestado-emission-date').textContent = new Date(atestadoData.enviadoEm?.toDate() || atestadoData.dataInicio).toLocaleDateString('pt-BR');

    // Corpo
    template.querySelector('#pdf-atestado-patient-name-body').textContent = currentPatientData.nome || "Paciente";
    template.querySelector('#pdf-atestado-dias').textContent = atestadoData.duracao || 'N/A';
    template.querySelector('#pdf-atestado-data-inicio').textContent = new Date(atestadoData.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR');
    
    template.querySelector('#pdf-atestado-motivo').textContent = atestadoData.motivo || "N/A";
    template.querySelector('#pdf-atestado-cid').textContent = atestadoData.cid || "N/A";
    template.querySelector('#pdf-atestado-observacoes').textContent = atestadoData.observacoes || "Nenhuma.";
    
    template.querySelector('#pdf-atestado-signature-name').textContent = atestadoData.medico || "N/A";

    // 2. Chama a lógica de geração de PDF (jsPDF + html2canvas)
    const { jsPDF } = window.jspdf;
    
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    html2canvas(template, { scale: 3, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`atestado_${currentPatientData.nome.split(' ')[0]}.pdf`);

    }).catch(error => {
        console.error("Erro ao gerar PDF do atestado (html2canvas):", error);
        alert("Não foi possível gerar o PDF. Tente novamente.");
    }).finally(() => {
        // Esconde o template e o loading
        template.style.left = '-9999px';
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
    });
}

/**
 * NOVA FUNÇÃO (PRINCIPAL): Ponto de entrada para "Gerar PDF" de Atestado.
 * Decide se abre o ficheiro original ou se gera um novo.
 */
function handleGerarPdfAtestado(atestadoData) {
    if (!atestadoData) {
        alert("Erro: Dados do atestado não encontrados.");
        return;
    }

    // 1. Verifica se é um upload do paciente (tem fileURL)
    if (atestadoData.fileURL) {
        console.log("É um upload do paciente. Abrindo o ficheiro original...");
        window.open(atestadoData.fileURL, '_blank');
    }
    // 2. É um atestado do sistema (Mock ou do Médico, não tem fileURL)
    else {
        console.log("É um atestado do sistema. Gerando PDF com jsPDF...");
        _generateMockPdfAtestado(atestadoData);
    }
}

/**
 * NOVA FUNÇÃO (PRINCIPAL): Apaga um atestado externo.
 * Apaga o registo do Firestore e o ficheiro do Storage.
 */
async function handleApagarAtestado(atestadoId) {
    if (!currentUser || !atestadoId) return;

    // 1. Encontra os dados do atestado na nossa lista global
    const atestadoData = allAtestados.find(at => at.id.toString() === atestadoId.toString());

    if (!atestadoData) {
        alert("Erro: Não foi possível encontrar os dados do atestado para apagar.");
        return;
    }

    // 2. REGRA DE NEGÓCIO: Só permite apagar se a origem for 'paciente'
    if (atestadoData.origem !== 'paciente') {
        alert("Não é possível apagar um atestado emitido por um profissional de saúde.");
        return;
    }

    // 3. Pede confirmação
    const confirmou = confirm(`Tem a certeza que quer apagar o atestado: "${atestadoData.titulo}"? Esta ação não pode ser desfeita.`);
    
    if (!confirmou) {
        return; // Paciente cancelou
    }

    // 4. Inicia o processo de apagar
    showLoading(true); // Mostra o overlay de carregamento

    try {
        // 5. Apaga o registo do Firestore
        console.log(`Apagando atestado do Firestore: pacientes/${currentUser.uid}/atestados/${atestadoId}`);
        const docRef = doc(db, 'pacientes', currentUser.uid, 'atestados', atestadoId);
        await deleteDoc(docRef);

        // 6. Se houver um ficheiro, apaga-o do Storage
        if (atestadoData.fileURL) {
            console.log("Atestado tem um fileURL. A apagar do Storage...");
            const storageRef = ref(getStorage(app), atestadoData.fileURL);
            await deleteObject(storageRef);
            console.log("Ficheiro apagado do Storage com sucesso.");
        }

        alert("Atestado apagado com sucesso!");

        // 7. Força o recarregamento da lista na tela
        loadAtestados(true);

    } catch (error) {
        console.error("Erro ao apagar o atestado:", error);
        // Trata um erro comum do Storage (se o ficheiro já não existir)
        if (error.code === 'storage/object-not-found') {
            console.warn("Os dados do Firestore foram apagados, mas o ficheiro no Storage não foi encontrado.");
            alert("Atestado apagado com sucesso (ficheiro não encontrado no storage).");
            loadAtestados(true); // Mesmo assim, recarrega a lista
        } else {
            alert("Ocorreu um erro ao apagar o atestado. Tente novamente.");
        }
    } finally {
        showLoading(false); // Esconde o overlay de carregamento
    }
}

/**
 * NOVA FUNÇÃO (Trabalhadora - VERSÃO REVERTIDA PARA JS-PDF)
 * Gera um PDF "feio" (image_bdffdc.png) mas FUNCIONAL, sem html2canvas.
 * Isto corrige o erro 0x0 e Incomplete PNG.
 */
function gerarPdfDeReceitaMock(receitaData) {
    
    // 1. Verifica se o OBJETO PRINCIPAL (window.jspdf) foi carregado
    if (typeof window.jspdf === 'undefined') {
        alert("Erro: A biblioteca jsPDF não foi carregada. Tente recarregar a página.");
        return;
    }

    // 2. Acede à ferramenta jsPDF DENTRO do objeto principal
    const jsPDF = window.jspdf.jsPDF; 

    // Inicializa o jsPDF (A4: 210mm x 297mm)
    const doc = new jsPDF({
        orientation: 'p', // portrait (retrato)
        unit: 'mm',
        format: 'a4'
    });

    try {
        // --- INÍCIO DO DESIGN DO PDF "FEIO" (MAS FUNCIONAL) ---
        const margemEsquerda = 15;
        const margemSuperior = 20;
        let linhaAtual = margemSuperior;

        // 1. Cabeçalho (Info do Médico, alinhado à direita)
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Dr(a) " + (receitaData.medico || "Nome do Médico"), 210 - margemEsquerda, linhaAtual, { align: 'right' });
        
        doc.setFont("helvetica", "normal");
        linhaAtual += 4; 
        doc.text(receitaData.especialidade_profissional || "Especialidade", 210 - margemEsquerda, linhaAtual, { align: 'right' });
        
        linhaAtual += 4;
        doc.text(receitaData.registro_profissional || "CRM 123456", 210 - margemEsquerda, linhaAtual, { align: 'right' });

        // 2. Título "Receituário" (Centralizado)
        linhaAtual += 25; 
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Receituário", 105, linhaAtual, { align: 'center' }); 

        // 3. Caixa de Info do Paciente
        linhaAtual += 15;
        doc.setDrawColor(200, 200, 200); 
        doc.roundedRect(margemEsquerda, linhaAtual, 180, 16, 2, 2, 'S'); 
        
        linhaAtual += 7; 
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Paciente:", margemEsquerda + 3, linhaAtual);
        doc.setFont("helvetica", "normal");
        doc.text(currentPatientData.nome || "Nome do Paciente", margemEsquerda + 22, linhaAtual);
        
        linhaAtual += 6;
        
        // --- Lógica de Data (Corrigida) ---
        let dataJS;
        if (receitaData.timestamp && typeof receitaData.timestamp.toDate === 'function') {
            dataJS = receitaData.timestamp.toDate();
        } else if (receitaData.timestamp instanceof Date) {
            dataJS = receitaData.timestamp;
        } else {
            dataJS = new Date(receitaData.data || new Date());
        }
        const dataFormatada = dataJS.toLocaleString('pt-BR');
        // --- Fim da Lógica de Data ---
        
        doc.setFont("helvetica", "bold");
        doc.text("Data de Emissão:", margemEsquerda + 3, linhaAtual);
        doc.setFont("helvetica", "normal");
        doc.text(dataFormatada, margemEsquerda + 30, linhaAtual);

        // 4. Secção "Prescrição"
        linhaAtual += 20;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Prescrição", margemEsquerda, linhaAtual);
        
        linhaAtual += 7;
        doc.setFontSize(11);
        doc.setFont("helvetica", "italic");
        if (receitaData.duracao && receitaData.duracao.toLowerCase().includes('contínuo')) {
            doc.text("Uso Contínuo", margemEsquerda, linhaAtual);
        } else {
            doc.text("Uso Específico", margemEsquerda, linhaAtual);
        }
        
        // 5. Os Medicamentos
        linhaAtual += 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`1. ${receitaData.medicamento || "Medicamento"}`, margemEsquerda, linhaAtual);
        
        linhaAtual += 6;
        doc.setFont("helvetica", "normal");
        doc.text(`${receitaData.dosagem || 'N/A'}, ${receitaData.frequencia || 'N/A'}`, margemEsquerda + 5, linhaAtual);
        
        if (receitaData.duracao && !receitaData.duracao.toLowerCase().includes('contínuo')) {
            linhaAtual += 6;
            doc.text(`Duração: ${receitaData.duracao}`, margemEsquerda + 5, linhaAtual);
        }
        // --- FIM DO DESIGN ---

        // 6. Salva o ficheiro
        doc.save(`receita_${currentPatientData.nome.split(' ')[0]}_${receitaData.medicamento}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF com jsPDF (Revertido):", error);
        alert("Ocorreu um erro ao tentar gerar o PDF.");
    } finally {
        // NÃO precisamos de desligar o loading aqui, pois não o ligámos
        // (A função showLoading(true) estava no código do html2canvas)
    }
}


    /**
     * NOVA FUNÇÃO (Cérebro - Passo 3): Chamada quando o dropdown "Intervalo" muda.
     * 'event.target' é o próprio <select> que foi alterado.
     */
    function handleIntervaloChange(event) {
        const selectElement = event.target;
        const valorIntervalo = selectElement.value; // Ex: "8", "12", "0"
        
        // Descobre qual formulário (0, 1, 2...) este <select> pertence
        const formSection = selectElement.closest('.vis-section');
        const index = formSection.dataset.medicamentoIndex;

        // Encontra o container de horas (irmão) correto para este formulário
        const containerDeHoras = document.getElementById(`lembrete-horarios-container-${index}`);
        if (!containerDeHoras) return;

        // Chama a função "desenhadora" para criar o campo "Hora de Início"
        gerarCampoHoraInicio(valorIntervalo, containerDeHoras, index);
    }

    /**
     * NOVA FUNÇÃO (Trabalhadora - Passo 3): Desenha o campo "Hora de Início"
     */
    function gerarCampoHoraInicio(valorIntervalo, container, index) {
        container.innerHTML = ''; // Limpa os campos de hora antigos
        
        const valorNum = parseInt(valorIntervalo);

        // Se o paciente escolheu um intervalo (ex: "A cada 8 horas", que tem valor "8")
        if (valorNum > 0) {
            
            // Cria o campo de hora "Hora de Início"
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const labelEl = document.createElement('label');
            labelEl.setAttribute('for', `lembrete-hora-inicio-${index}`);
            labelEl.textContent = "Hora de Início"; // Exatamente como você pediu

            const inputEl = document.createElement('input');
            inputEl.type = 'time';
            inputEl.id = `lembrete-hora-inicio-${index}`;
            inputEl.name = `lembrete-hora-inicio-${index}`; 
            inputEl.required = true;

            // Adiciona ao HTML
            formGroup.appendChild(labelEl);
            formGroup.appendChild(inputEl);
            container.appendChild(formGroup);
        }
        // Se o valor for "0" (Selecione...), o container fica vazio (o campo desaparece).
    }
    // --- FIM DO NOVO BLOCO ---

        // ==========================================================
    // SUBSTITUA A SUA FUNÇÃO getMockVacinas() POR ESTA
    // ==========================================================
    function getMockVacinas() {
        console.warn("Usando MOCK DATA para Vacinas.");
        return [
            {
                id: 'mock_vac1',
                titulo: 'Carteirinha de Vacinação - Adulto',
                enviadoEm: '2025-01-15',
                url_pdf: '#',
                status: 'Válida' // <-- NOVO CAMPO DE STATUS
            },
            {
                id: 'mock_vac2',
                titulo: 'Comprovante COVID-19',
                enviadoEm: '2024-12-10',
                url_pdf: '#',
                status: 'Válida' // <-- NOVO CAMPO DE STATUS
            }
        ];
    }
    // ==========================================================
    // FIM DA SUBSTITUIÇÃO
    // ==========================================================


        /**
     * NOVA FUNÇÃO (Cérebro - Passo 3): Chamada quando o dropdown "Frequência" muda.
     * 'event.target' é o próprio <select> que foi alterado.
     */
    function handleFrequenciaChange(event) {
        const selectElement = event.target;
        const valor = selectElement.value; // Ex: "1", "3", "8", "12"
        
        // Descobre qual formulário (0, 1, 2...) este <select> pertence
        const formSection = selectElement.closest('.vis-section');
        const index = formSection.dataset.medicamentoIndex;

        // Encontra o container de horas (irmão) correto para este formulário
        const containerDeHoras = document.getElementById(`lembrete-horarios-container-${index}`);
        if (!containerDeHoras) return;

        // Chama a função "desenhadora" para criar os campos
        gerarCamposDeHora(valor, containerDeHoras, index);
    }

    /**
     * NOVA FUNÇÃO (Trabalhadora - Passo 3): Desenha os campos <input type="time">
     */
    function gerarCamposDeHora(valorFrequencia, container, index) {
        container.innerHTML = ''; // Limpa os campos de hora antigos
        let numeroDeCampos = 0;
        let label = "Horário";

        const valorNum = parseInt(valorFrequencia);

        if (valorNum === 0) {
            return; // "Selecione..." (não faz nada)
        } 
        else if (valorNum >= 1 && valorNum <= 5) {
            // Cenário A: "1 vez ao dia", "2 vezes ao dia", etc.
            numeroDeCampos = valorNum;
            label = "Horário";
        } 
        else if (valorNum === 24 || valorNum === 12 || valorNum === 8 || valorNum === 6) {
            // Cenário B: "A cada X horas"
            numeroDeCampos = 1; // Mostra apenas UM campo
            label = "Hora de Início"; // Muda o texto da label
        }

        // Cria os campos de hora
        for (let i = 0; i < numeroDeCampos; i++) {
            // Cria um <div class="form-group">
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            // Cria a <label>
            const labelEl = document.createElement('label');
            // Se houver mais de um, numera (Horário 1, Horário 2...)
            const labelTexto = numeroDeCampos > 1 ? `${label} ${i + 1}` : label;
            labelEl.setAttribute('for', `lembrete-hora-${index}-${i}`);
            labelEl.textContent = labelTexto;

            // Cria o <input>
            const inputEl = document.createElement('input');
            inputEl.type = 'time';
            inputEl.id = `lembrete-hora-${index}-${i}`;
            inputEl.name = `lembrete-hora-${index}`; // Agrupa os inputs
            inputEl.required = true;

            // Adiciona ao HTML
            formGroup.appendChild(labelEl);
            formGroup.appendChild(inputEl);
            container.appendChild(formGroup);
        }
    }
    // --- FIM DO NOVO BLOCO ---

    // ==========================================================
    // COLE ESTE BLOCO (Fim)
    // ==========================================================

/**
 * RENDERIZA A LISTA DE EXAMES (Versão Híbrida: Médico + Paciente)
 */
function renderExameList(examesToRender) {
    const container = document.getElementById('exames-lista'); // Confirma se o ID no HTML é este
    if (!container) return;

    container.innerHTML = ''; // Limpa a lista

    if (!examesToRender || examesToRender.length === 0) {
        container.innerHTML = '<p class="placeholder">Nenhum exame encontrado.</p>';
        return;
    }

    // Ordena por data (mais recente primeiro)
    examesToRender.sort((a, b) => {
        // Função auxiliar para obter data válida
        const getDate = (item) => {
            if (item.dataSolicitacao) return new Date(item.dataSolicitacao);
            if (item.dataColeta) return new Date(item.dataColeta);
            if (item.timestamp) return item.timestamp.toDate ? item.timestamp.toDate() : new Date(item.timestamp);
            return new Date(0);
        };
        return getDate(b) - getDate(a);
    });

    examesToRender.forEach(exame => {
        // --- 1. LÓGICA DE DADOS (O "Tradutor") ---
        
        // Título (Lista vs Único)
        let tituloExame = "Exame";
        if (exame.tiposExame && Array.isArray(exame.tiposExame) && exame.tiposExame.length > 0) {
            tituloExame = exame.tiposExame[0];
            if (exame.tiposExame.length > 1) {
                tituloExame += ` + ${exame.tiposExame.length - 1} outro(s)`;
            }
        } else if (exame.titulo) {
            tituloExame = exame.titulo;
        }

        // Solicitante
        const solicitante = exame.nome_profissional || exame.solicitadoPor || "Não informado";
        const laboratorio = exame.laboratorio || "N/A";

        // Data
        let dataRaw = exame.dataSolicitacao || exame.dataColeta || exame.timestamp;
        let dataFormatada = 'Data N/D';
        if (dataRaw) {
            try {
                const dataObj = dataRaw.toDate ? dataRaw.toDate() : new Date(dataRaw);
                dataFormatada = dataObj.toLocaleDateString('pt-BR');
            } catch (e) {}
        }

        // Status e Cor
        let statusClass = 'status-arquivada';
        if (exame.status === 'Solicitado' || exame.status === 'Agendado') statusClass = 'status-solicitado';
        if (exame.status === 'Realizado') statusClass = 'status-realizado';
        if (exame.status === 'Pendente Upload') statusClass = 'status-pendente-upload';


        // --- 2. BOTÕES INTELIGENTES ---
        let botoesHtml = '';
        
        // Botão PDF
        if (exame.fileURL) {
            // Se tem ficheiro (Upload do Paciente), abre o link
            botoesHtml += `
                <a href="${exame.fileURL}" target="_blank" class="btn-pdf">
                    <i class="fa-solid fa-file-pdf"></i> Ver Resultado
                </a>`;
        } else {
            // Se NÃO tem ficheiro (Pedido do Médico), gera o PDF do pedido
            botoesHtml += `
                <button class="btn-pdf" data-action="gerar-pdf-exame" data-exame-id="${exame.id}">
                    <i class="fa-solid fa-file-pdf"></i> Gerar Pedido
                </button>`;
        }

        // Botão Apagar (Só se foi o paciente a criar, ou se for regra de negócio)
        if (exame.origem === 'paciente') {
            botoesHtml += `
                <button class="btn-apagar-receita" data-action="apagar-exame" data-exame-id="${exame.id}" aria-label="Apagar exame" title="Apagar exame">
                    <i class="fa-solid fa-trash"></i>
                </button>`;
        }
        
        // Botão Agendar (Se for solicitado)
        let botaoAgendar = '';
        if (exame.status === 'Solicitado' || exame.status === 'Pendente Upload') {
             botaoAgendar = `
                <button class="btn-card-primary-exame" data-action="agendar-exame" data-exame-id="${exame.id}">
                    <i class="fa-solid fa-calendar-plus"></i> Agendar
                </button>`;
        }


        // --- 3. HTML FINAL ---
        const cardHTML = `
            <div class="exame-card" data-exame-id="${exame.id}">
                <div class="exame-header">
                    <h3><i class="fa-solid fa-flask-vial"></i> ${tituloExame}</h3>
                    <span class="badge ${statusClass}">${exame.status || 'Pendente'}</span>
                </div>
                
                <p class="exame-subtitulo">Solicitado por: ${solicitante}</p>

                <div class="exame-details">
                    <span><i class="fa-solid fa-calendar-days"></i> Data: <strong>${dataFormatada}</strong></span>
                    <span><i class="fa-solid fa-building"></i> Lab: <strong>${laboratorio}</strong></span>
                </div>

                <div class="exame-footer">
                    <div class="card-footer-actions-esquerda">
                        ${botoesHtml}
                    </div>
                    <div class="card-footer-actions-direita">
                        ${botaoAgendar}
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

/**
 * DESENHA A LISTA DE ENCAMINHAMENTOS (Layout Bonito + Dados Reais)
 */
function renderEncaminhamentoList(lista) {
    const container = document.getElementById('encaminhamentos-lista');
    if (!container) return;

    container.innerHTML = '';

    if (!lista || lista.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-share-from-square"></i><p>Nenhum encaminhamento encontrado.</p></div>';
        return;
    }

    lista.forEach(enc => {
        // 1. Formatar Data
        // (O médico salva como 'data' (YYYY-MM-DD) ou 'timestamp')
        let dataFmt = 'Data N/D';
        let dataRaw = enc.data || enc.timestamp;
        
        if (dataRaw) {
            try {
                // Se for Timestamp do Firestore
                if (dataRaw.toDate) {
                    dataFmt = dataRaw.toDate().toLocaleDateString('pt-BR');
                } 
                // Se for String de Data (YYYY-MM-DD)
                else if (typeof dataRaw === 'string') {
                     const d = new Date(dataRaw + 'T00:00:00'); // Adiciona hora para fuso horário
                     if (!isNaN(d)) dataFmt = d.toLocaleDateString('pt-BR');
                }
            } catch(e){}
        }

        // 2. Definir Status
        let statusClass = 'status-arquivada'; 
        if (enc.status === 'Pendente') statusClass = 'status-solicitado';
        if (enc.status === 'Agendado') statusClass = 'status-ativa';

        // 3. Botões (PDF e Agendar)
        let botoesHtml = `
            <button class="btn-pdf" data-action="gerar-pdf-encaminhamento" data-enc-id="${enc.id}">
                <i class="fa-solid fa-file-pdf"></i> Gerar Guia
            </button>
        `;
        
        // Mostra botão de agendar se estiver pendente
        let botaoAgendar = '';
        if (enc.status === 'Pendente') {
            botaoAgendar = `
                <button class="btn-card-primary-exame" data-action="agendar-consulta-enc" data-enc-id="${enc.id}">
                    <i class="fa-solid fa-calendar-plus"></i> Agendar
                </button>
            `;
        }

        // 4. HTML do Card (Layout Exame/Encaminhamento)
        const cardHTML = `
            <div class="exame-card" data-enc-id="${enc.id}">
                <div class="exame-header">
                    <h3><i class="fa-solid fa-share-from-square"></i> ${enc.especialidade || 'Especialista'}</h3>
                    <span class="badge ${statusClass}">${enc.status || 'Pendente'}</span>
                </div>
                
                <p class="exame-subtitulo">Solicitado por: ${enc.nome_profissional || enc.solicitadoPor || 'Profissional'}</p>

                <div class="exame-details">
                    <span><i class="fa-solid fa-calendar-days"></i> Data: <strong>${dataFmt}</strong></span>
                    <span><i class="fa-solid fa-file-medical"></i> Motivo: <strong>${enc.motivo || 'N/A'}</strong></span>
                </div>

                <div class="exame-footer">
                    <div class="card-footer-actions-esquerda">
                        ${botoesHtml}
                    </div>
                    <div class="card-footer-actions-direita">
                        ${botaoAgendar}
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}


// ==========================================================
// LOAD ENCAMINHAMNETOCARD AQUI PRECISA COLOCAR AQUI 
// ==========================================================
// ==========================================================
// FIM DA CORREÇÃO
// ==========================================================
    // ==========================================================
    // COLE ESTE BLOCO (Fim)
    // ==========================================================

    /**
 * NOVO (Passo 6.1): Filtra a lista 'allEncaminhamentos' e chama a renderização.
 * (Cérebro da busca e dos filtros)
 */
function applyEncaminhamentoFilters() {
  // Seletores já existentes
  const statusEl = document.getElementById('encaminhamentos-filter-status');

  if (!encaminhamentosListContainer) return;

  const searchTerm = encaminhamentoSearchInput ? encaminhamentoSearchInput.value.toLowerCase() : '';
  
  // 1. Determinar o filtro ativo (Todos, Pendentes, Agendados)
  const activeFilterBtn = encaminhamentoFilterGroup ? encaminhamentoFilterGroup.querySelector('.filter-btn-small.active') : null;
  const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'todos'; // 'todos', 'pendentes', 'agendados'
  let pendentesCount = 0;

  let filteredEncaminhamentos = allEncaminhamentos.filter(enc => {
    // 1.1. Contagem de Pendentes (para o status no canto)
    if (enc.status === 'Pendente') {
      pendentesCount++;
    }
    
    // 1.2. Filtro de busca (por especialidade, motivo ou solicitante)
    const searchMatch = searchTerm === '' ||
      (enc.especialidade && enc.especialidade.toLowerCase().includes(searchTerm)) ||
      (enc.motivo && enc.motivo.toLowerCase().includes(searchTerm)) ||
      (enc.solicitadoPor && enc.solicitadoPor.toLowerCase().includes(searchTerm));

    // 1.3. Filtro de status
    let statusMatch = true;
    if (activeFilter === 'pendentes') {
        statusMatch = enc.status === 'Pendente';
    } else if (activeFilter === 'agendados') {
        statusMatch = enc.status === 'Agendado';
    }
    // Se o filtro for 'todos', statusMatch já é true

    return searchMatch && statusMatch;
  });

  // 2. Atualiza o status no canto (ex: "1 pendente")
  if (statusEl) {
    statusEl.textContent = `${pendentesCount} pendente${pendentesCount !== 1 ? 's' : ''}`;
  }
  
  // 3. Chama a função que desenha os cards
  // NOTA: Esta função precisa de uma lista para renderizar, por isso a passamos aqui.
  renderEncaminhamentoList(filteredEncaminhamentos); 
}
 
/**
 * CARREGA ENCAMINHAMENTOS (DADOS REAIS DO FIREBASE)
 * Conecta com o que o médico salvou em: pacientes/{id}/encaminhamentos
 */
async function loadEncaminhamentos(force = false) {
    const container = document.getElementById('encaminhamentos-lista');
    const statusEl = document.getElementById('encaminhamentos-filter-status');

    if (!container || !currentUser) return;

    // 1. Verifica cache (se já carregou e não é para forçar)
    if (container.dataset.loaded === 'true' && !force && allEncaminhamentos.length > 0) {
        renderEncaminhamentoList(allEncaminhamentos);
        return;
    }

    container.innerHTML = '<p class="placeholder">A procurar encaminhamentos...</p>';

    try {
        console.log(`Buscando Encaminhamentos reais em: pacientes/${currentUser.uid}/encaminhamentos`);

        // 2. Busca na coleção DO PACIENTE (A mesma onde o médico salvou)
        const encRef = collection(db, 'pacientes', currentUser.uid, 'encaminhamentos');
        
        // Query simples para garantir que traz resultados
        const q = query(encRef, orderBy('timestamp', 'desc')); 
        
        const querySnapshot = await getDocs(q);
        let encTemp = [];

        if (querySnapshot.empty) {
            console.log("Nenhum encaminhamento real encontrado no Firestore.");
            // Se estiver vazio, mostramos vazio (sem mocks, para testar a realidade)
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-share-from-square"></i><p>Nenhum encaminhamento registrado.</p></div>';
            // Se quiseres manter os mocks como fallback, descomenta a linha abaixo:
            // encTemp = getMockEncaminhamentos(); 
        } else {
            console.log(`Sucesso! ${querySnapshot.size} encaminhamentos reais encontrados.`);
            encTemp = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // 3. Atualiza a Variável Global (Essencial para o PDF funcionar)
        allEncaminhamentos = encTemp;
        
        // 4. Atualiza o Badge (Contador)
        if (statusEl) {
            const pendentesCount = allEncaminhamentos.filter(e => e.status === 'Pendente').length;
            statusEl.textContent = `${pendentesCount} pendentes`;
        }

        // 5. Desenha a lista se houver dados
        if (allEncaminhamentos.length > 0) {
            renderEncaminhamentoList(allEncaminhamentos);
        }
        
        container.dataset.loaded = 'true';

    } catch (error) {
        console.error("Erro ao carregar encaminhamentos:", error);
        // Se der erro de índice (orderBy), tenta sem ele
        if (error.code === 'failed-precondition') {
             console.warn("Tentando carregar sem ordenação...");
             const qBackup = query(collection(db, 'pacientes', currentUser.uid, 'encaminhamentos'));
             const snap = await getDocs(qBackup);
             allEncaminhamentos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             renderEncaminhamentoList(allEncaminhamentos);
        } else {
            container.innerHTML = '<p class="placeholder" style="color: var(--cor-delete);">Erro ao carregar lista.</p>';
        }
    }
}
    

    // ==========================================================
    // COLE ESTE BLOCO (Fim)
    // ==========================================================

   /**
 * DESENHA OS CARDS DE ACOMPANHAMENTO (Com verificação de prazo)
 */
function renderAcompanhamentoCard(acomp) {
    const container = document.getElementById('acompanhamentos-lista');
    if (!container) return;

    // --- 1. Formatar Data e Calcular Validade ---
    let dataFmt = 'N/D';
    let dataInicioObj = null;
    
    const dataRaw = acomp.data_inicio || acomp.timestamp;
    if (dataRaw) {
        try {
            // Tenta converter (Timestamp ou String ISO)
            dataInicioObj = dataRaw.toDate ? dataRaw.toDate() : new Date(dataRaw);
            dataFmt = dataInicioObj.toLocaleDateString('pt-BR');
        } catch(e){}
    }

    // --- NOVA LÓGICA DE EXPIRAÇÃO ---
    // Se tivermos uma data válida e uma duração definida (maior que 0)
    if (dataInicioObj && acomp.duracao_dias > 0) {
        const hoje = new Date();
        const dataFim = new Date(dataInicioObj);
        dataFim.setDate(dataFim.getDate() + parseInt(acomp.duracao_dias));
        
        // Se hoje for depois da data fim, consideramos Concluído
        if (hoje > dataFim) {
            acomp.status = 'Concluído'; 
        }
    }
    // --------------------------------

    // 2. Status e Cor (Agora já considera a expiração acima)
    let statusClass = 'status-arquivada'; // Cinza
    let statusTexto = acomp.status;

    if (acomp.status === 'Ativo' || acomp.status === 'ativo') {
        statusClass = 'status-ativa'; // Azul
        statusTexto = 'Ativo';
    } 
    
    // Se expirou, força o visual de concluído
    if (acomp.status === 'Concluído' || acomp.status === 'concluído') {
        statusClass = 'status-arquivada';
        statusTexto = 'Concluído';
    }

    // 3. Botão de Check-in
    // Só aparece se estiver REALMENTE ativo
    const metasJSON = JSON.stringify(acomp.metas || []);
    const tituloCard = acomp.assinatura_digital?.especialidade 
        ? `Acompanhamento ${acomp.assinatura_digital.especialidade}` 
        : 'Acompanhamento Médico';

    let acaoBtn = '';
    
    if (statusTexto === 'Ativo') {
        acaoBtn = `
            <button class="btn-card-primary-exame" 
                    data-action="fazer-checkin" 
                    data-acomp-id="${acomp.id}"
                    data-titulo="${tituloCard}"
                    data-metas='${metasJSON}'>
                <i class="fa-solid fa-check-to-slot"></i> Fazer Check-in
            </button>
        `;
    } else {
        // Se acabou o prazo, mostra mensagem
        acaoBtn = `<span class="text-muted" style="font-size: 0.85rem; display: flex; align-items: center; gap: 5px;">
            <i class="fa-solid fa-check-circle" style="color: green;"></i> Período Concluído
        </span>`;
    }

    // 4. HTML do Card
    const cardHTML = `
        <div class="recipe-card" data-acomp-id="${acomp.id}">
            <div class="recipe-header">
                <h3><i class="fa-solid fa-star-of-life"></i> ${tituloCard}</h3>
                <span class="badge ${statusClass}">${statusTexto}</span>
            </div>
            
            <p class="recipe-doctor">Solicitado por: ${acomp.assinatura_digital?.nome || 'Profissional'}</p>

            <div class="recipe-details">
                <span><i class="fa-solid fa-calendar-days"></i> Início: <strong>${dataFmt}</strong></span>
                <span><i class="fa-solid fa-bullseye"></i> Metas: <strong>${acomp.metas ? acomp.metas.length : 0} diárias</strong></span>
                <span><i class="fa-solid fa-hourglass-half"></i> Duração: <strong>${acomp.duracao_dias || '?'} dias</strong></span>
            </div>

            <div class="recipe-footer">
                <div class="card-footer-actions-direita" style="width: 100%; display: flex; justify-content: flex-end;">
                    ${acaoBtn}
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', cardHTML);
}
    // ==========================================================
    // COLE ESTE BLOCO (Fim)
    // ==========================================================

    /**
 * TAREFA: (NOVA FUNÇÃO)
 * Limpa a lista e chama 'renderVacinaCard' para cada item filtrado.
 */
function renderVacinas(vacinasParaRenderizar) {
    const container = document.getElementById('vacinas-lista');
    if (!container) {
        console.error("Container 'vacinas-lista' não encontrado.");
        return;
    }
    container.innerHTML = ''; // Limpa a lista antiga

    if (!vacinasParaRenderizar || vacinasParaRenderizar.length === 0) {
        container.innerHTML = '<p class="placeholder">Nenhuma vacina encontrada.</p>';
        return;
    }

    // Desenha cada card
    vacinasParaRenderizar.forEach(vacina => {
        renderVacinaCard(vacina); // Chama a sua função existente
    });
}


    
    // ==========================================================
    // COLE ESTE BLOCO (Início) - Função de Renderizar Vacinas
    // ==========================================================

    /**
 * TAREFA: Renderiza o card de Vacina
 * (V4 - CORRIGIDO para lidar com Mocks (strings) e Firestore (Timestamps))
 */
function renderVacinaCard(vacina) {
    const container = document.getElementById('vacinas-lista');
    if (!container) return;

    // 1. Define o estilo do badge (Como antes)
    let statusClass = 'status-valida'; // Padrão
    if (vacina.status === 'Expirada') statusClass = 'status-expirado';

    // 2. Formata a data (YYYY-MM-DD para DD/MM/YYYY)
    // --- INÍCIO DA CORREÇÃO ---
    let dataFonte = vacina.enviadoEm || vacina.data; // Pega o campo que existir
    let dataJS;

    if (dataFonte && typeof dataFonte.toDate === 'function') {
      // Caso 1: É um Timestamp do Firestore (ex: a vacina que subiste)
      dataJS = dataFonte.toDate();
    } else if (dataFonte) {
      // Caso 2 ou 3: É uma string de data (ex: '2025-01-20' do mock)
      // Adicionamos 'T00:00:00' para garantir que a data seja lida corretamente
      dataJS = new Date(dataFonte + 'T00:00:00'); 
    } else {
      // Caso 4: Nenhum campo de data (fallback)
      dataJS = new Date();
    }
    
    const dataFormatada = dataJS.toLocaleDateString('pt-BR');
    // --- FIM DA CORREÇÃO ---


    // 3. Monta o HTML do corpo (Como antes)
    let bodyHtml = `
        <span><i class="fa-solid fa-calendar-check"></i> Status: <strong>${vacina.status}</strong></span>
        <span><i class="fa-solid fa-calendar-day"></i> Enviado em: <strong>${dataFormatada}</strong></span>
    `;

    // 4. Monta o HTML do rodapé (AÇÕES) (Como antes)
    let footerHtml = `
        <button class="btn-pdf" data-action="gerar-pdf-vacina">
            <i class="fa-solid fa-file-pdf"></i> Gerar PDF
        </button>
    `;
    if (vacina.origem === 'paciente' || vacina.origem === undefined) {
        footerHtml += `
            <button class="btn-apagar-receita" data-action="apagar-vacina" aria-label="Apagar vacina" title="Apagar vacina">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
    }

    // 5. Monta o Card Completo (Como antes)
    const cardHTML = `
    <div class="recipe-card" data-vacina-id="${vacina.id}">
        <div class="recipe-header">
            <h3>
                <i class="fa-solid fa-syringe"></i> ${vacina.titulo}
            </h3>
            <span class="badge ${statusClass}">${vacina.status}</span>
        </div>
        
        <p class="recipe-doctor">Documento de Vacinação</p>
        
        <div class="recipe-details">
            ${bodyHtml}
        </div>
        
        <div class="recipe-footer">
            <div class="card-footer-actions">
                ${footerHtml}
            </div>
        </div>
    </div>
    `;
    container.insertAdjacentHTML('beforeend', cardHTML);
}
// ==========================================================
// FIM DA SUBSTITUIÇÃO
// ==========================================================

    // ==========================================================
// --- 8. FUNÇÕES PRINCIPAIS DAS ABAS (Core Logic) ---
// (Funções que decidem o que mostrar em cada aba)
// ==========================================================

/**
 * NOVA FUNÇÃO: Filtra a lista 'allRecipes' e chama a renderização.
 * Este é o "cérebro" da filtragem.
 */
function applyRecipeFilters() {
    // Garante que os seletores existem antes de tentar usá-los
    if (!recipeListContainer) {
        return;
    }

    // 1. Obter os valores atuais dos filtros
    const searchTerm = recipeSearchInput ? recipeSearchInput.value.toLowerCase() : '';
    const activeFilterBtn = recipeFilterGroup ? recipeFilterGroup.querySelector('.filter-btn-small.active') : null;
    const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'todas'; // 'todas', 'ativa', 'arquivada'

    // 2. Filtrar a lista global 'allRecipes'
    const filteredRecipes = allRecipes.filter(recipe => {
        
        // --- Verificação do Filtro de Status (Ativa/Arquivada/Todas) ---
        const statusMatch = (activeFilter === 'todas') || (recipe.status && recipe.status.toLowerCase() === activeFilter);

        // --- Verificação do Termo de Busca (Medicamento OU Médico) ---
        // (Se o termo de busca estiver vazio, 'searchMatch' será true)
        const searchMatch = searchTerm === '' ||
            (recipe.medicamento && recipe.medicamento.toLowerCase().includes(searchTerm)) ||
            (recipe.medico && recipe.medico.toLowerCase().includes(searchTerm));

        // Só retorna a receita se AMBOS derem 'true'
        return statusMatch && searchMatch;
    });

    // 3. Chamar a renderização com a lista filtrada
    // (Esta é a função que criámos no Passo 2)
    renderRecipeList(filteredRecipes);
}





    /**
 * MODIFICADA: Busca as receitas no Firestore (ou mock) e salva na variável global.
 */
async function loadReceitas(force = false) {
    if (!recipeListContainer || !currentUser) return;

    // 1. Verifica se os dados já estão em memória
    // (A sua lógica de 'dataset.loaded' estava correta, vamos mantê-la)
    // Adicionei 'allRecipes.length > 0' para segurança
    if (recipeListContainer.dataset.loaded === 'true' && !force && allRecipes.length > 0) {
        console.log("Receitas já em memória. Apenas aplicando filtros.");
        applyRecipeFilters(); // Apenas re-filtra o que já temos
        return;
    }

    recipeListContainer.innerHTML = '<p class="placeholder">Carregando receitas...</p>';
    
    let receitasTemp = []; // Array temporário
    let ativasCount = 0;

    try {
        // 2. Busca no Firestore (Esta lógica é a sua, está correta)
        const receitasRef = collection(db, 'pacientes', currentUser.uid, 'receitas');
        const q = query(receitasRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("Firestore 'receitas' está vazio, usando mocks.");
            receitasTemp = getMockReceitas(); // Usa o Mock
        } else {
            console.log(`Dados reais do Firestore encontrados: ${querySnapshot.size} receitas.`);
            receitasTemp = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // 3. Processa os dados e SALVA NA VARIÁVEL GLOBAL (do Passo 1)
        allRecipes = []; // Limpa a global
        receitasTemp.forEach(receita => {
            if (receita.status === 'Ativa') {
                ativasCount++;
            }
            allRecipes.push(receita); // <--- SALVANDO AQUI
        });

        // Atualiza a contagem de "ativas"
        if (recipeFilterStatus) recipeFilterStatus.textContent = `${ativasCount} ativas`;
        
        // 4. CHAMA A FUNÇÃO DE FILTRAGEM (do Passo 3)
        // Esta função agora vai chamar a renderRecipeList (do Passo 2)
        applyRecipeFilters(); 
        
        recipeListContainer.dataset.loaded = 'true'; // Marca como carregado

    } catch (error) {
        console.error("Erro ao carregar receitas:", error);
        recipeListContainer.innerHTML = '<p class="placeholder" style="color: var(--cor-delete);">Erro ao carregar receitas.</p>';
    }
}
    

/**
 * NOVA FUNÇÃO (Passo 3): Filtra a lista 'allExames' e chama a renderização.
 * Este é o "cérebro" da filtragem de Exames.
 */
function applyExameFilters() {
    // Garante que os seletores (do Passo 1) existem
    if (!examesListContainer) {
        return;
    }

    // 1. Obter os valores atuais dos filtros
    const searchTerm = exameSearchInput ? exameSearchInput.value.toLowerCase() : '';
    const activeFilterBtn = exameFilterGroup ? exameFilterGroup.querySelector('.filter-btn-small.active') : null;
    
    // Mapeia o texto do botão para o 'status' (Ex: "Pendentes" -> "Pendente Upload")
    let activeFilter = 'todos'; // Padrão
    if (activeFilterBtn) {
        const filterText = activeFilterBtn.textContent.trim().toLowerCase();
        if (filterText === 'agendados') activeFilter = 'agendado';
        else if (filterText === 'realizados') activeFilter = 'realizado';
        else if (filterText === 'pendentes') activeFilter = 'pendente upload';
        // 'todos' já é o padrão
    }

    // 2. Filtrar a lista global 'allExames'
    const filteredExames = allExames.filter(exame => {
        
        // --- Verificação do Filtro de Status ---
        const statusMatch = (activeFilter === 'todos') || (exame.status && exame.status.toLowerCase() === activeFilter);

        // --- Verificação do Termo de Busca (Título OU Laboratório OU Solicitante) ---
        const searchMatch = searchTerm === '' ||
            (exame.titulo && exame.titulo.toLowerCase().includes(searchTerm)) ||
            (exame.laboratorio && exame.laboratorio.toLowerCase().includes(searchTerm)) ||
            (exame.solicitadoPor && exame.solicitadoPor.toLowerCase().includes(searchTerm));

        // Só retorna o exame se AMBOS derem 'true'
        return statusMatch && searchMatch;
    });

    // 3. Chamar a renderização com a lista filtrada
    // (Esta é a função que criámos no Passo 2)
    renderExameList(filteredExames);
}



// --- SUBSTITUA A SUA 'handleAbrirModalAgendamento' POR ESTA (PASSO 4.2) ---
/**
 * FUNÇÃO "CÉREBRO" (V2): Abre o modal de agendamento
 * e chama a nova função "desenhadora" (gerarListaLaboratoriosHTML).
 */
function handleAbrirModalAgendamento(exameId) {
    if (!agendarExameModal || !listaLaboratoriosMock || !mockLaboratorios) {
        console.error("Erro: Modal de agendamento ou lista de laboratórios não encontrados.");
        return;
    }

    // 1. Encontra os dados do exame que queremos agendar
    const exameParaAgendar = allExames.find(ex => ex.id.toString() === exameId.toString());
    if (!exameParaAgendar) {
        alert("Erro: Não foi possível encontrar os dados deste exame.");
        return;
    }

    console.log("Agendando para o exame:", exameParaAgendar.titulo);

    // 2. Limpa a barra de busca (do Passo 2)
    const labSearchInput = document.getElementById('lab-search-input');
    if (labSearchInput) {
        labSearchInput.value = '';
    }
    
    // 3. "Desenha" a lista completa (passando um filtro vazio)
    gerarListaLaboratoriosHTML(""); 

    // 4. Guarda o ID do exame no modal (para sabermos o que salvar no Passo 5)
    agendarExameModal.dataset.exameId = exameId;
    
    // 5. Reseta o botão Salvar
    if (salvarAgendamentoExameBtn) {
        salvarAgendamentoExameBtn.disabled = true;
        salvarAgendamentoExameBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmar Agendamento';
    }

    // 6. Abre o modal
    openModal(agendarExameModal);
}
// --- FIM DA SUBSTITUIÇÃO ---

// --- NOVO (Passo 3.2): Listener para cliques nos Horários ---
  if (listaLaboratoriosMock) {
    listaLaboratoriosMock.addEventListener('click', (e) => {
      // Encontra o botão de horário que foi clicado
      const horarioBtn = e.target.closest('.horario-btn-v2');

      // Sai da função se o clique não foi num botão de horário
      if (!horarioBtn) return;

      console.log("Horário clicado:", horarioBtn.dataset.datetime);

      // 1. Remove a seleção de todos os outros botões
      listaLaboratoriosMock.querySelectorAll('.horario-btn-v2').forEach(btn => {
        btn.classList.remove('selected');
      });

      // 2. Adiciona a classe 'selected' (que criámos no CSS) ao botão clicado
      horarioBtn.classList.add('selected');

      // 3. Ativa o botão "Confirmar Agendamento"
      if (salvarAgendamentoExameBtn) {
        salvarAgendamentoExameBtn.disabled = false;
        // O CSS que fizemos no Passo 2.3 fará ele ficar azul
      }
    });
  }

    //O CODIGO COMECA AQUI 

  // --- NOVO (Passo 3.3): Listener do botão "Confirmar Agendamento" ---
  if (salvarAgendamentoExameBtn) {
    salvarAgendamentoExameBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("Botão 'Confirmar Agendamento' clicado.");

      // 1. Verifica qual horário está selecionado
      const horarioSelecionado = listaLaboratoriosMock.querySelector('.horario-btn-v2.selected');
      const labCard = horarioSelecionado?.closest('.laboratorio-card');
      
      if (!horarioSelecionado || !labCard) {
        alert("Erro: Nenhum horário selecionado.");
        return;
      }

      // 2. Pega os dados para o resumo
      const labNome = labCard.querySelector('h4').textContent;
      const horarioTexto = horarioSelecionado.dataset.datetime; // Ex: "10/11/2025 10:00"

      // 3. Preenche o modal de pagamento (que está escondido)
      if (pagamentoResumoLab) pagamentoResumoLab.textContent = labNome;
      if (pagamentoResumoHorario) pagamentoResumoHorario.textContent = horarioTexto;
      
      // 4. Esconde a mensagem de sucesso (caso esteja visível de antes)
      if (pagamentoSucessoMsg) pagamentoSucessoMsg.classList.add('hidden');
      if (confirmarPagamentoBtn) {
        confirmarPagamentoBtn.disabled = false;
        confirmarPagamentoBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmar Pagamento';
      }

      // 5. Fecha o modal de agendamento
      closeModal(agendarExameModal);
      
      // 6. Abre o novo modal de pagamento
      openModal(pagamentoSimulacaoModal);
    });
  }


  


/**
 * CARREGA EXAMES (Versão Compatível com Médico e Paciente)
 */
async function loadExames(force = false) {
    if (!examesListContainer || !currentUser) return;

    // 1. Verifica cache
    if (examesListContainer.dataset.loaded === 'true' && !force && allExames.length > 0) {
        applyExameFilters(); 
        return;
    }

    examesListContainer.innerHTML = '<p class="placeholder">Carregando exames...</p>';
    let examesTemp = [];
    let pendentesCount = 0;

    try {
        // 2. Busca no Firestore (SEM orderBy para evitar erros de campos em falta)
        const examesRef = collection(db, 'pacientes', currentUser.uid, 'exames');
        const q = query(examesRef); 
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("Firestore 'exames' vazio, usando mocks.");
            examesTemp = getMockExames();
        } else {
            console.log(`Exames encontrados: ${querySnapshot.size}`);
            examesTemp = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // 3. Salva na Variável Global
        allExames = examesTemp;

        // 4. Contagem de Pendentes
        allExames.forEach(exame => {
            if (['Agendado', 'Pendente Upload', 'Solicitado'].includes(exame.status)) {
                pendentesCount++;
            }
        });

        // Atualiza o badge
        if (examesFilterStatus) examesFilterStatus.textContent = `${pendentesCount} pendentes`;

        // 5. Renderiza (Aqui aplicamos a ordenação segura)
        applyExameFilters();
        examesListContainer.dataset.loaded = 'true';

    } catch (error) {
        console.error("Erro ao carregar exames:", error);
        examesListContainer.innerHTML = '<p class="placeholder" style="color: var(--cor-delete);">Erro ao carregar exames.</p>';
    }
}


    // ==========================================================
// SUBSTITUA A SUA FUNÇÃO loadVacinas() POR ESTA
// ==========================================================


/**
 * TAREFA: (V3 - Lógica Híbrida CORRIGIDA)
 * Carrega Vacinas (Firestore ou Mock, NUNCA os dois)
 * (Busca no Firestore. Se estiver vazio, usa o mock.)
 */
async function loadVacinas(force = false) {

    const container = document.getElementById('vacinas-lista');
    const statusEl = document.getElementById('vacinas-filter-status');

    if (!container || !currentUser) return;

    // 1. Lógica de Cache (Não recarrega se não for forçado)
    if (!force && allVacinas.length > 0) {
        console.log("Vacinas já em memória, aplicando filtros...");
        applyVacinaFilters(); // <-- CHAMA A FUNÇÃO CORRETA
        return;
    }

    container.innerHTML = '<p class="placeholder">Carregando carteirinhas de vacinação...</p>';
    
    let firestoreVacinas = []; // Array para dados reais
    let vacinasParaUsar = []; // Array final

    try {
        // --- ETAPA 1: BUSCAR DADOS REAIS ---
        const vacinasRef = collection(db, 'pacientes', currentUser.uid, 'vacinas');
        const q = query(vacinasRef, orderBy("enviadoEm", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("Firestore 'vacinas' está vazio.");
        } else {
            console.log(`Dados reais do Firestore encontrados: ${querySnapshot.size} vacinas.`);
            firestoreVacinas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

    } catch (error) {
        console.warn("Erro ao carregar vacinas do Firestore. Mocks serão usados como fallback.", error.message);
        // Se o Firestore falhar, 'firestoreVacinas' continuará vazio.
    }

    // ==========================================================
    // --- ETAPA 2: LÓGICA HÍBRIDA (A SUA IDEIA) ---
    // ==========================================================
    if (firestoreVacinas.length > 0) {
        // CASO 1: Temos dados REAIS. Usar APENAS eles.
        console.log("Modo Híbrido (Vacinas): Usando dados REAIS do Firestore.");
        vacinasParaUsar = firestoreVacinas;
    } else {
        // CASO 2: O Firestore está vazio. Usar APENAS os mocks.
        console.log("Modo Híbrido (Vacinas): Firestore vazio. Usando dados MOCK.");
        vacinasParaUsar = getMockVacinas();
    }

    // --- ETAPA 3: SALVAR NA MEMÓRIA GLOBAL ---
    allVacinas = vacinasParaUsar;
    console.log(`Total de vacinas (Modo Híbrido): ${allVacinas.length}`);


    // --- ETAPA 4: RENDERIZAR O QUE FOI ESCOLHIDO (MOCK OU REAL) ---
    try {
        container.innerHTML = ''; // Limpa o "Carregando..."

        // ==========================================================
        // --- A CORREÇÃO ESTÁ AQUI ---
        // (Substituí 'applyAtestadoFilters' pela nova 'applyVacinaFilters')
        // ==========================================================
        applyVacinaFilters(); 
        // ==========================================================
        // --- FIM DA CORREÇÃO ---
        // ==========================================================

        // A contagem de status (ex: "2 válidas") agora é feita DENTRO de applyVacinaFilters()

        container.dataset.loaded = 'true'; // Marca como carregado

    } catch (renderError) {
        console.error("Erro fatal ao tentar RENDERIZAR as vacinas:", renderError);
        container.innerHTML = '<p class="placeholder" style="color: var(--cor-delete);">Erro ao desenhar os cards de vacinas.</p>';
    }
}
     // ==========================================================
    // COLE ESTA FUNÇÃO NOVA (Início)
    // ==========================================================


    // ==========================================================
    // COLE ESTA FUNÇÃO NOVA (Fim)
    // ==========================================================

    // ==========================================================
    // COLE ESTA FUNÇÃO NOVA (Início)
    // ==========================================================

    /**
 * TAREFA: Carrega Atestados (V2 - Híbrido Firestore + Mock)
 * (Busca no Firestore e junta com os mocks)
 */
async function loadAtestados(force = false) {
    const container = document.getElementById('atestados-lista');
    const statusEl = document.getElementById('atestados-filter-status');

    if (!container || !currentUser) return;

    // 1. Lógica de Cache (Não recarrega se não for forçado)
    if (container.dataset.loaded === 'true' && !force) {
        console.log("Atestados já carregados, aplicando filtros...");
        applyAtestadoFilters(); // Apenas reaplica os filtros
        return;
    }

    container.innerHTML = '<p class="placeholder">Carregando atestados...</p>';
    let atestadosParaRenderizar = []; // Lista temporária
    
    try {
        // --- ETAPA 1: TENTAR BUSCAR DADOS REAIS ---
        console.log("Tentando buscar 'atestados' no Firestore...");
        const atestadosRef = collection(db, 'pacientes', currentUser.uid, 'atestados');
        const q = query(atestadosRef, orderBy("dataInicio", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log("Firestore 'atestados' está vazio, usando mocks.");
            // Se o Firestore está vazio, a nossa lista temporária são os mocks
            atestadosParaRenderizar = getMockAtestados();
        } else {
            console.log(`Dados reais do Firestore encontrados: ${querySnapshot.size} atestados.`);
            // Se o Firestore tem dados, a lista começa com eles
            atestadosParaRenderizar = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            
            // --- LÓGICA HÍBRIDA (O SEU PEDIDO) ---
            const mocks = getMockAtestados();
            mocks.forEach(mock => {
                // Adiciona o mock APENAS se um ID igual já não veio do Firestore
                if (!atestadosParaRenderizar.some(real => real.id === mock.id)) {
                    atestadosParaRenderizar.push(mock);
                }
            });
            console.log(`Dados combinados: ${atestadosParaRenderizar.length} atestados no total.`);
        }

    } catch (error) {
        console.error("Erro ao carregar atestados (Firestore), usando mocks:", error);
        // Se tudo falhar, usa os mocks como fallback
        atestadosParaRenderizar = getMockAtestados();
    }

    // --- ETAPA 2: SALVAR NA MEMÓRIA GLOBAL ---
    // (Esta é a variável que as funções de filtro e botões usam)
    allAtestados = atestadosParaRenderizar;

    // --- ETAPA 3: RENDERIZAR E ATUALIZAR STATUS ---
    try {
        // Chama a função de filtro (que vai desenhar os cards)
        applyAtestadoFilters();
        
        container.dataset.loaded = 'true'; // Marca como carregado
    
    } catch (renderError) {
        console.error("Erro fatal ao tentar RENDERIZAR os atestados:", renderError);
        container.innerHTML = '<p class="placeholder" style="color: red;">Erro ao renderizar atestados.</p>';
    }
}



/**
 * DESENHA OS CARDS DE ATESTADO (Versão Final: Layout Bonito + Dados Reais)
 * Substitui as antigas 'renderAtestados' e 'renderAtestadoCard'
 */
function renderAtestados(lista) {
    const container = document.getElementById('atestados-lista');
    if (!container) return;

    container.innerHTML = '';

    if (!lista || lista.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-file-invoice"></i><p>Nenhum atestado encontrado.</p></div>';
        return;
    }

    lista.forEach(atestado => {
        // 1. Formatação de Datas
        let inicioFmt = 'N/D';
        let dataRaw = atestado.dataInicio || atestado.data;
        if (dataRaw) {
            try {
                // Adiciona horas para evitar problemas de fuso horário ao converter
                const d = new Date(dataRaw.includes('T') ? dataRaw : dataRaw + 'T00:00:00');
                inicioFmt = d.toLocaleDateString('pt-BR');
            } catch(e){}
        }

        // 2. Status
        let statusClass = 'status-arquivada';
        if (atestado.status === 'Válido') statusClass = 'status-valida'; // Verde
        if (atestado.status === 'Expirado') statusClass = 'status-expirado'; // Cinza

        // 3. Correção dos Campos
        const titulo = atestado.titulo || atestado.tipo || 'Atestado Médico';
        
        // Duração: O médico salva como 'diasAfastamento', o paciente como 'duracao'
        const dias = atestado.diasAfastamento || atestado.duracao || '?';
        const duracaoTexto = isNaN(dias) ? dias : `${dias} dia(s)`; 

        // 4. Botões
        let botoesEsquerda = `
            <button class="btn-pdf" data-action="gerar-pdf-atestado" data-atestado-id="${atestado.id}">
                <i class="fa-solid fa-file-pdf"></i> Gerar PDF
            </button>
        `;

        // Botão Apagar (apenas se origem for paciente)
        if (atestado.origem === 'paciente') {
            botoesEsquerda += `
                <button class="btn-apagar-receita" data-action="apagar-atestado" data-atestado-id="${atestado.id}" aria-label="Apagar atestado" title="Apagar atestado">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
        }

        // 5. HTML do Card (Reutilizando .exame-card para consistência visual)
        const cardHTML = `
            <div class="exame-card" data-atestado-id="${atestado.id}">
                <div class="exame-header">
                    <h3><i class="fa-solid fa-file-invoice"></i> ${titulo}</h3>
                    <span class="badge ${statusClass}">${atestado.status || 'Emitido'}</span>
                </div>
                
                <p class="exame-subtitulo">Emitido por: ${atestado.medico || atestado.nome_profissional || 'Profissional'}</p>

                <div class="exame-details">
                    <span><i class="fa-solid fa-calendar-days"></i> Início: <strong>${inicioFmt}</strong></span>
                    <span><i class="fa-solid fa-hourglass-half"></i> Duração: <strong>${duracaoTexto}</strong></span>
                    <span><i class="fa-solid fa-circle-info"></i> CID: <strong>${atestado.cid || 'N/A'}</strong></span>
                </div>
                
                <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">
                   <strong>Motivo:</strong> ${atestado.motivo || 'Não especificado'}
                </p>

                <div class="exame-footer">
                    <div class="card-footer-actions-esquerda">
                        ${botoesEsquerda}
                    </div>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

/**
 * GERA PDF DE ATESTADO (Técnica Blindada: Clone + Cortina)
 */
async function gerarPDFAtestado(atestadoId) {
    // 1. Encontra os dados
    const atestadoData = allAtestados.find(a => a.id.toString() === atestadoId.toString());

    if (!atestadoData) {
        alert("Erro: Atestado não encontrado.");
        return;
    }

    const template = document.getElementById('pdf-atestado-template');
    if (!template) { alert("Erro: Template PDF 'pdf-atestado-template' não encontrado no HTML."); return; }

    // --- PREENCHIMENTO DOS DADOS ---
    
    // Cabeçalho
    document.getElementById('pdf-atestado-doctor-name').textContent = atestadoData.medico || atestadoData.nome_profissional || "Profissional";
    document.getElementById('pdf-atestado-doctor-specialty').textContent = atestadoData.especialidade_profissional || "Especialidade";
    document.getElementById('pdf-atestado-doctor-crm').textContent = atestadoData.registro_profissional || "";
    
    document.getElementById('pdf-atestado-patient-name').textContent = currentPatientData.nome || "Paciente";
    
    // Data de Emissão
    let dataEmissao = new Date().toLocaleDateString('pt-BR');
    if (atestadoData.emissao || atestadoData.timestamp) {
        const raw = atestadoData.emissao || atestadoData.timestamp;
        try {
             const d = raw.toDate ? raw.toDate() : new Date(raw);
             dataEmissao = d.toLocaleDateString('pt-BR');
        } catch(e){}
    }
    document.getElementById('pdf-atestado-emission-date').textContent = dataEmissao;

    // Texto do Corpo (Injetando variáveis)
    const nomePaciente = currentPatientData.nome || "Paciente";
    const docPaciente = currentPatientData.cpf || "Não informado";
    const dias = atestadoData.diasAfastamento || atestadoData.duracao || "0";
    
    let dataInicio = "N/D";
    if (atestadoData.dataInicio) {
        const d = new Date(atestadoData.dataInicio + 'T00:00:00');
        dataInicio = d.toLocaleDateString('pt-BR');
    }

    const textoCorpo = `
        Atesto para os devidos fins que o(a) paciente <strong>${nomePaciente}</strong>, 
        portador(a) do documento <strong>${docPaciente}</strong>, necessita de 
        <strong>${dias}</strong> dia(s) de afastamento de suas atividades (laborais/escolares), 
        a partir de <strong>${dataInicio}</strong>, por motivos de saúde.
    `;
    
    document.getElementById('pdf-atestado-texto').innerHTML = textoCorpo;

    // Rodapé
    document.getElementById('pdf-atestado-motivo').textContent = atestadoData.motivo || "";
    document.getElementById('pdf-atestado-cid').textContent = atestadoData.cid || "N/A";
    document.getElementById('pdf-atestado-observacoes').textContent = atestadoData.observacoes || "Nenhuma.";
    document.getElementById('pdf-atestado-signature-name').textContent = atestadoData.medico || atestadoData.nome_profissional || "Assinado";

    // --- GERAÇÃO (Clone + Cortina) ---
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
        loadingOverlay.style.backgroundColor = '#ffffff'; 
        loadingOverlay.style.opacity = '1';
    }

    const clone = template.cloneNode(true);
    clone.id = "temp-pdf-clone-atestado";
    clone.style.position = 'fixed';
    clone.style.left = '50%';
    clone.style.top = '50%';
    clone.style.transform = 'translate(-50%, -50%)';
    clone.style.zIndex = '100'; 
    clone.style.display = 'block';
    clone.style.visibility = 'visible';
    clone.style.backgroundColor = '#ffffff';

    document.body.appendChild(clone);

    try {
        await new Promise(r => setTimeout(r, 500));

        const canvas = await html2canvas(clone, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`atestado-${(nomePaciente).split(' ')[0]}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF atestado:", error);
        alert("Não foi possível gerar o PDF.");
    } finally {
        if (document.body.contains(clone)) document.body.removeChild(clone);
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.backgroundColor = ''; 
        }
    }
}



/**
 * TAREFA: NOVA FUNÇÃO (V2 - Com Busca)
 * Filtra a lista 'allAtestados' com base nos botões E na barra de busca.
 */
function applyAtestadoFilters() {
    // 1. Garante que os seletores e os dados (allAtestados) existem
    if (!allAtestados || !atestadosListContainer) {
        // Se a função for chamada antes de 'allAtestados' ser preenchido, não faz nada.
        return;
    }

    // 2. Pega o valor da barra de BUSCA (NOVO)
    const searchTerm = atestadoSearchInput ? atestadoSearchInput.value.toLowerCase() : '';

    // 3. Pega o valor dos BOTÕES (lógica que já funcionava)
    const activeFilterBtn = atestadoFilterGroup ? atestadoFilterGroup.querySelector('.filter-btn-small.active') : null;
    const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'todos'; // 'todos', 'validos', 'expirados'

    let validosCount = 0; // Vamos recalcular a contagem de válidos

    // 4. Filtra a lista global 'allAtestados'
    const atestadosFiltrados = allAtestados.filter(atestado => {
        
        // Contagem de Válidos (para o badge)
        if (atestado.status === 'Válido') {
            validosCount++;
        }

        // --- Verificação do Filtro de Status (Botões) ---
        let statusMatch = false;
        if (activeFilter === 'todos') {
            statusMatch = true;
        } else if (activeFilter === 'validos') {
            statusMatch = (atestado.status === 'Válido');
        } else if (activeFilter === 'expirados') {
            statusMatch = (atestado.status === 'Expirado');
        }

        // --- Verificação do Termo de Busca (Search Bar) (NOVO) ---
        const searchMatch = searchTerm === '' ||
            (atestado.titulo && atestado.titulo.toLowerCase().includes(searchTerm)) ||
            (atestado.motivo && atestado.motivo.toLowerCase().includes(searchTerm)) ||
            (atestado.medico && atestado.medico.toLowerCase().includes(searchTerm));

        // Só retorna o atestado se AMBOS derem 'true'
        return statusMatch && searchMatch;
    });

    // 5. Renderiza o resultado
    renderAtestados(atestadosFiltrados); // A função renderAtestados desenha os cards

    // 6. Atualiza o status (ex: "1 válidos")
    const statusEl = document.getElementById('atestados-filter-status');
    if (statusEl) {
        statusEl.textContent = `${validosCount} ${validosCount === 1 ? 'válido' : 'válidos'}`;
    }
}

    // ==========================================================
    // COLE ESTE BLOCO (Início) - Lógica do Histórico de Registros
    // (Copiado de paciente-perfil.js)
    // ==========================================================

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
                // Converte Timestamp do Firestore para objeto Date do JS
                if (data.timestamp && data.timestamp.toDate) {
                    data.jsDate = data.timestamp.toDate();
                } else {
                    // Fallback para datas em string (se existirem)
                    data.jsDate = new Date(data.dataCompleta || new Date());
                }
                return data;
            });

            console.log(`Carregados ${allPatientRecords.length} registros diários.`);
            return true;
        } catch (error) {
            console.error("Erro ao carregar histórico completo:", error);
            return false;
        }
    }

    /**
     * Filtra os registros e atualiza o gráfico e a lista
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
        } else {
            console.warn(`Painel do histórico para a aba '${activeTab}' não encontrado.`);
        }
    }

    /**
     * Desenha o gráfico (Chart.js) para uma aba específica.
     */
    // ==========================================================
// SUBSTITUA A SUA FUNÇÃO "drawHistoricoChart" POR ESTA
// ==========================================================

/**
 * Desenha o gráfico (Chart.js) para uma aba específica.
 * (VERSÃO CORRIGIDA - Inclui o 'case' para Atividade Física)
 */
function drawHistoricoChart(dados, tabId) {
    const canvasId = `historico-chart-${tabId}`;
    const canvas = document.getElementById(canvasId);

    // 1. Se for a aba "Biométricos" (que tem muitos gráficos) OU a tela não existir,
    // chama a função respetiva e pára.
    if (tabId === 'biometricos' || !canvas) {
        if (tabId === 'biometricos') {
            drawAllBiometricCharts(dados);
        }
        return; // Pára aqui se for 'biometricos' ou se o canvas não for encontrado
    }

    // 2. Se for um gráfico normal (Sono, Humor, etc.), continua...
    const ctx = canvas.getContext('2d');
    if (canvas.chartInstance) {
        canvas.chartInstance.destroy(); // Limpa o gráfico antigo
    }

    const chartData = { labels: [], datasets: [] };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
    };

    // Ordena por data (mais antigo primeiro) para o gráfico
    dados.sort((a, b) => a.jsDate - b.jsDate);
    const labels = dados.map(reg => reg.jsDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));

    // --- 3. Lógica Específica de Cada Aba ---

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
            tension: 0.3,
            fill: true
        });
        chartOptions.scales.y.suggestedMax = 4;
    }

    // ======================================================
    // AQUI ESTÁ A LÓGICA QUE ESTAVA EM FALTA
    // ======================================================
  else if (tabId === 'atividade') {
    chartData.labels = labels;
    chartData.datasets.push({
        label: 'Minutos de Atividade',
        // --- CORREÇÃO: Procura por "duracao_min" em vez de "minutos" ---
        data: dados.map(reg => reg.atividade?.duracao_min || 0), 
        backgroundColor:'#8b5cf6' , // Cor laranja
        borderColor: '#8b5cf6',
        type: 'bar',
    });
    chartOptions.scales.y.suggestedMax = 60; // Define o eixo Y (ex: 0-60 min)
}
    // ======================================================
    // FIM DA CORREÇÃO
    // ======================================================

    // 4. Cria o novo gráfico
    canvas.chartInstance = new Chart(ctx, {
        type: 'bar', // (O tipo padrão, será substituído pelo 'type' no dataset)
        data: chartData,
        options: chartOptions
    });
}

// ==========================================================
// FIM DA SUBSTITUIÇÃO
// ==========================================================

    
    /**
     * Função "mãe" que chama o desenho de todos os 6 gráficos biométricos.
     */
    function drawAllBiometricCharts(dados) {
        dados.sort((a, b) => a.jsDate - b.jsDate);
        const labels = dados.map(reg => reg.jsDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));

        drawBiometricChart_Pressao(dados, labels);
        drawBiometricChart_Simples('historico-chart-glicemia', labels, dados.map(reg => reg.sinaisVitais?.glicemia || null), 'Glicemia (mg/dL)', 'rgba(220, 38, 38, 1)');
        drawBiometricChart_Simples('historico-chart-freqCardiaca', labels, dados.map(reg => reg.sinaisVitais?.freqCardiaca || null), 'Freq. Cardíaca (bpm)', 'rgba(219, 39, 119, 1)');
        drawBiometricChart_Simples('historico-chart-saturacaoO2', labels, dados.map(reg => reg.sinaisVitais?.saturacaoO2 || null), 'Saturação O₂ (%)', 'rgba(20, 184, 166, 1)');
        drawBiometricChart_Simples('historico-chart-temperatura', labels, dados.map(reg => reg.sinaisVitais?.temperatura || null), 'Temperatura (°C)', 'rgba(107, 70, 193, 1)');
        drawBiometricChart_Simples('historico-chart-peso', labels, dados.map(reg => reg.sinaisVitais?.peso || null), 'Peso (kg)', 'rgba(74, 85, 104, 1)');
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
            data: { labels: labels, datasets: [
                { label: 'Sistólica (Máx)', data: dados.map(reg => reg.sinaisVitais?.pressaoSistolica || null), borderColor: 'rgba(65, 184, 213, 1)', backgroundColor: 'rgba(65, 184, 213, 0.1)', tension: 0.3, fill: false, spanGaps: true },
                { label: 'Diastólica (Mín)', data: dados.map(reg => reg.sinaisVitais?.pressaoDiastolica || null), borderColor: 'rgba(107, 114, 128, 1)', backgroundColor: 'rgba(107, 114, 128, 0.1)', tension: 0.3, fill: false, spanGaps: true }
            ] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: false } } }
        });
    }

    // ==========================================================
    // COLE ESTE BLOCO (Fim) - Lógica do Histórico de Registros
    // ==========================================================

    /**
 * TAREFA: (NOVA FUNÇÃO)
 * Filtra a lista 'allVacinas' com base nos botões E na barra de busca.
 */
function applyVacinaFilters() {
    // Seletores da aba Vacinas
    const vacinaSearchInput = document.getElementById('vacina-search-input');
    const vacinaFilterGroup = document.getElementById('vacina-filter-group');
    const statusEl = document.getElementById('vacinas-filter-status');
    const container = document.getElementById('vacinas-lista');

    // 1. Garante que os seletores e os dados (allVacinas) existem
    if (!allVacinas || !container) {
        // Se esta função for chamada antes de 'allVacinas' ser preenchido, não faz nada.
        return;
    }

    // 2. Pega o valor da barra de BUSCA
    const searchTerm = vacinaSearchInput ? vacinaSearchInput.value.toLowerCase() : '';

    // 3. Pega o valor dos BOTÕES
    const activeFilterBtn = vacinaFilterGroup ? vacinaFilterGroup.querySelector('.filter-btn-small.active') : null;
    const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'todos'; // 'todos', 'validas', 'expiradas'

    let validasCount = 0; // Para o contador

    // 4. Filtra a lista global 'allVacinas'
    const vacinasFiltradas = allVacinas.filter(vacina => {
        
        // Contagem
        if (vacina.status === 'Válida') {
            validasCount++;
        }

        // Filtro de Status (Botões)
        let statusMatch = false;
        if (activeFilter === 'todos') {
            statusMatch = true;
        } else if (activeFilter === 'validas') {
            statusMatch = (vacina.status === 'Válida');
        } else if (activeFilter === 'expiradas') {
            statusMatch = (vacina.status === 'Expirada');
        }

        // Filtro de Busca (Texto)
        const searchMatch = searchTerm === '' ||
            (vacina.titulo && vacina.titulo.toLowerCase().includes(searchTerm)) ||
            (vacina.medico && vacina.medico.toLowerCase().includes(searchTerm));

        return statusMatch && searchMatch;
    });

    // 5. Renderiza o resultado
    renderVacinas(vacinasFiltradas); // Chama a nova função renderVacinas (Passo 2)

    // 6. Atualiza o status (ex: "2 válidas")
    if (statusEl) {
        statusEl.textContent = `${validasCount} ${validasCount === 1 ? 'válida' : 'válidas'}`;
    }
}



    // ==========================================================
    // COLE ESTA FUNÇÃO NOVA (Início)
    // ==========================================================
/**
 * CARREGA ACOMPANHAMENTOS (Versão Final - Leitura Real)
 * Lê de: pacientes/{id}/acompanhamentos
 */
async function loadAcompanhamentos(force = false) {
    const container = document.getElementById('acompanhamentos-lista');
    const statusEl = document.getElementById('acompanhamentos-filter-status');

    if (!container || !currentUser) return;

    // 1. Verifica cache
    if (container.dataset.loaded === 'true' && !force && allAcompanhamentos.length > 0) {
        console.log("Acompanhamentos já em memória. Re-renderizando...");
        applyAcompanhamentoFilters();
        return;
    }

    container.innerHTML = '<p class="placeholder">A carregar acompanhamentos...</p>';

    try {
        console.log(`Buscando Acompanhamentos REAIS em: pacientes/${currentUser.uid}/acompanhamentos`);

        // 2. Busca no Firestore (Coleção do Paciente)
        const acompRef = collection(db, 'pacientes', currentUser.uid, 'acompanhamentos');
        
        // Ordena por data de início (mais recente primeiro)
        // Se der erro de índice, o catch trata disso
        const q = query(acompRef, orderBy('data_inicio', 'desc')); 
        
        const querySnapshot = await getDocs(q);
        let acompTemp = [];

        if (querySnapshot.empty) {
            console.log("Nenhum acompanhamento real encontrado no Firestore.");
            // IMPORTANTE: Não carregamos mais mocks aqui para não te confundir.
            // Se estiver vazio, aparece vazio.
        } else {
            console.log(`Sucesso! ${querySnapshot.size} acompanhamentos reais encontrados.`);
            acompTemp = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        // 3. Atualiza a Variável Global (CRUCIAL PARA O CHECK-IN FUNCIONAR)
        allAcompanhamentos = acompTemp;
        
        // 4. Renderiza a lista
        // Chamamos o filtro para garantir que a lógica de pesquisa/botões se aplica
        applyAcompanhamentoFilters();
        
        container.dataset.loaded = 'true';

    } catch (error) {
        console.error("Erro ao carregar acompanhamentos:", error);
        
        // Fallback para erro de índice (se o Firebase reclamar do orderBy)
        if (error.code === 'failed-precondition') {
            console.warn("Tentando carregar sem ordenação (Fallback)...");
            try {
                const qBackup = query(collection(db, 'pacientes', currentUser.uid, 'acompanhamentos'));
                const snap = await getDocs(qBackup);
                allAcompanhamentos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                applyAcompanhamentoFilters();
            } catch (errBackup) {
                container.innerHTML = '<p class="placeholder" style="color: var(--cor-delete);">Erro ao carregar lista.</p>';
            }
        } else {
            container.innerHTML = '<p class="placeholder" style="color: var(--cor-delete);">Erro ao carregar lista.</p>';
        }
    }
}

    // [SUBSTITUA A SUA FUNÇÃO 'applyAcompanhamentoFilters' INTEIRA POR ESTA]

/**
 * FILTRA E RENDERIZA ACOMPANHAMENTOS (Versão Blindada contra Erros)
 */
function applyAcompanhamentoFilters() {
    const container = document.getElementById('acompanhamentos-lista');
    const statusEl = document.getElementById('acompanhamentos-filter-status');
    
    // Verificações de segurança
    if (!container || !allAcompanhamentos) return;
    
    // 1. Pega os valores dos filtros
    const searchTerm = acompanhamentoSearchInput ? acompanhamentoSearchInput.value.toLowerCase() : '';
    const activeFilterBtn = acompanhamentoFilterGroup ? acompanhamentoFilterGroup.querySelector('.filter-btn-small.active') : null;
    // Normaliza o filtro (alguns botões usam 'em-andamento', outros 'ativo')
    let activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'todos';
    
    let emAndamentoCount = 0;

    // 2. Filtra a lista
    const acompanhamentosFiltrados = allAcompanhamentos.filter(acomp => {
        // Normaliza o status do acompanhamento (Ativo/ativo)
        const status = (acomp.status || "").toLowerCase();
        const isAtivo = status === 'ativo';

        // Contagem para o badge
        if (isAtivo) emAndamentoCount++;

        // Filtro de Status (Botões)
        let statusMatch = true;
        if (activeFilter === 'em-andamento' || activeFilter === 'ativo') {
            statusMatch = isAtivo;
        } else if (activeFilter === 'concluidos') {
            statusMatch = status === 'concluído' || status === 'concluido';
        }

        // Filtro de Busca (Nome do Médico ou Especialidade)
        // Verifica vários campos possíveis onde o nome pode estar para evitar erro
        const medicoNome = acomp.assinatura_digital?.nome || acomp.medico || "";
        const especialidade = acomp.assinatura_digital?.especialidade || acomp.titulo || "";
        
        const searchMatch = searchTerm === '' || 
                            medicoNome.toLowerCase().includes(searchTerm) ||
                            especialidade.toLowerCase().includes(searchTerm);

        return statusMatch && searchMatch;
    });

    // 3. Renderiza usando uma função auxiliar segura
    renderAcompanhamentoListSegura(acompanhamentosFiltrados);

    // 4. Atualiza o badge
    if (statusEl) {
        statusEl.textContent = `${emAndamentoCount} em andamento`;
    }
}

/**
 * Função Auxiliar: Desenha a lista (Loop seguro)
 */
function renderAcompanhamentoListSegura(lista) {
    const container = document.getElementById('acompanhamentos-lista');
    container.innerHTML = '';
    
    if (!lista || lista.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-star-of-life"></i><p>Nenhum acompanhamento encontrado.</p></div>';
    } else {
        // Ordena (Ativos primeiro)
        lista.sort((a, b) => {
            const sA = (a.status || "").toLowerCase();
            const sB = (b.status || "").toLowerCase();
            if (sA === 'ativo' && sB !== 'ativo') return -1;
            if (sA !== 'ativo' && sB === 'ativo') return 1;
            return 0;
        });

        lista.forEach(acomp => {
            // Chama a função de desenhar cartão que já corrigimos antes
            if (typeof renderAcompanhamentoCard === 'function') {
                renderAcompanhamentoCard(acomp);
            }
        });
    }
}
    /**
     * TAREFA: A FUNÇÃO PRINCIPAL (NOVA)
     * (Verifica se a anamnese existe e mostra o estado Vazio ou Preenchido)
     */
    async function loadAnamnese(force = false) {
        const containerVazio = document.getElementById('anamnese-estado-vazio');
        const containerPreenchido = document.getElementById('anamnese-estado-preenchido');

        if (!containerVazio || !containerPreenchido || !currentUser) return;

        // Usamos a mesma lógica de "cache" das outras abas
        if (containerPreenchido.dataset.loaded === 'true' && !force) {
            console.log("Anamnese já carregada.");
            return;
        }

        // Define um estado de carregamento (mostra o vazio por padrão)
        containerVazio.classList.remove('hidden');
        containerPreenchido.classList.add('hidden');

        try {
            console.log("Tentando buscar 'anamnese' no Firestore...");
            // A anamnese é um documento único, não uma coleção
            const anamneseRef = doc(db, 'pacientes', currentUser.uid, 'anamnese', 'principal');
            const docSnap = await getDoc(anamneseRef);

        if (!docSnap.exists()) {
            // --- ESTADO VAZIO ---
            console.log("Nenhuma anamnese encontrada. Mostrando Estado Vazio.");
            containerVazio.classList.remove('hidden');
            containerPreenchido.classList.add('hidden');
        } else {
            // --- ESTADO PREENCHIDO ---
            console.log("Anamnese encontrada. Mostrando Estado Preenchido.");
            const data = docSnap.data();

            // 1. Popula o card-resumo (como antes)
            const dataAtualizacao = data.ultimaAtualizacao?.toDate() || new Date();
            document.getElementById('anamnese-data-atualizacao').textContent = dataAtualizacao.toLocaleDateString('pt-BR');
            document.getElementById('anamnese-resumo-medicacoes').textContent = data.medicamentos_uso || 'Nenhum';
            document.getElementById('anamnese-resumo-alergias').textContent = data.alergias || 'Nenhuma';
            document.getElementById('anamnese-resumo-doencas').textContent = data.doencas || 'Nenhuma';

            // 2. CHAMA A NOVA LÓGICA DE CÁLCULO
            const progresso = calculateAnamneseProgress(data);

            // 3. Atualiza a nova barra de progresso
            const progressoTextoEl = document.getElementById('anamnese-progresso-texto');
            const progressoFillEl = document.getElementById('anamnese-progress-bar-fill');

            if(progressoTextoEl) progressoTextoEl.textContent = `${progresso}% Completo`;
            if(progressoFillEl) progressoFillEl.style.width = `${progresso}%`;

            // 4. Mostra o card preenchido
            containerVazio.classList.add('hidden');
            containerPreenchido.classList.remove('hidden');
            containerPreenchido.dataset.loaded = 'true'; // Marca como carregado
        }


        } catch (error) {
            console.error("Erro ao carregar anamnese:", error);
            containerVazio.classList.remove('hidden');
            containerPreenchido.classList.add('hidden');
            // TODO: Mostrar uma mensagem de erro dentro do containerVazio
        }
    }

        // ==========================================================
    // COLE ESTE BLOCO (Início) - Funções Auxiliares de Registro Diário
    // ==========================================================

    /**
     * Salva o REGISTRO DIÁRIO COMPLETO no Firestore.
     */
    async function handleSalvarRegistroDiario(event) {
        event.preventDefault(); // Impede o envio real do formulário
        console.log("Iniciando handleSalvarRegistroDiario...");
        if (!currentUser) return;

        const form = formNovoRegistroDiario;
        const feedbackEl = novoRegistroFeedback;
        const submitButton = document.getElementById('salvar-novo-registro-btn');

        if (!form || !feedbackEl || !submitButton) {
            console.error("Elementos do formulário de registro diário não encontrados.");
            return;
        }

        feedbackEl.classList.add('hidden');
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

        try {
            // Coleta os dados (esta lógica é do paciente-perfil.js)
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
                    escala: parseInt(document.getElementById('registro-alim-escala').value, 10) || 3
                },
                sinaisVitais: {
                    pressaoSistolica: parseInt(document.getElementById('reg-pressao-sistolica').value, 10) || null,
                    pressaoDiastolica: parseInt(document.getElementById('reg-pressao-diastolica').value, 10) || null,
                    glicemia: parseInt(document.getElementById('reg-glicemia').value, 10) || null,
                    saturacaoO2: parseInt(document.getElementById('reg-saturacao-o2').value, 10) || null,
                    freqCardiaca: parseInt(document.getElementById('reg-freq-cardiaca').value, 10) || null,
                    temperatura: parseFloat(document.getElementById('reg-temperatura').value) || null,
                    peso: parseFloat(document.getElementById('reg-peso').value) || null
                },
                atividade: null // Fica nulo, pois será registrado em outro modal (se o ativarmos)
            };

            // Salva no Firestore
            const registrosRef = collection(db, 'pacientes', currentUser.uid, 'registrosDiarios');
            await addDoc(registrosRef, registroData);

            // Feedback de Sucesso
            feedbackEl.textContent = 'Registro salvo com sucesso!';
            feedbackEl.className = 'feedback-message success';
            feedbackEl.classList.remove('hidden');

            // Força o recarregamento dos dados na aba "Registros Diários"
            await loadHistoricoRegistrosCompleto(true);
            renderHistoricoModal(); // Redesenha os gráficos

            // Fecha e reseta o modal
            setTimeout(() => {
                closeModal(novoRegistroModal);
                form.reset();
                // Resetar manualmente os campos condicionais
                detalhesDor?.classList.add('hidden');
                listaMedCheckbox?.classList.add('hidden');
                detalhesMedEfeitos?.classList.add('hidden');
                document.querySelectorAll('.meal-details').forEach(el => el.classList.add('hidden'));
                if(registroMedListaCheckboxes) registroMedListaCheckboxes.innerHTML = '';
                if(registroRefeicoesExternasLista) registroRefeicoesExternasLista.innerHTML = '';
            }, 1500);

        } catch (error) {
            console.error("Erro ao salvar registro diário:", error);
            feedbackEl.textContent = "Erro ao salvar. Tente novamente.";
            feedbackEl.className = "feedback-message error";
            feedbackEl.classList.remove('hidden');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Registro';
        }
    }

    /**
     * Adiciona um item (checkbox + label) à lista de confirmação de medicação.
     */
    function addMedicationToChecklist(nomeMedicamento, tipo = 'prescrita') {
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
        if (!currentUser || !registroMedListaCheckboxes) return;

        registroMedListaCheckboxes.querySelectorAll('label[data-tipo="prescrita"]').forEach(el => el.remove());

        if (registroMedListaCheckboxes.children.length === 0) {
            registroMedListaCheckboxes.innerHTML = `<p class="placeholder-med-lista" style="font-size: 0.85rem; color: var(--texto-suave); text-align: center;">Carregando receitas...</p>`;
        }

        try {
            // (Usaremos os dados da Aba Receitas, se já carregados, ou buscaremos)
            // Por simplicidade, vamos buscar novamente
            const receitasRef = collection(db, 'pacientes', currentUser.uid, 'receitas');
            // Assumindo que receitas ativas têm status 'Ativa'
            const q = query(receitasRef, where("status", "==", "Ativa"), orderBy("timestamp", "desc"));
            const querySnapshot = await getDocs(q);

            const placeholder = registroMedListaCheckboxes.querySelector('.placeholder-med-lista');
            if (placeholder) placeholder.remove();

            let receitasEncontradas = 0;
            querySnapshot.forEach((doc) => {
                const receita = doc.data();
                // Se a receita tiver múltiplos medicamentos
                if (receita.medicamentos && Array.isArray(receita.medicamentos)) {
                    receita.medicamentos.forEach(med => {
                        addMedicationToChecklist(med.nome, 'prescrita');
                        receitasEncontradas++;
                    });
                } 
                // Se for o formato antigo (um medicamento)
                else if (receita.medicamento) {
                    addMedicationToChecklist(receita.medicamento, 'prescrita');
                    receitasEncontradas++;
                }
            });

            if (receitasEncontradas === 0 && registroMedListaCheckboxes.children.length === 0) {
                registroMedListaCheckboxes.innerHTML = `<p class="placeholder-med-lista" style="font-size: 0.85rem; color: var(--texto-suave); text-align: center;">Nenhuma medicação prescrita ativa encontrada.</p>`;
            }
        } catch (error) {
            console.error("Erro ao carregar receitas prescritas:", error);
            registroMedListaCheckboxes.innerHTML = `<p class="placeholder-med-lista" style="color: var(--cor-delete);">Erro ao carregar receitas.</p>`;
        }
    }

    /**
     * Adiciona um item de refeição externa (ex: "Pizza") à lista no modal.
     */
    function addExternalMealToList(nomeRefeicao, detalhesRefeicao) {
        if (!registroRefeicoesExternasLista) return;

        // Remove placeholder se existir
        const placeholder = registroRefeicoesExternasLista.querySelector('.placeholder-refeicao-lista');
        if (placeholder) placeholder.remove();

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





    // ==========================================================
    // COLE ESTE BLOCO (Fim) - Funções Auxiliares de Check-in
    // ==========================================================


    /**
     * TAREFA: Função para SALVAR a anamnese no Firestore
     */
    async function handleSaveAnamnese(event) {
        event.preventDefault();
        if (!currentUser) return;

        const feedbackEl = document.getElementById('anamnese-feedback-message');
        const saveButton = document.getElementById('salvar-anamnese-button');

        feedbackEl.classList.add('hidden');
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

        try {
            // 1. Coleta todos os dados do formulário
            const anamneseData = {
                // Bloco 1
                doencas: document.getElementById('anamnese-doencas').value,
                hospitalizacao: document.getElementById('anamnese-hospitalizacao').value,
                cirurgias: document.getElementById('anamnese-cirurgias').value,
                alergias: document.getElementById('anamnese-alergias').value,
                transfusoes: document.getElementById('anamnese-transfusoes').value,
                medicamentos_uso: document.getElementById('anamnese-medicamentos-uso').value,
                // Bloco 2
                fam_hipertensao: document.getElementById('anamnese-fam-hipertensao').value,
                fam_diabetes: document.getElementById('anamnese-fam-diabetes').value,
                fam_cancer: document.getElementById('anamnese-fam-cancer').value,
                fam_cardiacas: document.getElementById('anamnese-fam-cardiacas').value,
                fam_mentais: document.getElementById('anamnese-fam-mentais').value,
                fam_outras: document.getElementById('anamnese-fam-outras').value,
                // Bloco 3
                hab_humor: document.getElementById('anamnese-hab-humor').value,
                hab_estresse: document.getElementById('anamnese-hab-estresse').value,
                hab_sono_rotina: document.getElementById('anamnese-hab-sono-rotina').value,
                hab_apoio: document.getElementById('anamnese-hab-apoio').value,
                hab_alcool: document.getElementById('anamnese-hab-alcool').value,
                hab_drogas: document.getElementById('anamnese-hab-drogas').value,
                hab_fumo: document.getElementById('anamnese-hab-fumo').value,
                hab_alimentacao: document.getElementById('anamnese-hab-alimentacao').value,
                hab_atividade: document.getElementById('anamnese-hab-atividade').value,
                hab_suplementos: document.getElementById('anamnese-hab-suplementos').value,
                // Bloco 4
                sis_digestivo: document.getElementById('anamnese-sis-digestivo').value,
                sis_urinario: document.getElementById('anamnese-sis-urinario').value,
                sis_cardio: document.getElementById('anamnese-sis-cardio').value,
                sis_respiratorio: document.getElementById('anamnese-sis-respiratorio').value,
                sis_musculo: document.getElementById('anamnese-sis-musculo').value,
                sis_neuro: document.getElementById('anamnese-sis-neuro').value,
                sis_endocrino: document.getElementById('anamnese-sis-endocrino').value,
                sis_hemato: document.getElementById('anamnese-sis-hemato').value,
                // Bloco 5
                exames_vacinas: document.getElementById('anamnese-exames').value,
                saude_mulher: document.getElementById('anamnese-saude-mulher').value,
                saude_homem: document.getElementById('anamnese-saude-homem').value,
                // Metadados
                ultimaAtualizacao: serverTimestamp() // Importante!
            };

            // 2. Define a referência do documento
            const anamneseRef = doc(db, 'pacientes', currentUser.uid, 'anamnese', 'principal');

            // 3. Salva os dados (setDoc com merge para o caso de edição)
            await setDoc(anamneseRef, anamneseData, { merge: true });

            // 4. Feedback de sucesso
            feedbackEl.textContent = 'Anamnese salva com sucesso!';
            feedbackEl.className = 'feedback-message success';
            feedbackEl.classList.remove('hidden');

            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Anamnese';

            // 5. Fecha o modal e recarrega a aba
            setTimeout(() => {
                const modal = document.getElementById('anamnese-modal');
                if(modal) closeModal(modal);
                loadAnamnese(true); // Força o recarregamento da aba
            }, 1500);

        } catch (error) {
            console.error("Erro ao salvar anamnese:", error);
            feedbackEl.textContent = 'Erro ao salvar. Tente novamente.';
            feedbackEl.className = 'feedback-message error';
            feedbackEl.classList.remove('hidden');
            saveButton.disabled = false;
            saveButton.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Anamnese';
        }
    }

    // ==========================================================
    // COLE ESTAS DUAS FUNÇÕES NOVAS (Fim)
    // ==========================================================

    // ==========================================================
    // COLE ESTAS DUAS FUNÇÕES NOVAS (Início)
    // ==========================================================

    /**
     * TAREFA: Popula o modal de "visualização" (read-only)
     * (Esta é uma função auxiliar para manter o código limpo)
     */
    function populateAnamneseViewModal(data) {
        // Função 'helper' para preencher ou mostrar 'Não preenchido'
        const preencher = (id, valor) => {
            const el = document.getElementById(id);
            if (el) el.textContent = (valor && valor.trim() !== '') ? valor : 'Não preenchido';
        };

        // Bloco 1
        preencher('vis-anamnese-doencas', data.doencas);
        preencher('vis-anamnese-hospitalizacao', data.hospitalizacao);
        preencher('vis-anamnese-cirurgias', data.cirurgias);
        preencher('vis-anamnese-alergias', data.alergias);
        preencher('vis-anamnese-transfusoes', data.transfusoes);
        preencher('vis-anamnese-medicamentos-uso', data.medicamentos_uso);
        // Bloco 2
        preencher('vis-anamnese-fam-hipertensao', data.fam_hipertensao);
        preencher('vis-anamnese-fam-diabetes', data.fam_diabetes);
        preencher('vis-anamnese-fam-cancer', data.fam_cancer);
        preencher('vis-anamnese-fam-cardiacas', data.fam_cardiacas);
        preencher('vis-anamnese-fam-mentais', data.fam_mentais);
        preencher('vis-anamnese-fam-outras', data.fam_outras);
        // Bloco 3
        preencher('vis-anamnese-hab-humor', data.hab_humor);
        preencher('vis-anamnese-hab-estresse', data.hab_estresse);
        preencher('vis-anamnese-hab-sono-rotina', data.hab_sono_rotina);
        preencher('vis-anamnese-hab-apoio', data.hab_apoio);
        preencher('vis-anamnese-hab-alcool', data.hab_alcool);
        preencher('vis-anamnese-hab-drogas', data.hab_drogas);
        preencher('vis-anamnese-hab-fumo', data.hab_fumo);
        preencher('vis-anamnese-hab-alimentacao', data.hab_alimentacao);
        preencher('vis-anamnese-hab-atividade', data.hab_atividade);
        preencher('vis-anamnese-hab-suplementos', data.hab_suplementos);
        // Bloco 4
        preencher('vis-anamnese-sis-digestivo', data.sis_digestivo);
        preencher('vis-anamnese-sis-urinario', data.sis_urinario);
        preencher('vis-anamnese-sis-cardio', data.sis_cardio);
        preencher('vis-anamnese-sis-respiratorio', data.sis_respiratorio);
        preencher('vis-anamnese-sis-musculo', data.sis_musculo);
        preencher('vis-anamnese-sis-neuro', data.sis_neuro);
        preencher('vis-anamnese-sis-endocrino', data.sis_endocrino);
        preencher('vis-anamnese-sis-hemato', data.sis_hemato);
        // Bloco 5
        preencher('vis-anamnese-exames', data.exames_vacinas);
        preencher('vis-anamnese-saude-mulher', data.saude_mulher);
        preencher('vis-anamnese-saude-homem', data.saude_homem);
    }

    /**
     * TAREFA: Abre o NOVO modal de "Visualização"
     * (Lê os dados do Firestore e preenche a ficha de leitura)
     */
    async function openAnamneseVisualizarModal() {
        if (!anamneseVisualizarModal || !currentUser) return;

        console.log("Abrindo modal de VISUALIZAÇÃO de anamnese...");

        try {
            // 1. Busca os dados (mesma lógica do "Editar")
            const anamneseRef = doc(db, 'pacientes', currentUser.uid, 'anamnese', 'principal');
            const docSnap = await getDoc(anamneseRef);

           if (docSnap.exists()) {
            const data = docSnap.data();

            // 2. Preenche o Cabeçalho (com o logo) - LÓGICA ATUALIZADA
            const dataAtualizacao = data.ultimaAtualizacao?.toDate() || new Date();
            const dataFormatada = dataAtualizacao.toLocaleDateString('pt-BR');
            const nomePaciente = currentPatientData.nome || 'Paciente';
            const idPaciente = currentUser.uid.substring(0, 6) + '...';

            if (visNomePacienteHeader) visNomePacienteHeader.textContent = nomePaciente;
            if (visIdPacienteHeader) visIdPacienteHeader.textContent = `ID: ${idPaciente}`;
            if (visNomePacienteBar) visNomePacienteBar.textContent = nomePaciente;
            if (visDataAtualizacaoBar) visDataAtualizacaoBar.textContent = dataFormatada;

            // 3. Preenche todos os 33 campos de leitura (Função auxiliar não muda)
            populateAnamneseViewModal(data);

            // 4. Abre o modal
            openModal(anamneseVisualizarModal);

            } else {
                // Se não existir, avisa o usuário (embora ele nem devesse conseguir clicar neste botão)
                alert("Erro: Anamnese não encontrada. Por favor, preencha primeiro.");
            }

        } catch (error) {
            console.error("Erro ao carregar dados da anamnese para o modal de visualização:", error);
            alert("Erro ao carregar seus dados. Tente novamente.");
        }
    }

    // ==========================================================
    // COLE ESTAS DUAS FUNÇÕES NOVAS (Fim)
    // ==========================================================

 //NOVA FUNÇÃO (Auxiliar): Quebra "10/11/2025 09:00" em data e hora.
function splitDateTime(dateTimeString) {
    const parts = dateTimeString.split(' ');
    const date = parts[0] || 'N/D';
    const time = parts[1] || 'N/D';
    return { date, time };
}

/**
 * ATUALIZADO (Passo 3.5.D / v2): Desenha a lista de laboratórios
 * (Agora guarda 'data-lab-id' e 'data-lab-preco' no card)
 */
function gerarListaLaboratoriosHTML(searchTerm = "") {
  if (!listaLaboratoriosMock || !mockLaboratorios) {
    console.error("Erro: Lista de laboratórios não encontrada.");
    return;
  }
  const termo = searchTerm.toLowerCase();

  const laboratoriosFiltrados = mockLaboratorios.filter(lab => {
    const nomeMatch = lab.nome.toLowerCase().includes(termo);
    const exameMatch = lab.examesQueFaz.some(exame =>
      exame.toLowerCase().includes(termo)
    );
    return nomeMatch || exameMatch;
  });

  listaLaboratoriosMock.innerHTML = '';

  if (laboratoriosFiltrados.length === 0) {
    listaLaboratoriosMock.innerHTML = `<p class="placeholder" style="padding: 20px 0;">Nenhum laboratório encontrado para "${searchTerm}".</p>`;
    return;
  }

  laboratoriosFiltrados.forEach(lab => {
    const horariosHtml = lab.datasDisponiveis.map(horarioStringCompleto => { // Ex: "10/11/2025 10:00"
      try {
        const [data, hora] = horarioStringCompleto.split(' '); // ["10/11/2025", "10:00"]
        const dataSimples = data.split('/').slice(0, 2).join('/'); // "10/11"
        const horarioParaSalvar = `${dataSimples} às ${hora}`; // Ex: "10/11 às 10:00"

        return `<button type="button" class="horario-btn-v2" data-horario-selecionado="${horarioParaSalvar}">
          <span class="horario-data">${dataSimples}</span>
          <span class="horario-hora">${hora}</span>
        </button>`;
      } catch (e) { return ""; }
    }).join('');

    // **A CORREÇÃO ESTÁ AQUI**
    // Guardamos o ID, Nome e Preço no próprio card do laboratório
    const cardLabHtml = `
    <div class="laboratorio-card" 
         data-lab-id="${lab.id}" 
         data-lab-nome="${lab.nome}"
         data-lab-preco="${lab.preco}">
      <h4>${lab.nome}</h4>
      <p><i class="fa-solid fa-location-dot"></i> ${lab.endereco}</p>
      <div class="horarios-grid">
        ${horariosHtml}
      </div>
    </div>
    `;
    listaLaboratoriosMock.insertAdjacentHTML('beforeend', cardLabHtml);
  });
}
    // ==========================================================
    // COLE ESTA NOVA FUNÇÃO (Início)
    // ==========================================================

    /**
     * TAREFA: Nova função para calcular a % de preenchimento
     * (Verifica quantos campos dos 33 totais foram preenchidos)
     */
    function calculateAnamneseProgress(data) {
        if (!data) return 0;

        // Lista de todos os campos que definimos no modal
        const allFields = [
            'doencas', 'hospitalizacao', 'cirurgias', 'alergias', 'transfusoes', 'medicamentos_uso',
            'fam_hipertensao', 'fam_diabetes', 'fam_cancer', 'fam_cardiacas', 'fam_mentais', 'fam_outras',
            'hab_humor', 'hab_estresse', 'hab_sono_rotina', 'hab_apoio', 'hab_alcool', 'hab_drogas', 'hab_fumo', 'hab_alimentacao', 'hab_atividade', 'hab_suplementos',
            'sis_digestivo', 'sis_urinario', 'sis_cardio', 'sis_respiratorio', 'sis_musculo', 'sis_neuro', 'sis_endocrino', 'sis_hemato',
            'exames_vacinas', 'saude_mulher', 'saude_homem'
        ];

        const totalFields = allFields.length; // Total de 33 campos
        let filledFields = 0;

        // Conta quantos campos têm algum valor
        allFields.forEach(fieldKey => {
            if (data[fieldKey] && data[fieldKey].trim() !== '') {
                filledFields++;
            }
        });

        if (totalFields === 0) return 100; // Evita divisão por zero

        // Calcula a percentagem
        const percentage = Math.round((filledFields / totalFields) * 100);
        return percentage;
    }

    // ==========================================================
    // COLE ESTA NOVA FUNÇÃO (Fim)
    // ==========================================================
    

    // --- NOVO LISTENER: AÇÕES NA ABA ENCAMINHAMENTOS ---
  
  if (encaminhamentosListContainer) {
      encaminhamentosListContainer.addEventListener('click', (e) => {
          // 1. Encontra o botão clicado (mesmo que cliques no ícone)
          const button = e.target.closest('button'); 
          
          // Se não clicou num botão, ignora
          if (!button) return;

          const action = button.dataset.action;
          const encId = button.dataset.encId;

          // Se não tiver ID, ignora
          if (!encId) return;

          // --- AÇÃO 1: GERAR PDF ---
          if (action === 'gerar-pdf-encaminhamento') {
              e.preventDefault();
              console.log(`Botão PDF clicado para Encaminhamento ID: ${encId}`);
              gerarPDFEncaminhamento(encId); // <--- Chama a função que criámos
          }

          // --- AÇÃO 2: APAGAR ---
          if (action === 'apagar-enc') {
              e.preventDefault();
              handleDeleteEncaminhamento(encId);
          }

          // --- AÇÃO 3: AGENDAR (Opcional) ---
          if (action === 'agendar-consulta-enc') {
              e.preventDefault();
              alert("A funcionalidade de agendar a partir do encaminhamento será implementada em breve.");
          }
      });
  }
    


    // ==========================================================
    // --- 9. INICIALIZAÇÃO DOS LISTENERS DE EVENTOS ---
    // (Esta é a função que estava a causar o erro)
    // ==========================================================

    /** Liga todos os botões da página */
    function addEventListeners() {
        
        // --- Navegação de Abas (Desktop) ---
        if (tabNav) {
            tabNav.addEventListener('click', (e) => {
                const tabBtn = e.target.closest('.tab-btn');
                if (tabBtn) {
                    switchTab(tabBtn.dataset.tab);
                }
            });
        }

        // --- Navegação (Mobile Menu) ---
        if (hamburgerMenu) hamburgerMenu.addEventListener('click', openMobileMenu);
        if (closeMobileMenuButton) closeMobileMenuButton.addEventListener('click', closeMobileMenu);
        if (backdrop) backdrop.addEventListener('click', closeMobileMenu);
        
        if (mobileNavListContainer) {
            mobileNavListContainer.addEventListener('click', (e) => {
                const navLink = e.target.closest('.mobile-nav-link');
                if (navLink) {
                    e.preventDefault();
                    switchTab(navLink.dataset.tab);
                    closeMobileMenu();
                }
            });
        }

        // --- Listeners da Aba Receitas ---
        const recipeSearchInput = document.getElementById('recipe-search-input');
        const recipeFilterGroup = document.getElementById('recipe-filter-group');
        const btnAbrirUploadReceita = document.getElementById('btn-abrir-upload-receita');

        // --- Listeners da Aba Receitas ---
        if (recipeSearchInput) {
            // ATUALIZADO: Chama a função de filtro a cada tecla digitada
            recipeSearchInput.addEventListener('input', applyRecipeFilters);
        }

        if (recipeFilterGroup) {
            // ATUALIZADO: Adiciona a lógica de clique
            recipeFilterGroup.addEventListener('click', (e) => {
                // Verifica se o clique foi num botão de filtro
                if (e.target.classList.contains('filter-btn-small')) {
                    // Remove 'active' do botão antigo
                    recipeFilterGroup.querySelector('.active')?.classList.remove('active');
                    // Adiciona 'active' ao botão clicado
                    e.target.classList.add('active');
                    
                    // Chama a função de filtro
                    applyRecipeFilters();
                }
            });
        }

        // Listener para o botão "+ Adicionar Receita" (Abre o modal)
        if (btnAbrirUploadReceita) {
            btnAbrirUploadReceita.addEventListener('click', () => {
                console.log("Botão + Adicionar Receita clicado.");
                
                // Limpa o formulário antes de abrir
                if (formUploadReceita) {
                    formUploadReceita.reset();
                }
                
                // Abre o modal (usando a nossa função auxiliar)
                openModal(uploadReceitaModal);
            });
        }
        
        // Listener para o "X"
        if (closeUploadReceitaModalBtn) {
            closeUploadReceitaModalBtn.addEventListener('click', () => {
                closeModal(uploadReceitaModal);
            });
        }

        // Listener para o "Cancelar" (O que estava a falhar)
        if (cancelUploadReceitaBtn) {
            cancelUploadReceitaBtn.addEventListener('click', () => {
                closeModal(uploadReceitaModal);
            });
        }


        // Listeners para FECHAR o modal de upload de receita
        if (closeUploadReceitaModalBtn) {
            closeUploadReceitaModalBtn.addEventListener('click', () => {
                closeModal(uploadReceitaModal);
            });
        }

        if (cancelUploadReceitaBtn) {
            cancelUploadReceitaBtn.addEventListener('click', () => {
                // Usamos a mesma função, pois o resultado é o mesmo
                closeModal(uploadReceitaModal);
            });
        }

        // Listener para SALVAR o formulário de upload de receita
        // Listener para SALVAR o formulário (VERSÃO FINAL HÍBRIDA + STATUS)
        if (formUploadReceita) {
            formUploadReceita.addEventListener('submit', async (e) => {
                e.preventDefault(); 
                
                if (!currentUser) {
                    alert("Erro: Utilizador não encontrado. Por favor, faça login novamente.");
                    return;
                }

                
                // --- INÍCIO DA NOSSA NOVA LÓGICA DE CAPITALIZAÇÃO ---
                const medNomeInput = document.getElementById('upload-medicamento-nome').value;
                const medicamentoNome = medNomeInput.charAt(0).toUpperCase() + medNomeInput.slice(1).toLowerCase();
                // --- FIM DA NOVA LÓGICA ---

                // 1. Pega os dados do formulário
                const medicoNome = document.getElementById('upload-medico-nome').value || "Médico não informado";
                const fileInput = document.getElementById('upload-receita-file'); 
                const file = fileInput.files[0]; 
                
                // --- A NOSSA NOVA LÓGICA DO PASSO 3 ESTÁ AQUI ---
                // Lê o valor do botão de rádio que está selecionado
                const statusSelecionado = document.querySelector('input[name="upload-status"]:checked').value || "Ativa";
                // --- FIM DA NOVA LÓGICA ---

                // 2. Validação simples
                if (!file) {
                    alert("Por favor, selecione um ficheiro (PDF ou imagem) para carregar.");
                    return;
                }
                
                if (file.size > 40 * 1024 * 1024) { // 40MB
                    alert("Erro: O ficheiro é muito grande. O tamanho máximo é 40MB.");
                    return;
                }

                // 3. Desativa o botão e mostra "Salvando..."
                if (salvarUploadReceitaBtn) {
                    salvarUploadReceitaBtn.disabled = true;
                    salvarUploadReceitaBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
                }

                try {
                    // 4. Cria um "nome" único para o ficheiro no Storage
                    const filePath = `pacientes/${currentUser.uid}/receitasExternas/${Date.now()}_${file.name}`;
                    const storageRef = ref(getStorage(app), filePath); 

                    // 5. Faz o upload do ficheiro
                    await uploadBytes(storageRef, file); 

                    // 6. Pega o URL de download do ficheiro
                    const fileURL = await getDownloadURL(storageRef); 

                    // 7. Prepara os dados para o Firestore
                    const receitaData = {
                        medicamento: medicamentoNome,
                        medico: medicoNome,
                        
                        // --- AQUI USAMOS A VARIÁVEL DO PASSO 3 ---
                        status: statusSelecionado, // Em vez de 'Ativa'
                        // --- FIM DA MUDANÇA ---

                        timestamp: serverTimestamp(), 
                        origem: 'paciente', 
                        fileURL: fileURL, 
                        
                        dosagem: null,
                        frequencia: null,
                        duracao: null
                    };

                    // 8. Salva no Firestore
                    const receitasRef = collection(db, 'pacientes', currentUser.uid, 'receitas');
                    await addDoc(receitasRef, receitaData);
                    
                    console.log(`Receita salva no Firestore com status: ${statusSelecionado}`);
                    
                    // 9. Chama a função de sucesso (Passo 5 anterior)
                    handleUploadSuccess(); 

                } catch (error) {
                    console.error("Erro ao salvar receita externa:", error);
                    alert(`Ocorreu um erro ao salvar a sua receita. Por favor, tente novamente.\n\nErro: ${error.message}`);
                    
                    // Reativa o botão em caso de erro
                    if (salvarUploadReceitaBtn) {
                        salvarUploadReceitaBtn.disabled = false;
                        salvarUploadReceitaBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Receita';
                    }
                }
            });
        }
        // --- Listeners da Aba Exames ---
        const exameSearchInput = document.getElementById('exame-search-input');
        const btnAbrirUploadExame = document.getElementById('btn-abrir-upload-exame');

        // --- Listeners da Aba Exames (AGORA COM A LÓGICA) ---
        if (exameSearchInput) {
            // ATUALIZADO: Chama a função de filtro a cada tecla digitada
            exameSearchInput.addEventListener('input', applyExameFilters);
        }

        if (exameFilterGroup) {
            // ATUALIZADO: Adiciona a lógica de clique
            exameFilterGroup.addEventListener('click', (e) => {
                // Verifica se o clique foi num botão de filtro
                if (e.target.classList.contains('filter-btn-small')) {
                    // Remove 'active' do botão antigo
                    exameFilterGroup.querySelector('.active')?.classList.remove('active');
                    // Adiciona 'active' ao botão clicado
                    e.target.classList.add('active');
                    
                    // Chama a função de filtro
                    applyExameFilters();
                }
            });
        }

        if (examesListContainer) {
            examesListContainer.addEventListener('click', (e) => {
                // 1. Descobre qual botão (com a classe .btn-pdf ou .btn-card-primary-exame) foi clicado
                const button = e.target.closest('.btn-pdf, .btn-card-primary-exame');
                if (!button) return; // Sai se o clique não foi num botão de ação

                // 2. Descobre qual a ação (data-action) e qual o card (data-exame-id)
                const action = button.dataset.action; // Ex: 'gerar-pdf-exame', 'agendar-exame', 'apagar-exame'
                const card = button.closest('.exame-card');
                const exameId = card ? card.dataset.exameId : null;

                if (!exameId) return; // Sai se não encontrou o ID

                // 3. Decide o que fazer com base na ação
                switch (action) {
                    case 'gerar-pdf-exame':
                        const exameId = button.dataset.exameId; // Pega o ID do botão clicado
                        console.log("Gerando PDF para o exame ID:", exameId);
                        gerarPDFExame(exameId); // Chama a função nova!
                        break;
                    
                    case 'agendar-exame':
                        console.log(`Ação: Agendar Exame ID: ${exameId}`);
                        
                        // Chama a nossa nova função "cérebro" para abrir o modal
                        handleAbrirModalAgendamento(exameId);
                        break;

                    
                }
            });
        }


        // --- NOVO (Passo 8.1): Listener para Ações nos Cards de Encaminhamento ---
  const encaminhamentosListContainer = document.getElementById('encaminhamentos-lista');

  if (encaminhamentosListContainer) {
    encaminhamentosListContainer.addEventListener('click', async (e) => {
      const button = e.target.closest('[data-action]');
      if (!button) return;

      e.preventDefault(); 
      
      const action = button.dataset.action;
      const card = button.closest('.recipe-card');
      const encId = card ? card.dataset.encId : null;
      
      if (!encId) return;

      // Encontra os dados completos do encaminhamento
      const encData = allEncaminhamentos.find(enc => enc.id === encId);
      if (!encData) {
        alert("Erro: Dados do encaminhamento não encontrados.");
        return;
      }

      switch (action) {
        // [NOVO CÓDIGO - SUBSTITUIÇÃO]
        case 'gerar-pdf-enc':
            console.log(`Ação: Gerar PDF para Encaminhamento ID: ${encId}`);
            // Chama a nossa nova função "Cérebro"
            handleGerarPdfEncaminhamento(encData);
            break;
          
          if (encData.fileURL) {
            // Se o paciente subiu um ficheiro, apenas abrimos o ficheiro (PDF/Imagem)
            window.open(encData.fileURL, '_blank');
          } else {
            // Se não subiu (foi gerado pelo médico ou só digitado), damos o alerta
            alert("Gerando PDF do Pedido de Encaminhamento (Simulação).");
            // No futuro: Chamar função real de geração de PDF
          }
          break;

        case 'apagar-enc':
          console.log(`Ação: Apagar Encaminhamento ID: ${encId}`);
          
          // REGRAS DE NEGÓCIO: Só apaga se for do paciente (origem: 'paciente')
          if (encData.origem !== 'paciente') {
            alert("Não é possível apagar um encaminhamento solicitado por um profissional.");
            return;
          }

          if (confirm("Tem certeza que deseja apagar este encaminhamento? Esta ação não pode ser desfeita.")) {
            showLoading(true); 
            try {
              // 1. Apaga do Firestore
              const docRef = doc(db, 'pacientes', currentUser.uid, 'encaminhamentos', encId);
              await deleteDoc(docRef);

              // 2. Apaga do Storage (Se o ficheiro existir)
              if (encData.fileURL) {
                const storageRef = ref(getStorage(app), encData.fileURL);
                await deleteObject(storageRef);
              }

              alert("Encaminhamento apagado com sucesso!");
              loadEncaminhamentos(true); // Força o recarregamento

            } catch (error) {
              console.error("Erro ao apagar o encaminhamento:", error);
              alert("Ocorreu um erro ao apagar. Verifique as suas regras do Storage/Firestore.");
            } finally {
              showLoading(false); 
            }
          }
          break;
        
        case 'agendar-consulta':
            alert(`Função Agendar Consulta para ${encData.especialidade} (Não implementado).`);
            break;
      }
    });
  }

        // --- NOVO (Passo 5.3): Listener "Inteligente" para Ações nos Cards de Exame (Apagar, Agendar, etc.) ---
  if (examesListContainer) {
    examesListContainer.addEventListener('click', async (e) => {
      // 1. Descobre qual botão (com data-action) foi clicado
      const button = e.target.closest('[data-action]');
      
      // Sai se o clique não foi num botão de ação (ou se for um link de PDF que já funciona)
      if (!button || button.dataset.action === 'ver-pdf-link') {
        return;
      }

      // Impede a ação padrão (caso seja um link <a>)
      e.preventDefault(); 

      // 2. Descobre qual a ação e qual o card
      const action = button.dataset.action;
      const card = button.closest('.exame-card');
      const exameId = card ? card.dataset.exameId : null;

      if (!exameId) return; // Sai se não encontrou o ID

      // 3. Encontra os dados completos do exame na nossa variável global
      const exameData = allExames.find(ex => ex.id === exameId);
      if (!exameData) {
        alert("Erro: Não foi possível encontrar os dados deste exame.");
        return;
      }

      // 4. Decide o que fazer com base na ação
      switch (action) {
        case 'agendar-exame':
          console.log(`Ação: Agendar Exame para ID: ${exameId}`);
          // Chama a função que já temos para abrir o modal de agendamento
          handleAbrirModalAgendamento(exameId);
          break;

        case 'apagar-exame':
          console.log(`Ação: Apagar Exame ID: ${exameId}`);
          
          // A TUA REGRA DE NEGÓCIO: Só apaga se for 'paciente'
          if (exameData.origem !== 'paciente') {
            alert("Não é possível apagar um exame solicitado por um profissional.");
            return;
          }

          if (confirm("Tem certeza que deseja apagar este exame? Esta ação não pode ser desfeita.")) {
            showLoading(true); // Mostra o spinner
            try {
              // Apaga o documento do Firestore
              console.log(`Apagando do Firestore: pacientes/${currentUser.uid}/exames/${exameId}`);
              const docRef = doc(db, 'pacientes', currentUser.uid, 'exames', exameId);
              await deleteDoc(docRef);

              // Se tiver um ficheiro no Storage, apaga-o também
              if (exameData.fileURL) {
                console.log("Exame tem um fileURL. A apagar do Storage...");
                const storageRef = ref(getStorage(app), exameData.fileURL);
                await deleteObject(storageRef);
                console.log("Ficheiro apagado do Storage com sucesso.");
              }

              alert("Exame apagado com sucesso!");
              
              // Força o recarregamento da lista de exames
              loadExames(true); 

            } catch (error) {
              console.error("Erro ao apagar o exame:", error);
              alert("Ocorreu um erro ao apagar o exame. Tente novamente.");
            } finally {
              showLoading(false); // Esconde o spinner
            }
          }
          break;
      }
    });
  }

        if (closeUploadExameModalBtn) {
            closeUploadExameModalBtn.addEventListener('click', () => {
                closeModal(uploadExameModal);
            });
        }
        if (cancelUploadExameBtn) {
            cancelUploadExameBtn.addEventListener('click', () => {
                closeModal(uploadExameModal);
            });
        }

       if (btnAbrirUploadExame) {
            btnAbrirUploadExame.addEventListener('click', () => {
                console.log("Botão + Adicionar Exame clicado.");
                
                // Limpa o formulário antes de abrir
                if (formUploadExame) {
                    formUploadExame.reset();
                }

                // Pré-seleciona a data de hoje (opcional, mas boa UX)
                const dataInput = document.getElementById('upload-exame-data');
                if (dataInput) {
                    dataInput.value = new Date().toISOString().split('T')[0];
                }

                // Pré-seleciona o status "Realizado"
                const statusInput = document.getElementById('exame-status-realizado');
                if (statusInput) {
                    statusInput.checked = true;
                }
                
                // Abre o modal
                openModal(uploadExameModal);
            });
        }
        
        // TODO: Adicionar listeners para os botões dentro dos cards (Apagar, Partilhar, etc.)
    }
            // --- FIM DA SUBSTITUIÇÃO ---


    if (formUploadExame) {
            formUploadExame.addEventListener('submit', async (e) => {
                e.preventDefault(); // Impede o recarregamento da página
                
                if (!currentUser) {
                    alert("Erro: Utilizador não encontrado. Por favor, faça login novamente.");
                    return;
                }

                // 1. Pega os dados do formulário
                const nomeExame = document.getElementById('upload-exame-nome').value;
                const laboratorio = document.getElementById('upload-exame-laboratorio').value || "Não informado";
                const dataColeta = document.getElementById('upload-exame-data').value;
                
                // Lê o Status (Agendado, Realizado, Pendente)
                const statusSelecionado = document.querySelector('input[name="upload-exame-status"]:checked').value || "Realizado";
                
                const fileInput = document.getElementById('upload-exame-ficheiro');
                const file = fileInput.files[0]; // O ficheiro PDF/Imagem

                // 2. Validação
                // Se o status for "Realizado", o ficheiro é obrigatório
                if (statusSelecionado === 'Realizado' && !file) {
                    alert("Por favor, anexe o ficheiro (PDF ou imagem) do resultado do exame.");
                    return;
                }
                
                // 3. Desativa o botão e mostra "Salvando..."
                if (salvarUploadExameBtn) {
                    salvarUploadExameBtn.disabled = true;
                    salvarUploadExameBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
                }

                let fileURL = null; // Inicia o URL do ficheiro como nulo

                try {
                    // 4. Se o paciente anexou um ficheiro, faz o upload
                    if (file) {
                        console.log("Ficheiro encontrado. Fazendo upload para o Storage...");
                        const filePath = `pacientes/${currentUser.uid}/examesExternos/${Date.now()}_${file.name}`;
                        const storageRef = ref(getStorage(app), filePath);

                        await uploadBytes(storageRef, file);
                        fileURL = await getDownloadURL(storageRef); // Pega o URL
                        console.log(`Ficheiro do exame guardado. URL: ${fileURL}`);
                    }

                    // 5. Prepara os dados para o Firestore
                    const exameData = {
                        titulo: nomeExame,
                        laboratorio: laboratorio,
                        dataColeta: dataColeta,
                        status: statusSelecionado,
                        fileURL: fileURL, // Será 'null' se nenhum ficheiro foi enviado (ex: "Agendado")
                        origem: 'paciente', // ESSENCIAL para a nossa regra do Passo 4
                        solicitadoPor: "Paciente (Externo)", // Define a origem
                        resultado: "Ver PDF" // Um placeholder
                    };

                    // 6. Salva no Firestore
                    const examesRef = collection(db, 'pacientes', currentUser.uid, 'exames');
                    await addDoc(examesRef, exameData);
                    
                    console.log("Informações do exame salvas no Firestore.");
                    
                    // 7. Feedback de Sucesso e Atualização da Tela
                    alert("Exame adicionado com sucesso!");
                    closeModal(uploadExameModal);
                    loadExames(true); // O 'true' força o recarregamento da lista de exames

                } catch (error) {
                    console.error("Erro ao salvar exame externo:", error);
                    alert(`Ocorreu um erro ao salvar o seu exame. Por favor, tente novamente.\n\nErro: ${error.message}`);
                } finally {
                    // Reativa o botão em qualquer caso (sucesso ou erro)
                    if (salvarUploadExameBtn) {
                        salvarUploadExameBtn.disabled = false;
                        salvarUploadExameBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Exame';
                    }
                }
            });
        }
        // --- FIM DO NOVO BLOCO ---
        

//------------------------------------------------------------------------------------------------------------
        // Listeners para FECHAR o novo modal de Agendar Exame
        if (closeAgendarExameModalBtn) {
            closeAgendarExameModalBtn.addEventListener('click', () => {
                closeModal(agendarExameModal);
            });
        }
        if (cancelAgendarExameBtn) {
            cancelAgendarExameBtn.addEventListener('click', () => {
                closeModal(agendarExameModal);
            });
        }
        // --- FIM DO NOVO BLOCO ---
        const labSearchInput = document.getElementById('lab-search-input');
        if (labSearchInput) {
            labSearchInput.addEventListener('input', (e) => {
                // Chama a função "desenhadora" passando o texto digitado
                gerarListaLaboratoriosHTML(e.target.value);
            });
        }

//-----------------------------------------------------------------------------------------------------------

// --- NOVO (Passo 3.4): Listener para cliques nos Horários ---
  if (listaLaboratoriosMock) {
    listaLaboratoriosMock.addEventListener('click', (e) => {
      // Encontra o botão de horário que foi clicado
      const horarioBtn = e.target.closest('.horario-btn-v2');

      // Sai da função se o clique não foi num botão de horário
      if (!horarioBtn) return;

      console.log("Horário clicado:", horarioBtn.dataset.datetime);

      // 1. Remove a seleção de todos os outros botões
      listaLaboratoriosMock.querySelectorAll('.horario-btn-v2').forEach(btn => {
        btn.classList.remove('selected');
      });

      // 2. Adiciona a classe 'selected' (que criámos no CSS) ao botão clicado
      horarioBtn.classList.add('selected');

      // 3. Ativa o botão "Confirmar Agendamento"
      if (salvarAgendamentoExameBtn) {
        salvarAgendamentoExameBtn.disabled = false;
        // O CSS que fizemos no Passo 2.3 fará ele ficar azul
      }
    });
  }
//--------------------------------------------------------------------------------------------------------

// --- ATUALIZADO (Passo 3.5.E - v5 FINAL): Listener "Confirmar Agendamento" (Lê Horário e Preço) ---
  if (salvarAgendamentoExameBtn) {
    salvarAgendamentoExameBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("Botão 'Confirmar Agendamento' clicado.");

      // 1. Verifica qual horário está selecionado
      const horarioSelecionado = listaLaboratoriosMock.querySelector('.horario-btn-v2.selected');
      const labCard = horarioSelecionado?.closest('.laboratorio-card');
      
      if (!horarioSelecionado || !labCard) {
        alert("Erro: Nenhum horário selecionado.");
        return;
      }

      // 2. Pega os dados PARA o resumo (lendo do data-)
      const labNome = labCard.dataset.labNome;
      const horarioTexto = horarioSelecionado.dataset.horarioSelecionado;
      const labPreco = parseFloat(labCard.dataset.labPreco); // Lê o preço como número

      let precoFormatado = "R$ --,--";
      if (labPreco) {
        precoFormatado = labPreco.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      }
      
      // Log de depuração
      console.log("Lab:", labNome);
      console.log("Horário:", horarioTexto);
      console.log("Preço:", precoFormatado);

      // 3. Preenche o NOVO modal de PIX
      // (Primeiro, adiciona o seletor pixResumoPreco se ainda não o fizeste)
      const pixResumoPreco = document.getElementById('pix-resumo-preco'); 
      
      if (pixResumoLab) pixResumoLab.textContent = labNome;
      if (pixResumoHorario) pixResumoHorario.textContent = horarioTexto;
      if (pixResumoPreco) pixResumoPreco.textContent = precoFormatado; // <-- PREENCHE O PREÇO
      
      // 4. Garante que o modal de PIX está na Etapa 1 (QR Code)
      if (pixStep1QRCode) pixStep1QRCode.classList.remove('hidden');
      if (pixStep2Sucesso) pixStep2Sucesso.classList.add('hidden');

      // 5. Reativa o botão "Simular Confirmação"
      if (simularPagamentoBtn) {
        simularPagamentoBtn.disabled = false;
        simularPagamentoBtn.innerHTML = '<i class="fa-solid fa-check"></i> Simular Confirmação';
      }
      if (cancelPagamentoPixBtn) cancelPagamentoPixBtn.disabled = false;

      // 6. Fecha o modal de agendamento
      closeModal(agendarExameModal);
      
      // 7. Abre o novo modal de pagamento PIX
      openModal(pagamentoPixModal);
    });
  }
//---------------------------------------------------------------------------------------------------------

// --- NOVO (Passo 3.5.F): Listeners para Fechar o Modal de Pagamento PIX ---

  // Botão "X" no cabeçalho do modal
  if (closePagamentoPixModalBtn) {
    closePagamentoPixModalBtn.addEventListener('click', () => {
      closeModal(pagamentoPixModal);
    });
  }

  // Botão "Cancelar" no rodapé do modal
  if (cancelPagamentoPixBtn) {
    cancelPagamentoPixBtn.addEventListener('click', () => {
      closeModal(pagamentoPixModal);
    });
  }


//-------------------------------------------------------------------------------------------------------

// --- NOVO (Passo 3.6): Listener do botão "Simular Confirmação" ---
  if (simularPagamentoBtn) {
    simularPagamentoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("Pagamento PIX confirmado (simulação).");

      // 1. Esconde a Etapa 1 (QR Code)
      if (pixStep1QRCode) pixStep1QRCode.classList.add('hidden');
      
      // 2. Mostra a Etapa 2 (Sucesso)
      if (pixStep2Sucesso) pixStep2Sucesso.classList.remove('hidden');

      // 3. Desativa os botões do rodapé (embora o rodapé vá sumir)
      if (simularPagamentoBtn) simularPagamentoBtn.disabled = true;
      if (cancelPagamentoPixBtn) cancelPagamentoPixBtn.disabled = true;
      
      // 4. Fecha o modal de pagamento automaticamente após 2.5 segundos
      setTimeout(() => {
        closeModal(pagamentoPixModal);
        
        // Força o recarregamento da aba Exames para mostrar o novo status "Agendado"
        // (Esta função já existe e é usada pela lógica de upload)
        if (typeof loadExames === 'function') {
          loadExames(true); // O 'true' força a busca de dados
        }
      }, 2500); // 2.5 segundos para o usuário ler a mensagem
    });
  }

//---------------------------------------------------------------------------------------------------------

    // ... (O seu código da função handleUploadSuccess() fica aqui em cima) ...
        function handleUploadSuccess() {
            // ... (o seu código) ...
        }

        // --- COLE O NOVO BLOCO DE CÓDIGO AQUI ---
        /**
         * PASSO 2 (BOTÕES DO CARD): Listener "inteligente" no container das receitas.
         * Este único listener vai gerir todos os cliques em "Gerar PDF", "Compartilhar", etc.
         */
        if (recipeListContainer) {
            recipeListContainer.addEventListener('click', (e) => {
                // 1. Descobre qual botão (com a classe .btn-pdf) foi clicado
                const button = e.target.closest('.btn-pdf');
                if (!button) return; // Sai se o clique não foi num botão de ação

                // 2. Descobre qual a ação (data-action) e qual o card (data-recipe-id)
                const action = button.dataset.action; // Ex: 'gerar-pdf', 'compartilhar', 'apagar'
                const card = button.closest('.recipe-card');
                const recipeId = card ? card.dataset.recipeId : null;

                if (!recipeId) return; // Sai se não encontrou o ID da receita

                // 3. Decide o que fazer com base na ação
                switch (action) {
                    case 'gerar-pdf':
                        console.log(`Ação: Gerar PDF para a receita ID: ${recipeId}`);
                        // Chama a nossa nova função "cérebro"
                        handleGerarPdf(recipeId);
                        break;
                    
                    
                    case 'lembrete':
                        console.log(`Ação: Lembrete receita ID: ${recipeId}`);
                        
                        // 1. Encontra os dados da receita na nossa memória
                        const receitaParaLembrete = allRecipes.find(r => r.id.toString() === recipeId.toString());
                        if (!receitaParaLembrete) {
                            alert("Erro: Não foi possível encontrar os dados desta receita.");
                            return;
                        }

                        // 2. Limpa o formulário do modal
                        if (formLembrete) {
                            formLembrete.reset();
                        }
                        
                        // 3. Pré-preenche o nome do medicamento no formulário do modal
                        const nomeInput = document.getElementById('lembrete-nome-0');
                        if (nomeInput) {
                            // Coloca o nome do remédio do card (ex: "Losartana 50mg")
                            nomeInput.value = receitaParaLembrete.medicamento || ''; 
                        }
                        
                        // 4. Pré-preenche a data de início como "hoje"
                        const dataInput = document.getElementById('lembrete-inicio-0');
                        if (dataInput) {
                            dataInput.value = new Date().toISOString().split('T')[0];
                        }
                        
                        // 5. Guarda o ID da receita no formulário (para sabermos qual é no Passo 5)
                        if (formLembrete) {
                            formLembrete.dataset.recipeId = recipeId; 
                        }

                        // 6. Abre o modal de lembretes
                        openModal(lembreteModal);
                        break;


                    
                    case 'apagar':
                        console.log(`Ação: Apagar receita ID: ${recipeId}`);
                        // Chama a nossa nova função "cérebro" para apagar
                        handleApagarReceita(recipeId);
                        break;
                }
            });
        }

        
    function handleUploadSuccess() {
                // 1. Reativa o botão e fecha o modal
                if (salvarUploadReceitaBtn) {
                    salvarUploadReceitaBtn.disabled = false;
                    salvarUploadReceitaBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Receita';
                }
                closeModal(uploadReceitaModal);
                
                alert("Receita adicionada com sucesso!");

                // 2. Atualiza a lista na tela
                // Força a função 'loadReceitas' a buscar os dados novamente do Firestore
                // (incluindo o novo item) e a redesenhar a lista.
                console.log("Forçando recarregamento das receitas para mostrar o novo item...");
                loadReceitas(true); // O 'true' força o recarregamento
            }
            // --- FIM DO NOVO BLOCO ---

            async function handleApagarReceita(recipeId) {
            if (!currentUser || !recipeId) return;

            // 1. Encontra a receita na nossa lista da memória (allRecipes)
            const receitaParaApagar = allRecipes.find(r => r.id.toString() === recipeId.toString());
            
            if (!receitaParaApagar) {
                alert("Erro: Não foi possível encontrar a receita para apagar.");
                return;
            }

            // 2. Pede confirmação
            const confirmou = confirm(`Tem a certeza que quer apagar a receita "${receitaParaApagar.medicamento}" permanentemente?`);
            if (!confirmou) {
                return; // Utilizador cancelou
            }

            // Mostra o loading
            showLoading(true);

            try {
                // 3. Apaga o documento do Firestore
                console.log(`Apagando do Firestore: pacientes/${currentUser.uid}/receitas/${recipeId}`);
                const docRef = doc(db, 'pacientes', currentUser.uid, 'receitas', recipeId);
                await deleteDoc(docRef); // <--- Ferramenta do Passo 2.2

                // 4. Verifica se há um ficheiro no Storage para apagar
                if (receitaParaApagar.fileURL) {
                    console.log("Receita tem um fileURL. A apagar do Storage...");
                    // recria a referência do ficheiro a partir do URL
                    const storageRef = ref(getStorage(app), receitaParaApagar.fileURL); 
                    await deleteObject(storageRef); // <--- Ferramenta do Passo 2.1
                    console.log("Ficheiro apagado do Storage com sucesso.");
                }

                // 5. Atualiza a lista na memória (remove o item)
                allRecipes = allRecipes.filter(r => r.id.toString() !== recipeId.toString());

                // 6. Atualiza a tela (redesenha os cards)
                applyRecipeFilters();
                
                alert("Receita apagada com sucesso!");

            } catch (error) {
                console.error("Erro ao apagar a receita:", error);
                // Trata um erro comum do Storage (se o ficheiro já não existir)
                if (error.code === 'storage/object-not-found') {
                    console.warn("Os dados do Firestore foram apagados, mas o ficheiro no Storage não foi encontrado (provavelmente já tinha sido apagado).");
                    // Ainda assim atualiza a tela
                    allRecipes = allRecipes.filter(r => r.id.toString() !== recipeId.toString());
                    applyRecipeFilters();
                    alert("Receita apagada com sucesso (ficheiro não encontrado no storage).");
                } else {
                    alert(`Ocorreu um erro ao apagar a receita. Tente novamente.\n\nErro: ${error.message}`);
                }
            } finally {
                // Desliga o loading
                showLoading(false);
            }
        }
        // --- FIM DO NOVO BLOCO ---


        



        // --- COLE O NOVO BLOCO DE CÓDIGO AQUI (PASSO 3.2) ---
        // Listeners para FECHAR o novo modal de Lembretes
        if (closeLembreteModalBtn) {
            closeLembreteModalBtn.addEventListener('click', () => {
                closeModal(lembreteModal);
            });
        }

        if (cancelLembreteBtn) {
            cancelLembreteBtn.addEventListener('click', () => {
                closeModal(lembreteModal);
            });
        }

        const intervaloSelectOriginal = document.getElementById('lembrete-intervalo-0');
        if (intervaloSelectOriginal) {
            intervaloSelectOriginal.addEventListener('change', handleIntervaloChange);
        }

        
        //* Listener para o dropdown "Frequência" (o original, índice 0)
         //* Chama a nossa nova função 'handleFrequenciaChange'
       
        const frequenciaSelectOriginal = document.getElementById('lembrete-frequencia-0');
        if (frequenciaSelectOriginal) {
            frequenciaSelectOriginal.addEventListener('change', handleFrequenciaChange);
        }

/**
         * Listener para o botão "+ Adicionar medicação no lembrete"
         * CORRIGIDO para clonar os novos dropdowns e ADICIONAR O LISTENER de intervalo
         */
        if (btnAddMedicacaoLembrete) {
            btnAddMedicacaoLembrete.addEventListener('click', () => {
                if (!medicamentosLembreteLista) return;

                // 1. Conta quantos formulários já existem
                const novoIndex = medicamentosLembreteLista.querySelectorAll('.vis-section').length;

                // 2. Encontra o primeiro formulário (o "molde")
                const primeiroFormulario = medicamentosLembreteLista.querySelector('.vis-section[data-medicamento-index="0"]');
                if (!primeiroFormulario) {
                    alert("Erro: Não foi possível encontrar o formulário original para clonar.");
                    return;
                }

                // 3. Clona o "molde"
                const novoFormulario = primeiroFormulario.cloneNode(true);

                // 4. Atualiza o novo index
                novoFormulario.dataset.medicamentoIndex = novoIndex;

                // 5. Atualiza todos os IDs e 'for's para serem únicos
                novoFormulario.querySelectorAll('[id]').forEach(el => {
                    const idAntigo = el.id;
                    // Correção: Atualiza IDs que COMEÇAM com "lembrete-"
                    if (idAntigo.startsWith('lembrete-')) {
                        const novoId = idAntigo.replace('-0', `-${novoIndex}`);
                        el.id = novoId;
                    }
                });
                novoFormulario.querySelectorAll('[for]').forEach(label => {
                    const forAntigo = label.getAttribute('for');
                    // Correção: Atualiza 'for's que COMEÇAM com "lembrete-"
                    if (forAntigo.startsWith('lembrete-')) {
                        const novoFor = forAntigo.replace('-0', `-${novoIndex}`);
                        label.setAttribute('for', novoFor);
                    }
                });

                // 6. Limpa os valores dos inputs E selects clonados
                novoFormulario.querySelectorAll('input').forEach(input => {
                    if (input.type === 'date') {
                        input.value = new Date().toISOString().split('T')[0];
                    } else {
                        input.value = ''; // Limpa nome, duração, etc.
                    }
                });
                novoFormulario.querySelectorAll('select').forEach(select => {
                    select.value = '0'; // Reseta os dropdowns para "Selecione..."
                });
                
                // 7. Limpa o container de horas clonado
                const novoContainerHoras = novoFormulario.querySelector('.lembrete-horarios-container');
                if (novoContainerHoras) {
                    novoContainerHoras.innerHTML = '';
                }

                // 8. --- A "MAGIA" EXTRA ---
                // Adiciona o "ouvinte" ao NOVO dropdown de intervalo clonado
                // Usamos a classe (classe é mais segura que ID dinâmico)
                const novoIntervaloSelect = novoFormulario.querySelector('.lembrete-intervalo-select');
                if (novoIntervaloSelect) {
                    novoIntervaloSelect.addEventListener('change', handleIntervaloChange);
                }
                
                // 9. Adiciona o novo formulário à lista
                medicamentosLembreteLista.appendChild(novoFormulario);
            });
        }
        // --- FIM DO BLOCO 4 ---

        // --- COLE ESTE NOVO BLOCO (PASSO 5 CORRIGIDO) AQUI ---
        /**
         * Listener para o botão "Salvar Lembretes" (VERSÃO CORRIGIDA)
         * Lê os dados dos novos dropdowns e dos campos de hora dinâmicos.
         *///ESTE É O CORRETO
        if (formLembrete) {
            formLembrete.addEventListener('submit', async (e) => {
                e.preventDefault(); 
                if (!currentUser) return;

                if (salvarLembreteBtn) {
                    salvarLembreteBtn.disabled = true;
                    salvarLembreteBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
                }

                const receitaIdBase = formLembrete.dataset.recipeId;
                const formularios = medicamentosLembreteLista.querySelectorAll('.vis-section');
                
                const promessasDeSalvar = [];

                try {
                    // 3. Faz um loop por cada formulário
                    for (const form of formularios) {
                        const index = form.dataset.medicamentoIndex;

                        // 4. Pega os dados de cada formulário
                        const nomeMedicamento = document.getElementById(`lembrete-nome-${index}`).value;
                        const dataInicio = document.getElementById(`lembrete-inicio-${index}`).value;
                        const duracaoDias = document.getElementById(`lembrete-duracao-${index}`).value;
                        
                        // --- INÍCIO DA CORREÇÃO (Lendo os campos corretos) ---
                        const contagemSelect = document.getElementById(`lembrete-contagem-${index}`);
                        const intervaloSelect = document.getElementById(`lembrete-intervalo-${index}`);
                        
                        // A LINHA QUE DAVA O ERRO FOI CORRIGIDA:
                        const horaInicioInput = form.querySelector(`[id^="lembrete-hora-inicio-${index}"]`);
                        
                        // Pegamos os valores (ou '0' ou 'null' se não existirem)
                        const contagem = contagemSelect ? contagemSelect.value : '0';
                        const intervalo = intervaloSelect ? intervaloSelect.value : '0';
                        const horaInicio = horaInicioInput ? horaInicioInput.value : null;

                        // Validação (Obrigatório ter um intervalo E uma hora de início)
                        if (!nomeMedicamento || !dataInicio || intervalo === "0" || !horaInicio) {
                            console.warn(`Formulário ${index} incompleto (nome, data, intervalo ou hora de início em falta), pulando...`);
                            continue;
                        }
                        
                        const horariosArray = [ horaInicio ]; 
                        // --- FIM DA CORREÇÃO ---

                        // 5. Prepara os dados para salvar
                        const lembreteData = {
                            pacienteId: currentUser.uid,
                            receitaId: receitaIdBase || null,
                            medicamento: nomeMedicamento,
                            dataInicio: dataInicio,
                            duracaoEmDias: duracaoDias ? parseInt(duracaoDias) : null,
                            frequenciaContagem: parseInt(contagem), // Ex: 3
                            frequenciaIntervalo: parseInt(intervalo), // Ex: 8
                            horarios: horariosArray, // Ex: ["08:00"]
                            ativo: true,
                            criadoEm: serverTimestamp()
                        };
                        
                        // 6. Adiciona a promessa de salvar ao array
                        console.log("Adicionando lembrete à fila para salvar:", lembreteData);
                        const lembretesRef = collection(db, 'pacientes', currentUser.uid, 'lembretes');
                        promessasDeSalvar.push( addDoc(lembretesRef, lembreteData) );
                    }
                    
                    // 7. Executa todas as promessas de salvar
                    await Promise.all(promessasDeSalvar);

                    // 8. Feedback de Sucesso
                    if (promessasDeSalvar.length > 0) {
                        alert("Lembretes salvos com sucesso!");
                    } else {
                        alert("Nenhum lembrete preenchido foi salvo.");
                    }
                    closeModal(lembreteModal);

                } catch (error) {
                    console.error("Erro ao salvar lembretes:", error);
                    alert(`Ocorreu um erro ao salvar os lembretes. Tente novamente.\n\nErro: ${error.message}`);
                } finally {
                    // Reativa o botão
                    if (salvarLembreteBtn) {
                        salvarLembreteBtn.disabled = false;
                        salvarLembreteBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Lembretes';
                    }
                }
            });
        }
        // --- FIM DO BLOCO 5 ---


// ==========================================================
// --- REVISÃO (Passo 6.3): Listeners da Aba Encaminhamentos ---
// ==========================================================


if (encaminhamentoSearchInput) {
    // 1. LIGA A BUSCA: Chama a função mestra de filtro a cada tecla digitada
    encaminhamentoSearchInput.addEventListener('input', applyEncaminhamentoFilters);
}

// Listener para os botões de filtro (CORRIGIDO)
if (encaminhamentoFilterGroup) {
    // 2. LIGA OS FILTROS: Chama a função mestra de filtro a cada clique
    encaminhamentoFilterGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn-small');
        if (btn) {
            encaminhamentoFilterGroup.querySelectorAll('.filter-btn-small').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Chama a função mestra para re-filtrar
            applyEncaminhamentoFilters(); 
        }
    });
}

// --- Listeners do Modal de Upload de Encaminhamento (Passo 7.2) ---
  if (btnAbrirUploadEncaminhamento) {
    btnAbrirUploadEncaminhamento.addEventListener('click', () => {
      console.log("Botão + Adicionar Encaminhamento clicado.");
      
      // 1. Limpa e preenche a data atual
      if (formUploadEncaminhamento) {
        formUploadEncaminhamento.reset();
        document.getElementById('upload-enc-data').value = new Date().toISOString().split('T')[0];
        if (uploadEncFeedback) uploadEncFeedback.classList.add('hidden');
      }
      
      // 2. Abre o modal
      openModal(uploadEncaminhamentoModal);
    });
  }

  // Listeners para fechar o modal
  if (closeUploadEncModalBtn) closeUploadEncModalBtn.addEventListener('click', () => closeModal(uploadEncaminhamentoModal));
  if (cancelUploadEncBtn) cancelUploadEncBtn.addEventListener('click', () => closeModal(uploadEncaminhamentoModal));
  
  if (uploadEncaminhamentoModal) {
    uploadEncaminhamentoModal.addEventListener('click', (e) => {
      if (e.target === uploadEncaminhamentoModal) closeModal(uploadEncaminhamentoModal);
    });
  }

  // --- ATUALIZADO (Passo 7.6): Listener de Submissão (Com Timeout de Segurança) ---
  if (formUploadEncaminhamento) {
    formUploadEncaminhamento.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) return;

      const saveBtn = document.getElementById('salvar-upload-enc-btn');
      const feedbackEl = document.getElementById('upload-enc-feedback');
      
      feedbackEl.classList.add('hidden');
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
      
      // Defina um timeout de segurança (5 segundos)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout: A operação demorou demasiado tempo.")), 5000);
      });

      // 1. Coleta os dados
      const especialidade = document.getElementById('upload-enc-especialidade').value;
      const motivo = document.getElementById('upload-enc-motivo').value;
      const medico = document.getElementById('upload-enc-medico').value || "Não informado (Externo)";
      const dataIndicacao = document.getElementById('upload-enc-data').value;
      const status = document.querySelector('input[name="upload-enc-status"]:checked').value || 'Pendente';
      
      const fileInput = document.getElementById('upload-enc-ficheiro'); 
      const file = fileInput.files[0];
      
      let fileURL = null;

      try {
        // Corre o upload E o salvamento em paralelo com o timeout de segurança
        await Promise.race([
          (async () => {
            // Validação básica
            if (!especialidade || !dataIndicacao) throw new Error("Especialidade e Data são obrigatórios.");

            // 2. Upload do ficheiro (Se existir)
            if (file) {
              if (file.size > 40 * 1024 * 1024) throw new Error("O ficheiro é muito grande (máx 40MB).");
              
              const filePath = `pacientes/${currentUser.uid}/encaminhamentosExternos/${Date.now()}_${file.name}`;
              const storageRef = ref(getStorage(app), filePath);
              await uploadBytes(storageRef, file);
              fileURL = await getDownloadURL(storageRef);
            }

            // 3. Salva no Firestore
            const encaminhamentoData = {
              especialidade: especialidade,
              motivo: motivo,
              recomendacoes: motivo,
              solicitadoPor: medico,
              data: dataIndicacao,
              status: status,
              origem: 'paciente', 
              fileURL: fileURL, 
              timestamp: serverTimestamp()
            };

            const encRef = collection(db, 'pacientes', currentUser.uid, 'encaminhamentos');
            await addDoc(encRef, encaminhamentoData);
          })(),
          timeoutPromise // O timeout de segurança
        ]);
        
        feedbackEl.textContent = 'Encaminhamento salvo com sucesso!';
        feedbackEl.className = 'feedback-message success';
        feedbackEl.classList.remove('hidden');

        // 4. Fecha e atualiza a tela
        setTimeout(() => {
          closeModal(uploadEncaminhamentoModal);
          loadEncaminhamentos(true); // Recarrega a lista para mostrar o novo item
        }, 1500);

      } catch (error) {
        console.error("Erro ao salvar encaminhamento:", error);
        
        // Se for um erro de Timeout, mostra uma mensagem específica
        const errorMessage = error.message.includes("Timeout") ? "Falha na conexão ou operação de salvamento lenta. Tente novamente." : error.message;

        feedbackEl.textContent = `Erro: ${errorMessage}`;
        feedbackEl.className = 'feedback-message error';
        feedbackEl.classList.remove('hidden');
        
        // Garante que o botão é reativado para que o usuário possa tentar novamente
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Encaminhamento';
      }
    });
  }

  // ==========================================================
// COLE O NOVO BLOCO DE CÓDIGO AQUI (Passo 3.2 - Vacina)
// ==========================================================
// --- Listeners para a nova Aba de Vacinas ---
if (btnAbrirUploadVacina) {
  btnAbrirUploadVacina.addEventListener('click', () => {
    
    console.log("Botão + Adicionar Vacina clicado.");
    
    if (formUploadVacina) {
      formUploadVacina.reset(); // Limpa o formulário
    }
    
    // Limpa qualquer mensagem de feedback antiga
    if (uploadVacinaFeedback) {
        uploadVacinaFeedback.classList.add('hidden');
        uploadVacinaFeedback.textContent = '';
    }

    // Pré-seleciona o status "Válida"
    const statusInput = document.getElementById('vacina-status-valida');
    if (statusInput) {
      statusInput.checked = true;
    }
    
    // Abre o modal de upload de vacina
    openModal(uploadVacinaModal);
  });
}

// Listeners para FECHAR o modal de vacina
if (closeUploadVacinaModalBtn) {
  closeUploadVacinaModalBtn.addEventListener('click', () => {
    closeModal(uploadVacinaModal);
  });
}
if (cancelUploadVacinaBtn) {
  cancelUploadVacinaBtn.addEventListener('click', () => {
    closeModal(uploadVacinaModal);
  });
}
// ==========================================================
// FIM DO NOVO BLOCO
// ==========================================================

// ==========================================================
// COLE O NOVO BLOCO DE CÓDIGO AQUI (Passo 3.3 - Vacina)
// ==========================================================
// --- Listener para SALVAR o formulário de upload de vacina ---
if (formUploadVacina) {

  formUploadVacina.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    
    if (!currentUser) {
      alert("Erro: Utilizador não autenticado. Faça login novamente.");
      return;
    }

    // 1. Coleta os dados do formulário
    const nomeVacina = document.getElementById('upload-vacina-nome').value;
    const statusRadio = document.querySelector('input[name="upload-vacina-status"]:checked');
    const status = statusRadio ? statusRadio.value : 'Válida'; // 'Válida' ou 'Expirada'
    const file = document.getElementById('upload-vacina-ficheiro').files[0];

    // 2. Validação
    if (!nomeVacina) {
      alert("Por favor, preencha o Nome da Vacina.");
      return;
    }

    // O ficheiro só é obrigatório se o status for "Válida"
    if (status === 'Válida' && !file) {
      alert("O arquivo (PDF ou Imagem) é obrigatório para vacinas com status 'Válida'.");
      return;
    }
    
    if (file && file.size > 40 * 1024 * 1024) { // Limite de 40MB
      alert("Erro: O ficheiro é muito grande (máximo 40MB).");
      return;
    }

    // 3. Desativa o botão e mostra "Salvando..."
    if (salvarUploadVacinaBtn) {
      salvarUploadVacinaBtn.disabled = true;
      salvarUploadVacinaBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
    }
    if (uploadVacinaFeedback) uploadVacinaFeedback.classList.add('hidden');
    
    let fileURL = null; // Inicia o URL do ficheiro como nulo

    try {
      // 4. Se o paciente anexou um ficheiro, faz o upload
      if (file) {
        console.log("Ficheiro de vacina encontrado. Fazendo upload para o Storage...");
        const filePath = `pacientes/${currentUser.uid}/vacinas/${Date.now()}_${file.name}`;
        const storageRef = ref(getStorage(app), filePath);
        
        await uploadBytes(storageRef, file);
        fileURL = await getDownloadURL(storageRef); // Pega o URL
        console.log(`Ficheiro da vacina guardado. URL: ${fileURL}`);
      }

      // 5. Prepara os dados para o Firestore
      const vacinaData = {
        titulo: nomeVacina, // O nome que o paciente deu
        status: status,
        enviadoEm: serverTimestamp(), // Data de hoje
        origem: 'paciente', // Para sabermos que foi o paciente que subiu
        fileURL: fileURL, // O link para o ficheiro no Storage (pode ser null)
        
        // (Campos do mock que mantemos para consistência)
        url_pdf: fileURL, 
        data: new Date().toISOString().split('T')[0]
      };

      // 6. Salva no Firestore
      const vacinasRef = collection(db, 'pacientes', currentUser.uid, 'vacinas');
      await addDoc(vacinasRef, vacinaData);
      
      console.log("Vacina salva com sucesso no Firestore.");

      // 7. Feedback de Sucesso e Atualização da Tela
      alert("Vacina adicionada com sucesso!");
      closeModal(uploadVacinaModal);
      
      // O 'true' força o recarregamento da lista de vacinas
      // (que agora incluirá o novo item do Firestore)
      loadVacinas(true);

    } catch (error) {
      console.error("Erro ao salvar vacina externa:", error);
      if (uploadVacinaFeedback) {
          uploadVacinaFeedback.textContent = `Ocorreu um erro ao salvar: ${error.message}`;
          uploadVacinaFeedback.className = 'feedback-message error';
          uploadVacinaFeedback.classList.remove('hidden');
      } else {
          alert(`Ocorreu um erro ao salvar a sua vacina. Por favor, tente novamente.\n\nErro: ${error.message}`);
      }
    } finally {
      // 8. Reativa o botão em qualquer caso (sucesso ou erro)
      if (salvarUploadVacinaBtn) {
        salvarUploadVacinaBtn.disabled = false;
        salvarUploadVacinaBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Vacina';
      }
    }
  });
}
// ==========================================================
// FIM DO NOVO BLOCO
// ==========================================================

    // --- Listeners para a nova Aba de Atestados ---
    const atestadoSearchInput = document.getElementById('atestado-search-input');
    const atestadoFilterGroup = document.getElementById('atestado-filter-group');

    // --- Listener para a Busca de Atestados ---
if (atestadoSearchInput) {
    console.log("Ligando listener de input para a busca de Atestados.");
    // Chama a função de filtro a cada tecla digitada
    atestadoSearchInput.addEventListener('input', applyAtestadoFilters);
}
    

    // Listener para os botões de filtro (NOVO)
    if (atestadoFilterGroup) {
        atestadoFilterGroup.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn-small')) {
                atestadoFilterGroup.querySelector('.active')?.classList.remove('active');
                e.target.classList.add('active');

                // Força o recarregamento e re-renderização com o novo filtro
                loadAtestados(true); 
            }
        });
    }

    if (btnAbrirUploadAtestado) {
        btnAbrirUploadAtestado.addEventListener('click', () => {
            // TODO: Abrir o modal de upload de atestado externo
            //alert("Abrir modal de upload de atestado externo (Ainda não implementado).");
        });
    }



    // --- Listeners para o NOVO Modal de Adicionar Atestado ---
if (btnAbrirUploadAtestado) {
    btnAbrirUploadAtestado.addEventListener('click', () => {
        console.log("Botão + Adicionar Atestado clicado.");
        if (formUploadAtestado) {
            formUploadAtestado.reset(); // Limpa o formulário
        }
        
        // Pré-seleciona a data de hoje
        const dataInput = document.getElementById('upload-atestado-data-inicio');
        if (dataInput) {
            dataInput.value = new Date().toISOString().split('T')[0];
        }
        
        // Pré-seleciona o status "Válido"
        const statusInput = document.getElementById('atestado-status-valido');
        if (statusInput) {
            statusInput.checked = true;
        }

        openModal(uploadAtestadoModal); // Abre o modal
    });
}



// Listener para o "X"
if (closeUploadAtestadoModalBtn) {
    closeUploadAtestadoModalBtn.addEventListener('click', () => {
        closeModal(uploadAtestadoModal);
    });
}

// Listener para o "Cancelar"
if (cancelUploadAtestadoBtn) {
    cancelUploadAtestadoBtn.addEventListener('click', () => {
        closeModal(uploadAtestadoModal);
    });
}

// Listener para fechar clicando fora (no overlay)
if (uploadAtestadoModal) {
    uploadAtestadoModal.addEventListener('click', (e) => {
        // Verifica se o clique foi no próprio overlay
        if (e.target === uploadAtestadoModal) {
            closeModal(uploadAtestadoModal);
        }
    });

    // --- Listener para o "Salvar Atestado" (Form Submit) ---
if (formUploadAtestado) {
    formUploadAtestado.addEventListener('submit', (e) => {
        
        // PASSO MAIS IMPORTANTE: Impede o recarregamento da página!
        e.preventDefault();

        console.log("Formulário Atestado Submetido (sem recarregar!)");
        
        // (No próximo passo, colocaremos a lógica de salvar no Firebase aqui)
        
        // Por enquanto, apenas avisamos que funcionou e não fechamos o modal
        //alert("Parabéns! O recarregamento da página foi impedido. Veja a consola.");
    });
}
}



// [COLE ESTE NOVO BLOCO DE CÓDIGO AQUI]

// --- Listeners para o NOVO Modal de Progresso ---

/**
 * Esta é a função "cérebro" que abre o modal de progresso.
 * Ela lê os dados do card que foi clicado.
 */
function openProgressoModal(acompData) {
    if (!progressoModal || !acompData) {
        console.error("Não foi possível abrir o modal de progresso. Dados ou modal não encontrados.");
        return;
    }

    // Pega o progresso (ex: "50%") e remove o "%"
    const progressoNum = (acompData.progresso || "0%").replace('%', '');
    
    // 1. Preenche o Título do modal
    if (progressoModalTitulo) {
        progressoModalTitulo.textContent = acompData.titulo || "Progresso do Acompanhamento";
    }
    
    // 2. Preenche a Barra de Progresso
    if (progressoModalBarFill) {
        progressoModalBarFill.style.width = `${progressoNum}%`;
    }
    
    // 3. Preenche o Texto da Percentagem
    if (progressoModalTexto) {
        progressoModalTexto.textContent = `${progressoNum}%`;
    }

    // 4. Abre o modal
    openModal(progressoModal);
}

// ==========================================================
// SUBSTITUA O BLOCO 'if (acompanhamentosListContainer)' (Passo 3.3)
// ==========================================================
// Listener "inteligente" na lista de ACOMPANHAMENTOS
// (Ouve cliques nos botões "Fazer Check-in")
if (acompanhamentosListContainer) {

  acompanhamentosListContainer.addEventListener('click', (e) => {
    // 1. Encontra o botão que foi clicado (procura pela 'data-action')
    const button = e.target.closest('[data-action]');
    if (!button) return; // Sai se o clique não foi num botão de ação

    const action = button.dataset.action;
    const card = button.closest('.recipe-card'); // O card pai
    const acompId = card ? card.dataset.acompId : null; // O ID do acompanhamento

    if (!acompId) {
      console.error("Erro: Não foi possível encontrar o ID do acompanhamento no card.");
      return;
    }

    // 2. Encontra os dados completos do acompanhamento na nossa variável global
    // (Esta é a verificação que estava a falhar antes)
    const acompData = allAcompanhamentos.find(ac => ac.id.toString() === acompId.toString());

    if (!acompData) {
      // O ERRO QUE VISTE ANTES VAI APARECER AQUI AGORA, O QUE ESTÁ CORRETO
      console.error(`Erro: Dados do acompanhamento para o ID ${acompId} não encontrados na lista 'allAcompanhamentos'.`);
      alert("Erro ao carregar dados deste acompanhamento. Tente recarregar a página.");
      return;
    }

    // 3. Decide o que fazer com base na ação
    switch (action) {

      // Dentro do switch(action)...
            case 'fazer-checkin':
                console.log("Abrindo modal de Check-in DINÂMICO...");
                
                // 1. Pega os dados escondidos no botão
                const titulo = button.dataset.titulo || "Acompanhamento";
                const metasRaw = button.dataset.metas; // O JSON string (ex: '["meta1"]')
                let metasDoPlano = [];

                try {
                    metasDoPlano = JSON.parse(metasRaw); // Converte de volta para Array real
                } catch (e) {
                    console.error("Erro ao ler metas do botão:", e);
                    metasDoPlano = [];
                }

                // 2. Configura o ID no formulário (para salvar depois)
                if (formCheckinDiario) formCheckinDiario.dataset.acompId = acompId;
                
                // 3. Atualiza Título e Data do Modal
                const modalTitle = document.getElementById('checkin-modal-title');
                const dataHojeEl = document.getElementById('checkin-data-atual');
                
                if(modalTitle) modalTitle.innerHTML = `<i class="fa-solid fa-check-double icon-checkin-header"></i> Check-in: ${titulo}`;
                
                if(dataHojeEl) {
                    const hoje = new Date();
                    dataHojeEl.textContent = hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
                }

                // 4. GERA AS METAS DINAMICAMENTE (AQUI É O SEGREDO)
                const listaMetasContainer = document.getElementById('checkin-lista-metas');
                if (listaMetasContainer) {
                    listaMetasContainer.innerHTML = ''; // Limpa as metas antigas/estáticas

                    if (!metasDoPlano || metasDoPlano.length === 0) {
                        listaMetasContainer.innerHTML = '<p class="text-center text-muted">Nenhuma meta definida para hoje.</p>';
                    } else {
                        metasDoPlano.forEach(metaCodigo => {
                            // Traduz o código técnico (ex: 'tomar_medicacao') para português
                            const textoBonito = formatarNomeMeta(metaCodigo);

                            // Cria o botão clicável da meta
                            const metaHTML = `
                                <button type="button" class="meta-item-checkin" data-meta-original="${metaCodigo}">
                                    <i class="fa-regular fa-circle"></i>
                                    <span>${textoBonito}</span>
                                </button>
                            `;
                            listaMetasContainer.insertAdjacentHTML('beforeend', metaHTML);
                        });
                    }
                }

                // 5. Abre o modal e reseta a barra
                openModal(checkinModal);
                
                // Chama a função que atualiza a barra "0/5" (se existir)
                if(typeof atualizarProgressoCheckin === 'function') atualizarProgressoCheckin();
                break;

      // (A lógica do "ver progresso" que eliminámos do HTML)
      case 'ver-progresso':
        openProgressoModal(acompData);
        break;
    }
  });
}
// ==========================================================
// FIM DA SUBSTITUIÇÃO
// ==========================================================

// Listeners para FECHAR o modal de Progresso
if (closeProgressoModalBtn) {
    closeProgressoModalBtn.addEventListener('click', () => closeModal(progressoModal));
}
if (fecharProgressoModalBtn) {
    fecharProgressoModalBtn.addEventListener('click', () => closeModal(progressoModal));
}
if (progressoModal) {
    progressoModal.addEventListener('click', (e) => {
        if (e.target === progressoModal) closeModal(progressoModal);
    });
}


// ==========================================================
// COLE O NOVO BLOCO DE CÓDIGO AQUI (Passo 3.4)
// ==========================================================
// --- Listeners do NOVO Modal de Check-in (Interação Interna) ---
if (checkinListaMetas) {

  checkinListaMetas.addEventListener('click', (e) => {
    // 1. Encontra o botão (meta-item-checkin) que foi clicado
    const metaItem = e.target.closest('.meta-item-checkin');

    // 2. Se não clicou num item de meta, não faz nada
    if (!metaItem) return;

    // 3. Pega o ícone dentro do botão
    const icone = metaItem.querySelector('i');

    // 4. Alterna (toggle) a classe .concluido
    metaItem.classList.toggle('concluido');

    // 5. Verifica se o item ESTÁ concluído AGORA
    if (metaItem.classList.contains('concluido')) {
      // Se sim, muda o ícone para o "check"
      icone.classList.remove('fa-regular');
      icone.classList.remove('fa-circle');
      icone.classList.add('fa-solid');
      icone.classList.add('fa-check-circle');
    } else {
      // Se não, volta ao ícone de "círculo"
      icone.classList.remove('fa-solid');
      icone.classList.remove('fa-check-circle');
      icone.classList.add('fa-regular');
      icone.classList.add('fa-circle');
    }

    // 6. CHAMA A NOSSA FUNÇÃO (do Passo 3.2)
    // Atualiza a barra de progresso e o texto (ex: "2/5")
    atualizarProgressoCheckin();
  });
}

// Listener para fechar o modal de Check-in (no "X")
if (closeCheckinModalBtn) {
  closeCheckinModalBtn.addEventListener('click', () => {
    closeModal(checkinModal);
  });
}

// (O formulário e o botão Salvar vêm nos próximos passos)
// ==========================================================
// FIM DO NOVO BLOCO
// ==========================================================

// ==========================================================
// COLE O NOVO BLOCO DE CÓDIGO AQUI (Passo 3.5)
// ==========================================================
/**
 * PASSO 3.5
 * Listener para o formulário de Check-in (Salvar no Firestore)
 */
/**
 * LISTENER DO FORMULÁRIO DE CHECK-IN (PACIENTE)
 * Arquivo: perfil-de-saude.js
 */
if (formCheckinDiario) {
    formCheckinDiario.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        if (!currentUser) {
            alert("Erro: Utilizador não autenticado.");
            return;
        }

        // 1. Pega o ID do Acompanhamento (que foi guardado quando clicaste em "Fazer Check-in")
        const acompID = formCheckinDiario.dataset.acompId;
        if (!acompID) {
            alert("Erro: ID do Acompanhamento não encontrado.");
            return;
        }

        if (salvarCheckinBtn) {
            salvarCheckinBtn.disabled = true;
            salvarCheckinBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        }

        try {
            // 2. Coletar os dados das metas marcadas
            const metasConcluidas = [];
            const metasPendentes = [];
            
            // Seleciona todos os botões de meta que estão no modal
            const todosOsItens = checkinListaMetas.querySelectorAll('.meta-item-checkin');

            todosOsItens.forEach(item => {
                const metaTexto = item.querySelector('span') ? item.querySelector('span').textContent : 'Meta desconhecida';
                
                // --- AQUI ESTÁ A CORREÇÃO DE COMPATIBILIDADE ---
                // 1. Tenta pegar o código original técnico (ex: "tomar_medicacao")
                // 2. Se não tiver, usa o ID gerado
                let metaId = item.dataset.metaOriginal || item.dataset.metaId;
                
                // Limpeza de segurança
                if (!metaId) {
                    metaId = metaTexto.toLowerCase().trim().replace(/\s+/g, '_');
                }
                // -----------------------------------------------

                const metaInfo = {
                    id: metaId, 
                    texto: metaTexto 
                };

                if (item.classList.contains('concluido')) {
                    metasConcluidas.push(metaInfo);
                } else {
                    metasPendentes.push(metaInfo);
                }
            });

            // 3. Preparar o objeto para salvar
            const checkinData = {
                pacienteId: currentUser.uid,
                acompanhamentoId: acompID,
                timestamp: serverTimestamp(), // Data do servidor
                dataCheckin: new Date().toISOString(), // Data legível
                metasConcluidas: metasConcluidas, 
                metasPendentes: metasPendentes,
                progresso: `${metasConcluidas.length}/${todosOsItens.length}`
            };

            console.log("Salvando Check-in na subcoleção do paciente...", checkinData);

            // 4. Salvar na GAVETA CERTA do Paciente
            // Caminho: pacientes/{uid}/acompanhamentos/{acompId}/checkins
            const checkinRef = collection(db, 'pacientes', currentUser.uid, 'acompanhamentos', acompID, 'checkins');
            await addDoc(checkinRef, checkinData);

            // 5. Feedback e Fecho
            if (salvarCheckinBtn) {
                salvarCheckinBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvo!';
            }

            setTimeout(() => {
                closeModal(checkinModal);
                if (salvarCheckinBtn) {
                    salvarCheckinBtn.disabled = false;
                    salvarCheckinBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Check-in';
                }
                // Recarrega a lista para atualizar a barra de progresso do card azul
                if (typeof loadAcompanhamentos === 'function') loadAcompanhamentos(true);
            }, 1500);

        } catch (error) {
            console.error("Erro ao salvar check-in:", error);
            alert("Erro ao salvar o check-in. Tente novamente.");
            if (salvarCheckinBtn) {
                salvarCheckinBtn.disabled = false;
                salvarCheckinBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Check-in';
            }
        }
    });
}
// ==========================================================
// FIM DO NOVO BLOCO
// ==========================================================

// [SUBSTITUA O SEU LISTENER 'formUploadAtestado' INTEIRO POR ESTE]

// --- Listener para o "Salvar Atestado" (Form Submit) ---
if (formUploadAtestado) {
    formUploadAtestado.addEventListener('submit', async (e) => {
        
        // 1. Impede o recarregamento da página
        e.preventDefault();
        console.log("Formulário Atestado Submetido. Iniciando salvamento...");

        if (!currentUser) {
            alert("Erro: Paciente não autenticado. Faça login novamente.");
            return;
        }

        // 2. Coleta os dados do formulário
        const titulo = document.getElementById('upload-atestado-titulo').value;
        const medico = document.getElementById('upload-atestado-medico').value || "Não informado";
        const motivo = document.getElementById('upload-atestado-motivo').value || "Não informado";
        const dataInicio = document.getElementById('upload-atestado-data-inicio').value;
        const duracao = document.getElementById('upload-atestado-duracao').value || "N/A";
        const status = document.querySelector('input[name="upload-atestado-status"]:checked').value;
        const fileInput = document.getElementById('upload-atestado-ficheiro');
        const file = fileInput.files[0];

        // 3. Validação
        if (!titulo || !dataInicio) {
            alert("Por favor, preencha pelo menos o Título e a Data de Início.");
            return;
        }
        // Se o status for "Válido", o ficheiro é obrigatório
        if (status === 'Válido' && !file) {
            alert("O arquivo (PDF ou Imagem) é obrigatório para atestados com status 'Válido'.");
            return;
        }
        if (file && file.size > 40 * 1024 * 1024) { // Limite de 40MB
            alert("Erro: O ficheiro é muito grande (máximo 40MB).");
            return;
        }

        // 4. Desativa o botão e mostra "Salvando..."
        if (salvarUploadAtestadoBtn) {
            salvarUploadAtestadoBtn.disabled = true;
            salvarUploadAtestadoBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        }
        showLoading(true); // Mostra o overlay de carregamento global

        let fileURL = null; // Inicia o URL do ficheiro como nulo

        try {
            // 5. Se o paciente anexou um ficheiro, faz o upload
            if (file) {
                console.log("Ficheiro encontrado. Fazendo upload para o Storage...");
                const filePath = `pacientes/${currentUser.uid}/atestados/${Date.now()}_${file.name}`;
                const storageRef = ref(getStorage(app), filePath);
                
                const snapshot = await uploadBytes(storageRef, file);
                fileURL = await getDownloadURL(snapshot.ref);
                console.log("Upload concluído. URL do ficheiro:", fileURL);
            }

            // 6. Prepara os dados para o Firestore
            const atestadoData = {
                titulo: titulo,
                medico: medico,
                motivo: motivo,
                dataInicio: dataInicio,
                duracao: duracao,
                status: status,
                fileURL: fileURL,      // O link do Firebase Storage (ou null)
                origem: 'paciente',    // Para sabermos que foi o paciente que subiu
                enviadoEm: serverTimestamp() // Data de hoje
            };

            // 7. Salva no Firestore
            console.log("Salvando informações do atestado no Firestore...");
            const atestadosRef = collection(db, 'pacientes', currentUser.uid, 'atestados');
            await addDoc(atestadosRef, atestadoData);
            console.log("Atestado salvo com sucesso no Firestore.");

            // 8. Feedback de Sucesso e Atualização da Tela
            alert("Atestado adicionado com sucesso!");
            closeModal(uploadAtestadoModal);
            
            // O 'true' força o recarregamento da lista de atestados
            // (que agora incluirá o novo item do Firestore + os mocks)
            loadAtestados(true); 

        } catch (error) {
            console.error("Erro ao salvar atestado externo:", error);
            alert(`Ocorreu um erro ao salvar o seu atestado. Por favor, tente novamente.\n\nErro: ${error.message}`);
        } finally {
            // 9. Reativa o botão em qualquer caso (sucesso ou erro)
            if (salvarUploadAtestadoBtn) {
                salvarUploadAtestadoBtn.disabled = false;
                salvarUploadAtestadoBtn.innerHTML = '<i class="fa-solid fa-save"></i> Salvar Atestado';
            }
            showLoading(false); // Esconde o overlay de carregamento global
        }
    });
}



// --- Listeners para os Ações nos Cards de Atestado (Gerar PDF / Apagar) ---
if (atestadosListContainer) {
    atestadosListContainer.addEventListener('click', (e) => {
        // Encontra o botão (ou link) que foi clicado
        const button = e.target.closest('.btn-pdf, .btn-apagar-receita');

        if (!button) return; // Sai se o clique não foi num botão de ação

        e.preventDefault();

        // Descobre qual a ação
        const action = button.dataset.action;
        
        // CORREÇÃO 1: Procura por .exame-card (que é o que a função render desenha)
        const card = button.closest('.exame-card'); 
        
        const atestadoId = card ? card.dataset.atestadoId : null;

        if (!atestadoId) {
             console.error("Não foi possível encontrar o ID do atestado no card (.exame-card).");
             return;
        }

        // Decide o que fazer com base na ação
        switch (action) {
            case 'gerar-pdf-atestado':
                console.log(`Ação: Gerar PDF para Atestado ID: ${atestadoId}`);
                // CORREÇÃO 2: Chama a função nova que criámos (que aceita o ID)
                if (typeof gerarPDFAtestado === 'function') {
                    gerarPDFAtestado(atestadoId);
                } else {
                    console.error("Função gerarPDFAtestado não encontrada.");
                }
                break;

            case 'apagar-atestado':
                console.log(`Ação: Apagar Atestado ID: ${atestadoId}`);
                if (typeof handleApagarAtestado === 'function') {
                    handleApagarAtestado(atestadoId);
                }
                break;
        }
    });
}





// ==========================================================
// COLE ESTE BLOCO DE CÓDIGO (Dentro de addEventListeners)
// (Esta é a correção final para os botões da vacina)
// ==========================================================

// 1. Declara a variável APENAS para este listener
// (Isto corrige o ReferenceError que eu causei)
const vacinasListContainer = document.getElementById('vacinas-lista');

// 2. O 'if' verifica se o container existe na página
if (vacinasListContainer) {

  vacinasListContainer.addEventListener('click', (e) => {
    
    // 3. Encontra o botão
    const button = e.target.closest('[data-action]');
    if (!button) return;

    // 4. Impede o recarregamento (o bug do mock!)
    e.preventDefault();

    const action = button.dataset.action;
    const card = button.closest('.recipe-card');
    const vacinaId = card ? card.dataset.vacinaId : null;

    if (!vacinaId) {
      console.error("Não foi possível encontrar o ID da vacina no card.");
      return;
    }

    // 5. Encontra os dados (na variável global 'allVacinas', que já corrigimos)
    const vacinaData = allVacinas.find(v => v.id.toString() === vacinaId.toString());

    if (!vacinaData) {
      alert("Erro: Dados da vacina não encontrados.");
      return;
    }

    // 6. Chama as tuas funções (que já estão prontas)
    switch (action) {
      case 'gerar-pdf-vacina':
        handleGerarPdfVacina(vacinaData); // A tua função que abre o link
        break;

      case 'apagar-vacina':
        handleApagarVacina(vacinaId, vacinaData); // O teu 'alert'
        break;
    }
  });
}
// ==========================================================
// FIM DO BLOCO
// ==========================================================
// ==========================================================


    // ==========================================================
    // COLE ESTE BLOCO (Início) - Listeners da Aba Acompanhamentos
    // ==========================================================

    // --- Listeners para a nova Aba de Acompanhamentos ---
   

    // [NOVO CÓDIGO CORRIGIDO - SUBSTITUA O BLOCO ACIMA POR ESTE]

if (acompanhamentoSearchInput) {
    // CORREÇÃO: Agora, a cada "input" (tecla digitada), ele chama a função
    // 'applyAcompanhamentoFilters'.
    console.log("Ligando listener de input para a busca de Acompanhamentos.");
    acompanhamentoSearchInput.addEventListener('input', applyAcompanhamentoFilters);
}

    // Listener para os botões de filtro (NOVO)
    if (acompanhamentoFilterGroup) {
        acompanhamentoFilterGroup.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn-small')) {
                acompanhamentoFilterGroup.querySelector('.active')?.classList.remove('active');
                e.target.classList.add('active');

                // Força o recarregamento e re-renderização com o novo filtro
                loadAcompanhamentos(true); 
            }
        });
    }

    // (Não precisamos de listener para o botão "Adicionar", pois ele não existe)


    // ==========================================================
    // SUBSTITUA SEUS "Listeners da Aba Anamnese" POR ESTE BLOCO
    // ==========================================================

    // --- Listeners para a nova Aba de Anamnese ---
    const btnPreencherVazio = document.getElementById('btn-preencher-anamnese-vazio');
    const btnEditarPreenchido = document.getElementById('btn-editar-anamnese');
    const btnVisualizarAnamnese = document.getElementById('btn-visualizar-anamnese'); // <-- O botão que vamos mudar

    const anamneseModal = document.getElementById('anamnese-modal');
    const closeAnamneseModalBtn = document.getElementById('close-anamnese-modal');
    const cancelAnamneseBtn = document.getElementById('cancel-anamnese-button');
    const formAnamnese = document.getElementById('form-anamnese');

    // (A função 'openAnamneseModal' que abre o formulário de EDIÇÃO permanece a mesma)
    const openAnamneseModal = async () => {
        if (!anamneseModal || !currentUser) return;

        console.log("Abrindo modal de anamnese (para EDIÇÃO)...");
        formAnamnese.reset();
        document.getElementById('anamnese-feedback-message').classList.add('hidden');
        document.getElementById('salvar-anamnese-button').disabled = false;
        document.getElementById('salvar-anamnese-button').innerHTML = '<i class="fa-solid fa-save"></i> Salvar Anamnese';

        try {
            const anamneseRef = doc(db, 'pacientes', currentUser.uid, 'anamnese', 'principal');
            const docSnap = await getDoc(anamneseRef);

            if (docSnap.exists()) {
                console.log("Carregando dados da anamnese existente no modal...");
                const data = docSnap.data();
                // Preenche todos os campos (código de preenchimento do formulário)
                document.getElementById('anamnese-doencas').value = data.doencas || '';
                document.getElementById('anamnese-hospitalizacao').value = data.hospitalizacao || '';
                document.getElementById('anamnese-cirurgias').value = data.cirurgias || '';
                document.getElementById('anamnese-alergias').value = data.alergias || '';
                document.getElementById('anamnese-transfusoes').value = data.transfusoes || '';
                document.getElementById('anamnese-medicamentos-uso').value = data.medicamentos_uso || '';
                document.getElementById('anamnese-fam-hipertensao').value = data.fam_hipertensao || '';
                document.getElementById('anamnese-fam-diabetes').value = data.fam_diabetes || '';
                document.getElementById('anamnese-fam-cancer').value = data.fam_cancer || '';
                document.getElementById('anamnese-fam-cardiacas').value = data.fam_cardiacas || '';
                document.getElementById('anamnese-fam-mentais').value = data.fam_mentais || '';
                document.getElementById('anamnese-fam-outras').value = data.fam_outras || '';
                document.getElementById('anamnese-hab-humor').value = data.hab_humor || '';
                document.getElementById('anamnese-hab-estresse').value = data.hab_estresse || '';
                document.getElementById('anamnese-hab-sono-rotina').value = data.hab_sono_rotina || '';
                document.getElementById('anamnese-hab-apoio').value = data.hab_apoio || '';
                document.getElementById('anamnese-hab-alcool').value = data.hab_alcool || '';
                document.getElementById('anamnese-hab-drogas').value = data.hab_drogas || '';
                document.getElementById('anamnese-hab-fumo').value = data.hab_fumo || '';
                document.getElementById('anamnese-hab-alimentacao').value = data.hab_alimentacao || '';
                document.getElementById('anamnese-hab-atividade').value = data.hab_atividade || '';
                document.getElementById('anamnese-hab-suplementos').value = data.hab_suplementos || '';
                document.getElementById('anamnese-sis-digestivo').value = data.sis_digestivo || '';
                document.getElementById('anamnese-sis-urinario').value = data.sis_urinario || '';
                document.getElementById('anamnese-sis-cardio').value = data.sis_cardio || '';
                document.getElementById('anamnese-sis-respiratorio').value = data.sis_respiratorio || '';
                document.getElementById('anamnese-sis-musculo').value = data.sis_musculo || '';
                document.getElementById('anamnese-sis-neuro').value = data.sis_neuro || '';
                document.getElementById('anamnese-sis-endocrino').value = data.sis_endocrino || '';
                document.getElementById('anamnese-sis-hemato').value = data.sis_hemato || '';
                document.getElementById('anamnese-exames').value = data.exames_vacinas || '';
                document.getElementById('anamnese-saude-mulher').value = data.saude_mulher || '';
                document.getElementById('anamnese-saude-homem').value = data.saude_homem || '';
            } else {
                console.log("Nenhum dado existente, abrindo modal para preenchimento.");
            }

            openModal(anamneseModal); // Abre o modal de EDIÇÃO

        } catch (error) {
            console.error("Erro ao carregar dados da anamnese para o modal:", error);
            alert("Erro ao carregar seus dados. Tente novamente.");
        }
    };

    // Botão "Preencher Anamnese" (do estado Vazio) -> Abre o modal de EDIÇÃO
    if (btnPreencherVazio) {
        btnPreencherVazio.addEventListener('click', openAnamneseModal);
    }
    // Botão "Editar" (do estado Preenchido) -> Abre o modal de EDIÇÃO
    if (btnEditarPreenchido) {
        btnEditarPreenchido.addEventListener('click', openAnamneseModal);
    }

    // !!!!!!! INÍCIO DA MUDANÇA !!!!!!!
    // Botão "Visualizar" (do estado Preenchido) -> Abre o modal de LEITURA
    if (btnVisualizarAnamnese) {
        btnVisualizarAnamnese.addEventListener('click', openAnamneseVisualizarModal); // <-- Chama a nova função
    }
    // !!!!!!! FIM DA MUDANÇA !!!!!!!

    // Botões de fechar o Modal de EDIÇÃO
    if (closeAnamneseModalBtn) {
        closeAnamneseModalBtn.addEventListener('click', () => closeModal(anamneseModal));
    }
    if (cancelAnamneseBtn) {
        cancelAnamneseBtn.addEventListener('click', () => closeModal(anamneseModal));
    }

    // Listener de SALVAR (do modal de EDIÇÃO)
    if (formAnamnese) {
        formAnamnese.addEventListener('submit', handleSaveAnamnese);
    }

    // --- Listeners para o NOVO Modal de Visualização ---
    if (closeAnamneseVisualizarModalBtn) {
        closeAnamneseVisualizarModalBtn.addEventListener('click', () => closeModal(anamneseVisualizarModal));
    }
    if (fecharAnamneseVisualizarBtn) {
        fecharAnamneseVisualizarBtn.addEventListener('click', () => closeModal(anamneseVisualizarModal));
    }

    if (anamneseVisualizarModal) {
        anamneseVisualizarModal.addEventListener('click', (e) => {
            // Verifica se o clique foi no próprio overlay (o fundo escuro)
            // e não no card branco (o "filho")
            if (e.target === anamneseVisualizarModal) {
                closeModal(anamneseVisualizarModal);
            }
        });
    }

    // ==========================================================
    // FIM DA SUBSTITUIÇÃO
    // ==========================================================

    // ==========================================================
    // COLE ESTE BLOCO (Início) - Listeners da Aba Registros Diários
    // ==========================================================

    // --- Listeners para a nova Aba de Registros Diários ---
    const historicoPeriodoFiltros = document.getElementById('historico-periodo-filtros');
    const historicoSubTabNav = document.getElementById('historico-sub-tab-nav');

    // Listener para os filtros de período (7 dias, 30 dias)
    if (historicoPeriodoFiltros) {
        historicoPeriodoFiltros.addEventListener('click', (e) => {
            const target = e.target.closest('.filter-btn-small');
            if (target) {
                historicoPeriodoFiltros.querySelectorAll('.filter-btn-small').forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                renderHistoricoModal(); // Re-renderiza o conteúdo
            }
        });
    }

    // Listener para as sub-abas (Sono, Humor, etc.)
    if (historicoSubTabNav) {
        historicoSubTabNav.addEventListener('click', (e) => {
            const target = e.target.closest('.sub-tab-btn');
            if (target) {
                historicoSubTabNav.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
                target.classList.add('active');
                renderHistoricoModal(); // Re-renderiza o conteúdo
            }
        });
    }

    // ==========================================================
    // COLE ESTE BLOCO (Fim)
    // ==========================================================

    // ==========================================================
    // COLE ESTE BLOCO (Início) - Listeners da Aba Vacinas
    // ==========================================================

    // --- Listeners para a nova Aba de Vacinas ---
    const vacinaSearchInput = document.getElementById('vacina-search-input');

    if (vacinaSearchInput) {
        vacinaSearchInput.addEventListener('input', () => {
            // TODO: Implementar lógica de busca/filtro
            console.log("Buscando por:", vacinaSearchInput.value);
        });
    }

    if (btnAbrirUploadVacina) {
        btnAbrirUploadVacina.addEventListener('click', () => {
            // TODO: Abrir o modal de upload de vacina
        });
    }

    // ==========================================================
    // COLE ESTE BLOCO (Fim)
    // ==========================================================

    // ==========================================================
    // COLE ESTE BLOCO (Início) - Listeners dos Modais de Registro Diário
    // ==========================================================

    // --- Listener para o Botão do Header "Registro Diário" ---
    if (btnRegistroDiarioAtalho) {
        btnRegistroDiarioAtalho.addEventListener('click', () => {
            console.log("Botão 'Registro Diário' do header clicado. Abrindo formulário...");

            if (novoRegistroModal) {
                formNovoRegistroDiario.reset();
                novoRegistroFeedback.classList.add('hidden');

                // Resetar manualmente os campos condicionais
                detalhesDor?.classList.add('hidden');
                listaMedCheckbox?.classList.add('hidden');
                detalhesMedEfeitos?.classList.add('hidden');
                document.querySelectorAll('.meal-details').forEach(el => el.classList.add('hidden'));

                if(registroMedListaCheckboxes) registroMedListaCheckboxes.innerHTML = '';
                if(registroRefeicoesExternasLista) registroRefeicoesExternasLista.innerHTML = '';

                // Carrega as medicações prescritas ATIVAS para a checklist
                loadAndRenderPrescribedMeds();

                // Abre o modal do formulário
                openModal(novoRegistroModal);

            } else {
                console.error("Modal 'novo-registro-diario-modal' não encontrado!");
                alert("Erro: O modal de registro não foi encontrado.");
            }
        });
    }

    // --- Listeners do Modal de Registro Diário (Longo) ---
    if (formNovoRegistroDiario) {
        formNovoRegistroDiario.addEventListener('submit', handleSalvarRegistroDiario);
    }
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

    // Checkboxes condicionais (Dor, Medicação, Alimentação)
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
                const itemParaRemover = deleteBtn.closest('.meta-item');
                if (itemParaRemover) itemParaRemover.remove();
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
            e.preventDefault(); // O botão é 'submit'
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
                if (itemParaRemover) itemParaRemover.remove();
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

    // ==========================================================
    // COLE ESTE BLOCO (Fim) - Listeners dos Modais
    // ==========================================================

    // --- Listeners para a nova Aba de Vacinas ---
    const vacinaFilterGroup = document.getElementById('vacina-filter-group');

    if (vacinaSearchInput) {
        console.log("Ligando listener de input para a busca de Vacinas.");
        // Dispara o filtro a cada tecla digitada
        vacinaSearchInput.addEventListener('input', applyVacinaFilters);
    }

    if (vacinaFilterGroup) {
        console.log("Ligando listener de clique para os filtros de Vacinas.");
        // Dispara o filtro a cada clique nos botões
        vacinaFilterGroup.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn-small');
            if (btn) {
                // Remove 'active' de todos os botões no grupo
                vacinaFilterGroup.querySelectorAll('.filter-btn-small').forEach(b => b.classList.remove('active'));
                // Adiciona 'active' ao botão clicado
                btn.classList.add('active');
                
                // Chama a função mestra para re-filtrar
                applyVacinaFilters();
            }
        });
    }


    


    // ==========================================================
    // fim do listener 
    // ==========================================================
  /**
 * Traduz os códigos técnicos das metas para texto legível no Check-in.
 */
function formatarNomeMeta(codigo) {
    const mapa = {
        'tomar_medicacao': 'Tomar medicação prescrita',
        'fazer_exercicios_3x_semana': 'Fazer exercícios físicos',
        'evitar_cafeina_apos_16h': 'Evitar cafeína após as 16h',
        'registrar_humor': 'Registrar humor do dia',
        'alimentacao_saudavel': 'Manter alimentação saudável',
        'praticar_tecnicas_respiracao': 'Praticar técnicas de respiração',
        'consulta_psicologo_semanal': 'Ir à consulta com psicólogo',
        'dormir_7_8h': 'Dormir entre 7 a 8 horas',
        'controlar_glicemia': 'Medir e registrar glicemia',
        'registrar_sono': 'Registrar horas de sono'
    };
    
    // Se o código estiver no mapa, retorna o texto bonito.
    // Se não (ex: meta personalizada digitada pelo médico), retorna o próprio texto.
    return mapa[codigo] || codigo;
}




        // ==========================================================
        // --- 10. FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
        // (Função que "arranca" a página)
        // ==========================================================
        
        /** Função principal que arranca a página */
        async function initializePage(user) {
            try {
                // 1. Carrega os dados do paciente (para o header)
                const patientData = await loadPatientData(user.uid);
                allEncaminhamentos = getMockEncaminhamentos();
                console.log(`Inicialização: allEncaminhamentos populado com ${allEncaminhamentos.length} itens.`);
                // --- FIM DO NOVO BLOCO ---


                if (!patientData) {
                    throw new Error("Dados do paciente não encontrados.");
                }
                currentPatientData = patientData;

                // 2. Preenche o cabeçalho (Nome, Foto)
                populateHeader(patientData, user.uid);

                // 3. Liga os botões (Abas, Hamburger)
                // (Agora está definido ANTES de ser chamado)
                addEventListeners();
                
                // 4. Copia as abas para o menu mobile
                populateMobileNav();

                // 5. Carrega o conteúdo da primeira aba ("Receitas")
                await loadReceitas(); 

                // ... (dentro de initializePage ou no final do DOMContentLoaded) ...

            // --- VERIFICAÇÃO DE URL PARA TROCA DE ABA AUTOMÁTICA ---
            // Verifica se viemos de outra página com um pedido para abrir uma aba específica
            const params = new URLSearchParams(window.location.search);
            const abaParaAbrir = params.get('aba');

            if (abaParaAbrir) {
                console.log(`Redirecionamento detectado. Abrindo aba: ${abaParaAbrir}`);
                
                // Chama a sua função existente que troca de abas
                // (Baseado no seu código, deve ser switchTab ou similar)
                if (typeof switchTab === 'function') {
                    switchTab(abaParaAbrir);
                } else {
                    console.warn("Função switchTab não encontrada.");
                    // Fallback: Tenta clicar no botão manualmente se a função não estiver acessível
                    const tabBtn = document.querySelector(`.tab-btn[data-tab="${abaParaAbrir}"]`);
                    if (tabBtn) tabBtn.click();
                }
            } else {
                // Se não houver parâmetro, abre a aba padrão (ex: 'receitas' ou 'dashboard')
                // switchTab('receitas'); 
            }

            } catch (error) {
                console.error("Erro ao inicializar a página:", error);
                // TODO: Mostrar uma mensagem de erro na tela
            } finally {
                // 6. Esconde o "Carregando..."
                showLoading(false);
                if (pageWrapper) {
                    pageWrapper.classList.remove('hidden');
                }
            }
        }

        // ==========================================================
        // --- 11. PONTO DE ENTRADA (Início da Aplicação) ---
        // (Onde tudo começa)
        // ==========================================================
        
        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUser = user;
                initializePage(user); // Chama a nossa função principal
            } else {
                // Se não estiver logado, manda de volta para o login
                console.warn("Usuário não logado, redirecionando...");
                window.location.href = 'index.html';
            }
        });

}); // Fim do 'DOMContentLoaded'

    // ==========================================================
    // FIM DO FICHEIRO
    // ==========================================================