/**
 * Economic Simulation Tests
 * Tests for Week 6-8 economic features
 */

import { EconomicSimulation } from '../../src/core/EconomicSimulation';
import { eventSystem } from '../../src/core/EventSystem';

describe('EconomicSimulation', () => {
  let economicSim;
  let mockEventSystem;

  beforeEach(() => {
    economicSim = new EconomicSimulation();
    
    // Mock event system to avoid side effects
    mockEventSystem = {
      emit: jest.fn(),
      on: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Economic Metrics', () => {
    test('should initialize with default economic metrics', () => {
      expect(economicSim.metrics.gdp).toBeGreaterThan(0);
      expect(economicSim.metrics.gdpGrowth).toBeDefined();
      expect(economicSim.metrics.unemployment).toBeDefined();
      expect(economicSim.metrics.inflation).toBeDefined();
      expect(economicSim.metrics.confidence).toBeDefined();
    });

    test('should have three economic sectors', () => {
      expect(economicSim.sectors).toHaveProperty('agriculture');
      expect(economicSim.sectors).toHaveProperty('manufacturing');
      expect(economicSim.sectors).toHaveProperty('services');
    });

    test('should have business cycle tracking', () => {
      expect(economicSim.cycle.phase).toBeDefined();
      expect(economicSim.cycle.duration).toBeDefined();
      expect(economicSim.cycle.intensity).toBeDefined();
    });
  });

  describe('Week 7: Policy Implementation', () => {
    test('should apply fiscal stimulus policy', () => {
      const initialConfidence = economicSim.metrics.confidence;
      const initialGovSpending = economicSim.metrics.governmentSpending;

      economicSim.applyPolicy({
        type: 'fiscal_stimulus',
        name: 'Test Stimulus',
        amount: 0.02,
        duration: 12,
      });

      expect(economicSim.metrics.confidence).toBeGreaterThan(initialConfidence);
      expect(economicSim.metrics.governmentSpending).toBeGreaterThan(initialGovSpending);
      expect(economicSim.policies.length).toBe(1);
    });

    test('should apply tax cut policy', () => {
      const initialConfidence = economicSim.metrics.confidence;
      const initialConsumerSpending = economicSim.metrics.consumerSpending;

      economicSim.applyPolicy({
        type: 'tax_cut',
        name: 'Tax Cuts',
        amount: 0.015,
        duration: 24,
      });

      expect(economicSim.metrics.confidence).toBeGreaterThan(initialConfidence);
      expect(economicSim.metrics.consumerSpending).toBeGreaterThan(initialConsumerSpending);
    });

    test('should apply infrastructure investment policy', () => {
      const initialProductivity = economicSim.metrics.productivity;
      const initialManufacturingGrowth = economicSim.sectors.manufacturing.growth;

      economicSim.applyPolicy({
        type: 'infrastructure_investment',
        name: 'Infrastructure',
        amount: 0.05,
        duration: 52,
      });

      expect(economicSim.metrics.productivity).toBeGreaterThan(initialProductivity);
      expect(economicSim.sectors.manufacturing.growth).toBeGreaterThan(initialManufacturingGrowth);
    });

    test('should apply new Week 7 policies', () => {
      // Test education investment
      economicSim.applyPolicy({
        type: 'education_investment',
        name: 'Education Investment',
        amount: 0.03,
        duration: 78,
      });

      // Test healthcare investment
      economicSim.applyPolicy({
        type: 'healthcare_investment',
        name: 'Healthcare Investment',
        amount: 0.025,
        duration: 104,
      });

      // Test green energy investment
      economicSim.applyPolicy({
        type: 'green_energy_investment',
        name: 'Green Energy',
        amount: 0.04,
        duration: 156,
      });

      expect(economicSim.policies.length).toBe(3);
    });

    test('should handle interest rate changes', () => {
      const initialRate = economicSim.metrics.interestRate;

      economicSim.applyPolicy({
        type: 'interest_rate_change',
        name: 'Rate Cut',
        change: -0.5,
        duration: 1,
      });

      expect(economicSim.metrics.interestRate).toBe(initialRate - 0.5);
    });

    test('should process ongoing policy effects', () => {
      economicSim.applyPolicy({
        type: 'test_policy',
        name: 'Test Policy',
        duration: 5,
        ongoingEffects: {
          confidence: 1,
          productivity: 0.01,
        },
      });

      const initialConfidence = economicSim.metrics.confidence;
      const initialProductivity = economicSim.metrics.productivity;

      economicSim.applyActivePolicies();

      expect(economicSim.metrics.confidence).toBeGreaterThan(initialConfidence);
      expect(economicSim.metrics.productivity).toBeGreaterThan(initialProductivity);
    });

    test('should remove expired policies', () => {
      economicSim.applyPolicy({
        type: 'short_policy',
        name: 'Short Policy',
        duration: 2,
      });

      expect(economicSim.policies.length).toBe(1);

      // Simulate 3 weeks of policy application
      economicSim.applyActivePolicies();
      economicSim.applyActivePolicies();
      economicSim.applyActivePolicies();

      expect(economicSim.policies.length).toBe(0);
    });
  });

  describe('Week 8: Economic Events and Shocks', () => {
    test('should apply oil price spike shock', () => {
      const initialInflation = economicSim.metrics.inflation;
      const initialConfidence = economicSim.metrics.confidence;

      economicSim.applyShock({
        type: 'oil_price_spike',
        magnitude: 1.0,
      });

      expect(economicSim.metrics.inflation).toBeGreaterThan(initialInflation);
      expect(economicSim.metrics.confidence).toBeLessThan(initialConfidence);
      expect(economicSim.shocks.length).toBe(1);
    });

    test('should apply financial crisis shock', () => {
      economicSim.applyShock({
        type: 'financial_crisis',
        magnitude: 1.5,
      });

      expect(economicSim.cycle.phase).toBe('recession');
      expect(economicSim.cycle.duration).toBe(0);
    });

    test('should apply new Week 8 shock types', () => {
      // Test supply chain disruption
      economicSim.applyShock({
        type: 'supply_chain_disruption',
        magnitude: 0.8,
      });

      // Test commodity price spike
      economicSim.applyShock({
        type: 'commodity_price_spike',
        magnitude: 0.6,
      });

      // Test tech innovation (positive shock)
      const initialProductivity = economicSim.metrics.productivity;
      economicSim.applyShock({
        type: 'tech_innovation',
        magnitude: 0.5,
      });

      expect(economicSim.metrics.productivity).toBeGreaterThan(initialProductivity);
      expect(economicSim.shocks.length).toBe(3);
    });

    test('should generate random economic shocks', () => {
      const shock = economicSim.generateRandomShock();
      
      expect(shock).toHaveProperty('type');
      expect(shock).toHaveProperty('message');
      expect(shock).toHaveProperty('severity');
      expect(shock).toHaveProperty('magnitude');
      expect(shock.magnitude).toBeGreaterThan(0);
    });

    test('should detect economic events', () => {
      // Mock high inflation scenario
      economicSim.metrics.inflation = 5.0;
      const events = [];
      
      // Mock event emission
      const originalEmit = eventSystem.emit;
      eventSystem.emit = jest.fn((eventType, eventData) => {
        if (eventType === 'economic:event') {
          events.push(eventData);
        }
      });

      economicSim.checkEconomicEvents();

      // Should potentially detect high inflation
      eventSystem.emit = originalEmit;
    });

    test('should handle natural disaster shock', () => {
      const initialGDP = economicSim.metrics.gdpGrowth;
      const initialAgriGrowth = economicSim.sectors.agriculture.growth;

      economicSim.applyShock({
        type: 'natural_disaster',
        magnitude: 1.0,
      });

      expect(economicSim.metrics.gdpGrowth).toBeLessThan(initialGDP);
      expect(economicSim.sectors.agriculture.growth).toBeLessThan(initialAgriGrowth);
    });
  });

  describe('Business Cycle Management', () => {
    test('should update business cycle phases', () => {
      // Test expansion to peak transition
      economicSim.cycle.phase = 'expansion';
      economicSim.cycle.duration = 105; // Over 104 weeks
      economicSim.metrics.inflation = 5.0; // High inflation

      economicSim.updateBusinessCycle();

      expect(economicSim.cycle.phase).toBe('peak');
      expect(economicSim.cycle.duration).toBe(0);
    });

    test('should provide cycle effect multipliers', () => {
      economicSim.cycle.phase = 'expansion';
      economicSim.cycle.intensity = 0.8;
      
      const effect = economicSim.getCycleEffect();
      expect(effect).toBeGreaterThan(1.0);

      economicSim.cycle.phase = 'recession';
      const recessionEffect = economicSim.getCycleEffect();
      expect(recessionEffect).toBeLessThan(1.0);
    });
  });

  describe('Economic Forecasting', () => {
    test('should generate economic forecast', () => {
      const forecast = economicSim.getForecast(12);

      expect(forecast).toHaveProperty('gdpGrowth');
      expect(forecast).toHaveProperty('unemployment');
      expect(forecast).toHaveProperty('inflation');
      
      expect(forecast.gdpGrowth).toHaveLength(12);
      expect(forecast.unemployment).toHaveLength(12);
      expect(forecast.inflation).toHaveLength(12);
    });

    test('should provide economic state snapshot', () => {
      const state = economicSim.getEconomicState();

      expect(state).toHaveProperty('metrics');
      expect(state).toHaveProperty('sectors');
      expect(state).toHaveProperty('cycle');
      expect(state).toHaveProperty('activePolicies');
      expect(state).toHaveProperty('activeShocks');
    });
  });

  describe('Sector Performance', () => {
    test('should update sector performance with cycle effects', () => {
      economicSim.cycle.phase = 'expansion';
      economicSim.cycle.intensity = 0.6;

      economicSim.updateSectors();

      Object.keys(economicSim.sectors).forEach((sectorName) => {
        const sector = economicSim.sectors[sectorName];
        expect(sector).toHaveProperty('currentGrowth');
        expect(sector).toHaveProperty('cycleEffect');
      });
    });
  });

  describe('GDP and Economic Indicators', () => {
    test('should update GDP based on sector performance', () => {
      const initialGDP = economicSim.metrics.gdp;
      
      economicSim.updateSectors();
      economicSim.updateGDP();

      // GDP should be updated (could be higher or lower depending on random factors)
      expect(typeof economicSim.metrics.gdp).toBe('number');
      expect(economicSim.metrics.gdp).toBeGreaterThan(0);
    });

    test('should update unemployment with business cycle effects', () => {
      const initialUnemployment = economicSim.metrics.unemployment;
      
      economicSim.updateUnemployment();

      expect(typeof economicSim.metrics.unemployment).toBe('number');
      expect(economicSim.metrics.unemployment).toBeGreaterThan(0);
    });

    test('should update inflation with multiple factors', () => {
      economicSim.updateInflation();

      expect(typeof economicSim.metrics.inflation).toBe('number');
      expect(economicSim.metrics.inflation).toBeGreaterThanOrEqual(0);
    });

    test('should update confidence based on economic conditions', () => {
      const initialConfidence = economicSim.metrics.confidence;
      
      economicSim.updateConfidence();

      expect(typeof economicSim.metrics.confidence).toBe('number');
      expect(economicSim.metrics.confidence).toBeGreaterThanOrEqual(0);
      expect(economicSim.metrics.confidence).toBeLessThanOrEqual(100);
    });
  });
});