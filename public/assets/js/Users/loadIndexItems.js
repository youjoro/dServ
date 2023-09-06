 //IMPORTS AND CONFIG

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

import { getDatabase, ref, child, get}
    from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

import {firebaseConfig} from '../firebase_config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
var searchQuery = document.getElementById('autoComplete');
var searchClick = document.getElementById('searchbtn');
const cityPicker = document.getElementById("city");
const catPicker = document.getElementById("servCategories");
const recommDiv = document.getElementById("recommended");

searchClick.addEventListener('click',function(){
    var city = cityPicker.value;
    var serviceType = catPicker.value;
    sessionStorage.query = searchQuery.value+","+serviceType+","+city;
    window.location.href = "/services_listing/services_listing.html";

});

window.addEventListener('load', getAllServices);
var arrayOfServices = [];
function getAllServices(){
const dbref = ref(realdb);
//searchServices();
get(child(dbref, "Services"))
.then((snapshot) => {
    
    snapshot.forEach(serv => {                                
        arrayOfServices.push(serv.val());
        let end = arrayOfServices[arrayOfServices.length - 1];
        end['id']=serv.key;
    });

    
    if (arrayOfServices.length != 0){
        const autoCompleteJS = new autoComplete({
        placeHolder: "Search for Services...",
        data: {
            src: arrayOfServices,
            keys:["ServiceName"],
            placeHolder:"Search...",                
            cache: true,
        },
        resultItem: {
            highlight: true
        },
        events: {
            input: {
                selection: (event) => {
                    const selection = event.detail.selection.value.ServiceName;
                    autoCompleteJS.input.value = selection;
                }
            }
        }
    });

        addSearchedServicesByName("Calamba");
    }else{
        
    }
    
})
}

function addSearchedServicesByName(city){
    let i = 0;
    console.log(city)

    arrayOfServices.forEach(serv =>{
        if (serv.Location.includes(city) ){
            addAService(serv,i);
            console.log(serv.ServiceName);
            i++
        }else{
            console.log(serv.ServiceName);
            i++;
        }
        
    });
    AssignAllEvents();
}


function addAService(service, index){
    let html = 
    `

    <div class="container ps-4"><img src="`+ service.LinksOfImagesArray[0]+`" class="thumb mt-2" id="thumb-`+ index +`"></div>
    <div class="container  p-2">
    <h4 class="title" id="title-`+index+`">`+service.ServiceName+`</h4>
    `+getUl(service.Points)+`
    <div class="row row-cols-2 ps-3">
        <div class ="col-6"><h6 class="category">`+service.ServiceCategory+`</h6></div>
        <div class ="col-5"><h6 class="price">`+service.ServicePrice+`php/hr</h6></div>
    </div>
    
    <h6 class="location text-muted ps-3">`+service.Location+`</h6>
    
    <button class="btn detbtns" id="detbtn-`+index+`">View Details</button>
    </div>
    `


    let newServ = document.createElement('div');
    newServ.classList.add('productcard');
    newServ.innerHTML = html;
    recommDiv.append(newServ);
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
    console.log(id)
    var indstart = id.indexOf('-')+1;
    var indEnd = id.length;
    return Number(id.substring(indstart,indEnd));
}

function gotoServiceDetails(event){
    var index = getServiceIndex(event.target.id);
    localStorage.Service = JSON.stringify(arrayOfServices[index]);
    window.location = "/services_listing/services_details.html";
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
