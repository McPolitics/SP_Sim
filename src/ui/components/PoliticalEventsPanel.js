import { BaseComponent } from './BaseComponent';
import { eventSystem } from '../../core/EventSystem';
import { Modal } from './Modal';

/**
 * PoliticalEventsPanel - Displays and handles political events and decisions
 */
export class PoliticalEventsPanel extends BaseComponent {
  constructor() {
    super();
    this.activeEvents = [];
    this.coalitionStability = 100;
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
  }

  /**
   * Update panel with current political status
   */
  update(gameState, politicalStatus) {
    this.coalitionStability = politicalStatus.coalition;
    this.updatePoliticalStatusDisplay(gameState, politicalStatus);
    this.updateActiveEventsList();
  }

  /**
   * Handle new political event being triggered
   */
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
    this.activeEvents = this.activeEvents.filter(e => e.id !== event.id);
    this.updateActiveEventsList();
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
    const optionsHtml = event.options.map(option => `
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
      options.forEach(option => {
        option.addEventListener('click', () => {
          options.forEach(opt => opt.classList.remove('selected'));
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
      gameState
    });
  }

  /**
   * Show event notification
   */
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
   * Show vote result modal
   */
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
            <p>${outcome.passed ? 
              'The vote passed successfully, strengthening your political position.' : 
              'The vote failed, potentially weakening your government.'
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
    if (coalitionElement) {
      coalitionElement.textContent = `${politicalStatus.coalition.toFixed(1)}%`;
      coalitionElement.className = `status-value ${this.getStabilityClass(politicalStatus.coalition)}`;
    }

    // Update political pressure indicator
    const pressureElement = document.getElementById('political-pressure');
    if (pressureElement) {
      pressureElement.textContent = `${politicalStatus.politicalPressure}%`;
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
   * Update active events list
   */
  updateActiveEventsList() {
    const eventsContainer = document.getElementById('active-political-events');
    if (!eventsContainer) return;

    if (this.activeEvents.length === 0) {
      eventsContainer.innerHTML = '<li>No active political events</li>';
      return;
    }

    eventsContainer.innerHTML = this.activeEvents.map(event => `
      <li class="political-event-item" data-event-id="${event.id}">
        <div class="event-summary">
          <span class="event-icon">${this.getSeverityIcon(event.severity)}</span>
          <span class="event-title">${event.title}</span>
          <span class="event-deadline">Due: Week ${event.deadline.week}</span>
        </div>
      </li>
    `).join('');

    // Add click handlers for event items
    eventsContainer.querySelectorAll('.political-event-item').forEach(item => {
      item.addEventListener('click', () => {
        const eventId = item.getAttribute('data-event-id');
        const event = this.activeEvents.find(e => e.id === eventId);
        if (event) {
          this.showEventModal(event, this.lastGameState);
        }
      });
    });
  }

  /**
   * Show notification helper
   */
  showNotification(message, type = 'info') {
    eventSystem.emit('ui:notification', {
      message,
      type
    });
  }
}

export default PoliticalEventsPanel;