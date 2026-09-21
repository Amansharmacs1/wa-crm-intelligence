const fs = require('fs');
const { appendAndMergeMessages } = require('./backend/backend/src/services/chatStorage.service');

// Simulate first chunk
const msg1 = [
  { id: '1', timestamp: '2026-09-21T10:00:00Z', text: 'Hello', sender: 'customer' }
];

const merged1 = appendAndMergeMessages('John Doe', msg1);
console.log('Merged 1 size:', merged1.length);

// Simulate second chunk (overlapping)
const msg2 = [
  { id: '1', timestamp: '2026-09-21T10:00:00Z', text: 'Hello', sender: 'customer' },
  { id: '2', timestamp: '2026-09-21T10:01:00Z', text: 'I want to buy a house', sender: 'customer' }
];

const merged2 = appendAndMergeMessages('John Doe', msg2);
console.log('Merged 2 size:', merged2.length);

// Log the actual saved file
console.log(fs.readFileSync('backend/backend/chats/john_doe.json', 'utf8'));
