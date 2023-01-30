import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref,get,child,onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth,onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {  getFirestore , collection, getCountFromServer } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import {firebaseConfig, firestoreConfig} from '../firebase_config.js'; 

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const firestoreapp = initializeApp(firestoreConfig,"secondary");
const firestoredb = getFirestore(firestoreapp); 
const fireauth = getAuth(firestoreapp);
const auth = getAuth(app);
const checkifFirstLoggedIn = sessionStorage.getItem("IsThisFirstTime_Log_From_LiveServer");

const notifNUM = document.getElementById('notif_Num');


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



 function getUserType(){
  var user_type="";
    var userID = sessionStorage.getItem("user");
    
    
    const getType = ref(realdb, 'users/'+userID+'/user_type');
    const type = async() =>{
      onValue(getType, (snapshot) => {
      user_type = snapshot.val();
      console.log(user_type);
      if(user_type=="client"){
        document.getElementById('profile_tab').href = "/view_profile/profile.html";
      }else{
        document.getElementById('profile_tab').href = "/Service_Provider_Dashboard/index.html";
      }
    })
    } ;
    
    type();
    
}

function checkSession(){
  
var sessionData=sessionStorage.getItem("sessionCheck");

if(sessionData == "loggedIn"){
    document.getElementById("nav_bar").style.display="none";
    document.getElementById("nav_barLoggedIn").style.display="block";
    
     getUserType();
}else{
    document.getElementById("nav_barLoggedIn").style.display="none";
    document.getElementById("nav_bar").style.display="block";
}
}

var total_pending = 0; 

async function getRequestsNum(UID){
    try{

      const coll = collection(firestoredb, "users",UID,"transactions");
      const snapshot =  await getCountFromServer(coll);
      total_pending = total_pending + snapshot.data().count;
      notifNUM.innerHTML = total_pending;
    }catch(e){
      console.log(e);
    }
}


const monitorFireAuth = async() =>{
  if (checkifFirstLoggedIn == true);
  else{
      onAuthStateChanged(fireauth,user=>{
        if(user){
          console.log(user.emailVerified);
          sessionStorage.fireuser = user.uid;
          getRequestsNum(user.uid);
            
          
        }else{
          console.log("no user");                    
        }
      });
  }
}
      


const monitorAuthState = async() =>{
  if (checkifFirstLoggedIn == true);
  else{
    onAuthStateChanged(auth,user=>{
      if(user){

        console.log(user.emailVerified);
        sessionStorage.user = user.uid;
        sessionStorage.sessionCheck = "loggedIn";

        checkSession();
        getProfileIMG(user.uid);
      }else{
        console.log("no user");
        document.getElementById("nav_barLoggedIn").style.display="none";
      }
    });
        
  }

}
monitorFireAuth();
monitorAuthState();

document.getElementById("nav_barLoggedIn").style.display="none";





const signOutUser = async() =>{
    await signOut(auth);
    await signOut(fireauth);
    alert("logged out");
    document.getElementById("nav_barLoggedIn").style.display="none";
    document.getElementById("nav_bar").style.display="block";
    sessionStorage.clear();
    location.reload();
    sessionStorage.reloaded = "yes";
    window.location.replace("http://127.0.0.1:5500/index.html");
}
document.getElementById('logOut').addEventListener('click', signOutUser);

