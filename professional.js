// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===================================================================================
// TODO: ATENÇÃO! Cole a sua configuração do projeto Firebase aqui.
// ===================================================================================
const firebaseConfig = {
    apiKey: "AIzaSyB3Gxc-8jjYyeJSQyhrWv7YzHOIO3v38JY",
    authDomain: "orion-8be51.firebaseapp.com",
    projectId: "orion-8be51",
    storageBucket: "orion-8be51.firebasestorage.app",
    messagingSenderId: "121485013135",
    appId: "1:121485013135:web:5c97776b4fbde4ef9fc0fa"
  };

// ===================================================================================

// --- INICIALIZAÇÃO DO FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// O CÓDIGO SÓ SERÁ EXECUTADO QUANDO O HTML ESTIVER TOTALMENTE CARREGADO
document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS DO DOM ---
    const loginForm = document.getElementById('login-form-prof');
    const signupForm = document.getElementById('signup-form-prof');
    const showSignupLink = document.getElementById('show-signup-prof');
    const showLoginLink = document.getElementById('show-login-prof');
    const errorMessage = document.getElementById('error-message-prof');
    const loadingOverlay = document.getElementById('loading-overlay-prof');
    const forgotPasswordLink = document.getElementById('forgot-password-prof');
    const googleLoginButton = document.getElementById('google-login-button-prof');

    // ==========================================================
    // NOVA LÓGICA: Verifica o "Hash" da URL
    // (Para o botão "Cadastre-se Gratuitamente" funcionar)
    // ==========================================================
    if (window.location.hash === '#signup') {
        console.log("Hash #signup encontrado! A mostrar formulário de registo profissional.");

        // Esconde o formulário de login
        if (loginForm) loginForm.classList.add('hidden');
        
        // Mostra o formulário de registo
        if (signupForm) signupForm.classList.remove('hidden');

        // Limpa erros
        displayError('');
    }
    // ==========================================================
    // FIM DA NOVA LÓGICA
    // ==========================================================

    // --- FUNÇÕES AUXILIARES ---
    function showLoading(isLoading) {
        if (loadingOverlay) {
            loadingOverlay.classList.toggle('hidden', !isLoading);
        }
    }

    function displayError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    // --- LÓGICA DE NAVEGAÇÃO ENTRE FORMULÁRIOS ---
    if (showSignupLink) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            signupForm.classList.remove('hidden');
            displayError('');
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            displayError('');
        });
    }

    // --- OBSERVADOR DE ESTADO DE AUTENTICAÇÃO (ATUALIZADO) ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('Profissional logado, a verificar status:', user.uid);
            showLoading(true);
            const professionalDocRef = doc(db, 'profissionais', user.uid);
            const docSnap = await getDoc(professionalDocRef);

            if (docSnap.exists()) {
                const status = docSnap.data().status_verificacao;
                
                if (status === 'pendente') {
                    window.location.href = 'professional-setup.html';
                } else {
                    // Redireciona para o painel principal se o status for 'em_analise' ou 'aprovado'
                    window.location.href = 'professional-dashboard.html';
                }
            } else {
                // Se o documento não existir (ex: registo via Google sem dados extra),
                // o fluxo de registo cria o documento como 'pendente',
                // então, para garantir, redirecionamos para o setup.
                window.location.href = 'professional-setup.html';
            }
        } else {
            console.log('Nenhum profissional logado.');
            showLoading(false);
        }
    });

    // --- LÓGICA DE REGISTO (SIGN UP) ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            displayError('');
            const name = document.getElementById('signup-name-prof').value;
            const email = document.getElementById('signup-email-prof').value;
            const registro = document.getElementById('signup-registro-prof').value;
            const password = document.getElementById('signup-password-prof').value;
            const passwordConfirm = document.getElementById('signup-password-confirm-prof').value;

            if (password !== passwordConfirm) {
                return displayError('As senhas não coincidem.');
            }
            if (!registro) {
                return displayError('O número de registo profissional é obrigatório.');
            }

            showLoading(true);

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                await updateProfile(user, { displayName: name });

                await setDoc(doc(db, "profissionais", user.uid), {
                    nome: name,
                    email: user.email,
                    registro_profissional: registro,
                    status_verificacao: "pendente",
                    data_cadastro: new Date().toISOString()
                });
                // O onAuthStateChanged vai tratar do redirecionamento
            } catch (error) {
                console.error("Erro no registo do profissional:", error.code, error.message);
                if (error.code === 'auth/email-already-in-use') {
                    displayError('Este e-mail já está registado.');
                } else if (error.code === 'auth/weak-password') {
                    displayError('A senha deve ter pelo menos 6 caracteres.');
                } else {
                    displayError('Ocorreu um erro ao criar o registo.');
                }
                showLoading(false);
            }
        });
    }

    // --- LÓGICA DE LOGIN (SIGN IN) ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            displayError('');
            const email = document.getElementById('login-email-prof').value;
            const password = document.getElementById('login-password-prof').value;
            showLoading(true);
            try {
                await signInWithEmailAndPassword(auth, email, password);
                // O onAuthStateChanged vai tratar do redirecionamento
            } catch (error) {
                console.error("Erro no login do profissional:", error.code, error.message);
                displayError('E-mail ou senha inválidos.');
                showLoading(false);
            }
        });
    }

    // --- LÓGICA DE LOGIN COM GOOGLE ---
    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', async () => {
            displayError('');
            showLoading(true);
            try {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;
                const userDocRef = doc(db, "profissionais", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    await setDoc(userDocRef, {
                        nome: user.displayName,
                        email: user.email,
                        foto_url: user.photoURL,
                        status_verificacao: "pendente",
                        data_cadastro: new Date().toISOString()
                    });
                }
                // O onAuthStateChanged vai tratar do redirecionamento
            } catch (error) {
                console.error("Erro no login com Google:", error.code, error.message);
                displayError('Não foi possível fazer login com o Google.');
                showLoading(false);
            }
        });
    }

    // --- LÓGICA DE "ESQUECEU A SENHA" ---
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email-prof').value;
            if (!email) {
                alert('Por favor, digite o seu e-mail no campo para redefinir a senha.');
                return;
            }
            try {
                await sendPasswordResetEmail(auth, email);
                alert(`Um e-mail de redefinição de senha foi enviado para ${email}.`);
            } catch (error) {
                console.error("Erro ao redefinir senha:", error.code, error.message);
                alert('Não foi possível enviar o e-mail. Verifique se o e-mail está correto.');
            }
        });
    }
});

