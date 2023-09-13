import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue,update} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getFirestore , collection, getCountFromServer, query, getDocs,doc,getDoc,orderBy,limitToLast } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

import {firebaseConfig} from '../firebase_config.js';

const app = initializeApp(firebaseConfig);
const firestoredb = getFirestore(app);
const realdb = getDatabase(app);

window.onload = document.getElementById("profile_content").style.visibility = "hidden";

var arrayOfServices = [];
var total_pending = 0;
var jobs_completed = 0;

//Documents
const OuterDiv = document.getElementById('servicesBlock');
const messagesTab =document.getElementById('messages');
const pend_text = document.getElementById('pendingRequests');
const jobCompletetext = document.getElementById('jobs_completed');
const requestnotif = document.getElementById('request_notif');
const create = document.getElementById('createServiceButton');
const verifyMessage = document.getElementById('verMessage');
const verifyDiv = document.getElementById('verifyDiv');
const chatTab = document.getElementById('chats')
let validated =  sessionStorage.verified

//Services
if(create != null){
  if (validated=="false"){
    create.style.visibility = 'hidden';
    verifyMessage.style.visibility = 'visible';
  }else{
    create.style.visibility = 'visible';
    verifyMessage.remove();
  }
}

async function getRequestsID(serviceName){
  let IDs = []
  
  var userID = sessionStorage.getItem('user');
    const q = collection(firestoredb, "users",userID,"services",serviceName,"transactions");
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      
      
      IDs.push(doc.data().RequestID);
    });

    console.log(IDs)
    return IDs;
}



async function getRequests(serviceName){
  
  let requestID = await getRequestsID(serviceName);
  
  for(var i = 0; i<requestID.length;i++){
    
    const q = doc(firestoredb,"transactions",requestID[i]);
    const docSnap = await getDoc(q);

    if (docSnap.exists()) {
      
      await createMessages(docSnap.data(),requestID[i]);
      
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  
  
    
}

async function getRequestsNum(serviceName){
  var userID = sessionStorage.getItem("user");
  const coll = collection(firestoredb, "users",userID,"services",serviceName,"transactions");

  const snapshot = await getCountFromServer(coll);
  total_pending = total_pending + snapshot.data().count;

  
  pend_text.innerHTML = total_pending;

  requestnotif.innerHTML = total_pending;


  return snapshot.data().count;
}

async function getFinished(serviceName){
  var userID = sessionStorage.getItem("user");
  const coll = collection(firestoredb, "users",userID,"services",serviceName,"finished");

  const snapshot = await getCountFromServer(coll);
  

  jobs_completed = jobs_completed + snapshot.data().count;
  jobCompletetext.innerHTML = jobs_completed;


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
        });
        addAllServices();
    })
    } ;
    
    services();
}

function checkHolidayMode(){
  const holidayButton = document.getElementById('setHoliday')
  if(holidayButton!=""){
var userID = sessionStorage.getItem("user");
  const getService = ref(realdb, 'ProviderProfile/'+userID+'/holidayStatus');

  onValue(getService, (snapshot) => {
    if(snapshot.val()=="no" || snapshot.val()==null){
      holidayButton.classList.add("btn-outline-secondary")
      holidayButton.addEventListener('click',function(){
        updateHolidayStatus("yes",userID)
      })
    }else{
      holidayButton.classList.add("btn-success")
      holidayButton.innerHTML = "Currently in Holiday Mode"
      holidayButton.addEventListener('click',function(){
        updateHolidayStatus("no",userID)
      })
    }
  });

  }
  

  
}

function updateHolidayStatus(statusText,userID){
  var a = new Object();
  a["holidayStatus"] = statusText;
   update(ref(realdb, 'ProviderProfile/' + userID),a).then(function(){
                alert("Updated Data");
                location.reload();
            }).catch(function(error){
            console.log('Synchronization failed');
        })
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
  console.log(chat)
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
loadServices();
checkHolidayMode()

function addAllServices(){
    let i = 0;
    servicesList.forEach(serv =>{
      
      addAService(serv, i);
      addMessage(serv);

      arrayOfServices.push(serv);
      let end = arrayOfServices[arrayOfServices.length - 1];
      end['id']=serv.id;
      i++;
    });
    
    console.log(arrayOfServices);
    sessionStorage.servicesCount = servicesList.length;
}




localStorage.removeItem("requests")

async function addMessage(service){
    
  await getRequests(service.id.replace(/\s/g,''));

}

function appendLocalStorage(requestInfo){
  var localArray = localStorage.getItem('requests');
  
  if(localArray == null){
    localStorage.requests=requestInfo;
  }else if(!localArray.includes(requestInfo)){
    localStorage.requests=localArray +","+requestInfo
  }else{
    
  }
  
  console.log(localStorage.getItem("requests"));
}

function createMessages(requests,ID){
  
  
  let desc = requests.ClientRemarks.substring(0,25);
  desc.replace(/[^a-zA-Z0-9]/g,"...");

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


  clientName.innerHTML = requests.ClientLastName +" "+requests.ClientFirstName;
  remarkText.innerHTML = desc+"...";

  divText.append(remarkText,clientName);

  requestbutton.append(dropdownIMG,divText);
  messagesTab.append(requestbutton);

  let dateFormat = requests.RequestedDate.split('/');
  dateFormat = dateFormat[2]+"/"+dateFormat[1]+"/"+dateFormat[0];
  appendLocalStorage(ID+"-"+requests.ClientEmail+"-"+dateFormat);
}



function addAService(service,index){
  let serviceName = service.id;
  serviceName = serviceName.replace(/\s/g,'');
  
  
  const getrequestPending = async()=>{
    let requestnum = await getRequestsNum(serviceName);
    let finishedNum = await getFinished(serviceName);

    let desc = service.Description.substring(0,15);
    desc.replace(/[^a-zA-Z0-9]/g,"...");
      let html = 
      `
      <div class="container border border-dark my-2 rounded py-2">
      <h4 class="small font-weight-bold pt-1" >`+service.ServiceName+`</h4>
      <div class="container">
          <h5 class="small font-weight-bold">Desc: `+desc+`...</h5>
          <h5 class="small font-weight-bold">Jobs Finished: `+finishedNum+`</h5>
          <h5 class="small font-weight-bold">Requests Pending: `+requestnum+`</h5>
          <button id="delete-`+index+`" class="mr-auto editServ btn btn-outline-secondary" >Edit Service</button>
          <br>
      </div>
      
      </div>
      `;


      let newServ = document.createElement('div');
      newServ.classList.add('productcard','service');
      newServ.innerHTML = html;
      OuterDiv.append(newServ);
    AssignAllEvents();  
  }

  getrequestPending();
  
}


function getServiceIndex(id){
    var indstart = id.indexOf('-')+1;
    var indEnd = id.length;
    return Number(id.substring(indstart,indEnd));
}


function gotoServiceDetails(event){
    var index = getServiceIndex(event.target.id);
    
    localStorage.Request = JSON.stringify(arrayOfServices[index]);
    window.location = "/Service_Provider_Dashboard/updateService.html";
}


function AssignAllEvents(){    
    
    const divs = document.getElementsByClassName('service');
    const btns = document.getElementsByClassName('editServ');

    if (divs != null){        
        
        for (let i=0; i <divs.length;i++){
            
               
            btns[i].addEventListener('click',gotoServiceDetails);                
        }
    }

}