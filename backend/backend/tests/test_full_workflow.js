const assert = require('assert');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5050/api';

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runFullWorkflowTest() {
  console.log('======================================================');
  console.log('  Testing Continuous Chat Aggregation Workflow');
  console.log('======================================================\n');

  const contactName = 'Test Workflow User';
  const fileName = 'test_workflow_user.json';
  const filePath = path.join(__dirname, '../chats', fileName);

  // Clean up any old test data
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // --- Step 1: Initial Inquiry ---
  console.log('1. Simulating initial WhatsApp inquiry (Extension -> Backend)');
  try {
    const payload1 = {
      consent: { status: 'approved' },
      conversation: {
        contactName: contactName,
        messages: [
          { id: 'msg-1', sender: 'customer', timestamp: '2026-09-21T09:00:00Z', text: 'Hi, I am interested in your software.' },
          { id: 'msg-2', sender: 'agent', timestamp: '2026-09-21T09:05:00Z', text: 'Hello! Happy to help. What is your budget?' }
        ]
      }
    };

    const res1 = await fetch(`${API_URL}/leads/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload1)
    });
    
    assert.strictEqual(res1.status, 200);
    const data1 = await res1.json();
    assert.strictEqual(data1.lead.contactName, contactName);
    console.log('   ✅ Initial inquiry analyzed successfully.');
    
    // Check file
    assert.ok(fs.existsSync(filePath), 'Chat history file was not created!');
    const stored1 = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.strictEqual(stored1.length, 2, 'File should have exactly 2 messages');
    console.log('   ✅ File storage initialized successfully.');

  } catch (err) {
    console.error('   ❌ Initial inquiry failed:', err.message);
  }

  // --- Step 2: Follow-up Conversation ---
  console.log('\n2. Simulating follow-up conversation hours later');
  try {
    // We pass one overlapping message and one NEW message
    const payload2 = {
      consent: { status: 'approved' },
      conversation: {
        contactName: contactName,
        messages: [
          { id: 'msg-2', sender: 'agent', timestamp: '2026-09-21T09:05:00Z', text: 'Hello! Happy to help. What is your budget?' }, // overlapping
          { id: 'msg-3', sender: 'customer', timestamp: '2026-09-21T13:00:00Z', text: 'My budget is around 5 Lakhs. Also I need a demo tomorrow.' } // new, includes budget and intent
        ]
      }
    };

    const res2 = await fetch(`${API_URL}/leads/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload2)
    });
    
    assert.strictEqual(res2.status, 200);
    const data2 = await res2.json();
    
    // Check file
    const stored2 = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.strictEqual(stored2.length, 3, 'File should have merged to exactly 3 unique messages');
    console.log('   ✅ Chat history securely appended and deduplicated.');
    
    // Check AI extraction on complete data
    const leadScore = data2.lead.leadScore;
    assert.ok(leadScore > 10, 'AI should have scored higher based on the budget keyword.');
    assert.strictEqual(data2.lead.estimatedValue.amount, 500000, 'AI should have parsed the 5 Lakhs from the merged data.');
    console.log(`   ✅ AI evaluated full context! Detected Deal Value: ${data2.lead.estimatedValue.displayValue}`);

  } catch (err) {
    console.error('   ❌ Follow-up simulation failed:', err.message);
  }

  // --- Step 3: Dashboard Integration Verification ---
  console.log('\n3. Verifying Dashboard API integration');
  try {
    const res3 = await fetch(`${API_URL}/leads/dashboard`);
    assert.strictEqual(res3.status, 200);
    const data3 = await res3.json();
    assert.ok(data3.success);
    
    console.log('   ✅ Dashboard metrics endpoint is online and formatting properly.');
    
    // Clean up
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  } catch (err) {
    console.error('   ❌ Dashboard integration failed:', err.message);
  }

  console.log('\n======================================================');
  console.log('  TEST COMPLETE');
  console.log('======================================================');
}

runFullWorkflowTest();
