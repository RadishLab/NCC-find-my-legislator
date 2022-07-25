/**
* JavaScript code for civicinfo.representatives.representativeInfoByAddress
* https://developers.google.com/explorer-help/code-samples#javascript
*/

//Init App after load
if(window.attachEvent) {
  window.attachEvent('onload', init);
} else {
  if(window.onload) {
      var curronload = window.onload;
      var newonload = function(evt) {
          curronload(evt);
          init(evt);
      };
      window.onload = newonload;
  } else {
      window.onload = init;
  }
}

/**
 * Init App
 */
 function init() {
  loadClient();
  resultsContainer = document.getElementById("results_container");
}

//Load Client
function loadClient() {
let API_KEY = "AIzaSyAJzRTiaQvUM6wvXV-rXYJJUMoh8czJgws";
gapi.client.setApiKey(API_KEY);
return gapi.client.load("https://civicinfo.googleapis.com/$discovery/rest?version=v2")
    .then(function() { console.log("GAPI client loaded for API"); revealForm(); },
          function(err) { console.error("Error loading GAPI client for API", err); });
}
// Client must be loaded before calling this method.
function execute() {
  resultsContainer.innerHTML = "";
  hideReps();
  colorGrade();
  document.getElementById("loader").className = "lds-dual-ring visible";

  let address = document.getElementById("address");
  if (address.value.length < 1) {
      alert ('You must add an address');
      return;
  }

  return gapi.client.civicinfo.representatives.representativeInfoByAddress({
    "address": address.value,
    "roles": [
      "legislatorUpperBody",
      "legislatorLowerBody"
    ],
    "levels": [
      "administrativeArea1"
    ]
  })
      .then(function(response) {
              // Handle the results here (response.result has the parsed body).
              if(response.result.normalizedInput.zip) {
                if(response.result.normalizedInput.state != "NC"){
                  displayError("Searches are only supported for the state of North Carolina.");
                }else{
                  displayResults(response.result);
                }
              } else {
                displayError("Please specify the address better by adding more details such as zip code.");
              }
            },
            function(err) { displayError(err.result.error.message); });
}
gapi.load("client");

var resultsContainer;


/**
 * Displays the error status in the frontend
 */
 function displayError(err) {
  document.getElementById("loader").className = "invisible";
  resultsContainer.innerHTML = "<p class=\"error\">" + err + "</p>";
}

/**
 * Displays the search results in the frontend
 */
 function displayResults(result) {
  document.getElementById("loader").className = "invisible";
  (result.officials) ? resultsContainer.innerHTML = normalizedInput(result) + officials(result) : displayError("No results found");
}

/**
 * Reveal the search form in the frontend
 */
 function revealForm() {
  document.getElementById("address").className = "visible";
  document.getElementById("execute-search-btn").className = "visible";
  document.getElementById("loader").className = "invisible";
}

/**
 * Return normalized address
 */
function normalizedInput(result) {
  let normalizedInput = "<br /><h3 class=\"results-title\">Your Legislators</h3>";
  normalizedInput += "Results for " + result.normalizedInput.line1;
  normalizedInput += " " + result.normalizedInput.city;
  normalizedInput += " " + result.normalizedInput.state;
  normalizedInput += " (" + result.normalizedInput.zip + ")<br /><br /><br />";

  return normalizedInput;
}

/**
 * Return officials
 */
 function officials(result) {

  if(!result.officials) {
    return "No results found";
  }

  let officials = result.officials;
  let officials_html = "";


  let found_reps = [];

  officials_html += "<div id=\"debug_content\" style=\"display:none; backgroud-color:#eee\">";

  officials.forEach(function (official, i) {
    let rep_data = { };
    rep_data["rep_name"] = official.name;
    rep_data["rep_district"] = returnDistrict(result.offices[i].divisionId);
    found_reps.push(rep_data);
    officials_html += "<p>Name: <b>" + official.name + "</b></p>";
    officials_html += "<p>Role: " + returnRoleString(result.offices[i].roles[0]) + "</p>";
    officials_html += "<p>District: " + returnDistrict(result.offices[i].divisionId) + "</p>";
  });

  officials_html += "</div>";

  revealReps(found_reps);

  return officials_html;
}

/**
 * Show/Hide debug info box
 */
function toggleDebugInfo() {
  var x = document.getElementById("debug_content");
  if (x.style.display === "none") {
    return;
  } else {
    x.style.display = "none";
  }
}

/**
 * This function returns the district number using as input 
 * the division ID string returned by the Google Civic Information API
 */
 function returnDistrict(divisionId) {
  return /[^:]*$/.exec(divisionId)[0];
}

/**
 * This function returns the representative role string using as input 
 * the raw role string returned by the Google Civic Information API
 */
function returnRoleString(roleStr) {
  return (roleStr == 'legislatorUpperBody') ? 'Senator' : 'Deputy';
}

/**
 * This function reveal the representative div contents
 * If is present in the API results
 */
function revealReps(found_reps) {
  let reps_container = document.querySelectorAll(".ga-members-list-wrapper .w-dyn-items");
  reps_container.forEach(function(container) {
    let reps = container.querySelectorAll(".ga-members-item"); 
    reps.forEach(function(content) {
      let memberDistrict = content.querySelector(".c-district").querySelector(".district-number").innerHTML;
      let memberName = content.querySelector(".ga-member-info-block").querySelector("h5").innerHTML;
      let memberLastName = memberName.split(' ').slice(-1).join(' ');
      found_reps.forEach(function(current_rep) {
        let current_rep_last_name = current_rep.rep_name.split(' ').slice(-1).join(' ');
        if(current_rep.rep_district == memberDistrict && current_rep_last_name == memberLastName) {
          content.style.display = "block";
        }
      });
    });
  });
}


/**
 * This function hide the representative div contents
 * to wait for a new results set
 */
 function hideReps() {
  var reps_container = document.querySelectorAll(".ga-members-list-wrapper .w-dyn-items");
  reps_container.forEach(function(container) {
    let reps = container.querySelectorAll(".ga-members-item"); 
    reps.forEach(function(content) {
      content.style.display = "none";
    });
  });
}

/**
 * This function color the representative grade
 */
 function colorGrade() {
  var reps_container = document.querySelectorAll(".ga-members-list-wrapper .w-dyn-items");
  reps_container.forEach(function(container) {
    let reps = container.querySelectorAll(".ga-members-item"); 
    reps.forEach(function(content) {
      let memberScoreContainer = content.querySelector(".link-block").querySelector(".ga-member-block").querySelector(".ga-member-score")
      let memberGrade = memberScoreContainer.innerHTML;
      if (memberGrade == 'A' || memberGrade == 'A+') {
          memberScoreContainer.style.background = '#52A845';
      }
    });
  });
}