// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// --- ATUALIZE ESTA LINHA NO TOPO DO ARQUIVO ---
// --- ATUALIZE AS IMPORTAÇÕES NO TOPO ---
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    addDoc, 
    serverTimestamp, 
    query, 
    where, 
    getDocs, 
    orderBy, 
    limit,
    onSnapshot,
    updateDoc,
    collectionGroup,
    writeBatch// <--- ADICIONE ISTO
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES GERAIS ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const dashboardWrapper = document.getElementById('dashboard-wrapper');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const backdrop = document.getElementById('backdrop');
    const profPhoto = document.getElementById('prof-photo');
    const profName = document.getElementById('prof-name');
    const profWelcomeName = document.getElementById('prof-welcome-name');
    const profileMenuButton = document.getElementById('profile-menu-button');
    const profileDropdownMenu = document.getElementById('profile-dropdown-menu');
    const profNameDropdown = document.getElementById('prof-name-dropdown');
    const verifiedBadgeDropdown = document.getElementById('verified-badge-dropdown');
    const verifiedBadgeCard = document.getElementById('verified-badge-card');
    const statusIndicator = document.getElementById('status-indicator');
    const toggleOnlineStatusButton = document.getElementById('toggle-online-status');
    const statusIconDropdown = toggleOnlineStatusButton.querySelector('i');
    const logoutButtonDropdown = document.getElementById('logout-button-dropdown');
    const logoutButtonSidebar = document.getElementById('logout-button-sidebar');

    // --- SELETORES DOS MODAIS ---
    const addAvailabilityButton = document.getElementById('btn-adicionar-disponibilidade');
    const availabilityModal = document.getElementById('availability-modal');
    const closeAvailabilityModalButton = document.getElementById('close-availability-modal-button');
    const cancelAvailabilityButton = document.getElementById('cancel-availability-button');
    const availabilityForm = document.getElementById('availability-form');
    const availabilityError = document.getElementById('availability-error');

    const btnVerHistorico = document.getElementById('btn-ver-historico');
    const historyModal = document.getElementById('history-modal');
    const closeHistoryModalButton = document.getElementById('close-history-modal-button');

    const btnVerAcompanhamento = document.getElementById('btn-ver-acompanhamento');
    const followUpModal = document.getElementById('follow-up-modal');
    const closeFollowUpModalButton = document.getElementById('close-follow-up-modal-button');

    const btnAnalisarMotivos = document.getElementById('btn-analisar-motivos');
    const cancellationsModal = document.getElementById('cancellations-modal');
    const closeCancellationsModalButton = document.getElementById('close-cancellations-modal-button');

    const btnVerAgenda = document.getElementById('btn-ver-agenda');
    const todayAppointmentsModal = document.getElementById('today-appointments-modal');
    const closeTodayAppointmentsModalButton = document.getElementById('close-today-appointments-modal-button');

    const btnVerAvaliacoes = document.getElementById('btn-ver-avaliacoes');
    const reviewsModal = document.getElementById('reviews-modal');
    const closeReviewsModalButton = document.getElementById('close-reviews-modal-button');

    const btnCompletarPerfil = document.getElementById('btn-completar-perfil');
    const publicProfileModal = document.getElementById('public-profile-modal');
    const closePublicProfileModalButton = document.getElementById('close-public-profile-modal-button');
    const publicProfileForm = document.getElementById('public-profile-form');
    const publicProfileError = document.getElementById('public-profile-error');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photosInput = document.getElementById('public-profile-photos');
    const cepInput = document.getElementById('public-profile-cep');
    const streetInput = document.getElementById('public-profile-street');
    const numberInput = document.getElementById('public-profile-number');
    const cityInput = document.getElementById('public-profile-city');
    const stateInput = document.getElementById('public-profile-state');
    const editPublicProfileDropdown = document.getElementById('edit-public-profile-dropdown');

    
    
    let currentUser = null;
    let isOnline = false;
    let existingPhotos = [];
    let newFilesToUpload = [];

    // --- FUNÇÕES AUXILIARES ---
    const openModal = (modal) => modal && modal.classList.remove('hidden');
    const closeModal = (modal) => modal && modal.classList.add('hidden');

   // --- LÓGICA PRINCIPAL ---
  onAuthStateChanged(auth, async (user) => {
      if (user) {
          currentUser = user;
          
          // 1. Carrega Métricas
          loadDashboardMetrics(); 
          loadTodayAppointments();
          setupNotificationsListener();
          loadRealEvaluations();
          
          // 2. Carrega Dados do Profissional
          const professionalDocRef = doc(db, 'profissionais', user.uid);
          const docSnap = await getDoc(professionalDocRef);
          
          let professionalData = {};
          if (docSnap.exists()) { 
              professionalData = docSnap.data(); 
          }

          calculateAndRenderProfileProgress(professionalData);
          
          // --- CORREÇÃO AUTOMÁTICA DE DATA ---
          // Se não tiver data de cadastro (contas antigas), define "Hoje" e salva no banco
          if (!professionalData.data_cadastro) {
              console.log("Conta antiga detetada: A adicionar data de cadastro automática...");
              const dataHoje = new Date().toISOString();
              // Salva no Firestore para ficar permanente
              try {
                  await setDoc(professionalDocRef, { data_cadastro: dataHoje }, { merge: true });
                  professionalData.data_cadastro = dataHoje; // Atualiza a variável local
              } catch (e) {
                  console.error("Erro ao salvar data automática:", e);
              }
          }
          // -----------------------------------
          
          const displayName = user.displayName || professionalData.nome || 'Profissional';

          // 3. Atualiza a Interface
          if (profName) profName.textContent = displayName;
          if (profWelcomeName) profWelcomeName.textContent = displayName;
          if (profNameDropdown) profNameDropdown.textContent = displayName;
          
          if (profPhoto) { 
              if (user.photoURL) { 
                  profPhoto.src = user.photoURL; 
              } else if (professionalData.foto_url) { 
                  profPhoto.src = professionalData.foto_url; 
              } 
          }
          
          if (professionalData.status_verificacao === 'aprovado') { 
              if (verifiedBadgeDropdown) verifiedBadgeDropdown.classList.remove('hidden'); 
              if (verifiedBadgeCard) verifiedBadgeCard.classList.remove('hidden'); 
          }

          // --- EXIBE A DATA ---
          const registerDateEl = document.getElementById('prof-register-date');
          if (registerDateEl && professionalData.data_cadastro) {
              try {
                  const dateObj = new Date(professionalData.data_cadastro);
                  const dateFmt = dateObj.toLocaleDateString('pt-BR');
                  registerDateEl.textContent = `Desde ${dateFmt}`;
              } catch (e) {
                  console.error("Erro ao formatar data:", e);
                  registerDateEl.textContent = "Desde 2025"; // Fallback
              }
          }

          updateStatusUI(professionalData.online_status || false);
          loadingOverlay.classList.add('hidden');
          dashboardWrapper.classList.remove('hidden');

      } else {
          window.location.href = 'professional-login.html';
      }
  });
    // --- FUNÇÕES E LISTENERS GERAIS ---
    const handleLogout = async () => { try { await signOut(auth); window.location.href = 'index.html'; } catch (error) { console.error("Erro ao sair:", error); alert("Ocorreu um erro ao tentar sair."); } };
    if (logoutButtonSidebar) logoutButtonSidebar.addEventListener('click', handleLogout);
    if (logoutButtonDropdown) logoutButtonDropdown.addEventListener('click', handleLogout);
    if (hamburgerMenu) { hamburgerMenu.addEventListener('click', () => { sidebarMenu.classList.toggle('open'); backdrop.classList.toggle('hidden'); }); }
    if (backdrop) { backdrop.addEventListener('click', () => { sidebarMenu.classList.remove('open'); backdrop.classList.add('hidden'); }); }
    if (profileMenuButton) { profileMenuButton.addEventListener('click', () => { const isExpanded = profileMenuButton.getAttribute('aria-expanded') === 'true'; profileMenuButton.setAttribute('aria-expanded', !isExpanded); profileDropdownMenu.classList.toggle('hidden'); }); }

    const updateStatusUI = (online) => { isOnline = online; if (statusIndicator) { statusIndicator.classList.toggle('status-online', isOnline); statusIndicator.classList.toggle('status-offline', !isOnline); } if (toggleOnlineStatusButton) { const statusText = toggleOnlineStatusButton.querySelector('span'); statusText.textContent = `Status: ${isOnline ? 'Online' : 'Offline'}`; if (statusIconDropdown) statusIconDropdown.style.color = isOnline ? 'var(--status-online)' : 'var(--status-offline)'; } };
    const saveStatusToFirestore = async (onlineStatus) => { if (!currentUser) return; const professionalDocRef = doc(db, 'profissionais', currentUser.uid); try { await setDoc(professionalDocRef, { online_status: onlineStatus }, { merge: true }); } catch (error) { console.error("Erro ao salvar o status:", error); } };
    if (toggleOnlineStatusButton) { toggleOnlineStatusButton.addEventListener('click', () => { const newStatus = !isOnline; updateStatusUI(newStatus); saveStatusToFirestore(newStatus); }); }

    // --- LÓGICA DOS MODAIS ---

    // Modal de Disponibilidade
    if (addAvailabilityButton) { addAvailabilityButton.addEventListener('click', () => { if (availabilityForm) availabilityForm.reset(); if (availabilityError) availabilityError.classList.add('hidden'); const eventDateInput = document.getElementById('event-date'); if (eventDateInput) eventDateInput.value = new Date().toISOString().split('T')[0]; openModal(availabilityModal); }); }
    if (closeAvailabilityModalButton) closeAvailabilityModalButton.addEventListener('click', () => closeModal(availabilityModal));
    if (cancelAvailabilityButton) cancelAvailabilityButton.addEventListener('click', () => closeModal(availabilityModal));
    if (availabilityModal) availabilityModal.addEventListener('click', (e) => { if (e.target === availabilityModal) closeModal(availabilityModal); });
    if (availabilityForm) { availabilityForm.addEventListener('submit', async (e) => { e.preventDefault(); if (!currentUser) return; availabilityError.classList.add('hidden'); const submitButton = availabilityForm.querySelector('button[type="submit"]'); submitButton.disabled = true; submitButton.textContent = "Adicionando..."; const date = document.getElementById('event-date').value; const startTime = document.getElementById('start-time').value; const endTime = document.getElementById('end-time').value; const valor = document.getElementById('consulta-valor').value; const isOnline = document.getElementById('toggle-online').checked; if (endTime <= startTime) { availabilityError.textContent = "A hora de fim deve ser posterior à hora de início."; availabilityError.classList.remove('hidden'); submitButton.disabled = false; submitButton.textContent = "Adicionar"; return; } try { const startDateTime = new Date(`${date}T${startTime}`); const endDateTime = new Date(`${date}T${endTime}`); const availabilityRef = collection(db, "disponibilidades_publicadas"); await addDoc(availabilityRef, { id_profissional: currentUser.uid, start: startDateTime, end: endDateTime, valor: parseFloat(valor), online: isOnline, status: 'disponivel', criado_em: serverTimestamp() }); closeModal(availabilityModal); alert("Disponibilidade adicionada com sucesso!"); } catch (error) { console.error("Erro ao salvar disponibilidade:", error); availabilityError.textContent = "Ocorreu um erro ao salvar. Tente novamente."; availabilityError.classList.remove('hidden'); } finally { submitButton.disabled = false; submitButton.textContent = "Adicionar"; } }); }

    // Modais dos Cards de Métricas
    if (btnVerHistorico) {
        btnVerHistorico.addEventListener('click', () => {
            console.log("Botão Ver Histórico clicado. Carregando dados reais...");
            loadPatientHistoryModal(); // <--- CHAMA A NOVA FUNÇÃO
        });
    }
    if (closeHistoryModalButton) closeHistoryModalButton.addEventListener('click', () => closeModal(historyModal));
    if (historyModal) historyModal.addEventListener('click', (e) => { if (e.target === historyModal) closeModal(historyModal); });

  
    if (btnVerAcompanhamento) {
        btnVerAcompanhamento.addEventListener('click', () => {
            console.log("Abrindo lista de pacientes em acompanhamento...");
            loadFollowUpPatientsModal(); // <--- CHAMA A NOVA FUNÇÃO
        });
    }
    if (closeFollowUpModalButton) closeFollowUpModalButton.addEventListener('click', () => closeModal(followUpModal));
    if (followUpModal) followUpModal.addEventListener('click', (e) => { if (e.target === followUpModal) closeModal(followUpModal); });

    if (closeCancellationsModalButton) closeCancellationsModalButton.addEventListener('click', () => closeModal(cancellationsModal));
    if (cancellationsModal) cancellationsModal.addEventListener('click', (e) => { if (e.target === cancellationsModal) closeModal(cancellationsModal); });

    // Modais dos Cards de Conteúdo
    // Listener do Botão "Ver Detalhes da Agenda"
  // (Antigamente abria um modal, agora redireciona para a Agenda Completa)
  
  
  if (btnVerAgenda) {
      btnVerAgenda.addEventListener('click', () => {
          console.log("Redirecionando para a Agenda Completa...");
          window.location.href = 'agenda_calendario.html';
      });
  }
    if (closeTodayAppointmentsModalButton) closeTodayAppointmentsModalButton.addEventListener('click', () => closeModal(todayAppointmentsModal));
    if (todayAppointmentsModal) todayAppointmentsModal.addEventListener('click', (e) => { if (e.target === todayAppointmentsModal) closeModal(todayAppointmentsModal); });

    if (closeReviewsModalButton) closeReviewsModalButton.addEventListener('click', () => closeModal(reviewsModal));
    if (reviewsModal) reviewsModal.addEventListener('click', (e) => { if (e.target === reviewsModal) closeModal(reviewsModal); });

    // Lógica do Modal de Perfil Público
    const openAndPopulatePublicProfileModal = async () => {
        if (!currentUser) return;
        publicProfileForm.reset();
        newFilesToUpload = [];
        publicProfileError.classList.add('hidden');
        const professionalDocRef = doc(db, 'profissionais', currentUser.uid);
        const docSnap = await getDoc(professionalDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const publicProfile = data.perfilPublico || {};
            const endereco = publicProfile.endereco || {};
            document.getElementById('public-profile-name').value = data.nome || '';
            document.getElementById('public-profile-category').value = data.especialidade || '';
            document.getElementById('public-profile-register').value = data.registro_profissional || '';
            document.getElementById('public-profile-experience').value = publicProfile.anosExperiencia || '';
            document.getElementById('public-profile-bio').value = publicProfile.bio || '';
            document.getElementById('public-profile-education').value = (publicProfile.formacao || []).join('\n');
            document.getElementById('public-profile-services').value = (publicProfile.servicos || []).join('\n');
            document.getElementById('public-profile-duration').value = publicProfile.duracaoConsulta || '';
            cepInput.value = endereco.cep || '';
            streetInput.value = endereco.rua || '';
            numberInput.value = endereco.numero || '';
            cityInput.value = endereco.cidade || '';
            stateInput.value = endereco.estado || '';
            document.getElementById('public-profile-plans').value = (publicProfile.convenios || []).join('\n');
            const modalities = publicProfile.modalidades || [];
            document.querySelectorAll('input[name="atendimento"]').forEach(checkbox => { checkbox.checked = modalities.includes(checkbox.value); });
            existingPhotos = publicProfile.fotosConsultorio || [];
            renderPhotoPreviews();
        }
        openModal(publicProfileModal);
    };

    if (btnCompletarPerfil) { btnCompletarPerfil.addEventListener('click', openAndPopulatePublicProfileModal); }
    if (editPublicProfileDropdown) { editPublicProfileDropdown.addEventListener('click', openAndPopulatePublicProfileModal); }
    if(closePublicProfileModalButton) { closePublicProfileModalButton.addEventListener('click', () => closeModal(publicProfileModal)); }

    if (cepInput) {
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            if (cep.length !== 8) return;
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) { streetInput.value = data.logradouro; cityInput.value = data.localidade; stateInput.value = data.uf; numberInput.focus(); } 
                else { alert("CEP não encontrado."); }
            } catch (error) { console.error("Erro ao buscar CEP:", error); alert("Ocorreu um erro ao buscar o CEP. Tente novamente."); }
        });
    }

    photosInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        const totalPhotos = existingPhotos.length + newFilesToUpload.length + files.length;
        if (totalPhotos > 5) {
            alert(`Você só pode ter no máximo 5 fotos. Você já tem ${existingPhotos.length + newFilesToUpload.length}, e tentou adicionar mais ${files.length}.`);
            photosInput.value = '';
            return;
        }
        newFilesToUpload.push(...files);
        renderPhotoPreviews();
    });

    function renderPhotoPreviews() {
        photoPreviewContainer.innerHTML = '';
        const allPhotos = [...existingPhotos, ...newFilesToUpload];

        allPhotos.forEach((photo, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'photo-preview';
            const isExisting = typeof photo === 'string';
            const id = isExisting ? photo : index - existingPhotos.length;

            wrapper.innerHTML = `<img src="${isExisting ? photo : URL.createObjectURL(photo)}" alt="Preview"><button type="button" class="remove-photo-btn" data-id="${id}" data-is-existing="${isExisting}">&times;</button>`;
            photoPreviewContainer.appendChild(wrapper);
        });

        document.querySelectorAll('.remove-photo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const isExisting = btn.dataset.isExisting === 'true';

                if (isExisting) {
                    existingPhotos = existingPhotos.filter(url => url !== id);
                } else {
                    newFilesToUpload.splice(parseInt(id), 1);
                }
                renderPhotoPreviews();
            });
        });
    }
    
    publicProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if(!currentUser) return;
        const submitButton = publicProfileForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = "Salvando...";
        publicProfileError.classList.add('hidden');
        try {
            const newPhotoUrls = [];
            for (const file of newFilesToUpload) {
                const photoRef = ref(storage, `public_photos/${currentUser.uid}/${Date.now()}_${file.name}`);
                await uploadBytes(photoRef, file);
                const url = await getDownloadURL(photoRef);
                newPhotoUrls.push(url);
            }
            const professionalDocRef = doc(db, 'profissionais', currentUser.uid);
            const docSnap = await getDoc(professionalDocRef);
            if (docSnap.exists()) {
                const oldPhotos = docSnap.data().perfilPublico?.fotosConsultorio || [];
                const photosToDelete = oldPhotos.filter(url => !existingPhotos.includes(url));
                for(const url of photosToDelete) {
                    try { const photoRef = ref(storage, url); await deleteObject(photoRef); }
                    catch (error) { if (error.code !== 'storage/object-not-found') { console.error("Erro ao deletar foto antiga:", error); } }
                }
            }
            const finalPhotoUrls = [...existingPhotos, ...newPhotoUrls];
            const profileData = {
                anosExperiencia: document.getElementById('public-profile-experience').value,
                bio: document.getElementById('public-profile-bio').value,
                formacao: document.getElementById('public-profile-education').value.split('\n').filter(Boolean),
                servicos: document.getElementById('public-profile-services').value.split('\n').filter(Boolean),
                modalidades: Array.from(document.querySelectorAll('input[name="atendimento"]:checked')).map(cb => cb.value),
                duracaoConsulta: document.getElementById('public-profile-duration').value,
                endereco: { cep: cepInput.value, rua: streetInput.value, numero: numberInput.value, cidade: cityInput.value, estado: stateInput.value },
                convenios: document.getElementById('public-profile-plans').value.split('\n').filter(Boolean),
                fotosConsultorio: finalPhotoUrls
            };
            await setDoc(doc(db, 'profissionais', currentUser.uid), { 
                perfilPublico: profileData,
                especialidade: document.getElementById('public-profile-category').value,
                registro_profissional: document.getElementById('public-profile-register').value
            }, { merge: true });
            alert("Perfil público salvo com sucesso!");
            closeModal(publicProfileModal);
        } catch (error) {
            console.error("Erro ao salvar perfil público:", error);
            publicProfileError.textContent = "Ocorreu um erro ao salvar. Tente novamente.";
            publicProfileError.classList.remove('hidden');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Salvar Perfil";
        }
    });

// ==========================================================
// FUNÇÃO: CARREGAR MÉTRICAS REAIS (COM COLLECTION GROUP)
// ==========================================================
async function loadDashboardMetrics() {
    if (!auth.currentUser) return;
    const medicoId = auth.currentUser.uid;

    console.log("Carregando métricas reais do dashboard...");

    try {
        // 1. TOTAL DE PACIENTES (Mantém-se igual: via Consultas Realizadas)
        const qPacientes = query(collection(db, "consultas"), where("medico_id", "==", medicoId));
        const snapPacientes = await getDocs(qPacientes);
        
        const pacientesUnicos = new Set();
        snapPacientes.forEach(doc => {
            const dados = doc.data();
            if (dados.paciente_id) pacientesUnicos.add(dados.paciente_id);
        });
        
        const elTotal = document.getElementById('count-total-pacientes');
        if (elTotal) elTotal.textContent = pacientesUnicos.size;

        // 2. EM ACOMPANHAMENTO (AQUI ESTÁ A CORREÇÃO)
        // Usamos 'collectionGroup' para buscar dentro das sub-coleções de TODOS os pacientes
        const qAcompanhamento = query(
            collectionGroup(db, "acompanhamentos"), 
            where("medico_id", "==", medicoId),
            where("status", "==", "Ativo") // Procura exatamente por "Ativo"
        );

        const snapAcomp = await getDocs(qAcompanhamento);
        let countAcomp = snapAcomp.size;
        
        // Fallback: Se der 0, tenta com 'ativo' minúsculo (caso haja dados antigos)
        if (countAcomp === 0) {
             const qAcompMin = query(
                 collectionGroup(db, "acompanhamentos"), 
                 where("medico_id", "==", medicoId), 
                 where("status", "==", "ativo")
             );
             const snapAcompMin = await getDocs(qAcompMin);
             if (snapAcompMin.size > 0) countAcomp = snapAcompMin.size;
        }

        console.log(`Acompanhamentos ativos encontrados (reais): ${countAcomp}`);
        const elAcomp = document.getElementById('count-em-acompanhamento');
        if (elAcomp) elAcomp.textContent = countAcomp;

        // 3. CONSULTAS CANCELADAS (Mantém-se igual)
        const trintaDiasAtras = new Date();
        trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

        const qCanceladas = query(
            collection(db, "agendamentos"), 
            where("profissional_id", "==", medicoId),
            where("status", "==", "cancelado")
        );
        
        const snapCanceladas = await getDocs(qCanceladas);
        let countCanceladas = 0;
        
        snapCanceladas.forEach(doc => {
            const dados = doc.data();
            let dataConsulta = null;
            if (dados.data && dados.data.toDate) dataConsulta = dados.data.toDate();
            else if (dados.data_hora) dataConsulta = new Date(dados.data_hora);
            
            if (dataConsulta && dataConsulta >= trintaDiasAtras) {
                countCanceladas++;
            }
        });

        const elCanceladas = document.getElementById('count-canceladas');
        if (elCanceladas) elCanceladas.textContent = countCanceladas;

    } catch (error) {
        console.error("Erro ao carregar métricas:", error);
        
        // Se pedir índice para Collection Group, avisa no console
        if (error.code === 'failed-precondition') {
            console.warn("Falta índice para Collection Group. Verifique o link no console.");
        }
    }
}
/**
 * CARREGA O HISTÓRICO DE PACIENTES ATENDIDOS (MODAL)
 * Versão Robusta: Ordenação via JS para evitar erros de índice.
 */
async function loadPatientHistoryModal() {
    const historyModal = document.getElementById('history-modal');
    const listContainer = historyModal.querySelector('.modal-body-list'); 
    
    if (!historyModal || !listContainer || !currentUser) return;

    openModal(historyModal);
    listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#888;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando atendimentos...</div>';

    try {
        console.log("Buscando histórico na coleção 'consultas'...");

        // 1. Busca na coleção CONSULTAS (Sem orderBy para não bloquear)
        const q = query(
            collection(db, "consultas"),
            where("medico_id", "==", currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const pacientesMap = new Map();

        console.log(`Encontrados ${querySnapshot.size} registros de consulta.`);

        if (querySnapshot.empty) {
            listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">Nenhuma consulta realizada ainda.</div>';
            return;
        }

        // 2. Processa os dados
        // (Usamos Promise.all para aguardar a busca dos nomes)
        const docsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Ordena em memória (Mais recente primeiro)
        docsArray.sort((a, b) => {
            const dataA = a.data_consulta?.toDate ? a.data_consulta.toDate() : new Date(0);
            const dataB = b.data_consulta?.toDate ? b.data_consulta.toDate() : new Date(0);
            return dataB - dataA;
        });

        // 3. Agrupa por Paciente (Apenas o mais recente de cada um)
        for (const data of docsArray) {
            // Se já temos este paciente no mapa, ignoramos (porque já temos a consulta mais recente dele)
            if (data.paciente_id && !pacientesMap.has(data.paciente_id)) {
                
                let nomePaciente = "Paciente";
                
                // Tenta buscar o nome se não estiver salvo na consulta
                if (data.paciente_nome) {
                    nomePaciente = data.paciente_nome;
                } else {
                    try {
                        const pacienteDocRef = doc(db, 'pacientes', data.paciente_id);
                        const pacienteDocSnap = await getDoc(pacienteDocRef);
                        if (pacienteDocSnap.exists()) {
                            nomePaciente = pacienteDocSnap.data().nome || "Paciente";
                        }
                    } catch (e) { console.error("Erro ao buscar nome:", e); }
                }

                // Guarda no mapa
                pacientesMap.set(data.paciente_id, {
                    id: data.paciente_id,
                    nome: nomePaciente,
                    dataUltima: data.data_consulta // Timestamp
                });
            }
        }

        // 4. Renderiza a Lista
        listContainer.innerHTML = '';

        if (pacientesMap.size === 0) {
            listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">Nenhum paciente encontrado.</div>';
            return;
        }

        pacientesMap.forEach(paciente => {
            let dataFormatada = "Data N/D";
            if (paciente.dataUltima && paciente.dataUltima.toDate) {
                dataFormatada = paciente.dataUltima.toDate().toLocaleDateString('pt-BR');
            }

            const item = document.createElement('div');
            item.className = 'list-item-static'; 
            item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee;';
            
            item.innerHTML = `
                <div>
                    <strong style="display:block; color:#333;">${paciente.nome}</strong>
                    <small style="color:#718096;">ID: ${paciente.id.substring(0, 5)}...</small>
                </div>
                <span class="list-item-detail" style="font-size: 0.85rem; color: #41b8d5; font-weight: 500;">
                    Última: ${dataFormatada}
                </span>
            `;
            
            listContainer.appendChild(item);
        });

    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        listContainer.innerHTML = '<p class="error-message">Erro ao carregar dados.</p>';
    }
}

/**
 * CARREGA A LISTA DE PACIENTES EM ACOMPANHAMENTO (MODAL)
 * Usa collectionGroup para achar planos ativos em qualquer paciente.
 */
async function loadFollowUpPatientsModal() {
    const modal = document.getElementById('follow-up-modal');
    const listContainer = modal.querySelector('.modal-body-list');
    
    if (!modal || !listContainer || !auth.currentUser) return;

    // 1. Abre modal e mostra loading
    openModal(modal);
    listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#888;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando acompanhamentos...</div>';

    try {
        const medicoId = auth.currentUser.uid;

        // 2. Busca planos ATIVOS (collectionGroup)
        // Nota: Se tiveres salvo com "Ativo" (maiúscula) ou "ativo" (minúscula), 
        // o código tenta ajustar, mas o ideal é garantir consistência.
        // Aqui busco por "Ativo" conforme vimos no teu código anterior.
        const q = query(
            collectionGroup(db, "acompanhamentos"),
            where("medico_id", "==", medicoId),
            where("status", "==", "Ativo") 
        );
        
        const querySnapshot = await getDocs(q);

        // Fallback: Se não achar nada, tenta com minúscula "ativo"
        let docs = querySnapshot.docs;
        if (docs.length === 0) {
            const qMin = query(collectionGroup(db, "acompanhamentos"), where("medico_id", "==", medicoId), where("status", "==", "ativo"));
            const snapMin = await getDocs(qMin);
            docs = snapMin.docs;
        }

        if (docs.length === 0) {
            listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">Nenhum paciente em acompanhamento ativo.</div>';
            return;
        }

        // 3. Busca os nomes dos pacientes (em paralelo para ser rápido)
        const listaProcessada = await Promise.all(docs.map(async (docSnap) => {
            const data = docSnap.data();
            const pacienteId = data.paciente_id;
            let nomePaciente = "Paciente";
            let fotoPaciente = null;

            // Busca dados do paciente
            if (pacienteId) {
                try {
                    const pDoc = await getDoc(doc(db, 'pacientes', pacienteId));
                    if (pDoc.exists()) {
                        nomePaciente = pDoc.data().nome || "Paciente";
                        fotoPaciente = pDoc.data().foto_url;
                    }
                } catch (e) { console.error("Erro nome:", e); }
            }

            return {
                id: docSnap.id,
                pacienteId: pacienteId,
                nome: nomePaciente,
                titulo: data.assinatura_digital?.especialidade || "Acompanhamento", // Título do plano (ex: Cardiologia)
                inicio: data.data_inicio ? new Date(data.data_inicio).toLocaleDateString('pt-BR') : 'N/D'
            };
        }));

        // 4. Renderiza a Lista
        listContainer.innerHTML = '';
        
        listaProcessada.forEach(item => {
            const link = document.createElement('a');
            link.href = `prontuario-paciente.html?id=${item.pacienteId}`; // Link para o prontuário
            link.className = 'list-item'; // Classe CSS original do teu modal
            link.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #eee; text-decoration: none; color: inherit;";
            
            link.innerHTML = `
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600; color: #333;">${item.nome}</span>
                    <span style="font-size: 0.8rem; color: #718096;">${item.titulo}</span>
                </div>
                <span class="list-item-detail" style="font-size: 0.85rem; color: #41b8d5; font-weight: 500;">
                    Desde ${item.inicio} <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; margin-left: 5px;"></i>
                </span>
            `;
            
            listContainer.appendChild(link);
        });

    } catch (error) {
        console.error("Erro ao carregar lista de acompanhamento:", error);
        listContainer.innerHTML = '<p class="error-message">Erro ao carregar dados.</p>';
    }
}

/**
 * CARREGA AS CONSULTAS DE HOJE NO DASHBOARD (Versão Sem Erro de Índice)
 * Busca, filtra por hoje e ordena via Javascript.
 */
async function loadTodayAppointments() {
    const listContainer = document.getElementById('today-appointments-list');
    if (!listContainer || !auth.currentUser) return;

    console.log("Carregando consultas de hoje para o dashboard...");

    try {
        // 1. Busca TODOS os agendamentos do médico (Sem orderBy para evitar travar)
        const q = query(
            collection(db, "agendamentos"),
            where("profissional_id", "==", currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const hojeString = new Date().toLocaleDateString('pt-BR');
        
        const consultasDeHoje = [];

        // 2. Processa e Filtra
        const promises = querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            if (data.status === 'cancelado') return null;

            // Converte data
            let dataObj = null;
            if (data.data_hora) dataObj = new Date(data.data_hora);
            else if (data.data && data.data.toDate) dataObj = data.data.toDate();

            if (!dataObj) return null;

            // VERIFICAÇÃO: É hoje?
            if (dataObj.toLocaleDateString('pt-BR') === hojeString) {
                
                // Busca nome do paciente
                let nomePaciente = data.paciente_nome || "Paciente";
                if (!data.paciente_nome && data.paciente_id) {
                    try {
                        const pDoc = await getDoc(doc(db, 'pacientes', data.paciente_id));
                        if (pDoc.exists()) nomePaciente = pDoc.data().nome;
                    } catch(e) {}
                }

                return {
                    hora: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    nome: nomePaciente,
                    tipo: data.tipo || 'Presencial',
                    timestamp: dataObj.getTime()
                };
            }
            return null;
        });

        const resultados = await Promise.all(promises);
        resultados.forEach(res => { if (res) consultasDeHoje.push(res); });

        // 3. Ordena por horário (Aqui no JS é seguro!)
        consultasDeHoje.sort((a, b) => a.timestamp - b.timestamp);

        // 4. Renderiza
        listContainer.innerHTML = '';
        
        if (consultasDeHoje.length === 0) {
            listContainer.innerHTML = '<p class="placeholder" style="font-size: 0.9rem; padding: 10px 0;">Nenhuma consulta hoje.</p>';
            return;
        }

        consultasDeHoje.forEach(consulta => {
            const iconClass = consulta.tipo === 'Online' ? 'fa-video' : 'fa-user';
            
            const li = document.createElement('li');
            li.style.marginBottom = "8px";
            li.innerHTML = `
                <strong style="color:#41b8d5;">${consulta.hora}</strong> 
                <span style="font-weight:500">${consulta.nome}</span> 
                <span style="font-size:0.75rem; color:#666; margin-left:4px;">
                    <i class="fa-solid ${iconClass}"></i>
                </span>
            `;
            listContainer.appendChild(li);
        });

    } catch (error) {
        console.error("Erro ao carregar consultas de hoje:", error);
        listContainer.innerHTML = '<p style="color:red; font-size:0.8rem;">Erro de conexão.</p>';
    }
}

/**
 * CARREGA E ABRE O MODAL "CONSULTAS DE HOJE" (Versão Depuração Total)
 * Tenta ler datas de todos os campos possíveis e não trava com erros.
 */
async function loadAndOpenTodayModal() {
    console.log(">>> INICIANDO CARGA DO MODAL DE HOJE (DEBUG) <<<");
    
    const modal = document.getElementById('today-appointments-modal');
    const listContainer = modal ? modal.querySelector('.modal-body-list') : null;
    
    if (!modal || !listContainer || !currentUser) {
        console.error("Erro: Modal, container ou utilizador não encontrados.");
        return;
    }

    // 1. Abre e mostra loading
    openModal(modal);
    listContainer.innerHTML = `
        <div style="text-align:center; padding:40px; color:#888;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem;"></i>
            <p style="margin-top:10px">A ler base de dados...</p>
        </div>`;

    try {
        // 2. Busca agendamentos (Sem ordenação para não bloquear)
        console.log("Passo 1: Consultando Firestore...");
        const q = query(
            collection(db, "agendamentos"),
            where("profissional_id", "==", currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        console.log(`Passo 2: Firestore retornou ${querySnapshot.size} documentos.`);

        const consultasHoje = [];
        const hojeString = new Date().toLocaleDateString('pt-BR'); // ex: "21/11/2025"

        // 3. Processamento Seguro
        const docs = querySnapshot.docs;
        
        for (const docSnap of docs) {
            try {
                const data = docSnap.data();
                
                // Ignora cancelados
                if (data.status === 'cancelado') continue;

                // --- DETETIVE DE DATAS ---
                // Tenta encontrar a data em qualquer campo possível
                let rawDate = data.data || data.data_hora || data.start;
                let dataObj = null;

                if (rawDate) {
                    // Se for Timestamp do Firestore
                    if (typeof rawDate.toDate === 'function') {
                        dataObj = rawDate.toDate();
                    } 
                    // Se for String ou Número
                    else {
                        dataObj = new Date(rawDate);
                    }
                }

                // Se a data for inválida, pula
                if (!dataObj || isNaN(dataObj.getTime())) {
                    // console.warn("Data inválida no documento:", docSnap.id);
                    continue;
                }

                // VERIFICA SE É HOJE
                const dataString = dataObj.toLocaleDateString('pt-BR');
                if (dataString === hojeString) {
                    console.log(`✅ Encontrado agendamento para hoje: ${docSnap.id}`);
                    
                    let nomePaciente = data.paciente_nome || "Paciente";
                    
                    // Se não tiver nome, tenta buscar (mas não trava se falhar)
                    if ((!data.paciente_nome || data.paciente_nome === "Paciente") && data.paciente_id) {
                        try {
                            const pDoc = await getDoc(doc(db, 'pacientes', data.paciente_id));
                            if (pDoc.exists()) nomePaciente = pDoc.data().nome;
                        } catch(e) { console.warn("Erro ao buscar nome (ignorado):", e); }
                    }

                    consultasHoje.push({
                        id: docSnap.id,
                        hora: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        nome: nomePaciente,
                        tipo: data.tipo || 'Presencial',
                        timestamp: dataObj.getTime()
                    });
                }
            } catch (errItem) {
                console.error("Erro ao processar item:", docSnap.id, errItem);
                // Continua para o próximo item mesmo com erro
            }
        }

        console.log(`Passo 3: ${consultasHoje.length} consultas encontradas para hoje.`);

        // 4. Ordena
        consultasHoje.sort((a, b) => a.timestamp - b.timestamp);

        // 5. Renderiza
        listContainer.innerHTML = '';

        if (consultasHoje.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state-mini" style="text-align: center; padding: 40px 20px; color: #888;">
                    <i class="fa-regular fa-calendar-xmark" style="font-size: 2.5rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p style="font-size: 1.1rem; font-weight: 500;">Não há atendimento para hoje.</p>
                    <small>Verifique a sua agenda completa.</small>
                </div>`;
            return;
        }

        consultasHoje.forEach(consulta => {
            const item = document.createElement('div');
            item.className = 'list-item-static';
            item.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #eee; background: white; border-radius: 8px; margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);";
            
            const iconClass = consulta.tipo === 'Online' ? 'fa-video' : 'fa-hospital-user';
            const iconColor = consulta.tipo === 'Online' ? '#3182ce' : '#38a169';

            item.innerHTML = `
                <div style="display:flex; align-items:center; gap:15px;">
                    <strong style="color:#41b8d5; font-size:1.1rem; background: #e6fffa; padding: 4px 8px; border-radius: 6px;">${consulta.hora}</strong> 
                    <span style="font-weight:600; color:#333; font-size: 1rem;">${consulta.nome}</span>
                </div>
                <span class="list-item-detail" style="font-size: 0.8rem; color: #718096; display:flex; align-items:center; gap:6px; background: #f7fafc; padding: 4px 10px; border-radius: 20px;">
                    <i class="fa-solid ${iconClass}" style="color: ${iconColor}"></i> ${consulta.tipo}
                </span>
            `;
            listContainer.appendChild(item);
        });

    } catch (error) {
        console.error("CRÍTICO: Erro ao carregar modal de hoje:", error);
        listContainer.innerHTML = `<p class="error-message" style="text-align:center; padding:20px;">Erro: ${error.message}</p>`;
    }
}

/**
 * CALCULA E ATUALIZA A BARRA DE PROGRESSO DO PERFIL
 * Verifica 10 campos essenciais.
 */
function calculateAndRenderProfileProgress(profData) {
    const publico = profData.perfilPublico || {};
    let score = 0;
    const totalPoints = 10; 

    // 1. Foto de Perfil
    if (profData.foto_url) score++;

    // 2. Dados Básicos
    if (profData.nome && profData.especialidade) score++;

    // 3. Registro Profissional
    if (profData.registro_profissional) score++;

    // 4. Biografia
    if (publico.bio && publico.bio.length > 10) score++;

    // 5. Anos de Experiência
    if (publico.anosExperiencia) score++;

    // 6. Modalidades
    if (publico.modalidades && publico.modalidades.length > 0) score++;

    // 7. Preços
    if (profData.preco_online > 0 || profData.preco_presencial > 0 || profData.preco_domiciliar > 0) score++;

    // 8. Formação
    if (publico.formacao && publico.formacao.length > 0) score++;

    // 9. Serviços
    if (publico.servicos && publico.servicos.length > 0) score++;

    // 10. Endereço ou Fotos
    const temEndereco = publico.endereco && publico.endereco.rua;
    const temFotos = publico.fotosConsultorio && publico.fotosConsultorio.length > 0;
    if (temEndereco || temFotos) score++;

    // Calcula percentagem
    const percentage = (score / totalPoints) * 100;

    // --- ATUALIZA A TELA ---
    const barFill = document.getElementById('profile-progress-fill');
    const textLabel = document.getElementById('profile-progress-text');

    if (barFill && textLabel) {
        barFill.style.width = `${percentage}%`;
        textLabel.textContent = `${percentage}%`;
        
        // CORREÇÃO: Mantém AZUL mesmo quando está 100% completo
        if (percentage === 100) {
            barFill.style.backgroundColor = '#41b8d5'; // Azul Orion
        } else {
            barFill.style.backgroundColor = '#41b8d5'; // Azul Orion
        }
    }
}

// ==========================================================
// SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL
// ==========================================================

/**
 * Inicia o ouvinte de notificações para o médico logado
 */
/**
 * ESCUTA NOTIFICAÇÕES (Versão de Diagnóstico)
 */
function setupNotificationsListener() {
    console.log(">>> INICIANDO LISTENER DE NOTIFICAÇÕES <<<");

    if (!currentUser) {
        console.error("ERRO: setupNotificationsListener chamado sem utilizador logado!");
        return;
    }

    const medicoId = currentUser.uid;
    console.log(`Escutando notificações para o Médico ID: ${medicoId}`);

    const notifRef = collection(db, 'profissionais', medicoId, 'notificacoes');
    
    // Tenta sem ordenação primeiro para garantir que não é erro de índice
    const q = query(notifRef); 

    onSnapshot(q, (snapshot) => {
        console.log(`RECEBIDO SNAPSHOT! Total de documentos: ${snapshot.size}`);
        
        const lista = [];
        let unreadCount = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log("Notificação encontrada:", data); // Mostra o que achou
            lista.push({ id: doc.id, ...data });
            if (!data.lida) unreadCount++;
        });

        // Atualiza a UI
        updateNotificationBadge(unreadCount);
        renderNotificationsList(lista);
        
    }, (error) => {
        console.error("ERRO NO OUVINTE DE NOTIFICAÇÕES:", error);
    });
}

/**
 * Atualiza o número vermelho no sino
 */
function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;

    if (count > 0) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

/**
 * Desenha a lista de mensagens no dropdown
 */
function renderNotificationsList(notificacoes) {
    const container = document.getElementById('notification-list');
    if (!container) return;

    container.innerHTML = '';

    if (notificacoes.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #888;">
                <i class="fa-regular fa-bell-slash" style="font-size: 1.5rem; opacity: 0.5;"></i>
                <p style="margin-top:8px; font-size:0.9rem;">Sem notificações.</p>
            </div>`;
        return;
    }

    
    notificacoes.forEach(notif => {
        // Formata hora
        let timeAgo = 'Agora';
        if (notif.timestamp) {
            const date = notif.timestamp.toDate();
            timeAgo = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            // Se não for hoje, mostra a data
            if (date.getDate() !== new Date().getDate()) {
                timeAgo = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            }
        }

        const icon = notif.tipo === 'agendamento' ? 'fa-calendar-check' : 
                     notif.tipo === 'acompanhamento' ? 'fa-chart-line' : 'fa-info-circle';

        const item = document.createElement('div');
        item.className = `notification-item ${notif.lida ? '' : 'unread'}`;
        item.innerHTML = `
            <i class="fa-solid ${icon} notif-icon"></i>
            <div class="notif-content">
                <strong class="notif-title">${notif.titulo}</strong>
                <p class="notif-text">${notif.mensagem}</p>
                <span class="notif-time">${timeAgo}</span>
            </div>
        `;
        
        // Clique na notificação: Marca como lida e vai para o link (se houver)
        item.addEventListener('click', async () => {
            await markAsRead(notif.id);
            if (notif.link) {
                window.location.href = notif.link;
            }
        });

        container.appendChild(item);
    });
}

/**
 * Marca uma notificação como lida no Firestore
 */
async function markAsRead(notifId) {
    if (!currentUser) return;
    try {
        const ref = doc(db, 'profissionais', currentUser.uid, 'notificacoes', notifId);
        await updateDoc(ref, { lida: true });
    } catch (e) { console.error("Erro ao marcar lida", e); }
}

// --- LISTENERS DOS BOTÕES ---
const btnNotif = document.getElementById('btn-notificacoes');
const dropNotif = document.getElementById('notification-dropdown');

if (btnNotif && dropNotif) {
    btnNotif.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede fechar imediato
        dropNotif.classList.toggle('hidden');
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
        if (!btnNotif.contains(e.target) && !dropNotif.contains(e.target)) {
            dropNotif.classList.add('hidden');
        }
    });
}

// LISTENER DO BOTÃO "LIMPAR TODAS"
const btnLimparNotificacoes = document.getElementById('btn-marcar-lidas');

if (btnLimparNotificacoes) {
    btnLimparNotificacoes.addEventListener('click', (e) => {
        // Impede que o clique feche o menu
        e.stopPropagation(); 
        // Chama a função
        markAllNotificationsAsRead();
    });
}

/**
 * MARCAR TODAS AS NOTIFICAÇÕES COMO LIDAS
 * (Remove o número vermelho do sino)
 */
async function markAllNotificationsAsRead() {
    if (!currentUser) return;
    console.log("Marcando todas as notificações como lidas...");

    try {
        const batch = writeBatch(db);
        
        // Busca apenas as não lidas para economizar recursos
        const q = query(
            collection(db, 'profissionais', currentUser.uid, 'notificacoes'),
            where("lida", "==", false)
        );
        
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("Nenhuma notificação pendente para limpar.");
            return;
        }

        // Adiciona cada atualização ao pacote
        snapshot.forEach(doc => {
            batch.update(doc.ref, { lida: true });
        });

        // Envia tudo de uma vez
        await batch.commit();
        console.log("Sucesso! Notificações limpas.");
        
        // A interface atualiza-se sozinha graças ao listener em tempo real

    } catch (error) {
        console.error("Erro ao limpar notificações:", error);
    }
}

/**
 * CARREGA O HISTÓRICO DE CONSULTAS CANCELADAS (Versão Final - Busca Nome Real)
 */
async function loadCancelledHistory() {
    const modal = document.getElementById('history-modal');
    const listContainer = modal.querySelector('.modal-body-list');
    const title = modal.querySelector('.modal-title');

    if (!modal || !listContainer || !currentUser) return;

    openModal(modal);
    if (title) title.innerHTML = '<i class="fa-solid fa-ban"></i> Histórico de Cancelamentos';
    
    listContainer.innerHTML = `
        <div style="text-align:center; padding:30px; color:#888;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem;"></i>
            <p style="margin-top:10px">A carregar cancelamentos...</p>
        </div>`;

    try {
        // 1. Busca Agendamentos Cancelados
        const q = query(
            collection(db, "agendamentos"),
            where("profissional_id", "==", currentUser.uid),
            where("status", "==", "cancelado")
        );
        
        const querySnapshot = await getDocs(q);
        listContainer.innerHTML = '';

        if (querySnapshot.empty) {
            listContainer.innerHTML = `
                <div class="empty-state-mini" style="text-align: center; padding: 30px 20px; color: #888;">
                    <i class="fa-regular fa-calendar-check" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>Nenhuma consulta cancelada.</p>
                </div>`;
            return;
        }

        // 2. Processa a Lista (com busca de nomes em paralelo)
        const promises = querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            // Formata Data
            let dataFmt = "Data N/D";
            if (data.data_hora) {
                const d = new Date(data.data_hora);
                dataFmt = d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
            } else if (data.data && data.data.toDate) {
                const d = data.data.toDate();
                dataFmt = d.toLocaleDateString('pt-BR');
            }

            const motivo = data.motivo_cancelamento || "Motivo não informado";
            const quemCancelou = data.cancelado_por === 'paciente' ? 'Pelo Paciente' : 'Pelo Profissional';
            
            // DETETIVE DE NOME:
            let nomePaciente = data.paciente_nome;
            
            // Se o nome for genérico ou vazio, busca no perfil
            if ((!nomePaciente || nomePaciente === 'Paciente') && data.paciente_id) {
                try {
                    const pDoc = await getDoc(doc(db, 'pacientes', data.paciente_id));
                    if (pDoc.exists()) {
                        nomePaciente = pDoc.data().nome;
                    }
                } catch (e) { console.warn("Erro ao buscar nome:", e); }
            }

            return {
                nome: nomePaciente || "Paciente (Sem Nome)",
                motivo: motivo,
                quem: quemCancelou,
                data: dataFmt
            };
        });

        const listaFinal = await Promise.all(promises);

        // 3. Renderiza
        listaFinal.forEach(item => {
            const card = document.createElement('div');
            card.className = 'list-item-static';
            card.style.cssText = "padding: 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: white; margin-bottom: 8px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);";
            
            card.innerHTML = `
                <div>
                    <strong style="color:#333; display:block; font-size:1rem;">${item.nome}</strong>
                    <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
                        <span style="font-size:0.8rem; color:#c53030; font-weight:600; background:#fff5f5; padding:2px 8px; border-radius:4px; border: 1px solid #feb2b2;">
                            ${item.motivo}
                        </span>
                        <span style="font-size:0.75rem; color:#718096;">${item.quem}</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <span style="font-size:0.75rem; color:#718096; display:block; margin-bottom:2px;">Agendada para:</span>
                    <strong style="font-size: 0.85rem; color: #2d3748;">${item.data}</strong>
                </div>
            `;
            
            listContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao carregar cancelamentos:", error);
        listContainer.innerHTML = '<p class="error-message" style="text-align:center;">Erro ao carregar dados.</p>';
    }
}

// Botão "Analisar Motivos" (Card Vermelho)
    const btnAnalisarCancelamentos = document.getElementById('btn-analisar-motivos');
    if (btnAnalisarCancelamentos) {
        btnAnalisarCancelamentos.addEventListener('click', () => {
            console.log("Abrindo histórico de cancelamentos...");
            loadCancelledHistory(); // <--- CHAMA A NOVA FUNÇÃO
        });
    }

/**
 * CARREGA AVALIAÇÕES REAIS DO MÉDICO (Seletores Corrigidos)
 */
async function loadRealEvaluations() {
    // --- SELETORES AJUSTADOS AO SEU HTML ---
    const ratingValueEl = document.querySelector('.rating-score'); // Era .rating-value
    const ratingStarsEl = document.querySelector('.stars');       // Era .rating-stars
    const ratingQuoteEl = document.querySelector('.quote');       // Era .rating-quote
    const btnVerTodas = document.getElementById('btn-ver-avaliacoes');

    if (!currentUser) return;

    try {
        const q = query(
            collection(db, 'avaliacoes'),
            where('profissional_id', '==', currentUser.uid),
            orderBy('data', 'desc')
        );

        const snapshot = await getDocs(q);
        const avaliacoes = [];
        let somaNotas = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            avaliacoes.push({ id: doc.id, ...data });
            somaNotas += (data.nota || 0);
        });

        // Calcula Média
        let media = 0;
        if (avaliacoes.length > 0) {
            media = somaNotas / avaliacoes.length;
        }

        // Atualiza Visual
        if (ratingValueEl) ratingValueEl.textContent = `${media.toFixed(1)}/5.0`;
        
        if (ratingStarsEl) {
            let html = '';
            for (let i = 1; i <= 5; i++) {
                // Usa classes do FontAwesome conforme seu HTML
                if (i <= Math.round(media)) {
                    html += '<i class="fa-solid fa-star" aria-hidden="true" style="color: #f59e0b;"></i>';
                } else {
                    html += '<i class="fa-solid fa-star" aria-hidden="true" style="color: #e2e8f0;"></i>';
                }
            }
            // Adiciona contagem pequena ao lado
            html += `<span style="font-size:0.8rem; color:#666; margin-left:5px;">(${avaliacoes.length})</span>`;
            ratingStarsEl.innerHTML = html;
        }

        if (ratingQuoteEl) {
            if (avaliacoes.length > 0) {
                const recente = avaliacoes[0];
                // Formata o comentário com aspas, igual ao seu design original
                ratingQuoteEl.innerHTML = `"${recente.comentario || '...'}" <br><span style="font-size:0.8rem; font-style:normal;">- ${recente.paciente_nome || 'Paciente'}</span>`;
            } else {
                ratingQuoteEl.textContent = "\"Ainda não possui avaliações.\"";
            }
        }

        // Configura o Botão "Ver Todas"
        if (btnVerTodas) {
            const novoBtn = btnVerTodas.cloneNode(true);
            btnVerTodas.parentNode.replaceChild(novoBtn, btnVerTodas);
            
            novoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openAvaliacoesModalReal(avaliacoes);
            });
        }

    } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
    }
}
/**
 * Gera o HTML das estrelas (amarelas e cinzas)
 */
function generateStarsHTML(nota) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.round(nota)) {
            html += '<i class="fa-solid fa-star" style="color: #f59e0b;"></i>'; // Amarela
        } else {
            html += '<i class="fa-solid fa-star" style="color: #e2e8f0;"></i>'; // Cinza
        }
    }
    return html;
}
/**
 * Abre o Modal com a lista completa (Versão Final)
 */
function openAvaliacoesModalReal(lista) {
    console.log("Abrindo modal de avaliações com", lista.length, "itens.");
    
    // Tenta encontrar o modal pelo ID que você tem no HTML
    const modal = document.getElementById('reviews-modal') || document.getElementById('avaliacoes-modal');
    
    if (!modal) {
        console.error("Modal de avaliações não encontrado no HTML.");
        return;
    }

    // Tenta encontrar a lista. Se não achar pelo ID, tenta pela classe.
    let container = document.getElementById('lista-avaliacoes-completa') || modal.querySelector('.modal-body-list');
    
    if (!container) {
        console.error("Container da lista não encontrado dentro do modal.");
        return;
    }

    // 1. LIMPEZA TOTAL (Remove os dados Mock)
    container.innerHTML = '';

    // 2. Preenche com dados reais
    if (lista.length === 0) {
        container.innerHTML = '<p style="padding:20px; text-align:center; color:#888;">Nenhuma avaliação encontrada.</p>';
    } else {
        lista.forEach(av => {
            let dataFmt = '';
            if (av.data) {
                 const d = av.data.toDate ? av.data.toDate() : new Date(av.data);
                 dataFmt = d.toLocaleDateString('pt-BR');
            }

            let estrelas = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.round(av.nota)) {
                    estrelas += '<i class="fa-solid fa-star" style="color: #f59e0b; margin-right:2px;"></i>';
                } else {
                    estrelas += '<i class="fa-solid fa-star" style="color: #e2e8f0; margin-right:2px;"></i>';
                }
            }
            
            const item = document.createElement('div');
            item.className = 'review-item'; // Mantém o estilo original se existir
            item.style.cssText = "border-bottom: 1px solid #eee; padding: 15px 0; margin-bottom: 10px;";
            
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <strong style="color:#333; font-size:1rem;">${av.paciente_nome || 'Paciente'}</strong>
                    <small style="color:#999;">${dataFmt}</small>
                </div>
                <div style="margin-bottom:8px;">${estrelas}</div>
                <p style="color:#555; font-size:0.95rem; margin:0; line-height:1.4;">"${av.comentario || ''}"</p>
            `;
            container.appendChild(item);
        });
    }
    
    // 3. Abre o modal
    // Usa a função auxiliar openModal se ela existir globalmente, senão faz manual
    if (typeof openModal === 'function') {
        openModal(modal);
    } else {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
}

});