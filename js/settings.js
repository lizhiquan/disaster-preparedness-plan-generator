// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Handle log out button's click event
$("#logout").click(function (e) {
    e.preventDefault();
    logout();
    return false;
});

// Observe user auth state
firebase.auth().onAuthStateChanged(function (user) {
    if (user && !user.isAnonymous) {
        // User is signed in.
        fetchCurrentUserSettings();
    } else {
        // No user is signed in.
        document.location.href = "../index.html";
    }
});

function logout() {
    firebase.auth().signOut()
        .then(function () {
            // Sign-out successful.
            document.location.href = "../index.html";
        })
        .catch(function (error) {
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
    updates['/settings/' + userId + '/' + generateRowID()] = settingsData;
    return firebase.database().ref().update(updates);
}

function generateRowID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var length = 10;
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
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

function addItem() {
    var itemName = document.getElementById("itemName").value;
    var itemType = document.getElementById("itemType").value;
    var dateAdded = document.getElementById("dateAdded").value;
    var expireDate = document.getElementById("expireDate").value;

    var i1 = $("<td></td>").html(itemName).addClass("col1");
    var i2 = $("<td></td>").html(itemType).addClass("col2");
    var i3 = $("<td></td>").html(dateAdded).addClass("col3");
    var i4 = $("<td></td>").html(expireDate).addClass("col4");
    var i5 = $("<button></button>").attr('id', 'remove').text("Delete").addClass("col5");
    
    var table = $("#nutritionTable");
    var row = $("<tr></tr>").append(i1, i2, i3, i4, i5);
    table.append(row);

    i5.click(function (e) {
        e.preventDefault();
        row.remove();
        return false;
    });
};

function updateHtmlTableValues(userSettings) {
    for (let id in userSettings) {
        let item = userSettings[id];
        var i1 = $("<td></td>").html(item.itemName).addClass("col1");
        var i2 = $("<td></td>").html(item.itemType).addClass("col2");
        var i3 = $("<td></td>").html(item.dateAdded).addClass("col3");
        var i4 = $("<td></td>").html(item.expireDate).addClass("col4");
        var i5 = $("<button></button>").attr('id', 'remove').text("Delete").addClass("col5");
        
        var table = $("#nutritionTable");
        var row = $("<tr></tr>").append(i1, i2, i3, i4, i5);
        table.append(row);
    
        i5.click(function (e) {
            e.preventDefault();
            row.remove();
            return false;
        });
    }
};

function fetchCurrentUserSettings() {
    firebase.database().ref("settings")
        .child(getUserId())
        .once('value')
        .then((snapshot) => {
            updateHtmlTableValues(snapshot.val());
        });
}