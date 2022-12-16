var div = document.getElementById('promotions');
var promotions = 0;


function addDivToPromos(test){
    let d = document.createElement("div .card")

    d.innerHTML=test;

    div.appendChild(d);
}

function addAllItemsInPromos(promos){
    promotions = 0;
    div.innerHTML="";
    promos.forEach(element=>{
        addDivToPromos(element.promo);
    })
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, child, onValue,get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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