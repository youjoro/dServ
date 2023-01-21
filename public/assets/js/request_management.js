import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getDatabase, ref, child, onValue,get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getFirestore , collection,getDoc, doc , getCountFromServer, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

import {firebaseConfig, firestoreConfig} from './firebase_config.js';

const app = initializeApp(firebaseConfig);
const firestoreapp = initializeApp(firestoreConfig,"secondary");
const firestoredb = getFirestore(firestoreapp);
const realdb = getDatabase(app);
const auth = getAuth();

window.onload = document.getElementById("profile_content").style.visibility = "hidden";


var total_pending = 0;
var jobs_completed = 0;

//Documents
const messagesTab =document.getElementById('messages');
const requestnotif = document.getElementById('request_notif');
const interactableMessages = document.getElementById('messagesInteractable');

//Session
function getUserType(){
  var user_type="";
    var userID = sessionStorage.getItem("user");
    console.log(userID);
    
    const getType = ref(realdb, 'users/'+userID+'/user_type');
    const type = async() =>{
      onValue(getType, (snapshot) => {
      user_type = snapshot.val();
      console.log(user_type);
      if(user_type=="client" || user_type==null){
        alert("You are not supposed to be here");
        window.location.replace("http://127.0.0.1:5500/public/index.html");
      }else{
        document.getElementById("profile_content").style.visibility = "visible";
        document.getElementById('loading').remove();
        loadServices();
      }
    })
    } ;
    
    type();
    
}


function checkSession(user){

var sessionData=sessionStorage.getItem("user");
console.log(sessionData);

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
        sessionStorage.setItem("user",user.uid);
        console.log(user);
        checkSession(user); 
      }else{
        console.log("no user");
        getUserType();
      }
    });
  }

monitorAuthState();


const signOutUser = async() =>{

    await signOut(auth);
    alert("logged out");
    window.location.replace("http://127.0.0.1:5500/public/index.html");
    sessionStorage.clear();
    location.reload();
    
}





//Services

//Firestore
async function getRequests(serviceName){
  let datas =[];
    const q = query(collection(firestoredb, "service",serviceName,"transaction"));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      //console.log(doc.id, " => ", doc.data());
      datas.push(doc.data());
    });
    console.log(datas);
    return datas;
}

async function getRequestsNum(serviceName){
  const coll = collection(firestoredb, "service",serviceName,"transaction");
  const snapshot = await getCountFromServer(coll);

  total_pending = total_pending + snapshot.data().count;
  console.log('count: ', snapshot.data().count,'| Name:',serviceName);
  
  requestnotif.innerHTML = total_pending;
  return snapshot.data().count;
}

async function getFinished(serviceName){
  const coll = collection(firestoredb, "service",serviceName,"finished");
  const snapshot = await getCountFromServer(coll);

  console.log('FInished count: ', snapshot.data().count,'| Name:',serviceName);
  jobs_completed = jobs_completed + snapshot.data().count;

  return snapshot.data().count;
}


//Services to HTML
document.getElementById('logout').addEventListener('click', signOutUser);
var servicesList=[];
function loadServices(){


  var userID = sessionStorage.getItem("user");
  const getService = ref(realdb, 'ProviderProfile/'+userID+'/Services');

  const services = async() =>{
      onValue(getService, (snapshot) => {
      snapshot.forEach(serv => {
            servicesList.push(serv.val());
        });
        addAllServices();
    })
    } ;
    
    services();
}

function addAllServices(){
    let i = 0;
    servicesList.forEach(serv =>{
        //addAService(serv, i++);
        addMessage(serv, i++);
    });
    
}





let countReq = 0;
function addMessage(service,index){
  
  const getrequestPending = async()=>{    
    let requests = await getRequests(service.ServiceName);
    let requestnum = await getRequestsNum(service.ServiceName);

    for(var i = 0; i<requests.length; i++){   
      countReq +=1;
      
      let lastName = requests[i].ClientLastName; 
      let firstName = requests[i].ClientFirstName;

      let desc = requests[i].ClientRemarks.substring(0,25);
      desc.replace(/[^a-zA-Z0-9]/g,"...");

      let img = document.createElement('img');


      img.classList.add('rounded-circle');
      img.src="img/undraw_profile_1.svg";


      let requestbutton = document.createElement('a');
      let sideDIVRequests = document.createElement('a');
      

      requestbutton.classList.add('dropdown-item', 'd-flex', 'align-items-center');
      sideDIVRequests.classList.add('dropdown-item', 'd-flex', 'align-items-center', 'button-'+countReq+'','reqbutton');

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

      
      sideDIVRequests.onclick = function() { alert(service); };
      messagesTab.append(requestbutton);
      interactableMessages.append(sideDIVRequests);
      
    }


    
    
  }

  getrequestPending();

}


//  function loadMessage()


/*function addAService(service,index){
  
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
*/