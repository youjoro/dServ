import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, ref, child, get, set }
from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import {firebaseConfig} from "../firebase_config.js";
import { getFirestore , collection, doc,getDoc,getDocs,query, setDoc,writeBatch, runTransaction   } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js'

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const firedb = getFirestore(app);
const addbatch = writeBatch(firedb);
const deletebatch = writeBatch(firedb);

const finalizeButton = document.getElementById('finalizeButton');
const serviceName = document.getElementById('serviceName');
const ServiceOwner = document.getElementById('ServiceOwner');
const dateAppointment = document.getElementById('dateAppointment');
const dateBooked = document.getElementById('dateBooked');
const ratingButtons = document.getElementsByClassName('ratingButton');
const commentbox = document.getElementById('comment');
const user = sessionStorage.getItem('user');


let request = null;







window.onload = function(){

    request = localStorage.Request;     
    if (request){
        request = JSON.parse(request);
        addDetails(request);
        console.log(request);
    }
    AssignAllEvents()
    getServiceProviderName(request.ServiceOwner)
}

function addDetails(requestData){
    var time = requestData.DateAdded;
    
    let dateFormat = new Date(time.seconds*1000);
    dateFormat=moment(dateFormat).format("YYYY-MM-DD hh:mm A");
    serviceName.innerHTML = requestData.serviceName;
    dateAppointment.innerHTML = requestData.RequestedDate
    dateBooked.innerHTML = dateFormat;
}


function getServiceIndex(id){
    var indstart = id.indexOf('-')+1;
    var indEnd = id.length;
    return Number(id.substring(indstart,indEnd));
}

var index = ""
function gotoServiceDetails(event){
    index = event.target.id;
    sessionStorage.rating = index
    
}



function AssignAllEvents(){    

    if (ratingButtons != null){        
        console.log(ratingButtons.length);
        for (let i=0; i <ratingButtons.length;i++){
            console.log(ratingButtons[i]);
               
            ratingButtons[i].addEventListener('click',gotoServiceDetails);                
        }
    }

}

var userFirstName = "";
var userLastName = "";
var pricePerHour = ""
async function getServiceProviderName(userId){
    var dbRef = ref(realdb);
    console.log(userId);
    await get(child(dbRef,"ProviderProfile/"+userId)).then((snapshot) => {
        if (snapshot.exists()) {
            userFirstName = snapshot.val().FirstName;
            userLastName = snapshot.val().lastName;
        } else {
            console.log("No data available");
        }
        }).catch((error) => {
            alert(error+"\n will reload");
            location.reload()
        });
    console.log(userFirstName+" "+userLastName)
    ServiceOwner.innerHTML = userFirstName+" "+userLastName;
}


async function addToFinished_transaction(){
    const providerRef = doc(firedb,"transactions",request.id);
    const toFinishedRef = doc(firedb,"finished",request.id);
    try {
    const toFinished = await runTransaction(firedb, async (transaction) => {
        const sfDoc = await transaction.get(providerRef);
        if (!sfDoc.exists()) {
        throw "Document does not exist!";
        }

        const transactionData = sfDoc.data();
        
        transaction.set(toFinishedRef,transactionData)
            console.log('added to finished jobs transactions....');
        
            
    }).then(()=>{
        deleteTransaction()
    })

    } catch (e) {
    // This will be a "population is too big" error.
    console.error(e);
    }
}


async function addToFinished_client(){
    const clientRef = doc(firedb, "users",request.clientID,"transactions",request.id);
    const toFinishedRef = doc(firedb, "users",request.clientID,"finished",request.id);
    try {
    const toFinished = await runTransaction(firedb, async (transaction) => {
        const sfDoc = await transaction.get(clientRef);
        if (!sfDoc.exists()) {
        throw "Document does not exist!";
        }

        const transactionData = sfDoc.data();
        
        transaction.set(toFinishedRef,transactionData)
            console.log('added to finished jobs client side....');
        
            
    }).then(()=>{
        addToFinished_serviceProvider()
    })  

    } catch (e) {
    // This will be a "population is too big" error.
    console.error(e);
    }
}

async function addToFinished_serviceProvider(){
    const providerRef = doc(firedb, "users",request.ServiceOwner,"services",request.ServiceID,"transactions",request.id);
    const toFinishedRef = doc(firedb, "users",request.ServiceOwner,"services",request.ServiceID,"finished",request.id);
    try {
    const toFinished = await runTransaction(firedb, async (transaction) => {
        const sfDoc = await transaction.get(providerRef);
        if (!sfDoc.exists()) {
        throw "Document does not exist!";
        }

        const transactionData = sfDoc.data();
        
        transaction.set(toFinishedRef,transactionData)
            console.log('added to finished jobs service provider....');
        
            
    }).then(()=>{
        addToFinished_transaction()
    })

    } catch (e) {
    // This will be a "population is too big" error.
    console.error(e);
    }
}


async function acceptRequest(){
    alert("are you sure?");
    
    console.log();

    const transactionUpdate = doc(firedb, "transactions",request.id);
    const docClientUpdate = doc(firedb, "users",request.clientID,"transactions",request.id);
    const docServProviderUpdate = doc(firedb, "users",request.ServiceOwner,"services",request.ServiceID,"transactions",request.id);
    //update docs
    addbatch.update(transactionUpdate,{'confirmStatus':"finished"});
    addbatch.update(docClientUpdate,{'confirmStatus':"finished"});
    addbatch.update(docServProviderUpdate,{'confirmStatus':"finished"});
    addbatch.commit().then(() => {            
            addReview();
            console.log('profiles updated...');
        });
  
  
}

function addReview(){
    console.log(request.ClientFirstName+"  "+request.ClientLastName);
    const dt = new Date();
    set(ref(realdb, 'Services/' + request.ServiceID + '/reviews/' + request.id), {
        rating: sessionStorage.getItem('rating'),
        comment:commentbox.value,
        client:request.ClientFirstName+"  "+request.ClientLastName,
        DateFinalized:dt
    }).then(()=>{
        addToFinished_client();
        console.log('review added');
    })
}


function deleteTransaction(){
    const transactionUpdate = doc(firedb, "transactions",request.id);
    const docClientUpdate = doc(firedb, "users",request.clientID,"transactions",request.id);
    const docServProviderUpdate = doc(firedb, "users",request.ServiceOwner,"services",request.ServiceID,"transactions",request.id);
    //update docs
    deletebatch.delete(transactionUpdate);
    deletebatch.delete(docClientUpdate);
    deletebatch.delete(docServProviderUpdate);
    deletebatch.commit().then(() => {
            alert('transactions deleted\n operation finished');
            window.location.replace("http://127.0.0.1:5500/view_profile/profile.html");
        });
}

finalizeButton.onclick = function(){
    acceptRequest()
}