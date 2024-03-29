 //IMPORTS AND CONFIG

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

import { getDatabase, ref, child, get}
    from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

import {firebaseConfig} from '../firebase_config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);

const cityPicker = document.getElementById("city");
const catPicker = document.getElementById("servCategories")
var searchClick = document.getElementById('searchbtn');
var searchQuery = document.getElementById('autoComplete');
var searchCategory = document.getElementById('categorySelected');


function removeElements(){
    var products = document.querySelectorAll('.productcard');
    for(var i = 0; i<products.length;i++){  
        console.log(products[i],"deleted"); 
        products[i].remove();             
    };

}




searchClick.addEventListener('click',function(){
    
    var count = 0;
    var selectedCategory = "";
    var city = cityPicker.value;
    var serviceType = catPicker.value;
    
    
    removeElements();
    if (searchQuery.value != "") count +=1;
    if (selectedCategory != "") count +=1;
    if (cityPicker != "") count +=1;
    if (searchCategory.value =="Points"){
        addSearchedServicesByTag(searchQuery.value,serviceType,city);
    }else if (searchCategory.value == "ServiceName"){
        addSearchedServicesByName(searchQuery.value,serviceType,city);
    }
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
        console.log(arrayOfServices)
        document.getElementById('load').remove();
        
        if (arrayOfServices.length != 0){
            loadAutoComplete(searchCategory.value,"new")
            addFirstPageServices();
            //createPages(arrayOfServices.length);
            document.getElementById("empty_list").style.display = 'none';
        }else{
            document.getElementById("empty_list").style.display = '';
        }
    })

    
}

var autoCompletedata = []
function loadAutoComplete(searchkey,v){
    const autoCompleteJS = new autoComplete({
        placeHolder: "Search for Services...",
        data: {
            src: arrayOfServices,
            keys:["ServiceName","Points"],
            placeHolder:"Search...",                
            cache: true,
        },
        resultItem: {
            highlight: true
        },
        events: {
            input: {
                selection: (event) => {
                    if (searchkey == "ServiceName"){
                        const selection = event.detail.selection.value.ServiceName;
                        autoCompleteJS.input.value = selection;
                    }else if (searchkey == "Points"){
                        const selection = event.detail.selection.value.Points;
                        autoCompleteJS.input.value = selection;
                    }
                    
                }
            }
        },resultsList: {
            element: (list, data) => {
                if (!data.results.length) {
                    // Create "No Results" message list element
                    const message = document.createElement("div");
                    message.setAttribute("class", "no_result");
                    // Add message text content
                    message.innerHTML = `<span>Found No Results for "${data.query}"</span>`;
                    // Add message list element to the list
                    list.appendChild(message);
                }
            },
            noResults: true,
        }
        
    });


    autoCompletedata=autoCompleteJS
}

searchCategory.addEventListener('change',function(){
    console.log(autoCompletedata.data.keys)
    loadAutoComplete(searchCategory.value)
})


function createPages(num){
    
    var scroller = document.getElementById('scroller');
    var division = num / 10;
    
    for (var i = 1; i <= division; i++){
        let numbered = document.createElement('p');
        console.log(i)
        numbered.textContent = i;
        scroller.append(numbered);
    }
}

function addSearchedServicesByTag(text,cat,city){
    let i = 0;
    console.log(text,cat,city)
    if(text.includes(',')){
        text = text.split(",")
        arrayOfServices.forEach(serv =>{
        for (var i in serv.Points){
            if (serv.Points[i].toLowerCase().includes(text[i].toLowerCase())&& serv.ServiceCategory.includes(cat)  && serv.Location.includes(city) ){
                addAService(serv,i);
                break;
            }else{
                console.log(serv.Points);
                i++;
            }      
        } 
    });
    }else{
        arrayOfServices.forEach(serv =>{
        for (var i in serv.Points){
            if (serv.Points[i].toLowerCase().includes(text.toLowerCase())&& serv.ServiceCategory.includes(cat)  && serv.Location.includes(city) ){
                addAService(serv,i);
                break;
            }else{
                console.log(serv.Points);
                i++;
            }      
        }
        
        
    });
    }
    
    AssignAllEvents();
}

function addSearchedServicesByName(text,cat,city){
    let i = 0;
    console.log(text,cat,city)

    arrayOfServices.forEach(serv =>{
        if (serv.ServiceName.toLowerCase().includes(text.toLowerCase())&& serv.ServiceCategory.includes(cat)  && serv.Location.includes(city) ){
            addAService(serv,i);
        }else{
            console.log(serv.ServiceName);
            i++;
        }
        
    });
    AssignAllEvents();
}

function addFirstPageServices(){
    var query = sessionStorage.getItem("query");
    
    
    if (query != null){
        console.log(query);
        var q = query.split(",");
        console.log(q[q.length-1]);
        if(q[q.length-1] == "ServiceName"){
            addSearchedServicesByName(q[0],q[1],q[2])
        }else{
            var text = q[0]+","+q[1]+","+q[2]
            addSearchedServicesByTag(text,q[3],q[4])
            console.log(q[0])
        }
        sessionStorage.removeItem("query");
    }else{
        console.log(arrayOfServices.length)
        for (var  i=0; i<arrayOfServices.length;i++){
            addAService(arrayOfServices[i], i);
        }
        
        AssignAllEvents();
    }
}


function addAService(service, index){
    console.log(service)
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
    console.log(id)
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

