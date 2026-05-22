// config-firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyCeK15LndS2FGrYzvclM22dIL3tIa2u1kg",
  authDomain: "transpositor-451ab.firebaseapp.com",
  projectId: "transpositor-451ab",
  storageBucket: "transpositor-451ab.firebasestorage.app",
  messagingSenderId: "169931830252",
  appId: "1:169931830252:web:3203a95e14eebe9baf06c9",
  measurementId: "G-KGMG56X8NQ"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

window.auth = firebase.auth();
window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    console.log("Persistência de login ativada.");
  })
  .catch((erro) => {
    console.error("Erro na persistência do login:", erro);
  });
window.db = firebase.firestore();

try {
  window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
} catch (err) {
  console.log("Persistência de login indisponível:", err);
}

try {
  window.db.enablePersistence().catch((err) => {
    console.log("Persistência offline não disponível:", err);
  });
} catch (err) {
  console.log("Persistência offline já configurada ou indisponível:", err);
}
