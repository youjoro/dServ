var requests = localStorage.getItem('requests');
var requestList = requests.split(',');



document.addEventListener('DOMContentLoaded', function() {
  
  var calendarEl = document.getElementById('calendar');
  
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    
    
  });

  for (var i =0 ;i<requestList.length;i++){
    let requestData = requestList[i].split('-');
    
    render(calendar,requestData);
  }
  
  calendar.render();
    
});

function render(calendar,requestData){
console.log(requestData[1].replaceAll("/", "-"));
  calendar.addEvent({
    title: requestData[0],
    start: requestData[1].replaceAll("/", "-"),
    allDay: true
  });
  
}



