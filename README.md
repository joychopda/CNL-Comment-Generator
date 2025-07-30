# 🌐 CNL-Comment-Generator

A Chrome extension that uses the **Gemini API** to instantly generate smart, contextual comments and analysis on any selected text — right in your browser.

---

## ✨ Features

- 💬 **Right-Click to Comment**  
  Select text → Right-click → *"Generate Comment with Gemini"*

- 🧠 **AI-Powered Analysis**  
  Uses **Gemini 2.5 Flash** model for fast, intelligent feedback.

- 🧼 **Clean UI**  
  Pop-up comment box appears neatly and non-intrusively.

---

## 🚀 Getting Started

### 1. Download

Clone or download the extension files from this repo.

```bash
git clone https://github.com/YOUR_USERNAME/CNL-Comment-Generator.git

```
⸻

2. Add Your Gemini API Key
	•	Get your API key from Google AI Studio:
👉 https://aistudio.google.com/
	•	Open config.js and update the following line:

const GEMINI_API_KEY = "your-api-key-here";

🔐 Hardcoding is fine for local usage. Don’t upload it anywhere.

⸻

3. (Optional) Customize the Prompt

Want more personalized comments?

Edit the prompt string in background.js:

const prompt = 'Your custom prompt here...';


⸻

4. Load the Extension in Chrome
	1.	Go to chrome://extensions
	2.	Enable Developer mode
	3.	Click Load unpacked
	4.	Select the extension’s folder

⸻

🧪 How to Use
	1.	Select any text on a webpage
	2.	Right-click → “Generate Comment with Gemini”

⸻

🛠️ Coming Soon / Ideas
	•	🌍 Multi-language support
	•	🧠 Tone/intent customization
	•	💾 Save or copy comment options
	•	🔄 Gemini Pro model toggle

⸻

📄 License

MIT License — use freely, give credit where due.

- Shields/badges (e.g., version, license, etc.)
- GIF demo or screenshots
- A "How it works" section for the curious techies
