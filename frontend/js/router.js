// Função para exibir a página correspondente à rota
function showPage(pageId) {
    // Obtém o arquivo HTML da página específica
    const pageUrl = `pages/${pageId}.html`;

    const response = caches.match(pageUrl)
        .then(response => {
            if (response) {
                return response;
            } else {
                return fetch(pageUrl)
            }
        })

    response.then(response => response.text())
        .then(html => {
            // Insere o conteúdo no elemento #content
            const contentElement = document.getElementById('content');
            contentElement.innerHTML = html;

            // Executa o código JavaScript dentro do conteúdo da página
            const scripts = contentElement.querySelectorAll('script');
            scripts.forEach(script => {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = script.innerHTML;
                contentElement.appendChild(scriptElement);
            });
        }).catch(error => {
            console.error('Erro ao carregar a página:', error);
        });
}

function isHidden(elem) {
    let styles = window.getComputedStyle(elem)
    return styles.display === 'none' || styles.visibility === 'hidden'
}

// Função para manipular eventos de navegação
function handleNavigation(event) {
    event.preventDefault();

    // Obtém a rota do link clicado
    const target = event.target;
    const route = target.getAttribute('href').substring(1);

    // Atualiza a URL
    window.location.hash = route;

    var mobileMenu = document.querySelector(".mobile-menu");
    if (!isHidden(mobileMenu))
        mobileMenu.classList.toggle("hidden");
}

// Event listener para links de navegação
const links = document.querySelectorAll('nav a');
for (let i = 0; i < links.length; i++) {
    links[i].addEventListener('click', handleNavigation);
}

// Event listener para eventos de mudança na URL (hashchange)
window.addEventListener('hashchange', () => {
    const route = window.location.hash.substring(1);
    showPage(route);
});

// Exibe a página inicial ao carregar a SPA
const initialRoute = window.location.hash.substring(1) || 'home';
showPage(initialRoute);