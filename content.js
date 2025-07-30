// content.js

let lastSelectedText = ''; // Store the text for the "Regenerate" feature
let widget = null; // To hold the reference to our UI widget

// --- UI Management ---

// Injects the necessary styles and fonts into the page.
function injectStyles() {
  if (document.getElementById('gemini-commenter-styles')) return;

  const styleSheet = document.createElement("style");
  styleSheet.id = 'gemini-commenter-styles';
  styleSheet.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    #gemini-commenter-widget {
      font-family: 'Inter', sans-serif;
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      width: 100%;
      max-width: 24rem; /* 384px */
      z-index: 99999;
      background-color: white;
      border-radius: 0.75rem; /* 12px */
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.3s ease-out;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    #gemini-commenter-widget.visible {
      transform: translateY(0);
      opacity: 1;
    }
    .gemini-widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .gemini-widget-title {
      font-size: 0.875rem; /* 14px */
      font-weight: 600;
      color: #1e40af; /* blue-800 */
    }
    .gemini-widget-close-btn {
      background: none; border: none; cursor: pointer; padding: 0.25rem;
      border-radius: 9999px; line-height: 1; color: #6b7280; /* gray-500 */
    }
    .gemini-widget-close-btn:hover { background-color: #f3f4f6; /* gray-100 */ }
    .gemini-widget-content { padding: 1rem; }
    .gemini-loader {
      display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      color: #4b5563; /* gray-600 */
    }
    .gemini-spinner {
      width: 1.25rem; height: 1.25rem; border-radius: 50%;
      border: 3px solid #d1d5db; /* gray-300 */
      border-top-color: #3b82f6; /* blue-500 */
      animation: spin 1s linear infinite;
    }
    .gemini-comment-text { color: #374151; /* gray-700 */ line-height: 1.6; }
    .gemini-widget-actions {
      display: flex; justify-content: flex-end; align-items: center;
      gap: 0.5rem; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #f3f4f6;
    }
    .gemini-action-btn {
      font-size: 0.875rem; font-weight: 500; padding: 0.375rem 0.75rem;
      border-radius: 0.375rem; border: 1px solid transparent; cursor: pointer;
      transition: background-color 0.2s;
    }
    .gemini-btn-secondary {
      background-color: #f3f4f6; color: #374151; border-color: #d1d5db;
    }
    .gemini-btn-secondary:hover { background-color: #e5e7eb; }
    .gemini-btn-primary {
      background-color: #3b82f6; color: white;
    }
    .gemini-btn-primary:hover { background-color: #2563eb; }
    .gemini-error-msg { color: #dc2626; /* red-600 */ }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(styleSheet);
}

// Creates the main widget container if it doesn't exist.
function createWidget() {
  if (document.getElementById('gemini-commenter-widget')) {
    widget = document.getElementById('gemini-commenter-widget');
  } else {
    widget = document.createElement('div');
    widget.id = 'gemini-commenter-widget';
    document.body.appendChild(widget);
  }

  widget.innerHTML = `
    <div class="gemini-widget-header">
      <span class="gemini-widget-title">CNL Comment Generator</span>
      <button class="gemini-widget-close-btn" title="Close">&times;</button>
    </div>
    <div class="gemini-widget-content"></div>
  `;

  widget.querySelector('.gemini-widget-close-btn').addEventListener('click', () => {
    widget.classList.remove('visible');
  });

  // Make it visible with a nice animation
  setTimeout(() => widget.classList.add('visible'), 10);
}

// Renders the loading state in the widget.
function renderLoadingState() {
  if (!widget) createWidget();
  const contentArea = widget.querySelector('.gemini-widget-content');
  contentArea.innerHTML = `
    <div class="gemini-loader">
      <div class="gemini-spinner"></div>
      <span>Generating comment...</span>
    </div>
  `;
  widget.classList.add('visible');
}

// Renders the generated comment in the widget.
function renderCommentState(comment) {
  if (!widget) createWidget();
  const contentArea = widget.querySelector('.gemini-widget-content');
  contentArea.innerHTML = `
    <p class="gemini-comment-text">${comment}</p>
    <div class="gemini-widget-actions">
      <button class="gemini-action-btn gemini-btn-secondary" id="regenerate-btn">Regenerate</button>
      <button class="gemini-action-btn gemini-btn-primary" id="copy-btn">Copy</button>
    </div>
  `;
  widget.classList.add('visible');
  addCommentActionListeners();
}

// Renders an error message in the widget.
function renderErrorState(message) {
  if (!widget) createWidget();
  const contentArea = widget.querySelector('.gemini-widget-content');
  contentArea.innerHTML = `<p class="gemini-error-msg"><b>Error:</b> ${message}</p>`;
  widget.classList.add('visible');
}

// --- Event Listeners ---

// Adds click listeners for the Copy and Regenerate buttons.
function addCommentActionListeners() {
  const copyBtn = document.getElementById('copy-btn');
  const regenerateBtn = document.getElementById('regenerate-btn');
  const commentText = widget.querySelector('.gemini-comment-text').innerText;

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(commentText).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
    });
  });

  regenerateBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'regenerateComment', text: lastSelectedText });
  });
}

// Main message listener for events from the background script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  injectStyles(); // Ensure styles are present

  if (request.type === 'showLoading') {
    renderLoadingState();
  } else if (request.type === 'displayComment') {
    lastSelectedText = request.originalText; // Save for regeneration
    renderCommentState(request.comment);
  } else if (request.type === 'showError') {
    renderErrorState(request.message);
  }
});