import { getFirestore , collection, addDoc, doc  } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {firestoreConfig} from './firebase_config.js';



const app = initializeApp(firestoreConfig);
const db = getFirestore(app);

var button = document.getElementById('sendRequest');

//inputs
const fName = document.getElementById('firstName');
const lName = document.getElementById('lastName');
const mobileNum = document.getElementById('number');
const email = document.getElementById('email');
const clients = document.getElementById('numberselected');
const bundle = document.getElementById('BundleSelected');
const remarks = document.getElementById('remarks');
const date = document.getElementById('date');

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
    alert("Redirecting");
    window.location.replace("https://test-75edb.web.app/index.html");
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
    date.value="";
}



async function sendRequest(){
    try {
        const dt = new Date();
        const docRef = await addDoc(collection(db, "service",service.ServiceName,"transaction"), {
        ClientFirstName: fName.value,
        ClientLastName: lName.value,
        ClientMobileNum: mobileNum.value,
        ClientEmail: email.value,
        ClientSelectedBundle: bundle.value,
        clientNumber: clients.value,
        ClientRemarks: remarks.value,
        clientID:userID,
        RequestedDate:date.value,
        DateAdded:dt,
        confirmStatus:'pending'

        });
    console.log("Document written with ID: ", docRef.id);
    alert("Request Sent");
    InputClear();
    } catch (e) {
    console.error("Error adding document: ", e);
    }
    localStorage.removeItem("Service");
}

button.addEventListener('click',sendRequest);
