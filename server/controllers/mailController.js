/**
 * Mail Controller
 * Handles bulk email sending and mail history
 */

const nodemailer = require('nodemailer');
const Mail = require('../models/Mail');

/**
 * Create Nodemailer transporter (Production-safe)
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password
    },
    connectionTimeout: 10000, // 10 sec
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

/**
 * POST /api/mail/send
 * Send bulk emails
 */
const sendMail = async (req, res, next) => {
  try {
    const { subject, body, recipients } = req.body;

    // Basic validation
    if (!subject || !body || !recipients) {
      return res.status(400).json({
        success: false,
        message: 'Subject, body, and recipients are required',
      });
    }

    // Convert comma-separated emails to array
    const recipientArray = recipients
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e && isValidEmail(e));

    if (recipientArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid recipient emails found',
      });
    }

    const transporter = createTransporter();

    let successCount = 0;
    let failedCount = 0;
    const failedEmails = [];

    /**
     * Send mails in parallel
     * (No infinite waiting)
     */
    const sendPromises = recipientArray.map(async (email) => {
      try {
        await transporter.sendMail({
          from: `"Bulk Mail" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: subject.trim(),
          html: `
            <div style="font-family: Arial, sans-serif; white-space: pre-wrap;">
              ${body.replace(/\n/g, '<br>')}
            </div>
          `,
        });
        successCount++;
      } catch (err) {
        failedCount++;
        failedEmails.push({
          email,
          error: err.message || 'Send failed',
        });
      }
    });

    // Wait for all mails (never hangs)
    await Promise.allSettled(sendPromises);

    // Status calculation
    let status = 'success';
    if (failedCount > 0 && successCount > 0) status = 'partial';
    else if (failedCount > 0) status = 'failed';

    // Save history in DB
    const mailRecord = await Mail.create({
      subject: subject.trim(),
      body,
      recipients: recipientArray,
      status,
      successCount,
      failedCount,
      failedEmails,
    });

    return res.status(200).json({
      success: true,
      message: `Emails sent: ${successCount} success, ${failedCount} failed`,
      data: mailRecord,
    });
  } catch (error) {
    console.error('Bulk mail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Bulk mail failed',
    });
  }
};

/**
 * GET /api/mail/history
 * Fetch mail history (paginated)
 */
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const mails = await Mail.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Mail.countDocuments();

    return res.status(200).json({
      success: true,
      data: mails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMail,
  getHistory,
};
