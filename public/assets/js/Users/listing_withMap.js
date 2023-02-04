var map = L.map('map').setView([14.23307, 121.176], 13);
var popup = L.popup();


function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);

    
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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