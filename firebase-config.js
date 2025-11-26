// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyD42Pu0kjcollbmkMF7vvJoMlTeHwniqYQ",
    authDomain: "tasublog-7eb67.firebaseapp.com",
    projectId: "tasublog-7eb67",
    storageBucket: "tasublog-7eb67.firebasestorage.app",
    messagingSenderId: "651638420070",
    appId: "1:651638420070:web:7575bb5711c81ce3f033a7",
    measurementId: "G-CCRNXC91RV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export database instance and Firestore functions
export {
    db,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy
};
