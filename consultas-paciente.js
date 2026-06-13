/* ==========================================================
   FICHEIRO: consultas-paciente.js (V6.1 - Final)
   Lista o histórico e as próximas consultas do paciente.
   ========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// --- IMPORTAÇÕES CORRIGIDAS ---
import { 
    getFirestore, 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    updateDoc,      // <--- ESTAVA EM FALTA
    serverTimestamp, // <--- ESTAVA EM FALTA
    addDoc ,onSnapshot         // <--- ESTAVA EM FALTA
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variáveis globais
let currentUser = null;
let consultaIdParaCancelar = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log("consultas-paciente.js carregado corretamente.");

    // --- SELETORES ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const pageWrapper = document.getElementById('page-wrapper');
    const patientPhoto = document.getElementById('patient-photo');
    const patientName = document.getElementById('patient-name');
    const patientConvenio = document.getElementById('patient-convenio');
    const patientIdEl = document.getElementById('patient-id');
    const proximasConsultasLista = document.getElementById('proximas-consultas-lista');
    const historicoConsultasLista = document.getElementById('historico-consultas-lista');

    // --- FUNÇÕES AUXILIARES ---
    const showLoading = (show) => {
        if (loadingOverlay) loadingOverlay.classList.toggle('hidden', !show);
        if (pageWrapper) pageWrapper.classList.toggle('hidden', show);
    };

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

    // --- 1. HEADER DO PACIENTE ---
    async function populateHeader(uid) {
        try {
            const docRef = doc(db, 'pacientes', uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (patientName) patientName.textContent = data.nome || "Paciente";
                if (patientConvenio) patientConvenio.textContent = data.convenio?.nome || "Sem Convênio";
                if (patientIdEl) patientIdEl.textContent = `ID: ${uid.substring(0, 6)}...`;
                
                if (patientPhoto) {
                    if (data.foto_url) {
                        patientPhoto.src = data.foto_url;
                    } else {
                        const initial = (data.nome || 'P').charAt(0).toUpperCase();
                        patientPhoto.src = `https://placehold.co/60x60/a0d9e5/41b8d5?text=${initial}`;
                    }
                }
            }
        } catch (e) {
            console.error("Erro ao carregar perfil:", e);
        }
    }
    // --- 2. CARREGAR CONSULTAS (EM TEMPO REAL - LÓGICA ORIGINAL) ---
    function loadAndRenderConsultas(uid) {
        // Query para ouvir TUDO deste paciente
        const q = query(
            collection(db, 'agendamentos'),
            where('paciente_id', '==', uid),
            orderBy('data_hora', 'desc') // Mais recentes primeiro
        );

        // OUVINTE (onSnapshot)
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            console.log("Recebida atualização em tempo real!");
            
            const todasConsultas = [];

            // 1. Coleta os dados brutos
            snapshot.forEach(doc => {
                todasConsultas.push({ id: doc.id, ...doc.data() });
            });

            // 2. Chama a sua função de renderização
            await renderizarListas(todasConsultas);

        }, (error) => {
            console.error("Erro ao ouvir consultas:", error);
        });
    }

    // --- 3. RENDERIZAÇÃO (SUA FUNÇÃO MELHORADA) ---
    async function renderizarListas(consultas) {
        const proximasContainer = document.getElementById('proximas-consultas-lista');
        const historicoContainer = document.getElementById('historico-consultas-lista');

        if(proximasContainer) proximasContainer.innerHTML = '';
        if(historicoContainer) historicoContainer.innerHTML = '';

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        let proximasCount = 0;
        let historicoCount = 0;

        // Precisamos de um loop assíncrono para buscar nomes de médicos se necessário
        for (const consulta of consultas) {
            let dataConsulta;
            
            // Tratamento robusto de data
            if (consulta.data_hora) dataConsulta = new Date(consulta.data_hora);
            else if (consulta.data && consulta.data.toDate) dataConsulta = consulta.data.toDate();
            else dataConsulta = new Date(); // Fallback

            // Busca nome do médico (se faltar)
            let nomeMedico = consulta.medico_nome || consulta.profissional_nome || "Profissional";
            let especialidade = consulta.especialidade || "Saúde";

            if (nomeMedico === "Profissional" && consulta.profissional_id) {
                try {
                    const pDoc = await getDoc(doc(db, 'profissionais', consulta.profissional_id));
                    if (pDoc.exists()) {
                        nomeMedico = pDoc.data().nome;
                        especialidade = pDoc.data().especialidade || especialidade;
                    }
                } catch(e) {}
            }

            // Objeto completo para renderizar
            const consultaCompleta = { 
                ...consulta, 
                medico: { nome: nomeMedico, especialidade: especialidade } 
            };

            // Lógica de Separação (A SUA LÓGICA)
            const isFuturo = dataConsulta >= hoje;
            const status = (consulta.status || '').toLowerCase();
            // Normaliza tudo para minúsculas e verifica se contém a palavra chave
            const statusNorm = (status || '').toLowerCase();
            const isAtivo = !statusNorm.includes('cancel') && !statusNorm.includes('realiz') && !statusNorm.includes('conclu');

            if ((isFuturo && isAtivo) || status === 'confirmado' || status === 'agendada' || status === 'agendado_pendente_pagamento') {
                renderCard(consultaCompleta, dataConsulta, proximasContainer);
                proximasCount++;
            } else {
                renderCard(consultaCompleta, dataConsulta, historicoContainer);
                historicoCount++;
            }
        }

        // Mensagens de Vazio
        if (proximasCount === 0 && proximasContainer) {
            proximasContainer.innerHTML = '<p class="placeholder">Nenhuma consulta agendada.</p>';
        }
        if (historicoCount === 0 && historicoContainer) {
            historicoContainer.innerHTML = '<p class="placeholder">Nenhum histórico disponível.</p>';
        }
    }

    function renderCard(c, dataObj, container) {
        // ... (formatação de data mantém-se igual)
        const dataFmt = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
        const horaFmt = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Status e Classes
        let statusClass = 'status-agendada';
        let statusIcon = 'fa-clock';
        let statusTexto = capitalize(c.status);

        if (c.status === 'realizada' || c.status === 'concluída') {
            statusClass = 'status-realizada'; statusIcon = 'fa-check-circle'; statusTexto = 'Realizada';
        } else if (c.status === 'cancelado' || c.status === 'cancelada') {
            statusClass = 'status-cancelada'; statusIcon = 'fa-times-circle'; statusTexto = 'Cancelada';
        } else if (c.status === 'confirmado') {
            statusClass = 'status-realizada'; statusIcon = 'fa-calendar-check'; statusTexto = 'Confirmada';
        } else if (c.status.includes('pendente')) {
            statusClass = 'status-pendente'; statusIcon = 'fa-hourglass-half'; statusTexto = 'Pendente Pagamento';
        }

        // --- BOTÕES DINÂMICOS ---
        let btnsHtml = '';

        // 1. Se Realizada e NÃO avaliada -> Botão AVALIAR
        if ((c.status === 'realizada' || c.status === 'concluída') && !c.avaliacao_realizada) {
            btnsHtml = `
                <button class="btn-consulta-action btn-avaliar" 
                    data-id="${c.id}" 
                    data-prof-id="${c.profissional_id || c.medico_id}" 
                    data-medico="${c.medico?.nome || 'Profissional'}"
                    style="background: #f59e0b; color: white; border: none;">
                    <i class="fa-solid fa-star"></i> Avaliar
                </button>
                <button class="btn-consulta-action btn-detalhes" data-id="${c.id}">Ver Detalhes</button>
            `;
        }
        // 2. Se já Avaliada
        else if ((c.status === 'realizada' || c.status === 'concluída') && c.avaliacao_realizada) {
             btnsHtml = `
                <span style="color:#f59e0b; font-weight:600; font-size:0.9rem; margin-right:10px;">
                    <i class="fa-solid fa-check"></i> Avaliado
                </span>
                <button class="btn-consulta-action btn-detalhes" data-id="${c.id}">Ver Detalhes</button>
            `;
        }
        // 3. Fluxo Normal (Agendada/Confirmada)
        else if (statusTexto === 'Confirmada' || statusTexto === 'Agendada') {
            if ((c.tipo || '').toLowerCase() === 'online') {
                btnsHtml += `<button class="btn-consulta-action btn-video" data-id="${c.id}" style="background:#3182ce; color:white; border:none;"><i class="fa-solid fa-video"></i> Acessar Sala</button>`;
            }
            btnsHtml += `<button class="btn-consulta-action btn-detalhes" data-id="${c.id}">Ver Detalhes</button>`;
            btnsHtml += `<button class="btn-consulta-action btn-reagendar" data-id="${c.id}">Reagendar</button>`;
            btnsHtml += `<button class="btn-consulta-action btn-cancelar" data-id="${c.id}">Cancelar</button>`;
        }
        // 4. Pendente
        else if (c.status.includes('pendente')) {
            btnsHtml = `<button class="btn-consulta-action btn-pagar" onclick="window.location.href='pagamento.html?agendamentoId=${c.id}'">Pagar Agora</button>`;
        } 
        // 5. Cancelada
        else {
            btnsHtml = `<button class="btn-consulta-action btn-detalhes" data-id="${c.id}">Ver Detalhes</button>`;
            btnsHtml += `<button class="btn-consulta-action btn-reagendar" data-id="${c.id}">Reagendar</button>`;
        }

        const html = `
        <div class="consulta-card">
            <div class="consulta-card-icon ${statusClass}"><i class="fa-solid ${statusIcon}"></i></div>
            <div class="consulta-card-main">
                <div class="consulta-card-header">
                    <span class="badge ${statusClass}">${statusTexto}</span>
                    <span class="consulta-card-data">${dataFmt} às ${horaFmt}</span>
                </div>
                <div class="consulta-card-body">
                    <h4>${c.medico?.nome || 'Profissional'}</h4>
                    <p>${c.medico?.especialidade || 'Especialidade'} • ${capitalize(c.tipo)}</p>
                </div>
                <div class="consulta-card-actions" style="display:flex; gap:8px; flex-wrap:wrap;">
                    ${btnsHtml}
                </div>
            </div>
        </div>`;
        container.insertAdjacentHTML('beforeend', html);
    }

    // --- VARIÁVEL PARA GUARDAR O ID TEMPORARIAMENTE ---
    let consultaIdParaCancelar = null;

    // --- LISTENER DE BOTÕES (Completo: Vídeo, Cancelar, Detalhes e Reagendar Direto) ---
    function addCardListeners() {
        const container = document.querySelector('main'); 
        if (!container) return;

        // Adicionamos 'async' aqui para poder buscar dados do médico no Reagendamento
        container.addEventListener('click', async (e) => {
            
            // A. BOTÃO VÍDEO (Jitsi)
            const btnVideo = e.target.closest('.btn-video');
            if (btnVideo) {
                e.preventDefault();
                const consultaId = btnVideo.dataset.id;
                if (consultaId) {
                    const nomeSala = `OrionHealth_Consulta_${consultaId}`;
                    const nomePaciente = currentUser.displayName || "Paciente";
                    const urlSala = `https://meet.jit.si/${nomeSala}#userInfo.displayName="${encodeURIComponent(nomePaciente)}"`;
                    window.open(urlSala, '_blank');
                }
            }

            // B. BOTÃO CANCELAR (Abre Modal)
            const btnCancelar = e.target.closest('.btn-cancelar');
            if (btnCancelar) {
                e.preventDefault();
                consultaIdParaCancelar = btnCancelar.dataset.id;
                const modal = document.getElementById('cancelamento-modal');
                if(modal) {
                    modal.classList.remove('hidden');
                    modal.style.display = 'flex';
                }
            }

            // C. BOTÃO VER DETALHES (Abre Modal)
            if (e.target.tagName === 'BUTTON' && e.target.textContent.trim() === 'Ver Detalhes') {
                e.preventDefault();
                const consultaId = e.target.dataset.id;
                if (consultaId) abrirModalDetalhes(consultaId);
            }
            // E. BOTÃO AVALIAR (NOVO)
            const btnAvaliar = e.target.closest('.btn-avaliar');
            if (btnAvaliar) {
                e.preventDefault();
                const modal = document.getElementById('avaliacao-modal');
                
                // Prepara dados
                avaliacaoAtual.consultaId = btnAvaliar.dataset.id;
                avaliacaoAtual.profId = btnAvaliar.dataset.profId;
                avaliacaoAtual.nota = 0;
                
                // Reseta visual
                document.getElementById('aval-medico-nome').textContent = btnAvaliar.dataset.medico;
                document.getElementById('aval-comentario').value = '';
                document.querySelectorAll('.star-icon').forEach(s => s.style.color = '#e2e8f0');
                
                // Abre
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }

            // D. BOTÃO REAGENDAR (NOVO - Direto para a Agenda do Médico)
            const btnReagendar = e.target.closest('.btn-reagendar');
            if (btnReagendar) {
                e.preventDefault();
                const consultaId = btnReagendar.dataset.id;
                
                // Feedback visual rápido
                const textoOriginal = btnReagendar.textContent;
                btnReagendar.textContent = "A carregar...";
                btnReagendar.disabled = true;

                try {
                    // 1. Busca a consulta original para saber quem é o médico
                    const docRef = doc(db, 'agendamentos', consultaId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Pega o ID do médico (pode estar como profissional_id ou medico_id)
                        const medicoId = data.profissional_id || data.medico_id;
                        const tipo = data.tipo || 'Presencial';

                        if (medicoId) {
                            // 2. Redireciona DIRETO para a página de agendamento desse médico
                            console.log(`Reagendando com médico ${medicoId} (${tipo})`);
                            window.location.href = `agendamento.html?id=${medicoId}&tipo=${tipo}`;
                        } else {
                            alert("Erro: Médico não identificado. Redirecionando para a busca.");
                            window.location.href = 'busca.html';
                        }
                    } else {
                        alert("Consulta não encontrada.");
                    }
                } catch (error) {
                    console.error("Erro ao reagendar:", error);
                    alert("Erro ao processar. Tente novamente.");
                    btnReagendar.textContent = textoOriginal;
                    btnReagendar.disabled = false;
                }
            }
        });
    }
    // --- FUNÇÃO AUXILIAR: CARREGAR E ABRIR MODAL DE DETALHES ---
    async function abrirModalDetalhes(consultaId) {
        try {
            const docRef = doc(db, 'agendamentos', consultaId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                const modal = document.getElementById('detalhes-consulta-modal');
                
                // Preenche Datas
                let dataFmt = "N/D", horaFmt = "N/D";
                if (data.data_hora) {
                    const d = new Date(data.data_hora);
                    dataFmt = d.toLocaleDateString('pt-BR');
                    horaFmt = d.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                }
                document.getElementById('detalhe-data').textContent = dataFmt;
                document.getElementById('detalhe-hora').textContent = horaFmt;

                // Preenche Outros Dados
                document.getElementById('detalhe-medico').textContent = "Profissional de Saúde"; 
                document.getElementById('detalhe-especialidade').textContent = capitalize(data.tipo || 'Consulta');
                
                const statusEl = document.getElementById('detalhe-status');
                statusEl.textContent = capitalize(data.status);
                
                // Lógica de Cores e Cancelamento
                if (data.status === 'cancelado') {
                    statusEl.style.background = '#fde8e8'; 
                    statusEl.style.color = '#c81e1e';
                    
                    document.getElementById('area-cancelamento').style.display = 'block';
                    document.getElementById('detalhe-motivo').textContent = data.motivo_cancelamento || "Não informado";
                    document.getElementById('detalhe-cancelado-por').textContent = `Cancelado por: ${data.cancelado_por === 'paciente' ? 'Você' : 'Profissional'}`;
                } else {
                    statusEl.style.background = '#e2e8f0'; 
                    statusEl.style.color = '#4a5568';
                    document.getElementById('area-cancelamento').style.display = 'none';
                }

                // Abre o Modal
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        } catch (err) {
            console.error("Erro ao abrir detalhes:", err);
            alert("Erro ao carregar detalhes.");
        }
    }

    // --- LÓGICA DE CONFIRMAÇÃO DO CANCELAMENTO ---
    const btnConfirmarCancel = document.getElementById('btn-confirmar-cancelamento');
    
    // --- LÓGICA DE CONFIRMAÇÃO DO CANCELAMENTO ---
    if (btnConfirmarCancel) {
        btnConfirmarCancel.addEventListener('click', async () => {
            const motivoSelect = document.getElementById('motivo-cancelamento');
            const motivo = motivoSelect.value;

            if (!motivo) {
                alert("Por favor, selecione um motivo.");
                return;
            }

            // CORREÇÃO AQUI: Usar a variável global correta
            if (!consultaIdParaCancelar) {
                alert("Erro: Nenhuma consulta selecionada para cancelamento.");
                return;
            }

            // UI Loading
            btnConfirmarCancel.disabled = true;
            btnConfirmarCancel.textContent = "A cancelar...";

            try {
                // 1. Atualiza no Firestore
                // Usa a variável certa aqui:
                const docRef = doc(db, 'agendamentos', consultaIdParaCancelar);
                
                const docSnap = await getDoc(docRef);
                const dadosAgendamento = docSnap.exists() ? docSnap.data() : {};

                await updateDoc(docRef, {
                    status: 'cancelado',
                    motivo_cancelamento: motivo,
                    cancelado_por: 'paciente',
                    data_cancelamento: serverTimestamp()
                });

                // 2. Envia Notificação ao Médico
                if (dadosAgendamento.profissional_id) {
                    const notifData = {
                        titulo: "Consulta Cancelada pelo Paciente",
                        mensagem: `${currentUser.displayName || 'Paciente'} cancelou a consulta. Motivo: ${motivo}`,
                        lida: false,
                        tipo: 'agendamento',
                        timestamp: serverTimestamp()
                    };
                    // Tenta adicionar notificação (ignora se falhar por regras)
                    try {
                        await addDoc(collection(db, 'profissionais', dadosAgendamento.profissional_id, 'notificacoes'), notifData);
                    } catch (e) { console.log("Aviso: Não foi possível notificar médico (permissão).", e); }
                }

                // 3. Sucesso
                alert("Consulta cancelada com sucesso.");
                
                // Fecha modal e recarrega
                if(cancelamentoModal) cancelamentoModal.classList.add('hidden');
                loadAndRenderConsultas(currentUser.uid); // Recarrega a lista sem F5
                
                // Limpa
                motivoSelect.value = "";
                btnConfirmarCancel.textContent = "Confirmar Cancelamento";
                btnConfirmarCancel.disabled = false;

            } catch (error) {
                console.error("Erro ao cancelar:", error);
                alert("");
                btnConfirmarCancel.disabled = false;
                btnConfirmarCancel.textContent = "Confirmar Cancelamento";
            }
        });
    }
    // --- PONTO DE PARTIDA ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // ATRIBUIÇÃO CORRETA DA VARIÁVEL GLOBAL
            currentUser = user;
            
            // Funções chamadas com o ID correto
            populateHeader(user.uid);
            loadAndRenderConsultas(user.uid);
            addCardListeners();
            
            showLoading(false);
        } else {
            console.warn("Usuário não logado, redirecionando...");
            window.location.href = 'index.html';
        }
    });

    // --- BOTÃO "AGENDAR CONSULTA" (HEADER) ---
    // Redireciona para a Home para iniciar um novo agendamento
    const btnAgendarHeader = document.getElementById('btn-agendar-consulta-atalho');
    
    if (btnAgendarHeader) {
        btnAgendarHeader.addEventListener('click', (e) => {
            e.preventDefault(); // Previne comportamento padrão se for um link
            console.log("Iniciando novo agendamento...");
            window.location.href = 'home.html';
        });
    }

    // --- VARIÁVEIS PARA AVALIAÇÃO ---
    let avaliacaoAtual = { nota: 0, consultaId: null, profId: null };

    // --- LÓGICA DAS ESTRELAS E MODAL (COM NOTIFICAÇÃO AO MÉDICO) ---
    function setupAvaliacaoLogic() {
        const modal = document.getElementById('avaliacao-modal');
        const stars = document.querySelectorAll('.star-icon');
        const btnEnviar = document.getElementById('btn-enviar-avaliacao');
        
        // 1. Clique nas Estrelas
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const valor = parseInt(star.dataset.value);
                avaliacaoAtual.nota = valor;
                
                // Pinta as estrelas
                stars.forEach(s => {
                    if (parseInt(s.dataset.value) <= valor) {
                        s.style.color = '#f59e0b'; // Amarelo
                    } else {
                        s.style.color = '#e2e8f0'; // Cinza
                    }
                });
            });
        });

        // 2. Clique em Enviar
        if (btnEnviar) {
            // Remover listeners antigos (clone) para evitar duplicados
            const novoBtn = btnEnviar.cloneNode(true);
            btnEnviar.parentNode.replaceChild(novoBtn, btnEnviar);

            novoBtn.addEventListener('click', async () => {
                if (avaliacaoAtual.nota === 0) {
                    alert("Por favor, selecione uma nota (estrelas).");
                    return;
                }

                const comentario = document.getElementById('aval-comentario').value;
                novoBtn.innerHTML = 'Enviando...';
                novoBtn.disabled = true;

                try {
                    // A. Salva a Avaliação
                    await addDoc(collection(db, 'avaliacoes'), {
                        agendamento_id: avaliacaoAtual.consultaId,
                        profissional_id: avaliacaoAtual.profId,
                        paciente_id: currentUser.uid,
                        paciente_nome: currentUser.displayName || "Paciente",
                        nota: avaliacaoAtual.nota,
                        comentario: comentario,
                        data: serverTimestamp()
                    });

                    // B. Atualiza o Agendamento
                    await updateDoc(doc(db, 'agendamentos', avaliacaoAtual.consultaId), {
                        avaliacao_realizada: true
                    });

                    // C. ENVIA NOTIFICAÇÃO AO MÉDICO (NOVO!)
                    if (avaliacaoAtual.profId) {
                        const notifData = {
                            titulo: "Nova Avaliação ⭐",
                            mensagem: `O paciente ${currentUser.displayName || 'Paciente'} avaliou o atendimento com ${avaliacaoAtual.nota} estrelas.`,
                            lida: false,
                            tipo: 'avaliacao', // Novo tipo para ícone de estrela
                            timestamp: serverTimestamp()
                        };
                        
                        await addDoc(collection(db, 'profissionais', avaliacaoAtual.profId, 'notificacoes'), notifData);
                        console.log("Notificação enviada ao médico.");
                    }

                    alert("Obrigado pela sua avaliação!");
                    modal.style.display = 'none';
                    
                } catch (e) {
                    console.error("Erro ao salvar avaliação:", e);
                    alert("Erro ao enviar. Tente novamente.");
                } finally {
                    novoBtn.innerHTML = 'Enviar Avaliação';
                    novoBtn.disabled = false;
                }
            });
        }
    }

    // Chame esta função no initialize ou no final do load
    setupAvaliacaoLogic();

    // ==========================================================
    // LÓGICA DO MENU MOBILE
    // ==========================================================
    
    function setupMobileMenu() {
        const hamburgerBtn = document.getElementById('hamburger-menu');
        const mobileMenu = document.getElementById('mobile-nav-menu');
        const backdrop = document.getElementById('backdrop');

        // 1. Injeta os Links no Menu (Se estiver vazio)
        if (mobileMenu && mobileMenu.innerHTML.trim() === '') {
            mobileMenu.innerHTML = `
                <ul>
                    <li><a href="paciente-perfil.html"><i class="fa-solid fa-house"></i> Dashboard</a></li>
                    <li><a href="consultas-paciente.html" class="active"><i class="fa-solid fa-calendar-check"></i> Minhas Consultas</a></li>
                    <li><a href="registro-diario.html"><i class="fa-solid fa-heart-pulse"></i> Registro Diário</a></li>
                    <li><a href="relatorio-paciente.html"><i class="fa-solid fa-chart-pie"></i> Relatórios</a></li>
                    <li style="margin-top: 20px; border-top: 1px solid #eee;">
                        <a href="#" id="btn-logout-mobile" style="color: #e53e3e;">
                            <i class="fa-solid fa-right-from-bracket"></i> Sair
                        </a>
                    </li>
                </ul>
            `;
            
            // Liga o botão de Sair do Mobile
            const btnLogoutMobile = document.getElementById('btn-logout-mobile');
            if(btnLogoutMobile) {
                btnLogoutMobile.addEventListener('click', (e) => {
                    e.preventDefault();
                    auth.signOut().then(() => window.location.href = 'index.html');
                });
            }
        }

        // 2. Função de Abrir/Fechar
        const toggleMenu = () => {
            mobileMenu.classList.toggle('active');
            backdrop.classList.toggle('hidden');
        };

        // 3. Listeners
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });
        }

        if (backdrop) {
            backdrop.addEventListener('click', toggleMenu);
        }
    }

    // CHAMA A FUNÇÃO IMEDIATAMENTE
    setupMobileMenu();
});