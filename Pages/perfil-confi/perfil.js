import { auth, db } from "../../firebase/firebase.js";
import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1. Função de Aviso Customizado
function mostrarAviso(msg) {
    let box = document.querySelector(".custom-alert");
    if(!box) {
        box = document.createElement('div');
        box.className = 'custom-alert';
        document.body.appendChild(box);
    }
    box.innerText = msg; box.style.display = 'block';
    setTimeout(() => { box.style.display = 'none'; }, 4000);
}

// 2. Máscaras e Filtros Inteligentes
const inputChave = document.getElementById("edit-chave");
const selectTipo = document.getElementById("edit-tipo-chave");

// Reseta o input quando muda o tipo de chave
selectTipo.onchange = () => {
    inputChave.value = "";
    inputChave.removeAttribute("maxLength");
    // Se for CPF, CNPJ ou Celular, força teclado numérico. Se não, teclado normal.
    if (["CPF", "CNPJ", "Celular"].includes(selectTipo.value)) {
        inputChave.inputMode = "numeric";
    } else {
        inputChave.inputMode = "text";
    }
};

inputChave.addEventListener("input", (e) => {
    const tipo = selectTipo.value;
    let v = e.target.value;

    // Se for um tipo que só aceita números, aplica a máscara
    if (["CPF", "CNPJ", "Celular"].includes(tipo)) {
        v = v.replace(/\D/g, ""); // Remove letras

        if (tipo === "CPF") {
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            inputChave.maxLength = 14;
        } else if (tipo === "CNPJ") {
            v = v.replace(/^(\d{2})(\d)/, "$1.$2");
            v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
            v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
            v = v.replace(/(\d{4})(\d)/, "$1-$2");
            inputChave.maxLength = 18;
        } else if (tipo === "Celular") {
            v = v.replace(/^(\d{2})(\d)/g, "($1)$2");
            v = v.replace(/(\d)(\d{4})$/, "$1-$2");
            inputChave.maxLength = 14;
        }
    } else {
        // Para GMAIL ou ALEATÓRIA: Aceita tudo e não tem máscara
        inputChave.maxLength = 60;
    }
    e.target.value = v;
});

// 3. Carregar Dados do Usuário
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("email-user").innerText = user.email;
        const userRef = doc(db, "usuarios", user.uid);
        onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const d = docSnap.data();
                document.getElementById("nome-user").innerText = d.nome || "Usuário";
                document.getElementById("idade-user").innerText = d.idade || "--";
                document.getElementById("banco-user").innerText = d.banco || "Não definido";
                document.getElementById("chave-user").innerText = d.chave_pix || "Não definida";
                document.getElementById("loader").classList.add("hidden");
            }
        });
    } else { window.location.href = "../login/index.html"; }
});

// 4. Salvar com Trava de 48 Horas
document.getElementById("btn-salvar-pix").onclick = async () => {
    const user = auth.currentUser;
    const nBanco = document.getElementById("edit-banco").value;
    const nTipo = selectTipo.value;
    const nChave = inputChave.value;

    if (user && nBanco && nChave) {
        const userRef = doc(db, "usuarios", user.uid);
        onSnapshot(userRef, async (docSnap) => {
            const data = docSnap.data();
            const agora = Date.now();
            const ultima = data.ultima_alteracao_pix || 0;
            const passado = agora - ultima;
            const espera = 48 * 60 * 60 * 1000;

            if (passado < espera) {
                const resto = espera - passado;
                const h = Math.floor(resto / (1000 * 60 * 60));
                const m = Math.floor((resto % (1000 * 60 * 60)) / (1000 * 60));
                mostrarAviso(`Trava de Segurança: Aguarde ${h}h e ${m}min.`);
                return;
            }

            await updateDoc(userRef, { banco: nBanco, tipo_chave: nTipo, chave_pix: nChave, ultima_alteracao_pix: agora });
            document.getElementById("modal-edicao").classList.add("hidden");
            mostrarAviso("Dados salvos com sucesso!");
        }, { once: true });
    } else { mostrarAviso("Preencha todos os campos!"); }
};

// 5. Botões Gerais
document.getElementById("btn-abrir-edicao").onclick = () => document.getElementById("modal-edicao").classList.remove("hidden");
document.getElementById("btn-cancelar").onclick = () => document.getElementById("modal-edicao").classList.add("hidden");
document.getElementById("btn-sair").onclick = () => signOut(auth);










// Espaço de 10 linhas solicitado
