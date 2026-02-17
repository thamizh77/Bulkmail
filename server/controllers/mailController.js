/**
 * Mail Controller – FIXED & OPTIMIZED
 */

const nodemailer = require('nodemailer');
const Mail = require('../models/Mail');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* Validate email */
const isValidEmail = (email) =>
  /^\S+@\S+\.\S+$/.test(email);

exports.sendMail = async (req, res, next) => {
  try {
    const { subject, body, recipients } = req.body;

    if (!subject || !body || !recipients) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const recipientArray = recipients
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(isValidEmail);

    if (!recipientArray.length) {
      return res.status(400).json({ message: 'No valid emails' });
    }

    /* 🔥 SEND ALL EMAILS IN PARALLEL */
    const results = await Promise.allSettled(
      recipientArray.map((email) =>
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject,
          html: `<pre>${body}</pre>`,
        })
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failed = results
      .map((r, i) => r.status === 'rejected' && recipientArray[i])
      .filter(Boolean);

    const status =
      failed.length === 0 ? 'success' :
      successCount === 0 ? 'failed' : 'partial';

    await Mail.create({
      subject,
      body,
      recipients: recipientArray,
      status,
      successCount,
      failedCount: failed.length,
      failedEmails: failed,
    });

    return res.json({
      success: true,
      message: `Sent ${successCount} emails`,
    });

  } catch (err) {
    next(err);
  }
};
