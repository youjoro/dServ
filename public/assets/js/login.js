import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, 
  set, 
  ref, 
  update 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

import { doc, getFirestore, updateDoc,setDoc } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import { getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";


import {firebaseConfig, firestoreConfig} from './firebase_config.js'; 

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

login.addEventListener('click',(e)=>{
  
  document.getElementById('loading').style.visibility = 'visible';
  document.getElementById('login').disabled = true;
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  let fireUser = "";
  let firestoreUpdated = false;
  
  const loginFirestore = async() =>{

    await signInWithEmailAndPassword(fireauth, email, password)
      .then((userCredential) => {
        // Signed in 
        const fireuser = userCredential.user;
        sessionStorage.setItem("fireuser", fireuser.uid);                            
        fireUser = fireuser.uid;
      }).then(()=>{
        // Add a new document with a generated id.
        try{
          const dt = new Date();

            
            const docRef =async()=>{
              await updateDoc(doc(firestoredb, "user",fireUser), {
                LastLogin:dt 
              });
              firestoreUpdated = true;  
            }  
            
            docRef();
            
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


  const loginRealTime = async()=>{
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {

          // Signed in 
          const user = userCredential.user;
          sessionStorage.setItem = user.uid;
          const dt = new Date();
          update(ref(database, 'users/' + user.uid),{
          last_login: dt
      }).then(function(){
      
          alert('Logged In');
          window.location.replace("http://127.0.0.1:5500/index.html");
        
      }).catch(function(error){
        console.log('Synchronization failed');
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


  loginFirestore();
  loginRealTime();



});


if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
  signOutUser();
} else {
  console.info( "This page is not reloaded");
}


