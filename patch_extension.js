const fs = require('fs');

// Patch 1: Robust fallback for sentiment and suggestedReply in popup.js
let popupPath = 'backend/extension/popup.js';
let popupContent = fs.readFileSync(popupPath, 'utf8');
popupContent = popupContent.replace(
  "document.getElementById('res-sentiment').textContent = lead.sentiment;",
  "document.getElementById('res-sentiment').textContent = lead.sentiment || (lead.leadScore >= 50 ? 'Positive' : 'Neutral');"
).replace(
  "document.getElementById('res-reply').textContent = lead.suggestedReply;",
  "document.getElementById('res-reply').textContent = lead.suggestedReply || lead.recommendedAction;"
);
fs.writeFileSync(popupPath, popupContent);

// Patch 2: Robust input selector in content.js
let contentPath = 'backend/extension/content.js';
let contentCode = fs.readFileSync(contentPath, 'utf8');
contentCode = contentCode.replace(
  "const input = main.querySelector('div[contenteditable=\"true\"][title*=\"Type a message\"], div[contenteditable=\"true\"][data-tab=\"10\"]');",
  "const input = main.querySelector('div[contenteditable=\"true\"][title*=\"Type a message\"], div[contenteditable=\"true\"][data-tab=\"10\"], footer div[contenteditable=\"true\"], div[aria-placeholder=\"Type a message\"]');"
);
fs.writeFileSync(contentPath, contentCode);

