import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, RecaptchaVerifier,sendEmailVerification,signOut } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getFirestore,doc, addDoc , setDoc, collection} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import {firebaseConfig, firestoreConfig} from '../firebase_config.js'; 


  const firestoreapp = initializeApp(firestoreConfig,"secondary");
  const fireauth = getAuth(firestoreapp);
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const firestoredb = getFirestore(firestoreapp); 
  const auth = getAuth();


  window.onload = document.getElementById('signUp').disabled= true;
  window.onload = document.getElementById('loading').style.visibility = 'hidden';
  window.onload = document.getElementById('OTP').style.visibility = 'hidden';
  window.onload = document.getElementById('sendNum').disabled = true;
  window.onload = document.getElementById("recaptcha-container").style.visibility ='visible';

  var email = "";
  var username = "";
  var password = "";
  var phone_number = "";

  
  var sendnumber = document.getElementById('sendNum');
  var numInput = document.getElementById('phone_number');

  sendnumber.disabled = true;
  

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

    const number = document.getElementById('phone_number');
    let num = number.value;
    let validationString = number.value;
    let validationArray = validationString.split("");
    num = parseInt(num);  
    let convertedNUM = ''; 
    

    const authenticateNum = async() =>{
      console.log(convertedNUM);
      firebase.auth().signInWithPhoneNumber(convertedNUM, window.recaptchaVerifier).then(function (confirmationResult) {
          window.confirmationResult = confirmationResult;
          coderesult = confirmationResult;
          console.log('OTP Sent');
          document.getElementById('OTP').style.visibility = 'visible';
          document.getElementById("recaptcha-container").style.visibility ='hidden';
      }).catch(function (error) {
          // error in sending OTP
          window.onload = document.getElementById('sendNum').disabled= true;
          alert(error.message);
          alert(convertedNUM);
      });
    }
    

    if (Number.isInteger(num) && validationString.length == 11 && validationArray[1].trim().toString() == "9"){
      let nums = Array.from(num.toString()).map(Number);
      nums = "+63 "+nums[0]+nums[1]+nums[2]+" "+nums[3]+nums[4]+nums[5]+" "+nums[6]+nums[7]+nums[8]+nums[9];
      convertedNUM = nums.toString();
      authenticateNum();
      
    }else{
      alert ("no");
      number.value = '';
      
    }



      
  }


  // function for OTP verify
  function codeverify() {
      var code = document.getElementById('otp_verify').value;
      
      coderesult.confirm(code).then(function () {
          console.log('OTP Verified');
          signOut(auth);
          window.onload = document.getElementById('signUp').disabled= false;
      }).catch(function () {
          console.log('OTP Not correct');
      })
  }


document.getElementById('OTPVerify').addEventListener('click',codeverify);



signUp.addEventListener('click',(e) => {


  document.getElementById('loading').style.visibility = 'visible';
  document.getElementById('signUp-form').style.visibility = 'hidden';
  document.getElementById('OTP').style.visibility = 'hidden';

  document.getElementById("signUp").disabled = true;
  email = document.getElementById('email').value;
  username = document.getElementById('username').value;
  password = document.getElementById('password').value;
  phone_number = document.getElementById('phone_number').value;


  const createAccFirestore =async() =>{
    await createUserWithEmailAndPassword(fireauth, email, password)
      .then((fireStoreuserCredential) => {
          // Signed in 
          const fireuser = fireStoreuserCredential.user;
          sessionStorage.fireuser = fireuser.uid;
          
          try {
            const docRef =  setDoc(doc(firestoredb, "users",fireuser.uid), {
              username: username,
              email: email,
              phone_number: phone_number,
              user_type: "client"
            });

            
            
          } catch (error) {
            console.log(error);
            location.reload();
          }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode,errorMessage); 
      });
}


  const createRealTimeDBAcc =async()=>{
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in dServ
        const user = userCredential.user;

        const sendEMAILVERIFY = async() =>{
          sendEmailVerification(auth.currentUser)
          .then(() => {
            alert('Email verification sent!');
          });}
          sendEMAILVERIFY();

        set(ref(database, 'users/' + user.uid),{
            username: username,
            email: email,
            phone_number: phone_number,
            user_type: "client"
        }).then(function(){
          
          alert('user created');
          window.location.replace("https://test-75edb.web.app/index.html");
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
  }

  createAccFirestore();
  createRealTimeDBAcc();

})