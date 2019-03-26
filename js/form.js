// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Handle submit button's click event
$("#submit").click(function (e) { 
    e.preventDefault();
    saveFormData();
    var notificationDialog = document.getElementById("notificationDialogContainer");
    notificationDialog.style.display = "block";
    return false;
});

// Handle home button's click event
$("#buttonHome").click(function (e) { 
    e.preventDefault();
    document.location.href = "../index.html";
    return false;
})

// Handle log out button's click event
$("#logout").click(function (e) { 
    e.preventDefault();
    logout();
    return false;
});

// Observe user auth state
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        $("#login").css("display", "none");
        $("#logout").css("display", "inline");
        console.log(user);
    } else {
        // No user is signed in.
        $("#login").css("display", "inline");
        $("#logout").css("display", "none");
    }
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