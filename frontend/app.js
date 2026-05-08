// app.js - Gemini Flash UI Frontend

// Wait for DOM to be fully loaded before executing
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const API_URL_INPUT = document.getElementById('apiUrl');
  const STATUS_DIV = document.getElementById('status');
  const STATUS_TEXT = STATUS_DIV.querySelector('.status-text');

  // Configuration
  const TEMP_INPUT = document.getElementById('temperature');
  const MAX_TOKENS_INPUT = document.getElementById('maxTokens');

  // Text Generation
  const TEXT_PROMPT = document.getElementById('textPrompt');
  const SEND_TEXT_BTN = document.getElementById('sendTextBtn');
  const TEXT_RESPONSE = document.getElementById('textResponse');

  // Chat
  const CHAT_HISTORY = document.getElementById('chatHistory');
  const CHAT_MESSAGE = document.getElementById('chatMessage');
  const SEND_CHAT_BTN = document.getElementById('sendChatBtn');
  const CHAT_RESPONSE = document.getElementById('chatResponse');

  // Image Analysis
  const IMAGE_FILE = document.getElementById('imageFile');
  const IMAGE_PROMPT = document.getElementById('imagePrompt');
  const SEND_IMAGE_BTN = document.getElementById('sendImageBtn');
  const IMAGE_RESPONSE = document.getElementById('imageResponse');

  // Backend version display
  const BACKEND_VERSION = document.getElementById('backendVersion');

  // Chat state
  let chatHistory = [];

  // ============================================
  // Utility Functions
  // ============================================

  async function apiRequest(endpoint, data) {
    const apiUrl = API_URL_INPUT.value.trim();
    const url = `${apiUrl}${endpoint}`;

    const config = {
      temperature: parseFloat(TEMP_INPUT.value),
      maxOutputTokens: parseInt(MAX_TOKENS_INPUT.value),
    };

    const payload = { ...data, config };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  function showResponse(element, data, hideAfter = null) {
    element.classList.remove('hidden');
    element.textContent = JSON.stringify(data, null, 2);

    if (hideAfter) {
      setTimeout(() => element.classList.add('hidden'), hideAfter);
    }
  }

  function setStatus(connected, text) {
    STATUS_DIV.className = `status ${connected ? 'connected' : 'disconnected'}`;
    STATUS_TEXT.textContent = text;
  }

  function setLoading(button, isLoading) {
    button.disabled = isLoading;
    button.innerHTML = isLoading ? '<span class="loading"></span> Loading...' : button.dataset.originalText;
  }

  // ============================================
  // Health Check & Initialization
  // ============================================

  async function checkHealth() {
    try {
      const apiUrl = API_URL_INPUT.value.trim();
      const response = await fetch(`${apiUrl}/health`);
      
      if (!response.ok) throw new Error('Health check failed');
      
      const data = await response.json();
      setStatus(true, `Connected to backend (${data.data.version})`);
      BACKEND_VERSION.textContent = data.data.version;
    } catch (err) {
      setStatus(false, `Cannot connect to backend: ${err.message}`);
      BACKEND_VERSION.textContent = 'Disconnected';
    }
  }

  // ============================================
  // Text Generation
  // ============================================

  SEND_TEXT_BTN.dataset.originalText = SEND_TEXT_BTN.textContent;

  SEND_TEXT_BTN.addEventListener('click', async () => {
    const prompt = TEXT_PROMPT.value.trim();
    if (!prompt) {
      alert('Please enter a prompt');
      return;
    }

    setLoading(SEND_TEXT_BTN, true);
    TEXT_RESPONSE.classList.add('hidden');

    try {
      const result = await apiRequest('/gemini/text', { prompt });
      showResponse(TEXT_RESPONSE, result);
    } catch (err) {
      showResponse(TEXT_RESPONSE, { error: err.message });
    } finally {
      setLoading(SEND_TEXT_BTN, false);
    }
  });

  // ============================================
  // Chat
  // ============================================

  SEND_CHAT_BTN.dataset.originalText = SEND_CHAT_BTN.textContent;

  function addChatMessage(role, text) {
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    div.textContent = `${role}: ${text}`;
    CHAT_HISTORY.appendChild(div);
    CHAT_HISTORY.scrollTop = CHAT_HISTORY.scrollHeight;
  }

  SEND_CHAT_BTN.addEventListener('click', async () => {
    const message = CHAT_MESSAGE.value.trim();
    if (!message) {
      alert('Please enter a message');
      return;
    }

    // Add user message to history display
    addChatMessage('user', message);
    CHAT_MESSAGE.value = '';

    setLoading(SEND_CHAT_BTN, true);
    CHAT_RESPONSE.classList.add('hidden');

    try {
      const result = await apiRequest('/gemini/chat', {
        message,
        conversationHistory: chatHistory,
      });

      const responseText = result.data?.response || 'No response';
      
      // Add model response to history
      addChatMessage('model', responseText);
      
      // Update chat history for next request
      chatHistory.push(
        { role: 'user', content: message },
        { role: 'model', content: responseText }
      );

      showResponse(CHAT_RESPONSE, result);
    } catch (err) {
      showResponse(CHAT_RESPONSE, { error: err.message });
    } finally {
      setLoading(SEND_CHAT_BTN, false);
    }
  });

  // ============================================
  // Image Analysis
  // ============================================

  SEND_IMAGE_BTN.dataset.originalText = SEND_IMAGE_BTN.textContent;

  SEND_IMAGE_BTN.addEventListener('click', async () => {
    const file = IMAGE_FILE.files[0];
    const prompt = IMAGE_PROMPT.value.trim();

    if (!file) {
      alert('Please select an image');
      return;
    }
    if (!prompt) {
      alert('Please enter a prompt');
      return;
    }

    setLoading(SEND_IMAGE_BTN, true);
    IMAGE_RESPONSE.classList.add('hidden');

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1]; // Remove data:image/... prefix

        try {
          const result = await apiRequest('/gemini/image', {
            imageData: base64,
            mimeType: file.type,
            prompt,
          });
          showResponse(IMAGE_RESPONSE, result);
        } catch (err) {
          showResponse(IMAGE_RESPONSE, { error: err.message });
        } finally {
          setLoading(SEND_IMAGE_BTN, false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showResponse(IMAGE_RESPONSE, { error: err.message });
      setLoading(SEND_IMAGE_BTN, false);
    }
  });

  // ============================================
  // Initialize
  // ============================================

  // Check backend health on load
  checkHealth();

  // Re-check when API URL changes
  API_URL_INPUT.addEventListener('change', checkHealth);
});
