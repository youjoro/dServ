import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getDatabase, ref, onValue} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getFirestore , collection, getCountFromServer, query, getDocs,doc,getDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

import {firebaseConfig, firestoreConfig} from '../firebase_config.js';

const app = initializeApp(firebaseConfig);
const firestoreapp = initializeApp(firestoreConfig,"secondary");
const firestoredb = getFirestore(firestoreapp);
const realdb = getDatabase(app);
const fireauth = getAuth(firestoreapp);
const auth = getAuth();

window.onload = document.getElementById("profile_content").style.visibility = "hidden";


var total_pending = 0;
var jobs_completed = 0;

//Documents
const OuterDiv = document.getElementById('servicesBlock');
const messagesTab =document.getElementById('messages');
const pend_text = document.getElementById('pendingRequests');
const jobCompletetext = document.getElementById('jobs_completed');
const requestnotif = document.getElementById('request_notif');




const signOutUser = async() =>{

    await signOut(auth);
    alert("logged out");
    window.location.replace("http://127.0.0.1:5500/index.html");
    sessionStorage.clear();
    location.reload();
    
}





//Services

//Firestore
  const monitorFireAuth = async() =>{

      onAuthStateChanged(fireauth,user=>{
        if(user){

          
          
          
        }else{
          console.log("no user");                    
        }
      });
  
    }

monitorFireAuth();


async function getRequestsID(serviceName){
  let IDs = []
  console.log(serviceName);
  var fireuserID = sessionStorage.getItem('fireuser');
    const q = collection(firestoredb, "users",fireuserID,"services",serviceName,"transactions");
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      
      
      IDs.push(doc.data().RequestID);
    });


    return IDs;
}



async function getRequests(serviceName){
  
  let requestID = await getRequestsID(serviceName);
  console.log(requestID);
  for(var i = 0; i<requestID.length;i++){
    const q = doc(firestoredb,"transactions",requestID[i]);
    const docSnap = await getDoc(q);

    if (docSnap.exists()) {
      
      await createMessages(docSnap.data());
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }

  
  
    
}

async function getRequestsNum(serviceName){
  var fireuserID = sessionStorage.getItem("fireuser")
  const coll = collection(firestoredb, "users",fireuserID,"services",serviceName,"transactions");

  const snapshot = await getCountFromServer(coll);
  total_pending = total_pending + snapshot.data().count;

  
  pend_text.innerHTML = total_pending;

  requestnotif.innerHTML = total_pending;


  return snapshot.data().count;
}

async function getFinished(serviceName){
  var fireuserID = sessionStorage.getItem("fireuser")
  const coll = collection(firestoredb, "users",fireuserID,"services",serviceName,"finished");

  const snapshot = await getCountFromServer(coll);
  

  jobs_completed = jobs_completed + snapshot.data().count;
  jobCompletetext.innerHTML = jobs_completed;


  return snapshot.data().count;
}


//Services to HTML

var servicesList=[];
function loadServices(){
  var servs="";
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

loadServices();
function addAllServices(){
    let i = 0;
    servicesList.forEach(serv =>{
      addAService(serv, i++);
      addMessage(serv, i++);
      
    });
    
}






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
}

function createMessages(requests){
  
  
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
  /*let newServ = document.createElement('div');
  newServ.classList.add('container');
  newServ.innerHTML = html;*/
  messagesTab.append(requestbutton);
  let dateFormat = requests.RequestedDate.split('/');
  dateFormat = dateFormat[2]+"/"+dateFormat[1]+"/"+dateFormat[0];
  appendLocalStorage(requests.ClientEmail+"-"+dateFormat);
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
      <div class="container border border-dark my-2 rounded">
      <h4 class="small font-weight-bold pt-1" >`+service.ServiceName+`</h4>
      <div class="container">
          <h5 class="small font-weight-bold">Desc: `+desc+`...</h5>
          <h5 class="small font-weight-bold">Jobs Finished: `+finishedNum+`</h5>
          <h5 class="small font-weight-bold">Requests Pending: `+requestnum+`</h5>
          <a href="#!" id="delete`+index+`" class="mr-auto ">Edit</a>
      </div>
      
      </div>
      `;


      let newServ = document.createElement('div');
      newServ.classList.add('productcard');
      newServ.innerHTML = html;
      OuterDiv.append(newServ);
    
  }

  getrequestPending();

}
