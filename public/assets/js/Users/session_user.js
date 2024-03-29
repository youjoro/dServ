import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref,get,child,onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth,onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {  getFirestore , collection, getCountFromServer,getDoc, doc , query,  getDocs ,orderBy,limitToLast  } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';
import {firebaseConfig} from '../firebase_config.js'; 

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const firestoredb = getFirestore(app); 
const auth = getAuth(app);
const checkifFirstLoggedIn = sessionStorage.getItem("IsThisFirstTime_Log_From_LiveServer");

const notifNUM = document.getElementById('notifsCount');
const chatTab = document.getElementById('messagesNotif');
const notifTab = document.getElementById('notifBar');
const chatCount = document.getElementById('chatCount')

function getProfileIMG(userID){

  var userID = sessionStorage.getItem("user");
  var pfpLink = sessionStorage.getItem("pfpIMGLink");
  var dbRef = ref(realdb);
  let pfp = document.getElementById('profileIMG');
  let currentPFP = document.getElementById('myImg');
  
  if (pfpLink == null || performance.navigation.type == performance.navigation.TYPE_RELOAD){
    get(child(dbRef,"users/"+userID+"/profilePic")).then((snapshot)=>{
      
      if(snapshot.exists()){

        sessionStorage.pfpIMGLink = snapshot.val().imgLink;
        pfp.src = snapshot.val().imgLink;
        if (currentPFP != null){
          currentPFP.src = snapshot.val().imgLink;
        }
        
        
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
      
      if(user_type=="client"){
        document.getElementById('profile_tab').href = "/view_profile/profile.html";
        sessionStorage.userTYPE = "client";
      }else if(user_type=="provider"){
        document.getElementById('profile_tab').href = "/Service_Provider_Dashboard/index.html";
        sessionStorage.userTYPE = "serviceProvider";
      }else{
        alert("You are not supposed to be here");
        window.location.replace("http://test-75edb.web.app/index.html");
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
      loadMessages()
      loadNotifs()
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
      //notifNUM.innerHTML = total_pending;
    }catch(e){
      console.log(e);
    }
}



      


const monitorAuthState = async() =>{
  if (checkifFirstLoggedIn == true);
  else{
    onAuthStateChanged(auth,user=>{
      if(user){
        sessionStorage.verified = user.emailVerified;
        console.log(user.emailVerified);
        sessionStorage.user = user.uid;
        sessionStorage.sessionCheck = "loggedIn";

        checkSession();
        getRequestsNum(user.uid);
        getProfileIMG(user.uid);
      }else{
        signOut(auth);
        console.log("no user");
        document.getElementById("nav_barLoggedIn").style.display="none";
      }
    });
        
  }

}
monitorAuthState();

document.getElementById("nav_barLoggedIn").style.display="none";





const signOutUser = async() =>{
    await signOut(auth);
    alert("logged out");
    document.getElementById("nav_barLoggedIn").style.display="none";
    document.getElementById("nav_bar").style.display="block";
    sessionStorage.clear();
    localStorage.clear();
    location.reload();
    sessionStorage.reloaded = "yes";
    window.location.replace("http://test-75edb.web.app/index.html");
}
document.getElementById('logOut').addEventListener('click', signOutUser);



async function loadMessages(){
  var chatList = []
  var userID = sessionStorage.getItem("user");
  const getChats = collection(firestoredb, "users",userID,"chat");
    
  const querySnapshot = await getDocs(getChats);
  querySnapshot.forEach((doc) => {
    chatList.push(doc.data().chatID);
  });

  console.log(chatList);
  //chats();
  getChatData(chatList);
}

async function getChatData(chatIDs){
  
  
  for(var i = 0; i<chatIDs.length;i++){
    var latest = ''
    var senderID = ""
    var messageStatus = ""
    const q = doc(firestoredb,"chat",chatIDs[i]);
    const docSnap = await getDoc(q);
    const c = query(collection(firestoredb,"chat",chatIDs[i],"messages"), orderBy('timestamp'), limitToLast(1));
    const chatmessage = await getDocs(c);


    chatmessage.forEach((doc)=>{
        if(doc.exists()){
          latest = doc.data().text;
          messageStatus = doc.data().readBy
          senderID = doc.data().userID
          console.log(latest)
        }else{
          latest = ""
          console.log(latest)
        }
        
    })

    if (docSnap.exists()) {
      
      await createChatMessages(docSnap.data(),latest,i,senderID,messageStatus);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }
    
}



function createChatMessages(chat,chatmessage,count,senderID,messageStatus){
  var userID = sessionStorage.getItem("user");
  var stat = document.createElement('p')
  stat.classList.add("text-muted")
  if(senderID != userID && messageStatus == null){
    console.log(senderID, messageStatus,chat)
    chatCount.innerHTML = count+1
    stat.innerHTML = "unread"
  }else{
    
    stat.innerHTML = "read"
    
  }



  console.log(chatmessage)
  let latestmessage = chatmessage.substring(0,25);
  let li = document.createElement('li')
  latestmessage.replace(/[^a-zA-Z0-9]/g,"...");
  let img = document.createElement('img');
  img.classList.add('rounded-circle','pe-1');
  img.src="../assets/img/profile_icon.png";
  img.style.width = "2.5em";
  img.style.height = "2.5em";
  let requestbutton = document.createElement('a');
  requestbutton.classList.add('dropdown-item', 'd-flex', 'align-items-center');
  requestbutton.href = "../chat/chat.html"

  let dropdownIMG = document.createElement('div');
  dropdownIMG.classList.add('dropdown-list-image', 'mr-3');


  let status = document.createElement('div');
  status.classList.add('status-indicator','bg-success');


  let divText = document.createElement('div');
  divText.classList.add('font-weight-bold');


  let remarkText = document.createElement('div');
  remarkText.classList.add('text-truncate');


  let clientName = document.createElement('div');
  clientName.classList.add('small','text-gray-500');


  dropdownIMG.append(img,status);


  clientName.innerHTML = chat.serviceProviderName;
  remarkText.innerHTML = latestmessage+"...";

  divText.append(remarkText,clientName,stat);

  requestbutton.append(dropdownIMG,divText);
  li.append(requestbutton)
  chatTab.append(li);
  
}


async function loadNotifs(){
  var chatList = []
  var userID = sessionStorage.getItem("user");
  const getChats = collection(firestoredb, "users",userID,"transactions");
    
  const querySnapshot = await getDocs(getChats);
  querySnapshot.forEach((doc) => {
    chatList.push(doc.data().RequestID);
  });

  console.log(chatList);
  //chats();
  getOrderData(chatList);
}

async function getOrderData(chatIDs){
  
  
  for(var i = 0; i<chatIDs.length;i++){
    var latest = ''
    const q = doc(firestoredb,"transactions",chatIDs[i]);
    const docSnap = await getDoc(q);
    

    if (docSnap.exists()) {
      
      await createNotifMessages(docSnap.data(),i);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }
    
}


function createNotifMessages(orderInfo,count){
  notifNUM.innerHTML = count+1
  
  let li = document.createElement('li')
  
  let requestbutton = document.createElement('a');
  requestbutton.classList.add('dropdown-item', 'd-flex', 'align-items-center');
  requestbutton.href = "../view_profile/profile.html"

  let status = document.createElement('div');
  status.classList.add('status-indicator','bg-success');


  let divText = document.createElement('div');
  divText.classList.add('font-weight-bold');


  let remarkText = document.createElement('div');
  remarkText.classList.add('text-truncate');
  let dateText = document.createElement('div');
  remarkText.classList.add('text-truncate');


  let clientName = document.createElement('div');
  clientName.classList.add('small','text-gray-500');


  clientName.innerHTML = orderInfo.serviceName;
  dateText.innerHTML = orderInfo.RequestedDate;
  remarkText.innerHTML = orderInfo.confirmStatus;

  divText.append(remarkText,dateText,clientName);

  requestbutton.append(divText);
  li.append(requestbutton)
  notifTab.append(li);
  
}
