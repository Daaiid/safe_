let checkbox = document.getElementById('run-localhost-checkbox')


chrome.storage.sync.get('useLocalApi', function (data) {
    if (data) {
        checkbox.checked = data.useLocalApi
    }
});


let checkBoxisChecked = checkbox.checked

checkbox.addEventListener('change', function () {
    checkBoxisChecked = checkbox.checked
    chrome.storage.sync.set({ useLocalApi: checkBoxisChecked });
});
