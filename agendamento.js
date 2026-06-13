/* ==========================================================
   FICHEIRO: agendamento.js (V6.0 - Fluxo Inteligente)
   - Redireciona para PAGAMENTO se logado
   - Redireciona para CADASTRO se não logado
   ========================================================== */

// --- 1. IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    Timestamp,
    addDoc,             // <--- Necessário para criar o agendamento direto
    serverTimestamp     // <--- Necessário para a data de criação
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
const db = getFirestore(app);
const auth = getAuth(app);

// --- 4. CÓDIGO PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("agendamento.js (V6.0 - Fluxo Inteligente) carregado.");

    // --- 5. SELETORES GLOBAIS ---
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Card Principal (Header)
    const profPhoto = document.getElementById('prof-photo');
    const profStatusDot = document.getElementById('prof-status-dot');
    const profNome = document.getElementById('prof-nome');
    const profEspecialidade = document.getElementById('prof-especialidade');
    const profBadge = document.getElementById('prof-badge');
    const profCrm = document.getElementById('prof-crm');
    const profExperiencia = document.getElementById('prof-experiencia');
    const profModalidades = document.getElementById('prof-modalidades');
    const profRating = document.getElementById('prof-rating');
    const profAvaliacoes = document.getElementById('prof-avaliacoes');

    // Coluna Esquerda
    const agendaLoading = document.getElementById('agenda-loading');
    const botoesAgendamento = document.getElementById('botoes-agendamento');
    const datasTitulo = document.getElementById('datas-titulo');
    const datasDisponiveis = document.getElementById('datas-disponiveis');
    const horariosTitulo = document.getElementById('horarios-titulo');
    const horariosDisponiveis = document.getElementById('horarios-disponiveis');
    const agendamentoFinal = document.getElementById('agendamento-final');

    // Detalhes
    const profBio = document.getElementById('prof-bio');
    const profFormacao = document.getElementById('prof-formacao');
    const profServicos = document.getElementById('prof-servicos');
    const profDuracao = document.getElementById('prof-duracao');
    const profEndereco = document.getElementById('prof-endereco');
    const profConvenios = document.getElementById('prof-convenios');
    const profFotos = document.getElementById('prof-fotos');

    // Variáveis de estado
    let profissionalId = null;
    let perfilProfissional = null;
    let tipoAgendamentoSelecionado = null;
    let todosOsHorarios = [];
    let horarioSelecionado = null;
    let currentUser = null; // <--- IMPORTANTE: Guarda o usuário logado

    // Listener de Autenticação
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            console.log("Usuário detectado na página de agendamento:", user.uid);
        } else {
            currentUser = null;
            console.log("Visitante não logado.");
        }
        // Carrega a página independentemente de estar logado ou não
        // (para que visitantes possam ver o perfil do médico)
        carregarPagina();
    });

    /**
     * Função Principal: Ponto de entrada
     */
    async function carregarPagina() {
        const urlParams = new URLSearchParams(window.location.search);
        profissionalId = urlParams.get('id');
        let tipoSugeridoPelaUrl = urlParams.get('tipo')?.toLowerCase();

        if (!profissionalId) {
            console.error("Nenhum ID de profissional fornecido na URL.");
            document.body.innerHTML = "<h1>Erro: Profissional não encontrado.</h1>";
            return;
        }

        // Evita recarregar se já carregou (por causa do onAuthStateChanged duplo)
        if (perfilProfissional) return;

        try {
            let horarios;

            if (profissionalId.startsWith('mock_')) {
                console.log("Carregando dados MOCK para o profissional:", profissionalId);
                [perfilProfissional, horarios] = await Promise.all([
                    fetchMockPerfil(),
                    fetchMockHorarios()
                ]);
            } else {
                console.log("Carregando dados REAIS do Firestore para:", profissionalId);
                [perfilProfissional, horarios] = await Promise.all([
                    fetchPerfilProfissional(profissionalId),
                    fetchHorariosProfissional(profissionalId)
                ]);
            }

            if (perfilProfissional) {
                renderizarPerfil(perfilProfissional);
            } else {
                throw new Error("Perfil do profissional não encontrado.");
            }

            todosOsHorarios = horarios;
            renderizarBotoesDeTipo(perfilProfissional.modalidades);

            // Tenta selecionar o tipo sugerido na URL
            let tipoValidoEncontrado = false;
            if (tipoSugeridoPelaUrl && perfilProfissional.modalidades.includes(tipoSugeridoPelaUrl)) {
                const temHorarios = todosOsHorarios.some(h => h.tipo === tipoSugeridoPelaUrl);
                if (temHorarios) {
                    tipoAgendamentoSelecionado = tipoSugeridoPelaUrl;
                    tipoValidoEncontrado = true;
                }
            }

            // Se não deu, pega o primeiro disponível
            if (!tipoValidoEncontrado) {
                const primeiroTipo = perfilProfissional.modalidades.find(mod => 
                    todosOsHorarios.some(h => h.tipo === mod)
                );
                
                if (primeiroTipo) {
                    tipoAgendamentoSelecionado = primeiroTipo;
                } else if (perfilProfissional.modalidades.length > 0) {
                    tipoAgendamentoSelecionado = perfilProfissional.modalidades[0];
                } else {
                    tipoAgendamentoSelecionado = null;
                }
            }

            if (tipoAgendamentoSelecionado) {
                document.querySelectorAll('.btn-tipo-agenda').forEach(b => b.classList.remove('active'));
                const botaoAtivo = document.querySelector(`.btn-tipo-agenda[data-tipo="${tipoAgendamentoSelecionado}"]`);
                if (botaoAtivo) botaoAtivo.classList.add('active');
            }

            renderizarDatasDisponiveis();

        } catch (error) {
            console.error("Erro ao carregar a página de agendamento:", error);
            loadingOverlay.classList.add('hidden');
            agendaLoading.innerHTML = "Erro ao carregar dados. Tente novamente.";
            agendaLoading.classList.remove('hidden');
        } finally {
            if (!loadingOverlay.classList.contains('hidden')) {
                loadingOverlay.classList.add('hidden');
            }
        }
    }

    // --- FUNÇÕES DE BUSCA (REAIS) ---

    async function fetchPerfilProfissional(id) {
        const docRef = doc(db, "profissionais", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const modalidadesLowercase = (data.perfilPublico?.modalidades || []).map(m => m.toLowerCase());
            
            return {
                nome: data.nome,
                especialidade: data.especialidade,
                registro_profissional: data.registro_profissional || "CRM/UF 00000",
                foto_url: data.foto_url,
                online_status: data.online_status || false,
                status_verificacao: data.status_verificacao,
                
                bio: data.perfilPublico?.bio || "Este profissional não forneceu uma biografia.",
                experiencia: data.perfilPublico?.anosExperiencia || "?",
                duracao: data.perfilPublico?.duracaoConsulta || "45",
                servicos: data.perfilPublico?.servicos || [],
                formacao: data.perfilPublico?.formacao || [],
                fotos: data.perfilPublico?.fotosConsultorio || [],
                endereco: data.perfilPublico?.endereco || {},
                convenios: data.perfilPublico?.convenios || [],
                modalidades: modalidadesLowercase,
                
                precos: {
                    online: data.preco_online || 0,
                    presencial: data.preco_presencial || 0,
                    domiciliar: data.preco_domiciliar || 0
                },
                rating: "5.0",
                avaliacoes: "234"
            };
        } else {
            return null;
        }
    }

    async function fetchHorariosProfissional(id) {
        const horarios = [];
        const q = query(
            collection(db, "disponibilidades_publicadas"),
            where("id_profissional", "==", id),
            where("status", "==", "disponivel"),
            where("start", ">", Timestamp.now())
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let tipoDeAtendimento;
            
            if (data.tipo) {
                tipoDeAtendimento = data.tipo.toLowerCase();
            } else {
                tipoDeAtendimento = data.online ? "online" : "presencial";
            }

            horarios.push({
                id: doc.id,
                start: data.start.toDate(),
                end: data.end.toDate(),
                tipo: tipoDeAtendimento
            });
        });

        console.log("Horários REAIS carregados:", horarios);
        return horarios;
    }

    // --- FUNÇÕES MOCK (FALLBACK) ---
    async function fetchMockPerfil() { /* ... (Mantém igual ao seu código atual) ... */ return {}; }
    async function fetchMockHorarios() { /* ... (Mantém igual ao seu código atual) ... */ return []; }


    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    function renderizarPerfil(perfil) {
        profNome.textContent = perfil.nome;
        profEspecialidade.textContent = perfil.especialidade;
        profCrm.textContent = perfil.registro_profissional;
        profExperiencia.textContent = perfil.experiencia;
        profRating.textContent = perfil.rating;
        profAvaliacoes.textContent = perfil.avaliacoes;

        if (perfil.foto_url) profPhoto.src = perfil.foto_url;
        
        if (perfil.online_status) {
            profStatusDot.classList.add('status-online');
            profStatusDot.classList.remove('status-offline');
        } else {
            profStatusDot.classList.add('status-offline');
            profStatusDot.classList.remove('status-online');
        }

        if (perfil.status_verificacao === 'aprovado') {
            profBadge.classList.remove('hidden');
        }

        profModalidades.innerHTML = '';
        if (perfil.modalidades.includes('presencial')) profModalidades.innerHTML += `<span class="badge-modalidade"><i class="fa-solid fa-hospital"></i> Presencial</span>`;
        if (perfil.modalidades.includes('online')) profModalidades.innerHTML += `<span class="badge-modalidade"><i class="fa-solid fa-video"></i> Online</span>`;
        if (perfil.modalidades.includes('domiciliar')) profModalidades.innerHTML += `<span class="badge-modalidade"><i class="fa-solid fa-house"></i> Domiciliar</span>`;

        profBio.textContent = perfil.bio;
        profDuracao.textContent = perfil.duracao;
        
        profFormacao.innerHTML = perfil.formacao.length ? perfil.formacao.map(item => `<li>${item}</li>`).join('') : "<li>Nenhuma formação listada.</li>";
        profServicos.innerHTML = perfil.servicos.length ? perfil.servicos.map(item => `<li>${item}</li>`).join('') : "<li>Nenhum serviço específico listado.</li>";
        
        const end = perfil.endereco;
        profEndereco.innerHTML = (end.rua && end.cidade) ? `${end.rua}, ${end.numero}<br>${end.cidade} - ${end.estado}<br>CEP: ${end.cep}` : "Endereço não informado.";
        
        profConvenios.innerHTML = perfil.convenios.length ? perfil.convenios.map(item => `<span class="badge">${item}</span>`).join('') : "<p>Não atende convênios.</p>";
        
        if (perfil.fotos.length > 0) profFotos.innerHTML = perfil.fotos.map(url => `<img src="${url}" alt="Foto do consultório">`).join('');
        else profFotos.innerHTML = "<p>Nenhuma foto do consultório adicionada.</p>";
    }

    function renderizarBotoesDeTipo(modalidades) {
        botoesAgendamento.innerHTML = '';
        
        if (modalidades.includes('online')) {
            botoesAgendamento.innerHTML += `<button class="btn-tipo-agenda" data-tipo="online">Online</button>`;
        }
        if (modalidades.includes('presencial')) {
            botoesAgendamento.innerHTML += `<button class="btn-tipo-agenda" data-tipo="presencial">Presencial</button>`;
        }
        if (modalidades.includes('domiciliar')) {
            botoesAgendamento.innerHTML += `<button class="btn-tipo-agenda" data-tipo="domiciliar">Domiciliar</button>`;
        }

        document.querySelectorAll('.btn-tipo-agenda').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-tipo-agenda').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                tipoAgendamentoSelecionado = btn.dataset.tipo;
                renderizarDatasDisponiveis();
            });
        });
    }

    function renderizarDatasDisponiveis() {
        datasDisponiveis.innerHTML = '';
        horariosDisponiveis.innerHTML = '';
        horariosTitulo.classList.add('hidden');
        agendamentoFinal.innerHTML = '';
        agendaLoading.innerHTML = '';
        agendaLoading.classList.add('hidden');

        if (!tipoAgendamentoSelecionado) {
            agendaLoading.innerHTML = `<span><i class="fa-solid fa-hand-pointer"></i> Selecione um tipo de atendimento acima.</span>`;
            agendaLoading.classList.remove('hidden');
            datasTitulo.style.display = 'none';
            return;
        }

        const horariosFiltrados = todosOsHorarios.filter(h => h.tipo === tipoAgendamentoSelecionado);
        console.log(`Filtrando por "${tipoAgendamentoSelecionado}": Encontrados ${horariosFiltrados.length} horários.`);

        if (horariosFiltrados.length === 0) {
            agendaLoading.innerHTML = `<i class="fa-solid fa-calendar-times" style="font-size: 1.5rem; color: var(--texto-suave);"></i><span>Nenhum horário ${tipoAgendamentoSelecionado} disponível no momento.</span>`;
            agendaLoading.classList.remove('hidden');
            datasTitulo.style.display = 'none';
            return;
        }

        agendaLoading.classList.add('hidden');
        datasTitulo.style.display = 'block';

        const datas = {};
        horariosFiltrados.forEach(h => {
            const dataFormatada = h.start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            if (!datas[dataFormatada]) datas[dataFormatada] = [];
            datas[dataFormatada].push(h);
        });

        const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        
        Object.keys(datas).forEach(dataKey => {
            const dataObj = datas[dataKey][0].start;
            const diaSemana = diasDaSemana[dataObj.getDay()];
            const diaMes = dataObj.getDate();

            const dataBotaoHTML = `<button class="btn-data" data-data-key="${dataKey}"><span class="dia-semana">${diaSemana}</span><span class="dia-mes">${diaMes}</span></button>`;
            datasDisponiveis.insertAdjacentHTML('beforeend', dataBotaoHTML);
        });

        document.querySelectorAll('.btn-data').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-data').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const dataKey = btn.dataset.dataKey;
                renderizarHorarios(datas[dataKey]);
            });
        });
    }

    function renderizarHorarios(horariosDoDia) {
        horariosDisponiveis.innerHTML = '';
        agendamentoFinal.innerHTML = '';
        
        horariosDoDia.sort((a, b) => a.start - b.start);

        horariosDoDia.forEach(h => {
            const horaFormatada = h.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const horarioBotaoHTML = `<button class="btn-horario" data-horario-id="${h.id}">${horaFormatada}</button>`;
            horariosDisponiveis.insertAdjacentHTML('beforeend', horarioBotaoHTML);
        });

        horariosTitulo.classList.remove('hidden');

        document.querySelectorAll('.btn-horario').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-horario').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const horarioId = btn.dataset.horarioId;
                horarioSelecionado = todosOsHorarios.find(h => h.id === horarioId);
                renderizarBotaoAgendar();
            });
        });
    }

    /* ===========================================================================
       FUNÇÃO DECISIVA: CRIA AGENDAMENTO DIRETO SE LOGADO, OU REDIRECIONA SE NÃO
       =========================================================================== */
    /* ===========================================================================
       FUNÇÃO DECISIVA: CRIA AGENDAMENTO COM CONSENTIMENTO DE DADOS
       =========================================================================== */
    function renderizarBotaoAgendar() {
        if (!horarioSelecionado || !perfilProfissional) return;

        const data = horarioSelecionado.start.toLocaleDateString('pt-BR', { dateStyle: 'full' });
        const hora = horarioSelecionado.start.toLocaleTimeString('pt-BR', { timeStyle: 'short' });
        const preco = perfilProfissional.precos[tipoAgendamentoSelecionado];
        const precoFormatado = (preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const agendamentoFinal = document.getElementById('agendamento-final');
        if(agendamentoFinal) {
            agendamentoFinal.innerHTML = `<p>Seu agendamento: <strong>${data} às ${hora}</strong></p><button class="btn btn-primary btn-confirmar-agenda" id="btn-open-consent">Agendar Consulta (${precoFormatado})</button>`;
        }

        // --- 1. AO CLICAR EM "AGENDAR" -> ABRE MODAL DE CONSENTIMENTO ---
        document.getElementById('btn-open-consent').addEventListener('click', () => {
            if (!currentUser) {
                // Se não estiver logado, manda para o fluxo antigo (cadastro)
                redirecionarParaCadastro(preco);
            } else {
                // Se logado, ABRE O MODAL
                const modal = document.getElementById('consent-modal');
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
        });

        // --- 2. LÓGICA DO MODAL DE CONSENTIMENTO ---
        
        // Botão Cancelar/Voltar do Modal
        document.getElementById('btn-cancel-consent').addEventListener('click', () => {
             document.getElementById('consent-modal').style.display = 'none';
        });

        // Botão CONFIRMAR do Modal (Ação Real)
        document.getElementById('btn-confirm-consent').addEventListener('click', async () => {
            const btnConfirm = document.getElementById('btn-confirm-consent');
            btnConfirm.disabled = true;
            btnConfirm.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processando...';

            // A. Coleta as Permissões
            const permissoes = {
                ver_anamnese: document.getElementById('share-anamnese').checked,
                ver_receitas: document.getElementById('share-receitas').checked,
                ver_exames: document.getElementById('share-exames').checked,
                ver_encaminhamentos: document.getElementById('share-encaminhamentos').checked,
                ver_atestados: document.getElementById('share-atestados').checked,
                ver_vacinas: document.getElementById('share-vacinas').checked,
                ver_registros: document.getElementById('share-registros').checked,
                ver_acompanhamentos: document.getElementById('share-acompanhamentos').checked
            };

            console.log("Permissões concedidas:", permissoes);

            try {
                // B. Prepara o Objeto do Agendamento (COM AS PERMISSÕES)
                const dadosAgendamento = {
                    paciente_id: currentUser.uid,
                    profissional_id: profissionalId,
                    horario_id_disponibilidade: horarioSelecionado.id,
                    data: horarioSelecionado.start, // Objeto Date
                    data_hora: horarioSelecionado.start.toISOString(), // String ISO
                    tipo: tipoAgendamentoSelecionado,
                    preco: parseFloat(preco),
                    status: "agendado_pendente_pagamento",
                    criado_em: serverTimestamp(),
                    
                    // AQUI ESTÁ O OURO: Salva o consentimento no documento!
                    permissoes_acesso: permissoes 
                };

                // C. Grava no Firestore
                const docRef = await addDoc(collection(db, 'agendamentos'), dadosAgendamento);
                console.log("Agendamento criado com consentimento. ID:", docRef.id);

                // D. Redireciona para Pagamento
                window.location.href = `pagamento.html?agendamentoId=${docRef.id}`;

            } catch (error) {
                console.error("Erro ao criar agendamento:", error);
                alert("Erro ao processar. Tente novamente.");
                btnConfirm.disabled = false;
                btnConfirm.innerHTML = 'Confirmar e Agendar';
            }
        });
    }

    // Função auxiliar para redirecionar não-logados
    function redirecionarParaCadastro(preco) {
        console.log("Redirecionando visitante para cadastro com dados do agendamento...");
        
        const params = new URLSearchParams({
            pendente: 'true',
            profId: profissionalId,
            horarioId: horarioSelecionado.id,
            dataHora: horarioSelecionado.start.toISOString(),
            tipo: tipoAgendamentoSelecionado,
            preco: preco
        });
        
        // Manda para o index.html com todos os dados na URL
        window.location.href = `index.html?${params.toString()}`;
    }
    // Listener da Seta de Voltar
    const pageBackButton = document.getElementById('page-back-button');
    if (pageBackButton) {
        pageBackButton.addEventListener('click', (e) => {
            e.preventDefault();
            history.back();
        });
    }
    // --- MENU MOBILE (ATIVAÇÃO) ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileDrawer = document.getElementById('mobile-menu-container');
    const closeBtn = document.getElementById('btn-close-mobile');
    const backdrop = document.getElementById('mobile-backdrop');

    function toggleMobileMenu() {
        if (mobileDrawer) {
            mobileDrawer.classList.toggle('active');
        }
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMobileMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMobileMenu);
    if (backdrop) backdrop.addEventListener('click', toggleMobileMenu);

}); // Fim do DOMContentLoaded