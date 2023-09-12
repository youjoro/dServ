import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, set, ref,update  } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword,sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getFirestore,doc,setDoc} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import {firebaseConfig} from '../firebase_config.js';
import {getStorage, ref as sRef, uploadBytesResumable, getDownloadURL}
from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth();

  const firestoredb = getFirestore(app); 
/*window.onload = renderCaptcha();
function renderCaptcha() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    recaptchaVerifier.render();
}*/
const CV = document.getElementById("formFileLg");
var files = [];
var reader = new FileReader();

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

  
var imgURL = ""
  const createServiceProviderProfile = async() =>{
    createUserWithEmailAndPassword(auth, data[14], data[15])
      .then(async(userCredential) => {
        // Signed in 
        const user = userCredential.user;
        await uploadProcess(user.uid,data,exp,employees).then((imgURL)=>{
          
          const sendEMAILVERIFY = async() =>{
            sendEmailVerification(auth.currentUser)
            .then(() => {
              alert('Email verification sent!');
              
            });}
          console.log(imgURL)
          sendEMAILVERIFY();
            
          


        })
        
        
        
        
      })
    .catch((error) => {
      
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode)
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
      window.location.replace("http://test-75edb.web.app/Service_Provider_Dashboard/index.html");
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


CV.addEventListener('change', (e) => {
    files = e.target.files;

    reader.readAsDataURL(files[0]);
});





  async function uploadProcess(userID,data,exp,employees){
    var imgToUpload = files[0];
    var urlToReturn = ""

    const metadata = {
        contentType: imgToUpload.type
    }

    const storage = getStorage();
    let profileImgName = 'Resume-'+userID;
    const storageRef = sRef(storage, "Resumes/"+profileImgName);


    const uploadTask = uploadBytesResumable(storageRef, imgToUpload,metadata);

    await uploadTask.on('state-changed', (snapshot)=>{
        //var progress  = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
    },(error)=>{
        alert("error: Image not Uploaded");
    },async()=>{


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
          window.location.replace("http://test-75edb.web.app/Service_Provider_Dashboard/index.html");
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


      await getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl)=>{
          console.log(profileImgName,downloadUrl);
          urlToReturn = downloadUrl
          set(ref(database, 'ProviderProfile/' + userID),{
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
          CV: downloadUrl,
          brand_name: data[11],
          brand_desc: data[12],
          availability: data[13],
          acc_email: data[14],
          expertise: exp.split(','),
          employees:employees.split(',')
            
        }).then(async function(){
          await saveAccFirestore(userID);
          await saveAccRTDB(userID);
          monitorAuthState(data[14], data[15]);
          
        }).catch(function(error){
          console.log('Synchronization failed');
        })
            
        })



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
      }
      
      )
    
} 

