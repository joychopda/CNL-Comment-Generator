# CNL-Comment-Generator
A Chrome extension that uses the Gemini API to generate instant comments and analyses on any selected text directly in your browser.

✨ Features

Right-Click to Comment: Simply select text, right-click, and choose "Generate Comment with Gemini."

AI-Powered: Utilizes the Gemini 2.5 Flash model for smart text analysis.

Clean UI: Comments appear in a clean, non-intrusive pop-up.

Quick Feedback: See a loading indicator while your comment is being generated.

🚀 Get Started

Download: Get the extension files from this repository.

Add API Key:

Get your Gemini API Key from Google AI Studio- https://aistudio.google.com/

Open config.js in the extension folder and replace const GEMINI_API_KEY = ""; with your key. Its okay to harcode the key for local use cases.

Feel free to reconfigure the prompt in background.js in const prompt='' to get more perosnalised results. 



Load in Chrome:

Go to chrome://extensions.

Enable "Developer mode".

Click "Load unpacked" and select the extension's folder.

Use It!

Select some text.

Right-click and choose "Generate Comment with Gemini."
