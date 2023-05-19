import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, ref, child, get }
from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import {firebaseConfig} from "../firebase_config.js";
import { getFirestore , collection, doc,getDoc,getDocs,query,orderBy,limitToLast } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js'

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const firedb = getFirestore(app);

const username = document.getElementById('username');
const fullname = document.getElementById('userFullname');
const address = document.getElementById('address');
const phoneNumber = document.getElementById('phoneNumber');
const email = document.getElementById('email');
const requestList = document.getElementById('requestsList');
const inbox = document.getElementById('inbox');

var userID = sessionStorage.getItem('user');
var arrayOfRequests =[];
window.onload = loadProfileData(userID);
window.onload = loadRequests();
window.onload = loadChat();

function loadProfileData(userID){
    var dbRef = ref(realdb);
    try{
        get(child(dbRef,"users/"+userID)).then((snapshot)=>{
        
        if(snapshot.exists()){
            if (snapshot.val().address != null && snapshot.val().FirstName !=null){
                let profilefullname = snapshot.val().FirstName +" "+snapshot.val().lastName;
                address.innerHTML = ": "+snapshot.val().address;    
                fullname.innerHTML =": "+ profilefullname;
                
            }else{
                address.innerHTML = "None set yet";
                fullname.innerHTML = "None set yet";
            }


            username.innerHTML = ": "+snapshot.val().username;        
            phoneNumber.innerHTML = ": "+snapshot.val().phone_number;
            email.innerHTML = ": "+snapshot.val().email;
            
            
        }
        
        });

    }catch(e){
        console.log(e);
    }

}

async function loadChat(){
    const requests = collection(firedb,"users",userID,"chat");
    
    const querySnapshot = await getDocs(requests);
    try{
    querySnapshot.forEach((doc)=>{
        console.log(doc.id);
        getLatestMessage(doc.id);
    })  
    }catch(e){
        console.log(e);
    }  
}

async function getLatestMessage(id){
    const recentMessagesQueryLoad = query(collection(firedb,"chat",id,"messages"), orderBy('timestamp'), limitToLast(1));
    const docSnap = await getDocs(recentMessagesQueryLoad);
    
    docSnap.forEach((doc)=>{
        renderChat(doc.data(),id);
    })
}

async function renderChat(message,id){
    let li = document.createElement('li');
    let messagetext = document.createElement('p');
    let date = document.createElement('p');
    let dateRow = document.createElement('div');
    let messageRow = document.createElement('div');
    
    messagetext.classList.add('fw-bold');
    messageRow.classList.add('row');
    dateRow.classList.add('row');
    date.classList.add('text-muted','dateText','d-flex');
    li.classList.add("list-group-item" ,"p-3",'border','rounded','border-1','mb-2');


    const getName = await getProviderName(id);

    let time = message.timestamp;
    let dateFormat = new Date(time.seconds*1000);
    dateFormat=moment(dateFormat).format("YYYY-MM-DD hh:mm A");
    
    messagetext.innerHTML = getName;
    date.innerHTML = message.text +"  |  "+ dateFormat;

    console.log(message.text);

    messageRow.appendChild(messagetext);
    messageRow.appendChild(date);
    li.appendChild(messageRow);
    li.appendChild(dateRow);

    inbox.append(li);
}

async function getProviderName(id){
    const recentMessagesQueryLoad = doc(firedb,"chat",id);

    const docSnap = await getDoc(recentMessagesQueryLoad);

    if (docSnap.exists){
        return docSnap.data().serviceProviderName
    }
}

async function loadRequests() {
    let i = 0
    const requests = collection(firedb,"users",userID,"transactions");

    try{
        const querySnapshot = await getDocs(requests);
        await querySnapshot.forEach((doc)=>{
            console.log(doc.id);
            getRequestInfo(doc.id,i++);
            
        });
        
    
    }catch(e){
        console.log(e);
    }
    console.log("finished");
    
}


async function getRequestInfo(transactionID,index){
    
    const requests = doc(firedb,"transactions",transactionID);
    const docSnap = await getDoc(requests);

    console.log(docSnap.data().serviceName);
    arrayOfRequests.push(docSnap.data());
    console.log(arrayOfRequests);
    
    renderRequests(docSnap.data(),index);
    AssignAllEvents();
    
}

function renderRequests(request,index){
    let rowDiv = document.createElement('div');
    rowDiv.classList.add('row','ps-5','requestDivs');

    let serviceName_Row = document.createElement('div');
    serviceName_Row.classList.add('col-11','border','border-1','rounded','mb-2','row','row-cols-2');
    
    let serviceName_text = document.createElement('p');
    serviceName_text.classList.add('pt-3');
    serviceName_text.innerHTML = "Service name: "+request.serviceName;

    let date_Row = document.createElement('div');
    date_Row.classList.add('col-sm-7');

    let buttonRow = document.createElement('div');
    buttonRow.classList.add('col-sm-5','py-5');

    let buttons = document.createElement('button');
    buttons.classList.add('btn','btn-outline-success','goToDetails');
    buttons.innerHTML = "Confirm Booking";
    buttons.setAttribute("id", "request-"+index);

    let date_text = document.createElement('p');
    date_text.innerHTML = "Date Requested: "+request.RequestedDate;

    let status_text =document.createElement('p');
    status_text.innerHTML = "Status: "+request.confirmStatus;

    date_Row.appendChild(serviceName_text);
    date_Row.appendChild(date_text);
    date_Row.appendChild(status_text);
    buttonRow.appendChild(buttons);


    if (request.confirmStatus != "accepted"){
        buttons.disabled = true;
    }
    

    
    serviceName_Row.appendChild(date_Row);
    serviceName_Row.appendChild(buttonRow);
    
    rowDiv.setAttribute("id", "request-"+index);
    rowDiv.appendChild(serviceName_Row);

    requestList.append(rowDiv);
}

function getServiceIndex(id){
    var indstart = id.indexOf('-')+1;
    var indEnd = id.length;
    return Number(id.substring(indstart,indEnd));
}


function gotoServiceDetails(event){
    var index = getServiceIndex(event.target.id);
    console.log(index);
    localStorage.Request = JSON.stringify(arrayOfRequests[index]);
    window.location = "/ConfirmOrder/confirmservice.html";
}


function AssignAllEvents(){    
    
    const btns = document.getElementsByClassName('requestDivs');
    const goto = document.getElementsByClassName('goToDetails');

    if (btns != null){        
        console.log(btns.length);
        for (let i=0; i <btns.length;i++){
            console.log(goto[i]);
               
            goto[i].addEventListener('click',gotoServiceDetails);                
        }
    }

}
