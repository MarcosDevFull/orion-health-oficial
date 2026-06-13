/* ==========================================================
   FICHEIRO: pagamento.js (V7.0 - Final com Transações e Notificações)
   ========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    updateDoc, 
    serverTimestamp, 
    collection, 
    addDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
let agendamentoData = null; // Dados globais da consulta

document.addEventListener('DOMContentLoaded', () => {
    console.log("pagamento.js (V7.0) carregado.");

    const urlParams = new URLSearchParams(window.location.search);
    const agendamentoId = urlParams.get('agendamentoId');

    if (!agendamentoId) {
        alert("Erro: Nenhum agendamento identificado.");
        window.location.href = 'index.html';
        return;
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await carregarDados(agendamentoId);
        } else {
            window.location.href = 'index.html';
        }
    });

    async function carregarDados(id) {
        try {
            const docRef = doc(db, 'agendamentos', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                agendamentoData = docSnap.data();
                renderizarDetalhesConsulta(agendamentoData);
                
                // Busca dados do médico para mostrar foto/nome
                if(agendamentoData.profissional_id) {
                    await buscarDadosMedico(agendamentoData.profissional_id);
                }
                
                gerarQRCode(id, agendamentoData.preco);
            } else {
                console.error("Agendamento não encontrado!");
                alert("Agendamento não encontrado.");
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        }
    }

    function renderizarDetalhesConsulta(data) {
        let dataObj;
        if (data.data && typeof data.data.toDate === 'function') {
            dataObj = data.data.toDate();
        } else {
            dataObj = new Date(data.data);
        }
        
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setText('consulta-tipo', `Consulta ${capitalize(data.tipo)}`);
        
        const localText = data.tipo === 'online' ? "Sala de vídeo integrada (Jitsi Meet)" :
                          (data.tipo === 'domiciliar' ? "No seu endereço cadastrado" : "No consultório do médico");
        setText('consulta-local', localText);

        setText('consulta-data', dataObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));
        setText('consulta-dia-semana', dataObj.toLocaleDateString('pt-BR', { weekday: 'long' }));

        const horaInicio = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        setText('consulta-hora', `${horaInicio}`);

        const precoFormatado = (data.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        setText('consulta-preco', precoFormatado);
        setText('consulta-preco-instrucoes', precoFormatado);
    }

    async function buscarDadosMedico(profId) {
        if (profId && profId.toString().startsWith('mock_')) {
            // Mock fallback
            return;
        }
        try {
            const docRef = doc(db, 'profissionais', profId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const prof = docSnap.data();
                const elName = document.getElementById('prof-name');
                const elSpec = document.getElementById('prof-specialty');
                const elCrm = document.getElementById('prof-crm');
                const elPhoto = document.getElementById('prof-photo');

                if (elName) elName.textContent = prof.nome || "Doutor(a)";
                if (elSpec) elSpec.textContent = prof.especialidade || "Especialista";
                if (elCrm) elCrm.textContent = prof.registro_profissional || "...";
                if (elPhoto && prof.foto_url) elPhoto.src = prof.foto_url;
            }
        } catch (e) {
            console.error("Erro ao buscar médico:", e);
        }
    }

    function gerarQRCode(id, valor) {
        const pixPayload = `OrionHealth-${id}-${valor}-${Date.now()}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`;
        const imgQr = document.getElementById('pix-qrcode');
        if(imgQr) imgQr.src = qrUrl;
    }

    function capitalize(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
    }

    // --- BOTÃO CONFIRMAR PAGAMENTO ---
    const btnConfirmar = document.getElementById('btn-confirmar-pagamento');
    
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async () => {
            if (!agendamentoId || !agendamentoData) return;
            
            btnConfirmar.disabled = true;
            btnConfirmar.textContent = "Processando...";
        
            try {
                // 1. Atualiza o Status do Agendamento
                const docRef = doc(db, 'agendamentos', agendamentoId);
                await updateDoc(docRef, {
                    status: 'confirmado',
                    pagamento_confirmado: true,
                    data_pagamento: serverTimestamp()
                });

                // 2. CRIA O REGISTRO FINANCEIRO
                const transacaoData = {
                    medico_id: agendamentoData.profissional_id,
                    paciente_id: currentUser.uid,
                    paciente_nome: agendamentoData.paciente_nome || "Paciente",
                    valor: parseFloat(agendamentoData.preco || 0),
                    tipo_servico: agendamentoData.tipo || "Consulta",
                    agendamento_id: agendamentoId,
                    data: serverTimestamp(),
                    status: "Aguardando Atendimento"
                };
                await addDoc(collection(db, "transacoes_financeiras"), transacaoData);

                // 3. ENVIA NOTIFICAÇÃO AO MÉDICO
                try {
                    let nomeParaNotificacao = agendamentoData.paciente_nome;
                    
                    // Se o nome não veio no agendamento, busca no perfil
                    if (!nomeParaNotificacao) {
                         const pDoc = await getDoc(doc(db, 'pacientes', currentUser.uid));
                         nomeParaNotificacao = pDoc.exists() ? pDoc.data().nome : "Paciente";
                    }

                    let dataMsg = "Data N/D";
                    if (agendamentoData.data) {
                        const d = agendamentoData.data.toDate ? agendamentoData.data.toDate() : new Date(agendamentoData.data);
                        dataMsg = d.toLocaleString('pt-BR');
                    }

                    const notifData = {
                        titulo: "Pagamento Confirmado",
                        mensagem: `${nomeParaNotificacao} confirmou o pagamento da consulta (${agendamentoData.tipo}) de ${dataMsg}.`,
                        lida: false,
                        tipo: 'agendamento',
                        link: 'agenda_calendario.html',
                        timestamp: serverTimestamp()
                    };

                    await addDoc(collection(db, 'profissionais', agendamentoData.profissional_id, 'notificacoes'), notifData);
                    console.log("Notificação enviada com sucesso.");

                } catch (notifError) {
                    console.error("Erro ao enviar notificação (não crítico):", notifError);
                }

                // 4. Sucesso
                alert("Pagamento confirmado com sucesso!");
                window.location.href = 'paciente-perfil.html';

            } catch (error) {
                console.error("ERRO AO CONFIRMAR:", error);
                // Se for erro de permissão, avisa especificamente
                if (error.code === 'permission-denied') {
                     alert("Erro de permissão: Verifique as regras do Firebase para 'transacoes_financeiras' ou 'notificacoes'.");
                } else {
                     alert(`Erro ao processar: ${error.message}`);
                }
                
                btnConfirmar.disabled = false;
                btnConfirmar.textContent = "Confirmar pagamento";
            }
        });
    }

    startTimer(299);
});

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById('pix-timer');
    if(!display) return;
    const interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;
        if (--timer < 0) {
            clearInterval(interval);
            display.textContent = "Expirado";
        }
    }, 1000);
}