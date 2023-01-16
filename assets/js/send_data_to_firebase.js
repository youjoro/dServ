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
    const service_times = document.getElementById('timeAvailInp');
    const service_desc = document.getElementById('desArea');
    const service_category = document.getElementById('Cate_Inp');
    const contact_Number = document.getElementById('servNum');
    //Points
    const point_1 = document.getElementById('Point1_Inp');
    const point_2 = document.getElementById('Point2_Inp');
    const point_3 = document.getElementById('Point3_Inp');
    





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
        let looplim = (num<=10) ? theFiles.length : (10-Files.length);

        for (let i = 0; i < looplim; i++){
            Files.push(theFiles[i]);
        }

        if(num>10) alert("maximum of 10 images are allowed");
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
        service_times.value = '';
        service_desc.value = '';
        service_category.value = '';
        point_1.value = '';
        point_2.value = '';
        point_3.value = '';
        imgDiv.innerHTML='';
    }


    //Events

    selectImg.addEventListener('click', OpenFileDialog);
    addImg.addEventListener('click', uploadAllImages);
    locationbutton.addEventListener('click', getLocation);
    //Functions

    function uploadAllImages(){
        addImg.disabled = true;
        selectImg.disabled = true;

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

        const imageAddress = "Images_" + getShortTitle() + "/img#" + (imgNo+1); 

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
                    UploadAService();
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
            console.log(city);
            console.log(loc_data);
        }
        );

    }

//IMPORTS AND CONFIG

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {getStorage, ref as sRef, uploadBytesResumable, getDownloadURL}
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { getDatabase, ref, set, child, update, remove }
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";


import {firebaseConfig} from './firebase_config.js';

const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);
const userID = sessionStorage.getItem("user");


    function UploadAService(){
        set(ref(realdb,"Services/"+getShortTitle()),{
            ServiceName: service_name.value,
            ServicePrice: service_price.value,
            ServiceTimes: service_times.value,
            ServiceCategory: service_category.value,
            Description: service_desc.value,
            Points: getPoints(),
            LinksOfImagesArray: imageLinkArray,
            Location: city,
            location_data:loc_data,
            Phone_Number: contact_Number.value,
            Owner: userID
            
        }).then(function(){
            set(ref(realdb, 'ProviderProfile/' + userID + '/Services/' + service_name.value),{
            ServiceName: service_name.value,
            ServicePrice: service_price.value,
            ServiceTimes: service_times.value,
            ServiceCategory: service_category.value,
            Description: service_desc.value,
            Points: getPoints(),
            LinksOfImagesArray: imageLinkArray,
            Location: city,
            location_data:loc_data,
            Phone_Number: contact_Number.value
            })
            alert("Upload Succesful");
            RestoreBack();
        });

        
    }
