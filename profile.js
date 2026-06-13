// --- IMPORTAÇÕES DO FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut, 
    updateProfile,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ===================================================================================
// TODO: ATENÇÃO! Cole a MESMA configuração do seu projeto Firebase aqui.
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
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', () => {
    
    // --- SELETORES DE ELEMENTOS DO DOM (COMPLETO) ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const profileContent = document.getElementById('profile-content');
    const userNameEl = document.getElementById('user-name');
    const userEmailEl = document.getElementById('user-email');
    const userPhotoEl = document.getElementById('user-photo');
    const userCard = document.getElementById('user-card');
    const logoutButton = document.getElementById('logout-button');
    const backButton = document.getElementById('back-button');
    let currentUser = null;
    let isCpfValidated = false;
    let userType = null;

    // --- Seletores do Modal de Dados Pessoais ---
    const editProfileButton = document.getElementById('edit-profile-button');
    const editModal = document.getElementById('edit-modal');
    const closeModalButton = document.getElementById('close-modal-button');
    const editProfileForm = document.getElementById('edit-profile-form');
    const successMessage = document.getElementById('modal-success-message');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const whatsappInput = document.getElementById('whatsapp');
    const birthdateInput = document.getElementById('birthdate');
    const cpfInput = document.getElementById('cpf');
    const cpfStatus = document.getElementById('cpf-status');
    const convenioRadios = document.querySelectorAll('input[name="has-convenio"]');
    const convenioDetailsSection = document.getElementById('convenio-details-section');
    const convenioList = document.getElementById('convenio-list');
    const cepInput = document.getElementById('cep');
    const ruaInput = document.getElementById('rua');
    const numeroInput = document.getElementById('numero');
    const complementoInput = document.getElementById('complemento');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');
    const photoUploadInput = document.getElementById('photo-upload');
    const bgColorPalette = document.getElementById('bg-color-palette');
    const textColorPalette = document.getElementById('text-color-palette');
    const notificationCheckboxes = document.querySelectorAll('input[name="notificacao_forma"]');
    const notificationRadios = document.querySelectorAll('input[name="notificacao_frequencia"]');
    const notificationScheduleSection = document.getElementById('notification-schedule-section');
    const scheduleDayCheckboxes = document.querySelectorAll('.schedule-day input[type="checkbox"]');

    // --- Seletores do Modal de Dados de Serviço ---
    const professionalServiceCard = document.getElementById('professional-service-card');
    const editServiceButton = document.getElementById('edit-service-button');
    const serviceModal = document.getElementById('service-modal');
    const closeServiceModalButton = document.getElementById('close-service-modal-button');
    const editServiceForm = document.getElementById('edit-service-form');
    const serviceSuccessMessage = document.getElementById('service-success-message');
    const categoriaInput = document.getElementById('categoria');
    const especialidadeInput = document.getElementById('especialidade');
    const registroInput = document.getElementById('registro-profissional');
    const precoOnlineInput = document.getElementById('preco-online');
    const precoPresencialInput = document.getElementById('preco-presencial');
    const precoDomiciliarInput = document.getElementById('preco-domiciliar'); // <-- NOVO SELETOR ADICIONADO AQUI

    // --- Seletores do Modal de Senha ---
    const showPasswordPolicyButton = document.getElementById('show-password-policy-button');
    const changePasswordButton = document.getElementById('change-password-button');
    const policyModal = document.getElementById('policy-modal');
    const closePolicyModalButton = document.getElementById('close-policy-modal-button');
    const passwordModal = document.getElementById('password-modal');
    const closePasswordModalButton = document.getElementById('close-password-modal-button');
    const changePasswordForm = document.getElementById('change-password-form');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    const passwordErrorMessage = document.getElementById('password-error-message');
    const passwordSuccessMessage = document.getElementById('password-success-message');
    
    // --- Seletores de Ajuda e Suporte ---
    const contactButton = document.getElementById('contact-button');
    const faqButton = document.getElementById('faq-button');
    const aboutButton = document.getElementById('about-button');
    const ratingButton = document.getElementById('rating-button');
    const contactModal = document.getElementById('contact-modal');
    const faqModal = document.getElementById('faq-modal');
    const aboutModal = document.getElementById('about-modal');
    const ratingModal = document.getElementById('rating-modal');
    const closeContactModalButton = document.getElementById('close-contact-modal-button');
    const closeFaqModalButton = document.getElementById('close-faq-modal-button');
    const closeAboutModalButton = document.getElementById('close-about-modal-button');
    const closeRatingModalButton = document.getElementById('close-rating-modal-button');
    const starRatingContainer = document.getElementById('star-rating');
    const ratingSuccessMessage = document.getElementById('rating-success-message');

    // --- Seletores de Conformidade e LGPD ---
    const privacyPolicyButton = document.getElementById('privacy-policy-button');
    const termsOfUseButton = document.getElementById('terms-of-use-button');
    const lgpdRightsButton = document.getElementById('lgpd-rights-button');
    const privacyPolicyModal = document.getElementById('privacy-policy-modal');
    const termsOfUseModal = document.getElementById('terms-of-use-modal');
    const lgpdRightsModal = document.getElementById('lgpd-rights-modal');
    const closePrivacyPolicyModalButton = document.getElementById('close-privacy-policy-modal-button');
    const closeTermsOfUseModalButton = document.getElementById('close-terms-of-use-modal-button');
    const closeLgpdRightsModalButton = document.getElementById('close-lgpd-rights-modal-button');
    const agreePrivacyButton = document.getElementById('agree-privacy-button');
    const agreeTermsButton = document.getElementById('agree-terms-button');
    const agreeLgpdButton = document.getElementById('agree-lgpd-button');

    // --- Seletores de Excluir Conta ---
    const showDeleteModalButton = document.getElementById('show-delete-modal-button');
    const deleteAccountModal = document.getElementById('delete-account-modal');
    const closeDeleteModalButton = document.getElementById('close-delete-modal-button');
    const closeDeleteModalButton2 = document.getElementById('close-delete-modal-button-2');
    const cancelDeleteButton = document.getElementById('cancel-delete-button');
    const continueToDeleteButton = document.getElementById('continue-to-delete-button');
    const backToStep1Button = document.getElementById('back-to-step-1-button');
    const deleteStep1 = document.getElementById('delete-step-1');
    const deleteStep2 = document.getElementById('delete-step-2');
    const deleteAccountForm = document.getElementById('delete-account-form');
    const deletePasswordInput = document.getElementById('delete-password');
    const deleteErrorMessage = document.getElementById('delete-error-message');

    // --- FUNÇÕES GERAIS ---
    const openModal = (modal) => modal.classList.remove('hidden');
    const closeModal = (modal) => modal.classList.add('hidden');

    const darkenColor = (hex, percent) => {
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        r = parseInt(r * (100 - percent) / 100);
        g = parseInt(g * (100 - percent) / 100);
        b = parseInt(b * (100 - percent) / 100);
        r = (r < 0) ? 0 : r;
        g = (g < 0) ? 0 : g;
        b = (b < 0) ? 0 : b;
        const rHex = (r.toString(16).length === 1) ? "0" + r.toString(16) : r.toString(16);
        const gHex = (g.toString(16).length === 1) ? "0" + g.toString(16) : g.toString(16);
        const bHex = (b.toString(16).length === 1) ? "0" + b.toString(16) : b.toString(16);
        return `#${rHex}${gHex}${bHex}`;
    };

    const applyCustomization = (prefs) => {
        if (!userCard || !userNameEl || !userEmailEl) return;
        
        const bgColor = prefs?.corFundo || '#ffffff';
        const textColor = prefs?.corTexto || '#1a202c';
        
        userCard.style.backgroundColor = bgColor;
        userNameEl.style.color = textColor;
        userEmailEl.style.color = textColor;

        const primaryColor = (bgColor === '#ffffff') ? '#41b8d5' : bgColor;
        const hoverColor = darkenColor(primaryColor, 10);

        document.documentElement.style.setProperty('--cor-primaria', primaryColor);
        document.documentElement.style.setProperty('--cor-primaria-hover', hoverColor);
    };

    // --- OBSERVAÇÃO DE ESTADO DE AUTENTICAÇÃO ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            userNameEl.textContent = user.displayName || 'Utilizador';
            userEmailEl.textContent = user.email;
            if (user.photoURL) userPhotoEl.src = user.photoURL;

            const profDocRef = doc(db, 'profissionais', user.uid);
            const profDocSnap = await getDoc(profDocRef);
            const patientDocRef = doc(db, 'pacientes', user.uid);
            const patientDocSnap = await getDoc(patientDocRef);

            let userDbData = {};
            if (profDocSnap.exists()) {
                userType = 'profissional';
                userDbData = profDocSnap.data();
                if (professionalServiceCard) professionalServiceCard.classList.remove('hidden');
                if (backButton) backButton.href = 'professional-dashboard.html';
            } else if (patientDocSnap.exists()) {
                userType = 'paciente';
                userDbData = patientDocSnap.data();
                if (professionalServiceCard) professionalServiceCard.classList.add('hidden');
                 if (backButton) backButton.href = 'paciente-perfil.html'; // Futuro dashboard do paciente
            }
            
            if (userDbData.personalizacao) {
                applyCustomization(userDbData.personalizacao);
            } else {
                applyCustomization({});
            }

            loadingOverlay.classList.add('hidden');
            profileContent.classList.remove('hidden');
        } else {
            currentUser = null;
            window.location.href = 'index.html';
        }
    });
    
    // --- LÓGICA DE TODOS OS MODAIS E FORMULÁRIOS ---
    if (editProfileButton) {
        editProfileButton.addEventListener('click', async () => {
            if (!currentUser) return;
            const collectionName = userType === 'profissional' ? 'profissionais' : 'pacientes';
            const userDocRef = doc(db, collectionName, currentUser.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                nameInput.value = data.nome || currentUser.displayName || '';
                emailInput.value = data.email || currentUser.email || '';
                whatsappInput.value = data.whatsapp || '';
                birthdateInput.value = data.data_nascimento || '';
                cpfInput.value = data.cpf || '';

                if(userType === 'paciente' && convenioDetailsSection){
                    convenioDetailsSection.style.display = 'flex';
                    if (data.convenio?.possui) {
                        document.querySelector('input[name="has-convenio"][value="sim"]').checked = true;
                        convenioDetailsSection.classList.remove('hidden');
                        convenioList.value = data.convenio.nome || '';
                    } else {
                        document.querySelector('input[name="has-convenio"][value="nao"]').checked = true;
                        convenioDetailsSection.classList.add('hidden');
                        convenioList.value = '';
                    }
                } else if (convenioDetailsSection) {
                    convenioDetailsSection.style.display = 'none';
                }

                cepInput.value = data.endereco?.cep || '';
                ruaInput.value = data.endereco?.rua || '';
                numeroInput.value = data.endereco?.numero || '';
                complementoInput.value = data.endereco?.complemento || '';
                cidadeInput.value = data.endereco?.cidade || '';
                estadoInput.value = data.endereco?.estado || '';

                if (data.cpf_validado === true) {
                    isCpfValidated = true;
                    cpfInput.readOnly = true;
                    cpfInput.style.cursor = 'not-allowed';
                    cpfStatus.textContent = 'Válido';
                    cpfStatus.className = 'cpf-status valid';
                } else {
                    isCpfValidated = false;
                    cpfInput.readOnly = false;
                    cpfInput.style.cursor = 'text';
                    cpfStatus.textContent = '';
                    cpfStatus.className = 'cpf-status';
                }
                
                const prefs = data.personalizacao || {};
                selectColor(bgColorPalette, prefs.corFundo);
                selectColor(textColorPalette, prefs.corTexto);

                const notificationPrefs = data.notificacoes || {};
                notificationCheckboxes.forEach(checkbox => {
                    checkbox.checked = notificationPrefs.forma?.includes(checkbox.value) || false;
                });

                notificationRadios.forEach(radio => radio.checked = false);
                const savedFrequency = notificationPrefs.frequencia;
                if (savedFrequency) {
                    const radioToSelect = document.querySelector(`input[name="notificacao_frequencia"][value="${savedFrequency}"]`);
                    if (radioToSelect) {
                        radioToSelect.checked = true;
                        notificationScheduleSection.classList.toggle('hidden', savedFrequency !== 'programado');
                    }
                } else {
                     notificationScheduleSection.classList.add('hidden');
                }

                const schedule = notificationPrefs.agenda || {};
                scheduleDayCheckboxes.forEach(checkbox => {
                    const day = checkbox.dataset.day;
                    const timeInput = document.getElementById(`time-${day}`);
                    if (schedule[day]) {
                        checkbox.checked = true;
                        timeInput.disabled = false;
                        timeInput.value = schedule[day];
                    } else {
                        checkbox.checked = false;
                        timeInput.disabled = true;
                        timeInput.value = '';
                    }
                });
            }
            successMessage.classList.add('hidden');
            openModal(editModal);
        });
    }
    if (closeModalButton) closeModalButton.addEventListener('click', () => closeModal(editModal));
    if (editModal) editModal.addEventListener('click', (e) => { if (e.target === editModal) closeModal(editModal); });

    if (editServiceButton) {
        editServiceButton.addEventListener('click', async () => {
            if (!currentUser || userType !== 'profissional') return;
            const userDocRef = doc(db, 'profissionais', currentUser.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                categoriaInput.value = data.categoria || '';
                especialidadeInput.value = data.especialidade || '';
                registroInput.value = data.registro_profissional || '';
                precoOnlineInput.value = data.preco_online || '';
                precoPresencialInput.value = data.preco_presencial || '';
                precoDomiciliarInput.value = data.preco_domiciliar || ''; // <-- LÊ O NOVO CAMPO
            }
            serviceSuccessMessage.classList.add('hidden');
            openModal(serviceModal);
        });
    }
    if (closeServiceModalButton) closeServiceModalButton.addEventListener('click', () => closeModal(serviceModal));
    if (serviceModal) serviceModal.addEventListener('click', (e) => { if (e.target === serviceModal) closeModal(serviceModal); });

    if (showPasswordPolicyButton) showPasswordPolicyButton.addEventListener('click', () => openModal(policyModal));
    if (closePolicyModalButton) closePolicyModalButton.addEventListener('click', () => closeModal(policyModal));
    if (policyModal) policyModal.addEventListener('click', (e) => { if (e.target === policyModal) closeModal(policyModal); });

    if (changePasswordButton) {
        changePasswordButton.addEventListener('click', () => {
            changePasswordForm.reset();
            passwordErrorMessage.classList.add('hidden');
            passwordSuccessMessage.classList.add('hidden');
            openModal(passwordModal);
        });
    }
    if (closePasswordModalButton) closePasswordModalButton.addEventListener('click', () => closeModal(passwordModal));
    if (passwordModal) passwordModal.addEventListener('click', (e) => { if (e.target === passwordModal) closeModal(passwordModal); });
    
    if (contactButton) contactButton.addEventListener('click', () => openModal(contactModal));
    if (closeContactModalButton) closeContactModalButton.addEventListener('click', () => closeModal(contactModal));
    if (contactModal) contactModal.addEventListener('click', (e) => { if (e.target === contactModal) closeModal(contactModal); });

    if (faqButton) faqButton.addEventListener('click', () => openModal(faqModal));
    if (closeFaqModalButton) closeFaqModalButton.addEventListener('click', () => closeModal(faqModal));
    if (faqModal) faqModal.addEventListener('click', (e) => { if (e.target === faqModal) closeModal(faqModal); });

    if (aboutButton) aboutButton.addEventListener('click', () => openModal(aboutModal));
    if (closeAboutModalButton) closeAboutModalButton.addEventListener('click', () => closeModal(aboutModal));
    if (aboutModal) aboutModal.addEventListener('click', (e) => { if (e.target === aboutModal) closeModal(aboutModal); });

    if (ratingButton) {
        ratingButton.addEventListener('click', () => {
            ratingSuccessMessage.classList.add('hidden');
            openModal(ratingModal);
        });
    }
    if (closeRatingModalButton) closeRatingModalButton.addEventListener('click', () => closeModal(ratingModal));
    if (ratingModal) ratingModal.addEventListener('click', (e) => { if (e.target === ratingModal) closeModal(ratingModal); });
    
    if (privacyPolicyButton) privacyPolicyButton.addEventListener('click', () => openModal(privacyPolicyModal));
    if (closePrivacyPolicyModalButton) closePrivacyPolicyModalButton.addEventListener('click', () => closeModal(privacyPolicyModal));
    if (privacyPolicyModal) privacyPolicyModal.addEventListener('click', (e) => { if (e.target === privacyPolicyModal) closeModal(privacyPolicyModal); });

    if (termsOfUseButton) termsOfUseButton.addEventListener('click', () => openModal(termsOfUseModal));
    if (closeTermsOfUseModalButton) closeTermsOfUseModalButton.addEventListener('click', () => closeModal(termsOfUseModal));
    if (termsOfUseModal) termsOfUseModal.addEventListener('click', (e) => { if (e.target === termsOfUseModal) closeModal(termsOfUseModal); });

    if (lgpdRightsButton) lgpdRightsButton.addEventListener('click', () => openModal(lgpdRightsModal));
    if (closeLgpdRightsModalButton) closeLgpdRightsModalButton.addEventListener('click', () => closeModal(lgpdRightsModal));
    if (lgpdRightsModal) lgpdRightsModal.addEventListener('click', (e) => { if (e.target === lgpdRightsModal) closeModal(lgpdRightsModal); });

    const handleAgreement = async (agreementType, modal) => {
        if (currentUser) {
            const collectionName = userType === 'profissional' ? 'profissionais' : 'pacientes';
            await setDoc(doc(db, collectionName, currentUser.uid), {
                consentimentos: { [agreementType]: { aceite: true, data: new Date().toISOString() } }
            }, { merge: true });
        }
        closeModal(modal);
    };

    if (agreePrivacyButton) agreePrivacyButton.addEventListener('click', () => handleAgreement('politica_privacidade', privacyPolicyModal));
    if (agreeTermsButton) agreeTermsButton.addEventListener('click', () => handleAgreement('termos_uso', termsOfUseModal));
    if (agreeLgpdButton) agreeLgpdButton.addEventListener('click', () => handleAgreement('direitos_lgpd', lgpdRightsModal));

    if (starRatingContainer) {
        const stars = starRatingContainer.querySelectorAll('span');
        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                stars.forEach(s => s.classList.remove('hovered'));
                for (let i = 0; i < star.dataset.value; i++) stars[i].classList.add('hovered');
            });
            star.addEventListener('mouseout', () => stars.forEach(s => s.classList.remove('hovered')));
            star.addEventListener('click', async () => {
                const rating = star.dataset.value;
                stars.forEach(s => s.classList.remove('selected'));
                for (let i = 0; i < rating; i++) stars[i].classList.add('selected');

                if (currentUser) {
                    const collectionName = userType === 'profissional' ? 'profissionais' : 'pacientes';
                    await setDoc(doc(db, collectionName, currentUser.uid), {
                        avaliacao_app: { nota: parseInt(rating), data: new Date().toISOString() }
                    }, { merge: true });
                }
                ratingSuccessMessage.classList.remove('hidden');
                setTimeout(() => closeModal(ratingModal), 1500);
            });
        });
    }

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            passwordErrorMessage.classList.add('hidden');
            passwordSuccessMessage.classList.add('hidden');
            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmNewPassword = confirmNewPasswordInput.value;

            if (newPassword.length < 6) {
                passwordErrorMessage.textContent = 'A nova senha deve ter no mínimo 6 caracteres.';
                return passwordErrorMessage.classList.remove('hidden');
            }
            if (newPassword !== confirmNewPassword) {
                passwordErrorMessage.textContent = 'As novas senhas não coincidem.';
                return passwordErrorMessage.classList.remove('hidden');
            }
            if (!currentUser) {
                passwordErrorMessage.textContent = 'Utilizador não encontrado. Por favor, faça login novamente.';
                return passwordErrorMessage.classList.remove('hidden');
            }
            try {
                const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
                await reauthenticateWithCredential(currentUser, credential);
                await updatePassword(currentUser, newPassword);
                passwordSuccessMessage.textContent = 'Senha alterada com sucesso!';
                passwordSuccessMessage.classList.remove('hidden');
                setTimeout(() => {
                    closeModal(passwordModal);
                }, 2000);
            } catch (error) {
                console.error("Erro ao alterar a senha:", error);
                passwordErrorMessage.textContent = error.code === 'auth/wrong-password' ? 'A senha atual está incorreta.' : 'Ocorreu um erro. Tente novamente.';
                passwordErrorMessage.classList.remove('hidden');
            }
        });
    }

    if (editServiceForm) {
        editServiceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser || userType !== 'profissional') return;
            
            try {
                // --- 1. PREPARAÇÃO DE DADOS (INCLUINDO O NOVO CAMPO) ---
                const especialidadeNormalizada = normalizeSpecialty(especialidadeInput.value);

                const dataToUpdate = {
                    categoria: categoriaInput.value,
                    especialidade: especialidadeInput.value,
                    // [NOVO] Campo normalizado para a busca
                    especialidadeNormalizada: especialidadeNormalizada,
                    
                    registro_profissional: registroInput.value,
                    // [NOVO] Preço Domiciliar lido e salvo
                    preco_online: parseFloat(precoOnlineInput.value) || null,
                    preco_presencial: parseFloat(precoPresencialInput.value) || null,
                    preco_domiciliar: parseFloat(precoDomiciliarInput.value) || null, // <-- NOVO VALOR
                    // Nota: Manteremos o status_verificacao em 'aprovado' se ele já estiver 'aprovado' 
                    status_verificacao: "aprovado" 
                };
                
                const userDocRef = doc(db, 'profissionais', currentUser.uid);
                await setDoc(userDocRef, dataToUpdate, { merge: true });

                serviceSuccessMessage.textContent = 'Dados de serviço atualizados com sucesso!';
                serviceSuccessMessage.classList.remove('hidden');

                setTimeout(() => {
                    closeModal(serviceModal);
                    window.location.reload(); // Recarregar a página para mostrar os novos dados
                }, 2000);
            } catch(error) {
                console.error("Erro ao atualizar dados de serviço:", error);
                alert("Ocorreu um erro ao salvar os dados de serviço.");
            }
        });
    }
    
    // --- LÓGICA DAS NOTIFICAÇÕES E CONVÊNIO ---
    convenioRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            convenioDetailsSection.classList.toggle('hidden', radio.value !== 'sim');
        });
    });

    notificationRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            notificationScheduleSection.classList.toggle('hidden', radio.value !== 'programado' || !radio.checked);
        });
    });
    scheduleDayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const timeInput = document.getElementById(`time-${checkbox.dataset.day}`);
            timeInput.disabled = !checkbox.checked;
            if (!checkbox.checked) timeInput.value = '';
        });
    });

    // --- VALIDAÇÃO E MÁSCARA DE CPF ---
    function validaCPF(cpf) {
        if (typeof cpf !== 'string') return false;
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        cpf = cpf.split('').map(el => +el);
        const rest = (count) => (cpf.slice(0, count-12).reduce((soma, el, index) => soma + el * (count-index), 0) * 10) % 11 % 10;
        return rest(10) === cpf[9] && rest(11) === cpf[10];
    }
    if(cpfInput) {
        cpfInput.addEventListener('input', () => {
            let value = cpfInput.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            cpfInput.value = value;
        });
        cpfInput.addEventListener('blur', () => {
            if (isCpfValidated) return;
            const cpf = cpfInput.value;
            if (validaCPF(cpf)) {
                cpfStatus.textContent = 'Válido';
                cpfStatus.className = 'cpf-status valid';
                isCpfValidated = true;
                cpfInput.readOnly = true;
                cpfInput.style.cursor = 'not-allowed';
            } else if (cpf.length > 0) {
                cpfStatus.textContent = 'Inválido';
                cpfStatus.className = 'cpf-status invalid';
                isCpfValidated = false;
            } else {
                cpfStatus.textContent = '';
            }
        });
    }
    
    // --- LÓGICA DA PALETA DE CORES ---
    const handleColorSelection = (palette) => {
        if (!palette) return;
        palette.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-swatch')) {
                const currentSelected = palette.querySelector('.selected');
                if (currentSelected) currentSelected.classList.remove('selected');
                e.target.classList.add('selected');
            }
        });
    };
    const selectColor = (palette, colorValue) => {
        if (!palette) return;
        const currentSelected = palette.querySelector('.selected');
        if (currentSelected) currentSelected.classList.remove('selected');
        const colorToSelect = colorValue || '#ffffff';
        const swatchToSelect = palette.querySelector(`[data-color="${colorToSelect}"]`);
        if (swatchToSelect) swatchToSelect.classList.add('selected');
    };
    handleColorSelection(bgColorPalette);
    handleColorSelection(textColorPalette);
    
    // --- LÓGICA DA API VIACEP ---
    if(cepInput) {
        cepInput.addEventListener('blur', async () => {
            const cep = cepInput.value.replace(/\D/g, '');
            if (cep.length !== 8) return;
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    ruaInput.value = data.logradouro;
                    cidadeInput.value = data.localidade;
                    estadoInput.value = data.uf;
                } else {
                    alert("CEP não encontrado.");
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        });
    }
    
    // --- LÓGICA DE ATUALIZAÇÃO DO PERFIL (FORMULÁRIO PRINCIPAL) ---
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) return;

            if (cpfInput.value.length > 0 && !isCpfValidated) {
                alert("Por favor, insira um CPF válido para salvar.");
                return;
            }

            try {
                let photoURL = currentUser.photoURL;
                const file = photoUploadInput.files[0];
                if (file) {
                    const storageRef = ref(storage, `profile_photos/${currentUser.uid}/${file.name}`);
                    await uploadBytes(storageRef, file);
                    photoURL = await getDownloadURL(storageRef);
                    await updateProfile(currentUser, { photoURL: photoURL });
                    userPhotoEl.src = photoURL;
                }

                if (nameInput.value !== currentUser.displayName) {
                    await updateProfile(currentUser, { displayName: nameInput.value });
                    userNameEl.textContent = nameInput.value;
                }

                const selectedBgColor = bgColorPalette.querySelector('.selected')?.dataset.color;
                const selectedTextColor = textColorPalette.querySelector('.selected')?.dataset.color;
                
                const notificationFormas = Array.from(notificationCheckboxes).filter(i => i.checked).map(i => i.value);
                const notificationFrequencia = document.querySelector('input[name="notificacao_frequencia"]:checked')?.value || null;
                
                const agendaNotificacoes = {};
                if (notificationFrequencia === 'programado') {
                    scheduleDayCheckboxes.forEach(checkbox => {
                        if (checkbox.checked) {
                            const day = checkbox.dataset.day;
                            const timeInput = document.getElementById(`time-${day}`);
                            if (timeInput.value) agendaNotificacoes[day] = timeInput.value;
                        }
                    });
                }
                
                const hasConvenio = document.querySelector('input[name="has-convenio"]:checked').value === 'sim';

                const dataToUpdate = {
                    nome: nameInput.value,
                    email: emailInput.value,
                    whatsapp: whatsappInput.value,
                    data_nascimento: birthdateInput.value,
                    cpf: cpfInput.value,
                    cpf_validado: isCpfValidated,
                    foto_url: photoURL,
                    endereco: {
                        cep: cepInput.value,
                        rua: ruaInput.value,
                        numero: numeroInput.value,
                        complemento: complementoInput.value,
                        cidade: cidadeInput.value,
                        estado: estadoInput.value,
                    },
                    personalizacao: {
                        corFundo: selectedBgColor || null,
                        corTexto: selectedTextColor || null,
                    },
                    notificacoes: {
                        forma: notificationFormas,
                        frequencia: notificationFrequencia,
                        agenda: agendaNotificacoes,
                    }
                };

                if (userType === 'paciente') {
                    dataToUpdate.convenio = {
                        possui: hasConvenio,
                        nome: hasConvenio ? convenioList.value : null
                    };
                }
                
                applyCustomization(dataToUpdate.personalizacao);
                const collectionName = userType === 'profissional' ? 'profissionais' : 'pacientes';
                const userDocRef = doc(db, collectionName, currentUser.uid);
                await setDoc(userDocRef, dataToUpdate, { merge: true });

                successMessage.textContent = 'Perfil atualizado com sucesso!';
                successMessage.classList.remove('hidden');

                setTimeout(() => closeModal(editModal), 2000);

            } catch (error) {
                console.error("Erro detalhado ao atualizar o perfil:", error);
                alert(`Ocorreu um erro ao salvar as alterações.\n\nDetalhes do erro: ${error.message}`);
            }
        });
    }

    // --- LÓGICA DE EXCLUIR CONTA ---
    if (showDeleteModalButton) {
        showDeleteModalButton.addEventListener('click', () => {
            deleteStep1.classList.remove('hidden');
            deleteStep2.classList.add('hidden');
            deleteAccountForm.reset();
            deleteErrorMessage.classList.add('hidden');
            openModal(deleteAccountModal);
        });
    }
    if (closeDeleteModalButton) closeDeleteModalButton.addEventListener('click', () => closeModal(deleteAccountModal));
    if (closeDeleteModalButton2) closeDeleteModalButton2.addEventListener('click', () => closeModal(deleteAccountModal));
    if (cancelDeleteButton) cancelDeleteButton.addEventListener('click', () => closeModal(deleteAccountModal));
    if (deleteAccountModal) deleteAccountModal.addEventListener('click', (e) => { if (e.target === deleteAccountModal) closeModal(deleteAccountModal); });
    if (continueToDeleteButton) {
        continueToDeleteButton.addEventListener('click', () => {
            deleteStep1.classList.add('hidden');
            deleteStep2.classList.remove('hidden');
        });
    }
    if (backToStep1Button) {
        backToStep1Button.addEventListener('click', () => {
            deleteStep2.classList.add('hidden');
            deleteStep1.classList.remove('hidden');
        });
    }
    if (deleteAccountForm) {
        deleteAccountForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            deleteErrorMessage.classList.add('hidden');
            const password = deletePasswordInput.value;
            if (!currentUser) return;

            try {
                const credential = EmailAuthProvider.credential(currentUser.email, password);
                await reauthenticateWithCredential(currentUser, credential);
                
                const collectionName = userType === 'profissional' ? 'profissionais' : 'pacientes';
                await deleteDoc(doc(db, collectionName, currentUser.uid));
                
                try {
                    if (currentUser.photoURL && currentUser.photoURL.includes('firebasestorage')) {
                       const photoToDeleteRef = ref(storage, currentUser.photoURL);
                       await deleteObject(photoToDeleteRef);
                    }
                } catch (storageError) {
                    if (storageError.code !== 'storage/object-not-found') {
                        console.error("Erro ao apagar a foto do Storage:", storageError);
                    }
                }
                
                await deleteUser(currentUser);
                alert("Conta excluída com sucesso.");
                window.location.href = 'index.html';

            } catch (error) {
                console.error("Erro ao excluir a conta:", error);
                deleteErrorMessage.textContent = error.code === 'auth/wrong-password' ? 'Senha incorreta.' : 'Ocorreu um erro. Tente novamente.';
                deleteErrorMessage.classList.remove('hidden');
            }
        });
    }
    // --- FUNÇÃO AUXILIAR DE NORMALIZAÇÃO (Copiar do busca.js) ---
/**
* Função de Normalização: Transforma "Cardiologista" em "cardiologia".
*/
function normalizeSpecialty(str) {
const s = (str || '').toLowerCase().trim();
if (s.startsWith('cardio')) return 'cardiologia';
if (s.startsWith('psico')) return 'psicologia';
if (s.startsWith('nutri')) return 'nutricionista';
if (s.startsWith('derma')) return 'dermatologia';
if (s.startsWith('gineco')) return 'ginecologia';
if (s.startsWith('endoc')) return 'endocrinologia';
if (s.startsWith('oftal')) return 'oftalmologia';
if (s.includes('clínico')) return 'clínico geral';
return s;
}

    // --- LÓGICA DE LOGOUT ---
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await signOut(auth);
            } catch (error) {
                console.error('Erro ao tentar sair:', error);
                alert('Ocorreu um erro ao tentar sair.');
            }
        });
    }
});

