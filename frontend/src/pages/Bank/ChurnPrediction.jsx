import React, { useState } from 'react';

const colors = {
  primary: '#001845',
  secondary: '#023E7D',
  accent: '#0466C8',
  muted: '#5C677D',
  white: '#ffffff',
  lightBg: '#f8fafc',
  border: '#e2e8f0',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
};


import { bankBatchPredict } from '../../services/api';

const ChurnPrediction = () => {
  const [file, setFile] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkError, setBulkError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setBulkResult(null);
    setBulkError('');
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setBulkError('Please select a file.');
      return;
    }

    setBulkLoading(true);
    setBulkError('');
    setBulkResult(null);

    try {
      const response = await bankBatchPredict(file);
      setBulkResult(response.data);
    } catch (err) {
      setBulkError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Dataset</h2>

      <form onSubmit={handleBulkSubmit} style={styles.form}>
        <div style={styles.uploadArea}>
          <input
            type="file"
            id="file-upload"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          <label htmlFor="file-upload" style={styles.fileLabel}>
            <span style={styles.uploadIcon}>📁</span>
            {file ? file.name : 'Choose CSV or Excel file'}
          </label>
          <p style={styles.uploadHint}>
            Supported formats: .csv, .xlsx (max 50MB)
          </p>
        </div>

        <button type="submit" disabled={!file || bulkLoading} style={styles.submitButton}>
          {bulkLoading ? 'Uploading...' : 'Upload Dataset'}
        </button>
      </form>

      {bulkError && <div style={styles.error}>{bulkError}</div>}

      {bulkResult && (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>Batch Prediction Results</h3>
          {bulkResult.results && bulkResult.results.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
              <thead>
                <tr style={{ background: colors.lightBg }}>
                  <th style={{ ...styles.tableHeader, color: colors.primary }}>Customer Name</th>
                  <th style={{ ...styles.tableHeader, color: colors.primary }}>Prediction</th>
                  <th style={{ ...styles.tableHeader, color: colors.primary }}>Probability</th>
                </tr>
              </thead>
              <tbody>
                {bulkResult.results.map((row, idx) => (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? colors.white : colors.lightBg }}>
                    <td style={styles.tableCell}>{row.name}</td>
                    <td style={styles.tableCell}>{row.prediction}</td>
                    <td style={styles.tableCell}>{row.probability ? row.probability.toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No predictions found in the uploaded file.</p>
          )}
        </div>
      )}
    </div>
  );
};

// Add table styles for batch results
const tableStyles = {
  tableHeader: {
    padding: '8px 12px',
    fontWeight: 600,
    fontSize: '15px',
    borderBottom: `2px solid ${colors.border}`,
    background: colors.lightBg
  },
  tableCell: {
    padding: '8px 12px',
    fontSize: '14px',
    color: colors.primary,
    borderBottom: `1px solid ${colors.border}`
  }
};

const styles = {
  container: {
    padding: 20,
    background: colors.white,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.border}`,
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 600,
    color: colors.primary,
    marginBottom: 24,
  },
  form: {
    marginBottom: 30,
  },
  uploadArea: {
    marginBottom: 20,
  },
  fileInput: {
    display: 'none',
  },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    background: colors.lightBg,
    border: `2px dashed ${colors.border}`,
    borderRadius: 8,
    fontSize: '15px',
    color: colors.muted,
    cursor: 'pointer',
    transition: '0.2s',
    ':hover': {
      borderColor: colors.accent,
    },
  },
  uploadIcon: {
    fontSize: '20px',
  },
  uploadHint: {
    fontSize: '13px',
    color: colors.muted,
    marginTop: 8,
  },
  submitButton: {
    padding: '12px 24px',
    background: colors.accent,
    color: colors.white,
    border: 'none',
    borderRadius: 8,
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: '0.2s',
    ':hover': {
      background: colors.primary,
    },
    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  error: {
    marginTop: 16,
    padding: '12px',
    background: colors.danger + '10',
    color: colors.danger,
    borderRadius: 8,
    border: `1px solid ${colors.danger}30`,
  },
  resultCard: {
    marginTop: 24,
    padding: 20,
    background: colors.lightBg,
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
  },
  resultTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: colors.primary,
    marginBottom: 12,
  },
};

export default ChurnPrediction;