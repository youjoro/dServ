import { getFirestore , collection, addDoc, doc,setDoc } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js'
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {firebaseConfig} from '../firebase_config.js';
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getDatabase, get,child,ref} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const db = getFirestore(app);
const fireauth = getAuth(app);
const button = document.getElementById('sendRequest');

//inputs
const fName = document.getElementById('firstName');
const lName = document.getElementById('lastName');
const mobileNum = document.getElementById('number');
const email = document.getElementById('email');
const clients = document.getElementById('numberselected');
const bundle = document.getElementById('BundleSelected');
const remarks = document.getElementById('remarks');
const date = document.getElementById('date');
const checkbox = document.getElementById('agree')


const dateGet = new Date();

let day = dateGet.getDate();
let month = dateGet.getMonth() + 1;
let year = dateGet.getFullYear();

// This arrangement can be altered based on how we want the date's format to appear.
let currentDate = `${month}/${day}/${year}`;
console.log(currentDate)


const holidays = [
"11/01/2023"
    ,"12/30/2023"
    ,"12/31/2023"
    ,"12/8/2023"
,"12/25/2023"    
,"11/27/2023"
,"01/01/2024"
,"02/10/2024"
,"02/25/2024"
,"03/28/2023"
,"03/29/2024"
,"03/30/2024"
,"04/09/2024"
,"04/10/2024"
,"05/01/2024"
,"06/12/2024"
,"06/16/2024"
,"08/21/2024"
,"18/26/2024"
,"11/01/2024"
,"11/30/2024"
,"12/08/2024"
,"12/24/2024"
,"12/25/2024"
,"12/30/2024"
,"03/29/2024"]


function loadDays() {
    var days = service.ServiceDays;
    if(days != null){
        var week = [
            {num:0, day:"sun"},
            {num:1, day:"mon"},
            {num:2, day:"tue"},
            {num:3, day:"wed"},
            {num:4, day:"thu"},
            {num:5, day:"fri"},
            {num:6, day:"sat"}

        ]
        
        for (var d in days){
            for (var i in week) {
                if (week[i].day == days[d]) {
                    week.splice(i, days.length);

                }
            }
        }
        var d = []
        for (var i in week){
            d.push(week[i].num)
        }
        console.log(d)

        $('#datepicker').datepicker({
            autoclose:true,
            daysOfWeekDisabled:d,
            datesDisabled:holidays,
            startDate:currentDate
        });
    }else{
        $('#datepicker').datepicker({
            autoclose:true,
            datesDisabled:holidays
        });
    }

}


var service = null;

//text
var sessIN = document.getElementById('sessIn');
var sessOUT = document.getElementById('sessOut'); 

window.onload = sessIN.style.display = 'none';

checkbox.onclick = function(){
    if (button.style.visibility == 'hidden'){
        button.style.visibility = 'visible';
    }else{
        button.style.visibility = 'hidden';
    }
}
//
window.onload = function(){
    button.style.visibility = 'hidden';
    checkSession();

    service = localStorage.Service;
    console.log(service);

    if (service){

        service = JSON.parse(service);
        console.log(service.TransactionID);
        console.log(service.id);
        localStorage.setItem("service",service);
        loadDays()
    }else{
        alert("o no");
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
        remarks.disabled = true;
        button.disabled = true;
        sessOUT.style.display = '';
        sessIN.style.display = 'none';
        alert("Redirecting");
        window.location.replace("http://test-75edb.web.app/index.html");
    }else{
        fName.disabled = false;
        lName.disabled = false;
        mobileNum.disabled = false;
        email.disabled = false;
        clients.disabled = false;        
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
var userEmail = "";
const monitorAuthState = async() =>{

    onAuthStateChanged(fireauth,user=>{
        if(user){
        console.log(user.uid);
        getUserEmail(user.uid);
        }else{
        console.log("no user");
        
        }
    });
}



async function getUserEmail(userId){
    var dbRef = ref(realdb);
    console.log(userId);
    await get(child(dbRef,"users/"+userId)).then((snapshot) => {
        if (snapshot.exists()) {
            userEmail = snapshot.val().email;
            
        } else {
            console.log("No data available");
        }
        }).catch((error) => {
        console.error(error);
        });
    console.log(userEmail)
    sendRequest(userId);
}



async function sendRequest(userID){
    button.disabled = true;
    try {
        
        const dt = new Date();
        const docRef = await addDoc(collection(db, "transactions"), {
            ClientFirstName: fName.value,
            ClientLastName: lName.value,
            clientID:userID,
            ClientMobileNum: mobileNum.value,
            ClientEmail: email.value,            
            clientNumber: clients.value,
            ClientRemarks: remarks.value,
            ownerEmail:userEmail,
            RequestedDate:date.value,
            DateAdded:dt,
            confirmStatus:'pending',
            serviceName:service.ServiceName,
            ServiceOwner:service.TransactionID,
            ServiceID:service.id
            });
        const a = await updateRequestList_client(userID,docRef.id);
        const b = await updateRequestList_ServiceProvider(service.TransactionID,service.id,docRef.id,service.ServiceName);
        console.log("Document written with ID: ", docRef.id);
        alert("Request Sent");
        
        
    } catch (e) {
        console.error("Error adding document: ", e);
    } finally {
        localStorage.removeItem("Service");
        window.location.replace("http://test-75edb.web.app/index.html");
    }
    
}


async function updateRequestList_client(userID,docID){
    console.log(userID,docID);
    
    try {
        
        const dt = new Date();
        const docRef = await setDoc(doc(db, "users",userID,"transactions", docID), {
            RequestID: docID,
            RequestedDate:date.value,
            DateAdded:dt,
            confirmStatus:'pending'
            });
        
    } catch (e) {
        console.error("Error adding document: ", e);
    }
    
}



async function updateRequestList_ServiceProvider(serviceProvideruserID,serviceID,docID,serviceName){
    
    try {
        
        const dt = new Date();
        const docRef = await setDoc(doc(db, "users",serviceProvideruserID,"services",serviceID,"transactions", docID), {
            RequestID: docID,
            RequestedDate:date.value,
            DateAdded:dt,
            ServiceName:serviceName,
            confirmStatus:'pending'
            });
        
    } catch (e) {
        console.error("Error adding document: ", e);
    }
    
}




button.addEventListener('click',monitorAuthState);
