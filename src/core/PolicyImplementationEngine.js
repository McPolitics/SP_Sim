import { eventSystem } from './EventSystem';
import { monetizationFramework } from './MonetizationFramework';

/**
 * PolicyImplementationEngine - Advanced policy implementation system
 * Handles policy effects, implementation delays, opposition responses, and progression
 */
class PolicyImplementationEngine {
  constructor() {
    this.activePolicies = new Map(); // Policy ID -> Policy Implementation Data
    this.policyQueue = []; // Policies waiting for implementation
    this.policyHistory = []; // Completed policies
    this.implementationCapacity = 100; // Maximum concurrent policy implementation capacity
    this.politicalCapitalCost = new Map(); // Policy -> Political capital cost

    this.setupEventListeners();
  }

  /**
   * Initialize the policy implementation engine
   */
  initialize() {
    console.log('🏛️ Initializing Policy Implementation Engine');
    this.loadPolicyState();
  }

  /**
   * Load policy state from storage
   */
  loadPolicyState() {
    const stored = localStorage.getItem('sp_sim_policy_state');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.activePolicies = new Map(data.activePolicies || []);
        this.policyQueue = data.policyQueue || [];
        this.policyHistory = data.policyHistory || [];
      } catch (error) {
        console.warn('Failed to load policy state:', error);
      }
    }
  }

  /**
   * Save policy state to storage
   */
  savePolicyState() {
    const data = {
      activePolicies: Array.from(this.activePolicies.entries()),
      policyQueue: this.policyQueue,
      policyHistory: this.policyHistory,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('sp_sim_policy_state', JSON.stringify(data));
  }

  /**
   * Implement a policy
   */
  implementPolicy(policy, gameState) {
    console.log(`🏛️ Implementing policy: ${policy.name}`);

    // Check implementation capacity
    const capacityCheck = this.checkImplementationCapacity(policy);
    if (!capacityCheck.allowed) {
      return {
        success: false,
        reason: 'capacity_exceeded',
        message: `Implementation capacity exceeded. ${capacityCheck.message}`,
      };
    }

    // Check political requirements
    const requirementCheck = this.checkPoliticalRequirements(policy, gameState);
    if (!requirementCheck.allowed) {
      return {
        success: false,
        reason: 'requirements_not_met',
        message: requirementCheck.message,
      };
    }

    // Check monetization limits
    const monetizationCheck = this.checkMonetizationLimits(policy);
    if (!monetizationCheck.allowed) {
      return {
        success: false,
        reason: 'monetization_limit',
        message: monetizationCheck.message,
        upgradePrompt: monetizationCheck.upgradePrompt,
      };
    }

    // Calculate implementation timeline
    const timeline = this.calculateImplementationTimeline(policy, gameState);

    // Create implementation data
    const implementationData = {
      id: `${policy.id}_${Date.now()}`,
      originalPolicy: policy,
      startWeek: gameState.time.week,
      startYear: gameState.time.year,
      timeline,
      status: 'implementing',
      progress: 0,
      phases: this.createImplementationPhases(policy),
      currentPhase: 0,
      effects: {
        immediate: {},
        ongoing: {},
        final: {},
      },
      opposition: {
        resistance: this.calculateOppositionResistance(policy, gameState),
        challenges: [],
      },
      costs: {
        financial: policy.baseCost || 0,
        political: this.calculatePoliticalCost(policy, gameState),
        ongoing: 0,
      },
    };

    // Add to active policies
    this.activePolicies.set(implementationData.id, implementationData);

    // Apply immediate effects
    this.applyImmediateEffects(implementationData, gameState);

    // Notify opposition
    this.notifyOpposition(implementationData, gameState);

    // Track analytics
    this.trackPolicyImplementation(implementationData);

    // Save state
    this.savePolicyState();

    // Emit events
    eventSystem.emit('policy:implementation_started', {
      policy: implementationData,
      gameState,
    });

    console.log(`✅ Policy implementation started: ${policy.name}`);

    return {
      success: true,
      implementation: implementationData,
      message: `Successfully started implementing ${policy.name}`,
    };
  }

  /**
   * Check if implementation capacity allows for new policy
   */
  checkImplementationCapacity(policy) {
    const currentLoad = this.calculateCurrentCapacityLoad();
    const policyLoad = this.calculatePolicyLoad(policy);

    if (currentLoad + policyLoad > this.implementationCapacity) {
      return {
        allowed: false,
        message: `Would exceed capacity (${currentLoad + policyLoad}/${this.implementationCapacity})`,
        currentLoad,
        policyLoad,
        available: this.implementationCapacity - currentLoad,
      };
    }

    return { allowed: true, currentLoad, policyLoad };
  }

  /**
   * Calculate current implementation capacity load
   */
  calculateCurrentCapacityLoad() {
    let load = 0;
    Array.from(this.activePolicies.values()).forEach((implementation) => {
      load += this.calculatePolicyLoad(implementation.originalPolicy);
    });
    return load;
  }

  /**
   * Calculate policy implementation load
   */
  calculatePolicyLoad(policy) {
    const complexityWeights = {
      low: 15,
      medium: 25,
      high: 40,
    };

    const categoryWeights = {
      economic: 1.2,
      social: 1.0,
      environmental: 1.1,
      foreign: 1.3,
    };

    const baseLoad = complexityWeights[policy.complexity] || 25;
    const categoryMultiplier = categoryWeights[policy.category] || 1.0;

    return Math.round(baseLoad * categoryMultiplier);
  }

  /**
   * Check political requirements for policy implementation
   */
  checkPoliticalRequirements(policy, gameState) {
    const requirements = policy.requirements || {};
    const currentApproval = gameState.politics?.approval || 0;
    const currentCoalition = this.calculateCoalitionSupport(gameState);

    const issues = [];

    if (requirements.approval && currentApproval < requirements.approval) {
      issues.push(`Need ${requirements.approval}% approval (currently ${currentApproval.toFixed(1)}%)`);
    }

    if (requirements.coalitionSupport && currentCoalition < requirements.coalitionSupport) {
      issues.push(`Need ${requirements.coalitionSupport}% coalition support (currently ${currentCoalition.toFixed(1)}%)`);
    }

    if (issues.length > 0) {
      return {
        allowed: false,
        message: `Political requirements not met: ${issues.join(', ')}`,
        issues,
      };
    }

    return { allowed: true };
  }

  /**
   * Calculate coalition support percentage
   */
  calculateCoalitionSupport(gameState) {
    if (!gameState.politics?.coalition) return 0;

    return gameState.politics.coalition.reduce((sum, party) => sum + (party.support || 0), 0);
  }

  /**
   * Check monetization limits for policy implementation
   */
  checkMonetizationLimits(policy) {
    // Check if advanced policies require premium features
    if (policy.complexity === 'high' && policy.category === 'economic') {
      const featureCheck = monetizationFramework.useFeature('advanced_economic_policies');
      if (!featureCheck.allowed) {
        return {
          allowed: false,
          message: 'Advanced economic policies require premium subscription',
          upgradePrompt: featureCheck.upgradePrompt,
        };
      }
    }

    // Check policy limits per tier
    const activePolicyCount = this.activePolicies.size;
    const tierLimits = {
      free: 3,
      premium: 10,
      educational: 15,
      enterprise: Infinity,
    };

    const limit = tierLimits[monetizationFramework.subscriptionTier] || tierLimits.free;

    if (activePolicyCount >= limit) {
      return {
        allowed: false,
        message: `Policy limit reached (${activePolicyCount}/${limit})`,
        upgradePrompt: monetizationFramework.getUpgradePrompt('unlimited_policies'),
      };
    }

    return { allowed: true };
  }

  /**
   * Calculate implementation timeline
   */
  calculateImplementationTimeline(policy, gameState) {
    const baseDuration = policy.duration || 12; // weeks
    const complexityMultiplier = {
      low: 0.8,
      medium: 1.0,
      high: 1.3,
    };

    // Opposition resistance can extend timeline
    const oppositionResistance = this.calculateOppositionResistance(policy, gameState);
    const resistanceMultiplier = 1 + (oppositionResistance / 100);

    // Political approval affects implementation speed
    const approvalBonus = Math.max(0.7, (gameState.politics?.approval || 50) / 100);

    const adjustedDuration = Math.round(
      baseDuration
      * (complexityMultiplier[policy.complexity] || 1.0)
      * resistanceMultiplier
      * (1 / approvalBonus),
    );

    return {
      planned: baseDuration,
      estimated: adjustedDuration,
      factors: {
        complexity: complexityMultiplier[policy.complexity] || 1.0,
        opposition: resistanceMultiplier,
        approval: approvalBonus,
      },
    };
  }

  /**
   * Calculate opposition resistance to policy
   */
  calculateOppositionResistance(policy, gameState) {
    let resistance = 0;

    // Base resistance by policy category
    const categoryResistance = {
      economic: 20,
      social: 30,
      environmental: 25,
      foreign: 35,
    };

    resistance += categoryResistance[policy.category] || 20;

    // Opposition strength affects resistance
    const oppositionStrength = gameState.politics?.opposition?.strength || 50;
    resistance += (oppositionStrength - 50) * 0.4;

    // Policy cost affects resistance
    const costFactor = (policy.baseCost || 0) / 1000000000; // Billions
    resistance += Math.min(20, costFactor * 10);

    return Math.max(0, Math.min(100, resistance));
  }

  /**
   * Calculate political capital cost
   */
  calculatePoliticalCost(policy, gameState) {
    const baseCost = (policy.baseCost || 0) / 100000000; // Per 100M
    const complexityMultiplier = {
      low: 1.0,
      medium: 1.5,
      high: 2.0,
    };

    const oppositionResistance = this.calculateOppositionResistance(policy, gameState);
    const resistanceMultiplier = 1 + (oppositionResistance / 200);

    return Math.round(baseCost * (complexityMultiplier[policy.complexity] || 1.0) * resistanceMultiplier);
  }

  /**
   * Create implementation phases
   */
  createImplementationPhases(_policy) {
    const phases = [
      {
        name: 'Planning & Preparation',
        duration: 0.2, // 20% of total time
        description: 'Developing implementation strategy and preparing resources',
        effects: 'minimal',
      },
      {
        name: 'Initial Implementation',
        duration: 0.3, // 30% of total time
        description: 'Beginning policy rollout and initial changes',
        effects: 'moderate',
      },
      {
        name: 'Full Deployment',
        duration: 0.4, // 40% of total time
        description: 'Complete policy implementation across all affected areas',
        effects: 'significant',
      },
      {
        name: 'Stabilization',
        duration: 0.1, // 10% of total time
        description: 'Monitoring effects and making final adjustments',
        effects: 'full',
      },
    ];

    return phases;
  }

  /**
   * Apply immediate effects of policy implementation
   */
  applyImmediateEffects(implementation, gameState) {
    const policy = implementation.originalPolicy;
    const immediateEffects = {};

    // Apply 20% of effects immediately
    if (policy.effects) {
      Object.entries(policy.effects).forEach(([key, value]) => {
        if (typeof value === 'object' && value.min !== undefined) {
          // Use minimum value for immediate effect
          immediateEffects[key] = value.min * 0.2;
        } else if (typeof value === 'number') {
          immediateEffects[key] = value * 0.2;
        }
      });
    }

    implementation.effects.immediate = immediateEffects;

    // Emit immediate effects event
    eventSystem.emit('policy:immediate_effects', {
      policy: implementation,
      effects: immediateEffects,
      gameState,
    });
  }

  /**
   * Notify opposition about policy implementation
   */
  notifyOpposition(implementation, gameState) {
    eventSystem.emit('opposition:policy_notification', {
      policy: implementation,
      resistance: implementation.opposition.resistance,
      gameState,
    });
  }

  /**
   * Track policy implementation analytics
   */
  trackPolicyImplementation(implementation) {
    monetizationFramework.trackFeatureUsage('policy_implementation', {
      category: implementation.originalPolicy.category,
      complexity: implementation.originalPolicy.complexity,
      cost: implementation.costs.financial,
      politicalCost: implementation.costs.political,
    });

    eventSystem.emit('analytics:policy_implemented', {
      policy: implementation.originalPolicy,
      implementation: {
        timeline: implementation.timeline,
        costs: implementation.costs,
        opposition: implementation.opposition.resistance,
      },
    });
  }

  /**
   * Update policy implementations (called each game turn)
   */
  updateImplementations(gameState) {
    const completedPolicies = [];

    Array.from(this.activePolicies.entries()).forEach(([id, implementation]) => {
      const progressUpdate = this.updatePolicyProgress(implementation, gameState);

      if (progressUpdate.completed) {
        completedPolicies.push(implementation);
        this.activePolicies.delete(id);
        this.policyHistory.push({
          ...implementation,
          completedWeek: gameState.time.week,
          completedYear: gameState.time.year,
          finalEffects: progressUpdate.effects,
        });
      }
    });

    // Handle completed policies
    completedPolicies.forEach((policy) => {
      this.handlePolicyCompletion(policy, gameState);
    });

    this.savePolicyState();
  }

  /**
   * Update individual policy progress
   */
  updatePolicyProgress(implementation, gameState) {
    const weeksSinceStart = this.calculateWeeksSince(
      implementation.startWeek,
      implementation.startYear,
      gameState.time.week,
      gameState.time.year,
    );

    const totalDuration = implementation.timeline.estimated;
    const newProgress = Math.min(100, (weeksSinceStart / totalDuration) * 100);
    const progressDelta = newProgress - implementation.progress;

    implementation.progress = newProgress;

    // Update current phase
    const phaseProgress = this.updateCurrentPhase(implementation);

    // Apply ongoing effects based on progress
    const ongoingEffects = this.calculateOngoingEffects(implementation, progressDelta);

    // Handle opposition challenges
    this.handleOppositionChallenges(implementation, gameState);

    const completed = implementation.progress >= 100;

    if (completed) {
      console.log(`✅ Policy implementation completed: ${implementation.originalPolicy.name}`);
    }

    return {
      completed,
      progress: implementation.progress,
      phase: phaseProgress,
      effects: ongoingEffects,
    };
  }

  /**
   * Calculate weeks since a given week/year
   */
  calculateWeeksSince(startWeek, startYear, currentWeek, currentYear) {
    return (currentYear - startYear) * 52 + (currentWeek - startWeek);
  }

  /**
   * Update current implementation phase
   */
  updateCurrentPhase(implementation) {
    const { phases } = implementation;
    let cumulativeProgress = 0;

    for (let i = 0; i < phases.length; i += 1) {
      cumulativeProgress += phases[i].duration * 100;
      if (implementation.progress <= cumulativeProgress) {
        if (implementation.currentPhase !== i) {
          implementation.currentPhase = i;

          eventSystem.emit('policy:phase_change', {
            policy: implementation,
            newPhase: i,
            phaseName: phases[i].name,
          });
        }
        break;
      }
    }

    return implementation.currentPhase;
  }

  /**
   * Calculate ongoing effects as policy progresses
   */
  calculateOngoingEffects(implementation, progressDelta) {
    const policy = implementation.originalPolicy;
    const ongoingEffects = {};

    if (policy.effects && progressDelta > 0) {
      Object.entries(policy.effects).forEach(([key, value]) => {
        let effectValue = 0;

        if (typeof value === 'object' && value.min !== undefined) {
          // Interpolate between min and max based on progress
          const progress = implementation.progress / 100;
          effectValue = value.min + (value.max - value.min) * progress;
          effectValue *= (progressDelta / 100); // Apply only the delta
        } else if (typeof value === 'number') {
          effectValue = value * (progressDelta / 100);
        }

        if (effectValue !== 0) {
          ongoingEffects[key] = effectValue;
        }
      });
    }

    // Emit ongoing effects
    if (Object.keys(ongoingEffects).length > 0) {
      eventSystem.emit('policy:ongoing_effects', {
        policy: implementation,
        effects: ongoingEffects,
      });
    }

    return ongoingEffects;
  }

  /**
   * Handle opposition challenges to policy implementation
   */
  handleOppositionChallenges(implementation, gameState) {
    // Random chance for opposition challenge
    const challengeChance = implementation.opposition.resistance / 200; // 0-50% chance

    if (Math.random() < challengeChance) {
      const challenge = this.generateOppositionChallenge(implementation, gameState);
      implementation.opposition.challenges.push(challenge);

      eventSystem.emit('policy:opposition_challenge', {
        policy: implementation,
        challenge,
        gameState,
      });
    }
  }

  /**
   * Generate opposition challenge
   */
  generateOppositionChallenge(implementation, gameState) {
    const challengeTypes = [
      'parliamentary_question',
      'media_campaign',
      'legal_challenge',
      'public_protest',
      'coalition_pressure',
    ];

    const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    return {
      id: `challenge_${Date.now()}`,
      type,
      severity: Math.floor(Math.random() * 3) + 1, // 1-3
      description: this.getChallengeDescription(type, implementation),
      week: gameState.time.week,
      year: gameState.time.year,
      resolved: false,
    };
  }

  /**
   * Get challenge description based on type
   */
  getChallengeDescription(type, implementation) {
    const policyName = implementation.originalPolicy.name;

    const descriptions = {
      parliamentary_question: `Opposition demands parliamentary answers about ${policyName} implementation`,
      media_campaign: `Media campaign criticizing the effectiveness of ${policyName}`,
      legal_challenge: `Legal challenge filed against ${policyName} on constitutional grounds`,
      public_protest: `Public protests organized against ${policyName}`,
      coalition_pressure: `Coalition partners express concerns about ${policyName}`,
    };

    return descriptions[type] || `Opposition challenge to ${policyName}`;
  }

  /**
   * Handle policy completion
   */
  handlePolicyCompletion(implementation, gameState) {
    // Apply final effects
    const finalEffects = this.calculateFinalEffects(implementation);

    eventSystem.emit('policy:completed', {
      policy: implementation,
      finalEffects,
      gameState,
    });

    console.log(`🎉 Policy successfully implemented: ${implementation.originalPolicy.name}`);
  }

  /**
   * Calculate final effects of completed policy
   */
  calculateFinalEffects(implementation) {
    const policy = implementation.originalPolicy;
    const finalEffects = {};

    if (policy.effects) {
      Object.entries(policy.effects).forEach(([key, value]) => {
        if (typeof value === 'object' && value.min !== undefined) {
          // Use max value for final effect (full implementation)
          finalEffects[key] = value.max;
        } else if (typeof value === 'number') {
          finalEffects[key] = value;
        }
      });
    }

    return finalEffects;
  }

  /**
   * Get active policies summary
   */
  getActivePolicies() {
    return Array.from(this.activePolicies.values()).map((implementation) => ({
      id: implementation.id,
      name: implementation.originalPolicy.name,
      category: implementation.originalPolicy.category,
      progress: implementation.progress,
      currentPhase: implementation.phases[implementation.currentPhase],
      timeRemaining: this.calculateTimeRemaining(implementation),
      opposition: implementation.opposition.resistance,
    }));
  }

  /**
   * Calculate time remaining for policy implementation
   */
  calculateTimeRemaining(implementation) {
    const totalDuration = implementation.timeline.estimated;
    const progressPercent = implementation.progress / 100;
    const weeksElapsed = totalDuration * progressPercent;
    return Math.max(0, totalDuration - weeksElapsed);
  }

  /**
   * Get implementation capacity status
   */
  getCapacityStatus() {
    const currentLoad = this.calculateCurrentCapacityLoad();
    return {
      used: currentLoad,
      total: this.implementationCapacity,
      available: this.implementationCapacity - currentLoad,
      percentage: (currentLoad / this.implementationCapacity) * 100,
    };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Handle policy implementation requests
    eventSystem.on('policy:implement', (event) => {
      const { policy, gameState } = event.data;
      const result = this.implementPolicy(policy, gameState);

      if (result.success) {
        eventSystem.emit('policy:implemented', {
          policy: result.implementation,
          gameState,
        });
      } else {
        eventSystem.emit('policy:rejected', {
          policy,
          reason: result.reason,
          message: result.message,
          upgradePrompt: result.upgradePrompt,
        });
      }
    });

    // Handle game state updates
    eventSystem.on('game:state_updated', (event) => {
      this.updateImplementations(event.data.gameState);
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.savePolicyState();
    });
  }
}

// Create singleton instance
export const policyImplementationEngine = new PolicyImplementationEngine();
export default policyImplementationEngine;
