// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Handle submit button's click event
$("#submit").click(function (e) {
    e.preventDefault();
    
    if ($('#userForm').valid()) {
        let userId = getUserId();
        if (userId != null) {
            saveFormDataToFirebaseDb(getFormData(), userId);
            $('#notificationDialogContainer').modal('show');
        } else {
            saveFormDataToLocalStorage(getFormData());
            document.location.href = "./reference-sheet.html";
        }
    }
    return false;
});

// Handle log out button's click event
$("#logout").click(function (e) { 
    e.preventDefault();
    logout();
    return false;
});

// Handle close login dialog button's click event
$("#closeLoginDialog").click(function (e) { 
    e.preventDefault();
    closeLoginDialog();
    return false;
});

// Handle 'no' notifications dialog button's click event
$("#notificationsButtonNo").click(function (e) { 
    e.preventDefault();
    document.location.href = "./reference-sheet.html";
    return false;
});

// Handle 'yes' notifications dialog button's click event
$("#notificationsButtonYes").click(function (e) { 
    e.preventDefault();
    document.location.href = "./reference-sheet.html";
    return false;
});

var ui = new firebaseui.auth.AuthUI(firebase.auth());
var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            closeLoginDialog();
            return false;
        },
        uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: '#',
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    // Terms of service url.
    tosUrl: '#',
    // Privacy policy url.
    privacyPolicyUrl: '#'
};

ui.start('#firebaseui-auth-container', uiConfig);

// Observe user auth state
firebase.auth().onAuthStateChanged(function (user) {
    if (user && !user.isAnonymous) {
        // User is signed in.
        $("#login").css("display", "none");
        $("#logout").css("display", "inherit");
        $("#setting").css("display", "inherit");
        fetchFormData(user.uid);
    } else {
        // No user is signed in.
        $("#login").css("display", "inherit");
        $("#logout").css("display", "none");
        $("#setting").css("display", "none");
    }
});

function closeLoginDialog() {
    $("#loginDialogContainer").modal('hide');
}

//Function for logging out the user
function logout() {
    firebase.auth().signOut()
        .then(function() {
            // Sign-out successful.
            clearForm();
        })
        .catch(function(error) {
            // An error happened
            console.log(error);
        });
}

//Support function for getting the user ID
function getUserId() {
    let user = firebase.auth().currentUser;
    return (user && !user.isAnonymous) ? user.uid : null;
}

//Function for getting the form data
function getFormData() {
    return {
        fullname: $("#fullname").val(),
        postalCode: $("#postalCode").val(),
        familySize: $('.btn-group > .btn.active').text().trim(),
        children: $("#children").val(),
        medication: $("#medication").val(),
        mobility: $("input[name=mobility]:checked").val(),
        pet: $("input[name=pet]:checked").val()
    };
}

//Function for saving the form data we got to Firebase
function saveFormDataToFirebaseDb(formData, userId) {
    if (userId == null) {
        return;
    }
    let updates = {};
    updates['/forms/' + userId] = formData;
    return firebase.database().ref().update(updates);
}

//Function for saving the form data to local storage
function saveFormDataToLocalStorage(formData) {
    var storage = window.localStorage;
    for (let key in formData) {
        storage.setItem(key, formData[key]);
    }
}

//Function for grabbing the data from Firebase
function fetchFormData(userId) {
    let dbRef = firebase.database().ref('forms/' + userId);
    dbRef.once('value', (snap) => {
        let formData = snap.val();
        updateHtmlFormValues(formData);
    });
}

//Function for updating the form with data from Firebase
function updateHtmlFormValues(formData) {
    $("#fullname").val(formData.fullname);
    $("#userName").text(formData.fullname);
    $("#postalCode").val(formData.postalCode);
    $("#familySize" + formData.familySize).button('toggle');
    $("#children").val(formData.children);
    $("#medication").val(formData.medication);
    $("#mobilityYes").prop('checked', formData.mobility == 'yes');
    $("#petYes").prop('checked', formData.pet == 'yes');
}

//Function for clearing the form when the user logs out
function clearForm() {
    $("#fullname").val('');
    $("#userName").text('there');
    $("#postalCode").val('');
    $("#familySize1").button('toggle');
    $("#children").val(0);
    $("#medication").val('None');
    $("#mobilityYes").prop('checked', false);
    $("#petYes").prop('checked', false);
    $("#mobilityNo").prop('checked', true);
    $("#petNo").prop('checked', true);
}