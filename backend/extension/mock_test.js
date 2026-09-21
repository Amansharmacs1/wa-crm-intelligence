const fs = require('fs');

global.chrome = {
  runtime: { onMessage: { addListener: (fn) => { global.mockListener = fn; } }, lastError: null },
  storage: { local: { data: {}, get: (keys, cb) => cb(global.chrome.storage.local.data), set: (obj, cb) => { Object.assign(global.chrome.storage.local.data, obj); if (cb) cb(); } } }
};

class MockElement {
    constructor(tag, attrs, text) {
        this.tag = tag; this.attrs = attrs || {}; this.innerText = text || ''; this.textContent = text || '';
        this.outerHTML = `<${tag} ${Object.entries(this.attrs).map(([k,v])=>`${k}="${v}"`).join(' ')}>${text}</${tag}>`;
        this.dataset = {};
    }
    getAttribute(name) { return this.attrs[name] || null; }
    querySelector(sel) {
        if (sel === '[data-id]') return this.attrs['data-id'] ? this : null;
        return null;
    }
    querySelectorAll(sel) {
        if (sel === 'span.selectable-text') {
            if (this.innerText) return [new MockElement('span', {}, this.innerText)];
            return [];
        }
        if (sel === 'span' && this.tag === 'header') return [new MockElement('span', {}, 'Ansh Goyal')];
        return [];
    }
}

class MockDocument {
    constructor() {
        this.headers = [
            new MockElement('header', {}, ''),
            new MockElement('header', {}, 'Ansh Goyal')
        ];
        this.chatRows = [
            new MockElement('div', { 'data-id': 'false_old' }, 'Hi')
        ];
    }
    querySelectorAll(sel) {
        if (sel.includes('header')) {
            if (sel === 'header') return this.headers;
            return [];
        }
        if (sel.includes('[role="row"]')) return this.chatRows;
        return [];
    }
    querySelector(sel) {
        if (sel === '#main') return this;
        if (sel.includes('contenteditable')) return new MockElement('div', {'contenteditable':'true'}, '');
        if (sel.includes('send')) return new MockElement('button', {}, '');
        return null;
    }
}
global.document = new MockDocument();
global.MutationObserver = class { observe(){} disconnect(){} };
global.Event = class {};

const contentCode = fs.readFileSync('apps/extension/content.js', 'utf8').replace(/const WA_SELECTORS = \{[\s\S]*?\};/, '');
const WA_SELECTORS = { mainChat: '#main', headerTitle: 'header [title], header span[dir="auto"], header [title]', messageRow: '[role="row"], div.message-in, div.message-out, div[data-id]' };
global.WA_SELECTORS = WA_SELECTORS;
eval(contentCode);

async function run() {
    console.log("--- Starting Mock Test ---");
    const contactRes = await new Promise(r => global.mockListener({ action: 'getContactInfo' }, {}, r));
    console.log("Contact:", contactRes);
    if (!contactRes.success || contactRes.data.name !== 'Ansh Goyal') throw new Error("Contact name failed");

    console.log("Sending consent...");
    const sendRes = await new Promise(r => global.mockListener({ action: 'sendConsentRequest', text: 'Hi! To serve you better...', contactIdentifier: 'Ansh Goyal', requestedAtIso: new Date().toISOString() }, {}, r));
    console.log("Send:", sendRes);

    console.log("Testing extract filtering...");
    const extractRes = await new Promise(r => global.mockListener({ action: 'extractConversation', requestedAtIso: new Date().toISOString() }, {}, r));
    console.log("Extract:", extractRes.data.messages);
    if (extractRes.data.messages.length !== 1 || extractRes.data.messages[0].text !== 'Hi') throw new Error("Extraction failed");

    console.log("✅ All logic functions pass flawlessly.");
}
run().catch(console.error);
