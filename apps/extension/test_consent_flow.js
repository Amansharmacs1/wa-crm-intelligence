const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <div id="main">
    <header>
      <div title="Profile Details">
        <img src="avatar.jpg">
      </div>
      <div class="contact-info">
        <span dir="auto" title="Ansh Goyal">Ansh Goyal</span>
        <span>online</span>
      </div>
    </header>
    <div data-testid="conversation-panel-messages">
       <!-- old messages -->
       <div data-id="false_old" class="message-in"><span class="selectable-text"><span>Hi</span></span></div>
    </div>
    <footer>
       <div contenteditable="true" title="Type a message"></div>
       <button><span data-icon="send"></span></button>
    </footer>
  </div>
</body>
</html>
`);

global.document = dom.window.document;
global.window = dom.window;
global.Event = dom.window.Event;
global.MutationObserver = dom.window.MutationObserver;

global.chrome = {
  runtime: {
    onMessage: {
      addListener: (fn) => { global.mockListener = fn; }
    },
    lastError: null
  },
  storage: {
    local: {
      data: {},
      get: (keys, cb) => cb(global.chrome.storage.local.data),
      set: (obj, cb) => {
          Object.assign(global.chrome.storage.local.data, obj);
          if (cb) cb();
      }
    }
  }
};

// Load selectors
const selectorsCode = fs.readFileSync('apps/extension/selectors.js', 'utf8');
eval(selectorsCode);

// Load content script
const contentCode = fs.readFileSync('apps/extension/content.js', 'utf8');
eval(contentCode);

async function runTest() {
    console.log("--- Starting Real-World Simulation ---");
    
    // 1. Test getContactInfo
    console.log("[Test 1] Testing getContactName...");
    const contactRes = await new Promise(resolve => {
        global.mockListener({ action: 'getContactInfo' }, {}, resolve);
    });
    console.log("Contact Result:", contactRes);
    if (!contactRes.success || contactRes.data.name !== 'Ansh Goyal') {
        throw new Error("Failed to extract contact name!");
    }
    
    // 2. Test sendConsentRequest
    console.log("[Test 2] Testing sendConsentRequest...");
    const sendRes = await new Promise(resolve => {
        global.mockListener({ 
            action: 'sendConsentRequest', 
            text: "Hi! To serve you better...", 
            contactIdentifier: 'Ansh Goyal',
            requestedAtIso: new Date().toISOString()
        }, {}, resolve);
    });
    console.log("Send Result:", sendRes);
    if (!sendRes.success) {
        throw new Error("Failed to send consent request!");
    }
    
    // Set storage to WAITING_FOR_RESPONSE like popup.js does
    global.chrome.storage.local.set({
        activeConsent: {
            contactIdentifier: 'Ansh Goyal',
            status: 'WAITING_FOR_RESPONSE',
            requestedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 10 * 60000).toISOString()
        }
    });

    // Simulate WhatsApp adding the agent message to the DOM
    const messagesContainer = document.querySelector('[data-testid="conversation-panel-messages"]');
    const agentMsg = document.createElement('div');
    agentMsg.setAttribute('data-id', 'true_consent');
    agentMsg.innerHTML = '<span class="selectable-text"><span>Hi! To serve you better...</span></span><span data-icon="msg-dblcheck"></span>';
    messagesContainer.appendChild(agentMsg);

    // Give observer time to process
    await new Promise(r => setTimeout(r, 100));
    
    console.log("[Test 3] Simulating customer YES reply...");
    // Simulate customer replying "yes"
    const custMsg = document.createElement('div');
    custMsg.setAttribute('data-id', 'false_reply');
    custMsg.className = 'message-in';
    custMsg.innerHTML = '<span class="selectable-text"><span>Yes</span></span>';
    messagesContainer.appendChild(custMsg);

    // Give observer time to process
    await new Promise(r => setTimeout(r, 100));

    // Check storage for state update
    const storageState = global.chrome.storage.local.data.activeConsent;
    console.log("Storage State after YES:", storageState);
    if (storageState.status !== 'APPROVED') {
        throw new Error("Observer failed to approve consent! Status is: " + storageState.status);
    }
    
    // 3. Test extractConversation
    console.log("[Test 4] Testing extractConversation (filtering out consent)...");
    const extractRes = await new Promise(resolve => {
        global.mockListener({ 
            action: 'extractConversation',
            requestedAtIso: storageState.requestedAt
        }, {}, resolve);
    });
    console.log("Extracted Messages:", extractRes.data.messages);
    
    // The extracted messages should NOT include the "Hi! To serve you better..." request, nor the "Yes" response!
    const msgs = extractRes.data.messages;
    if (msgs.length !== 1 || msgs[0].text !== 'Hi') {
        throw new Error("Extraction did not correctly filter the consent messages!");
    }

    console.log("✅ All tests passed flawlessly!");
}

runTest().catch(console.error);
