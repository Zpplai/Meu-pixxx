import { auth, db, googleProvider } from "../../../firebase/firebase.js";

import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { toggleLoader } from "./loader.js";
import { showToast } from "./toast.js";

// --- LÓGICA DO CHECKBOX (PARA NÃO FICAR SEMPRE AZUL) ---
const checkbox = document.getElementById("lembrar-login");

// Verifica se existe algo salvo no navegador ao carregar a página
window.addEventListener('load', () => {
    if (checkbox) {
        const salvo = localStorage.getItem("manterLogado");
        // Se for a primeira vez, deixa marcado. Se não, usa o que o usuário escolheu.
        checkbox.checked = salvo === null ? true : salvo === "true";
    }
});

// Salva a escolha do usuário toda vez que ele clicar na caixinha
if (checkbox) {
    checkbox.addEventListener("change", () => {
        localStorage.setItem("manterLogado", checkbox.checked);
    });
}

// --- LOGIN ---
const btnLogin = document.getElementById("btn-login");
if(btnLogin){
    btnLogin.onclick = async () => {
        const email = document.getElementById("login-email").value.trim();
        const pass = document.getElementById("login-password").value.trim();
        const manterLogado = checkbox ? checkbox.checked : true;

        if(!email || !pass) return showToast("Preencha tudo", "erro");

        toggleLoader(true);
        try {
            // DEFINE SE DEVE LEMBRAR OU NÃO BASEADO NA CAIXINHA
            const persistencia = manterLogado ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistencia);
            
            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "../home/index.html";
        } catch (error) {
            toggleLoader(false);
            showToast("Dados incorretos", "erro");
            console.error(error);
        }
    };
}

// --- CADASTRO ---
const btnRegister = document.getElementById("btn-register");
if(btnRegister){
    btnRegister.onclick = async () => {
        const email = document.getElementById("reg-email").value.trim();
        const pass = document.getElementById("reg-password").value.trim();

        if(!email || pass.length < 6) return showToast("Senha curta", "erro");

        toggleLoader(true);
        try {
            await setPersistence(auth, browserLocalPersistence);
            const result = await createUserWithEmailAndPassword(auth, email, pass);
            
            await setDoc(doc(db, "usuarios", result.user.uid), {
                email,
                saldo: 0,
                perfilCompleto: false
            });
            window.location.href = "../cadastro-perfil/index.html";
        } catch {
            toggleLoader(false);
            showToast("Erro ao criar conta", "erro");
        }
    };
}

// --- GOOGLE ---
const btnGoogle = document.getElementById("btn-google");
if(btnGoogle){
    btnGoogle.onclick = async () => {
        toggleLoader(true);
        try {
            await setPersistence(auth, browserLocalPersistence);
            const result = await signInWithPopup(auth, googleProvider);
            const docSnap = await getDoc(doc(db, "usuarios", result.user.uid));

            if(!docSnap.exists()){
                await setDoc(doc(db, "usuarios", result.user.uid), {
                    email: result.user.email,
                    saldo: 0,
                    perfilCompleto: false
                });
                window.location.href = "../cadastro-perfil/index.html";
            } else {
                window.location.href = "../home/index.html";
            }
        } catch {
            toggleLoader(false);
            showToast("Erro Google", "erro");
        }
    };
}

// --- RECUPERAR ---
const btnRecover = document.getElementById("btn-recover");
if(btnRecover){
    btnRecover.onclick = async () => {
        const email = document.getElementById("rec-email").value.trim();
        if(!email) return showToast("Digite o e-mail", "erro");
        toggleLoader(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toggleLoader(false);
            showToast("E-mail enviado");
        } catch {
            toggleLoader(false);
            showToast("Erro ao enviar", "erro");
        }
    };
}

// 1
// 2
// 3
// 4
// 5
// 6
// 7
// 8
// 9
// 10
