/* eslint-disable no-mixed-operators */
/* eslint-disable no-plusplus */
import { eventSystem } from './EventSystem';

/**
 * CrisisManagementSystem - Advanced crisis simulation and management
 * Implements realistic crisis escalation, response strategies, and long-term consequences
 */
export class CrisisManagementSystem {
  constructor() {
    this.eventSystem = eventSystem;
    this.activeCrises = [];
    this.resolvedCrises = [];
    this.crisisHistory = [];

    // Crisis escalation model parameters
    this.escalationFactors = {
      mediaAttention: 0.2, // How much media coverage affects crisis growth
      publicConcern: 0.3, // How much public concern affects crisis growth
      oppositionFocus: 0.15, // How much opposition attention affects crisis
      managementQuality: 0.35, // How much your management affects outcomes
    };

    // Crisis categories and base parameters
    this.crisisTemplates = {
      economic: {
        baseEscalation: 0.05, // Base escalation per turn
        economicImpact: 0.3, // Economic impact multiplier
        approvalImpact: 0.2, // Approval impact multiplier
        baseMediaAttraction: 0.6, // How much media is drawn to this type
        typicalDuration: [3, 8], // Min/max weeks for typical duration
        possibleEscalations: ['political', 'international'],
        responseOptions: [
          {
            id: 'stimulus', name: 'Economic Stimulus', cost: 0.8, effectiveness: 0.7,
          },
          {
            id: 'austerity', name: 'Austerity Measures', cost: 0.3, effectiveness: 0.4,
          },
          {
            id: 'reform', name: 'Structural Reform', cost: 0.6, effectiveness: 0.9,
          },
          {
            id: 'ignore', name: 'Minimal Response', cost: 0.1, effectiveness: 0.1,
          },
        ],
      },
      political: {
        baseEscalation: 0.1,
        economicImpact: 0.1,
        approvalImpact: 0.4,
        baseMediaAttraction: 0.8,
        typicalDuration: [2, 6],
        possibleEscalations: ['economic', 'scandal'],
        responseOptions: [
          {
            id: 'reshuffle', name: 'Cabinet Reshuffle', cost: 0.5, effectiveness: 0.6,
          },
          {
            id: 'address', name: 'Public Address', cost: 0.2, effectiveness: 0.4,
          },
          {
            id: 'investigation', name: 'Independent Investigation', cost: 0.4, effectiveness: 0.8,
          },
          {
            id: 'deflect', name: 'Deflect Blame', cost: 0.1, effectiveness: 0.2,
          },
        ],
      },
      scandal: {
        baseEscalation: 0.15,
        economicImpact: 0.05,
        approvalImpact: 0.5,
        baseMediaAttraction: 0.9,
        typicalDuration: [3, 10],
        possibleEscalations: ['political'],
        responseOptions: [
          {
            id: 'resignation', name: 'Demand Resignation', cost: 0.7, effectiveness: 0.9,
          },
          {
            id: 'defend', name: 'Defend Official', cost: 0.3, effectiveness: 0.3,
          },
          {
            id: 'damage_control', name: 'Damage Control PR', cost: 0.5, effectiveness: 0.6,
          },
          {
            id: 'scapegoat', name: 'Find Scapegoat', cost: 0.4, effectiveness: 0.5,
          },
        ],
      },
      international: {
        baseEscalation: 0.07,
        economicImpact: 0.25,
        approvalImpact: 0.15,
        baseMediaAttraction: 0.5,
        typicalDuration: [4, 12],
        possibleEscalations: ['economic', 'security'],
        responseOptions: [
          {
            id: 'diplomacy', name: 'Diplomatic Solution', cost: 0.3, effectiveness: 0.7,
          },
          {
            id: 'sanctions', name: 'Economic Sanctions', cost: 0.6, effectiveness: 0.5,
          },
          {
            id: 'military', name: 'Military Response', cost: 0.9, effectiveness: 0.8,
          },
          {
            id: 'isolate', name: 'Isolate the Issue', cost: 0.2, effectiveness: 0.3,
          },
        ],
      },
      security: {
        baseEscalation: 0.12,
        economicImpact: 0.15,
        approvalImpact: 0.3,
        baseMediaAttraction: 0.7,
        typicalDuration: [2, 8],
        possibleEscalations: ['political', 'international'],
        responseOptions: [
          {
            id: 'emergency', name: 'Emergency Measures', cost: 0.8, effectiveness: 0.9,
          },
          {
            id: 'investigation', name: 'Security Investigation', cost: 0.5, effectiveness: 0.7,
          },
          {
            id: 'reassurance', name: 'Public Reassurance', cost: 0.2, effectiveness: 0.4,
          },
          {
            id: 'coordination', name: 'Inter-agency Coordination', cost: 0.6, effectiveness: 0.8,
          },
        ],
      },
      natural: {
        baseEscalation: 0.2,
        economicImpact: 0.35,
        approvalImpact: 0.1,
        baseMediaAttraction: 0.6,
        typicalDuration: [1, 5],
        possibleEscalations: ['economic'],
        responseOptions: [
          {
            id: 'emergency_relief', name: 'Emergency Relief', cost: 0.7, effectiveness: 0.9,
          },
          {
            id: 'reconstruction', name: 'Reconstruction Plan', cost: 0.9, effectiveness: 0.8,
          },
          {
            id: 'preventive', name: 'Preventive Measures', cost: 0.5, effectiveness: 0.6,
          },
          {
            id: 'minimal', name: 'Minimal Response', cost: 0.1, effectiveness: 0.2,
          },
        ],
      },
    };

    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.eventSystem.on('turn:end', (event) => {
      this.processCrisesTurn(event.data.gameState);
    });

    this.eventSystem.on('crisis:generate', (event) => {
      this.generateCrisis(event.data);
    });

    this.eventSystem.on('crisis:respond', (event) => {
      this.respondToCrisis(event.data);
    });
  }

  /**
   * Update all active crises for a game turn
   */
  processCrisesTurn(gameState) {
    // Process each active crisis
    this.activeCrises.forEach((crisis) => {
      this.updateCrisisState(crisis, gameState);

      // Apply ongoing effects from crisis
      this.applyCrisisEffects(crisis, gameState);

      // Check for crisis resolution or escalation
      if (crisis.managementScore >= 100) {
        this.resolveCrisis(crisis, gameState);
      } else if (crisis.severity >= 90 && !crisis.hasEscalated) {
        this.escalateCrisis(crisis, gameState);
      }
    });

    // Check for new random crises
    this.checkForNewCrises(gameState);

    // Update crisis history tracking
    this.updateCrisisHistory(gameState);
  }

  /**
   * Update an individual crisis state for the current turn
   */
  updateCrisisState(crisis, gameState) {
    // Base crisis template
    const template = this.crisisTemplates[crisis.type];

    // Calculate crisis growth factors
    const mediaFactor = crisis.mediaAttention / 100 * this.escalationFactors.mediaAttention;
    const publicFactor = crisis.publicConcern / 100 * this.escalationFactors.publicConcern;
    const oppositionFactor = (gameState.politics.approval < 50 ? 0.2 : 0.1) * this.escalationFactors.oppositionFocus;

    // Management effectiveness reduces growth
    const managementFactor = crisis.managementScore / 100 * this.escalationFactors.managementQuality;

    // Calculate net growth rate
    const growthRate = (template.baseEscalation + mediaFactor + publicFactor + oppositionFactor) - managementFactor;

    // Update crisis severity (clamped 0-100)
    crisis.severity = Math.max(0, Math.min(100, crisis.severity + (growthRate * 10)));

    // Update crisis timeline
    crisis.currentWeek++;
    crisis.totalDuration++;

    // Media attention fluctuates but generally follows crisis severity
    const mediaChange = (crisis.severity / 100 * template.baseMediaAttraction) - (crisis.mediaAttention / 100) + ((Math.random() - 0.5) * 0.1);
    crisis.mediaAttention = Math.max(0, Math.min(100, crisis.mediaAttention + (mediaChange * 10)));

    // Public concern grows with media attention but more slowly
    const publicChange = (crisis.mediaAttention - crisis.publicConcern) * 0.1 + ((Math.random() - 0.5) * 0.05);
    crisis.publicConcern = Math.max(0, Math.min(100, crisis.publicConcern + (publicChange * 10)));

    // Check for major development
    if (Math.random() < 0.1) { // 10% chance each turn
      this.generateCrisisDevelopment(crisis, gameState);
    }

    // Update response effectiveness over time
    if (crisis.activeResponses.length > 0) {
      crisis.activeResponses.forEach((response) => {
        response.weeksActive++;
        // Responses become less effective over time
        response.currentEffectiveness = response.baseEffectiveness * Math.max(0.3, 1 - (response.weeksActive * 0.1));
      });
    }
  }

  /**
   * Apply ongoing effects from crisis to game state
   */
  applyCrisisEffects(crisis, gameState) {
    const template = this.crisisTemplates[crisis.type];
    const severityMultiplier = crisis.severity / 100;

    // Economic impact
    const economicImpact = template.economicImpact * severityMultiplier * 0.1; // Per turn
    gameState.economy.gdpGrowth -= economicImpact;

    // Approval impact
    const approvalImpact = template.approvalImpact * severityMultiplier * 0.5; // Per turn
    gameState.politics.approval -= approvalImpact;

    // Specific crisis type effects
    switch (crisis.type) {
      case 'economic':
        gameState.economy.unemployment += economicImpact * 0.5;
        gameState.economy.confidence -= severityMultiplier * 2;
        break;
      case 'political':
        gameState.politics.coalitionStability -= severityMultiplier * 1.5;
        break;
      case 'security':
        gameState.politics.approval -= severityMultiplier * 0.3; // Additional security concern
        break;
      case 'natural':
        // Natural disasters have immediate severe impact
        if (crisis.currentWeek === 1) {
          gameState.economy.gdpGrowth -= severityMultiplier * 0.5;
        }
        break;
      default:
        break; // No additional effects for other types
    }
  }

  /**
   * Generate a new crisis
   */
  generateCrisis(crisisData) {
    const template = this.crisisTemplates[crisisData.type];

    const crisis = {
      id: this.generateCrisisId(),
      type: crisisData.type,
      title: crisisData.title,
      description: crisisData.description,
      severity: crisisData.initialSeverity || Math.random() * 40 + 20, // 20-60 initial
      mediaAttention: template.baseMediaAttraction * 50 + Math.random() * 30,
      publicConcern: Math.random() * 30 + 10,
      managementScore: 0,
      currentWeek: 0,
      totalDuration: 0,
      hasEscalated: false,
      activeResponses: [],
      developments: [],
      responseHistory: [],
      createdAt: Date.now(),

      // Tracking factors
      economicDamage: 0,
      politicalDamage: 0,
      longTermEffects: [],

      // Crisis-specific data
      origin: crisisData.origin || 'random',
      affectedRegions: crisisData.affectedRegions || [],
      stakeholders: crisisData.stakeholders || [],
    };

    this.activeCrises.push(crisis);

    // Emit crisis generated event
    this.eventSystem.emit('crisis:generated', {
      crisis,
      template,
    });

    return crisis;
  }

  /**
   * Respond to a crisis with a specific strategy
   */
  respondToCrisis(responseData) {
    const { crisisId, responseId, customParameters } = responseData;
    const crisis = this.activeCrises.find((c) => c.id === crisisId);

    if (!crisis) return false;

    const template = this.crisisTemplates[crisis.type];
    const responseOption = template.responseOptions.find((r) => r.id === responseId);

    if (!responseOption) return false;

    // Calculate response effectiveness
    const baseEffectiveness = responseOption.effectiveness;
    const timingFactor = this.calculateTimingFactor(crisis);
    const resourceFactor = customParameters?.resources || 1;
    const publicSupportFactor = this.calculatePublicSupportFactor(crisis, responseData.gameState);

    const totalEffectiveness = baseEffectiveness * timingFactor * resourceFactor * publicSupportFactor;

    // Create response record
    const response = {
      id: responseOption.id,
      name: responseOption.name,
      cost: responseOption.cost * resourceFactor,
      baseEffectiveness,
      currentEffectiveness: totalEffectiveness,
      implementedAt: crisis.currentWeek,
      weeksActive: 0,
      parameters: customParameters || {},
    };

    crisis.activeResponses.push(response);
    crisis.responseHistory.push(response);

    // Apply immediate effects
    crisis.managementScore += totalEffectiveness * 20;
    crisis.managementScore = Math.min(100, crisis.managementScore);

    // Apply response costs
    this.applyResponseCosts(response, responseData.gameState);

    // Generate response outcome
    this.generateResponseOutcome(crisis, response, responseData.gameState);

    // Emit response event
    this.eventSystem.emit('crisis:response_implemented', {
      crisis,
      response,
      effectiveness: totalEffectiveness,
    });

    return true;
  }

  /**
   * Calculate timing factor for response effectiveness
   */
  calculateTimingFactor(crisis) {
    // Earlier responses are more effective
    if (crisis.currentWeek <= 1) return 1.2; // 20% bonus for immediate response
    if (crisis.currentWeek <= 3) return 1.0; // Normal effectiveness
    if (crisis.currentWeek <= 6) return 0.8; // 20% penalty for delayed response
    return 0.6; // 40% penalty for very late response
  }

  /**
   * Calculate public support factor for response
   */
  calculatePublicSupportFactor(crisis, gameState) {
    const baseSupport = gameState.politics.approval / 100;
    const crisisSupport = Math.max(0.3, 1 - (crisis.publicConcern / 200)); // High concern reduces support
    return (baseSupport + crisisSupport) / 2;
  }

  /**
   * Apply costs of crisis response to game state
   */
  applyResponseCosts(response, gameState) {
    // Political capital cost
    const politicalCost = response.cost * 10;
    gameState.politics.politicalCapital = Math.max(0, gameState.politics.politicalCapital - politicalCost);

    // Economic cost (for expensive responses)
    if (response.cost > 0.5) {
      const economicCost = (response.cost - 0.5) * 0.1;
      gameState.economy.governmentDebt += economicCost;
    }
  }

  /**
   * Generate outcome from crisis response
   */
  generateResponseOutcome(crisis, response, gameState) {
    const outcomes = this.generateResponseOutcomes(crisis, response);

    outcomes.forEach((outcome) => {
      crisis.developments.push({
        week: crisis.currentWeek,
        type: 'response_outcome',
        title: outcome.title,
        description: outcome.description,
        impact: outcome.impact,
      });

      // Apply outcome effects
      this.applyOutcomeEffects(outcome, gameState);
    });
  }

  /**
   * Generate possible outcomes from a response
   */
  generateResponseOutcomes(crisis, response) {
    const outcomes = [];
    const effectivenessLevel = response.currentEffectiveness;

    if (effectivenessLevel > 0.8) {
      outcomes.push({
        title: 'Highly Effective Response',
        description: `The ${response.name} strategy has proven highly effective in addressing the crisis.`,
        impact: { approval: 2, severity: -15, mediaAttention: -10 },
      });
    } else if (effectivenessLevel > 0.6) {
      outcomes.push({
        title: 'Moderately Effective Response',
        description: `The ${response.name} strategy has shown moderate success.`,
        impact: { approval: 1, severity: -8, mediaAttention: -5 },
      });
    } else if (effectivenessLevel > 0.3) {
      outcomes.push({
        title: 'Limited Response Success',
        description: `The ${response.name} strategy has had limited impact on the crisis.`,
        impact: { approval: 0, severity: -3, mediaAttention: 0 },
      });
    } else {
      outcomes.push({
        title: 'Response Proves Ineffective',
        description: `The ${response.name} strategy has failed to address the crisis effectively.`,
        impact: { approval: -1, severity: 2, mediaAttention: 5 },
      });
    }

    return outcomes;
  }

  /**
   * Apply outcome effects to crisis and game state
   */
  applyOutcomeEffects(outcome, gameState) {
    if (outcome.impact.approval) {
      gameState.politics.approval += outcome.impact.approval;
    }
    // Additional effects would be applied here
  }

  /**
   * Check for new random crises
   */
  checkForNewCrises(gameState) {
    // Base crisis probability
    let crisisProbability = 0.05; // 5% per turn base

    // Increase probability based on various factors
    if (gameState.economy.gdpGrowth < 0) crisisProbability += 0.03;
    if (gameState.economy.unemployment > 8) crisisProbability += 0.02;
    if (gameState.politics.approval < 40) crisisProbability += 0.02;
    if (this.activeCrises.length > 0) crisisProbability += 0.01; // Crisis breeds crisis

    // Decrease probability if many active crises
    if (this.activeCrises.length > 2) crisisProbability *= 0.5;

    if (Math.random() < crisisProbability) {
      this.generateRandomCrisis(gameState);
    }
  }

  /**
   * Generate a random crisis based on current game state
   */
  generateRandomCrisis(gameState) {
    const crisisTypes = Object.keys(this.crisisTemplates);
    const weights = this.calculateCrisisTypeWeights(gameState);

    const selectedType = this.weightedRandomSelect(crisisTypes, weights);
    const crisisData = this.generateCrisisData(selectedType, gameState);

    this.generateCrisis(crisisData);
  }

  /**
   * Calculate weights for different crisis types based on game state
   */
  calculateCrisisTypeWeights(gameState) {
    return {
      economic: gameState.economy.gdpGrowth < 1 ? 0.3 : 0.15,
      political: gameState.politics.approval < 50 ? 0.25 : 0.15,
      scandal: Math.random() * 0.2,
      international: 0.15,
      security: 0.1,
      natural: 0.1,
    };
  }

  /**
   * Weighted random selection
   */
  weightedRandomSelect(items, weights) {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[items[i]];
      if (random <= 0) {
        return items[i];
      }
    }

    return items[items.length - 1];
  }

  /**
   * Generate crisis data for a specific type
   */
  generateCrisisData(type, _gameState) {
    const crisisTemplates = {
      economic: [
        {
          title: 'Market Volatility Crisis',
          description: 'Sudden market fluctuations threaten economic stability.',
          initialSeverity: 35,
        },
        {
          title: 'Banking Sector Concerns',
          description: 'Major banks face liquidity issues causing market concern.',
          initialSeverity: 45,
        },
      ],
      political: [
        {
          title: 'Coalition Tensions',
          description: 'Internal disagreements threaten government stability.',
          initialSeverity: 30,
        },
        {
          title: 'Opposition Challenge',
          description: 'Opposition parties unite to challenge key policies.',
          initialSeverity: 25,
        },
      ],
      scandal: [
        {
          title: 'Ethics Investigation',
          description: 'Senior official under investigation for potential misconduct.',
          initialSeverity: 40,
        },
      ],
      // Add more templates for other types...
    };

    const templates = crisisTemplates[type] || [];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return {
      type,
      title: template.title,
      description: template.description,
      initialSeverity: template.initialSeverity + (Math.random() - 0.5) * 10,
      origin: 'random',
    };
  }

  /**
   * Generate a unique crisis ID
   */
  generateCrisisId() {
    return `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Resolve a crisis
   */
  resolveCrisis(crisis, gameState) {
    // Remove from active crises
    const index = this.activeCrises.indexOf(crisis);
    if (index > -1) {
      this.activeCrises.splice(index, 1);
    }

    // Add to resolved crises
    crisis.resolvedAt = Date.now();
    crisis.finalSeverity = crisis.severity;
    crisis.resolutionMethod = 'management_success';

    this.resolvedCrises.push(crisis);

    // Apply resolution benefits
    gameState.politics.approval += 3; // Successful crisis management boosts approval
    gameState.politics.politicalCapital += 5;

    // Emit resolution event
    this.eventSystem.emit('crisis:resolved', {
      crisis,
      method: 'management_success',
    });
  }

  /**
   * Escalate a crisis to a more severe form
   */
  escalateCrisis(crisis, _gameState) {
    const template = this.crisisTemplates[crisis.type];
    const { possibleEscalations } = template;

    if (possibleEscalations.length > 0) {
      const escalationType = possibleEscalations[Math.floor(Math.random() * possibleEscalations.length)];

      // Create new escalated crisis
      const escalatedCrisis = this.generateCrisis({
        type: escalationType,
        title: `Escalated: ${crisis.title}`,
        description: `The ${crisis.title} has escalated into a broader ${escalationType} crisis.`,
        initialSeverity: Math.min(80, crisis.severity + 20),
        origin: 'escalation',
        parentCrisis: crisis.id,
      });

      crisis.hasEscalated = true;
      crisis.escalatedTo = escalatedCrisis.id;

      // Emit escalation event
      this.eventSystem.emit('crisis:escalated', {
        originalCrisis: crisis,
        escalatedCrisis,
      });
    }
  }

  /**
   * Generate a crisis development/update
   */
  generateCrisisDevelopment(crisis, _gameState) {
    const developments = [
      {
        title: 'New Information Emerges',
        description: 'Additional details about the crisis have come to light.',
        impact: { severity: 5, mediaAttention: 10 },
      },
      {
        title: 'Stakeholder Concerns',
        description: 'Key stakeholders express growing concern about the situation.',
        impact: { publicConcern: 8, severity: 3 },
      },
      {
        title: 'Opposition Criticism',
        description: "Opposition parties criticize the government's handling of the crisis.",
        impact: { mediaAttention: 8, publicConcern: 5 },
      },
    ];

    const development = developments[Math.floor(Math.random() * developments.length)];

    crisis.developments.push({
      week: crisis.currentWeek,
      type: 'development',
      title: development.title,
      description: development.description,
      impact: development.impact,
    });

    // Apply development effects
    Object.keys(development.impact).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(crisis, key)) {
        crisis[key] = Math.min(100, crisis[key] + development.impact[key]);
      }
    });
  }

  /**
   * Update crisis history for analytics
   */
  updateCrisisHistory(gameState) {
    const historyEntry = {
      week: gameState.time.week,
      year: gameState.time.year,
      activeCrises: this.activeCrises.length,
      totalSeverity: this.activeCrises.reduce((sum, crisis) => sum + crisis.severity, 0),
      crisisTypes: this.activeCrises.reduce((types, crisis) => {
        types[crisis.type] = (types[crisis.type] || 0) + 1;
        return types;
      }, {}),
    };

    this.crisisHistory.push(historyEntry);

    // Keep only last 104 weeks (2 years) of history
    if (this.crisisHistory.length > 104) {
      this.crisisHistory.shift();
    }
  }

  /**
   * Get current crisis overview
   */
  getCrisisOverview() {
    return {
      active: this.activeCrises,
      resolved: this.resolvedCrises,
      history: this.crisisHistory,
      totalActiveSeverity: this.activeCrises.reduce((sum, crisis) => sum + crisis.severity, 0),
      averageDuration: this.resolvedCrises.length > 0
        ? this.resolvedCrises.reduce((sum, crisis) => sum + crisis.totalDuration, 0) / this.resolvedCrises.length
        : 0,
    };
  }
}

// Create and export singleton instance
export const crisisManagementSystem = new CrisisManagementSystem();
