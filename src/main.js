/**
 * SP_Sim - Main Application Entry Point
 * Initializes the game engine and UI components
 */

import { gameEngine } from './core/GameEngine';
import { eventSystem, EVENTS } from './core/EventSystem';
import { aiOpposition } from './core/AIOpposition';
import { playerAnalytics } from './core/PlayerAnalytics';
import { monetizationFramework } from './core/MonetizationFramework';
import { policyImplementationEngine } from './core/PolicyImplementationEngine';
import { Dashboard } from './ui/components/Dashboard';
import { Navigation } from './ui/components/Navigation';
import { Modal } from './ui/components/Modal';
import { EconomicsScreen } from './ui/components/EconomicsScreen';
import { PolicyScreen } from './ui/components/PolicyScreen';
import { AnalyticsScreen } from './ui/components/AnalyticsScreen';
import { DebugPanel } from './ui/components/DebugPanel';
import { Timeline } from './ui/components/Timeline';
import { PlayerGuide } from './ui/components/PlayerGuide';
import { StartingScreen } from './ui/components/StartingScreen';
import { PoliticalEventsPanel } from './ui/components/PoliticalEventsPanel';
import { SettingsScreen } from './ui/components/SettingsScreen';
import { PoliticsScreen } from './ui/components/PoliticsScreen';
import { CrisisManagementScreen } from './ui/components/CrisisManagementScreen';
import { GlobalRelationsScreen } from './ui/components/GlobalRelationsScreen';

/**
 * Main application class
 */
class SPSimApp {
  constructor() {
    this.gameEngine = gameEngine;
    this.eventSystem = eventSystem;
    this.aiOpposition = aiOpposition;
    this.playerAnalytics = playerAnalytics;
    this.monetizationFramework = monetizationFramework;
    this.policyImplementationEngine = policyImplementationEngine;
    this.dashboard = null;
    this.navigation = null;
    this.economicsScreen = null;
    this.policyScreen = null;
    this.analyticsScreen = null;
    this.debugPanel = null;
    this.timeline = null;
    this.playerGuide = null;
    this.startingScreen = null;
    this.politicalEventsPanel = null;
    this.settingsScreen = null;
    this.politicsScreen = null;
    this.crisisManagementScreen = null;
    this.globalRelationsScreen = null;
    this.currentScreen = 'dashboard';
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      console.log('🎮 Starting SP_Sim - Political Economy Simulation');

      // Initialize starting screen first
      this.startingScreen = new StartingScreen();

      // Always initialize UI components so they're ready when game starts
      this.initializeUI();

      // Show starting screen for new players
      const showStartingScreen = this.startingScreen.show();

      if (!showStartingScreen) {
        // Existing player - proceed with normal initialization
        this.initializeGameForExistingPlayer();
      } else {
        // Initialize game engine but don't start it yet
        this.gameEngine.initialize();
        // Setup global event listeners
        this.setupEventListeners();
        // Setup error handling
        this.setupErrorHandling();
        this.isInitialized = true;
        console.log('✅ SP_Sim initialized successfully (with starting screen)');
      }
      // If starting screen is shown, game initialization will happen after difficulty selection
    } catch (error) {
      console.error('❌ Failed to initialize SP_Sim:', error);
      this.showError('Failed to initialize game. Please refresh the page.');
    }
  }

  /**
   * Initialize game for existing players (skip starting screen)
   */
  initializeGameForExistingPlayer() {
    // Initialize game engine
    this.gameEngine.initialize();

    // Initialize UI components
    this.initializeUI();

    // Setup global event listeners
    this.setupEventListeners();

    // Setup error handling
    this.setupErrorHandling();

    // Start the game
    this.gameEngine.start();

    this.isInitialized = true;
    console.log('✅ SP_Sim initialized successfully');

    // Initial UI update
    this.updateUI();

    // Force update after a short delay to ensure game state is ready
    setTimeout(() => {
      this.updateUI();
    }, 100);
  }

  /**
   * Initialize UI components
   */
  initializeUI() {
    // Initialize navigation
    this.navigation = new Navigation();

    // Initialize dashboard
    this.dashboard = new Dashboard();

    // Initialize economics screen
    this.economicsScreen = new EconomicsScreen();

    // Initialize policy screen
    this.policyScreen = new PolicyScreen();

    // Initialize timeline component
    this.timeline = new Timeline();

    // Initialize player guide
    this.playerGuide = new PlayerGuide();

    // Initialize political events panel
    this.politicalEventsPanel = new PoliticalEventsPanel();

    // Initialize analytics screen
    this.analyticsScreen = new AnalyticsScreen();

    // Initialize settings screen
    this.settingsScreen = new SettingsScreen();

    // Initialize politics screen
    this.politicsScreen = new PoliticsScreen();

    // Initialize crisis management screen
    this.crisisManagementScreen = new CrisisManagementScreen();

    // Initialize global relations screen
    this.globalRelationsScreen = new GlobalRelationsScreen();

    // Initialize debug panel (only in debug mode)
    // eslint-disable-next-line no-undef
    if (typeof __ENABLE_DEBUG__ !== 'undefined' && __ENABLE_DEBUG__) {
      this.debugPanel = new DebugPanel();
      console.log('🔧 Debug panel enabled');
    }

    // Setup screen management
    this.setupScreenManagement();

    // Add timeline to dashboard
    this.addTimelineToDashboard();

    console.log('✅ UI components initialized');
  }

  /**
   * Add timeline to dashboard
   */
  addTimelineToDashboard() {
    const dashboardScreen = document.querySelector('#screen-dashboard');
    if (dashboardScreen && this.timeline) {
      // Add timeline after the main dashboard content
      const dashboard = dashboardScreen.querySelector('.dashboard');
      if (dashboard) {
        dashboard.appendChild(this.timeline.show());
      }
    }
  }

  /**
   * Setup screen management
   */
  setupScreenManagement() {
    // Listen for navigation events
    this.eventSystem.on(EVENTS.UI_UPDATE, (event) => {
      if (event.data.type === 'navigation') {
        this.switchToScreen(event.data.to);
      }
    });

    // Setup URL-based routing
    window.addEventListener('popstate', (event) => {
      const screen = event.state?.screen || 'dashboard';
      this.switchToScreen(screen, false);
    });

    // Handle initial URL
    const hash = window.location.hash.replace('#', '');
    if (hash && this.navigation.screens[hash]) {
      this.switchToScreen(hash, false);
    }
  }

  /**
   * Switch to a different screen
   */
  switchToScreen(screenId, _updateHistory = true) {
    if (this.currentScreen === screenId) return;

    // Handle help screen specially
    if (screenId === 'help') {
      this.showPlayerGuide();
      return;
    }

    // Hide all screens first
    document.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.remove('screen--active');
    });

    // Handle specific screens that need special initialization
    if (screenId === 'policies' && this.policyScreen) {
      this.showPolicyScreen();
    } else if (screenId === 'politics' && this.politicsScreen) {
      // Show politics screen
      const targetScreen = document.querySelector(`#screen-${screenId}`);
      if (targetScreen) {
        targetScreen.classList.add('screen--active');
        this.politicsScreen.show();
        // Update politics screen with current game state
        if (this.gameEngine && this.gameEngine.getGameState) {
          this.politicsScreen.update(this.gameEngine.getGameState());
        }
      } else {
        this.createScreenPlaceholder(screenId);
      }
    } else if (screenId === 'economy' && this.economicsScreen) {
      // Show target screen
      const targetScreen = document.querySelector(`#screen-${screenId}`);
      if (targetScreen) {
        targetScreen.classList.add('screen--active');
        this.economicsScreen.show();
      } else {
        this.createScreenPlaceholder(screenId);
      }
    } else if (screenId === 'analytics' && this.analyticsScreen) {
      // Show analytics screen
      const targetScreen = document.querySelector(`#screen-${screenId}`);
      if (targetScreen) {
        targetScreen.classList.add('screen--active');
        // Track analytics navigation
        this.playerAnalytics.trackFeatureUsage('analytics');
      } else {
        this.createScreenPlaceholder(screenId);
      }
    } else if (screenId === 'crisis' && this.crisisManagementScreen) {
      // Show crisis management screen
      const targetScreen = document.querySelector(`#screen-${screenId}`);
      if (targetScreen) {
        targetScreen.classList.add('screen--active');
        this.crisisManagementScreen.show();
        // Update crisis screen with current game state
        if (this.gameEngine && this.gameEngine.getGameState) {
          this.crisisManagementScreen.update(this.gameEngine.getGameState());
        }
      } else {
        this.createScreenPlaceholder(screenId);
      }
    } else if (screenId === 'global' && this.globalRelationsScreen) {
      // Show global relations screen
      const targetScreen = document.querySelector(`#screen-${screenId}`);
      if (targetScreen) {
        targetScreen.classList.add('screen--active');
        this.globalRelationsScreen.show();
        // Update global relations screen with current game state
        if (this.gameEngine && this.gameEngine.getGameState) {
          this.globalRelationsScreen.update(this.gameEngine.getGameState());
        }
      } else {
        this.createScreenPlaceholder(screenId);
      }
    } else {
      // Show target screen
      const targetScreen = document.querySelector(`#screen-${screenId}`);
      if (targetScreen) {
        targetScreen.classList.add('screen--active');
      } else {
        // Create screen placeholder if it doesn't exist
        this.createScreenPlaceholder(screenId);
      }
    }

    this.currentScreen = screenId;

    // Update navigation state
    if (this.navigation) {
      this.navigation.currentScreen = screenId;
    }

    console.log(`Switched to screen: ${screenId}`);
  }

  /**
   * Show player guide
   */
  showPlayerGuide() {
    if (this.playerGuide) {
      this.playerGuide.showModal();
    }
  }

  /**
   * Show policy screen
   */
  showPolicyScreen() {
    if (this.policyScreen) {
      // Get policy screen container
      const policyContainer = document.querySelector('#screen-policies');
      if (policyContainer) {
        // Make sure the screen is active
        policyContainer.classList.add('screen--active');

        // Find the policy-screen div inside
        let policyScreenDiv = policyContainer.querySelector('.policy-screen');
        if (!policyScreenDiv) {
          policyScreenDiv = document.createElement('div');
          policyScreenDiv.className = 'policy-screen';
          policyContainer.appendChild(policyScreenDiv);
        }

        // Render policy screen content
        policyScreenDiv.innerHTML = this.policyScreen.render();

        // Setup interactivity
        this.policyScreen.setupInteractivity();

        // Update with current game state
        if (this.gameEngine && this.gameEngine.getGameState) {
          this.policyScreen.update(this.gameEngine.getGameState());
        }
      }
    }
  }

  /**
   * Create a placeholder screen for future implementation
   */
  createScreenPlaceholder(screenId) {
    const screenName = this.navigation?.screens[screenId] || screenId;
    const placeholder = document.createElement('div');
    placeholder.id = `screen-${screenId}`;
    placeholder.className = 'screen screen--active';
    placeholder.innerHTML = `
      <div class="panel">
        <h2 class="panel__title">${screenName}</h2>
        <div class="panel__content">
          <p>This screen is under development and will be available in a future update.</p>
          <p>Screen: <strong>${screenName}</strong></p>
        </div>
      </div>
    `;

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.appendChild(placeholder);
    }
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Game state events
    this.eventSystem.on(EVENTS.GAME_START, () => {
      this.updateUI();
    });

    this.eventSystem.on(EVENTS.TURN_END, () => {
      this.updateUI();
    });

    // Game control events
    this.eventSystem.on('game:pause_toggle', () => {
      this.handlePauseToggle();
    });

    this.eventSystem.on(EVENTS.GAME_SAVE, (event) => {
      this.handleSaveGame(event.data.saveName);
    });

    // UI events
    this.eventSystem.on('ui:load_game_dialog', () => {
      this.showLoadGameDialog();
    });

    this.eventSystem.on('ui:decision_dialog', (event) => {
      this.showDecisionDialog(event.data.decision);
    });

    // Error handling
    this.eventSystem.on(EVENTS.UI_ERROR, (event) => {
      this.showError(event.data.message);
    });

    // Notification handling
    this.eventSystem.on(EVENTS.UI_NOTIFICATION, (event) => {
      this.showNotification(event.data.message, event.data.type);
    });

    // Achievement notifications
    this.eventSystem.on('achievement:unlocked', (event) => {
      const { achievement } = event.data;
      this.showNotification(
        `🏆 Achievement Unlocked: ${achievement.title}`,
        'success',
      );
    });

    // Game end handling
    this.eventSystem.on('ui:game_end', (event) => {
      this.showGameEndDialog(event.data.endCondition);
    });

    // Political events
    this.eventSystem.on('political:vote_scheduled', (_event) => {
      this.showNotification('New political vote scheduled!', 'info');
    });

    this.eventSystem.on('political:crisis_triggered', (event) => {
      this.showNotification(`Political Crisis: ${event.data.crisis.title}`, 'warning');
    });

    // Modal system for reset dialogs
    this.eventSystem.on('ui:show_modal', (event) => {
      this.showCustomModal(event.data);
    });

    // New game started from starting screen
    this.eventSystem.on('game:reset', (event) => {
      this.handleNewGameFromStartingScreen(event.data);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleKeyboard(event);
    });

    // Window events
    window.addEventListener('beforeunload', () => {
      this.gameEngine.autoSave();
    });

    window.addEventListener('focus', () => {
      if (this.isInitialized && this.gameEngine.isPaused) {
        // Game was paused, could resume here if desired
      }
    });

    window.addEventListener('blur', () => {
      if (this.isInitialized && this.gameEngine.isRunning) {
        // Auto-pause when window loses focus (optional)
        // this.gameEngine.pause();
      }
    });

    // Setup game control button event listeners
    this.setupGameControlButtons();
  }

  /**
   * Setup game control button event listeners
   */
  setupGameControlButtons() {
    // Pause button
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.handlePauseToggle();
      });
    }

    // Next turn button
    const nextTurnBtn = document.getElementById('next-turn-btn');
    if (nextTurnBtn) {
      nextTurnBtn.addEventListener('click', () => {
        this.gameEngine.nextTurn();
      });
    }

    // Save game button
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.handleSaveGame();
      });
    }

    // Load game button
    const loadBtn = document.getElementById('load-btn');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => {
        this.showLoadGameDialog();
      });
    }

    // Reset game button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.gameEngine.requestReset('confirm');
      });
    }
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Unhandled error:', event.error);
      this.showError('An unexpected error occurred. The game has been auto-saved.');
      this.gameEngine.autoSave();
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.showError('An unexpected error occurred. The game has been auto-saved.');
      this.gameEngine.autoSave();
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboard(event) {
    // Don't handle shortcuts if user is typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key) {
      case ' ': // Spacebar - pause/resume
        event.preventDefault();
        this.handlePauseToggle();
        break;
      case 'n': // N - next turn
        event.preventDefault();
        if (this.gameEngine.isPaused) {
          this.gameEngine.nextTurn();
        }
        break;
      case 's': // S - save (with Ctrl)
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.handleSaveGame();
        }
        break;
      case 'l': // L - load (with Ctrl)
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.showLoadGameDialog();
        }
        break;
      default:
        // No action for other keys
        break;
    }
  }

  /**
   * Update UI with current game state
   */
  updateUI() {
    const gameState = this.gameEngine.getGameState();
    const politicalStatus = this.gameEngine.politicalEvents.getPoliticalStatus(gameState);

    if (this.dashboard) {
      this.dashboard.update(gameState);
    }

    if (this.politicalEventsPanel) {
      this.politicalEventsPanel.update(gameState, politicalStatus);
    }

    if (this.policyScreen && this.currentScreen === 'policies') {
      this.policyScreen.update(gameState);
    }

    // Update page title with current game info
    const title = `SP_Sim - Week ${gameState.time.week}, Year ${gameState.time.year}`;
    const approval = `(${gameState.politics.approval.toFixed(1)}% approval)`;
    document.title = `${title} ${approval}`;
  }

  /**
   * Handle pause/resume toggle
   */
  handlePauseToggle() {
    if (this.gameEngine.isPaused) {
      this.gameEngine.resume();
      this.updatePauseButton('Pause');
    } else {
      this.gameEngine.pause();
      this.updatePauseButton('Resume');
    }
  }

  /**
   * Update pause button text
   */
  updatePauseButton(text) {
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.textContent = text;
    }
  }

  /**
   * Handle save game with enhanced mobile UX
   */
  handleSaveGame(requestedSaveName = null) {
    let saveName = requestedSaveName;

    if (!saveName) {
      // Use a proper modal instead of window.prompt for better mobile UX
      const modal = new Modal({
        title: 'Save Game',
        content: `
          <div class="save-game-form">
            <p>Enter a name for your save:</p>
            <div class="form-group">
              <label for="save-name-input">Save Name:</label>
              <input type="text" id="save-name-input" class="form-input" 
                     placeholder="e.g., Pre-Election 2024" 
                     value="Save ${new Date().toLocaleDateString()}" />
            </div>
            <div class="save-suggestions">
              <p>Suggestions:</p>
              <div class="suggestion-buttons">
                <button type="button" class="suggestion-btn" data-name="Pre-Election Save">Pre-Election</button>
                <button type="button" class="suggestion-btn" data-name="Economic Crisis Start">Economic Crisis</button>
                <button type="button" class="suggestion-btn" data-name="Policy Reform Checkpoint">Policy Reform</button>
                <button type="button" class="suggestion-btn" data-name="Coalition Change">Coalition Change</button>
              </div>
            </div>
          </div>
          <style>
            .save-game-form {
              min-width: 300px;
            }
            .form-group {
              margin-bottom: var(--spacing-md);
            }
            .form-group label {
              display: block;
              margin-bottom: var(--spacing-xs);
              font-weight: 500;
              color: var(--text-color);
            }
            .form-input {
              width: 100%;
              padding: var(--spacing-sm);
              border: 1px solid var(--border-color);
              border-radius: var(--border-radius);
              font-size: 1rem;
              transition: border-color var(--transition-base);
            }
            .form-input:focus {
              outline: none;
              border-color: var(--secondary-color);
              box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
            }
            .save-suggestions {
              margin-top: var(--spacing-md);
            }
            .save-suggestions p {
              margin-bottom: var(--spacing-sm);
              font-size: 0.875rem;
              color: var(--text-light);
            }
            .suggestion-buttons {
              display: flex;
              flex-wrap: wrap;
              gap: var(--spacing-xs);
            }
            .suggestion-btn {
              padding: var(--spacing-xs) var(--spacing-sm);
              border: 1px solid var(--border-color);
              background: var(--surface-color);
              color: var(--text-color);
              border-radius: var(--border-radius);
              cursor: pointer;
              font-size: 0.8rem;
              transition: all var(--transition-fast);
            }
            .suggestion-btn:hover {
              background: var(--secondary-color);
              color: white;
              border-color: var(--secondary-color);
            }
          </style>
        `,
        confirmText: 'Save Game',
        cancelText: 'Cancel',
        showCancel: true,
        onConfirm: () => {
          const input = document.getElementById('save-name-input');
          saveName = input.value.trim();

          if (!saveName) {
            this.showNotification('Please enter a save name.', 'warning');
            return false;
          }

          const success = this.gameEngine.saveGame(saveName);
          if (success) {
            this.showNotification('Game saved successfully!', 'success');
          } else {
            this.showError('Failed to save game.');
          }
          return true;
        },
      });

      modal.show();

      // Setup suggestion button handlers and auto-focus
      setTimeout(() => {
        const input = document.getElementById('save-name-input');
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');

        // Auto-focus and select text for mobile
        if (input) {
          input.focus();
          input.select();
        }

        // Handle suggestion buttons
        suggestionBtns.forEach((btn) => {
          btn.addEventListener('click', () => {
            const suggestedName = btn.getAttribute('data-name');
            const gameState = this.gameEngine.getGameState();
            const fullName = `${suggestedName} - Week ${gameState.time.week}, Year ${gameState.time.year}`;
            input.value = fullName;
            input.focus();
          });
        });
      }, 100);

      return; // Exit early since we're using modal
    }

    // Direct save if name was provided
    const success = this.gameEngine.saveGame(saveName);
    if (success) {
      this.showNotification('Game saved successfully!', 'success');
    } else {
      this.showError('Failed to save game.');
    }
  }

  /**
   * Show load game dialog
   */
  showLoadGameDialog() {
    const saves = this.gameEngine.saveSystem.getAllSaves();
    const storageStats = this.gameEngine.saveSystem.getStorageStats();

    if (saves.length === 0) {
      Modal.alert('No Saves Found', 'No saved games were found.', () => {
        this.showNotification('No saved games found.', 'info');
      });
      return;
    }

    // Create save list HTML with enhanced mobile-friendly design
    let saveListHtml = '<div class="save-list">';
    saves.forEach((save, _index) => {
      const date = new Date(save.timestamp).toLocaleString();
      const gameTime = save.gameTime ? `Week ${save.gameTime.week}, Year ${save.gameTime.year}` : 'Unknown';
      const isImported = save.imported ? '<span class="save-badge imported">Imported</span>' : '';

      saveListHtml += `
        <div class="save-item" data-save-id="${save.id}">
          <div class="save-header">
            <div class="save-name">${save.name} ${isImported}</div>
            <div class="save-time">${gameTime}</div>
          </div>
          <div class="save-meta">
            <span class="save-date">${date}</span>
            <span class="save-version">v${save.version}</span>
          </div>
          <div class="save-actions">
            <button class="save-action-btn export-btn" data-save-id="${save.id}" type="button">Export</button>
            <button class="save-action-btn delete-btn" data-save-id="${save.id}" type="button">Delete</button>
          </div>
        </div>
      `;
    });
    saveListHtml += '</div>';

    // Add storage stats and import option
    const statsHtml = `
      <div class="save-management">
        <div class="storage-stats">
          <div class="stats-item">
            <strong>Save Count:</strong> ${storageStats.saveCount}/${storageStats.maxSaves}
          </div>
          <div class="stats-item">
            <strong>Storage Used:</strong> ${storageStats.totalSizeKB} KB
          </div>
          <div class="stats-item">
            <strong>Auto-save:</strong> ${storageStats.hasAutoSave ? 'Available' : 'None'}
          </div>
        </div>
        <div class="import-section">
          <input type="file" id="import-save-file" accept=".json" style="display: none;">
          <button class="btn btn--secondary" 
          type="button" onclick="document.getElementById('import-save-file').click()">
            Import Save File
          </button>
        </div>
      </div>
    `;

    const modal = new Modal({
      title: 'Load Game',
      content: `
        <div class="load-game-dialog">
          <p>Select a save to load:</p>
          ${saveListHtml}
          ${statsHtml}
        </div>
        <style>
          .load-game-dialog {
            max-width: 100%;
          }
          .save-list { 
            max-height: 400px; 
            overflow-y: auto; 
            margin: var(--spacing-md) 0;
          }
          .save-item { 
            padding: var(--spacing-md); 
            border: 1px solid var(--border-color); 
            margin-bottom: var(--spacing-sm); 
            cursor: pointer; 
            border-radius: var(--border-radius);
            transition: all var(--transition-base);
            background: var(--surface-color);
          }
          .save-item:hover { 
            background: var(--background-alt); 
            border-color: var(--secondary-color);
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
          }
          .save-item.selected { 
            background: var(--secondary-color); 
            color: white; 
            border-color: var(--secondary-color);
          }
          .save-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-xs);
          }
          .save-name { 
            font-weight: bold; 
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
          }
          .save-time {
            font-size: 0.875rem;
            opacity: 0.8;
          }
          .save-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.8rem;
            opacity: 0.7;
            margin-bottom: var(--spacing-sm);
          }
          .save-actions {
            display: flex;
            gap: var(--spacing-xs);
            opacity: 0.8;
            transition: opacity var(--transition-base);
          }
          .save-item:hover .save-actions {
            opacity: 1;
          }
          .save-action-btn {
            padding: var(--spacing-xs) var(--spacing-sm);
            border: 1px solid currentColor;
            background: transparent;
            color: inherit;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-size: 0.75rem;
            transition: all var(--transition-fast);
          }
          .save-action-btn:hover {
            background: currentColor;
            color: var(--surface-color);
          }
          .save-badge {
            background: var(--warning-color);
            color: white;
            padding: 2px 6px;
            border-radius: var(--border-radius);
            font-size: 0.7rem;
            font-weight: normal;
          }
          .save-management {
            border-top: 1px solid var(--border-color);
            padding-top: var(--spacing-md);
            margin-top: var(--spacing-md);
          }
          .storage-stats {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-md);
            font-size: 0.875rem;
          }
          .stats-item {
            color: var(--text-light);
          }
          .import-section {
            text-align: center;
          }
          
          @media (max-width: 768px) {
            .save-header {
              flex-direction: column;
              gap: var(--spacing-xs);
            }
            .save-meta {
              flex-direction: column;
              gap: var(--spacing-xs);
            }
            .storage-stats {
              flex-direction: column;
              gap: var(--spacing-xs);
            }
          }
        </style>
      `,
      confirmText: 'Load',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: () => {
        const selected = document.querySelector('.save-item.selected');
        if (!selected) {
          this.showNotification('Please select a save to load.', 'warning');
          return false;
        }

        const saveId = selected.getAttribute('data-save-id');
        const success = this.gameEngine.loadGame(saveId);
        if (success) {
          this.showNotification('Game loaded successfully!', 'success');
          this.updateUI();
        } else {
          this.showError('Failed to load game.');
        }
        return true;
      },
    });

    // Add click handlers for save items and actions
    modal.show();

    setTimeout(() => {
      // Save item selection
      const saveItems = document.querySelectorAll('.save-item');
      saveItems.forEach((item) => {
        item.addEventListener('click', (e) => {
          // Don't select if clicking on action buttons
          if (e.target.classList.contains('save-action-btn')) return;

          saveItems.forEach((i) => i.classList.remove('selected'));
          item.classList.add('selected');
        });
      });

      // Export buttons
      const exportBtns = document.querySelectorAll('.export-btn');
      exportBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const saveId = btn.getAttribute('data-save-id');
          const success = this.gameEngine.saveSystem.exportSave(saveId);
          if (success) {
            this.showNotification('Save exported successfully!', 'success');
          } else {
            this.showError('Failed to export save.');
          }
        });
      });

      // Delete buttons
      const deleteBtns = document.querySelectorAll('.delete-btn');
      deleteBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const saveId = btn.getAttribute('data-save-id');
          const saveName = btn.closest('.save-item').querySelector('.save-name').textContent;

          if (window.confirm(`Are you sure you want to delete "${saveName}"?`)) {
            const success = this.gameEngine.saveSystem.deleteSave(saveId);
            if (success) {
              btn.closest('.save-item').remove();
              this.showNotification('Save deleted successfully!', 'success');
            } else {
              this.showError('Failed to delete save.');
            }
          }
        });
      });

      // Import file handler
      const importFile = document.getElementById('import-save-file');
      if (importFile) {
        importFile.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (file) {
            const success = await this.gameEngine.saveSystem.importSave(file);
            if (success) {
              this.showNotification('Save imported successfully!', 'success');
              // Refresh the dialog
              modal.hide();
              setTimeout(() => this.showLoadGameDialog(), 100);
            } else {
              this.showError('Failed to import save. Please check the file format.');
            }
          }
        });
      }
    }, 100);
  }

  /**
   * Show decision dialog
   */
  showDecisionDialog(decision) {
    const modal = new Modal({
      title: 'Political Decision',
      content: `
        <div class="decision-content">
          <p><strong>Decision:</strong> ${decision.description || decision}</p>
          <div class="decision-options">
            <p>How would you like to respond?</p>
          </div>
        </div>
      `,
      confirmText: 'Approve',
      cancelText: 'Reject',
      showCancel: true,
      onConfirm: () => {
        this.eventSystem.emit('decision:response', {
          decision,
          response: 'approve',
        });
        this.showNotification('Decision approved.', 'success');
        return true;
      },
      onCancel: () => {
        this.eventSystem.emit('decision:response', {
          decision,
          response: 'reject',
        });
        this.showNotification('Decision rejected.', 'info');
      },
    });

    modal.show();
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error(message); // eslint-disable-line no-console
    // Simple alert for now - in production you'd use a proper notification system
    window.alert(`Error: ${message}`); // eslint-disable-line no-alert
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);

    // Prevent duplicate notifications
    const existingNotifications = document.querySelectorAll('.notification');
    if (Array.from(existingNotifications).some((existing) => existing.textContent === message)) {
      return; // Don't show duplicate
    }

    // Create a simple notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    let backgroundColor;
    if (type === 'error') {
      backgroundColor = '#e74c3c';
    } else if (type === 'success') {
      backgroundColor = '#27ae60';
    } else if (type === 'warning') {
      backgroundColor = '#f39c12';
    } else {
      backgroundColor = '#3498db';
    }

    // Calculate notification position (stack them)
    const notificationCount = document.querySelectorAll('.notification').length;
    const topOffset = 20 + (notificationCount * 60);

    notification.style.cssText = `
      position: fixed;
      top: ${topOffset}px;
      right: 20px;
      padding: 12px 16px;
      background: ${backgroundColor};
      color: white;
      border-radius: 4px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  /**
   * Show game end dialog
   */
  showGameEndDialog(endCondition) {
    const isVictory = endCondition.type === 'victory';
    const modal = new Modal({
      title: endCondition.title,
      content: `
        <div class="game-end-dialog ${isVictory ? 'victory' : 'defeat'}">
          <div class="end-icon">
            ${isVictory ? '🏆' : '💔'}
          </div>
          <div class="end-description">
            <p>${endCondition.description}</p>
          </div>
          <div class="final-stats">
            <h4>Final Statistics:</h4>
            <div class="stats-grid">
              <div class="stat">
                <span>Time in Office:</span>
                <span>${endCondition.finalStats.timeInOffice}</span>
              </div>
              <div class="stat">
                <span>Final Approval:</span>
                <span>${endCondition.finalStats.finalApproval.toFixed(1)}%</span>
              </div>
              <div class="stat">
                <span>GDP Growth:</span>
                <span>${endCondition.finalStats.finalGDPGrowth.toFixed(1)}%</span>
              </div>
              <div class="stat">
                <span>Achievements:</span>
                <span>${endCondition.finalStats.achievementsUnlocked}</span>
              </div>
            </div>
          </div>
          <div class="next-actions">
            <p>What would you like to do next?</p>
          </div>
        </div>
        <style>
          .game-end-dialog {
            text-align: center;
            max-width: 400px;
            margin: 0 auto;
          }
          .end-icon {
            font-size: 4rem;
            margin-bottom: var(--spacing-md);
          }
          .victory .end-icon {
            color: #27ae60;
          }
          .defeat .end-icon {
            color: #e74c3c;
          }
          .end-description {
            margin-bottom: var(--spacing-lg);
          }
          .final-stats h4 {
            margin-bottom: var(--spacing-md);
            color: var(--primary-color);
          }
          .stats-grid {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
            margin-bottom: var(--spacing-lg);
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
        </style>
      `,
      confirmText: 'New Game',
      cancelText: 'Continue',
      showCancel: true,
      onConfirm: () => {
        this.gameEngine.requestReset('new_game');
        return true;
      },
    });

    modal.show();
  }

  /**
   * Show custom modal
   */
  showCustomModal(modalData) {
    const modal = new Modal(modalData);
    modal.show();
  }

  /**
   * Handle new game started from starting screen
   */
  handleNewGameFromStartingScreen(data) {
    if (!this.isInitialized) {
      // This shouldn't happen anymore, but failsafe
      this.initializeGameForExistingPlayer();
    }

    // Forcibly hide starting screen
    if (this.startingScreen) {
      this.startingScreen.hide();
    }

    // Also remove any remaining starting screen elements
    const startingScreenElements = document.querySelectorAll('#starting-screen, .starting-screen');
    startingScreenElements.forEach((element) => element.remove());

    // Reset game state with new data
    if (data.newGameState) {
      this.gameEngine.resetGameState(data.newGameState);
    }

    // Start the game engine
    this.gameEngine.start();

    // Force immediate UI update
    this.updateUI();

    // Update UI again after a short delay to ensure all components are ready
    setTimeout(() => {
      this.updateUI();
    }, 100);
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new SPSimApp();
  app.initialize();

  // Make app available globally for debugging
  window.spSimApp = app;
});

// Export for potential module usage
export default SPSimApp;
