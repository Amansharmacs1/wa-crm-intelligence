const fs = require('fs');
const path = 'backend/backend/src/controllers/lead.controller.js';
let content = fs.readFileSync(path, 'utf8');

// Add the import at the top
if (!content.includes('chatStorage.service')) {
  content = "const { appendAndMergeMessages } = require('../services/chatStorage.service');\n" + content;
}

const targetBlock = `    // Process with the real AI pipeline
    const leads = await transformConversations(req.body);`;

const replacement = `    // Process with the real AI pipeline
    
    // Aggregation Feature: Save and aggregate full chat history
    if (conversation && conversation.contactName && conversation.messages) {
      const mergedMessages = appendAndMergeMessages(conversation.contactName, conversation.messages);
      // Replace the incoming payload messages with the full history
      req.body.conversation.messages = mergedMessages;
      console.log(\`[ChatStorage] Merged new messages for \${conversation.contactName}. Total historical messages: \${mergedMessages.length}\`);
    }

    const leads = await transformConversations(req.body);`;

content = content.replace(targetBlock, replacement);
fs.writeFileSync(path, content);
