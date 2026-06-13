/* ==========================================================
   FICHEIRO: main.js (V9.0 - Fluxo de Agendamento Recuperado)
   ========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    updateProfile,
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp, 
    collection, 
    addDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- CONFIGURAÇÃO ---
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

// --- VARIÁVEIS ---
let agendamentoPendente = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. DETETIVE DE URL: Captura dados do agendamento ---
    const params = new URLSearchParams(window.location.search);
    if (params.get('pendente') === 'true') {
        console.log(">>> Agendamento Pendente Detetado na URL!");
        
        // Cria o objeto com os dados da URL
        const dadosAgendamento = {
            profId: params.get('profId'),
            horarioId: params.get('horarioId'),
            dataHora: params.get('dataHora'),
            tipo: params.get('tipo'),
            preco: params.get('preco')
        };

        // Salva no cofre (localStorage) para não perder durante o cadastro
        localStorage.setItem('agendamentoPendente', JSON.stringify(dadosAgendamento));
        
        // --- FORÇA A ABERTURA DO CADASTRO DE PACIENTE ---
        // Esconde a seleção de perfil e mostra direto o form
        const userTypeSelection = document.getElementById('user-type-selection');
        const patientLoginSection = document.getElementById('patient-login-section');
        const headerMain = document.getElementById('header-main');
        const headerPatientLogin = document.getElementById('header-patient-login');
        const signupForm = document.getElementById('signup-form');
        const loginForm = document.getElementById('login-form');

        if(userTypeSelection) userTypeSelection.classList.add('hidden');
        if(headerMain) headerMain.classList.add('hidden');
        
        if(patientLoginSection) patientLoginSection.classList.remove('hidden');
        if(headerPatientLogin) headerPatientLogin.classList.remove('hidden');
        
        // Abre a aba de CRIAR CONTA (Signup) em vez de Login
        if(loginForm) loginForm.classList.add('hidden');
        if(signupForm) signupForm.classList.remove('hidden');
        
        // Mostra aviso amigável
        const errorMsg = document.getElementById('error-message');
        if(errorMsg) {
            errorMsg.style.color = "#41b8d5";
            errorMsg.textContent = "Crie sua conta para finalizar o agendamento.";
        }
    }

    // Tenta recuperar do LocalStorage (caso a página recarregue)
    const pendenteStr = localStorage.getItem('agendamentoPendente');
    if (pendenteStr) {
        agendamentoPendente = JSON.parse(pendenteStr);
        console.log("Agendamento em memória:", agendamentoPendente);
    }

    // --- SELETORES PADRÃO ---
    const userTypeSelection = document.getElementById('user-type-selection');
    const patientLoginSection = document.getElementById('patient-login-section');
    const headerMain = document.getElementById('header-main');
    const headerPatientLogin = document.getElementById('header-patient-login');
    
    const btnShowPatientLogin = document.getElementById('show-patient-login');
    const btnShowUserType = document.getElementById('show-user-type-selection');
    
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    const nameSignupInput = document.getElementById('signup-name');
    const emailSignupInput = document.getElementById('signup-email');
    const passwordSignupInput = document.getElementById('signup-password');
    const confirmPasswordSignupInput = document.getElementById('signup-password-confirm');
    
    const errorMessageEl = document.getElementById('error-message');
    const loadingOverlay = document.getElementById('loading-overlay');
    const btnGoogle = document.getElementById('google-login-button');

    // --- NAVEGAÇÃO UI ---
    if (btnShowPatientLogin) {
        btnShowPatientLogin.addEventListener('click', () => {
            userTypeSelection.classList.add('hidden');
            headerMain.classList.add('hidden');
            patientLoginSection.classList.remove('hidden');
            headerPatientLogin.classList.remove('hidden');
        });
    }

    if (btnShowUserType) {
        btnShowUserType.addEventListener('click', (e) => {
            e.preventDefault();
            patientLoginSection.classList.add('hidden');
            headerPatientLogin.classList.add('hidden');
            userTypeSelection.classList.remove('hidden');
            headerMain.classList.remove('hidden');
            // Limpa pendência se voltar voluntariamente
            localStorage.removeItem('agendamentoPendente');
        });
    }

    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            errorMessageEl.textContent = '';
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            errorMessageEl.textContent = '';
        });
    }

    const showLoading = (show) => {
        if (loadingOverlay) loadingOverlay.classList.toggle('hidden', !show);
    };

    const showError = (msg) => {
        if (errorMessageEl) {
            errorMessageEl.style.color = "#e53e3e";
            errorMessageEl.textContent = msg;
        }
        setTimeout(() => { if(errorMessageEl) errorMessageEl.textContent = ''; }, 5000);
    };

    // --- LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading(true);
            try {
                await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
                // Redirecionamento é feito no onAuthStateChanged
            } catch (error) {
                showLoading(false);
                console.error(error);
                showError("Erro ao entrar. Verifique seus dados.");
            }
        });
    }

    // --- CADASTRO ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading(true);
            
            const nome = nameSignupInput.value;
            const email = emailSignupInput.value;
            const senha = passwordSignupInput.value;
            const confSenha = confirmPasswordSignupInput.value;

            if (senha !== confSenha) {
                showLoading(false);
                showError("As senhas não coincidem.");
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
                const user = userCredential.user;
                
                await updateProfile(user, { displayName: nome });
                
                // Cria perfil no Firestore (ESSENCIAL para evitar erro de ID não encontrado)
                await setDoc(doc(db, "pacientes", user.uid), {
                    nome: nome,
                    email: email,
                    data_cadastro: serverTimestamp(),
                    tipo: 'paciente',
                    foto_url: "https://placehold.co/60x60/a0d9e5/41b8d5?text=" + nome.charAt(0)
                });
                
                console.log("Perfil de paciente criado com sucesso.");
                // Redirecionamento é feito no onAuthStateChanged

            } catch (error) {
                showLoading(false);
                console.error(error);
                if (error.code === 'auth/email-already-in-use') showError("Este e-mail já está em uso.");
                else if (error.code === 'auth/weak-password') showError("A senha é muito fraca.");
                else showError("Erro ao criar conta: " + error.message);
            }
        });
    }

    // --- GOOGLE LOGIN ---
    if (btnGoogle) {
        btnGoogle.addEventListener('click', async (e) => {
            e.preventDefault();
            const provider = new GoogleAuthProvider();
            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                
                // Verifica se perfil existe, senão cria
                const docRef = doc(db, 'pacientes', user.uid);
                const docSnap = await getDoc(docRef);
                
                if (!docSnap.exists()) {
                    await setDoc(docRef, {
                        nome: user.displayName,
                        email: user.email,
                        foto_url: user.photoURL,
                        data_cadastro: serverTimestamp(),
                        tipo: 'paciente'
                    });
                }
            } catch (error) {
                console.error("Erro Google:", error);
                showError("Erro no login com Google.");
            }
        });
    }

    // --- O PORTÃO DE EMBARQUE (Decisão de Redirecionamento) ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("Usuário detetado:", user.uid);

            // VERIFICA SE TEM AGENDAMENTO PENDENTE NO COFRE
            const pendenteStorage = localStorage.getItem('agendamentoPendente');
            
            if (pendenteStorage) {
                console.log(">>> Processando agendamento pendente...");
                const dados = JSON.parse(pendenteStorage);

                try {
                    // Cria o agendamento no banco
                    const novoAgendamento = {
                        paciente_id: user.uid,
                        paciente_nome: user.displayName || "Paciente",
                        profissional_id: dados.profId,
                        horario_id_disponibilidade: dados.horarioId,
                        data_hora: dados.dataHora, // String ISO
                        data: new Date(dados.dataHora), // Objeto Date
                        tipo: dados.tipo,
                        preco: parseFloat(dados.preco),
                        status: "agendado_pendente_pagamento",
                        criado_em: serverTimestamp()
                    };

                    const docRef = await addDoc(collection(db, 'agendamentos'), novoAgendamento);
                    
                    // Notificação para o médico
                    try {
                        await addDoc(collection(db, 'profissionais', dados.profId, 'notificacoes'), {
                            titulo: "Novo Agendamento",
                            mensagem: `${novoAgendamento.paciente_nome} iniciou um agendamento. Aguardando pagamento.`,
                            lida: false, type: 'agendamento', timestamp: serverTimestamp()
                        });
                    } catch(e) {}

                    // Limpa o cofre
                    localStorage.removeItem('agendamentoPendente');
                    
                    // MANDA PARA O PAGAMENTO (O Fluxo que você queria!)
                    console.log("Redirecionando para pagamento...");
                    window.location.href = `pagamento.html?agendamentoId=${docRef.id}`;

                } catch (e) {
                    console.error("Erro ao processar pendência:", e);
                    alert("Erro ao salvar agendamento. Entre em contato.");
                    window.location.href = 'paciente-perfil.html';
                }
            } else {
                // FLUXO NORMAL (Sem pendências) -> Vai para o Perfil
                console.log("Login normal. Indo para perfil.");
                window.location.href = 'paciente-perfil.html';
            }
        } else {
            showLoading(false);
        }
    });

});