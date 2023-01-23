import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, RecaptchaVerifier,sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import {firebaseConfig, firestoreConfig} from './firebase_config.js'; 

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const firestoreapp = initializeApp(firestoreConfig,"secondary");
  const firestoredb = getFirestore(firestoreapp); 
  const fireauth = getAuth(firestoreapp);
  const auth = getAuth(app);




window.onload = document.getElementById('signUp').disabled= true;
window.onload = document.getElementById('loading').style.visibility = 'hidden';
window.onload = document.getElementById('OTP').style.visibility = 'hidden';
window.onload = document.getElementById('sendNum').disabled= true;
window.onload = document.getElementById("recaptcha-container").style.visibility ='visible';





  // render recaptcha verifier
window.onload = render();
function render() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
  'size': 'small',
  'callback': (response) => {
    window.onload = document.getElementById('sendNum').disabled= false;
  },
  'expired-callback': () => {
    // Response expired. Ask user to solve reCAPTCHA again.
    // ...
    alert("Redo CAPTCHA again")
  }
    });
    recaptchaVerifier.render();
}

var coderesult = "";
// function for send OTP
window.phoneAuth = function () {
    var number = document.getElementById('phone_number').value;
    firebase.auth().signInWithPhoneNumber(number, window.recaptchaVerifier).then(function (confirmationResult) {
        window.confirmationResult = confirmationResult;
        coderesult = confirmationResult;
        console.log('OTP Sent');
        document.getElementById('OTP').style.visibility = 'visible';
        document.getElementById("recaptcha-container").style.visibility ='hidden';
    }).catch(function (error) {
        // error in sending OTP
        window.onload = document.getElementById('sendNum').disabled= true;
        alert(error.message);
        alert(number);
    });
    
}
// function for OTP verify
window.codeverify = function () {
    var code = document.getElementById('otp_verify').value;
    
    coderesult.confirm(code).then(function () {
        console.log('OTP Verified');
        window.onload = document.getElementById('signUp').disabled= false;
    }).catch(function () {
        console.log('OTP Not correct');
    })
}




signUp.addEventListener('click',(e) => {
  document.getElementById('loading').style.visibility = 'visible';
  document.getElementById('signUp-form').style.visibility = 'hidden';
  document.getElementById('OTP').style.visibility = 'hidden';

  document.getElementById("signUp").disabled = true;
  var email = document.getElementById('email').value;
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  var phone_number = document.getElementById('phone_number').value;

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    //sign in with firestore transactions
    createUserWithEmailAndPassword(fireauth, email, password)
    .then((userCredential) => {
      const transactionUser = userCredential.user;

    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorCode,errorMessage);
    });


    // Signed in dServ
    const user = userCredential.user;
    sendEmailVerification(auth.currentUser)
      .then(() => {
        alert('Email verification sent!');
      });
    set(ref(database, 'users/' + user.uid),{
        username: username,
        email: email,
        phone_number: phone_number,
        user_type: "client"
    }).then(function(){
      
      alert('user created');
      window.location.replace("http://127.0.0.1:5500/index.html");
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