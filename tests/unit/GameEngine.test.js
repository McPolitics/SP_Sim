import { GameEngine } from '../../src/core/GameEngine.js';

describe('GameEngine', () => {
  let gameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine();
  });

  afterEach(() => {
    gameEngine.stop();
  });

  test('should create instance with initial state', () => {
    expect(gameEngine).toBeInstanceOf(GameEngine);
    expect(gameEngine.isRunning).toBe(false);
    expect(gameEngine.isPaused).toBe(false);
    expect(gameEngine.gameState).toBeDefined();
    expect(gameEngine.gameState.version).toBe('1.0.0');
  });

  test('should initialize with proper game state structure', () => {
    const state = gameEngine.gameState;

    expect(state.player).toBeDefined();
    expect(state.country).toBeDefined();
    expect(state.economy).toBeDefined();
    expect(state.politics).toBeDefined();
    expect(state.global).toBeDefined();
    expect(state.time).toBeDefined();

    // Check required fields
    expect(state.player.name).toBe('Player');
    expect(state.country.name).toBe('Democracia');
    expect(state.economy.gdpGrowth).toBe(2.1);
    expect(state.politics.approval).toBe(50);
    expect(state.time.week).toBe(1);
    expect(state.time.year).toBe(1);
  });

  test('should start and stop correctly', () => {
    expect(gameEngine.isRunning).toBe(false);

    gameEngine.start();
    expect(gameEngine.isRunning).toBe(true);
    expect(gameEngine.isPaused).toBe(false);

    gameEngine.stop();
    expect(gameEngine.isRunning).toBe(false);
  });

  test('should pause and resume correctly', () => {
    gameEngine.start();
    expect(gameEngine.isPaused).toBe(false);

    gameEngine.pause();
    expect(gameEngine.isPaused).toBe(true);
    expect(gameEngine.isRunning).toBe(true);

    gameEngine.resume();
    expect(gameEngine.isPaused).toBe(false);
    expect(gameEngine.isRunning).toBe(true);
  });

  test('should advance time correctly', () => {
    const initialWeek = gameEngine.gameState.time.week;
    const initialYear = gameEngine.gameState.time.year;

    gameEngine.advanceTime();

    expect(gameEngine.gameState.time.week).toBe(initialWeek + 1);
    expect(gameEngine.gameState.time.year).toBe(initialYear);

    // Test year transition
    gameEngine.gameState.time.week = 52;
    gameEngine.advanceTime();

    expect(gameEngine.gameState.time.week).toBe(1);
    expect(gameEngine.gameState.time.year).toBe(initialYear + 1);
  });

  test('should update game state correctly', () => {
    const updates = {
      politics: {
        approval: 75,
      },
      economy: {
        gdpGrowth: 3.5,
      },
    };

    gameEngine.updateGameState(updates);

    expect(gameEngine.gameState.politics.approval).toBe(75);
    expect(gameEngine.gameState.economy.gdpGrowth).toBe(3.5);
    // Other values should remain unchanged
    expect(gameEngine.gameState.economy.unemployment).toBe(6.0);
  });

  test('should return read-only game state copy', () => {
    const stateCopy = gameEngine.getGameState();

    // Modify the copy
    stateCopy.politics.approval = 999;

    // Original should be unchanged
    expect(gameEngine.gameState.politics.approval).toBe(50);
  });

  test('should set game speed within bounds', () => {
    gameEngine.setGameSpeed(500);
    expect(gameEngine.gameSpeed).toBe(500);

    // Test lower bound
    gameEngine.setGameSpeed(50);
    expect(gameEngine.gameSpeed).toBe(100);

    // Test upper bound
    gameEngine.setGameSpeed(10000);
    expect(gameEngine.gameSpeed).toBe(5000);
  });

  test('should provide game statistics', () => {
    const stats = gameEngine.getGameStats();

    expect(stats).toHaveProperty('isRunning');
    expect(stats).toHaveProperty('isPaused');
    expect(stats).toHaveProperty('gameSpeed');
    expect(stats).toHaveProperty('fps');
    expect(stats).toHaveProperty('currentTurn');
    expect(stats).toHaveProperty('currentYear');
    expect(stats).toHaveProperty('playtime');

    expect(stats.isRunning).toBe(false);
    expect(stats.currentTurn).toBe(1);
    expect(stats.currentYear).toBe(1);
  });

  test('should process turns correctly', () => {
    const initialWeek = gameEngine.gameState.time.week;

    gameEngine.processTurn();

    expect(gameEngine.gameState.time.week).toBe(initialWeek + 1);
  });

  test('should handle deep merge correctly', () => {
    const target = {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
      e: [1, 2, 3],
    };

    const source = {
      b: {
        c: 99,
        f: 4,
      },
      g: 5,
    };

    const result = gameEngine.mergeDeep(target, source);

    expect(result.a).toBe(1); // unchanged
    expect(result.b.c).toBe(99); // updated
    expect(result.b.d).toBe(3); // preserved
    expect(result.b.f).toBe(4); // added
    expect(result.e).toEqual([1, 2, 3]); // unchanged array
    expect(result.g).toBe(5); // added
  });
});