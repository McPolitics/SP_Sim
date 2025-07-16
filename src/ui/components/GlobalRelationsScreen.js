import { BaseComponent } from './BaseComponent';
import { eventSystem } from '../../core/EventSystem';
import { Modal } from './Modal';

/**
 * GlobalRelationsScreen - International diplomacy and global affairs management
 * Handles diplomatic relations, trade agreements, and international events
 */
export class GlobalRelationsScreen extends BaseComponent {
  constructor() {
    super();
    this.currentTab = 'overview';
    this.diplomaticRelations = this.initializeDiplomaticRelations();
    this.tradeAgreements = [];
    this.internationalEvents = [];
    this.gameState = null;
    this.initializeScreen();
  }

  initializeScreen() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    eventSystem.on('international:event_triggered', (event) => {
      this.handleInternationalEvent(event.data);
    });

    eventSystem.on('diplomacy:relation_changed', (event) => {
      this.updateDiplomaticRelation(event.data);
    });

    eventSystem.on('trade:agreement_signed', (event) => {
      this.handleTradeAgreement(event.data);
    });
  }

  initializeDiplomaticRelations() {
    return [
      {
        country: 'United States',
        flag: '🇺🇸',
        relation: 75,
        status: 'Friendly',
        tradeVolume: 45000000000,
        lastInteraction: 'Trade summit',
        interests: ['Trade', 'Security', 'Technology'],
        diplomaticEvents: [],
      },
      {
        country: 'European Union',
        flag: '🇪🇺',
        relation: 82,
        status: 'Allied',
        tradeVolume: 52000000000,
        lastInteraction: 'Climate agreement',
        interests: ['Environment', 'Trade', 'Human Rights'],
        diplomaticEvents: [],
      },
      {
        country: 'China',
        flag: '🇨🇳',
        relation: 45,
        status: 'Neutral',
        tradeVolume: 38000000000,
        lastInteraction: 'Border dispute',
        interests: ['Trade', 'Resources', 'Technology'],
        diplomaticEvents: [],
      },
      {
        country: 'Russia',
        flag: '🇷🇺',
        relation: 35,
        status: 'Tense',
        tradeVolume: 15000000000,
        lastInteraction: 'Sanctions discussion',
        interests: ['Energy', 'Security', 'Territory'],
        diplomaticEvents: [],
      },
      {
        country: 'United Kingdom',
        flag: '🇬🇧',
        relation: 88,
        status: 'Allied',
        tradeVolume: 28000000000,
        lastInteraction: 'Defense cooperation',
        interests: ['Trade', 'Security', 'History'],
        diplomaticEvents: [],
      },
      {
        country: 'Japan',
        flag: '🇯🇵',
        relation: 78,
        status: 'Friendly',
        tradeVolume: 22000000000,
        lastInteraction: 'Technology partnership',
        interests: ['Technology', 'Trade', 'Security'],
        diplomaticEvents: [],
      },
    ];
  }

  render() {
    return `
      <div class="global-screen">
        <!-- Header -->
        <div class="global-header">
          <div class="header-content">
            <h1>🌍 Global Relations</h1>
            <p>Manage international diplomacy, trade relations, and global partnerships</p>
          </div>
          <div class="global-summary">
            <div class="summary-metric">
              <span class="metric-label">Diplomatic Score</span>
              <span class="metric-value" id="diplomatic-score">${this.calculateDiplomaticScore()}</span>
            </div>
            <div class="summary-metric">
              <span class="metric-label">Trade Volume</span>
              <span class="metric-value" id="trade-volume">$${this.calculateTotalTrade()}B</span>
            </div>
            <div class="summary-metric">
              <span class="metric-label">Active Agreements</span>
              <span class="metric-value" id="active-agreements">${this.tradeAgreements.length}</span>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="global-tabs">
          <button class="tab-btn ${this.currentTab === 'overview' ? 'active' : ''}" data-tab="overview">
            <span class="tab-icon">🌍</span>
            <span class="tab-text">Overview</span>
          </button>
          <button class="tab-btn ${this.currentTab === 'diplomacy' ? 'active' : ''}" data-tab="diplomacy">
            <span class="tab-icon">🤝</span>
            <span class="tab-text">Diplomacy</span>
          </button>
          <button class="tab-btn ${this.currentTab === 'trade' ? 'active' : ''}" data-tab="trade">
            <span class="tab-icon">📊</span>
            <span class="tab-text">Trade</span>
          </button>
          <button class="tab-btn ${this.currentTab === 'events' ? 'active' : ''}" data-tab="events">
            <span class="tab-icon">📰</span>
            <span class="tab-text">Global Events</span>
            ${this.internationalEvents.length > 0 ? `<span class="tab-badge">${this.internationalEvents.length}</span>` : ''}
          </button>
          <button class="tab-btn ${this.currentTab === 'intelligence' ? 'active' : ''}" data-tab="intelligence">
            <span class="tab-icon">🔍</span>
            <span class="tab-text">Intelligence</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="global-content">
          <div class="tab-content ${this.currentTab === 'overview' ? 'active' : ''}" id="tab-overview">
            ${this.renderOverviewTab()}
          </div>
          <div class="tab-content ${this.currentTab === 'diplomacy' ? 'active' : ''}" id="tab-diplomacy">
            ${this.renderDiplomacyTab()}
          </div>
          <div class="tab-content ${this.currentTab === 'trade' ? 'active' : ''}" id="tab-trade">
            ${this.renderTradeTab()}
          </div>
          <div class="tab-content ${this.currentTab === 'events' ? 'active' : ''}" id="tab-events">
            ${this.renderEventsTab()}
          </div>
          <div class="tab-content ${this.currentTab === 'intelligence' ? 'active' : ''}" id="tab-intelligence">
            ${this.renderIntelligenceTab()}
          </div>
        </div>

        <style>
        .global-screen {
          padding: var(--spacing-lg);
          max-width: 1400px;
          margin: 0 auto;
        }

        .global-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-xl);
          background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
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

        .global-summary {
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

        .global-tabs {
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
          background: var(--secondary-color);
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
          background: var(--accent-color);
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

        .global-content {
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

        .global-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--spacing-lg);
        }

        .global-panel {
          background: var(--background-alt);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
        }

        .global-panel h3 {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--primary-color);
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .country-card {
          background: var(--surface-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
          margin-bottom: var(--spacing-md);
          transition: all var(--transition-base);
          cursor: pointer;
        }

        .country-card:hover {
          border-color: var(--secondary-color);
          box-shadow: var(--shadow-sm);
        }

        .country-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .country-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .country-flag {
          font-size: 2rem;
        }

        .country-name {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-color);
        }

        .relation-score {
          font-size: 1.2rem;
          font-weight: 700;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--border-radius);
          color: white;
        }

        .relation-excellent { background: var(--success-color); }
        .relation-good { background: var(--info-color); }
        .relation-neutral { background: var(--warning-color); }
        .relation-poor { background: var(--accent-color); }

        .country-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .detail-item {
          text-align: center;
        }

        .detail-value {
          font-weight: 600;
          color: var(--secondary-color);
          display: block;
          font-size: 1.1rem;
        }

        .detail-label {
          font-size: 0.875rem;
          color: var(--text-light);
          margin-top: var(--spacing-xs);
        }

        .country-interests {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
          margin-bottom: var(--spacing-md);
        }

        .interest-tag {
          padding: var(--spacing-xs) var(--spacing-sm);
          background: var(--border-light);
          border-radius: var(--border-radius-sm);
          font-size: 0.875rem;
          color: var(--text-color);
        }

        .country-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .diplomatic-action {
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          background: var(--surface-color);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transition-base);
          font-size: 0.875rem;
        }

        .diplomatic-action:hover {
          background: var(--secondary-color);
          color: white;
          border-color: var(--secondary-color);
        }

        .trade-agreement {
          background: var(--surface-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
          margin-bottom: var(--spacing-md);
        }

        .agreement-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .agreement-title {
          font-weight: 600;
          color: var(--text-color);
        }

        .agreement-status {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-active { background: var(--success-color); color: white; }
        .status-pending { background: var(--warning-color); color: white; }
        .status-expired { background: var(--text-light); color: white; }

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
          .global-header {
            flex-direction: column;
            gap: var(--spacing-lg);
            text-align: center;
          }

          .global-summary {
            flex-direction: column;
            gap: var(--spacing-md);
            width: 100%;
          }

          .global-tabs {
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

          .global-grid {
            grid-template-columns: 1fr;
          }

          .country-details {
            grid-template-columns: 1fr;
          }
        }
        </style>
      </div>
    `;
  }

  renderOverviewTab() {
    const relationshipStatus = this.calculateRelationshipStatus();
    const tradeBalance = this.calculateTradeBalance();

    return `
      <div class="global-grid">
        <div class="global-panel">
          <h3>🌐 Global Standing</h3>
          <div class="standing-metrics">
            <div class="standing-item">
              <div class="standing-value">${this.calculateDiplomaticScore()}</div>
              <div class="standing-label">Diplomatic Score</div>
            </div>
            <div class="standing-item">
              <div class="standing-value">${relationshipStatus.positive}</div>
              <div class="standing-label">Positive Relations</div>
            </div>
            <div class="standing-item">
              <div class="standing-value">${relationshipStatus.neutral}</div>
              <div class="standing-label">Neutral Relations</div>
            </div>
            <div class="standing-item">
              <div class="standing-value">${relationshipStatus.negative}</div>
              <div class="standing-label">Tense Relations</div>
            </div>
          </div>
        </div>

        <div class="global-panel">
          <h3>💰 Economic Relations</h3>
          <div class="economic-overview">
            <div class="economic-metric">
              <span class="metric-label">Total Trade Volume</span>
              <span class="metric-value">$${this.calculateTotalTrade()}B</span>
            </div>
            <div class="economic-metric">
              <span class="metric-label">Trade Balance</span>
              <span class="metric-value ${tradeBalance >= 0 ? 'positive' : 'negative'}">
                ${tradeBalance >= 0 ? '+' : ''}$${tradeBalance.toFixed(1)}B
              </span>
            </div>
            <div class="economic-metric">
              <span class="metric-label">Active Agreements</span>
              <span class="metric-value">${this.tradeAgreements.length}</span>
            </div>
          </div>
        </div>

        <div class="global-panel">
          <h3>🎯 Priority Actions</h3>
          <div class="priority-actions">
            ${this.renderPriorityActions()}
          </div>
        </div>

        <div class="global-panel">
          <h3>📈 Recent Developments</h3>
          <div class="recent-developments">
            ${this.renderRecentDevelopments()}
          </div>
        </div>
      </div>
    `;
  }

  renderDiplomacyTab() {
    return `
      <div class="diplomacy-section">
        <div class="countries-list">
          ${this.diplomaticRelations.map((country) => this.renderCountryCard(country)).join('')}
        </div>
      </div>
    `;
  }

  renderCountryCard(country) {
    const relationClass = this.getRelationClass(country.relation);

    return `
      <div class="country-card" onclick="showDiplomaticOptions('${country.country}')">
        <div class="country-header">
          <div class="country-info">
            <span class="country-flag">${country.flag}</span>
            <div>
              <div class="country-name">${country.country}</div>
              <div class="country-status">${country.status}</div>
            </div>
          </div>
          <div class="relation-score ${relationClass}">${country.relation}</div>
        </div>

        <div class="country-details">
          <div class="detail-item">
            <span class="detail-value">$${(country.tradeVolume / 1000000000).toFixed(1)}B</span>
            <span class="detail-label">Trade Volume</span>
          </div>
          <div class="detail-item">
            <span class="detail-value">${country.lastInteraction}</span>
            <span class="detail-label">Last Interaction</span>
          </div>
        </div>

        <div class="country-interests">
          ${country.interests.map((interest) => `<span class="interest-tag">${interest}</span>`).join('')}
        </div>

        <div class="country-actions">
          <div class="diplomatic-action" onclick="event.stopPropagation(); initiateDiplomacy('${country.country}', 'summit')">
            🤝 Summit
          </div>
          <div class="diplomatic-action" onclick="event.stopPropagation(); initiateDiplomacy('${country.country}', 'trade')">
            📊 Trade Deal
          </div>
          <div class="diplomatic-action" onclick="event.stopPropagation(); initiateDiplomacy('${country.country}', 'cooperation')">
            🌟 Cooperation
          </div>
        </div>
      </div>
    `;
  }

  renderTradeTab() {
    return `
      <div class="trade-section">
        <div class="trade-overview">
          <div class="global-panel">
            <h3>📊 Trade Overview</h3>
            <div class="trade-stats">
              <div class="trade-stat">
                <span class="stat-value">$${this.calculateTotalTrade()}B</span>
                <span class="stat-label">Total Trade Volume</span>
              </div>
              <div class="trade-stat">
                <span class="stat-value">${this.tradeAgreements.length}</span>
                <span class="stat-label">Active Agreements</span>
              </div>
              <div class="trade-stat">
                <span class="stat-value">${this.calculateTradePartners()}</span>
                <span class="stat-label">Trading Partners</span>
              </div>
            </div>
          </div>
        </div>

        <div class="trade-agreements">
          <h3>📋 Trade Agreements</h3>
          ${this.tradeAgreements.length > 0
    ? this.tradeAgreements.map((agreement) => this.renderTradeAgreement(agreement)).join('')
    : (
      '<div class="empty-state">'
      + '<div class="empty-state-icon">📋</div>'
      + '<h3>No Trade Agreements</h3>'
      + '<p>No active trade agreements. Consider negotiating new deals to boost economic growth.</p>'
      + '</div>'
    )
}
        </div>

        <div class="trade-opportunities">
          <h3>🌟 Trade Opportunities</h3>
          ${this.renderTradeOpportunities()}
        </div>
      </div>
    `;
  }

  renderTradeAgreement(agreement) {
    return `
      <div class="trade-agreement">
        <div class="agreement-header">
          <div class="agreement-title">${agreement.name}</div>
          <div class="agreement-status status-${agreement.status}">${agreement.status}</div>
        </div>
        <div class="agreement-details">
          <p>Partners: ${agreement.partners.join(', ')}</p>
          <p>Value: $${agreement.value}B annually</p>
          <p>Expires: ${agreement.expiry}</p>
        </div>
      </div>
    `;
  }

  renderEventsTab() {
    if (this.internationalEvents.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">🌍</div>
          <h3>No International Events</h3>
          <p>The global situation is currently stable. Keep monitoring for developments.</p>
        </div>
      `;
    }

    return `
      <div class="events-list">
        ${this.internationalEvents.map((event) => this.renderInternationalEvent(event)).join('')}
      </div>
    `;
  }

  renderIntelligenceTab() {
    return `
      <div class="intelligence-section">
        <div class="global-grid">
          <div class="global-panel">
            <h3>🔍 Intelligence Overview</h3>
            <div class="intelligence-metrics">
              <div class="intel-metric">
                <span class="metric-value">Classified</span>
                <span class="metric-label">Security Level</span>
              </div>
              <div class="intel-metric">
                <span class="metric-value">12</span>
                <span class="metric-label">Active Operations</span>
              </div>
              <div class="intel-metric">
                <span class="metric-value">High</span>
                <span class="metric-label">Threat Level</span>
              </div>
            </div>
          </div>

          <div class="global-panel">
            <h3>🎯 Priority Threats</h3>
            <div class="threat-list">
              <div class="threat-item threat-high">
                <div class="threat-title">Cyber Security Concerns</div>
                <div class="threat-description">Increased cyber activity from state actors</div>
              </div>
              <div class="threat-item threat-medium">
                <div class="threat-title">Trade Tensions</div>
                <div class="threat-description">Potential escalation in trade disputes</div>
              </div>
              <div class="threat-item threat-low">
                <div class="threat-title">Regional Instability</div>
                <div class="threat-description">Monitoring situation in key regions</div>
              </div>
            </div>
          </div>

          <div class="global-panel">
            <h3>📡 Intelligence Assets</h3>
            <div class="asset-list">
              <div class="asset-item">
                <span class="asset-name">Diplomatic Network</span>
                <span class="asset-status asset-active">Active</span>
              </div>
              <div class="asset-item">
                <span class="asset-name">Economic Intelligence</span>
                <span class="asset-status asset-active">Active</span>
              </div>
              <div class="asset-item">
                <span class="asset-name">Security Monitoring</span>
                <span class="asset-status asset-limited">Limited</span>
              </div>
            </div>
          </div>

          <div class="global-panel">
            <h3>⚡ Recent Intelligence</h3>
            <div class="recent-intel">
              <div class="intel-item">
                <div class="intel-title">Economic Data Gathering</div>
                <div class="intel-summary">Key economic indicators collected from major partners</div>
                <div class="intel-time">2 hours ago</div>
              </div>
              <div class="intel-item">
                <div class="intel-title">Diplomatic Communication</div>
                <div class="intel-summary">Intercepted communications regarding trade negotiations</div>
                <div class="intel-time">6 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Helper methods
  calculateDiplomaticScore() {
    const totalRelations = this.diplomaticRelations.reduce((sum, country) => sum + country.relation, 0);
    return Math.round(totalRelations / this.diplomaticRelations.length);
  }

  calculateTotalTrade() {
    const totalTrade = this.diplomaticRelations.reduce((sum, country) => sum + country.tradeVolume, 0);
    return Math.round(totalTrade / 1000000000); // Convert to billions
  }

  calculateRelationshipStatus() {
    const positive = this.diplomaticRelations.filter((c) => c.relation >= 70).length;
    const neutral = this.diplomaticRelations.filter((c) => c.relation >= 40 && c.relation < 70).length;
    const negative = this.diplomaticRelations.filter((c) => c.relation < 40).length;

    return { positive, neutral, negative };
  }

  calculateTradeBalance() {
    // Simplified trade balance calculation
    const totalTrade = this.calculateTotalTrade();
    return (Math.random() - 0.4) * totalTrade; // Random but somewhat realistic balance
  }

  calculateTradePartners() {
    return this.diplomaticRelations.filter((c) => c.tradeVolume > 5000000000).length;
  }

  getRelationClass(relation) {
    if (relation >= 80) return 'relation-excellent';
    if (relation >= 60) return 'relation-good';
    if (relation >= 40) return 'relation-neutral';
    return 'relation-poor';
  }

  renderPriorityActions() {
    const actions = [
      'Strengthen trade ties with major partners',
      'Address diplomatic tensions in key regions',
      'Negotiate new cooperation agreements',
      'Review and update existing treaties',
    ];

    return actions.map((action) => `
      <div class="priority-action">
        <span class="action-icon">⭐</span>
        <span class="action-text">${action}</span>
      </div>
    `).join('');
  }

  renderRecentDevelopments() {
    const developments = [
      { text: 'Successful climate summit with EU partners', type: 'positive' },
      { text: 'Trade tensions with major partner escalating', type: 'negative' },
      { text: 'New technology cooperation agreement signed', type: 'positive' },
      { text: 'Border dispute requires diplomatic attention', type: 'neutral' },
    ];

    return developments.map((dev) => `
      <div class="development-item development-${dev.type}">
        <div class="development-text">${dev.text}</div>
      </div>
    `).join('');
  }

  renderTradeOpportunities() {
    const opportunities = [
      { country: 'India', sector: 'Technology', potential: 'High' },
      { country: 'Brazil', sector: 'Agriculture', potential: 'Medium' },
      { country: 'South Korea', sector: 'Manufacturing', potential: 'High' },
    ];

    return opportunities.map((opp) => `
      <div class="trade-opportunity">
        <div class="opportunity-header">
          <span class="opportunity-country">${opp.country}</span>
          <span class="opportunity-potential potential-${opp.potential.toLowerCase()}">${opp.potential}</span>
        </div>
        <div class="opportunity-sector">Sector: ${opp.sector}</div>
        <button class="btn btn--primary btn--sm" onclick="initiateTradeNegotiation('${opp.country}', '${opp.sector}')">
          Start Negotiations
        </button>
      </div>
    `).join('');
  }

  renderInternationalEvent(event) {
    return `
      <div class="international-event event-${event.severity}">
        <div class="event-header">
          <div class="event-title">${event.title}</div>
          <div class="event-severity">${event.severity}</div>
        </div>
        <div class="event-description">${event.description}</div>
        <div class="event-actions">
          <button class="btn btn--primary" onclick="respondToEvent('${event.id}')">
            Respond
          </button>
          <button class="btn btn--secondary" onclick="monitorEvent('${event.id}')">
            Monitor
          </button>
        </div>
      </div>
    `;
  }

  setupInteractivity() {
    const container = document.querySelector('.global-screen');
    if (!container) return;

    // Tab switching
    container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Set up global functions for diplomatic actions
    window.showDiplomaticOptions = (country) => {
      this.showDiplomaticOptionsModal(country);
    };

    window.initiateDiplomacy = (country, action) => {
      this.initiateDiplomaticAction(country, action);
    };

    window.initiateTradeNegotiation = (country, sector) => {
      this.initiateTradeNegotiation(country, sector);
    };

    window.respondToEvent = (eventId) => {
      this.respondToInternationalEvent(eventId);
    };

    window.monitorEvent = (eventId) => {
      this.monitorInternationalEvent(eventId);
    };
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    this.refresh();
  }

  showDiplomaticOptionsModal(countryName) {
    const country = this.diplomaticRelations.find((c) => c.country === countryName);
    if (!country) return;

    const modal = new Modal({
      title: `${country.flag} Diplomatic Relations with ${country.country}`,
      content: `
        <div class="diplomatic-modal">
          <div class="country-overview">
            <h4>Current Status</h4>
            <div class="status-grid">
              <div class="status-item">
                <span class="status-label">Relationship Score</span>
                <span class="status-value">${country.relation}/100</span>
              </div>
              <div class="status-item">
                <span class="status-label">Trade Volume</span>
                <span class="status-value">$${(country.tradeVolume / 1000000000).toFixed(1)}B</span>
              </div>
              <div class="status-item">
                <span class="status-label">Status</span>
                <span class="status-value">${country.status}</span>
              </div>
            </div>
          </div>

          <div class="diplomatic-actions">
            <h4>Available Actions</h4>
            <div class="action-grid">
              <button class="diplomatic-option" data-action="summit">
                <div class="option-icon">🤝</div>
                <div class="option-name">Diplomatic Summit</div>
                <div class="option-description">Improve relations through high-level talks</div>
              </button>
              <button class="diplomatic-option" data-action="trade">
                <div class="option-icon">📊</div>
                <div class="option-name">Trade Agreement</div>
                <div class="option-description">Negotiate new trade terms</div>
              </button>
              <button class="diplomatic-option" data-action="cooperation">
                <div class="option-icon">🌟</div>
                <div class="option-name">Cooperation Pact</div>
                <div class="option-description">Establish joint cooperation framework</div>
              </button>
              <button class="diplomatic-option" data-action="sanctions">
                <div class="option-icon">⚠️</div>
                <div class="option-name">Economic Sanctions</div>
                <div class="option-description">Apply economic pressure</div>
              </button>
            </div>
          </div>
        </div>
      `,
      confirmText: 'Execute Action',
      onConfirm: () => {
        const selectedOption = document.querySelector('.diplomatic-option.selected');
        if (selectedOption) {
          const action = selectedOption.getAttribute('data-action');
          this.executeDiplomaticAction(countryName, action);
          return true;
        }
        return false;
      },
    });

    modal.show();

    // Add selection functionality
    setTimeout(() => {
      const options = document.querySelectorAll('.diplomatic-option');
      options.forEach((option) => {
        option.addEventListener('click', () => {
          options.forEach((opt) => opt.classList.remove('selected'));
          option.classList.add('selected');
        });
      });
    }, 100);
  }

  executeDiplomaticAction(countryName, action) {
    const country = this.diplomaticRelations.find((c) => c.country === countryName);
    if (!country) return;

    // Simulate diplomatic action effects
    const effects = {
      summit: { relation: 5, description: 'Diplomatic summit strengthened relations' },
      trade: { relation: 3, tradeVolume: 2000000000, description: 'Trade agreement increased cooperation' },
      cooperation: { relation: 7, description: 'Cooperation pact established mutual trust' },
      sanctions: { relation: -15, tradeVolume: -5000000000, description: 'Economic sanctions damaged relations' },
    };

    const effect = effects[action];
    if (effect) {
      country.relation = Math.max(0, Math.min(100, country.relation + effect.relation));
      if (effect.tradeVolume) {
        country.tradeVolume = Math.max(0, country.tradeVolume + effect.tradeVolume);
      }
      country.lastInteraction = effect.description;

      // Emit diplomatic event
      eventSystem.emit('diplomacy:action_taken', {
        country: countryName,
        action,
        effects: effect,
        gameState: this.gameState,
      });

      this.refresh();
      this.showNotification(`Diplomatic action executed: ${effect.description}`, 'success');
    }
  }

  initiateDiplomaticAction(country, action) {
    // Simplified diplomatic action
    this.showNotification(`Initiating ${action} with ${country}`, 'info');
  }

  initiateTradeNegotiation(country, sector) {
    this.showNotification(`Starting trade negotiations with ${country} in ${sector}`, 'info');
  }

  respondToInternationalEvent(eventId) {
    this.showNotification(`Responding to international event: ${eventId}`, 'info');
  }

  monitorInternationalEvent(eventId) {
    this.showNotification(`Monitoring international event: ${eventId}`, 'info');
  }

  showNotification(message, type = 'info') {
    if (window.spSimApp) {
      window.spSimApp.showNotification(message, type);
    }
  }

  handleInternationalEvent(data) {
    this.internationalEvents.push(data.event);
    this.refresh();
  }

  updateDiplomaticRelation(data) {
    const country = this.diplomaticRelations.find((c) => c.country === data.country);
    if (country) {
      country.relation = Math.max(0, Math.min(100, country.relation + data.change));
      this.refresh();
    }
  }

  handleTradeAgreement(data) {
    this.tradeAgreements.push(data.agreement);
    this.refresh();
  }

  update(gameState) {
    this.gameState = gameState;
    this.refresh();
  }

  refresh() {
    const container = document.querySelector('#screen-global .global-screen');
    if (container) {
      container.innerHTML = this.render().replace(/<div class="global-screen">|<\/div>$/g, '');
      this.setupInteractivity();
    }
  }

  show() {
    const globalScreen = document.querySelector('#screen-global');
    if (globalScreen && !globalScreen.querySelector('.global-screen')) {
      globalScreen.innerHTML = this.render();
      this.setupInteractivity();
    }
    return this.element;
  }
}

export default GlobalRelationsScreen;
