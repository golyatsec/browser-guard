///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Phishing & Scam Manuel DB by Golyat Security
//Created by Golyat Security
//DB Update Date: 01.04.2024
//For Your Cyber Security
//All Rights Reserved
//Golyatsec.com

var domains;

async function updateRules() {
    try {
        const response = await fetch(chrome.runtime.getURL('/database/phishing_domains.json'));
        const data = await response.json();
        domains = data.domains;

        const rules = domains.map((domain, index) => {
            const cleanDomain = domain.replace(/[^\x00-\x7F]/g, '');
            return {
                id: index + 1,
                priority: index + 1,
                action: { type: 'block' },
                condition: { urlFilter: cleanDomain }
            };
        });

        chrome.declarativeNetRequest.updateDynamicRules({
            addRules: rules,
            removeRuleIds: []
        });
    } catch (error) {
        console.error("Error updating rules:", error);
    }
}

updateRules();
setInterval(updateRules, 24 * 60 * 60 * 1000);

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const requestedDomain = new URL(details.url).hostname;
        if (isPhishingDomain(requestedDomain)) {
            return { redirectUrl: chrome.runtime.getURL("/security/blocked.html") };
        }
    },
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["blocking"]
);

function isPhishingDomain(domain) {
    return domains.includes(domain);
}

chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === "blocked-domain") {
       const blockedDomain = message.domain;
       chrome.storage.local.set({ "blockedDomain": blockedDomain });
   }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Phishing & Scam Automatic DB by USOM
//Created by Golyat Security
//DB Update Rate: Every Hour
//For Your Cyber Security
//All Rights Reserved
//Golyatsec.com

async function checkPhishing(url) {
    try {
        const response = await fetch('https://www.usom.gov.tr/url-list.txt');
        const text = await response.text();
        const domains = text.split('\n');

        const enteredDomain = new URL(url).hostname;

        if (domains.includes(enteredDomain)) {
            return true; 
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error checking phishing:", error);
        return false;
    }
}

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        const isPhishing = await checkPhishing(tab.url);
        if (isPhishing) {
            chrome.tabs.update(tabId, {url: chrome.runtime.getURL("/security/blocked.html")});
        }
    }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////