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
  getDoc,
  limitToLast
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

import { getDatabase, ref,get,child,onValue} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {firebaseConfig,firestoreConfig} from "../firebase_config.js";

if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
  sessionStorage.removeItem('currentchat');
} 


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
//var recipientFireID = sessionStorage.getItem('providerfireID');
let userTYPE = sessionStorage.getItem('userTYPE');
let docRef = '';
let refID ='';

window.onload = messageSent.value = '';

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
        await getProfileIMG(docID);
        await setUserChatID(docID);        
        refID = docID;
      }

      
    } catch (error) {
      console.log(error);

    }

}


async function setUserChatID(docRef){
  let splitDOC = docRef.split("-");
  var userID = splitDOC[1];
  var recipientFireID = splitDOC[0];
  console.log(recipientFireID,userID);
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
    if (userTYPE == "client"){
      pfp.src = querySnapshot.data().serviceProviderImgLink;    
      document.getElementById('recipientName').innerHTML = querySnapshot.data().serviceProviderName;
    }else if (userTYPE == "serviceProvider"){
      pfp.src = querySnapshot.data().clientPic;    
      document.getElementById('recipientName').innerHTML = querySnapshot.data().clientUsername;
    }

    
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




monitorFireAuth();


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
  
  if (userTYPE == "client"){
    getRecipientInfo(querySnapshot.data().transactionProviderID,querySnapshot.data().serviceProviderImgLink,chatID);
    
  }else if (userTYPE == "serviceProvider"){
    getRecipientInfo(querySnapshot.data().clientID,querySnapshot.data().clientPic,chatID);
  }
  
  
}




async function getRecipientInfo(userID,imgLINK,chatID){
    
  const q = query(doc(firestoredb, "users",userID));
  const querySnapshot = await getDoc(q);

  loadInboxItem(querySnapshot.data().username,imgLINK,chatID);
  

}

// loading chat inbox
async function loadInboxItem (username,imgLINK,chatID){

    var pfpImg = document.createElement('img');
    pfpImg.classList.add("viewchats","rounded-5");

    let inboxInfo = document.createElement('div');
    inboxInfo.classList.add("container");

    let inboxItem = document.createElement('li');
    inboxItem.classList.add("list-group-item" ,"d-flex" ,"mt-1"
     ,"rounded-3" ,"justify-content-start" ,
     "align-items-center", "p-3", "border", "border-1","inboxEntry");

    let html = 
    `
    <div class="row">
      <p class="mb-0"> Username: `+username+`</p>
    </div>
    <div class="row">
      <p class=" text-muted" id="recentMessage"></p>
    </div>
    `
    pfpImg.src=imgLINK;
    inboxInfo.innerHTML = html;
    inboxItem.appendChild(pfpImg);
    inboxItem.appendChild(inboxInfo);
    inboxItem.addEventListener('click',function(e) {
      var currentchat = sessionStorage.getItem('currentchat');
      if(currentchat != chatID){
        
        sessionStorage.currentchat = chatID;
        addChatID(chatID);
        renderMessages(chatID);
        loadMessages();
      }else{
        
      }

    })
    inbox.append(inboxItem);
    //AssignAllEvents(chatID);
    
}


// Saves a new message to Cloud Firestore.
async function saveMessage() {

  // Add a new message entry to the Firebase database.
  
  let message = messageSent.value;
  messageSent.value='';
  const date = new Date();
  if(refID!=null && message !=""){
    try {
      console.log("sent");
      await addDoc(collection(firestoredb,"chat",refID,"messages"), {
        userID: userID,
        text: message,      
        timestamp: date
      });
    }
    catch(error) {
      console.error('Error writing new message to Firebase Database', error);
    }
  }else{
    //alert("no");
    messageSent.value='';
  }
  
}






// Loads chat messages history and listens for upcoming ones.
function loadMessages() {

  const received = document.getElementsByClassName("receivedMessage");
  const sent = document.getElementsByClassName("sentMessage");
  const recentSent = document.getElementById('recentMessage');


  if (received.length >0 || sent.length >0 ){
    console.log(sent.length,received.length );
    const list = document.getElementById("messages");
    console.log("delete");
    while (list.hasChildNodes()) {
      list.removeChild(list.firstChild);
    }
  }else{
    console.log(sent.length,received.length );
  }
  
  
}

  let onSnapShotCalls = 0;
  let IDcalls = [];

async function renderMessages(docID){

  let id =docID;
  let n =0;
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = query(collection(firestoredb,"chat",id,"messages"), orderBy('timestamp'), limitToLast(12));
  const recentMessagesQueryLoad = query(collection(firestoredb,"chat",id,"messages"), orderBy('timestamp'), limitToLast(1));
  
    try{

      let chatInfo='';
      const getmessages = await getDocs(recentMessagesQuery);
      
      getmessages.forEach((doc)=>{
        n+=1;
        console.log(n);
        let chatInfo = doc.data();
        if(chatInfo.userID == userID && n<=12){              
          sentMessages(chatInfo.text);
        }else if(n<=12 && chatInfo.userID != userID){                            
          receivedMessages(chatInfo.text);              

        }
      });


      if (IDcalls.includes(docID)){        
        
        console.log("hello");
        
      }else{
        IDcalls.push(docID);
              // Start listening to the query.
        const unsub = onSnapshot(recentMessagesQueryLoad, function(snapshot) {  
          
          snapshot.docChanges().forEach(function(change) {

            chatInfo = change.doc.data();

            if (change.type === 'removed') {
              //deleteMessage(change.doc.id);
            } else {        

              //recentSent.innerHTML = chatInfo.text;
              if(chatInfo.userID == userID){              
                sentMessages(chatInfo.text);
              }else{                            
                receivedMessages(chatInfo.text);              

              }

            }
          });                
          
        });    
      }
   
    

    }catch(error){
      console.log(error);
    }


    
    
}


//for rendering sent messages
function sentMessages(text){

  
  var chatItem = document.createElement('li');
  chatItem.classList.add("sentMessage","list-group-item")
  chatItem.innerHTML = text;
  chatArea.append(chatItem);
  messageSent.value = '';
  document.getElementById('messages').scrollTop += 1000; 
  

}

// for rendering received messages
function receivedMessages(text){

      
  var chatItem = document.createElement('li');
  chatItem.classList.add("receivedMessage","list-group-item")
  chatItem.innerHTML = text;
  chatArea.append(chatItem);
  messageSent.value = '';
  document.getElementById('messages').scrollTop += 1000; 
  

}

sendBtn.addEventListener('click',function(){
  saveMessage();
});