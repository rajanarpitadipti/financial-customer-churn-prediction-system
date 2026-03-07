import React, { useState, useEffect } from 'react';

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

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const mockData = [
      { id: 1, name: 'John Smith', date: '2024-02-15', risk: 'High', probability: 87 },
      { id: 2, name: 'Sarah Johnson', date: '2024-02-14', risk: 'Medium', probability: 64 },
      { id: 3, name: 'Mike Chen', date: '2024-02-14', risk: 'High', probability: 79 },
      { id: 4, name: 'Emily Davis', date: '2024-02-13', risk: 'Low', probability: 23 },
      { id: 5, name: 'David Wilson', date: '2024-02-13', risk: 'Medium', probability: 58 },
    ];
    setPredictions(mockData);
  }, []);

  const filtered = filter === 'all' ? predictions : predictions.filter(p => p.risk.toLowerCase() === filter);

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'High': return colors.danger;
      case 'Medium': return colors.warning;
      default: return colors.success;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Prediction History</h2>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by risk:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Risk Level</th>
              <th style={styles.th}>Probability</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{new Date(p.date).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.riskBadge,
                    backgroundColor: getRiskColor(p.risk) + '20',
                    color: getRiskColor(p.risk)
                  }}>
                    {p.risk}
                  </span>
                </td>
                <td style={styles.td}>{p.probability}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 600,
    color: colors.primary,
    margin: 0,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  filterLabel: {
    fontSize: '14px',
    color: colors.muted,
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: 6,
    border: `1px solid ${colors.border}`,
    fontSize: '14px',
    background: colors.white,
    cursor: 'pointer',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: colors.muted,
    borderBottom: `2px solid ${colors.border}`,
  },
  tr: {
    borderBottom: `1px solid ${colors.border}`,
    ':hover': {
      backgroundColor: colors.lightBg,
    },
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: colors.primary,
  },
  riskBadge: {
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block',
  },
};

export default PredictionHistory;