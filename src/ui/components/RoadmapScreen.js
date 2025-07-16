import { BaseComponent } from './BaseComponent';
// import { eventSystem } from '../../core/EventSystem';

/**
 * RoadmapScreen - Development roadmap and feature progress visualization
 * Shows current development status, upcoming features, and project milestones
 */
export class RoadmapScreen extends BaseComponent {
  constructor() {
    super();
    this.currentView = 'overview';
    this.roadmapData = this.initializeRoadmapData();
    this.initializeScreen();
  }

  initializeRoadmapData() {
    return {
      phases: [
        {
          id: 'phase1',
          name: 'Core Foundation',
          status: 'completed',
          progress: 100,
          description: 'Basic game engine and core mechanics',
          features: [
            { name: 'Game Engine Architecture', status: 'completed', priority: 'critical' },
            { name: 'Event System', status: 'completed', priority: 'critical' },
            { name: 'Base Component System', status: 'completed', priority: 'critical' },
            { name: 'Save/Load System', status: 'completed', priority: 'high' },
            { name: 'Time Progression', status: 'completed', priority: 'high' },
          ],
        },
        {
          id: 'phase2',
          name: 'Economic Simulation',
          status: 'completed',
          progress: 95,
          description: 'Economic mechanics and market simulation',
          features: [
            { name: 'GDP & Economic Indicators', status: 'completed', priority: 'critical' },
            { name: 'Market Dynamics', status: 'completed', priority: 'high' },
            { name: 'Budget Management', status: 'completed', priority: 'high' },
            { name: 'Economic Policy Effects', status: 'completed', priority: 'high' },
            { name: 'Advanced Market Modeling', status: 'in-progress', priority: 'medium' },
          ],
        },
        {
          id: 'phase3',
          name: 'Political Systems',
          status: 'completed',
          progress: 90,
          description: 'Political mechanics and opposition AI',
          features: [
            { name: 'Coalition Management', status: 'completed', priority: 'critical' },
            { name: 'Opposition AI System', status: 'completed', priority: 'critical' },
            { name: 'Political Events', status: 'completed', priority: 'high' },
            { name: 'Approval Rating System', status: 'completed', priority: 'high' },
            { name: 'Election Mechanics', status: 'in-progress', priority: 'high' },
          ],
        },
        {
          id: 'phase4',
          name: 'Media & Crisis Management',
          status: 'in-progress',
          progress: 85,
          description: 'Media dynamics and crisis response systems',
          features: [
            { name: 'Media System Core', status: 'completed', priority: 'critical' },
            { name: 'Scandal Generation', status: 'completed', priority: 'high' },
            { name: 'Crisis Management UI', status: 'completed', priority: 'high' },
            { name: 'Media Response Mechanics', status: 'completed', priority: 'high' },
            { name: 'Advanced Crisis Scenarios', status: 'planned', priority: 'medium' },
          ],
        },
        {
          id: 'phase5',
          name: 'Global Relations',
          status: 'in-progress',
          progress: 75,
          description: 'International diplomacy and trade systems',
          features: [
            { name: 'Diplomatic Relations Core', status: 'completed', priority: 'critical' },
            { name: 'Trade Agreement System', status: 'completed', priority: 'high' },
            { name: 'International Events', status: 'in-progress', priority: 'high' },
            { name: 'Intelligence Operations', status: 'planned', priority: 'medium' },
            { name: 'Global Crisis Events', status: 'planned', priority: 'medium' },
          ],
        },
        {
          id: 'phase6',
          name: 'Advanced Analytics',
          status: 'in-progress',
          progress: 60,
          description: 'Player analytics and performance tracking',
          features: [
            { name: 'Player Analytics Core', status: 'completed', priority: 'high' },
            { name: 'Performance Metrics', status: 'completed', priority: 'high' },
            { name: 'Behavioral Analysis', status: 'in-progress', priority: 'medium' },
            { name: 'Predictive Modeling', status: 'planned', priority: 'medium' },
            { name: 'AI-Powered Insights', status: 'planned', priority: 'low' },
          ],
        },
        {
          id: 'phase7',
          name: 'Enhanced UI/UX',
          status: 'in-progress',
          progress: 70,
          description: 'Improved user interface and experience',
          features: [
            { name: 'Modern Component Design', status: 'completed', priority: 'high' },
            { name: 'Responsive Design', status: 'completed', priority: 'high' },
            { name: 'Animation System', status: 'in-progress', priority: 'medium' },
            { name: 'Accessibility Features', status: 'planned', priority: 'medium' },
            { name: 'Mobile Optimization', status: 'planned', priority: 'low' },
          ],
        },
        {
          id: 'phase8',
          name: 'Content & Scenarios',
          status: 'planned',
          progress: 30,
          description: 'Rich content and diverse gameplay scenarios',
          features: [
            { name: 'Scenario Templates', status: 'in-progress', priority: 'high' },
            { name: 'Dynamic Event Generation', status: 'planned', priority: 'high' },
            { name: 'Historical Scenarios', status: 'planned', priority: 'medium' },
            { name: 'Custom Scenario Creator', status: 'planned', priority: 'medium' },
            { name: 'Multiplayer Foundation', status: 'planned', priority: 'low' },
          ],
        },
      ],
      milestones: [
        {
          name: 'Alpha Release',
          date: '2024-Q1',
          status: 'completed',
          description: 'Core functionality and basic gameplay loop',
        },
        {
          name: 'Beta Release',
          date: '2024-Q2',
          status: 'in-progress',
          description: 'Complete feature set with all major systems',
        },
        {
          name: 'Version 1.0',
          date: '2024-Q3',
          status: 'planned',
          description: 'Polished release with full content',
        },
        {
          name: 'Content Updates',
          date: '2024-Q4',
          status: 'planned',
          description: 'Additional scenarios and features',
        },
      ],
    };
  }

  render() {
    return `
      <div class="roadmap-screen">
        <!-- Header -->
        <div class="roadmap-header">
          <div class="header-content">
            <h1>🗺️ Development Roadmap</h1>
            <p>Track development progress and upcoming features for SP_Sim</p>
          </div>
          <div class="roadmap-summary">
            <div class="summary-metric">
              <span class="metric-label">Overall Progress</span>
              <span class="metric-value">${this.calculateOverallProgress()}%</span>
            </div>
            <div class="summary-metric">
              <span class="metric-label">Completed Phases</span>
              <span class="metric-value">${this.getCompletedPhases()}</span>
            </div>
            <div class="summary-metric">
              <span class="metric-label">Active Features</span>
              <span class="metric-value">${this.getActiveFeatures()}</span>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="roadmap-tabs">
          <button class="tab-btn ${this.currentView === 'overview' ? 'active' : ''}" data-view="overview">
            <span class="tab-icon">📊</span>
            <span class="tab-text">Overview</span>
          </button>
          <button class="tab-btn ${this.currentView === 'phases' ? 'active' : ''}" data-view="phases">
            <span class="tab-icon">🏗️</span>
            <span class="tab-text">Development Phases</span>
          </button>
          <button class="tab-btn ${this.currentView === 'features' ? 'active' : ''}" data-view="features">
            <span class="tab-icon">⭐</span>
            <span class="tab-text">Feature Status</span>
          </button>
          <button class="tab-btn ${this.currentView === 'milestones' ? 'active' : ''}" data-view="milestones">
            <span class="tab-icon">🎯</span>
            <span class="tab-text">Milestones</span>
          </button>
        </div>

        <!-- Content -->
        <div class="roadmap-content">
          <div class="view-content ${this.currentView === 'overview' ? 'active' : ''}" id="overview-view">
            ${this.renderOverviewView()}
          </div>
          <div class="view-content ${this.currentView === 'phases' ? 'active' : ''}" id="phases-view">
            ${this.renderPhasesView()}
          </div>
          <div class="view-content ${this.currentView === 'features' ? 'active' : ''}" id="features-view">
            ${this.renderFeaturesView()}
          </div>
          <div class="view-content ${this.currentView === 'milestones' ? 'active' : ''}" id="milestones-view">
            ${this.renderMilestonesView()}
          </div>
        </div>

        <style>
        .roadmap-screen {
          padding: var(--spacing-lg);
          max-width: 1400px;
          margin: 0 auto;
        }

        .roadmap-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl);
          padding: var(--spacing-xl);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

        .roadmap-summary {
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

        .roadmap-tabs {
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
          min-width: 140px;
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

        .roadmap-content {
          background: var(--surface-color);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          min-height: 600px;
        }

        .view-content {
          display: none;
          padding: var(--spacing-xl);
          animation: fadeInUp 0.3s ease-out;
        }

        .view-content.active {
          display: block;
        }

        .roadmap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: var(--spacing-lg);
        }

        .roadmap-panel {
          background: var(--background-alt);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
        }

        .roadmap-panel h3 {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--primary-color);
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .phase-card {
          background: var(--surface-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
          margin-bottom: var(--spacing-md);
          transition: all var(--transition-base);
        }

        .phase-card:hover {
          border-color: var(--secondary-color);
          box-shadow: var(--shadow-sm);
        }

        .phase-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .phase-title {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-color);
        }

        .phase-status {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status-completed { background: var(--success-color); color: white; }
        .status-in-progress { background: var(--warning-color); color: white; }
        .status-planned { background: var(--text-light); color: white; }

        .phase-description {
          color: var(--text-light);
          margin-bottom: var(--spacing-md);
          font-size: 0.9rem;
        }

        .phase-progress {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .progress-label {
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .progress-value {
          font-weight: 600;
          color: var(--secondary-color);
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: var(--border-light);
          border-radius: var(--border-radius-sm);
          overflow: hidden;
          margin: var(--spacing-sm) 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
          transition: width 0.3s ease;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-sm) 0;
          border-bottom: 1px solid var(--border-light);
        }

        .feature-item:last-child {
          border-bottom: none;
        }

        .feature-name {
          flex: 1;
          font-size: 0.9rem;
        }

        .feature-priority {
          padding: 2px 6px;
          border-radius: var(--border-radius-sm);
          font-size: 0.75rem;
          font-weight: 500;
          margin-right: var(--spacing-sm);
        }

        .priority-critical { background: var(--accent-color); color: white; }
        .priority-high { background: var(--warning-color); color: white; }
        .priority-medium { background: var(--info-color); color: white; }
        .priority-low { background: var(--text-light); color: white; }

        .feature-status {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .feature-completed { background: var(--success-color); }
        .feature-in-progress { background: var(--warning-color); }
        .feature-planned { background: var(--text-light); }

        .milestone-card {
          background: var(--surface-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
          margin-bottom: var(--spacing-md);
        }

        .milestone-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .milestone-name {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-color);
        }

        .milestone-date {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .milestone-description {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        .overview-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          background: var(--surface-color);
          padding: var(--spacing-lg);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          text-align: center;
        }

        .stat-icon {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-md);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--secondary-color);
          display: block;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .roadmap-header {
            flex-direction: column;
            gap: var(--spacing-lg);
            text-align: center;
          }

          .roadmap-summary {
            flex-direction: column;
            gap: var(--spacing-md);
            width: 100%;
          }

          .roadmap-tabs {
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

          .roadmap-grid {
            grid-template-columns: 1fr;
          }

          .phase-header {
            flex-direction: column;
            gap: var(--spacing-sm);
            align-items: flex-start;
          }

          .overview-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        </style>
      </div>
    `;
  }

  renderOverviewView() {
    return `
      <div class="overview-stats">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <span class="stat-value">${this.calculateOverallProgress()}%</span>
          <span class="stat-label">Overall Progress</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <span class="stat-value">${this.getTotalCompletedFeatures()}</span>
          <span class="stat-label">Features Complete</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🚧</div>
          <span class="stat-value">${this.getTotalInProgressFeatures()}</span>
          <span class="stat-label">In Development</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <span class="stat-value">${this.getTotalPlannedFeatures()}</span>
          <span class="stat-label">Planned Features</span>
        </div>
      </div>

      <div class="roadmap-grid">
        <div class="roadmap-panel">
          <h3>🚀 Recent Achievements</h3>
          <div class="achievement-list">
            <div class="achievement-item">
              <span class="achievement-icon">✅</span>
              <span class="achievement-text">Crisis Management System Completed</span>
            </div>
            <div class="achievement-item">
              <span class="achievement-icon">✅</span>
              <span class="achievement-text">Global Relations UI Implemented</span>
            </div>
            <div class="achievement-item">
              <span class="achievement-icon">✅</span>
              <span class="achievement-text">Media System Enhanced</span>
            </div>
          </div>
        </div>

        <div class="roadmap-panel">
          <h3>🎯 Current Focus</h3>
          <div class="focus-list">
            <div class="focus-item">
              <span class="focus-priority priority-high">HIGH</span>
              <span class="focus-text">Election System Implementation</span>
            </div>
            <div class="focus-item">
              <span class="focus-priority priority-high">HIGH</span>
              <span class="focus-text">International Event System</span>
            </div>
            <div class="focus-item">
              <span class="focus-priority priority-medium">MED</span>
              <span class="focus-text">Advanced Analytics Features</span>
            </div>
          </div>
        </div>

        <div class="roadmap-panel">
          <h3>📅 Upcoming Milestones</h3>
          <div class="upcoming-milestones">
            ${this.roadmapData.milestones
    .filter((m) => m.status !== 'completed')
    .map((milestone) => `
                <div class="milestone-preview">
                  <div class="milestone-preview-header">
                    <span class="milestone-preview-name">${milestone.name}</span>
                    <span class="milestone-preview-date">${milestone.date}</span>
                  </div>
                  <div class="milestone-preview-desc">${milestone.description}</div>
                </div>
              `).join('')}
          </div>
        </div>

        <div class="roadmap-panel">
          <h3>📈 Development Velocity</h3>
          <div class="velocity-metrics">
            <div class="velocity-item">
              <span class="velocity-label">Features/Week</span>
              <span class="velocity-value">2.5</span>
            </div>
            <div class="velocity-item">
              <span class="velocity-label">Bug Fix Rate</span>
              <span class="velocity-value">95%</span>
            </div>
            <div class="velocity-item">
              <span class="velocity-label">Code Quality</span>
              <span class="velocity-value">A+</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderPhasesView() {
    return `
      <div class="phases-container">
        ${this.roadmapData.phases.map((phase) => `
          <div class="phase-card">
            <div class="phase-header">
              <div class="phase-title">${phase.name}</div>
              <div class="phase-status status-${phase.status}">${phase.status.replace('-', ' ')}</div>
            </div>
            <div class="phase-description">${phase.description}</div>
            <div class="phase-progress">
              <span class="progress-label">Progress</span>
              <span class="progress-value">${phase.progress}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${phase.progress}%"></div>
            </div>
            <ul class="feature-list">
              ${phase.features.map((feature) => `
                <li class="feature-item">
                  <span class="feature-name">${feature.name}</span>
                  <span class="feature-priority priority-${feature.priority}">${feature.priority.toUpperCase()}</span>
                  <div class="feature-status feature-${feature.status}"></div>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderFeaturesView() {
    const allFeatures = this.roadmapData.phases.flatMap((phase) => phase.features.map((feature) => ({
      ...feature,
      phase: phase.name,
    })));

    const groupedFeatures = {
      completed: allFeatures.filter((f) => f.status === 'completed'),
      'in-progress': allFeatures.filter((f) => f.status === 'in-progress'),
      planned: allFeatures.filter((f) => f.status === 'planned'),
    };

    return `
      <div class="features-overview">
        <div class="features-summary">
          <div class="summary-item">
            <span class="summary-count">${groupedFeatures.completed.length}</span>
            <span class="summary-label">Completed</span>
          </div>
          <div class="summary-item">
            <span class="summary-count">${groupedFeatures['in-progress'].length}</span>
            <span class="summary-label">In Progress</span>
          </div>
          <div class="summary-item">
            <span class="summary-count">${groupedFeatures.planned.length}</span>
            <span class="summary-label">Planned</span>
          </div>
        </div>
      </div>

      <div class="features-grid">
        ${Object.entries(groupedFeatures).map(([status, features]) => `
          <div class="features-section">
            <h3 class="section-title">
              <span class="section-icon">${this.getStatusIcon(status)}</span>
              ${status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} (${features.length})
            </h3>
            <div class="features-list">
              ${features.map((feature) => `
                <div class="feature-card">
                  <div class="feature-card-header">
                    <span class="feature-card-name">${feature.name}</span>
                    <span class="feature-priority priority-${feature.priority}">${feature.priority}</span>
                  </div>
                  <div class="feature-card-phase">Phase: ${feature.phase}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderMilestonesView() {
    return `
      <div class="milestones-container">
        ${this.roadmapData.milestones.map((milestone) => `
          <div class="milestone-card">
            <div class="milestone-header">
              <div class="milestone-name">${milestone.name}</div>
              <div class="milestone-date">${milestone.date}</div>
            </div>
            <div class="milestone-status status-${milestone.status}">${milestone.status.replace('-', ' ')}</div>
            <div class="milestone-description">${milestone.description}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getStatusIcon(status) {
    if (status === 'completed') return '✅';
    if (status === 'in-progress') return '🚧';
    return '📋';
  }

  // Helper methods
  calculateOverallProgress() {
    const totalFeatures = this.roadmapData.phases.reduce((sum, phase) => sum + phase.features.length, 0);
    const completedFeatures = this.roadmapData.phases.reduce((sum, phase) => sum + phase.features.filter((f) => f.status === 'completed').length, 0);
    return Math.round((completedFeatures / totalFeatures) * 100);
  }

  getCompletedPhases() {
    return this.roadmapData.phases.filter((phase) => phase.status === 'completed').length;
  }

  getActiveFeatures() {
    return this.roadmapData.phases.reduce((sum, phase) => sum + phase.features.filter((f) => f.status === 'in-progress').length, 0);
  }

  getTotalCompletedFeatures() {
    return this.roadmapData.phases.reduce((sum, phase) => sum + phase.features.filter((f) => f.status === 'completed').length, 0);
  }

  getTotalInProgressFeatures() {
    return this.roadmapData.phases.reduce((sum, phase) => sum + phase.features.filter((f) => f.status === 'in-progress').length, 0);
  }

  getTotalPlannedFeatures() {
    return this.roadmapData.phases.reduce((sum, phase) => sum + phase.features.filter((f) => f.status === 'planned').length, 0);
  }

  setupInteractivity() {
    const container = document.querySelector('.roadmap-screen');
    if (!container) return;

    // Tab switching
    container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        this.switchView(targetView);
      });
    });
  }

  switchView(viewName) {
    this.currentView = viewName;
    this.refresh();
  }

  refresh() {
    const container = document.querySelector('#screen-roadmap .roadmap-screen');
    if (container) {
      container.innerHTML = this.render().replace(/<div class="roadmap-screen">|<\/div>$/g, '');
      this.setupInteractivity();
    }
  }

  show() {
    const roadmapScreen = document.querySelector('#screen-roadmap');
    if (roadmapScreen && !roadmapScreen.querySelector('.roadmap-screen')) {
      roadmapScreen.innerHTML = this.render();
      this.setupInteractivity();
    }
    return this.element;
  }
}

export default RoadmapScreen;
