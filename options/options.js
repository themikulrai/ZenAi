// ZenAi Options Script

const DEFAULT_CONFIG = {
  apiEndpoint: "",
  apiKey: "",
  modelName: "",
  deployment: "",
  apiVersion: "2025-04-01-preview"
};

// DOM Elements
const form = document.getElementById('settingsForm');
const apiEndpoint = document.getElementById('apiEndpoint');
const apiKey = document.getElementById('apiKey');
const deployment = document.getElementById('deployment');
const modelName = document.getElementById('modelName');
const apiVersion = document.getElementById('apiVersion');
const toggleKey = document.getElementById('toggleKey');
const testBtn = document.getElementById('testBtn');
const status = document.getElementById('status');

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings);

// Load settings from storage
async function loadSettings() {
  try {
    const stored = await browser.storage.local.get('zenaiConfig');
    const config = stored.zenaiConfig || DEFAULT_CONFIG;
    
    apiEndpoint.value = config.apiEndpoint || '';
    apiKey.value = config.apiKey || '';
    deployment.value = config.deployment || '';
    modelName.value = config.modelName || '';
    apiVersion.value = config.apiVersion || '2025-04-01-preview';
  } catch (error) {
    showStatus('Error loading settings: ' + error.message, 'error');
  }
}

// Save settings
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const config = {
    apiEndpoint: apiEndpoint.value.trim(),
    apiKey: apiKey.value.trim(),
    deployment: deployment.value.trim(),
    modelName: modelName.value.trim() || deployment.value.trim(),
    apiVersion: apiVersion.value.trim() || '2025-04-01-preview'
  };
  
  try {
    await browser.storage.local.set({ zenaiConfig: config });
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, 'error');
  }
});

// Toggle password visibility
toggleKey.addEventListener('click', () => {
  const type = apiKey.type === 'password' ? 'text' : 'password';
  apiKey.type = type;
  toggleKey.textContent = type === 'password' ? '👁️' : '🙈';
});

// Test connection
testBtn.addEventListener('click', async () => {
  const endpoint = apiEndpoint.value.trim();
  const key = apiKey.value.trim();
  const deploy = deployment.value.trim();
  const version = apiVersion.value.trim() || '2025-04-01-preview';
  
  if (!endpoint || !key || !deploy) {
    showStatus('Please fill in all required fields.', 'error');
    return;
  }
  
  showStatus('Testing connection...', 'loading');
  
  try {
    const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deploy}/chat/completions?api-version=${version}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': key
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        max_completion_tokens: 5
      })
    });
    
    if (response.ok) {
      showStatus('Connection successful! ✓', 'success');
    } else {
      const error = await response.text();
      throw new Error(`${response.status}: ${error}`);
    }
  } catch (error) {
    showStatus('Connection failed: ' + error.message, 'error');
  }
});

// Show status message
function showStatus(message, type) {
  status.textContent = message;
  status.className = `status ${type}`;
}
