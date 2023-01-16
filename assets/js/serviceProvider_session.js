import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getDatabase, ref, child, onValue,get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

import {firebaseConfig} from './firebase_config.js';

const app = initializeApp(firebaseConfig);
//const db = getDatabase(app);
const auth = getAuth();
var sessiontext = document.getElementById('session');
var addButton = document.getElementById('addServButton');
window.onload = sessiontext.style.visibility="hidden";

function checkSession(){
  
var sessionData=sessionStorage.getItem("user");
console.log(sessionData);
if(sessionData == "loggedIn"){
    sessiontext.style.visibility="hidden";
    addButton.disabled=false;
}else{
    sessiontext.style.visibility="visible";
    addButton.disabled=true;
}
}

checkSession(); 
const monitorAuthState = async() =>{
    onAuthStateChanged(auth,user=>{
      if(user){
        sessionStorage.setItem("user","loggedIn");
        console.log(user);
        
      }else{
        console.log("no user");
        
      }
    });
  }

monitorAuthState();





