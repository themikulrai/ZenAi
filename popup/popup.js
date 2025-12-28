// ZenAi Popup Script

// Configuration
const DEFAULT_CONFIG = {
  apiEndpoint: "",
  apiKey: "",
  modelName: "gpt-4",
  deployment: "",
  apiVersion: "2025-04-01-preview"
};

// System prompt for concise responses
const SYSTEM_PROMPT = `You are ZenAi, a helpful AI assistant integrated into a web browser. 
Your responses must be:
- CONCISE: Keep answers brief and to the point
- RELEVANT: Focus on the user's question and the current webpage context
- CLEAR: Use simple language and formatting
- HELPFUL: Provide actionable information when possible

When given page context, use it to provide accurate, contextual answers. If you don't have enough information, say so briefly.`;

// State
let config = { ...DEFAULT_CONFIG };
let pageContext = null;
let messages = [];
let isStreaming = false;

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const settingsBtn = document.getElementById('settingsBtn');
const pageTitle = document.getElementById('pageTitle');
const statusBar = document.getElementById('statusBar');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  await getPageContext();
  setupEventListeners();
});

// Load configuration from storage
async function loadConfig() {
  try {
    const stored = await browser.storage.local.get('zenaiConfig');
    if (stored.zenaiConfig) {
      config = { ...DEFAULT_CONFIG, ...stored.zenaiConfig };
    }
    
    // Try to load private config if available
    try {
      const response = await fetch(browser.runtime.getURL('config.private.js'));
      if (response.ok) {
        const text = await response.text();
        // Extract config from the file
        const match = text.match(/PRIVATE_CONFIG\s*=\s*({[\s\S]*?});/);
        if (match) {
          const privateConfig = JSON.parse(match[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"'));
          // Only use private config if no stored config exists
          if (!stored.zenaiConfig || !stored.zenaiConfig.apiKey) {
            config = { ...config, ...privateConfig };
            await browser.storage.local.set({ zenaiConfig: config });
          }
        }
      }
    } catch (e) {
      // Private config not available, use stored or default
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }
}

// Get page context from content script
async function getPageContext() {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      const response = await browser.tabs.sendMessage(tabs[0].id, { action: 'getPageContext' });
      if (response) {
        pageContext = response;
        pageTitle.textContent = response.title || 'Unknown page';
      }
    }
  } catch (error) {
    pageTitle.textContent = 'Unable to get page info';
    console.error('Error getting page context:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  sendBtn.addEventListener('click', handleSend);
  
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
  
  userInput.addEventListener('input', autoResize);
  
  settingsBtn.addEventListener('click', () => {
    browser.runtime.openOptionsPage();
  });
}

// Auto-resize textarea
function autoResize() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 100) + 'px';
}

// Handle send message
async function handleSend() {
  const text = userInput.value.trim();
  if (!text || isStreaming) return;
  
  // Check if API is configured
  if (!config.apiKey || !config.apiEndpoint) {
    showStatus('Please configure your API settings first.', 'error');
    setTimeout(() => browser.runtime.openOptionsPage(), 1500);
    return;
  }
  
  // Clear welcome message if first message
  const welcome = document.querySelector('.welcome-message');
  if (welcome) welcome.remove();
  
  // Add user message
  addMessage('user', text);
  userInput.value = '';
  userInput.style.height = 'auto';
  
  // Send to API
  await sendToAPI(text);
}

// Add message to chat
function addMessage(role, content, isStreaming = false) {
  const message = document.createElement('div');
  message.className = `message ${role}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = content;
  
  if (isStreaming) {
    const cursor = document.createElement('span');
    cursor.className = 'streaming-cursor';
    contentDiv.appendChild(cursor);
  }
  
  const timeDiv = document.createElement('div');
  timeDiv.className = 'message-time';
  timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  message.appendChild(contentDiv);
  message.appendChild(timeDiv);
  chatContainer.appendChild(message);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  return contentDiv;
}

// Show typing indicator
function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'message assistant';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = `
    <div class="message-content">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  chatContainer.appendChild(indicator);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

// Send message to Azure OpenAI API
async function sendToAPI(userMessage) {
  isStreaming = true;
  sendBtn.disabled = true;
  showTypingIndicator();
  hideStatus();
  
  // Build messages array
  const apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];
  
  // Add page context if available
  if (pageContext) {
    apiMessages.push({
      role: 'system',
      content: `Current webpage context:
Title: ${pageContext.title}
URL: ${pageContext.url}
Content summary: ${pageContext.content?.substring(0, 2000) || 'No content available'}`
    });
  }
  
  // Add conversation history (last 10 messages)
  messages.slice(-10).forEach(msg => {
    apiMessages.push({ role: msg.role, content: msg.content });
  });
  
  // Add current user message
  apiMessages.push({ role: 'user', content: userMessage });
  messages.push({ role: 'user', content: userMessage });
  
  try {
    const endpoint = `${config.apiEndpoint.replace(/\/$/, '')}/openai/deployments/${config.deployment}/chat/completions?api-version=${config.apiVersion}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      },
      body: JSON.stringify({
        messages: apiMessages,
        max_tokens: 1024,
        stream: true
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }
    
    removeTypingIndicator();
    
    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';
    let messageDiv = null;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              
              if (!messageDiv) {
                messageDiv = addMessage('assistant', assistantMessage, true);
              } else {
                // Update existing message, keeping cursor
                const cursor = messageDiv.querySelector('.streaming-cursor');
                messageDiv.textContent = assistantMessage;
                if (cursor) messageDiv.appendChild(cursor);
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
    
    // Remove cursor after streaming completes
    if (messageDiv) {
      const cursor = messageDiv.querySelector('.streaming-cursor');
      if (cursor) cursor.remove();
    }
    
    // Save assistant message
    messages.push({ role: 'assistant', content: assistantMessage });
    
  } catch (error) {
    removeTypingIndicator();
    console.error('API Error:', error);
    showStatus(error.message || 'Failed to get response. Check your settings.', 'error');
  } finally {
    isStreaming = false;
    sendBtn.disabled = false;
  }
}

// Show status message
function showStatus(message, type) {
  statusBar.textContent = message;
  statusBar.className = `status-bar ${type}`;
}

// Hide status message
function hideStatus() {
  statusBar.className = 'status-bar';
}
