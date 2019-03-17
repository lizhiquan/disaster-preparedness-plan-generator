var buttonModify = document.getElementById("buttonModify");

buttonModify.addEventListener("click", function() {
  document.location.href = "../views/form.html";
});

var buttonHome = document.getElementById("buttonHome");

buttonHome.addEventListener("click", function() {
  document.location.href = "../index.html";
})

function generatePDF() {
    var storage = window.localStorage;

    var fullname = storage.getItem("fullname");
    var postalCode = storage.getItem("postalCode");
    var familySize = storage.getItem("familySize");
    var children = storage.getItem("children");
    var medication = storage.getItem("medication");
    var mobility = storage.getItem("mobility");
}