import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getDatabase, ref, set, child, get,onValue}
    from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

import {firebaseConfig} from './firebase_config.js';

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const auth = getAuth();

 function getUserType(){
  var user_type="";
    var userID = sessionStorage.getItem("user");
    console.log(userID);
    
    const getType = ref(realdb, 'users/'+userID+'/user_type');
    const type = async() =>{
      onValue(getType, (snapshot) => {
      user_type = snapshot.val();
      console.log(user_type);
      if(user_type=="client"){
        document.getElementById('profile_tab').href = "/public/view_profile/profile.html";
      }else{
        document.getElementById('profile_tab').href = "/public/Service_Provider_Dashboard/index.html";
      }
    })
    } ;
    
    type();
    
}

function checkSession(){
  
var sessionData=sessionStorage.getItem("sessionCheck");
console.log(sessionData);
if(sessionData == "loggedIn"){
    document.getElementById("nav_bar").style.display="none";
    document.getElementById("nav_barLoggedIn").style.display="block";
    
     getUserType();
}else{
    document.getElementById("nav_barLoggedIn").style.display="none";
    document.getElementById("nav_bar").style.display="block";
}
}



const monitorAuthState = async() =>{
    onAuthStateChanged(auth,user=>{
      if(user){
        console.log(user.emailVerified);
        sessionStorage.setItem("user",user.uid);
        sessionStorage.setItem("sessionCheck","loggedIn");
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
    sessionStorage.setItem("reloaded","yes");
    window.location.replace("http://127.0.0.1:5500/public/index.html");
}
document.getElementById('logOut').addEventListener('click', signOutUser);

