// Phishing domainlerini güncellemek ve engellemek için fonksiyon
async function updateRules() {
    try {
        // Phishing domain listesini al
        const response = await fetch(chrome.runtime.getURL('phishing_domains.json'));
        const data = await response.json();
        const domains = data.domains;
  
        // Kuralları güncelle
        const rules = domains.map((domain, index) => ({
            id: index + 1,
            priority: index + 1,
            action: { type: 'block' },
            condition: { urlFilter: domain }
        }));
  
        chrome.declarativeNetRequest.updateDynamicRules({
            addRules: rules,
            removeRuleIds: []
        });
    } catch (error) {
        console.error("Error updating rules:", error);
    }
  }
  
  // İlk başlatma
  updateRules();
  
  // Güncelleme periyodu
  setInterval(updateRules, 24 * 60 * 60 * 1000); // Her gün güncelle
  
  // Engellenen sayfalarda gösterilecek özel hata sayfası
  chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        return { redirectUrl: chrome.runtime.getURL("blocked.html") };
    },
    { urls: ["*://*/*"], types: ["main_frame"] },
    ["blocking"]
  );
  
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === "blocked_domain") {
        const blockedDomain = message.domain;
        document.getElementById("blocked-domain").textContent = blockedDomain;
    }
  });