import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, 
  set, 
  ref, 
  update 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

import { getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";


import {firebaseConfig} from './firebase_config.js';



  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth();

  login.addEventListener('click',(e)=>{
    document.getElementById('login').disabled = true;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

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
      window.location.replace("http://127.0.0.1:5500/public/Service_Provider_Dashboard/index.html");
      
    }).catch(function(error){
       console.log('Synchronization failed');
    })
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        document.getElementById('login').disabled = false;
        alert(errorMessage);
    });
  });


const monitorAuthState = async() =>{
    onAuthStateChanged(auth,user=>{
      if(user){
        console.log(user);
        sessionStorage.setItem("user","loggedIn");
      }else{
        console.log("no user");
        
      }
    });
  }
monitorAuthState();


const signOutUser = async() =>{
    await signOut(auth);
}
