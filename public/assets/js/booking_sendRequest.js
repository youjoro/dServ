import { getFirestore , collection, addDoc, doc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {firestoreConfig} from './firebase_config.js';



const app = initializeApp(firestoreConfig);
const db = getFirestore(app);

var button = document.getElementById('sendRequest');

//inputs
var fName = document.getElementById('firstName');
var lName = document.getElementById('lastName');
var mobileNum = document.getElementById('number');
var email = document.getElementById('email');
var clients = document.getElementById('numberselected');
var bundle = document.getElementById('BundleSelected');
var remarks = document.getElementById('remarks');

//sessionID
var userID = sessionStorage.getItem("user");

//localstorage
let service = null;

//text
var sessIN = document.getElementById('sessIn');
var sessOUT = document.getElementById('sessOut'); 

window.onload = sessIN.style.display = 'none';



window.onload = function(){
    checkSession();
    service = localStorage.Service;
    if (service){
        service = JSON.parse(service);
        
    }
}



function checkSession(){
  
var sessionData=sessionStorage.getItem("sessionCheck");
console.log(sessionData);
if(sessionData == null){
    fName.disabled = true;
    lName.disabled = true;
    mobileNum.disabled = true;
    email.disabled = true;
    clients.disabled = true;
    bundle.disabled = true;
    remarks.disabled = true;
    button.disabled = true;
    sessOUT.style.display = '';
    sessIN.style.display = 'none';
    //alert("Redirecting");
    //window.location.replace("http://127.0.0.1:5500/public/index.html");
}else{
    fName.disabled = false;
    lName.disabled = false;
    mobileNum.disabled = false;
    email.disabled = false;
    clients.disabled = false;
    bundle.disabled = false;
    remarks.disabled = false;
    button.disabled = false;
    sessOUT.style.display = 'none';
    sessIN.style.display = '';
}
}

function InputClear(){
    fName.value="";
    lName.value="";
    mobileNum.value="";
    email.value="";
    clients.selected="Choose...";
    bundle.selected="Choose...";
    remarks.value="";

}

async function sendRequest(){
    try {
        
        const docRef = await addDoc(collection(db, "service",service.ServiceName,"transaction"), {
        ClientFirstName: fName.value,
        ClientLastName: lName.value,
        ClientMobileNum: mobileNum.value,
        ClientEmail: email.value,
        ClientSelectedBundle: bundle.value,
        clientNumber: clients.value,
        ClientRemarks: remarks.value,
        clientID:userID

        });
    console.log("Document written with ID: ", docRef.id);
    alert("Request Sent");
    InputClear();
    } catch (e) {
    console.error("Error adding document: ", e);
    }
}

button.addEventListener('click',sendRequest);
