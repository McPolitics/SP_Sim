import { eventSystem } from './EventSystem';

/**
 * GameReset - Manages game reset functionality and new game setup
 */
export class GameReset {
  constructor() {
    this.eventSystem = eventSystem;
    this.difficulties = this.initializeDifficulties();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.eventSystem.on('game:reset_request', (event) => {
      this.handleResetRequest(event.data);
    });

    this.eventSystem.on('game:new_game', (event) => {
      this.startNewGame(event.data);
    });
  }

  /**
   * Initialize difficulty settings
   */
  initializeDifficulties() {
    return {
      easy: {
        id: 'easy',
        name: 'Peaceful Times',
        description: 'Start with higher approval and better economic conditions. Fewer crises.',
        icon: '🌞',
        modifiers: {
          startingApproval: 60,
          economicStability: 1.2,
          crisisFrequency: 0.5,
          approvalVolatility: 0.8,
          coalitionSupport: 1.1,
        },
        startingConditions: {
          approval: 60,
          gdpGrowth: 2.8,
          unemployment: 5.0,
          inflation: 2.0,
          debt: 55,
        },
      },
      normal: {
        id: 'normal',
        name: 'Balanced Challenge',
        description: 'Standard difficulty with realistic political and economic challenges.',
        icon: '⚖️',
        modifiers: {
          startingApproval: 50,
          economicStability: 1.0,
          crisisFrequency: 1.0,
          approvalVolatility: 1.0,
          coalitionSupport: 1.0,
        },
        startingConditions: {
          approval: 50,
          gdpGrowth: 2.1,
          unemployment: 6.0,
          inflation: 2.4,
          debt: 60,
        },
      },
      hard: {
        id: 'hard',
        name: 'Crisis Management',
        description: 'Start in difficult circumstances. More frequent crises and volatility.',
        icon: '⚡',
        modifiers: {
          startingApproval: 35,
          economicStability: 0.8,
          crisisFrequency: 1.5,
          approvalVolatility: 1.3,
          coalitionSupport: 0.9,
        },
        startingConditions: {
          approval: 35,
          gdpGrowth: 1.2,
          unemployment: 7.5,
          inflation: 3.2,
          debt: 70,
        },
      },
      expert: {
        id: 'expert',
        name: 'Political Nightmare',
        description: 'Maximum difficulty. Inherit multiple crises and unstable conditions.',
        icon: '🔥',
        modifiers: {
          startingApproval: 25,
          economicStability: 0.6,
          crisisFrequency: 2.0,
          approvalVolatility: 1.5,
          coalitionSupport: 0.8,
        },
        startingConditions: {
          approval: 25,
          gdpGrowth: 0.5,
          unemployment: 9.0,
          inflation: 4.0,
          debt: 80,
        },
      },
    };
  }

  /**
   * Handle reset request
   */
  handleResetRequest(data) {
    const { currentGameState, resetType = 'full' } = data;

    if (resetType === 'confirm') {
      this.showResetConfirmation(currentGameState);
    } else if (resetType === 'new_game') {
      this.showNewGameDialog();
    } else {
      this.performReset(currentGameState);
    }
  }

  /**
   * Show reset confirmation dialog
   */
  showResetConfirmation(currentGameState) {
    const timeInOffice = `${currentGameState.time.year} years, ${currentGameState.time.week} weeks`;

    this.eventSystem.emit('ui:show_modal', {
      title: 'Reset Game',
      content: `
        <div class="reset-confirmation">
          <div class="warning-section">
            <div class="warning-icon">⚠️</div>
            <h3>Are you sure you want to reset the game?</h3>
            <p>This action cannot be undone. All progress will be lost.</p>
          </div>
          
          <div class="current-progress">
            <h4>Current Progress:</h4>
            <div class="progress-stats">
              <div class="stat">
                <span class="label">Time in Office:</span>
                <span class="value">${timeInOffice}</span>
              </div>
              <div class="stat">
                <span class="label">Approval Rating:</span>
                <span class="value">${currentGameState.politics.approval.toFixed(1)}%</span>
              </div>
              <div class="stat">
                <span class="label">GDP Growth:</span>
                <span class="value">${currentGameState.economy.gdpGrowth.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div class="reset-options">
            <h4>Reset Options:</h4>
            <div class="option-buttons">
              <button class="reset-option-btn" data-type="full">
                <div class="option-icon">🔄</div>
                <div class="option-text">
                  <strong>Full Reset</strong>
                  <span>Start completely over</span>
                </div>
              </button>
              <button class="reset-option-btn" data-type="new_game">
                <div class="option-icon">🆕</div>
                <div class="option-text">
                  <strong>New Game</strong>
                  <span>Choose difficulty & settings</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        <style>
          .reset-confirmation {
            max-width: 500px;
            margin: 0 auto;
          }
          .warning-section {
            text-align: center;
            margin-bottom: var(--spacing-lg);
            padding: var(--spacing-md);
            background: rgba(229, 62, 62, 0.1);
            border-radius: var(--border-radius);
            border: 1px solid rgba(229, 62, 62, 0.3);
          }
          .warning-icon {
            font-size: 2rem;
            margin-bottom: var(--spacing-sm);
          }
          .warning-section h3 {
            color: var(--accent-color);
            margin: 0 0 var(--spacing-sm) 0;
          }
          .current-progress {
            margin-bottom: var(--spacing-lg);
          }
          .progress-stats {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);
          }
          .stat {
            display: flex;
            justify-content: space-between;
            padding: var(--spacing-xs) 0;
            border-bottom: 1px solid var(--border-light);
          }
          .stat:last-child {
            border-bottom: none;
          }
          .label {
            color: var(--text-light);
          }
          .value {
            font-weight: 600;
            color: var(--text-color);
          }
          .reset-options h4 {
            margin-bottom: var(--spacing-md);
          }
          .option-buttons {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
          }
          .reset-option-btn {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            width: 100%;
            padding: var(--spacing-md);
            border: 2px solid var(--border-color);
            background: var(--surface-color);
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: all var(--transition-base);
          }
          .reset-option-btn:hover {
            border-color: var(--secondary-color);
            background: var(--background-alt);
          }
          .option-icon {
            font-size: 1.5rem;
          }
          .option-text {
            text-align: left;
          }
          .option-text strong {
            display: block;
            color: var(--text-color);
            margin-bottom: var(--spacing-xs);
          }
          .option-text span {
            color: var(--text-light);
            font-size: 0.875rem;
          }
        </style>
      `,
      confirmText: 'Cancel',
      showCancel: false,
      onConfirm: () => true, // Just close the dialog
    });
  }

  /**
   * Show new game dialog with difficulty selection
   */
  showNewGameDialog() {
    const difficultyOptions = Object.values(this.difficulties).map((difficulty) => `
      <div class="difficulty-option" data-difficulty="${difficulty.id}">
        <div class="difficulty-header">
          <span class="difficulty-icon">${difficulty.icon}</span>
          <h4>${difficulty.name}</h4>
        </div>
        <p class="difficulty-description">${difficulty.description}</p>
        <div class="difficulty-stats">
          <div class="stat-item">
            <span>Starting Approval:</span>
            <span>${difficulty.startingConditions.approval}%</span>
          </div>
          <div class="stat-item">
            <span>GDP Growth:</span>
            <span>${difficulty.startingConditions.gdpGrowth}%</span>
          </div>
          <div class="stat-item">
            <span>Unemployment:</span>
            <span>${difficulty.startingConditions.unemployment}%</span>
          </div>
        </div>
      </div>
    `).join('');

    this.eventSystem.emit('ui:show_modal', {
      title: 'New Game Setup',
      content: `
        <div class="new-game-setup">
          <div class="setup-section">
            <h3>Choose Difficulty Level</h3>
            <p>Select the challenge level for your political career:</p>
            <div class="difficulty-grid">
              ${difficultyOptions}
            </div>
          </div>

          <div class="setup-section">
            <h3>Game Options</h3>
            <div class="game-options">
              <label class="option-checkbox">
                <input type="checkbox" id="tutorial-enabled" checked>
                <span>Enable tutorial and hints</span>
              </label>
              <label class="option-checkbox">
                <input type="checkbox" id="auto-save" checked>
                <span>Enable auto-save every 4 weeks</span>
              </label>
              <label class="option-checkbox">
                <input type="checkbox" id="crisis-events" checked>
                <span>Enable random crisis events</span>
              </label>
            </div>
          </div>
        </div>

        <style>
          .new-game-setup {
            max-width: 600px;
            margin: 0 auto;
          }
          .setup-section {
            margin-bottom: var(--spacing-xl);
          }
          .setup-section h3 {
            color: var(--primary-color);
            margin-bottom: var(--spacing-sm);
          }
          .difficulty-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-md);
            margin-top: var(--spacing-md);
          }
          .difficulty-option {
            padding: var(--spacing-md);
            border: 2px solid var(--border-color);
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: all var(--transition-base);
            background: var(--surface-color);
          }
          .difficulty-option:hover {
            border-color: var(--secondary-color);
            background: var(--background-alt);
          }
          .difficulty-option.selected {
            border-color: var(--secondary-color);
            background: rgba(49, 130, 206, 0.1);
          }
          .difficulty-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-sm);
          }
          .difficulty-icon {
            font-size: 1.5rem;
          }
          .difficulty-header h4 {
            margin: 0;
            color: var(--text-color);
          }
          .difficulty-description {
            color: var(--text-light);
            font-size: 0.875rem;
            margin-bottom: var(--spacing-sm);
          }
          .difficulty-stats {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);
          }
          .stat-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
          }
          .stat-item span:first-child {
            color: var(--text-light);
          }
          .stat-item span:last-child {
            font-weight: 600;
            color: var(--text-color);
          }
          .game-options {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
          }
          .option-checkbox {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            cursor: pointer;
          }
          .option-checkbox input {
            margin: 0;
          }
          
          @media (max-width: 768px) {
            .difficulty-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
      `,
      confirmText: 'Start New Game',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: () => {
        const selectedDifficulty = document.querySelector('.difficulty-option.selected');
        if (!selectedDifficulty) {
          // Show error
          return false;
        }

        const difficultyId = selectedDifficulty.getAttribute('data-difficulty');
        const options = {
          tutorial: document.getElementById('tutorial-enabled')?.checked || false,
          autoSave: document.getElementById('auto-save')?.checked || false,
          crisisEvents: document.getElementById('crisis-events')?.checked || false,
        };

        this.startNewGame({ difficulty: difficultyId, options });
        return true;
      },
    });

    // Add click handlers for difficulty selection
    setTimeout(() => {
      const difficultyOptionElements = document.querySelectorAll('.difficulty-option');
      difficultyOptionElements.forEach((option) => {
        option.addEventListener('click', () => {
          difficultyOptionElements.forEach((opt) => opt.classList.remove('selected'));
          option.classList.add('selected');
        });
      });

      // Select normal difficulty by default
      const normalOption = document.querySelector('[data-difficulty="normal"]');
      if (normalOption) {
        normalOption.classList.add('selected');
      }
    }, 100);
  }

  /**
   * Start a new game with selected difficulty
   */
  startNewGame(config = {}) {
    const difficulty = this.difficulties[config.difficulty || 'normal'];
    const options = config.options || {};

    // Create new game state with difficulty modifiers
    const newGameState = this.createNewGameState(difficulty, options);

    this.eventSystem.emit('game:reset', {
      newGameState,
      difficulty,
      options,
    });

    this.eventSystem.emit('ui:notification', {
      message: `New game started on ${difficulty.name} difficulty!`,
      type: 'success',
    });
  }

  /**
   * Create new game state with difficulty settings
   */
  createNewGameState(difficulty, options) {
    const now = new Date();
    const conditions = difficulty.startingConditions;

    return {
      version: '1.0.0',
      difficulty: difficulty.id,
      options,
      player: {
        name: 'Player',
        party: 'Independent',
        experience: 0,
        skills: {
          economics: { level: 1, experience: 0 },
          diplomacy: { level: 1, experience: 0 },
          communication: { level: 1, experience: 0 },
          leadership: { level: 1, experience: 0 },
        },
      },
      country: {
        name: 'Democracia',
        population: 50000000,
        gdp: 1000000000000, // $1 trillion
        debt: (conditions.debt / 100) * 1000000000000, // Debt as percentage of GDP
        stability: 75,
      },
      economy: {
        gdpGrowth: conditions.gdpGrowth,
        unemployment: conditions.unemployment,
        inflation: conditions.inflation,
        interestRate: 3.5,
        sectors: {
          agriculture: 5,
          manufacturing: 25,
          services: 70,
        },
      },
      politics: {
        approval: conditions.approval,
        coalition: [
          { party: 'Government', support: 45 * difficulty.modifiers.coalitionSupport },
          { party: 'Coalition Partner', support: 22 * difficulty.modifiers.coalitionSupport },
        ],
        opposition: [
          { party: 'Main Opposition', support: 30 },
          { party: 'Minor Opposition', support: 3 },
        ],
        nextElection: { year: 4, week: 1 },
        nextVote: null,
      },
      global: {
        relations: {
          'United Federation': 75,
          'Eastern Empire': 60,
          'Southern Union': 80,
        },
        tradeBalance: 15000000000, // $15 billion surplus
        internationalStanding: 'Good',
      },
      time: {
        startDate: now.toISOString(),
        currentDate: now.toISOString(),
        week: 1,
        year: 1,
      },
      events: {
        recent: [{
          id: Date.now(),
          title: 'Game Started',
          description: `Welcome to SP_Sim! You've been elected as the new leader. Starting difficulty: ${difficulty.name}`,
          type: 'system',
          severity: 'neutral',
          week: 1,
          year: 1,
          timestamp: now.toISOString(),
        }],
        pending: [],
      },
      scandals: {
        active: [],
        resolved: [],
      },
      achievements: {
        unlocked: [],
        progress: {},
      },
      gameEnded: false,
      endCondition: null,
    };
  }

  /**
   * Perform full reset to default state
   */
  performReset(_currentGameState) {
    this.startNewGame({ difficulty: 'normal' });
  }

  /**
   * Get available difficulties
   */
  getDifficulties() {
    return Object.values(this.difficulties);
  }

  /**
   * Get difficulty by ID
   */
  getDifficulty(id) {
    return this.difficulties[id];
  }
}

// Create and export singleton instance
export const gameReset = new GameReset();
