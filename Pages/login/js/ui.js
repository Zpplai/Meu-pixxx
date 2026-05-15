const loginForm = document.getElementById("login-form");

if(loginForm){

    const registerForm =
    document.getElementById("register-form");

    const recoverForm =
    document.getElementById("recover-form");

    document.getElementById("go-register").onclick = (e) => {

        e.preventDefault();

        loginForm.classList.add("hidden");

        registerForm.classList.remove("hidden");
    };

    document.getElementById("go-recover").onclick = (e) => {

        e.preventDefault();

        loginForm.classList.add("hidden");

        recoverForm.classList.remove("hidden");
    };

    document.querySelectorAll(".back-link").forEach(link => {

        link.onclick = (e) => {

            e.preventDefault();

            registerForm.classList.add("hidden");

            recoverForm.classList.add("hidden");

            loginForm.classList.remove("hidden");
        };
    });
}