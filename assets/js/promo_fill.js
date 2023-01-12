import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, child, onValue,get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

var div = document.getElementById('promotions');
var promotions = 0;


function addDivToPromos(test){
    let d = document.createElement("div")
    d.classList.add('card','card-body2','overflow','p-2','mx-3');
    let p = document.createElement("p");
    p.innerHTML=test;
    d.appendChild(p);
    div.appendChild(d);
}

function addAllItemsInPromos(promos){
    promotions = 0;
    div.innerHTML="";
    promos.forEach(element=>{
        addDivToPromos(element.promo);
    })
}

import {firebaseConfig} from './firebase_config.js';
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

        addAllItemsInPromos(p);
    })
}


window.onload = getDataOnce;