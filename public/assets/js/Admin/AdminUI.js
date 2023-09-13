/* global bootstrap: false */
(() => {
  'use strict'
  const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl)
  })
})()




import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore , collection, doc,getDoc,getDocs,query, setDoc,writeBatch, runTransaction,deleteDoc    } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js'
import { getDatabase, set, ref, get, child, update, onValue ,remove } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
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


const welcomeDiv = document.getElementById('welcome')
var arrayOfData = []

//verify user




//get data from firebase

async function getDataTable(type){
  var arrayOfData = []
  var dbRef = ref(realdb);
  welcomeDiv.remove()
  await get(child(dbRef,""+type+"/")).then((snapshot) => {
      
    localStorage.removeItem("data")
      snapshot.forEach(user => {                                
          arrayOfData.push(user.val());
          let end = arrayOfData[arrayOfData.length - 1];
          end['id']=user.key;
      });
      console.log(arrayOfData)
      if (arrayOfData.length != 0){
        createMainDiv(arrayOfData,type);
         if(document.getElementById("noData")!=null){
          document.getElementById("noData").remove()
        }
      }else{
        let messageNone = document.createElement('h5')
        messageNone.setAttribute('id',"noData")
        messageNone.innerHTML = "No data"
        itemArea.append(messageNone)
      }

    }).catch((error) => {
    console.error(error);
    });
  
}


async function getDataTableTransactions(type){
  var arrayOfData = []
  welcomeDiv.remove()
  var dbRef = query(collection(firedb,"transactions"));
  localStorage.removeItem("data")
  await getDocs(dbRef).then((snapshot) => {
      

      snapshot.forEach(user => {                                
          arrayOfData.push(user.data());
          let end = arrayOfData[arrayOfData.length - 1];
          end['id']=user.id;
      });
      console.log(arrayOfData)
      if (arrayOfData.length != 0){
        createMainDiv(arrayOfData,type);
        if(document.getElementById("noData")!=null){
          document.getElementById("noData").remove()
        }
        
        
      }else{
        let messageNone = document.createElement('h5')
        messageNone.setAttribute('id',"noData")
        messageNone.innerHTML = "No data"
        itemArea.append(messageNone)
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

var dataType = ""

function createTwoMenus(data,type){
  const div = document.getElementById('menuDiv');

  const menucontainer = document.createElement("div")
  const InfoDIV  = document.createElement("div")

  const topbar = document.createElement("div")
  const topbarTitle = document.createElement("div")
  const topbarDropdown = document.createElement("div")

  const menu1 = document.createElement("div")
  const menu2 = document.createElement("div")

  InfoDIV.setAttribute('id','infoDiv')
  

  topbar.classList.add('row','row-cols-2')
  topbarTitle.classList.add('col')
  topbarDropdown.classList.add('col')
  topbarDropdown.setAttribute('id','topbarDropdown')

  menucontainer.classList.add("row","row-cols-2","w-100","p-2")
  menucontainer.setAttribute('id','tableContainer')

  menu1.classList.add("cols-3","pt-5")
  menu1.setAttribute('id','itemContainer')
  menu2.classList.add("cols-7","mt-5")
  menu2.setAttribute('id','infoContainer')

  const title = document.createElement("h4")
  title.innerHTML = type

  menu2.append(InfoDIV)
  topbarTitle.append(title)
  topbar.append(topbarTitle,topbarDropdown)
  menu1.append(topbar)
  menucontainer.append(menu1,menu2)
  div.append(menucontainer)
  
  var index = 0;
  if (type == "users"){
    
    if(data.length>0){
      addUserSorter()
      for (var i in data){
        loadUsers(data[i],index)
        index++
      }
      dataType = "users"
      arrayOfData = data
      AssignAllEvents()
    }


  }else if (type == "Services"){
    
    if(data.length>0){
      addServiceSorter()
      for (var i in data){
        loadServices(data[i],index)
        index++
      }
      dataType = "services"
      arrayOfData = data
      AssignAllEvents()
    }


  }else if (type == "transactions"){
    
    if(data.length>0){
      addTransactionSorter()
      for (var i in data){
        loadTransactions(data[i],index)
        index++
      }
      dataType = "transactions"
      arrayOfData = data
      AssignAllEvents()
    }


  }

}


function addTransactionSorter(){
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

  usernameButton.innerHTML = "ServiceName"
  typeButton.innerHTML = "Type"
  dateButton.innerHTML = "Date"

  usernameButton.setAttribute('id','ServiceName')
  typeButton.setAttribute('id','servicetype')
  dateButton.setAttribute('id','dateCreated')

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
    <div class="container border rounded rounded-1 p-1 overflow-hidden mt-2 data">
    <h4 class="p-1" id="title-`+index+`">Username: `+data.username+`</h4>
    <div class="row row-cols-2 ps-3">
        <div class ="col-6"><h6 class="category">Address: `+data.address+`</h6></div>
        <div class ="col-5"><h6 class="price">Phone Number: `+data.phone_number+`</h6></div>
    </div>
    
    <h6 class=" ps-3">`+data.user_type+`</h6>
    <h6 class=" ps-3">`+data.last_login+`</h6>
    <button class="btn viewData" id="detbtn-`+index+`">View Details</button>
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
    <div class="container border rounded rounded-1 p-2 overflow-hidden mt-2 data">
    <h4 class="p-1 text-info fw-bold" id="title-`+index+`">`+data.ServiceName+`</h4>  
    <h6 class="ps-3 text-muted">Service Address: `+data.Address+`</h6>
    <h6 class="ps-3 text-muted">Owner ID: `+data.Owner+`</h6>
    <h6 class="ps-3 text-muted">Service Category: `+data.ServiceCategory+`</h6>
    <h6 class="ps-3 text-muted">Service Transaction ID: `+data.TransactionID+`</h6>
    <button class="btn viewData" id="detbtn-`+index+`">View Details</button>
    </div>
    `


    let newServ = document.createElement('div');
    newServ.classList.add('productcard');
    newServ.innerHTML = html;
    const divMenu1 = document.getElementById('itemContainer')
    divMenu1.append(newServ);
}

function loadTransactions(data, index){
  console.log(data)
  let date = data.DateAdded;
  console.log(date);
  let dateFormat = new Date(date.seconds*1000);
  dateFormat=moment(dateFormat).format("YYYY-MM-DD hh:mm A");
    let html = 
    `
    <div class="container border rounded rounded-1 p-2 overflow-hidden mt-2 data">
    <h4 class="p-1 text-info fw-bold" id="title-`+index+`">`+data.serviceName+`</h4>  
    <h6 class="ps-3 text-muted">Appointment Date: `+data.RequestedDate+`</h6>
    <h6 class="ps-3 text-muted">Provider ID: `+data.ServiceOwner+`</h6>
    <h6 class="ps-3 text-muted">Client ID: `+data.ServiceOwner+`</h6>
    <h6 class="ps-3 text-muted">Service Status: `+data.confirmStatus+`</h6>
    <h6 class="ps-3 text-muted">Date Added: `+dateFormat+`</h6>
    <h6 class="ps-3 text-muted">Service Transaction ID: `+data.id+`</h6>
    <button class="btn viewData" id="detbtn-`+index+`">View Details</button>
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

async function getrequestPending(requestdata){
  console.log(requestdata)
  let OuterDiv = document.getElementById('infoDiv') 

  let date = requestdata.DateAdded;
  console.log(date);
  let dateFormat = new Date(date.seconds*1000);

  let html = 
  `
  <div class="container border border-dark my-2 rounded mt-5">
  <h4 class="small font-weight-bold pt-1" >Client Email: `+requestdata.ClientEmail+`</h4>
  <div class="container">
      <h5 class="small font-weight-bold">Client Name: `+requestdata.ClientFirstName+` `+requestdata.ClientLastName+`</h5>
      <h5 class="small font-weight-bold">Contact Number:`+requestdata.ClientMobileNum+` </h5>
      <h5 class="small font-weight-bold">Remarks: `+requestdata.ClientRemarks+`</h5>
      <h5 class="small font-weight-bold">Email: `+requestdata.ownerEmail+`</h5>
      <h5 class="small font-weight-bold">Number of Clientele: `+requestdata.clientNumber+`</h5>
      <h5 class="small font-weight-bold">Requested Date: `+requestdata.RequestedDate+`</h5>
      <h5 class="small font-weight-bold">Date added: `+dateFormat+`</h5>
      <h5 class="small font-weight-bold">Status: `+requestdata.confirmStatus+`</h5>
  </div>
  
  </div>
  
  <button id="removeAppointment" class = "btn btn-warning me-1">Remove Appointment</button>
  `;


  let newServ = document.createElement('div');
  newServ.classList.add('productcard');
  newServ.setAttribute('id','dataContainer')
  newServ.innerHTML = html;
  OuterDiv.append(newServ);

}


async function getServiceDetails(requestdata){
  console.log(requestdata.id)
  let OuterDiv = document.getElementById('infoDiv') 
  var Status = ""
  if (requestdata.verificationStatus != null){
    Status = requestdata.verificationStatus
  }else{
    Status = "not Verified"
  }


  let html = 
  `
  <div class="container border border-dark my-2 rounded mt-5">
  <h4 class="small font-weight-bold pt-1" >Service Name: `+requestdata.ServiceName+`</h4>
  <div class="container">
      <h5 class="small font-weight-bold">Address: `+requestdata.Address+`</h5>
      <h5 class="small font-weight-bold">Location: `+requestdata.Location+`</h5>
      <h5 class="small font-weight-bold">Contact Number:`+requestdata.Phone_Number+` </h5>
      <h5 class="small font-weight-bold">Description: `+requestdata.Description+`</h5>
      <h5 class="small font-weight-bold">Owner ID: `+requestdata.Owner+`</h5>
      <h5 class="small font-weight-bold">Service Category: `+requestdata.ServiceCategory+`</h5>
      <h5 class="small font-weight-bold">Availabilty: `+requestdata.ServiceTimes+`</h5>
      <h5 class="small font-weight-bold">Verification Status: `+Status+`</h5>
  </div>
  
  </div>
  <button id="updateService" class = "btn btn-success me-1">Verify Service</button>
  <button id="setSus" class = "btn btn-warning me-1">Set under Suspicion</button>
  `;


  let newServ = document.createElement('div');
  newServ.classList.add('productcard');
  newServ.setAttribute('id','dataContainer')
  newServ.innerHTML = html;
  OuterDiv.append(newServ)
}


async function getUserDetails(requestdata){
  console.log(requestdata.id)
  let OuterDiv = document.getElementById('infoDiv') 
  var Status = ""
  if (requestdata.verificationStatus != null){
    Status = requestdata.verificationStatus
  }else{
    Status = "not Verified"
  }

  let html = 
  `
  <div class="container border border-dark my-2 rounded mt-5">
  <h4 class="small font-weight-bold pt-1" >User Name: `+requestdata.username+`</h4>
  <div class="container">
      <h5 class="small font-weight-bold">Address: `+requestdata.address+`</h5>
      <h5 class="small font-weight-bold">Email: `+requestdata.email+`</h5>
      <h5 class="small font-weight-bold">Last Login:`+requestdata.last_login+` </h5>
      <h5 class="small font-weight-bold">Contact Number: `+requestdata.Phone_Number+`</h5>
      <h5 class="small font-weight-bold">User Type: `+requestdata.user_type+`</h5>
       <h5 class="small font-weight-bold">Verification Status: `+Status+`</h5>
  </div>
  
  </div>
  <button id="removeUser" class = "btn btn-danger me-1">Remove User</button>
  <button id="updateService" class = "btn btn-success me-1">Verify Provider</button>
  <button id="setSus" class = "btn btn-warning me-1">Set under Suspicion</button>
  <button id="view" class = "btn btn-secondary me-1">View Resume</button>
  `;


  let newServ = document.createElement('div');
  newServ.classList.add('productcard');
  newServ.setAttribute('id','dataContainer')
  newServ.innerHTML = html;
  OuterDiv.append(newServ)
}

function getServiceIndex(id){
  var indstart = id.indexOf('-')+1;
  var indEnd = id.length;
  return Number(id.substring(indstart,indEnd));
}


function gotoRequestDetails(event){

  let OuterDiv = document.getElementById('infoDiv') 
  var containerCheck = document.getElementById("dataContainer")
  OuterDiv.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" }); 
  var index = getServiceIndex(event.target.id);
  
  if(containerCheck != null){
    containerCheck.remove()
  }
  if(dataType == "transactions"){
    getrequestPending(arrayOfData[index])
  }else if(dataType == "services"){

    console.log(arrayOfData[index])
    getServiceDetails(arrayOfData[index])

    let verifyServ = document.getElementById('updateService');
    let sus = document.getElementById('setSus');

    if (verifyServ != null){
      verifyServ.addEventListener('click',function(){
        updateService(arrayOfData[index].Owner,arrayOfData[index].id,"Verified")
      })
      sus.addEventListener('click',function(){
        updateService(arrayOfData[index].Owner,arrayOfData[index].id,"Under Suspicion")
      })
    }
  }else if(dataType == "users"){

    console.log(arrayOfData[index])
    getUserDetails(arrayOfData[index])

    let verifyServ = document.getElementById('updateService');
    let sus = document.getElementById('setSus');
    let view = document.getElementById('view');
    let deleteuser = document.getElementById('removeUser');

    if (verifyServ != null && arrayOfData[index].user_type == "provider"){
      verifyServ.addEventListener('click',function(){
        updateProvider(arrayOfData[index].id,"Verified")
      })
      sus.addEventListener('click',function(){
        updateProvider(arrayOfData[index].id,"Under Suspicion")
      })
      view.addEventListener('click',function(){
        viewResume(arrayOfData[index].id)
      })
      deleteuser.addEventListener('click',function(){
        deleteUser(arrayOfData[index].id)
      })
      
    }else{
      verifyServ.style.display = "none"
      sus.style.display = "none"
      view.style.display = "none"
    }
  }
    
}


function AssignAllEvents(){    
  const divs = document.getElementsByClassName('data');
  const btns = document.getElementsByClassName('viewData');

  if (divs != null){        
      
    for (let i=0; i <divs.length;i++){
      btns[i].addEventListener('click',gotoRequestDetails);                
    }
  }

}


//admin actions

function deleteUser(id){
  console.log(id)
  let a = new Object();
  remove(ref(realdb, 'ProviderProfile/' + id),a).then(async()=>{
    await deleteDoc(doc(firedb, "users", id));
    
    remove(ref(realdb, 'users/' + id  ),a).then(function(){
      alert("User Data Deleted");
      
      location.reload()
    }
      
    )
  }

    
  )


}

function editItem(){

}

function addItem(){

}


function viewResume(data){
  var containerCheck = document.getElementById("dataContainer")
  console.log(data)

  let img = document.createElement('img')
  
  const starCountRef = ref(realdb, 'ProviderProfile/' + data + '/CV');
  onValue(starCountRef, (snapshot) => {
    if(snapshot.exists()){
      img.src = snapshot.val();
      console.log(snapshot.val())
    }
  });
  
  
  img.classList.add('img-thumbnail','mt-2')

  containerCheck.append(img)
}


getAppointments.addEventListener('click',function(){
  const div = document.getElementById('menuDiv');
  if (div!=null){
    div.remove();
  }
  getDataTableTransactions("transactions")
});


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





function updateService(id,servID,message){
  console.log(id,servID)
  let a = new Object();
  a["verificationStatus"] = message
  update(ref(realdb, 'Services/' + servID),a).then(
    update(ref(realdb, 'ProviderProfile/' + id +'/Services/'+ servID ),a).then(function(){
      alert("Service Updated");
      location.reload()
    }
      
    )
  )

}

function updateProvider(id,message){
  console.log(id)
  let a = new Object();
  a["verificationStatus"] = message
  update(ref(realdb, 'ProviderProfile/' + id),a).then(
    update(ref(realdb, 'users/' + id  ),a).then(function(){
      alert("Service Updated");
      location.reload()
    }
      
    )
  )

}