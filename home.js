/* ==========================================================
   FICHEIRO: home.js (V6.0 - Login & Menu Corrigidos)
   ========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {

   // --- 1. AUTENTICAÇÃO E CABEÇALHO (Versão Final Completa) ---
    onAuthStateChanged(auth, async (user) => {
        
        // --- SELETORES ---
        // Botões Desktop
        const loginLink = document.querySelector('.nav-link-login');
        const createAccountBtn = document.querySelector('.nav-actions .btn.btn-primary'); 
        
        // Botões Mobile (Aqueles dentro do <li>)
        const mobileAuthItems = document.querySelectorAll('.mobile-auth-item');

        // Áreas de Usuário Logado
        const userArea = document.getElementById('user-logged-area');
        const backArrow = document.getElementById('btn-voltar-painel');

        if (user) {
            console.log("Usuário logado. Ajustando header...");

            // A. ESCONDE botões de visitante (Desktop E Mobile)
            if (loginLink) loginLink.style.display = 'none';
            if (createAccountBtn) createAccountBtn.style.display = 'none';
            
            // Esconde os botões de entrar/criar do menu mobile também!
            mobileAuthItems.forEach(item => item.style.display = 'none');

            // B. Busca dados do Paciente (Mantive sua lógica)
            let nome = "Paciente";
            let foto = "https://placehold.co/40x40/a0d9e5/41b8d5?text=P";
            
            try {
                const docSnap = await getDoc(doc(db, "pacientes", user.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    nome = data.nome ? data.nome.split(' ')[0] : "Paciente";
                    if (data.foto_url) foto = data.foto_url;
                }
            } catch (e) { console.error("Erro perfil:", e); }

            // C. Mostra a Área do Usuário
            if (userArea) {
                userArea.style.display = 'flex';
                userArea.innerHTML = `
                    <a href="paciente-perfil.html" style="text-decoration: none; display: flex; align-items: center; gap: 8px; background: #f0f9ff; padding: 6px 12px; border-radius: 20px; border: 1px solid #e2e8f0; transition: all 0.2s;">
                        <span style="font-weight: 600; color: #007fa3; font-size: 0.9rem;">Olá, ${nome}</span>
                        <img src="${foto}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid #41b8d5;">
                    </a>
                `;
            }

            // D. Mostra a Seta de Voltar
            if (backArrow) {
                backArrow.style.display = 'inline-block';
            }

        } else {
            // --- NÃO LOGADO (VISITANTE) ---
            console.log("Visitante. Restaurando botões...");

            // Restaura botões Desktop
            if (loginLink) loginLink.style.display = ''; // Volta ao padrão do CSS
            if (createAccountBtn) createAccountBtn.style.display = '';

            // Restaura botões Mobile (Importante: deixa o CSS controlar se aparece ou não)
            mobileAuthItems.forEach(item => item.style.display = ''); 

            // Esconde área logada
            if (userArea) userArea.style.display = 'none';
            if (backArrow) backArrow.style.display = 'none';
        }
    });

    // --- 2. MENU HAMBURGER ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('nav-menu--open');
        });
    }

    // --- 3. SCROLL SUAVE ---
    const navLinksScroll = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinksScroll.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (navMenu.classList.contains('nav-menu--open')) {
                    navMenu.classList.remove('nav-menu--open');
                }
            }
        });
    });

    // --- 4. BUSCA DE ESPECIALISTAS ---
    const heroSearchForm = document.getElementById('hero-search-form');
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const especialidade = document.getElementById('especialidade').value;
            const localizacao = document.getElementById('localizacao').value;
            const tipo = document.getElementById('tipo-atendimento').value;
            
            // Normaliza
            const s = (especialidade || '').toLowerCase().trim();
            let especNorm = s;
            if (s.startsWith('cardio')) especNorm = 'cardiologia';
            if (s.startsWith('psico')) especNorm = 'psicologia';
            if (s.startsWith('nutri')) especNorm = 'nutricionista';
            if (s.startsWith('derma')) especNorm = 'dermatologia';
            if (s.startsWith('ortop')) especNorm = 'ortopedia';
            if (s.startsWith('pediat')) especNorm = 'pediatria';
            if (s.startsWith('clínic')) especNorm = 'clínico geral';

            const queryString = new URLSearchParams({
                espec: especNorm,
                loc: localizacao.toLowerCase().trim(),
                tipo: tipo
            }).toString();

            window.location.href = `busca.html?${queryString}`;
        });
    }

    // --- 5. ANIMAÇÃO DE TEXTO ---
    const elLine1 = document.getElementById('typing-line-1');
    const elLine2 = document.getElementById('typing-line-2');
    const cursor = document.querySelector('.blinking-cursor');

    if (elLine1 && elLine2) { 
        const textLine1 = "É cuidado com empatia.";
        const textLine2 = "É tecnologia com propósito.";
        
        function typeLine(text, element, callback) {
            let i = 0;
            element.textContent = ""; 
            if(cursor) cursor.style.display = 'none';
            
            const timer = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(timer);
                    if(cursor) cursor.style.display = 'inline-block';
                    if (callback) callback();
                }
            }, 80);
        }

        setTimeout(() => {
            typeLine(textLine1, elLine1, () => {
                setTimeout(() => typeLine(textLine2, elLine2, null), 500);
            });
        }, 500);
    }
    
    // --- 6. CONTADOR ANIMADO ---
    const researchSection = document.getElementById('pesquisa-resultados');
    if (researchSection) {
        const counters = document.querySelectorAll('.counter');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    counters.forEach(counter => {
                        const target = parseFloat(counter.dataset.target);
                        const isDecimal = counter.dataset.isDecimal === 'true';
                        const suffix = isDecimal ? '/10' : '%';
                        let current = 0;
                        const increment = target / 50; 
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                clearInterval(timer);
                                counter.textContent = isDecimal ? target.toFixed(1) + suffix : Math.round(target) + suffix;
                            } else {
                                counter.textContent = isDecimal ? current.toFixed(1) + suffix : Math.round(current) + suffix;
                            }
                        }, 20);
                    });
                    observer.unobserve(researchSection);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(researchSection);
    }
    
    // --- 7. PLACEHOLDER ROTATIVO ---
    const especialidadeInput = document.getElementById('especialidade');
    if (especialidadeInput) {
        const placeholders = ["Cardiologista", "Psicólogo", "Dermatologista", "Nutricionista", "Ortopedista"];
        let index = 0;
        setInterval(() => {
            index = (index + 1) % placeholders.length; 
            especialidadeInput.placeholder = placeholders[index];
        }, 3000); 
    }
    document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            // 1. Abre/Fecha o menu
            navMenu.classList.toggle('nav-menu--open');
            
            // 2. Troca o Ícone (Barras <-> X)
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('nav-menu--open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
        
        // Fecha ao clicar num link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('nav-menu--open');
                const icon = navToggle.querySelector('i');
                if(icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
});

}); // Fim

