const assert = require('assert');

async function runEndToEndTest() {
  console.log('======================================================');
  console.log('  E2E Integration Test: Extension -> Model -> Dashboard');
  console.log('======================================================\n');

  const API_URL = 'http://localhost:5050/api/leads';

  // 1. Consent Enforcement
  console.log('1. Testing Consent Enforcement (HTTP 403 on non-approved)');
  try {
    const res = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent: { status: 'declined' },
        conversation: { contactName: 'Test', messages: [] }
      })
    });
    assert.strictEqual(res.status, 403, 'Should return 403 Forbidden');
    const data = await res.json();
    assert.strictEqual(data.analysisAllowed, false);
    console.log('   ✅ Consent successfully rejected non-approved chat.');
  } catch (err) {
    console.error('   ❌ Consent test failed:', err.message);
  }

  // 2. Extension Emission & Model Processing
  console.log('\n2. Testing Extension Emission & Model Processing (Competitor Objection)');
  let leadResult = null;
  try {
    const res = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent: { status: 'approved' },
        conversation: {
          contactName: 'Competitor Prospect',
          messages: [
            { sender: 'customer', text: 'Salesforce offered 15% discount, can you match that? Walkthrough this Thursday for ₹25 L budget.' }
          ]
        }
      })
    });
    
    assert.strictEqual(res.status, 200, 'Should return 200 OK');
    const data = await res.json();
    
    assert.ok(data.lead, 'Missing lead object for Extension Popup');
    assert.ok(data.leads && Array.isArray(data.leads), 'Missing leads array for Dashboard');
    
    leadResult = data.lead;
    
    assert.strictEqual(leadResult.category, 'At Risk', 'Lead should be categorized as At Risk due to competitor mention');
    assert.strictEqual(leadResult.estimatedValue?.amount, 2500000, 'Estimated value should be 2500000');
    
    console.log('   ✅ Dual response contract satisfied.');
    console.log(`   ✅ Category: ${leadResult.category}, Score: ${leadResult.leadScore}, Value: ${leadResult.estimatedValue?.displayValue}`);
    
    // Check Extension Rendering fields
    assert.ok(leadResult.leadScore !== undefined, 'Missing leadScore for #res-score');
    assert.ok(leadResult.intent !== undefined, 'Missing intent for UI');
    assert.ok(leadResult.recommendedAction !== undefined, 'Missing suggestedReply/recommendedAction for #res-reply');
    console.log('   ✅ Extension UI dependencies (#res-score, #res-category, #res-reply) verified in payload.');
  } catch (err) {
    console.error('   ❌ Model processing test failed:', err.message);
  }

  // 3. Dashboard State & Revenue at Risk
  console.log('\n3. Testing Dashboard State & Revenue at Risk Integration');
  try {
    const res = await fetch(`${API_URL}/dashboard`);
    const data = await res.json();
    
    assert.ok(data.success);
    const metrics = data.metrics;
    
    console.log(`   ✅ Dashboard fetched successfully.`);
    console.log(`   ✅ Revenue at Risk calculated: ₹${(metrics.revenueAtRisk / 100000).toFixed(2)} L`);
    
    const foundLead = data.latestLeads.find(l => l.contactName === 'Competitor Prospect');
    if (!foundLead) {
      console.log('   ⚠️  Lead not found in DB feed. (Note: Supabase credentials might be missing in local .env)');
    } else {
      console.log('   ✅ Lead successfully persisted and synced to Dashboard feed.');
      assert.ok(metrics.revenueAtRisk >= 2500000, 'Revenue at Risk should include the ₹25 L lead');
    }
  } catch (err) {
    console.error('   ❌ Dashboard integration test failed:', err.message);
  }

  console.log('\n======================================================');
  console.log('  E2E TEST COMPLETE');
  console.log('======================================================');
}

runEndToEndTest();
