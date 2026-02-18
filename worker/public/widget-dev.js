/**
 * Insertabot Embeddable Widget
 * Single script tag integration for any website
 *
 * Usage:
 * <script src="https://cdn.insertabot.io/widget.js" data-api-key="ib_sk_your_key_here"></script>
 */

(function () {
  "use strict";

  // Configuration
  const SCRIPT_TAG = document.currentScript;
  // Prefer short-lived widget token (data-widget-token). Fall back to legacy data-api-key.
  const API_WIDGET_TOKEN = SCRIPT_TAG?.getAttribute("data-widget-token");
  const API_KEY = SCRIPT_TAG?.getAttribute("data-api-key");
  const API_CREDENTIAL = API_WIDGET_TOKEN || API_KEY;
  const API_CREDENTIAL_HEADER = API_WIDGET_TOKEN ? 'X-Widget-Token' : 'X-API-Key';
  const API_BASE =
    SCRIPT_TAG?.getAttribute("data-api-base") ||
    "https://insertabot.io";
  const DEBUG = SCRIPT_TAG?.getAttribute("data-debug") === "true";

  // Validation
  if (!API_CREDENTIAL) {
    console.error("[Insertabot] Missing data-widget-token or data-api-key attribute");
    return;
  }

  // Logger
  const log = {
    info: (...args) => DEBUG && console.log("[Insertabot]", ...args),
    error: (...args) => console.error("[Insertabot]", ...args),
  };

  // State
  let widgetConfig = null;
  let isOpen = false;
  let messages = [];
  let isGenerating = false;
  let abortController = null;
  let currentImage = null; // Store uploaded image data

  // DOM Elements
  let chatBubble = null;
  let chatContainer = null;
  let chatMessages = null;
  let chatInput = null;
  let chatForm = null;
  let imagePreview = null;
  let imageInput = null;

  /**
   * Fetch widget configuration from API
   */
  async function fetchConfig() {
    try {
const headers = {};
    headers[API_CREDENTIAL_HEADER] = API_CREDENTIAL;

    const response = await fetch(`${API_BASE}/v1/widget/config`, {
      headers: headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }

      widgetConfig = await response.json();
      log.info("Config loaded:", widgetConfig);
      return widgetConfig;
    } catch (error) {
      log.error("Failed to load configuration:", error);
      throw error;
    }
  }

  /**
   * Create chat bubble (minimized state)
   */
  function createChatBubble() {
    chatBubble = document.createElement("div");
    chatBubble.id = "insertabot-bubble";
    chatBubble.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const safeColor = escapeHtmlAttr(widgetConfig.primary_color || '#3b82f6');
    chatBubble.style.cssText = `
      position: fixed;
      ${widgetConfig.position === "bottom-left" ? "left: 24px;" : "right: 24px;"}
      bottom: 24px;
      width: 60px;
      height: 60px;
      background: ${safeColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 999999;
    `;

    chatBubble.addEventListener("mouseenter", () => {
      chatBubble.style.transform = "scale(1.1)";
      chatBubble.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
    });

    chatBubble.addEventListener("mouseleave", () => {
      chatBubble.style.transform = "scale(1)";
      chatBubble.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    });

    chatBubble.addEventListener("click", toggleChat);

    document.body.appendChild(chatBubble);
  }

  /**
   * Create chat container (expanded state)
   */
  function createChatContainer() {
    chatContainer = document.createElement("div");
    chatContainer.id = "insertabot-container";
    chatContainer.style.cssText = `
      position: fixed;
      ${widgetConfig.position === "bottom-left" ? "left: 24px;" : "right: 24px;"}
      bottom: 24px;
      width: 400px;
      max-width: calc(100vw - 48px);
      height: 600px;
      max-height: calc(100vh - 100px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    `;

    // Sanitize config values to prevent XSS
    const sanitizedConfig = {
      primary_color: escapeHtmlAttr(widgetConfig.primary_color || '#3b82f6'),
      bot_avatar_url: escapeHtmlAttr(widgetConfig.bot_avatar_url || ''),
      bot_name: escapeHtml(widgetConfig.bot_name || 'Assistant'),
      greeting_message: escapeHtml(widgetConfig.greeting_message || 'Hello! How can I help you?'),
      placeholder_text: escapeHtmlAttr(widgetConfig.placeholder_text || 'Type your message...')
    };

    chatContainer.innerHTML = `
      <div id="insertabot-header" style="
        background: ${sanitizedConfig.primary_color};
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${
            sanitizedConfig.bot_avatar_url
              ? `<img src="${sanitizedConfig.bot_avatar_url}" alt="${sanitizedConfig.bot_name}" style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid white;" />`
              : `<div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-weight: bold;">${escapeHtml(widgetConfig.bot_name ? widgetConfig.bot_name[0] : 'A')}</div>`
          }
          <div>
            <div style="font-weight: 600; font-size: 16px;">${sanitizedConfig.bot_name}</div>
            <div style="font-size: 12px; opacity: 0.9;">Online</div>
          </div>
        </div>
        <button id="insertabot-close" style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div id="insertabot-messages" style="
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #f9fafb;
      ">
        <div class="insertabot-message insertabot-message-assistant">
          <div class="insertabot-message-content">${sanitizedConfig.greeting_message}</div>
        </div>
      </div>

      <div id="insertabot-input-container" style="
        padding: 16px;
        background: white;
        border-top: 1px solid #e5e7eb;
      ">
        <div id="insertabot-image-preview" style="display: none; margin-bottom: 12px; padding: 12px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <img id="insertabot-preview-img" style="max-width: 100px; max-height: 100px; border-radius: 4px; object-fit: cover;" />
              <span id="insertabot-preview-name" style="font-size: 12px; color: #6b7280;"></span>
            </div>
            <button type="button" id="insertabot-remove-image" style="background: #ef4444; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-size: 12px; transition: opacity 0.2s;">
              Remove
            </button>
          </div>
        </div>
        <form id="insertabot-form" style="display: flex; gap: 8px;">
          <input type="file" id="insertabot-image-input" accept="image/jpeg,image/jpg,image/png,image/webp" style="display: none;" />
          <button
            type="button"
            id="insertabot-image-btn"
            style="
              background: #f3f4f6;
              color: #6b7280;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 12px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: background 0.2s;
            "
            title="Upload image"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </button>
          <input
            type="text"
            id="insertabot-input"
            placeholder="${sanitizedConfig.placeholder_text}"
            style="
              flex: 1;
              padding: 12px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              font-size: 14px;
              outline: none;
            "
          />
          <button
            type="submit"
            id="insertabot-send"
            style="
              background: ${widgetConfig.primary_color};
              color: white;
              border: none;
              border-radius: 8px;
              padding: 12px 20px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
              transition: opacity 0.2s;
            "
          >
            Send
          </button>
        </form>
      </div>
    `;

    // Add message styles
    const style = document.createElement("style");
    style.textContent = `
      #insertabot-messages::-webkit-scrollbar {
        width: 6px;
      }
      #insertabot-messages::-webkit-scrollbar-track {
        background: transparent;
      }
      #insertabot-messages::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }
      .insertabot-message {
        display: flex;
        gap: 8px;
        max-width: 80%;
      }
      .insertabot-message-user {
        margin-left: auto;
        flex-direction: row-reverse;
      }
      .insertabot-message-content {
        background: white;
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      .insertabot-message-user .insertabot-message-content {
        background: ${widgetConfig.primary_color};
        color: white;
      }
      #insertabot-input:focus {
        border-color: ${widgetConfig.primary_color};
      }
      #insertabot-send:hover:not(:disabled) {
        opacity: 0.9;
      }
      #insertabot-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      #insertabot-image-btn:hover {
        background: #e5e7eb;
      }
      #insertabot-remove-image:hover {
        opacity: 0.9;
      }
      .insertabot-message-image {
        max-width: 200px;
        max-height: 200px;
        border-radius: 8px;
        margin-top: 8px;
        object-fit: cover;
      }
      .insertabot-message-content pre.ib-code-block {
        background: #0d1117;
        border: 1px solid #30363d;
        border-radius: 6px;
        padding: 12px 14px;
        margin: 8px 0;
        overflow-x: auto;
        font-size: 12px;
        line-height: 1.6;
        white-space: pre;
      }
      .insertabot-message-content pre.ib-code-block code {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        color: #e6edf3;
        background: none;
        padding: 0;
        border: none;
        font-size: inherit;
      }
      .insertabot-message-content code.ib-inline-code {
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        background: #f0f0f0;
        color: #1f2937;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 12px;
        border: 1px solid #d1d5db;
      }
      .insertabot-message-user .insertabot-message-content code.ib-inline-code {
        background: rgba(255, 255, 255, 0.25);
        color: #fff;
        border-color: transparent;
      }
      .insertabot-message-content ul.ib-list,
      .insertabot-message-content ol.ib-list {
        margin: 6px 0 6px 18px;
        padding: 0;
      }
      .insertabot-message-content ul.ib-list li,
      .insertabot-message-content ol.ib-list li {
        margin-bottom: 3px;
        line-height: 1.5;
      }
      .insertabot-message-content p {
        margin: 0 0 6px 0;
      }
      .insertabot-message-content p:last-child {
        margin-bottom: 0;
      }
      .insertabot-message-content strong { font-weight: 700; }
      .insertabot-message-content em { font-style: italic; }
      .insertabot-message-content .ib-code-wrap {
        position: relative;
        margin: 8px 0;
      }
      .insertabot-message-content .ib-code-wrap .ib-code-block {
        margin: 0;
      }
      .insertabot-message-content .ib-copy-btn {
        position: absolute;
        top: 6px;
        right: 6px;
        background: rgba(255,255,255,0.1);
        color: #e6edf3;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        cursor: pointer;
        font-family: 'SFMono-Regular', Consolas, monospace;
        line-height: 1.4;
        transition: background 0.15s;
        z-index: 1;
      }
      .insertabot-message-content .ib-copy-btn:hover {
        background: rgba(255,255,255,0.2);
      }
      .insertabot-message-content .ib-msg-copy-btn {
        display: block;
        margin-top: 10px;
        background: none;
        border: none;
        color: rgba(255,255,255,0.4);
        font-size: 11px;
        cursor: pointer;
        padding: 0;
        font-family: inherit;
        transition: color 0.15s;
      }
      .insertabot-message-content .ib-msg-copy-btn:hover {
        color: rgba(255,255,255,0.85);
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(chatContainer);

    // Cache DOM elements
    chatMessages = document.getElementById("insertabot-messages");
    chatInput = document.getElementById("insertabot-input");
    chatForm = document.getElementById("insertabot-form");
    imagePreview = document.getElementById("insertabot-image-preview");
    imageInput = document.getElementById("insertabot-image-input");

    // Event listeners
    document
      .getElementById("insertabot-close")
      .addEventListener("click", toggleChat);
    chatForm.addEventListener("submit", handleSubmit);
    document
      .getElementById("insertabot-image-btn")
      .addEventListener("click", () => imageInput.click());
    imageInput.addEventListener("change", handleImageUpload);
    document
      .getElementById("insertabot-remove-image")
      .addEventListener("click", removeImage);
  }

  /**
   * Toggle chat open/closed
   */
  function toggleChat() {
    isOpen = !isOpen;

    if (isOpen) {
      chatBubble.style.display = "none";
      chatContainer.style.display = "flex";
      chatInput.focus();
    } else {
      chatBubble.style.display = "flex";
      chatContainer.style.display = "none";
    }

    log.info("Chat toggled:", isOpen ? "open" : "closed");
  }

  /**
   * Render markdown text to safe HTML.
   * Content is HTML-escaped before tag insertion — safe for innerHTML.
   */
  function renderMarkdown(text) {
    function esc(str) {
      var d = document.createElement("div");
      d.textContent = str;
      return d.innerHTML;
    }
    var codeBlocks = [], inlineCodes = [];
    // 1. Extract fenced code blocks (content escaped at extraction time)
    var s = text.replace(/```(\w*)\n([\s\S]*?)```/g, function(_, lang, code) {
      var lc = lang ? " class=\"language-" + esc(lang) + "\"" : "";
      codeBlocks.push("<div class=\"ib-code-wrap\"><button class=\"ib-copy-btn\">Copy</button><pre class=\"ib-code-block\"><code" + lc + ">" + esc(code.trimEnd()) + "</code></pre></div>");
      return "\x00CB" + (codeBlocks.length - 1) + "\x00";
    });
    // 2. Extract inline code spans
    s = s.replace(/`([^`\n]+)`/g, function(_, code) {
      inlineCodes.push("<code class=\"ib-inline-code\">" + esc(code) + "</code>");
      return "\x00IC" + (inlineCodes.length - 1) + "\x00";
    });
    // 3. Escape all remaining plain text
    s = esc(s);
    // 4. Bold and italic (markers survive esc() — not HTML-special)
    s = s.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__(.+?)__/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    s = s.replace(/_([^_\n]+)_/g, "<em>$1</em>");
    // 5. Unordered lists
    s = s.replace(/((?:^[ \t]*[-*] .+(?:\n|$))+)/gm, function(block) {
      return "<ul class=\"ib-list\">" + block.trim().split("\n").map(function(l) {
        return "<li>" + l.replace(/^[ \t]*[-*] /, "").trim() + "</li>";
      }).join("") + "</ul>";
    });
    // 6. Ordered lists
    s = s.replace(/((?:^[ \t]*\d+\. .+(?:\n|$))+)/gm, function(block) {
      return "<ol class=\"ib-list\">" + block.trim().split("\n").map(function(l) {
        return "<li>" + l.replace(/^[ \t]*\d+\. /, "").trim() + "</li>";
      }).join("") + "</ol>";
    });
    // 7. Paragraphs and line breaks
    s = s.split(/\n\n+/).map(function(para) {
      var t = para.trim();
      if (/^<(ul|ol|pre)/.test(t)) return t;
      return "<p>" + t.replace(/\n/g, "<br>") + "</p>";
    }).join("\n");
    // 8. Restore placeholders
    s = s.replace(/\x00IC(\d+)\x00/g, function(_, i) { return inlineCodes[+i]; });
    s = s.replace(/\x00CB(\d+)\x00/g, function(_, i) { return codeBlocks[+i]; });
    return s;
  }

  /**
   * Apply final markdown render to a message bubble after streaming completes.
   */
  function finalizeMessage(messageDiv, content) {
    var contentDiv = messageDiv.querySelector(".insertabot-message-content");
    if (contentDiv) {
      contentDiv.innerHTML = renderMarkdown(content);
      // Code block copy buttons
      contentDiv.querySelectorAll(".ib-copy-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
          var code = btn.parentElement.querySelector("code").textContent;
          navigator.clipboard.writeText(code).then(function() {
            btn.textContent = "Copied!";
            setTimeout(function() { btn.textContent = "Copy"; }, 2000);
          }).catch(function() {
            var ta = document.createElement("textarea");
            ta.value = code; document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); } catch(e) {}
            document.body.removeChild(ta);
            btn.textContent = "Copied!";
            setTimeout(function() { btn.textContent = "Copy"; }, 2000);
          });
        });
      });
      // Message-level copy button
      var msgCopy = document.createElement("button");
      msgCopy.className = "ib-msg-copy-btn";
      msgCopy.textContent = "Copy response";
      msgCopy.addEventListener("click", function() {
        navigator.clipboard.writeText(content).then(function() {
          msgCopy.textContent = "Copied!";
          setTimeout(function() { msgCopy.textContent = "Copy response"; }, 2000);
        }).catch(function() {
          var ta = document.createElement("textarea");
          ta.value = content; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); } catch(e) {}
          document.body.removeChild(ta);
          msgCopy.textContent = "Copied!";
          setTimeout(function() { msgCopy.textContent = "Copy response"; }, 2000);
        });
      });
      contentDiv.appendChild(msgCopy);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  /**
   * Add message to chat
   */
  function addMessage(role, content, imageData = null) {
    messages.push({ role, content });

    const messageDiv = document.createElement("div");
    messageDiv.className = `insertabot-message insertabot-message-${role}`;

    let imageHtml = "";
    if (imageData) {
      imageHtml = `<img src="${imageData}" class="insertabot-message-image" />`;
    }

    messageDiv.innerHTML = `
      <div class="insertabot-message-content">
        ${escapeHtml(content)}
        ${imageHtml}
      </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return messageDiv;
  }

  /**
   * Update message content (for streaming)
   */
  function updateMessage(messageDiv, content) {
    const contentDiv = messageDiv.querySelector(".insertabot-message-content");
    contentDiv.textContent = content;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Handle image upload
   */
  async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (4MB max)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image must be less than 4MB");
      return;
    }

    try {
      // Convert to base64
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Store image data
      currentImage = {
        name: file.name,
        data: base64Image,
      };

      // Show preview
      showImagePreview(file.name, base64Image);

      log.info("Image uploaded:", file.name);
    } catch (error) {
      log.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    }
  }

  /**
   * Show image preview
   */
  function showImagePreview(filename, imageData) {
    document.getElementById("insertabot-preview-img").src = imageData;
    document.getElementById("insertabot-preview-name").textContent = filename;
    imagePreview.style.display = "block";
  }

  /**
   * Remove uploaded image
   */
  function removeImage() {
    currentImage = null;
    imagePreview.style.display = "none";
    imageInput.value = "";
    log.info("Image removed");
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(event) {
    event.preventDefault();

    const message = chatInput.value.trim();
    if ((!message && !currentImage) || isGenerating) return;

    const messageText = message || "What do you see in this image?";
    const imageData = currentImage ? currentImage.data : null;

    // Add user message with image
    addMessage("user", messageText, imageData);
    chatInput.value = "";

    // Clear image preview
    if (currentImage) {
      removeImage();
    }

    // Disable input
    isGenerating = true;
    chatInput.disabled = true;
    document.getElementById("insertabot-send").disabled = true;
    document.getElementById("insertabot-image-btn").disabled = true;

    try {
      await sendMessage(messageText, imageData);
    } catch (error) {
      log.error("Error sending message:", error);
      addMessage(
        "assistant",
        "Sorry, I encountered an error. Please try again.",
      );
    } finally {
      isGenerating = false;
      chatInput.disabled = false;
      document.getElementById("insertabot-send").disabled = false;
      document.getElementById("insertabot-image-btn").disabled = false;
      chatInput.focus();
    }
  }

  /**
   * Send message to API
   */
  async function sendMessage(userMessage, imageData = null) {
    abortController = new AbortController();

    // Build the message content
    let messageContent;
    if (imageData) {
      // Vision request with image
      messageContent = [
        { type: "text", text: userMessage },
        { type: "image_url", image_url: { url: imageData } },
      ];
    } else {
      // Regular text message
      messageContent = userMessage;
    }

    // Update messages array with the new user message
    messages[messages.length - 1] = {
      role: "user",
      content: messageContent,
    };

    const requestBody = {
      messages: messages,
      stream: true,
      temperature: widgetConfig.temperature,
      max_tokens: widgetConfig.max_tokens,
      model: imageData ? "llama-3.2-vision" : widgetConfig.model, // Use vision model if image attached
    };

    const response = await fetch(`${API_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(requestBody),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Request failed");
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = "";
    let messageDiv = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                assistantMessage += content;

                if (!messageDiv) {
                  messageDiv = addMessage("assistant", assistantMessage);
                } else {
                  updateMessage(messageDiv, assistantMessage);
                }
              }
            } catch (e) {
              log.error("Failed to parse chunk:", e);
            }
          }
        }
      }

      // Update messages array with final response, then render markdown
      if (assistantMessage) {
        messages.push({ role: "assistant", content: assistantMessage });
        if (messageDiv) finalizeMessage(messageDiv, assistantMessage);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        log.info("Request aborted");
      } else {
        throw error;
      }
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Escape HTML attribute values
   */
  function escapeHtmlAttr(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Initialize widget
   */
  async function init() {
    try {
      log.info("Initializing Insertabot...");

      // Load configuration
      await fetchConfig();

      // Initialize system message
      messages.push({
        role: "system",
        content: widgetConfig.system_prompt,
      });

      // Create UI
      createChatBubble();
      createChatContainer();

      log.info("Insertabot initialized successfully");
    } catch (error) {
      log.error("Failed to initialize Insertabot:", error);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
