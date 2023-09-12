import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase,  ref, update,onValue
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import { doc, getFirestore, updateDoc } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, signOut, browserSessionPersistence , setPersistence 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";


import {firebaseConfig} from '../firebase_config.js'; 

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const firestoredb = getFirestore(app); 
  const auth = getAuth();

window.onload = document.getElementById('loading').style.visibility = 'hidden';


const signOutUser = async() =>{
  await signOut(auth);
  sessionStorage.clear();
}


function enterPress (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.getElementById('login').click();
  }
}

var e = document.getElementById('email');
var p = document.getElementById('password');

e.addEventListener("keypress", enterPress); 
p.addEventListener("keypress", enterPress); 


async function getUserType(userID){
  const getType = ref(database, 'users/'+userID+'/user_type');
  const type = async() =>{
    onValue(getType, (snapshot) => {
    let user_type = snapshot.val();
    console.log(user_type);
    if(user_type=="client"){
      window.location.replace("http://test-75edb.web.app/index.html");
    }else if(user_type=="provider"){
      window.location.replace("http://test-75edb.web.app/Service_Provider_Dashboard/index.html");
    }else{
      window.location.replace("http://test-75edb.web.app/Admin/admin.html");
    }
  }) 
  } ;
  
  type();
  
}


login.addEventListener('click',(e)=>{
  
  document.getElementById('loading').style.visibility = 'visible';
  document.getElementById('login').disabled = true;
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;

  setPersistence(auth,browserSessionPersistence)
    .then(()=>{
      loginRealTime(email,password);
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
    });
  
});

async function loginRealTime(email,password){
  
  let userID ="";

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {

      // Signed in 
      const user = userCredential.user;
      sessionStorage.user = user.uid;
      userID = user.uid;

      const dt = new Date();

      update(ref(database, 'users/' + userID),{
      last_login: dt
      }
      ).then(async function(){

        await logFirebase(userID);
        alert('Logged In');
        getUserType(userID);
    
      }).catch(function(error){
        console.log('Synchronization failed');
        console.log(error);
        signOutUser();
      })
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      document.getElementById('login').disabled = false;
      alert(errorMessage);
      window.onload = document.getElementById('loading').style.visibility = 'hidden';
  });

}


async function logFirebase(uid){
  try{
    const dt = new Date();
      
      await updateDoc(doc(firestoredb, "users",uid), {
        LastLogin:dt 
      });
      
      
  }catch(error){
    console.log(error);
    location.reload();
  }

}


if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
  signOutUser();
} else {
  console.info( "This page is not reloaded");
}


