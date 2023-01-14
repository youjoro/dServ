//import { send } from "./serviceProvider_AccDetails_send";

//get data from fields
var fName = document.getElementById("firstName");
var lName = document.getElementById("lastName");
var username = document.getElementById("username");
var businessEmail = document.getElementById("businessEmail");
var phoneNumber = document.getElementById("phone_number");
var address = document.getElementById("address");
var address2 = document.getElementById("address2");
var city = document.getElementById("city");
var zip = document.getElementById("zip");
var individual = document.getElementById("individual");
var company = document.getElementById("company");

var selfDescription = document.getElementById("selfDescription");
var CV = document.getElementById("formFileLg");

var brand_name = document.getElementById("firstName");
var brand_desc = document.getElementById("brandDescription");
var availability = document.getElementById("availability");

var acc_email = document.getElementById("acc_email");
var acc_pass = document.getElementById("password");

var typeOfProvider = "";

if (individual.checked){
  typeOfProvider = "individual";
}else if(company.checked){
  typeOfProvider = "company";
}
window.onload =localStorage.clear();
window.onload = document.getElementById("final_submit").style.visibility="hidden";





//adding fields
var row_num = 0;
var exp_dataEntries = [];

function checkData(){
  
  for (let i=1;i<row_num+1;i++){
    var j = document.getElementById('job-'+i+'').value;
    var y = document.getElementById('year-'+i+'').value;
    
    exp_dataEntries.push("Experience in: "+j+"| Years:"+y);
  }
  
}

window.addFields = function (){
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
    document.getElementById("nextBtn").style.visibility="hidden";
    document.getElementById("final_submit").style.visibility="visible";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  //... and run a function that will display the correct step indicator:
  fixStepIndicator(n);
}
var currTab = 0;









window.nextPrev = function (n){
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
    checkData();
    console.log(exp_dataEntries);
    var send_data = [
      fName.value,
      lName.value,
      username.value,
      businessEmail.value,
      phoneNumber.value,
      address.value,
      address2.value,
      city.value,
      zip.value,
      typeOfProvider,
      selfDescription.value,
      CV.value,
      brand_name.value,
      brand_desc.value,
      availability.value,
      acc_email.value,
      acc_pass.value
    ];
    localStorage.setItem("Data",send_data);
    localStorage.setItem("exp_entries",
    exp_dataEntries);
    
    
    return false;
  }
  // Otherwise, display the correct tab:
  currTab = currentTab;
  showTab(currentTab);
}

//skip CV part
window.skipCV=function (){
  document.getElementById('formFileLg').classList.remove("invalid");
  document.getElementById('formFileLg').disabled = true;
  CVskipped = true;
  return false;
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


