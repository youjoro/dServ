import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getDatabase, ref, onValue} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getFirestore , collection,getDoc, doc , getCountFromServer, query,  getDocs ,writeBatch } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

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
const cancelReq = document.getElementById('cancelReq');
const acceptReq = document.getElementById('acceptReq');
const chatClient = document.getElementById('chatClient');
const editReq = document.getElementById('editReq');

window.onload = cancelReq.style.display = "none";
window.onload = acceptReq.style.display = "none";
window.onload = chatClient.style.display = "none";
window.onload = editReq.style.display = "none";
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
      window.location.replace("http://127.0.0.1:5500/index.html");
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





/*
  let creds =localStorage.getItem('item');
  creds = creds.split(',');
  console.log(creds[1]);*/

//Services

//Firestore
async function acceptRequest(){
  alert("are you sure?");
  let fireuser = sessionStorage.getItem('user');
  let creds =localStorage.getItem('item');
  creds = creds.split(',');
  console.log(creds);

  const transactionUpdate = doc(firestoredb, "transactions",creds[0]);
  const docClientUpdate = doc(firestoredb, "users",creds[2],"transactions",creds[0]);
  const docServProviderUpdate = doc(firestoredb, "users",fireuser,"services",creds[1],"transactions",creds[0]);
  //update docs
  batch.update(transactionUpdate,{'confirmStatus':"accepted"});
  batch.update(docClientUpdate,{'confirmStatus':"accepted"});
  batch.update(docServProviderUpdate,{'confirmStatus':"accepted"});
   batch.commit().then(() => {
      console.log('profiles updated...');
      location.reload();
    });
  
  
  
}

async function cancelRequest(){
  alert("are you sure?");
  let fireuser = sessionStorage.getItem('user');
  let creds =localStorage.getItem('item');
  creds = creds.split(',');
  console.log(creds);

  const transactionUpdate = doc(firestoredb, "transactions",creds[0]);
  const docClientUpdate = doc(firestoredb, "users",creds[2],"transactions",creds[0]);
  const docServProviderUpdate = doc(firestoredb, "users",fireuser,"services",creds[1],"transactions",creds[0]);
  //update docs
  batch.update(transactionUpdate,{'confirmStatus':"cancelled"});
  batch.update(docClientUpdate,{'confirmStatus':"cancelled"});
  batch.update(docServProviderUpdate,{'confirmStatus':"cancelled"});
   batch.commit().then(() => {
      console.log('profiles updated...');
      location.reload();
    });
  
}

async function getRequestData(transactionID,serviceName){
  
  console.log(transactionID,serviceName);
  const docRef = doc(firestoredb, "users",fireuserID,"services",serviceName,"transactions",transactionID);
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
    const q = query(collection(firestoredb,"users",userID, "services",docID,"transactions"));
    
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
  const q = query(doc(firestoredb,"transactions",docID));
  const docSnap = await getDoc(q);
  
  data = docSnap.data()
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
    
    let requests = await getRequests(service.id.replace(/\s/g,''));
     await getRequestsNum(service.id.replace(/\s/g,''));
    
    
    
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
      sideDIVRequests.classList.add( 'd-flex', 'align-items-center', 'button-'+countReq+'','reqbutton','collapse-item','p-1');
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
      sidedivText.classList.add('font-weight-bold','bg-light','w-100','p-1','rounded','border-0');

      //for notif bar
      let remarkText = document.createElement('div');
      remarkText.classList.add('text-truncate');
      //side bar
      let sideremarkText = document.createElement('div');
      sideremarkText.style.textDecoration = 'none';
      sideremarkText.classList.add('text-truncate');

      //for notif bar
      let clientName = document.createElement('div');
      clientName.classList.add('small','text-gray-500');
      //for sidebar
      let sideclientName = document.createElement('div');
      sideclientName.classList.add('small','text-gray-500');

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


function viewDetails(transactionID,serviceName,clientID){
  OuterDiv.innerHTML = '';
  window.onload = cancelReq.style.display = "";
  window.onload = acceptReq.style.display = "";
  window.onload = chatClient.style.display = "";
  window.onload = editReq.style.display = "";

  var items = [];

  function store(item_id) {
      items.push(item_id);
      localStorage.setItem("item",items);
  }
  store(transactionID);
  store(serviceName);
  store(clientID);
  console.log(transactionID,serviceName,clientID);
  

  getrequestPending(transactionID,serviceName,clientID);

}

async function getrequestPending(transactionID,serviceName,clientID){
  console.log(clientID);
  let requestdata = await getRequestData(transactionID,serviceName,clientID);
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



cancelReq.addEventListener('click',cancelRequest);
acceptReq.addEventListener('click',acceptRequest);
//chatClient.addEventListener('click',);