const fs = require('fs');
const path = 'backend/model/leadTransformation.service.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '    urgencyReason,\n    followUpRequired,\n    followUpStatus,\n    category,\n    leadScore: score,',
  '    urgencyReason,\n    priority: score >= 75 ? \'Hot\' : score >= 50 ? \'Warm\' : \'Cold\',\n    followUpRequired,\n    followUpStatus,\n    category,\n    leadScore: score,'
);

// We also need to add priority to the early return in transformSingleConversation
content = content.replace(
  '      urgency: \'Low\',\n      urgencyReason: \'No substantive conversation messages available.\',\n      followUpRequired: false,',
  '      urgency: \'Low\',\n      urgencyReason: \'No substantive conversation messages available.\',\n      priority: \'Cold\',\n      followUpRequired: false,'
);

fs.writeFileSync(path, content);
