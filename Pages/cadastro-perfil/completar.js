import { auth, db } from "../../firebase/firebase.js";
import { doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const btn = document.getElementById('btn-finalizar');
const inputs = document.querySelectorAll('#s3 input, #s3 select');
const checkbox = document.getElementById('aceitar-termos');
const inputChave = document.getElementById('setup-pix-chave');
const selectTipo = document.getElementById('setup-pix-tipo');

// 1. FUNÇÃO DE MÁSCARAS E TECLADO (Igual ao perfil)
selectTipo.onchange = () => {
    inputChave.value = "";
    if (["CPF", "CNPJ", "Celular"].includes(selectTipo.value)) {
        inputChave.inputMode = "numeric";
    } else {
        inputChave.inputMode = "text";
    }
};

inputChave.addEventListener("input", (e) => {
    const tipo = selectTipo.value;
    let v = e.target.value;

    if (["CPF", "CNPJ", "Celular"].includes(tipo)) {
        v = v.replace(/\D/g, "");
        if (tipo === "CPF") {
            v = v.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            inputChave.maxLength = 14;
        } else if (tipo === "CNPJ") {
            v = v.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
            inputChave.maxLength = 18;
        } else if (tipo === "Celular") {
            v = v.replace(/^(\d{2})(\d)/g, "($1)$2").replace(/(\d)(\d{4})$/, "$1-$2");
            inputChave.maxLength = 14;
        }
    } else {
        inputChave.maxLength = 60;
    }
    e.target.value = v;
    checarFormulario();
});

// 2. FUNÇÃO PARA VERIFICAR FORMULÁRIO
function checarFormulario() {
    const nome = document.getElementById('setup-nome').value.trim();
    const idade = document.getElementById('setup-idade').value.trim();
    const banco = document.getElementById('setup-pix-banco').value.trim();
    const chave = inputChave.value.trim();
    
    btn.disabled = !(nome && idade && banco && chave && checkbox.checked);
}

document.getElementById('setup-nome').addEventListener('input', checarFormulario);
document.getElementById('setup-idade').addEventListener('input', checarFormulario);
document.getElementById('setup-pix-banco').addEventListener('input', checarFormulario);
checkbox.addEventListener('change', checarFormulario);

// 3. SALVAMENTO NO FIREBASE (Nomes corrigidos para bater com o Perfil)
btn.onclick = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Sessão expirada!");

    try {
        btn.innerText = "Processando...";
        btn.disabled = true;

        await updateDoc(doc(db, "usuarios", user.uid), {
            nome: document.getElementById('setup-nome').value,
            idade: document.getElementById('setup-idade').value,
            banco: document.getElementById('setup-pix-banco').value, // Nome corrigido
            tipo_chave: selectTipo.value, // Nome corrigido
            chave_pix: inputChave.value,  // Nome corrigido
            perfilCompleto: true,
            ultima_alteracao_pix: Date.now(), // Inicia a trava de 48h
            dataCadastro: serverTimestamp()
        });

        window.location.href = "../home/index.html";

    } catch (error) {
        console.error(error);
        btn.disabled = false;
        btn.innerText = "Finalizar Cadastro";
    }
};

checarFormulario();










// Espaço de 10 linhas conforme solicitado
                                                            
