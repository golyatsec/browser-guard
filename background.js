// Veritabanından phishing domain listesini çeken fonksiyon
async function getPhishingDomains() {
    try {
      const response = await fetch(chrome.runtime.getURL('phishing_domains.json'));
      const data = await response.json();
      return data.domains;
    } catch (error) {
      console.error('Error fetching phishing domains:', error);
      return [];
    }
  }
  
  // Phishing domainleri almak için veritabanı dosyasını yükle
  let phishingDomains = [];
  getPhishingDomains().then(domains => {
    phishingDomains = domains;
  });
  
  // Phishing domainleri engelleme kurallarını oluştur
  async function updateRules() {
    const domains = await getPhishingDomains();
    const asciiDomains = domains.map(domain => domain.replace(/[^\x00-\x7F]/g, '')); // Sadece ASCII karakterlerini içeren bir dizi oluştur
    const rules = asciiDomains.map((domain, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'block' },
      condition: {
        domains: [domain]
      }
    }));
    chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [], addRules: rules });
  }

  // Kuralları başlat
  updateRules();
  
  // Zamanla kuralları güncelle
  setInterval(updateRules, 24 * 60 * 60 * 1000); // Her gün güncelle