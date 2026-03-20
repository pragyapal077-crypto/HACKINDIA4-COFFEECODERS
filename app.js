import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA2FIugwti0ri5lA-XRoBuFMkDhq9LQYvE",
    authDomain: "hospital-a9b43.firebaseapp.com",
    projectId: "hospital-a9b43",
    storageBucket: "hospital-a9b43.firebasestorage.app",
    messagingSenderId: "124364489495",
    appId: "1:124364489495:web:59b44243d005c556da2d52",
    measurementId: "G-2BJG78RGFV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'lifeline-app';

const apiKey = "8612405284:AAGWNk4H6SD0d0aVmYTpw33dm_YVYtqgaZg"; 

let state = {
    loading: true, 
    view: 'user', 
    activeTab: 'home', 
    lang: 'en',
    location: { lat: 28.6139, lng: 77.2090, name: "Locating...", granted: false },
    osmHospitals: [], 
    firebaseHospitals: [], 
    hospitals: [],
    searchQuery: '', 
    isAiModal: false, 
    aiMessages: [], 
    isAiThinking: false,
    adminHospitalId: null, 
    viewingHospitalDetail: null
};
window.state = state;

function t() { 
    return TRANSLATIONS[state.lang]; 
}
