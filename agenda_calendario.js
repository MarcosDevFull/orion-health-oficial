/* ==========================================================
   FICHEIRO: agenda_calendario.js (V7.0 - Leitura de Agendamentos Reais)
   Exibe Disponibilidades (Vagas) e Agendamentos (Consultas) no mesmo calendário.
   ========================================================== */

// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp, query, where, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

    // --- SELETORES ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const pageWrapper = document.getElementById('page-wrapper');
    const calendarEl = document.getElementById('calendar');
   
    // Modais
    const availabilityModal = document.getElementById('availability-modal');
    const editAvailabilityModal = document.getElementById('edit-availability-modal');
    const availabilityForm = document.getElementById('availability-form');
    const editAvailabilityForm = document.getElementById('edit-availability-form');
    const addAvailabilityButton = document.getElementById('add-availability-button');
    const deleteAvailabilityButton = document.getElementById('delete-availability-button');
    const availabilityError = document.getElementById('availability-error');
    const editAvailabilityError = document.getElementById('edit-availability-error');
   
    // Modais de Ação
    const dayActionModal = document.getElementById('day-action-modal');
    const closeDayActionModalButton = document.getElementById('close-day-action-modal');
    const dayActionDateEl = document.getElementById('day-action-date');
    const btnOpenAvailabilityForm = document.getElementById('btn-open-availability-form');
    const btnViewDayAgenda = document.getElementById('btn-view-day-agenda');
   
    // Modal Detalhes
    const dayDetailsModal = document.getElementById('day-details-modal');
    const closeDayDetailsModalButton = document.getElementById('close-day-details-modal');
    const dayDetailsTitle = document.getElementById('day-details-modal-title');
    const dayDetailsList = document.getElementById('day-details-list');
    const dayDetailsEmpty = document.getElementById('day-details-empty');

    let currentUser = null;
    let calendar = null;
    let eventData = [];
    let selectedDateInfo = null;
    

    // --- FUNÇÕES AUXILIARES ---
    const openModal = (modal) => modal.classList.remove('hidden');
    const closeModal = (modal) => modal.classList.add('hidden');
   
    const toLocalISOString = (date) => {
        const pad = (num) => (num < 10 ? '0' : '') + num;
        return {
            date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
            time: `${pad(date.getHours())}:${pad(date.getMinutes())}`
        };
    };

    // --- LÓGICA PRINCIPAL ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user;
            initializePage();
        } else {
            window.location.href = 'professional-login.html';
        }
    });

    async function initializePage() {
        console.log("initializePage: Iniciando...");
        try {
            initializeCalendar();

            if (!calendar) {
                console.error("Falha ao inicializar o calendário.");
                return;
            }

            // Carrega TODOS os eventos (Disponibilidades + Agendamentos)
            const fetchedEvents = await loadAllEvents();
           
            eventData = fetchedEvents;
            calendar.removeAllEvents();
            calendar.addEventSource(eventData);
           
            updateDayCellClasses();
           
            // Atualiza a barra lateral com as próximas consultas
            renderUpcomingAppointments(eventData);

            window.addEventListener('resize', updateCalendarView);
            addEventListeners();

        } catch (error) {
            console.error("Erro ao inicializar:", error);
            alert("Ocorreu um erro ao carregar a agenda.");
        } finally {
            loadingOverlay.classList.add('hidden');
            pageWrapper.classList.remove('hidden');
            setTimeout(() => {
                if (calendar) {
                    calendar.updateSize();
                    updateCalendarView();
                }
            }, 100);
        }
    }
// =================================================================
// FUNÇÃO DE CARREGAMENTO (CORRIGIDA COM CORES POR TIPO)
// =================================================================
async function loadAllEvents() {
    if (!currentUser) return [];
    console.log("loadAllEvents: A carregar agenda com cores corretas...");
    
    const todosEventos = [];

    try {
        // 1. DISPONIBILIDADES (Mantém igual - Azul Claro)
        const availRef = collection(db, "disponibilidades_publicadas");
        const qAvail = query(availRef, where("id_profissional", "==", currentUser.uid));
        const availSnap = await getDocs(qAvail);

        availSnap.forEach(doc => {
            const data = doc.data();
            let start, end;
            if (data.start && data.start.toDate) { start = data.start.toDate(); end = data.end.toDate(); } 
            else if (data.data) { start = new Date(data.data + 'T' + data.start_time); end = new Date(data.data + 'T' + data.end_time); }

            if (start && end) {
                todosEventos.push({
                    id: doc.id,
                    start: start,
                    end: end,
                    display: 'background',
                    color: '#a0d9e5',
                    classNames: ['fc-event-availability'],
                    extendedProps: { type: 'disponibilidade' }
                });
            }
        });

        // 2. AGENDAMENTOS (Aqui está a correção de cor)
        const agendamentosRef = collection(db, "agendamentos");
        const qAgend = query(agendamentosRef, where("profissional_id", "==", currentUser.uid));
        const agendSnap = await getDocs(qAgend);

        const agendamentosPromises = agendSnap.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            
            if (data.status === 'cancelado') return null;

            let pacienteNome = "Paciente";
            if (data.paciente_id) {
                try {
                    const pDoc = await getDoc(doc(db, 'pacientes', data.paciente_id));
                    if (pDoc.exists()) pacienteNome = pDoc.data().nome;
                } catch (e) {}
            }

            let dataInicio;
            if (data.data && data.data.toDate) dataInicio = data.data.toDate();
            else if (data.data_hora) dataInicio = new Date(data.data_hora);
            else return null;

            const dataFim = new Date(dataInicio.getTime() + 30 * 60000);

            // --- LÓGICA DE COR E TIPO ---
            const tipoNorm = (data.tipo || "").toLowerCase();
            let corEvento = '#28a745'; // Verde (Presencial Padrão)
            let tituloEvento = pacienteNome; // Só o nome por padrão

            if (tipoNorm.includes('online')) {
                corEvento = '#3182ce'; // Azul (Online)
                tituloEvento = `📹 ${pacienteNome}`; // Ícone de câmera
            } else if (tipoNorm.includes('domiciliar')) {
                corEvento = '#805ad5'; // Roxo (Domiciliar)
                tituloEvento = `🏠 ${pacienteNome}`; // Ícone de casa
            }
            // -----------------------------

            return {
                id: docSnapshot.id,
                title: tituloEvento,
                start: dataInicio,
                end: dataFim,
                color: corEvento, // <--- AQUI APLICAMOS A COR
                classNames: ['fc-event-appointment'],
                extendedProps: {
                    type: 'agendado',
                    patientId: data.paciente_id,
                    patientName: pacienteNome,
                    status: data.status,
                    tipo: data.tipo || 'Presencial' // Passa o tipo original para a lista lateral
                }
            };
        });

        const agendamentosProcessados = await Promise.all(agendamentosPromises);
        agendamentosProcessados.forEach(evt => { if (evt) todosEventos.push(evt); });

    } catch (error) { console.error("Erro agenda:", error); }

    if (typeof calendar !== 'undefined' && calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(todosEventos);
    }

    if (typeof renderUpcomingAppointments === 'function') {
        renderUpcomingAppointments(todosEventos); 
    }

    return todosEventos;
}
    // Função auxiliar para atualizar classes CSS dos dias
    function updateDayCellClasses() {
        if (!calendar || !calendarEl) return;
        const dayCells = calendarEl.querySelectorAll('.fc-daygrid-day');
        dayCells.forEach(cell => {
            const dateStr = cell.getAttribute('data-date');
            if (!dateStr) return;
            const cellDate = new Date(dateStr + 'T00:00:00');
            const hasEvents = eventData.some(event => {
                const eventStartDate = event.start instanceof Date ? event.start : new Date(event.start);
                return eventStartDate.toDateString() === cellDate.toDateString();
            });
            if (hasEvents) {
                cell.classList.add('fc-day-has-events');
            } else {
                cell.classList.remove('fc-day-has-events');
            }
        });
    }

    function updateCalendarView() {
        if (!calendar) return;
        if (calendar.view.type !== 'dayGridMonth') {
            calendar.changeView('dayGridMonth');
        }
        calendar.updateSize();
    }

    function initializeCalendar() {
        if (calendar) { calendar.destroy(); calendar = null; }
        if (!calendarEl) return;

        calendar = new FullCalendar.Calendar(calendarEl, {
            locale: 'pt-br',
            initialView: 'dayGridMonth',
            headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,listWeek' },
            buttonText: { today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia', list: 'Lista' },
            height: 'auto',
            aspectRatio: 1.8,
            editable: false,
            selectable: false,
           
            dateClick: function(info) {
                selectedDateInfo = info;
                const clickedDate = info.date;
                const userTimezoneOffset = clickedDate.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(clickedDate.getTime() + userTimezoneOffset);
                const formattedDate = adjustedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                if (dayActionDateEl) { dayActionDateEl.textContent = formattedDate; }
                openModal(dayActionModal);
            },
           
            eventClick: function(info) {
                handleEventClick(info.event);
            },

            datesSet: function(dateInfo) {
                setTimeout(updateDayCellClasses, 50);
            }
        });
        calendar.render();
    }

   // --- RENDERIZA LISTA LATERAL (Versão Segura - Sem onclick no HTML) ---
function renderUpcomingAppointments(allEvents) {
    const container = document.getElementById('upcoming-appointments-list') || 
                      document.getElementById('proximas-consultas-lista');
    const countEl = document.getElementById('upcoming-count');

    if (!container) return;

    // 1. Remove listeners antigos (clonando o container) para evitar duplicados
    const newContainer = container.cloneNode(false);
    container.parentNode.replaceChild(newContainer, container);
    const listContainer = newContainer; // Agora usamos este limpo

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // 2. FILTRO
    const upcoming = allEvents
        .filter(event => {
            const props = event.extendedProps || event;
            const pacienteId = props.paciente_id || event.paciente_id || props.patientId;
            if (!pacienteId) return false;

            const status = (props.status || props.status_confirmacao || '').toLowerCase();
            if (status === 'realizada' || status === 'concluída' || status === 'cancelada') return false;

            const dataRaw = event.start || event.data_hora || props.data_hora;
            const evtDate = new Date(dataRaw);
            const evtDateDia = new Date(evtDate);
            evtDateDia.setHours(0,0,0,0);

            return evtDateDia >= now;
        })
        .sort((a, b) => new Date(a.start || a.data_hora) - new Date(b.start || b.data_hora))
        .slice(0, 20);

    if (countEl) countEl.textContent = `${upcoming.length} consulta${upcoming.length !== 1 ? 's' : ''}`;

    if (upcoming.length === 0) {
        listContainer.innerHTML = `<div class="empty-state-mini" style="text-align:center; padding:20px; color:#888;"><p>Sem consultas próximas.</p></div>`;
        return;
    }

    // 3. RENDERIZAÇÃO
    upcoming.forEach(event => {
        const props = event.extendedProps || event;
        const pacienteId = props.paciente_id || event.paciente_id || props.patientId;
        const pacienteNome = props.paciente_nome || props.patientName || event.title || 'Paciente';
        const status = props.status || props.status_confirmacao || 'Confirmado';
        const tipo = props.tipo || 'Presencial';
        
        const dateObj = new Date(event.start || event.data_hora);
        const dia = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const hora = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        let statusClass = 'bg-green-100 text-green-800';
        if (status.toLowerCase().includes('pendente')) statusClass = 'bg-yellow-100 text-yellow-800';

        // Prepara links
        const urlProntuario = `prontuario-paciente.html?id=${pacienteId}&tipo=${tipo}`;
        
        // Lógica do Botão
        let botaoHTML = '';
        const tipoLower = tipo.toLowerCase();
        const isOnline = tipoLower.includes('online') || tipoLower.includes('vídeo');
        
        if (isOnline) {
            const nomeSala = `OrionHealth_Consulta_${event.id}`;
            const nomeMedico = currentUser ? (currentUser.displayName || "Dr. Orion") : "Médico";
            const urlJitsi = `https://meet.jit.si/${nomeSala}#userInfo.displayName="${encodeURIComponent(nomeMedico)}"`;
            
            // Botão de Vídeo (Azul Escuro)
            botaoHTML = `
                <button class="btn-video action-btn" 
                    data-video="${urlJitsi}" 
                    data-prontuario="${urlProntuario}"
                    style="background: #3182ce; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                    <i class="fa-solid fa-video"></i> Acessar Sala
                </button>`;
        } else {
            // Botão Normal (Azul Claro)
            botaoHTML = `
                <button class="btn-atender action-btn" 
                    data-prontuario="${urlProntuario}"
                    style="background: #41b8d5; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 500;">
                    Atender
                </button>`;
        }

        const card = document.createElement('div');
        card.className = 'appointment-card-side';
        card.style.cssText = "background: white; padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #eee; display: flex; align-items: center; gap: 10px; transition: transform 0.2s;";
        
        card.innerHTML = `
            <div class="time-box" style="background: #41b8d5; padding: 6px 10px; border-radius: 8px; text-align: center; min-width: 60px; color: white;">
                <span style="display: block; font-weight: 700; font-size: 1rem; line-height: 1;">${hora}</span>
                <span style="display: block; font-size: 0.7rem; opacity: 0.9; margin-top: 2px;">${dia}</span>
            </div>
            
            <div class="info-box" style="flex-grow: 1;">
                <h4 class="nome-link" data-link="${urlProntuario}" style="margin: 0 0 4px 0; font-size: 0.95rem; font-weight: 600; cursor: pointer; color: #333;">
                    ${pacienteNome}
                </h4>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; ${statusClass}">
                        ${status}
                    </span>
                    <span style="font-size: 0.7rem; color: #666;">• ${tipo}</span>
                </div>
            </div>
            ${botaoHTML}
        `;
        listContainer.appendChild(card);
    });

    // 4. ADICIONA OS LISTENERS (O Segredo)
    listContainer.addEventListener('click', (e) => {
        // Clique no Nome (Vai para prontuário)
        const nomeLink = e.target.closest('.nome-link');
        if (nomeLink) {
            window.location.href = nomeLink.dataset.link;
        }

        // Clique no Botão Atender (Vai para prontuário)
        const btnAtender = e.target.closest('.btn-atender');
        if (btnAtender) {
            window.location.href = btnAtender.dataset.prontuario;
        }

        // Clique no Botão Vídeo (Abre sala + Prontuário)
        const btnVideo = e.target.closest('.btn-video');
        if (btnVideo) {
            const urlVideo = btnVideo.dataset.video;
            const urlProntuario = btnVideo.dataset.prontuario;
            
            // Abre Jitsi em nova aba
            window.open(urlVideo, '_blank');
            // Abre prontuário na mesma aba
            window.location.href = urlProntuario;
        }
    });
}
    // --- CLICK NO EVENTO (Edição ou Detalhes) ---
    async function handleEventClick(event) {
        // Se for uma DISPONIBILIDADE (Vaga), abre o modal de editar
        if (event.extendedProps.type === 'disponibilidade') {
            const docRef = doc(db, "disponibilidades_publicadas", event.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const start = data.start.toDate();
                const end = data.end.toDate();
               
                document.getElementById('edit-event-id').value = event.id;
                document.getElementById('edit-event-date').value = toLocalISOString(start).date;
                document.getElementById('edit-start-time').value = toLocalISOString(start).time;
                document.getElementById('edit-end-time').value = toLocalISOString(end).time;
               
                if (editAvailabilityError) editAvailabilityError.classList.add('hidden');
                openModal(editAvailabilityModal);
            }
        }
        // Se for um AGENDAMENTO (Consulta), mostra detalhes
        else if (event.extendedProps.type === 'agendado') {
            alert(`Consulta Agendada:\nPaciente: ${event.extendedProps.patientName}\nHorário: ${event.start.toLocaleString()}`);
        }
    }
   
    // --- POPULAR MODAL "AGENDA DO DIA" ---
    const populateDayDetailsModal = (eventsDoDia, formattedDate) => {
        if (!dayDetailsModal || !dayDetailsTitle || !dayDetailsList || !dayDetailsEmpty) return;
        dayDetailsTitle.textContent = `Agenda de ${formattedDate}`;
        dayDetailsList.innerHTML = '';
       
        if (eventsDoDia.length === 0) {
            dayDetailsList.appendChild(dayDetailsEmpty);
            return;
        }
       
        eventsDoDia.sort((a, b) => a.start - b.start);
       
        eventsDoDia.forEach(event => {
            const props = event.extendedProps;
            const startTime = event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const endTime = event.end ? event.end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '...';
            const title = event.title || 'Disponível';
           
            // Diferencia visualmente Consulta vs Disponibilidade
            const statusClass = props.type === 'agendado' ? 'item-status-agendado' : 'item-status-disponivel';
           
            const itemButton = document.createElement('button');
            itemButton.type = 'button';
            itemButton.className = `day-details-item ${statusClass}`;
            itemButton.dataset.eventId = event.id;
            itemButton.innerHTML = `
                <span class="item-dot"></span>
                <span class="item-time">${startTime}</span>
                <span class="item-title">${title}</span>
                <i class="fa-solid fa-chevron-right" style="color: var(--texto-suave);"></i>
            `;
            dayDetailsList.appendChild(itemButton);
        });
    };

    // --- LISTENERS DE EVENTOS ---
    function addEventListeners() {
        // Botão Adicionar
        addAvailabilityButton.addEventListener('click', () => {
            availabilityForm.reset();
            document.getElementById('event-date').value = new Date().toISOString().split('T')[0];
            availabilityError.classList.add('hidden');
            openModal(availabilityModal);
        });

        // Submit Adicionar
        availabilityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return;
           
            const submitButton = availabilityForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = "Adicionando...";
           
            const date = document.getElementById('event-date').value;
            const startTime = document.getElementById('start-time').value;
            const endTime = document.getElementById('end-time').value;
            const tipoAtendimento = document.getElementById('consulta-tipo').value;

            if (!tipoAtendimento) {
                 availabilityError.textContent = "Selecione o tipo de atendimento.";
                 availabilityError.classList.remove('hidden');
                 submitButton.disabled = false;
                 submitButton.textContent = "Adicionar";
                 return;
            }

            try {
                const startDateTime = new Date(`${date}T${startTime}`);
                const endDateTime = new Date(`${date}T${endTime}`);
               
                const availabilityRef = collection(db, "disponibilidades_publicadas");
                const newDocRef = await addDoc(availabilityRef, {
                    id_profissional: currentUser.uid,
                    start: startDateTime,
                    end: endDateTime,
                    tipo: tipoAtendimento,
                    status: 'disponivel',
                    criado_em: serverTimestamp()
                });

                // Atualiza localmente sem recarregar
                const newEvent = {
                    id: newDocRef.id,
                    title: 'Disponível',
                    start: startDateTime,
                    end: endDateTime,
                    display: 'background',
                    color: '#a0d9e5',
                    extendedProps: { type: 'disponibilidade' }
                };
                eventData.push(newEvent);
                calendar.addEvent(newEvent);
               
                closeModal(availabilityModal);
                updateDayCellClasses();
                alert("Disponibilidade adicionada!");

            } catch (error) {
                console.error("Erro:", error);
                availabilityError.textContent = "Erro ao salvar.";
                availabilityError.classList.remove('hidden');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Adicionar";
            }
        });

        // Ações do Dia e Detalhes
        if (btnOpenAvailabilityForm) {
            btnOpenAvailabilityForm.addEventListener('click', () => {
                closeModal(dayActionModal);
                if (selectedDateInfo) {
                    document.getElementById('event-date').value = selectedDateInfo.dateStr;
                }
                openModal(availabilityModal);
            });
        }

        if (btnViewDayAgenda) {
            btnViewDayAgenda.addEventListener('click', () => {
                closeModal(dayActionModal);
                if (!selectedDateInfo || !calendar) return;
               
                const clickedDate = selectedDateInfo.date;
                const allEvents = calendar.getEvents();
               
                // Filtra eventos do dia clicado
                const eventsDoDia = allEvents.filter(event => {
                    // Compara datas ignorando horas (ajuste de fuso simples)
                    return event.start.getDate() === clickedDate.getDate() &&
                           event.start.getMonth() === clickedDate.getMonth();
                });
               
                const formattedDate = clickedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                populateDayDetailsModal(eventsDoDia, formattedDate);
                openModal(dayDetailsModal);
            });
        }
       
        // Listener da Lista de Detalhes (Delegação)
        if (dayDetailsList) {
            dayDetailsList.addEventListener('click', (e) => {
                const itemButton = e.target.closest('.day-details-item');
                if (itemButton && itemButton.dataset.eventId) {
                    const event = calendar.getEventById(itemButton.dataset.eventId);
                    if (event) {
                        closeModal(dayDetailsModal);
                        handleEventClick(event);
                    }
                }
            });
        }

        // Fechar Modais
        document.querySelectorAll('.close-button, .btn-secondary').forEach(btn => {
            btn.addEventListener('click', () => {
                closeModal(availabilityModal);
                closeModal(editAvailabilityModal);
                closeModal(dayActionModal);
                closeModal(dayDetailsModal);
            });
        });

        // Listener Excluir Disponibilidade
        deleteAvailabilityButton.addEventListener('click', async () => {
            const eventId = document.getElementById('edit-event-id').value;
            if (confirm("Excluir este horário?")) {
                try {
                    await deleteDoc(doc(db, "disponibilidades_publicadas", eventId));
                    calendar.getEventById(eventId)?.remove();
                    eventData = eventData.filter(e => e.id !== eventId);
                    closeModal(editAvailabilityModal);
                    updateDayCellClasses();
                } catch (e) { console.error(e); alert("Erro ao excluir."); }
            }
        });
    }

});




