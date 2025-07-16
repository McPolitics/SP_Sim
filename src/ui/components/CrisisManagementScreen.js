import { BaseComponent } from './BaseComponent';
import { eventSystem } from '../../core/EventSystem';
import { mediaSystem } from '../../core/MediaSystem';
import { Modal } from './Modal';

/**
 * CrisisManagementScreen - Comprehensive crisis management interface
 * Handles scandals, media crises, policy failures, and damage control
 */
export class CrisisManagementScreen extends BaseComponent {
  constructor() {
    super();
    this.currentTab = 'overview';
    this.activeCrises = [];
    this.crisisHistory = [];
    this.responseQueue = [];
    this.gameState = null;
    this.initializeScreen();
  }

  initializeScreen() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for crisis events
    eventSystem.on('media:scandal_triggered', (event) => {
      this.handleCrisisTriggered(event.data);
    });

    eventSystem.on('political:crisis_event', (event) => {
      this.handlePoliticalCrisis(event.data);
    });

    eventSystem.on('economic:crisis_event', (event) => {
      this.handleEconomicCrisis(event.data);
    });

    eventSystem.on('crisis:response_completed', (event) => {
      this.handleCrisisResponse(event.data);
    });
  }

  handleCrisisTriggered(data) {
    const crisis = {
      id: data.scandal.id,
      type: 'scandal',
      title: data.scandal.title,
      description: data.scandal.description,
      severity: data.scandal.severity,
      status: 'active',
      triggeredWeek: data.gameState.time.week,
      triggeredYear: data.gameState.time.year,
      mediaAttention: data.scandal.impact.mediaAttention || 0,
      publicConcern: (() => {
        let concernBonus = 0;
        if (data.scandal.severity === 'high') {
          concernBonus = 30;
        } else if (data.scandal.severity === 'medium') {
          concernBonus = 15;
        } else {
          concernBonus = 5;
        }
        return 50 + concernBonus;
      })(),
      responseDeadline: data.gameState.time.week + 2, // 2 weeks to respond
      availableResponses: this.getCrisisResponses(data.scandal),
    };

    this.activeCrises.push(crisis);
    this.refresh();
  }

  handlePoliticalCrisis(data) {
    const crisis = {
      id: `political_${Date.now()}`,
      type: 'political',
      title: data.title || 'Political Crisis',
      description: data.description || 'A political crisis has emerged requiring immediate attention.',
      severity: data.severity || 'medium',
      status: 'active',
      triggeredWeek: data.gameState.time.week,
      triggeredYear: data.gameState.time.year,
      mediaAttention: data.impact?.mediaAttention || 10,
      publicConcern: data.impact?.publicConcern || 40,
      responseDeadline: data.gameState.time.week + 1,
      availableResponses: this.getPoliticalCrisisResponses(data),
    };

    this.activeCrises.push(crisis);
    this.refresh();
  }

  handleEconomicCrisis(data) {
    const crisis = {
      id: `economic_${Date.now()}`,
      type: 'economic',
      title: data.title || 'Economic Crisis',
      description: data.description || 'An economic crisis requires government intervention.',
      severity: data.severity || 'medium',
      status: 'active',
      triggeredWeek: data.gameState.time.week,
      triggeredYear: data.gameState.time.year,
      mediaAttention: data.impact?.mediaAttention || 15,
      publicConcern: data.impact?.publicConcern || 60,
      responseDeadline: data.gameState.time.week + 3,
      availableResponses: this.getEconomicCrisisResponses(data),
    };

    this.activeCrises.push(crisis);
    this.refresh();
  }

  render() {
    return `
      <div class="crisis-screen">
        <!-- Header -->
        <div class="crisis-header">
          <div class="header-content">
            <h1>🚨 Crisis Management Center</h1>
            <p>Monitor and respond to political scandals, media crises, and emergency situations</p>
          </div>
          <div class="crisis-summary">
            <div class="summary-metric">
              <span class="metric-label">Active Crises</span>
              <span class="metric-value" id="active-crises-count">${this.activeCrises.length}</span>
            </div>
            <div class="summary-metric">
              <span class="metric-label">Response Queue</span>
              <span class="metric-value" id="response-queue-count">${this.responseQueue.length}</span>
            </div>
            <div class="summary-metric">
              <span class="metric-label">Public Concern</span>
              <span class="metric-value" id="public-concern">--</span>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="crisis-tabs">
          <button class="tab-btn ${this.currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
            <span class="tab-icon">📊</span>
            <span class="tab-text">Overview</span>
          </button>
          <button class="tab-btn ${this.currentTab === 'active' ? 'active' : ''}" data-tab="active">
            <span class="tab-icon">🚨</span>
            <span class="tab-text">Active Crises</span>
            ${this.activeCrises.length > 0 ? `<span class="tab-badge">${this.activeCrises.length}</span>` : ''}
          </button>
          <button class="tab-btn ${this.currentTab === 'responses' ? 'active' : ''}" data-tab="responses">
            <span class="tab-icon">💼</span>
            <span class="tab-text">Response Center</span>
          </button>
          <button class="tab-btn ${this.currentTab === 'media' ? 'active' : ''}" data-tab="media">
            <span class="tab-icon">📺</span>
            <span class="tab-text">Media Relations</span>
          </button>
          <button class="tab-btn ${this.currentTab === 'history' ? 'active' : ''}" data-tab="history">
            <span class="tab-icon">📋</span>
            <span class="tab-text">Crisis History</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="crisis-content">
          <div class="tab-content ${this.currentTab === 'overview' ? 'active' : ''}" id="tab-overview">
            ${this.renderOverviewTab()}
          </div>
          <div class="tab-content ${this.currentTab === 'active' ? 'active' : ''}" id="tab-active">
            ${this.renderActiveCrisesTab()}
          </div>
          <div class="tab-content ${this.currentTab === 'responses' ? 'active' : ''}" id="tab-responses">
            ${this.renderResponseCenterTab()}
          </div>
          <div class="tab-content ${this.currentTab === 'media' ? 'active' : ''}" id="tab-media">
            ${this.renderMediaRelationsTab()}
          </div>
          <div class="tab-content ${this.currentTab === 'history' ? 'active' : ''}" id="tab-history">
            ${this.renderHistoryTab()}
          </div>
        </div>

        <style>
        .crisis-screen {
          padding: var(--spacing-lg);
          max-width: 1400px;
          margin: 0 auto;
        }

        .crisis-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-xl);
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: var(--border-radius-lg);
          color: white;
          box-shadow: var(--shadow-lg);
        }

        .header-content h1 {
          margin: 0 0 var(--spacing-sm) 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .header-content p {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
          line-height: 1.5;
        }

        .crisis-summary {
          display: flex;
          gap: var(--spacing-lg);
        }

        .summary-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 120px;
        }

        .metric-label {
          font-size: 0.875rem;
          opacity: 0.8;
          margin-bottom: var(--spacing-xs);
          font-weight: 500;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .crisis-tabs {
          display: flex;
          gap: 0;
          margin-bottom: var(--spacing-lg);
          background: var(--surface-color);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-xs);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          overflow-x: auto;
        }

        .tab-btn {
          flex: 1;
          min-width: 120px;
          padding: var(--spacing-md) var(--spacing-lg);
          border: none;
          background: none;
          color: var(--text-light);
          font-weight: 500;
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          position: relative;
          white-space: nowrap;
        }

        .tab-btn:hover {
          background: var(--background-alt);
          color: var(--text-color);
        }

        .tab-btn.active {
          background: var(--accent-color);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .tab-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--warning-color);
          color: white;
          border-radius: 50%;
          min-width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .crisis-content {
          background: var(--surface-color);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          min-height: 600px;
        }

        .tab-content {
          display: none;
          padding: var(--spacing-xl);
          animation: fadeInUp 0.3s ease-out;
        }

        .tab-content.active {
          display: block;
        }

        .crisis-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--spacing-lg);
        }

        .crisis-panel {
          background: var(--background-alt);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
        }

        .crisis-panel h3 {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--primary-color);
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .crisis-item {
          background: var(--surface-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
          margin-bottom: var(--spacing-md);
          transition: all var(--transition-base);
        }

        .crisis-item:hover {
          border-color: var(--accent-color);
          box-shadow: var(--shadow-sm);
        }

        .crisis-header-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-md);
        }

        .crisis-title {
          font-weight: 600;
          color: var(--text-color);
          font-size: 1.1rem;
          margin-bottom: var(--spacing-xs);
        }

        .crisis-type {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .crisis-scandal {
          background: var(--accent-color);
          color: white;
        }

        .crisis-political {
          background: var(--warning-color);
          color: white;
        }

        .crisis-economic {
          background: var(--info-color);
          color: white;
        }

        .crisis-description {
          color: var(--text-light);
          line-height: 1.5;
          margin-bottom: var(--spacing-md);
        }

        .crisis-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .crisis-metric {
          text-align: center;
        }

        .metric-value {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--secondary-color);
          display: block;
        }

        .metric-label {
          font-size: 0.875rem;
          color: var(--text-light);
          margin-top: var(--spacing-xs);
        }

        .response-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-xxl);
          color: var(--text-light);
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
          opacity: 0.5;
        }

        .empty-state h3 {
          margin-bottom: var(--spacing-sm);
          color: var(--text-color);
        }

        @media (max-width: 768px) {
          .crisis-header {
            flex-direction: column;
            gap: var(--spacing-lg);
            text-align: center;
          }

          .crisis-summary {
            flex-direction: column;
            gap: var(--spacing-md);
            width: 100%;
          }

          .crisis-tabs {
            overflow-x: auto;
            padding: var(--spacing-xs);
          }

          .tab-btn {
            min-width: 100px;
            padding: var(--spacing-sm);
          }

          .tab-text {
            display: none;
          }

          .crisis-grid {
            grid-template-columns: 1fr;
          }
        }
        </style>
      </div>
    `;
  }

  renderOverviewTab() {
    const totalCrises = this.activeCrises.length + this.crisisHistory.length;
    const urgentCrises = this.activeCrises.filter((c) => c.severity === 'high').length;
    const averageResponseTime = this.calculateAverageResponseTime();

    return `
      <div class="crisis-grid">
        <div class="crisis-panel">
          <h3>🚨 Crisis Status Overview</h3>
          <div class="overview-stats">
            <div class="stat-item">
              <div class="stat-number">${this.activeCrises.length}</div>
              <div class="stat-label">Active Crises</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${urgentCrises}</div>
              <div class="stat-label">Urgent (High Severity)</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${totalCrises}</div>
              <div class="stat-label">Total This Term</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${averageResponseTime}h</div>
              <div class="stat-label">Avg Response Time</div>
            </div>
          </div>
        </div>

        <div class="crisis-panel">
          <h3>📊 Public Opinion Impact</h3>
          <div class="opinion-chart">
            <div class="opinion-metric">
              <span class="opinion-label">Media Pressure</span>
              <div class="opinion-bar">
                <div class="opinion-fill" style="width: ${this.calculateMediaPressure()}%"></div>
              </div>
              <span class="opinion-value">${this.calculateMediaPressure()}%</span>
            </div>
            <div class="opinion-metric">
              <span class="opinion-label">Public Concern</span>
              <div class="opinion-bar">
                <div class="opinion-fill" style="width: ${this.calculatePublicConcern()}%"></div>
              </div>
              <span class="opinion-value">${this.calculatePublicConcern()}%</span>
            </div>
            <div class="opinion-metric">
              <span class="opinion-label">Crisis Fatigue</span>
              <div class="opinion-bar">
                <div class="opinion-fill" style="width: ${this.calculateCrisisFatigue()}%"></div>
              </div>
              <span class="opinion-value">${this.calculateCrisisFatigue()}%</span>
            </div>
          </div>
        </div>

        <div class="crisis-panel">
          <h3>⚡ Immediate Actions Required</h3>
          <div class="urgent-actions">
            ${this.renderUrgentActions()}
          </div>
        </div>

        <div class="crisis-panel">
          <h3>📈 Crisis Trends</h3>
          <div class="trends-chart">
            ${this.renderCrisisTrends()}
          </div>
        </div>
      </div>
    `;
  }

  renderActiveCrisesTab() {
    if (this.activeCrises.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">✅</div>
          <h3>No Active Crises</h3>
          <p>Your government is currently crisis-free. Stay vigilant for potential issues.</p>
        </div>
      `;
    }

    return `
      <div class="active-crises-list">
        ${this.activeCrises.map((crisis) => this.renderCrisisCard(crisis)).join('')}
      </div>
    `;
  }

  renderCrisisCard(crisis) {
    const timeRemaining = crisis.responseDeadline - (this.gameState?.time?.week || 0);
    const isUrgent = timeRemaining <= 1;

    return `
      <div class="crisis-item ${isUrgent ? 'crisis-urgent' : ''}">
        <div class="crisis-header-info">
          <div>
            <div class="crisis-title">${crisis.title}</div>
            <span class="crisis-type crisis-${crisis.type}">${crisis.type}</span>
          </div>
          <div class="crisis-deadline">
            <strong>${timeRemaining} weeks</strong>
            <span>to respond</span>
          </div>
        </div>
        
        <div class="crisis-description">${crisis.description}</div>
        
        <div class="crisis-metrics">
          <div class="crisis-metric">
            <span class="metric-value">${crisis.severity}</span>
            <span class="metric-label">Severity</span>
          </div>
          <div class="crisis-metric">
            <span class="metric-value">${crisis.mediaAttention}</span>
            <span class="metric-label">Media Attention</span>
          </div>
          <div class="crisis-metric">
            <span class="metric-value">${crisis.publicConcern}%</span>
            <span class="metric-label">Public Concern</span>
          </div>
        </div>
        
        <div class="response-actions">
          <button class="btn btn--primary" onclick="handleCrisisResponse('${crisis.id}')">
            📋 View Response Options
          </button>
          <button class="btn btn--secondary" onclick="showCrisisDetails('${crisis.id}')">
            📊 Detailed Analysis
          </button>
          ${isUrgent ? '<button class="btn btn--danger">⚡ Urgent Response</button>' : ''}
        </div>
      </div>
    `;
  }

  renderResponseCenterTab() {
    return `
      <div class="response-center">
        <div class="response-grid">
          <div class="response-panel">
            <h3>🎯 Response Strategies</h3>
            <div class="strategy-list">
              <div class="strategy-item">
                <div class="strategy-header">
                  <h4>📢 Public Statement</h4>
                  <span class="strategy-effectiveness">Effectiveness: 70%</span>
                </div>
                <p>Make a direct public statement addressing the crisis and outlining government position.</p>
                <div class="strategy-effects">
                  <span class="effect-positive">+Transparency</span>
                  <span class="effect-negative">-Privacy</span>
                </div>
              </div>

              <div class="strategy-item">
                <div class="strategy-header">
                  <h4>🔍 Internal Investigation</h4>
                  <span class="strategy-effectiveness">Effectiveness: 80%</span>
                </div>
                <p>Launch internal investigation to gather facts before public response.</p>
                <div class="strategy-effects">
                  <span class="effect-positive">+Credibility</span>
                  <span class="effect-negative">-Response Speed</span>
                </div>
              </div>

              <div class="strategy-item">
                <div class="strategy-header">
                  <h4>👥 Scapegoating</h4>
                  <span class="strategy-effectiveness">Effectiveness: 60%</span>
                </div>
                <p>Assign responsibility to specific individuals to protect broader government.</p>
                <div class="strategy-effects">
                  <span class="effect-positive">+Damage Control</span>
                  <span class="effect-negative">-Staff Loyalty</span>
                </div>
              </div>

              <div class="strategy-item">
                <div class="strategy-header">
                  <h4>🤐 Strategic Silence</h4>
                  <span class="strategy-effectiveness">Effectiveness: 40%</span>
                </div>
                <p>Avoid commenting publicly and let the crisis fade naturally.</p>
                <div class="strategy-effects">
                  <span class="effect-positive">+Political Capital</span>
                  <span class="effect-negative">-Media Relations</span>
                </div>
              </div>
            </div>
          </div>

          <div class="response-panel">
            <h3>📞 Communication Tools</h3>
            <div class="communication-tools">
              <button class="tool-btn">
                <span class="tool-icon">📺</span>
                <span class="tool-name">Press Conference</span>
                <span class="tool-cost">High Impact</span>
              </button>
              <button class="tool-btn">
                <span class="tool-icon">📰</span>
                <span class="tool-name">Press Release</span>
                <span class="tool-cost">Medium Impact</span>
              </button>
              <button class="tool-btn">
                <span class="tool-icon">📱</span>
                <span class="tool-name">Social Media</span>
                <span class="tool-cost">Quick Response</span>
              </button>
              <button class="tool-btn">
                <span class="tool-icon">📞</span>
                <span class="tool-name">Private Briefing</span>
                <span class="tool-cost">Targeted</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderMediaRelationsTab() {
    const mediaStatus = mediaSystem.getMediaStatus();

    return `
      <div class="media-relations">
        <div class="media-grid">
          <div class="media-panel">
            <h3>📺 Media Landscape</h3>
            <div class="media-metrics">
              <div class="media-metric">
                <span class="metric-value">${mediaStatus.mediaAttention}%</span>
                <span class="metric-label">Media Attention</span>
              </div>
              <div class="media-metric">
                <span class="metric-value">${mediaStatus.activeStories}</span>
                <span class="metric-label">Active Stories</span>
              </div>
              <div class="media-metric">
                <span class="metric-value">${mediaStatus.publicOpinion.trustInMedia}%</span>
                <span class="metric-label">Trust in Media</span>
              </div>
            </div>
          </div>

          <div class="media-panel">
            <h3>📰 Active Media Stories</h3>
            <div class="media-stories">
              ${this.renderMediaStories(mediaStatus.activeStories)}
            </div>
          </div>

          <div class="media-panel">
            <h3>🎯 Media Strategy</h3>
            <div class="media-strategy">
              <button class="strategy-btn">📝 Craft Narrative</button>
              <button class="strategy-btn">🤝 Build Relationships</button>
              <button class="strategy-btn">📊 Monitor Coverage</button>
              <button class="strategy-btn">⚡ Rapid Response</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderHistoryTab() {
    if (this.crisisHistory.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No Crisis History</h3>
          <p>Historical crisis data will appear here as you manage and resolve crises.</p>
        </div>
      `;
    }

    return `
      <div class="crisis-history">
        <div class="history-stats">
          <h3>📊 Historical Performance</h3>
          <div class="performance-metrics">
            <div class="performance-item">
              <span class="performance-value">${this.crisisHistory.length}</span>
              <span class="performance-label">Total Crises Handled</span>
            </div>
            <div class="performance-item">
              <span class="performance-value">${this.calculateSuccessRate()}%</span>
              <span class="performance-label">Success Rate</span>
            </div>
            <div class="performance-item">
              <span class="performance-value">${this.calculateAverageResponseTime()}</span>
              <span class="performance-label">Avg Response Time</span>
            </div>
          </div>
        </div>

        <div class="history-list">
          ${this.crisisHistory.map((crisis) => this.renderHistoricalCrisis(crisis)).join('')}
        </div>
      </div>
    `;
  }

  // Helper methods for calculations and rendering
  calculateMediaPressure() {
    const mediaStatus = mediaSystem.getMediaStatus();
    return Math.min(100, mediaStatus.mediaAttention + this.activeCrises.length * 10);
  }

  calculatePublicConcern() {
    if (this.activeCrises.length === 0) return 20;
    return Math.min(100, this.activeCrises.reduce((sum, crisis) => sum + crisis.publicConcern, 0) / this.activeCrises.length);
  }

  calculateCrisisFatigue() {
    return Math.min(100, this.crisisHistory.length * 2 + this.activeCrises.length * 5);
  }

  calculateAverageResponseTime() {
    if (this.crisisHistory.length === 0) return 0;
    const totalTime = this.crisisHistory.reduce((sum, crisis) => sum + (crisis.responseTime || 24), 0);
    return Math.round(totalTime / this.crisisHistory.length);
  }

  calculateSuccessRate() {
    if (this.crisisHistory.length === 0) return 0;
    const successful = this.crisisHistory.filter((crisis) => crisis.outcome === 'resolved').length;
    return Math.round((successful / this.crisisHistory.length) * 100);
  }

  renderUrgentActions() {
    const urgentCrises = this.activeCrises.filter((crisis) => {
      const timeRemaining = crisis.responseDeadline - (this.gameState?.time?.week || 0);
      return timeRemaining <= 1 || crisis.severity === 'high';
    });

    if (urgentCrises.length === 0) {
      return '<p class="no-urgent">No urgent actions required at this time.</p>';
    }

    return urgentCrises.map((crisis) => `
      <div class="urgent-action">
        <div class="urgent-title">${crisis.title}</div>
        <div class="urgent-deadline">Deadline: ${crisis.responseDeadline - (this.gameState?.time?.week || 0)} weeks</div>
        <button class="btn btn--danger btn--sm" onclick="handleCrisisResponse('${crisis.id}')">
          Act Now
        </button>
      </div>
    `).join('');
  }

  renderCrisisTrends() {
    // Placeholder for crisis trends visualization
    return `
      <div class="trends-placeholder">
        <p>Crisis trend analysis coming soon...</p>
      </div>
    `;
  }

  renderMediaStories(activeStories) {
    if (!activeStories || activeStories.length === 0) {
      return '<p class="no-stories">No active media stories</p>';
    }

    return activeStories.slice(0, 5).map((story) => `
      <div class="story-item">
        <div class="story-headline">${story.headline}</div>
        <div class="story-outlet">${story.outlet || 'Various Outlets'}</div>
      </div>
    `).join('');
  }

  renderHistoricalCrisis(crisis) {
    return `
      <div class="history-item">
        <div class="history-header">
          <span class="history-title">${crisis.title}</span>
          <span class="history-outcome ${crisis.outcome}">${crisis.outcome}</span>
        </div>
        <div class="history-details">
          <span>Response: ${crisis.response || 'Unknown'}</span>
          <span>Duration: ${crisis.duration || 'N/A'} weeks</span>
        </div>
      </div>
    `;
  }

  getCrisisResponses(_scandal) {
    return [
      {
        id: 'deny', name: 'Deny Allegations', effectiveness: 40, risk: 'high',
      },
      {
        id: 'investigate', name: 'Launch Investigation', effectiveness: 75, risk: 'medium',
      },
      {
        id: 'acknowledge', name: 'Acknowledge & Reform', effectiveness: 85, risk: 'low',
      },
      {
        id: 'ignore', name: 'No Comment', effectiveness: 30, risk: 'high',
      },
    ];
  }

  getPoliticalCrisisResponses(_data) {
    return [
      {
        id: 'negotiate', name: 'Negotiate Compromise', effectiveness: 70, risk: 'medium',
      },
      {
        id: 'confront', name: 'Direct Confrontation', effectiveness: 60, risk: 'high',
      },
      {
        id: 'concede', name: 'Make Concessions', effectiveness: 80, risk: 'low',
      },
      {
        id: 'delay', name: 'Delay Decision', effectiveness: 40, risk: 'medium',
      },
    ];
  }

  getEconomicCrisisResponses(_data) {
    return [
      {
        id: 'stimulus', name: 'Economic Stimulus', effectiveness: 75, risk: 'medium',
      },
      {
        id: 'cuts', name: 'Budget Cuts', effectiveness: 60, risk: 'high',
      },
      {
        id: 'reform', name: 'Structural Reform', effectiveness: 85, risk: 'low',
      },
      {
        id: 'wait', name: 'Wait and Monitor', effectiveness: 45, risk: 'high',
      },
    ];
  }

  setupInteractivity() {
    const container = document.querySelector('.crisis-screen');
    if (!container) return;

    // Tab switching
    container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Set up global functions for crisis actions
    window.handleCrisisResponse = (crisisId) => {
      this.showCrisisResponseModal(crisisId);
    };

    window.showCrisisDetails = (crisisId) => {
      this.showCrisisDetailsModal(crisisId);
    };
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    this.refresh();
  }

  showCrisisResponseModal(crisisId) {
    const crisis = this.activeCrises.find((c) => c.id === crisisId);
    if (!crisis) return;

    const modal = new Modal({
      title: `🚨 Crisis Response: ${crisis.title}`,
      content: `
        <div class="crisis-response-modal">
          <div class="crisis-situation">
            <h4>Current Situation:</h4>
            <p>${crisis.description}</p>
            <div class="situation-metrics">
              <span>Severity: <strong>${crisis.severity}</strong></span>
              <span>Public Concern: <strong>${crisis.publicConcern}%</strong></span>
              <span>Time Remaining: <strong>${crisis.responseDeadline - (this.gameState?.time?.week || 0)} weeks</strong></span>
            </div>
          </div>

          <div class="response-options">
            <h4>Available Responses:</h4>
            <div class="options-list">
              ${crisis.availableResponses.map((response) => `
                <div class="response-option" data-response="${response.id}">
                  <div class="response-name">${response.name}</div>
                  <div class="response-stats">
                    <span class="effectiveness">Effectiveness: ${response.effectiveness}%</span>
                    <span class="risk risk-${response.risk}">Risk: ${response.risk}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `,
      confirmText: 'Execute Response',
      onConfirm: () => {
        const selectedOption = document.querySelector('.response-option.selected');
        if (selectedOption) {
          const responseId = selectedOption.getAttribute('data-response');
          this.executeCrisisResponse(crisisId, responseId);
          return true;
        }
        return false;
      },
    });

    modal.show();

    // Add selection functionality
    setTimeout(() => {
      const options = document.querySelectorAll('.response-option');
      options.forEach((option) => {
        option.addEventListener('click', () => {
          options.forEach((opt) => opt.classList.remove('selected'));
          option.classList.add('selected');
        });
      });
    }, 100);
  }

  executeCrisisResponse(crisisId, responseId) {
    const crisis = this.activeCrises.find((c) => c.id === crisisId);
    if (!crisis) return;

    const response = crisis.availableResponses.find((r) => r.id === responseId);
    if (!response) return;

    // Move crisis to history
    this.activeCrises = this.activeCrises.filter((c) => c.id !== crisisId);

    crisis.response = responseId;
    crisis.outcome = Math.random() < (response.effectiveness / 100) ? 'resolved' : 'escalated';
    crisis.responseTime = Math.random() * 48 + 12; // 12-60 hours
    crisis.duration = Math.ceil(Math.random() * 4) + 1; // 1-5 weeks

    this.crisisHistory.push(crisis);

    // Emit response event
    eventSystem.emit('crisis:response_executed', {
      crisis,
      response: responseId,
      effectiveness: response.effectiveness,
      gameState: this.gameState,
    });

    this.refresh();
    this.showNotification(`Crisis response executed: ${response.name}`, 'success');
  }

  showNotification(message, type = 'info') {
    if (window.spSimApp) {
      window.spSimApp.showNotification(message, type);
    }
  }

  update(gameState) {
    this.gameState = gameState;

    // Update crisis deadlines and status
    this.activeCrises.forEach((crisis) => {
      const timeRemaining = crisis.responseDeadline - gameState.time.week;
      if (timeRemaining <= 0) {
        // Auto-escalate overdue crises
        crisis.status = 'escalated';
        crisis.publicConcern += 20;
        crisis.mediaAttention += 10;
      }
    });

    this.refresh();
  }

  refresh() {
    const container = document.querySelector('#screen-crisis .crisis-screen');
    if (container) {
      container.innerHTML = this.render().replace(/<div class="crisis-screen">|<\/div>$/g, '');
      this.setupInteractivity();
    }
  }

  show() {
    const crisisScreen = document.querySelector('#screen-crisis');
    if (crisisScreen && !crisisScreen.querySelector('.crisis-screen')) {
      crisisScreen.innerHTML = this.render();
      this.setupInteractivity();
    }
    return this.element;
  }
}

export default CrisisManagementScreen;
