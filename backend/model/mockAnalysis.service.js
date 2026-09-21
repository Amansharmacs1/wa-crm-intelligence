const generateMockAnalysis = (contactName) => {
  const firstName = contactName.split(' ')[0] || 'Customer';
  return {
    contactName: contactName,
    leadScore: 92,
    category: "At Risk",
    summary: "The customer has shown strong purchase intent and requires immediate follow-up.",
    intent: "Site Visit",
    sentiment: "Positive",
    followUpStatus: "Missed",
    estimatedValue: 8500000,
    buyingSignals: [
      "Asked about pricing",
      "Requested a site visit",
      "Demonstrated purchase urgency"
    ],
    recommendedAction: "Contact the customer immediately and confirm the site visit.",
    suggestedReply: `Hi ${firstName}, thank you for your interest. Your site visit can be scheduled this weekend. Please share your preferred time.`
  };
};

module.exports = { generateMockAnalysis };
