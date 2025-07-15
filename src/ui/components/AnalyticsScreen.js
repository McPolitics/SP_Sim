import { BaseComponent } from './BaseComponent';
import { Chart } from './Chart';
import { eventSystem } from '../../core/EventSystem';
import { playerAnalytics } from '../../core/PlayerAnalytics';

/**
 * AnalyticsScreen - Player retention and performance analytics dashboard
 * Displays insights, metrics, and performance tracking for player improvement
 */
export class AnalyticsScreen extends BaseComponent {
  constructor() {
    super();
    this.analyticsData = null;
    this.refreshInterval = null;
    this.charts = new Map();

    this.initializeScreen();
    this.setupEventListeners();
    this.startDataRefresh();
  }

  /**
   * Initialize the analytics screen
   */
  initializeScreen() {
    const container = document.getElementById('analytics-screen');
    if (!container) {
      console.error('Analytics screen container not found');
      return;
    }

    container.innerHTML = this.generateAnalyticsHTML();
    this.initializeCharts();
    this.refreshData();
  }

  /**
   * Generate analytics HTML structure
   */
  generateAnalyticsHTML() {
    return `
      <div class="analytics-screen">
        <div class="analytics-header">
          <h1>📊 Player Analytics Dashboard</h1>
          <div class="analytics-controls">
            <button id="refresh-analytics" class="btn btn--primary">🔄 Refresh</button>
            <button id="export-analytics" class="btn btn--secondary">📥 Export Data</button>
            <button id="clear-analytics" class="btn btn--danger">🗑️ Clear Data</button>
          </div>
        </div>

        <div class="analytics-overview">
          <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
              <div class="metric-value" id="overall-score">--</div>
              <div class="metric-label">Overall Score</div>
              <div class="metric-grade" id="performance-grade">--</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">👥</div>
            <div class="metric-content">
              <div class="metric-value" id="approval-avg">--%</div>
              <div class="metric-label">Avg Approval</div>
              <div class="metric-trend" id="approval-trend">--</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">⏱️</div>
            <div class="metric-content">
              <div class="metric-value" id="session-length">--m</div>
              <div class="metric-label">Avg Session</div>
              <div class="metric-sub" id="total-playtime">--h total</div>
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">🔄</div>
            <div class="metric-content">
              <div class="metric-value" id="retention-rate">--%</div>
              <div class="metric-label">Retention Rate</div>
              <div class="metric-risk" id="churn-risk">--</div>
            </div>
          </div>
        </div>

        <div class="analytics-tabs">
          <button class="tab-btn active" data-tab="performance">Performance</button>
          <button class="tab-btn" data-tab="retention">Retention</button>
          <button class="tab-btn" data-tab="behavior">Behavior</button>
          <button class="tab-btn" data-tab="insights">Insights</button>
        </div>

        <div class="analytics-content">
          <!-- Performance Tab -->
          <div class="tab-content active" id="performance-tab">
            <div class="analytics-grid">
              <div class="chart-container">
                <h3>📈 Performance Trends</h3>
                <canvas id="performance-chart" width="400" height="200"></canvas>
              </div>
              
              <div class="chart-container">
                <h3>🏛️ Approval Rating History</h3>
                <canvas id="approval-chart" width="400" height="200"></canvas>
              </div>
              
              <div class="stats-panel">
                <h3>📋 Performance Stats</h3>
                <div class="stat-list">
                  <div class="stat-item">
                    <span class="stat-label">Crisis Management:</span>
                    <span class="stat-value" id="crisis-score">--%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Learning Progress:</span>
                    <span class="stat-value" id="learning-progress">--%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Completion Rate:</span>
                    <span class="stat-value" id="completion-rate">--%</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Decision Speed:</span>
                    <span class="stat-value" id="decision-speed">--s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Retention Tab -->
          <div class="tab-content" id="retention-tab">
            <div class="analytics-grid">
              <div class="chart-container">
                <h3>📅 Session Activity</h3>
                <canvas id="session-chart" width="400" height="200"></canvas>
              </div>
              
              <div class="retention-metrics">
                <h3>🔄 Retention Metrics</h3>
                <div class="retention-grid">
                  <div class="retention-card">
                    <div class="retention-value" id="days-since-first">--</div>
                    <div class="retention-label">Days Since First Play</div>
                  </div>
                  <div class="retention-card">
                    <div class="retention-value" id="total-sessions">--</div>
                    <div class="retention-label">Total Sessions</div>
                  </div>
                  <div class="retention-card">
                    <div class="retention-value" id="engagement-score">--</div>
                    <div class="retention-label">Engagement Score</div>
                  </div>
                  <div class="retention-card">
                    <div class="retention-value" id="weekly-retention">--%</div>
                    <div class="retention-label">Weekly Retention</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Behavior Tab -->
          <div class="tab-content" id="behavior-tab">
            <div class="analytics-grid">
              <div class="chart-container">
                <h3>🎯 Decision Patterns</h3>
                <canvas id="decisions-chart" width="400" height="200"></canvas>
              </div>
              
              <div class="chart-container">
                <h3>📜 Policy Preferences</h3>
                <canvas id="policies-chart" width="400" height="200"></canvas>
              </div>
              
              <div class="feature-usage">
                <h3>🎮 Feature Usage</h3>
                <div class="usage-list" id="feature-usage-list">
                  <!-- Dynamic content -->
                </div>
              </div>
            </div>
          </div>

          <!-- Insights Tab -->
          <div class="tab-content" id="insights-tab">
            <div class="insights-container">
              <h3>💡 Personalized Insights</h3>
              <div class="insights-list" id="insights-list">
                <!-- Dynamic content -->
              </div>
              
              <div class="recommendations">
                <h3>🎯 Recommendations</h3>
                <div class="recommendation-cards" id="recommendations-list">
                  <!-- Dynamic content -->
                </div>
              </div>
              
              <div class="achievements">
                <h3>🏆 Analytics Achievements</h3>
                <div class="achievement-grid" id="achievements-grid">
                  <!-- Dynamic content -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize charts
   */
  initializeCharts() {
    this.initPerformanceChart();
    this.initApprovalChart();
    this.initSessionChart();
    this.initDecisionsChart();
    this.initPoliciesChart();
  }

  /**
   * Initialize performance trend chart
   */
  initPerformanceChart() {
    const canvas = document.getElementById('performance-chart');
    if (!canvas) return;

    const chart = new Chart(canvas.parentElement, {
      type: 'line',
      title: 'Performance Score Over Time',
      width: 400,
      height: 200,
      data: [],
      labels: [],
      colors: ['#4CAF50'],
    });

    this.charts.set('performance', chart);
  }

  /**
   * Initialize approval rating chart
   */
  initApprovalChart() {
    const canvas = document.getElementById('approval-chart');
    if (!canvas) return;

    const chart = new Chart(canvas.parentElement, {
      type: 'line',
      title: 'Approval Rating History',
      width: 400,
      height: 200,
      data: [],
      labels: [],
      colors: ['#2196F3'],
    });

    this.charts.set('approval', chart);
  }

  /**
   * Initialize session activity chart
   */
  initSessionChart() {
    const canvas = document.getElementById('session-chart');
    if (!canvas) return;

    const chart = new Chart(canvas.parentElement, {
      type: 'bar',
      title: 'Session Activity',
      width: 400,
      height: 200,
      data: [],
      labels: [],
      colors: ['#FF9800'],
    });

    this.charts.set('sessions', chart);
  }

  /**
   * Initialize decisions chart
   */
  initDecisionsChart() {
    const canvas = document.getElementById('decisions-chart');
    if (!canvas) return;

    const chart = new Chart(canvas.parentElement, {
      type: 'pie',
      title: 'Decision Types',
      width: 400,
      height: 200,
      data: [],
      labels: [],
      colors: ['#4CAF50', '#2196F3', '#FF9800', '#F44336', '#9C27B0', '#00BCD4'],
    });

    this.charts.set('decisions', chart);
  }

  /**
   * Initialize policies chart
   */
  initPoliciesChart() {
    const canvas = document.getElementById('policies-chart');
    if (!canvas) return;

    const chart = new Chart(canvas.parentElement, {
      type: 'bar',
      title: 'Policy Preferences',
      width: 400,
      height: 200,
      data: [],
      labels: [],
      colors: ['#673AB7'],
    });

    this.charts.set('policies', chart);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Tab switching
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('tab-btn')) {
        this.switchTab(event.target.dataset.tab);
      }
    });

    // Control buttons
    const refreshBtn = document.getElementById('refresh-analytics');
    if (refreshBtn) {
      this.addEventListener(refreshBtn, 'click', () => this.refreshData());
    }

    const exportBtn = document.getElementById('export-analytics');
    if (exportBtn) {
      this.addEventListener(exportBtn, 'click', () => this.exportAnalytics());
    }

    const clearBtn = document.getElementById('clear-analytics');
    if (clearBtn) {
      this.addEventListener(clearBtn, 'click', () => this.clearAnalytics());
    }

    // Listen for analytics updates
    eventSystem.on('analytics:decision_tracked', () => this.scheduleRefresh());
    eventSystem.on('analytics:policy_tracked', () => this.scheduleRefresh());
    eventSystem.on('analytics:approval_tracked', () => this.scheduleRefresh());
  }

  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');

    // Track feature usage
    playerAnalytics.trackFeatureUsage(`analytics-${tabName}`);
  }

  /**
   * Refresh analytics data
   */
  refreshData() {
    this.analyticsData = playerAnalytics.getAnalytics();
    this.updateOverviewMetrics();
    this.updateCharts();
    this.updateInsights();

    console.log('Analytics data refreshed:', this.analyticsData);
  }

  /**
   * Update overview metrics cards
   */
  updateOverviewMetrics() {
    const performance = playerAnalytics.getPlayerPerformance();
    const retention = playerAnalytics.getRetentionMetrics();

    // Overall score
    this.updateElement('overall-score', performance.overallScore);
    this.updateElement('performance-grade', performance.performanceGrade);

    // Approval rating
    this.updateElement('approval-avg', performance.averageApproval);

    // Session metrics
    this.updateElement('session-length', Math.round(performance.sessionLength));
    this.updateElement('total-playtime', Math.round(this.analyticsData.player.totalPlaytime / 60));

    // Retention metrics
    this.updateElement('retention-rate', Math.round(retention.weeklyRetention));
    this.updateElement('churn-risk', retention.churnRisk);

    // Performance stats
    this.updateElement('crisis-score', performance.crisisManagement);
    this.updateElement('learning-progress', performance.learningProgression);
    this.updateElement('completion-rate', performance.completionRate);

    // Retention details
    this.updateElement('days-since-first', retention.daysSinceFirstPlay);
    this.updateElement('total-sessions', retention.totalSessions);
    this.updateElement('engagement-score', retention.engagementScore);
    this.updateElement('weekly-retention', Math.round(retention.weeklyRetention));

    // Decision speed
    const avgDecisionSpeed = this.analyticsData.player.decisionSpeed.length > 0
      ? this.analyticsData.player.decisionSpeed.reduce((a, b) => a + b, 0) / this.analyticsData.player.decisionSpeed.length / 1000
      : 0;
    this.updateElement('decision-speed', Math.round(avgDecisionSpeed));
  }

  /**
   * Update all charts with latest data
   */
  updateCharts() {
    this.updatePerformanceChart();
    this.updateApprovalChart();
    this.updateSessionChart();
    this.updateDecisionsChart();
    this.updatePoliciesChart();
  }

  /**
   * Update performance chart
   */
  updatePerformanceChart() {
    const chart = this.charts.get('performance');
    if (!chart || !this.analyticsData) return;

    // Generate performance trend data
    const recentSessions = Math.min(10, this.analyticsData.player.totalSessions);
    const labels = Array.from({ length: recentSessions }, (_, i) => `S${i + 1}`);

    // Simulate performance trend (in real implementation, this would be stored historical data)
    const performance = playerAnalytics.getPlayerPerformance();
    const baseScore = performance.overallScore;
    const data = Array.from({ length: recentSessions }, (_, _i) => Math.max(0, baseScore + (Math.random() - 0.5) * 20));

    chart.options.labels = labels;
    chart.updateData([{ values: data, name: 'Performance Score' }], labels);
  }

  /**
   * Update approval chart
   */
  updateApprovalChart() {
    const chart = this.charts.get('approval');
    if (!chart || !this.analyticsData) return;

    const approvals = this.analyticsData.player.averageApproval.slice(-20);
    const labels = approvals.map((_, i) => `T${i + 1}`);

    chart.options.labels = labels;
    chart.updateData([{ values: approvals, name: 'Approval Rating' }], labels);
  }

  /**
   * Update session chart
   */
  updateSessionChart() {
    const chart = this.charts.get('sessions');
    if (!chart || !this.analyticsData) return;

    // Generate recent session lengths
    const sessionCount = Math.min(10, this.analyticsData.player.totalSessions);
    const labels = Array.from({ length: sessionCount }, (_, i) => `S${i + 1}`);

    // Simulate session lengths (in real implementation, this would be stored data)
    const avgLength = this.analyticsData.player.averageSessionLength;
    const data = Array.from({ length: sessionCount }, () => Math.max(1, avgLength + (Math.random() - 0.5) * 10)).map((value, index) => ({ value, name: labels[index] }));

    chart.options.labels = labels;
    chart.updateData(data, labels);
  }

  /**
   * Update decisions chart
   */
  updateDecisionsChart() {
    const chart = this.charts.get('decisions');
    if (!chart || !this.analyticsData) return;

    const { decisionTypes } = this.analyticsData.player;
    const data = Object.entries(decisionTypes).map(([name, value]) => ({ value, name }));

    chart.updateData(data);
  }

  /**
   * Update policies chart
   */
  updatePoliciesChart() {
    const chart = this.charts.get('policies');
    if (!chart || !this.analyticsData) return;

    const policyPrefs = this.analyticsData.player.policyPreferences;
    const data = Object.entries(policyPrefs).map(([name, value]) => ({ value, name }));

    chart.updateData(data);
  }

  /**
   * Update insights and recommendations
   */
  updateInsights() {
    this.updateInsightsList();
    this.updateFeatureUsage();
    this.updateRecommendations();
    this.updateAchievements();
  }

  /**
   * Update insights list
   */
  updateInsightsList() {
    const container = document.getElementById('insights-list');
    if (!container || !this.analyticsData) return;

    const { insights } = this.analyticsData;

    container.innerHTML = insights.map((insight) => `
      <div class="insight-card ${insight.priority}">
        <div class="insight-icon">${this.getInsightIcon(insight.type)}</div>
        <div class="insight-content">
          <h4>${insight.title}</h4>
          <p>${insight.message}</p>
        </div>
        <div class="insight-priority">${insight.priority}</div>
      </div>
    `).join('');
  }

  /**
   * Update feature usage display
   */
  updateFeatureUsage() {
    const container = document.getElementById('feature-usage-list');
    if (!container || !this.analyticsData) return;

    const usage = this.analyticsData.player.featureUsage;
    const total = Object.values(usage).reduce((sum, count) => sum + count, 0);

    container.innerHTML = Object.entries(usage)
      .sort(([, a], [, b]) => b - a)
      .map(([feature, count]) => {
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
          <div class="usage-item">
            <div class="usage-bar">
              <div class="usage-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="usage-info">
              <span class="usage-feature">${feature}</span>
              <span class="usage-count">${count} (${percentage}%)</span>
            </div>
          </div>
        `;
      }).join('');
  }

  /**
   * Update recommendations
   */
  updateRecommendations() {
    const container = document.getElementById('recommendations-list');
    if (!container) return;

    const performance = playerAnalytics.getPlayerPerformance();
    const recommendations = this.generateRecommendations(performance);

    container.innerHTML = recommendations.map((rec) => `
      <div class="recommendation-card">
        <div class="rec-icon">${rec.icon}</div>
        <div class="rec-content">
          <h4>${rec.title}</h4>
          <p>${rec.description}</p>
          ${rec.action ? `<button class="btn btn--small">${rec.action}</button>` : ''}
        </div>
      </div>
    `).join('');
  }

  /**
   * Update achievements display
   */
  updateAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    const achievements = this.calculateAchievements();

    container.innerHTML = achievements.map((achievement) => `
      <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <h4>${achievement.title}</h4>
          <p>${achievement.description}</p>
          ${achievement.progress ? `<div class="achievement-progress">${achievement.progress}%</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  /**
   * Generate personalized recommendations
   */
  generateRecommendations(performance) {
    const recommendations = [];

    if (performance.averageApproval < 50) {
      recommendations.push({
        icon: '📈',
        title: 'Improve Public Support',
        description: 'Focus on popular policies and effective crisis management.',
        action: 'View Policy Guide',
      });
    }

    if (performance.sessionLength < 20) {
      recommendations.push({
        icon: '⏰',
        title: 'Explore More Features',
        description: 'Try different game screens to increase engagement.',
        action: 'Take Tutorial',
      });
    }

    if (performance.crisisManagement < 60) {
      recommendations.push({
        icon: '🚨',
        title: 'Crisis Management Training',
        description: 'Practice handling crises to improve your skills.',
        action: 'Practice Mode',
      });
    }

    return recommendations;
  }

  /**
   * Calculate achievements based on player performance
   */
  calculateAchievements() {
    const performance = playerAnalytics.getPlayerPerformance();
    const retention = playerAnalytics.getRetentionMetrics();

    return [
      {
        title: 'First Steps',
        description: 'Complete your first session',
        icon: '🏃',
        unlocked: retention.totalSessions >= 1,
        progress: Math.min(100, retention.totalSessions * 100),
      },
      {
        title: 'People\'s Champion',
        description: 'Maintain 70%+ approval rating',
        icon: '👑',
        unlocked: performance.averageApproval >= 70,
        progress: Math.min(100, (performance.averageApproval / 70) * 100),
      },
      {
        title: 'Crisis Manager',
        description: 'Handle 5 crises successfully',
        icon: '🛡️',
        unlocked: performance.crisisManagement >= 80,
        progress: Math.min(100, (performance.crisisManagement / 80) * 100),
      },
      {
        title: 'Dedicated Leader',
        description: 'Play for over 5 hours total',
        icon: '⏱️',
        unlocked: this.analyticsData?.player.totalPlaytime >= 300,
        progress: Math.min(100, ((this.analyticsData?.player.totalPlaytime || 0) / 300) * 100),
      },
    ];
  }

  /**
   * Get icon for insight type
   */
  getInsightIcon(type) {
    const icons = {
      improvement: '📈',
      engagement: '🎯',
      retention: '🔄',
      strength: '💪',
      warning: '⚠️',
    };
    return icons[type] || '💡';
  }

  /**
   * Start automatic data refresh
   */
  startDataRefresh() {
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, 30000); // Refresh every 30 seconds
  }

  /**
   * Schedule a refresh (debounced)
   */
  scheduleRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    this.refreshTimeout = setTimeout(() => {
      this.refreshData();
    }, 2000);
  }

  /**
   * Export analytics data
   */
  exportAnalytics() {
    const data = playerAnalytics.getAnalytics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `sp_sim_analytics_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    playerAnalytics.trackFeatureUsage('analytics-export');
  }

  /**
   * Clear analytics data
   * Uses a custom confirmation modal instead of window.confirm
   */
  clearAnalytics() {
    this.showConfirmationModal(
      'Are you sure you want to clear all analytics data? This cannot be undone.',
      () => {
        playerAnalytics.clearAnalytics();
        this.refreshData();
        playerAnalytics.trackFeatureUsage('analytics-clear');
      },
    );
  }

  /**
   * Show a custom confirmation modal
   * @param {string} message
   * @param {Function} onConfirm
   */
  showConfirmationModal(message, onConfirm) {
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
      <div class="custom-modal-content">
        <p>${message}</p>
        <div class="custom-modal-actions">
          <button class="btn btn--danger" id="modal-confirm">Confirm</button>
          <button class="btn btn--secondary" id="modal-cancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Handle confirm
    modal.querySelector('#modal-confirm').onclick = () => {
      document.body.removeChild(modal);
      if (typeof onConfirm === 'function') onConfirm();
    };

    // Handle cancel
    modal.querySelector('#modal-cancel').onclick = () => {
      document.body.removeChild(modal);
    };
  }

  /**
   * Update element content safely
   */
  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  /**
   * Cleanup when screen is destroyed
   */
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    // Clear charts
    this.charts.clear();

    super.destroy();
  }
}

export default AnalyticsScreen;
