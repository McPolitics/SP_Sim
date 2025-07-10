/**
 * SP_Sim - Main Application Entry Point
 * Initializes the game engine and UI components
 */

import { gameEngine } from './core/GameEngine';
import { eventSystem, EVENTS } from './core/EventSystem';
import { Dashboard } from './ui/components/Dashboard';
import { Navigation } from './ui/components/Navigation';
import { Modal } from './ui/components/Modal';
import { EconomicsScreen } from './ui/components/EconomicsScreen';

/**
 * Main application class
 */
class SPSimApp {
  constructor() {
    this.gameEngine = gameEngine;
    this.eventSystem = eventSystem;
    this.dashboard = null;
    this.navigation = null;
    this.economicsScreen = null;
    this.currentScreen = 'dashboard';
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      console.log('🎮 Starting SP_Sim - Political Economy Simulation');

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
    } catch (error) {
      console.error('❌ Failed to initialize SP_Sim:', error);
      this.showError('Failed to initialize game. Please refresh the page.');
    }
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

    // Setup screen management
    this.setupScreenManagement();

    console.log('✅ UI components initialized');
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

    // Hide all screens first
    document.querySelectorAll('.screen').forEach((screen) => {
      screen.classList.remove('screen--active');
    });

    // Show target screen
    const targetScreen = document.querySelector(`#screen-${screenId}`);
    if (targetScreen) {
      targetScreen.classList.add('screen--active');

      // Initialize specific screens
      if (screenId === 'economy' && this.economicsScreen) {
        this.economicsScreen.show();
      }
    } else {
      // Create screen placeholder if it doesn't exist
      this.createScreenPlaceholder(screenId);
    }

    this.currentScreen = screenId;

    // Update navigation state
    if (this.navigation) {
      this.navigation.currentScreen = screenId;
    }

    console.log(`Switched to screen: ${screenId}`);
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

    if (this.dashboard) {
      this.dashboard.update(gameState);
    }

    // Update page title with current game info
    const title = `SP_Sim - Week ${gameState.time.week}, Year ${gameState.time.year}`;
    const approval = `(${gameState.politics.approval}% approval)`;
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
   * Handle save game
   */
  handleSaveGame(requestedSaveName = null) {
    let saveName = requestedSaveName;
    if (!saveName) {
      saveName = window.prompt('Enter a name for your save:'); // eslint-disable-line no-alert
      if (saveName === null) return; // User cancelled
    }

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

    if (saves.length === 0) {
      Modal.alert('No Saves Found', 'No saved games were found.', () => {
        this.showNotification('No saved games found.', 'info');
      });
      return;
    }

    // Create save list HTML
    let saveListHtml = '<div class="save-list">';
    saves.forEach((save, _index) => {
      const date = new Date(save.timestamp).toLocaleString();
      saveListHtml += `
        <div class="save-item" data-save-id="${save.id}">
          <div class="save-name">${save.name}</div>
          <div class="save-date">${date}</div>
        </div>
      `;
    });
    saveListHtml += '</div>';

    const modal = new Modal({
      title: 'Load Game',
      content: `
        <p>Select a save to load:</p>
        ${saveListHtml}
        <style>
          .save-list { max-height: 300px; overflow-y: auto; }
          .save-item { 
            padding: 10px; 
            border: 1px solid var(--border-color); 
            margin-bottom: 5px; 
            cursor: pointer; 
            border-radius: 4px;
            transition: background-color 0.2s;
          }
          .save-item:hover { background-color: var(--background-color); }
          .save-item.selected { background-color: var(--secondary-color); color: white; }
          .save-name { font-weight: bold; }
          .save-date { font-size: 0.9em; color: var(--text-light); }
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

    // Add click handlers for save items
    modal.show();
    setTimeout(() => {
      const saveItems = document.querySelectorAll('.save-item');
      saveItems.forEach((item) => {
        item.addEventListener('click', () => {
          saveItems.forEach((i) => i.classList.remove('selected'));
          item.classList.add('selected');
        });
      });
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

    // Create a simple notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    let backgroundColor;
    if (type === 'error') {
      backgroundColor = '#e74c3c';
    } else if (type === 'success') {
      backgroundColor = '#27ae60';
    } else {
      backgroundColor = '#3498db';
    }

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      background: ${backgroundColor};
      color: white;
      border-radius: 4px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
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
