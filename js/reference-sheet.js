// Initialize firebase
firebase.initializeApp(firebaseConfig);

// Handle modify button's click event
$(".buttonModify").click(function (e) { 
    e.preventDefault();
    document.location.href = "../views/form.html";
    return false;
});

// Handle home button's click event
$("#buttonHome").click(function (e) { 
    e.preventDefault();
    document.location.href = "../index.html";
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
        $("#login").css("display", "none");
        $("#logout").css("display", "inherit");
        $("#setting").css("display", "inherit");
        getFormDataFromFirebaseDb(user.uid)
            .then((snap) => {
                let formData = snap.val();
                handleFormData(formData);
            });
    } else {
        // No user is signed in.
        $("#login").css("display", "inherit");
        $("#logout").css("display", "none");
        $("#setting").css("display", "none");
        handleFormData(getFormDataFromLocalStorage());
    }
});

// Logging out the current user
function logout() {
    firebase.auth().signOut()
        .then(function() {
            document.location.href = "../views/form.html";
        })
        .catch(function(error) {
            console.log(error);
        });
}

// Getting the form data from local storage
function getFormDataFromLocalStorage() {
    var storage = window.localStorage;

    return {
        fullname: storage.getItem("fullname"),
        postalCode: storage.getItem("postalCode"),
        familySize: storage.getItem("familySize"),
        children: storage.getItem("children"),
        medication: storage.getItem("medication"),
        mobility: storage.getItem("mobility"),
        pet: storage.getItem("pet")
    }
}

// Fetching data from firebase
function getFormDataFromFirebaseDb(userId) {
    let dbRef = firebase.database().ref('forms/' + userId);
    return dbRef.once('value');
}

// Fetching checklist from firebase
function getChecklists(formData) {
    firebase.database().ref()
        .child('checklists')
        .once('value')
        .then((snapshot) => {
            generatePDF(formData, snapshot.val());
        });
}

// Handles user form data
function handleFormData(formData) {
    getChecklists(formData);
}

// Generates the custom disaster survival kit
function generatePDF(formData, checklists) {
    let doc = new jsPDF();
    let title = formData.fullname + "'s Emergency Checklist";
    doc.setProperties({ title: title });

    let generalBody = checklists.general
        .map(x => [x.itemName, x.itemType, getQuantity(x.quantity, formData)]);
    let carBody = checklists.car
        .map(x => [x.itemName, x.itemType, getQuantity(x.quantity, formData)]);
    let petsBody = checklists.pets
        .map(x => [x.itemName, x.itemType, getQuantity(x.quantity, formData)]);

    let medicationBody = null;
    let medicationName = 'Medication - ' + formData.medication;
    switch (formData.medication) {
        case 'Asthma':
            medicationBody = checklists.medication.asthma;
            break;
        case 'Diabetes':
            medicationBody = checklists.medication.diabetes;
            break;
        case 'Risk of Cardiac Events':
            medicationBody = checklists.medication.heartAttack;
            break;
    }
    if (medicationBody != null ) {
        medicationBody = medicationBody.map(x => [x.guidelines]);
    }

    let finalY = 20;
    doc.setFontSize(20);
    doc.text(title, 55, finalY);

    finalY += 10;
    doc.setFontSize(16);
    doc.text('General Checklist', 16, finalY);

    finalY += 5;
    doc.autoTable({
        startY: finalY,
        head: [['Item Name', 'Item Type', 'Quantity']],
        body: generalBody,
        headStyles: { fontSize: 12 },
        bodyStyles: { fontSize: 11 }
    });

    if (medicationBody != null) {
        finalY = doc.previousAutoTable.finalY + 10;
        doc.text(medicationName, 16, finalY);

        finalY = doc.previousAutoTable.finalY + 15;
        doc.autoTable({
            startY: finalY,
            head: [['Guidelines']],
            body: medicationBody,
            headStyles: { fontSize: 12 },
            bodyStyles: { fontSize: 11 }
        });
    }

    if (formData.mobility == 'yes') {
        finalY = doc.previousAutoTable.finalY + 10;
        doc.text('Car Emergency Kit', 16, finalY);

        finalY = doc.previousAutoTable.finalY + 15;
        doc.autoTable({
            startY: finalY,
            head: [['Item Name', 'Item Type', 'Quantity']],
            body: carBody,
            headStyles: { fontSize: 12 },
            bodyStyles: { fontSize: 11 }
        });
    }

    if (formData.pet == 'yes') {
        finalY = doc.previousAutoTable.finalY + 10;
        doc.text('Pets', 16, finalY);

        finalY = doc.previousAutoTable.finalY + 15;
        doc.autoTable({
            startY: finalY,
            head: [['Item Name', 'Item Type', 'Quantity']],
            body: petsBody,
            headStyles: { fontSize: 12 },
            bodyStyles: { fontSize: 11 }
        });
    }

    var pdfData = doc.output('datauri');
    $('#tab-1').attr('src', pdfData);

    // Handle download button's click event
    $(".download-button").click(function (e) { 
        e.preventDefault();
        doc.save(title + '.pdf');
        return false;
    });
}

// Mapping variables form checklist to real values
function getQuantity(val, formData) {
    if (val == 'hSize') {
        return formData.familySize;
    } else if (val == 'waterQty') {
        return (formData.familySize - formData.children / 2) * 4 + " litres";
    } else if (val == 'foodQty') {
        return formData.familySize - formData.children / 2;
    }
    return val;
}