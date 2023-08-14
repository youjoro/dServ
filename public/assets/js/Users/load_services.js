 //IMPORTS AND CONFIG

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

import { getDatabase, ref, child, get}
    from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

import {firebaseConfig} from '../firebase_config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);


var searchClick = document.getElementById('searchbtn');
var searchQuery = document.getElementById('searchquery');
var searchCategory = document.getElementById('categorySelected');




function resetSearch(num){
    var products = document.querySelectorAll('.productcard');
    var filter = searchQuery.value.toUpperCase();
    console.log('oi');
    products.remove();  
    for(var i = 0; i<products.length;i++){  
        console.log(products[i]); 
        
        console.log(i);
                 
    };


}


function searchExactServices(products,filter){
    console.log(searchCategory.value,filter);
    
    if (searchCategory.value!=''){

        let category = searchCategory.value;
        let queryDropdown = document.querySelectorAll('.'+category);
        
        
        for(var i=0;i<products.length;i++){

            console.log(queryDropdown[i].textContent,filter,products.length);

            if (queryDropdown[i].textContent.toUpperCase() != filter){
                products[i].style.display = "none";
            }else{
                products[i].style.display = ""; 
            }
            
        }
    }
    

}


function searchFuzzyServices(products,filter){
    console.log(searchCategory.value,filter);
    
    if (searchCategory.value!=''){

        let category = searchCategory.value;
        let queryDropdown = document.querySelectorAll('.'+category);
        
        
        for(var i=0;i<products.length;i++){

            console.log(queryDropdown[i].textContent,filter,products.length);

            if (queryDropdown[i].textContent.toUpperCase().indexOf(filter)>-1 ){
                products[i].style.display = ""; 
            }else{
                products[i].style.display = "none"; 
            }
            
        }
    }
    

}

searchClick.addEventListener('click',function(){
    var products = document.querySelectorAll('.productcard');
    for(var i = 0; i<products.length;i++){  
        console.log(products[i]); 
        products[i].remove();             
    };
    
    
    /*if (searchQuery=="");

    else if(searchCategory.value == "title"){
        resetSearch(1);
        
    }
    else if (searchCategory.value == "category"){
        resetSearch(1);
        
    }else if(searchCategory.value == "location"){
        resetSearch(0);
        
    }*/
});

var OuterDiv = document.getElementById('ServicesDiv');
var arrayOfServices = [];
window.addEventListener('load', getAllServices);    
window.onload = document.getElementById("empty_list").style.display = 'none';
var userID = sessionStorage.getItem("user");

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
        console.log(arrayOfServices);
        document.getElementById('load').remove();
        if (arrayOfServices.length != 0){
            
            //addAllServices();
            
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

