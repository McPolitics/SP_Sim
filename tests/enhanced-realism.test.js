/**
 * Enhanced Game Engine Tests - Validates realistic simulation mechanics
 */

import { gameEngine } from '../src/core/GameEngine.js';
import { crisisManagementSystem } from '../src/core/CrisisManagementSystem.js';
import { internationalRelationsSystem } from '../src/core/InternationalRelationsSystem.js';

describe('Enhanced Game Engine - Realistic Simulation', () => {
  beforeEach(() => {
    gameEngine.initialize();
    gameEngine.gameState = gameEngine.createInitialGameState();
  });

  describe('Economic Realism', () => {
    test('should process economic changes with multiple factors', () => {
      const initialGDP = gameEngine.gameState.economy.gdpGrowth;
      
      // Process a turn with economic effects
      gameEngine.processEconomicChanges();
      
      expect(gameEngine.gameState.economy.deltas).toBeDefined();
      expect(gameEngine.gameState.economy.deltas.gdpGrowthDelta).toBeDefined();
      expect(typeof gameEngine.gameState.economy.deltas.gdpGrowthDelta).toBe('number');
    });

    test('should calculate business cycle effects realistically', () => {
      const cycleEffects = gameEngine.calculateBusinessCycleEffects();
      
      expect(cycleEffects).toHaveProperty('gdpEffect');
      expect(cycleEffects).toHaveProperty('unemploymentEffect');
      expect(cycleEffects).toHaveProperty('inflationEffect');
      
      // Effects should be within reasonable bounds
      expect(Math.abs(cycleEffects.gdpEffect)).toBeLessThan(1.0);
      expect(Math.abs(cycleEffects.unemploymentEffect)).toBeLessThan(1.0);
      expect(Math.abs(cycleEffects.inflationEffect)).toBeLessThan(1.0);
    });

    test('should update market confidence based on multiple factors', () => {
      gameEngine.gameState.economy.gdpGrowth = 3.5; // Strong growth
      gameEngine.gameState.economy.unemployment = 4.5; // Low unemployment
      gameEngine.gameState.politics.approval = 65; // Good approval
      
      const confidence = gameEngine.calculateMarketConfidence();
      
      expect(confidence).toHaveProperty('level');
      expect(confidence).toHaveProperty('change');
      expect(confidence.level).toBeGreaterThan(50); // Should be positive with good conditions
    });
  });

  describe('Political Realism', () => {
    test('should update approval rating with economic deltas', () => {
      const initialApproval = gameEngine.gameState.politics.approval;
      
      // Set up positive economic changes
      gameState.economy.deltas = {
        gdpGrowthDelta: 0.5,
        unemploymentDelta: -0.3,
        inflationDelta: -0.1,
      };
      
      gameEngine.updateApprovalRating(gameEngine.gameState);
      
      expect(gameEngine.gameState.politics.approval).toBeGreaterThan(initialApproval);
      expect(gameEngine.gameState.politics.approvalHistory).toHaveLength(1);
    });

    test('should track approval history with factor breakdown', () => {
      gameEngine.updateApprovalRating(gameEngine.gameState);
      
      const history = gameEngine.gameState.politics.approvalHistory;
      expect(history).toHaveLength(1);
      
      const latestEntry = history[0];
      expect(latestEntry).toHaveProperty('factors');
      expect(latestEntry.factors).toHaveProperty('economic');
      expect(latestEntry.factors).toHaveProperty('regression');
      expect(latestEntry.factors).toHaveProperty('random');
    });

    test('should calculate political capital correctly', () => {
      gameEngine.gameState.politics.approval = 70;
      gameEngine.updatePoliticalCapital(gameEngine.gameState);
      
      expect(gameEngine.gameState.politics.politicalCapital).toBeGreaterThan(50);
    });
  });

  describe('Crisis Management System', () => {
    test('should generate realistic crises', () => {
      const crisis = crisisManagementSystem.generateCrisis({
        type: 'economic',
        title: 'Test Economic Crisis',
        description: 'A test crisis for validation',
        initialSeverity: 40,
      });

      expect(crisis).toHaveProperty('id');
      expect(crisis).toHaveProperty('type', 'economic');
      expect(crisis).toHaveProperty('severity');
      expect(crisis.severity).toBeGreaterThanOrEqual(0);
      expect(crisis.severity).toBeLessThanOrEqual(100);
    });

    test('should process crisis evolution', () => {
      const crisis = crisisManagementSystem.generateCrisis({
        type: 'political',
        title: 'Test Political Crisis',
        description: 'A test crisis',
        initialSeverity: 30,
      });

      const initialSeverity = crisis.severity;
      
      crisisManagementSystem.updateCrisisState(crisis, gameEngine.gameState);
      
      expect(crisis.currentWeek).toBe(1);
      expect(typeof crisis.severity).toBe('number');
    });

    test('should handle crisis responses', () => {
      const crisis = crisisManagementSystem.generateCrisis({
        type: 'economic',
        title: 'Economic Test Crisis',
        description: 'Test crisis for response',
        initialSeverity: 35,
      });

      const success = crisisManagementSystem.respondToCrisis({
        crisisId: crisis.id,
        responseId: 'stimulus',
        gameState: gameEngine.gameState,
      });

      expect(success).toBe(true);
      expect(crisis.activeResponses).toHaveLength(1);
      expect(crisis.responseHistory).toHaveLength(1);
    });
  });

  describe('International Relations System', () => {
    test('should initialize countries with realistic data', () => {
      expect(internationalRelationsSystem.countries).toHaveProperty('USA');
      expect(internationalRelationsSystem.countries).toHaveProperty('CHN');
      expect(internationalRelationsSystem.countries).toHaveProperty('DEU');
      
      const usa = internationalRelationsSystem.countries.USA;
      expect(usa).toHaveProperty('economicPower');
      expect(usa).toHaveProperty('militaryPower');
      expect(usa).toHaveProperty('diplomaticInfluence');
      expect(usa.economicPower).toBeGreaterThan(0);
      expect(usa.economicPower).toBeLessThanOrEqual(100);
    });

    test('should update diplomatic relations', () => {
      // Initialize some relationships
      internationalRelationsSystem.relationships.USA = 75;
      internationalRelationsSystem.relationships.CHN = 45;
      
      internationalRelationsSystem.updateDiplomaticRelations(gameEngine.gameState);
      
      expect(internationalRelationsSystem.relationships.USA).toBeDefined();
      expect(internationalRelationsSystem.relationships.CHN).toBeDefined();
      
      // Relations should be within bounds
      Object.values(internationalRelationsSystem.relationships).forEach((relation) => {
        expect(relation).toBeGreaterThanOrEqual(0);
        expect(relation).toBeLessThanOrEqual(100);
      });
    });

    test('should negotiate trade agreements', () => {
      internationalRelationsSystem.relationships.DEU = 70; // Good relations
      
      const success = internationalRelationsSystem.negotiateTradeAgreement({
        countryCode: 'DEU',
        terms: { type: 'bilateral_trade' },
        gameState: gameEngine.gameState,
      });

      // With good relations, should have reasonable chance of success
      expect(typeof success).toBe('boolean');
      
      if (success) {
        expect(internationalRelationsSystem.tradeAgreements.length).toBeGreaterThan(0);
      }
    });
  });

  describe('System Integration', () => {
    test('should process complete turn with all systems', () => {
      const initialWeek = gameEngine.gameState.time.week;
      const initialApproval = gameEngine.gameState.politics.approval;
      
      gameEngine.processTurn();
      
      expect(gameEngine.gameState.time.week).toBe(initialWeek + 1);
      expect(gameEngine.gameState.stability).toBeDefined();
      expect(gameEngine.gameState.country.governmentEffectiveness).toBeDefined();
    });

    test('should calculate derived metrics correctly', () => {
      gameEngine.gameState.economy.gdpGrowth = 2.5;
      gameEngine.gameState.economy.unemployment = 5.5;
      gameEngine.gameState.politics.approval = 55;
      
      gameEngine.calculateDerivedMetrics();
      
      expect(gameEngine.gameState.stability).toBeGreaterThan(0);
      expect(gameEngine.gameState.stability).toBeLessThanOrEqual(100);
      expect(gameEngine.gameState.country.governmentEffectiveness).toBeGreaterThan(0);
      expect(gameEngine.gameState.country.qualityOfLife).toBeGreaterThan(0);
    });

    test('should handle performance monitoring', () => {
      // Process several turns to build performance data
      for (let i = 0; i < 5; i++) {
        gameEngine.processTurn();
      }
      
      expect(gameEngine.performanceMetrics.length).toBeGreaterThan(0);
      expect(gameEngine.turnProcessingTimes.length).toBeGreaterThan(0);
      
      gameEngine.performanceMetrics.forEach((metric) => {
        expect(metric).toHaveProperty('processingTime');
        expect(metric).toHaveProperty('effectiveSpeed');
        expect(metric.processingTime).toBeGreaterThan(0);
      });
    });

    test('should maintain economic realism bounds', () => {
      // Run many turns and check bounds remain realistic
      for (let i = 0; i < 20; i++) {
        gameEngine.processTurn();
      }
      
      const { economy } = gameEngine.gameState;
      
      // GDP growth should be within reasonable bounds
      expect(economy.gdpGrowth).toBeGreaterThan(-10);
      expect(economy.gdpGrowth).toBeLessThan(15);
      
      // Unemployment should be realistic
      expect(economy.unemployment).toBeGreaterThan(0);
      expect(economy.unemployment).toBeLessThan(30);
      
      // Inflation should be bounded
      expect(economy.inflation).toBeGreaterThan(-5);
      expect(economy.inflation).toBeLessThan(20);
    });
  });

  describe('Adaptive Performance', () => {
    test('should adjust game speed based on processing time', () => {
      const initialSpeed = gameEngine.effectiveGameSpeed;
      
      // Simulate slow processing by manipulating turn times
      gameEngine.turnProcessingTimes = [100, 120, 110, 130, 125]; // Slow processing
      
      gameEngine.processTurn(); // This should trigger speed adjustment
      
      expect(gameEngine.effectiveGameSpeed).toBeGreaterThanOrEqual(initialSpeed);
    });

    test('should handle simulation depth settings', () => {
      expect(gameEngine.simulationDepth).toHaveProperty('economic');
      expect(gameEngine.simulationDepth).toHaveProperty('political');
      expect(gameEngine.simulationDepth).toHaveProperty('international');
      
      // Test different depth levels
      gameEngine.simulationDepth.economic = 'basic';
      gameEngine.processEconomicChanges(); // Should handle basic mode
      
      gameEngine.simulationDepth.economic = 'detailed';
      gameEngine.processEconomicChanges(); // Should handle detailed mode
    });
  });

  describe('Event Integration', () => {
    test('should emit comprehensive events', () => {
      const events = [];
      
      gameEngine.eventSystem.on('economic:update', (event) => {
        events.push(event);
      });
      
      gameEngine.eventSystem.on('political:approval_change', (event) => {
        events.push(event);
      });
      
      gameEngine.processTurn();
      
      expect(events.length).toBeGreaterThan(0);
    });

    test('should handle crisis events', () => {
      const crisisEvents = [];
      
      gameEngine.eventSystem.on('crisis:generated', (event) => {
        crisisEvents.push(event);
      });
      
      // Generate a crisis
      crisisManagementSystem.generateCrisis({
        type: 'security',
        title: 'Security Crisis',
        description: 'Test security crisis',
        initialSeverity: 45,
      });
      
      expect(crisisEvents.length).toBe(1);
      expect(crisisEvents[0]).toHaveProperty('crisis');
    });
  });
});

describe('Economic Simulation Enhancements', () => {
  test('should process enhanced economic turn', () => {
    const economicSim = gameEngine.economicSimulation;
    const gameState = gameEngine.gameState;
    
    const policyEffects = { gdpGrowthEffect: 0.1 };
    const externalPressures = { globalGrowthEffect: 0.05 };
    const cycleEffects = { gdpEffect: 0.02 };
    const confidenceEffects = { level: 65 };
    
    const result = economicSim.processEconomicTurn(
      gameState,
      policyEffects,
      externalPressures,
      cycleEffects,
      confidenceEffects,
    );
    
    expect(result).toHaveProperty('deltas');
    expect(result).toHaveProperty('appliedEffects');
    expect(result.appliedEffects.policyEffects).toEqual(policyEffects);
  });

  test('should handle sector interactions', () => {
    const economicSim = gameEngine.economicSimulation;
    
    economicSim.updateSectorInteractions();
    
    expect(economicSim.sectors.manufacturing).toHaveProperty('currentGrowth');
    expect(economicSim.sectors.services).toHaveProperty('currentGrowth');
    expect(economicSim.sectors.agriculture).toHaveProperty('currentGrowth');
  });
});
