var map = L.map('map').setView([14.23307, 121.176], 12);
var popup = L.popup();
let marker;
let servicemarker;
var layerGroup = L.layerGroup();
let count = 0;

//map.on('click', onMapClick);

function renderMarkers(coords,name,add){
    let details = name+"\n"+add
    popup
        .setLatLng(coords)
        .setContent(details)
        .openOn(map);
    servicemarker = new L.marker(coords).addTo(map)
        .bindPopup(details,{autoClose: false})
        .openPopup();
    layerGroup.addLayer(servicemarker);
    map.addLayer(layerGroup);

}
    
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 23,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

navigator.geolocation.getCurrentPosition(success,error);



var curr_Loc_Icon = L.icon({
    iconUrl:'https://cdn-icons-png.flaticon.com/512/5693/5693831.png',
    iconSize: [30, 30]
});


function success(pos){
    const lat = pos.coords.latitude;
    const long = pos.coords.longitude;
    

    if(marker){
        map.removeLayer(marker); 
        
    }

    marker = L.marker([lat,long],{icon: curr_Loc_Icon}).addTo(map)
    .bindPopup("Your Location",{autoClose: false}).openPopup();
    

    map.setView([lat,long]);
}

function error(err){

    if (err.code === 1 ){
        alert("Please allow geolocation access");
    } else {
        alert("Cannot get current location");
    }
}


//IMPORTS AND CONFIG

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

import { getDatabase, ref,  get,equalTo,orderByChild,query}
    from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

import {firebaseConfig} from '../firebase_config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const city = document.getElementById('lookForServices');
let citylist = document.getElementById('city');
var arrayOfServices = [];
var arrayOfServicesLocations = [];


function getAllServicesLocation(){
    const products = document.querySelectorAll('.productcard');
    for(var i = 0; i<products.length;i++){  
            products[i].remove(); 
            console.log(products[i]); 
            
        };
    const q = query(ref(realdb,"Services"),orderByChild ("Location"),equalTo(citylist.value));
    getAllServices();

    
    if(map.hasLayer(layerGroup)){
        map.removeLayer(layerGroup); 
        layerGroup = L.layerGroup();
    }
    
    
    get(q)
    .then((snapshot) => {
        

        
        snapshot.forEach(serv => {
            arrayOfServicesLocations.push(serv.val());
        });
        
        if (arrayOfServicesLocations.length != 0){
            
            addAllServicesLocation();

            
            

                        
        }else{  
            alert("No Services found in that City");
        }
        arrayOfServicesLocations = [];
        
    })
}

function addAllServicesLocation(){
    let i = 0;
    arrayOfServicesLocations.forEach(serv =>{
        addAServiceLocation(serv);
        countcall+=1;
    });
    
}
let countcall = 0;
function addAServiceLocation(serv){
    
    let coords = serv.location_data.toString().split(',');
    renderMarkers(coords,serv.ServiceName,serv.Address);
}
    

city.addEventListener('click',function(){
    getAllServicesLocation();
});







var OuterDiv = document.getElementById('ServicesDiv');
//Product Card
function getAllServices(){
    arrayOfServices = []    
    const q = query(ref(realdb,"Services"),orderByChild ("Location"),equalTo(citylist.value));
    let cities = document.querySelectorAll('.location');

    


    get(q)
    .then((snapshot) => {
        snapshot.forEach(serv => {
            arrayOfServices.push(serv.val());
        });
        
        if (arrayOfServices.length != 0){
            
            addAllServices();
            
            
        }
          
    })
}

function addAllServices(){
    let i = 0;
    console.log(arrayOfServices)
    arrayOfServices.forEach(serv =>{
        addAService(serv, i++);
        
    });
    AssignAllEvents();
}


function addAService(service, index){
    let html = 
    `

    <div class="container"><img src="`+ service.LinksOfImagesArray[0]+`" class="thumb mt-2" id="thumb-`+ index +`"></div>
    <div class="container  p-2">
    <h4 class="title" id="title-`+index+`">`+service.ServiceName+`</h4>
    `+getUl(service.Points)+`
    <div class="row row-cols-2">
        <div class ="col-6"><h6 class="category">`+service.ServiceCategory+`</h6></div>
        <div class ="col-5"><h6 class="price">`+service.ServicePrice+`php/hr</h6></div>
    </div>
    
    <h6 class="location text-muted">`+service.Location+`</h6>
    
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
        li.classList.add('list');
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
