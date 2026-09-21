// Mock DOM setup
global.WA_SELECTORS = { mainChat: '#main' };

class MockElement {
  constructor(tag, outerHTML, innerText) {
    this.tag = tag;
    this.outerHTML = outerHTML;
    this.innerText = innerText;
  }
}

class MockDocument {
  constructor() {
    this.mainChatRows = [];
  }
  
  querySelector(selector) {
    if (selector === '#main') {
      return {
        querySelectorAll: (sel) => {
          if (sel === '[role="row"]') return this.mainChatRows;
          return [];
        }
      };
    }
    return null;
  }
}

global.document = new MockDocument();

// The function to test
function pollForConsentResponse(callback) {
  const mainChat = document.querySelector(WA_SELECTORS.mainChat);
  if (!mainChat) { callback('timeout'); return; }
  
  let initialLastCustomerText = '';
  const initialRows = mainChat.querySelectorAll('[role="row"]');
  for (let i = initialRows.length - 1; i >= 0; i--) {
      const html = initialRows[i].outerHTML;
      if (html.includes('"false_') || html.includes('message-in')) {
          initialLastCustomerText = initialRows[i].innerText || '';
          break;
      }
  }

  let attempts = 0;
  const pollInterval = setInterval(() => {
    attempts++;
    if (attempts > 120) {
        clearInterval(pollInterval);
        callback('timeout');
        return;
    }
    
    const currentMainChat = document.querySelector(WA_SELECTORS.mainChat);
    if (!currentMainChat) return;
    
    const rows = currentMainChat.querySelectorAll('[role="row"]');
    if (rows.length === 0) return;
    
    let lastMessageRow = null;
    let sender = 'unknown';
    
    for (let i = rows.length - 1; i >= 0; i--) {
        const html = rows[i].outerHTML;
        if (html.includes('"false_') || html.includes('message-in')) {
            sender = 'customer';
            lastMessageRow = rows[i];
            break;
        } else if (html.includes('"true_') || html.includes('message-out') || html.includes('data-icon="msg-') || html.includes('data-icon="status-')) {
            sender = 'agent';
            lastMessageRow = rows[i];
            break;
        }
    }
    
    if (sender === 'customer' && lastMessageRow) {
        const currentCustomerText = lastMessageRow.innerText || '';
        
        if (currentCustomerText !== initialLastCustomerText) {
            let rawText = currentCustomerText;
            let textParts = rawText.split('\n').map(p => p.trim()).filter(p => p.length > 0);
            if (textParts.length > 0) {
                const lastPart = textParts[textParts.length - 1];
                if (lastPart.match(/^\d{1,2}:\d{2}(\s*(am|pm|AM|PM))?$/i)) {
                    textParts.pop();
                }
            }
            const cleanText = textParts.join(' ').toLowerCase();
            
            if (cleanText.includes('yes') || cleanText.match(/\by\b/) || cleanText.match(/\b1\b/)) {
                clearInterval(pollInterval);
                callback('granted');
            } else if (cleanText.includes('no') || cleanText.match(/\bn\b/) || cleanText.match(/\b2\b/)) {
                clearInterval(pollInterval);
                callback('denied');
            }
        }
    }
  }, 10);
}

// Tests
async function runTests() {
  console.log("Starting tests...");
  
  await new Promise(resolve => {
    document.mainChatRows = [new MockElement('div', 'class="message-in"', 'Hello\n11:00 am')];
    pollForConsentResponse((result) => {
      console.log('Test 1 (Yes):', result);
      resolve();
    });
    setTimeout(() => {
      document.mainChatRows.push(new MockElement('div', 'class="message-out"', 'Do you consent?'));
      document.mainChatRows.push(new MockElement('div', 'class="message-in"', 'Yes\n11:05 am'));
    }, 30);
  });
  
  await new Promise(resolve => {
    document.mainChatRows = [new MockElement('div', 'class="message-in"', 'Hello\n11:00 am')];
    pollForConsentResponse((result) => {
      console.log('Test 2 (No bhai):', result);
      resolve();
    });
    setTimeout(() => {
      document.mainChatRows.push(new MockElement('div', 'class="message-out"', 'Do you consent?'));
      document.mainChatRows.push(new MockElement('div', 'class="message-in"', 'No bhai\n11:05 am'));
    }, 30);
  });
  
  await new Promise(resolve => {
    document.mainChatRows = [new MockElement('div', 'class="message-in"', 'Hello\n11:00 am')];
    pollForConsentResponse((result) => {
      console.log('Test 3 (1):', result);
      resolve();
    });
    setTimeout(() => {
      document.mainChatRows.push(new MockElement('div', 'class="message-in"', '1\n11:05 am'));
    }, 30);
  });

  await new Promise(resolve => {
    document.mainChatRows = [new MockElement('div', 'class="message-in"', 'Hello\n11:00 am')];
    pollForConsentResponse((result) => {
      console.log('Test 4 (2):', result);
      resolve();
    });
    setTimeout(() => {
      document.mainChatRows.push(new MockElement('div', 'class="message-in"', '2\n11:05 am'));
    }, 30);
  });
  
  console.log("All tests completed.");
}

runTests();
