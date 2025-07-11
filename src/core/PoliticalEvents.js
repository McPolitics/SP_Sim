import { eventSystem } from './EventSystem';

/**
 * PoliticalEvents - Manages political events, votes, and party dynamics
 * Implements weeks 9-12 of the roadmap: Political System features
 */
export class PoliticalEvents {
  constructor() {
    this.eventSystem = eventSystem;
    this.activeEvents = [];
    this.scheduledVotes = [];
    this.politicalCrises = [];
    this.coalitionStability = 100;
    this.lastEventTime = 0;
    this.eventFrequency = 4; // Every 4 weeks on average
    
    this.initializeEventTypes();
    this.setupEventListeners();
  }

  /**
   * Initialize different types of political events
   */
  initializeEventTypes() {
    this.eventTypes = {
      // Policy Votes (Week 10 roadmap)
      policyVotes: [
        {
          id: 'tax_reform',
          title: 'Tax Reform Bill',
          description: 'A comprehensive tax reform package to modernize the tax system',
          type: 'policy_vote',
          severity: 'high',
          effects: {
            approval: { min: -8, max: 12 },
            gdp: { min: -0.5, max: 1.5 },
            coalitionSupport: { min: -15, max: 10 }
          },
          options: [
            {
              id: 'support',
              text: 'Support the reform',
              description: 'Back the tax reform package',
              effects: { approval: 8, gdp: 1.2, coalitionSupport: 5 }
            },
            {
              id: 'oppose',
              text: 'Oppose the reform',
              description: 'Reject the tax reform package',
              effects: { approval: -3, gdp: -0.2, coalitionSupport: -8 }
            },
            {
              id: 'modify',
              text: 'Propose modifications',
              description: 'Suggest amendments to the package',
              effects: { approval: 2, gdp: 0.5, coalitionSupport: -2 }
            }
          ]
        },
        {
          id: 'healthcare_funding',
          title: 'Healthcare Funding Increase',
          description: 'Proposal to increase healthcare funding by 20%',
          type: 'policy_vote',
          severity: 'medium',
          effects: {
            approval: { min: -5, max: 15 },
            debt: { min: 0.5, max: 2.0 },
            coalitionSupport: { min: -10, max: 8 }
          },
          options: [
            {
              id: 'support',
              text: 'Support increased funding',
              description: 'Approve the healthcare budget increase',
              effects: { approval: 12, debt: 1.5, coalitionSupport: 5 }
            },
            {
              id: 'oppose',
              text: 'Oppose the increase',
              description: 'Reject additional healthcare spending',
              effects: { approval: -5, debt: 0, coalitionSupport: -7 }
            }
          ]
        }
      ],

      // Coalition Events (Week 9 roadmap)
      coalitionEvents: [
        {
          id: 'coalition_tension',
          title: 'Coalition Partner Demands',
          description: 'Your coalition partner is demanding more influence in key ministries',
          type: 'coalition_crisis',
          severity: 'medium',
          effects: {
            coalitionSupport: { min: -20, max: 5 },
            approval: { min: -5, max: 3 }
          },
          options: [
            {
              id: 'concede',
              text: 'Grant more influence',
              description: 'Give coalition partner key ministry positions',
              effects: { coalitionSupport: 10, approval: -2 }
            },
            {
              id: 'negotiate',
              text: 'Negotiate compromise',
              description: 'Find middle ground on ministry assignments',
              effects: { coalitionSupport: 3, approval: 1 }
            },
            {
              id: 'refuse',
              text: 'Refuse demands',
              description: 'Maintain current power structure',
              effects: { coalitionSupport: -15, approval: 2 }
            }
          ]
        },
        {
          id: 'cabinet_reshuffle',
          title: 'Cabinet Reshuffle Pressure',
          description: 'Political pressure mounts for a cabinet reshuffle',
          type: 'political_pressure',
          severity: 'medium',
          effects: {
            approval: { min: -8, max: 10 },
            coalitionSupport: { min: -10, max: 15 }
          },
          options: [
            {
              id: 'reshuffle',
              text: 'Conduct reshuffle',
              description: 'Replace underperforming ministers',
              effects: { approval: 6, coalitionSupport: 8 }
            },
            {
              id: 'minor_changes',
              text: 'Make minor changes',
              description: 'Limited portfolio adjustments',
              effects: { approval: 2, coalitionSupport: 3 }
            },
            {
              id: 'no_changes',
              text: 'No changes',
              description: 'Maintain current cabinet',
              effects: { approval: -4, coalitionSupport: -5 }
            }
          ]
        }
      ],

      // Opposition Events (Week 11 roadmap)
      oppositionEvents: [
        {
          id: 'no_confidence_motion',
          title: 'No Confidence Motion',
          description: 'The opposition has filed a motion of no confidence against your government',
          type: 'political_crisis',
          severity: 'high',
          effects: {
            approval: { min: -15, max: 5 },
            coalitionSupport: { min: -25, max: 10 }
          },
          options: [
            {
              id: 'rally_support',
              text: 'Rally coalition support',
              description: 'Work to ensure coalition unity against the motion',
              effects: { approval: 2, coalitionSupport: 8 }
            },
            {
              id: 'public_campaign',
              text: 'Launch public campaign',
              description: 'Take your case directly to the people',
              effects: { approval: 5, coalitionSupport: -2 }
            },
            {
              id: 'policy_concessions',
              text: 'Make policy concessions',
              description: 'Offer compromise on controversial policies',
              effects: { approval: -2, coalitionSupport: 5 }
            }
          ]
        }
      ],

      // Economic Policy Events (Week 8 roadmap continuation)
      economicEvents: [
        {
          id: 'interest_rate_pressure',
          title: 'Interest Rate Decision Pressure',
          description: 'Central bank independence is being questioned amid economic pressures',
          type: 'economic_policy',
          severity: 'medium',
          effects: {
            gdp: { min: -1.0, max: 0.8 },
            inflation: { min: -0.5, max: 1.2 },
            approval: { min: -10, max: 8 }
          },
          options: [
            {
              id: 'defend_independence',
              text: 'Defend central bank independence',
              description: 'Support the central bank\'s autonomy',
              effects: { gdp: 0.3, inflation: -0.2, approval: 3 }
            },
            {
              id: 'pressure_rates',
              text: 'Pressure for rate changes',
              description: 'Advocate for specific monetary policy',
              effects: { gdp: -0.2, inflation: 0.8, approval: -5 }
            }
          ]
        }
      ]
    };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.eventSystem.on('game:turn_processed', (event) => {
      this.processPoliticalEvents(event.data.gameState);
    });

    this.eventSystem.on('political:event_response', (event) => {
      this.handleEventResponse(event.data);
    });

    this.eventSystem.on('political:schedule_vote', (event) => {
      this.scheduleVote(event.data);
    });
  }

  /**
   * Process political events each turn
   */
  processPoliticalEvents(gameState) {
    const { time, politics } = gameState;
    const currentWeek = time.week + (time.year - 1) * 52;

    // Update coalition stability over time
    this.updateCoalitionStability(politics);

    // Check for scheduled votes
    this.processScheduledVotes(currentWeek, gameState);

    // Generate new political events
    this.generateRandomEvents(currentWeek, gameState);

    // Process ongoing political crises
    this.processPoliticalCrises(gameState);
  }

  /**
   * Update coalition stability based on various factors
   */
  updateCoalitionStability(politics) {
    const approvalFactor = (politics.approval - 50) * 0.1;
    const coalitionFactor = politics.coalition.reduce((sum, party) => sum + party.support, 0) * 0.05;
    
    // Natural decay towards 75 (baseline stability)
    const decay = (75 - this.coalitionStability) * 0.02;
    
    this.coalitionStability += approvalFactor + coalitionFactor + decay;
    this.coalitionStability = Math.max(0, Math.min(100, this.coalitionStability));
  }

  /**
   * Generate random political events
   */
  generateRandomEvents(currentWeek, gameState) {
    // Check if enough time has passed since last event
    if (currentWeek - this.lastEventTime < this.eventFrequency) {
      return;
    }

    // Determine event probability based on game state
    const eventProbability = this.calculateEventProbability(gameState);
    
    if (Math.random() < eventProbability) {
      const eventType = this.selectEventType(gameState);
      const event = this.createEvent(eventType, gameState);
      
      if (event) {
        this.triggerEvent(event, gameState);
        this.lastEventTime = currentWeek;
      }
    }
  }

  /**
   * Calculate event probability based on game state
   */
  calculateEventProbability(gameState) {
    let baseProbability = 0.3; // 30% base chance per check

    // Higher probability if approval is low
    if (gameState.politics.approval < 40) {
      baseProbability += 0.2;
    }

    // Higher probability if coalition is unstable
    if (this.coalitionStability < 60) {
      baseProbability += 0.15;
    }

    // Higher probability during election years
    const weeksUntilElection = gameState.politics.nextElection.week + 
                              (gameState.politics.nextElection.year - gameState.time.year) * 52;
    if (weeksUntilElection < 52) {
      baseProbability += 0.1;
    }

    return Math.min(baseProbability, 0.8); // Cap at 80%
  }

  /**
   * Select appropriate event type based on game state
   */
  selectEventType(gameState) {
    const weights = {
      policyVotes: 30,
      coalitionEvents: 25,
      oppositionEvents: 20,
      economicEvents: 25
    };

    // Adjust weights based on game state
    if (this.coalitionStability < 60) {
      weights.coalitionEvents += 20;
    }

    if (gameState.politics.approval < 40) {
      weights.oppositionEvents += 15;
    }

    if (gameState.economy.gdpGrowth < 1.0) {
      weights.economicEvents += 15;
    }

    // Weighted random selection
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const [type, weight] of Object.entries(weights)) {
      random -= weight;
      if (random <= 0) {
        return type;
      }
    }

    return 'policyVotes'; // fallback
  }

  /**
   * Create a political event
   */
  createEvent(eventType, gameState) {
    const events = this.eventTypes[eventType];
    if (!events || events.length === 0) return null;

    // Select random event from type
    const eventTemplate = events[Math.floor(Math.random() * events.length)];
    
    // Create event instance
    const event = {
      ...eventTemplate,
      id: `${eventTemplate.id}_${Date.now()}`,
      triggeredWeek: gameState.time.week,
      triggeredYear: gameState.time.year,
      deadline: this.calculateDeadline(eventTemplate, gameState),
      status: 'pending'
    };

    return event;
  }

  /**
   * Calculate deadline for event response
   */
  calculateDeadline(eventTemplate, gameState) {
    const baseWeeks = eventTemplate.severity === 'high' ? 1 : 
                     eventTemplate.severity === 'medium' ? 2 : 3;
    
    return {
      week: gameState.time.week + baseWeeks,
      year: gameState.time.year + Math.floor((gameState.time.week + baseWeeks - 1) / 52)
    };
  }

  /**
   * Trigger a political event
   */
  triggerEvent(event, gameState) {
    this.activeEvents.push(event);

    // Emit event for UI to display
    this.eventSystem.emit('political:event_triggered', {
      event,
      gameState
    });

    // Add to recent events
    this.eventSystem.emit('game:add_event', {
      title: event.title,
      description: event.description,
      type: 'political',
      severity: event.severity,
      requiresResponse: true,
      eventId: event.id
    });
  }

  /**
   * Handle player response to political event
   */
  handleEventResponse(data) {
    const { eventId, optionId, gameState } = data;
    const event = this.activeEvents.find(e => e.id === eventId);
    
    if (!event) return;

    const option = event.options.find(o => o.id === optionId);
    if (!option) return;

    // Apply effects
    const effects = this.applyEventEffects(option.effects, gameState);

    // Update event status
    event.status = 'resolved';
    event.response = optionId;
    event.resolvedWeek = gameState.time.week;
    event.resolvedYear = gameState.time.year;

    // Remove from active events
    this.activeEvents = this.activeEvents.filter(e => e.id !== eventId);

    // Emit resolution event
    this.eventSystem.emit('political:event_resolved', {
      event,
      option,
      effects,
      gameState
    });

    // Add resolution to recent events
    this.eventSystem.emit('game:add_event', {
      title: `Resolved: ${event.title}`,
      description: `${option.description}. ${this.formatEffects(effects)}`,
      type: 'political',
      severity: 'neutral'
    });
  }

  /**
   * Apply effects from political event response
   */
  applyEventEffects(effects, gameState) {
    const actualEffects = {};

    // Apply approval changes
    if (effects.approval !== undefined) {
      const change = effects.approval * (0.8 + Math.random() * 0.4); // +/- 20% variance
      gameState.politics.approval = Math.max(0, Math.min(100, gameState.politics.approval + change));
      actualEffects.approval = change;
    }

    // Apply GDP changes
    if (effects.gdp !== undefined) {
      const change = effects.gdp * (0.8 + Math.random() * 0.4);
      gameState.economy.gdpGrowth = Math.max(-5, Math.min(10, gameState.economy.gdpGrowth + change));
      actualEffects.gdp = change;
    }

    // Apply debt changes
    if (effects.debt !== undefined) {
      const change = effects.debt * (0.8 + Math.random() * 0.4);
      // Note: debt is stored as percentage of GDP in game state
      const currentDebtPercentage = (gameState.country.debt / gameState.country.gdp) * 100;
      const newDebtPercentage = Math.max(0, Math.min(200, currentDebtPercentage + change));
      gameState.country.debt = (newDebtPercentage / 100) * gameState.country.gdp;
      actualEffects.debt = change;
    }

    // Apply coalition support changes
    if (effects.coalitionSupport !== undefined) {
      const change = effects.coalitionSupport * (0.8 + Math.random() * 0.4);
      this.coalitionStability = Math.max(0, Math.min(100, this.coalitionStability + change));
      
      // Also affect individual coalition party support
      gameState.politics.coalition.forEach(party => {
        const partyChange = change * (0.5 + Math.random() * 0.5);
        party.support = Math.max(0, Math.min(100, party.support + partyChange));
      });
      
      actualEffects.coalitionSupport = change;
    }

    return actualEffects;
  }

  /**
   * Format effects for display
   */
  formatEffects(effects) {
    const parts = [];
    
    if (effects.approval) {
      parts.push(`Approval ${effects.approval > 0 ? '+' : ''}${effects.approval.toFixed(1)}%`);
    }
    
    if (effects.gdp) {
      parts.push(`GDP Growth ${effects.gdp > 0 ? '+' : ''}${effects.gdp.toFixed(1)}%`);
    }
    
    if (effects.coalitionSupport) {
      parts.push(`Coalition ${effects.coalitionSupport > 0 ? '+' : ''}${effects.coalitionSupport.toFixed(1)}%`);
    }

    return parts.length > 0 ? `Effects: ${parts.join(', ')}` : '';
  }

  /**
   * Schedule a vote for future processing
   */
  scheduleVote(voteData) {
    this.scheduledVotes.push({
      ...voteData,
      scheduledWeek: voteData.week,
      scheduledYear: voteData.year,
      status: 'scheduled'
    });
  }

  /**
   * Process scheduled votes
   */
  processScheduledVotes(currentWeek, gameState) {
    const dueVotes = this.scheduledVotes.filter(vote => {
      const voteWeek = vote.scheduledWeek + (vote.scheduledYear - 1) * 52;
      return voteWeek <= currentWeek && vote.status === 'scheduled';
    });

    dueVotes.forEach(vote => {
      this.processVote(vote, gameState);
      vote.status = 'processed';
    });

    // Clean up processed votes
    this.scheduledVotes = this.scheduledVotes.filter(vote => vote.status !== 'processed');
  }

  /**
   * Process a scheduled vote
   */
  processVote(vote, gameState) {
    // Simple vote processing - in real game this would be more complex
    const outcome = this.simulateVoteOutcome(vote, gameState);
    
    this.eventSystem.emit('political:vote_completed', {
      vote,
      outcome,
      gameState
    });
  }

  /**
   * Simulate vote outcome based on coalition strength and approval
   */
  simulateVoteOutcome(vote, gameState) {
    const coalitionStrength = gameState.politics.coalition.reduce((sum, party) => sum + party.support, 0);
    const baseChance = coalitionStrength / 100;
    const approvalBonus = (gameState.politics.approval - 50) * 0.01;
    const stabilityBonus = (this.coalitionStability - 50) * 0.01;
    
    const passChance = Math.max(0.1, Math.min(0.9, baseChance + approvalBonus + stabilityBonus));
    
    return {
      passed: Math.random() < passChance,
      margin: Math.floor(Math.random() * 20) + 1, // 1-20 vote margin
      coalitionUnity: this.coalitionStability
    };
  }

  /**
   * Process ongoing political crises
   */
  processPoliticalCrises(gameState) {
    // Handle any ongoing crises that may escalate or resolve
    this.politicalCrises.forEach(crisis => {
      crisis.duration++;
      
      if (crisis.duration > crisis.maxDuration) {
        this.resolveCrisis(crisis, gameState);
      }
    });

    // Clean up resolved crises
    this.politicalCrises = this.politicalCrises.filter(crisis => crisis.status !== 'resolved');
  }

  /**
   * Resolve a political crisis
   */
  resolveCrisis(crisis, gameState) {
    crisis.status = 'resolved';
    
    // Apply crisis resolution effects
    const effects = crisis.resolutionEffects;
    this.applyEventEffects(effects, gameState);

    this.eventSystem.emit('political:crisis_resolved', {
      crisis,
      effects,
      gameState
    });
  }

  /**
   * Get active political events
   */
  getActiveEvents() {
    return this.activeEvents.slice(); // Return copy
  }

  /**
   * Get coalition stability
   */
  getCoalitionStability() {
    return this.coalitionStability;
  }

  /**
   * Get political status summary
   */
  getPoliticalStatus(gameState) {
    return {
      coalitionStability: this.coalitionStability,
      activeEvents: this.activeEvents.length,
      scheduledVotes: this.scheduledVotes.length,
      politicalPressure: this.calculatePoliticalPressure(gameState),
      nextElectionWeeks: this.calculateWeeksUntilElection(gameState)
    };
  }

  /**
   * Calculate political pressure level
   */
  calculatePoliticalPressure(gameState) {
    let pressure = 0;
    
    if (gameState.politics.approval < 40) pressure += 30;
    if (this.coalitionStability < 60) pressure += 25;
    if (this.activeEvents.length > 2) pressure += 20;
    if (gameState.economy.gdpGrowth < 1) pressure += 15;
    
    return Math.min(100, pressure);
  }

  /**
   * Calculate weeks until next election
   */
  calculateWeeksUntilElection(gameState) {
    const currentWeek = gameState.time.week + (gameState.time.year - 1) * 52;
    const electionWeek = gameState.politics.nextElection.week + 
                        (gameState.politics.nextElection.year - 1) * 52;
    
    return Math.max(0, electionWeek - currentWeek);
  }
}

// Create and export singleton instance
export const politicalEvents = new PoliticalEvents();