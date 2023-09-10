 //IMPORTS AND CONFIG

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";

import { getDatabase, ref, child, get}
    from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import { getFirestore , collection, doc,getDoc,getDocs,query,orderBy,limitToLast } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js'
import {firebaseConfig} from '../firebase_config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const firedb = getFirestore(app);
var searchQuery = document.getElementById('autoComplete');
var searchClick = document.getElementById('searchbtn');
const cityPicker = document.getElementById("city");
const catPicker = document.getElementById("servCategories");
const recommDiv = document.getElementById("recommended");
const searchCategory = document.getElementById('categorySelected');

var user = sessionStorage.getItem("user")
searchClick.addEventListener('click',function(){
    var city = cityPicker.value;
    var serviceType = catPicker.value;
    sessionStorage.query = searchQuery.value+","+serviceType+","+city+","+searchCategory.value;
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
        loadAutoComplete(searchCategory.value)
        findLatestOrder()
    }else{
        
    }
    
})
}


async function findLatestOrder(){
    
    const latestFinishedOrders = query(collection(firedb,"users",user,"finished"), orderBy('DateAdded'), limitToLast(1));
    const latestOrder = await getDocs(latestFinishedOrders);
    console.log(latestOrder)
    latestOrder.forEach((doc)=>{
        console.log(doc)
       getOrderDetails(doc.data().RequestID)
       
    })


}

async function getOrderDetails(id){
    console.log(id)
    const requests = doc(firedb,"finished",id);

    const querySnapshot = await getDoc(requests);
    
    console.log(querySnapshot.data().ServiceID)
    for (var i in arrayOfServices){
        if(arrayOfServices[i].id == querySnapshot.data().ServiceID){
            console.log(arrayOfServices[i].key)
            addSearchedServicesByName(arrayOfServices[i].Location);
        }
        
    }
    

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


function addSearchedServicesByName(city){
    let i = 0;
    console.log(city)
    document.getElementById("recommLocation").innerHTML = "Services in "+city;
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
