/**
 * Mail Controller
 * Handles bulk email sending and mail history
 */

const nodemailer = require('nodemailer');
const Mail = require('../models/Mail');

/**
 * Create Nodemailer transporter
 * Uses Gmail SMTP with credentials from env
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email.trim());
};

/**
 * POST /api/mail/send
 * Send bulk emails to multiple recipients
 * Handles partial failures gracefully
 */
const sendMail = async (req, res, next) => {
  try {
    const { subject, body, recipients } = req.body;

    // Validate required fields
    if (!subject || !body || !recipients) {
      return res.status(400).json({
        message: 'Subject, body, and recipients are required',
      });
    }

    // Parse recipients (comma-separated string to array)
    const recipientArray = recipients
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);

    if (recipientArray.length === 0) {
      return res.status(400).json({
        message: 'At least one valid recipient email is required',
      });
    }

    // Validate email format
    const invalidEmails = recipientArray.filter((email) => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        message: `Invalid email format: ${invalidEmails.join(', ')}`,
      });
    }

    // Create nodemailer transporter
    const transporter = createTransporter();

    let successCount = 0;
    let failedCount = 0;
    const failedEmails = [];

    // Send emails to each recipient
    for (const email of recipientArray) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: subject.trim(),
          text: body,
          html: `<div style="white-space: pre-wrap;">${body.replace(/\n/g, '<br>')}</div>`,
        });
        successCount++;
      } catch (err) {
        failedCount++;
        failedEmails.push({
          email,
          error: err.message || 'Failed to send',
        });
      }
    }

    // Determine overall status
    let status = 'success';
    if (failedCount > 0 && successCount > 0) status = 'partial';
    else if (failedCount > 0) status = 'failed';

    // Save to database for history
    const mailRecord = await Mail.create({
      subject: subject.trim(),
      body,
      recipients: recipientArray,
      status,
      successCount,
      failedCount,
      failedEmails,
    });

    res.status(200).json({
      success: true,
      message: `Emails sent: ${successCount} successful, ${failedCount} failed`,
      data: {
        id: mailRecord._id,
        successCount,
        failedCount,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/mail/history
 * Fetch all sent mail records (paginated)
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

    res.status(200).json({
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

module.exports = { sendMail, getHistory };
