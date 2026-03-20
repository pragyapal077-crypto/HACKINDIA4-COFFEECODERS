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
indow.state = state;

function t() { return TRANSLATIONS[state.lang]; }

function setState(newState, forceRender = true) { 
    state = { ...state, ...newState }; 
    window.state = state; 
    if(forceRender) render(); 
}
window.setState = setState;

// --- 5 FULL LANGUAGES SUPPORT ---
const TRANSLATIONS = {
    en: { 
        gridTitle: "Emergency Grid", searchPlaceholder: "Search disease, symptoms, specialist...", 
        searchTitle: "Search Medical Care", bloodUnits: "Blood Units", realTimeStocks: "Live stock", 
        firstAid: "First Aid", emergencyGuides: "6 Emergency guides", matchedCenters: "Matched Centers", 
        centersFound: "Centers", beds: "Beds", icuBeds: "ICU Beds", ventilators: "Ventilators", 
        doctors: "Doctors", staff: "Staff", liveStatus: "Live Status", panicSOS: "Panic SOS", 
        call108: "Call 108", bloodBank: "Blood Bank", inventoryNear: "Live inventory near you", 
        emergencyAid: "Emergency Aid", stepsFollow: "Follow these until help arrives", 
        aiTitle: "Lifeline AI", aiSub: "Expert Medical Triage", aiPlaceholder: "Explain symptoms (e.g. Heart pain)...", 
        openMaps: "Open Google Maps", consultation: "Consultation", standby: "Paramedics on standby" 
    },
    hi: { 
        gridTitle: "आपातकालीन ग्रिड", searchPlaceholder: "बीमारी या लक्षण खोजें...", 
        searchTitle: "चिकित्सा देखभाल खोजें", bloodUnits: "ब्लड यूनिट्स", realTimeStocks: "लाइव स्टॉक", 
        firstAid: "प्राथमिक उपचार", emergencyGuides: "6 आपातकालीन गाइड", matchedCenters: "मिलते-जुलते अस्पताल", 
        centersFound: "अस्पताल मिले", beds: "बेड", icuBeds: "ICU बेड", ventilators: "वेंटिलेटर", 
        doctors: "डॉक्टर", staff: "कर्मचारी", liveStatus: "लाइव स्थिति", panicSOS: "SOS", 
        call108: "108 कॉल करें", bloodBank: "ब्लड बैंक", inventoryNear: "आपके पास उपलब्ध रक्त", 
        emergencyAid: "आपातकालीन सहायता", stepsFollow: "मदद आने तक इनका पालन करें", 
        aiTitle: "लाइफलाइन AI", aiSub: "विशेषज्ञ चिकित्सा सलाहकार", aiPlaceholder: "लक्षण बताएं (जैसे सीने में दर्द)...", 
        openMaps: "गूगल मैप्स खोलें", consultation: "परामर्श", standby: "पैरामेडिक्स तैयार हैं" 
    },
    bn: {
        gridTitle: "ইমার্জেন্সি গ্রিড", searchPlaceholder: "রোগ বা লক্ষণ খুঁজুন...", 
        searchTitle: "চিকিৎসা সহায়তা খুঁজুন", bloodUnits: "রক্তের ইউনিট", realTimeStocks: "লাইভ স্টক", 
        firstAid: "প্রাথমিক চিকিৎসা", emergencyGuides: "৬টি ইমার্জেন্সি গাইড", matchedCenters: "মিলে যাওয়া হাসপাতাল", 
        centersFound: "হাসপাতাল পাওয়া গেছে", beds: "শয্যা", icuBeds: "আইসিইউ শয্যা", ventilators: "ভেন্টিলেটর", 
        doctors: "ডাক্তার", staff: "কর্মী", liveStatus: "লাইভ স্ট্যাটাস", panicSOS: "প্যানিক SOS", 
        call108: "108 কল করুন", bloodBank: "ব্লাড ব্যাংক", inventoryNear: "আপনার কাছাকাছি ব্লাড স্টক", 
        emergencyAid: "জরুরী সহায়তা", stepsFollow: "সাহায্য না আসা পর্যন্ত এগুলি অনুসরণ করুন", 
        aiTitle: "লাইফলাইন AI", aiSub: "বিশেষজ্ঞ চিকিৎসা পরামর্শদাতা", aiPlaceholder: "লক্ষণগুলি বর্ণনা করুন (যেমন বুকে ব্যথা)...", 
        openMaps: "গুগল ম্যাপ খুলুন", consultation: "পরামর্শ", standby: "প্যারামেডিকরা প্রস্তুত"
    },
    ta: {
        gridTitle: "அவசர கட்டம்", searchPlaceholder: "நோய் அல்லது அறிகுறிகளை தேடுங்கள்...", 
        searchTitle: "மருத்துவ உதவி தேடுங்கள்", bloodUnits: "இரத்த அலகுகள்", realTimeStocks: "நிகழ்நேர இருப்பு", 
        firstAid: "முதலுதவி", emergencyGuides: "6 அவசர வழிகாட்டிகள்", matchedCenters: "பொருத்தமான மருத்துவமனைகள்", 
        centersFound: "மையங்கள்", beds: "படுக்கைகள்", icuBeds: "ICU படுக்கைகள்", ventilators: "வென்டிலேட்டர்கள்", 
        doctors: "மருத்துவர்கள்", staff: "பணியாளர்கள்", liveStatus: "நேரடி நிலை", panicSOS: "அவசர SOS", 
        call108: "108 ஐ அழைக்கவும்", bloodBank: "இரத்த வங்கி", inventoryNear: "அருகிலுள்ள இரத்த இருப்பு", 
        emergencyAid: "அவசர உதவி", stepsFollow: "உதவி வரும் வரை பின்பற்றவும்", 
        aiTitle: "லைஃப்லைன் AI", aiSub: "நிபுணர் மருத்துவ வழிகாட்டி", aiPlaceholder: "அறிகுறிகளை விவரிக்கவும்...", 
        openMaps: "வரைபடத்தை திறக்க", consultation: "ஆலோசனை", standby: "தயார் நிலை"
    },
    te: {
        gridTitle: "అత్యవసర గ్రిడ్", searchPlaceholder: "వ్యాధి లేదా లక్షణాలను శోధించండి...", 
        searchTitle: "వైద్య సహాయం శోధించండి", bloodUnits: "రక్త యూనిట్లు", realTimeStocks: "లైవ్ స్టాక్", 
        firstAid: "ప్రథమ చికిత్స", emergencyGuides: "6 అత్యవసర గైడ్‌లు", matchedCenters: "సరిపోలిన ఆసుపత్రులు", 
        centersFound: "కేంద్రాలు", beds: "పడకలు", icuBeds: "ICU పడకలు", ventilators: "వెంటిలేటర్లు", 
        doctors: "వైద్యులు", staff: "సిబ్బంది", liveStatus: "లైవ్ స్టేటస్", panicSOS: "అత్యవసర SOS", 
        call108: "108 కు కాల్ చేయండి", bloodBank: "బ్లడ్ బ్యాంక్", inventoryNear: "మీ దగ్గర ఉన్న రక్తం నిల్వ", 
        emergencyAid: "అత్యవసర సహాయం", stepsFollow: "సహాయం వచ్చేవరకు వీటిని పాటించండి", 
        aiTitle: "లైఫ్‌లైన్ AI", aiSub: "నిపుణుల వైద్య సలహాదారు", aiPlaceholder: "లక్షణాలను వివరించండి...", 
        openMaps: "మ్యాప్స్ తెరవండి", consultation: "సంప్రదింపులు", standby: "సిద్ధంగా ఉన్నారు"
    }
};

const FIRST_AID_GUIDES = {
    en: [
        { id: 'cpr', title: 'CPR (Adult)', steps: ['Check scene safety', 'Call 108/Emergency', 'Push hard & fast in center of chest', 'Allow full chest recoil', 'Give rescue breaths'], color: 'bg-red-500', icon: 'heart-pulse' },
        { id: 'choking', title: 'Choking / Heimlich', steps: ['Stand behind the person', 'Give 5 back blows', 'Give 5 abdominal thrusts', 'Repeat until object is out'], color: 'bg-orange-500', icon: 'wind' },
        { id: 'bleeding', title: 'Severe Bleeding', steps: ['Apply firm, direct pressure', 'Use clean cloth or bandage', 'Elevate the injured area', 'Do not remove blood-soaked bandages'], color: 'bg-rose-600', icon: 'droplet' },
        { id: 'burns', title: 'Major Burns', steps: ['Cool burn under cool running water for 10-20 mins', 'Remove jewelry near burn', 'Cover with clean dressing', 'Do NOT apply ice'], color: 'bg-amber-500', icon: 'flame' },
        { id: 'heart', title: 'Heart Attack', steps: ['Have person sit down & rest', 'Loosen tight clothing', 'Ask about chest pain meds', 'Chew adult Aspirin'], color: 'bg-red-600', icon: 'activity' },
        { id: 'stroke', title: 'Stroke (F.A.S.T.)', steps: ['F - Face drooping?', 'A - Arm weakness?', 'S - Speech difficulty?', 'T - Time to call 108'], color: 'bg-purple-500', icon: 'brain' }
    ],
    hi: [
        { id: 'cpr', title: 'CPR (वयस्क)', steps: ['जगह की सुरक्षा जांचें', '108 कॉल करें', 'छाती के बीच में जोर से दबाएं', 'छाती को वापस आने दें', 'सांस दें'], color: 'bg-red-500', icon: 'heart-pulse' },
        { id: 'choking', title: 'दम घुटना (Heimlich)', steps: ['व्यक्ति के पीछे खड़े हों', 'पीठ पर 5 बार थपथपाएं', 'पेट पर 5 बार दबाव दें', 'वस्तु बाहर आने तक दोहराएं'], color: 'bg-orange-500', icon: 'wind' },
        { id: 'bleeding', title: 'गंभीर रक्तस्राव', steps: ['मजबूती से सीधा दबाव डालें', 'साफ कपड़े का प्रयोग करें', 'घायल हिस्से को ऊपर उठाएं', 'खून से सने कपड़े न हटाएं'], color: 'bg-rose-600', icon: 'droplet' },
        { id: 'burns', title: 'गंभीर रूप से जलना', steps: ['जले हुए हिस्से को 10-20 मिनट ठंडे पानी के नीचे रखें', 'गहने हटाएं', 'साफ पट्टी से ढकें', 'बर्फ न लगाएं'], color: 'bg-amber-500', icon: 'flame' },
        { id: 'heart', title: 'दिल का दौरा', steps: ['व्यक्ति को बैठाएं और आराम कराएं', 'तंग कपड़े ढीले करें', 'दवा के बारे में पूछें', 'अगर होश में है, तो एक एस्पिरिन दें'], color: 'bg-red-600', icon: 'activity' },
        { id: 'stroke', title: 'स्ट्रोक (लकवा)', steps: ['चेहरा टेढ़ा होना?', 'हाथ कमज़ोर होना?', 'बोलने में दिक्कत?', '108 कॉल करें'], color: 'bg-purple-500', icon: 'brain' }
    ],
    bn: [
        { id: 'cpr', title: 'CPR (প্রাপ্তবয়স্ক)', steps: ['নিরাপত্তা পরীক্ষা করুন', '108 কল করুন', 'বুকের মাঝখানে জোরে চাপ দিন', 'বুক প্রসারিত হতে দিন', 'শ্বাস দিন'], color: 'bg-red-500', icon: 'heart-pulse' },
        { id: 'choking', title: 'শ্বাসরোধ', steps: ['ব্যক্তির পিছনে দাঁড়ান', 'পিঠে 5 বার চাপড় দিন', 'পেটে 5 বার চাপ দিন', 'পুনরাবৃত্তি করুন'], color: 'bg-orange-500', icon: 'wind' },
        { id: 'bleeding', title: 'রক্তপাত', steps: ['শক্ত চাপ দিন', 'পরিষ্কার কাপড় ব্যবহার করুন', 'আহত স্থান উঁচু করুন', 'ব্যান্ডেজ সরাবেন না'], color: 'bg-rose-600', icon: 'droplet' },
        { id: 'burns', title: 'পোড়া', steps: ['10-20 মিনিট ঠান্ডা জলে ধুয়ে ফেলুন', 'গয়না সরিয়ে ফেলুন', 'পরিষ্কার কাপড় দিয়ে ঢেকে দিন', 'বরফ লাগাবেন না'], color: 'bg-amber-500', icon: 'flame' },
        { id: 'heart', title: 'হার্ট অ্যাটাক', steps: ['রোগীকে বসান', 'পোশাক আলগা করুন', 'ওষুধের কথা জিজ্ঞাসা করুন', 'অ্যাসপিরিন দিন'], color: 'bg-red-600', icon: 'activity' },
        { id: 'stroke', title: 'স্ট্রোক', steps: ['মুখ বেঁকে গেছে?', 'হাত দুর্বল?', 'কথা বলতে সমস্যা?', '108 কল করুন'], color: 'bg-purple-500', icon: 'brain' }
    ],
    ta: [
        { id: 'cpr', title: 'CPR', steps: ['பாதுகாப்பை உறுதி செய்யவும்', '108 ஐ அழைக்கவும்', 'நெஞ்சின் நடுவில் வேகமாக அழுத்தவும்', 'நெஞ்சு எழ அனுமதிக்கவும்', 'சுவாசம் அளிக்கவும்'], color: 'bg-red-500', icon: 'heart-pulse' },
        { id: 'choking', title: 'மூச்சுத்திணறல்', steps: ['பின்னால் நிற்கவும்', 'முதுகில் 5 முறை தட்டவும்', 'வயிற்றில் 5 முறை அழுத்தவும்', 'தொடரவும்'], color: 'bg-orange-500', icon: 'wind' },
        { id: 'bleeding', title: 'ரத்தக்கசிவு', steps: ['அழுத்தம் கொடுக்கவும்', 'சுத்தமான துணியை பயன்படுத்தவும்', 'காயமடைந்த பகுதியை உயர்த்தவும்', 'பேண்டேஜை அகற்ற வேண்டாம்'], color: 'bg-rose-600', icon: 'droplet' },
        { id: 'burns', title: 'தீக்காயம்', steps: ['10-20 நிமிடம் குளிர்ந்த நீரில் கழுவவும்', 'நகைகளை அகற்றவும்', 'சுத்தமான துணியால் மூடவும்', 'ஐஸ் வைக்க வேண்டாம்'], color: 'bg-amber-500', icon: 'flame' },
        { id: 'heart', title: 'மாரடைப்பு', steps: ['உட்கார வைக்கவும்', 'ஆடைகளை தளர்த்தவும்', 'மருந்து பற்றி கேட்கவும்', 'ஆஸ்பிரின் கொடுக்கவும்'], color: 'bg-red-600', icon: 'activity' },
        { id: 'stroke', title: 'பக்கவாதம்', steps: ['முகம் கோணலாக உள்ளதா?', 'கை பலவீனமா?', 'பேச சிரமமா?', '108 ஐ அழைக்கவும்'], color: 'bg-purple-500', icon: 'brain' }
    ],
    te: [
        { id: 'cpr', title: 'CPR', steps: ['భద్రతను తనిఖీ చేయండి', '108 కు కాల్ చేయండి', 'ఛాతీ మధ్యలో బలంగా నొక్కండి', 'ఛాతీ పైకి రానివ్వండి', 'శ్వాస ఇవ్వండి'], color: 'bg-red-500', icon: 'heart-pulse' },
        { id: 'choking', title: 'ఊపిరాడకపోవడం', steps: ['వెనుక నిలబడండి', 'వీపుపై 5 సార్లు కొట్టండి', 'పొట్టపై 5 సార్లు నొక్కండి', 'బయటకు వచ్చేలా చేయండి'], color: 'bg-orange-500', icon: 'wind' },
        { id: 'bleeding', title: 'రక్తస్రావం', steps: ['గట్టిగా ఒత్తిడి చేయండి', 'శుభ్రమైన వస్త్రాన్ని వాడండి', 'భాగాన్ని పైకి ఎత్తండి', 'బ్యాండేజీని తీయవద్దు'], color: 'bg-rose-600', icon: 'droplet' },
        { id: 'burns', title: 'కాలిన గాయాలు', steps: ['10-20 నిమిషాలు చల్లటి నీటిలో కడగండి', 'ఆభరణాలను తీసివేయండి', 'శుభ్రమైన వస్త్రంతో కప్పండి', 'మంచును వాడవద్దు'], color: 'bg-amber-500', icon: 'flame' },
        { id: 'heart', title: 'గుండెపోటు', steps: ['కూర్చోబెట్టండి', 'దుస్తులను వదులు చేయండి', 'మందుల గురించి అడగండి', 'ఆస్పిరిన్ ఇవ్వండి'], color: 'bg-red-600', icon: 'activity' },
        { id: 'stroke', title: 'పక్షవాతం', steps: ['ముఖం వంకరగా ఉందా?', 'చేయి బలహీనంగా ఉందా?', 'మాట్లాడటం కష్టంగా ఉందా?', '108 కు కాల్ చేయండి'], color: 'bg-purple-500', icon: 'brain' }
    ]
};

const SMART_SEARCH_MAP = {
    'heart': 'cardiologist', 'dil': 'cardiologist', 'chest': 'cardiologist', 'chest pain': 'cardiologist', 'attack': 'cardiologist',
    'head': 'neurologist', 'brain': 'neurologist', 'stroke': 'neurologist', 'sir': 'neurologist', 'headache': 'neurologist', 'dizzy': 'neurologist',
    'bone': 'orthopedic', 'fracture': 'orthopedic', 'haddi': 'orthopedic', 'joint': 'orthopedic', 'knee': 'orthopedic', 'accident': 'emergency specialist',
    'child': 'pediatrician', 'kid': 'pediatrician', 'baby': 'pediatrician', 'bacha': 'pediatrician', 'fever': 'general physician',
    'skin': 'dermatologist', 'burn': 'dermatologist', 'twacha': 'dermatologist', 'rash': 'dermatologist',
    'stomach': 'gastroenterologist', 'pet': 'gastroenterologist', 'digestion': 'gastroenterologist', 'pain in stomach': 'gastroenterologist', 'vomit': 'gastroenterologist',
    'lungs': 'pulmonologist', 'breath': 'pulmonologist', 'saans': 'pulmonologist', 'cough': 'pulmonologist', 'asthma': 'pulmonologist',
    'women': 'gynecologist', 'pregnancy': 'gynecologist', 'period': 'gynecologist',
    'eye': 'ophthalmologist', 'aankh': 'ophthalmologist', 'vision': 'ophthalmologist',
    'emergency': 'emergency specialist'
};

// --- CORE FUNCTIONS ---
window.showToast = function(msg) {
    const container = document.getElementById('app-container');
    const id = 't' + Date.now();
    const toastHTML = `
        <div id="${id}" class="fixed top-24 left-4 right-4 z-[300] bg-slate-900 text-white p-4 rounded-2xl font-black text-[10px] text-center uppercase tracking-widest shadow-2xl animate-in">
            ${msg}
        </div>
    `;
    container.insertAdjacentHTML('beforeend', toastHTML);
    setTimeout(() => document.getElementById(id)?.remove(), 4000);
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function mergeHospitals() {
    let merged = [...state.osmHospitals];
    
    state.firebaseHospitals.forEach(fbH => {
        const hLat = parseFloat(fbH.lat) || state.location.lat;
        const hLng = parseFloat(fbH.lng) || state.location.lng;
        
        fbH.distance = calculateDistance(state.location.lat, state.location.lng, hLat, hLng);
        
        const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fbName = normalize(fbH.name);
        
        const idx = merged.findIndex(h => 
            h.id === fbH.id || normalize(h.name) === fbName
        );
        
        if (idx > -1) {
            merged[idx] = { ...merged[idx], ...fbH, isCloudSynced: true, id: fbH.id };
        } else {
            merged.push({ ...fbH, isCloudSynced: true });
        }
    });
    
    merged.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    state.hospitals = merged;
}

function listenToFirebase() {
    const hospitalsRef = collection(db, 'artifacts', appId, 'public', 'data', 'hospitals');
    onSnapshot(hospitalsRef, (snapshot) => {
        state.firebaseHospitals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        mergeHospitals();
        
        if (state.view === 'user') {
            if (state.activeTab === 'home') {
                const container = document.getElementById('hlist');
                if(container) { container.innerHTML = window.renderList(); lucide.createIcons(); }
            } else if (state.activeTab === 'map') {
                if(window.updateMapMarkers) window.updateMapMarkers();
            } else if (state.activeTab === 'blood') {
                const container = document.getElementById('blood-list-container');
                if(container) { container.innerHTML = window.renderBloodList(); lucide.createIcons(); }
            }
            
            if (state.viewingHospitalDetail) {
                const popupContent = document.getElementById('popup-internal-content');
                if(popupContent) {
                    popupContent.innerHTML = window.renderPopupInnerHtml();
                    lucide.createIcons();
                }
            }
        }
    }, (error) => {
        console.error("Firebase Read Error: ", error);
        window.showToast("Cloud Read Error: " + error.message);
    });
}

async function initApp() {
    // FORCE HARD-LOCK SPLASH SCREEN FOR EXACTLY 5 SECONDS
    setTimeout(() => {
        mergeHospitals();
        setState({ loading: false });
    }, 5000);

    listenToFirebase(); 

    try { 
        await signInAnonymously(auth); 
    } catch (e) { 
        console.warn("Local Auth Notice: Working offline/local."); 
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        state.location = { lat: latitude, lng: longitude, granted: true, name: "GPS Active" };
        
        try {
            const osmQuery = `[out:json];node["amenity"="hospital"](around:15000,${latitude},${longitude});out body;`;
            const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(osmQuery)}`);
            const data = await res.json();
            
            const specs = ["Cardiologist", "Neurologist", "Orthopedic Surgeon", "General Physician", "Pediatrician"];
            
            state.osmHospitals = data.elements.map(h => {
                const spec = specs[Math.floor(Math.random() * specs.length)];
                return {
                    id: h.id.toString(), 
                    name: h.tags.name || "Medical Center", 
                    lat: h.lat, 
                    lng: h.lon,
                    // Extract Real Phone number from OpenStreetMaps tags
                    phone: h.tags.phone || h.tags['contact:phone'] || h.tags['mobile'] || null,
                    distance: calculateDistance(latitude, longitude, h.lat, h.lon),
                    beds: 0, icuBeds: 0, ventilators: 0, doctors: 0, cost: 500, specialty: spec,
                    blood: { 'O+': 0, 'AB-': 0, 'B+': 0 }, 
                    medicines: { "Oxygen Cylinders": 0 },
                    doctorsList: [{type: 'General Physician', price: 500}],
                    isAutoPilot: false
                };
            });
            mergeHospitals();
        } catch (e) { 
            console.error("OSM Error, falling back to Firebase only.");
        }
    }, () => {
        console.warn("Location denied, falling back to default/Firebase.");
    }, { timeout: 5000, enableHighAccuracy: true });
}

// --- AUTOMATION: BACKGROUND SYNC & HIS SIMULATOR ---

window.debounceTimer = null;
window.triggerAutoSave = (hId) => {
    clearTimeout(window.debounceTimer);
    window.debounceTimer = setTimeout(async () => {
        const h = state.hospitals.find(x => x.id === hId);
        if (h) {
            try {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'hospitals', h.id), h, { merge: true });
            } catch(e) {
                console.error("Background save failed", e);
            }
        }
    }, 1000); 
};

window.autoPilotInterval = null;
window.toggleAutoPilot = (hId) => {
    const h = state.hospitals.find(x => x.id === hId);
    if (!h) return;
    
    h.isAutoPilot = !h.isAutoPilot;
    
    if (h.isAutoPilot) {
        window.showToast("HIS Auto-Pilot Enabled: Simulating live updates");
        window.autoPilotInterval = setInterval(async () => {
            const currentH = state.hospitals.find(x => x.id === hId);
            if(!currentH || !currentH.isAutoPilot) {
                clearInterval(window.autoPilotInterval);
                return;
            }
            
            if(Math.random() > 0.5 && currentH.beds > 0) currentH.beds--;
            else if(Math.random() > 0.5 && currentH.beds < 200) currentH.beds++;

            if(Math.random() > 0.7 && currentH.icuBeds > 0) currentH.icuBeds--;
            else if(Math.random() > 0.7 && currentH.icuBeds < 50) currentH.icuBeds++;

            const bloodTypes = Object.keys(currentH.blood || {});
            if(bloodTypes.length > 0) {
                const randBlood = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
                if(Math.random() > 0.5) currentH.blood[randBlood]++;
                else if(currentH.blood[randBlood] > 0) currentH.blood[randBlood]--;
            }

            try {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'hospitals', hId), currentH, { merge: true });
            } catch(e) {}
            
            if(state.view === 'admin') {
                const bedsInp = document.getElementById(`admin-beds-${hId}`);
                if(bedsInp) bedsInp.value = currentH.beds;
                const icuInp = document.getElementById(`admin-icu-${hId}`);
                if(icuInp) icuInp.value = currentH.icuBeds;
            }

        }, 5000); 
    } else {
        clearInterval(window.autoPilotInterval);
        window.showToast("HIS Auto-Pilot Disabled");
    }
    
    render();
    window.triggerAutoSave(hId);
};

// --- HANDLERS ---
window.handleLogin = async () => {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    let admin = state.firebaseHospitals.find(a => a.adminUser === user && a.adminPass === pass);
    
    if (admin) {
        setState({ view: 'admin', adminHospitalId: admin.id });
        window.showToast("Connection to Firebase Secured.");
        if(admin.isAutoPilot) window.toggleAutoPilot(admin.id); 
    } else {
        window.showToast("Invalid Credentials or Hospital Not Synced.");
    }
};

window.handleLogout = () => {
    if(window.autoPilotInterval) {
        clearInterval(window.autoPilotInterval);
    }
    setState({view: 'user', adminHospitalId: null});
}

window.handleRegister = async () => {
    const name = document.getElementById('reg-name').value;
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    const address = document.getElementById('reg-address').value || state.location.name;
    const phone = document.getElementById('reg-phone').value || null;
    const lat = parseFloat(document.getElementById('reg-lat').value) || state.location.lat;
    const lng = parseFloat(document.getElementById('reg-lng').value) || state.location.lng;
    
    if(!name || !user || !pass) return window.showToast("Required fields missing");

    const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const nameQuery = normalize(name);
    const existingHospital = state.hospitals.find(h => normalize(h.name) === nameQuery);
    
    const targetId = existingHospital ? existingHospital.id : 'h-' + Date.now();
    
    const newHospital = {
        id: targetId, 
        name: existingHospital ? existingHospital.name : name, 
        address: address, 
        phone: existingHospital && existingHospital.phone ? existingHospital.phone : phone,
        adminUser: user, 
        adminPass: pass, 
        lat: lat, 
        lng: lng, 
        distance: calculateDistance(state.location.lat, state.location.lng, lat, lng),
        beds: existingHospital ? existingHospital.beds : 50, 
        icuBeds: existingHospital ? existingHospital.icuBeds : 10, 
        ventilators: existingHospital ? existingHospital.ventilators : 5, 
        doctors: existingHospital ? existingHospital.doctors : 15, 
        cost: existingHospital ? existingHospital.cost : 500, 
        specialty: existingHospital ? existingHospital.specialty : "Multispecialty",
        blood: existingHospital ? existingHospital.blood : { 'O+': 20, 'AB-': 5, 'B+': 15 }, 
        medicines: existingHospital ? existingHospital.medicines : { "Oxygen Cylinders": 30 },
        doctorsList: existingHospital && existingHospital.doctorsList ? existingHospital.doctorsList : [{ type: 'General Physician', price: 500 }],
        isAutoPilot: false
    };

    try {
        if(!existingHospital) {
            state.firebaseHospitals.push(newHospital);
        } else {
            const idx = state.firebaseHospitals.findIndex(h => h.id === targetId);
            if(idx > -1) state.firebaseHospitals[idx] = newHospital;
            else state.firebaseHospitals.push(newHospital);
        }
        
        mergeHospitals();
        
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'hospitals', targetId), newHospital, {merge: true});
        
        setState({ view: 'admin', adminHospitalId: targetId });
        window.showToast("Hospital Data Secured & Overridden in Firebase");
    } catch (e) { 
        console.error(e);
        window.showToast("Firebase Error: Check Console Logs or Rules. " + e.message); 
    }
};

window.handleAdminPublish = async () => {
    const h = state.hospitals.find(h => h.id === state.adminHospitalId);
    if (!h) return;
    
    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'hospitals', h.id), h, { merge: true });
        window.showToast("Live Updates Uploaded to Cloud");
    } catch(e) { 
        window.showToast("Sync Failed: " + e.message); 
    }
};

window.updateHospitalStatText = (hId, key, val) => { 
    const h = state.hospitals.find(x => x.id === hId); 
    if (h) {
        h[key] = val; 
        window.triggerAutoSave(hId);
    }
};

window.updateHospitalStat = (hId, key, val) => { 
    const h = state.hospitals.find(x => x.id === hId); 
    if (h) {
        h[key] = parseInt(val) || 0; 
        window.triggerAutoSave(hId);
    }
};

window.updateHospitalBlood = (hId, bType, val) => { 
    const h = state.hospitals.find(x => x.id === hId); 
    if (h && h.blood) {
        h.blood[bType] = parseInt(val) || 0; 
        window.triggerAutoSave(hId);
    }
};

window.updateHospitalMeds = (hId, mType, val) => { 
    const h = state.hospitals.find(x => x.id === hId); 
    if (h && h.medicines) {
        h.medicines[mType] = parseInt(val) || 0; 
        window.triggerAutoSave(hId);
    }
};

window.updateDoctor = (hId, idx, key, val) => {
    const h = state.hospitals.find(x => x.id === hId);
    if (h && h.doctorsList) {
        h.doctorsList[idx][key] = key === 'price' ? parseInt(val) || 0 : val;
        if (idx === 0 && key === 'price') h.cost = parseInt(val) || 0;
        window.triggerAutoSave(hId);
    }
};

window.addDoctorSlot = (hId) => {
    const h = state.hospitals.find(x => x.id === hId);
    if (h) {
        if(!h.doctorsList) h.doctorsList = [];
        h.doctorsList.push({ type: 'General Physician', price: 500 });
        window.triggerAutoSave(hId);
        setState({}, true);
    }
};

// --- LEAFLET SATELLITE MAP INITIALIZATION ---
window.initLeafletMap = () => {
    if(window.mapInstance) {
        window.mapInstance.off();
        window.mapInstance.remove();
    }
    
    const container = document.getElementById('leaflet-map');
    if(!container) return;

    window.mapInstance = L.map('leaflet-map', { 
        zoomControl: false, 
        attributionControl: false 
    }).setView([state.location.lat, state.location.lng], 14);
    
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18
    }).addTo(window.mapInstance);

    const userHtml = `
        <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse"></div>
    `;
    const userIcon = L.divIcon({className: '', html: userHtml, iconSize: [16, 16], iconAnchor: [8,8]});
    L.marker([state.location.lat, state.location.lng], {icon: userIcon, zIndexOffset: 1000})
        .addTo(window.mapInstance)
        .bindPopup('<b>Your Location</b>');

    window.hospLayer = L.layerGroup().addTo(window.mapInstance);
    window.updateMapMarkers();

    const ambData = [
        { plate: 'DL 1C AA 1234', type: 'Advanced Life Support (ALS)', phone: '+91-108', cost: '₹1500 base' },
        { plate: 'UP 16 BX 9876', type: 'Basic Life Support (BLS)', phone: '+91-9999888877', cost: '₹800 base' },
        { plate: 'HR 26 XX 5555', type: 'Neonatal Care Unit', phone: '+91-8888777766', cost: '₹2000 base' }
    ];

    const ambHtml = `
        <div class="w-6 h-6 bg-white rounded-full border-2 border-blue-600 shadow-[0_0_10px_rgba(255,255,255,1)] flex items-center justify-center text-[10px] amb-marker">🚑</div>
    `;
    const ambIcon = L.divIcon({className: '', html: ambHtml, iconSize: [24, 24], iconAnchor: [12,12]});
    
    if(window.ambMapInterval) clearInterval(window.ambMapInterval);
    
    const ambs = [
        L.marker([state.location.lat + 0.005, state.location.lng + 0.005], {icon: ambIcon}).addTo(window.mapInstance),
        L.marker([state.location.lat - 0.003, state.location.lng + 0.008], {icon: ambIcon}).addTo(window.mapInstance),
        L.marker([state.location.lat + 0.007, state.location.lng - 0.004], {icon: ambIcon}).addTo(window.mapInstance)
    ];

    ambs.forEach((amb, i) => {
        amb.bindPopup(`
            <div class="p-1">
                <div class="text-xs font-black text-blue-900">${ambData[i].type}</div>
                <div class="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">${ambData[i].plate}</div>
                <div class="text-[11px] font-black text-green-600 mt-2">Contact: ${ambData[i].phone}</div>
                <div class="text-[10px] font-bold text-slate-400 mt-1">Est. Cost: ${ambData[i].cost}</div>
            </div>
        `);
    });

    let angle = 0;
    window.ambMapInterval = setInterval(() => {
        angle += 0.05;
        ambs[0].setLatLng([state.location.lat + Math.sin(angle)*0.005, state.location.lng + Math.cos(angle)*0.005]);
        ambs[1].setLatLng([state.location.lat - 0.003 + Math.cos(angle)*0.003, state.location.lng + 0.008 + Math.sin(angle)*0.003]);
        ambs[2].setLatLng([state.location.lat + 0.007 + Math.sin(angle)*0.004, state.location.lng - 0.004 + Math.cos(angle)*0.004]);
    }, 1000);
};

window.updateMapMarkers = () => {
    if(!window.mapInstance || !window.hospLayer) return;
    window.hospLayer.clearLayers();
    
    const hospHtml = `
        <div class="w-8 h-8 bg-red-600 rounded-xl border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">H</div>
    `;
    const hospIcon = L.divIcon({className: '', html: hospHtml, iconSize: [32, 32], iconAnchor: [16,16]});

    state.hospitals.slice(0, 15).forEach(h => {
        if(h.lat && h.lng) {
            L.marker([parseFloat(h.lat), parseFloat(h.lng)], {icon: hospIcon})
                .addTo(window.hospLayer)
                .bindPopup(`
                    <div class="p-1">
                        <b class="text-slate-800 text-sm block mb-1">${h.name}</b>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">${(h.distance||0).toFixed(2)} km away</span>
                        <div class="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                            <span class="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">BEDS: ${h.beds}</span>
                            <span class="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded">ICU: ${h.icuBeds}</span>
                        </div>
                    </div>
                `);
        }
    });
}
unction UserHomeView() {
    return `
        <div class="p-4 space-y-6 pb-24 overflow-y-auto flex-1 hide-scrollbar">
            <div class="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50">
                <h2 class="text-lg font-black text-slate-900 mb-4">${t().searchTitle}</h2>
                <div class="relative">
                    <i data-lucide="search" class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"></i>
                    <input type="text" placeholder="${t().searchPlaceholder}" class="w-full pl-14 pr-5 py-5 bg-slate-50 rounded-[2rem] font-bold text-sm outline-none shadow-inner" value="${state.searchQuery}" oninput="window.state.searchQuery=this.value; document.getElementById('hlist').innerHTML=window.renderList(); lucide.createIcons();"/>
                </div>
            </div>
            <div id="hlist" class="space-y-4">
                ${window.renderList()}
            </div>
        </div>
    `;
}

window.renderBloodList = () => {
    return state.hospitals.map(h => `
        <div onclick="window.setState({viewingHospitalDetail: '${h.id}'}, true)" class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer active:bg-slate-50 transition-colors relative">
            ${h.isCloudSynced ? `<div class="absolute top-0 right-0 bg-blue-500 text-white text-[7px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-md">LIVE UPDATE</div>` : ''}
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center">
                        <i data-lucide="navigation" class="w-5 h-5"></i>
                    </div>
                    <h4 class="font-black text-slate-800 text-sm truncate max-w-[140px]">${h.name||'Hospital'}</h4>
                </div>
                <span class="text-[9px] font-black text-slate-400 uppercase">${(h.distance||0).toFixed(2)} km</span>
            </div>
            <div class="grid grid-cols-4 gap-2">
                ${Object.entries(h.blood||{'O+':0,'O-':0,'A+':0,'A-':0,'B+':0,'B-':0,'AB+':0,'AB-':0}).map(([type,q])=>`
                    <div class="p-2 bg-slate-50 rounded-xl text-center border border-slate-100">
                        <p class="text-[10px] font-black text-slate-800">${type}</p>
                        <p class="text-[9px] font-bold ${q>0 && h.isCloudSynced ? 'text-green-600' : 'text-slate-400'}">${q}u</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
};

function BloodBankView() {
    return `
        <div class="p-4 pb-24 animate-in flex-1 overflow-y-auto hide-scrollbar space-y-4">
            <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-50">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white">
                        <i data-lucide="droplet" class="w-6 h-6"></i>
                    </div>
                    <h2 class="text-2xl font-black text-slate-900">${t().bloodBank}</h2>
                </div>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">${t().inventoryNear}</p>
            </div>
            <div id="blood-list-container" class="space-y-4">
                ${window.renderBloodList()}
            </div>
        </div>
    `;
}

function FirstAidView() {
    const guides = FIRST_AID_GUIDES[state.lang] || FIRST_AID_GUIDES['en'];
    return `
        <div class="p-4 pb-24 animate-in flex-1 overflow-y-auto hide-scrollbar space-y-4">
            <div class="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-50">
                <div class="flex items-center gap-4 mb-2">
                    <div class="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white">
                        <i data-lucide="info" class="w-6 h-6"></i>
                    </div>
                    <h2 class="text-2xl font-black text-slate-900">${t().emergencyAid}</h2>
                </div>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">${t().emergencyGuides}</p>
            </div>
            ${guides.map(g => `
                <div class="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 ${g.color} text-white rounded-2xl flex items-center justify-center shadow-lg">
                            <i data-lucide="${g.icon}" class="w-6 h-6"></i>
                        </div>
                        <h3 class="text-lg font-black text-slate-800">${g.title}</h3>
                    </div>
                    <div class="space-y-3">
                        ${g.steps.map((s, i) => `
                            <div class="flex gap-4 items-start">
                                <span class="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border border-slate-100">${i+1}</span>
                                <p class="text-xs font-medium text-slate-600 leading-relaxed">${s}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.renderPopupInnerHtml = () => {
    const h = state.hospitals.find(x => x.id === state.viewingHospitalDetail);
    if (!h) return '';
    const docs = (h.doctorsList || []).filter(d => d.present);
    
    return `
        <div class="p-6 ${h.isCloudSynced ? 'bg-blue-600' : 'bg-slate-800'} text-white relative">
            <button onclick="window.setState({viewingHospitalDetail: null}, true)" class="absolute right-6 top-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
            <div class="flex items-center gap-2 mb-2">
                ${h.isCloudSynced 
                    ? `<span class="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/20 rounded-md live-badge">Live Sync</span>`
                    : `<span class="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/20 rounded-md text-slate-300">Unverified Facility</span>`
                }
            </div>
            <h2 class="text-2xl font-black leading-tight mb-1">${h.name || 'Hospital Details'}</h2>
            <p class="text-sm font-medium opacity-90 flex items-center gap-1">
                <i data-lucide="map-pin" class="w-3 h-3"></i> ${(h.distance || 0).toFixed(2)} km away
            </p>
            <p class="text-[10px] font-medium opacity-80 mt-1 flex items-start gap-1">
                <i data-lucide="map" class="w-3 h-3 mt-0.5 shrink-0"></i> ${h.address || 'Address details not available'}
            </p>
        </div>
<div class="p-6 space-y-6 bg-white">
            
            <div class="mt-2 space-y-4">
                <div>
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Emergency Contact</h4>
                    <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span class="text-xs font-bold text-slate-700">Hospital Desk</span>
                        <span class="text-xs font-black ${h.phone ? 'text-blue-600' : 'text-slate-400'}">${h.phone || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-4 gap-2">
                <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span class="text-xl font-black text-blue-600">${h.beds || 0}</span>
                    <span class="text-[8px] font-black uppercase text-slate-400 mt-1">${t().beds}</span>
                </div>
                <div class="p-3 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center">
                    <span class="text-xl font-black text-red-600">${h.icuBeds || 0}</span>
                    <span class="text-[8px] font-black uppercase text-slate-400 mt-1">${t().icuBeds}</span>
                </div>
                <div class="p-3 bg-teal-50 rounded-2xl border border-teal-100 flex flex-col items-center justify-center text-center">
                    <span class="text-xl font-black text-teal-600">${h.ventilators || 0}</span>
                    <span class="text-[8px] font-black uppercase text-slate-400 mt-1">${t().ventilators}</span>
                </div>
                <div class="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center justify-center text-center">
                    <span class="text-xl font-black text-amber-600">${h.ambulances || 0}</span>
                    <span class="text-[8px] font-black uppercase text-slate-400 mt-1">Ambulance</span>
                </div>
            </div>

            <div class="mt-6">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <i data-lucide="stethoscope" class="w-3 h-3"></i> Available Doctors
                </h4>
                <div class="space-y-2">
                    ${docs.length > 0 ? docs.map(d => `
                        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                                <p class="text-xs font-bold text-slate-800">${d.name}</p>
                                <p class="text-[9px] font-bold text-slate-400">${d.type || 'Specialist'}</p>
                            </div>
                            <span class="text-xs font-black text-green-600">₹${d.price}</span>
                        </div>
                    `).join('') : `
                        <div class="p-4 text-center border border-dashed border-slate-200 rounded-xl">
                            <p class="text-xs font-bold text-slate-400">No active doctors found.</p>
                        </div>
                    `}
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">${t().bloodBank}</h4>
                    <div class="grid grid-cols-4 gap-2">
                        ${Object.entries(h.blood || {'O+':0,'O-':0,'A+':0,'A-':0,'B+':0,'B-':0,'AB+':0,'AB-':0}).map(([type, qty]) => `
                            <div class="p-2 bg-slate-50 rounded-xl text-center border border-slate-100">
                                <p class="text-[10px] font-black text-slate-800">${type}</p>
                                <p class="text-[9px] font-bold ${qty > 0 && h.isCloudSynced ? 'text-green-600' : 'text-slate-400'}">${qty}u</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="flex gap-3 pt-4 pb-safe">
                <a href="tel:${h.phone || '108'}" class="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-center text-sm uppercase active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-red-500/30">
                    <i data-lucide="phone" class="w-4 h-4"></i> Call
                </a>
                <button onclick="window.handleNavigation('${h.id}')" class="flex-[1.5] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
                    <i data-lucide="navigation" class="w-4 h-4"></i> ${t().openMaps}
                </button>
            </div>
        </div>
    `;
};

function HospitalDetailPopup() {
    if (!state.viewingHospitalDetail) return '';
    return `
        <div class="fixed inset-0 z-[1001] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center animate-in overflow-y-auto" onclick="window.setState({viewingHospitalDetail: null}, true)">
            <div id="popup-internal-content" class="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl slide-up overflow-hidden" onclick="event.stopPropagation()">
                ${window.renderPopupInnerHtml()}
            </div>
        </div>
    `;
}

window.askAI = async (text) => {
    if (!apiKey) {
        window.showToast("API Key Missing.");
        return;
    }
    if (!text.trim()) return;
    
    const msgs = [...state.aiMessages, { role: 'user', text }];
    setState({ aiMessages: msgs, isAiThinking: true }, false);
    window.renderAIModal();

    const topHospitals = state.hospitals.slice(0, 3).map(h => `${h.name} (${h.beds} beds)`).join(', ');
    const langNames = {en: 'English', hi: 'Hindi', bn: 'Bengali', ta: 'Tamil', te: 'Telugu'};
    const currentLang = langNames[state.lang] || 'English';

    const sysPrompt = `
        You are Lifeline AI, an advanced, empathetic, and highly capable medical support and triage assistant for India. 
        Your primary goal is to provide immediate, actionable first-aid advice, assess symptom severity, and guide patients to the nearest appropriate medical facility.
        1. Always maintain a professional, calm, and highly detailed medical tone.
        2. If symptoms indicate a severe life-threatening emergency, immediately instruct them to CALL 108.
        3. You have access to their live location and nearby hospitals. User Location: ${state.location.name}. 
        Top hospitals nearby based on live data: ${topHospitals}.
        4. Respond entirely and fluently in ${currentLang}.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text }] }], 
                systemInstruction: { parts: [{ text: sysPrompt }] } 
            })
        });
        const result = await response.json();
        const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Call 108 immediately.";
        state.aiMessages = [...msgs, { role: 'ai', text: aiText }];
        state.isAiThinking = false;
        window.renderAIModal();
    } catch (e) {
        state.aiMessages = [...msgs, { role: 'ai', text: "Connection error. Please call 108 directly." }];
        state.isAiThinking = false;
        window.renderAIModal();
    }
};

window.renderAIModal = () => {
    const container = document.getElementById('ai-modal-root');
    if(!container) return;
    
    container.innerHTML = `
        <div class="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm px-4 pb-10 animate-in" onclick="window.setState({isAiModal: false}, true)">
            <div class="bg-white w-full max-w-md h-[85vh] rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden slide-up" onclick="event.stopPropagation()">
                <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <i data-lucide="bot" class="text-white w-5 h-5"></i>
                        </div>
                        <div>
                            <h2 class="text-lg font-black text-slate-900 leading-none">${t().aiTitle}</h2>
                            <p class="text-[10px] font-bold text-green-500 uppercase mt-1">${t().aiSub}</p>
                        </div>
                    </div>
                    <button onclick="window.setState({isAiModal: false}, true)" class="p-2 bg-slate-50 rounded-xl text-slate-400">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div id="ai-chat-box" class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 hide-scrollbar">
                    ${state.aiMessages.map(m => `
                        <div class="flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}">
                            <div class="max-w-[85%] p-4 rounded-3xl ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none shadow-lg' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'}">
                                <p class="text-sm font-medium leading-relaxed">${m.text}</p>
                            </div>
                        </div>
                    `).join('')}
                    ${state.isAiThinking ? `
                        <div class="flex justify-start">
                            <div class="bg-white p-4 rounded-3xl flex gap-1 items-center shadow-sm">
                                <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
                            </div>
                        </div>
                    ` : ''}
                     `;
    lucide.createIcons();
    const cb = document.getElementById('ai-chat-box'); 
    if(cb) cb.scrollTop = cb.scrollHeight;
};

function AdminPanelView() {
    const h = state.hospitals.find(h => h.id === state.adminHospitalId);
    if (!h) return `
        <div class="h-full flex flex-col items-center justify-center bg-slate-900 text-white">
            <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    `;
    
    return `
        <div class="flex flex-col md:flex-row min-h-[100dvh] w-full bg-slate-50 animate-in relative">
            <aside class="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0 overflow-y-auto custom-scrollbar md:h-[100dvh]">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-200">
                            <i class="fa-solid fa-wave-square"></i>
                        </div>
                        <div>
                            <h1 class="text-xl font-extrabold tracking-tight text-slate-800 uppercase italic leading-none">Command</h1>
                            <p class="text-[10px] text-slate-400 font-mono mt-1 w-[130px] truncate" id="sync-time">${h.name}</p>
                        </div>
                    </div>
                    <button onclick="window.handleLogout()" class="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>

                <div class="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl shadow-sm flex justify-between items-center mb-6">
                    <div>
                        <h3 class="font-black text-indigo-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                            <i class="fa-solid fa-robot text-indigo-600"></i> Auto-Pilot
                        </h3>
                    </div>
                    <button onclick="window.toggleAutoPilot('${h.id}')" class="w-12 h-6 rounded-full transition-colors relative shadow-inner ${h.isAutoPilot ? 'bg-indigo-600' : 'bg-slate-300'}">
                        <div class="w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-md ${h.isAutoPilot ? 'left-7' : 'left-1'}"></div>
                    </button>
                </div>

                <div class="space-y-1 mb-8">
                    <div class="flex items-center justify-between mb-3 px-2">
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Depts</p>
                        <button onclick="window.toggleModal('dept-modal', true)" class="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                            <i class="fa-solid fa-plus text-sm"></i>
                        </button>
                    </div>
                    <div id="dept-list" class="space-y-1">
                        ${(h.departments || []).map(dept => {
                            const count = (h.doctorsList || []).filter(d => d.dept === dept.id && d.present).length;
                            const isActive = state.adminUi.activeDeptId === dept.id;
                            return `
                                <button onclick="window.setActiveDept('${dept.id}')" class="w-full flex items-center justify-between p-3 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'hover:bg-slate-50 text-slate-600'}">
                                    <div class="flex items-center gap-3">
                                        <i class="fa-solid ${dept.icon} text-sm ${isActive ? 'text-emerald-600' : 'text-slate-400'}"></i>
                                        <span class="font-bold text-sm tracking-tight">${dept.name}</span>
                                    </div>
                                    <span class="text-[10px] font-black px-2 py-0.5 rounded-full ${count === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}">
                                        ${count}
                                    </span>
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="space-y-4 pt-6 border-t border-slate-100">
                    <div class="flex items-center justify-between px-2">
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Critical Assets</p>
                        <button onclick="window.toggleAssetEdit()" id="edit-assets-btn" class="p-1 ${state.adminUi.isEditingAssets ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-100'} rounded-md transition-colors">
                            <i class="fa-solid fa-sliders text-sm"></i>
                        </button>
                    </div>
                    
                    <div class="p-4 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
                        <div class="space-y-4" id="resource-container">
                            ${[
                                { id: 'icuBeds', label: 'ICU BEDS', icon: 'fa-bed-pulse', color: 'blue', current: h.icuBeds, total: h.assetTotals?.icuBeds || 0 },
                                { id: 'ventilators', label: 'VENTILATORS', icon: 'fa-wind', color: 'cyan', current: h.ventilators, total: h.assetTotals?.ventilators || 0 }
                            ].map(item => {
                                const pct = item.total > 0 ? (item.current / item.total) * 100 : 0;
                                const isCritical = item.current < (item.id === 'icuBeds' ? 5 : 3);
                                return `
                                    <div>
                                        <div class="flex justify-between text-[11px] mb-1.5 font-bold tracking-tight">
                                            <span class="flex items-center gap-2 text-${item.color}-400">
                                                <i class="fa-solid ${item.icon}"></i> ${item.label}
                                            </span>
                                            ${state.adminUi.isEditingAssets ? `
                                                <div class="flex items-center gap-1">
                                                    <span class="text-[8px] text-slate-500 uppercase">Max:</span>
                                                    <input type="number" value="${item.total}" onchange="window.setCapacity('${item.id}', this.value)" class="bg-slate-800 text-white w-10 text-center rounded text-[10px] border border-slate-700 outline-none">
                                                </div>
                                            ` : `
                                                <span id="val-${item.id}" class="${isCritical ? 'text-red-400 animate-pulse' : 'text-slate-400'}">${item.current} / ${item.total}</span>
                                            `}
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <div class="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div class="h-full bg-${isCritical ? 'red' : item.color}-500 transition-all duration-500" style="width: ${pct}%"></div>
                                            </div>
                                            ${!state.adminUi.isEditingAssets ? `
                                                <div class="flex gap-1.5">
                                                    <button onclick="window.adjResourceAdmin('${item.id}', -1)" class="text-slate-500 hover:text-red-400 transition-colors"><i class="fa-solid fa-circle-minus"></i></button>
                                                    <button onclick="window.adjResourceAdmin('${item.id}', 1)" class="text-slate-500 hover:text-green-400 transition-colors"><i class="fa-solid fa-circle-plus"></i></button>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="bg-white border border-slate-200 rounded-2xl p-4">
                        <div class="flex items-center gap-2 mb-4">
                            <i class="fa-solid fa-droplet text-red-500 text-xs"></i>
                            <span class="text-xs font-bold text-slate-800">Blood Bank</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2" id="blood-bank-list">
                            ${Object.entries(h.blood || {}).map(([type, units]) => `
                                <div class="flex justify-between items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <span class="text-[10px] font-black text-slate-400">${type}</span>
                                    <div class="flex items-center gap-2">
                                        <button onclick="window.adjBloodAdmin('${type}', -1)" class="text-slate-300 hover:text-red-500 font-bold">-</button>
                                        <span class="text-xs font-black ${units < 5 ? 'text-red-600 animate-pulse' : 'text-slate-700'}">${units}</span>
                                        <button onclick="window.adjBloodAdmin('${type}', 1)" class="text-slate-300 hover:text-green-500 font-bold">+</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </aside>

            <main class="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar bg-slate-50 md:h-[100dvh]">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div class="flex justify-between items-start mb-2 text-slate-400">
                            <i class="fa-solid fa-phone text-lg"></i>
                            <span class="text-[8px] font-bold tracking-widest uppercase">Contact</span>
                        </div>
                        <input id="admin-phone-${h.id}" type="tel" value="${h.phone || ''}" oninput="window.updateHospitalString('${h.id}', 'phone', this.value)" class="text-sm font-extrabold w-full bg-transparent outline-none text-slate-800 border-b border-dashed border-slate-200 pb-1" placeholder="Add Phone">
                    </div>
                    <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div class="flex justify-between items-start mb-2 text-blue-500">
                            <i class="fa-solid fa-bed text-lg"></i>
                            <span class="text-[8px] font-bold text-slate-400 tracking-widest uppercase">Gen Ward</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <input id="admin-beds-${h.id}" type="number" value="${h.beds}" oninput="window.updateHospitalStat('${h.id}', 'beds', this.value)" class="text-2xl font-extrabold w-16 bg-transparent outline-none text-slate-800">
                            <span class="text-[10px] text-slate-400 uppercase font-bold">Beds</span>
                        </div>
                    </div>
                    <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <div class="flex justify-between items-start mb-2 text-amber-500">
                            <i class="fa-solid fa-truck-medical text-lg"></i>
                            <span class="text-[8px] font-bold text-slate-400 tracking-widest uppercase">Emergency</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <input id="admin-amb-${h.id}" type="number" value="${h.ambulances || 0}" oninput="window.updateHospitalStat('${h.id}', 'ambulances', this.value)" class="text-2xl font-extrabold w-16 bg-transparent outline-none text-slate-800">
                            <span class="text-[10px] text-slate-400 uppercase font-bold">Ambulance</span>
                        </div>
                    </div>
                    <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                        <div class="flex justify-between items-start mb-3 text-red-500">
                            <i class="fa-solid fa-heart-pulse text-xl"></i>
                            <span class="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Capacity</span>
                        </div>
                        <p class="text-2xl font-extrabold" id="stat-icu-usage">${h.assetTotals && h.assetTotals.icuBeds > 0 ? Math.round((h.icuBeds / h.assetTotals.icuBeds) * 100) : 0}%</p>
                        <p class="text-[10px] text-slate-400 uppercase font-bold mt-1">ICU Occupancy</p>
                    </div>
                </div>
<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div class="flex items-center gap-4">
                        <h2 class="text-3xl font-extrabold tracking-tight" id="active-dept-title">${(h.departments || []).find(d => d.id === state.adminUi.activeDeptId)?.name || 'Unit'}</h2>
                        <div class="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            <div class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span class="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Roster</span>
                        </div>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <div class="relative grow md:grow-0">
                            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                            <input type="text" id="staff-search" oninput="window.renderDoctorGrid()" placeholder="Search staff..." class="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64 text-sm shadow-sm">
                        </div>
                        <button onclick="window.toggleModal('staff-modal', true)" class="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 text-sm shrink-0">
                            <i class="fa-solid fa-user-plus"></i>
                            <span>Add Personnel</span>
                        </button>
                    </div>
                </div>

                <div id="doctor-grid" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pb-20"></div>
            </main>
        </div>

        <div id="staff-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 modal-enter" onclick="event.stopPropagation()">
                <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-emerald-50/30">
                    <div>
                        <h3 class="text-xl font-bold">Onboard Staff</h3>
                        <p class="text-xs text-slate-400 font-medium" id="modal-dept-context">Assigning to Unit</p>
                    </div>
                    <button onclick="window.toggleModal('staff-modal', false)" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <div class="p-8 space-y-6">
                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Full Name</label>
                        <input id="new-staff-name" type="text" placeholder="Dr. Jane Smith" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold">
                    </div>
                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Shift Assignment</label>
                        <div class="grid grid-cols-2 gap-2" id="shift-selector">
                            <button onclick="window.selectShift(this, 'Morning')" class="shift-btn p-3 rounded-xl border text-xs font-bold transition-all bg-emerald-600 text-white border-emerald-600">Morning</button>
                            <button onclick="window.selectShift(this, 'Afternoon')" class="shift-btn p-3 rounded-xl border text-xs font-bold transition-all bg-white text-slate-600 border-slate-200">Afternoon</button>
                            <button onclick="window.selectShift(this, 'Evening')" class="shift-btn p-3 rounded-xl border text-xs font-bold transition-all bg-white text-slate-600 border-slate-200">Evening</button>
                            <button onclick="window.selectShift(this, 'Night')" class="shift-btn p-3 rounded-xl border text-xs font-bold transition-all bg-white text-slate-600 border-slate-200">Night</button>
                        </div>
                    </div>
                    <div class="pt-4 flex gap-3">
                        <button onclick="window.toggleModal('staff-modal', false)" class="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
                        <button onclick="window.addStaff()" class="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-100 uppercase tracking-widest text-xs">Authorize</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="dept-modal" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] items-center justify-center p-4">
            <div class="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 modal-enter" onclick="event.stopPropagation()">
                <div class="p-8 border-b border-slate-100 flex justify-between items-center bg-blue-50/30">
                    <div>
                        <h3 class="text-xl font-bold">New Department</h3>
                        <p class="text-xs text-slate-400 font-medium">Expand Capability</p>
                    </div>
                    <button onclick="window.toggleModal('dept-modal', false)" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <div class="p-8 space-y-6">
                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Unit Name</label>
                        <input id="new-dept-name" type="text" placeholder="e.g. Oncology" class="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold">
                    </div>
                    <div class="pt-4 flex gap-3">
                        <button onclick="window.toggleModal('dept-modal', false)" class="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
                        <button onclick="window.addDepartment()" class="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 uppercase tracking-widest text-xs">Create Unit</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function LoginView() {
    return `
        <div class="h-full bg-slate-900 flex flex-col justify-center p-8 animate-in relative">
            <button onclick="window.setState({view: 'user'})" class="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white z-10 hover:bg-white/20 transition-colors">
                <i data-lucide="x" class="w-6 h-6"></i>
            </button>
window.renderDoctorGrid = () => {
    const h = state.hospitals.find(x => x.id === state.adminHospitalId);
    if (!h) return;
    const grid = document.getElementById('doctor-grid');
    if(!grid) return;
    
    const searchInp = document.getElementById('staff-search');
    const search = searchInp ? searchInp.value.toLowerCase() : '';
    
    const filtered = (h.staff || []).filter(doc => 
        doc.dept === state.adminUi.activeDeptId && 
        doc.name.toLowerCase().includes(search)
    );

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 bg-white border border-dashed border-slate-200 rounded-[3rem]">
                <i class="fa-solid fa-user-doctor text-5xl mb-4 opacity-10"></i>
                <p class="font-bold">No unit staff detected</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(doc => `
        <div onclick="window.toggleStaffPresence(${doc.id})" class="group relative cursor-pointer p-6 rounded-[2.5rem] border transition-all duration-300 hover:shadow-xl ${doc.present ? 'bg-white border-green-100' : 'bg-slate-100 border-slate-200 opacity-60 grayscale shadow-inner'}">
            <button onclick="event.stopPropagation(); window.removeStaff(${doc.id})" class="absolute top-5 right-5 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
            <div class="flex justify-between items-start mb-6">
                <div class="p-4 rounded-2xl ${doc.present ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-400'}">
                    <i class="fa-solid fa-user-doctor text-2xl"></i>
                </div>
                <div class="text-right">
                    <div class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2 ${doc.present ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}">
                        ${doc.present ? 'Active' : 'Standby'}
                    </div>
                    <p class="text-[9px] text-slate-400 font-bold">L-SYNC: ${doc.lastActive}</p>
                </div>
            </div>
            <h3 class="font-extrabold text-lg text-slate-800 leading-tight mb-1">${doc.name}</h3>
            <p class="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-5">${doc.shift} Duty</p>
            <div class="flex items-center justify-between pt-5 border-t border-slate-50">
                <div class="flex gap-1">
                    <div class="h-1 w-4 rounded-full ${doc.present ? 'bg-emerald-500' : 'bg-slate-200'}"></div>
                    <div class="h-1 w-4 rounded-full ${doc.present ? 'bg-emerald-500' : 'bg-slate-200'}"></div>
                    <div class="h-1 w-1 rounded-full ${doc.present ? 'bg-emerald-500' : 'bg-slate-200'}"></div>
                </div>
                <div class="w-10 h-5 rounded-full relative transition-colors ${doc.present ? 'bg-emerald-500' : 'bg-slate-300'}">
                    <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all ${doc.present ? 'translate-x-5' : 'translate-x-0'} shadow-sm"></div>
                </div>
            </div>
        </div>
    `).join('');
}

window.initLeafletMap = () => {
    if(window.mapInstance) {
        window.mapInstance.off();
        window.mapInstance.remove();
    }
    const container = document.getElementById('leaflet-map');
    if(!container) return;
    window.mapInstance = L.map('leaflet-map', { 
        zoomControl: false, 
        attributionControl: false 
    }).setView([state.location.lat, state.location.lng], 14);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18
    }).addTo(window.mapInstance);
    const userHtml = `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse"></div>`;
    const userIcon = L.divIcon({className: '', html: userHtml, iconSize: [16, 16], iconAnchor: [8,8]});
    L.marker([state.location.lat, state.location.lng], {icon: userIcon, zIndexOffset: 1000})
        .addTo(window.mapInstance)
        .bindPopup('<b>Your Location</b>');
    window.hospLayer = L.layerGroup().addTo(window.mapInstance);
    window.updateMapMarkers();
    const ambData = [
        { plate: 'UP 14 AB 1024', type: 'Advanced Life Support (ALS)', phone: '+91-108', cost: '₹1200 base + ₹50/km', hospital: 'District Hospital' },
        { plate: 'DL 1C BX 9876', type: 'Basic Life Support (BLS)', phone: '+91-9999888877', cost: '₹800 base + ₹30/km', hospital: 'City Care' },
        { plate: 'HR 26 XX 5555', type: 'Neonatal Care Unit', phone: '+91-8888777766', cost: '₹2000 base + ₹60/km', hospital: 'Child Care Center' }
    ];
    const ambHtml = `<div class="w-6 h-6 bg-white rounded-full border-2 border-blue-600 shadow-[0_0_10px_rgba(255,255,255,1)] flex items-center justify-center text-[10px] amb-marker">🚑</div>`;
    const ambIcon = L.divIcon({className: '', html: ambHtml, iconSize: [24, 24], iconAnchor: [12,12]});
    if(window.ambMapInterval) clearInterval(window.ambMapInterval);
    const ambs = [
        L.marker([state.location.lat + 0.005, state.location.lng + 0.005], {icon: ambIcon}).addTo(window.mapInstance),
        L.marker([state.location.lat - 0.003, state.location.lng + 0.008], {icon: ambIcon}).addTo(window.mapInstance),
        L.marker([state.location.lat + 0.007, state.location.lng - 0.004], {icon: ambIcon}).addTo(window.mapInstance)
    ];
    ambs.forEach((amb, i) => {
        amb.bindPopup(`
            <div class="p-1 min-w-[140px]">
                <div class="text-xs font-black text-blue-900">${ambData[i].type}</div>
                <div class="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">${ambData[i].plate}</div>
                <div class="text-[11px] font-black text-green-600 mt-2">Contact: ${ambData[i].phone}</div>
                <div class="text-[10px] font-bold text-slate-600 mt-1 pb-1 border-b border-slate-100">Est. Cost: ${ambData[i].cost}</div>
                <div class="text-[9px] font-bold text-slate-400 mt-1 uppercase">Dispatched From: <br/>${ambData[i].hospital}</div>
            </div>
        `);
    });
    let angle = 0;
    window.ambMapInterval = setInterval(() => {
        angle += 0.05;
        ambs[0].setLatLng([state.location.lat + Math.sin(angle)*0.005, state.location.lng + Math.cos(angle)*0.005]);
        ambs[1].setLatLng([state.location.lat - 0.003 + Math.cos(angle)*0.003, state.location.lng + 0.008 + Math.sin(angle)*0.003]);
        ambs[2].setLatLng([state.location.lat + 0.007 + Math.sin(angle)*0.004, state.location.lng - 0.004 + Math.cos(angle)*0.004]);
    }, 1000);
};

window.updateMapMarkers = () => {
    if(!window.mapInstance || !window.hospLayer) return;
    window.hospLayer.clearLayers();
    const hospHtml = `<div class="w-8 h-8 bg-red-600 rounded-xl border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">H</div>`;
    const hospIcon = L.divIcon({className: '', html: hospHtml, iconSize: [32, 32], iconAnchor: [16,16]});
    state.hospitals.slice(0, 15).forEach(h => {
        if(h.lat && h.lng) {
            L.marker([parseFloat(h.lat), parseFloat(h.lng)], {icon: hospIcon})
                .addTo(window.hospLayer)
                .bindPopup(`
                    <div class="p-1">
                        <b class="text-slate-800 text-sm block mb-1">${h.name}</b>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">${(h.distance||0).toFixed(2)} km away</span>
                        <div class="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                            <span class="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">BEDS: ${h.beds}</span>
                            <span class="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded">ICU: ${h.icuBeds}</span>
                        </div>
                    </div>
                `);
        }
    });
}
