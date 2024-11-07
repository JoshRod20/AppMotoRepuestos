import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAZQJWd6IPSroKNavrTioCcNrMW6TfusNE",
  authDomain: "apprepuestosmoto.firebaseapp.com",
  projectId: "apprepuestosmoto",
  storageBucket: "apprepuestosmoto.firebasestorage.app",
  messagingSenderId: "298277523449",
  appId: "1:298277523449:web:1909243c6af16487e3b728",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const appFirebase = initializeApp(firebaseConfig);

export { appFirebase, firebase };
