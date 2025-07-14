import { eventSystem, EVENTS } from './EventSystem';

/**
 * AI Opposition System
 * Manages intelligent opposition behavior, policy responses, and debate mechanics
 */
export class AIOpposition {
  constructor() {
    this.eventSystem = eventSystem;
    this.oppositionParties = [];
    this.currentStance = 'neutral';
    this.aggressiveness = 0.5; // 0-1 scale
    this.strategy = 'balanced'; // balanced, aggressive, defensive, opportunistic
    this.recentActions = [];
    this.policyPositions = new Map();
    this.debateHistory = [];

    this.initializeOppositionParties();
    this.initializeEventListeners();
  }

  /**
   * Initialize opposition parties with different personalities
   */
  initializeOppositionParties() {
    this.oppositionParties = [
      {
        id: 'main_opposition',
        name: 'Main Opposition',
        support: 30,
        ideology: 'center-right',
        personality: 'aggressive',
        aggressiveness: 0.7,
        expertise: ['economy', 'defense'],
        approval: 45,
        leadership: 'strong',
      },
      {
        id: 'minor_opposition',
        name: 'Progressive Alliance',
        support: 15,
        ideology: 'left',
        personality: 'principled',
        aggressiveness: 0.4,
        expertise: ['social', 'environment'],
        approval: 35,
        leadership: 'moderate',
      },
      {
        id: 'populist_party',
        name: 'People\'s Voice',
        support: 8,
        ideology: 'populist',
        personality: 'opportunistic',
        aggressiveness: 0.9,
        expertise: ['populism', 'media'],
        approval: 25,
        leadership: 'charismatic',
      },
    ];
  }

  /**
   * Initialize event listeners for game events
   */
  initializeEventListeners() {
    // React to player policy decisions
    this.eventSystem.on(EVENTS.POLICY_PROPOSED, (event) => {
      this.handlePolicyProposal(event.data);
    });

    // React to economic changes
    this.eventSystem.on('economic:update', (event) => {
      this.handleEconomicUpdate(event.data);
    });

    // React to approval rating changes
    this.eventSystem.on(EVENTS.APPROVAL_CHANGE, (event) => {
      this.handleApprovalChange(event.data);
    });

    // Process turn for AI opposition
    this.eventSystem.on(EVENTS.TURN_END, (event) => {
      this.processTurn(event.data.gameState);
    });
  }

  /**
   * Process opposition actions for current turn
   */
  processTurn(gameState) {
    // Update opposition strategy based on game state
    this.updateStrategy(gameState);

    // Generate opposition actions
    this.generateOppositionActions(gameState);

    // Update party standings
    this.updatePartyStandings(gameState);

    // Clean up old actions
    this.cleanupOldActions();
  }

  /**
   * Update AI strategy based on current game state
   */
  updateStrategy(gameState) {
    const playerApproval = gameState.politics.approval;
    const economicHealth = this.calculateEconomicHealth(gameState);
    const timeToElection = this.calculateTimeToElection(gameState);

    // Adjust aggressiveness based on player weakness
    if (playerApproval < 40) {
      this.aggressiveness = Math.min(1.0, this.aggressiveness + 0.1);
      this.strategy = 'aggressive';
    } else if (playerApproval > 60) {
      this.aggressiveness = Math.max(0.3, this.aggressiveness - 0.05);
      this.strategy = 'defensive';
    }

    // More aggressive near elections
    if (timeToElection < 20) {
      this.aggressiveness = Math.min(1.0, this.aggressiveness + 0.2);
    }

    // Opportunistic during economic crisis
    if (economicHealth < 0.4) {
      this.strategy = 'opportunistic';
      this.aggressiveness = Math.min(1.0, this.aggressiveness + 0.15);
    }
  }

  /**
   * Generate opposition actions for current turn
   */
  generateOppositionActions(gameState) {
    const actions = [];

    // Chance to criticize government
    if (Math.random() < this.aggressiveness * 0.4) {
      actions.push(this.generateCriticism(gameState));
    }

    // Chance to propose alternative policy
    if (Math.random() < 0.3) {
      actions.push(this.generateAlternativePolicy(gameState));
    }

    // Chance to call for investigation/debate
    if (Math.random() < this.aggressiveness * 0.2) {
      actions.push(this.generateDebateCall(gameState));
    }

    // Execute actions
    actions.forEach((action) => {
      if (action) {
        this.executeOppositionAction(action, gameState);
      }
    });
  }

  /**
   * Generate criticism of government policies
   */
  generateCriticism(gameState) {
    const criticisms = [];
    const { economy } = gameState;
    const { approval } = gameState.politics;

    if (economy.unemployment > 6.5) {
      criticisms.push({
        type: 'criticism',
        target: 'unemployment',
        severity: 'high',
        message: 'Government policies have failed to address rising unemployment',
        impact: { approval: -2, support: +1 },
      });
    }

    if (economy.inflation > 3.5) {
      criticisms.push({
        type: 'criticism',
        target: 'inflation',
        severity: 'medium',
        message: 'Inflationary pressure threatens household budgets',
        impact: { approval: -1.5, support: +0.5 },
      });
    }

    if (economy.gdpGrowth < 1.0) {
      criticisms.push({
        type: 'criticism',
        target: 'growth',
        severity: 'high',
        message: 'Economic stagnation under current leadership',
        impact: { approval: -2.5, support: +1.5 },
      });
    }

    if (approval < 45) {
      criticisms.push({
        type: 'criticism',
        target: 'leadership',
        severity: 'medium',
        message: 'Loss of public confidence demands new direction',
        impact: { approval: -1, support: +0.8 },
      });
    }

    return criticisms.length > 0 ? criticisms[Math.floor(Math.random() * criticisms.length)] : null;
  }

  /**
   * Generate alternative policy proposal
   */
  generateAlternativePolicy(gameState) {
    const policies = [];
    const { economy } = gameState;

    if (economy.unemployment > 5.5) {
      policies.push({
        type: 'policy_proposal',
        area: 'employment',
        title: 'Job Creation Initiative',
        description: 'Comprehensive employment program targeting youth and long-term unemployed',
        proposedBy: this.getRandomOppositionParty(),
        impact: { unemployment: -0.8, debt: +2, approval: +1.5 },
        cost: 5000000000, // $5 billion
      });
    }

    if (economy.inflation > 3.0) {
      policies.push({
        type: 'policy_proposal',
        area: 'monetary',
        title: 'Inflation Control Measures',
        description: 'Targeted intervention to control rising prices',
        proposedBy: this.getRandomOppositionParty(),
        impact: { inflation: -0.5, growth: -0.2, approval: +1 },
        cost: 2000000000, // $2 billion
      });
    }

    return policies.length > 0 ? policies[0] : null;
  }

  /**
   * Generate call for debate or investigation
   */
  generateDebateCall(gameState) {
    if (Math.random() < 0.7) {
      return {
        type: 'debate_call',
        title: 'Parliamentary Question Time',
        description: 'Opposition demands answers on recent policy decisions',
        urgency: this.aggressiveness > 0.7 ? 'high' : 'medium',
        proposedBy: this.getRandomOppositionParty(),
        topics: this.generateDebateTopics(gameState),
      };
    }
    return null;
  }

  /**
   * Generate debate topics based on current issues
   */
  generateDebateTopics(gameState) {
    const topics = [];
    const { economy } = gameState;

    if (economy.unemployment > 6.0) topics.push('unemployment crisis');
    if (economy.inflation > 3.0) topics.push('cost of living');
    if (economy.gdpGrowth < 1.5) topics.push('economic stagnation');
    if (gameState.politics.approval < 45) topics.push('leadership crisis');

    // Add some generic political topics
    const genericTopics = ['budget allocation', 'healthcare reform', 'education funding', 'infrastructure'];
    topics.push(genericTopics[Math.floor(Math.random() * genericTopics.length)]);

    return topics.slice(0, 3); // Return max 3 topics
  }

  /**
   * Execute opposition action
   */
  executeOppositionAction(action, gameState) {
    this.recentActions.push({
      ...action,
      timestamp: Date.now(),
      week: gameState.time.week,
      year: gameState.time.year,
    });

    // Emit event for UI to handle
    this.eventSystem.emit('opposition:action', {
      action,
      gameState,
      oppositionStatus: this.getOppositionStatus(),
    });

    // Apply direct impacts
    if (action.impact) {
      this.applyActionImpact(action.impact, gameState);
    }

    console.log(`Opposition action: ${action.type} - ${action.title || action.message}`);
  }

  /**
   * Apply action impact to game state
   */
  applyActionImpact(impact, gameState) {
    if (impact.approval) {
      this.eventSystem.emit(EVENTS.APPROVAL_CHANGE, {
        change: impact.approval,
        newApproval: gameState.politics.approval + impact.approval,
        reason: 'Opposition action',
      });
    }

    if (impact.support) {
      // Increase opposition support
      this.oppositionParties.forEach((party) => {
        party.support += impact.support * (party.support / 100); // Proportional increase
      });
    }
  }

  /**
   * Handle approval rating changes
   */
  handleApprovalChange(data) {
    // Opposition reacts to significant approval changes
    const { change, newApproval } = data;

    if (Math.abs(change) > 3) { // Significant change
      if (change < 0 && Math.random() < this.aggressiveness * 0.6) {
        // Opposition takes advantage of declining approval
        const party = this.getRandomOppositionParty();
        const action = {
          type: 'criticism',
          target: 'leadership',
          severity: 'medium',
          message: `${party.name} questions government leadership as approval falls`,
          impact: { support: +0.5 },
        };

        setTimeout(() => {
          this.executeOppositionAction(action, { politics: { approval: newApproval } });
        }, 1000 + Math.random() * 2000);
      }
    }
  }

  /**
   * Handle player policy proposals
   */
  handlePolicyProposal(policy) {
    const response = this.generatePolicyResponse(policy);

    if (response) {
      // Delay response to seem more realistic
      setTimeout(() => {
        this.eventSystem.emit('opposition:policy_response', {
          policy,
          response,
          oppositionParty: this.getRandomOppositionParty(),
        });
      }, 2000 + Math.random() * 3000); // 2-5 second delay
    }
  }

  /**
   * Generate response to player policy
   */
  generatePolicyResponse(policy) {
    const party = this.getRandomOppositionParty();
    const responses = [];

    // Opposition stance based on party ideology and policy type
    if (policy.area === 'economic' && party.ideology === 'center-right') {
      responses.push({
        stance: 'oppose',
        reason: 'fiscal_responsibility',
        message: `${party.name} opposes this policy due to concerns about fiscal impact`,
        severity: party.aggressiveness,
      });
    }

    if (policy.area === 'social' && party.ideology === 'left') {
      responses.push({
        stance: 'support_with_amendments',
        reason: 'insufficient_scope',
        message: `${party.name} supports the direction but demands stronger measures`,
        severity: 0.3,
      });
    }

    // Default opposition response
    if (responses.length === 0) {
      responses.push({
        stance: Math.random() < 0.6 ? 'oppose' : 'conditional_support',
        reason: 'political_disagreement',
        message: `${party.name} questions the effectiveness of this approach`,
        severity: party.aggressiveness * 0.7,
      });
    }

    return responses[0];
  }

  /**
   * Handle economic updates
   */
  handleEconomicUpdate(economicData) {
    // Opposition reacts to significant economic changes
    const significantChanges = this.identifySignificantChanges(economicData);

    significantChanges.forEach((change) => {
      if (Math.random() < this.aggressiveness * 0.5) {
        this.generateEconomicResponse(change);
      }
    });
  }

  /**
   * Identify significant economic changes worth opposing reaction
   */
  identifySignificantChanges(economicData) {
    const changes = [];

    if (economicData.unemployment && economicData.unemployment > 7.0) {
      changes.push({ type: 'unemployment_rise', severity: 'high', data: economicData });
    }

    if (economicData.inflation && economicData.inflation > 4.0) {
      changes.push({ type: 'inflation_spike', severity: 'high', data: economicData });
    }

    if (economicData.gdpGrowth && economicData.gdpGrowth < 0) {
      changes.push({ type: 'recession_risk', severity: 'critical', data: economicData });
    }

    return changes;
  }

  /**
   * Generate response to economic changes
   */
  generateEconomicResponse(change) {
    const party = this.getRandomOppositionParty();

    const response = {
      type: 'economic_response',
      change,
      party,
      message: this.generateEconomicMessage(change, party),
      urgency: change.severity === 'critical' ? 'high' : 'medium',
    };

    this.eventSystem.emit('opposition:economic_response', response);
  }

  /**
   * Generate appropriate message for economic response
   */
  generateEconomicMessage(change, party) {
    const messages = {
      unemployment_rise: [
        `${party.name} demands immediate action on rising unemployment`,
        'Government\'s economic policies clearly failing working families',
        'Unemployment crisis demands new leadership approach',
      ],
      inflation_spike: [
        `${party.name} warns of cost-of-living crisis for ordinary citizens`,
        'Inflation spiraling out of control under current government',
        'Immediate intervention needed to protect household budgets',
      ],
      recession_risk: [
        `${party.name} calls emergency session on recession threat`,
        'Economic crisis demands bipartisan response',
        'Government\'s economic incompetence threatens national stability',
      ],
    };

    const messageArray = messages[change.type] || ['Opposition concerned about economic direction'];
    return messageArray[Math.floor(Math.random() * messageArray.length)];
  }

  /**
   * Get random opposition party weighted by support level
   */
  getRandomOppositionParty() {
    const totalSupport = this.oppositionParties.reduce((sum, party) => sum + party.support, 0);
    const random = Math.random() * totalSupport;

    let currentSum = 0;
    const foundParty = this.oppositionParties.find((party) => {
      currentSum += party.support;
      return random <= currentSum;
    });
    if (foundParty) {
      return foundParty;
    }

    return this.oppositionParties[0]; // Fallback
  }

  /**
   * Update party standings based on performance
   */
  updatePartyStandings(gameState) {
    this.oppositionParties.forEach((party) => {
      // Parties gain support when government approval is low
      if (gameState.politics.approval < 40) {
        party.support += Math.random() * 0.5;
        party.approval += Math.random() * 1.0;
      }

      // Economic performance affects party standings
      const economicHealth = this.calculateEconomicHealth(gameState);
      if (economicHealth < 0.5) {
        party.support += Math.random() * 0.3;
      }

      // Normalize support to ensure it doesn't exceed realistic bounds
      party.support = Math.min(45, Math.max(5, party.support));
      party.approval = Math.min(70, Math.max(15, party.approval));
    });
  }

  /**
   * Calculate overall economic health score (0-1)
   */
  calculateEconomicHealth(gameState) {
    const { economy } = gameState;

    // Normalize each metric (lower is better for unemployment/inflation, higher for growth)
    const unemploymentScore = Math.max(0, Math.min(1, (10 - economy.unemployment) / 5));
    const inflationScore = Math.max(0, Math.min(1, (5 - economy.inflation) / 3));
    const growthScore = Math.max(0, Math.min(1, economy.gdpGrowth / 4));

    return (unemploymentScore + inflationScore + growthScore) / 3;
  }

  /**
   * Calculate weeks until next election
   */
  calculateTimeToElection(gameState) {
    const currentWeek = gameState.time.week + (gameState.time.year - 1) * 52;
    const electionWeek = gameState.politics.nextElection.week + (gameState.politics.nextElection.year - 1) * 52;
    return Math.max(0, electionWeek - currentWeek);
  }

  /**
   * Clean up old actions (keep only last 10)
   */
  cleanupOldActions() {
    if (this.recentActions.length > 10) {
      this.recentActions = this.recentActions.slice(-10);
    }
  }

  /**
   * Get current opposition status
   */
  getOppositionStatus() {
    return {
      parties: [...this.oppositionParties],
      strategy: this.strategy,
      aggressiveness: this.aggressiveness,
      recentActions: [...this.recentActions.slice(-5)], // Last 5 actions
      totalSupport: this.oppositionParties.reduce((sum, party) => sum + party.support, 0),
      averageApproval: this.oppositionParties.reduce((sum, party) => sum + party.approval, 0) / this.oppositionParties.length,
    };
  }

  /**
   * Initiate a debate on a specific topic
   */
  initiateDebate(topic, urgency = 'medium') {
    const party = this.getRandomOppositionParty();

    const debate = {
      id: `debate_${Date.now()}`,
      topic,
      urgency,
      initiator: party,
      status: 'pending',
      timestamp: Date.now(),
      arguments: this.generateDebateArguments(topic, party),
      publicInterest: Math.random() * 0.5 + 0.3, // 0.3-0.8
    };

    this.debateHistory.push(debate);

    this.eventSystem.emit('opposition:debate_initiated', {
      debate,
      requiredResponse: urgency === 'high',
    });

    return debate;
  }

  /**
   * Generate debate arguments for a topic
   */
  generateDebateArguments(topic, party) {
    const argumentTemplates = {
      unemployment: [
        'Government policies have failed to create sustainable employment',
        'Small businesses need more support to hire workers',
        'Investment in infrastructure would create immediate jobs',
      ],
      inflation: [
        'Rising costs are hurting working families the most',
        'Government spending is driving inflation higher',
        'Immediate price controls needed on essential goods',
      ],
      healthcare: [
        'Healthcare system is failing those who need it most',
        'More funding needed for public health services',
        'Private sector partnerships could improve efficiency',
      ],
    };

    const args = argumentTemplates[topic] || ['This policy requires serious reconsideration'];
    return args.map((arg) => ({
      argument: arg,
      strength: Math.random() * 0.5 + 0.5, // 0.5-1.0
      party: party.name,
    }));
  }

  /**
   * Handle player response to debate
   */
  handleDebateResponse(debateId, playerResponse) {
    const debate = this.debateHistory.find((d) => d.id === debateId);
    if (!debate) return;

    debate.playerResponse = playerResponse;
    debate.status = 'completed';

    // Calculate debate outcome based on response quality and opposition strength
    const outcome = this.calculateDebateOutcome(debate, playerResponse);

    this.eventSystem.emit('opposition:debate_concluded', {
      debate,
      outcome,
      impact: outcome.impact,
    });
  }

  /**
   * Calculate outcome of a debate
   */
  calculateDebateOutcome(debate, playerResponse) {
    const baseScore = Math.random() * 0.4 + 0.3; // 0.3-0.7 base

    // Modify based on response type
    const responseModifiers = {
      strong_defense: 0.2,
      compromise: 0.1,
      deflect: -0.1,
      weak_response: -0.2,
      no_response: -0.3,
    };

    const finalScore = Math.max(0, Math.min(1, baseScore + (responseModifiers[playerResponse.type] || 0)));

    let outcome;
    const impact = { approval: 0, support: 0 };

    if (finalScore > 0.6) {
      outcome = 'player_victory';
      impact.approval = 1 + Math.random() * 1.5;
      impact.support = -(Math.random() * 0.5);
    } else if (finalScore > 0.4) {
      outcome = 'draw';
      impact.approval = Math.random() * 0.5 - 0.25;
    } else {
      outcome = 'opposition_victory';
      impact.approval = -(1 + Math.random() * 1.5);
      impact.support = Math.random() * 0.8;
    }

    return { outcome, score: finalScore, impact };
  }

  /**
   * Get debate history
   */
  getDebateHistory() {
    return [...this.debateHistory];
  }

  /**
   * Reset opposition state (for new game)
   */
  reset() {
    this.currentStance = 'neutral';
    this.aggressiveness = 0.5;
    this.strategy = 'balanced';
    this.recentActions = [];
    this.policyPositions.clear();
    this.debateHistory = [];
    this.initializeOppositionParties();
  }
}

// Create and export singleton instance
export const aiOpposition = new AIOpposition();
