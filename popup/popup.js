// Popup script
document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Load saved API key
  const { openaiApiKey } = await chrome.storage.local.get('openaiApiKey');
  if (openaiApiKey) {
    apiKeyInput.value = openaiApiKey;
    showStatus('API key loaded', 'info');
  }

  // Save API key
  saveBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      showStatus('Invalid API key format', 'error');
      return;
    }

    try {
      // Save to storage
      await chrome.storage.local.set({ openaiApiKey: apiKey });

      // Notify service worker
      await chrome.runtime.sendMessage({
        type: 'SET_API_KEY',
        apiKey: apiKey
      });

      showStatus('✅ Saved! Opening YouTube...', 'success');
      
      // Auto-open YouTube after 1 second
      setTimeout(() => {
        chrome.tabs.create({ url: 'https://www.youtube.com' });
        window.close(); // Close popup
      }, 1000);
    } catch (error) {
      console.error('Error saving API key:', error);
      showStatus('Failed to save API key', 'error');
    }
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        status.style.display = 'none';
      }, 3000);
    }
  }
});
