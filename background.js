chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    try {
        const apiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "authorization": "Bearer [Redacted]",
                "Access-Control-Allow-Origin": null,
            },
            method: "POST",
            body: JSON.stringify({
                model: "deepseek-r1-distill-llama-70b",
                messages: [
                    { role: "system", content: "Follow instructions perfectly." },
                    { role: "user", content: request.AIreq }
                ],
                temperature: 2,
                max_tokens: 2048,
                top_p: 0.1
            })
        });

        const result = await apiResponse.json();

        if (result.choices && result.choices[0].message && result.choices[0].message.content) {
            const responseContent = decodeURI(result.choices[0].message.content).replace(/<\/?think\b[^>]*>[\s\S]*?<\/think>/g, '').trim();

            chrome.tabs.sendMessage(sender.tab.id, { request, result: responseContent });
        } else {
            console.error("Unexpected API response structure:", result);
        }

    } catch (error) {
        console.error("Error fetching the API:", error);
    }
});
