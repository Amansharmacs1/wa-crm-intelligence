document.addEventListener('DOMContentLoaded', async () => {
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.querySelector('.status-text');
  const extractBtn = document.getElementById('extract-btn');
  const errorContainer = document.getElementById('error-container');
  const errorMessage = document.getElementById('error-message');
  const contactInfo = document.getElementById('contact-info');
  const contactNameEl = document.getElementById('contact-name');
  const avatarInitialsEl = document.getElementById('avatar-initials');
  const messageCountEl = document.getElementById('message-count');
  
  const mainContent = document.getElementById('main-content');
  const resultContainer = document.getElementById('result-container');
  const jsonPreview = document.getElementById('json-preview');
  const backBtn = document.getElementById('back-btn');

  function showError(msg) {
    errorContainer.classList.remove('hidden');
    errorMessage.textContent = msg;
    statusIndicator.className = 'status error';
    statusText.textContent = 'Error';
    extractBtn.disabled = true;
    contactInfo.classList.add('hidden');
  }

  function hideError() {
    errorContainer.classList.add('hidden');
  }

  function getInitials(name) {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.url || !tab.url.startsWith('https://web.whatsapp.com')) {
      showError('Please open WhatsApp Web to use this extension.');
      return;
    }

    statusIndicator.className = 'status connected';
    statusText.textContent = 'Connected';

    chrome.tabs.sendMessage(tab.id, { action: 'getContactInfo' }, (response) => {
      if (chrome.runtime.lastError) {
        showError('Content script unavailable. Please refresh WhatsApp Web.');
        console.error(chrome.runtime.lastError);
        return;
      }

      if (response && response.success) {
        const data = response.data;
        if (data && data.contactName) {
           contactInfo.classList.remove('hidden');
           contactNameEl.textContent = data.contactName;
           avatarInitialsEl.textContent = getInitials(data.contactName);
           messageCountEl.textContent = `${data.messageCount} messages visible`;
           
           if (data.messageCount === 0) {
             showError('Selected conversation has no visible messages.');
           } else {
             hideError();
             extractBtn.disabled = false;
           }
        } else {
           showError('No conversation is currently selected.');
        }
      } else if (response && response.error) {
        if (response.error === 'NO_CHAT_OPEN') {
           showError('No conversation is currently selected.');
        } else {
           showError(`Extraction error: ${response.error}`);
        }
      } else {
        showError('Unknown error occurred.');
      }
    });

  } catch (err) {
    showError(err.message);
  }

  extractBtn.addEventListener('click', async () => {
    extractBtn.textContent = 'Extracting...';
    extractBtn.disabled = true;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { action: 'extractConversation' }, (response) => {
      extractBtn.textContent = 'Detect Conversation';
      extractBtn.disabled = false;

      if (response && response.success) {
        mainContent.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        jsonPreview.textContent = JSON.stringify(response.data, null, 2);
        console.log('WA-CRM Extraction Success:', response.data);
      } else {
        showError(response ? response.error : 'Failed to extract conversation.');
      }
    });
  });

  backBtn.addEventListener('click', () => {
    resultContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
  });
});
