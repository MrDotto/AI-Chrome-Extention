var token = '',
    data = [],
    id = 0,
    formID = window.location.href.match(/\/d\/e\/([\w-]+)/)?.[1],
    fetchesDone = 0;

document.addEventListener("DOMContentLoaded", () => {
    token = JSON.parse(document.all[20].innerHTML.replace("_docs_flag_initialData=", '').replace(";", '')).info_params.token;
});

function AIFill() {
    if (window.location.href.includes("https://docs.google.com/forms/d/")) {
        document.querySelector("#mG61Hd > div.RH5hzf.RLS9Fe > div").querySelectorAll('[role="listitem"]').forEach((item, i) => {
            let question = '',
                input = null,
                type = null,
                answers = [];

            try {
                question = item.querySelector("[jscontroller=sWGJ4b] > .z12JJ > div > div:nth-child(1) > span").innerHTML.replace(/&[^;]+;/g, '').replace(/<\/?[^>]+>/g, '');
            } catch (e) {}

            if (item.querySelector(".M4DNQ") && item?.querySelector("div.AgroKb > [jsname='YPqjbf'] > .oJeWuf")?.children?.length) {
                type = 'FITB';
                if (item.querySelector("div.AgroKb > [jsname='YPqjbf'] > .oJeWuf").children.length > 1) {
                    input = JSON.parse("[" + item.querySelector('div').getAttribute('data-params').toString().replace("%.@.", ''))[0][4][0][0];
                } else {
                    input = JSON.parse("[" + item.querySelector('div').getAttribute('data-params').toString().replace("%.@.", ''))[0][4][0][0];
                }
            } else if (item.querySelector(".M4DNQ") && !item?.querySelector("div.AgroKb > [jsname='YPqjbf'] > .oJeWuf")?.children?.length) {
                if (item.querySelector("div > [jsname=WsjYwc] > [jsname=GCYh9b]")) {
                    type = 'SOO';
                    answers = Array.from(item.querySelector("div > .oyXaNc > [jsname=cnAzRb] > div > span > .SG0AAe").querySelectorAll('.nWQGrd')).map((item) => {
                        return item.querySelector("label > div > div:nth-child(2) > div > span").innerHTML;
                    });
                    input = JSON.parse("[" + item.querySelector('div').getAttribute('data-params').toString().replace("%.@.", ''))[0][4][0][0];
                } else if (item.querySelector("div > [jsname=WsjYwc] > .Y6Myld")) {
                    type = 'SCB';
                    answers = Array.from(item.querySelector("div > [jsname=WsjYwc] > .Y6Myld  > [role=list]").querySelectorAll('.eBFwI')).map((item) => {
                        return item.querySelector("label > div > div:nth-child(2) > div > span").innerHTML;
                    });
                    input = JSON.parse("[" + item.querySelector('div').getAttribute('data-params').toString().replace("%.@.", ''))[0][4][0][0];
                } else {
                    type = 'SDD';
                    input = '';
                }
            }

            if (question != '') {
                let AIreq = '';
                if (type == "FITB") {
                    AIreq = `Provide a human-like, concise response for the following question (around 50 characters or less): ${question}`;
                } else if (type == "SOO") {
                    AIreq = `Given the question: "${question}", select the single best answer from the provided options array: ${answers}. Return only the INDEX, not answer. INDEX OF THE answer: (0, 1, 2, etc...) of the correct answer from the options array ${answers}. Respond with the index as a single integer only, with no additional text, explanations, or dialogue. Return the best answer. if invalid return [0]`;
                } else if (type == "SCB") {
                    AIreq = `For the question: "${question}", identify ALL correct answers from the provided options: ${answers}. Return ONLY an ARRAY containing the indices of the correct answers (e.g., [0, 2, 3]). Provide NO additional text, explanations, or dialogue. This response will be processed by an algorithm, so follow the instructions precisely. Return the best answer(s). if invalid return [0]`;
                }

                data.push({
                    type: type,
                    question: question,
                    answers: answers,
                    input: input,
                    id: id,
                    result: undefined
                });

                chrome.runtime.sendMessage({
                    id,
                    question,
                    answers,
                    AIreq
                });
                ++id;
            }
        });
    }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "Fill") {
        AIFill();
        return false;
    }

    if (!message.result) {
        return false;
    }

    data.find((a) => a.id == message.request.id).result = message.result;

    if (data.every(item => item.result !== undefined)) {
        for (const item of data) {
            try {
                const type = item.type;
                item.result = item.result.trim().toLowerCase().toString();
                fetchData = '';

                if (type == "FITB") {
                    fetchData = "draft_response_action_request=" + encodeURIComponent(JSON.stringify([
                            1, "", [
                                [null, null, [item.result], 0, null, null, item.input]
                            ], Date.now()
                        ]));
                } else if (type == "SOO") {
                    fetchData = "draft_response_action_request=" + encodeURIComponent(JSON.stringify([
                            1, "", [
                                [null, null, [item.answers[item.result]], 0, null, null, item.input]
                            ], Date.now()
                        ]));
                } else if (type == "SCB") {
                    let allItems = [];
                    for (const response of JSON.parse(item.result)) {
                        allItems.push(item.answers[response]);
                    }
                    fetchData = "draft_response_action_request=" + encodeURIComponent(JSON.stringify([
                            1, allItems.length == 1 ? "" : null, [
                                [null, null, allItems, 0, null, null, item.input]
                            ], allItems.length == 1 ? Date.now() : null, [Date.now().toString()]
                        ]));
                }

                await delay(1000);
                fetch(`https://docs.google.com/forms/u/0/d/e/${formID}/draftresponse?token=${token}`, {
                    "headers": {
                        "accept": "*/*",
                        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                    },
                    "referrer": window.location.href,
                    "body": fetchData,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                })
                .then(async (response) => {
                    console.log(type);
                    if (response.ok) {
                        ++fetchesDone;
                        if (fetchesDone == data.length) {
                            window.location.reload(true);
                            chrome.runtime.sendMessage({ action: "done" });
                        }
                    }
                });
            } catch (a) {}
        }
    }
});

chrome.runtime.sendMessage({ action: "herf", data: window.location.href });

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}