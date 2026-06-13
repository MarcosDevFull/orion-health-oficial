/* ==========================================================
  	FICHEIRO: busca.js
  	(VERSÃO FINAL com CORREÇÃO DO modalitiesMock)
  	(Formato 0 Espaços)
  	========================================================== */

// --- 1. IMPORTAÇÕES DO FIREBASE (Módulo V9) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, query, where, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// --- 4. VARIÁVEIS GLOBAIS ---
let todosOsProfissionais = []; 
let currentPage = 1;
const resultadosPorPagina = 10; 

let currentFilters = {
especialidade: '',
localizacao: '',
tipo: ''
};

// --- 5. CÓDIGO PRINCIPAL ---
document.addEventListener('DOMContentLoaded', () => {
console.log("busca.js (v13 com Correção modalitiesMock) carregado.");

// --- Seletores de Elementos do HTML ---
const listaResultadosEl = document.getElementById('lista-resultados');
const resultsCountEl = document.getElementById('results-count');
const filterSummaryTitleEl = document.getElementById('filter-summary-title');
const filterTagsContainerEl = document.getElementById('filter-tags-container');
const paginationContainerEl = document.getElementById('pagination-container');
const headerSearchFormEl = document.getElementById('header-search-form');

async function iniciarBusca() {
const params = getSearchParams();
currentFilters = { ...params }; 
renderFilterTags(currentFilters);
await executeSearch(currentFilters); 
}

function getSearchParams() {
const urlParams = new URLSearchParams(window.location.search);
return {
especialidade: (urlParams.get('espec') || ''),
localizacao: (urlParams.get('loc') || ''),
tipo: (urlParams.get('tipo') || '')
};
}

function renderFilterTags(params) {
if (!filterTagsContainerEl || !filterSummaryTitleEl) return;

filterTagsContainerEl.innerHTML = '';
let title = 'Buscando por:';
let hasFilters = false;

if (params.especialidade) {
hasFilters = true;
title = `Buscando por: ${capitalize(params.especialidade)}`;
filterTagsContainerEl.innerHTML += `
<span class="filter-tag">
<i class="fa-solid fa-stethoscope"></i>
${capitalize(params.especialidade)}
<button class="remove-tag-button" data-key="especialidade" aria-label="Remover filtro">&times;</button>
</span>
`;
}
if (params.localizacao) {
hasFilters = true;
filterTagsContainerEl.innerHTML += `
<span class="filter-tag">
<i class="fa-solid fa-location-dot"></i>
${capitalize(params.localizacao)}
<button class="remove-tag-button" data-key="localizacao" aria-label="Remover filtro">&times;</button>
</span>
`;
}
if (params.tipo) {
hasFilters = true;
filterTagsContainerEl.innerHTML += `
<span class="filter-tag">
<i class="fa-solid fa-grip-vertical"></i>
${capitalize(params.tipo)}
<button class="remove-tag-button" data-key="tipo" aria-label="Remover filtro">&times;</button>
</span>
`;
}

if (!hasFilters) {
title = "Exibindo todos os profissionais";
}
filterSummaryTitleEl.textContent = title;
}

async function executeSearch(params) {
if (!listaResultadosEl || !resultsCountEl) return;

const normalizedSpec = normalizeSpecialty(params.especialidade);
const normalizedLoc = (params.localizacao || '').toLowerCase().trim();

todosOsProfissionais = []; 
currentPage = 1;
listaResultadosEl.innerHTML = `
<div class="loading-placeholder">
<div class="spinner"></div>
<p>A carregar profissionais...</p>
</div>
`;
resultsCountEl.textContent = 'Encontrando profissionais...';

const ESPECIALIDADES_MOCK = [
'psicologia', 'nutricionista', 'dermatologia',
'clínico geral', 'ginecologia', 'endocrinologia',
'oftalmologia'
];

let listaTemporaria = [];

try {
if (normalizedSpec) {
console.log(`Buscando no Firebase por: ${normalizedSpec}`);

const q = query(
collection(db, "profissionais"), 
where("especialidadeNormalizada", "==", normalizedSpec),
where("status_verificacao", "==", "aprovado")
);

const querySnapshot = await getDocs(q);

querySnapshot.forEach((doc) => {
const data = doc.data();

const cidade = data.perfilPublico?.endereco?.cidade || '';
const estado = data.perfilPublico?.endereco?.estado || '';
const localizacaoFormatada = (cidade && estado) ? `${cidade}, ${estado}` : "Local não informado";
const modalidadesAtivas = data.perfilPublico?.modalidades || [];


listaTemporaria.push({
id: doc.id,
nome: data.nome || "Nome não encontrado",
especialidade: data.especialidade || "Especialidade não informada",
bio: data.perfilPublico?.bio || "Este profissional ainda não adicionou uma biografia.",
localizacao: localizacaoFormatada, 
foto_url: data.foto_url || "https://placehold.co/64x64/a0d9e5/41b8d5?text=OH",
isVerified: true, 
precoOnline: data.preco_online || 0,
precoPresencial: data.preco_presencial || 0,
precoDomiciliar: data.preco_domiciliar || 0,
modalidades: modalidadesAtivas,
online_status: data.online_status || false
});
});

console.log(`Encontrados ${listaTemporaria.length} profissionais reais.`);
}

if (normalizedSpec) {
console.log("Adicionando 20 mocks para popular...");
listaTemporaria.push(...gerarMocks(20, params.especialidade));
}

if (normalizedLoc) {
console.log(`A filtrar ${listaTemporaria.length} resultados por: "${normalizedLoc}"`);
todosOsProfissionais = listaTemporaria.filter(prof => {
const profLoc = (prof.localizacao || '').toLowerCase().trim();
return profLoc.includes(normalizedLoc);
});
} else {
todosOsProfissionais = listaTemporaria;
}

setupPagination();
displayPage(1);

} catch (error) {
console.error("Erro fatal durante a execução da busca:", error);
listaResultadosEl.innerHTML = `
<div class="loading-placeholder" style="color: red;">
<i class="fa-solid fa-circle-exclamation"></i>
<p>Ocorreu um erro ao processar a sua busca.</p>
<p style="font-size: 0.8rem; max-width: 500px; overflow-wrap: break-word;">${error.message}</p>
</div>
`;
resultsCountEl.textContent = "Erro na busca";
}
}

function setupPagination() {
if (!paginationContainerEl) return;
paginationContainerEl.innerHTML = ''; 

const totalPages = Math.ceil(todosOsProfissionais.length / resultadosPorPagina);

if (totalPages <= 1) {
return;
}

paginationContainerEl.insertAdjacentHTML('beforeend', `
<a href="#" class="pagination-button" data-page="prev">&laquo; Anterior</a>
`);
for (let i = 1; i <= totalPages; i++) {
paginationContainerEl.insertAdjacentHTML('beforeend', `
<a href="#" class="pagination-button" data-page="${i}">${i}</a>
`);
}
paginationContainerEl.insertAdjacentHTML('beforeend', `
<a href="#" class="pagination-button" data-page="next">Próximo &raquo;</a>
`);
}

function displayPage(pageNumber) {
if (!listaResultadosEl || !resultsCountEl) return;
currentPage = pageNumber;

listaResultadosEl.innerHTML = ''; 

const totalResults = todosOsProfissionais.length;
const startIndex = (pageNumber - 1) * resultadosPorPagina;
const endIndex = startIndex + resultadosPorPagina;
const pageItems = todosOsProfissionais.slice(startIndex, endIndex);

if (totalResults === 0) {
resultsCountEl.textContent = "Nenhum profissional encontrado";
listaResultadosEl.innerHTML = `
<div class="loading-placeholder">
<i class="fa-solid fa-user-slash" style="font-size: 2.5rem; color: var(--texto-suave);"></i>
<p>Não encontrámos profissionais para esta busca.<br>Tente alterar os filtros.</p>
</div>
`;
return;
}

resultsCountEl.textContent = `Exibindo ${startIndex + 1}–${Math.min(endIndex, totalResults)} de ${totalResults} resultados`;

pageItems.forEach(prof => {
const cardHTML = renderizarCard(prof);
listaResultadosEl.insertAdjacentHTML('beforeend', cardHTML);
});

updatePaginationButtons(pageNumber);
window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePaginationButtons(activePage) {
if (!paginationContainerEl) return;
const totalPages = Math.ceil(todosOsProfissionais.length / resultadosPorPagina);

document.querySelectorAll('.pagination-button').forEach(button => {
button.classList.remove('active', 'disabled');
const pageData = button.dataset.page;

if (pageData == activePage) {
button.classList.add('active');
}
if (pageData === 'prev' && activePage === 1) {
button.classList.add('disabled');
}
if (pageData === 'next' && activePage === totalPages) {
button.classList.add('disabled');
}
});
}

/**
* gerarMocks (Com localizações mistas e preço domiciliar)
*/
function gerarMocks(quantidade, especialidade = "Clínico Geral") {
const mocks = [];
const nomes = ["Dr. Ana Costa", "Dr. Bruno Alves", "Dra. Carla Dias", "Dr. Daniel Moreira", "Dra. Elisa Faria", "Dr. Fábio Guedes", "Dra. Gabriela Lima", "Dr. Hugo Neves", "Dra. Íris Sales", "Dr. João Vítor"];
const bios = [
"Vasta experiência em hospitais de renome, focado no bem-estar e tratamento humanizado. Tenho vasta experência em atendimento e acompanhamento pós consulta, com foco total em atendiemnto aos pacienets da Orion.Health",
"Especialista em diagnósticos complexos, com publicações em revistas internacionais.",
"Atendimento focado na prevenção e em mudanças de estilo de vida para uma saúde duradoura.",
"Mais de 10 anos de experiência, combinando tratamentos tradicionais e alternativos.",
"Dedicação total à saúde dos meus pacientes, sempre atualizada com as novas tecnologias."
];
const localizacoes = [
"São Paulo, SP",
"Rio de Janeiro, RJ",
"Belo Horizonte, MG",
"Porto Alegre, RS",
"Salvador, BA",
"Recife, PE",
"Curitiba, PR",
"Brasília, DF",
"Fortaleza, CE",
"Manaus, AM"
];

// --- AQUI ESTÁ A CORREÇÃO ---
const modalitiesMock = ["Online", "Presencial", "Domiciliar"]; // <-- A LINHA QUE FALTAVA

for (let i = 0; i < quantidade; i++) {
mocks.push({
id: `mock_${i}`,
nome: nomes[i % nomes.length],
especialidade: capitalize(especialidade),
bio: bios[i % bios.length],
localizacao: localizacoes[i % localizacoes.length],
foto_url: `https://i.pravatar.cc/64?img=${i + 10}`,
isVerified: true,
precoOnline: 180.00 + (i * 10),
precoPresencial: 220.00 + (i * 10),
precoDomiciliar: 270.00 + (i * 15),
modalidades: modalitiesMock,
online_status: (i % 3 === 0)
});
}
return mocks;
}

/**
* renderizarCard (Com o container da bolinha de status)
*/
function renderizarCard(prof) {
const precoOnlineF = (prof.precoOnline || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const precoPresencialF = (prof.precoPresencial || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const precoDomiciliarF = (prof.precoDomiciliar || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); 

let buttonsHTML = '';

if (prof.modalidades && prof.modalidades.includes('Online')) {
buttonsHTML += `
<a href="agendamento.html?id=${prof.id}&tipo=online" class="btn-agenda btn-agenda-online">
<i class="fa-solid fa-video"></i> Agendar Online (${precoOnlineF})
</a>
`;
}

if (prof.modalidades && prof.modalidades.includes('Presencial')) {
buttonsHTML += `
<a href="agendamento.html?id=${prof.id}&tipo=presencial" class="btn-agenda btn-agenda-presencial">
<i class="fa-solid fa-hospital"></i> Agendar Presencial (${precoPresencialF})
</a>
`;
}

if (prof.modalidades && prof.modalidades.includes('Domiciliar')) {
buttonsHTML += `
<a href="agendamento.html?id=${prof.id}&tipo=domiciliar" class="btn-agenda btn-agenda-presencial">
<i class="fa-solid fa-house"></i> Agendar Domiciliar (${precoDomiciliarF})
</a>
`;
}

return `
<div class="professional-card" data-id="${prof.id}">
<div class="card-header">
<div class="profile-pic-container">
<img src="${prof.foto_url}" alt="Foto de ${prof.nome}" class="profile-pic">
<span class="status-dot status-${prof.online_status ? 'online' : 'offline'}"></span>
</div>
<div class="professional-info">
<h3>
${prof.nome}
${prof.isVerified ? '<span class="verified-badge"><i class="fa-solid fa-check"></i> Verificado</span>' : ''}
</h3>
<p>${prof.especialidade}</p>
<div class="professional-meta">
<span><i class="fa-solid fa-location-dot"></i> ${prof.localizacao}</span>
<span><i class="fa-solid fa-star"></i> 4.9 (32)</span>
</div>
</div>
</div>
<div class="card-body">
<p>${prof.bio}</p>
</div>
<div class="card-footer">
<div class="professional-actions">
${buttonsHTML}
</div>
</div>
</div>
`;
}

/**
* capitalize
*/
function capitalize(str) {
if (!str) return "";
return str.split(' ')
.map(word => word.charAt(0).toUpperCase() + word.slice(1))
.join(' ');
}

/**
* normalizeSpecialty
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


// --- 6. OUVINTE DO FORMULÁRIO DO HEADER ---
if (headerSearchFormEl) {
headerSearchFormEl.addEventListener('submit', async (e) => {
e.preventDefault(); 
console.log("Nova busca pelo header disparada!");

currentFilters = {
especialidade: document.getElementById('header-search-input').value,
localizacao: document.getElementById('header-search-loc').value,
tipo: document.getElementById('header-search-tipo').value
};

history.pushState(null, '', `busca.html?${new URLSearchParams(currentFilters).toString()}`);
renderFilterTags(currentFilters);
await executeSearch(currentFilters);
});
}

// --- 7. OUVINTE PARA REMOVER TAGS ---
if (filterTagsContainerEl) {
filterTagsContainerEl.addEventListener('click', async (e) => {
if (e.target.classList.contains('remove-tag-button')) {
e.preventDefault();
const keyToRemove = e.target.dataset.key; 

currentFilters[keyToRemove] = '';

history.pushState(null, '', `busca.html?${new URLSearchParams(currentFilters).toString()}`);
renderFilterTags(currentFilters);
await executeSearch(currentFilters);
}
});
}

// --- 8. OUVINTE PARA OS BOTÕES DE PAGINAÇÃO ---
if (paginationContainerEl) {
paginationContainerEl.addEventListener('click', (e) => {
e.preventDefault();
const target = e.target.closest('.pagination-button');
if (!target || target.classList.contains('disabled') || target.classList.contains('active')) {
return; 
}

const pageData = target.dataset.page;
const totalPages = Math.ceil(todosOsProfissionais.length / resultadosPorPagina);

if (pageData === 'prev') {
if (currentPage > 1) displayPage(currentPage - 1);
} else if (pageData === 'next') {
if (currentPage < totalPages) displayPage(currentPage + 1);
} else {
displayPage(parseInt(pageData));
}
});
}

// --- 9. PONTO DE ENTRADA ---
iniciarBusca();

}); // Fim do DOMContentLoaded