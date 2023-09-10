let service = null;

const chatProvider = document.getElementById('chatProvider');

chatProvider.disabled = true;


function checkSession(){
  
var sessionData=sessionStorage.getItem("sessionCheck");
var verified = sessionStorage.getItem('verified');
console.log(sessionData);
if(sessionData == "loggedIn"){
  if(verified == "false"){
    document.getElementById("bookButton").style.display="none";
    document.getElementById("signupbutton").style.display="block";
    document.getElementById("messageButton").innerHTML = "Verify Email First";
    document.getElementById("messageButton").href="#";
  }else{
      document.getElementById("bookButton").style.display="block";
      document.getElementById("signupbutton").style.display="none";
  }
    
}

}


window.onload = function(){
    checkSession();    
    service = localStorage.Service;
    
    if (service){
      
        service = JSON.parse(service);
        loadServiceProviderProfile();
            
    }
}



function addSelected(index,rating){
  let starRatings= ``

    if(rating == "5"){
      starRatings = `
          <div class="rating" id="ratingDiv-`+index+`"> 
              <label for="5">★</label> 
              <label for="4">★</label> 
              <label for="3">★</label> 
              <label for="2">★</label> 
              <label for="1">★</label>
          </div>
        `
    }else if(rating == "4"){
      starRatings = `
          <div class="rating" id="ratingDiv-`+index+`"> 
              <label for="5">☆</label> 
              <label for="4">★</label> 
              <label for="3">★</label> 
              <label for="2">★</label> 
              <label for="1">★</label>
          </div>
        `
    }else if(rating == "3"){
      starRatings = `
          <div class="rating" id="ratingDiv-`+index+`"> 
              <label for="5">☆</label> 
              <label for="4">☆</label> 
              <label for="3">★</label> 
              <label for="2">★</label> 
              <label for="1">★</label>
          </div>
        `
    }else if(rating == "2"){
      starRatings = `
          <div class="rating" id="ratingDiv-`+index+`"> 
              <label for="5">☆</label> 
              <label for="4">☆</label> 
              <label for="3">☆</label> 
              <label for="2">★</label> 
              <label for="1">★</label>
          </div>
        `
    }else if(rating == "1"){
      starRatings = `
          <div class="rating" id="ratingDiv-`+index+`"> 
              <label for="5">☆</label> 
              <label for="4">☆</label> 
              <label for="3">☆</label> 
              <label for="2">☆</label> 
              <label for="1">★</label>
          </div>
        `
    }
    return starRatings
}




import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getDatabase,  ref, get,child} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import {   
  getFirestore,
  collection,
  query,
  setDoc,
  doc,
  getDoc 
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
import {firebaseConfig} from '../firebase_config.js'; 

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const auth = getAuth(app);
// Initialize firestore
const firestoredb = getFirestore(app); 

var userID = sessionStorage.getItem("user");
var username='';
var fullname ='';

let docRef = '';



async function addChatID(chatID){
  var providerID = service.TransactionID;
  sessionStorage.providerID = providerID;
  sessionStorage.providerfireID = service.TransactionID;
  try {
      let username = await getName(userID);
      console.log(username);
      const date = new Date();
      console.log("convo started");


      const collectionRef = collection(firestoredb, "chat");
      docRef = doc(collectionRef,chatID); 
      const docID = docRef.id;
      await setDoc(docRef, {
          clientID:userID,
          clientUsername:username,            
          clientRTDB_ID:sessionStorage.getItem("user"),
          serviceProviderName:fullname,
          transactionProviderID:service.TransactionID,
          serviceProviderImgLink:providerIMGLink,
          dateStarted:date
      });
    setUserChatID(docID);
  } catch (error) {
    console.log(error);

  }

}


async function setUserChatID(docRef){
  
  try{
    const date = new Date();
    await clientChatID(date,docRef);
    await providertChatID(date,docRef);
    
  }catch(error){
    console.log(error);
  }finally{
    sendToChat();
  }
  
}



async function providertChatID(date,docRef){
  try{
    await setDoc(doc(firestoredb, "users",service.TransactionID,"chat",docRef), {
      chatID:docRef,
      dateStarted:date
    });
  }catch(error){
    console.log(error);
  }

}  

async function clientChatID(date,docRef){
  try{
    await setDoc(doc(firestoredb, "users",userID,"chat",docRef), {
      chatID:docRef,
      dateStarted:date
    });
  }catch(error){
    console.log(error);
  }

}  

async function getName(ID){
    let username = '';
    try{

        //Retrieve profileImg
        const q = query(doc(firestoredb, "users",ID));
        const querySnapshot = await getDoc(q);

        username = querySnapshot.data().username;
    }catch(e){
        console.log(e);
    }
    console.log(username);
    return username;
}

//check fireStore Auth
const monitorFireAuth = async() =>{
  
  
      onAuthStateChanged(auth,user=>{
        if(user){                  

          sessionStorage.verified = user.emailVerified;          
          let chatID = service.TransactionID+"-"+userID;
          sessionStorage.chatID = chatID;
          addChatID(chatID);
   
        }else{
          console.log("no user");          

        }
      });
  }






async function loadServiceProviderProfile(){
    var providerID = service.TransactionID;
    
    getProfileIMG(providerID);
    getProfileDetails(providerID);

}




let profileIMG = document.getElementById("serviceProviderIMG");
let profileName = document.getElementById('providerName');
let profileNumber = document.getElementById('providerNumber');
let profileDesc = document.getElementById('selfDesc');

let providerCity = document.getElementById('city');
let providerBrand = document.getElementById('brandname');
let providerEmail = document.getElementById('contactEmail');
let providerTimes = document.getElementById('times');
let providerServices = document.getElementById('Services');

var servicesList = []

function getProfileDetails(userID){

  
  var dbRef = ref(realdb);
  
    get(child(dbRef,"ProviderProfile/"+userID)).then((snapshot)=>{
      
      if(snapshot.exists()){
        fullname = snapshot.val().FirstName +" "+snapshot.val().lastName;
        profileName.innerHTML = fullname;
        profileNumber.innerHTML = snapshot.val().phoneNumber;
        profileDesc.innerHTML = snapshot.val().selfDescription;
        document.getElementById('titleTop').innerHTML = fullname+"'s Profile";
        providerCity.innerHTML = snapshot.val().city;
        providerBrand.innerHTML = snapshot.val().brand_name;
        providerEmail.innerHTML = snapshot.val().businessEmail;
        providerTimes.innerHTML = snapshot.val().availability;
        chatProvider.disabled =false;
        for (var serv in snapshot.val().Services){
          servicesList.push(serv)
        } 
        getServices(servicesList)
        if(snapshot.val().verificationStatus != null){
          document.getElementById('verificationStatus').innerHTML = service.verificationStatus;
        }else{
          document.getElementById('verificationStatus').innerHTML = "Under verification";
        }
      }else{        
        profileIMG.src = "/assets/img/profile_icon.png";
        chatProvider.disabled = true;
      }
    });
  

}


var OuterDiv = document.getElementById('ServicesDiv');
var arrayOfServices = [];

async function getServices(servicesList){
  const dbref = ref(realdb);
  for (var  i = 0; i<servicesList.length; i++){
    await get(child(dbref, "Services/"+servicesList[i]))
      .then((snapshot) => {
        arrayOfServices.push(snapshot.val());
        let end = arrayOfServices[arrayOfServices.length - 1];
        end['id']=snapshot.key;
        console.log(arrayOfServices)
      })
  }
  loadAllServices()
  
}

function loadAllServices(){
  for (var i = 0; i<arrayOfServices.length;i++){
    addAService(arrayOfServices[i], i);
  }
  console.log(arrayOfServices)
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


 var providerIMGLink ='';
function getProfileIMG(userID){


  var dbRef = ref(realdb);
  
    get(child(dbRef,"users/"+userID+"/profilePic")).then((snapshot)=>{
      
      if(snapshot.exists()){
        profileIMG.src = snapshot.val().imgLink;
        providerIMGLink = snapshot.val().imgLink;
        
      }else{        
        profileIMG.src = "/assets/img/profile_icon.png";
      }
    });


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

function sendToChat(){
    window.location.replace("http://127.0.0.1:5500/chat/chat.html");
}

chatProvider.addEventListener('click',monitorFireAuth);