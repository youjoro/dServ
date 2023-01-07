let service = null;

window.onload = function(){
    service = localStorage.Service;
    if (service){
        service = JSON.parse(service);
        LoadService();
    }
}

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
    document.getElementById('number').innerHTML = service.ContactNumber;
    
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
    console.log(data);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker(location_data).addTo(map)
        .bindPopup(service.Location)
        .openPopup();
}
