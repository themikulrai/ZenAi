// ZenAi Background Script
// Handles extension lifecycle and messaging

// On install, open options page if no config exists
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Check if config exists
    const stored = await browser.storage.local.get('zenaiConfig');
    if (!stored.zenaiConfig || !stored.zenaiConfig.apiKey) {
      // Try loading private config first
      try {
        const response = await fetch(browser.runtime.getURL('config.private.js'));
        if (response.ok) {
          const text = await response.text();
          const match = text.match(/PRIVATE_CONFIG\s*=\s*({[\s\S]*?});/);
          if (match) {
            // Parse and save private config
            const configStr = match[1]
              .replace(/(\w+):/g, '"$1":')
              .replace(/'/g, '"');
            const config = JSON.parse(configStr);
            await browser.storage.local.set({ zenaiConfig: config });
            return; // Config loaded from private file
          }
        }
      } catch (e) {
        // Private config not available
      }
      
      // Open options page if no config
      browser.runtime.openOptionsPage();
    }
  }
});

// Handle extension icon click if popup not used
browser.browserAction.onClicked.addListener((tab) => {
  // This won't fire if popup is defined, but as a fallback
  browser.browserAction.openPopup();
});
