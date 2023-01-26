// References
    var Files = [];
    var FileReaders = [];
    var imageLinkArray = [];

    //Location
    const locationbutton = document.getElementById('getLocation');
    //Images 
    const imgDiv = document.getElementById('imageDiv');
    const addImg = document.getElementById('addServButton');
    const selectImg = document.getElementById('Serv_imgs');
    const progLabel = document.getElementById('Loadlab');

    //Text Input
    const service_name = document.getElementById('servnameInp');
    const service_price = document.getElementById('servPrice');
    const amTime = document.getElementById('amSelector');
    const pmTime = document.getElementById('pmSelector');
    const service_desc = document.getElementById('desArea');
    const service_category = document.getElementById('Cate_Inp');
    const contact_Number = document.getElementById('servNum');
    //Points
    const point_1 = document.getElementById('Point1_Inp');
    const point_2 = document.getElementById('Point2_Inp');
    const point_3 = document.getElementById('Point3_Inp');
    
    
    let servicetime = "";



    function OpenFileDialog(){
        let inp = document.createElement('input');
        inp.type = 'file';
        inp.multiple = 'multiple';

        inp.onchange = (e) =>{
            AssignImgsToFilesArray(e.target.files);
            CreateImgTags();
        }

        inp.click();
    }


    function AssignImgsToFilesArray(theFiles){
        let num = Files.length + theFiles.length;
        let looplim = (num<=7) ? theFiles.length : (7-Files.length);

        for (let i = 0; i < looplim; i++){
            Files.push(theFiles[i]);
        }

        if(num>7) alert("maximum of 7 images are allowed");
    }


    function CreateImgTags(){
        imgDiv.innerHTML = '';
        imgDiv.classList.add('imgsDivStyle');

        for(let i = 0; i < Files.length; i++){
            FileReaders[i] = new FileReader();

            FileReaders[i].onload = function(){
                var img = document.createElement('img');
                img.id = 'imgNo' + i;
                img.classList.add('img');
                img.src = FileReaders[i].result;
                imgDiv.append(img);
            }

            FileReaders[i].readAsDataURL(Files[i]);
        }

        let lab = document.getElementById('Loadlab');
        lab.innerHTML = 'Clear Images';
        lab.style = 'cursor:pointer;display:block;color:navy;font-size:12px;';
        lab.addEventListener('click',ClearImages);
        imgDiv.append(lab);
        
    }


    function ClearImages(){
        Files=[];
        imageLinkArray =[];
        imgDiv.innerHTML='';
        imgDiv.classList.remove('imgsDivStyle');
    }


    function getShortTitle(){
        let namey = service_name.value.substring(0,50);
        return namey.replace(/[^a-zA-Z0-9]/g,"");
    }



    function getImageUploadProgress(){
        return 'Images Uploaded' + imageLinkArray.length + 'of' + Files.length;
    }



    function isAllImagesUploaded(){
        return imageLinkArray.length == Files.length;
    }



    function getPoints(){
        let points = [];
        if (point_1.value.length>0) points.push(point_1.value);
        if (point_2.value.length>0) points.push(point_2.value);
        if (point_3.value.length>0) points.push(point_3.value);

        return points;
    }



    function RestoreBack(){
        addImg.disabled = false;
        selectImg.disabled = false;
        service_name.value = '';
        service_price.value = '';
        amTime.value = '';
        pmTime.value = '';
        service_desc.value = '';
        service_category.value = '';
        point_1.value = '';
        point_2.value = '';
        point_3.value = '';
        imgDiv.innerHTML='';

    }


    //Events

    selectImg.addEventListener('click', OpenFileDialog);
    addImg.addEventListener('click', validateForm);
    locationbutton.addEventListener('click', getLocation);

    function validateForm() {
        // This function deals with validation of the form fields
        var x, y, i, valid = true;
        
        y = document.getElementsByTagName("input");
        var d = service_desc;
        
        //check if description and experience/expertise is empty
        if(d.value.length == 0){
                d.classList.add("border-danger");
                valid = false;
                    }
        // A loop that checks every input field in the current tab:
        for (i = 0; i < y.length; i++) {
            // If a field is empty...
            if (y[i].value == "") {

            // add an "invalid" class to the field:
            y[i].className += " invalid";
            
            // and set the current valid status to false
            valid = false;
            }
            
        }
        // If the valid status is true, mark the step as finished and valid:
        if (valid) {

            uploadAllImages();
        }
        
}



    //Functions

    function uploadAllImages(){
        

        imageLinkArray=[];

        for (let i = 0; i < Files.length; i++){
            UploadAnImage(Files[i],i);
        }
    }



    function UploadAnImage(imgToUpload, imgNo){
        const metadata = {
            contentType: imgToUpload.type
        };

        const storage = getStorage();

        const imageAddress = "Images_" + getShortTitle()+ "/img#" + (imgNo+1); 

        const storageRef = sRef(storage,imageAddress);

        const uploadTask = uploadBytesResumable(storageRef, imgToUpload, metadata);

        uploadTask.on('state_changed', (snapshot) =>{
            progLabel.innerHTML = getImageUploadProgress();
        },

        (error)=>{
            alert("Error: image upload failed"+"/n"+error);
        },
        ()=>{
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
                imageLinkArray.push(downloadURL);
                if(isAllImagesUploaded()){
                    progLabel.innerHTML = "All images Uploaded";
                    monitorAuthState();
                }
            });
        }
        );
    }

    var loc_data = "";
    var city = "";
    function getLocation(){
        fetch('http://ip-api.com/json/?fields=61439')
        .then(res => res.json())
        .then(res => {
            loc_data = res.lat+","+res.lon;
            city = res.city
            
            document.getElementById("Location").innerHTML = loc_data;
            document.getElementById("City").innerHTML = city;
            
            loadMap(loc_data);
            
        }
        );

    }



//map
    function loadMap(loc_data){
    var location_data = String(loc_data).split(',').map(Number);
    var map = L.map('map').setView(location_data, 13);
    var location_correction = "";
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
        loc_data =location_data;
        marker = L.marker([lat,long],{icon: curr_Loc_Icon}).addTo(map)
        .bindPopup("Your Location",{autoClose: false}).openPopup();
        console.log(loc_data.toString());
        location_correction = lat+","+long;
        map.setView([lat,long]);
        
        
    }

    function error(err){

        if (err.code === 1 ){
            alert("Please allow geolocation access");
        } else {
            alert("Cannot get current location");
        }
    }
    /*
    L.marker(location_data).addTo(map)
        .bindPopup("Previous location",{autoClose: false})
        .openPopup();
    */
    
}




//IMPORTS AND CONFIG

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {getStorage, ref as sRef, uploadBytesResumable, getDownloadURL}
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { getDatabase, ref, set, child, update, remove }
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, 
  onAuthStateChanged, 

} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

import {firebaseConfig} from './firebase_config.js';

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);

const auth = getAuth();
let check = sessionStorage.getItem("user");

    if (check !=null){
        document.getElementById('session').style.visibility  = "hidden";
    }

    const monitorAuthState = async() =>{
        onAuthStateChanged(auth,user=>{
            if(user){
                console.log(user);
                UploadAService(user.uid);
            }else{
                console.log("no user");
            
            }
        });
    }

    function UploadAService(userID){
            
        try{
            set(ref(realdb,"Services/"+getShortTitle()+'-'+userID),{
                ServiceName: service_name.value,
                ServicePrice: service_price.value,
                ServiceTimes: servicetime,
                ServiceCategory: service_category.value,
                Description: service_desc.value,
                Points: getPoints(),
                LinksOfImagesArray: imageLinkArray,
                Location: city,
                location_data:loc_data.toString(),
                Phone_Number: contact_Number.value,
                Owner: userID
                
            }).then(function(){
                set(ref(realdb, 'ProviderProfile/' + userID + '/Services/' + service_name.value+'-'+userID),{
                ServiceName: service_name.value,
                ServicePrice: service_price.value,
                ServiceTimes: servicetime,
                ServiceCategory: service_category.value,
                Description: service_desc.value,
                Points: getPoints(),
                LinksOfImagesArray: imageLinkArray,
                Location: city,
                location_data:loc_data.toString(),
                Phone_Number: contact_Number.value
                })
                alert("Upload Succesful");
                window.location.replace("http://127.0.0.1:5500/Service_Provider_Dashboard/index.html");
                
            });
        }catch(error){
            alert(error);
            RestoreBack();
        }
        

        
    }
