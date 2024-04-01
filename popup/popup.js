async function updatePhishingDomainsCount() {
    try {
        const response = await fetch(chrome.runtime.getURL('/database/phishing_domains.json'));
        const data = await response.json();
        const domainsCount = data.domains.length;

        document.getElementById('phishingDomainsCount').textContent = `Total Phishing & Scam Data: ${domainsCount}`;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('phishingDomainsCount').textContent = "An error occurred while loading data.";
    }
}

chrome.storage.local.get("blockedDomain", function(data) {
    const blockedDomain = data.blockedDomain;
    if (blockedDomain) {
        document.getElementById("blocked-domain").textContent = blockedDomain;
    } else {
        document.getElementById("blocked-domain").textContent = "No domains have been blocked yet.";
    }
});

updatePhishingDomainsCount();