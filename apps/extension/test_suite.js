const fs = require('fs');

global.chrome = { runtime: { onMessage: { addListener: () => {} } } };
global.WA_SELECTORS = { mainChat: '#main' };
global.KeyboardEvent = class {};
global.Event = class {};

class MockElement {
  constructor(tag, attrs, textContent, outerHTML) {
    this.tag = tag;
    this.attrs = attrs || {};
    this.textContent = textContent || '';
    this.innerText = textContent || '';
    this.outerHTML = outerHTML || '';
  }
  getAttribute(name) { return this.attrs[name] || null; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
}

class MockHeader {
  querySelectorAll() {
    return [
      new MockElement('span', { title: 'Profile details' }, ''),
      new MockElement('span', { title: 'John Doe' }, 'John Doe')
    ];
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
    if (sel === 'header') return new MockHeader();
    if (sel.includes('contenteditable')) return this.inputBox;
    if (sel.includes('data-icon="send"')) return this.sendBtn;
    return null;
  }
  
  querySelectorAll(sel) {
    if (sel === '[role="row"]') return this.rows;
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

const contentJsCode = fs.readFileSync('apps/extension/content.js', 'utf8');
eval(contentJsCode);

async function runTests() {
  let passed = 0;
  let failed = 0;
  function assert(condition, message) {
    if (condition) { console.log(`✅ PASS: ${message}`); passed++; }
    else { console.error(`❌ FAIL: ${message}`); failed++; }
  }

  console.log("--- RUNNING WA-CRM TEST SUITE ---");
  try {
    const contact = getContactInfo();
    assert(contact.name === 'John Doe', 'getContactInfo correctly extracts contact name');
  } catch (e) { assert(false, 'getContactInfo threw error: ' + e.message); }

  try {
    document.mainChat.rows = [
      new MockElement('div', {}, 'Hello\n10:00 am', 'class="message-in"'),
      new MockElement('div', {}, 'Hi there\n10:01 am', 'class="message-out" data-icon="msg-check"')
    ];
    const chat = extractChat();
    assert(chat.messages.length === 2, 'extractChat found 2 messages');
    assert(chat.messages[0].sender === 'customer' && chat.messages[0].text === 'Hello', 'extractChat parsed customer message');
    assert(chat.messages[1].sender === 'agent' && chat.messages[1].text === 'Hi there', 'extractChat parsed agent message');
  } catch (e) { assert(false, 'extractChat threw error: ' + e.message); }

  try {
    const sent = sendConsentMessage();
    assert(sent === true, 'sendConsentMessage executed successfully');
    await new Promise(r => setTimeout(r, 250));
    assert(document.mainChat.sendClicked === true, 'sendConsentMessage clicked the send button');
  } catch (e) { assert(false, 'sendConsentMessage threw error: ' + e.message); }

  try {
    const newMessage = "Yes I agree\n10:05 am";
    const cleanText = newMessage.toLowerCase().replace(/[^\w\s]/gi, '');
    const isYes = cleanText.includes('yes') || cleanText.match(/\by\b/) || cleanText.match(/\b1\b/);
    assert(isYes === true, 'Popup logic correctly identifies "Yes I agree" as consent');
    
    const badMessage = "No way\n10:06 am";
    const cleanBadText = badMessage.toLowerCase().replace(/[^\w\s]/gi, '');
    const isNo = cleanBadText.includes('no') || cleanBadText.match(/\bn\b/) || cleanBadText.match(/\b2\b/);
    assert(isNo === true, 'Popup logic correctly identifies "No way" as denied consent');
  } catch (e) { assert(false, 'Popup logic simulation failed: ' + e.message); }

  console.log(`\n--- RESULTS: ${passed} Passed | ${failed} Failed ---`);
}
runTests();
