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
  getDocs 
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

import { getDatabase, ref,get,child,onValue} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {firebaseConfig,firestoreConfig} from "../firebase_config.js";

//Initialize realtime database
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const auth = getAuth(app);



// Initialize firestore
const firestoreapp = initializeApp(firestoreConfig,"secondary");
const fireauth = getAuth(firestoreapp);
const firestoredb = getFirestore(firestoreapp); 

//HTML elements
const checkifFirstLoggedIn = sessionStorage.getItem("IsThisFirstTime_Log_From_LiveServer");
const messageSent = document.getElementById('message-input');
const sendBtn = document.getElementById('message-btn');
const chatArea = document.getElementById('messages');
const inbox = document.getElementById('chatInbox');


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
          sessionStorage.fireuser = user.uid;          
          getChats(user.uid);
          messageSent.disabled = false;
          sendBtn.disabled = false;      
        }else{
          console.log("no user");   
          messageSent.disabled = true;
          sendBtn.disabled = true;          

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
        sessionStorage.sessionCheck = "loggedIn";
        
      }else{
        console.log("no user");

      }
    });
        
  }

}

monitorFireAuth();
monitorAuthState();

async function getChats(userID){
  const q = query(collection(firestoredb, "chats",userID,"messages"));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    
    
    getRecipientInfo(userID);
  });
}

var userInfo = [];
var recipientInfo = [];

async function getUserInfo(userID){

}

async function getRecipientInfo(userID){
    



 /* var recipientID = sessionStorage.getItem('providerID');
  //var userID = sessionStorage.getItem('user');

  var username = "";
  await onValue(ref(realdb, 'users/' + recipientID), (snapshot) => {
  username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
  // ...
    loadInbox(username);
  
}, {
  onlyOnce: true
});

  return username;*/
}

async function loadInboxItem (username){

    var pfpImg = document.createElement('img');
    pfpImg.classList.add("viewchats");

    let inboxInfo = document.createElement('div');
    inboxInfo.classList.add("container");

    let inboxItem = document.createElement('li');
    inboxItem.classList.add("list-group-item" ,"d-flex" ,"mt-1"
     ,"rounded-3" ,"justify-content-start" ,
     "align-items-center", "p-3", "border", "border-1");

    let html = 
    `
    <div class="row">
      <p class="mb-0">`+username+`</p>
    </div>
    <div class="row">
      <p class=" text-muted"></p>
    </div>
    `
    pfpImg.src="/assets/img/6.png";
    inboxInfo.innerHTML = html;
    inboxItem.appendChild(pfpImg);
    inboxItem.appendChild(inboxInfo);
    inbox.append(inboxItem);

}




async function sendMessage(){
  if(sessionStorage.getItem('sessionCheck')){
      console.log("test");
      let message =  messageSent.value;
      var chatItem = document.createElement('li');
      chatItem.classList.add("sentMessage","list-group-item")
      chatItem.innerHTML = message;
      chatArea.append(chatItem);
      document.getElementById('messages').scrollTop += 1000; 
  }

}


sendBtn.addEventListener('click',sendMessage);