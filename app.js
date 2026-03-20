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
        { id: 'burns', title: 'পোড়া', steps: ['10-20 মিনিট ঠান্ডা জলে ধুয়ে ফেলুন', 'গয়না সরিয়ে ফেলুন', 'পরিষ্কার কাপড় দিয়ে ঢেকে দিন', 'বরফ লাগাবেনবিধা'], color: 'bg-amber-500', icon: 'flame' },
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

