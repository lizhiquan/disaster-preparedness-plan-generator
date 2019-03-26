var buttonModify = document.getElementById("buttonModify");

buttonModify.addEventListener("click", function () {
    document.location.href = "../views/form.html";
});

var buttonHome = document.getElementById("buttonHome");

buttonHome.addEventListener("click", function () {
    document.location.href = "../index.html";
})

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

generatePDF(getFormDataFromLocalStorage());