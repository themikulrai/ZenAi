# 🧘 ZenAi - AI Assistant for Zen Browser

A beautiful, minimalist AI assistant extension for [Zen Browser](https://zen-browser.app/) powered by Azure OpenAI. Get contextual AI assistance based on the webpage you're viewing.

![ZenAi Banner](https://img.shields.io/badge/Zen%20Browser-Extension-purple?style=for-the-badge)
![Azure OpenAI](https://img.shields.io/badge/Azure-OpenAI-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

- **🎨 Beautiful Dark UI** - Glassmorphism design with smooth animations
- **📄 Page Context Awareness** - Automatically extracts webpage content for contextual Q&A
- **⚡ Streaming Responses** - Real-time streaming for instant feedback
- **🎯 Concise Answers** - Optimized system prompts for quick, focused responses
- **🔒 Secure** - Your API keys are stored locally in your browser

## 📸 Preview

*Coming soon*

## 🚀 Installation

### From Source (Development)

1. **Clone this repository**
   ```bash
   git clone https://github.com/yourusername/ZenAi.git
   cd ZenAi
   ```

2. **Configure your API credentials**
   ```bash
   cp config.example.js config.private.js
   # Edit config.private.js with your Azure OpenAI details
   ```

3. **Load in Zen Browser**
   - Open Zen Browser
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from this repository

## ⚙️ Configuration

### Option 1: Using the Options Page
1. Click the ZenAi extension icon
2. Click the ⚙️ settings button
3. Enter your Azure OpenAI credentials:
   - **API Endpoint**: Your Azure OpenAI endpoint URL
   - **API Key**: Your Azure OpenAI API key
   - **Deployment Name**: Your model deployment name

### Option 2: Using config.private.js
Create a `config.private.js` file (copy from `config.example.js`) with your credentials pre-filled for automatic loading.

## 🔧 Azure OpenAI Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Create an Azure OpenAI resource
3. Deploy a model (e.g., GPT-4, GPT-3.5-Turbo)
4. Copy your endpoint and API key
5. Use these in the extension configuration

## 📁 Project Structure

```
ZenAi/
├── manifest.json          # Extension manifest
├── config.example.js      # Example configuration
├── config.private.js      # Your private config (gitignored)
├── popup/
│   ├── popup.html         # Chat UI
│   ├── popup.css          # Styles
│   └── popup.js           # Logic
├── options/
│   ├── options.html       # Settings page
│   ├── options.css        # Settings styles
│   └── options.js         # Settings logic
├── content/
│   └── content.js         # Page content extraction
├── background/
│   └── background.js      # Background service worker
└── icons/                 # Extension icons
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zen Browser](https://zen-browser.app/) - The beautiful, privacy-focused browser
- [Azure OpenAI](https://azure.microsoft.com/en-us/products/ai-services/openai-service) - AI capabilities

---

<p align="center">Made with 💜 for Zen Browser users</p>
