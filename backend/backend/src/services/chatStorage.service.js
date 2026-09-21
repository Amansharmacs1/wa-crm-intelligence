const fs = require('fs');
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../../chats');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

function getFilename(contactName) {
  // Sanitize contact name for safe filename
  const safeName = contactName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return path.join(STORAGE_DIR, `${safeName}.json`);
}

function getChatHistory(contactName) {
  const file = getFilename(contactName);
  if (fs.existsSync(file)) {
    try {
      const data = fs.readFileSync(file, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error(`Error reading chat history for ${contactName}:`, err);
      return [];
    }
  }
  return [];
}

function saveChatHistory(contactName, messages) {
  const file = getFilename(contactName);
  try {
    fs.writeFileSync(file, JSON.stringify(messages, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error saving chat history for ${contactName}:`, err);
    return false;
  }
}

function appendAndMergeMessages(contactName, newMessages) {
  const existingMessages = getChatHistory(contactName);
  
  // Merge messages and prevent duplicates based on ID or exact timestamp+text
  const merged = [...existingMessages];
  
  for (const msg of newMessages) {
    // Check if message already exists
    const exists = merged.find(m => 
      (m.id && msg.id && m.id === msg.id) || 
      (m.timestamp === msg.timestamp && m.text === msg.text)
    );
    
    if (!exists) {
      merged.push(msg);
    }
  }
  
  // Sort chronologically
  merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  saveChatHistory(contactName, merged);
  return merged;
}

module.exports = {
  getChatHistory,
  saveChatHistory,
  appendAndMergeMessages
};
