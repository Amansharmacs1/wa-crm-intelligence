const fs = require('fs');
const path = 'frontend/src/context/AppContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const syncFunction = `

  const syncLocalData = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/leads/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads })
      });
      const data = await response.json();
      if (data.success) {
        showNotification(\`Successfully synced \${data.synced} leads to Cloud Database!\`, 'success');
      } else {
        showNotification('Failed to sync to Cloud Database.', 'error');
      }
    } catch (err) {
      console.error('Sync error:', err);
      showNotification('Network error while syncing data.', 'error');
    }
  };

  // Hourly background sync
  useEffect(() => {
    const syncInterval = setInterval(() => {
      syncLocalData();
    }, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(syncInterval);
  }, [leads]);
`;

// Find where fetchDashboardData ends
const fetchEndStr = `      setIsFetching(false);\n    }\n  };`;
content = content.replace(fetchEndStr, fetchEndStr + syncFunction);

fs.writeFileSync(path, content);
