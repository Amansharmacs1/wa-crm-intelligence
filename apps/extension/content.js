chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getContactInfo') {
    try {
      const data = getContactInfo();
      sendResponse({ success: true, data });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  } else if (request.action === 'extractConversation') {
    try {
      const data = extractChat();
      sendResponse({ success: true, data });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  } else if (request.action === 'sendAutomatedMessage') {
    try {
      const sent = sendConsentMessage();
      sendResponse({ success: sent });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; // Keep channel open for async
});

function sendConsentMessage() {
  const main = document.querySelector(WA_SELECTORS.mainChat);
  if (!main) return false;
  
  const input = main.querySelector('div[contenteditable="true"][data-tab="10"]') || 
                main.querySelector('div[contenteditable="true"][title="Type a message"]');
  if (!input) return false;
  
  input.focus();
  document.execCommand('insertText', false, "Hi! To serve you better, we use an AI assistant to analyze our chat. Do you consent to this? Reply 'Yes' or 'No'.");
  input.dispatchEvent(new Event('input', { bubbles: true }));
  
  setTimeout(() => {
      // Simulate Enter key to send reliably in React
      input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 13, key: 'Enter' }));
      
      // Fallback: try clicking send button if it exists
      const sendBtn = main.querySelector('button [data-icon="send"]');
      if (sendBtn) {
         sendBtn.closest('button').click();
      }
  }, 200);
  
  return true;
}

function getContactInfo() {
  const mainChat = document.querySelector(WA_SELECTORS.mainChat);
  if (!mainChat) {
    throw new Error('No open chat found. Please open a chat first.');
  }

  const header = mainChat.querySelector('header');
  if (!header) {
    throw new Error('Could not find chat header.');
  }

  const spans = header.querySelectorAll('span[title], span[dir="auto"]');
  let name = 'Unknown Contact';

  for (const span of spans) {
    const text = span.textContent || span.innerText;
    const title = span.getAttribute('title');
    
    if (text && text.trim().length > 0 && 
        title !== 'Profile details' && 
        title !== 'Search' && 
        title !== 'Menu') {
      name = text.trim();
      break;
    }
  }

  return { name };
}

function extractChat() {
  const mainChat = document.querySelector(WA_SELECTORS.mainChat);
  if (!mainChat) {
    throw new Error('No open chat found.');
  }

  const messages = [];
  const rows = mainChat.querySelectorAll('[role="row"], div.message-in, div.message-out, div[data-id]');
  const seenIds = new Set(); // Prevent duplicates from nested selectors by data-id or object ref

  rows.forEach(row => {
      // Deduplicate by data-id if available, otherwise by an auto-generated id on the node
      let rowId = row.getAttribute('data-id');
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

      if (sender === 'unknown' && row.getAttribute('data-id')) {
          sender = 'customer';
      }

      if (sender !== 'unknown') {
        let rawText = row.innerText || row.textContent || '';
        let textParts = rawText.split('\n').map(p => p.trim()).filter(p => p.length > 0);
        
        if (textParts.length > 0) {
            const lastPart = textParts[textParts.length - 1];
            if (lastPart.match(/^\d{1,2}:\d{2}(\s*(am|pm|AM|PM))?$/i)) {
                textParts.pop();
            }
        }
        
        if (textParts.length > 0 && textParts[textParts.length - 1] === 'Edited') {
           textParts.pop();
        }
        
        if (textParts.length > 0 && textParts[textParts.length - 1] === 'Read more') {
           textParts.pop();
        }

        const text = textParts.join('\n');
        
        if (text && !text.includes('This message was deleted')) {
          messages.push({
            sender,
            text,
            timestamp: new Date().toISOString()
          });
        }
      }
  });

  return { messages };
}
