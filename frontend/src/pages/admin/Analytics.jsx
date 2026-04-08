import React, { useEffect, useMemo, useState } from 'react';
import { getAdminAnalytics } from '../../services/api';

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

const emptyData = {
  metrics: {
    totalUsers: 0,
    totalPredictions: 0,
    highRiskCustomers: 0,
    avgProbability: 0,
    avgConfidence: 0,
    modelVersion: 'rf_model.joblib',
    modelLastUpdated: null
  },
  trends: [],
  riskDistribution: [
    { label: 'Low Risk', value: 0, count: 0 },
    { label: 'Medium Risk', value: 0, count: 0 },
    { label: 'High Risk', value: 0, count: 0 }
  ],
  topChurners: [],
  generatedAt: null
};

const riskColor = (label) => {
  if (label.toLowerCase().includes('high')) return colors.danger;
  if (label.toLowerCase().includes('medium')) return colors.warning;
  return colors.success;
};

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(emptyData);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      if (isMounted) {
        setError('');
        setLoading(true);
      }
      try {
        const res = await getAdminAnalytics(timeRange);
        if (isMounted) {
          setData({
            metrics: res.data?.metrics || emptyData.metrics,
            trends: res.data?.trends || [],
            riskDistribution: res.data?.riskDistribution || emptyData.riskDistribution,
            topChurners: res.data?.topChurners || [],
            generatedAt: res.data?.generatedAt || null
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Could not load analytics');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAnalytics();
    const timer = setInterval(loadAnalytics, 15000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [timeRange]);

  const maxPredictions = useMemo(
    () => Math.max(1, ...data.trends.map((d) => d.predictions || 0)),
    [data.trends]
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Analytics Dashboard</h2>
          <p style={styles.subtitle}>Live metrics from current prediction activity</p>
          <p style={styles.liveMeta}>
            {data.generatedAt
              ? `Last update: ${new Date(data.generatedAt).toLocaleString()}`
              : 'Waiting for first update...'}
          </p>
        </div>
        <div style={styles.timeRangeSelector}>
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                ...styles.timeRangeButton,
                ...(timeRange === range ? styles.timeRangeActive : {})
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={styles.errorBanner}>{error}</div>}

      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>📊</div>
          <div>
            <p style={styles.metricLabel}>Total Predictions</p>
            <p style={styles.metricValue}>{data.metrics.totalPredictions}</p>
            <p style={styles.metricTrend}>Within selected range</p>
          </div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>🎯</div>
          <div>
            <p style={styles.metricLabel}>Avg Confidence</p>
            <p style={styles.metricValue}>{data.metrics.avgConfidence.toFixed(1)}%</p>
            <p style={styles.metricTrend}>Model certainty signal</p>
          </div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>⚠️</div>
          <div>
            <p style={styles.metricLabel}>High Risk Predictions</p>
            <p style={styles.metricValue}>{data.metrics.highRiskCustomers}</p>
            <p style={styles.metricTrend}>Risk = High</p>
          </div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>👥</div>
          <div>
            <p style={styles.metricLabel}>Total Users</p>
            <p style={styles.metricValue}>{data.metrics.totalUsers}</p>
            <p style={styles.metricTrend}>
              Model updated:{' '}
              {data.metrics.modelLastUpdated
                ? new Date(data.metrics.modelLastUpdated).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Predictions Trend</h3>
          {loading ? (
            <p style={styles.stateText}>Loading trend...</p>
          ) : data.trends.length === 0 ? (
            <p style={styles.stateText}>No prediction data in this range.</p>
          ) : (
            <div style={styles.barChart}>
              {data.trends.map((point, idx) => (
                <div key={`${point.label}-${idx}`} style={styles.barChartItem}>
                  <div style={styles.barChartLabel}>{point.label}</div>
                  <div style={styles.barChartBarContainer}>
                    <div
                      style={{
                        ...styles.barChartBar,
                        height: `${(point.predictions / maxPredictions) * 100}%`,
                        background: colors.accent
                      }}
                    />
                  </div>
                  <div style={styles.barChartValue}>{point.predictions}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Risk Distribution</h3>
          {loading ? (
            <p style={styles.stateText}>Loading distribution...</p>
          ) : (
            <div style={styles.pieChartPlaceholder}>
              {data.riskDistribution.map((item, idx) => (
                <div key={`${item.label}-${idx}`} style={styles.riskLegendItem}>
                  <span style={{ ...styles.legendDot, backgroundColor: riskColor(item.label) }} />
                  <span style={styles.legendLabel}>
                    {item.label} ({item.count})
                  </span>
                  <span style={styles.legendValue}>{item.value}%</span>
                </div>
              ))}
              <div style={styles.pieVisual}>
                {data.riskDistribution.map((item, idx) => (
                  <div
                    key={`${item.label}-bar-${idx}`}
                    style={{
                      ...styles.pieSegment,
                      backgroundColor: riskColor(item.label),
                      width: `${item.value}%`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={styles.tableCard}>
        <h3 style={styles.tableTitle}>Top Churn Risk Predictions</h3>
        <div style={styles.tableWrapper}>
          {loading ? (
            <p style={styles.stateText}>Loading top risk predictions...</p>
          ) : data.topChurners.length === 0 ? (
            <p style={styles.stateText}>No prediction records yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Risk Level</th>
                  <th style={styles.th}>Probability</th>
                  <th style={styles.th}>Source</th>
                  <th style={styles.th}>Predicted At</th>
                </tr>
              </thead>
              <tbody>
                {data.topChurners.map((customer, idx) => (
                  <tr key={`${customer.name}-${idx}`} style={styles.tr}>
                    <td style={styles.td}>{customer.name}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.riskBadge,
                          backgroundColor:
                            customer.risk === 'High'
                              ? `${colors.danger}20`
                              : customer.risk === 'Medium'
                                ? `${colors.warning}20`
                                : `${colors.success}20`,
                          color:
                            customer.risk === 'High'
                              ? colors.danger
                              : customer.risk === 'Medium'
                                ? colors.warning
                                : colors.success
                        }}
                      >
                        {customer.risk}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.probabilityContainer}>
                        <span>{customer.probability.toFixed(1)}%</span>
                        <div style={styles.probabilityBar}>
                          <div
                            style={{
                              ...styles.probabilityFill,
                              width: `${customer.probability}%`,
                              backgroundColor:
                                customer.probability > 75
                                  ? colors.danger
                                  : customer.probability > 50
                                    ? colors.warning
                                    : colors.success
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{customer.source}</td>
                    <td style={styles.td}>{new Date(customer.predictedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
    marginBottom: '32px',
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
  liveMeta: {
    marginTop: '8px',
    marginBottom: 0,
    fontSize: '13px',
    color: colors.muted
  },
  errorBanner: {
    marginBottom: '16px',
    padding: '10px 12px',
    background: `${colors.danger}15`,
    border: `1px solid ${colors.danger}33`,
    borderRadius: '8px',
    color: colors.danger,
    fontSize: '14px'
  },
  timeRangeSelector: {
    display: 'flex',
    gap: '8px',
    background: colors.lightBg,
    padding: '4px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`
  },
  timeRangeButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: colors.muted,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: '0.2s'
  },
  timeRangeActive: {
    background: colors.white,
    color: colors.accent,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  metricCard: {
    background: colors.white,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.border}`
  },
  metricIcon: {
    fontSize: '32px',
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.primary}10)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricLabel: {
    fontSize: '14px',
    color: colors.muted,
    margin: '0 0 4px 0'
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: colors.primary,
    margin: '0 0 4px 0'
  },
  metricTrend: {
    fontSize: '13px',
    color: colors.success,
    margin: 0
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '24px'
  },
  chartCard: {
    background: colors.white,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.border}`
  },
  chartTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: colors.primary,
    margin: '0 0 20px 0'
  },
  stateText: {
    margin: 0,
    fontSize: '14px',
    color: colors.muted
  },
  barChart: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '200px',
    gap: '8px'
  },
  barChartItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    gap: '8px'
  },
  barChartLabel: {
    fontSize: '12px',
    color: colors.muted
  },
  barChartBarContainer: {
    width: '100%',
    height: '120px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  barChartBar: {
    width: '24px',
    borderRadius: '12px 12px 0 0',
    transition: 'height 0.3s'
  },
  barChartValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: colors.primary
  },
  pieChartPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  riskLegendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  legendLabel: {
    fontSize: '14px',
    color: colors.muted,
    flex: 1
  },
  legendValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: colors.primary
  },
  pieVisual: {
    display: 'flex',
    height: '24px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginTop: '8px'
  },
  pieSegment: {
    height: '100%',
    transition: 'width 0.3s'
  },
  tableCard: {
    background: colors.white,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.border}`
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: colors.primary,
    margin: '0 0 20px 0'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: colors.muted,
    borderBottom: `2px solid ${colors.border}`
  },
  tr: {
    borderBottom: `1px solid ${colors.border}`
  },
  td: {
    padding: '12px 16px',
    fontSize: '14px',
    color: colors.primary
  },
  riskBadge: {
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  probabilityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  probabilityBar: {
    flex: 1,
    height: '6px',
    background: colors.border,
    borderRadius: '3px',
    overflow: 'hidden'
  },
  probabilityFill: {
    height: '100%',
    borderRadius: '3px'
  }
};

export default Analytics;
