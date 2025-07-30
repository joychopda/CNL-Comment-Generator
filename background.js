// background.js

import { GEMINI_API_KEY } from './config.js';

// Create a context menu item on installation.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateComment",
    title: "CNL - Generate Comments",
    contexts: ["selection"]
  });
});

// A robust function to call the Gemini API with exponential backoff.
const callGeminiApi = async (prompt) => {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  let response;
  let delay = 1000;
  for (let i = 0; i < 3; i++) { // Retry up to 3 times
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid API response structure.");
      }
    }

    if (response.status === 429) { // Too Many Requests
      console.warn(`Attempt ${i + 1} failed with status 429. Retrying in ${delay / 1000}s...`);
      await new Promise(res => setTimeout(res, delay));
      delay *= 2; // Exponential backoff
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  throw new Error("Max retries reached for Gemini API call.");
};

// Main function to handle comment generation.
const generateCommentForText = async (selectedText, tabId) => {
  // Notify the content script to show the loading UI.
  chrome.tabs.sendMessage(tabId, { type: "showLoading" });

  try {
    const prompt = `You are a seasoned cybersecurity analyst with a talent for translating complex security events into clear, impactful insights for a diverse professional audience on LinkedIn. Your task is to craft a compelling comment based on the provided article content.

Article Content:
${selectedText}
Comment Guidelines:

Core Insight & Impact (1-2 sentences): Distill the article's most critical, non-obvious takeaway or its direct real-world implication for businesses and individuals. Convey why this matters concisely, without using phrases like 'this is a stark reminder,' 'highlights,' or 'underscores.'

Conciseness & Clarity:

Overall Length: Aim for 1-2 sentences maximum. Strict adherence to this length is crucial.

Skip the Obvious: Do not re-state the headline or the article's primary focus. Jump straight to the unique insight.

Avoid Generic Phrases: Steer clear of common LinkedIn platitudes (e.g., 'great read,' 'super insightful,' 'valuable insights') and specifically avoid "this is a stark reminder," "highlights," and "underscores."

Tone & Voice:

Authoritative & Approachable: Sound credible, human, and natural – like an expert simplifying a complex issue. Avoid overly technical jargon; if essential, explain it simply.

Context-Sensitive: Adapt your tone to the article's content (e.g., urgent, concerned, professionally curious, subtly witty/ironic when appropriate). Do not resort to sensationalism or fear-mongering without providing context.

Professional: Maintain a tone suitable for a business networking platform.`;
    const generatedComment = await callGeminiApi(prompt);

    // Send the successful result to the content script.
    chrome.tabs.sendMessage(tabId, {
      type: "displayComment",
      comment: generatedComment,
      originalText: selectedText // Send original text back for the "Regenerate" feature.
    });
  } catch (error) {
    console.error("Failed to generate comment:", error);
    // Send an error message to the content script.
    chrome.tabs.sendMessage(tabId, { type: "showError", message: error.message });
  }
};

// Listener for the context menu click.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generateComment" && info.selectionText) {
    generateCommentForText(info.selectionText, tab.id);
  }
});

// Listener for messages from the content script (e.g., for regeneration).
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "regenerateComment") {
    generateCommentForText(request.text, sender.tab.id);
    return true; // Indicates an asynchronous response.
  }
});