import { initializeApp } from "firebase/app";

import { 
  getFirestore, 
  doc, 
  setDoc,
  serverTimestamp, 
  increment
} from "firebase/firestore";

import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from "firebase/auth";


// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "ID_SENDER",
  appId: "SEU_APP_ID"
};


// INICIAR FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// RESGATAR RECOMPENSA
async function resgatarRecompensa() {

  const user = auth.currentUser;

  if (!user) {
    alert("Faça login primeiro");
    return;
  }

  const userRef = doc(db, "usuarios", user.uid);

  const botao = document.getElementById("btnResgate");

  try {

    // desativa botão enquanto carrega
    botao.disabled = true;
    botao.innerText = "Carregando...";

    await setDoc(userRef, {
      ultimoCheckin: serverTimestamp(),
      saldo: increment(100)
    }, { merge: true });

    alert("Você ganhou +100 moedas!");

  } catch (error) {

    console.error(error);
    alert("Erro ao resgatar recompensa");

  } finally {

    botao.disabled = false;
    botao.innerText = "Resgatar";

  }
}


// LOGIN AUTOMÁTICO
onAuthStateChanged(auth, (user) => {

  if (user) {

    console.log("Logado:", user.uid);

    document.getElementById("btnResgate").disabled = false;

  } else {

    signInAnonymously(auth);

  }

});


// BOTÃO
document.getElementById("btnResgate").onclick = resgatarRecompensa;