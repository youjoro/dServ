import { getFirestore , collection, addDoc, doc,setDoc } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {firestoreConfig} from './firebase_config.js';
import { getAuth, 
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";


const app = initializeApp(firestoreConfig,"secondary");
const db = getFirestore(app);
const fireauth = getAuth(app);
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



//localstorage
var service = null;

//text
var sessIN = document.getElementById('sessIn');
var sessOUT = document.getElementById('sessOut'); 

window.onload = sessIN.style.display = 'none';



window.onload = function(){
    checkSession();
    service = localStorage.Service;
    console.log(service);
    if (service){
        service = JSON.parse(service);
        console.log(service.TransactionID);
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
    window.location.replace("http://127.0.0.1:5500/index.html");
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

const monitorAuthState = async() =>{

    onAuthStateChanged(fireauth,user=>{
        if(user){
        console.log(user.uid);
        sendRequest(user.uid);
        }else{
        console.log("no user");
        
        }
    });
}


async function sendRequest(userID){
    console.log(userID);
    
    try {
        
        const dt = new Date();
        const docRef = await addDoc(collection(db, "transactions"), {
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
        await updateRequestList_client(userID,docRef.id);
        await updateRequestList_ServiceProvider(service.TransactionID,service.ServiceName,docRef.id);
        
    } catch (e) {
    console.error("Error adding document: ", e);
    }
    localStorage.removeItem("Service");
}


async function updateRequestList_client(userID,docID){
    console.log(userID,docID);
    
    try {
        
        const dt = new Date();
        const docRef = await setDoc(doc(db, "user",userID,"transactions", docID), {
            RequestID: docID,
            RequestedDate:date.value,
            DateAdded:dt

            });
        console.log("Document written with ID: ", docRef.id);
        alert("Request Sent");
        InputClear();
    } catch (e) {
    console.error("Error adding document: ", e);
    }
    
}



async function updateRequestList_ServiceProvider(userID,serviceName,docID){
    console.log(userID,docID);
    
    try {
        
        const dt = new Date();
        const docRef = await setDoc(doc(db, "user",userID,"services",serviceName,"transactions", docID), {
            RequestID: docID,
            RequestedDate:date.value,
            DateAdded:dt,
            ServiceName:serviceName
            });
        console.log("Document written with ID: ", docRef.id);
        alert("Request Sent");
        InputClear();
    } catch (e) {
    console.error("Error adding document: ", e);
    }
    
}




button.addEventListener('click',monitorAuthState);
