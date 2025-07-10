# Global Simulation Module

## Overview

The Global Simulation module models international relations, global economic trends, international crises, and diplomatic dynamics that affect the player's country. It creates realistic global context and challenges that require strategic international engagement while balancing domestic priorities.

## Core Components

### 1. International Relations System

#### Country Relationship Modeling
```javascript
class CountryRelationship {
  constructor(countryA, countryB) {
    this.countries = [countryA, countryB];
    this.relationship = 50;        // 0-100 scale (0=hostile, 50=neutral, 100=allied)
    this.tradeLevel = 0.0;         // Trade volume as % of GDP
    this.diplomaticLevel = 'normal'; // none, limited, normal, extensive, alliance
    
    this.factors = {
      historical: 0,             // Historical relationship baseline
      ideological: 0,            // Ideological alignment (-50 to +50)
      economic: 0,               // Economic complementarity
      security: 0,               // Security interests alignment
      cultural: 0,               // Cultural/linguistic ties
      territorial: 0             // Territorial disputes (-50 to 0)
    };
    
    this.recentEvents = [];        // Recent diplomatic events affecting relationship
    this.treaties = [];            // Active treaties and agreements
    this.disputes = [];            // Active disputes or tensions
  }
  
  calculateRelationship() {
    let baseRelationship = 50; // Neutral starting point
    
    // Apply all factors
    for (const [factor, value] of Object.entries(this.factors)) {
      baseRelationship += value;
    }
    
    // Recent events decay over time
    const recentEventEffect = this.calculateRecentEventEffect();
    baseRelationship += recentEventEffect;
    
    // Treaty effects
    const treatyEffect = this.calculateTreatyEffect();
    baseRelationship += treatyEffect;
    
    // Clamp to valid range
    this.relationship = Math.max(0, Math.min(100, baseRelationship));
    return this.relationship;
  }
  
  update(deltaTime) {
    // Decay recent events
    this.decayRecentEvents(deltaTime);
    
    // Update relationship based on current factors
    this.calculateRelationship();
    
    // Update trade levels based on relationship
    this.updateTradeLevel();
    
    // Check for automatic diplomatic level changes
    this.updateDiplomaticLevel();
  }
}
```

#### Global Powers System
```javascript
const globalPowers = {
  superpowers: [
    {
      name: "United Federation",
      gdp: 25000000,              // $25 trillion
      militaryStrength: 95,
      diplomaticInfluence: 90,
      economicInfluence: 85,
      ideology: 15,               // Center-right
      regions: ["North America", "Pacific"],
      specialAbilities: ["global_projection", "currency_dominance"]
    },
    {
      name: "Eastern Empire", 
      gdp: 18000000,              // $18 trillion
      militaryStrength: 85,
      diplomaticInfluence: 75,
      economicInfluence: 80,
      ideology: -20,              // Authoritarian
      regions: ["East Asia", "Central Asia"],
      specialAbilities: ["manufacturing_hub", "infrastructure_investment"]
    }
  ],
  
  regionalPowers: [
    {
      name: "European Federation",
      gdp: 20000000,
      militaryStrength: 70,
      diplomaticInfluence: 85,
      economicInfluence: 75,
      ideology: -5,               // Center-left
      regions: ["Europe"],
      specialAbilities: ["diplomatic_mediation", "trade_integration"]
    },
    {
      name: "Southern Union",
      gdp: 3500000,
      militaryStrength: 60,
      diplomaticInfluence: 45,
      economicInfluence: 40,
      ideology: 10,
      regions: ["South America"],
      specialAbilities: ["resource_wealth", "regional_leadership"]
    }
  ],
  
  calculateInfluence(country, region) {
    let influence = 0;
    
    // Base influence from GDP
    influence += Math.log(country.gdp) * 5;
    
    // Regional proximity bonus
    if (country.regions.includes(region)) {
      influence *= 2;
    }
    
    // Military projection capability
    influence += country.militaryStrength * 0.3;
    
    // Diplomatic relations in region
    influence += country.diplomaticInfluence * 0.4;
    
    return influence;
  }
};
```

### 2. Global Trade System

#### Trade Relationship Modeling
```javascript
class TradeRelationship {
  constructor(exporter, importer, commodityType) {
    this.exporter = exporter;
    this.importer = importer;
    this.commodityType = commodityType;
    this.volume = 0;               // Trade volume in billions
    this.price = 0;                // Current price
    this.terms = {
      tariffs: 0,                  // Tariff rate (%)
      quotas: null,                // Import quotas
      sanctions: false,            // Active sanctions
      preferential: false          // Preferential trade status
    };
    
    this.dependencies = {
      exporterDependency: 0,       // % of exporter's economy
      importerDependency: 0        // % of importer's economy
    };
  }
  
  calculateTradeFlow(globalConditions) {
    let baseFlow = this.calculateBaseFlow();
    
    // Apply tariffs
    baseFlow *= (1 - this.terms.tariffs / 100);
    
    // Apply sanctions
    if (this.terms.sanctions) {
      baseFlow *= 0.1; // 90% reduction
    }
    
    // Global economic conditions
    baseFlow *= globalConditions.economicGrowth;
    
    // Transport costs and logistics
    const distance = this.calculateDistance();
    const transportCost = this.calculateTransportCost(distance, globalConditions);
    baseFlow *= (1 - transportCost);
    
    return Math.max(0, baseFlow);
  }
}
```

#### Global Supply Chains
```javascript
const globalSupplyChains = {
  energy: {
    producers: [
      { country: "Petrol States", production: 15000, reserves: 300000 },
      { country: "Gas Republic", production: 12000, reserves: 250000 },
      { country: "Coal Nations", production: 8000, reserves: 180000 }
    ],
    consumers: [
      { country: "Industrial Powers", consumption: 20000 },
      { country: "Developing Nations", consumption: 15000 }
    ],
    priceVolatility: 0.3,
    strategicImportance: 0.9
  },
  
  technology: {
    producers: [
      { country: "Tech Hub", production: 5000, innovation: 95 },
      { country: "Manufacturing Center", production: 8000, innovation: 60 }
    ],
    consumers: [
      { country: "Global Market", consumption: 13000 }
    ],
    priceVolatility: 0.2,
    strategicImportance: 0.8
  },
  
  agriculture: {
    producers: [
      { country: "Breadbasket", production: 300, landArea: 50000 },
      { country: "Tropical Farms", production: 200, landArea: 30000 }
    ],
    consumers: [
      { country: "Food Importers", consumption: 400 }
    ],
    priceVolatility: 0.4,
    strategicImportance: 0.7,
    weatherSensitivity: 0.8
  },
  
  calculateGlobalPrices(commodity, supplyShocks, demandShocks) {
    const basePrice = this.getBasePrice(commodity);
    let currentPrice = basePrice;
    
    // Supply shock effects
    supplyShocks.forEach(shock => {
      currentPrice *= (1 + shock.magnitude * this[commodity].priceVolatility);
    });
    
    // Demand shock effects  
    demandShocks.forEach(shock => {
      currentPrice *= (1 + shock.magnitude * 0.5);
    });
    
    // Strategic importance affects price stability
    const stabilityFactor = 1 - this[commodity].strategicImportance * 0.3;
    currentPrice += (Math.random() - 0.5) * basePrice * stabilityFactor;
    
    return Math.max(basePrice * 0.2, currentPrice);
  }
};
```

### 3. International Crisis System

#### Crisis Types and Mechanics
```javascript
const internationalCrises = {
  military: {
    regionalConflict: {
      probability: 0.08,          // 8% per year
      duration: [6, 36],          // 6-36 months
      severity: [40, 90],
      
      effects: {
        global: {
          economicUncertainty: 0.3,
          energyPrices: 0.2,
          refugeeFlows: 0.4
        },
        regional: {
          tradeDisruption: 0.6,
          securityConcerns: 0.8,
          diplomaticPolarization: 0.5
        }
      },
      
      playerOptions: [
        'diplomatic_mediation',
        'economic_sanctions', 
        'humanitarian_aid',
        'military_support',
        'neutrality'
      ]
    },
    
    terroristAttack: {
      probability: 0.15,
      duration: [1, 6],             // Immediate but lasting effects
      severity: [20, 80],
      
      effects: {
        global: {
          securityMeasures: 0.4,
          travelRestrictions: 0.3,
          economicConfidence: -0.2
        }
      },
      
      playerOptions: [
        'security_cooperation',
        'counter_terrorism',
        'diplomatic_isolation',
        'intelligence_sharing'
      ]
    }
  },
  
  economic: {
    globalRecession: {
      probability: 0.12,
      duration: [12, 24],
      severity: [50, 95],
      
      effects: {
        global: {
          gdpGrowth: -0.4,
          unemployment: 0.3,
          tradeVolume: -0.3,
          commodityPrices: -0.2
        }
      },
      
      playerOptions: [
        'fiscal_stimulus',
        'monetary_policy',
        'trade_protection',
        'international_cooperation'
      ]
    },
    
    currencyCrisis: {
      probability: 0.06,
      duration: [3, 18],
      severity: [30, 70],
      
      effects: {
        regional: {
          currencyStability: -0.5,
          capitalFlows: -0.4,
          inflationPressure: 0.3
        }
      }
    }
  },
  
  environmental: {
    climateDisaster: {
      probability: 0.20,           // Increasing frequency
      duration: [1, 12],
      severity: [30, 95],
      
      effects: {
        global: {
          agricultureOutput: -0.3,
          energyPrices: 0.2,
          migrationPressure: 0.4,
          climateAction: 0.3
        },
        affected: {
          gdpImpact: -0.6,
          infrastructureDamage: 0.8,
          humanitarianNeed: 0.9
        }
      },
      
      playerOptions: [
        'humanitarian_aid',
        'climate_funding',
        'technology_transfer',
        'refugee_acceptance',
        'international_coordination'
      ]
    }
  },
  
  health: {
    pandemic: {
      probability: 0.02,           // Rare but severe
      duration: [12, 48],
      severity: [60, 100],
      
      effects: {
        global: {
          economicActivity: -0.5,
          travelRestrictions: 0.9,
          healthcareStrain: 0.8,
          socialUnrest: 0.3,
          scientificCooperation: 0.4
        }
      },
      
      playerOptions: [
        'border_closure',
        'international_cooperation',
        'vaccine_diplomacy',
        'economic_support',
        'health_assistance'
      ]
    }
  }
};
```

#### Crisis Management System
```javascript
class InternationalCrisis {
  constructor(type, category, affectedRegions) {
    this.type = type;
    this.category = category;
    this.affectedRegions = affectedRegions;
    this.severity = this.generateSeverity();
    this.duration = this.generateDuration();
    this.daysElapsed = 0;
    this.status = 'emerging';      // emerging, escalating, peak, declining, resolved
    
    this.globalEffects = {};
    this.regionalEffects = {};
    this.countryResponses = new Map();
    this.playerResponse = null;
    
    this.escalationFactors = [];
    this.resolutionFactors = [];
  }
  
  update(gameState, deltaTime) {
    this.daysElapsed += deltaTime;
    
    // Update crisis status based on elapsed time
    this.updateStatus();
    
    // Process escalation factors
    this.processEscalation(gameState);
    
    // Apply ongoing effects
    this.applyEffects(gameState);
    
    // Update international responses
    this.updateInternationalResponses(gameState);
    
    // Check for resolution
    this.checkResolution(gameState);
  }
  
  processPlayerResponse(response, gameState) {
    this.playerResponse = response;
    const config = internationalCrises[this.type][this.category];
    
    // Calculate response effectiveness
    const effectiveness = this.calculateResponseEffectiveness(response, gameState);
    
    // Apply diplomatic consequences
    this.applyDiplomaticConsequences(response, effectiveness, gameState);
    
    // Apply domestic political effects
    this.applyDomesticEffects(response, effectiveness, gameState);
    
    // Modify crisis trajectory
    this.modifyCrisisTrajectory(response, effectiveness);
    
    return {
      effectiveness: effectiveness,
      diplomaticImpact: this.calculateDiplomaticImpact(response),
      domesticImpact: this.calculateDomesticImpact(response),
      crisisImpact: this.calculateCrisisImpact(response, effectiveness)
    };
  }
}
```

### 4. Diplomatic Actions System

#### Diplomatic Initiatives
```javascript
const diplomaticActions = {
  bilateral: {
    stateVisit: {
      cost: 50,                   // Political capital cost
      duration: 7,                // Days
      relationshipBonus: [5, 15], // Relationship improvement range
      requirements: {
        relationship: 30,         // Minimum relationship level
        domesticApproval: 40
      },
      risks: ['protocol_incident', 'domestic_criticism', 'international_incident']
    },
    
    tradeAgreement: {
      cost: 100,
      duration: 180,              // Negotiation period
      economicBonus: [0.02, 0.08], // GDP boost range
      requirements: {
        relationship: 50,
        economicAlignment: 0.3
      },
      domesticEffects: {
        businessApproval: 10,
        laborConcern: -5
      }
    },
    
    securityPact: {
      cost: 150,
      duration: 90,
      securityBonus: 0.2,
      requirements: {
        relationship: 70,
        ideologicalAlignment: 0.5
      },
      obligations: ['mutual_defense', 'intelligence_sharing', 'joint_exercises']
    }
  },
  
  multilateral: {
    summitHosting: {
      cost: 200,
      participants: [5, 20],
      prestigeBonus: [10, 30],
      requirements: {
        diplomaticSkill: 70,
        economicStrength: 60
      },
      outcomes: ['joint_declaration', 'new_initiative', 'framework_agreement']
    },
    
    internationalInitiative: {
      cost: 300,
      duration: 365,
      globalInfluenceBonus: [0.1, 0.3],
      requirements: {
        globalStanding: 60,
        resourceCommitment: 0.01  // % of GDP
      },
      types: ['climate_action', 'poverty_reduction', 'peace_building', 'technology_cooperation']
    }
  },
  
  sanctions: {
    economicSanctions: {
      cost: 75,
      targetTypes: ['individual', 'sector', 'comprehensive'],
      effectiveness: [0.1, 0.8],   // Depends on international support
      
      calculateEffectiveness(target, internationalSupport, economicLinkage) {
        let effectiveness = 0.3;   // Base effectiveness
        
        // International support multiplier
        effectiveness *= (0.5 + internationalSupport * 0.5);
        
        // Economic linkage factor
        effectiveness *= economicLinkage;
        
        // Target vulnerability
        const vulnerability = this.calculateTargetVulnerability(target);
        effectiveness *= vulnerability;
        
        return Math.min(0.9, effectiveness);
      },
      
      blowbackEffects: {
        domesticEconomic: 0.1,    // Economic cost to sanctioning country
        diplomaticCost: 0.2       // Relationship cost with target
      }
    }
  }
};
```

### 5. Global Events Generator

#### Random Global Events
```javascript
class GlobalEventGenerator {
  constructor() {
    this.eventProbabilities = {
      natural_disaster: 0.15,
      terrorist_attack: 0.08,
      technological_breakthrough: 0.05,
      commodity_shock: 0.12,
      political_upheaval: 0.10,
      cyber_attack: 0.06,
      space_event: 0.02
    };
    
    this.activeEvents = [];
    this.eventHistory = [];
  }
  
  generateEvents(gameState, deltaTime) {
    for (const [eventType, probability] of Object.entries(this.eventProbabilities)) {
      if (Math.random() < probability * deltaTime / 365) {
        const event = this.createEvent(eventType, gameState);
        this.triggerEvent(event, gameState);
      }
    }
  }
  
  createEvent(type, gameState) {
    const eventGenerators = {
      natural_disaster: () => ({
        type: 'natural_disaster',
        subtype: this.selectDisasterType(),
        location: this.selectLocation(gameState),
        severity: Math.random() * 80 + 20,
        duration: Math.random() * 180 + 30,
        humanitarianNeed: Math.random() * 0.8 + 0.2
      }),
      
      technological_breakthrough: () => ({
        type: 'technological_breakthrough',
        field: this.selectTechField(),
        impact: Math.random() * 0.3 + 0.1,
        adoptionTime: Math.random() * 730 + 365,
        economicPotential: Math.random() * 0.2 + 0.05
      }),
      
      commodity_shock: () => ({
        type: 'commodity_shock',
        commodity: this.selectCommodity(),
        direction: Math.random() > 0.5 ? 'up' : 'down',
        magnitude: Math.random() * 0.5 + 0.2,
        duration: Math.random() * 365 + 90
      })
    };
    
    return eventGenerators[type]();
  }
  
  processEventPlayerResponse(event, response, gameState) {
    const responseEffects = this.calculateResponseEffects(event, response, gameState);
    
    // Apply effects to gameState
    this.applyGlobalEffects(responseEffects.global, gameState);
    this.applyDomesticEffects(responseEffects.domestic, gameState);
    this.applyDiplomaticEffects(responseEffects.diplomatic, gameState);
    
    // Update international reputation
    const reputationChange = this.calculateReputationChange(event, response);
    gameState.global.reputation += reputationChange;
    
    return responseEffects;
  }
}
```

### 6. International Organizations

#### Organization System
```javascript
const internationalOrganizations = {
  UN: {
    name: "United Nations",
    members: 195,
    playerMembershipStatus: 'member',
    influence: {
      peacekeeping: 0.8,
      humanitarian: 0.9,
      development: 0.7,
      environment: 0.6
    },
    
    securityCouncil: {
      permanentMembers: ['US', 'China', 'Russia', 'UK', 'France'],
      isPlayerMember: false,
      vetoSystem: true
    },
    
    votingMechanisms: {
      generalAssembly: 'majority',
      securityCouncil: 'unanimous_permanent'
    }
  },
  
  WTO: {
    name: "World Trade Organization", 
    members: 164,
    playerMembershipStatus: 'member',
    influence: {
      trade: 0.9,
      tariffs: 0.8,
      disputes: 0.7
    },
    
    disputeResolution: {
      available: true,
      timeToResolution: 730,      // ~2 years average
      enforcementMechanism: 'trade_retaliation'
    }
  },
  
  IMF: {
    name: "International Monetary Fund",
    members: 190,
    playerMembershipStatus: 'member',
    votingPower: 0.02,            // Based on economic size
    
    programs: {
      emergencyLoans: {
        available: true,
        maxAmount: 0.5,           // % of GDP
        conditions: ['fiscal_austerity', 'structural_reforms', 'transparency']
      },
      technicalAssistance: {
        available: true,
        areas: ['monetary_policy', 'financial_regulation', 'statistics']
      }
    }
  },
  
  calculateOrganizationInfluence(organization, issue, gameState) {
    let influence = organization.influence[issue] || 0;
    
    // Membership status affects influence
    if (gameState.player.membershipStatus[organization.name] === 'leadership') {
      influence *= 1.5;
    } else if (gameState.player.membershipStatus[organization.name] === 'suspended') {
      influence *= 0.1;
    }
    
    // Player's global standing affects voice
    influence *= (gameState.global.reputation / 100);
    
    // Organization effectiveness varies by issue
    influence *= organization.effectivenessMultipliers[issue] || 1.0;
    
    return influence;
  }
};
```

### 7. Integration with Domestic Systems

#### Global-Domestic Policy Linkages
```javascript
function processGlobalDomesticEffects(globalState, domesticState) {
  // Trade effects on economy
  const tradeBalance = calculateTradeBalance(globalState.tradeRelationships);
  domesticState.economy.netExports = tradeBalance;
  domesticState.economy.gdp += tradeBalance * 0.1;
  
  // International crises affect domestic politics
  const crisisEffect = calculateCrisisApprovalEffect(globalState.activeCrises);
  domesticState.politics.approval += crisisEffect;
  
  // Global economic conditions
  const globalGrowth = calculateGlobalGrowth(globalState);
  domesticState.economy.growthMultiplier = 0.7 + globalGrowth * 0.3;
  
  // Refugee and migration flows
  const migrationPressure = calculateMigrationPressure(globalState);
  domesticState.social.immigrationPressure = migrationPressure;
  
  // International reputation effects
  if (globalState.reputation > 70) {
    domesticState.politics.internationalRespectBonus = 5;
  } else if (globalState.reputation < 30) {
    domesticState.politics.internationalShamemalus = -10;
  }
}
```

#### Foreign Policy Decision Framework
```javascript
class ForeignPolicyDecision {
  constructor(type, options, consequences) {
    this.type = type;
    this.options = options;
    this.consequences = consequences;
    this.timeLimit = null;
    this.stakeholders = [];
  }
  
  calculateOptionEffects(option, gameState) {
    const effects = {
      diplomatic: {},
      economic: {},
      domestic: {},
      global: {}
    };
    
    // Diplomatic effects
    for (const country of this.getAffectedCountries(option)) {
      const relationshipChange = this.calculateRelationshipChange(option, country, gameState);
      effects.diplomatic[country] = relationshipChange;
    }
    
    // Economic effects
    effects.economic = this.calculateEconomicEffects(option, gameState);
    
    // Domestic political effects
    effects.domestic = this.calculateDomesticEffects(option, gameState);
    
    // Global reputation effects
    effects.global.reputation = this.calculateReputationEffect(option, gameState);
    
    return effects;
  }
  
  implementDecision(selectedOption, gameState) {
    const effects = this.calculateOptionEffects(selectedOption, gameState);
    
    // Apply all effects
    this.applyDiplomaticEffects(effects.diplomatic, gameState);
    this.applyEconomicEffects(effects.economic, gameState);
    this.applyDomesticEffects(effects.domestic, gameState);
    this.applyGlobalEffects(effects.global, gameState);
    
    // Log decision for future reference
    gameState.global.foreignPolicyHistory.push({
      decision: this.type,
      option: selectedOption,
      date: gameState.currentDate,
      effects: effects
    });
    
    return effects;
  }
}
```

## Implementation Examples

### Basic Global Update Loop
```javascript
class GlobalSimulation {
  constructor(initialState) {
    this.state = initialState;
    this.eventGenerator = new GlobalEventGenerator();
    this.activeCrises = [];
    this.diplomaticCalendar = [];
  }
  
  update(deltaTime) {
    // Update international relationships
    this.updateInternationalRelations(deltaTime);
    
    // Process active crises
    this.updateActiveCrises(deltaTime);
    
    // Generate new global events
    this.eventGenerator.generateEvents(this.state, deltaTime);
    
    // Update global trade flows
    this.updateGlobalTrade(deltaTime);
    
    // Process diplomatic calendar
    this.processDiplomaticEvents(deltaTime);
    
    // Update international organization dynamics
    this.updateInternationalOrganizations(deltaTime);
    
    // Calculate global influence rankings
    this.updateGlobalInfluence();
  }
  
  updateInternationalRelations(deltaTime) {
    for (const relationship of this.state.relationships) {
      relationship.update(deltaTime);
      
      // Apply relationship effects to trade and cooperation
      this.applyRelationshipEffects(relationship);
    }
  }
}
```

## Testing Strategy

### Unit Tests
- Country relationship calculations
- Trade flow algorithms
- Crisis generation and progression
- Diplomatic action effectiveness

### Integration Tests
- Global-domestic effect interactions
- Crisis response system testing
- International organization mechanics
- Foreign policy decision impacts

### Scenario Tests
- Major crisis scenarios
- Diplomatic negotiation outcomes
- Global economic shock responses
- International cooperation scenarios

This global simulation module provides a rich international context that challenges players to balance domestic priorities with global responsibilities while navigating complex international relationships and crises.