# Scandal Simulation Module

## Overview

The Scandal Simulation module manages the generation, development, and resolution of political scandals that can significantly impact the player's political career. It models media dynamics, public opinion shifts, investigation processes, and crisis management responses, creating realistic and challenging scenarios for players to navigate.

## Core Components

### 1. Scandal Generation System

#### Scandal Types and Categories
```javascript
const scandalTypes = {
  corruption: {
    baseSeverity: 70,
    categories: {
      bribery: {
        probability: 0.15,
        evidenceRequired: 0.8,
        legalConsequences: 0.9,
        publicImpact: 0.8
      },
      embezzlement: {
        probability: 0.10,
        evidenceRequired: 0.9,
        legalConsequences: 0.95,
        publicImpact: 0.85
      },
      contractFraud: {
        probability: 0.20,
        evidenceRequired: 0.7,
        legalConsequences: 0.7,
        publicImpact: 0.6
      },
      insider: {
        probability: 0.12,
        evidenceRequired: 0.85,
        legalConsequences: 0.8,
        publicImpact: 0.7
      }
    }
  },
  
  personal: {
    baseSeverity: 45,
    categories: {
      affair: {
        probability: 0.08,
        evidenceRequired: 0.6,
        legalConsequences: 0.1,
        publicImpact: 0.7
      },
      familyIssues: {
        probability: 0.05,
        evidenceRequired: 0.4,
        legalConsequences: 0.2,
        publicImpact: 0.5
      },
      substanceAbuse: {
        probability: 0.03,
        evidenceRequired: 0.7,
        legalConsequences: 0.3,
        publicImpact: 0.8
      },
      financialImpropriety: {
        probability: 0.10,
        evidenceRequired: 0.8,
        legalConsequences: 0.6,
        publicImpact: 0.75
      }
    }
  },
  
  administrative: {
    baseSeverity: 35,
    categories: {
      coverUp: {
        probability: 0.25,
        evidenceRequired: 0.65,
        legalConsequences: 0.5,
        publicImpact: 0.6
      },
      incompetence: {
        probability: 0.30,
        evidenceRequired: 0.5,
        legalConsequences: 0.1,
        publicImpact: 0.4
      },
      breach: {
        probability: 0.15,
        evidenceRequired: 0.8,
        legalConsequences: 0.7,
        publicImpact: 0.7
      },
      mismanagement: {
        probability: 0.20,
        evidenceRequired: 0.6,
        legalConsequences: 0.3,
        publicImpact: 0.5
      }
    }
  }
};
```

#### Scandal Generation Logic
```javascript
class ScandalGenerator {
  constructor() {
    this.riskFactors = {
      approvalRating: weight => Math.max(0, (50 - weight) / 50), // Higher risk when approval low
      timeInOffice: months => Math.min(1, months / 48),          // Risk increases over time
      policyControversy: level => level / 100,                   // Controversial policies increase risk
      mediaRelations: quality => Math.max(0, (50 - quality) / 50), // Poor media relations increase risk
      economicPerformance: performance => Math.max(0, (50 - performance) / 50)
    };
  }
  
  calculateScandalProbability(gameState) {
    let baseProbability = 0.02; // 2% per month baseline
    
    // Apply risk factors
    for (const [factor, calculator] of Object.entries(this.riskFactors)) {
      const value = this.getRiskFactorValue(gameState, factor);
      const riskMultiplier = calculator(value);
      baseProbability *= (1 + riskMultiplier);
    }
    
    // Cap maximum probability
    return Math.min(0.15, baseProbability); // Max 15% per month
  }
  
  generateScandal(gameState) {
    const probability = this.calculateScandalProbability(gameState);
    
    if (Math.random() > probability) return null;
    
    // Select scandal type based on current conditions
    const scandalType = this.selectScandalType(gameState);
    const scandalCategory = this.selectScandalCategory(scandalType, gameState);
    
    return new Scandal(scandalType, scandalCategory, gameState);
  }
  
  selectScandalType(gameState) {
    const weights = {
      corruption: gameState.government.transparency < 50 ? 0.4 : 0.2,
      personal: gameState.player.personalStability < 70 ? 0.3 : 0.15,
      administrative: gameState.government.efficiency < 60 ? 0.5 : 0.25
    };
    
    return this.weightedRandomSelect(weights);
  }
}
```

### 2. Scandal Lifecycle Management

#### Scandal Class Definition
```javascript
class Scandal {
  constructor(type, category, gameState) {
    this.id = this.generateId();
    this.type = type;
    this.category = category;
    this.severity = this.calculateInitialSeverity(type, category, gameState);
    this.playerInvolvement = this.calculatePlayerInvolvement(gameState);
    
    // Investigation state
    this.investigation = {
      active: false,
      progress: 0,
      evidence: 0,
      investigators: [],
      timeRemaining: 0
    };
    
    // Media state
    this.media = {
      attention: 0,
      coverage: 'none', // none, minor, major, breaking
      bias: 0,          // -100 (hostile) to +100 (supportive)
      momentum: 0       // Story momentum
    };
    
    // Public response
    this.public = {
      awareness: 0,     // 0-100% public awareness
      concern: 0,       // 0-100% public concern level
      calls: []         // Calls for action (resignation, investigation, etc.)
    };
    
    // Political response
    this.political = {
      opposition: 0,    // Opposition party response intensity
      coalition: 0,     // Coalition partner concern
      international: 0  // International attention
    };
    
    this.status = 'emerging';  // emerging, developing, peak, declining, resolved
    this.resolution = null;    // How the scandal was resolved
    this.daysActive = 0;
  }
  
  calculateInitialSeverity(type, category, gameState) {
    const baseConfig = scandalTypes[type];
    const categoryConfig = baseConfig.categories[category];
    
    let severity = baseConfig.baseSeverity;
    
    // Adjust based on player's vulnerability
    severity *= (1 + this.getPlayerVulnerability(gameState, type, category));
    
    // Add randomness
    severity += (Math.random() - 0.5) * 20;
    
    return Math.max(10, Math.min(100, severity));
  }
  
  update(gameState, deltaTime) {
    this.daysActive += deltaTime;
    
    // Natural decay over time
    this.applyNaturalDecay();
    
    // Media cycle progression
    this.updateMediaCycle(gameState);
    
    // Investigation progression
    if (this.investigation.active) {
      this.updateInvestigation(gameState);
    }
    
    // Public opinion evolution
    this.updatePublicResponse(gameState);
    
    // Political response updates
    this.updatePoliticalResponse(gameState);
    
    // Determine current status
    this.updateStatus();
    
    // Check for auto-resolution
    this.checkAutoResolution(gameState);
  }
}
```

### 3. Media Dynamics System

#### Media Outlet Modeling
```javascript
const mediaOutlets = {
  mainstream: {
    outlets: [
      {
        name: "National Times",
        reach: 0.4,           // 40% of population
        bias: -10,            // Slightly left-leaning
        credibility: 85,      // High credibility
        scandalThreshold: 30  // Will cover scandals above this severity
      },
      {
        name: "Daily Chronicle", 
        reach: 0.35,
        bias: 15,             // Slightly right-leaning
        credibility: 80,
        scandalThreshold: 25
      },
      {
        name: "Public Broadcasting",
        reach: 0.25,
        bias: 0,              // Neutral
        credibility: 90,
        scandalThreshold: 40  // More conservative coverage
      }
    ]
  },
  
  tabloid: {
    outlets: [
      {
        name: "The Gossip",
        reach: 0.3,
        bias: 0,              // Sensationalist, not ideological
        credibility: 40,
        scandalThreshold: 15  // Will cover anything
      },
      {
        name: "Celebrity Watch",
        reach: 0.2,
        bias: 0,
        credibility: 30,
        scandalThreshold: 10
      }
    ]
  },
  
  social: {
    platforms: [
      {
        name: "SocialShare",
        reach: 0.7,           // High reach but fragmented
        bias: 0,              // Varies by user
        credibility: 20,      // Low overall credibility
        amplification: 2.5,   // High amplification factor
        scandalThreshold: 5   // Anything gets shared
      }
    ]
  }
};
```

#### Media Coverage Calculation
```javascript
class MediaSystem {
  calculateCoverage(scandal, gameState) {
    let totalCoverage = 0;
    const coverageByOutlet = {};
    
    // Mainstream media
    for (const outlet of mediaOutlets.mainstream.outlets) {
      const coverage = this.calculateOutletCoverage(outlet, scandal, gameState);
      coverageByOutlet[outlet.name] = coverage;
      totalCoverage += coverage * outlet.reach * (outlet.credibility / 100);
    }
    
    // Tabloid coverage (more sensational)
    for (const outlet of mediaOutlets.tabloid.outlets) {
      const coverage = this.calculateOutletCoverage(outlet, scandal, gameState) * 1.5;
      coverageByOutlet[outlet.name] = coverage;
      totalCoverage += coverage * outlet.reach * (outlet.credibility / 100);
    }
    
    // Social media amplification
    for (const platform of mediaOutlets.social.platforms) {
      const coverage = this.calculateSocialCoverage(platform, scandal, gameState);
      coverageByOutlet[platform.name] = coverage;
      totalCoverage += coverage * platform.reach * platform.amplification;
    }
    
    return {
      total: Math.min(100, totalCoverage),
      breakdown: coverageByOutlet
    };
  }
  
  calculateOutletCoverage(outlet, scandal, gameState) {
    if (scandal.severity < outlet.scandalThreshold) return 0;
    
    let coverage = scandal.severity - outlet.scandalThreshold;
    
    // Bias adjustment
    const politicalAlignment = this.calculatePoliticalAlignment(outlet.bias, gameState.player.ideology);
    coverage *= (1 + politicalAlignment * 0.3);
    
    // Relationship with player affects coverage
    const playerRelation = gameState.player.mediaRelations[outlet.name] || 50;
    coverage *= (1 + (50 - playerRelation) / 100);
    
    // News cycle saturation
    const saturation = this.calculateNewsCycleSaturation(gameState);
    coverage *= (1 - saturation * 0.5);
    
    return Math.max(0, Math.min(100, coverage));
  }
}
```

### 4. Investigation System

#### Investigation Mechanics
```javascript
class Investigation {
  constructor(scandal, triggerType) {
    this.scandal = scandal;
    this.triggerType = triggerType; // media, opposition, legal, internal
    this.investigators = this.assignInvestigators(triggerType);
    this.progress = 0;
    this.evidence = {
      collected: 0,
      quality: 0,
      admissible: 0
    };
    this.duration = this.calculateDuration(scandal);
    this.status = 'ongoing'; // ongoing, concluded, terminated
  }
  
  update(gameState, deltaTime) {
    if (this.status !== 'ongoing') return;
    
    // Investigation progress
    const progressRate = this.calculateProgressRate(gameState);
    this.progress += progressRate * deltaTime;
    
    // Evidence gathering
    this.gatherEvidence(gameState, deltaTime);
    
    // Check for interference or obstruction
    this.checkInterference(gameState);
    
    // Determine if investigation should conclude
    if (this.progress >= 100 || this.daysElapsed >= this.duration) {
      this.conclude(gameState);
    }
  }
  
  calculateProgressRate(gameState) {
    let baseRate = 2; // 2% per day baseline
    
    // Investigator quality affects rate
    baseRate *= this.investigators.reduce((avg, inv) => avg + inv.competence, 0) / this.investigators.length / 100;
    
    // Government cooperation
    const cooperation = gameState.government.transparency / 100;
    baseRate *= (0.5 + cooperation * 0.5);
    
    // Resource availability
    const resources = this.getInvestigationResources(gameState);
    baseRate *= (0.7 + resources * 0.3);
    
    // Public pressure
    const publicPressure = this.scandal.public.concern / 100;
    baseRate *= (0.8 + publicPressure * 0.4);
    
    return baseRate;
  }
  
  gatherEvidence(gameState, deltaTime) {
    const evidenceGatheringRate = this.calculateEvidenceRate(gameState);
    const newEvidence = evidenceGatheringRate * deltaTime;
    
    this.evidence.collected += newEvidence;
    
    // Evidence quality depends on investigator skill and cooperation
    const qualityFactor = this.calculateEvidenceQuality(gameState);
    this.evidence.quality += newEvidence * qualityFactor;
    
    // Legal admissibility
    const admissibilityFactor = this.calculateAdmissibility(gameState);
    this.evidence.admissible += newEvidence * admissibilityFactor;
  }
}
```

### 5. Crisis Management System

#### Response Strategies
```javascript
const crisisManagementStrategies = {
  denial: {
    immediateEffect: {
      mediaAttention: -10,
      publicConcern: -5,
      politicalCost: 5
    },
    riskFactors: {
      evidenceDiscovery: 2.0,    // Doubles evidence impact if found
      credibilityDamage: 1.5     // Increases credibility damage
    },
    effectiveness: involvement => Math.max(0, 100 - involvement * 150) // Less effective with high involvement
  },
  
  admission: {
    immediateEffect: {
      mediaAttention: 20,
      publicConcern: 15,
      politicalCost: 25
    },
    longTermEffect: {
      credibilityRecovery: 0.3,  // Helps long-term credibility
      mediaRelations: 10         // Improves media relations
    },
    effectiveness: involvement => 50 + involvement * 30 // More effective with high involvement
  },
  
  deflection: {
    immediateEffect: {
      mediaAttention: 0,
      publicConcern: -8,
      politicalCost: 10
    },
    requirements: {
      charisma: 70,              // Requires high charisma
      mediaRelations: 60         // Good media relations needed
    },
    effectiveness: charisma => Math.min(80, charisma) // Capped by charisma
  },
  
  scapegoating: {
    immediateEffect: {
      mediaAttention: -15,
      publicConcern: -20,
      politicalCost: 15
    },
    sideEffects: {
      partyLoyalty: -10,         // Reduces party loyalty
      staffMorale: -15,          // Damages staff morale
      futureLoyalty: -5          // Long-term loyalty impact
    },
    effectiveness: 70
  },
  
  investigation: {
    immediateEffect: {
      mediaAttention: 10,
      publicConcern: -5,
      politicalCost: 20
    },
    longTermEffect: {
      transparency: 5,           // Improves transparency reputation
      controlNarrative: 0.3      // Helps control narrative
    },
    duration: 60,                // 60 days average
    effectiveness: 60
  }
};
```

#### Crisis Response Implementation
```javascript
class CrisisManager {
  executeStrategy(strategy, scandal, gameState) {
    const strategyConfig = crisisManagementStrategies[strategy];
    
    // Check requirements
    if (!this.meetsRequirements(strategyConfig, gameState)) {
      return { success: false, reason: 'Requirements not met' };
    }
    
    // Calculate effectiveness
    const effectiveness = this.calculateEffectiveness(strategyConfig, scandal, gameState);
    
    // Apply immediate effects
    this.applyImmediateEffects(strategyConfig, scandal, gameState, effectiveness);
    
    // Schedule long-term effects
    if (strategyConfig.longTermEffect) {
      this.scheduleLongTermEffects(strategyConfig, scandal, gameState);
    }
    
    // Apply side effects
    if (strategyConfig.sideEffects) {
      this.applySideEffects(strategyConfig, gameState);
    }
    
    return { 
      success: true, 
      effectiveness: effectiveness,
      strategy: strategy
    };
  }
  
  calculateEffectiveness(strategyConfig, scandal, gameState) {
    let baseEffectiveness = strategyConfig.effectiveness;
    
    // If effectiveness is a function, call it
    if (typeof baseEffectiveness === 'function') {
      baseEffectiveness = baseEffectiveness(scandal.playerInvolvement);
    }
    
    // Adjust for timing
    const timingMultiplier = this.calculateTimingMultiplier(scandal);
    baseEffectiveness *= timingMultiplier;
    
    // Adjust for credibility
    const credibilityMultiplier = gameState.player.credibility / 100;
    baseEffectiveness *= (0.5 + credibilityMultiplier * 0.5);
    
    // Random variation
    baseEffectiveness += (Math.random() - 0.5) * 20;
    
    return Math.max(10, Math.min(100, baseEffectiveness));
  }
}
```

### 6. Public Opinion Dynamics

#### Public Response Modeling
```javascript
class PublicOpinion {
  updateScandalResponse(scandal, gameState, deltaTime) {
    // Awareness spread
    this.updateAwareness(scandal, gameState, deltaTime);
    
    // Concern level changes
    this.updateConcern(scandal, gameState, deltaTime);
    
    // Calls for action
    this.updateCallsForAction(scandal, gameState);
    
    // Demographic variations
    this.updateDemographicResponses(scandal, gameState);
  }
  
  updateAwareness(scandal, gameState, deltaTime) {
    const currentAwareness = scandal.public.awareness;
    const maxAwareness = this.calculateMaxAwareness(scandal, gameState);
    
    // Media drives awareness
    const mediaEffect = scandal.media.attention * 0.1;
    
    // Social spread
    const socialSpread = currentAwareness * 0.02 * (1 - currentAwareness / 100);
    
    // Natural saturation
    const saturationEffect = Math.max(0, maxAwareness - currentAwareness) * 0.05;
    
    const awarenessIncrease = (mediaEffect + socialSpread + saturationEffect) * deltaTime;
    scandal.public.awareness = Math.min(maxAwareness, currentAwareness + awarenessIncrease);
  }
  
  updateConcern(scandal, gameState, deltaTime) {
    const awareness = scandal.public.awareness;
    const severity = scandal.severity;
    const playerInvolvement = scandal.playerInvolvement;
    
    // Base concern based on severity and involvement
    const baseConcern = severity * playerInvolvement;
    
    // Adjust for player's credibility
    const credibilityFactor = 1 - (gameState.player.credibility / 200);
    
    // Economic conditions affect concern threshold
    const economicFactor = gameState.economy.approval < 50 ? 1.2 : 0.9;
    
    // Target concern level
    const targetConcern = baseConcern * credibilityFactor * economicFactor;
    
    // Gradual adjustment
    const concernChange = (targetConcern - scandal.public.concern) * 0.1 * deltaTime;
    scandal.public.concern = Math.max(0, Math.min(100, scandal.public.concern + concernChange));
  }
  
  calculateDemographicResponse(scandal, demographic, gameState) {
    const baseResponse = scandal.public.concern;
    
    // Demographic-specific modifiers
    const modifiers = {
      young: {
        corruption: 1.3,      // More concerned about corruption
        personal: 0.7,        // Less concerned about personal scandals
        administrative: 1.1
      },
      middleAged: {
        corruption: 1.2,
        personal: 1.0,
        administrative: 1.3   // More concerned about competence
      },
      elderly: {
        corruption: 1.1,
        personal: 1.4,        // More concerned about moral issues
        administrative: 1.0
      }
    };
    
    const modifier = modifiers[demographic][scandal.type] || 1.0;
    return baseResponse * modifier;
  }
}
```

### 7. Integration with Other Systems

#### Political Impact Integration
```javascript
function applyScandalPoliticalEffects(scandal, gameState) {
  // Approval rating impact
  const approvalImpact = scandal.severity * scandal.playerInvolvement * 0.3;
  gameState.player.approval -= approvalImpact;
  
  // Coalition stability impact
  if (scandal.severity > 60) {
    const stabilityImpact = (scandal.severity - 60) * 0.5;
    gameState.coalition.stability -= stabilityImpact;
  }
  
  // Opposition opportunity
  gameState.opposition.forEach(party => {
    party.attackOpportunity += scandal.severity * 0.1;
  });
  
  // Media relationship impact
  const mediaImpact = scandal.media.coverage === 'hostile' ? -5 : -2;
  gameState.player.mediaRelations.overall += mediaImpact;
}
```

#### Economic Consequences
```javascript
function applyScandalEconomicEffects(scandal, gameState) {
  // Investor confidence
  if (scandal.type === 'corruption' && scandal.severity > 70) {
    gameState.economy.investorConfidence -= scandal.severity * 0.2;
  }
  
  // Currency impact for major scandals
  if (scandal.severity > 80) {
    gameState.economy.currencyStability -= scandal.severity * 0.1;
  }
  
  // International trade relationships
  if (scandal.political.international > 50) {
    gameState.global.tradeRelations.overall -= scandal.severity * 0.05;
  }
}
```

## Testing Strategy

### Unit Tests
- Scandal generation probability calculations
- Media coverage algorithms
- Investigation progress mechanics
- Crisis response effectiveness

### Integration Tests
- Scandal-political system interactions
- Media-public opinion feedback loops
- Investigation-legal system integration
- Crisis management impact validation

### Scenario Tests
- Various scandal types and responses
- Media bias impact testing
- Long-term reputation recovery
- Crisis escalation scenarios

This scandal simulation module provides dynamic, realistic crisis scenarios that challenge players' political management skills while offering meaningful strategic choices in crisis response and reputation management.