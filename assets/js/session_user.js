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
const checkifFirstLoggedIn = sessionStorage.getItem("IsThisFirstTime_Log_From_LiveServer");

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
        document.getElementById('profile_tab').href = "/view_profile/profile.html";
      }else{
        document.getElementById('profile_tab').href = "/Service_Provider_Dashboard/index.html";
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
  if (checkifFirstLoggedIn == true);
  else{
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
    window.location.replace("https://test-75edb.web.app/index.html");
}
document.getElementById('logOut').addEventListener('click', signOutUser);

