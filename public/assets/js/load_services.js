//IMPORTS AND CONFIG

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { getDatabase, ref, set, child, get}
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

import {firebaseConfig} from './firebase_config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);


var searchClick = document.getElementById('searchbtn');
var searchQuery = document.getElementById('searchquery');
var searchCategory = document.getElementById('categorySelected');





function searchServices(){
    var filter = searchQuery.value.toUpperCase();
    var categories = [];
    var cats=document.querySelectorAll('.category');

    for(var i=0;i<cats.length;i++){
        categories.push(cats[i].textContent);
        
    }
}


var OuterDiv = document.getElementById('ServicesDiv');
var arrayOfServices = [];
window.addEventListener('load', getAllServices);    
window.onload = document.getElementById("empty_list").style.display = 'none';
var userID = sessionStorage.getItem("user");

function getAllServices(){
    const dbref = ref(realdb);

    get(child(dbref, "Services"))
    .then((snapshot) => {
        snapshot.forEach(serv => {
            arrayOfServices.push(serv.val());
        });
        document.getElementById('load').remove();
        if (arrayOfServices.length != 0){
            
            addAllServices();
            
            document.getElementById("empty_list").style.display = 'none';
        }else{
            document.getElementById("empty_list").style.display = '';
        }
        
    })
}

function addAllServices(){
    let i = 0;
    arrayOfServices.forEach(serv =>{
        console.log(serv.ServiceName);
        addAService(serv, i++);
    });
    AssignAllEvents();
}


function addAService(service, index){
    let html = 
    `

    <div class="container"><img src="`+ service.LinksOfImagesArray[0]+`" class="thumb mt-2" id="thumb-`+ index +`"></div>
    <div class="container shadow-sm border border-3 p-2">
    <h3 class="title" id="title-`+index+`">`+service.ServiceName+`</h3>
    `+getUl(service.Points)+`
    <h6 class="category">`+service.ServiceCategory+`</h6>
    <h6 class="location">Located in `+service.Location+`</h6>
    <h6 class="price">Base Price at `+service.ServicePrice+`php/hr</h6>
    <button class="btn detbtns" id="detbtn-`+index+`">View Details</button>
    </div>
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

