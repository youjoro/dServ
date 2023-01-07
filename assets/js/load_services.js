//IMPORTS AND CONFIG

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { getDatabase, ref, set, child, get}
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const firebaseConfig = {
apiKey: "AIzaSyDcb9FH5Hcik94Ucxih4atoG0dNApeahA4",
authDomain: "dserv-26a9a.firebaseapp.com",
databaseURL: "https://dserv-26a9a-default-rtdb.firebaseio.com",
projectId: "dserv-26a9a",
storageBucket: "dserv-26a9a.appspot.com",
messagingSenderId: "292011413224",
appId: "1:292011413224:web:f4b3ec12cc9f3be49fc35d",
measurementId: "G-L5FNF3XE6S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);

var OuterDiv = document.getElementById('ServicesDiv');
var arrayOfServices = [];
window.addEventListener('load', getAllServices);    


function getAllServices(){
    const dbref = ref(realdb);

    get(child(dbref, "Services"))
    .then((snapshot) => {
        snapshot.forEach(serv => {
            arrayOfServices.push(serv.val());
        });
        addAllServices();
    })
}

function addAllServices(){
    let i = 0;
    arrayOfServices.forEach(serv =>{
        addAService(serv, i++);
    });
    AssignAllEvents();
}


function addAService(service, index){
    let html = 
    `
    <img src="`+ service.LinksOfImagesArray[0]+`" class="thumb mt-2" id="thumb-`+ index +`">
    <p class="title" id="title-`+index+`">`+service.ServiceName+`</p>
    `+getUl(service.Points)+`
    <h5 class="price">`+service.ServicePrice+`</h5>
    <button class="btn detbtns" id="detbtn-`+index+`">View Details</button>
    `


    let newServ = document.createElement('div');
    newServ.classList.add('productcard');
    newServ.innerHTML = html;
    OuterDiv.append(newServ);
}


function getUl(array){
    let ul = document.createElement('ul');
    ul.classList.add('points');

    array.forEach(element =>{
        let li = document.createElement('li');
        li.innerText = element;
        ul.append(li);
    });
    return ul.outerHTML;
}

function getServiceIndex(id){
    var indstart = id.indexOf('-')+1;
    var indEnd = id.length;
    return Number(id.substring(indstart,indEnd));
}

function gotoServiceDetails(event){
    var index = getServiceIndex(event.target.id);
    localStorage.Service = JSON.stringify(arrayOfServices[index]);
    window.location = "services_details.html";
}

function AssignAllEvents(method){
    var btns = document.getElementsByClassName('detbtns');
    var titles = document.getElementsByClassName('title');
    var thumbs = document.getElementsByClassName('thumb');

    for (let i=0; i <btns.length;i++){
        btns[i].addEventListener('click',gotoServiceDetails);
        titles[i].addEventListener('click',gotoServiceDetails);
        thumbs[i].addEventListener('click',gotoServiceDetails);
    }
}