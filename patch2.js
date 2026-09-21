const fs = require('fs');
const path = 'backend/backend/src/routes/lead.routes.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('getDashboardMetrics\n}', 'getDashboardMetrics,\n  syncLeads\n}');
content = content.replace('router.post(\'/hybrid\', requireConsent, validate(analyzeLeadSchema), analyzeLead);', 'router.post(\'/hybrid\', requireConsent, validate(analyzeLeadSchema), analyzeLead);\nrouter.post(\'/sync\', syncLeads);');

fs.writeFileSync(path, content);
