export function showToast(
    mensagem,
    tipo = "sucesso"
){

    const container =
    document.getElementById("toast-container");

    if(!container) return;

    const toast =
    document.createElement("div");

    toast.className =
    `toast ${tipo === "erro"
    ? "error"
    : ""}`;

    toast.innerText = mensagem;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);
}