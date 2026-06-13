// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    getDoc, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DO DOM ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const pageWrapper = document.getElementById('page-wrapper');
    const searchInput = document.getElementById('search-input');
    const filterContainer = document.querySelector('.filter-container');
    const patientListContainer = document.getElementById('patient-list-container');
    const emptyState = document.getElementById('empty-state');

    let allPatients = []; // Aqui ficarão os pacientes REAIS carregados
    let currentUser = null;

    // --- LÓGICA PRINCIPAL ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            console.log("Médico autenticado:", user.uid);
            loadMyPatients(user.uid);
        } else {
            window.location.href = 'professional-login.html';
        }
    });

    // --- FUNÇÃO: CARREGAR PACIENTES REAIS ---
    const loadMyPatients = async (medicoId) => {
        try {
            // 1. Busca todos os agendamentos deste médico
            // Ordenamos por data descrescente para pegar a última consulta facilmente
            const agendamentosRef = collection(db, 'agendamentos');
            const q = query(
                agendamentosRef, 
                where('profissional_id', '==', medicoId),
                orderBy('data', 'desc')
            );

            const querySnapshot = await getDocs(q);
            
            const mapPacientesUnicos = new Map();

            // 2. Processa os agendamentos para encontrar pacientes únicos
            querySnapshot.forEach((docSnapshot) => {
                const agendamento = docSnapshot.data();
                const pacienteId = agendamento.paciente_id;

                // Se ainda não processamos este paciente, adicionamos ao mapa
                // Como a query está ordenada por data desc, a primeira vez que encontramos
                // o paciente, é a consulta mais recente.
                if (pacienteId && !mapPacientesUnicos.has(pacienteId)) {
                    
                    let dataConsulta = null;
                    if (agendamento.data && typeof agendamento.data.toDate === 'function') {
                        dataConsulta = agendamento.data.toDate();
                    } else {
                        dataConsulta = new Date(agendamento.data);
                    }

                    mapPacientesUnicos.set(pacienteId, {
                        id: pacienteId,
                        ultimaConsultaData: dataConsulta,
                        status: agendamento.status // 'confirmado', 'pendente', etc.
                    });
                }
            });

            console.log(`Encontrados ${mapPacientesUnicos.size} pacientes únicos nos agendamentos.`);

            // 3. Busca os dados pessoais de cada paciente na coleção 'pacientes'
            const listaPacientesCompleta = [];
            
            // Transforma o Map em um array de Promessas para buscar em paralelo
            const promises = Array.from(mapPacientesUnicos.values()).map(async (pacienteBase) => {
                try {
                    const pacienteDocRef = doc(db, 'pacientes', pacienteBase.id);
                    const pacienteSnap = await getDoc(pacienteDocRef);

                    if (pacienteSnap.exists()) {
                        const dadosPessoais = pacienteSnap.data();
                        
                        // Define o status visual baseado na última consulta
                        let statusVisual = "Ativo";
                        const diffDias = (new Date() - pacienteBase.ultimaConsultaData) / (1000 * 60 * 60 * 24);
                        
                        if (pacienteBase.status === 'agendado_pendente_pagamento') {
                             statusVisual = "Pendente";
                        } else if (diffDias > 60) {
                             statusVisual = "Inativo";
                        } else {
                             statusVisual = "Em Acompanhamento";
                        }

                        // Formata a data
                        const dataFormatada = pacienteBase.ultimaConsultaData.toLocaleDateString('pt-BR');

                        return {
                            id: pacienteBase.id, // ID REAL DO FIREBASE
                            nome: dadosPessoais.nome || "Paciente sem nome",
                            ultimaConsulta: dataFormatada,
                            status: statusVisual,
                            foto: dadosPessoais.foto_url || dadosPessoais.photoURL || `https://placehold.co/60x60/a0d9e5/41b8d5?text=${(dadosPessoais.nome || 'P').charAt(0)}`,
                            online: dadosPessoais.status_online || false,
                            cpf: dadosPessoais.cpf || "CPF não inf."
                        };
                    } else {
                        console.warn(`Dados do paciente ${pacienteBase.id} não encontrados na coleção 'pacientes'.`);
                        return null; // Paciente pode ter sido deletado
                    }
                } catch (err) {
                    console.error(`Erro ao buscar paciente ${pacienteBase.id}:`, err);
                    return null;
                }
            });

            // Aguarda todas as buscas terminarem
            const resultados = await Promise.all(promises);
            
            // Filtra nulos (erros ou deletados)
            allPatients = resultados.filter(p => p !== null);

            renderPatientList(allPatients);

        } catch (error) {
            console.error("Erro fatal ao carregar pacientes:", error);
            alert("Erro ao carregar sua lista de pacientes. Verifique o console.");
        } finally {
            loadingOverlay.classList.add('hidden');
            pageWrapper.classList.remove('hidden');
        }
    };

    // --- FUNÇÃO: RENDERIZAR NA TELA (COM LÓGICA DE STATUS CORRIGIDA) ---
    const renderPatientList = (patientsToRender) => {
        patientListContainer.innerHTML = '';

        if (patientsToRender.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }

        patientsToRender.forEach(patient => {
            // Tratamento de classes CSS (Mantive o seu mapa, mas vamos forçar o padrão inicial)
            const statusClassMap = {
                'Em Acompanhamento': 'status-em-acompanhamento',
                'Ativo': 'status-ativo',
                'Inativo': 'status-encaminhado',
                'Pendente': 'status-encaminhado'
            };
            
            // --- MUDANÇA AQUI: Definimos o padrão como "Ativo" (Azul) ---
            // Depois a função assíncrona muda para Verde se necessário
            let currentStatusLabel = "Ativo";
            let currentStatusClass = "status-ativo";
            
            const onlineIndicatorHTML = patient.online ? '<div class="avatar-status-dot"></div>' : '';

            const cardHTML = `
                <div class="patient-card" role="listitem">
                    <div class="card-avatar">
                        <img src="${patient.foto}" alt="Foto de ${patient.nome}" class="patient-photo">
                        ${onlineIndicatorHTML}
                    </div>
                    <div class="card-main-content">
                        <div class="card-info-header">
                            <div class="patient-info">
                                <h2>${patient.nome}</h2>
                                <p><i class="fa-regular fa-calendar"></i> Última consulta: ${patient.ultimaConsulta}</p>
                            </div>
                            
                            <span id="status-badge-${patient.id}" class="patient-status ${currentStatusClass}">
                                ${currentStatusLabel}
                            </span>
                        </div>
                        
                        <a href="prontuario-paciente.html?id=${patient.id}" class="btn-prontuario" 
                           aria-label="Ver prontuário de ${patient.nome}">
                           Ver Prontuário
                        </a>
                    </div>
                </div>
            `;
            patientListContainer.insertAdjacentHTML('beforeend', cardHTML);

            // --- CHAMA A VERIFICAÇÃO NO BANCO (Para mudar para Verde se tiver plano) ---
            if (typeof updatePatientStatusFromFirestore === 'function') {
                updatePatientStatusFromFirestore(patient.id);
            }
        });
    };
   // --- FUNÇÃO: FILTROS E BUSCA (CORRIGIDA E ROBUSTA) ---
    const applyFilters = () => {
        // 1. Pega o texto digitado (minúsculas e sem espaços nas pontas)
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // 2. Identifica o botão de filtro ativo
        const activeFilterBtn = filterContainer.querySelector('.filter-btn.active');
        const activeFilterID = activeFilterBtn ? activeFilterBtn.id : 'filter-all';

        // 3. Filtra a lista principal
        const filtered = allPatients.filter(patient => {
            // --- A. VERIFICAÇÃO DE TEXTO ---
            // Garante que lemos o nome, mesmo que venha como 'name' ou 'nome'
            const nome = (patient.name || patient.nome || "").toLowerCase();
            const id = (patient.id || "").toLowerCase();
            
            // Verifica se o termo está no Nome OU no ID
            const matchesSearch = nome.includes(searchTerm) || id.includes(searchTerm);

            // --- B. VERIFICAÇÃO DE STATUS ---
            // Usa o statusReal (que vem do banco) ou assume 'Ativo' se ainda não carregou
            const status = patient.statusReal || 'Ativo';
            let matchesStatus = true;

            if (activeFilterID === 'filter-em-acompanhamento') {
                matchesStatus = (status === 'Em Acompanhamento');
            } 
            else if (activeFilterID === 'filter-ativo') {
                // Mostra quem é Ativo (e não está em acompanhamento)
                matchesStatus = (status === 'Ativo');
            } 
            else if (activeFilterID === 'filter-encaminhado') {
                matchesStatus = (status === 'Encaminhado' || status === 'Pendente');
            }
            // filter-all deixa passar todos (matchesStatus = true)

            // O paciente só passa se cumprir OS DOIS critérios
            return matchesSearch && matchesStatus;
        });

        // 4. Atualiza a tela
        renderPatientList(filtered);
    };

    // --- LISTENERS DE EVENTOS (Substitua os antigos por estes) ---
    
    // Busca ao digitar (input)
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    // Clique nos botões de filtro
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                // Remove classe 'active' de todos
                filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-checked', 'false');
                });
                
                // Adiciona ao botão clicado
                e.target.classList.add('active');
                e.target.setAttribute('aria-checked', 'true');
                
                // Reaplica os filtros
                applyFilters();
            }
        });
    }

    // --- EVENT LISTENERS ---
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-checked', 'false');
            });
            e.target.classList.add('active');
            e.target.setAttribute('aria-checked', 'true');
            applyFilters();
        }
    });
});