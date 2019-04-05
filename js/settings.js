// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Handle add item button's click event
$("#addItem").click(function (e) {
    e.preventDefault();

    let userId = getUserId();
    if (userId != null) {
        saveSettingsDataToFirebaseDb(generateRowID(), getSettingsData(), userId);
    } else {
        saveSettingsDataToLocalStorage(getSettingsData());
    }
    return false;
});

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

function saveSettingsDataToFirebaseDb(id, settingsData, userId) {
    if (userId == null) {
        return;
    }
    let updates = {};
    updates['/settings/' + userId + '/' + id] = settingsData;
    firebase.database().ref().update(updates);
    addItem(id, settingsData);
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

function fetchCurrentUserSettings() {
    firebase.database().ref("settings")
        .child(getUserId())
        .once('value')
        .then((snapshot) => {
            updateHtmlTableValues(snapshot.val());
        });
}

function addItem(id, item) {
    let i1 = $("<td scope='row'></td>").html(item.itemName);
    let i2 = $("<td></td>").html(item.itemType);
    let i3 = $("<td></td>").html(item.dateAdded);
    let i4 = $("<td></td>").html(item.expireDate);
    let i5 = $("<button></button>")
        .addClass('btn btn-danger')
        .text("Delete");
    
    let table = $("#nutritionTable");
    let row = $("<tr></tr>")
        .attr('id', id)
        .append(i1, i2, i3, i4, i5);
    table.append(row);

    i5.click(function (e) {
        e.preventDefault();
        row.remove();
        removeFirebaseRecord(id);
        return false;
    });
}

function updateHtmlTableValues(userSettings) {
    for (let id in userSettings) {
        let item = userSettings[id];
        addItem(id, item);
    }
};

function removeFirebaseRecord(id) {
    console.log(id);
    firebase.database().ref("settings/" + getUserId() + "/" + id)
        .remove(() => {
            console.log('Delete successfully!');
        });
}