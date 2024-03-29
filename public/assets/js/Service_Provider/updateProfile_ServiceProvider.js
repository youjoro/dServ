import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {getStorage, ref as sRef, uploadBytesResumable, getDownloadURL}
from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
import { getDatabase, ref, set, child,get ,update }
from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import {firebaseConfig} from "../firebase_config.js";
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getFirestore,writeBatch, doc,orderBy,limitToLast,collection, query,  getDocs, getDoc }from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const fireDB = getFirestore(app);
const auth = getAuth();
const batch = writeBatch(fireDB);

var files = [];
var reader = new FileReader();

const namebox = document.getElementById('namebox'); 
const extlab = document.getElementById('extlab'); 
const myImg = document.getElementById('myImg'); 
const progLab = document.getElementById('uploadProgress'); 
const selBtn = document.getElementById('selBtn'); 
const upBtn = document.getElementById('upBtn'); 
const downBtn = document.getElementById('downBtn'); 

const username = document.getElementById('username');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName')
const address = document.getElementById('address');
const businessEmail = document.getElementById('businessEmail');
const selfDescription = document.getElementById('selfDescription');
const brandName = document.getElementById('brandName');
const availability = document.getElementById('availability');
const brand_desc = document.getElementById('brand_desc');

const editPrompt = document.querySelectorAll('.editPrompt');
const editButton = document.querySelectorAll('.Edit');
const cancelEditButton = document.querySelectorAll('.cancel');
const updateDataButton = document.querySelectorAll('.update');
const employeeDivList = document.getElementById('employeeList');
const employeeTable = document.getElementById('employeeTable');
const textBars = document.querySelectorAll('.editTextBar');

const chatTab = document.getElementById('chats')


var input =document.createElement('input');
input.type = 'file';
window.onload = employeeDivList.style.display = "none";


for (var i = 0; i<editPrompt.length;i++ ){
    window.onload = editPrompt[i].style.display = "none";
    console.log(i);
    editButton[i].classList.add('edit-'+i);
    cancelEditButton[i].classList.add('canc-'+i);
    updateDataButton[i].classList.add('upd-'+i);
    
    editButton[i].addEventListener('click',function(){            
        let classEdit = this.className.split(' ');
        check(classEdit[2]);
    });
    
    cancelEditButton[i].addEventListener('click',function(){
        let classEdit = this.className.split(' ');
        cancelEdit(classEdit[5])
    });

    updateDataButton[i].addEventListener('click',function(){
        let classEdit = this.className.split(' ');
        updateData(classEdit[5])
    });

}


function loadData(userID){
    var dbRef = ref(realdb);
    
        get(child(dbRef,"ProviderProfile/"+userID)).then((snapshot)=>{
        
        if(snapshot.exists()){
            lastName.innerHTML= ": "+snapshot.val().lastName;
            firstName.innerHTML =":  "+ snapshot.val().FirstName;
            username.innerHTML = ": "+snapshot.val().username;
            address.innerHTML = ": "+snapshot.val().address;

            businessEmail.innerHTML =":  "+ snapshot.val().businessEmail;
            brandName.innerHTML = ": "+snapshot.val().brand_name;
            selfDescription.innerHTML = ": "+snapshot.val().selfDescription;
            availability.innerHTML = ": "+snapshot.val().availability;
            brand_desc.innerHTML = ": "+snapshot.val().brand_desc;
            
        }
        if(snapshot.val().typeOfProvider == "company"){
            let employees = '';
            employeeDivList.style.display = "";
            snapshot.val().employees.forEach((doc)=>{
                createListItem(doc);
            })
        }
        });
}

function createListItem(employee){
    let employeeInfo = employee.split('|')
    let divRow = document.createElement('div');
    divRow.classList.add('row','my-2','shadow','border','rounded','p-2');
    
    let emailText = document.createElement('p');
    let nameText = document.createElement('p');
    emailText.classList.add('mt-1');
    nameText.classList.add('mt-1');

    emailText.innerHTML = employeeInfo[1];
    nameText.innerHTML = employeeInfo[0];
    
    divRow.appendChild(nameText);
    divRow.appendChild(emailText);

    employeeTable.append(divRow);
}

var userID = sessionStorage.getItem("user");
loadData(userID);
const monitorAuthState = async() =>{
    onAuthStateChanged(auth,user=>{
        if(user){
        console.log(user);
        uploadProcess(user.uid);
        }else{
        console.log("no user");
        
        }
    });
}

input.onchange = e =>{
    files = e.target.files;

    var extension = getFileExt(files[0]);
    var name = getFileName(files[0]);
    
    namebox.value = name;
    extlab.innerHTML = extension;

    reader.readAsDataURL(files[0]);
}

reader.onload = function(){
    myImg.src =  reader.result;
}

selBtn.onclick = function(){
    input.click();
}

function getFileExt(file){
    var temp = file.name.split('.');
    var ext = temp.slice((temp.length-1),(temp.length));
    return '.' + ext[0];
}   

function getFileName(file){
    var temp = file.name.split('.');
    var fName = temp.slice(0,-1).join('.');
    return fName;
}


async function uploadProcess(userID){
    var imgToUpload = files[0];

    var imgName = namebox.value + extlab.innerHTML;


    const metadata = {
        contentType: imgToUpload.type
    }

    const storage = getStorage();
    let profileImgName ='profilePic-'+userID;
    const storageRef = sRef(storage, "Images/"+profileImgName);


    const uploadTask = uploadBytesResumable(storageRef, imgToUpload,metadata);

    uploadTask.on('state-changed', (snapshot)=>{
        var progress  = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
        progLab.innerHTML = "Upload "+progress +"%"; 
    },(error)=>{
        alert("error: Image not Uploaded");
    },()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl)=>{
            saveURLtoProfile(downloadUrl,userID,profileImgName);
        })
    }
    )

}


function saveURLtoProfile(imgURL,userID,imgName){
    set(ref(realdb,"users/"+userID+'/'+"profilePic"),{
        ImageName: imgName,
        imgLink: imgURL
    });
    location.reload(); 
}

function getServiceIndex(id){
    var indstart = id.indexOf('-')+1;
    console.log(indstart);
    return Number(id.substring(indstart));
}       

function check(num){
    var index = getServiceIndex(num);
    
    editPrompt[index].style.display = "";
    
}

function cancelEdit(num){
    var index = getServiceIndex(num);
    if (index==8){
        textBars[7].value = '';
        editPrompt[index].style.display = "none";
    }else{
        console.log(textBars[index],index)
        textBars[index].value = '';
        editPrompt[index].style.display = "none";
    }

}

function updateData(num){
    var a = new Object();
    let choices = {
        0:"username",
        1:"FirstName",
        2:"lastName",
        3:"address",
        4:"businessEmail",
        5:"selfDescription",
        6:"brand_name",
        7:"availability",
        8:"brand_desc"
    }
    var index = getServiceIndex(num);
    let chosen =choices[index]

    if (index==8){
        a[chosen] = textBars[7].value;
        updateNewData(a)

    }else if (textBars[index].value == ""){
        console.log(chosen);
    }else{
        console.log(chosen);
        
        a[chosen] = textBars[index].value;
        console.log(a);

        if (chosen == "username"){
            update(ref(realdb, 'users/' + userID),a).then(function(){
            batch.update(doc(fireDB, "users",userID), a)   
            batch.commit().then(() => {
                    updateNewData(a)
                });
                
                
            }).catch(function(error){
            console.log('Synchronization failed');
        }) 
        }
        else{
            updateNewData(a)
        }
    }
}


async function updateNewData(a){
    update(ref(realdb, 'ProviderProfile/' + userID),a).then(function(){
                alert("Updated Data");
                location.reload();
            }).catch(function(error){
            console.log('Synchronization failed');
        })
}


editButton.onclick = check;
upBtn.onclick = monitorAuthState;  




async function loadMessages(){
var chatList = []
var userID = sessionStorage.getItem("user");
const getChats = collection(fireDB, "users",userID,"chat");

const querySnapshot = await getDocs(getChats);
querySnapshot.forEach((doc) => {
chatList.push(doc.data().chatID);
});

console.log(chatList);
//chats();
getChatData(chatList);
}

async function getChatData(chatIDs){


for(var i = 0; i<chatIDs.length;i++){
var latest = ''
const q = doc(fireDB,"chat",chatIDs[i]);
const docSnap = await getDoc(q);
const c = query(collection(fireDB,"chat",chatIDs[i],"messages"), orderBy('timestamp'), limitToLast(1));
const chatmessage = await getDocs(c);


chatmessage.forEach((doc)=>{
    if(doc.exists()){
        latest = doc.data().text;
        console.log(latest)
    }else{
        latest = ""
        console.log(latest)
    }
    
})

if (docSnap.exists()) {
    
    await createChatMessages(docSnap.data(),latest);
} else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
}
}

}



function createChatMessages(chat,chatmessage){
console.log(chatmessage)
let latestmessage = chatmessage.substring(0,25);
latestmessage.replace(/[^a-zA-Z0-9]/g,"...");
let img = document.createElement('img');
img.classList.add('rounded-circle');
img.src="img/undraw_profile_1.svg";
let requestbutton = document.createElement('a');
requestbutton.classList.add('dropdown-item', 'd-flex', 'align-items-center');


let dropdownIMG = document.createElement('div');
dropdownIMG.classList.add('dropdown-list-image', 'mr-3');


let status = document.createElement('div');
status.classList.add('status-indicator','bg-success');


let divText = document.createElement('div');
divText.classList.add('font-weight-bold');


let remarkText = document.createElement('div');
remarkText.classList.add('text-truncate');


let clientName = document.createElement('div');
clientName.classList.add('small','text-gray-500');


dropdownIMG.append(img,status);


clientName.innerHTML = chat.clientUsername;
remarkText.innerHTML = latestmessage+"...";

divText.append(remarkText,clientName);

requestbutton.append(dropdownIMG,divText);
chatTab.append(requestbutton);

}

loadMessages()
