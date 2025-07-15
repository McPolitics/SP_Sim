import { BaseComponent } from './BaseComponent';
import { eventSystem } from '../../core/EventSystem';
import { Modal } from './Modal';
import { monetizationFramework } from '../../core/MonetizationFramework';

/**
 * PoliticalEventsPanel - Displays and handles political events and decisions
 */
export class PoliticalEventsPanel extends BaseComponent {
  constructor() {
    super();
    this.activeEvents = [];
    this.oppositionActions = [];
    this.activeDebates = [];
    this.coalitionStability = 100;
    this.oppositionStatus = null;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for political events
    eventSystem.on('political:event_triggered', (event) => {
      this.handleEventTriggered(event.data);
    });

    eventSystem.on('political:event_resolved', (event) => {
      this.handleEventResolved(event.data);
    });

    eventSystem.on('political:vote_completed', (event) => {
      this.handleVoteCompleted(event.data);
    });

    eventSystem.on('political:crisis_triggered', (event) => {
      this.handleCrisisTriggered(event.data);
    });

    // Listen for AI opposition events
    eventSystem.on('opposition:action', (event) => {
      this.handleOppositionAction(event.data);
    });

    eventSystem.on('opposition:policy_response', (event) => {
      this.handleOppositionPolicyResponse(event.data);
    });

    eventSystem.on('opposition:debate_initiated', (event) => {
      this.handleDebateInitiated(event.data);
    });

    eventSystem.on('opposition:debate_concluded', (event) => {
      this.handleDebateConcluded(event.data);
    });

    eventSystem.on('opposition:economic_response', (event) => {
      this.handleOppositionEconomicResponse(event.data);
    });
  }

  /**
   * Update panel with current political status
   */
  update(gameState, politicalStatus) {
    this.coalitionStability = politicalStatus.coalition;
    this.lastGameState = gameState; // Store for event modals
    this.updatePoliticalStatusDisplay(gameState, politicalStatus);
    this.updateOppositionActionsList();
  }

  /**
   * Handle AI opposition action
   */
  handleOppositionAction(data) {
    const { action, oppositionStatus } = data;
    this.oppositionStatus = oppositionStatus;

    // Add to recent actions
    this.oppositionActions.unshift(action);
    if (this.oppositionActions.length > 10) {
      this.oppositionActions = this.oppositionActions.slice(0, 10);
    }

    // Show notification for important actions
    if (action.type === 'criticism' && action.severity === 'high') {
      this.showOppositionNotification(action);
    } else if (action.type === 'policy_proposal') {
      this.showPolicyProposalNotification(action);
    } else if (action.type === 'debate_call') {
      this.showDebateCallNotification(action);
    }

    this.updateOppositionActionsList();
  }

  /**
   * Handle opposition policy response
   */
  handleOppositionPolicyResponse(data) {
    const { response, oppositionParty } = data;

    const notification = {
      type: 'policy_response',
      title: `${oppositionParty.name} responds to policy`,
      message: response.message,
      stance: response.stance,
      severity: response.severity,
      timestamp: Date.now(),
    };

    this.showOppositionNotification(notification);
  }

  /**
   * Handle debate initiated by opposition
   */
  handleDebateInitiated(data) {
    const { debate, requiredResponse } = data;
    this.activeDebates.push(debate);

    if (requiredResponse) {
      // Show urgent debate modal
      this.showDebateModal(debate);
    } else {
      // Show notification
      this.showDebateNotification(debate);
    }
  }

  /**
   * Handle debate conclusion
   */
  handleDebateConcluded(data) {
    const { debate, outcome } = data;

    // Remove from active debates
    this.activeDebates = this.activeDebates.filter((d) => d.id !== debate.id);

    // Show outcome modal
    this.showDebateOutcomeModal(debate, outcome);
  }

  /**
   * Handle opposition economic response
   */
  handleOppositionEconomicResponse(data) {
    const {
      change, party, message, urgency,
    } = data;

    const notification = {
      type: 'economic_response',
      title: `${party.name} on Economic Issues`,
      message,
      urgency,
      change,
      timestamp: Date.now(),
    };

    this.showOppositionNotification(notification);
  }

  handleEventTriggered(data) {
    const { event, gameState } = data;
    this.activeEvents.push(event);

    // Show event modal immediately for high severity events
    if (event.severity === 'high') {
      this.showEventModal(event, gameState);
    } else {
      // Show notification for other events
      this.showEventNotification(event);
    }
  }

  /**
   * Handle political event being resolved
   */
  handleEventResolved(data) {
    const { event } = data;
    this.activeEvents = this.activeEvents.filter((e) => e.id !== event.id);
    this.updateOppositionActionsList();
  }

  /**
   * Handle vote completion
   */
  handleVoteCompleted(data) {
    const { vote, outcome } = data;
    this.showVoteResultModal(vote, outcome);
  }

  /**
   * Handle crisis being triggered
   */
  handleCrisisTriggered(data) {
    const { crisis } = data;
    this.showCrisisModal(crisis);
  }

  /**
   * Show political event modal
   */
  showEventModal(event, gameState) {
    const optionsHtml = event.options.map((option) => `
      <div class="event-option" data-option-id="${option.id}">
        <div class="option-header">
          <h4>${option.text}</h4>
        </div>
        <p class="option-description">${option.description}</p>
        <div class="option-effects">
          ${this.formatEffectsPreview(option.effects)}
        </div>
      </div>
    `).join('');

    const modal = new Modal({
      title: `Political Event: ${event.title}`,
      content: `
        <div class="political-event-modal">
          <div class="event-header">
            <div class="event-severity event-severity--${event.severity}">
              ${this.getSeverityIcon(event.severity)} ${event.severity.toUpperCase()}
            </div>
            <div class="event-deadline">
              Deadline: Week ${event.deadline.week}, Year ${event.deadline.year}
            </div>
          </div>
          
          <div class="event-description">
            <p>${event.description}</p>
          </div>

          <div class="event-context">
            <h4>Current Political Situation:</h4>
            <div class="context-stats">
              <div class="context-stat">
                <span class="label">Approval Rating:</span>
                <span class="value">${gameState.politics.approval.toFixed(1)}%</span>
              </div>
              <div class="context-stat">
                <span class="label">Coalition Stability:</span>
                <span class="value">${this.coalitionStability.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div class="event-options">
            <h4>Choose Your Response:</h4>
            ${optionsHtml}
          </div>
        </div>

        <style>
          .political-event-modal {
            max-width: 600px;
            margin: 0 auto;
          }
          
          .event-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-md);
            padding: var(--spacing-sm);
            background: rgba(0, 0, 0, 0.05);
            border-radius: var(--border-radius);
          }
          
          .event-severity {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-weight: 600;
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--border-radius);
          }
          
          .event-severity--high {
            background: rgba(239, 68, 68, 0.2);
            color: #dc2626;
          }
          
          .event-severity--medium {
            background: rgba(245, 158, 11, 0.2);
            color: #d97706;
          }
          
          .event-severity--low {
            background: rgba(34, 197, 94, 0.2);
            color: #16a34a;
          }
          
          .event-deadline {
            font-size: 0.875rem;
            color: var(--text-light);
          }
          
          .event-description {
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-md);
            background: rgba(0, 0, 0, 0.02);
            border-left: 4px solid var(--secondary-color);
            border-radius: 0 var(--border-radius) var(--border-radius) 0;
          }
          
          .event-context {
            margin-bottom: var(--spacing-lg);
          }
          
          .event-context h4 {
            margin-bottom: var(--spacing-sm);
            color: var(--primary-color);
          }
          
          .context-stats {
            display: flex;
            gap: var(--spacing-lg);
          }
          
          .context-stat {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);
          }
          
          .context-stat .label {
            font-size: 0.875rem;
            color: var(--text-light);
          }
          
          .context-stat .value {
            font-weight: 600;
            font-size: 1.1rem;
          }
          
          .event-options h4 {
            margin-bottom: var(--spacing-md);
            color: var(--primary-color);
          }
          
          .event-option {
            border: 2px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-md);
            cursor: pointer;
            transition: all var(--transition-base);
          }
          
          .event-option:hover {
            border-color: var(--secondary-color);
            background: rgba(49, 130, 206, 0.05);
          }
          
          .event-option.selected {
            border-color: var(--secondary-color);
            background: rgba(49, 130, 206, 0.1);
          }
          
          .option-header h4 {
            margin: 0 0 var(--spacing-sm) 0;
            color: var(--text-color);
          }
          
          .option-description {
            margin-bottom: var(--spacing-sm);
            color: var(--text-light);
          }
          
          .option-effects {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm);
          }
          
          .effect-tag {
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--border-radius);
            font-size: 0.8rem;
            font-weight: 500;
          }
          
          .effect-tag--positive {
            background: rgba(34, 197, 94, 0.2);
            color: #16a34a;
          }
          
          .effect-tag--negative {
            background: rgba(239, 68, 68, 0.2);
            color: #dc2626;
          }
          
          .effect-tag--neutral {
            background: rgba(107, 114, 128, 0.2);
            color: #6b7280;
          }
          
          @media (max-width: 768px) {
            .event-header {
              flex-direction: column;
              gap: var(--spacing-sm);
              text-align: center;
            }
            
            .context-stats {
              flex-direction: column;
              gap: var(--spacing-sm);
            }
          }
        </style>
      `,
      confirmText: 'Make Decision',
      cancelText: 'Delay Decision',
      showCancel: true,
      onConfirm: () => {
        const selectedOption = document.querySelector('.event-option.selected');
        if (!selectedOption) {
          this.showNotification('Please select a response option.', 'warning');
          return false;
        }

        const optionId = selectedOption.getAttribute('data-option-id');
        this.respondToEvent(event.id, optionId, gameState);
        return true;
      },
    });

    modal.show();

    // Add option selection handlers
    setTimeout(() => {
      const options = document.querySelectorAll('.event-option');
      options.forEach((option) => {
        option.addEventListener('click', () => {
          options.forEach((opt) => opt.classList.remove('selected'));
          option.classList.add('selected');
        });
      });
    }, 100);
  }

  /**
   * Get severity icon
   */
  getSeverityIcon(severity) {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  }

  /**
   * Format effects preview
   */
  formatEffectsPreview(effects) {
    const effectTags = [];

    if (effects.approval !== undefined) {
      const isPositive = effects.approval > 0;
      effectTags.push(`
        <span class="effect-tag effect-tag--${isPositive ? 'positive' : 'negative'}">
          Approval ${isPositive ? '+' : ''}${effects.approval}%
        </span>
      `);
    }

    if (effects.gdp !== undefined) {
      const isPositive = effects.gdp > 0;
      effectTags.push(`
        <span class="effect-tag effect-tag--${isPositive ? 'positive' : 'negative'}">
          GDP ${isPositive ? '+' : ''}${effects.gdp}%
        </span>
      `);
    }

    if (effects.coalitionSupport !== undefined) {
      const isPositive = effects.coalitionSupport > 0;
      effectTags.push(`
        <span class="effect-tag effect-tag--${isPositive ? 'positive' : 'negative'}">
          Coalition ${isPositive ? '+' : ''}${effects.coalitionSupport}%
        </span>
      `);
    }

    if (effects.debt !== undefined) {
      const isNegative = effects.debt > 0; // More debt is negative
      effectTags.push(`
        <span class="effect-tag effect-tag--${isNegative ? 'negative' : 'positive'}">
          Debt ${effects.debt > 0 ? '+' : ''}${effects.debt}%
        </span>
      `);
    }

    return effectTags.join('');
  }

  /**
   * Respond to political event
   */
  respondToEvent(eventId, optionId, gameState) {
    eventSystem.emit('political:event_response', {
      eventId,
      optionId,
      gameState,
    });
  }

  /**
   * Show opposition action notification
   */
  showOppositionNotification(action) {
    const notification = document.createElement('div');
    notification.className = 'opposition-notification';

    const iconMap = {
      criticism: '📢',
      policy_proposal: '📋',
      debate_call: '⚡',
      policy_response: '💬',
      economic_response: '📊',
    };

    const colorMap = {
      high: '#dc2626',
      medium: '#d97706',
      low: '#16a34a',
    };

    const bgColorMap = {
      high: 'rgba(239, 68, 68, 0.1)',
      medium: 'rgba(245, 158, 11, 0.1)',
      low: 'rgba(34, 197, 94, 0.1)',
    };

    const severity = action.severity || action.urgency || 'medium';
    const icon = iconMap[action.type] || '🏛️';

    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-icon">${icon}</span>
        <span class="notification-title">Opposition Action</span>
        <button class="notification-close" onclick="this.closest('.opposition-notification').remove()">×</button>
      </div>
      <div class="notification-content">
        <h4>${action.title || 'Opposition Response'}</h4>
        <p>${action.message || action.description}</p>
        ${action.proposedBy ? `<small>— ${action.proposedBy.name}</small>` : ''}
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 320px;
      background: ${bgColorMap[severity]};
      border: 1px solid ${colorMap[severity]};
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
      padding: var(--spacing-md);
    `;

    // Style the content
    const style = document.createElement('style');
    style.textContent = `
      .opposition-notification .notification-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--spacing-sm);
      }
      .opposition-notification .notification-title {
        font-weight: 600;
        color: ${colorMap[severity]};
      }
      .opposition-notification .notification-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: ${colorMap[severity]};
      }
      .opposition-notification h4 {
        margin: 0 0 var(--spacing-xs) 0;
        color: ${colorMap[severity]};
      }
      .opposition-notification p {
        margin: 0 0 var(--spacing-xs) 0;
        font-size: 0.9rem;
      }
      .opposition-notification small {
        font-style: italic;
        opacity: 0.8;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 6000);
  }

  /**
   * Show policy proposal notification
   */
  showPolicyProposalNotification(action) {
    const notification = document.createElement('div');
    notification.className = 'policy-proposal-notification';
    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-icon">📋</span>
        <span class="notification-title">Opposition Policy Proposal</span>
      </div>
      <div class="notification-content">
        <h4>${action.title}</h4>
        <p>${action.description}</p>
        <div class="proposal-actions">
          <button class="btn btn--sm btn--primary view-proposal-btn" data-action='${JSON.stringify(action)}'>
            View Proposal
          </button>
        </div>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 340px;
      background: rgba(49, 130, 206, 0.1);
      border: 1px solid #3182ce;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
      padding: var(--spacing-md);
    `;

    document.body.appendChild(notification);

    // Add event handler for view proposal button
    const viewBtn = notification.querySelector('.view-proposal-btn');
    viewBtn.addEventListener('click', () => {
      this.showPolicyProposalModal(action);
      notification.remove();
    });

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Show debate call notification
   */
  showDebateCallNotification(action) {
    this.showOppositionNotification({
      ...action,
      message: `${action.proposedBy.name} is calling for a parliamentary debate on: ${action.topics.join(', ')}`,
    });
  }

  /**
   * Show debate notification
   */
  showDebateNotification(debate) {
    const notification = document.createElement('div');
    notification.className = 'debate-notification';
    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-icon">⚡</span>
        <span class="notification-title">Parliamentary Debate</span>
      </div>
      <div class="notification-content">
        <h4>${debate.topic}</h4>
        <p>The ${debate.initiator.name} has initiated a debate</p>
        <div class="debate-actions">
          <button class="btn btn--sm btn--primary join-debate-btn" data-debate-id="${debate.id}">
            Join Debate
          </button>
        </div>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 320px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid #d97706;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
      padding: var(--spacing-md);
    `;

    document.body.appendChild(notification);

    // Add event handler
    const joinBtn = notification.querySelector('.join-debate-btn');
    joinBtn.addEventListener('click', () => {
      this.showDebateModal(debate);
      notification.remove();
    });

    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 8000);
  }

  showEventNotification(event) {
    const notification = document.createElement('div');
    notification.className = 'political-event-notification';
    notification.innerHTML = `
      <div class="notification-header">
        <span class="notification-icon">${this.getSeverityIcon(event.severity)}</span>
        <span class="notification-title">Political Event</span>
      </div>
      <div class="notification-content">
        <h4>${event.title}</h4>
        <p>${event.description}</p>
        <button class="btn btn--sm btn--primary" onclick="this.closest('.political-event-notification').remove()">
          View Details
        </button>
      </div>
    `;

    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      width: 320px;
      background: white;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 8000);
  }

  /**
   * Show debate modal
   */
  showDebateModal(debate) {
    const argumentsHtml = debate.arguments.map((arg) => `
      <div class="debate-argument">
        <div class="argument-header">
          <strong>${arg.party}</strong>
          <span class="argument-strength">${(arg.strength * 100).toFixed(0)}% strength</span>
        </div>
        <p>${arg.argument}</p>
      </div>
    `).join('');

    const modal = new Modal({
      title: `Parliamentary Debate: ${debate.topic}`,
      content: `
        <div class="debate-modal">
          <div class="debate-header">
            <div class="debate-info">
              <div class="debate-urgency debate-urgency--${debate.urgency}">
                ${debate.urgency.toUpperCase()} PRIORITY
              </div>
              <div class="debate-interest">
                Public Interest: ${(debate.publicInterest * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div class="debate-description">
            <p>The ${debate.initiator.name} has called for a parliamentary debate on this important issue.</p>
          </div>

          <div class="opposition-arguments">
            <h4>Opposition Arguments:</h4>
            ${argumentsHtml}
          </div>

          <div class="debate-response-options">
            <h4>Choose Your Response:</h4>
            <div class="response-options">
              <div class="response-option" data-response="strong_defense">
                <h5>🛡️ Strong Defense</h5>
                <p>Vigorously defend current policies with detailed counterarguments</p>
                <small>High impact, moderate risk</small>
              </div>
              <div class="response-option" data-response="compromise">
                <h5>🤝 Seek Compromise</h5>
                <p>Acknowledge concerns and propose middle-ground solutions</p>
                <small>Moderate impact, low risk</small>
              </div>
              <div class="response-option" data-response="deflect">
                <h5>🔄 Deflect & Redirect</h5>
                <p>Shift focus to opposition's past failures or other issues</p>
                <small>Variable impact, moderate risk</small>
              </div>
              <div class="response-option" data-response="weak_response">
                <h5>😐 Minimal Response</h5>
                <p>Provide only basic, non-committal answers</p>
                <small>Low impact, high risk</small>
              </div>
            </div>
          </div>
        </div>

        <style>
          .debate-modal {
            max-width: 600px;
            margin: 0 auto;
          }
          
          .debate-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-md);
            background: rgba(0, 0, 0, 0.05);
            border-radius: var(--border-radius);
          }
          
          .debate-urgency {
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: var(--border-radius);
            font-weight: 600;
            font-size: 0.8rem;
          }
          
          .debate-urgency--high {
            background: rgba(239, 68, 68, 0.2);
            color: #dc2626;
          }
          
          .debate-urgency--medium {
            background: rgba(245, 158, 11, 0.2);
            color: #d97706;
          }
          
          .debate-urgency--low {
            background: rgba(34, 197, 94, 0.2);
            color: #16a34a;
          }
          
          .debate-interest {
            font-size: 0.9rem;
            color: var(--text-light);
          }
          
          .opposition-arguments {
            margin-bottom: var(--spacing-lg);
          }
          
          .debate-argument {
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-sm);
            background: rgba(0, 0, 0, 0.02);
          }
          
          .argument-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);
          }
          
          .argument-strength {
            font-size: 0.8rem;
            color: var(--text-light);
            background: rgba(0, 0, 0, 0.1);
            padding: 2px 6px;
            border-radius: var(--border-radius);
          }
          
          .debate-response-options h4 {
            margin-bottom: var(--spacing-md);
            color: var(--primary-color);
          }
          
          .response-options {
            display: grid;
            gap: var(--spacing-sm);
          }
          
          .response-option {
            border: 2px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: var(--spacing-md);
            cursor: pointer;
            transition: all var(--transition-base);
          }
          
          .response-option:hover {
            border-color: var(--secondary-color);
            background: rgba(49, 130, 206, 0.05);
          }
          
          .response-option.selected {
            border-color: var(--secondary-color);
            background: rgba(49, 130, 206, 0.1);
          }
          
          .response-option h5 {
            margin: 0 0 var(--spacing-xs) 0;
            color: var(--text-color);
          }
          
          .response-option p {
            margin: 0 0 var(--spacing-xs) 0;
            color: var(--text-light);
          }
          
          .response-option small {
            font-style: italic;
            opacity: 0.7;
          }
        </style>
      `,
      confirmText: 'Respond to Debate',
      cancelText: 'Skip Debate',
      showCancel: true,
      onConfirm: () => {
        const selectedOption = document.querySelector('.response-option.selected');
        if (!selectedOption) {
          this.showNotification('Please select a response option.', 'warning');
          return false;
        }

        const responseType = selectedOption.getAttribute('data-response');
        this.respondToDebate(debate.id, { type: responseType });
        return true;
      },
    });

    modal.show();

    // Add option selection handlers
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

  /**
   * Show policy proposal modal
   */
  showPolicyProposalModal(proposal) {
    const costFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
    }).format(proposal.cost);

    const modal = new Modal({
      title: `Opposition Policy Proposal: ${proposal.title}`,
      content: `
        <div class="policy-proposal-modal">
          <div class="proposal-header">
            <div class="proposal-area">${proposal.area.toUpperCase()}</div>
            <div class="proposal-cost">Cost: ${costFormatted}</div>
          </div>

          <div class="proposal-description">
            <p>${proposal.description}</p>
          </div>

          <div class="proposal-impact">
            <h4>Projected Impact:</h4>
            <div class="impact-grid">
              ${Object.entries(proposal.impact).map(([key, value]) => `
                <div class="impact-item">
                  <span class="impact-label">${key}:</span>
                  <span class="impact-value ${value > 0 ? 'positive' : 'negative'}">
                    ${value > 0 ? '+' : ''}${value}${key.includes('percent') || key.includes('%') ? '%' : ''}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="proposal-source">
            <p><strong>Proposed by:</strong> ${proposal.proposedBy.name}</p>
          </div>
        </div>

        <style>
          .policy-proposal-modal {
            max-width: 500px;
            margin: 0 auto;
          }
          
          .proposal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-md);
            background: rgba(49, 130, 206, 0.1);
            border-radius: var(--border-radius);
          }
          
          .proposal-area {
            font-weight: 600;
            color: var(--secondary-color);
          }
          
          .proposal-cost {
            font-weight: 600;
            color: var(--text-color);
          }
          
          .proposal-description {
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-md);
            background: rgba(0, 0, 0, 0.02);
            border-radius: var(--border-radius);
          }
          
          .proposal-impact h4 {
            margin-bottom: var(--spacing-sm);
            color: var(--primary-color);
          }
          
          .impact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-lg);
          }
          
          .impact-item {
            display: flex;
            justify-content: space-between;
            padding: var(--spacing-sm);
            background: rgba(0, 0, 0, 0.05);
            border-radius: var(--border-radius);
          }
          
          .impact-value.positive {
            color: #16a34a;
          }
          
          .impact-value.negative {
            color: #dc2626;
          }
          
          .proposal-source {
            font-style: italic;
            color: var(--text-light);
          }
        </style>
      `,
      confirmText: 'Consider Proposal',
      cancelText: 'Dismiss',
      showCancel: true,
      onConfirm: () => {
        this.showNotification('Opposition proposal noted for future consideration.', 'info');
        return true;
      },
    });

    modal.show();
  }

  /**
   * Show debate outcome modal
   */
  showDebateOutcomeModal(debate, outcome) {
    const outcomeTexts = {
      player_victory: 'You successfully defended your position!',
      opposition_victory: 'The opposition made compelling arguments.',
      draw: 'The debate ended without a clear winner.',
    };

    const outcomeColors = {
      player_victory: '#16a34a',
      opposition_victory: '#dc2626',
      draw: '#d97706',
    };

    const modal = new Modal({
      title: 'Debate Concluded',
      content: `
        <div class="debate-outcome-modal">
          <div class="outcome-header">
            <h3 style="color: ${outcomeColors[outcome.outcome]};">
              ${outcomeTexts[outcome.outcome]}
            </h3>
            <div class="outcome-score">
              Performance Score: ${(outcome.score * 100).toFixed(0)}%
            </div>
          </div>

          <div class="outcome-impact">
            <h4>Political Impact:</h4>
            <div class="impact-list">
              ${outcome.impact.approval ? `
                <div class="impact-item">
                  Approval Rating: ${outcome.impact.approval > 0 ? '+' : ''}${outcome.impact.approval.toFixed(1)}%
                </div>
              ` : ''}
              ${outcome.impact.support ? `
                <div class="impact-item">
                  Opposition Support: ${outcome.impact.support > 0 ? '+' : ''}${outcome.impact.support.toFixed(1)}%
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <style>
          .debate-outcome-modal {
            text-align: center;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .outcome-header h3 {
            margin-bottom: var(--spacing-sm);
          }
          
          .outcome-score {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: var(--spacing-lg);
            color: var(--text-light);
          }
          
          .outcome-impact h4 {
            margin-bottom: var(--spacing-md);
            color: var(--primary-color);
          }
          
          .impact-list {
            text-align: left;
          }
          
          .impact-item {
            padding: var(--spacing-sm);
            margin-bottom: var(--spacing-xs);
            background: rgba(0, 0, 0, 0.05);
            border-radius: var(--border-radius);
          }
        </style>
      `,
      confirmText: 'Continue',
      showCancel: false,
    });

    modal.show();
  }

  showVoteResultModal(vote, outcome) {
    const resultText = outcome.passed ? 'PASSED' : 'FAILED';
    const resultColor = outcome.passed ? '#16a34a' : '#dc2626';

    const modal = new Modal({
      title: 'Vote Result',
      content: `
        <div class="vote-result-modal">
          <div class="vote-header">
            <h3>${vote.title}</h3>
            <div class="vote-result" style="color: ${resultColor};">
              ${resultText}
            </div>
          </div>
          
          <div class="vote-details">
            <div class="detail-item">
              <span class="label">Margin:</span>
              <span class="value">${outcome.margin} votes</span>
            </div>
            <div class="detail-item">
              <span class="label">Coalition Unity:</span>
              <span class="value">${outcome.coalitionUnity.toFixed(1)}%</span>
            </div>
          </div>

          <div class="vote-impact">
            <p>${outcome.passed
    ? 'The vote passed successfully, strengthening your political position.'
    : 'The vote failed, potentially weakening your government.'
}</p>
          </div>
        </div>

        <style>
          .vote-result-modal {
            text-align: center;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .vote-header h3 {
            margin-bottom: var(--spacing-sm);
          }
          
          .vote-result {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: var(--spacing-lg);
          }
          
          .vote-details {
            display: flex;
            justify-content: space-around;
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-md);
            background: rgba(0, 0, 0, 0.05);
            border-radius: var(--border-radius);
          }
          
          .detail-item {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);
          }
          
          .detail-item .label {
            font-size: 0.875rem;
            color: var(--text-light);
          }
          
          .detail-item .value {
            font-weight: 600;
          }
          
          .vote-impact {
            font-style: italic;
            color: var(--text-light);
          }
        </style>
      `,
      confirmText: 'Continue',
      showCancel: false,
    });

    modal.show();
  }

  /**
   * Show crisis modal
   */
  showCrisisModal(crisis) {
    const modal = new Modal({
      title: `🚨 Political Crisis: ${crisis.title}`,
      content: `
        <div class="crisis-modal">
          <div class="crisis-alert">
            <p><strong>Crisis Alert!</strong> Your government is facing a significant political crisis.</p>
          </div>
          
          <div class="crisis-description">
            <p>${crisis.description}</p>
          </div>

          <div class="crisis-impact">
            <h4>Potential Impact:</h4>
            <ul>
              <li>Coalition stability may be affected</li>
              <li>Public approval could decline</li>
              <li>Opposition may gain momentum</li>
              <li>International reputation at risk</li>
            </ul>
          </div>
        </div>

        <style>
          .crisis-modal {
            max-width: 500px;
            margin: 0 auto;
          }
          
          .crisis-alert {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: var(--border-radius);
            padding: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
            color: #dc2626;
          }
          
          .crisis-description {
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-md);
            background: rgba(0, 0, 0, 0.05);
            border-radius: var(--border-radius);
          }
          
          .crisis-impact h4 {
            color: var(--primary-color);
            margin-bottom: var(--spacing-sm);
          }
          
          .crisis-impact ul {
            list-style: none;
            padding: 0;
          }
          
          .crisis-impact li {
            padding: var(--spacing-xs) 0;
            position: relative;
            padding-left: var(--spacing-md);
          }
          
          .crisis-impact li:before {
            content: "⚠️";
            position: absolute;
            left: 0;
          }
        </style>
      `,
      confirmText: 'Acknowledge',
      showCancel: false,
    });

    modal.show();
  }

  /**
   * Update political status display
   */
  updatePoliticalStatusDisplay(gameState, politicalStatus) {
    // Update coalition stability display
    const coalitionElement = document.getElementById('coalition-stability');
    if (coalitionElement && politicalStatus.coalition !== undefined) {
      coalitionElement.textContent = `${politicalStatus.coalition.toFixed(1)}%`;
      coalitionElement.className = `status-value ${this.getStabilityClass(politicalStatus.coalition)}`;
    }

    // Update political pressure indicator
    const pressureElement = document.getElementById('political-pressure');
    if (pressureElement && politicalStatus.politicalPressure !== undefined) {
      pressureElement.textContent = `${politicalStatus.politicalPressure.toFixed(1)}%`;
      pressureElement.className = `pressure-value ${this.getPressureClass(politicalStatus.politicalPressure)}`;
    }
  }

  /**
   * Get CSS class for coalition stability
   */
  getStabilityClass(stability) {
    if (stability >= 80) return 'status-high';
    if (stability >= 60) return 'status-medium';
    if (stability >= 40) return 'status-low';
    return 'status-critical';
  }

  /**
   * Get CSS class for political pressure
   */
  getPressureClass(pressure) {
    if (pressure <= 20) return 'pressure-low';
    if (pressure <= 40) return 'pressure-medium';
    if (pressure <= 60) return 'pressure-high';
    return 'pressure-critical';
  }

  /**
   * Respond to debate
   */
  respondToDebate(debateId, response) {
    eventSystem.emit('opposition:debate_response', {
      debateId,
      response,
    });
  }

  /**
   * Update opposition actions list
   */
  updateOppositionActionsList() {
    const actionsContainer = document.getElementById('active-political-events');
    if (!actionsContainer) return;

    const allItems = [...this.activeEvents, ...this.oppositionActions.slice(0, 5)];

    if (allItems.length === 0) {
      actionsContainer.innerHTML = '<li>No active political events</li>';
      return;
    }

    actionsContainer.innerHTML = allItems.map((item) => {
      if (item.type && ['criticism', 'policy_proposal', 'debate_call'].includes(item.type)) {
        // Opposition action
        const iconMap = {
          criticism: '📢',
          policy_proposal: '📋',
          debate_call: '⚡',
        };

        return `
          <li class="opposition-action-item" data-action='${JSON.stringify(item)}'>
            <div class="action-summary">
              <span class="action-icon">${iconMap[item.type] || '🏛️'}</span>
              <span class="action-title">${item.title || item.message}</span>
              <span class="action-source">${item.proposedBy ? item.proposedBy.name : 'Opposition'}</span>
            </div>
          </li>
        `;
      }
      // Regular political event
      return `
          <li class="political-event-item" data-event-id="${item.id}">
            <div class="event-summary">
              <span class="event-icon">${this.getSeverityIcon(item.severity)}</span>
              <span class="event-title">${item.title}</span>
              <span class="event-deadline">Due: Week ${item.deadline.week}</span>
            </div>
          </li>
        `;
    }).join('');

    // Add click handlers
    actionsContainer.querySelectorAll('.opposition-action-item').forEach((item) => {
      item.addEventListener('click', () => {
        const actionData = JSON.parse(item.getAttribute('data-action'));
        this.showOppositionActionDetail(actionData);
      });
    });

    actionsContainer.querySelectorAll('.political-event-item').forEach((item) => {
      item.addEventListener('click', () => {
        const eventId = item.getAttribute('data-event-id');
        const event = this.activeEvents.find((e) => e.id === eventId);
        if (event) {
          this.showEventModal(event, this.lastGameState);
        }
      });
    });
  }

  /**
   * Show opposition action detail
   */
  showOppositionActionDetail(action) {
    if (action.type === 'policy_proposal') {
      this.showPolicyProposalModal(action);
    } else if (action.type === 'debate_call') {
      const debate = this.activeDebates.find((d) => d.initiator.id === action.proposedBy.id);
      if (debate) {
        this.showDebateModal(debate);
      }
    } else {
      // Show generic action modal
      const modal = new Modal({
        title: 'Opposition Action',
        content: `
          <div class="opposition-action-detail">
            <h4>${action.title || 'Opposition Statement'}</h4>
            <p>${action.message || action.description}</p>
            ${action.proposedBy ? `<p><strong>Source:</strong> ${action.proposedBy.name}</p>` : ''}
            ${action.timestamp ? `<p><small>Time: ${new Date(action.timestamp).toLocaleString()}</small></p>` : ''}
          </div>
        `,
        confirmText: 'Close',
        showCancel: false,
      });
      modal.show();
    }
  }

  /**
   * Show notification helper
   */
  showNotification(message, type = 'info') {
    eventSystem.emit('ui:notification', {
      message,
      type,
    });
  }
}

export default PoliticalEventsPanel;
