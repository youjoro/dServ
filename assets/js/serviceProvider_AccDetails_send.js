import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, set, ref,update  } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {firebaseConfig} from './firebase_config.js';

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth();

/*window.onload = renderCaptcha();
function renderCaptcha() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    recaptchaVerifier.render();
}*/



window.onload = document.getElementById("loading").style.visibility ="hidden";



var final_submit = document.getElementById("final_submit");

final_submit.addEventListener('click',(e) => {

document.getElementById("loading").style.visibility ="visible";
document.getElementById("reg_form").style.visibility = "hidden";
document.getElementById("final_submit").style.visibility = "hidden";

var data = localStorage.getItem("Data");
data = data.split(',');
var exp = localStorage.getItem("exp_entries");

createUserWithEmailAndPassword(auth, data[15], data[16])
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    
    set(ref(database, 'ProviderProfile/' + user.uid),{
        FirstName: data[0],
        lastName: data[1],
        username: data[2],
        businessEmail: data[3],
        phoneNumber: data[4],
        address: data[5],
        address2: data[6],
        city: data[7],
        ZipCode: data[8],
        typeOfProvider: data[9],
        selfDescription: data[10],
        CV: data[11],
        brand_name: data[12],
        brand_desc: data[13],
        availability: data[14],
        acc_email: data[15],
        expertise: exp.split(',')
        
    }).then(function(){
        set(ref(database, 'users/' + user.uid),{
          username: data[2],
          email: data[15],
          phone_number: data[4],
          user_type: "provider"
      })
      monitorAuthState(data[15], data[16]);
    }).catch(function(error){
       console.log('Synchronization failed');
    })
    
    
  })
  .catch((error) => {
    
    const errorCode = error.code;
    const errorMessage = error.message;
    
    alert(errorMessage);
    location.reload();
    
    // ..
  });

})


const monitorAuthState = async(acc,pass) =>{
  var accEmail = acc;
  var password = pass;
    signInWithEmailAndPassword(auth, accEmail, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        
        const dt = new Date();
        update(ref(database, 'users/' + user.uid),{
        last_login: dt
    }).then(function(){
      alert("Account Creation Succesful");
      sessionStorage.setItem("user","loggedIn");
      window.location.replace("http://127.0.0.1:5500/Service_Provider_Dashboard/index.html");
    }).catch(function(error){
       console.log('Synchronization failed');
    })
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        
        alert(errorMessage);
    });
  }

