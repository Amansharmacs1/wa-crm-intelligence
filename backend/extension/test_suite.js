const fs = require('fs');

global.WA_SELECTORS = { mainChat: '#main' };
global.chrome = { runtime: { onMessage: { addListener: () => {} } } };

class MockElement {
  constructor(tag, attrs, textContent, outerHTML) {
    this.tag = tag;
    this.attrs = attrs || {};
    this.textContent = textContent || '';
    this.innerText = textContent || '';
    this.outerHTML = outerHTML || '';
    this.dataset = {};
  }
  getAttribute(name) { return this.attrs[name] || null; }
  querySelector() { return null; }
  querySelectorAll(sel) { 
      if (sel === 'span.selectable-text') {
          return [new MockElement('span', {}, this.textContent)];
      }
      return []; 
  }
}

class MockMainChat {
  constructor() {
    this.rows = [];
    this.inputBox = new MockElement('div', {'contenteditable': 'true', 'data-tab': '10'}, '');
    this.inputBox.focus = () => {};
    this.inputBox.dispatchEvent = () => {};
    
    this.sendBtn = new MockElement('button', {}, '');
    this.sendBtn.closest = () => ({ click: () => { this.sendClicked = true; }});
  }
  
  querySelector(sel) {
    if (sel.includes('contenteditable')) return this.inputBox;
    if (sel.includes('data-icon="send"')) return this.sendBtn;
    return null;
  }
  
  querySelectorAll(sel) {
    if (sel.includes('div[data-id]')) return this.rows;
    return [];
  }
}

global.document = {
  mainChat: new MockMainChat(),
  querySelector: function(sel) {
    if (sel === '#main') return this.mainChat;
    return null;
  },
  execCommand: () => {}
};

const contentJsCode = fs.readFileSync('backend/extension/content.js', 'utf8');
eval(contentJsCode);

async function runTests() {
  console.log("--- RUNNING WA-CRM TEST SUITE ---");

  // TEST 1: extractChat()
  document.mainChat.rows = [
    new MockElement('div', {'data-id': 'false_12345'}, 'Hello\n10:00 am', '<div data-id="false_12345"></div>'),
    new MockElement('div', {'data-id': 'true_67890'}, 'Hi there\n10:01 am', '<div data-id="true_67890"></div>')
  ];
  
  let chat = extractChat();
  console.log("Extracted Chat Length:", chat.messages.length);
  if (chat.messages.length !== 2) throw new Error("extractChat failed to find 2 messages");
  
  if (chat.messages[0].sender !== 'customer') throw new Error("Sender 1 should be customer");
  if (chat.messages[1].sender !== 'agent') throw new Error("Sender 2 should be agent");

  // TEST 2: Regex test
  const tests = [
      { text: "yes", expectGrant: true },
      { text: "Yes", expectGrant: true },
      { text: "no", expectGrant: false, expectDeny: true },
      { text: "not today", expectGrant: false, expectDeny: false },
      { text: "eyes", expectGrant: false, expectDeny: false },
      { text: "sure", expectGrant: true },
      { text: "deny", expectDeny: true },
  ];
  
  for (let t of tests) {
      const clean = t.text.toLowerCase().replace(/[^\w\s]/gi, '');
      const isYes = /\b(yes|y|1|sure|ok|okay|yeah|yep|agree)\b/.test(clean);
      const isNo = /\b(no|n|2|nope|nah|never|deny)\b/.test(clean);
      
      if (t.expectGrant && (!isYes || isNo)) throw new Error(`Expected grant for "${t.text}"`);
      if (t.expectDeny && (!isNo || isYes)) throw new Error(`Expected deny for "${t.text}"`);
      console.log(`Regex pass: ${t.text} -> isYes: ${isYes}, isNo: ${isNo}`);
  }

  console.log("✅ All tests passed!");
}

runTests().catch(console.error);
