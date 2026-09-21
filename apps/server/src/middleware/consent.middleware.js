/**
 * Consent Enforcement Middleware
 * Ensures no WhatsApp conversation is processed unless customer consent status is 'approved'.
 */

function isConsentApproved(consent) {
  if (!consent || typeof consent !== 'object') {
    return false;
  }

  // If explicit status string is present
  if (typeof consent.status === 'string') {
    return consent.status.trim().toLowerCase() === 'approved';
  }

  // If granted boolean is present without contradictory status
  if (consent.granted === true) {
    return true;
  }

  return false;
}

const requireConsent = (req, res, next) => {
  const body = req.body || {};

  // Check top-level consent
  let hasValidConsent = isConsentApproved(body.consent);

  // If top-level consent not found, check conversation-level consent
  if (!hasValidConsent && body.conversation && body.conversation.consent) {
    hasValidConsent = isConsentApproved(body.conversation.consent);
  }

  // Check if multiple conversations array with consent
  if (!hasValidConsent && Array.isArray(body.conversations) && body.conversations.length > 0) {
    hasValidConsent = body.conversations.every(c => isConsentApproved(c.consent || body.consent));
  }

  if (!hasValidConsent) {
    return res.status(403).json({
      success: false,
      message: 'Approved customer consent is required before processing chat data.'
    });
  }

  next();
};

module.exports = {
  requireConsent,
  isConsentApproved
};
