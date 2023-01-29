// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { chatConfig } from "../firebase_chat_config.js";
import {   
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

// Initialize Firebase
const firebaseAppConfig = getFirebaseConfig();
initializeApp(firebaseAppConfig);

var myName = prompt("Enter your name");

submit.addEventListener('click', (e) => {
// Saves a new message to Cloud Firestore.
async function saveMessage(messageText) {
  // Add a new message entry to the Firebase database.
    try {
        await addDoc(collection(getFirestore(), 'messages'), {
        name: getUserName(),
        text: messageText,
        profilePicUrl: getProfilePicUrl(),
        timestamp: serverTimestamp()
        });
    }
    catch(error) {
        console.error('Error writing new message to Firebase Database', error);
    }
    }
saveMessage();
});

const newMsg = ref(database, 'messages/');
onChildAdded(newMsg, (data) => {
    if(data.val().name != myName) {
        var divData = '<div class="d-flex justify-content-start mb-4" id="fromDiv">\n' +
            '                        <div class="img_cont_msg">\n' +
            '                            <img src="/assets/img/1.png"\n' +
            '                                 class="rounded-circle user_img_msg">\n' +
            '                        </div>\n' +
            '                        <div class="msg_cotainer" >\n' +
            '                            '+data.val().message+'' +
            '                            <span class="msg_time"></span>\n' +
            '                        </div>\n' +
            '                    </div>';
        var d1 = document.getElementById('bodyContent');
        d1.insertAdjacentHTML('beforebegin', divData);
    }else{
        var divData = '<div class="d-flex justify-content-end mb-4">\n' +
            '                        <div class="msg_cotainer_send" id="sendDiv">\n' +
            '                            '+data.val().message+'' +
            '                            <span class="msg_time_send">8:55 AM, Today</span>\n' +
            '                        </div>\n' +
            '                        <div class="img_cont_msg">\n' +
            '                            <img src="/assets/img/1.png"\n' +
            '                                 class="rounded-circle user_img_msg">\n' +
            '                        </div>\n' +
            '                    </div>';
        var d1 = document.getElementById('bodyContent');
        d1.insertAdjacentHTML('beforebegin', divData);
    }
});