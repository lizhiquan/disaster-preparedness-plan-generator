var submitButton = document.getElementById("submit");
submitButton.addEventListener("click", function () {
    window.location.href = "../views/reference_sheet.html";
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

