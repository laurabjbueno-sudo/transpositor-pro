// config-firebase.js

// 1. Configuração e Inicialização do Firebase (Chaves Oficiais)
const firebaseConfig = {
  apiKey: "AIzaSyCeK15LndS2FGrYzvclM22dIL3tIa2u1kg",
  authDomain: "transpositor-451ab.firebaseapp.com",
  projectId: "transpositor-451ab",
  storageBucket: "transpositor-451ab.firebasestorage.app",
  messagingSenderId: "169931830252",
  appId: "1:169931830252:web:3203a95e14eebe9baf06c9",
  measurementId: "G-KGMG56X8NQ"
};

firebase.initializeApp(firebaseConfig);

// Expõe as ferramentas do Firebase de forma global na janela (window)
window.db = firebase.firestore();
window.auth = firebase.auth();
window.user = null;
window.roleAtual = "user";

// 2. Inicialização e Estrutura do Banco Offline (IndexedDB)
function abrirBancoOffline() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TranspositorOfflineDB", 2);
    request.onupgradeneeded = (event) => {
      const dbIDB = event.target.result;
      if (!dbIDB.objectStoreNames.contains("musicas")) {
        dbIDB.createObjectStore("musicas", { keyPath: "id" });
      }
      if (!dbIDB.objectStoreNames.contains("pastas")) {
        dbIDB.createObjectStore("pastas", { keyPath: "id" });
      }
      if (!dbIDB.objectStoreNames.contains("setlists")) {
        dbIDB.createObjectStore("setlists", { keyPath: "id" });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Expõe a função do banco offline para o resto do sistema
window.abrirBancoOffline = abrirBancoOffline;