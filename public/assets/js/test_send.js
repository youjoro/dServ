import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import {firebaseConfig} from "../js/firebase_config.js";
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const firestore = getFirestore(app);

var p = document.getElementById('send');

p.addEventListener('click',send)

async function send(){

    await setDoc(doc(firestore, "cities", "LA"), {
        name: "Los Angeles",
        state: "CA",
        country: "USA"
    });
    writeUserData("123","test","testing@email.com");
}


function writeUserData(userId, name, email) {
  set(ref(realdb, 'test/' + userId), {
    username: name,
    email: email,
  });
}


