import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getDatabase, ref, child, onValue,get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getFirestore , collection,getDoc, doc , getCountFromServer, query, where, getDocs,updateDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

import {firebaseConfig, firestoreConfig} from './firebase_config.js';

const app = initializeApp(firebaseConfig);
const firestoreapp = initializeApp(firestoreConfig,"secondary");
const firestoredb = getFirestore(firestoreapp);
const realdb = getDatabase(app);
const auth = getAuth();
const fireauth = getAuth(firestoreapp);



//Session
function getUserType(){
  var user_type="";
    var userID = sessionStorage.getItem("user");
    console.log(userID);
    
    const getType = ref(realdb, 'users/'+userID+'/user_type');
    const type = async() =>{
      onValue(getType, (snapshot) => {
      user_type = snapshot.val();
      console.log(user_type);
      if(user_type=="client" || user_type==null){
        alert("You are not supposed to be here");
        window.location.replace("http://127.0.0.1:5500/index.html");
      }else{
        document.getElementById("profile_content").style.visibility = "visible";
        document.getElementById('loading').remove();
        
      }
    })
    } ;
    
    type();
    
}


function getProfileIMG(userID){
  var dbRef = ref(realdb);
  let pfp = document.getElementById('profileIMG')
  get(child(dbRef,"users/"+userID+"/profilePic")).then((snapshot)=>{
    if(snapshot.exists()){
      pfp.src = snapshot.val().imgLink;
      
    }else{
      pfp.src = "/Service_Provider_Dashboard/profile.html";
    }
  });
}

function checkSession(user){

var sessionData=sessionStorage.getItem("user");
console.log(sessionData);

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
        sessionStorage.setItem("user",user.uid);
        getProfileIMG(user.uid);
        
        console.log(user);
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
    window.location.replace("http://127.0.0.1:5500/index.html");
    sessionStorage.clear();
    location.reload();
    
}

