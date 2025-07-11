import { PoliticalEvents } from '../../src/core/PoliticalEvents';
import { eventSystem } from '../../src/core/EventSystem';

/**
 * Test PoliticalEvents functionality
 */
describe('PoliticalEvents', () => {
  let politicalEvents;
  let mockGameState;

  beforeEach(() => {
    // Create fresh instance
    politicalEvents = new PoliticalEvents();
    
    // Mock game state
    mockGameState = {
      time: { week: 1, year: 1 },
      politics: {
        approval: 50,
        coalition: [
          { party: 'Government', support: 45 },
          { party: 'Coalition Partner', support: 22 }
        ],
        nextElection: { week: 1, year: 4 }
      },
      economy: {
        gdpGrowth: 2.1,
        unemployment: 6.0,
        inflation: 2.4
      },
      country: {
        gdp: 1000000000000,
        debt: 600000000000
      }
    };
  });

  afterEach(() => {
    // Clean up if needed
  });

  test('should initialize with correct default values', () => {
    expect(politicalEvents.coalitionStability).toBe(100);
    expect(politicalEvents.activeEvents).toEqual([]);
    expect(politicalEvents.scheduledVotes).toEqual([]);
  });

  test('should have defined event types', () => {
    expect(politicalEvents.eventTypes).toBeDefined();
    expect(politicalEvents.eventTypes.policyVotes).toBeDefined();
    expect(politicalEvents.eventTypes.coalitionEvents).toBeDefined();
    expect(politicalEvents.eventTypes.oppositionEvents).toBeDefined();
    expect(politicalEvents.eventTypes.economicEvents).toBeDefined();
  });

  test('should update coalition stability based on approval', () => {
    const initialStability = politicalEvents.coalitionStability;
    
    // High approval should improve stability (initially starts at 100, so it may not go higher)
    mockGameState.politics.approval = 80;
    politicalEvents.coalitionStability = 70; // Start lower to see improvement
    politicalEvents.updateCoalitionStability(mockGameState.politics);
    
    expect(politicalEvents.coalitionStability).toBeGreaterThan(70);
  });

  test('should calculate event probability correctly', () => {
    // High approval, stable coalition = lower probability
    mockGameState.politics.approval = 80;
    politicalEvents.coalitionStability = 80;
    const highApprovalProb = politicalEvents.calculateEventProbability(mockGameState);
    
    // Low approval, unstable coalition = higher probability
    mockGameState.politics.approval = 30;
    politicalEvents.coalitionStability = 40;
    const lowApprovalProb = politicalEvents.calculateEventProbability(mockGameState);
    
    expect(lowApprovalProb).toBeGreaterThan(highApprovalProb);
  });

  test('should select appropriate event type based on game state', () => {
    // Low coalition stability should favor coalition events
    politicalEvents.coalitionStability = 40;
    
    // Run multiple times to test probability
    const eventTypes = [];
    for (let i = 0; i < 100; i++) {
      eventTypes.push(politicalEvents.selectEventType(mockGameState));
    }
    
    // Should have at least some coalition events
    expect(eventTypes.filter(type => type === 'coalitionEvents').length).toBeGreaterThan(0);
  });

  test('should create valid political events', () => {
    const event = politicalEvents.createEvent('policyVotes', mockGameState);
    
    expect(event).toBeDefined();
    expect(event.id).toBeDefined();
    expect(event.title).toBeDefined();
    expect(event.description).toBeDefined();
    expect(event.options).toBeDefined();
    expect(event.options.length).toBeGreaterThan(0);
    expect(event.deadline).toBeDefined();
    expect(event.status).toBe('pending');
  });

  test('should handle event responses correctly', () => {
    const event = politicalEvents.createEvent('policyVotes', mockGameState);
    politicalEvents.activeEvents.push(event);
    
    const initialActiveEvents = politicalEvents.activeEvents.length;
    
    // Mock response
    politicalEvents.handleEventResponse({
      eventId: event.id,
      optionId: event.options[0].id,
      gameState: mockGameState
    });
    
    // Event should be resolved and removed from active events
    expect(politicalEvents.activeEvents.length).toBe(initialActiveEvents - 1);
    expect(event.status).toBe('resolved');
  });

  test('should apply event effects to game state', () => {
    const initialApproval = mockGameState.politics.approval;
    const effects = { approval: 5, gdp: 0.5 };
    
    const actualEffects = politicalEvents.applyEventEffects(effects, mockGameState);
    
    expect(mockGameState.politics.approval).toBeGreaterThan(initialApproval);
    expect(actualEffects.approval).toBeGreaterThan(3); // Should be roughly 5 with variance
    expect(actualEffects.approval).toBeLessThan(7);
  });

  test('should get political status summary', () => {
    politicalEvents.coalitionStability = 75;
    politicalEvents.activeEvents = [{ id: 'test-event' }];
    
    const status = politicalEvents.getPoliticalStatus(mockGameState);
    
    expect(status.coalitionStability).toBe(75);
    expect(status.activeEvents).toBe(1);
    expect(status.politicalPressure).toBeDefined();
    expect(status.nextElectionWeeks).toBeDefined();
  });

  test('should calculate political pressure correctly', () => {
    // Low approval should increase pressure
    mockGameState.politics.approval = 30;
    politicalEvents.coalitionStability = 40;
    politicalEvents.activeEvents = [{ id: 'event1' }, { id: 'event2' }, { id: 'event3' }];
    
    const pressure = politicalEvents.calculatePoliticalPressure(mockGameState);
    
    expect(pressure).toBeGreaterThan(50); // Should be high pressure
  });

  test('should schedule and process votes', () => {
    const vote = {
      id: 'test-vote',
      title: 'Test Vote',
      week: 2,
      year: 1
    };
    
    politicalEvents.scheduleVote(vote);
    expect(politicalEvents.scheduledVotes.length).toBe(1);
    
    // Process votes for week 2
    const currentWeek = 2;
    politicalEvents.processScheduledVotes(currentWeek, mockGameState);
    
    // Vote should be processed and removed
    expect(politicalEvents.scheduledVotes.filter(v => v.status !== 'processed').length).toBe(0);
  });

  test('should simulate vote outcomes based on coalition strength', () => {
    const vote = { id: 'test-vote', title: 'Test Vote' };
    
    // Strong coalition should have higher pass chance
    mockGameState.politics.coalition = [
      { party: 'Government', support: 60 },
      { party: 'Coalition Partner', support: 30 }
    ];
    mockGameState.politics.approval = 70;
    politicalEvents.coalitionStability = 80;
    
    const outcome = politicalEvents.simulateVoteOutcome(vote, mockGameState);
    
    expect(outcome.passed).toBeDefined();
    expect(outcome.margin).toBeGreaterThan(0);
    expect(outcome.coalitionUnity).toBe(80);
  });
});