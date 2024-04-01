var domains;

async function updateRules() {
    try {
        const response = await fetch(chrome.runtime.getURL('phishing_domains.json'));
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
            return { redirectUrl: chrome.runtime.getURL("blocked.html") };
        }
    },
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["blocking"]
);

function isPhishingDomain(domain) {
    return domains.includes(domain);
}

chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === "blocked_domain") {
        const blockedDomain = message.domain;
        document.getElementById("blocked-domain").textContent = blockedDomain;
    }
});