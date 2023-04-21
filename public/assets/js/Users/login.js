import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase,  ref, update,onValue
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import { doc, getFirestore, updateDoc } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, signOut, browserSessionPersistence , setPersistence 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";


import {firebaseConfig, firestoreConfig} from '../firebase_config.js'; 

const firestoreapp = initializeApp(firestoreConfig,"secondary");
const fireauth = getAuth(firestoreapp);
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestoredb = getFirestore(firestoreapp); 
const auth = getAuth();


window.onload = document.getElementById('loading').style.visibility = 'hidden';


const signOutUser = async() =>{
  await signOut(auth);
  await signOut(fireauth);
  sessionStorage.clear();
}


async function getUserType(userID){
  const getType = ref(database, 'users/'+userID+'/user_type');
  const type = async() =>{
    onValue(getType, (snapshot) => {
    let user_type = snapshot.val();
    console.log(user_type);
    if(user_type=="client"){
      window.location.replace("http://127.0.0.1:5500/index.html");
    }else{
      window.location.replace("http://127.0.0.1:5500/Service_Provider_Dashboard/index.html");
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
  
  setPersistence(fireauth,browserSessionPersistence)
    .then(()=>{
      loginFirestore(email,password);
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

      update(ref(database, 'users/' + user.uid),{
      last_login: dt
      })
      .then(function(){

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


async function loginFirestore(email,password){
  let firestoreUpdated = false;

  signInWithEmailAndPassword(fireauth, email, password)
    .then((userCredential) => {
      // Signed in 
      const fireuser = userCredential.user;
      sessionStorage.fireuser = fireuser.uid;    
                              
      try{
        const dt = new Date();
          
          updateDoc(doc(firestoredb, "users",fireuser.uid), {
            LastLogin:dt 
          });
          firestoreUpdated = true;  
          
          
      }catch(error){
        console.log(error);
        location.reload();
      }

    })
    
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorMessage);
      signOutUser();
    });
  
}


if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
  signOutUser();
} else {
  console.info( "This page is not reloaded");
}


