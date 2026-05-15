import { auth, db } from "../../firebase/firebase.js";
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ELEMENTOS HTML
const saldoElemento = document.getElementById("saldo-user");
const saudacaoElemento = document.getElementById("saudacao-user");
const loader = document.getElementById("loader");
const mainContent = document.getElementById("main-content");

// 1. FUNÇÃO PARA ATUALIZAR O SALDO NA TELA
function atualizarSaldoInterface(valor) {
    if (saldoElemento) {
        saldoElemento.innerText = valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }
}

// 2. FUNÇÃO DE SAUDAÇÃO
function obterSaudacao() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
}

// 3. REGISTRAR ATIVIDADE (ANÚNCIOS/JOGOS) - O JEITO SEGURO
// Em vez de somar saldo aqui, você chama essa função
async function registrarAtividade(tipo, recompensaSugerida) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        await addDoc(collection(db, "atividades"), {
            uid: user.uid,
            tipo: tipo, // ex: "anuncio" ou "game"
            valor: recompensaSugerida,
            data: serverTimestamp(),
            status: "pendente" // O servidor vai ler isso e mudar para "concluido"
        });
        console.log(`Atividade de ${tipo} registrada!`);
    } catch (e) {
        console.error("Erro ao registrar:", e);
    }
}

// 4. VERIFICAR LOGIN E OUVIR DADOS
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../login/index.html";
        return;
    }

    const userRef = doc(db, "usuarios", user.uid);

    onSnapshot(userRef, (docSnap) => {
        // Libera a tela
        if (loader) loader.style.display = "none";
        if (mainContent) mainContent.style.opacity = "1";

        if (docSnap.exists()) {
            const dados = docSnap.data();

            // Nome e Saudação
            if (saudacaoElemento) {
                const nome = dados.nome || "Usuário";
                saudacaoElemento.innerText = `${obterSaudacao()}, ${nome}! 👋`;
            }

            // Atualiza Saldo usando a função centralizada
            atualizarSaldoInterface(dados.saldo || 0);

        } else {
            console.warn("Usuário não tem documento no Firestore.");
        }
    }, (error) => {
        console.error("Erro no Firebase:", error);
        if (loader) loader.style.display = "none";
    });
});

// 5. SAÍDA DE EMERGÊNCIA (TELA PRETA NUNCA MAIS)
setTimeout(() => {
    if (loader && loader.style.display !== "none") {
        loader.style.display = "none";
        if (mainContent) mainContent.style.opacity = "1";
    }
}, 3500);

// Deixa a função de navegar global para o HTML ler
window.seguroNav = (url) => window.location.href = url;
