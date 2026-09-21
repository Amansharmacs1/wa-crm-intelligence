document.addEventListener('DOMContentLoaded', async () => {
  const contactNameEl = document.getElementById('contact-name');
  const messageCountEl = document.getElementById('message-count');
  const avatarInitialsEl = document.getElementById('avatar-initials');
  
  const mainContent = document.getElementById('main-content');
  const contactInfo = document.getElementById('contact-info');
  const errorContainer = document.getElementById('error-container');
  const errorMessage = document.getElementById('error-message');
  
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = statusIndicator.querySelector('.status-text');
  
  const extractBtn = document.getElementById('extract-btn');
  
  const consentModal = document.getElementById('consent-modal');
  const consentCheckbox = document.getElementById('consent-checkbox');
  const cancelConsentBtn = document.getElementById('cancel-consent-btn');
  const allowConsentBtn = document.getElementById('allow-consent-btn');
  
  const loadingContainer = document.getElementById('loading-container');
  const resultContainer = document.getElementById('result-container');
  const backBtn = document.getElementById('back-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyStatus = document.getElementById('copy-status');

  function showError(msg) {
    errorContainer.classList.remove('hidden');
    statusIndicator.className = 'status error';
    statusText.textContent = 'Error';
    extractBtn.disabled = true;
    contactInfo.classList.add('hidden');
    
    // Reset to default red error styling
    errorContainer.style.backgroundColor = '#fef2f2';
    errorContainer.style.color = '#b91c1c';
    errorContainer.style.borderLeftColor = '#ef4444';
    
    if (msg.includes("Customer denied")) {
        errorMessage.innerHTML = '<strong>❌ Access Denied</strong><br><br>The customer replied "No". Permission to analyze this chat was denied. The process has been safely aborted.';
    } else {
        errorMessage.textContent = msg;
    }
    
    loadingContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
  }

  function showMessage(msg) {
    errorContainer.classList.remove('hidden');
    errorContainer.style.backgroundColor = '#f8fafc';
    errorContainer.style.color = 'var(--color-text-secondary)';
    errorContainer.style.borderLeftColor = '#94a3b8';
    errorMessage.textContent = msg;
  }

  function hideError() {
    errorContainer.classList.add('hidden');
    errorContainer.removeAttribute('style');
  }

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tabs || tabs.length === 0) {
      showError('Please open a WhatsApp Web tab first.');
      return;
    }
    
    const tab = tabs[0];
    
    if (!tab.url || !tab.url.includes('web.whatsapp.com')) {
      showError('Please navigate to web.whatsapp.com to use this extension.');
      return;
    }
    
    // Initial fetch to check if a chat is open
    const response = await new Promise((resolve) => {
       chrome.tabs.sendMessage(tab.id, { action: 'getContactInfo' }, resolve);
    });

    if (chrome.runtime.lastError || !response || !response.success) {
      showError(response ? response.error : 'Connection lost. Please completely reload the WhatsApp Web tab (Cmd+R).');
      return;
    }

    // Success: Update UI
    statusIndicator.className = 'status connected';
    statusText.textContent = 'Connected';
    
    contactInfo.classList.remove('hidden');
    contactNameEl.textContent = response.data.name;
    
    // Generate Initials
    const nameParts = response.data.name.split(' ');
    let initials = nameParts[0].charAt(0);
    if (nameParts.length > 1) {
      initials += nameParts[nameParts.length - 1].charAt(0);
    }
    avatarInitialsEl.textContent = initials.toUpperCase();

    // Check if there are actual messages to analyze
    const extractRes = await new Promise((resolve) => {
       chrome.tabs.sendMessage(tab.id, { action: 'extractConversation' }, resolve);
    });

    if (extractRes && extractRes.success && extractRes.data) {
       const data = extractRes.data;
       const customerMsgCount = data.messages.filter(m => m.sender === 'customer').length;
       const agentMsgCount = data.messages.filter(m => m.sender === 'agent').length;
       
       messageCountEl.textContent = `${customerMsgCount} customer | ${agentMsgCount} agent`;
       
       if (data.messages.length === 0) {
         showError('Selected conversation has no visible messages.');
       } else {
         hideError();
         extractBtn.disabled = false;
       }
    } else if (extractRes && extractRes.error) {
       showError(`Extraction error: ${extractRes.error}`);
    } else {
       showError('Could not read messages.');
    }

  } catch (err) {
    showError(err.message);
  }

  // --- Consent Modal Logic ---
  
  extractBtn.addEventListener('click', () => {
    hideError();
    consentModal.classList.remove('hidden');
    consentCheckbox.checked = false;
    allowConsentBtn.disabled = true;
    consentCheckbox.focus();
  });

  consentCheckbox.addEventListener('change', (e) => {
    allowConsentBtn.disabled = !e.target.checked;
  });

  function closeAndCancelConsent() {
    consentModal.classList.add('hidden');
    consentCheckbox.checked = false;
    allowConsentBtn.disabled = true;
    showMessage('Analysis cancelled. No conversation data was accessed or sent.');
    extractBtn.focus();
  }

  cancelConsentBtn.addEventListener('click', closeAndCancelConsent);

  consentModal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAndCancelConsent();
    }
  });

  allowConsentBtn.addEventListener('click', async () => {
    if (!consentCheckbox.checked) return;

    const consent = {
      granted: true,
      purpose: "lead-analysis",
      grantedAt: new Date().toISOString(),
      scope: "currently-open-conversation"
    };

    consentModal.classList.add('hidden');
    mainContent.classList.add('hidden');
    
    loadingContainer.classList.remove('hidden');
    document.getElementById('loading-text').innerHTML = 'Waiting for customer to reply...<br><br><small style="color:var(--color-text-secondary); font-size: 11px;">Please keep this window open until they reply.</small>';

    let extractedData = null;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const sendRes = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: 'sendAutomatedMessage' }, resolve);
      });
      
      if (!sendRes || !sendRes.success) {
         console.warn("Failed to automatically click send button. Please ensure the message was sent.");
      }

      const initialRes = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: 'extractConversation' }, resolve);
      });
      
      let initialLastCustomerMessageText = "";
      if (initialRes && initialRes.success && initialRes.data && initialRes.data.messages) {
          const msgs = initialRes.data.messages;
          for (let i = msgs.length - 1; i >= 0; i--) {
             if (msgs[i].sender === 'customer') {
                initialLastCustomerMessageText = msgs[i].text;
                break;
             }
          }
      }

      let consentGranted = false;
      let waitAttempts = 0;
      
      while (!consentGranted && waitAttempts < 60) {
          waitAttempts++;
          
          const extractRes = await new Promise((resolve) => {
            chrome.tabs.sendMessage(tab.id, { action: 'extractConversation' }, resolve);
          });
          
          if (extractRes && extractRes.success && extractRes.data && extractRes.data.messages && extractRes.data.messages.length > 0) {
             extractedData = extractRes.data;
             let lastCustomerMessage = null;
             for (let i = extractedData.messages.length - 1; i >= 0; i--) {
                if (extractedData.messages[i].sender === 'customer') {
                   lastCustomerMessage = extractedData.messages[i];
                   break;
                }
             }
             
             if (lastCustomerMessage && lastCustomerMessage.text !== initialLastCustomerMessageText) {
                const cleanText = lastCustomerMessage.text.toLowerCase().replace(/[^\w\s]/gi, '');
                
                if (cleanText.includes('yes') || cleanText.match(/\by\b/) || cleanText.match(/\b1\b/)) {
                   consentGranted = true;
                   break;
                } else if (cleanText.includes('no') || cleanText.match(/\bn\b/) || cleanText.match(/\b2\b/)) {
                   throw new Error("Customer denied consent.");
                }
             }
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (!consentGranted) {
         throw new Error("Timeout: The customer did not reply within 2 minutes.");
      }

      // Customer approved! Show green UI transition
      const spinnerEl = document.querySelector('.spinner');
      spinnerEl.style.borderTopColor = '#10B981';
      spinnerEl.style.borderColor = 'rgba(16, 185, 129, 0.2)';
      spinnerEl.style.borderTopColor = '#10B981';
      
      document.getElementById('loading-text').innerHTML = '<span style="color: #10B981; font-weight: 600; font-size: 15px;">✓ Customer Approved!</span><br><br><small style="color:var(--color-text-secondary); font-size: 12px;">Sending to AI for Analysis...</small>';

      // Pause for 1.5 seconds so the user can see the green success message
      await new Promise(resolve => setTimeout(resolve, 1500));

      const payload = {
        consent: consent,
        conversation: {
          contactName: document.getElementById('contact-name').textContent || 'Unknown Contact',
          source: 'whatsapp-web',
          messages: extractedData.messages
        }
      };

      const apiRes = await fetch(`${WA_CRM_CONFIG.API_URL}/leads/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!apiRes.ok) {
         const errData = await apiRes.json().catch(() => ({}));
         throw new Error(errData.message || `Server returned ${apiRes.status}`);
      }

      const resData = await apiRes.json();
      
      if (resData.success && resData.lead) {
         renderAnalysis(resData.lead);
      } else {
         throw new Error('Invalid response from backend');
      }

    } catch (err) {
      if (err.message.includes('Failed to fetch')) {
         showError('Unable to connect to Wa-CRM. Make sure the local server is running on port 5050.');
      } else {
         showError(`Analysis failed: ${err.message}`);
      }
    } finally {
      extractedData = null;
    }
  });

  function renderAnalysis(lead) {
    loadingContainer.classList.add('hidden');
    resultContainer.classList.remove('hidden');

    document.getElementById('res-score').textContent = lead.leadScore;
    document.getElementById('res-name').textContent = lead.contactName;
    document.getElementById('res-category').textContent = lead.category;
    document.getElementById('res-summary').textContent = lead.summary;
    document.getElementById('res-intent').textContent = lead.intent;
    document.getElementById('res-sentiment').textContent = lead.sentiment;
    document.getElementById('res-followup').textContent = lead.followUpStatus;
    document.getElementById('res-action').textContent = lead.recommendedAction;
    document.getElementById('res-reply').textContent = lead.suggestedReply;
    
    copyStatus.classList.add('hidden');
  }

  copyBtn.addEventListener('click', async () => {
    const textToCopy = document.getElementById('res-reply').textContent;
    try {
       await navigator.clipboard.writeText(textToCopy);
       copyStatus.classList.remove('hidden');
       setTimeout(() => { copyStatus.classList.add('hidden'); }, 3000);
    } catch (err) {
       console.error('Failed to copy text', err);
    }
  });

  backBtn.addEventListener('click', () => {
    resultContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
    extractBtn.disabled = false;
  });
});
