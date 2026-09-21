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
  }
  return true; // Keep channel open for async
});

function getContactInfo() {
  const mainChat = document.querySelector(WA_SELECTORS.mainChat);
  if (!mainChat) {
    throw new Error('NO_CHAT_OPEN');
  }
  
  let contactName = 'Unknown Contact';
  const header = mainChat.querySelector('header');
  if (header) {
    const titleElems = header.querySelectorAll('span[title], div[title]');
    for (const el of titleElems) {
       const title = el.getAttribute('title');
       if (title && !['Profile details', 'Search', 'Menu', 'Call', 'Video call'].includes(title)) {
           contactName = title;
           break;
       }
    }
    
    if (contactName === 'Unknown Contact') {
      const spanAuto = header.querySelector('span[dir="auto"]');
      if (spanAuto) {
         contactName = spanAuto.textContent || 'Unknown Contact';
      }
    }
  }

  // Count messages using the standard row role which is very reliable for layout
  const messageNodes = mainChat.querySelectorAll('[role="row"]');
  const messageCount = messageNodes.length;

  return { contactName, messageCount };
}

function extractChat() {
  const contactData = getContactInfo();
  const contactName = contactData.contactName;
  const mainChat = document.querySelector(WA_SELECTORS.mainChat);

  const messages = [];
  
  // Use [role="row"] as it's the most stable layout container for messages
  const messageNodes = mainChat.querySelectorAll('[role="row"]');
  
  messageNodes.forEach((node, index) => {
    let sender = 'unknown';
    const html = node.outerHTML;
    
    // 1. Try standard data-id formats
    if (html.includes('"false_')) sender = 'customer';
    else if (html.includes('"true_')) sender = 'agent';
    
    // 2. Try class names (often deep inside)
    if (sender === 'unknown') {
        if (html.includes('message-in')) sender = 'customer';
        else if (html.includes('message-out')) sender = 'agent';
    }

    // 3. Try read receipts (only outgoing messages have ticks)
    if (sender === 'unknown') {
        if (html.includes('data-icon="msg-') || html.includes('data-icon="status-')) {
            sender = 'agent';
        }
    }
    
    // Fallback default
    if (sender === 'unknown') {
        sender = 'customer'; 
    }
    
    // Robust text extraction using innerText to mimic visual layout
    let rawText = node.innerText;
    if (!rawText) {
        rawText = node.textContent || '';
    }
    
    let textParts = rawText.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    
    // Clean up metadata from the end (Time, Edited, Read more)
    if (textParts.length > 0) {
        let lastPart = textParts[textParts.length - 1];
        // Remove time (e.g., 11:22 am)
        if (lastPart.match(/^\d{1,2}:\d{2}(\s*(am|pm|AM|PM))?$/)) {
            textParts.pop();
        }
    }
    
    if (textParts.length > 0) {
        let lastPart = textParts[textParts.length - 1];
        // Remove "Edited" label
        if (lastPart.toLowerCase() === 'edited') {
            textParts.pop();
        }
    }

    if (textParts.length > 0) {
        let lastPart = textParts[textParts.length - 1];
        // Remove "Read more" label
        if (lastPart.toLowerCase() === 'read more') {
            textParts.pop();
        }
    }

    const messageText = textParts.join('\n').trim();

    if (messageText) {
        messages.push({
            id: index + 1,
            sender: sender,
            text: messageText,
            metadata: ""
        });
    }
  });

  // Deduplicate and remove empty
  const uniqueMessages = [];
  const seenSignatures = new Set();
  
  messages.forEach(msg => {
    if (msg.text) {
      const sig = `${msg.sender}::${msg.text}`;
      if (!seenSignatures.has(sig)) {
        seenSignatures.add(sig);
        uniqueMessages.push({
          id: uniqueMessages.length + 1,
          sender: msg.sender,
          text: msg.text,
          metadata: msg.metadata
        });
      }
    }
  });

  return {
    contactName,
    source: 'whatsapp-web',
    capturedAt: new Date().toISOString(),
    messages: uniqueMessages
  };
}
