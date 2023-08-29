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

        
    }else{
        
    }
    
})
}
