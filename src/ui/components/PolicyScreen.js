import { BaseComponent } from './BaseComponent';
import { eventSystem } from '../../core/EventSystem';
import { Modal } from './Modal';

/**
 * PolicyScreen - Comprehensive policy management interface
 * Allows players to create, manage, and implement policies across different areas
 */
export class PolicyScreen extends BaseComponent {
  constructor() {
    super();
    this.activePolicies = [];
    this.draftPolicies = [];
    this.policyTemplates = this.initializePolicyTemplates();
    this.selectedCategory = 'economic';
    this.currentDraft = null;
    this.gameState = null;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    eventSystem.on('game:state_updated', (event) => {
      this.updatePolicyStatus(event.data);
    });

    eventSystem.on('policy:implemented', (event) => {
      this.handlePolicyImplemented(event.data);
    });

    eventSystem.on('policy:rejected', (event) => {
      this.handlePolicyRejected(event.data);
    });
  }

  /**
   * Initialize policy templates
   */
  initializePolicyTemplates() {
    return {
      economic: [
        {
          id: 'tax_reform',
          name: 'Tax Reform Package',
          description: 'Comprehensive reform of the taxation system',
          category: 'economic',
          baseCost: 500000000,
          duration: 12,
          effects: {
            gdp: { min: -0.5, max: 2.0 },
            approval: { min: -8, max: 12 },
            debt: { min: -1.0, max: 0.5 },
            unemployment: { min: -0.2, max: 0.3 },
          },
          requirements: {
            approval: 45,
            coalitionSupport: 60,
          },
          complexity: 'high',
        },
        {
          id: 'infrastructure_investment',
          name: 'Infrastructure Investment Program',
          description: 'Major investment in roads, bridges, and digital infrastructure',
          category: 'economic',
          baseCost: 2000000000,
          duration: 24,
          effects: {
            gdp: { min: 0.5, max: 3.0 },
            approval: { min: 2, max: 8 },
            debt: { min: 1.0, max: 3.0 },
            unemployment: { min: -1.5, max: -0.5 },
          },
          requirements: {
            approval: 35,
            coalitionSupport: 55,
          },
          complexity: 'high',
        },
        {
          id: 'small_business_support',
          name: 'Small Business Support Package',
          description: 'Tax incentives and grants for small businesses',
          category: 'economic',
          baseCost: 100000000,
          duration: 6,
          effects: {
            gdp: { min: 0.2, max: 1.0 },
            approval: { min: 1, max: 5 },
            debt: { min: 0.1, max: 0.5 },
            unemployment: { min: -0.5, max: -0.1 },
          },
          requirements: {
            approval: 30,
            coalitionSupport: 40,
          },
          complexity: 'medium',
        },
      ],
      social: [
        {
          id: 'healthcare_expansion',
          name: 'Healthcare System Expansion',
          description: 'Expand healthcare coverage and improve access',
          category: 'social',
          baseCost: 1500000000,
          duration: 18,
          effects: {
            approval: { min: 5, max: 15 },
            debt: { min: 1.5, max: 2.5 },
            gdp: { min: -0.2, max: 0.8 },
          },
          requirements: {
            approval: 40,
            coalitionSupport: 65,
          },
          complexity: 'high',
        },
        {
          id: 'education_reform',
          name: 'Education System Reform',
          description: 'Modernize education curriculum and infrastructure',
          category: 'social',
          baseCost: 800000000,
          duration: 36,
          effects: {
            approval: { min: 3, max: 10 },
            debt: { min: 0.8, max: 1.5 },
            gdp: { min: 0.5, max: 2.0 },
          },
          requirements: {
            approval: 35,
            coalitionSupport: 50,
          },
          complexity: 'high',
        },
        {
          id: 'unemployment_benefits',
          name: 'Enhanced Unemployment Benefits',
          description: 'Increase unemployment benefits and extend duration',
          category: 'social',
          baseCost: 300000000,
          duration: 3,
          effects: {
            approval: { min: 2, max: 8 },
            debt: { min: 0.3, max: 0.8 },
            unemployment: { min: 0.1, max: 0.3 },
          },
          requirements: {
            approval: 25,
            coalitionSupport: 45,
          },
          complexity: 'low',
        },
      ],
      environmental: [
        {
          id: 'carbon_tax',
          name: 'Carbon Tax Implementation',
          description: 'Implement carbon pricing to reduce emissions',
          category: 'environmental',
          baseCost: 50000000,
          duration: 6,
          effects: {
            approval: { min: -5, max: 8 },
            gdp: { min: -0.8, max: 0.2 },
            debt: { min: -0.5, max: 0.1 },
          },
          requirements: {
            approval: 45,
            coalitionSupport: 60,
          },
          complexity: 'medium',
        },
        {
          id: 'renewable_energy',
          name: 'Renewable Energy Transition',
          description: 'Massive investment in renewable energy infrastructure',
          category: 'environmental',
          baseCost: 3000000000,
          duration: 48,
          effects: {
            approval: { min: 3, max: 12 },
            gdp: { min: 0.2, max: 2.5 },
            debt: { min: 2.0, max: 4.0 },
            unemployment: { min: -2.0, max: -0.5 },
          },
          requirements: {
            approval: 40,
            coalitionSupport: 55,
          },
          complexity: 'high',
        },
      ],
      foreign: [
        {
          id: 'trade_agreement',
          name: 'New Trade Agreement',
          description: 'Negotiate comprehensive trade agreement with key partners',
          category: 'foreign',
          baseCost: 10000000,
          duration: 12,
          effects: {
            gdp: { min: 0.5, max: 2.0 },
            approval: { min: -3, max: 6 },
            unemployment: { min: -0.5, max: 0.2 },
          },
          requirements: {
            approval: 35,
            coalitionSupport: 50,
          },
          complexity: 'medium',
        },
        {
          id: 'defense_spending',
          name: 'Defense Budget Adjustment',
          description: 'Adjust military spending and modernize equipment',
          category: 'foreign',
          baseCost: 1000000000,
          duration: 12,
          effects: {
            approval: { min: -2, max: 8 },
            debt: { min: 0.5, max: 1.5 },
            gdp: { min: 0.1, max: 0.8 },
          },
          requirements: {
            approval: 30,
            coalitionSupport: 45,
          },
          complexity: 'medium',
        },
      ],
    };
  }

  /**
   * Render the policy screen
   */
  render() {
    return `
      <div class="policy-screen">
        <div class="policy-header">
          <h2>📋 Policy Management Center</h2>
          <div class="policy-stats">
            <div class="stat-item">
              <span class="stat-label">Active Policies</span>
              <span class="stat-value">${this.activePolicies.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Draft Policies</span>
              <span class="stat-value">${this.draftPolicies.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Political Capital</span>
              <span class="stat-value">${this.gameState ? this.calculatePoliticalCapital() : '0'}</span>
            </div>
          </div>
        </div>

        <div class="policy-content">
          <div class="policy-sidebar">
            <div class="policy-categories">
              <h3>Policy Categories</h3>
              <div class="category-list">
                ${this.renderCategoryTabs()}
              </div>
            </div>

            <div class="policy-actions">
              <button class="btn btn--primary create-policy-btn">
                ➕ Create New Policy
              </button>
              <button class="btn btn--secondary import-template-btn">
                📥 Use Template
              </button>
            </div>

            <div class="quick-stats">
              <h4>Implementation Capacity</h4>
              ${this.renderImplementationCapacity()}
            </div>
          </div>

          <div class="policy-main">
            <div class="policy-tabs">
              <button class="tab-btn active" data-tab="active">Active Policies</button>
              <button class="tab-btn" data-tab="drafts">Drafts</button>
              <button class="tab-btn" data-tab="templates">Templates</button>
            </div>

            <div class="policy-list-container">
              <div class="tab-content active" id="active-tab">
                ${this.renderActivePolicies()}
              </div>
              <div class="tab-content" id="drafts-tab">
                ${this.renderDraftPolicies()}
              </div>
              <div class="tab-content" id="templates-tab">
                ${this.renderPolicyTemplates()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        .policy-screen {
          padding: var(--spacing-lg);
          max-width: 1200px;
          margin: 0 auto;
        }

        .policy-header {
          margin-bottom: var(--spacing-lg);
          padding: var(--spacing-lg);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: var(--border-radius);
          color: white;
        }

        .policy-header h2 {
          margin: 0 0 var(--spacing-md) 0;
          font-size: 1.8rem;
        }

        .policy-stats {
          display: flex;
          gap: var(--spacing-lg);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
        }

        .policy-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--spacing-lg);
        }

        .policy-sidebar {
          background: white;
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          height: fit-content;
        }

        .policy-categories h3 {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--primary-color);
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-lg);
        }

        .category-tab {
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background: white;
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: left;
        }

        .category-tab:hover {
          background: rgba(102, 126, 234, 0.1);
          border-color: var(--secondary-color);
        }

        .category-tab.active {
          background: var(--secondary-color);
          color: white;
          border-color: var(--secondary-color);
        }

        .policy-actions {
          margin-bottom: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .quick-stats h4 {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--primary-color);
          font-size: 0.9rem;
        }

        .capacity-bar {
          background: #e2e8f0;
          border-radius: var(--border-radius);
          height: 8px;
          overflow: hidden;
          margin-bottom: var(--spacing-xs);
        }

        .capacity-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
          transition: width var(--transition-base);
        }

        .capacity-text {
          font-size: 0.8rem;
          color: var(--text-light);
        }

        .policy-main {
          background: white;
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-sm);
        }

        .policy-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
        }

        .tab-btn {
          padding: var(--spacing-md) var(--spacing-lg);
          border: none;
          background: none;
          cursor: pointer;
          transition: all var(--transition-base);
          border-bottom: 3px solid transparent;
        }

        .tab-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .tab-btn.active {
          border-bottom-color: var(--secondary-color);
          color: var(--secondary-color);
          font-weight: 600;
        }

        .tab-content {
          display: none;
          padding: var(--spacing-lg);
        }

        .tab-content.active {
          display: block;
        }

        .policy-card {
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          transition: all var(--transition-base);
        }

        .policy-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--secondary-color);
        }

        .policy-card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: var(--spacing-sm);
        }

        .policy-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0;
        }

        .policy-category-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .category-economic { background: rgba(34, 197, 94, 0.2); color: #16a34a; }
        .category-social { background: rgba(59, 130, 246, 0.2); color: #2563eb; }
        .category-environmental { background: rgba(34, 197, 94, 0.2); color: #059669; }
        .category-foreign { background: rgba(168, 85, 247, 0.2); color: #7c3aed; }

        .policy-description {
          color: var(--text-light);
          margin: 0 0 var(--spacing-sm) 0;
          line-height: 1.5;
        }

        .policy-effects {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-sm);
        }

        .effect-tag {
          padding: 2px 6px;
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .effect-positive { background: rgba(34, 197, 94, 0.2); color: #16a34a; }
        .effect-negative { background: rgba(239, 68, 68, 0.2); color: #dc2626; }
        .effect-neutral { background: rgba(107, 114, 128, 0.2); color: #6b7280; }

        .policy-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .policy-status {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-active { color: #16a34a; }
        .status-draft { color: #d97706; }
        .status-template { color: #6b7280; }

        .empty-state {
          text-align: center;
          padding: var(--spacing-xl);
          color: var(--text-light);
        }

        .empty-state-icon {
          font-size: 3rem;
          margin-bottom: var(--spacing-md);
        }

        @media (max-width: 768px) {
          .policy-content {
            grid-template-columns: 1fr;
          }
          
          .policy-stats {
            flex-direction: column;
            gap: var(--spacing-md);
          }
        }
      </style>
    `;
  }

  /**
   * Update component with current game state
   */
  update(gameState) {
    this.gameState = gameState;

    // Update active policies from game state
    if (gameState.policies) {
      this.activePolicies = gameState.policies.active || [];
    }
  }

  /**
   * Render category tabs
   */
  renderCategoryTabs() {
    const categories = [
      { id: 'all', name: '📊 All Categories', icon: '📊' },
      { id: 'economic', name: '💰 Economic', icon: '💰' },
      { id: 'social', name: '👥 Social', icon: '👥' },
      { id: 'environmental', name: '🌱 Environmental', icon: '🌱' },
      { id: 'foreign', name: '🌍 Foreign Policy', icon: '🌍' },
    ];

    return categories.map((category) => `
      <button class="category-tab ${this.selectedCategory === category.id ? 'active' : ''}" 
              data-category="${category.id}">
        ${category.icon} ${category.name.split(' ').slice(1).join(' ')}
      </button>
    `).join('');
  }

  /**
   * Render implementation capacity indicator
   */
  renderImplementationCapacity() {
    const capacity = this.calculateImplementationCapacity();
    const percentage = Math.min(100, capacity);

    return `
      <div class="capacity-bar">
        <div class="capacity-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="capacity-text">${capacity.toFixed(0)}% capacity used</div>
    `;
  }

  /**
   * Calculate current implementation capacity
   */
  calculateImplementationCapacity() {
    const activePolicyLoad = this.activePolicies.reduce((sum, policy) => {
      let load = 10;
      if (policy.complexity === 'high') {
        load = 30;
      } else if (policy.complexity === 'medium') {
        load = 20;
      }
      return sum + load;
    }, 0);

    return activePolicyLoad;
  }

  /**
   * Calculate political capital
   */
  calculatePoliticalCapital() {
    if (!this.gameState) return 0;

    const approval = this.gameState.politics?.approval || 50;
    const coalitionSupport = this.gameState.politics?.coalition?.reduce((sum, party) => sum + party.support, 0) || 50;

    return Math.floor((approval + coalitionSupport) / 2);
  }

  /**
   * Render active policies
   */
  renderActivePolicies() {
    if (this.activePolicies.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No Active Policies</h3>
          <p>You haven't implemented any policies yet. Start by creating a policy or using a template.</p>
        </div>
      `;
    }

    return this.activePolicies.map((policy) => this.renderPolicyCard(policy, 'active')).join('');
  }

  /**
   * Render draft policies
   */
  renderDraftPolicies() {
    if (this.draftPolicies.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h3>No Draft Policies</h3>
          <p>Create a new policy to get started.</p>
        </div>
      `;
    }

    return this.draftPolicies.map((policy) => this.renderPolicyCard(policy, 'draft')).join('');
  }

  /**
   * Render policy templates
   */
  renderPolicyTemplates() {
    const selectedTemplates = this.selectedCategory === 'all'
      ? Object.values(this.policyTemplates).flat()
      : this.policyTemplates[this.selectedCategory] || [];

    if (selectedTemplates.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-state-icon">📚</div>
          <h3>No Templates Available</h3>
          <p>No policy templates found for the selected category.</p>
        </div>
      `;
    }

    return selectedTemplates.map((template) => this.renderPolicyCard(template, 'template')).join('');
  }

  /**
   * Render individual policy card
   */
  renderPolicyCard(policy, type) {
    const costFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format(policy.baseCost || policy.cost || 0);

    return `
      <div class="policy-card" data-policy-id="${policy.id}" data-type="${type}">
        <div class="policy-card-header">
          <h4 class="policy-title">${policy.name}</h4>
          <span class="policy-category-badge category-${policy.category}">
            ${policy.category.charAt(0).toUpperCase() + policy.category.slice(1)}
          </span>
        </div>
        
        <p class="policy-description">${policy.description}</p>
        
        <div class="policy-effects">
          ${this.renderEffectTags(policy.effects)}
        </div>
        
        <div class="policy-actions-row">
          <div class="policy-meta">
            <small>Cost: ${costFormatted} | Duration: ${policy.duration} weeks</small>
          </div>
          <div class="policy-actions">
            ${this.renderPolicyActions(policy, type)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render effect tags for a policy
   */
  renderEffectTags(effects) {
    if (!effects) return '';

    return Object.entries(effects).map(([key, value]) => {
      let className = 'effect-neutral';
      let text = key;

      if (typeof value === 'object' && value.min !== undefined) {
        const avg = (value.min + value.max) / 2;
        if (avg > 0) {
          className = 'effect-positive';
        } else if (avg < 0) {
          className = 'effect-negative';
        } else {
          className = 'effect-neutral';
        }
        text = `${key}: ${value.min > 0 ? '+' : ''}${value.min}% to ${value.max > 0 ? '+' : ''}${value.max}%`;
      } else if (typeof value === 'number') {
        if (value > 0) {
          className = 'effect-positive';
        } else if (value < 0) {
          className = 'effect-negative';
        } else {
          className = 'effect-neutral';
        }
        text = `${key}: ${value > 0 ? '+' : ''}${value}%`;
      }

      return `<span class="effect-tag ${className}">${text}</span>`;
    }).join('');
  }

  /**
   * Render action buttons for policy card
   */
  renderPolicyActions(policy, type) {
    switch (type) {
      case 'active':
        return `
          <button class="btn btn--sm btn--secondary" data-action="view" data-policy-id="${policy.id}">
            👁️ View Details
          </button>
          <button class="btn btn--sm btn--danger" data-action="cancel" data-policy-id="${policy.id}">
            ❌ Cancel
          </button>
        `;
      case 'draft':
        return `
          <button class="btn btn--sm btn--primary" data-action="implement" data-policy-id="${policy.id}">
            🚀 Implement
          </button>
          <button class="btn btn--sm btn--secondary" data-action="edit" data-policy-id="${policy.id}">
            ✏️ Edit
          </button>
        `;
      case 'template':
        return `
          <button class="btn btn--sm btn--primary" data-action="use-template" data-policy-id="${policy.id}">
            📋 Use Template
          </button>
          <button class="btn btn--sm btn--secondary" data-action="preview" data-policy-id="${policy.id}">
            👁️ Preview
          </button>
        `;
      default:
        return '';
    }
  }

  /**
   * Handle policy implemented
   */
  handlePolicyImplemented(data) {
    const { policy } = data;

    // Move from drafts to active
    this.draftPolicies = this.draftPolicies.filter((p) => p.id !== policy.id);
    this.activePolicies.push({
      ...policy,
      implementedWeek: this.gameState?.time?.week || 1,
      implementedYear: this.gameState?.time?.year || 1,
      status: 'implementing',
    });

    this.refresh();
  }

  /**
   * Handle policy rejected
   */
  handlePolicyRejected(data) {
    const { policy, reason } = data;

    // Show rejection modal
    const modal = new Modal({
      title: 'Policy Rejected',
      content: `
        <div class="policy-rejection">
          <h4>${policy.name}</h4>
          <p>Your policy proposal has been rejected.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>You can modify the policy and try again later.</p>
        </div>
      `,
      confirmText: 'Understood',
      showCancel: false,
    });

    modal.show();
  }

  /**
   * Initialize event handlers after rendering
   */
  setupInteractivity() {
    const container = document.querySelector('.policy-screen');
    if (!container) return;

    // Category tab switching
    container.querySelectorAll('.category-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const { category } = tab.dataset;
        this.selectedCategory = category;

        // Update active states
        container.querySelectorAll('.category-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        // Refresh templates tab if visible
        if (container.querySelector('#templates-tab.active')) {
          this.refreshTemplatesTab();
        }
      });
    });

    // Tab switching
    container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        // Update tab buttons
        container.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Update tab content
        container.querySelectorAll('.tab-content').forEach((content) => {
          content.classList.remove('active');
        });
        container.querySelector(`#${tabName}-tab`).classList.add('active');
      });
    });

    // Policy actions
    container.addEventListener('click', (e) => {
      const { action } = e.target.dataset;
      const { policyId } = e.target.dataset;

      if (action && policyId) {
        this.handlePolicyAction(action, policyId);
      }
    });

    // Main action buttons
    container.querySelector('.create-policy-btn')?.addEventListener('click', () => {
      this.showCreatePolicyModal();
    });

    container.querySelector('.import-template-btn')?.addEventListener('click', () => {
      this.showTemplateSelectionModal();
    });
  }

  /**
   * Handle policy actions
   */
  handlePolicyAction(action, policyId) {
    switch (action) {
      case 'use-template':
        this.useTemplate(policyId);
        break;
      case 'preview':
        this.previewPolicy(policyId);
        break;
      case 'implement':
        this.implementPolicy(policyId);
        break;
      case 'edit':
        this.editPolicy(policyId);
        break;
      case 'view':
        this.viewPolicyDetails(policyId);
        break;
      case 'cancel':
        this.cancelPolicy(policyId);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }

  /**
   * Use a policy template
   */
  useTemplate(templateId) {
    const template = Object.values(this.policyTemplates).flat().find((t) => t.id === templateId);
    if (!template) return;

    // Create draft from template
    const draft = {
      ...template,
      id: `draft_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    this.draftPolicies.push(draft);
    this.refresh();

    // Switch to drafts tab
    document.querySelector('[data-tab="drafts"]')?.click();
  }

  /**
   * Preview policy details
   */
  previewPolicy(policyId) {
    const policy = Object.values(this.policyTemplates).flat().find((p) => p.id === policyId);
    if (!policy) return;

    this.showPolicyPreviewModal(policy);
  }

  /**
   * Show policy preview modal
   */
  showPolicyPreviewModal(policy) {
    const costFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(policy.baseCost);

    const modal = new Modal({
      title: `Policy Preview: ${policy.name}`,
      content: `
        <div class="policy-preview">
          <div class="policy-overview">
            <p><strong>Category:</strong> ${policy.category.charAt(0).toUpperCase() + policy.category.slice(1)}</p>
            <p><strong>Cost:</strong> ${costFormatted}</p>
            <p><strong>Duration:</strong> ${policy.duration} weeks</p>
            <p><strong>Complexity:</strong> ${policy.complexity.charAt(0).toUpperCase() + policy.complexity.slice(1)}</p>
          </div>
          
          <div class="policy-description">
            <h4>Description</h4>
            <p>${policy.description}</p>
          </div>
          
          <div class="policy-effects">
            <h4>Expected Effects</h4>
            ${this.renderDetailedEffects(policy.effects)}
          </div>
          
          <div class="policy-requirements">
            <h4>Requirements</h4>
            <ul>
              <li>Minimum Approval: ${policy.requirements.approval}%</li>
              <li>Coalition Support: ${policy.requirements.coalitionSupport}%</li>
            </ul>
          </div>
          
          ${this.gameState ? this.renderFeasibilityAssessment(policy) : ''}
        </div>
      `,
      confirmText: 'Use This Template',
      cancelText: 'Close',
      showCancel: true,
      onConfirm: () => {
        this.useTemplate(policy.id);
        return true;
      },
    });

    modal.show();
  }

  /**
   * Render detailed effects for preview
   */
  renderDetailedEffects(effects) {
    return Object.entries(effects).map(([key, value]) => {
      let range = '';
      if (typeof value === 'object' && value.min !== undefined) {
        range = `${value.min > 0 ? '+' : ''}${value.min}% to ${value.max > 0 ? '+' : ''}${value.max}%`;
      }

      return `
        <div class="effect-detail">
          <span class="effect-name">${key.charAt(0).toUpperCase() + key.slice(1)}:</span>
          <span class="effect-range">${range}</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Render feasibility assessment
   */
  renderFeasibilityAssessment(policy) {
    const currentApproval = this.gameState.politics?.approval || 0;
    const currentCoalition = this.gameState.politics?.coalition?.reduce((sum, party) => sum + party.support, 0) || 0;

    const approvalMet = currentApproval >= policy.requirements.approval;
    const coalitionMet = currentCoalition >= policy.requirements.coalitionSupport;

    return `
      <div class="feasibility-assessment">
        <h4>Current Feasibility</h4>
        <div class="requirement-check">
          <span class="${approvalMet ? 'requirement-met' : 'requirement-unmet'}">
            ${approvalMet ? '✅' : '❌'} Approval Rating: ${currentApproval.toFixed(1)}% (need ${policy.requirements.approval}%)
          </span>
        </div>
        <div class="requirement-check">
          <span class="${coalitionMet ? 'requirement-met' : 'requirement-unmet'}">
            ${coalitionMet ? '✅' : '❌'} Coalition Support: ${currentCoalition.toFixed(1)}% (need ${policy.requirements.coalitionSupport}%)
          </span>
        </div>
        <div class="feasibility-verdict">
          <strong>${(approvalMet && coalitionMet) ? '🟢 Ready to implement' : '🟡 Requirements not met'}</strong>
        </div>
      </div>
    `;
  }

  /**
   * Implement a draft policy
   */
  implementPolicy(policyId) {
    const policy = this.draftPolicies.find((p) => p.id === policyId);
    if (!policy) return;

    // Check requirements
    if (!this.checkPolicyRequirements(policy)) {
      return;
    }

    // Emit implementation event
    eventSystem.emit('policy:implement', {
      policy,
      gameState: this.gameState,
    });
  }

  /**
   * Check if policy requirements are met
   */
  checkPolicyRequirements(policy) {
    if (!this.gameState) return false;

    const currentApproval = this.gameState.politics?.approval || 0;
    const currentCoalition = this.gameState.politics?.coalition?.reduce((sum, party) => sum + party.support, 0) || 0;

    const approvalMet = currentApproval >= policy.requirements.approval;
    const coalitionMet = currentCoalition >= policy.requirements.coalitionSupport;

    if (!approvalMet || !coalitionMet) {
      const modal = new Modal({
        title: 'Requirements Not Met',
        content: `
          <div class="requirements-warning">
            <p>Cannot implement this policy. Requirements not met:</p>
            <ul>
              ${!approvalMet ? `<li>Need ${policy.requirements.approval}% approval (currently ${currentApproval.toFixed(1)}%)</li>` : ''}
              ${!coalitionMet ? `<li>Need ${policy.requirements.coalitionSupport}% coalition support (currently ${currentCoalition.toFixed(1)}%)</li>` : ''}
            </ul>
            <p>Work on improving your political position before implementing this policy.</p>
          </div>
        `,
        confirmText: 'Understood',
        showCancel: false,
      });
      modal.show();
      return false;
    }

    return true;
  }

  /**
   * Show create policy modal
   */
  showCreatePolicyModal() {
    const modal = new Modal({
      title: 'Create New Policy',
      content: `
        <div class="create-policy-form">
          <p>Policy creation is a complex feature that will be implemented in the next update.</p>
          <p>For now, you can use the available templates to get started with policy implementation.</p>
          <p>Templates are available in the Templates tab and cover:</p>
          <ul>
            <li>Economic policies (tax reform, infrastructure, business support)</li>
            <li>Social policies (healthcare, education, unemployment benefits)</li>
            <li>Environmental policies (carbon tax, renewable energy)</li>
            <li>Foreign policies (trade agreements, defense spending)</li>
          </ul>
        </div>
      `,
      confirmText: 'View Templates',
      cancelText: 'Close',
      showCancel: true,
      onConfirm: () => {
        document.querySelector('[data-tab="templates"]')?.click();
        return true;
      },
    });

    modal.show();
  }

  /**
   * Show template selection modal
   */
  showTemplateSelectionModal() {
    // Switch to templates tab
    document.querySelector('[data-tab="templates"]')?.click();
  }

  /**
   * Refresh templates tab
   */
  refreshTemplatesTab() {
    const templatesContainer = document.querySelector('#templates-tab');
    if (templatesContainer) {
      templatesContainer.innerHTML = this.renderPolicyTemplates();
    }
  }

  /**
   * Update policy status from game events
   */
  updatePolicyStatus(gameState) {
    this.gameState = gameState;

    // Update active policies with current progress
    this.activePolicies.forEach((policy) => {
      if (policy.implementedWeek && gameState.time) {
        const weeksElapsed = (gameState.time.year - policy.implementedYear) * 52
                           + (gameState.time.week - policy.implementedWeek);

        policy.progress = Math.min(100, (weeksElapsed / policy.duration) * 100);

        if (policy.progress >= 100) {
          policy.status = 'completed';
        }
      }
    });
  }

  /**
   * Refresh the entire component
   */
  refresh() {
    const container = document.querySelector('.policy-screen');
    if (container) {
      container.innerHTML = this.render();
      this.setupInteractivity();
    }
  }
}

export default PolicyScreen;
