    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
    import {getStorage, ref as sRef, uploadBytesResumable, getDownloadURL}
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
    import { getDatabase, ref, set, child, update, remove }
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
    import {firebaseConfig} from "../firebase_config.js";
    import { getAuth, 
    onAuthStateChanged

    } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

    const app = initializeApp(firebaseConfig);
    const realdb = getDatabase(app);
    const auth = getAuth();



    var files = [];
    var reader = new FileReader();

    var namebox = document.getElementById('namebox'); 
    var extlab = document.getElementById('extlab'); 
    var myImg = document.getElementById('myImg'); 
    var progLab = document.getElementById('uploadProgress'); 
    var selBtn = document.getElementById('selBtn'); 
    var upBtn = document.getElementById('upBtn'); 
    var downBtn = document.getElementById('downBtn'); 

    var input =document.createElement('input');
    input.type = 'file';


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
        let profileImgName = imgName+'-'+userID;
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
    }

    upBtn.onclick = monitorAuthState;  