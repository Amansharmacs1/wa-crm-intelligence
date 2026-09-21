let consentObserver = null;

function getContactName() {
    console.log("[Wa-CRM Content] getContactName called...");
    
    // 1. Most stable: The active chat in the left sidebar list!
    const activeSidebar = document.querySelector('div[aria-selected="true"]');
    if (activeSidebar) {
        // Find the title span inside the active sidebar element
        const titleSpan = activeSidebar.querySelector('span[title]');
        if (titleSpan) {
            const text = titleSpan.getAttribute('title').trim();
            if (text && text.length > 0) {
                console.log("[Wa-CRM Content] Found contact via sidebar aria-selected:", text);
                return text;
            }
        }
    }

    // 2. Fallback: The main chat header
    const selectors = [
        '#main header [title]', '#main header span[dir="auto"]', 'header [title]',
        '#main div[data-testid="conversation-header"] span[dir="auto"]',
        '#main span[dir="auto"][title]'
    ];
    for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
            const text = (el.title || el.innerText || el.textContent || '').trim();
            if (text && text.length > 0 && !['search', 'menu', 'profile details', 'attach'].includes(text.toLowerCase())) {
                console.log("[Wa-CRM Content] Found contact via header selector:", text);
                return text;
            }
        }
    }
    
    // 3. Ultra Fallback: Just grab the first viable piece of text at the very top of the chat pane!
    const main = document.querySelector('#main, main, [data-testid="conversation-panel-wrapper"]');
    if (main) {
        const allSpans = main.querySelectorAll('span, div');
        for (let i = 0; i < Math.min(30, allSpans.length); i++) {
            const el = allSpans[i];
            const text = (el.title || el.innerText || el.textContent || '').trim();
            const exclude = ['search', 'menu', 'profile details', 'profile', 'attach', 'online', 'typing...', 'click here', 'today', 'yesterday'];
            const lowerText = text.toLowerCase();
            const isExcluded = exclude.some(ex => lowerText.includes(ex));
            if (text && text.length > 1 && text.length < 40 && !isExcluded) {
                console.log("[Wa-CRM Content] Found contact via ultra-fallback:", text);
                return text;
            }
        }
    }
    console.warn("[Wa-CRM Content] Failed to find contact name!");
    return null;
}

function sendConsentMessage(text) {
  console.log("[Wa-CRM Content] Attempting to send consent message...");
  const main = document.querySelector(WA_SELECTORS.mainChat);
  if (!main) throw new Error('No active chat found');
  
  const input = main.querySelector('div[contenteditable="true"][title*="Type a message"], div[contenteditable="true"][data-tab="10"]');
  if (!input) throw new Error('Cannot request consent: This chat is read-only or input box not found.');

  input.focus();
  document.execCommand('insertText', false, text);
  input.dispatchEvent(new Event('input', { bubbles: true }));

  let attempts = 0;
  const clickInterval = setInterval(() => {
    attempts++;
    const sendIcon = main.querySelector('button span[data-icon="send"]');
    const ariaBtn = main.querySelector('button[aria-label="Send"]');
    let btnToClick = ariaBtn || (sendIcon ? sendIcon.closest('button') : null);
    
    if (btnToClick) {
        console.log(`[Wa-CRM Content] Found and clicked Send button on attempt ${attempts}`);
        btnToClick.click();
        clearInterval(clickInterval);
    } else if (attempts > 20) {
        console.warn("[Wa-CRM Content] Failed to find Send button after 2 seconds.");
        clearInterval(clickInterval);
    }
  }, 100);
}

function checkConsentText(text) {
    const clean = text.trim().toLowerCase().replace(/[\.,!]/g, '');
    const approved = ['yes', 'yes i consent', 'i agree', 'i consent', 'y', 'yea', 'yeah', 'yep', 'ok', 'okay', 'sure', 'proceed'];
    const declined = ['no', 'nope', 'i decline', 'cancel', 'stop', 'do not consent'];
    if (approved.includes(clean)) return 'APPROVED';
    if (declined.includes(clean)) return 'DECLINED';
    return 'UNKNOWN';
}

function startConsentObserver(contactIdentifier, requestedAtIso) {
    if (consentObserver) consentObserver.disconnect();
    console.log(`[Wa-CRM Content] Starting MutationObserver for contact: ${contactIdentifier}`);

    const mainChat = document.querySelector(WA_SELECTORS.mainChat);
    if (!mainChat) return;
    
    let lastProcessedId = null;
    const initialRows = mainChat.querySelectorAll(WA_SELECTORS.messageRow);
    if (initialRows.length > 0) {
        const lastRow = initialRows[initialRows.length - 1];
        lastProcessedId = lastRow.getAttribute('data-id') || (lastRow.querySelector('[data-id]') ? lastRow.querySelector('[data-id]').getAttribute('data-id') : null);
        console.log(`[Wa-CRM Content] Observer initialized. Locked onto base message ID: ${lastProcessedId}`);
    }

    consentObserver = new MutationObserver((mutations) => {
        const currentContact = getContactName();
        if (currentContact !== contactIdentifier) {
            console.log("[Wa-CRM Content] Contact changed, disconnecting observer.");
            chrome.storage.local.set({ activeConsent: { status: 'ERROR', error: 'Contact changed' }});
            consentObserver.disconnect();
            return;
        }

        const rows = mainChat.querySelectorAll(WA_SELECTORS.messageRow);
        if (rows.length === 0) return;

        const lastRow = rows[rows.length - 1];
        let rowId = lastRow.getAttribute('data-id') || (lastRow.querySelector('[data-id]') ? lastRow.querySelector('[data-id]').getAttribute('data-id') : null);

        if (!rowId || rowId === lastProcessedId) return;
        lastProcessedId = rowId;
        console.log(`[Wa-CRM Content] Observer detected new message node ID: ${rowId}`);

        const html = lastRow.outerHTML || '';
        let sender = 'unknown';
        if (html.includes('false_') || html.includes('message-in')) sender = 'customer';
        else if (html.includes('true_') || html.includes('message-out') || html.includes('data-icon="msg-') || html.includes('data-icon="status-')) sender = 'agent';

        if (sender === 'unknown') {
            if (html.includes('msg-dblcheck') || html.includes('msg-check') || html.includes('msg-time')) sender = 'agent';
            else sender = 'customer';
        }

        if (sender === 'customer') {
            let rawText = '';
            const selectableSpans = lastRow.querySelectorAll('span.selectable-text');
            if (selectableSpans.length > 0) rawText = selectableSpans[selectableSpans.length - 1].innerText || selectableSpans[selectableSpans.length - 1].textContent || '';
            else rawText = lastRow.innerText || lastRow.textContent || '';

            let textParts = rawText.split('\n').map(p => p.trim()).filter(p => p.length > 0);
            while (textParts.length > 0) {
                const last = textParts[textParts.length - 1];
                if (last.match(/^\d{1,2}:\d{2}(\s*(am|pm|AM|PM))?$/i) || last === 'Edited' || last === 'Read more') textParts.pop();
                else break;
            }

            const text = textParts.join('\n');
            if (!text || text.includes('This message was deleted')) return;

            console.log("[Wa-CRM Content] New customer message received:", text);

            chrome.storage.local.get(['activeConsent'], (result) => {
                const consent = result.activeConsent;
                if (!consent || consent.status !== 'WAITING_FOR_RESPONSE') return;
                
                const newStatus = checkConsentText(text);
                console.log(`[Wa-CRM Content] Evaluated consent status: ${newStatus}`);
                
                if (newStatus === 'APPROVED' || newStatus === 'DECLINED') {
                    consent.status = newStatus;
                    consent.response = text;
                    consent.respondedAt = new Date().toISOString();
                    chrome.storage.local.set({ activeConsent: consent });
                    consentObserver.disconnect();
                    console.log(`[Wa-CRM Content] Saved ${newStatus} state to storage and disconnected observer.`);
                }
            });
        }
    });

    consentObserver.observe(mainChat, { childList: true, subtree: true });
}

function extractChat(requestedAtIso) {
  console.log(`[Wa-CRM Content] Beginning chat extraction...`);
  const mainChat = document.querySelector(WA_SELECTORS.mainChat);
  if (!mainChat) throw new Error('No open chat found.');

  const messages = [];
  const rows = mainChat.querySelectorAll('[role="row"], div.message-in, div.message-out, div[data-id]');
  const seenIds = new Set();
  
  rows.forEach(row => {
      let rowId = row.getAttribute('data-id') || (row.querySelector('[data-id]') ? row.querySelector('[data-id]').getAttribute('data-id') : null);
      if (!rowId) {
          if (!row.dataset.internalId) row.dataset.internalId = Math.random().toString(36).substr(2, 9);
          rowId = row.dataset.internalId;
      }
      
      if (seenIds.has(rowId)) return;
      seenIds.add(rowId);

      const html = row.outerHTML || '';
      let sender = 'unknown';
      
      if (html.includes('false_') || html.includes('message-in')) sender = 'customer';
      else if (html.includes('true_') || html.includes('message-out') || html.includes('data-icon="msg-') || html.includes('data-icon="status-')) sender = 'agent';

      if (sender === 'unknown') {
          if (html.includes('msg-dblcheck') || html.includes('msg-check') || html.includes('msg-time')) sender = 'agent';
          else sender = 'customer';
      }

      let rawText = '';
      const selectableSpans = row.querySelectorAll('span.selectable-text');
      if (selectableSpans.length > 0) rawText = selectableSpans[selectableSpans.length - 1].innerText || selectableSpans[selectableSpans.length - 1].textContent || '';
      else rawText = row.innerText || row.textContent || '';

      let textParts = rawText.split('\n').map(p => p.trim()).filter(p => p.length > 0);
      while (textParts.length > 0) {
          const last = textParts[textParts.length - 1];
          if (last.match(/^\d{1,2}:\d{2}(\s*(am|pm|AM|PM))?$/i) || last === 'Edited' || last === 'Read more') textParts.pop();
          else break;
      }

      const text = textParts.join('\n');
      
      if (text && !text.includes('This message was deleted')) {
          const isConsentRequest = text.includes("Hi! To serve you better, we use Wa-CRM Intelligence");
          const isConsentResponse = text.toUpperCase() === "YES" || text.toLowerCase() === "yes, i consent" || text.toLowerCase() === "i agree" || text.toLowerCase() === "i consent";
          
          if (requestedAtIso && (isConsentRequest || isConsentResponse)) {
              return; 
          }

          messages.push({ id: rowId, sender, text, timestamp: new Date().toISOString() });
      }
  });

  console.log(`[Wa-CRM Content] Extraction complete. Found ${messages.length} valid messages.`);
  return { messages };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`[Wa-CRM Content] Received message from popup: ${request.action}`);
  if (request.action === 'getContactInfo') {
    try {
      const name = getContactName();
      if (name) sendResponse({ success: true, data: { name } });
      else sendResponse({ success: false, error: 'No contact found' });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  } else if (request.action === 'sendConsentRequest') {
    try {
      sendConsentMessage(request.text);
      startConsentObserver(request.contactIdentifier, request.requestedAtIso);
      sendResponse({ success: true });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  } else if (request.action === 'extractConversation') {
     try {
         const data = extractChat(request.requestedAtIso);
         sendResponse({ success: true, data });
     } catch (err) {
         sendResponse({ success: false, error: err.message });
     }
  } else if (request.action === 'stopObserver') {
     if (consentObserver) consentObserver.disconnect();
     sendResponse({ success: true });
  }
  return true;
});
