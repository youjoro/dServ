import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

import { getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getDatabase, ref, child, onValue,get} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

import {firebaseConfig} from './firebase_config.js';

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const auth = getAuth();

window.onload = document.getElementById("profile_content").style.visibility = "hidden";


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
        window.location.replace("http://127.0.0.1:5500/index.html");
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
    window.location.replace("http://127.0.0.1:5500/index.html");
    sessionStorage.clear();
    location.reload();
    
}

document.getElementById('logout').addEventListener('click', signOutUser);
var servicesList=[];
function loadServices(){
  var servs="";
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
        addAService(serv, i++);
    });
    
}
var OuterDiv = document.getElementById('servicesBlock');
function addAService(service,index){
  let desc = service.Description.substring(0,15);
  desc.replace(/[^a-zA-Z0-9]/g,"...");
    let html = 
    `
    <div class="container border border-dark my-2 rounded">
    <h4 class="small font-weight-bold pt-1" >`+service.ServiceName+`</h4>
    <div class="container">
        <h5 class="small font-weight-bold">Desc: `+desc+`...</h5>
        <h5 class="small font-weight-bold">Jobs Finished:</h5>
        <a href="#!" id="delete`+index+`" class="mr-auto ">Edit</a>
    </div>
    
    </div>
    `


    let newServ = document.createElement('div');
    newServ.classList.add('productcard');
    newServ.innerHTML = html;
    OuterDiv.append(newServ);
    
}
