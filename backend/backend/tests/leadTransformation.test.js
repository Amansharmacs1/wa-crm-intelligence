/**
 * Automated Test Suite for Lead Transformation & Gemini Integration
 * Tests:
 * 1. English conversation
 * 2. Hindi conversation
 * 3. Hinglish conversation
 * 4. Missing timestamps (verifies null without inventing data)
 * 5. Missing values (verifies amount: null when no price is mentioned)
 * 6. At Risk lead classification
 * 7. Safe lead classification
 * 8. Rejected / pending / missing consent (HTTP 403)
 * 9. Multiple conversations input
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const assert = require('assert');
const { transformConversations, sanitizeMessages, extractChatTime } = require('../src/services/leadTransformation.service');
const { isConsentApproved } = require('../src/middleware/consent.middleware');
const { leadObjectSchema } = require('../src/schemas/leadObject.schema');

async function runAllTests() {
  console.log('===============================================================');
  console.log('  Wa-CRM Backend: Lead Transformation & Gemini AI Test Suite  ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function recordPass(testName) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  }

  function recordFail(testName, err) {
    console.error(`❌ FAIL: ${testName}\n   Error: ${err.message || err}`);
    failed++;
  }

  // --- Test 1: English Conversation ---
  try {
    const payload = {
      consent: { status: 'approved' },
      conversation: {
        contactName: 'Alexander Wright',
        contactNumber: '+91 98200 12345',
        messages: [
          { sender: 'customer', text: 'Hello, we need a 50-seat commercial office space in BKC.', timestamp: '2026-09-21T10:00:00.000Z' },
          { sender: 'agent', text: 'Hi Alexander, we have Grade-A furnished plates starting at 4.5 Crores.', timestamp: '2026-09-21T10:05:00.000Z' },
          { sender: 'customer', text: 'That fits our budget. Can we arrange a site visit this Thursday at 3 PM?', timestamp: '2026-09-21T10:15:00.000Z' }
        ]
      }
    };

    const leads = await transformConversations(payload);
    assert.strictEqual(Array.isArray(leads), true, 'Output must be an array');
    assert.strictEqual(leads.length, 1, 'Must contain 1 lead');
    const lead = leads[0];

    const validation = leadObjectSchema.safeParse(lead);
    assert.strictEqual(validation.success, true, `Lead schema validation failed: ${JSON.stringify(validation.error?.format())}`);
    assert.strictEqual(lead.language, 'English', 'Language must be English');
    assert.strictEqual(lead.intent, 'Site Visit', 'Intent must be Site Visit');
    assert.strictEqual(lead.estimatedValue.currency, 'INR', 'Currency must be INR');
    assert.strictEqual(typeof lead.leadScore, 'number', 'Score must be a number');
    assert.strictEqual(lead.chatTime.durationMinutes, 15, 'Duration must be 15 mins');
    assert.strictEqual(lead.contactNumber, '+91 98200 12345', 'Contact number preserved');

    recordPass('Test 1: English Conversation transformation conforms to schema');
  } catch (err) {
    recordFail('Test 1: English Conversation', err);
  }

  // --- Test 2: Hindi Conversation ---
  try {
    const payload = {
      consent: { status: 'approved' },
      conversation: {
        contactName: 'राजेश शर्मा',
        messages: [
          { sender: 'customer', text: 'नमस्ते, मुझे 2 बीएचके फ्लैट की कीमत जाननी है।', timestamp: '2026-09-21T11:00:00.000Z' },
          { sender: 'agent', text: 'नमस्ते राजेश जी, कीमत 65 लाख रुपये से शुरू है।', timestamp: '2026-09-21T11:04:00.000Z' },
          { sender: 'customer', text: 'क्या हम कल आकर साइट देख सकते हैं?', timestamp: '2026-09-21T11:10:00.000Z' }
        ]
      }
    };

    const leads = await transformConversations(payload);
    const lead = leads[0];
    const validation = leadObjectSchema.safeParse(lead);
    assert.strictEqual(validation.success, true, 'Schema validation must pass for Hindi chat');
    assert.strictEqual(lead.language, 'Hindi', 'Language must be detected as Hindi');
    assert.strictEqual(lead.contactName, 'राजेश शर्मा', 'Contact name preserved');
    assert.strictEqual(lead.estimatedValue.amount, 6500000, 'Estimated value parsed as 65 Lakh');

    recordPass('Test 2: Hindi Conversation language detection & pricing extraction');
  } catch (err) {
    recordFail('Test 2: Hindi Conversation', err);
  }

  // --- Test 3: Hinglish Conversation ---
  try {
    const payload = {
      consent: { status: 'approved' },
      conversation: {
        contactName: 'Rohit Verma',
        messages: [
          { sender: 'customer', text: 'Bhai penthouse ka brochure bhej do WhatsApp par.', timestamp: '2026-09-21T12:00:00.000Z' },
          { sender: 'agent', text: 'Sure Rohit ji, sending the brochure right away.', timestamp: '2026-09-21T12:02:00.000Z' },
          { sender: 'customer', text: 'Saturday ko family ke sath flat dekhne aana hai, slot book kar lo.', timestamp: '2026-09-21T12:05:00.000Z' }
        ]
      }
    };

    const leads = await transformConversations(payload);
    const lead = leads[0];
    const validation = leadObjectSchema.safeParse(lead);
    assert.strictEqual(validation.success, true, 'Schema validation must pass for Hinglish chat');
    assert.strictEqual(lead.language, 'Hinglish', 'Language must be detected as Hinglish');
    assert.strictEqual(lead.intent, 'Site Visit', 'Intent must be Site Visit');
    assert.strictEqual(lead.urgency, 'High', 'Weekend visit is High urgency');

    recordPass('Test 3: Hinglish Conversation classification & urgency');
  } catch (err) {
    recordFail('Test 3: Hinglish Conversation', err);
  }

  // --- Test 4: Missing Timestamps ---
  try {
    const payload = {
      consent: { status: 'approved' },
      conversation: {
        contactName: 'Kavita Patel',
        // Messages have NO timestamps
        messages: [
          { sender: 'customer', text: 'I need information regarding 3BHK villas.' },
          { sender: 'agent', text: 'Villas are available in Phase 2.' }
        ]
      }
    };

    const leads = await transformConversations(payload);
    const lead = leads[0];
    const validation = leadObjectSchema.safeParse(lead);
    assert.strictEqual(validation.success, true, 'Schema validation must pass when timestamps missing');
    assert.strictEqual(lead.chatTime.firstMessageAt, null, 'firstMessageAt must be null when missing');
    assert.strictEqual(lead.chatTime.lastMessageAt, null, 'lastMessageAt must be null when missing');
    assert.strictEqual(lead.chatTime.durationMinutes, null, 'durationMinutes must be null when missing');

    recordPass('Test 4: Missing Timestamps properly handled as null without inventing data');
  } catch (err) {
    recordFail('Test 4: Missing Timestamps', err);
  }

  // --- Test 5: Missing Estimated Value ---
  try {
    const payload = {
      consent: { status: 'approved' },
      conversation: {
        contactName: 'Sunita Rao',
        messages: [
          { sender: 'customer', text: 'Is your clubhouse operational for badminton tournaments?' },
          { sender: 'agent', text: 'Yes Sunita, the sports complex is fully operational.' }
        ]
      }
    };

    const leads = await transformConversations(payload);
    const lead = leads[0];
    const validation = leadObjectSchema.safeParse(lead);
    assert.strictEqual(validation.success, true, 'Schema validation must pass');
    assert.strictEqual(lead.estimatedValue.amount, null, 'amount must be null when no price discussed');
    assert.strictEqual(lead.estimatedValue.currency, 'INR', 'currency is INR');
    assert.strictEqual(lead.estimatedValue.displayValue, null, 'displayValue must be null');

    recordPass('Test 5: Missing Estimated Value properly returns nulls');
  } catch (err) {
    recordFail('Test 5: Missing Estimated Value', err);
  }

  // --- Test 6: At Risk Lead Classification ---
  try {
    const payload = {
      consent: { status: 'approved' },
      conversation: {
        contactName: 'Vikram Singhania',
        messages: [
          { sender: 'customer', text: 'Your quotation of 5 Crores is 15% higher than Lodha.' },
          { sender: 'agent', text: 'Our construction quality is superior.' },
          { sender: 'customer', text: 'If you cannot match their price by Friday, I will proceed with Lodha.' }
        ]
      }
    };

    const leads = await transformConversations(payload);
    const lead = leads[0];
    const validation = leadObjectSchema.safeParse(lead);
    assert.strictEqual(validation.success, true, 'Schema validation must pass');
    assert.strictEqual(lead.category, 'At Risk', 'Lead must be At Risk due to competitor threat & unaddressed price');
    assert.strictEqual(lead.followUpRequired, true, 'followUpRequired must be true');

    recordPass('Test 6: At Risk Lead correctly flagged with competitor friction');
  } catch (err) {
    recordFail('Test 6: At Risk Lead', err);
  }

  // --- Test 7: Safe Lead Classification ---
  try {
    const payload = {
      consent: { status: 'approved' },
      conversation: {
        contactName: 'Meera Deshmukh',
        messages: [
          { sender: 'customer', text: 'Thanks for sharing the payment schedule.' },
          { sender: 'agent', text: 'You are welcome Meera! See you on Saturday at 11 AM.' },
          { sender: 'customer', text: 'Yes, looking forward to it. Thanks!' },
          { sender: 'agent', text: 'Have a great day!' }
        ]
      }
    };

    const leads = await transformConversations(payload);
    const lead = leads[0];
    const validation = leadObjectSchema.safeParse(lead);
    assert.strictEqual(validation.success, true, 'Schema validation must pass');
    assert.strictEqual(lead.category, 'Safe', 'Lead must be Safe when adequately addressed');

    recordPass('Test 7: Safe Lead correctly classified');
  } catch (err) {
    recordFail('Test 7: Safe Lead', err);
  }

  // --- Test 8: Consent Verification (Rejected, Pending, Missing, Expired) ---
  try {
    assert.strictEqual(isConsentApproved({ status: 'approved' }), true, 'approved status is valid');
    assert.strictEqual(isConsentApproved({ status: 'APPROVED' }), true, 'APPROVED case-insensitive is valid');
    assert.strictEqual(isConsentApproved({ granted: true }), true, 'granted: true is valid');
    assert.strictEqual(isConsentApproved({ status: 'declined' }), false, 'declined status must be rejected');
    assert.strictEqual(isConsentApproved({ status: 'pending' }), false, 'pending status must be rejected');
    assert.strictEqual(isConsentApproved({ status: 'expired' }), false, 'expired status must be rejected');
    assert.strictEqual(isConsentApproved({ granted: false }), false, 'granted: false must be rejected');
    assert.strictEqual(isConsentApproved(null), false, 'null consent must be rejected');
    assert.strictEqual(isConsentApproved(undefined), false, 'undefined consent must be rejected');

    recordPass('Test 8: Consent Verification strictly rejects pending/declined/expired consent');
  } catch (err) {
    recordFail('Test 8: Consent Verification', err);
  }

  // --- Test 9: Multiple Conversations Array ---
  try {
    const payload = {
      consent: { status: 'approved' },
      conversations: [
        {
          contactName: 'Lead One',
          messages: [{ sender: 'customer', text: 'I want to buy a 1BHK.' }]
        },
        {
          contactName: 'Lead Two',
          messages: [{ sender: 'customer', text: 'I want to schedule a site visit.' }]
        }
      ]
    };

    const leads = await transformConversations(payload);
    assert.strictEqual(Array.isArray(leads), true, 'Output must be array');
    assert.strictEqual(leads.length, 2, 'Must transform both conversations');
    assert.notStrictEqual(leads[0].leadId, leads[1].leadId, 'Lead IDs must be distinct and unique');
    assert.strictEqual(leadObjectSchema.safeParse(leads[0]).success, true, 'Lead 1 valid schema');
    assert.strictEqual(leadObjectSchema.safeParse(leads[1]).success, true, 'Lead 2 valid schema');

    recordPass('Test 9: Multiple Conversations processed into unique structured array');
  } catch (err) {
    recordFail('Test 9: Multiple Conversations', err);
  }

  console.log('\n---------------------------------------------------------------');
  console.log(`  Test Results: ${passed} Passed | ${failed} Failed`);
  console.log('---------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
