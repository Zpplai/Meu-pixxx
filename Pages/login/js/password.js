window.togglePassword = (inputId) => {

    const input = document.getElementById(inputId);

    if(!input) return;

    input.type =
    input.type === "password"
    ? "text"
    : "password";
};