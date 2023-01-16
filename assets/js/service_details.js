let service = null;

window.onload = function(){
    service = localStorage.Service;
    if (service){
        service = JSON.parse(service);
        LoadService();
    }
}
window.onbeforeunload = function() {
  localStorage.clear();
  return '';
};

function LoadService(){
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
    
    GenLI();
    genImgs();
    loadMap()
};

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
