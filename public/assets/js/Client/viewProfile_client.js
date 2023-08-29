import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getDatabase, ref, child, get }
from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import {firebaseConfig} from "../firebase_config.js";
import { getFirestore , collection, doc,getDoc,getDocs,query,orderBy,limitToLast } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js'

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const firedb = getFirestore(app);

const username = document.getElementById('username');
const fullname = document.getElementById('userFullname')
const firstName_text = document.getElementById('firstName');
const lastName_text = document.getElementById('lastName');
const address = document.getElementById('address');
const phoneNumber = document.getElementById('phoneNumber');
const email = document.getElementById('email');
const inbox = document.getElementById('inbox');

var userID = sessionStorage.getItem('user');
window.onload = loadProfileData(userID);
window.onload = loadChat();
function loadProfileData(userID){
    var dbRef = ref(realdb);
    try{
        get(child(dbRef,"users/"+userID)).then((snapshot)=>{
        
        if(snapshot.exists()){
            if (firstName_text != null){
                firstName_text.innerHTML = snapshot.val().firstName;
            }
            if (lastName_text != null){
                lastName_text.innerHTML = snapshot.val().lastName;
            }
            if (fullname != null){
                fullname.innerHTML = snapshot.val().firstName+" "+snapshot.val().lastName;
            }
            if (phoneNumber != null){
                phoneNumber.innerHTML = snapshot.val().phone_number;
            }
            email.innerHTML = snapshot.val().email;
            address.innerHTML = snapshot.val().address;
            username.innerHTML = snapshot.val().username;
        }
        
        });

    }catch(e){
        console.log(e);
    }

}

async function loadChat(){
    const requests = collection(firedb,"users",userID,"chat");
    
    const querySnapshot = await getDocs(requests);
    try{
    querySnapshot.forEach((doc)=>{
        console.log(doc.id);
        getLatestMessage(doc.id);
    })  
    }catch(e){
        console.log(e);
    }  
}






async function getLatestMessage(id){
    const recentMessagesQueryLoad = query(collection(firedb,"chat",id,"messages"), orderBy('timestamp'), limitToLast(1));
    const docSnap = await getDocs(recentMessagesQueryLoad);
    
    docSnap.forEach((doc)=>{
        renderChat(doc.data(),id);
    })
}

async function renderChat(message,id){
    let li = document.createElement('li');
    let messagetext = document.createElement('p');
    let date = document.createElement('p');
    let dateRow = document.createElement('div');
    let messageRow = document.createElement('div');
    
    messagetext.classList.add('fw-bold');
    messageRow.classList.add('row');
    dateRow.classList.add('row');
    date.classList.add('text-muted','dateText','d-flex');
    li.classList.add("list-group-item" ,"p-3",'border','rounded','border-1','mb-2');


    const getName = await getProviderName(id);

    let time = message.timestamp;
    let dateFormat = new Date(time.seconds*1000);
    dateFormat=moment(dateFormat).format("YYYY-MM-DD hh:mm A");
    
    messagetext.innerHTML = getName;
    date.innerHTML = message.text +"  |  "+ dateFormat;

    console.log(message.text);

    messageRow.appendChild(messagetext);
    messageRow.appendChild(date);
    li.appendChild(messageRow);
    li.appendChild(dateRow);

    inbox.append(li);
}

async function getProviderName(id){
    const recentMessagesQueryLoad = doc(firedb,"chat",id);

    const docSnap = await getDoc(recentMessagesQueryLoad);

    if (docSnap.exists){
        return docSnap.data().serviceProviderName
    }
}

