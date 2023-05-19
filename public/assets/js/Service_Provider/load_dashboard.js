import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, onValue} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getFirestore , collection, getCountFromServer, query, getDocs,doc,getDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

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
let validated =  sessionStorage.verified

//Services

if (validated=="false"){
  create.style.visibility = 'hidden';
  verifyMessage.style.visibility = 'visible';
}else{
  create.style.visibility = 'visible';
  verifyMessage.remove();
}
async function getRequestsID(serviceName){
  let IDs = []
  console.log(serviceName);
  var userID = sessionStorage.getItem('user');
    const q = collection(firestoredb, "users",userID,"services",serviceName,"transactions");
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      
      
      IDs.push(doc.data().RequestID);
    });


    return IDs;
}



async function getRequests(serviceName){
  console.log(serviceName);
  let requestID = await getRequestsID(serviceName);
  console.log(requestID);
  for(var i = 0; i<requestID.length;i++){
    console.log(requestID);
    const q = doc(firestoredb,"transactions",requestID[i]);
    const docSnap = await getDoc(q);

    if (docSnap.exists()) {
      console.log(docSnap);
      await createMessages(docSnap.data());
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
    console.log(servicesList);
    services();
}

loadServices();

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






async function addMessage(service){
    
  await getRequests(service.id.replace(/\s/g,''));

}

function appendLocalStorage(requestInfo){
  var localArray = localStorage.getItem('requests');
  console.log(requestInfo);
  if(localArray == null){
    localStorage.requests=requestInfo;
  }else if(!localArray.includes(requestInfo)){
    localStorage.requests=localArray +","+requestInfo
  }else{
    localStorage.requests="none";
  }
  console.log(localStorage.getItem("requests"));
}

function createMessages(requests){
  console.log(requests);
  
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
  appendLocalStorage(requests.ClientEmail+"-"+dateFormat);
}



function addAService(service,index){
  let serviceName = service.id;
  serviceName = serviceName.replace(/\s/g,'');
  console.log(serviceName);
  
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
    console.log(index);
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