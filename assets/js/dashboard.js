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


function checkSession(user){
  
var sessionData=sessionStorage.getItem("user");
console.log(sessionData);
if(sessionData == "loggedIn"){
    document.getElementById('prov_name').innerHTML=user.email; 
}else{
    console.log("no user");
}
}

const monitorAuthState = async() =>{
    onAuthStateChanged(auth,user=>{
      if(user){
        sessionStorage.setItem("user","loggedIn");
        console.log(user);
        checkSession(user); 
      }else{
        console.log("no user");
        
      }
    });
  }

monitorAuthState();





