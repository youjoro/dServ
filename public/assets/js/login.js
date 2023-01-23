import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, 
  set, 
  ref, 
  update 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

import { doc, addDoc ,getFirestore, collection, setDoc } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
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




async function fireAddDate(fireuserID){
    
    
    try {
        
        const dt = new Date();
        const docRef = await setDoc(doc(firestoredb, "user",fireuserID), {
        test:dt 

        });
        console.log("Document written with ID: ", docRef.id);
        alert("Request Sent");
    
    } catch (e) {
    console.error("Error adding document: ", e);
    }
    
}


  login.addEventListener('click',(e)=>{
    
    document.getElementById('loading').style.visibility = 'visible';
    document.getElementById('login').disabled = true;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {


        const loginFirestore =async() =>{
          await signInWithEmailAndPassword(fireauth, email, password)
            .then((userCredential) => {
              // Signed in 
              const fireuser = userCredential.user;
              sessionStorage.setItem("fireuser", fireuser.uid);
              // Add a new document with a generated id.
              const addDate =async() =>{
                await fireAddDate(fireuser.uid);
              }
              addDate();
              
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
            });
        }
        

        loginFirestore();
        // Signed in 
        const user = userCredential.user;
        sessionStorage.setItem = user.uid;
        const dt = new Date();
        update(ref(database, 'users/' + user.uid),{
        last_login: dt
    }
    
    ).then(function(){
      
      alert('Logged In');
      window.location.replace("http://127.0.0.1:5500/index.html");
      
    }).catch(function(error){
       console.log('Synchronization failed');
    })
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        document.getElementById('login').disabled = false;
        alert(errorMessage);
        window.onload = document.getElementById('loading').style.visibility = 'hidden';
    });
  });





