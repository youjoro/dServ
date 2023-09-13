import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref,get,child,onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth,onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {  getFirestore , collection, getCountFromServer,getDoc, doc , query,  getDocs ,orderBy,limitToLast  } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import {firebaseConfig} from '../firebase_config.js'; 

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const firestoredb = getFirestore(app); 
const auth = getAuth(app);
const checkifFirstLoggedIn = sessionStorage.getItem("IsThisFirstTime_Log_From_LiveServer");


const adminName = document.getElementById('adminName')



 function getUserType(){
  var user_type="";
  var userID = sessionStorage.getItem("user");
  
  
  const getType = ref(realdb, 'users/'+userID+'/user_type');
  const type = async() =>{
    onValue(getType, (snapshot) => {
    user_type = snapshot.val();
    
    if(user_type=="admin"){
      sessionStorage.userTYPE = "admin";
    }else{
      alert("You are not supposed to be here");
      window.location.replace("http://test-75edb.web.app/index.html");
    }
  })
  } ;
  
  type();
  
}


function checkSession(){
  
var sessionData=sessionStorage.getItem("sessionCheck");

  if(sessionData == "loggedIn"){
      getUserType()
  }else{
      alert("You are not supposed to be here");
      window.location.replace("http://test-75edb.web.app/index.html");
  }
}

var total_pending = 0; 

      


const monitorAuthState = async() =>{
  if (checkifFirstLoggedIn == true);
  else{
    onAuthStateChanged(auth,user=>{
      if(user){
        sessionStorage.verified = user.emailVerified;
        console.log(user.emailVerified);
        sessionStorage.user = user.uid;
        sessionStorage.sessionCheck = "loggedIn";
        adminName.innerHTML = user.email
        checkSession();
        
      }else{
        signOut(auth);
        console.log("no user");
        alert("You are not supposed to be here");
        window.location.replace("http://test-75edb.web.app/index.html");
      }
    });
        
  }

}
monitorAuthState();

const signOutUser = async() =>{
    await signOut(auth);
    alert("logged out");
    sessionStorage.clear();
    localStorage.clear();
    location.reload();
    sessionStorage.reloaded = "yes";
    window.location.replace("http://test-75edb.web.app/index.html");
}
document.getElementById('logOut').addEventListener('click', signOutUser);








