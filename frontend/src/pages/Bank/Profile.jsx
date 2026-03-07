import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const colors = {
  primary: '#001845',
  secondary: '#023E7D',
  accent: '#0466C8',
  muted: '#5C677D',
  white: '#ffffff',
  lightBg: '#f8fafc',
  border: '#e2e8f0',
  success: '#10b981',
  danger: '#ef4444'
};

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setLoading(false);
      return;
    }

    // Mock API call – replace with actual update
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Profile Settings</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <h3 style={styles.sectionTitle}>Change Password</h3>
        <div style={styles.formGroup}>
          <label style={styles.label}>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        {message.text && (
          <div style={{
            ...styles.message,
            ...(message.type === 'success' ? styles.successMsg : styles.errorMsg)
          }}>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={loading} style={styles.submitButton}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    background: colors.white,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.border}`,
    maxWidth: 600,
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 600,
    color: colors.primary,
    marginBottom: 24,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: colors.muted,
    marginBottom: 6,
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    fontSize: '15px',
    outline: 'none',
    transition: '0.2s',
    ':focus': {
      borderColor: colors.accent,
      boxShadow: `0 0 0 3px ${colors.accent}20`,
    },
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: colors.primary,
    marginTop: 8,
    marginBottom: 8,
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
    marginTop: 8,
    ':hover': {
      background: colors.primary,
    },
    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  message: {
    padding: '12px',
    borderRadius: 8,
    fontSize: '14px',
  },
  successMsg: {
    background: colors.success + '10',
    color: colors.success,
    border: `1px solid ${colors.success}30`,
  },
  errorMsg: {
    background: colors.danger + '10',
    color: colors.danger,
    border: `1px solid ${colors.danger}30`,
  },
};

export default Profile;