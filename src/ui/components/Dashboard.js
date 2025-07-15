import { BaseComponent } from './BaseComponent';
import { eventSystem, EVENTS } from '../../core/EventSystem';

/**
 * Dashboard - Main game interface component
 * Handles display of economic, political, and global indicators
 */

// Constants for calculations
const WEEKS_PER_YEAR = 52;
const DEFAULT_ELECTION_CYCLE_YEARS = 4; // Default election cycle in years
const TIME_PRESSURE_MULTIPLIER = 0.5; // Multiplier for time pressure calculation

export class Dashboard extends BaseComponent {
  constructor() {
    super();
    this.initializeElements();
    this.setupEventListeners();
  }

  /**
   * Initialize dashboard elements
   */
  initializeElements() {
    // Header elements
    this.gameTimeElement = document.getElementById('game-time');
    this.approvalRatingElement = document.getElementById('approval-rating');
    this.nextElectionElement = document.getElementById('next-election');

    // Economic panel elements
    this.gdpGrowthElement = document.getElementById('gdp-growth');
    this.unemploymentElement = document.getElementById('unemployment');
    this.inflationElement = document.getElementById('inflation');
    this.nationalDebtElement = document.getElementById('national-debt');

    // Political panel elements
    this.coalitionSupportElement = document.getElementById('coalition-support');
    this.coalitionStabilityElement = document.getElementById('coalition-stability');
    this.oppositionElement = document.getElementById('opposition');
    this.politicalPressureElement = document.getElementById('political-pressure');
    this.independentsElement = document.getElementById('independents');
    this.nextVoteElement = document.getElementById('next-vote');

    // Global panel elements
    this.intlStandingElement = document.getElementById('intl-standing');
    this.tradeBalanceElement = document.getElementById('trade-balance');
    this.diplomaticRelationsElement = document.getElementById('diplomatic-relations');

    // Events and decisions
    this.recentEventsElement = document.getElementById('recent-events');
    this.pendingDecisionsElement = document.getElementById('pending-decisions');

    // Game controls
    this.pauseBtn = document.getElementById('pause-btn');
    this.nextTurnBtn = document.getElementById('next-turn-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.loadBtn = document.getElementById('load-btn');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for game state updates
    eventSystem.on(EVENTS.UI_UPDATE, (event) => {
      this.update(event.data.gameState);
    });

    eventSystem.on(EVENTS.TURN_END, (event) => {
      this.update(event.data.gameState);
    });

    // Listen for game start/reset events
    eventSystem.on(EVENTS.GAME_START, (event) => {
      if (event.data && event.data.gameState) {
        this.update(event.data.gameState);
      }
    });

    // Game control buttons
    if (this.pauseBtn) {
      this.addEventListener(this.pauseBtn, 'click', () => {
        this.handlePauseToggle();
      });
    }

    if (this.nextTurnBtn) {
      this.addEventListener(this.nextTurnBtn, 'click', () => {
        eventSystem.emit(EVENTS.GAME_START); // Trigger next turn
      });
    }

    if (this.saveBtn) {
      this.addEventListener(this.saveBtn, 'click', () => {
        this.handleSaveGame();
      });
    }

    if (this.loadBtn) {
      this.addEventListener(this.loadBtn, 'click', () => {
        this.handleLoadGame();
      });
    }
  }

  /**
   * Update dashboard with current game state
   */
  update(gameState) {
    if (!gameState) {
      console.warn('Dashboard update called with no game state');
      return;
    }

    try {
      this.updateHeader(gameState);
      this.updateEconomicPanel(gameState);
      this.updatePoliticalPanel(gameState);
      this.updateGlobalPanel(gameState);
      this.updateEvents(gameState);
    } catch (error) {
      console.error('Error updating dashboard:', error);
    }
  }

  /**
   * Update header information
   */
  updateHeader(gameState) {
    if (this.gameTimeElement) {
      this.gameTimeElement.textContent = `Week ${gameState.time.week}, Year ${gameState.time.year}`;
    }

    if (this.approvalRatingElement) {
      const { approval } = gameState.politics;
      this.approvalRatingElement.textContent = `Approval: ${this.formatPercentage(approval)}`;

      // Add color coding
      this.approvalRatingElement.className = '';
      if (approval >= 60) {
        this.approvalRatingElement.classList.add('text-success');
      } else if (approval >= 40) {
        // Default color
      } else {
        this.approvalRatingElement.classList.add('text-danger');
      }
    }

    if (this.nextElectionElement) {
      const election = gameState.politics.nextElection;
      const weeksUntil = (election.year - gameState.time.year) * 52 + (election.week - gameState.time.week);
      this.nextElectionElement.textContent = `Next Election: ${weeksUntil}w`;
    }
  }

  /**
   * Update economic panel
   */
  updateEconomicPanel(gameState) {
    const { economy } = gameState;

    if (this.gdpGrowthElement) {
      const growth = economy.gdpGrowth;
      this.gdpGrowthElement.textContent = `${growth >= 0 ? '+' : ''}${this.formatNumber(growth, 1)}%`;
      this.gdpGrowthElement.className = growth >= 0 ? 'text-success' : 'text-danger';
    }

    if (this.unemploymentElement) {
      this.unemploymentElement.textContent = this.formatPercentage(economy.unemployment);
    }

    if (this.inflationElement) {
      const { inflation } = economy;
      this.inflationElement.textContent = this.formatPercentage(inflation, 1);
      this.inflationElement.className = '';
      if (inflation > 4) {
        this.inflationElement.classList.add('text-warning');
      } else if (inflation < 1) {
        this.inflationElement.classList.add('text-danger');
      }
    }

    if (this.nationalDebtElement) {
      const debtRatio = (gameState.country.debt / gameState.country.gdp) * 100;
      this.nationalDebtElement.textContent = `${this.formatPercentage(debtRatio)} of GDP`;

      if (debtRatio > 90) {
        this.nationalDebtElement.className = 'text-danger';
      } else if (debtRatio > 70) {
        this.nationalDebtElement.className = 'text-warning';
      } else {
        this.nationalDebtElement.className = '';
      }
    }
  }

  /**
   * Update political panel
   */
  updatePoliticalPanel(gameState) {
    const { politics } = gameState;

    if (this.coalitionSupportElement) {
      const coalitionSupport = politics.coalition.reduce((sum, party) => sum + party.support, 0);
      this.coalitionSupportElement.textContent = this.formatPercentage(coalitionSupport);
    }

    if (this.coalitionStabilityElement) {
      // Calculate coalition stability based on support distribution and approval
      const coalitionSupport = politics.coalition.reduce((sum, party) => sum + party.support, 0);
      const minPartySupport = Math.min(...politics.coalition.map((party) => party.support));
      const maxPartySupport = Math.max(...politics.coalition.map((party) => party.support));
      const balanceRatio = coalitionSupport > 0 ? minPartySupport / maxPartySupport : 0;
      const approvalFactor = politics.approval / 100;
      const stability = Math.min(100, (balanceRatio * 50 + approvalFactor * 50));

      this.coalitionStabilityElement.textContent = this.formatPercentage(stability);

      // Add color coding for stability
      this.coalitionStabilityElement.className = '';
      if (stability >= 70) {
        this.coalitionStabilityElement.classList.add('text-success');
      } else if (stability >= 40) {
        // Default color
      } else {
        this.coalitionStabilityElement.classList.add('text-danger');
      }
    }

    if (this.oppositionElement) {
      const oppositionSupport = politics.opposition.reduce((sum, party) => sum + party.support, 0);
      this.oppositionElement.textContent = this.formatPercentage(oppositionSupport);
    }

    if (this.politicalPressureElement) {
      // Calculate political pressure based on opposition strength, approval, and time to election
      const oppositionSupport = politics.opposition.reduce((sum, party) => sum + party.support, 0);
      const approvalPressure = Math.max(0, 50 - politics.approval); // Pressure increases as approval drops below 50%
      const oppositionPressure = oppositionSupport * 0.5; // Opposition support creates pressure
      const electionYear = politics.nextElection ? politics.nextElection.year : DEFAULT_ELECTION_CYCLE_YEARS;
      const timeToElection = Math.max(1, (electionYear - gameState.time.year) * WEEKS_PER_YEAR + (politics.nextElection?.week || 1) - gameState.time.week);
      const timePressure = Math.max(0, WEEKS_PER_YEAR - timeToElection) * TIME_PRESSURE_MULTIPLIER; // Pressure increases as election approaches

      const totalPressure = Math.min(100, approvalPressure + oppositionPressure + timePressure);
      this.politicalPressureElement.textContent = this.formatPercentage(totalPressure);

      // Add color coding for pressure
      this.politicalPressureElement.className = '';
      if (totalPressure >= 70) {
        this.politicalPressureElement.classList.add('text-danger');
      } else if (totalPressure >= 40) {
        this.politicalPressureElement.classList.add('text-warning');
      } else {
        this.politicalPressureElement.classList.add('text-success');
      }
    }

    if (this.independentsElement) {
      const totalSupport = [...politics.coalition, ...politics.opposition]
        .reduce((sum, party) => sum + party.support, 0);
      const independents = Math.max(0, 100 - totalSupport);
      this.independentsElement.textContent = this.formatPercentage(independents);
    }

    if (this.nextVoteElement) {
      this.nextVoteElement.textContent = politics.nextVote ? politics.nextVote : 'None scheduled';
    }
  }

  /**
   * Update global panel
   */
  updateGlobalPanel(gameState) {
    const { global } = gameState;

    if (this.intlStandingElement) {
      this.intlStandingElement.textContent = global.internationalStanding;
    }

    if (this.tradeBalanceElement) {
      const balance = global.tradeBalance;
      this.tradeBalanceElement.textContent = `${this.formatCurrency(balance / 1000000000, 'USD')}B`;
      this.tradeBalanceElement.className = balance >= 0 ? 'text-success' : 'text-danger';
    }

    if (this.diplomaticRelationsElement) {
      const avgRelation = Object.values(global.relations).reduce((sum, val) => sum + val, 0)
                          / Object.values(global.relations).length;
      this.diplomaticRelationsElement.textContent = this.formatNumber(avgRelation);
    }
  }

  /**
   * Update events and decisions
   */
  updateEvents(gameState) {
    // Update recent events
    if (this.recentEventsElement) {
      this.recentEventsElement.innerHTML = '';
      const events = gameState.events.recent.slice(-5); // Show last 5 events

      if (events.length === 0) {
        const li = this.createElement('li', '', 'No recent events');
        this.recentEventsElement.appendChild(li);
      } else {
        events.forEach((event) => {
          const li = this.createElement(
            'li',
            `event-item type-${event.type} severity-${event.severity}`,
            event.message || event.description,
          );

          // Mini message with timestamp
          const timestampSpan = this.createElement(
            'span',
            'event-timestamp',
            ` (${new Date(event.timestamp).toLocaleTimeString()})`,
          );
          li.appendChild(timestampSpan);
          this.recentEventsElement.appendChild(li);
        });
      }
    }

    // Update pending decisions
    if (this.pendingDecisionsElement) {
      this.pendingDecisionsElement.innerHTML = '';
      const decisions = gameState.events.pending;

      if (decisions.length === 0) {
        const li = this.createElement('li', '', 'No pending decisions');
        this.pendingDecisionsElement.appendChild(li);
      } else {
        decisions.forEach((decision) => {
          const li = this.createElement('li', 'decision-item', decision.description || decision);
          this.addEventListener(li, 'click', () => {
            this.handleDecisionClick(decision);
          });
          this.pendingDecisionsElement.appendChild(li);
        });
      }
    }
  }

  /**
   * Handle pause/resume toggle
   */
  handlePauseToggle() {
    // This will be handled by the main game controller
    eventSystem.emit('game:pause_toggle');
  }

  /**
   * Handle save game
   */
  handleSaveGame() {
    const saveName = prompt('Enter a name for your save:');
    if (saveName !== null) {
      eventSystem.emit(EVENTS.GAME_SAVE, { saveName });
    }
  }

  /**
   * Handle load game
   */
  handleLoadGame() {
    // This would typically open a load game dialog
    // For now, we'll just emit an event
    eventSystem.emit('ui:load_game_dialog');
  }

  /**
   * Handle decision click
   */
  handleDecisionClick(decision) {
    // This would typically open a decision dialog
    eventSystem.emit('ui:decision_dialog', { decision });
    console.log('Decision clicked:', decision);
  }
}

export default Dashboard;
