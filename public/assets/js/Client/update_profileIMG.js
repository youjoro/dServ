import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {getStorage, ref as sRef, uploadBytesResumable, getDownloadURL}
from "https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js";
import { getDatabase, ref, set, child,get ,update,remove }
from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
import {firebaseConfig} from "../firebase_config.js";
import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import { getFirestore,writeBatch, doc }from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const fireDB = getFirestore(app);
const auth = getAuth();
const batch = writeBatch(fireDB);


var files = [];
var reader = new FileReader();


const editPrompt = document.querySelectorAll('.editPrompt');
const editButton = document.querySelectorAll('.Edit');
const cancelEditButton = document.querySelectorAll('.cancel');
const updateDataButton = document.querySelectorAll('.update');


var myImg = document.getElementById('myImg'); 
var progLab = document.getElementById('uploadProgress'); 
var selBtn = document.getElementById('selBtn'); 
var upBtn = document.getElementById('upBtn'); 
const textBars = document.querySelectorAll('.editTextBar');
var input =document.createElement('input');
input.type = 'file';
var userID = sessionStorage.getItem("user");

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
            1:"firstName",
            2:"lastName",
            3:"address",
            4:"email"
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
        update(ref(realdb, 'users/' + userID),a).then(function(){
                    alert("Updated Data");
                    location.reload();
                }).catch(function(error){
                console.log('Synchronization failed');
            })
    }

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








const monitorAuthState = async() =>{
    onAuthStateChanged(auth,user=>{
        if(user){
        
        uploadProcess(user.uid);
        }else{
        console.log("no user");
        
        }
    });
}

input.onchange = e =>{
    files = e.target.files;

    reader.readAsDataURL(files[0]);
}

reader.onload = function(){
    myImg.src =  reader.result;
}

selBtn.onclick = function(){
    input.click();
}



async function uploadProcess(userID){
    var imgToUpload = files[0];


    const metadata = {
        contentType: imgToUpload.type
    }

    const storage = getStorage();
    let profileImgName = 'profilePic-'+userID;
    const storageRef = sRef(storage, "Images/"+profileImgName);


    const uploadTask = uploadBytesResumable(storageRef, imgToUpload,metadata);

    uploadTask.on('state-changed', (snapshot)=>{
        var progress  = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
        progLab.innerHTML = "Upload "+progress +"%"; 
    },(error)=>{
        alert("error: Image not Uploaded");
    },()=>{
        progLab.innerHTML = "";
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl)=>{
            console.log(profileImgName);
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

upBtn.onclick = monitorAuthState;  