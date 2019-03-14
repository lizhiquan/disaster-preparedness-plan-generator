var submitButton = document.getElementById("submit");
submitButton.addEventListener("click", function () {
  window.location.href = "../views/reference_sheet.html";
})

firebase.initializeApp(firebaseConfig);

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        $("#login").css("display", "none");
        $("#logout").css("display", "inline");
        submitButton.addEventListener("click", function () {
          window.location.href = "../views/notificationWarning";
        })
    } else {
        // No user is signed in.
        $("#login").css("display", "inline");
        $("#logout").css("display", "none");
        submitButton.addEventListener("click", function () {
          window.location.href = "../views/reference_sheet.html";
        })
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