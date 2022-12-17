
import { firebaseConfig } from "./initialize_Firebase";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, set, ref } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";


  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth();


signUp.addEventListener('click',(e) => {
  document.getElementById("signUp").disabled = true;
    var email = document.getElementById('email').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var phone_number = document.getElementById('phone_number').value;

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    
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

    alert(errorMessage);
    // ..
  });
})