import { eventSystem, EVENTS } from './EventSystem';

/**
 * PoliticalSystem - Enhanced political mechanics for SP_Sim
 * Manages political dynamics, voting, coalitions, and crises
 */
export class PoliticalSystem {
  constructor() {
    this.eventSystem = eventSystem;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for political events
   */
  setupEventListeners() {
    this.eventSystem.on(EVENTS.TURN_END, (event) => {
      this.processPoliticalTurn(event.data.gameState);
    });

    this.eventSystem.on('political:vote', (event) => {
      this.processVote(event.data);
    });

    this.eventSystem.on('political:crisis', (event) => {
      this.handlePoliticalCrisis(event.data);
    });
  }

  /**
   * Process political changes each turn
   */
  processPoliticalTurn(gameState) {
    // Update approval based on economic performance
    this.updateApprovalRating(gameState);
    
    // Check for political events
    this.checkForPoliticalEvents(gameState);
    
    // Update coalition dynamics
    this.updateCoalitionDynamics(gameState);
    
    // Check for elections
    this.checkElectionCycle(gameState);
  }

  /**
   * Update approval rating based on various factors
   */
  updateApprovalRating(gameState) {
    let approvalChange = 0;
    
    // Economic factors
    const gdpGrowth = gameState.economy.gdpGrowth;
    const unemployment = gameState.economy.unemployment;
    const inflation = gameState.economy.inflation;
    
    // GDP Growth impact (positive growth increases approval)
    if (gdpGrowth > 3) {
      approvalChange += 0.5;
    } else if (gdpGrowth < 1) {
      approvalChange -= 0.3;
    }
    
    // Unemployment impact (high unemployment decreases approval)
    if (unemployment > 8) {
      approvalChange -= 0.8;
    } else if (unemployment < 4) {
      approvalChange += 0.4;
    }
    
    // Inflation impact (high inflation decreases approval)
    if (inflation > 4) {
      approvalChange -= 0.5;
    } else if (inflation < 2) {
      approvalChange += 0.2;
    }
    
    // Add some randomness
    approvalChange += (Math.random() - 0.5) * 0.5;
    
    // Apply the change
    gameState.politics.approval = Math.max(0, Math.min(100, 
      gameState.politics.approval + approvalChange));
    
    // Emit approval change event
    this.eventSystem.emit('political:approval_change', {
      change: approvalChange,
      newApproval: gameState.politics.approval,
      factors: { gdpGrowth, unemployment, inflation }
    });
  }

  /**
   * Check for random political events
   */
  checkForPoliticalEvents(gameState) {
    const eventChance = Math.random();
    
    if (eventChance < 0.05) { // 5% chance per turn
      this.triggerRandomPoliticalEvent(gameState);
    }
  }

  /**
   * Trigger a random political event
   */
  triggerRandomPoliticalEvent(gameState) {
    const events = [
      {
        title: 'Opposition Challenge',
        description: 'The opposition party has challenged your latest policy decisions.',
        approvalImpact: -2,
        type: 'challenge'
      },
      {
        title: 'Coalition Support',
        description: 'Your coalition partners have publicly endorsed your leadership.',
        approvalImpact: 1.5,
        type: 'support'
      },
      {
        title: 'Media Scrutiny',
        description: 'Recent media coverage has put your administration under scrutiny.',
        approvalImpact: -1,
        type: 'media'
      },
      {
        title: 'Policy Success',
        description: 'One of your key policies has shown positive early results.',
        approvalImpact: 2,
        type: 'policy'
      },
      {
        title: 'International Praise',
        description: 'International leaders have praised your diplomatic approach.',
        approvalImpact: 1,
        type: 'international'
      }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    
    // Apply approval impact
    gameState.politics.approval = Math.max(0, Math.min(100, 
      gameState.politics.approval + event.approvalImpact));

    // Add to recent events
    gameState.events.recent.unshift({
      id: Date.now(),
      title: event.title,
      description: event.description,
      type: 'political',
      severity: event.approvalImpact > 0 ? 'positive' : 'negative',
      week: gameState.time.week,
      year: gameState.time.year,
      timestamp: new Date().toISOString()
    });

    // Keep only last 10 events
    if (gameState.events.recent.length > 10) {
      gameState.events.recent = gameState.events.recent.slice(0, 10);
    }

    this.eventSystem.emit('political:event', { event, gameState });
  }

  /**
   * Update coalition dynamics
   */
  updateCoalitionDynamics(gameState) {
    const approval = gameState.politics.approval;
    
    // Coalition support fluctuates based on approval
    gameState.politics.coalition.forEach(party => {
      if (approval > 60) {
        party.support = Math.min(100, party.support + 0.1);
      } else if (approval < 40) {
        party.support = Math.max(0, party.support - 0.2);
      }
    });

    // Opposition support inversely correlates
    gameState.politics.opposition.forEach(party => {
      if (approval > 60) {
        party.support = Math.max(0, party.support - 0.1);
      } else if (approval < 40) {
        party.support = Math.min(100, party.support + 0.15);
      }
    });
  }

  /**
   * Check if it's time for an election
   */
  checkElectionCycle(gameState) {
    const currentWeek = gameState.time.week;
    const currentYear = gameState.time.year;
    const electionYear = gameState.politics.nextElection.year;
    const electionWeek = gameState.politics.nextElection.week;

    // Check if election is due
    if (currentYear > electionYear || 
        (currentYear === electionYear && currentWeek >= electionWeek)) {
      this.triggerElection(gameState);
    }
  }

  /**
   * Trigger an election
   */
  triggerElection(gameState) {
    const approval = gameState.politics.approval;
    let result;

    if (approval >= 55) {
      result = 'victory';
    } else if (approval >= 45) {
      result = 'narrow_victory';
    } else if (approval >= 35) {
      result = 'coalition_required';
    } else {
      result = 'defeat';
    }

    this.eventSystem.emit('political:election', {
      result,
      approval,
      gameState
    });

    // Schedule next election (4 years later)
    gameState.politics.nextElection = {
      year: currentYear + 4,
      week: electionWeek || 1
    };
  }

  /**
   * Create a political vote/decision
   */
  createVote(gameState, issue) {
    const vote = {
      id: Date.now(),
      title: issue.title,
      description: issue.description,
      options: issue.options || [
        { id: 'support', text: 'Support', approvalImpact: issue.supportImpact || 0 },
        { id: 'oppose', text: 'Oppose', approvalImpact: issue.opposeImpact || 0 },
        { id: 'abstain', text: 'Abstain', approvalImpact: -0.5 }
      ],
      deadline: {
        week: gameState.time.week + 2,
        year: gameState.time.year
      },
      status: 'pending'
    };

    gameState.politics.nextVote = vote;
    gameState.events.pending.push({
      id: vote.id,
      type: 'vote',
      title: `Vote: ${vote.title}`,
      description: vote.description,
      deadline: vote.deadline
    });

    this.eventSystem.emit('political:vote_scheduled', { vote, gameState });
  }

  /**
   * Process a vote decision
   */
  processVote(data) {
    const { gameState, voteId, choice } = data;
    const vote = gameState.politics.nextVote;

    if (!vote || vote.id !== voteId) {
      return;
    }

    const option = vote.options.find(opt => opt.id === choice);
    if (option) {
      // Apply approval impact
      gameState.politics.approval = Math.max(0, Math.min(100,
        gameState.politics.approval + option.approvalImpact));

      // Add to recent events
      gameState.events.recent.unshift({
        id: Date.now(),
        title: `Vote Result: ${vote.title}`,
        description: `You chose to ${option.text.toLowerCase()} the proposal.`,
        type: 'political',
        severity: option.approvalImpact > 0 ? 'positive' : option.approvalImpact < 0 ? 'negative' : 'neutral',
        week: gameState.time.week,
        year: gameState.time.year,
        timestamp: new Date().toISOString()
      });

      // Clear the vote
      gameState.politics.nextVote = null;
      gameState.events.pending = gameState.events.pending.filter(event => event.id !== voteId);

      this.eventSystem.emit('political:vote_completed', {
        vote,
        choice: option,
        gameState
      });
    }
  }

  /**
   * Trigger a political crisis
   */
  handlePoliticalCrisis(data) {
    const { gameState, crisis } = data;

    // Significant approval drop
    gameState.politics.approval = Math.max(0, gameState.politics.approval - crisis.approvalImpact);

    // Add to events
    gameState.events.recent.unshift({
      id: Date.now(),
      title: `Political Crisis: ${crisis.title}`,
      description: crisis.description,
      type: 'crisis',
      severity: 'critical',
      week: gameState.time.week,
      year: gameState.time.year,
      timestamp: new Date().toISOString()
    });

    // Create emergency vote if applicable
    if (crisis.requiresVote) {
      this.createVote(gameState, {
        title: `Emergency Response: ${crisis.title}`,
        description: crisis.voteDescription,
        supportImpact: crisis.responseImpact?.support || 0,
        opposeImpact: crisis.responseImpact?.oppose || 0
      });
    }

    this.eventSystem.emit('political:crisis_triggered', { crisis, gameState });
  }

  /**
   * Generate random political events for testing
   */
  triggerTestEvents(gameState) {
    // Trigger some votes
    this.createVote(gameState, {
      title: 'Healthcare Reform Bill',
      description: 'A comprehensive healthcare reform proposal that would expand coverage but increase government spending.',
      supportImpact: 3,
      opposeImpact: -1
    });

    // Trigger a minor crisis
    setTimeout(() => {
      this.handlePoliticalCrisis({
        gameState,
        crisis: {
          title: 'Budget Scandal',
          description: 'Opposition has discovered irregularities in government spending.',
          approvalImpact: 5,
          requiresVote: true,
          voteDescription: 'How should you respond to the budget scandal allegations?',
          responseImpact: {
            support: -2, // Supporting investigation might hurt short-term
            oppose: -4   // Opposing investigation hurts more
          }
        }
      });
    }, 5000);
  }
}

// Create and export singleton instance
export const politicalSystem = new PoliticalSystem();