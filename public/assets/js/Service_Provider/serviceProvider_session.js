import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getDatabase, ref, child, onValue,get} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

import {firebaseConfig} from '../firebase_config.js';

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const auth = getAuth();
const requestnotif = document.getElementById('request_notif');
const viewRequestsButtons = document.getElementById('viewRequests');
const calButtons = document.getElementById('calendarButton');

//Session
function getUserType(){
  var user_type="";
  var userID = sessionStorage.getItem("user");
  
  const getType = ref(realdb, 'users/'+userID+'/user_type');
  const type = async() =>{
    onValue(getType, (snapshot) => {
    user_type = snapshot.val();
    
    if(user_type=="provider" ){
      
      document.getElementById("profile_content").style.visibility = "visible";
      if(document.getElementById("loading") != null){
        
        document.getElementById("loading").remove();
      }
      
    }else{
      alert("You are not supposed to be here");
      window.location.replace("http://test-75edb.web.app/index.html");
    }
  })
  } ;
  
  type();
    
}


function getProfileIMG(userID){
  var dbRef = ref(realdb);
  let pfp = document.getElementById('profileIMG');
  let currentPFP = document.getElementById('myImg');
  get(child(dbRef,"users/"+userID+"/profilePic")).then((snapshot)=>{
    if(snapshot.exists()){
      pfp.src = snapshot.val().imgLink;
      if (currentPFP != null){
        currentPFP.src = snapshot.val().imgLink;
      }
      
    }else{
      pfp.src = "img/abstract-user-flat-4.png";
      currentPFP.src = "img/abstract-user-flat-4.png";
    }
  });
}

function checkSession(){

var sessionData=sessionStorage.getItem("user");

  if(sessionData != null){ 
    getUserType();
  }else{
      console.log("no user");
      
  }
}

const monitorAuthState = async() =>{
  onAuthStateChanged(auth,user=>{
    if(user){
      sessionStorage.verified = user.emailVerified;

      if (user.emailVerified == false){
        viewRequestsButtons.style.visibility="hidden"
        calButtons.style.visibility = "hidden"          
        viewRequestsButtons.href="#"; 
        calButtons.href="#"; 
      }else{
        viewRequestsButtons.style.visibility="visible"
        calButtons.style.visibility = "visible"
        
      }


      document.getElementById('prov_name').innerHTML=user.email;         
      sessionStorage.user = user.uid;
      getProfileIMG(user.uid);
      checkSession(user); 
    }else{
      console.log("no user");
      getUserType();
    }
  });
}

monitorAuthState();


const signOutUser = async() =>{

    await signOut(auth);
    alert("logged out");
    window.location.replace("http://test-75edb.web.app/index.html");
    sessionStorage.clear();
    location.reload();
    
}

document.getElementById('logout').addEventListener('click', signOutUser);