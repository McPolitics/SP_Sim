# Political Simulation Module

## Overview

The Political Simulation module manages the complex dynamics of political power, public opinion, electoral processes, and governance mechanics. It models how economic policies, scandals, and global events affect political standing and provides realistic political challenges and opportunities.

## Core Components

### 1. Approval Rating System

#### Base Approval Calculation
```javascript
const approvalSystem = {
  baselineApproval: 45,           // Starting approval rating
  
  factors: {
    economic: {
      weight: 0.4,
      components: {
        gdpGrowth: rate => (rate - 2.0) * 5,        // 2% baseline
        unemployment: rate => (6.0 - rate) * 3,     // 6% baseline  
        inflation: rate => (2.0 - rate) * 2         // 2% baseline
      }
    },
    
    political: {
      weight: 0.3,
      components: {
        policySuccess: score => score * 0.5,
        coalitionStrength: strength => strength * 0.3,
        leadershipSkill: skill => skill * 0.2
      }
    },
    
    external: {
      weight: 0.2,
      components: {
        mediaRelations: relation => relation * 0.4,
        globalStanding: standing => standing * 0.3,
        crisisHandling: effectiveness => effectiveness * 0.3
      }
    },
    
    personal: {
      weight: 0.1,
      components: {
        charisma: level => level * 0.5,
        trustworthiness: level => level * 0.3,
        competence: level => level * 0.2
      }
    }
  },
  
  calculateApproval(gameState) {
    let totalApproval = this.baselineApproval;
    
    for (const [categoryName, category] of Object.entries(this.factors)) {
      let categoryScore = 0;
      
      for (const [componentName, calculator] of Object.entries(category.components)) {
        const value = this.getValue(gameState, categoryName, componentName);
        categoryScore += calculator(value);
      }
      
      totalApproval += categoryScore * category.weight;
    }
    
    return Math.max(0, Math.min(100, totalApproval));
  }
};
```

#### Demographic Breakdown
```javascript
const demographicApproval = {
  groups: {
    young: {
      size: 0.25,                 // 25% of electorate
      baseApproval: 42,
      priorities: {
        environment: 0.3,
        education: 0.25,
        employment: 0.25,
        socialIssues: 0.2
      }
    },
    
    middleAged: {
      size: 0.45,                 // 45% of electorate
      baseApproval: 48,
      priorities: {
        economy: 0.4,
        healthcare: 0.25,
        education: 0.2,
        security: 0.15
      }
    },
    
    elderly: {
      size: 0.30,                 // 30% of electorate
      baseApproval: 52,
      priorities: {
        healthcare: 0.4,
        pensions: 0.3,
        security: 0.2,
        stability: 0.1
      }
    }
  },
  
  calculateDemographicApproval(gameState, policies) {
    const results = {};
    
    for (const [groupName, group] of Object.entries(this.groups)) {
      let approval = group.baseApproval;
      
      for (const [priority, weight] of Object.entries(group.priorities)) {
        const policyScore = this.evaluatePolicyForPriority(policies, priority);
        approval += policyScore * weight * 10; // Scale to approval points
      }
      
      results[groupName] = {
        approval: Math.max(0, Math.min(100, approval)),
        size: group.size
      };
    }
    
    return results;
  }
};
```

### 2. Political Party System

#### Party Dynamics
```javascript
class PoliticalParty {
  constructor(name, ideology, strength) {
    this.name = name;
    this.ideology = ideology;        // Scale: -100 (far left) to +100 (far right)
    this.strength = strength;        // Parliamentary seats/power
    this.unity = 80;                // Internal party unity (0-100)
    this.leadership = 75;           // Leadership approval within party
    
    this.factions = {
      hardliners: 0.2,            // Faction sizes within party
      moderates: 0.6,
      reformers: 0.2
    };
  }
  
  calculateLoyalty(playerActions, playerIdeology) {
    const ideologicalDistance = Math.abs(this.ideology - playerIdeology);
    const baseSupport = Math.max(0, 100 - ideologicalDistance);
    
    // Adjust for recent actions
    const actionAlignment = this.evaluateActions(playerActions);
    
    // Unity affects loyalty volatility
    const unityFactor = this.unity / 100;
    
    return baseSupport * unityFactor + actionAlignment * (1 - unityFactor);
  }
  
  processInternalDynamics(gameState) {
    // Leadership challenges
    if (this.leadership < 30 && Math.random() < 0.1) {
      this.triggerLeadershipChallenge(gameState);
    }
    
    // Faction rebellions
    for (const [factionName, size] of Object.entries(this.factions)) {
      if (this.evaluateFactionSatisfaction(factionName, gameState) < 20) {
        this.triggerFactionRebellion(factionName, size, gameState);
      }
    }
  }
}
```

#### Coalition Management
```javascript
const coalitionSystem = {
  currentCoalition: [],
  stability: 75,                  // Coalition stability (0-100)
  
  formCoalition(parties, policies) {
    const potentialPartners = this.findCompatibleParties(parties, policies);
    const coalitionOptions = this.generateCoalitionOptions(potentialPartners);
    
    return this.selectOptimalCoalition(coalitionOptions);
  },
  
  calculateStability(coalition, gameState) {
    let stability = 100;
    
    // Ideological compatibility
    const ideologicalSpread = this.calculateIdeologicalSpread(coalition);
    stability -= ideologicalSpread * 0.5;
    
    // Policy disagreements
    const policyConflicts = this.calculatePolicyConflicts(coalition, gameState.policies);
    stability -= policyConflicts * 0.3;
    
    // External pressures
    const externalPressure = this.calculateExternalPressure(gameState);
    stability -= externalPressure * 0.2;
    
    return Math.max(0, stability);
  },
  
  processCoalitionDynamics(gameState) {
    this.stability = this.calculateStability(this.currentCoalition, gameState);
    
    if (this.stability < 30) {
      this.triggerCoalitionCrisis(gameState);
    } else if (this.stability < 50) {
      this.applyStabilityPenalties(gameState);
    }
  }
};
```

### 3. Policy Implementation System

#### Policy Lifecycle
```javascript
class Policy {
  constructor(name, type, description, effects) {
    this.name = name;
    this.type = type;               // economic, social, foreign, etc.
    this.description = description;
    this.effects = effects;
    this.status = 'proposed';       // proposed, debated, voted, implemented, active
    this.support = {};              // Party support levels
    this.publicOpinion = 50;        // Public support (0-100)
    this.implementationProgress = 0; // Implementation completeness (0-100)
    this.politicalCost = 0;         // Political capital required
  }
  
  calculatePassingProbability(gameState) {
    const coalitionSupport = this.calculateCoalitionSupport(gameState.coalition);
    const oppositionResistance = this.calculateOppositionResistance(gameState.opposition);
    const publicPressure = this.publicOpinion > 60 ? 0.2 : this.publicOpinion < 40 ? -0.2 : 0;
    
    return Math.max(0, Math.min(1, coalitionSupport - oppositionResistance + publicPressure));
  }
  
  implement(gameState) {
    if (this.status !== 'voted' || this.implementationProgress >= 100) return;
    
    // Implementation speed depends on bureaucratic efficiency and complexity
    const implementationSpeed = gameState.government.efficiency * 
                               (1 / this.complexity) * 
                               gameState.coalition.stability / 100;
    
    this.implementationProgress += implementationSpeed * 5; // 5% per turn baseline
    
    if (this.implementationProgress >= 100) {
      this.status = 'active';
      this.applyEffects(gameState);
    }
  }
}
```

#### Parliamentary Voting System
```javascript
const parliamentarySystem = {
  seats: {
    governmentParty: 45,
    coalitionPartners: 15,
    opposition: 35,
    independents: 5
  },
  
  conductVote(policy, gameState) {
    const votes = {
      for: 0,
      against: 0,
      abstain: 0
    };
    
    // Government party voting
    const governmentUnity = gameState.playerParty.unity / 100;
    const governmentSupport = Math.floor(this.seats.governmentParty * governmentUnity);
    const governmentOpposition = this.seats.governmentParty - governmentSupport;
    
    votes.for += governmentSupport;
    votes.against += Math.floor(governmentOpposition * 0.7);
    votes.abstain += Math.ceil(governmentOpposition * 0.3);
    
    // Coalition partner voting
    for (const partner of gameState.coalition.partners) {
      const partnerSupport = partner.calculatePolicySupport(policy);
      const partnerVotes = Math.floor(partner.seats * partnerSupport / 100);
      votes.for += partnerVotes;
      votes.against += partner.seats - partnerVotes;
    }
    
    // Opposition voting
    const oppositionHostility = this.calculateOppositionHostility(policy, gameState);
    votes.against += Math.floor(this.seats.opposition * oppositionHostility / 100);
    
    // Independent voting (more unpredictable)
    const independentSupport = this.calculateIndependentSupport(policy, gameState);
    votes.for += Math.floor(this.seats.independents * independentSupport / 100);
    
    return {
      result: votes.for > votes.against ? 'passed' : 'failed',
      votes: votes,
      margin: Math.abs(votes.for - votes.against)
    };
  }
};
```

### 4. Election System

#### Election Mechanics
```javascript
class ElectionSystem {
  constructor() {
    this.electoralSystem = 'proportional'; // or 'majoritarian'
    this.termLength = 4;                   // Years
    this.nextElection = null;
  }
  
  calculateElectionResults(gameState) {
    const nationalPolling = this.calculateNationalPolling(gameState);
    const regionResults = this.calculateRegionalResults(nationalPolling, gameState);
    const seatDistribution = this.convertVotesToSeats(regionResults);
    
    return {
      votes: nationalPolling,
      regions: regionResults,
      seats: seatDistribution,
      turnout: this.calculateTurnout(gameState)
    };
  }
  
  calculateNationalPolling(gameState) {
    const polling = {};
    
    for (const party of gameState.parties) {
      // Base support from demographic approval
      let support = this.calculateDemographicSupport(party, gameState);
      
      // Adjust for campaign effects
      support *= party.campaignEffectiveness;
      
      // Adjust for leader popularity
      if (party === gameState.playerParty) {
        support *= (gameState.player.approval / 50); // 50 is neutral
      }
      
      // Add random variation (polling error)
      support += (Math.random() - 0.5) * 4; // ±2% random variation
      
      polling[party.name] = Math.max(0, support);
    }
    
    // Normalize to 100%
    const total = Object.values(polling).reduce((sum, val) => sum + val, 0);
    for (const party in polling) {
      polling[party] = (polling[party] / total) * 100;
    }
    
    return polling;
  }
  
  processCampaign(gameState, weeks) {
    for (let week = 0; week < weeks; week++) {
      // Campaign events
      this.processCampaignEvents(gameState);
      
      // Media coverage
      this.processMediaCoverage(gameState);
      
      // Debate effects
      if (week % 4 === 0) { // Monthly debates
        this.processDebate(gameState);
      }
      
      // Polling updates
      gameState.polling = this.calculateNationalPolling(gameState);
    }
  }
}
```

#### Campaign System
```javascript
const campaignSystem = {
  resources: {
    money: 0,
    volunteers: 0,
    endorsements: []
  },
  
  strategies: {
    aggressive: {
      approvalBoost: 0.15,
      riskFactor: 0.8,
      cost: 1.5
    },
    moderate: {
      approvalBoost: 0.08,
      riskFactor: 0.3,
      cost: 1.0
    },
    defensive: {
      approvalBoost: 0.03,
      riskFactor: 0.1,
      cost: 0.7
    }
  },
  
  conductCampaignWeek(strategy, gameState) {
    const strategyConfig = this.strategies[strategy];
    
    // Calculate campaign effectiveness
    const effectiveness = Math.min(1.0, 
      this.resources.money * 0.0001 +
      this.resources.volunteers * 0.001 +
      this.resources.endorsements.length * 0.05
    );
    
    // Apply strategy effects
    const approvalChange = strategyConfig.approvalBoost * effectiveness;
    gameState.player.approval += approvalChange;
    
    // Risk of negative events
    if (Math.random() < strategyConfig.riskFactor * 0.1) {
      this.triggerCampaignIncident(gameState);
    }
    
    // Consume resources
    this.resources.money -= strategyConfig.cost * 100000;
    this.resources.volunteers *= 0.95; // Volunteer fatigue
  }
};
```

### 5. Political Events

#### Crisis Management
```javascript
const politicalCrises = {
  noConfidenceVote: {
    triggers: ['approval < 25', 'coalitionStability < 20'],
    probability: 0.15,
    
    process(gameState) {
      const vote = parliamentarySystem.conductVote({
        type: 'noConfidence',
        threshold: 50
      }, gameState);
      
      if (vote.result === 'passed') {
        this.triggerGovernmentFall(gameState);
      } else {
        gameState.player.approval += 5; // Survived vote
      }
    }
  },
  
  cabinetReshuffle: {
    triggers: ['approval < 35', 'scandal.severity > 70'],
    probability: 0.08,
    
    process(gameState) {
      // Remove problematic ministers
      const reshuffleOptions = this.generateReshuffleOptions(gameState);
      const selectedOption = this.selectBestOption(reshuffleOptions);
      
      this.implementReshuffle(selectedOption, gameState);
    }
  },
  
  partyRebellion: {
    triggers: ['partyUnity < 40', 'ideologicalDistance > 30'],
    probability: 0.12,
    
    process(gameState) {
      const rebellionSize = Math.floor(gameState.playerParty.strength * 0.2);
      gameState.playerParty.strength -= rebellionSize;
      gameState.coalition.stability -= 15;
      gameState.player.approval -= 8;
    }
  }
};
```

### 6. Integration with Other Systems

#### Economic-Political Feedback
```javascript
function calculateEconomicPoliticalEffects(economyState, politicsState) {
  // Economic performance affects approval
  const economicApproval = 
    (economyState.gdpGrowth - 2.0) * 3 +
    (5.0 - economyState.unemployment) * 2 +
    (2.0 - economyState.inflation) * 1.5;
  
  politicsState.approval += economicApproval * 0.1; // Gradual effect
  
  // Political stability affects economic confidence
  const politicalConfidence = politicsState.approval / 100;
  economyState.investmentMultiplier = 0.8 + (politicalConfidence * 0.4);
  
  // Coalition instability creates policy uncertainty
  if (politicsState.coalitionStability < 50) {
    economyState.uncertaintyPenalty = (50 - politicsState.coalitionStability) * 0.001;
  }
}
```

#### Scandal-Political Interface
```javascript
function processScandalPoliticalImpact(scandal, gameState) {
  const approvalImpact = scandal.severity * scandal.playerInvolvement * 0.5;
  gameState.player.approval -= approvalImpact;
  
  // Opposition exploitation
  gameState.opposition.forEach(party => {
    party.strength += scandal.severity * 0.1;
  });
  
  // Coalition strain
  if (scandal.playerInvolvement > 0.7) {
    gameState.coalition.stability -= scandal.severity * 0.3;
  }
  
  // Media coverage amplification
  scandal.mediaAttention += gameState.player.approval < 40 ? 20 : 10;
}
```

## Implementation Examples

### Basic Political Update Loop
```javascript
class PoliticalSimulation {
  constructor(initialState) {
    this.state = initialState;
    this.electionSystem = new ElectionSystem();
  }
  
  update(deltaTime) {
    // Update approval ratings
    this.updateApprovalRatings();
    
    // Process party dynamics
    this.updatePartyDynamics();
    
    // Handle coalition management
    this.updateCoalitionDynamics();
    
    // Process pending policies
    this.updatePolicyImplementation();
    
    // Check for political events
    this.checkPoliticalEvents();
    
    // Update election timeline
    this.updateElectionTimeline();
  }
  
  updateApprovalRatings() {
    const newApproval = approvalSystem.calculateApproval(this.state);
    
    // Smooth approval changes (momentum)
    const momentum = 0.8;
    this.state.player.approval = 
      this.state.player.approval * momentum + 
      newApproval * (1 - momentum);
  }
}
```

## Testing Strategy

### Unit Tests
- Test approval calculation algorithms
- Verify voting mechanics
- Test coalition stability calculations
- Validate election result calculations

### Integration Tests
- Test political-economic interactions
- Verify scandal-political effects
- Test campaign system mechanics
- Validate policy implementation lifecycle

### Scenario Tests
- Test election scenarios
- Crisis management scenarios
- Coalition formation scenarios
- Policy passage scenarios

This political simulation module provides realistic political dynamics that respond meaningfully to player actions while creating engaging political challenges and strategic depth.