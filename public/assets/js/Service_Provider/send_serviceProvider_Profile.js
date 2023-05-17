import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, set, ref,update  } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getFirestore,doc,setDoc} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import {firebaseConfig} from '../firebase_config.js';

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth();

  const firestoredb = getFirestore(app); 
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
var employees = localStorage.getItem("employee_data");

  async function saveAccFirestore (uid){
    try {
      await  setDoc(doc(firestoredb, "users",uid), {
        username: data[2],
        email: data[14],
        phone_number: data[4],
        user_type: "provider"
      });

      
      
    } catch (error) {
      console.log(error);
      location.reload();
    }
  }

  async function saveAccRTDB(uid){
    try{
      await set(ref(database, 'users/' + uid),{
          username: data[2],
          email: data[14],
          phone_number: data[4],
          user_type: "provider"
      })
    }catch (error) {
      console.log(error);
      location.reload();
    }

  }

  const createServiceProviderProfile = async() =>{
    createUserWithEmailAndPassword(auth, data[14], data[15])
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
            city: data[6],
            ZipCode: data[7],
            typeOfProvider: data[8],
            selfDescription: data[9],
            CV: data[10],
            brand_name: data[11],
            brand_desc: data[12],
            availability: data[13],
            acc_email: data[14],
            expertise: exp.split(','),
            employees:employees.split(',')
            
        }).then(async function(){
          await saveAccFirestore(user.uid);
          await saveAccRTDB(user.uid);
          monitorAuthState(data[14], data[15]);
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
  }

  
  createServiceProviderProfile();





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
      sessionStorage.status = "loggedIn";
      window.location.replace("http://http://test-75edb.web.app/Service_Provider_Dashboard/index.html");
      localStorage.removeItem("Data");
      localStorage.removeItem("exp_entries");
      localStorage.removeItem("employee_data");
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

