// Initialize firebase
firebase.initializeApp(firebaseConfig);

var buttonModify = document.getElementById("buttonModify");

buttonModify.addEventListener("click", function () {
    document.location.href = "../views/form.html";
});

var buttonHome = document.getElementById("buttonHome");

buttonHome.addEventListener("click", function () {
    document.location.href = "../index.html";
})

// Observe user auth state
firebase.auth().onAuthStateChanged(function (user) {
    if (user && !user.isAnonymous) {
        // User is signed in.
        $("#login").css("display", "none");
        $("#logout").css("display", "inline");
        $("#setting").css("display", "inline");
        getFormDataFromFirebaseDb(user.uid)
            .then((snap) => {
                let formData = snap.val();
                generatePDF(formData);
            });
    } else {
        // No user is signed in.
        $("#login").css("display", "inline");
        $("#logout").css("display", "none");
        $("#setting").css("display", "none");
        generatePDF(getFormDataFromLocalStorage());
    }
});

function getFormDataFromLocalStorage() {
    var storage = window.localStorage;

    return {
        fullname: storage.getItem("fullname"),
        postalCode: storage.getItem("postalCode"),
        familySize: storage.getItem("familySize"),
        children: storage.getItem("children"),
        medication: storage.getItem("medication"),
        mobility: storage.getItem("mobility")
    }
}

function getFormDataFromFirebaseDb(userId) {
    let dbRef = firebase.database().ref('forms/' + userId);
    return dbRef.once('value');
}

function generatePDF(formData) {
    var doc = new jsPDF();
    var row = 1;
    for (let key in formData) {
        doc.text(key + ": " + formData[key], 20, row * 10 + 10);
        row++;
    }
    var pdfBlob = doc.output('blob', 'DPPG.pdf');
    $('#tab-1').attr('src', URL.createObjectURL(pdfBlob));
}
