const fs = require('fs');
const path = 'frontend/src/pages/DashboardPage.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('const { leads, navigate, setActiveChatLead, showNotification, fetchDashboardData, isFetching, lastRefreshed, dashboardMetrics } = useApp();', 'const { leads, navigate, setActiveChatLead, showNotification, fetchDashboardData, syncLocalData, isFetching, lastRefreshed, dashboardMetrics } = useApp();');

const newButtons = `
          <div className="flex gap-2">
            <button
              onClick={syncLocalData}
              className="px-space-md py-2 bg-secondary text-on-secondary rounded-lg font-label-md text-label-md font-semibold hover:bg-opacity-90 transition-all flex items-center shadow-sm"
            >
              <span className="material-symbols-outlined mr-2">cloud_upload</span>
              Sync to Cloud
            </button>
            <button
              onClick={fetchDashboardData}
              disabled={isFetching}
              className="px-space-md py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-opacity-90 transition-all flex items-center shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined mr-2 ${'${isFetching ? \'animate-spin\' : \'\'}'}">refresh</span>
              {isFetching ? 'Fetching...' : 'Fetch Latest Data'}
            </button>
          </div>
`;

content = content.replace(/<button\n\s+onClick=\{fetchDashboardData\}[\s\S]*?<\/button>/, newButtons);

fs.writeFileSync(path, content);
