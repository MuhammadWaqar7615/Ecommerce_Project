const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/webhookController');

// No authentication, raw body is handled in server.js
router.post('/stripe', handleStripeWebhook);

module.exports = router;