let btn = document.getElementById("AiFill"),
    href = '';

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].id) {
        chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "href?"},
        (response) => {
        }
        );
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "href") {
        href = message.data;

        btn.addEventListener("click", (()=> {
            if (href.includes("https://docs.google.com")) {
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
    } else if (message.action == "done") {
        btn.innerHTML = "Completed!";
        btn.style.background = "#4e8056";
    } else if (message.action == "reset") {
        btn.innerHTML = "Ai Fill";
        btn.style.background = "";
    }
});
