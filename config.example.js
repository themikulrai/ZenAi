// Example configuration - Copy this to config.private.js and fill in your details
// DO NOT commit config.private.js to version control!

const PRIVATE_CONFIG = {
    apiEndpoint: "https://your-resource.openai.azure.com/",
    apiKey: "your-api-key-here",
    modelName: "gpt-4",
    deployment: "your-deployment-name",
    apiVersion: "2025-04-01-preview"
};

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PRIVATE_CONFIG;
}
