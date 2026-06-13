/* ==========================================================
   FICHEIRO: professional-setup.js (V4 - Bloqueio de Aprovação)
   ========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, doc, getDoc, setDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const storage = getStorage(app);

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-button-setup');
    const setupForm = document.getElementById('setup-form');
    const loadingOverlay = document.getElementById('loading-overlay');
    const mainContainer = document.querySelector('main.container'); // Para manipular o conteúdo

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => window.location.href = 'index.html');
        });
    }

    // --- 1. VERIFICAÇÃO DE STATUS (LÓGICA DE SEGURANÇA) ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            console.log("Usuário logado:", user.uid);

            try {
                const docRef = doc(db, 'profissionais', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const status = data.status_verificacao || 'pendente';

                    // A. APROVADO -> VAI PARA O DASHBOARD
                    if (status === 'aprovado') {
                        console.log("Conta aprovada. Entrando...");
                        window.location.href = 'professional-dashboard.html';
                        return;
                    }
                    
                    // B. EM ANÁLISE -> BLOQUEIA A TELA (Não deixa editar, nem ir pro painel)
                    if (status === 'em_analise') {
                        renderTelaEmAnalise(); // Função que esconde o form e mostra aviso
                    } 
                    
                    // C. PENDENTE -> PREENCHE O FORMULÁRIO (Deixa editar)
                    else {
                        preencherFormulario(data);
                    }
                }
                
                if (loadingOverlay) loadingOverlay.classList.add('hidden');

            } catch (error) {
                console.error("Erro ao verificar perfil:", error);
                if (loadingOverlay) loadingOverlay.classList.add('hidden');
            }
        } else {
            window.location.href = 'professional-login.html';
        }
    });

    // --- 2. ENVIO DO FORMULÁRIO ---
    if (setupForm) {
        setupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btnSubmit = setupForm.querySelector('.btn-submit') || document.querySelector('button[type="submit"]');
            if(btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = "A enviar...";
            }

            try {
                const especialidadeVal = document.getElementById('especialidade')?.value || "";
                const bioVal = document.getElementById('bio')?.value || "";
                const precoOnlineVal = document.getElementById('preco-online')?.value || "0";
                const precoPresencialVal = document.getElementById('preco-presencial')?.value || "0";
                const pixVal = document.getElementById('chave-pix')?.value || "";

                const docRegistroFile = document.getElementById('doc-registro')?.files[0];
                const docIdentidadeFile = document.getElementById('doc-identidade')?.files[0];

                let docRegistroUrl = null;
                let docIdentidadeUrl = null;

                // Uploads
                if (docRegistroFile) {
                    const storageRef = ref(storage, `docs_profissionais/${currentUser.uid}/registro_${Date.now()}`);
                    await uploadBytes(storageRef, docRegistroFile);
                    docRegistroUrl = await getDownloadURL(storageRef);
                }
                if (docIdentidadeFile) {
                    const storageRef = ref(storage, `docs_profissionais/${currentUser.uid}/identidade_${Date.now()}`);
                    await uploadBytes(storageRef, docIdentidadeFile);
                    docIdentidadeUrl = await getDownloadURL(storageRef);
                }

                // Dados
                const dadosAtualizacao = {
                    especialidade: normalizeSpecialty(especialidadeVal),
                    bio: bioVal,
                    precos: {
                        online: parseFloat(precoOnlineVal),
                        presencial: parseFloat(precoPresencialVal)
                    },
                    chave_pix: pixVal,
                    status_verificacao: 'em_analise', // Muda status para bloquear
                    setup_concluido: true,
                    updated_at: serverTimestamp()
                };

                if (docRegistroUrl) dadosAtualizacao.doc_registro_url = docRegistroUrl;
                if (docIdentidadeUrl) dadosAtualizacao.doc_identidade_url = docIdentidadeUrl;

                // Salva (setDoc com merge para criar ou atualizar)
                await setDoc(doc(db, 'profissionais', currentUser.uid), dadosAtualizacao, { merge: true });

                alert("Documentação enviada com sucesso! Aguarde a aprovação da nossa equipe.");
                
                // Recarrega a página para cair no bloco "B. EM ANÁLISE" acima
                window.location.reload();

            } catch (error) {
                console.error("Erro ao salvar:", error);
                alert("Erro: " + error.message);
                if(btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = "Enviar para Análise";
                }
            }
        });
    }

    // --- FUNÇÕES VISUAIS ---

    function renderTelaEmAnalise() {
        // Substitui o conteúdo do Main por uma mensagem de espera
        if (mainContainer) {
            mainContainer.innerHTML = `
                <div style="text-align: center; padding: 50px 20px;">
                    <div style="background: #e6fffa; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                        <i class="fa-solid fa-clock" style="font-size: 2.5rem; color: #3197b1;"></i>
                    </div>
                    <h2 style="color: #2d3748; margin-bottom: 15px;">Cadastro em Análise</h2>
                    <p style="color: #4a5568; font-size: 1.1rem; max-width: 500px; margin: 0 auto;">
                        Recebemos a sua documentação. A nossa equipe está a verificar os seus dados. 
                        <br>Você receberá um aviso assim que o acesso ao painel for liberado.
                    </p>
                    <div style="margin-top: 30px; padding: 15px; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; display: inline-block;">
                        <span style="font-weight: 600; color: #3197b1;">Status: Aguardando Aprovação</span>
                    </div>
                </div>
            `;
        }
        // Esconde o indicador de status antigo se existir
        const statusIndicator = document.querySelector('.status-indicator-mobile');
        if(statusIndicator) statusIndicator.style.display = 'none';
    }

    function normalizeSpecialty(str) {
        const s = (str || '').toLowerCase().trim();
        if (s.startsWith('cardio')) return 'Cardiologia';
        if (s.startsWith('psico')) return 'Psicologia';
        if (s.startsWith('nutri')) return 'Nutrição';
        if (s.startsWith('derma')) return 'Dermatologia';
        if (s.startsWith('clínic') || s.startsWith('general')) return 'Clínica Geral';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function preencherFormulario(data) {
        if (!data) return;
        if (document.getElementById('especialidade')) document.getElementById('especialidade').value = data.especialidade || '';
        if (document.getElementById('bio')) document.getElementById('bio').value = data.bio || '';
        if (document.getElementById('preco-online') && data.precos) document.getElementById('preco-online').value = data.precos.online || '';
        if (document.getElementById('preco-presencial') && data.precos) document.getElementById('preco-presencial').value = data.precos.presencial || '';
    }
});