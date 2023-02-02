    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
    import {getStorage, ref as sRef, uploadBytesResumable, getDownloadURL}
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
    import { getDatabase, ref, set, child, update, remove,get }
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

    const namebox = document.getElementById('namebox'); 
    const extlab = document.getElementById('extlab'); 
    const myImg = document.getElementById('myImg'); 
    const progLab = document.getElementById('uploadProgress'); 
    const selBtn = document.getElementById('selBtn'); 
    const upBtn = document.getElementById('upBtn'); 
    const downBtn = document.getElementById('downBtn'); 


    const username = document.getElementById('username');
    const fullname = document.getElementById('fullname');
    const address = document.getElementById('address');
    const businessEmail = document.getElementById('businessEmail');
    const selfDescription = document.getElementById('selfDescription');
    const brandName = document.getElementById('brandName');
    const availability = document.getElementById('availability');
    const brand_desc = document.getElementById('brand_desc');

    var input =document.createElement('input');
    input.type = 'file';


    //window.onload

    function loadData(userID){
        var dbRef = ref(realdb);
        
            get(child(dbRef,"ProviderProfile/"+userID)).then((snapshot)=>{
            
            if(snapshot.exists()){
                let profilefullname =":  "+ snapshot.val().FirstName +" "+snapshot.val().lastName;
                fullname.innerHTML =": "+ profilefullname;
                username.innerHTML = ": "+snapshot.val().username;
                address.innerHTML = ": "+snapshot.val().address;

                businessEmail.innerHTML =":  "+ snapshot.val().businessEmail;
                brandName.innerHTML = ": "+snapshot.val().brand_name;
                selfDescription.innerHTML = ": "+snapshot.val().selfDescription;
                availability.innerHTML = ": "+snapshot.val().availability;
                brand_desc.innerHTML = ": "+snapshot.val().brand_desc;
                
            }
            });
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