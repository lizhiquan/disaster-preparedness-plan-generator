// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Handle add item button's click event
$("#submit").click(function (e) { 
    e.preventDefault();
    
    let userId = getUserId();
    if (userId != null) {
        saveSettingsDataToFirebaseDb(getSettingsData(), userId);
    } else {
        saveSettingsDataToLocalStorage(getSettingsData());
    }

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

ui.start('#firebaseui-auth-container', uiConfig);

// Observe user auth state
firebase.auth().onAuthStateChanged(function (user) {
    if (user && !user.isAnonymous) {
        // User is signed in.
        $("#login").css("display", "none");
        $("#logout").css("display", "inline");
        $("#setting").css("display", "inline");
        fetchFormData(user.uid);
    } else {
        // No user is signed in.
        $("#login").css("display", "inline");
        $("#logout").css("display", "none");
        $("#setting").css("display", "none");
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

function getSettingsData() {
    return {
        itemName: $("#itemName").val(),
        itemType: $("#itemType").val(),
        dateAdded: $("#dateAdded").val(),
        expireDate: $("#expireDate").val(),
    };
}

function getUserId() {
    let user = firebase.auth().currentUser;
    return (user && !user.isAnonymous) ? user.uid : null;
}

function saveSettingsDataToLocalStorage(settingsData) {
    var storage = window.localStorage;
    for (let key in settingsData) {
        storage.setItem(key, settingsData[key]);
    }
}

function saveSettingsDataToFirebaseDb(settingsData, userId) {
    if (userId == null) {
        return;
    }
    let updates = {};
    updates['/settings/' + userId] = settingsData;
    return firebase.database().ref().update(updates);
}

function fetchSettingsData(userId) {
    let dbRef = firebase.database().ref('settings/' + userId);
    dbRef.once('value', (snap) => {
        let settingsData = snap.val();
        updateHtmlSettingsValues(settingsData);
    });
}

// function updateHtmlFormValues(formData) {
//     $("#fullname").val(formData.fullname);
//     $("#postalCode").val(formData.postalCode);
//     $("#familySize").val(formData.familySize);
//     $("#children").val(formData.children);
//     $("#medicationYes").prop('checked', formData.medication == 'yes');
//     $("#mobilityYes").prop('checked', formData.mobility == 'yes');
// }