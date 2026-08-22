import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBqIhs9tzrZBWGhj0d_qXIocoqQVFTg-1Y",
    authDomain: "cloud-a1caa.firebaseapp.com",
    projectId: "cloud-a1caa",
    storageBucket: "cloud-a1caa.firebasestorage.app",
    messagingSenderId: "610955327632",
    appId: "1:610955327632:web:7932ef3de6324c5e780015",
    measurementId: "G-SEBKQCYFBN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;