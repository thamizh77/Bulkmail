/**
 * Sent Mail History Page
 * Displays list of previously sent emails with status
 */

import React, { useState, useEffect } from 'react';
import { mailAPI } from '../services/api';
import './History.css';

const History = () => {
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const response = await mailAPI.getHistory(page, pagination.limit);
      const { data, pagination: pag } = response.data;

      setMails(data);
      setPagination((prev) => ({
        ...prev,
        page: pag.page,
        total: pag.total,
        pages: pag.pages,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load mail history.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getBodyPreview = (body, maxLength = 80) => {
    if (!body) return '-';
    const text = body.replace(/\n/g, ' ').trim();
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'success':
        return 'status-success';
      case 'failed':
        return 'status-failed';
      case 'partial':
        return 'status-partial';
      default:
        return '';
    }
  };

  return (
    <div className="history">
      <div className="history-header">
        <h1>Sent Mail History</h1>
        <p>View all previously sent bulk emails</p>
      </div>

      <div className="history-card">
        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading history...</p>
          </div>
        ) : mails.length === 0 ? (
          <div className="empty-state">
            <p>No sent mails yet.</p>
            <p className="empty-hint">Send your first bulk email from the Dashboard.</p>
          </div>
        ) : (
          <>
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Body Preview</th>
                    <th>Recipients</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mails.map((mail) => (
                    <tr key={mail._id}>
                      <td className="cell-subject">{mail.subject}</td>
                      <td className="cell-body">
                        {getBodyPreview(mail.body)}
                      </td>
                      <td className="cell-recipients">
                        {mail.recipients?.length || 0} recipient(s)
                        {mail.successCount !== undefined && (
                          <span className="count-detail">
                            ({mail.successCount} ✓
                            {mail.failedCount > 0 && (
                              <>, {mail.failedCount} ✗</>
                            )}
                            )
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            mail.status
                          )}`}
                        >
                          {mail.status}
                        </span>
                      </td>
                      <td className="cell-date">
                        {formatDate(mail.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => fetchHistory(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="btn-pagination"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </span>
                <button
                  onClick={() => fetchHistory(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="btn-pagination"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
