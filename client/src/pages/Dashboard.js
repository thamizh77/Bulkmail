/**
 * Bulk Mail Dashboard
 * Form to send bulk emails with subject, body, and recipients
 */

import React, { useState } from 'react';
import { mailAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    recipients: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const validateEmail = (email) => {
    const re = /^\S+@\S+\.\S+$/;
    return re.test(email.trim());
  };

  const validateEmails = (recipientsStr) => {
    const emails = recipientsStr
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const invalid = emails.filter((email) => !validateEmail(email));
    return { valid: invalid.length === 0, invalid, count: emails.length };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.subject.trim()) {
      setError('Email subject is required');
      return;
    }

    if (!formData.body.trim()) {
      setError('Email body is required');
      return;
    }

    if (!formData.recipients.trim()) {
      setError('At least one recipient email is required');
      return;
    }

    const { valid, invalid } = validateEmails(formData.recipients);
    if (!valid) {
      setError(`Invalid email format: ${invalid.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const response = await mailAPI.send(
        formData.subject,
        formData.body,
        formData.recipients
      );

      const { data } = response.data;
      const { successCount, failedCount } = data;

      if (failedCount > 0) {
        setSuccess(
          `Emails sent: ${successCount} successful, ${failedCount} failed. Check history for details.`
        );
      } else {
        setSuccess(`Successfully sent to ${successCount} recipient(s)!`);
      }

      // Clear form on full success
      if (failedCount === 0) {
        setFormData({ subject: '', body: '', recipients: '' });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to send emails. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Send Bulk Mail</h1>
        <p>Compose and send emails to multiple recipients</p>
      </div>

      <div className="dashboard-card">
        <form onSubmit={handleSubmit} className="mail-form">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label htmlFor="subject">Email Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter email subject"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="body">Email Body *</label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              placeholder="Enter your email content..."
              rows={8}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="recipients">Recipient Emails *</label>
            <textarea
              id="recipients"
              name="recipients"
              value={formData.recipients}
              onChange={handleChange}
              placeholder="email1@example.com, email2@example.com, email3@example.com"
              rows={3}
              disabled={loading}
            />
            <span className="form-hint">Separate multiple emails with commas</span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-send"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              'Send Emails'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
