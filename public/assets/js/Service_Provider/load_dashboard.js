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
  var fireuserID = sessionStorage.getItem('fireuser');
    const q = query(collection(firestoredb, "users",fireuserID,"services",serviceName,"transactions"));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      
      
      IDs.push(doc.data().RequestID);
    });


    return IDs;
}



async function getRequests(serviceName){
  let datas =[];

  let requestID = await getRequestsID(serviceName);
  
    
    const q = doc(firestoredb,"transactions",requestID[0]);
  
    const querySnapshot = await getDoc(q);
    
    console.log(querySnapshot.id, " => ", querySnapshot.data());
    datas.push(querySnapshot.data());
    createMessages(querySnapshot.data());
    return datas;
}

async function getRequestsNum(serviceName){
  var fireuserID = sessionStorage.getItem("fireuser")
  const coll = collection(firestoredb, "users",fireuserID,"services",serviceName,"transactions");

  const snapshot = await getCountFromServer(coll);
  total_pending = total_pending + snapshot.data().count;

  console.log('count: ', snapshot.data().count,'| Name:',serviceName);
  pend_text.innerHTML = total_pending;

  requestnotif.innerHTML = total_pending;


  return snapshot.data().count;
}

async function getFinished(serviceName){
  var fireuserID = sessionStorage.getItem("fireuser")
  const coll = collection(firestoredb, "users",fireuserID,"services",serviceName,"finished");

  const snapshot = await getCountFromServer(coll);
  console.log('FInished count: ', snapshot.data().count,'| Name:',serviceName);

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






function addMessage(service){
  
  const getrequestPending = async()=>{    
    
    await getRequests(service.ServiceName);

  }

  getrequestPending();

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
}


function addAService(service,index){
  
  const getrequestPending = async()=>{
    let requestnum = await getRequestsNum(service.ServiceName);
    let finishedNum = await getFinished(service.ServiceName);

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
