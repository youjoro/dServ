import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, ref, child, onValue,get} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";

var div = document.getElementById('promotions');
var promotions = 0;


function addDivToPromos(imglink){
    
    console.log(imglink);
    for (var i = 0;i<imglink.length;i++){
        console.log(imglink[i].imgLink);
        let d = document.createElement("div")
        d.classList.add('card','card-body2','overflow','p-2','mx-3','mw-75');
        let img = document.createElement("img");
        img.src = imglink[i].imgLink;
        img.style.height = "100%";
        d.appendChild(img);
        div.appendChild(d);
    }
    
}



import {firebaseConfig} from '../firebase_config.js';
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase();


function getDataOnce(){
    const dbRef = ref(db);

    get(child(dbRef, "promos"))
    .then((snapshot)=>{
        var p = [];

        snapshot.forEach(childSnapshot =>{
            p.push(childSnapshot.val());
        });
        console.log(p)
        addDivToPromos(p);
    })
}


window.onload = getDataOnce;