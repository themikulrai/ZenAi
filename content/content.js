// ZenAi Content Script
// Extracts page content for contextual AI assistance

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPageContext') {
    const context = extractPageContext();
    sendResponse(context);
  }
  return true;
});

// Extract relevant page context
function extractPageContext() {
  const context = {
    title: document.title || '',
    url: window.location.href,
    content: extractMainContent()
  };
  
  return context;
}

// Extract main content from the page
function extractMainContent() {
  // Priority: article, main, or body
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '.post-content',
    '.article-content',
    '.entry-content',
    '#content'
  ];
  
  let mainElement = null;
  
  for (const selector of selectors) {
    mainElement = document.querySelector(selector);
    if (mainElement) break;
  }
  
  // Fallback to body
  if (!mainElement) {
    mainElement = document.body;
  }
  
  // Clone to avoid modifying the DOM
  const clone = mainElement.cloneNode(true);
  
  // Remove unwanted elements
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer',
    'aside', '.sidebar', '.ads', '.advertisement',
    '.comments', '.social-share', 'iframe', 'form'
  ];
  
  unwantedSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  // Get text content and clean it up
  let text = clone.textContent || '';
  
  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  // Limit length (to avoid token limits)
  const maxLength = 5000;
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '...';
  }
  
  return text;
}
