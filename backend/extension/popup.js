document.addEventListener('DOMContentLoaded', async () => {
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = statusIndicator.querySelector('.status-text');
  
  const contactNameEl = document.getElementById('contact-name');
  const contactInfoEl = document.getElementById('contact-info');
  
  const panels = {
    idle: document.getElementById('state-idle'),
    confirming: document.getElementById('state-confirming'),
    waiting: document.getElementById('state-waiting'),
    approved: document.getElementById('state-approved'),
    declined: document.getElementById('state-declined'),
    expired: document.getElementById('state-expired'),
    error: document.getElementById('state-error')
  };
  
  const resultContainer = document.getElementById('result-container');
  const mainContent = document.getElementById('main-content');
  
  let currentContact = null;

  const CONSENT_TEXT = `Hi! To serve you better, we use Wa-CRM Intelligence to analyze this conversation and identify your requirements, follow-ups, and suitable next steps. Your chat text will be processed only for this purpose. Media, calls, passwords, authentication details, and unrelated conversations will not be accessed.

Please reply YES to allow analysis of this conversation, or NO to decline. You can withdraw your consent at any time before analysis begins.`;

  async function getTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  function updateUI(state, text, data = {}) {
    console.log(`[Wa-CRM Popup] Transitioning state to: ${state} - "${text}"`, data);
    statusIndicator.className = `status ${state.toLowerCase()}`;
    statusText.textContent = text;
    
    Object.values(panels).forEach(p => p.classList.add('hidden'));
    
    if (panels[state.toLowerCase()]) {
        panels[state.toLowerCase()].classList.remove('hidden');
    }
    
    if (state === 'WAITING' && data.requestedAt) {
        const timeStr = new Date(data.requestedAt).toLocaleTimeString();
        document.getElementById('request-time').textContent = `Request sent at ${timeStr}`;
    }
    
    if (state === 'ERROR' && data.error) {
        document.getElementById('error-message').textContent = data.error;
    }
  }

  async function loadContact() {
    console.log("[Wa-CRM Popup] Calling loadContact...");
    try {
        const tab = await getTab();
        const res = await new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tab.id, { action: 'getContactInfo' }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        console.log("[Wa-CRM Popup] getContactInfo response:", res);

        if (res && res.success) {
            currentContact = res.data.name;
            contactNameEl.textContent = currentContact;
            contactInfoEl.classList.remove('hidden');
            checkConsentState();
        } else {
            const rawRes = typeof res === 'undefined' ? 'UNDEFINED' : JSON.stringify(res);
            updateUI('ERROR', 'Error', { error: `Ext Err: ${res && res.error ? res.error : rawRes}` });
        }
    } catch (err) {
        console.error("[Wa-CRM Popup] Error in loadContact:", err);
        updateUI('ERROR', 'Error', { error: `Conn Err: ${err.message}` });
    }
  }

  function checkConsentState() {
      console.log("[Wa-CRM Popup] Checking consent state in storage...");
      chrome.storage.local.get(['activeConsent'], (result) => {
          const consent = result.activeConsent;
          console.log("[Wa-CRM Popup] Storage returned:", consent);
          if (!consent || consent.contactIdentifier !== currentContact) {
              updateUI('IDLE', 'Consent has not been requested');
              return;
          }
          
          if (consent.status === 'WAITING_FOR_RESPONSE') {
              const now = new Date();
              const expiresAt = new Date(consent.expiresAt);
              if (now > expiresAt) {
                  consent.status = 'EXPIRED';
                  chrome.storage.local.set({ activeConsent: consent });
                  updateUI('EXPIRED', 'Consent request expired');
                  stopObserver();
              } else {
                  updateUI('WAITING', 'Waiting for customer consent', consent);
              }
          } else if (consent.status === 'APPROVED') {
              updateUI('APPROVED', 'Customer approved chat analysis');
              extractAndAnalyze(consent);
          } else if (consent.status === 'DECLINED') {
              updateUI('DECLINED', 'Customer declined chat analysis');
          } else if (consent.status === 'EXPIRED') {
              updateUI('EXPIRED', 'Consent request expired');
          } else if (consent.status === 'ERROR') {
              updateUI('ERROR', 'Error', consent);
          } else {
              updateUI('IDLE', 'Consent has not been requested');
          }
      });
  }

  async function stopObserver() {
      console.log("[Wa-CRM Popup] Stopping observer...");
      const tab = await getTab();
      chrome.tabs.sendMessage(tab.id, { action: 'stopObserver' });
  }

  // Event Listeners
  document.getElementById('btn-request-consent').addEventListener('click', () => {
      updateUI('CONFIRMING', 'Confirm Consent Request');
  });

  document.getElementById('btn-cancel-confirm').addEventListener('click', () => {
      updateUI('IDLE', 'Consent has not been requested');
  });

  document.getElementById('btn-send-request').addEventListener('click', async () => {
      console.log("[Wa-CRM Popup] Sending consent request...");
      try {
          const tab = await getTab();
          const requestedAtIso = new Date().toISOString();
          
          const res = await new Promise((resolve, reject) => {
              chrome.tabs.sendMessage(tab.id, { 
                  action: 'sendConsentRequest', 
                  text: CONSENT_TEXT,
                  contactIdentifier: currentContact,
                  requestedAtIso: requestedAtIso
              }, (response) => {
                  if (chrome.runtime.lastError) {
                      resolve({ success: false, error: chrome.runtime.lastError.message });
                  } else {
                      resolve(response);
                  }
              });
          });
          
          console.log("[Wa-CRM Popup] sendConsentRequest response:", res);

          if (res && res.success) {
              const consentData = {
                  contactIdentifier: currentContact,
                  requestedAt: requestedAtIso,
                  status: 'WAITING_FOR_RESPONSE',
                  expiresAt: new Date(Date.now() + 10 * 60000).toISOString() // 10 min expiry
              };
              chrome.storage.local.set({ activeConsent: consentData });
              updateUI('WAITING', 'Waiting for customer consent', consentData);
          } else {
              updateUI('ERROR', 'Error', { error: res ? res.error : 'Failed to send message.' });
          }
      } catch (err) {
          console.error("[Wa-CRM Popup] Error sending consent request:", err);
          updateUI('ERROR', 'Error', { error: err.message });
      }
  });

  document.getElementById('btn-cancel-request').addEventListener('click', () => {
      stopObserver();
      chrome.storage.local.remove('activeConsent');
      updateUI('IDLE', 'Consent has not been requested');
  });

  document.getElementById('btn-close-declined').addEventListener('click', () => {
      chrome.storage.local.remove('activeConsent');
      updateUI('IDLE', 'Consent has not been requested');
  });

  document.getElementById('btn-request-again').addEventListener('click', () => {
      chrome.storage.local.remove('activeConsent');
      updateUI('IDLE', 'Consent has not been requested');
  });

  document.getElementById('btn-error-reset').addEventListener('click', () => {
      chrome.storage.local.remove('activeConsent');
      updateUI('IDLE', 'Consent has not been requested');
  });
  
  document.getElementById('back-btn').addEventListener('click', () => {
      resultContainer.classList.add('hidden');
      mainContent.classList.remove('hidden');
      chrome.storage.local.remove('activeConsent');
      updateUI('IDLE', 'Consent has not been requested');
  });

  async function extractAndAnalyze(consent) {
      console.log("[Wa-CRM Popup] Starting extractAndAnalyze with consent:", consent);
      try {
          const tab = await getTab();
          const extRes = await new Promise(resolve => chrome.tabs.sendMessage(tab.id, { 
              action: 'extractConversation',
              requestedAtIso: consent.requestedAt
          }, resolve));
          
          console.log("[Wa-CRM Popup] extractConversation response:", extRes);

          if (!extRes || !extRes.success) {
              throw new Error(extRes ? extRes.error : 'Failed to extract chat.');
          }
          
          const payload = {
            consent: {
              status: "approved",
              method: "whatsapp-reply",
              requestedAt: consent.requestedAt,
              respondedAt: consent.respondedAt,
              response: consent.response,
              scope: "current-conversation-analysis"
            },
            conversation: {
              contactName: currentContact,
              source: 'whatsapp-web',
              capturedAt: new Date().toISOString(),
              messages: extRes.data.messages
            }
          };

          console.log("[Wa-CRM Popup] Sending payload to backend API:", payload);

          const apiRes = await fetch(`${WA_CRM_CONFIG.API_URL}/leads/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          console.log(`[Wa-CRM Popup] API response status: ${apiRes.status}`);

          if (!apiRes.ok) {
             const errData = await apiRes.json().catch(() => ({}));
             throw new Error(errData.message || `Server returned ${apiRes.status}`);
          }

          const resData = await apiRes.json();
          console.log("[Wa-CRM Popup] API success response:", resData);

          if (resData.success && resData.lead) {
             renderAnalysis(resData.lead);
             // Clear temp memory
             chrome.storage.local.remove('activeConsent');
          } else {
             throw new Error('Invalid response from backend');
          }

      } catch (err) {
          console.error("[Wa-CRM Popup] API or extraction failed:", err);
          updateUI('ERROR', 'Error', { error: `Analysis failed: ${err.message}` });
          // Ensure we clear memory on failure too
          chrome.storage.local.remove('activeConsent');
      }
  }

  function renderAnalysis(lead) {
      console.log("[Wa-CRM Popup] Rendering analysis UI:", lead);
      mainContent.classList.add('hidden');
      resultContainer.classList.remove('hidden');
      
      document.getElementById('res-score').textContent = lead.leadScore;
      document.getElementById('res-name').textContent = lead.contactName;
      document.getElementById('res-category').textContent = lead.category;
      document.getElementById('res-summary').textContent = lead.summary;
      document.getElementById('res-intent').textContent = lead.intent;
      document.getElementById('res-sentiment').textContent = lead.sentiment || (lead.leadScore >= 50 ? 'Positive' : 'Neutral');
      document.getElementById('res-followup').textContent = lead.followUpStatus;
      document.getElementById('res-action').textContent = lead.recommendedAction;
      document.getElementById('res-reply').textContent = lead.suggestedReply || lead.recommendedAction;
  }

  // Poll storage for updates (since content.js writes to it)
  chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.activeConsent) {
          checkConsentState();
      }
  });

  loadContact();
});
