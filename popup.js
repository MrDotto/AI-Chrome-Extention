let btn = document.getElementById("AiFill"),
    herf = '';

btn.addEventListener("click", (()=> {
    if (!herf.includes("https://docs.google.com/forms/d/")) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0].id) {
                chrome.tabs.sendMessage(
                tabs[0].id,
                { action: "Fill"},
                (response) => {
                }
                );
            }
        });
        btn.innerHTML = "loading...";
    } else {
        btn.innerHTML = "Not google forms";
    }
}));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "herf") {
        herf = message.data;
    } else if (message.action == "done") {
        btn.innerHTML = "Completed!";
        btn.style.background = "#4e8056";
    }
});
