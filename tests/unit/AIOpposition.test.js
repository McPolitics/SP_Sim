import { aiOpposition } from '../../src/core/AIOpposition';
import { eventSystem } from '../../src/core/EventSystem';

describe('AIOpposition', () => {
  let mockGameState;

  beforeEach(() => {
    mockGameState = {
      time: { week: 10, year: 1 },
      politics: { 
        approval: 45,
        nextElection: { week: 1, year: 4 }
      },
      economy: {
        gdpGrowth: 1.5,
        unemployment: 6.5,
        inflation: 3.2
      }
    };
    
    // Reset AI opposition
    aiOpposition.reset();
  });

  test('should initialize with opposition parties', () => {
    expect(aiOpposition.oppositionParties).toHaveLength(3);
    expect(aiOpposition.oppositionParties[0].name).toBe('Main Opposition');
    expect(aiOpposition.oppositionParties[1].name).toBe('Progressive Alliance');
    expect(aiOpposition.oppositionParties[2].name).toBe('People\'s Voice');
  });

  test('should update strategy based on player approval', () => {
    const lowApprovalState = { ...mockGameState, politics: { ...mockGameState.politics, approval: 35 } };
    
    aiOpposition.updateStrategy(lowApprovalState);
    
    expect(aiOpposition.strategy).toBe('aggressive');
    expect(aiOpposition.aggressiveness).toBeGreaterThan(0.5);
  });

  test('should generate criticism for poor economic performance', () => {
    const poorEconomyState = { 
      ...mockGameState, 
      economy: { gdpGrowth: 0.5, unemployment: 8.0, inflation: 4.5 }
    };
    
    const criticism = aiOpposition.generateCriticism(poorEconomyState);
    
    expect(criticism).toBeTruthy();
    expect(criticism.type).toBe('criticism');
    expect(['unemployment', 'inflation', 'growth']).toContain(criticism.target);
  });

  test('should generate policy proposals', () => {
    const highUnemploymentState = { 
      ...mockGameState, 
      economy: { ...mockGameState.economy, unemployment: 7.5 }
    };
    
    const proposal = aiOpposition.generateAlternativePolicy(highUnemploymentState);
    
    expect(proposal).toBeTruthy();
    expect(proposal.type).toBe('policy_proposal');
    expect(proposal.area).toBe('employment');
  });

  test('should handle policy proposals', () => {
    const mockPolicy = {
      area: 'economic',
      title: 'Test Policy',
      description: 'A test policy'
    };
    
    const response = aiOpposition.generatePolicyResponse(mockPolicy);
    
    expect(response).toBeTruthy();
    expect(['oppose', 'support_with_amendments', 'conditional_support']).toContain(response.stance);
  });

  test('should initiate debates', () => {
    const debate = aiOpposition.initiateDebate('unemployment', 'high');
    
    expect(debate).toBeTruthy();
    expect(debate.topic).toBe('unemployment');
    expect(debate.urgency).toBe('high');
    expect(debate.arguments).toBeInstanceOf(Array);
  });

  test('should calculate economic health correctly', () => {
    const goodEconomyState = {
      ...mockGameState,
      economy: { gdpGrowth: 3.0, unemployment: 4.0, inflation: 2.0 }
    };
    
    const health = aiOpposition.calculateEconomicHealth(goodEconomyState);
    
    expect(health).toBeGreaterThan(0.5);
    expect(health).toBeLessThanOrEqual(1.0);
  });

  test('should update party standings based on government performance', () => {
    const initialSupport = aiOpposition.oppositionParties[0].support;
    
    const poorPerformanceState = {
      ...mockGameState,
      politics: { ...mockGameState.politics, approval: 30 }
    };
    
    aiOpposition.updatePartyStandings(poorPerformanceState);
    
    expect(aiOpposition.oppositionParties[0].support).toBeGreaterThanOrEqual(initialSupport);
  });

  test('should process turn and generate actions', () => {
    const eventEmitSpy = jest.spyOn(eventSystem, 'emit');
    
    // Set high aggressiveness to increase chance of actions
    aiOpposition.aggressiveness = 0.9;
    
    aiOpposition.processTurn(mockGameState);
    
    // Check that opposition status was updated
    const status = aiOpposition.getOppositionStatus();
    expect(status.parties).toHaveLength(3);
    expect(status.strategy).toBeTruthy();
  });

  test('should get opposition status', () => {
    const status = aiOpposition.getOppositionStatus();
    
    expect(status.parties).toHaveLength(3);
    expect(status.strategy).toBeTruthy();
    expect(status.aggressiveness).toBeGreaterThanOrEqual(0);
    expect(status.totalSupport).toBeGreaterThan(0);
  });

  test('should clean up old actions', () => {
    // Add more than 10 actions
    for (let i = 0; i < 15; i++) {
      aiOpposition.recentActions.push({
        type: 'test_action',
        timestamp: Date.now() - i * 1000
      });
    }
    
    aiOpposition.cleanupOldActions();
    
    expect(aiOpposition.recentActions.length).toBe(10);
  });
});