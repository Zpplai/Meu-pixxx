// 1. Registro do Service Worker: Ativa o suporte PWA para o site funcionar offline
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("pwa/service-worker.js")
    .then(() => console.log("SW OK"))
    .catch((err) => console.log("Erro", err));
}







// 2. Captura do Evento de Instalação: Detecta se o navegador permite instalar o app
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById("installBtn");
  btn.style.display = "block";
});







// 3. Execução da Instalação: Mostra a janelinha de "Instalar App" quando o usuário clica no botão
const installBtn = document.getElementById("installBtn");
installBtn.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
  }
});







// 4. Temporizador da Splash Screen: Controla o tempo da tela de abertura e redireciona para o login
setTimeout(() => {
  const splash = document.querySelector(".splash");
  if (splash) splash.classList.add("sumir");

  const proximaPagina = () => {
    window.location.href = "pages/login/index.html";
  };

  setTimeout(proximaPagina, 1000);
}, 4000);
