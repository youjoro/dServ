import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, ref, child, get }
from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import {firebaseConfig} from "../firebase_config.js";
import { getFirestore , collection, doc,getDoc,getDocs,query,orderBy,limitToLast } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js'

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const firedb = getFirestore(app);

const username = document.getElementById('username');
const fullname = document.getElementById('userFullname')
const firstName_text = document.getElementById('firstName');
const lastName_text = document.getElementById('lastName');
const address = document.getElementById('address');
const phoneNumber = document.getElementById('phoneNumber');
const email = document.getElementById('email');
const inbox = document.getElementById('inbox');

const requestList = document.getElementById('requestsList');
const finishedJobs = document.getElementById('finishedJobs')

var arrayOfRequests =[];



var userID = sessionStorage.getItem('user');
window.onload = loadProfileData(userID);
window.onload = loadChat();


if (requestList != null){
    window.onload = loadFinished(userID);
    window.onload = loadRequests(userID);
}

function loadProfileData(userID){
    var dbRef = ref(realdb);
    try{
        get(child(dbRef,"users/"+userID)).then((snapshot)=>{
        
        if(snapshot.exists()){
            if (firstName_text != null){
                firstName_text.innerHTML = snapshot.val().firstName;
            }
            if (lastName_text != null){
                lastName_text.innerHTML = snapshot.val().lastName;
            }
            if (fullname != null){
                fullname.innerHTML = snapshot.val().firstName+" "+snapshot.val().lastName;
            }
            if (phoneNumber != null){
                phoneNumber.innerHTML = snapshot.val().phone_number;
            }
            email.innerHTML = snapshot.val().email;
            address.innerHTML = snapshot.val().address;
            username.innerHTML = snapshot.val().username;
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

async function loadFinished(userID){
    console.log(userID)
    const requests = collection(firedb,"users",userID,"finished");

    const querySnapshot = await getDocs(requests);
    try{
    querySnapshot.forEach((doc)=>{
        console.log(doc.id);
        renderJobs(doc.id,doc.data());
    })  
    }catch(e){
        console.log(e);
    }  
}

async function renderJobs(id,data){
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


    const getName = await getServiceName(data.RequestID);

    let time = data.DateAdded;
    let dateFormat = new Date(time.seconds*1000);
    dateFormat=moment(dateFormat).format("YYYY-MM-DD hh:mm A");

    messagetext.innerHTML = getName;
    date.innerHTML = "Appointment Date:"+data.RequestedDate +"<br>Date Booked: "+ dateFormat;

    console.log(data.RequestedDate);

    messageRow.appendChild(messagetext);
    messageRow.appendChild(date);
    li.appendChild(messageRow);
    li.appendChild(dateRow);

    finishedJobs.append(li);
}

async function getServiceName(id){
    const finishedJobs = doc(firedb,"finished",id);

    const docSnap = await getDoc(finishedJobs);

    if (docSnap.exists){
        return docSnap.data().serviceName
    }
}



async function loadRequests(userID) {
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

    const requestData = docSnap.data()
    requestData['id']=transactionID;
    arrayOfRequests.push(requestData);
    console.log(arrayOfRequests);

    renderRequests(requestData,index);
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
    let finishButton = document.createElement('button');
    buttons.classList.add('btn','btn-outline-success','mx-1','goToDetails');
    buttons.innerHTML = "View Receipt";
    buttons.setAttribute("id", "request-"+index);

    finishButton.classList.add('btn','btn-outline-success','mx-1','mt-1','Finish');
    finishButton.innerHTML = "Finalize Service";
    finishButton.setAttribute("id", "finalize-"+index);


    let date_text = document.createElement('p');
    date_text.innerHTML = "Date Requested: "+request.RequestedDate;

    let status_text =document.createElement('p');
    status_text.innerHTML = "Status: "+request.confirmStatus;

    date_Row.appendChild(serviceName_text);
    date_Row.appendChild(date_text);
    date_Row.appendChild(status_text);
    buttonRow.appendChild(buttons);
    buttonRow.appendChild(finishButton);

    if (request.confirmStatus != "accepted" && request.confirmStatus != "finished"){
        buttons.disabled = true;
    }



    serviceName_Row.appendChild(date_Row);
    serviceName_Row.appendChild(buttonRow);

    rowDiv.setAttribute("id", "request-"+index);
    rowDiv.appendChild(serviceName_Row);

    requestList.append(rowDiv);
    checkDate(index, request.RequestedDate,request.confirmStatus)
}


function checkDate(i,date,status){
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = mm + '/' + dd + '/' + yyyy;

    console.log(formattedToday)
    let button = document.getElementById('finalize-'+i)

    if (formattedToday !=date ){
        button.remove()
    }else if(formattedToday == date && status != "accepted" && status != "finished"){
        button.disabled = true
    }

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
    window.location = "/AppointmentDetails/receipt.html";
}


function finishJob(event){
    var index = getServiceIndex(event.target.id);
    console.log(index);
    localStorage.Request = JSON.stringify(arrayOfRequests[index]);
    window.location = "/FinishOrder/complete_transaction.html";
}



function AssignAllEvents(){    

    const btns = document.getElementsByClassName('requestDivs');
    const goto = document.getElementsByClassName('goToDetails');
    const finalize = document.getElementsByClassName('Finish');

    if (btns != null){        
        console.log(btns.length);
        for (let i=0; i <btns.length;i++){
            console.log(goto[i]);

            goto[i].addEventListener('click',gotoServiceDetails);                
        }
        for (let z = 0; z<finalize.length;z++){
            finalize[z].addEventListener('click', finishJob)
        }
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

