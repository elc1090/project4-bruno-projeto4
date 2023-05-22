var btn = document.querySelector("button.mobile-menu-button");
var menu = document.querySelector(".mobile-menu");

btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.log('Falha ao registrar o Service Worker:', error);
            });
    });
}

var installButton = document.querySelector('.install-button');

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();

    const deferredPrompt = event;
    installButton.style.display = 'block';

    installButton.addEventListener('click', () => {
        installButton.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice
            .then(choiceResult => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('O aplicativo foi instalado com sucesso!');
                } else {
                    console.log('O usuário cancelou a instalação.');
                }
                deferredPrompt = null;
            });
    });
});