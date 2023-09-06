/* global bootstrap: false */
(() => {
  'use strict'
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl)
  })
})()




import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore , collection, doc,getDoc,getDocs,query, setDoc,writeBatch, runTransaction   } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js'
import { getDatabase, set, ref, get, child } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import {firebaseConfig} from "../firebase_config.js";
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const firedb = getFirestore(app);
const addbatch = writeBatch(firedb);
const deletebatch = writeBatch(firedb);

const getServices = document.getElementById('loadServices');
const getUsers = document.getElementById('loadUsers');
const getAppointments = document.getElementById('loadAppointments');
const loadDashboard = document.getElementById('loadDashboard');
const itemArea = document.getElementById("area");



//verify user




//get data from firebase

  async function getDataTable(type){
    var arrayOfUsers = []
    var dbRef = ref(realdb);
    
    await get(child(dbRef,""+type+"/")).then((snapshot) => {
        

        snapshot.forEach(user => {                                
            arrayOfUsers.push(user.val());
            let end = arrayOfUsers[arrayOfUsers.length - 1];
            end['id']=user.key;
        });
        console.log(arrayOfUsers)
        if (arrayOfUsers.length != 0){
          createMainDiv(arrayOfUsers,type);
        }

      }).catch((error) => {
      console.error(error);
      });
    
  }


function getAppointmentData(){

}

function getMetrics(){

}



//create elements

function createMainDiv(data,type){
  console.log(data)
  var i = 0;
  for (var item in data){
    console.log(data[item].username)
    i++;
  }



  const mainDiv = document.createElement("div");
  mainDiv.setAttribute('id','menuDiv');
  mainDiv.classList.add("w-100");
  itemArea.append(mainDiv)
  createTwoMenus(data,type)
  
}


function createTwoMenus(data,type){
  const div = document.getElementById('menuDiv');

  const menucontainer = document.createElement("div")

  const topbar = document.createElement("div")
  const topbarTitle = document.createElement("div")
  const topbarDropdown = document.createElement("div")

  const menu1 = document.createElement("div")
  const menu2 = document.createElement("div")

  topbar.classList.add('row','row-cols-2')
  topbarTitle.classList.add('col')
  topbarDropdown.classList.add('col')
  topbarDropdown.setAttribute('id','topbarDropdown')

  menucontainer.classList.add("row","row-cols-2","w-100","p-2")
  menucontainer.setAttribute('id','tableContainer')

  menu1.classList.add("cols-3","pt-5")
  menu1.setAttribute('id','itemContainer')
  menu2.classList.add("cols-7")
  menu2.setAttribute('id','infoContainer')

  const title = document.createElement("h4")
  title.innerHTML = type

  
  topbarTitle.append(title)
  topbar.append(topbarTitle,topbarDropdown)
  menu1.append(topbar)
  menucontainer.append(menu1,menu2)
  div.append(menucontainer)
  
  var index = 0;
  if (type == "users"){
    addUserSorter()
    for (var i in data){
      loadUsers(data[i],index)
      index++
    }
  }else if (type == "Services"){
    addServiceSorter()
    for (var i in data){
      loadServices(data[i],index)
      index++
    }
  }

}

function addUserSorter(){
  const container = document.getElementById("topbarDropdown");

  const dropdownDiv = document.createElement("div")
  const dropdownButton = document.createElement("button")
  const dropdownUL = document.createElement('ul')

  const usernameChoice = document.createElement('li') 
  const typeChoice = document.createElement('li')
  const dateChoice = document.createElement('li')

  const usernameButton = document.createElement('a') 
  const typeButton = document.createElement('a')
  const dateButton = document.createElement('a')

  usernameButton.innerHTML = "Username"
  typeButton.innerHTML = "Type"
  dateButton.innerHTML = "Date"

  usernameButton.setAttribute('id','username')
  typeButton.setAttribute('id','usertype')
  dateButton.setAttribute('id','dateUserCreated')

  usernameButton.classList.add('dropdown-item')
  typeButton.classList.add('dropdown-item')
  dateButton.classList.add('dropdown-item')

  usernameChoice.append(usernameButton)
  typeChoice.append(typeButton)
  dateChoice.append(dateButton)
  
 

  dropdownDiv.classList.add('dropdown')

  dropdownButton.classList.add('btn', 'btn-secondary','dropdown-toggle')
  dropdownButton.setAttribute('type','button')
  dropdownButton.setAttribute('data-bs-toggle','dropdown')
  dropdownButton.innerHTML = "Sort By"

  dropdownUL.classList.add('dropdown-menu')
  dropdownUL.append(usernameChoice,typeChoice,dateChoice)

  dropdownDiv.append(dropdownButton,dropdownUL)
  container.append(dropdownDiv)

}

function addServiceSorter(){
  const container = document.getElementById("topbarDropdown");

  const dropdownDiv = document.createElement("div")
  const dropdownButton = document.createElement("button")
  const dropdownUL = document.createElement('ul')

  const serviceChoice = document.createElement('li') 
  const nameChoice = document.createElement('li')
  const dateChoice = document.createElement('li')

  const serviceButton = document.createElement('a') 
  const nameButton = document.createElement('a')
  const dateButton = document.createElement('a')

  serviceButton.innerHTML = "Service"
  nameButton.innerHTML = "Name"
  dateButton.innerHTML = "Date"

  serviceButton.classList.add('dropdown-item')
  nameButton.classList.add('dropdown-item')
  dateButton.classList.add('dropdown-item')

  serviceChoice.append(serviceButton)
  nameChoice.append(nameButton)
  dateChoice.append(dateButton)
  
 

  dropdownDiv.classList.add('dropdown')

  dropdownButton.classList.add('btn', 'btn-secondary','dropdown-toggle')
  dropdownButton.setAttribute('type','button')
  dropdownButton.setAttribute('data-bs-toggle','dropdown')
  dropdownButton.innerHTML = "Sort By"

  dropdownUL.classList.add('dropdown-menu')
  dropdownUL.append(serviceChoice,nameChoice,dateChoice)

  dropdownDiv.append(dropdownButton,dropdownUL)
  container.append(dropdownDiv)

}


function loadUsers(data, index){
  console.log(data)
    let html = 
    `
    <div class="container border rounded rounded-1 p-1 overflow-hidden mt-2">
    <h4 class="p-1" id="title-`+index+`">Username: `+data.username+`</h4>
    <div class="row row-cols-2 ps-3">
        <div class ="col-6"><h6 class="category">Address: `+data.address+`</h6></div>
        <div class ="col-5"><h6 class="price">Phone Number: `+data.phone_number+`</h6></div>
    </div>
    
    <h6 class=" ps-3">`+data.user_type+`</h6>
    <h6 class=" ps-3">`+data.last_login+`</h6>
    <button class="btn " id="detbtn-`+index+`">View Details</button>
    </div>
    `


    let newServ = document.createElement('div');
    newServ.classList.add('productcard');
    newServ.innerHTML = html;
    const divMenu1 = document.getElementById('itemContainer')
    divMenu1.append(newServ);
}

function loadServices(data, index){
  console.log(data)
    let html = 
    `
    <div class="container border rounded rounded-1 p-2 overflow-hidden mt-2">
    <h4 class="p-1 text-info fw-bold" id="title-`+index+`">`+data.ServiceName+`</h4>  
    <h6 class="ps-3 text-muted">Service Address: `+data.Address+`</h6>
    <h6 class="ps-3 text-muted">Owner ID: `+data.Owner+`</h6>
    <h6 class="ps-3 text-muted">Service Category: `+data.ServiceCategory+`</h6>
    <h6 class="ps-3 text-muted">Service Transaction ID: `+data.TransactionID+`</h6>
    <button class="btn " id="detbtn-`+index+`">View Details</button>
    </div>
    `


    let newServ = document.createElement('div');
    newServ.classList.add('productcard');
    newServ.innerHTML = html;
    const divMenu1 = document.getElementById('itemContainer')
    divMenu1.append(newServ);
}

function createDashboardUI(){

}





//admin actions

function removeItem(){

}

function editItem(){

}

function addItem(){

}




getUsers.addEventListener('click',function(){
  const div = document.getElementById('menuDiv');
  if (div!=null){
    div.remove();
  }
  getDataTable("users")
});
getServices.addEventListener('click',function(){
  const div = document.getElementById('menuDiv');
  if (div!=null){
    div.remove();
  }
  getDataTable("Services")
});