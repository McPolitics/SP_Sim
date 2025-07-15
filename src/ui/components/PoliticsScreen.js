import { BaseComponent } from './BaseComponent';
import { eventSystem } from '../../core/EventSystem';
import { politicalEvents } from '../../core/PoliticalEvents';

/**
 * PoliticsScreen - Comprehensive political management interface
 * Shows political status, coalition management, voting, and political events
 */
export class PoliticsScreen extends BaseComponent {
  constructor() {
    super();
    this.currentTab = 'overview';
    this.activeEvents = [];
    this.politicalStatus = null;
    this.initializeScreen();
  }

  initializeScreen() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for political events
    eventSystem.on('political:event_triggered', (event) => {
      this.handlePoliticalEvent(event);
    });

    eventSystem.on('political:vote_scheduled', (event) => {
      this.handleVoteScheduled(event);
    });
  }

  handlePoliticalEvent(_event) {
    this.activeEvents.push(_event.data.event);
    if (this.currentTab === 'events') {
      this.renderEventsTab();
    }
  }

  handleVoteScheduled(_event) {
    if (this.currentTab === 'votes') {
      this.renderVotesTab();
    }
  }

  render() {
    return `
      <div class="politics-screen">
        <!-- Header -->
        <div class="politics-header">
          <div class="header-content">
            <h1>🏛️ Political Management</h1>
            <p>Manage your coalition, respond to political events, and maintain political stability</p>
          </div>
          <div class="political-summary">
            <div class="summary-metric">
              <span class="metric-label">Current Approval</span>
              <span class="metric-value" id="pol-approval">--</span>
            </div>
            <div class="summary-metric">
              <span class="metric-label">Coalition Stability</span>
              <span class="metric-value" id="pol-stability">--</span>
            </div>
            <div class="summary-metric">
              <span class="metric-label">Political Pressure</span>
              <span class="metric-value" id="pol-pressure">--</span>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="politics-tabs">
          <button class="tab-btn active" data-tab="overview">
            <span class="tab-icon">📊</span>
            <span class="tab-text">Overview</span>
          </button>
          <button class="tab-btn" data-tab="coalition">
            <span class="tab-icon">🤝</span>
            <span class="tab-text">Coalition</span>
          </button>
          <button class="tab-btn" data-tab="opposition">
            <span class="tab-icon">⚔️</span>
            <span class="tab-text">Opposition</span>
          </button>
          <button class="tab-btn" data-tab="events">
            <span class="tab-icon">⚡</span>
            <span class="tab-text">Events</span>
            <span class="tab-badge" id="events-badge">0</span>
          </button>
          <button class="tab-btn" data-tab="votes">
            <span class="tab-icon">🗳️</span>
            <span class="tab-text">Votes</span>
          </button>
          <button class="tab-btn" data-tab="elections">
            <span class="tab-icon">🏆</span>
            <span class="tab-text">Elections</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="politics-content">
          <!-- Overview Tab -->
          <div class="tab-content active" id="tab-overview">
            ${this.renderOverviewTab()}
          </div>

          <!-- Coalition Tab -->
          <div class="tab-content" id="tab-coalition">
            ${this.renderCoalitionTab()}
          </div>

          <!-- Opposition Tab -->
          <div class="tab-content" id="tab-opposition">
            ${this.renderOppositionTab()}
          </div>

          <!-- Events Tab -->
          <div class="tab-content" id="tab-events">
            ${this.renderEventsTab()}
          </div>

          <!-- Votes Tab -->
          <div class="tab-content" id="tab-votes">
            ${this.renderVotesTab()}
          </div>

          <!-- Elections Tab -->
          <div class="tab-content" id="tab-elections">
            ${this.renderElectionsTab()}
          </div>
        </div>
      </div>
      
      <!-- Politics Screen Styles -->
      <style>
        .politics-screen {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-lg);
        }

        .politics-header {
          background: linear-gradient(135deg, var(--surface-color) 0%, var(--background-alt) 100%);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-lg);
          box-shadow: var(--shadow-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid var(--border-color);
        }

        .header-content h1 {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--primary-color);
          font-size: 2rem;
          font-weight: 700;
        }

        .header-content p {
          margin: 0;
          color: var(--text-light);
          font-size: 1rem;
          line-height: 1.5;
        }

        .political-summary {
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
          color: var(--text-light);
          margin-bottom: var(--spacing-xs);
          font-weight: 500;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--secondary-color);
        }

        .politics-tabs {
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

        .politics-content {
          background: var(--surface-color);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          min-height: 500px;
        }

        .tab-content {
          display: none;
          padding: var(--spacing-xl);
          animation: fadeInUp 0.3s ease-out;
        }

        .tab-content.active {
          display: block;
        }

        .politics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .politics-panel {
          background: var(--background-alt);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
        }

        .politics-panel h3 {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--primary-color);
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .party-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .party-item {
          background: var(--surface-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          border: 1px solid var(--border-color);
          transition: all var(--transition-base);
        }

        .party-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .party-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .party-name {
          font-weight: 600;
          color: var(--text-color);
          font-size: 1rem;
        }

        .party-support {
          font-weight: 700;
          color: var(--secondary-color);
        }

        .party-description {
          color: var(--text-light);
          font-size: 0.875rem;
          line-height: 1.4;
          margin-bottom: var(--spacing-sm);
        }

        .support-bar {
          width: 100%;
          height: 8px;
          background: var(--border-light);
          border-radius: var(--border-radius);
          overflow: hidden;
          margin-bottom: var(--spacing-sm);
        }

        .support-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--secondary-color), var(--secondary-light));
          border-radius: var(--border-radius);
          transition: width 0.8s ease-out;
        }

        .party-status {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .status-tag {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .status-stable {
          background: var(--success-color);
          color: white;
        }

        .status-unstable {
          background: var(--warning-color);
          color: white;
        }

        .status-hostile {
          background: var(--accent-color);
          color: white;
        }

        .status-loyal {
          background: var(--info-color);
          color: white;
        }

        .event-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .event-item {
          background: var(--surface-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
          transition: all var(--transition-base);
          cursor: pointer;
        }

        .event-item:hover {
          border-color: var(--secondary-color);
          box-shadow: var(--shadow-sm);
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-md);
        }

        .event-title {
          font-weight: 600;
          color: var(--text-color);
          font-size: 1.1rem;
          margin-bottom: var(--spacing-xs);
        }

        .event-type {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .event-policy_vote {
          background: var(--info-color);
          color: white;
        }

        .event-coalition_crisis {
          background: var(--warning-color);
          color: white;
        }

        .event-political_crisis {
          background: var(--accent-color);
          color: white;
        }

        .event-description {
          color: var(--text-light);
          line-height: 1.5;
          margin-bottom: var(--spacing-md);
        }

        .event-options {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .event-option {
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          background: var(--background-alt);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: left;
        }

        .event-option:hover {
          background: var(--secondary-color);
          color: white;
          border-color: var(--secondary-color);
        }

        .option-title {
          font-weight: 500;
          margin-bottom: var(--spacing-xs);
        }

        .option-description {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .election-info {
          background: var(--background-alt);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
          border: 1px solid var(--border-color);
        }

        .election-countdown {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .countdown-number {
          font-size: 3rem;
          font-weight: 700;
          color: var(--secondary-color);
          display: block;
        }

        .countdown-label {
          color: var(--text-light);
          font-size: 1rem;
          margin-top: var(--spacing-sm);
        }

        .approval-trends {
          margin-bottom: var(--spacing-lg);
        }

        .trends-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-md);
        }

        .trend-item {
          text-align: center;
          padding: var(--spacing-md);
          background: var(--surface-color);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }

        .trend-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: var(--spacing-xs);
        }

        .trend-positive {
          color: var(--success-color);
        }

        .trend-negative {
          color: var(--accent-color);
        }

        .trend-neutral {
          color: var(--warning-color);
        }

        .trend-label {
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-light);
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
          opacity: 0.5;
        }

        .empty-state h3 {
          margin-bottom: var(--spacing-sm);
          color: var(--text-color);
        }

        @media (max-width: 768px) {
          .politics-header {
            flex-direction: column;
            gap: var(--spacing-lg);
            text-align: center;
          }

          .political-summary {
            flex-direction: column;
            gap: var(--spacing-md);
            width: 100%;
          }

          .politics-tabs {
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

          .politics-grid {
            grid-template-columns: 1fr;
          }

          .tab-content {
            padding: var(--spacing-md);
          }

          .trends-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    `;
  }

  renderOverviewTab() {
    return `
      <div class="politics-grid">
        <div class="politics-panel">
          <h3>📊 Political Overview</h3>
          <div class="approval-trends">
            <div class="trends-grid">
              <div class="trend-item">
                <div class="trend-value trend-positive" id="approval-trend">+2.3%</div>
                <div class="trend-label">This Week</div>
              </div>
              <div class="trend-item">
                <div class="trend-value trend-positive" id="approval-month">+5.1%</div>
                <div class="trend-label">This Month</div>
              </div>
              <div class="trend-item">
                <div class="trend-value trend-neutral" id="approval-year">-1.2%</div>
                <div class="trend-label">This Year</div>
              </div>
            </div>
          </div>
          <div class="politics-stats">
            <div class="stat-item">
              <span class="stat-label">Coalition Seats:</span>
              <span class="stat-value" id="coalition-seats">156/300</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Opposition Seats:</span>
              <span class="stat-value" id="opposition-seats">144/300</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Majority Needed:</span>
              <span class="stat-value">151</span>
            </div>
          </div>
        </div>

        <div class="politics-panel">
          <h3>⚡ Recent Political Events</h3>
          <div class="recent-events" id="recent-political-events">
            <div class="empty-state">
              <div class="empty-state-icon">📰</div>
              <h4>No Recent Events</h4>
              <p>Political events will appear here as they occur</p>
            </div>
          </div>
        </div>

        <div class="politics-panel">
          <h3>🎯 Key Challenges</h3>
          <div class="challenges-list" id="political-challenges">
            <div class="challenge-item">
              <h4>Coalition Stability</h4>
              <p>Maintain support from coalition partners while advancing your agenda</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 75%"></div>
              </div>
            </div>
            <div class="challenge-item">
              <h4>Opposition Relations</h4>
              <p>Navigate opposition challenges and find areas for bipartisan cooperation</p>
              <div class="progress-bar">
                <div class="progress-fill" style="width: 45%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="politics-panel">
          <h3>📅 Upcoming Milestones</h3>
          <div class="milestones-list" id="political-milestones">
            <div class="milestone-item">
              <div class="milestone-date">Week 12</div>
              <div class="milestone-text">Budget Vote in Parliament</div>
            </div>
            <div class="milestone-item">
              <div class="milestone-date">Week 18</div>
              <div class="milestone-text">Coalition Review Meeting</div>
            </div>
            <div class="milestone-item">
              <div class="milestone-date">Next Year</div>
              <div class="milestone-text">General Election</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCoalitionTab() {
    return `
      <div class="politics-grid">
        <div class="politics-panel">
          <h3>🤝 Coalition Partners</h3>
          <div class="party-list" id="coalition-parties">
            <div class="party-item">
              <div class="party-header">
                <div class="party-name">Progressive Alliance</div>
                <div class="party-support">78%</div>
              </div>
              <div class="party-description">
                Your main coalition partner, focused on social and economic reforms
              </div>
              <div class="support-bar">
                <div class="support-fill" style="width: 78%"></div>
              </div>
              <div class="party-status">
                <span class="status-tag status-stable">Stable</span>
                <span class="status-tag status-loyal">Loyal</span>
              </div>
            </div>
            
            <div class="party-item">
              <div class="party-header">
                <div class="party-name">Center Coalition</div>
                <div class="party-support">65%</div>
              </div>
              <div class="party-description">
                Moderate centrist party that provides crucial swing votes
              </div>
              <div class="support-bar">
                <div class="support-fill" style="width: 65%"></div>
              </div>
              <div class="party-status">
                <span class="status-tag status-unstable">Wavering</span>
              </div>
            </div>
          </div>
        </div>

        <div class="politics-panel">
          <h3>📋 Coalition Management</h3>
          <div class="management-options">
            <button class="btn btn--secondary" onclick="handleCoalitionAction('meeting')">
              📅 Schedule Coalition Meeting
            </button>
            <button class="btn btn--secondary" onclick="handleCoalitionAction('concessions')">
              🤝 Offer Policy Concessions
            </button>
            <button class="btn btn--secondary" onclick="handleCoalitionAction('reshuffle')">
              🔄 Cabinet Reshuffle
            </button>
            <button class="btn btn--secondary" onclick="handleCoalitionAction('negotiate')">
              💬 Private Negotiations
            </button>
          </div>
          
          <div class="coalition-health">
            <h4>Coalition Health Indicators</h4>
            <div class="health-metrics">
              <div class="health-item">
                <span>Unity Score:</span>
                <span class="health-value health-good">87%</span>
              </div>
              <div class="health-item">
                <span>Trust Level:</span>
                <span class="health-value health-warning">72%</span>
              </div>
              <div class="health-item">
                <span>Policy Alignment:</span>
                <span class="health-value health-good">81%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderOppositionTab() {
    return `
      <div class="politics-grid">
        <div class="politics-panel">
          <h3>⚔️ Opposition Parties</h3>
          <div class="party-list" id="opposition-parties">
            <div class="party-item">
              <div class="party-header">
                <div class="party-name">Conservative Opposition</div>
                <div class="party-support">82%</div>
              </div>
              <div class="party-description">
                The main opposition party, strongly critical of your policies
              </div>
              <div class="support-bar">
                <div class="support-fill" style="width: 82%"></div>
              </div>
              <div class="party-status">
                <span class="status-tag status-hostile">Hostile</span>
                <span class="status-tag status-stable">Unified</span>
              </div>
            </div>
            
            <div class="party-item">
              <div class="party-header">
                <div class="party-name">Independent Block</div>
                <div class="party-support">45%</div>
              </div>
              <div class="party-description">
                Small independent parties that occasionally support government initiatives
              </div>
              <div class="support-bar">
                <div class="support-fill" style="width: 45%"></div>
              </div>
              <div class="party-status">
                <span class="status-tag status-unstable">Unpredictable</span>
              </div>
            </div>
          </div>
        </div>

        <div class="politics-panel">
          <h3>🎯 Opposition Strategy</h3>
          <div class="strategy-options">
            <button class="btn btn--secondary" onclick="handleOppositionAction('dialogue')">
              💬 Open Dialogue
            </button>
            <button class="btn btn--secondary" onclick="handleOppositionAction('compromise')">
              🤝 Seek Compromise
            </button>
            <button class="btn btn--secondary" onclick="handleOppositionAction('counter')">
              ⚡ Counter Opposition
            </button>
            <button class="btn btn--secondary" onclick="handleOppositionAction('ignore')">
              🚫 Ignore Criticism
            </button>
          </div>
          
          <div class="opposition-threats">
            <h4>Current Opposition Actions</h4>
            <div class="threat-list">
              <div class="threat-item threat-medium">
                <strong>No Confidence Motion Threatened</strong>
                <p>Opposition may call for no confidence vote if budget fails</p>
              </div>
              <div class="threat-item threat-low">
                <strong>Media Campaign</strong>
                <p>Ongoing criticism in press about economic policies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderEventsTab() {
    if (this.activeEvents.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">⚡</div>
          <h3>No Active Political Events</h3>
          <p>Political events and decisions will appear here when they arise</p>
        </div>
      `;
    }

    return `
      <div class="event-list">
        ${this.activeEvents.map((event) => `
          <div class="event-item" data-event-id="${event.id}">
            <div class="event-header">
              <div>
                <div class="event-title">${event.title}</div>
                <span class="event-type event-${event.type}">${event.type.replace('_', ' ')}</span>
              </div>
              <div class="event-deadline">
                Deadline: Week ${event.deadline.week}
              </div>
            </div>
            <div class="event-description">${event.description}</div>
            <div class="event-options">
              ${event.options.map((option) => `
                <button class="event-option" onclick="handleEventResponse('${event.id}', '${option.id}')">
                  <div class="option-title">${option.text}</div>
                  <div class="option-description">${option.description}</div>
                </button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderVotesTab() {
    return `
      <div class="politics-grid">
        <div class="politics-panel">
          <h3>🗳️ Upcoming Votes</h3>
          <div class="vote-list" id="upcoming-votes">
            <div class="empty-state">
              <div class="empty-state-icon">🗳️</div>
              <h4>No Scheduled Votes</h4>
              <p>Parliamentary votes will be scheduled here</p>
            </div>
          </div>
        </div>

        <div class="politics-panel">
          <h3>📊 Voting History</h3>
          <div class="vote-history" id="vote-history">
            <div class="vote-record">
              <div class="vote-title">Healthcare Reform Act</div>
              <div class="vote-result vote-passed">Passed</div>
              <div class="vote-details">156-144 (Coalition Unity: 94%)</div>
            </div>
            <div class="vote-record">
              <div class="vote-title">Tax Amendment Bill</div>
              <div class="vote-result vote-failed">Failed</div>
              <div class="vote-details">148-152 (Coalition Unity: 78%)</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderElectionsTab() {
    return `
      <div class="politics-grid">
        <div class="politics-panel">
          <h3>🏆 Next Election</h3>
          <div class="election-info">
            <div class="election-countdown">
              <span class="countdown-number" id="election-weeks">47</span>
              <div class="countdown-label">weeks until election</div>
            </div>
            <div class="election-details">
              <h4>Election Forecast</h4>
              <div class="forecast-grid">
                <div class="forecast-item">
                  <span class="forecast-label">Current Projection:</span>
                  <span class="forecast-value forecast-positive">52% - Victory</span>
                </div>
                <div class="forecast-item">
                  <span class="forecast-label">Coalition Seats:</span>
                  <span class="forecast-value">158-162</span>
                </div>
                <div class="forecast-item">
                  <span class="forecast-label">Margin of Error:</span>
                  <span class="forecast-value">±4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="politics-panel">
          <h3>📈 Electoral Strategy</h3>
          <div class="strategy-recommendations">
            <div class="recommendation-item">
              <h4>🎯 Focus on Economy</h4>
              <p>Economic performance is the top voter concern. Continue growth policies.</p>
              <div class="rec-priority">High Priority</div>
            </div>
            <div class="recommendation-item">
              <h4>🤝 Strengthen Coalition</h4>
              <p>Unity within coalition will be crucial for electoral success.</p>
              <div class="rec-priority">Medium Priority</div>
            </div>
            <div class="recommendation-item">
              <h4>📢 Public Communication</h4>
              <p>Improve public communication of policy successes.</p>
              <div class="rec-priority">Medium Priority</div>
            </div>
          </div>
        </div>

        <div class="politics-panel">
          <h3>📊 Swing Factors</h3>
          <div class="swing-factors">
            <div class="factor-item">
              <div class="factor-name">Economic Growth</div>
              <div class="factor-impact factor-positive">+3.2%</div>
            </div>
            <div class="factor-name">Coalition Stability</div>
              <div class="factor-impact factor-positive">+1.8%</div>
            </div>
            <div class="factor-item">
              <div class="factor-name">International Relations</div>
              <div class="factor-impact factor-neutral">±0.5%</div>
            </div>
            <div class="factor-item">
              <div class="factor-name">Crisis Management</div>
              <div class="factor-impact factor-unknown">TBD</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupInteractivity() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.politics-screen .tab-btn');
    const tabContents = document.querySelectorAll('.politics-screen .tab-content');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');

        // Update tab buttons
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Update tab content
        tabContents.forEach((content) => content.classList.remove('active'));
        const targetContent = document.getElementById(`tab-${tabId}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }

        this.currentTab = tabId;
      });
    });

    // Make global functions available for button clicks
    window.handleEventResponse = (eventId, optionId) => {
      this.handleEventResponse(eventId, optionId);
    };

    window.handleCoalitionAction = (action) => {
      this.handleCoalitionAction(action);
    };

    window.handleOppositionAction = (action) => {
      this.handleOppositionAction(action);
    };
  }

  handleEventResponse(eventId, optionId) {
    // Find and remove the event from active events
    const eventIndex = this.activeEvents.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      const event = this.activeEvents[eventIndex];
      this.activeEvents.splice(eventIndex, 1);

      // Emit event response
      eventSystem.emit('political:event_response', {
        eventId,
        optionId,
        gameState: this.gameState,
      });

      // Update UI
      this.updateEventsTab();
      this.showNotification(`Political event resolved: ${event.title}`, 'success');
    }
  }

  handleCoalitionAction(action) {
    const actions = {
      meeting: 'Scheduled coalition meeting for next week',
      concessions: 'Offered policy concessions to coalition partners',
      reshuffle: 'Initiated cabinet reshuffle discussions',
      negotiate: 'Began private negotiations with coalition leaders',
    };

    this.showNotification(actions[action] || 'Coalition action taken', 'info');
  }

  handleOppositionAction(action) {
    const actions = {
      dialogue: 'Opened dialogue with opposition leaders',
      compromise: 'Proposed compromise on contentious issues',
      counter: 'Launched counter-campaign against opposition',
      ignore: 'Decided to ignore opposition criticism',
    };

    this.showNotification(actions[action] || 'Opposition strategy implemented', 'info');
  }

  updateEventsTab() {
    const eventsTab = document.getElementById('tab-events');
    if (eventsTab) {
      eventsTab.innerHTML = this.renderEventsTab();
    }

    // Update events badge
    const eventsBadge = document.getElementById('events-badge');
    if (eventsBadge) {
      eventsBadge.textContent = this.activeEvents.length;
      eventsBadge.style.display = this.activeEvents.length > 0 ? 'flex' : 'none';
    }
  }

  update(gameState) {
    this.gameState = gameState;
    this.politicalStatus = politicalEvents.getPoliticalStatus(gameState);

    // Update header metrics
    this.updateElement('#pol-approval', `${gameState.politics.approval.toFixed(1)}%`);
    this.updateElement('#pol-stability', `${this.politicalStatus.coalitionStability.toFixed(0)}%`);
    this.updateElement('#pol-pressure', `${this.politicalStatus.politicalPressure.toFixed(0)}%`);

    // Update events badge
    const eventsBadge = document.getElementById('events-badge');
    if (eventsBadge) {
      eventsBadge.textContent = this.activeEvents.length;
      eventsBadge.style.display = this.activeEvents.length > 0 ? 'flex' : 'none';
    }
  }

  showNotification(message, type = 'info') {
    // Use the app's notification system
    if (window.spSimApp) {
      window.spSimApp.showNotification(message, type);
    }
  }

  show() {
    const container = document.querySelector('#screen-politics .politics-screen');
    if (!container) {
      const politicsScreen = document.querySelector('#screen-politics');
      if (politicsScreen) {
        politicsScreen.innerHTML = this.render();
        this.setupInteractivity();
      }
    }
    return this.element;
  }
}

export default PoliticsScreen;
