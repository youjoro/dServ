import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {firebaseConfig} from './firebase_config.js';

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth();





var final_submit = document.getElementById("final_submit");

final_submit.addEventListener('click',(e) => {
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
      
      alert("Upload Succesful");
        window.location.replace("http://127.0.0.1:5501/Service_Provider_Dashboard/index.html");
    }).catch(function(error){
       console.log('Synchronization failed');
    })
    
    
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    
    alert(errorMessage);
    // ..
  });

})




