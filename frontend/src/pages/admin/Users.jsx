import React, { useEffect, useState } from 'react';
import { getAllUsers, approveUser } from '../../services/api';

// Color palette
const colors = {
  primary: '#001845',
  secondary: '#023E7D',
  accent: '#0466C8',
  muted: '#5C677D',
  lightBg: '#f8fafc',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  white: '#ffffff',
  border: '#e2e8f0'
};

const Users = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      const res = await getAllUsers();
      const pending = res.data.users.filter(
        user => user.role === 'admin' && !user.approved
      );
      setPendingUsers(pending);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to fetch pending users. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId, userName) => {
    try {
      await approveUser(userId);
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
      setMessage({
        type: 'success',
        text: `${userName} has been approved successfully.`
      });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Approval failed. Please try again.'
      });
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Pending Admin Approvals</h2>
          <div style={styles.statsCard}>
            <p style={styles.statsLabel}>Loading...</p>
          </div>
        </div>
        <div style={styles.loadingSkeleton}>
          {[1, 2, 3].map(i => (
            <div key={i} style={styles.skeletonRow} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Pending Admin Approvals</h2>
          <p style={styles.subtitle}>
            Review and approve new administrator registrations
          </p>
        </div>
        <div style={styles.statsCard}>
          <span style={styles.statsNumber}>{pendingUsers.length}</span>
          <span style={styles.statsLabel}>pending</span>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div style={{
          ...styles.alert,
          ...(message.type === 'success' ? styles.alertSuccess : styles.alertError)
        }}>
          <span>{message.text}</span>
          <button 
            onClick={() => setMessage({ type: '', text: '' })}
            style={styles.alertClose}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content Card */}
      <div style={styles.card}>
        {pendingUsers.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>✓</div>
            <h3 style={styles.emptyTitle}>All Caught Up!</h3>
            <p style={styles.emptyText}>
              No pending admin registrations at the moment.
            </p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Email</th>
                  <th style={styles.tableHeader}>Registered</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map(user => (
                  <tr key={user._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <div style={styles.userInfo}>
                        <div style={styles.userAvatar}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={styles.userName}>{user.name}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>{user.email}</td>
                    <td style={styles.tableCell}>
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.statusBadge}>Pending</span>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleApprove(user._id, user.name)}
                        style={styles.approveButton}
                        onMouseEnter={e => {
                          e.target.style.backgroundColor = '#035c8f';
                        }}
                        onMouseLeave={e => {
                          e.target.style.backgroundColor = colors.accent;
                        }}
                      >
                        Approve Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles object for consistency
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#001845',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: '#5C677D',
    margin: 0
  },
  statsCard: {
    background: 'linear-gradient(135deg, #001845 0%, #023E7D 100%)',
    padding: '16px 24px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '100px',
    boxShadow: '0 4px 12px rgba(0,24,69,0.15)'
  },
  statsNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1.2
  },
  statsLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    border: '1px solid #e2e8f0'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHead: {
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0'
  },
  tableHeader: {
    padding: '20px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#5C677D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background-color 0.2s',
    cursor: 'pointer'
  },
  tableCell: {
    padding: '16px',
    fontSize: '15px',
    color: '#1e293b'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #0466C8 0%, #023E7D 100%)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '18px'
  },
  userName: {
    fontWeight: '500',
    color: '#001845'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    background: '#fef3c7',
    color: '#92400e',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase', // removed 'as const'
    letterSpacing: '0.3px'
  },
  approveButton: {
    padding: '8px 20px',
    background: '#0466C8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 4px rgba(4,102,200,0.2)'
  },
  alert: {
    padding: '16px 20px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    animation: 'slideIn 0.3s ease'
  },
  alertSuccess: {
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0'
  },
  alertError: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca'
  },
  alertClose: {
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: 'inherit',
    padding: '0 8px'
  },
  emptyState: {
    textAlign: 'center', // removed 'as const'
    padding: '60px 20px'
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    background: '#e2e8f0',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '32px',
    color: '#5C677D'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#001845',
    margin: '0 0 8px 0'
  },
  emptyText: {
    fontSize: '16px',
    color: '#5C677D',
    margin: 0
  },
  loadingSkeleton: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
  },
  skeletonRow: {
    height: '60px',
    background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '8px',
    marginBottom: '16px'
  }
};

// Add keyframes animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  tr:hover {
    background-color: #f8fafc;
  }
`;
document.head.appendChild(style);

export default Users;