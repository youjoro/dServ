import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";


import {firebaseConfig} from './firebase_config.js';

const app = initializeApp(firebaseConfig);

const auth = getAuth();


function checkSession(){
  
var sessionData=sessionStorage.getItem("user");
console.log(sessionData);
if(sessionData == "loggedIn"){
    document.getElementById("nav_bar").style.display="none";
    document.getElementById("nav_barLoggedIn").style.display="block";
}else{
    document.getElementById("nav_barLoggedIn").style.display="none";
    document.getElementById("nav_bar").style.display="block";
}
}



const monitorAuthState = async() =>{
    onAuthStateChanged(auth,user=>{
      if(user){
        sessionStorage.setItem("user","loggedIn");
        console.log(user);
        checkSession();
      }else{
        console.log("no user");
        document.getElementById("nav_barLoggedIn").style.display="none";
      }
    });
  }

monitorAuthState();

document.getElementById("nav_barLoggedIn").style.display="none";


const signOutUser = async() =>{
    await signOut(auth);
    alert("logged out");
    document.getElementById("nav_barLoggedIn").style.display="none";
    document.getElementById("nav_bar").style.display="block";
    sessionStorage.clear();
    location.reload();
    
}

document.getElementById('logOut').addEventListener('click',signOutUser);

