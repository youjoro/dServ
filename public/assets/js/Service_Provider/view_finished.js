import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getDatabase, ref, onValue} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getFirestore , collection,getDoc, doc , getCountFromServer, query,  getDocs ,writeBatch,orderBy,limitToLast  } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

import {firebaseConfig} from '../firebase_config.js';

const app = initializeApp(firebaseConfig);
const firestoredb = getFirestore(app);
const realdb = getDatabase(app);
const auth = getAuth();
const batch = writeBatch(firestoredb);

window.onload = document.getElementById("profile_content").style.visibility = "hidden";


var total_pending = 0;
var jobs_completed = 0;


//Documents
const OuterDiv = document.getElementById('servicesBlock');
const messagesTab =document.getElementById('messages');
const requestnotif = document.getElementById('request_notif');
const interactableMessages = document.getElementById('messagesInteractable');
const chatTab = document.getElementById('chats')
var fireuserID = sessionStorage.getItem('user');

//Session

function getUserType(){
  var user_type="";
  var userID = sessionStorage.getItem("user");

  
    
  const getType = ref(realdb, 'users/'+userID+'/user_type');
  const type = async() =>{
    onValue(getType, (snapshot) => {
    user_type = snapshot.val();

    if(user_type=="client" || user_type==null){
      alert("You are not supposed to be here");
      window.location.replace("http://test-75edb.web.app/index.html");
    }else{
      document.getElementById("profile_content").style.visibility = "visible";
      //document.getElementById('loading').style.display = "none";
      loadServices();
    }
  })
  } ;
  
  type();
    
}


function checkSession(user){

var sessionData=sessionStorage.getItem("user");


if(sessionData != null){
  document.getElementById('prov_name').innerHTML=user.email; 
  getUserType();
}else{
    console.log("no user");
    
}
}



const monitorAuthState = async() =>{
    onAuthStateChanged(auth,user=>{
      if(user){
        sessionStorage.user = user.uid;
        
        checkSession(user); 
      }else{
        console.log("no user");
        
      }
    });
  }

monitorAuthState();







async function getRequestData(serviceID,serviceName){
  
  console.log(serviceID,serviceName);
  const docRef = doc(firestoredb, "users",fireuserID,"services",serviceName,"transactions",serviceID);
  const docSnap = await getDoc(docRef);
  let data = await getInfo(docSnap.id);
    
  return data;
}



async function getRequests(docID){
  let datas =[];
  let IDs = [];
  console.log(docID);
  let id ="";
  let userID = sessionStorage.getItem('user');
    const q = query(collection(firestoredb,"users",userID, "services",docID,"finished"));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      id = doc.id;
      console.log(id);
      IDs.push(id);

    });
    
    
    for(var i = 0; i<IDs.length;i++){
      
      console.log(IDs[i]);
      
      datas.push( await getInfo(IDs[i]));
      let datapointer = datas[i];
      datapointer['transactionID'] = IDs[i];
      console.log(datas);
    }

    
    return datas;
}

async function getInfo(docID){
  let data = '';
  const q = query(doc(firestoredb,"finished",docID));
  const docSnap = await getDoc(q);
  
  data = docSnap.data()
  console.log(data)
  return data;
}



async function getRequestsNum(serviceName){
  
  const coll = collection(firestoredb, "users",fireuserID,"services",serviceName,"transactions");
  const snapshot = await getCountFromServer(coll);

  total_pending = total_pending + snapshot.data().count;
  
  requestnotif.innerHTML = total_pending;
  return snapshot.data().count;
}


async function getFinished(serviceName){
  const coll = collection(firestoredb, "users",fireuserID,"services",serviceName,"finished");
  const snapshot = await getCountFromServer(coll);

  jobs_completed = jobs_completed + snapshot.data().count;

  return snapshot.data().count;
}






//Services to HTML
var servicesList=[];
function loadServices(){

  var userID = sessionStorage.getItem("user");
  const getService = ref(realdb, 'ProviderProfile/'+userID+'/Services');

  const services = async() =>{
      onValue(getService, (snapshot) => {
      snapshot.forEach(serv => {
            servicesList.push(serv.val());
            let end = servicesList[servicesList.length - 1];
            end['id']=serv.key;
            console.log(serv.key);
        });
        addAllServices();
    })
    } ;
    
    services();
}

function addAllServices(){
    let i = 0;
    servicesList.forEach(serv =>{
        addMessage(serv, i++);
    });
    
}


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
    const q = doc(firestoredb,"chat",chatIDs[i]);
    const docSnap = await getDoc(q);
    const c = query(collection(firestoredb,"chat",chatIDs[i],"messages"), orderBy('timestamp'), limitToLast(1));
    const chatmessage = await getDocs(c);


    chatmessage.forEach((doc)=>{
        if(doc.exists()){
          latest = doc.data().text;
          console.log(latest)
        }else{
          latest = ""
          console.log(latest)
        }
        
    })

    if (docSnap.exists()) {
      
      await createChatMessages(docSnap.data(),latest);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }
    
}



function createChatMessages(chat,chatmessage){
  console.log(chatmessage)
  let latestmessage = chatmessage.substring(0,25);
  latestmessage.replace(/[^a-zA-Z0-9]/g,"...");
  let img = document.createElement('img');
  img.classList.add('rounded-circle');
  img.src="img/undraw_profile_1.svg";
  let requestbutton = document.createElement('a');
  requestbutton.classList.add('dropdown-item', 'd-flex', 'align-items-center');


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


  clientName.innerHTML = chat.clientUsername;
  remarkText.innerHTML = latestmessage+"...";

  divText.append(remarkText,clientName);

  requestbutton.append(dropdownIMG,divText);
  chatTab.append(requestbutton);
  
}

loadMessages()



let countReq = 0;
function addMessage(service,index){
    
  let servicesDropdown = document.createElement('div');
  let dropdownButton = document.createElement('button');
  let dropdownMenu = document.createElement('div');

  servicesDropdown.classList.add('accordion','pb-2');
  dropdownButton.classList.add('btn','btn-success','text-truncate','text-left');
  dropdownButton.style.width = "16em";
  dropdownButton.setAttribute('data-toggle','collapse');
  dropdownButton.setAttribute('data-target','#collapse-'+index)
  dropdownButton.textContent = service.ServiceName;


  dropdownMenu.classList.add('collapse');
  dropdownMenu.setAttribute('id','collapse-'+index);
  dropdownButton.append(dropdownMenu);
  servicesDropdown.append(dropdownButton);
  interactableMessages.append(servicesDropdown);
  console.log(service.id);

  const getrequestPending = async()=>{    
    console.log(service)
    let requests = await getRequests(service.id.replace(/\s/g,''));
    let requestnum = await getRequestsNum(service.id.replace(/\s/g,''));
    
    
    for(var i = 0; i<requests.length; i++){   
      countReq +=1;
      
      let lastName = requests[i].ClientLastName; 
      let firstName = requests[i].ClientFirstName;
      let id = requests[i].transactionID;
      let clientID = requests[i].clientID;
      console.log(clientID);
      let desc = requests[i].ClientRemarks.substring(0,25);
      desc.replace(/[^a-zA-Z0-9]/g,"...");

      let img = document.createElement('img');


      img.classList.add('rounded-circle');
      img.src="img/undraw_profile_1.svg";


      let requestbutton = document.createElement('a');
      let sideDIVRequests = document.createElement('a');
      

      requestbutton.classList.add('dropdown-item', 'd-flex', 'align-items-center');
      sideDIVRequests.classList.add('d-flex','text-white', 'align-items-center', 'button-'+countReq+'','reqbutton');
      sideDIVRequests.style.textDecoration = 'none';
      let dropdownIMG = document.createElement('div');
      dropdownIMG.classList.add('dropdown-list-image', 'mr-3');


      let status = document.createElement('div');
      status.classList.add('status-indicator','bg-success');

      //for notif bar
      let divText = document.createElement('div');
      divText.classList.add('font-weight-bold');
      //for sidebar
      let sidedivText = document.createElement('div');
      sidedivText.classList.add('font-weight-bold');

      //for notif bar
      let remarkText = document.createElement('div');
      remarkText.classList.add('text-truncate');
      //side bar
      let sideremarkText = document.createElement('div');
      sideremarkText.classList.add('text-truncate');

      //for notif bar
      let clientName = document.createElement('div');
      clientName.classList.add('small','text-gray-500');
      //for sidebar
      let sideclientName = document.createElement('div');
      sideclientName.classList.add('small','text-white');

      dropdownIMG.append(img,status);

      
      clientName.innerHTML = lastName+" "+ firstName;
      remarkText.innerHTML = desc+"...";

      sideclientName.innerHTML = lastName+" "+ firstName;
      sideremarkText.innerHTML = desc+"...";

      sidedivText.append(sideremarkText,sideclientName);
      divText.append(remarkText,clientName);
      
      requestbutton.append(dropdownIMG,divText);
      sideDIVRequests.append(sidedivText);

      console.log(id);
      sideDIVRequests.onclick = function() { viewDetails(id,service.id.replace(/\s/g,''),clientID); };
      messagesTab.append(requestbutton);
      dropdownMenu.append(sideDIVRequests);
      
    }


    
    
  }

  getrequestPending();

}


//  function loadMessage()


function viewDetails(serviceID,serviceName,clientID){
  OuterDiv.innerHTML = '';


  var items = [];

  function store(item_id) {
      items.push(item_id);
      localStorage.setItem("item",items);
  }
  store(serviceID);
  store(serviceName);
  store(clientID);
  console.log(serviceID,serviceName,clientID);
  

  getrequestPending(serviceID,serviceName,clientID);

}

async function getrequestPending(serviceID,serviceName,clientID){
    
  let requestdata = await getRequestData(serviceID,serviceName,clientID);
  let date = requestdata.DateAdded;
  console.log(date);
  let dateFormat = new Date(date.seconds*1000);
  
    let html = 
    `
    <div class="container border border-dark my-2 rounded">
    <h4 class="small font-weight-bold pt-1" >Client Email: `+requestdata.ClientEmail+`</h4>
    <div class="container">
        <h5 class="small font-weight-bold">Client Name: `+requestdata.ClientFirstName+` `+requestdata.ClientLastName+`</h5>
        <h5 class="small font-weight-bold">Contact Number:`+requestdata.ClientMobileNum+` </h5>
        <h5 class="small font-weight-bold">Remarks: `+requestdata.ClientRemarks+`</h5>
        <h5 class="small font-weight-bold">Email: `+requestdata.ownerEmail+`</h5>
        <h5 class="small font-weight-bold">Number of Clientele: `+requestdata.clientNumber+`</h5>
        <h5 class="small font-weight-bold">Requested Date: `+requestdata.RequestedDate+`</h5>
        <h5 class="small font-weight-bold">Date added: `+dateFormat+`</h5>
        <h5 class="small font-weight-bold">Status: `+requestdata.confirmStatus+`</h5>
    </div>
    
    </div>
    `;


    let newServ = document.createElement('div');
    newServ.classList.add('productcard');
    newServ.innerHTML = html;
    OuterDiv.append(newServ);
  
}



//chatClient.addEventListener('click',);