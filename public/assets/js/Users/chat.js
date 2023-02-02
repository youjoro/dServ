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
  getDocs,
  getDoc 
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

//session Element
var userID = sessionStorage.getItem('fireuser');
var recipientFireID = sessionStorage.getItem('providerfireID');


let docRef = '';
async function addChatID(chatID){

    try {
      const date = new Date();
      console.log("convo started");
      const collectionRef = collection(firestoredb, "chat");
      docRef = doc(collectionRef,chatID); 
      const docID = docRef.id;
       await updateDoc(docRef, {
        dateStarted:date
      });
      if(docRef != null){
        await loadMessages();
        await setUserChatID(docRef.id);
      }
      
    } catch (error) {
      console.log(error);

    }

}


async function setUserChatID(docRef){
  
  try{
    const date = new Date();
    let clientChatID = async() =>{
      
      await updateDoc(doc(firestoredb, "users",userID,"chat",docRef), {
      chatID:docRef,
      dateStarted:date
    });
    }  

    let providertChatID = async() =>{
      
      await updateDoc(doc(firestoredb, "users",recipientFireID,"chat",docRef), {
      chatID:docRef,
      dateStarted:date
    });
    }  

    clientChatID();
    providertChatID();
  }catch(error){
    console.log(error);
  }
}




async function getProfileIMG(chatID){
  
//Retrieve profileImg
  const q = query(doc(firestoredb, "chat",chatID));
  const querySnapshot = await getDoc(q);
  
  let pfp = document.getElementById('recipientIMG');


  if(querySnapshot.data().serviceProviderImgLink!= null){

    pfp.src = querySnapshot.data().serviceProviderImgLink;    
    document.getElementById('recipientName').innerHTML = querySnapshot.data().serviceProviderName;
  }else{
    pfp.src = "/assets/img/profile_icon.png";
    
  }
}



//check fireStore Auth
const monitorFireAuth = async() =>{
  if (checkifFirstLoggedIn == true);
  else{
      onAuthStateChanged(fireauth,user=>{
        if(user){          
             
          getChats(user.uid);

          let chatID = recipientFireID+"-"+userID;
          sessionStorage.chatID = chatID;
          addChatID(chatID);
          getProfileIMG(chatID);
          
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
  const q = query(collection(firestoredb, "users",userID,"chat"));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    
    getChatInfo(doc.id);
  });
}



async function getChatInfo(chatID){
  const q = query(doc(firestoredb, "chat",chatID));
  const querySnapshot = await getDoc(q);
  
  
  getRecipientInfo(querySnapshot.data().transactionProviderID,querySnapshot.data().serviceProviderImgLink);
  console.log(querySnapshot.data().transactionProviderID);
}




async function getRecipientInfo(userID,imgLINK){
    
  const q = query(doc(firestoredb, "users",userID));
  const querySnapshot = await getDoc(q);

  loadInboxItem(querySnapshot.data().username,imgLINK);
  

}

// loading chat inbox
async function loadInboxItem (username,imgLINK){

    var pfpImg = document.createElement('img');
    pfpImg.classList.add("viewchats","rounded-5");

    let inboxInfo = document.createElement('div');
    inboxInfo.classList.add("container");

    let inboxItem = document.createElement('li');
    inboxItem.classList.add("list-group-item" ,"d-flex" ,"mt-1"
     ,"rounded-3" ,"justify-content-start" ,
     "align-items-center", "p-3", "border", "border-1");

    let html = 
    `
    <div class="row">
      <p class="mb-0"> Username: `+username+`</p>
    </div>
    <div class="row">
      <p class=" text-muted"></p>
    </div>
    `
    pfpImg.src=imgLINK;
    inboxInfo.innerHTML = html;
    inboxItem.appendChild(pfpImg);
    inboxItem.appendChild(inboxInfo);
    inbox.append(inboxItem);

}


// Saves a new message to Cloud Firestore.
async function saveMessage() {
  // Add a new message entry to the Firebase database.
  let message = messageSent.value;
  const date = new Date();
  try {
    await addDoc(collection(firestoredb,"chat",docRef.id,"messages"), {
      userID: userID,
      text: message,      
      timestamp: date
    });
  }
  catch(error) {
    console.error('Error writing new message to Firebase Database', error);
  }
}






// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
  console.log(docRef.id);
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = query(collection(firestoredb,"chat",docRef.id,"messages"), orderBy('timestamp'), limit(12));
  try{
  // Start listening to the query.
  onSnapshot(recentMessagesQuery, function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {        
        if(change.doc.data().userID == userID){
          sentMessages(change.doc.data().text);
        }else{
          console.log(change.doc.data().text);
          receivedMessages(change.doc.data().text);
        }

      }
    });
  });
  }catch(error){
    console.log(error);
  }

}





//for rendering sent messages
async function sentMessages(text){

      console.log("test");
      var chatItem = document.createElement('li');
      chatItem.classList.add("sentMessage","list-group-item")
      chatItem.innerHTML = text;
      chatArea.append(chatItem);
      messageSent.value = '';
      document.getElementById('messages').scrollTop += 1000; 
  

}

// for rendering received messages
async function receivedMessages(text){

      console.log("test");
      var chatItem = document.createElement('li');
      chatItem.classList.add("receivedMessage","list-group-item")
      chatItem.innerHTML = text;
      chatArea.append(chatItem);
      messageSent.value = '';
      document.getElementById('messages').scrollTop += 1000; 
  

}

sendBtn.addEventListener('click',saveMessage);