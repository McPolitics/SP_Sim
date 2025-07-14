import { EVENTS, eventSystem } from './EventSystem';
import { saveSystem } from './SaveSystem';
import { economicSimulation } from './EconomicSimulation';
import { politicalSystem } from './PoliticalSystem';
import { politicalEvents } from './PoliticalEvents';
import { winConditions } from './WinConditions';
import { gameReset } from './GameReset';
import { aiOpposition } from './AIOpposition';
import { modalManager } from '../ui/components/ModalManager';

/**
 * GameEngine - Core game loop and state management for SP_Sim
 * Orchestrates all game systems and handles the main game loop
 */
export class GameEngine {
  constructor() {
    this.eventSystem = eventSystem;
    this.saveSystem = saveSystem;
    this.economicSimulation = economicSimulation;
    this.politicalSystem = politicalSystem;
    this.politicalEvents = politicalEvents;
    this.winConditions = winConditions;
    this.gameReset = gameReset;
    this.aiOpposition = aiOpposition;

    // Game state
    this.gameState = this.createInitialGameState();
    this.isRunning = false;
    this.isPaused = false;
    this.gameSpeed = 1000; // milliseconds per turn
    this.lastUpdateTime = 0;
    this.gameLoopId = null;

    // Performance tracking
    this.frameCount = 0;
    this.lastFrameTime = Date.now();
    this.fps = 0;

    this.initializeEventListeners();
  }

  /**
   * Initialize the game
   */
  initialize() {
    console.log('Initializing SP_Sim Game Engine...');

    const storedSpeed = parseInt(localStorage.getItem('sp_sim_game_speed'), 10);
    if (!Number.isNaN(storedSpeed)) {
      this.setGameSpeed(storedSpeed);
    }

    // Try to load auto-save
    const autoSave = this.saveSystem.loadAutoSave();
    if (autoSave) {
      this.gameState = autoSave;
      console.log('Auto-save loaded');
    }

    this.eventSystem.emit(EVENTS.GAME_START, { gameState: this.gameState });
    console.log('Game Engine initialized successfully');
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastUpdateTime = Date.now();

    this.gameLoop();
    this.eventSystem.emit(EVENTS.GAME_RESUME, { gameState: this.gameState });
    console.log('Game started');
  }

  /**
   * Pause the game
   */
  pause() {
    if (!this.isRunning || this.isPaused) return;

    this.isPaused = true;
    if (this.gameLoopId) {
      clearTimeout(this.gameLoopId);
      this.gameLoopId = null;
    }

    this.eventSystem.emit(EVENTS.GAME_PAUSE, { gameState: this.gameState });
    console.log('Game paused');
  }

  /**
   * Resume the game
   */
  resume() {
    if (!this.isRunning || !this.isPaused) return;

    this.isPaused = false;
    this.lastUpdateTime = Date.now();
    this.gameLoop();

    this.eventSystem.emit(EVENTS.GAME_RESUME, { gameState: this.gameState });
    console.log('Game resumed');
  }

  /**
   * Stop the game
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;

    if (this.gameLoopId) {
      clearTimeout(this.gameLoopId);
      this.gameLoopId = null;
    }

    // Auto-save when stopping
    this.autoSave();
    console.log('Game stopped');
  }

  /**
   * Advance to next turn manually
   */
  nextTurn() {
    if (!this.isRunning) return;

    this.processTurn();
  }

  /**
   * Main game loop
   */
  gameLoop() {
    if (!this.isRunning || this.isPaused) return;

    const now = Date.now();
    const deltaTime = now - this.lastUpdateTime;

    // Update FPS counter
    this.updateFPS(now);

    // Process turn if enough time has passed
    if (deltaTime >= this.gameSpeed) {
      this.processTurn();
      this.lastUpdateTime = now;
    }

    // Schedule next frame
    this.gameLoopId = setTimeout(() => this.gameLoop(), 16); // ~60 FPS
  }

  /**
   * Process a single turn
   */
  processTurn() {
    this.eventSystem.emit(EVENTS.TURN_START, {
      gameState: this.gameState,
      turn: this.gameState.time.week,
    });

    // Advance time
    this.advanceTime();

    // Update game systems
    this.updateGameSystems();

    // Process queued events
    this.eventSystem.processQueue();

    // Auto-save periodically
    if (this.gameState.time.week % 4 === 0) { // Every 4 weeks
      this.autoSave();
    }

    this.eventSystem.emit(EVENTS.TURN_END, {
      gameState: this.gameState,
      turn: this.gameState.time.week,
    });
  }

  /**
   * Update all game systems
   */
  updateGameSystems() {
    // Systems are event-driven and will update themselves via TURN_END event
    // Just emit the turn processed event for political events
    this.eventSystem.emit('game:turn_processed', {
      gameState: this.gameState,
      systems: {
        political: this.politicalEvents.getPoliticalStatus(this.gameState),
        coalition: this.politicalEvents.getCoalitionStability(),
      },
    });

    // Check win conditions
    this.winConditions.checkWinConditions(this.gameState);
  }

  /**
   * Advance game time
   */
  advanceTime() {
    this.gameState.time.week += 1;

    // Handle month/year transitions
    if (this.gameState.time.week > 52) {
      this.gameState.time.week = 1;
      this.gameState.time.year += 1;
    }

    // Calculate current date
    const startDate = new Date(this.gameState.time.startDate);
    const weeksElapsed = (this.gameState.time.year - 1) * 52 + this.gameState.time.week - 1;
    this.gameState.time.currentDate = new Date(startDate.getTime() + weeksElapsed * 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Save game manually
   */
  saveGame(saveName = null) {
    const success = this.saveSystem.saveGame(this.gameState, saveName);
    this.eventSystem.emit(EVENTS.GAME_SAVE, {
      success,
      gameState: this.gameState,
      saveName,
    });
    return success;
  }

  /**
   * Load game
   */
  loadGame(saveId) {
    const loadedState = this.saveSystem.loadGame(saveId);
    if (loadedState) {
      this.gameState = loadedState;
      this.eventSystem.emit(EVENTS.GAME_LOAD, {
        success: true,
        gameState: this.gameState,
      });
      return true;
    }

    this.eventSystem.emit(EVENTS.GAME_LOAD, {
      success: false,
      saveId,
    });
    return false;
  }

  /**
   * Auto-save game
   */
  autoSave() {
    return this.saveSystem.autoSave(this.gameState);
  }

  /**
   * Update game state
   */
  updateGameState(updates) {
    // Deep merge updates into game state
    this.gameState = this.mergeDeep(this.gameState, updates);

    this.eventSystem.emit(EVENTS.UI_UPDATE, {
      gameState: this.gameState,
      updates,
    });
  }

  /**
   * Handle opposition debate response
   */
  handleOppositionDebateResponse(data) {
    const { debateId, response } = data;
    const outcome = this.aiOpposition.handleDebateResponse(debateId, response);
    
    if (outcome && outcome.impact) {
      // Apply debate impact to game state
      if (outcome.impact.approval) {
        this.updateGameState({
          politics: {
            ...this.gameState.politics,
            approval: Math.max(0, Math.min(100, this.gameState.politics.approval + outcome.impact.approval))
          }
        });
      }
    }
  }

  /**
   * Get current game state (read-only copy)
   */
  getGameState() {
    const baseState = JSON.parse(JSON.stringify(this.gameState));
    
    // Add AI opposition status
    baseState.aiOpposition = this.aiOpposition.getOppositionStatus();
    
    return baseState;
  }

  /**
   * Reset game state to a new state
   */
  resetGameState(newGameState) {
    this.gameState = newGameState;
    this.eventSystem.emit(EVENTS.GAME_START, { gameState: this.gameState });
    console.log('Game state reset with new configuration');
  }

  /**
   * Get game statistics
   */
  getGameStats() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      gameSpeed: this.gameSpeed,
      fps: this.fps,
      currentTurn: this.gameState.time.week,
      currentYear: this.gameState.time.year,
      playtime: this.calculatePlaytime(),
      eventSystemStats: this.eventSystem.getStats(),
      storageStats: this.saveSystem.getStorageStats(),
    };
  }

  /**
   * Set game speed
   */
  setGameSpeed(speed) {
    this.gameSpeed = Math.max(100, Math.min(5000, speed)); // Clamp between 100ms and 5s
    console.log(`Game speed set to ${this.gameSpeed}ms per turn`);
  }

  /**
   * Reset game with new state
   */
  resetGame(newGameState) {
    // Stop current game
    this.stop();

    // Ensure any open modals are cleared
    modalManager.cleanup();

    // Reset achievements
    this.winConditions.resetAchievements();

    // Reset AI opposition
    this.aiOpposition.reset();

    // Set new game state
    this.gameState = newGameState;

    // Clear any stored intervals/timeouts
    if (this.gameLoopId) {
      clearTimeout(this.gameLoopId);
      this.gameLoopId = null;
    }

    // Reset performance tracking
    this.frameCount = 0;
    this.lastFrameTime = Date.now();
    this.fps = 0;
    this.lastUpdateTime = 0;

    // Emit reset complete event
    this.eventSystem.emit(EVENTS.GAME_START, { gameState: this.gameState });

    // Auto-start the new game
    this.start();

    console.log('Game reset complete');
  }

  /**
   * Handle game end condition
   */
  handleGameEnd(data) {
    const { endCondition } = data;

    // Stop the game
    this.stop();

    // Mark game as ended
    this.gameState.gameEnded = true;
    this.gameState.endCondition = endCondition;

    // Auto-save the final state
    this.saveSystem.saveGame(this.gameState, `Final State - ${endCondition.title}`);

    // Emit UI notification
    this.eventSystem.emit('ui:game_end', {
      endCondition,
      gameState: this.gameState,
    });

    console.log(`Game ended: ${endCondition.title}`);
  }

  /**
   * Request game reset
   */
  requestReset(resetType = 'confirm') {
    this.eventSystem.emit('game:reset_request', {
      currentGameState: this.gameState,
      resetType,
    });
  }

  /**
   * Create initial game state
   * @private
   */
  createInitialGameState() {
    const now = new Date();

    return {
      version: '1.0.0',
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
        debt: 600000000000, // 60% of GDP
        stability: 75,
      },
      economy: {
        gdpGrowth: 2.1,
        unemployment: 6.0,
        inflation: 2.4,
        interestRate: 3.5,
        sectors: {
          agriculture: 5,
          manufacturing: 25,
          services: 70,
        },
      },
      politics: {
        approval: 50,
        coalition: [
          { party: 'Government', support: 45 },
          { party: 'Coalition Partner', support: 22 },
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
        recent: [],
        pending: [],
      },
      scandals: {
        active: [],
        resolved: [],
      },
    };
  }

  /**
   * Initialize event listeners
   * @private
   */
  initializeEventListeners() {
    // Listen for UI events that affect game state
    this.eventSystem.on(EVENTS.POLICY_PROPOSED, (event) => {
      this.gameState.events.pending.push(event.data);
    });

    this.eventSystem.on(EVENTS.APPROVAL_CHANGE, (event) => {
      this.gameState.politics.approval = Math.max(0, Math.min(100, event.data.newApproval));
    });

    // Listen for economic events
    this.eventSystem.on('economic:update', (event) => {
      // Update game state with economic data
      const economicData = event.data;
      this.gameState.economy = {
        ...this.gameState.economy,
        ...economicData.metrics,
        sectors: economicData.sectors,
        cycle: economicData.cycle,
      };
    });

    this.eventSystem.on('economic:event', (event) => {
      // Add economic events to game events
      this.gameState.events.recent.push({
        type: 'economic',
        ...event.data,
        timestamp: Date.now(),
      });

      // Keep only last 10 events
      if (this.gameState.events.recent.length > 10) {
        this.gameState.events.recent = this.gameState.events.recent.slice(-10);
      }
    });

    // Listen for game reset events
    this.eventSystem.on('game:reset', (event) => {
      this.resetGame(event.data.newGameState);
    });

    // Listen for game end events
    this.eventSystem.on('game:end', (event) => {
      this.handleGameEnd(event.data);
    });

    // Listen for political events
    this.eventSystem.on('political:vote_scheduled', (_event) => {
      // Political votes are handled by the political system
    });

    // Listen for achievement unlocked events
    this.eventSystem.on('achievement:unlocked', (_event) => {
      // Achievements are handled by the win conditions system
    });

    // Listen for opposition events
    this.eventSystem.on('opposition:debate_response', (event) => {
      this.handleOppositionDebateResponse(event.data);
    });
  }

  /**
   * Update FPS counter
   * @private
   */
  updateFPS(now) {
    this.frameCount += 1;
    if (now - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = now;
    }
  }

  /**
   * Calculate total playtime
   * @private
   */
  calculatePlaytime() {
    const start = new Date(this.gameState.time.startDate);
    const current = new Date(this.gameState.time.currentDate);
    return Math.floor((current - start) / (1000 * 60 * 60 * 24 * 7)); // weeks
  }

  /**
   * Deep merge objects
   * @private
   */
  mergeDeep(target, source) {
    const result = { ...target };

    Object.keys(source).forEach((key) => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.mergeDeep(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });

    return result;
  }
}

// Create and export global game engine instance
export const gameEngine = new GameEngine();
