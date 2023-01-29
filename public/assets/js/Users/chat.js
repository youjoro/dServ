// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { chatConfig } from "../firebase_chat_config.js";
import {   
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import {firebaseConfig,firestoreConfig} from "../firebase_config.js";

//Initialize realtime database
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const auth = getAuth(app);



// Initialize firestore
const firestoreapp = initializeApp(firestoreConfig,"secondary");
const fireauth = getAuth(firestoreapp);
const firestoredb = getFirestore(firestoreapp); 


const checkifFirstLoggedIn = sessionStorage.getItem("IsThisFirstTime_Log_From_LiveServer");


//Retrieve profileImg
function getProfileIMG(userID){

  var pfpLink = sessionStorage.getItem("pfpIMGLink");
  var dbRef = ref(realdb);
  let pfp = document.getElementById('profileIMG');
  let currentPFP = document.getElementById('myImg');

  if (pfpLink == null){
    get(child(dbRef,"users/"+userID+"/profilePic")).then((snapshot)=>{
      
      if(snapshot.exists()){

        sessionStorage.pfpIMGLink = snapshot.val().imgLink;
        pfp.src = snapshot.val().imgLink;
        currentPFP.src = snapshot.val().imgLink;
        
      }else{
        pfp.src = "/assets/img/profile_icon.png";
        currentPFP.src = "/assets/img/profile_icon.png";
      }
    });
  }else{
    pfp.src = pfpLink;
    currentPFP.src = pfpLink;
  }

}



//check fireStore Auth
const monitorFireAuth = async() =>{
  if (checkifFirstLoggedIn == true);
  else{
      onAuthStateChanged(fireauth,user=>{
        if(user){
          console.log(user.emailVerified);
          sessionStorage.fireuser = user.uid;
          //getRequestsNum(user.uid);
            
          
        }else{
          console.log("no user");                    
        }
      });
  }
}

//check realtimeDatabase
const monitorAuthState = async() =>{
  if (checkifFirstLoggedIn == true);
  else{
    onAuthStateChanged(auth,user=>{
      if(user){

        console.log(user.emailVerified);
        sessionStorage.user = user.uid;
        sessionStorage.sessionCheck = "loggedIn";
        console.log(user.uid);
        checkSession();
        getProfileIMG(user.uid);
      }else{
        console.log("no user");
        document.getElementById("nav_barLoggedIn").style.display="none";
      }
    });
        
  }

}
