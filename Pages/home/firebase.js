import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3mylJEsupQqShsxVDFt47wcMR_n1lRhs",
  authDomain: "retro-station.firebaseapp.com",
  projectId: "retro-station",
  storageBucket: "retro-station.firebasestorage.app",
  messagingSenderId: "860166772194",
  appId: "1:860166772194:web:9a92af1068253fd89fd5bb",
  measurementId: "G-RL3T8PZR77"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); // ESSA LINHA SALVA OS DADOS
