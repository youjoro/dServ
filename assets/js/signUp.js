import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {firebaseConfig} from './firebase_config.js';

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth();

window.onload = document.getElementById('loading').style.visibility = 'hidden';
signUp.addEventListener('click',(e) => {
  document.getElementById('loading').style.visibility = 'visible';
  document.getElementById('signUp-form').style.visibility = 'hidden';

  document.getElementById("signUp").disabled = true;
  var email = document.getElementById('email').value;
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var phone_number = document.getElementById('phone_number').value;

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log("somg");
    set(ref(database, 'users/' + user.uid),{
        username: username,
        email: email,
        phone_number: phone_number,
        user_type: "client"
    }).then(function(){
      
      alert('user created');
      window.location.replace("http://127.0.0.1:5501/index.html");
    }).catch(function(error){
       console.log('Synchronization failed');
    })
    
    
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    document.getElementById('signUp-form').style.visibility='visible';
    document.getElementById('loading').style.visibility = 'hidden';
    document.getElementById("signUp").disabled = false;
    alert(errorMessage);
    // ..
  });
})