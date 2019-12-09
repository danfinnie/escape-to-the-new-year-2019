// client-side js
// run by the browser each time your view template referencing it is loaded

console.log("hello world :o");

const gangs = [];

// define variables that reference elements on our page
const gangsForm = document.forms[0];
const gangNameInput = gangsForm.elements["gang-name"];
const gangLeaderInput = gangsForm.elements["gang-leader"];
const gangsList = document.getElementById("gangs");
const clearButton = document.querySelector('#clear-gangs');

// request the gangs from our app's sqlite database
fetch("/getGangs", {})
  .then(res => res.json())
  .then(response => {
    document.getElementById("count").innerText = "(" + response.correct.length + "/" + response.numTotal + ")"
    response.correct.forEach(row => {
      appendNewGang(document.getElementById("correctIntel"), row);
    });
   response.incorrect.forEach(row => {
      appendNewGang(document.getElementById("incorrectIntel"), row);
    });
  });

// a helper function that creates a list item for a given dream
const appendNewGang = (element, gang) => {
  const newListItem = document.createElement("li");
  newListItem.innerText = gang.gangName + " - " + gang.gangLeader;
  element.appendChild(newListItem);
};

// listen for the form to be submitted and add a new dream when it is
gangsForm.onsubmit = event => {
  // stop our form submission from refreshing the page
  event.preventDefault();

  const data = { gangName: gangNameInput.value, gangLeader: gangLeaderInput.value };
  
  if (data.gangName == "" || data.gangLeader == "") {
    window.alert("Did you forget something?  El Chapo does not accept mistakes.");
    return;
  }

  fetch("/addGang", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => window.location.reload());
};

clearButton.addEventListener('click', event => {
  fetch("/clearGangs", {})
    .then(res => window.location.reload());
});
