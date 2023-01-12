//IMPORTS AND CONFIG
import {firebaseConfig} from './firebase_config.js';
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import { getDatabase, ref, set, child, update, remove }
    from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const realdb = getDatabase(app);



function UploadAService(){
    set(ref(realdb,"Services/"+getShortTitle()),{
        ServiceName: service_name.value,
        ServicePrice: service_price.value,
        ServiceTimes: service_times.value,
        ServiceCategory: service_category.value,
        Description: service_desc.value,
        Points: getPoints(),
        LinksOfImagesArray: imageLinkArray
    }).then(function(){
        alert("Upload Succesful");
        RestoreBack();
    });

    
}




//get data from fields






//adding fields
var row_num = 0;
var exp_dataEntries = [];

function checkData(){
  
  for (i=1;i<row_num+1;i++){
    var j = document.getElementById('job-'+i+'').value;
    var y = document.getElementById('year-'+i+'').value;
    
    exp_dataEntries.push(j,y);
  }
  
}

function addFields(){
  row_num +=1;
  var container = document.getElementById('experience_expertise');
  var jobs = document.createElement("input");
  var years = document.createElement("input");
  var row = document.createElement("div");
  var col_job = document.createElement("div");
  var col_year = document.createElement("div");

  jobs.type = "text";
  years.type = "text";

  row.classList.add("row","row-cols-2");
  col_job.classList.add("col-8");
  col_year.classList.add("col-4");
  jobs.classList.add("form-control","jobs");
  years.classList.add("form-control","years");
  jobs.setAttribute('id','job-'+row_num+'');
  years.setAttribute('id','year-'+row_num+'');
  jobs.placeholder = "Previous Jobs or Expertise";
  years.placeholder = "Years";

  col_job.appendChild(jobs);
  col_year.appendChild(years);
  row.appendChild(col_job);
  row.appendChild(col_year);
  
  container.appendChild(row);

  container.appendChild(document.createElement("hr"));
}


var currentTab = 0; // Current tab is set to be the first tab (0)
var CVskipped = false; 
showTab(currentTab); // Display the current tab

function showTab(n) {
  // This function will display the specified tab of the form...
  var x = document.getElementsByClassName("step");
  x[n].style.display = "block";
  //... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
    document.getElementById("nextBtn").className = " Submit_end";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  //... and run a function that will display the correct step indicator:
  fixStepIndicator(n)
}
var currTab = 0;
function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("step");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form...
  if (currentTab >= x.length) {
    // ... the form gets submitted:
    document.getElementById("signUpForm").submit();
    return false;
  }
  // Otherwise, display the correct tab:
  currTab = currentTab;
  showTab(currentTab);
}

//skip CV part
function skipCV(){
  document.getElementById('formFileLg').classList.remove("invalid");
  document.getElementById('formFileLg').disabled = true;
  CVskipped = true;
}


function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  x = document.getElementsByClassName("step");
  y = x[currentTab].getElementsByTagName("input");
  var d = document.getElementById("selfDescription");
  
  //check if description and experience/expertise is empty
  if(d.value.length == 0 && currTab == 1){
        d.classList.add("border-danger");
        valid = false;
      }else if(row_num == 0 && currTab == 1){
        alert("Experience/expertise empty");
        valid=false;
      }
  // A loop that checks every input field in the current tab:
  for (i = 0; i < y.length; i++) {
    // If a field is empty...
    if (y[i].value == "" && CVskipped != true) {

      // add an "invalid" class to the field:
      y[i].className += " invalid";
      
      // and set the current valid status to false
      valid = false;
    }
    
  }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    document.getElementsByClassName("stepIndicator")[currentTab].className += " finish";
    checkData();
    
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("stepIndicator");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class on the current step:
  x[n].className += " active";
}


