// Importar los módulos de Firebase adecuados desde la versión modular
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Solo importa Firestore desde la versión modular

const firebaseConfig = {
  apiKey: "AIzaSyAZQJWd6IPSroKNavrTioCcNrMW6TfusNE",
  authDomain: "apprepuestosmoto.firebaseapp.com",
  projectId: "apprepuestosmoto",
  storageBucket: "apprepuestosmoto.firebasestorage.app",
  messagingSenderId: "298277523449",
  appId: "1:298277523449:web:1909243c6af16487e3b728",
};

// Inicializa Firebase con la configuración modular
const app = initializeApp(firebaseConfig);

// Obtener la referencia de Firestore
const db = getFirestore(app);

export { db };
