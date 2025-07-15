import { BaseComponent } from './BaseComponent';
import { eventSystem } from '../../core/EventSystem';
import { gameReset } from '../../core/GameReset';

/**
 * StartingScreen - Initial screen for new players
 * Provides game introduction, difficulty selection, and tutorial options
 */

// Constants for UI behavior
const SCREEN_HIDE_DELAY = 500; // Delay before hiding the starting screen after game start
const LOADING_ANIMATION_DURATION = 2000; // Duration of loading animation in milliseconds
export class StartingScreen extends BaseComponent {
  constructor() {
    super();
    this.isVisible = false;
    this.selectedDifficulty = 'normal';
    this.gameOptions = {
      tutorial: true,
      autoSave: true,
      crisisEvents: true,
    };
  }

  /**
   * Show the starting screen
   */
  show() {
    if (this.isVisible) return false;

    // Always show the starting screen on initial page load to give users choice
    // This provides better UX by allowing users to choose between new game and continue
    this.createStartingScreen();
    this.isVisible = true;
    return true;
  }

  /**
   * Hide the starting screen
   */
  hide() {
    const startingScreen = document.getElementById('starting-screen');
    if (startingScreen) {
      startingScreen.remove();
    }
    this.isVisible = false;
  }

  /**
   * Check if player has existing game progress
   */
  checkForExistingGame() {
    // Check localStorage for any saved games or auto-saves
    const autoSave = localStorage.getItem('sp_sim_autosave');
    const savedGames = localStorage.getItem('sp_sim_saves');

    return !!(autoSave || (savedGames && JSON.parse(savedGames).length > 0));
  }

  /**
   * Create the starting screen UI
   */
  createStartingScreen() {
    const difficulties = gameReset.getDifficulties();

    const startingScreen = document.createElement('div');
    startingScreen.id = 'starting-screen';
    startingScreen.className = 'starting-screen';

    startingScreen.innerHTML = `
      <div class="starting-screen__overlay">
        <div class="starting-screen__container">
          <!-- Header Section -->
          <div class="starting-screen__header">
            <div class="game-logo">
              <h1 class="game-title">🏛️ SP_Sim</h1>
              <p class="game-subtitle">Political Economy Simulation</p>
            </div>
            <div class="game-intro">
              <p>Welcome to SP_Sim! Take on the role of a political leader and guide your nation through complex economic, political, and global challenges.</p>
              <p>Your decisions will shape the future of your country and determine your political legacy.</p>
            </div>
          </div>

          <!-- Difficulty Selection -->
          <div class="starting-screen__section">
            <h2 class="section-title">Choose Your Challenge</h2>
            <p class="section-description">Select the difficulty level that matches your experience and desired challenge:</p>
            
            <div class="difficulty-grid">
              ${difficulties.map((difficulty) => `
                <div class="difficulty-card ${difficulty.id === 'normal' ? 'selected' : ''}" 
                     data-difficulty="${difficulty.id}">
                  <div class="difficulty-header">
                    <div class="difficulty-icon">${difficulty.icon}</div>
                    <h3 class="difficulty-name">${difficulty.name}</h3>
                  </div>
                  <p class="difficulty-description">${difficulty.description}</p>
                  <div class="difficulty-stats">
                    <div class="stat-row">
                      <span class="stat-label">Starting Approval:</span>
                      <span class="stat-value">${difficulty.startingConditions.approval}%</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">GDP Growth:</span>
                      <span class="stat-value">${difficulty.startingConditions.gdpGrowth}%</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Unemployment:</span>
                      <span class="stat-value">${difficulty.startingConditions.unemployment}%</span>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Crisis Frequency:</span>
                      <span class="stat-value">${this.getFrequencyText(difficulty.modifiers.crisisFrequency)}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Game Options -->
          <div class="starting-screen__section">
            <h2 class="section-title">Game Options</h2>
            <div class="options-grid">
              <label class="option-item">
                <input type="checkbox" id="option-tutorial" checked>
                <div class="option-content">
                  <div class="option-icon">🎓</div>
                  <div class="option-text">
                    <strong>Tutorial & Hints</strong>
                    <span>Get guidance and tips during your first term</span>
                  </div>
                </div>
              </label>
              
              <label class="option-item">
                <input type="checkbox" id="option-autosave" checked>
                <div class="option-content">
                  <div class="option-icon">💾</div>
                  <div class="option-text">
                    <strong>Auto-Save</strong>
                    <span>Automatically save progress every 4 weeks</span>
                  </div>
                </div>
              </label>
              
              <label class="option-item">
                <input type="checkbox" id="option-crisis" checked>
                <div class="option-content">
                  <div class="option-icon">⚡</div>
                  <div class="option-text">
                    <strong>Crisis Events</strong>
                    <span>Enable random political and economic crises</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="starting-screen__actions">
            <button class="btn btn--secondary" id="btn-load-game">
              📁 Load Existing Game
            </button>
            <button class="btn btn--primary" id="btn-start-game">
              🚀 Start New Game
            </button>
          </div>

          <!-- Quick Start Option -->
          <div class="quick-start">
            <button class="btn btn--ghost" id="btn-quick-start">
              ⚡ Quick Start (Normal Difficulty)
            </button>
          </div>
        </div>
      </div>
    `;

    // Add styles
    startingScreen.innerHTML += `
      <style>
        .starting-screen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          overflow-y: auto;
        }
        
        .starting-screen__overlay {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .starting-screen__container {
          max-width: 1000px;
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .starting-screen__header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .game-logo {
          margin-bottom: 2rem;
        }
        
        .game-title {
          font-size: 3.5rem;
          margin: 0 0 0.5rem 0;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .game-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin: 0;
          font-weight: 300;
        }
        
        .game-intro {
          font-size: 1.1rem;
          line-height: 1.6;
          opacity: 0.95;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .starting-screen__section {
          margin-bottom: 3rem;
        }
        
        .section-title {
          font-size: 1.8rem;
          margin: 0 0 0.5rem 0;
          text-align: center;
        }
        
        .section-description {
          text-align: center;
          opacity: 0.9;
          margin-bottom: 2rem;
        }
        
        .difficulty-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .difficulty-card {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
        }
        
        .difficulty-card:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
        
        .difficulty-card.selected {
          border-color: #4ade80;
          background: rgba(74, 222, 128, 0.2);
        }
        
        .difficulty-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .difficulty-icon {
          font-size: 2rem;
        }
        
        .difficulty-name {
          margin: 0;
          font-size: 1.3rem;
        }
        
        .difficulty-description {
          margin-bottom: 1.5rem;
          opacity: 0.9;
          line-height: 1.5;
        }
        
        .difficulty-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .stat-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }
        
        .stat-label {
          opacity: 0.8;
        }
        
        .stat-value {
          font-weight: 600;
        }
        
        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }
        
        .option-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        
        .option-item:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        
        .option-item input[type="checkbox"] {
          margin: 0;
          transform: scale(1.2);
        }
        
        .option-content {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }
        
        .option-icon {
          font-size: 1.5rem;
        }
        
        .option-text strong {
          display: block;
          margin-bottom: 0.25rem;
        }
        
        .option-text span {
          opacity: 0.8;
          font-size: 0.9rem;
        }
        
        .starting-screen__actions {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .btn {
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .btn--primary {
          background: #4ade80;
          color: #1e3c72;
        }
        
        .btn--primary:hover {
          background: #22c55e;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(74, 222, 128, 0.3);
        }
        
        .btn--secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .btn--secondary:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        .btn--ghost {
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          font-size: 0.9rem;
          padding: 0.75rem 1.5rem;
        }
        
        .btn--ghost:hover {
          color: white;
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .quick-start {
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .starting-screen__container {
            padding: 2rem;
            margin: 1rem;
          }
          
          .game-title {
            font-size: 2.5rem;
          }
          
          .difficulty-grid {
            grid-template-columns: 1fr;
          }
          
          .starting-screen__actions {
            flex-direction: column;
            align-items: center;
          }
          
          .btn {
            width: 100%;
            max-width: 300px;
          }
        }
      </style>
    `;

    document.body.appendChild(startingScreen);
    this.setupEventListeners();
  }

  /**
   * Convert crisis frequency to readable text
   */
  getFrequencyText(frequency) {
    if (frequency <= 0.5) return 'Very Low';
    if (frequency <= 0.8) return 'Low';
    if (frequency <= 1.2) return 'Normal';
    if (frequency <= 1.5) return 'High';
    return 'Very High';
  }

  /**
   * Setup event listeners for the starting screen
   */
  setupEventListeners() {
    // Difficulty selection
    const difficultyCards = document.querySelectorAll('.difficulty-card');
    difficultyCards.forEach((card) => {
      card.addEventListener('click', () => {
        // Remove selection from all cards
        difficultyCards.forEach((c) => c.classList.remove('selected'));
        // Add selection to clicked card
        card.classList.add('selected');
        this.selectedDifficulty = card.getAttribute('data-difficulty');
      });
    });

    // Start new game button
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startNewGame();
      });
    }

    // Quick start button
    const quickStartBtn = document.getElementById('btn-quick-start');
    if (quickStartBtn) {
      quickStartBtn.addEventListener('click', () => {
        this.selectedDifficulty = 'normal';
        this.startNewGame();
      });
    }

    // Load game button
    const loadBtn = document.getElementById('btn-load-game');
    if (loadBtn) {
      loadBtn.addEventListener('click', () => {
        this.hide();
        // Emit event to show load game dialog
        eventSystem.emit('ui:load_game_dialog');
      });
    }

    // Option checkboxes
    const tutorialOption = document.getElementById('option-tutorial');
    const autosaveOption = document.getElementById('option-autosave');
    const crisisOption = document.getElementById('option-crisis');

    if (tutorialOption) {
      tutorialOption.addEventListener('change', (e) => {
        this.gameOptions.tutorial = e.target.checked;
      });
    }

    if (autosaveOption) {
      autosaveOption.addEventListener('change', (e) => {
        this.gameOptions.autoSave = e.target.checked;
      });
    }

    if (crisisOption) {
      crisisOption.addEventListener('change', (e) => {
        this.gameOptions.crisisEvents = e.target.checked;
      });
    }
  }

  /**
   * Start a new game with selected settings
   */
  startNewGame() {
    // Create loading overlay
    this.showLoadingProgress();

    // Start the game with selected difficulty and options after a brief loading animation
    setTimeout(() => {
      // Start the game reset process
      gameReset.startNewGame({
        difficulty: this.selectedDifficulty,
        options: this.gameOptions,
      });

      // Hide starting screen after a short delay to allow loading animation to complete
      setTimeout(() => {
        this.hide();
      }, SCREEN_HIDE_DELAY);
    }, LOADING_ANIMATION_DURATION); // Reduced loading time for better UX
  }

  /**
   * Show loading progress
   */
  showLoadingProgress() {
    const container = document.querySelector('.starting-screen__container');
    if (!container) return;

    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3 class="loading-title">Initializing Your Nation...</h3>
        <div class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="loading-steps">
            <div class="loading-step active">Setting up government structure...</div>
            <div class="loading-step">Initializing economic systems...</div>
            <div class="loading-step">Establishing diplomatic relations...</div>
            <div class="loading-step">Preparing political landscape...</div>
            <div class="loading-step">Ready to govern!</div>
          </div>
        </div>
      </div>
      
      <style>
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        
        .loading-content {
          text-align: center;
          max-width: 400px;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid #4ade80;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem auto;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .loading-title {
          margin-bottom: 2rem;
          color: white;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        
        .progress-fill {
          height: 100%;
          background: #4ade80;
          width: 0%;
          animation: fillProgress 2s ease-out forwards;
        }
        
        @keyframes fillProgress {
          to { width: 100%; }
        }
        
        .loading-steps {
          text-align: left;
        }
        
        .loading-step {
          padding: 0.5rem 0;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }
        
        .loading-step.active {
          opacity: 1;
          color: #4ade80;
        }
      </style>
    `;

    container.appendChild(loadingOverlay);

    // Animate through loading steps
    const steps = loadingOverlay.querySelectorAll('.loading-step');
    steps.forEach((step, index) => {
      setTimeout(() => {
        steps.forEach((s) => s.classList.remove('active'));
        step.classList.add('active');
      }, index * 400);
    });
  }
}
