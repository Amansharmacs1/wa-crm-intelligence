const requireConsent = (req, res, next) => {
  if (!req.body || !req.body.consent || req.body.consent.status !== 'approved') {
    return res.status(403).json({
      success: false,
      message: "User consent is required before analyzing a conversation."
    });
  }
  next();
};

module.exports = { requireConsent };
