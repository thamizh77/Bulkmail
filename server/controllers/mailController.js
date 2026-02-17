const nodemailer = require('nodemailer');
const Mail = require('../models/Mail');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const sendMail = async (req, res, next) => {
  try {
    const { subject, body, recipients } = req.body;

    if (!subject || !body || !recipients) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const emails = recipients
      .split(',')
      .map(e => e.trim())
      .filter(isValidEmail);

    const transporter = createTransporter();

    let successCount = 0;
    let failedCount = 0;
    const failedEmails = [];

    for (const email of emails) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject,
          text: body,
        });
        successCount++;
      } catch (err) {
        failedCount++;
        failedEmails.push({ email, error: err.message });
      }
    }

    await Mail.create({
      subject,
      body,
      recipients: emails,
      status: successCount ? 'partial' : 'failed',
      successCount,
      failedCount,
      failedEmails,
    });

    res.json({
      success: true,
      successCount,
      failedCount,
      failedEmails,
    });
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const mails = await Mail.find().sort({ createdAt: -1 });
    res.json({ success: true, data: mails });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMail, getHistory };
