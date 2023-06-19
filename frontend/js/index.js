var btn = document.querySelector("button.mobile-menu-button");
var menu = document.querySelector(".mobile-menu");
var logoutBtn = document.querySelector("#logoutButton");

btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    window.location.href = "login.html";
});

var installButton = document.querySelector('.install-button');

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();

    var deferredPrompt = event;
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