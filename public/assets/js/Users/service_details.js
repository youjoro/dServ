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
else{
    document.getElementById("bookButton").style.display="none";
    document.getElementById("signupbutton").style.display="block";
    
}
}


window.onload = function(){
    checkSession();    
    service = localStorage.Service;
    
    if (service){
      
        service = JSON.parse(service);
        loadServiceProviderProfile();
        LoadService();
            
    }
}
/*
window.addEventListener("beforeunload", function(e){
    if(this.location.reload){
        
    }
    else{
        this.localStorage.clear();
    }
})
*/
function LoadService(){
    if (service.ServiceDays != null){
      var daysString = service.ServiceDays.toString();
      document.getElementById('days').innerHTML = daysString.split(',').join(', ');
    }else{
      document.getElementById('days').innerHTML = "Service Not Updated";
    } 

    if(service.verificationStatus != null){
      document.getElementById('verificationStatus').innerHTML = service.verificationStatus;
    }else{
      document.getElementById('verificationStatus').innerHTML = "Under verification";
    }
    
    document.getElementById('titleTop').innerHTML = service.ServiceName;
    document.getElementById('categoryLink').innerHTML = service.ServiceCategory;
    document.getElementById('locationLink').innerHTML = service.Location;
    document.getElementById('titleLink').innerHTML = service.ServiceName;
    document.getElementById('big_img').src = service.LinksOfImagesArray[0];
    document.getElementById('title').innerHTML = service.ServiceName;
    document.getElementById('Location').innerHTML = service.Location;
    document.getElementById('serviceTimes').innerHTML = service.ServiceTimes;
    document.getElementById('desc').innerHTML = service.Description;
    document.getElementById('price').innerHTML = service.ServicePrice;
    document.getElementById('number').innerHTML = service.Phone_Number;
    
    
    if (service.reviews != '' && service.reviews != null){
      var review = service.reviews
      var i = 0
      console.log(review)
      for (var key in review){
        i+=1
        console.log(review[key].client)
        console.log(review[key].rating)
        console.log(review[key].comment)
        genReviews(review[key],i)
      }
    }

    
    GenLI();
    genImgs();
    loadMap();

};


function genReviews(rev,index){
    let starRatings= `
    <div class="rating" id="ratingDiv-`+index+`"> 
        <input type="radio" name="ratingStars" value="5" id="star-5" disabled><label for="5">☆</label> 
        <input type="radio" name="ratingStars" value="4" id="star-4" disabled><label for="4">☆</label> 
        <input type="radio" name="ratingStars" value="3" id="star-3" disabled><label for="3">☆</label> 
        <input type="radio" name="ratingStars" value="2" id="star-2" disabled><label for="2">☆</label> 
        <input type="radio" name="ratingStars" value="1" id="star-1" disabled><label for="1">☆</label>
    </div>
  `
  

  const reviewDIv = document.getElementById('reviewDiv');
  let name = document.createElement('h3');
  let comment = document.createElement('p');
  let rating = document.createElement('p');
  let div = document.createElement('div');
  name.classList.add("pt-3")
  div.classList.add("w-25","border-1","border","rounded-5","p-2","my-2")
  name.innerHTML = " &emsp;" + rev.client;
  rating.innerHTML = "&emsp;&emsp;&emsp;" + starRatings;
  comment.innerHTML = "&emsp;&emsp;&emsp;Says " + rev.comment;

  div.append(name);
  div.appendChild(comment);
  div.appendChild(rating);
  reviewDIv.append(div)    
  setStars(rev.rating,index)
}


function setStars (rating,index){
  var x = document.getElementById("ratingDiv-"+index).querySelector("#star-"+rating);
  x.checked = true;
}


function GenLI(){
    service.Points.forEach(html => {
        if(html.length > 1){
            var li = document.createElement('li');
            li.innerHTML = html;
            document.getElementById('points').append(li);
        }
    })
}

function genImgs(){
    let i = 1;
    let html = '';
    service.LinksOfImagesArray.forEach(imglink =>{
        let img = document.createElement('img');
        let div = document.createElement('div');
        div.classList.add("col");
        div.id = 'div' + (i++);
        img.src = imglink;
        img.classList.add("img-fluid", "p-1","w-100");
        img.id = 'im'+ (i++);
        document.getElementById('small_imgs').append(div);
        document.getElementById(div.id).append(img);
        
    });
}









function loadMap(){
    let data = service.location_data;
    var location_data = String(data).split(',').map(Number);
    var map = L.map('map').setView(location_data, 13);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    navigator.geolocation.getCurrentPosition(success,error);

    let marker;
    var markers=[];
    var curr_Loc_Icon = L.icon({
        iconUrl:'https://cdn-icons-png.flaticon.com/512/5693/5693831.png',
        iconSize: [30, 30]
    });
    

    function success(pos){
        const lat = pos.coords.latitude;
        const long = pos.coords.longitude;
        

        if(marker){
            map.removeLayer(marker); 
            map.removeLayer(circle);
        }

        marker = L.marker([lat,long],{icon: curr_Loc_Icon}).addTo(map)
        .bindPopup("Your Location",{autoClose: false}).openPopup();
        

        map.setView([lat,long]);
    }

    function error(err){

        if (err.code === 1 ){
            alert("Please allow geolocation access");
        } else {
            alert("Cannot get current location");
        }
    }

    L.marker(location_data).addTo(map)
        .bindPopup(service.ServiceName,{autoClose: false})
        .openPopup();

    
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
let providerDesc = document.getElementById('brandDesc');

function getProfileDetails(userID){

  
  var dbRef = ref(realdb);
  
    get(child(dbRef,"ProviderProfile/"+userID)).then((snapshot)=>{
      
      if(snapshot.exists()){
        fullname = snapshot.val().FirstName +" "+snapshot.val().lastName;
        profileName.innerHTML = fullname;
        profileNumber.innerHTML = snapshot.val().phoneNumber;
        profileDesc.innerHTML = snapshot.val().selfDescription;

        providerCity.innerHTML = snapshot.val().city;
        providerBrand.innerHTML = snapshot.val().brand_name;
        providerEmail.innerHTML = snapshot.val().businessEmail;
        providerTimes.innerHTML = snapshot.val().availability;
        providerDesc.innerHTML = snapshot.val().brand_desc;
        chatProvider.disabled =false;
      }else{        
        profileIMG.src = "/assets/img/profile_icon.png";
        chatProvider.disabled = true;
      }
    });
  

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



var bookingselected = document.getElementById('bookingPressed');
bookingselected.href="/Booking/booking_page.html";


function sendToChat(){
    window.location.replace("http://test-75edb.web.app/chat/chat.html");
}

chatProvider.addEventListener('click',monitorFireAuth);