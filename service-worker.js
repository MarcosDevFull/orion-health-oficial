// 1. Define o nome do nosso cache
const CACHE_NAME = 'orion-health-cache-v1';

// 2. Define os ficheiros essenciais (o "App Shell")
// IMPORTANTE: Adiciona aqui os teus ficheiros principais
const urlsToCache = [
'/',
'/index.html',
'/style.css',
'/main.js',
'/professional-login.html',
'/professional.js',
'/manifest.json',
'/offline.html' // A nossa página de fallback
// Adiciona aqui imagens importantes, como o teu logo
// '/img/Logo.Orion versao oficial.png' 
];

// 3. Evento "install" (Guarda o "App Shell" no cache)
self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => {
console.log('Cache aberto e ficheiros guardados');
return cache.addAll(urlsToCache);
})
);
});

// 4. Evento "fetch" (Decide se usa o cache ou a rede)
// Esta é a parte que faz o navegador oferecer a instalação
self.addEventListener('fetch', (event) => {
event.respondWith(
caches.match(event.request)
.then((response) => {
// Se encontrar no cache, retorna do cache
if (response) {
return response;
}

// Se não, tenta buscar na rede
return fetch(event.request)
.catch(() => {
// Se a rede falhar, retorna a página offline
return caches.match('/offline.html');
});
})
);
});