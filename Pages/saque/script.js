// 1 - IMPORTS (Padronizados para evitar erros de versão)
import { auth, db } from "../../firebase/firebase.js";
import { 
    doc, getDoc, runTransaction, serverTimestamp, collection, 
    query, where, getDocs, orderBy, limit 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2 - ELEMENTOS
const saldoEl = document.getElementById("saldo");
const btnSacar = document.getElementById("btnSacar");
const modal = document.getElementById("modal");
const cancelar = document.getElementById("cancelar");
const confirmar = document.getElementById("confirmarSaque");
const verTermos = document.getElementById("verTermos");
const termosHidden = document.getElementById("termosHidden");
const nomeEl = document.getElementById("nome");
const bancoEl = document.getElementById("banco");
const pixEl = document.getElementById("pix");
const mensagem = document.getElementById("mensagem");
const editarPix = document.getElementById("editarPix");
const aceitarTermos = document.getElementById("aceitarTermos");
const botoes = document.querySelectorAll(".btnValor");
const btnHistorico = document.getElementById("btnHistorico");
const modalHistorico = document.getElementById("modalHistorico");
const listaHistorico = document.getElementById("listaHistorico");
const fecharHistorico = document.getElementById("fecharHistorico");

// 3 - VARIÁVEIS
let valorSelecionado = 0;
let saldoUsuario = 0;

// 4 - VOLTAR
document.getElementById("voltar").onclick = () => {
    window.location.href = "../home/index.html";
};

// 5 - LOGIN E CARREGAMENTO INICIAL
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../login/index.html";
        return;
    }

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
        const dados = snap.data();
        saldoUsuario = dados.saldo || 0;
        
        saldoEl.innerText = `R$ ${saldoUsuario.toFixed(2)}`;
        nomeEl.innerText = dados.nome || "";
        bancoEl.innerText = dados.banco || "";
        pixEl.innerText = dados.chave_pix || "";

        botoes.forEach(btn => {
            const valor = Number(btn.dataset.valor);
            if (saldoUsuario < valor) {
                btn.disabled = true;
                btn.style.opacity = "0.4";
            }
        });
    }
});

// 6 - ESCOLHER VALOR
botoes.forEach(btn => {
    btn.onclick = () => {
        if (btn.disabled) return;
        botoes.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        valorSelecionado = Number(btn.dataset.valor);
    };
});

// 7 e 8 - MODAL CONTROLES
btnSacar.onclick = () => {
    if (valorSelecionado <= 0) {
        mensagem.innerText = "Escolha um valor";
        return;
    }
    modal.style.display = "flex";
};

cancelar.onclick = () => { modal.style.display = "none"; };

// 9 - TERMOS
verTermos.onclick = () => {
    const isHidden = termosHidden.style.display === "none" || !termosHidden.style.display;
    termosHidden.style.display = isHidden ? "block" : "none";
    verTermos.innerText = isHidden ? "Ocultar termos" : "Ver termos";
};

// 10 - CHECKBOX
aceitarTermos.onchange = () => {
    confirmar.classList.toggle("ativo", aceitarTermos.checked);
};

// 11 - EDITAR PIX
editarPix.onclick = () => { window.location.href = "../perfil/index.html"; };

// 12 - CONFIRMAR SAQUE (COM TRANSACTION PARA SEGURANÇA)
confirmar.onclick = async () => {
    const user = auth.currentUser;
    if (!user || !aceitarTermos.checked || confirmar.disabled) return;

    confirmar.disabled = true;
    confirmar.innerText = "Processando...";

    const userRef = doc(db, "usuarios", user.uid);
    const saqueRef = doc(collection(db, "saques"));

    try {
        await runTransaction(db, async (transaction) => {
            const userSnap = await transaction.get(userRef);
            const dados = userSnap.data();

            if (!dados.chave_pix || !dados.banco) throw "Cadastre seus dados PIX";
            if (dados.saldo < valorSelecionado) throw "Saldo insuficiente";

            // 1. Desconta o saldo
            transaction.update(userRef, {
                saldo: dados.saldo - valorSelecionado
            });

            // 2. Cria o registro de saque
            transaction.set(saqueRef, {
                uid: user.uid,
                nome: dados.nome,
                pix: dados.chave_pix,
                banco: dados.banco,
                valor: valorSelecionado,
                status: "pendente",
                data: serverTimestamp()
            });
        });

        mensagem.innerText = "Saque solicitado com sucesso!";
        setTimeout(() => location.reload(), 2000);

    } catch (error) {
        console.error(error);
        mensagem.innerText = typeof error === "string" ? error : "Erro ao processar saque";
        confirmar.disabled = false;
        confirmar.innerText = "Confirmar Saque";
    }
};





// 13 - HISTÓRICO (Versão Otimizada para Celular)
btnHistorico.onclick = async () => {
    const user = auth.currentUser;
    if (!user) return;

    modalHistorico.style.display = "flex";
    listaHistorico.innerHTML = "<p style='color: #fff; padding: 20px;'>Carregando histórico...</p>";

    try {
        const colRef = collection(db, "saques");
        const q = query(colRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            listaHistorico.innerHTML = `
                <div class="historicoItem" style="text-align: center; padding: 20px;">
                    <h3 style="color: #ffcc00;">Nenhum saque</h3>
                    <p style="color: #ccc;">Você ainda não solicitou saques.</p>
                </div>`;
            return;
        }

        // Criamos uma lista para poder inverter a ordem manualmente
        let saquesLista = [];
        querySnapshot.forEach(doc => {
            saquesLista.push(doc.data());
        });

        // Inverte: o último saque feito aparece no topo
        saquesLista.reverse();

        listaHistorico.innerHTML = "";

        saquesLista.forEach(saque => {
            const valor = saque.valor ? Number(saque.valor).toFixed(2) : "0.00";
            const status = saque.status || "pendente";
            
            // Define a cor do status para facilitar a leitura
            const corStatus = status === "pendente" ? "#ffcc00" : (status === "pago" ? "#00ff00" : "#ff4444");

            listaHistorico.innerHTML += `
                <div class="historicoItem" style="border-bottom: 1px solid #333; padding: 15px; margin-bottom: 5px;">
                    <h3 style="margin: 0; color: #fff;">R$ ${valor}</h3>
                    <p style="margin: 5px 0 0 0; font-size: 14px; color: #aaa;">
                        Status: <span style="color: ${corStatus}; font-weight: bold;">${status.toUpperCase()}</span>
                    </p>
                </div>
            `;
        });

    } catch (error) {
        console.error("Erro ao carregar:", error);
        listaHistorico.innerHTML = `
            <div style="padding: 20px; color: #ff4444;">
                <h3>Erro ao carregar</h3>
                <p>${error.message}</p>
            </div>`;
    }
};






// 14 - FECHAR HISTÓRICO
if (fecharHistorico) {
    fecharHistorico.onclick = () => {
        modalHistorico.style.display = "none";
    };
} else {
    // Caso o botão não seja encontrado pelo ID, tenta via seletor manual
    const btnFechar = document.querySelector("#fecharHistorico");
    if(btnFechar) {
        btnFechar.onclick = () => {
            modalHistorico.style.display = "none";
        };
    }
}

// FECHAR AO CLICAR FORA DO MODAL (Opcional, mas ajuda muito no celular)
window.onclick = (event) => {
    if (event.target == modalHistorico) {
        modalHistorico.style.display = "none";
    }
    if (event.target == modal) {
        modal.style.display = "none";
    }
};


