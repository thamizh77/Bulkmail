/**
 * Mail Model
 * Schema for storing sent email records/history
 */

const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
    },
    recipients: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['success', 'failed', 'partial'],
      default: 'success',
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    failedEmails: [
      {
        email: String,
        error: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Mail', mailSchema);
