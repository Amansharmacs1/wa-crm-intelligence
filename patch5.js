const fs = require('fs');
const path = 'frontend/src/context/AppContext.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('const [followUps] = useState<FollowUp[]>(initialFollowUps);', 'const [followUps, setFollowUps] = useState<FollowUp[]>(initialFollowUps);');

const followUpCode = `
        const mappedFollowUps = data.latestLeads
          .filter((bl: any) => bl.followUpRequired && bl.followUpStatus !== 'Completed')
          .map((bl: any, idx: number) => {
            let status = 'Due Today';
            if (bl.followUpStatus === 'Missed') status = 'Overdue';
            if (bl.followUpStatus === 'Pending') status = 'Scheduled';

            return {
              id: 'fu_' + bl.leadId,
              leadId: bl.leadId,
              leadName: bl.contactName,
              phone: bl.contactNumber || 'N/A',
              dealValueFormatted: bl.estimatedValue?.displayValue || '₹0',
              scheduledFor: 'Today',
              timeSlot: 'ASAP',
              status: status,
              priority: bl.urgency === 'Critical' || bl.urgency === 'High' ? 'High' : (bl.category === 'At Risk' ? 'High' : 'Medium'),
              aiSuggestedDraft: bl.recommendedAction || 'Please follow up regarding their recent inquiry.',
              reason: bl.summary || 'Follow up required'
            };
          });
          
        setFollowUps(mappedFollowUps.length > 0 ? mappedFollowUps : initialFollowUps);
        
        if (mappedLeads.length > 0) {
`;

content = content.replace('if (mappedLeads.length > 0) {', followUpCode);

fs.writeFileSync(path, content);
