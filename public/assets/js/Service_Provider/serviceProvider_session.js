import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getDatabase, ref, child, onValue,get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getFirestore} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

import {firebaseConfig, firestoreConfig} from '../firebase_config.js';

const app = initializeApp(firebaseConfig);
const firestoreapp = initializeApp(firestoreConfig,"secondary");
const realdb = getDatabase(app);
const auth = getAuth();
const fireauth = getAuth(firestoreapp);



//Session
function getUserType(){
  var user_type="";
    var userID = sessionStorage.getItem("user");
    
    const getType = ref(realdb, 'users/'+userID+'/user_type');
    const type = async() =>{
      onValue(getType, (snapshot) => {
      user_type = snapshot.val();
      
      if(user_type=="client" || user_type==null){
        alert("You are not supposed to be here");
        window.location.replace("http://127.0.0.1:5500/index.html
");
      }else{
        
        document.getElementById("profile_content").style.visibility = "visible";
        if(document.getElementById("loading") != null){
          
          document.getElementById("loading").remove();
        }
        
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
const monitorFireAuth = async() =>{

      onAuthStateChanged(fireauth,user=>{
        if(user){
          sessionStorage.fireuser = user.uid;
          
          checkSession();
        }else{
          console.log("no user");                    
        }
      });
  
}


monitorFireAuth();
monitorAuthState();


const signOutUser = async() =>{

    await signOut(auth);
    alert("logged out");
    window.location.replace("http://127.0.0.1:5500/index.html
");
    sessionStorage.clear();
    location.reload();
    
}

document.getElementById('logout').addEventListener('click', signOutUser);