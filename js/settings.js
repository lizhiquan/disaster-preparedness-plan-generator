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
    clearSettingForm();
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
    let deleteButton = $("<button></button>")
        .append($("<i class='material-icons'>delete</i>"))
        .addClass('btn btn-link text-light float-right delete-button')
        .attr('type', 'button')
        .attr('data-toggle', 'modal')
        .attr('data-target', '#confirmDeleteModal')
        .attr('data-id', id)
        .attr('data-name', item.itemName);
    let i5 = $("<td></td>").append(deleteButton);
    
    let table = $("#nutritionTable");
    let row = $("<tr></tr>")
        .attr('id', id)
        .append(i1, i2, i3, i4, i5);
    table.append(row);
}

$('#confirmDeleteModal').on('show.bs.modal', function (event) {
    let button = $(event.relatedTarget);
    let itemName = button.data('name');
    let itemId = button.data('id');
    let row = $("tr[id='" + itemId + "']");

    let modal = $(this);
    modal.find('.modal-item-name').text(itemName);
    modal.find('#confirmDeleteYesButton').click(function (e) {
        e.preventDefault();
        row.remove();
        removeFirebaseRecord(itemId);
        modal.modal('hide');
    });
  })

function updateHtmlTableValues(userSettings) {
    // Sort by item name
    let list = [];
    for (var id in userSettings) {
        list.push([id, userSettings[id]]);
    }
    list.sort(function(a, b) {
        var x = a[1].itemName;
        var y = b[1].itemName;
        return x < y ? -1 : x > y ? 1 : 0;
    });
    
    for (let i in list) {
        console.log(i);
        let id = list[i][0];
        let item = list[i][1];
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

function clearSettingForm() {
    $("#itemName").val('');
    $("#dateAdded").val('');
    $("#expireDate").val('');
}