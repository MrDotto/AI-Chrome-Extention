var token = '',
    data = [],
    questionID = 1,
    formID = window.location.href.match(/\/d\/e\/([\w-]+)/)?.[1],
    fetchesDone = 0,
    token = '',
    seed = '',
    lastCLick = 0;

try {
    document.addEventListener("DOMContentLoaded", () => {
        token = JSON.parse(document.all[20].innerHTML.replace("_docs_flag_initialData=", '').replace(";", '')).info_params.token;
        seed = document.querySelector("form").getAttribute('data-shuffle-seed');
    });

    token = JSON.parse(document.all[20].innerHTML.replace("_docs_flag_initialData=", '').replace(";", '')).info_params.token;
    seed = document.querySelector("form").getAttribute('data-shuffle-seed');
} catch(e) {

}

if (!window.scriptLoaded) {
    window.scriptLoaded = true;

    window.AIFill = function() {
        if (window.location.href.includes("https://docs.google.com/forms/d/") && Date.now() - lastCLick >= 1000) {
            lastCLick = Date.now();
            document.querySelector("#mG61Hd > div.RH5hzf.RLS9Fe > div").querySelectorAll('.Qr7Oae').forEach((item, i) => {
                let question = '',
                    input = null,
                    type = null,
                    answers = [];

                question = item.querySelector("[jscontroller=sWGJ4b] > .z12JJ > div > div:nth-child(1)")?.innerText?.replace(/&[^;]+;|\*/g, '').replace(/<\/?[^>]+>/g, '');

                if (typeof question == 'string') {
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

                            input = Array.from(item.querySelector("div > .oyXaNc > [jsname=cnAzRb] > div > span > .SG0AAe").querySelectorAll('.nWQGrd')).map((item) => {
                                return item.querySelector("label > div > div > [jscontroller=D8e5bc]");
                            });
                        } else if (item.querySelector("div > [jsname=WsjYwc] > .Y6Myld")) {
                            type = 'SCB';
                            answers = Array.from(item.querySelector("div > [jsname=WsjYwc] > .Y6Myld  > [role=list]").querySelectorAll('.eBFwI')).map((item) => {
                                return item.querySelector("label > div > div:nth-child(2) > div > span").innerHTML;
                            });

                            input = Array.from(item.querySelector("div > [jsname=WsjYwc] > .Y6Myld  > [role=list]").querySelectorAll('.eBFwI')).map((item) => {
                                return item.querySelector("label > div > div");
                            });
                        } else {
                            type = 'SDD';
                            input = '';
                        }
                    }

                    let AIreq = '';
                    if (type == "FITB") {
                        AIreq = `Provide a human-like, concise response for the following question (around 50 characters or less): ${question}`;
                    } else if (type == "SOO") {
                        AIreq = `Given the question: "${question}", select the single best answer from the provided options array: ${answers}. Return only the INDEX, not answer. INDEX OF THE answer: (0, 1, 2, etc...) of the correct answer from the options array ${answers}. Respond with the index as a single integer only, with no additional text, explanations, or dialogue. Return the best answer. if invalid return [0]`;
                    } else if (type == "SCB") {
                        AIreq = `For the question: "${question}", identify ALL correct answers from the provided options: ${answers}. Return ONLY an ARRAY containing the indices of the correct answers (e.g., [0, 2, 3]). Provide NO additional text, explanations, or dialogue. This response will be processed by an algorithm, so follow the instructions precisely. Return the best answer(s). if invalid return [0]`;
                    }

                    if (type && question && answers && input && questionID) {
                        data.push({
                            type: type,
                            question: question,
                            answers: answers,
                            input: input,
                            questionID: questionID,
                            result: ''
                        });
                    }

                    chrome.runtime.sendMessage({
                        questionID,
                        question,
                        answers,
                        AIreq
                    });
                    console.log('a')
                    ++questionID;
                }
            });
        }
    }
    
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.action === "Fill") {
            AIFill();
            return false;
        } else if (message.action == "href?") {
            chrome.runtime.sendMessage({ action: "href", data: window.location.href });
        }

        if (!message.result) {
            return false;
        }

        data.find((a) => a.questionID == message.request.questionID).result = message.result.trim().toLowerCase().toString();

        if (data.every((item) => item?.result != '' && item?.result != undefined)) {
            data.sort((a, b) => { // Fill in the box last
                if (a.type === 'FITB') return 1;
                if (b.type === 'FITB') return -1;
                return 0;
            }),
            FITB_last = false;

            for (const item of data) {
                let fetchData = null;

                if (item.type == "FITB") {
                    fetchData = ["draft_response_action_request=" + encodeURIComponent(JSON.stringify([
                            1, "", [
                                [null, null, [item.result], 0, null, null, item.input]
                            ], Date.now()
                        ]))];
                } else if (item.type == "SOO") {
                    item.input[item.result.replace(/\D/g, '')].focus();
                    item.input[item.result.replace(/\D/g, '')].click();
                } else if (item.type == "SCB") {
                    for (const response of JSON.parse(item.result)) {
                        item.input[response].focus();
                        item.input[response].click();
                        if (JSON.parse(item.result).length > 1) {
                            await observeMutation()
                        }
                    }
                }

                if (fetchData)  {
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
                };

                ++fetchesDone;
                if (fetchesDone == data.length) {
                    FITB_last ? await delay(5000) : await observeMutation()

                    let button = document.querySelector("#mG61Hd > div.RH5hzf.RLS9Fe > div > div.ThHDze > div.DE3NNc.CekdCb > div.lRwqcd > div > span > span");

                    if (FITB_last) {
                        window.location.reload(true);
                    } else if (button.innerHTML === 'Next') {
                        button.click()
                    } else {
                        document.querySelector("#mG61Hd > div.RH5hzf.RLS9Fe > div > div.ThHDze > div.DE3NNc.CekdCb > div.lRwqcd > div:nth-child(2) > span").click()
                    }
                    chrome.runtime.sendMessage({ action: "done" });

                    return false;
                }
                
                // Wait 5s for each writing piece, else wait for forms to save data
                if (item.type == "FITB") {
                    await delay(6000)
                    FITB_last = true
                } else {
                    await observeMutation();
                }
            }
        }
    });

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function observeMutation() {
        return new Promise((resolve, reject) => {
            const target = document.querySelector("#mG61Hd > div.RH5hzf.RLS9Fe > div > div.Dq4amc > div > div.DqBBlb > div.Oh1Vtf > div.UpwdYb");
    
            const observer = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    const parent = m.target.parentNode;
    
                    if (parent.querySelector("div > div.pMDWAf")?.innerHTML === "Draft saved") {
                        resolve(true);
                        observer.disconnect();
                        break;
                    }
                }
            });

            observer.observe(target, { characterData: true, subtree: true, childList: true });
        });
    }
}