var submitButton = document.getElementById("submit");
var notificationDialog = document.getElementById("notificationDialogContainer");

submitButton.addEventListener("click", function () {
    saveFormData();
    notificationDialog.style.display = "block";
});

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        $("#login").css("display", "none");
        $("#logout").css("display", "inline");
    } else {
        // No user is signed in.
        $("#login").css("display", "inline");
        $("#logout").css("display", "none");
    }
});

$("#logout").click(function (e) { 
    e.preventDefault();
    logout();
    return false;
});

function logout() {
    firebase.auth().signOut()
        .then(function() {
            // Sign-out successful.
        })
        .catch(function(error) {
            // An error happened
            console.log(error);
        });
}

function saveFormData() {
    var fullname = $("#fullname").val();
    var postalCode = $("#postalCode").val();
    var familySize = $("#familySize").val();
    var children = $("#children").val();
    var medication = $("input[name=medication]:checked").val();
    var mobility = $("input[name=mobility]:checked").val();
    
    var storage = window.localStorage;
    storage.setItem("fullname", fullname);
    storage.setItem("postalCode", postalCode);
    storage.setItem("familySize", familySize);
    storage.setItem("children", children);
    storage.setItem("medication", medication);
    storage.setItem("mobility", mobility);
}