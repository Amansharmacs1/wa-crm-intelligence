const fs = require('fs');
const path = 'frontend/src/context/AppContext.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('fetchDashboardData: () => Promise<void>;', 'fetchDashboardData: () => Promise<void>;\n  syncLocalData: () => Promise<void>;');
content = content.replace('fetchDashboardData\n      }}', 'fetchDashboardData,\n        syncLocalData\n      }}');

fs.writeFileSync(path, content);
