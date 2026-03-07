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
  danger: '#ef4444',
  info: '#3b82f6'
};

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [loading, setLoading] = useState(false);

  // Mock log data – replace with real API
  useEffect(() => {
    const mockLogs = [
      { id: 1, timestamp: '2024-02-15T10:23:45Z', level: 'INFO', source: 'Auth', message: 'User admin@bank.com logged in successfully', details: 'IP: 192.168.1.100' },
      { id: 2, timestamp: '2024-02-15T10:22:30Z', level: 'WARN', source: 'Model', message: 'Prediction accuracy below threshold for segment C', details: 'Current: 87%, Target: 92%' },
      { id: 3, timestamp: '2024-02-15T10:20:15Z', level: 'ERROR', source: 'Database', message: 'Connection timeout during batch prediction', details: 'Retry 3/5' },
      { id: 4, timestamp: '2024-02-15T10:18:22Z', level: 'INFO', source: 'System', message: 'Daily model retraining completed', details: 'Duration: 2m 34s' },
      { id: 5, timestamp: '2024-02-15T10:15:07Z', level: 'DEBUG', source: 'API', message: 'Request payload: { customerId: "C001", features: [...] }', details: 'Endpoint: /predict' },
      { id: 6, timestamp: '2024-02-15T10:12:44Z', level: 'WARN', source: 'Storage', message: 'Disk usage above 80%', details: 'Current: 82%, Projected: 90% in 3 days' },
      { id: 7, timestamp: '2024-02-15T10:10:11Z', level: 'ERROR', source: 'Auth', message: 'Failed login attempt for admin@bank.com', details: 'Invalid password (3 attempts)' },
      { id: 8, timestamp: '2024-02-15T10:08:33Z', level: 'INFO', source: 'Job', message: 'Scheduled cleanup completed', details: 'Removed 234 old records' }
    ];
    setLogs(mockLogs);
  }, []);

  const getLevelColor = (level) => {
    switch(level) {
      case 'ERROR': return colors.danger;
      case 'WARN': return colors.warning;
      case 'INFO': return colors.success;
      case 'DEBUG': return colors.info;
      default: return colors.muted;
    }
  };

  const getLevelBg = (level) => {
    switch(level) {
      case 'ERROR': return colors.danger + '10';
      case 'WARN': return colors.warning + '10';
      case 'INFO': return colors.success + '10';
      case 'DEBUG': return colors.info + '10';
      default: return colors.lightBg;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) &&
        !log.source.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>System Logs</h2>
          <p style={styles.subtitle}>
            Real-time activity monitoring and debugging
          </p>
        </div>
        <div style={styles.controls}>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            style={{
              ...styles.controlButton,
              ...(autoScroll ? styles.controlActive : {})
            }}
          >
            🔄 Auto-scroll {autoScroll ? 'ON' : 'OFF'}
          </button>
          <button style={styles.controlButton}>
            📥 Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterTabs}>
          {['all', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              style={{
                ...styles.filterTab,
                ...(filter === level ? styles.filterActive : {}),
                ...(level !== 'all' && filter === level ? { color: getLevelColor(level) } : {})
              }}
            >
              {level === 'all' ? 'All Levels' : level}
            </button>
          ))}
        </div>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={styles.clearSearch}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <span style={styles.statItem}>
          <span style={styles.statLabel}>Total:</span>
          <span style={styles.statValue}>{filteredLogs.length}</span>
        </span>
        <span style={styles.statItem}>
          <span style={styles.statLabel}>Errors:</span>
          <span style={{...styles.statValue, color: colors.danger}}>
            {filteredLogs.filter(l => l.level === 'ERROR').length}
          </span>
        </span>
        <span style={styles.statItem}>
          <span style={styles.statLabel}>Warnings:</span>
          <span style={{...styles.statValue, color: colors.warning}}>
            {filteredLogs.filter(l => l.level === 'WARN').length}
          </span>
        </span>
      </div>

      {/* Logs List */}
      <div style={styles.logsContainer}>
        {filteredLogs.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <h3 style={styles.emptyTitle}>No logs found</h3>
            <p style={styles.emptyText}>Try adjusting your filters</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              style={styles.logEntry}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.lightBg}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = colors.white}
            >
              <div style={styles.logHeader}>
                <span style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span
                  style={{
                    ...styles.logLevel,
                    backgroundColor: getLevelBg(log.level),
                    color: getLevelColor(log.level)
                  }}
                >
                  {log.level}
                </span>
                <span style={styles.logSource}>{log.source}</span>
              </div>
              <div style={styles.logMessage}>{log.message}</div>
              {log.details && (
                <div style={styles.logDetails}>{log.details}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: colors.primary,
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '16px',
    color: colors.muted,
    margin: 0
  },
  controls: {
    display: 'flex',
    gap: '12px'
  },
  controlButton: {
    padding: '8px 16px',
    background: colors.white,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: colors.muted,
    cursor: 'pointer',
    transition: '0.2s',
    ':hover': {
      background: colors.lightBg
    }
  },
  controlActive: {
    background: colors.accent,
    color: colors.white,
    borderColor: colors.accent
  },
  filters: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    background: colors.lightBg,
    padding: '4px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`
  },
  filterTab: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: '0.2s'
  },
  filterActive: {
    background: colors.white,
    color: colors.primary,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: colors.white,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '0 12px',
    minWidth: '300px'
  },
  searchIcon: {
    color: colors.muted,
    marginRight: '8px'
  },
  searchInput: {
    flex: 1,
    padding: '10px 0',
    border: 'none',
    outline: 'none',
    fontSize: '14px'
  },
  clearSearch: {
    border: 'none',
    background: 'transparent',
    color: colors.muted,
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px'
  },
  statsBar: {
    display: 'flex',
    gap: '24px',
    padding: '16px',
    background: colors.lightBg,
    borderRadius: '12px',
    marginBottom: '20px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statLabel: {
    fontSize: '14px',
    color: colors.muted
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.primary
  },
  logsContainer: {
    background: colors.white,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    overflow: 'hidden'
  },
  logEntry: {
    padding: '16px',
    borderBottom: `1px solid ${colors.border}`,
    transition: '0.2s',
    cursor: 'pointer'
  },
  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  logTime: {
    fontSize: '13px',
    color: colors.muted,
    fontFamily: 'monospace'
  },
  logLevel: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  logSource: {
    fontSize: '13px',
    color: colors.primary,
    fontWeight: '500'
  },
  logMessage: {
    fontSize: '14px',
    color: colors.primary,
    marginBottom: '4px'
  },
  logDetails: {
    fontSize: '13px',
    color: colors.muted,
    fontFamily: 'monospace',
    padding: '8px',
    background: colors.lightBg,
    borderRadius: '6px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    color: colors.muted
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: colors.primary,
    margin: '0 0 8px 0'
  },
  emptyText: {
    fontSize: '14px',
    color: colors.muted,
    margin: 0
  }
};

export default Logs;