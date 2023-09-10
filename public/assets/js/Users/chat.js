// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

import {   
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  limitToLast
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';

import { getDatabase, ref,get,child,onValue} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import {firebaseConfig} from "../firebase_config.js";

if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
  sessionStorage.removeItem('currentchat');
} 


//Initialize realtime database
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const auth = getAuth(app);


// Initialize firestore
const firestoredb = getFirestore(app); 

//HTML elements
const checkifFirstLoggedIn = sessionStorage.getItem("IsThisFirstTime_Log_From_LiveServer");
const messageSent = document.getElementById('message-input');
const sendBtn = document.getElementById('message-btn');
const chatArea = document.getElementById('messages');
const inbox = document.getElementById('chatInbox');

//session Element
var userID = sessionStorage.getItem("user");
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

    await update_clientChatID(date);
    await update_providertChatID(date);
  }catch(error){
    console.log(error);
  }
}

async function update_providertChatID (date){
  await updateDoc(doc(firestoredb, "users",recipientFireID,"chat",docRef), {
    chatID:docRef,
    dateStarted:date
  });
}  

async function update_clientChatID (date){
  await updateDoc(doc(firestoredb, "users",userID,"chat",docRef), {
    chatID:docRef,
    dateStarted:date
  });
}  



async function getProfileIMG(chatID){
  
//Retrieve profileImg
  const q = query(doc(firestoredb, "chat",chatID));
  const querySnapshot = await getDoc(q);
  
  let pfp = document.getElementById('recipientIMG');

  if(querySnapshot.data().serviceProviderImgLink!= null){
    if (userTYPE == "client"){
      pfp.src = servicePFP;
      document.getElementById('recipientName').innerHTML = querySnapshot.data().serviceProviderName;
    }else if (userTYPE == "serviceProvider"){
      pfp.src = clientPFP;
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
      onAuthStateChanged(auth,user=>{
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

var servicePFP = "";
var clientPFP = "";

async function getChats(userID){
  const q = query(collection(firestoredb, "users",userID,"chat"));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    getChatInfo(doc.id);
  });
}


async function getClientPFP(clientID,chatID){
  const dbRef = ref(realdb);
  let pfp = "";
  get(child(dbRef, `users/${clientID}`)).then((snapshot) => {
    if (snapshot.exists()) {      
      pfp = snapshot.val().profilePic.imgLink;      
      clientPFP = pfp; 
      console.log(pfp);   
      getRecipientInfo(clientID, pfp ,chatID);  
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
    getRecipientInfo(clientID, "/assets/img/profile_icon.png" ,chatID);  
  });
  
  
}


async function getChatInfo(chatID){
  const q = query(doc(firestoredb, "chat",chatID));
  const querySnapshot = await getDoc(q);

  if (userTYPE == "client"){
    servicePFP = querySnapshot.data().serviceProviderImgLink; 
    await getRecipientInfo(querySnapshot.data().transactionProviderID,servicePFP,chatID);
    
  }else if (userTYPE == "serviceProvider"){
    let clientID = querySnapshot.data().clientID;  
    await getClientPFP(clientID,chatID);
        
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


  let IDcalls = [];

async function renderMessages(docID){

  let id =docID;
  let n =0;
  // Create the query to load the last 12 messages and listen for new ones.
  const recentMessagesQuery = query(collection(firestoredb,"chat",id,"messages"), orderBy('timestamp'), limitToLast(12));
  
  
    try{

      let chatInfo='';
      const getmessages = await getDocs(recentMessagesQuery);
      
      getmessages.forEach((doc)=>{
        n+=1;
        console.log(n);
        chatInfo = doc.data();
        if(chatInfo.userID == userID && n<=12){              
          sentMessages(chatInfo.text);
        }else if(n<=12 && chatInfo.userID != userID){                            
          receivedMessages(chatInfo.text);              

        }
      });

      await retrieveAndRender(docID,chatInfo.text);
   
    

    }catch(error){
      console.log(error);
    }

}

async function retrieveAndRender(id,chatInfo){
  
  const recentMessagesQueryLoad = query(collection(firestoredb,"chat",id,"messages"), orderBy('timestamp'), limitToLast(1));
  if (IDcalls.includes(id)){        
    console.log("hello");
  }else{
    IDcalls.push(id);
          // Start listening to the query.
    listenToQuery(recentMessagesQueryLoad,chatInfo)
   
  }
}

async function listenToQuery(recentMessagesQueryLoad,latest){
  
  onSnapshot(recentMessagesQueryLoad, function(snapshot) {  

    snapshot.docChanges().forEach(function(change) {

      var chatInfo = change.doc.data();

      if (latest == chatInfo.text) {
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