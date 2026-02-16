/**
 * Mail Routes
 * Handles mail-related endpoints (protected)
 */

const express = require('express');
const router = express.Router();
const { sendMail, getHistory } = require('../controllers/mailController');
const { protect } = require('../middleware/auth');

// All mail routes require JWT authentication
router.use(protect);

// POST /api/mail/send - Send bulk emails
router.post('/send', sendMail);

// GET /api/mail/history - Get sent mail history
router.get('/history', getHistory);

module.exports = router;
