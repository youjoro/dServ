let request = null;
let OuterDiv = document.getElementById('detailsDIV');

window.onload = function(){    
    request = localStorage.Request;     
    if (request){
        request = JSON.parse(request);
        viewDetails(request);
        console.log(request);
    }
}



function viewDetails(request){
    let time = request.DateAdded;
    let dateFormat = new Date(time.seconds*1000);
    dateFormat=moment(dateFormat).format("YYYY-MM-DD hh:mm A");
    let html = 
    `
    <div class="container  p-2">
    <div class = "row row-cols-2">
        <div class = "col-4">
            <h5 class="title py-1">Client Email</h5>
            <h5 class="title py-1">Client Full Name</h5>
            <h5 class="title py-1">Client Mobile Number</h5>
            <h5 class="title py-1">Appointment Date</h5>
            <h5 class="title py-1">Date Added</h5>
        </div>
        <div class = "col-8">
            <h6 class="pt-2 pb-1">`+request.ClientEmail+`</h6>
            <h6 class="pt-2 pb-1">`+request.ClientFirstName+request.ClientLastName+`</h6>
            <h6 class="pt-2 pb-1">`+request.ClientMobileNum+`</h6>
            <h6 class="pt-2 pb-1">`+request.RequestedDate+`</h6>
            <h6 class="pt-2 pb-1">`+dateFormat+`</h6>
        </div>
    </div>

    <hr>
    <div class="row row-cols-2">
    
        
        <div class ="col-4"><h6 class="category">`+request.serviceName+`</h6></div>
        <div class ="col-4"><h6 class="price">Selected Bundle:  `+request.ClientSelectedBundle+`</h6></div>
        <div class ="col-4"><h6 class="location text-muted">Number of Clients: `+request.clientNumber+`</h6></div>
    </div>
    
    
    
    
    </div>
    `


    let newServ = document.createElement('div');
    newServ.classList.add('container');
    newServ.innerHTML = html;
    OuterDiv.append(newServ);
}
