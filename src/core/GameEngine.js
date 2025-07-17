/* eslint-disable no-plusplus */
import { EVENTS, eventSystem } from './EventSystem';
import { saveSystem } from './SaveSystem';
import { economicSimulation } from './EconomicSimulation';
import { politicalSystem } from './PoliticalSystem';
import { politicalEvents } from './PoliticalEvents';
import { winConditions } from './WinConditions';
import { gameReset } from './GameReset';
import { aiOpposition } from './AIOpposition';
import { modalManager } from '../ui/components/ModalManager';
import { monetizationFramework } from './MonetizationFramework';
import { policyImplementationEngine } from './PolicyImplementationEngine';
import { crisisManagementSystem } from './CrisisManagementSystem';
import { internationalRelationsSystem } from './InternationalRelationsSystem';

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
    this.monetizationFramework = monetizationFramework;
    this.policyImplementationEngine = policyImplementationEngine;
    this.crisisManagementSystem = crisisManagementSystem;
    this.internationalRelationsSystem = internationalRelationsSystem;

    // Game state
    this.gameState = this.createInitialGameState();
    this.isRunning = false;
    this.isPaused = false;
    this.gameSpeed = 1000; // milliseconds per turn
    this.baseGameSpeed = 1000; // Base speed for adaptive timing
    this.effectiveGameSpeed = 1000; // Actual speed after performance adjustments
    this.lastUpdateTime = 0;
    this.gameLoopId = null;

    // Performance tracking
    this.frameCount = 0;
    this.lastFrameTime = Date.now();
    this.fps = 0;
    this.performanceMetrics = [];
    this.turnProcessingTimes = [];

    // Simulation depth controls
    this.simulationDepth = {
      economic: 'detailed', // basic, standard, detailed, advanced
      political: 'detailed',
      international: 'standard',
      crisis: 'detailed',
      demographics: 'standard',
    };

    this.initializeEventListeners();
  }

  /**
   * Initialize the game
   */
  initialize() {
    console.log('Initializing SP_Sim Game Engine...');

    // Initialize monetization framework first
    this.monetizationFramework.initialize();

    // Initialize policy implementation engine
    this.policyImplementationEngine.initialize();

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
   * Main game loop with adaptive timing and performance monitoring
   */
  gameLoop() {
    if (!this.isRunning || this.isPaused) return;

    const now = Date.now();
    const deltaTime = now - this.lastUpdateTime;

    // Update FPS counter
    this.updateFPS(now);

    // Process turn if enough time has passed
    if (deltaTime >= this.effectiveGameSpeed) {
      // Measure performance
      const startTime = performance.now();

      // Process turn
      this.processTurn();

      // Measure turn processing time
      const processingTime = performance.now() - startTime;
      this.turnProcessingTimes.push(processingTime);

      // Keep only last 20 measurements
      if (this.turnProcessingTimes.length > 20) {
        this.turnProcessingTimes.shift();
      }

      // Adaptive game speed - if turn processing is slow, increase min interval
      const avgProcessingTime = this.turnProcessingTimes.reduce((sum, time) => sum + time, 0) / this.turnProcessingTimes.length;
      const minInterval = Math.max(this.baseGameSpeed, avgProcessingTime * 1.5);
      this.effectiveGameSpeed = Math.max(minInterval, this.gameSpeed);

      this.lastUpdateTime = now;

      // Track performance metrics
      this.performanceMetrics.push({
        turn: this.gameState.time.week,
        year: this.gameState.time.year,
        processingTime,
        effectiveSpeed: this.effectiveGameSpeed,
        avgProcessingTime,
      });

      // Keep only last 50 metrics
      if (this.performanceMetrics.length > 50) {
        this.performanceMetrics.shift();
      }
    }

    // Schedule next frame with adaptive timing
    const nextFrameDelay = Math.max(16, Math.min(33, 16 + ((deltaTime / this.effectiveGameSpeed) * 16)));
    this.gameLoopId = setTimeout(() => this.gameLoop(), nextFrameDelay);
  }

  /**
   * Process a single turn with enhanced realism
   */
  processTurn() {
    this.eventSystem.emit(EVENTS.TURN_START, {
      gameState: this.gameState,
      turn: this.gameState.time.week,
    });

    // Advance time
    this.advanceTime();

    // Process economic changes first (foundation of other systems)
    this.processEconomicChanges();

    // Process political changes after economic impact
    this.processPoliticalChanges();

    // Process international relations
    this.processInternationalRelations();

    // Process crisis management
    this.processCrisisManagement();

    // Process policy implementations and effects
    this.processPolicyEffects();

    // Process random events with weighted probability
    this.processRandomEvents();

    // Calculate derived metrics and interdependencies
    this.calculateDerivedMetrics();

    // Update AI opposition based on all changes
    this.updateAIOpposition();

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
            approval: Math.max(0, Math.min(100, this.gameState.politics.approval + outcome.impact.approval)),
          },
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
        recent: [{
          id: Date.now(),
          title: 'Game Initialized',
          description: 'Welcome to SP_Sim! You have been elected as the new leader.',
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

    // Listen for policy implementation events
    this.eventSystem.on('policy:implement', (event) => {
      this.handlePolicyImplementation(event.data);
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
   * Handle policy implementation - Updated to use PolicyImplementationEngine
   */
  handlePolicyImplementation(data) {
    const { policy } = data;

    console.log('Policy implementation requested:', policy.name);

    // Use the new policy implementation engine
    const result = this.policyImplementationEngine.implementPolicy(policy, this.gameState);

    if (result.success) {
      // Update game state with new policy
      if (!this.gameState.policies) {
        this.gameState.policies = {
          active: [],
          completed: [],
          failed: [],
        };
      }

      // Add to active policies
      this.gameState.policies.active.push(result.implementation);

      // Add implementation event to recent events
      this.gameState.events.recent.push({
        type: 'policy',
        message: `Started implementing policy: ${policy.name}`,
        timestamp: Date.now(),
        policy: result.implementation,
      });

      // Keep only last 10 events
      if (this.gameState.events.recent.length > 10) {
        this.gameState.events.recent = this.gameState.events.recent.slice(-10);
      }

      // Show success notification
      this.eventSystem.emit(EVENTS.UI_NOTIFICATION, {
        message: result.message,
        type: 'success',
      });

      // Emit policy implemented event
      this.eventSystem.emit('policy:implemented', {
        policy: result.implementation,
        gameState: this.gameState,
      });

      // Track analytics
      this.monetizationFramework.trackFeatureUsage('policy_implementation', {
        category: policy.category,
        complexity: policy.complexity,
        tier: this.monetizationFramework.subscriptionTier,
      });
    } else {
      // Handle implementation failure
      this.eventSystem.emit(EVENTS.UI_NOTIFICATION, {
        message: result.message,
        type: 'warning',
      });

      // Emit policy rejected event with upgrade prompt if applicable
      this.eventSystem.emit('policy:rejected', {
        policy,
        reason: result.reason,
        message: result.message,
        upgradePrompt: result.upgradePrompt,
      });
    }
  }

  /**
   * Calculate current political capital
   */
  calculatePoliticalCapital() {
    const { approval } = this.gameState.politics;
    const coalitionSupport = this.gameState.politics.coalition?.reduce((sum, party) => sum + party.support, 0) || 0;

    // Base capital from approval (0-50 points)
    const approvalCapital = Math.floor(approval / 2);

    // Bonus from coalition support (0-50 points)
    const coalitionCapital = Math.floor(coalitionSupport / 2);

    // Reduce by number of active policies (each policy costs ongoing capital)
    const activePolicies = this.gameState.policies?.active?.length || 0;
    const policyCost = activePolicies * 5;

    return Math.max(0, approvalCapital + coalitionCapital - policyCost);
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

  /**
   * Process economic changes with enhanced realism
   */
  processEconomicChanges() {
    if (this.simulationDepth.economic === 'basic') return;

    const { gameState } = this;

    // Get previous economic state for delta calculations
    const prevState = { ...gameState.economy };

    // Apply effects from active policies
    const policyEffects = this.calculatePolicyEconomicEffects();

    // Calculate external economic pressures
    const externalPressures = this.calculateExternalEconomicFactors();

    // Calculate business cycle effects
    const cycleEffects = this.calculateBusinessCycleEffects();

    // Simulate market confidence
    const confidenceEffects = this.calculateMarketConfidence();

    // Apply all effects to create new economic state
    const newEconomicState = this.economicSimulation.processEconomicTurn(
      gameState,
      policyEffects,
      externalPressures,
      cycleEffects,
      confidenceEffects,
    );

    // Update state with new values
    gameState.economy = newEconomicState;

    // Calculate and store economic deltas for reference
    gameState.economy.deltas = {
      gdpGrowthDelta: gameState.economy.gdpGrowth - prevState.gdpGrowth,
      unemploymentDelta: gameState.economy.unemployment - prevState.unemployment,
      inflationDelta: gameState.economy.inflation - prevState.inflation,
    };

    // Emit economic update event with detailed changes
    this.eventSystem.emit('economic:update', {
      metrics: gameState.economy,
      sectors: gameState.economy.sectors,
      cycle: gameState.economy.cycle,
      changes: gameState.economy.deltas,
      confidenceIndex: gameState.economy.confidence,
    });
  }

  /**
   * Process political changes with enhanced realism
   */
  processPoliticalChanges() {
    if (this.simulationDepth.political === 'basic') return;

    const { gameState } = this;

    // Update approval rating based on economic performance and other factors
    this.updateApprovalRating(gameState);

    // Update coalition dynamics
    this.updateCoalitionDynamics(gameState);

    // Process political events
    this.checkForPoliticalEvents(gameState);

    // Update parliamentary dynamics
    this.updateParliamentaryDynamics(gameState);

    // Check for leadership challenges
    this.checkLeadershipChallenges(gameState);

    // Update political capital
    this.updatePoliticalCapital(gameState);
  }

  /**
   * Process international relations
   */
  processInternationalRelations() {
    if (this.simulationDepth.international === 'basic') return;

    this.eventSystem.emit('turn:end', { data: { gameState: this.gameState } });
  }

  /**
   * Process crisis management
   */
  processCrisisManagement() {
    if (this.simulationDepth.crisis === 'basic') return;

    this.eventSystem.emit('turn:end', { data: { gameState: this.gameState } });
  }

  /**
   * Process policy effects
   */
  processPolicyEffects() {
    // Process policy implementation timelines
    if (this.gameState.policies && this.gameState.policies.implementing) {
      this.gameState.policies.implementing.forEach((policy) => {
        if (policy.timeline) {
          policy.timeline.progress += 1;

          // Check if policy phase should advance
          this.checkPolicyPhaseAdvancement(policy);

          // Apply ongoing policy effects
          this.applyOngoingPolicyEffects(policy);
        }
      });
    }
  }

  /**
   * Process random events with weighted probability
   */
  processRandomEvents() {
    // Base event probability
    let eventProbability = 0.05; // 5% per turn base

    // Adjust based on game state
    if (this.gameState.economy.gdpGrowth < 0) eventProbability += 0.02;
    if (this.gameState.politics.approval < 40) eventProbability += 0.02;
    if (this.gameState.time.year === 1) eventProbability *= 0.5; // Fewer events in first year

    if (Math.random() < eventProbability) {
      this.generateRandomEvent();
    }
  }

  /**
   * Calculate derived metrics and interdependencies
   */
  calculateDerivedMetrics() {
    const { gameState } = this;

    // Calculate overall stability index
    gameState.stability = this.calculateStabilityIndex(gameState);

    // Calculate government effectiveness
    gameState.country.governmentEffectiveness = this.calculateGovernmentEffectiveness(gameState);

    // Calculate international standing
    gameState.country.internationalStanding = this.calculateInternationalStanding(gameState);

    // Update demographics based on economic and political changes
    this.updateDemographics(gameState);

    // Calculate quality of life index
    gameState.country.qualityOfLife = this.calculateQualityOfLife(gameState);
  }

  /**
   * Update AI opposition strategies
   */
  updateAIOpposition() {
    // Let AI analyze current situation and adjust strategy
    this.aiOpposition.analyzeGameState(this.gameState);
    this.aiOpposition.updateStrategy(this.gameState);
  }

  /**
   * Calculate policy economic effects
   */
  calculatePolicyEconomicEffects() {
    if (!this.gameState.policies || !this.gameState.policies.active) return {};

    const effects = {
      gdpGrowthEffect: 0,
      unemploymentEffect: 0,
      inflationEffect: 0,
      confidenceEffect: 0,
    };

    this.gameState.policies.active.forEach((policy) => {
      if (policy.economicEffects) {
        Object.keys(policy.economicEffects).forEach((key) => {
          if (effects[key] !== undefined) {
            effects[key] += policy.economicEffects[key];
          }
        });
      }
    });

    return effects;
  }

  /**
   * Calculate external economic factors
   */
  calculateExternalEconomicFactors() {
    const factors = {
      globalGrowthEffect: 0,
      tradeEffect: 0,
      commodityPriceEffect: 0,
      currencyEffect: 0,
    };

    // Get global economic state from international relations
    if (this.internationalRelationsSystem) {
      const { globalEconomy } = this.internationalRelationsSystem;

      // Global growth affects domestic economy
      factors.globalGrowthEffect = (globalEconomy.growth - 2.5) * 0.2; // Baseline 2.5% global growth

      // Trade agreements effect
      const { tradeAgreements } = this.internationalRelationsSystem;
      factors.tradeEffect = tradeAgreements.length * 0.01; // 1% per agreement

      // Oil price effect (simplified)
      factors.commodityPriceEffect = (75 - globalEconomy.oilPrice) * 0.001; // Baseline $75/barrel
    }

    return factors;
  }

  /**
   * Calculate business cycle effects
   */
  calculateBusinessCycleEffects() {
    const { cycle } = this.economicSimulation;
    const effects = {
      gdpEffect: 0,
      unemploymentEffect: 0,
      inflationEffect: 0,
    };

    // Calculate effects based on cycle phase and intensity
    const intensity = cycle.intensity || 0.5;

    switch (cycle.phase) {
      case 'expansion':
        effects.gdpEffect = 0.3 * intensity;
        effects.unemploymentEffect = -0.2 * intensity;
        effects.inflationEffect = 0.1 * intensity;
        break;
      case 'peak':
        effects.gdpEffect = 0.1 * intensity;
        effects.unemploymentEffect = 0;
        effects.inflationEffect = 0.3 * intensity;
        break;
      case 'contraction':
        effects.gdpEffect = -0.4 * intensity;
        effects.unemploymentEffect = 0.3 * intensity;
        effects.inflationEffect = -0.1 * intensity;
        break;
      case 'trough':
        effects.gdpEffect = -0.1 * intensity;
        effects.unemploymentEffect = 0.4 * intensity;
        effects.inflationEffect = -0.2 * intensity;
        break;
      default:
        effects.gdpEffect = 0;
        effects.unemploymentEffect = 0;
        effects.inflationEffect = 0;
        break;
    }

    return effects;
  }

  /**
   * Calculate market confidence
   */
  calculateMarketConfidence() {
    const { gameState } = this;
    let confidence = 50; // Base neutral confidence

    // Economic factors
    if (gameState.economy.gdpGrowth > 2) confidence += 10;
    if (gameState.economy.gdpGrowth < 0) confidence -= 15;
    if (gameState.economy.unemployment < 5) confidence += 5;
    if (gameState.economy.unemployment > 8) confidence -= 10;
    if (gameState.economy.inflation > 4) confidence -= 8;

    // Political factors
    if (gameState.politics.approval > 60) confidence += 8;
    if (gameState.politics.approval < 40) confidence -= 10;

    // Crisis factors
    if (this.crisisManagementSystem && this.crisisManagementSystem.activeCrises) {
      const totalCrisisSeverity = this.crisisManagementSystem.activeCrises
        .reduce((sum, crisis) => sum + crisis.severity, 0);
      confidence -= totalCrisisSeverity * 0.1;
    }

    return {
      level: Math.max(0, Math.min(100, confidence)),
      change: confidence - (gameState.economy.confidence || 50),
    };
  }

  /**
   * Update approval rating with realistic factors
   */
  updateApprovalRating(gameState) {
    // Start with previous approval
    const baseApproval = gameState.politics.approval;
    let approvalChange = 0;

    // Economic perception is based on recent changes, not absolute values
    const gdpPerception = (gameState.economy.deltas?.gdpGrowthDelta || 0) * 10;
    const unemploymentPerception = -(gameState.economy.deltas?.unemploymentDelta || 0) * 8;
    const inflationPerception = -(gameState.economy.deltas?.inflationDelta || 0) * 6;

    // Apply economic perceptions to approval (weighted)
    approvalChange += gdpPerception * 0.3; // GDP is 30% of economic effect
    approvalChange += unemploymentPerception * 0.4; // Unemployment is 40% of economic effect
    approvalChange += inflationPerception * 0.3; // Inflation is 30% of economic effect

    // Factor in honeymoon period (first year bonus)
    if (gameState.time.year === 1) {
      const honeymoonEffect = Math.max(0, (52 - gameState.time.week) / 52) * 0.3;
      approvalChange += honeymoonEffect;
    }

    // Factor in crisis management effectiveness
    if (this.crisisManagementSystem && this.crisisManagementSystem.activeCrises) {
      const activeCrises = this.crisisManagementSystem.activeCrises.length;
      const resolvedCrises = this.crisisManagementSystem.resolvedCrises.length;
      const crisisRatio = resolvedCrises / (activeCrises + resolvedCrises || 1);
      approvalChange += (crisisRatio - 0.5) * 0.2; // Reward above-average crisis management
    }

    // Factor in international relations
    if (this.internationalRelationsSystem) {
      const avgRelations = this.calculateAverageRelations(gameState);
      approvalChange += ((avgRelations - 65) / 100) * 0.05; // Small bonus/penalty for international standing
    }

    // Apply regression to mean (approval gravitates toward 50% over time)
    const regressionEffect = (50 - baseApproval) * 0.01;
    approvalChange += regressionEffect;

    // Add randomness (external events, polling errors, etc.)
    approvalChange += (Math.random() - 0.5) * 0.2;

    // Apply the change with constraints
    gameState.politics.approval = Math.max(0, Math.min(100, baseApproval + approvalChange));

    // Track approval history for trends
    if (!gameState.politics.approvalHistory) {
      gameState.politics.approvalHistory = [];
    }

    const economicFactor = gdpPerception * 0.3 + unemploymentPerception * 0.4 + inflationPerception * 0.3;
    const honeymoonFactor = gameState.time.year === 1 ? (Math.max(0, (52 - gameState.time.week) / 52) * 0.3) : 0;
    const crisisFactor = this.crisisManagementSystem
      ? ((this.crisisManagementSystem.resolvedCrises.length
        / (this.crisisManagementSystem.activeCrises.length + this.crisisManagementSystem.resolvedCrises.length || 1)) - 0.5) * 0.2
      : 0;
    const intlFactor = this.internationalRelationsSystem
      ? ((this.calculateAverageRelations(gameState) - 65) / 100) * 0.05
      : 0;

    gameState.politics.approvalHistory.push({
      week: gameState.time.week,
      year: gameState.time.year,
      value: gameState.politics.approval,
      change: approvalChange,
      factors: {
        economic: economicFactor,
        honeymoon: honeymoonFactor,
        crisis: crisisFactor,
        international: intlFactor,
        regression: regressionEffect,
        random: approvalChange - (economicFactor + honeymoonFactor + crisisFactor + intlFactor + regressionEffect),
      },
    });

    // Keep only last 104 weeks (2 years) of history
    if (gameState.politics.approvalHistory.length > 104) {
      gameState.politics.approvalHistory.shift();
    }

    // Emit approval change event with detailed breakdown
    this.eventSystem.emit('political:approval_change', {
      change: approvalChange,
      newApproval: gameState.politics.approval,
      factors: gameState.politics.approvalHistory[gameState.politics.approvalHistory.length - 1].factors,
    });
  }

  /**
   * Calculate average international relations
   */
  calculateAverageRelations(_gameState) {
    if (!this.internationalRelationsSystem || !this.internationalRelationsSystem.relationships) {
      return 65; // Default neutral-positive
    }

    const relations = Object.values(this.internationalRelationsSystem.relationships);
    if (relations.length === 0) return 65;

    return relations.reduce((sum, relation) => sum + relation, 0) / relations.length;
  }

  /**
   * Update coalition dynamics
   */
  updateCoalitionDynamics(gameState) {
    if (!gameState.politics.coalition) return;

    const { coalition } = gameState.politics;
    let stabilityChange = 0;

    // Approval affects coalition stability
    if (gameState.politics.approval > 60) stabilityChange += 0.5;
    if (gameState.politics.approval < 40) stabilityChange -= 1.0;

    // Policy disagreements affect stability
    if (gameState.policies && gameState.policies.active) {
      const controversialPolicies = gameState.policies.active.filter((policy) => policy.controversy > 60);
      stabilityChange -= controversialPolicies.length * 0.3;
    }

    // Random political events
    stabilityChange += (Math.random() - 0.5) * 0.4;

    coalition.stability = Math.max(0, Math.min(100, coalition.stability + stabilityChange));

    // Check for coalition crisis
    if (coalition.stability < 30 && Math.random() < 0.1) {
      this.triggerCoalitionCrisis(gameState);
    }
  }

  /**
   * Check for political events
   */
  checkForPoliticalEvents(gameState) {
    // Delegate to existing political events system
    this.politicalSystem.checkForPoliticalEvents(gameState);
  }

  /**
   * Update parliamentary dynamics
   */
  updateParliamentaryDynamics(gameState) {
    if (!gameState.politics.parliament) return;

    const { parliament } = gameState.politics;

    // Update party support based on approval
    if (parliament.parties) {
      parliament.parties.forEach((party) => {
        if (party.isGoverning) {
          // Governing party support follows approval
          const supportChange = (gameState.politics.approval - party.support) * 0.1;
          party.support = Math.max(0, Math.min(100, party.support + supportChange));
        } else {
          // Opposition parties benefit from low government approval
          const oppositionBonus = gameState.politics.approval < 50 ? 0.2 : -0.1;
          party.support = Math.max(0, Math.min(100, party.support + oppositionBonus));
        }
      });
    }
  }

  /**
   * Check for leadership challenges
   */
  checkLeadershipChallenges(gameState) {
    // Leadership challenge probability increases with low approval
    let challengeProbability = 0;

    if (gameState.politics.approval < 30) challengeProbability = 0.05; // 5% per turn
    else if (gameState.politics.approval < 40) challengeProbability = 0.02; // 2% per turn

    // Increase probability if many crises
    if (this.crisisManagementSystem && this.crisisManagementSystem.activeCrises.length > 2) {
      challengeProbability += 0.02;
    }

    if (Math.random() < challengeProbability) {
      this.triggerLeadershipChallenge(gameState);
    }
  }

  /**
   * Update political capital
   */
  updatePoliticalCapital(gameState) {
    if (!gameState.politics.politicalCapital) {
      gameState.politics.politicalCapital = 50; // Initialize if not present
    }

    let capitalChange = 0;

    // Approval affects political capital
    if (gameState.politics.approval > 60) capitalChange += 1;
    if (gameState.politics.approval < 40) capitalChange -= 1;

    // Successful crisis management increases capital
    if (this.crisisManagementSystem) {
      const recentResolutions = this.crisisManagementSystem.resolvedCrises.filter(
        (crisis) => (gameState.time.week - crisis.resolvedWeek) < 4,
      );
      capitalChange += recentResolutions.length * 0.5;
    }

    // Natural regeneration (small)
    capitalChange += 0.1;

    gameState.politics.politicalCapital = Math.max(0, Math.min(100, gameState.politics.politicalCapital + capitalChange));
  }

  /**
   * Check policy phase advancement
   */
  checkPolicyPhaseAdvancement(policy) {
    if (!policy.timeline || !policy.timeline.phases) return;

    const currentPhase = policy.timeline.phases[policy.timeline.currentPhase];
    if (!currentPhase) return;

    if (policy.timeline.progress >= currentPhase.duration) {
      // Advance to next phase
      policy.timeline.currentPhase += 1;
      policy.timeline.progress = 0;

      // Emit phase change event
      this.eventSystem.emit('policy:phase_advanced', {
        policy,
        newPhase: policy.timeline.phases[policy.timeline.currentPhase],
      });

      // Check if policy is fully implemented
      if (policy.timeline.currentPhase >= policy.timeline.phases.length) {
        this.completePolicy(policy);
      }
    }
  }

  /**
   * Apply ongoing policy effects
   */
  applyOngoingPolicyEffects(policy) {
    if (!policy.effects || !policy.effects.ongoing) return;

    // Apply gradual effects during implementation
    const implementationRatio = policy.timeline.progress / policy.timeline.totalWeeks;
    const effectMultiplier = implementationRatio * 0.1; // 10% of final effect per full implementation

    Object.keys(policy.effects.ongoing).forEach((key) => {
      const effect = policy.effects.ongoing[key] * effectMultiplier;
      this.applyGameStateEffect(key, effect);
    });
  }

  /**
   * Generate random event
   */
  generateRandomEvent() {
    const eventTypes = [
      { type: 'economic_news', weight: 0.3 },
      { type: 'political_development', weight: 0.25 },
      { type: 'international_incident', weight: 0.2 },
      { type: 'social_issue', weight: 0.15 },
      { type: 'natural_event', weight: 0.1 },
    ];

    const selectedType = this.weightedRandomSelect(eventTypes);

    // Generate event based on type
    this.generateEventByType(selectedType);
  }

  /**
   * Calculate stability index
   */
  calculateStabilityIndex(gameState) {
    let stability = 50; // Base neutral

    // Economic stability factors
    stability += Math.max(-10, Math.min(10, gameState.economy.gdpGrowth * 3));
    stability -= Math.max(0, (gameState.economy.unemployment - 6) * 2);
    stability -= Math.max(0, (gameState.economy.inflation - 3) * 3);

    // Political stability factors
    stability += (gameState.politics.approval - 50) * 0.3;

    // Crisis stability impact
    if (this.crisisManagementSystem) {
      const totalCrisisSeverity = this.crisisManagementSystem.activeCrises
        .reduce((sum, crisis) => sum + crisis.severity, 0);
      stability -= totalCrisisSeverity * 0.1;
    }

    return Math.max(0, Math.min(100, stability));
  }

  /**
   * Calculate government effectiveness
   */
  calculateGovernmentEffectiveness(gameState) {
    let effectiveness = 50; // Base

    // Approval affects effectiveness
    effectiveness += (gameState.politics.approval - 50) * 0.3;

    // Political capital affects effectiveness
    if (gameState.politics.politicalCapital) {
      effectiveness += (gameState.politics.politicalCapital - 50) * 0.2;
    }

    // Crisis management affects effectiveness
    if (this.crisisManagementSystem) {
      const managementScore = this.crisisManagementSystem.activeCrises
        .reduce((sum, crisis) => sum + crisis.managementScore, 0) / (this.crisisManagementSystem.activeCrises.length || 1);
      effectiveness += (managementScore - 50) * 0.1;
    }

    return Math.max(0, Math.min(100, effectiveness));
  }

  /**
   * Calculate international standing
   */
  calculateInternationalStanding(gameState) {
    if (!this.internationalRelationsSystem) return 50;

    const avgRelations = this.calculateAverageRelations(gameState);
    const tradeAgreements = this.internationalRelationsSystem.tradeAgreements.length;
    const organizationStanding = Object.values(this.internationalRelationsSystem.organizations)
      .filter((org) => org.membership)
      .reduce((sum, org) => sum + org.influence, 0) / 10;

    return Math.max(0, Math.min(100, (avgRelations * 0.6) + (tradeAgreements * 2) + organizationStanding));
  }

  /**
   * Update demographics
   */
  updateDemographics(gameState) {
    if (this.simulationDepth.demographics === 'basic') return;

    if (!gameState.demographics) {
      gameState.demographics = {
        populationGrowth: 0.8,
        ageDistribution: { young: 30, middle: 50, elderly: 20 },
        education: { low: 30, medium: 50, high: 20 },
        income: { low: 35, middle: 45, high: 20 },
      };
    }

    // Population growth affected by economic conditions
    const economicEffect = (gameState.economy.gdpGrowth - 2) * 0.1;
    gameState.demographics.populationGrowth += economicEffect * 0.1;

    // Education levels slowly improve with economic prosperity
    if (gameState.economy.gdpGrowth > 2) {
      gameState.demographics.education.high += 0.01;
      gameState.demographics.education.medium -= 0.005;
      gameState.demographics.education.low -= 0.005;
    }
  }

  /**
   * Calculate quality of life index
   */
  calculateQualityOfLife(gameState) {
    let qol = 50; // Base

    // Economic factors
    qol += Math.max(-15, Math.min(15, gameState.economy.gdpGrowth * 5));
    qol -= Math.max(0, (gameState.economy.unemployment - 5) * 3);
    qol -= Math.max(0, (gameState.economy.inflation - 2) * 2);

    // Political factors
    qol += (gameState.politics.approval - 50) * 0.2;

    // Stability factor
    qol += (gameState.stability - 50) * 0.3;

    return Math.max(0, Math.min(100, qol));
  }

  /**
   * Weighted random selection utility
   */
  weightedRandomSelect(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    let selectedType = items[items.length - 1].type;
    items.some((item) => {
      random -= item.weight;
      if (random <= 0) {
        selectedType = item.type;
        return true;
      }
      return false;
    });
    return selectedType;
  }

  /**
   * Generate event by type
   */
  generateEventByType(type) {
    // Simplified event generation - would be more complex in full implementation
    this.eventSystem.emit('game:random_event', {
      type,
      gameState: this.gameState,
    });
  }

  /**
   * Apply game state effect
   */
  applyGameStateEffect(key, effect) {
    // Apply effect to appropriate game state property
    const keyParts = key.split('.');
    let target = this.gameState;

    for (let i = 0; i < keyParts.length - 1; i++) {
      if (!target[keyParts[i]]) target[keyParts[i]] = {};
      target = target[keyParts[i]];
    }

    const finalKey = keyParts[keyParts.length - 1];
    if (target[finalKey] !== undefined) {
      target[finalKey] += effect;
    }
  }

  /**
   * Complete policy implementation
   */
  completePolicy(policy) {
    // Move from implementing to active
    if (this.gameState.policies.implementing) {
      const index = this.gameState.policies.implementing.indexOf(policy);
      if (index > -1) {
        this.gameState.policies.implementing.splice(index, 1);
      }
    }

    if (!this.gameState.policies.active) {
      this.gameState.policies.active = [];
    }

    this.gameState.policies.active.push(policy);

    // Apply full implementation effects
    if (policy.effects && policy.effects.final) {
      Object.keys(policy.effects.final).forEach((key) => {
        this.applyGameStateEffect(key, policy.effects.final[key]);
      });
    }

    this.eventSystem.emit('policy:completed', { policy });
  }

  /**
   * Trigger coalition crisis
   */
  triggerCoalitionCrisis(gameState) {
    this.eventSystem.emit('political:coalition_crisis', {
      gameState,
      severity: 100 - gameState.politics.coalition.stability,
    });
  }

  /**
   * Trigger leadership challenge
   */
  triggerLeadershipChallenge(gameState) {
    this.eventSystem.emit('political:leadership_challenge', {
      gameState,
      probability: gameState.politics.approval < 30 ? 0.6 : 0.3,
    });
  }
}

// Create and export global game engine instance
export const gameEngine = new GameEngine();
