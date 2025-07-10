# Economy Simulation Module

## Overview

The Economy Simulation module is the core economic engine of SP_Sim, responsible for modeling macroeconomic indicators, fiscal policy effects, and economic cycles. It provides realistic economic feedback to player decisions and creates dynamic economic challenges.

## Core Components

### 1. Economic Indicators

#### GDP (Gross Domestic Product)
```javascript
// GDP calculation components
const gdpComponents = {
  consumption: {
    private: number,      // Private consumption
    government: number    // Government consumption
  },
  investment: {
    private: number,      // Private investment
    government: number    // Government investment
  },
  netExports: number,     // Exports - Imports
  
  // GDP = C + I + G + (X - M)
  total: function() {
    return this.consumption.private + 
           this.consumption.government + 
           this.investment.private + 
           this.investment.government + 
           this.netExports;
  }
};
```

#### Unemployment Rate
```javascript
const unemploymentModel = {
  structuralRate: 4.0,          // Natural unemployment rate
  cyclicalComponent: 0,         // Business cycle component
  frictionComponent: 1.5,       // Job search friction
  
  calculate() {
    return Math.max(0, 
      this.structuralRate + 
      this.cyclicalComponent + 
      this.frictionComponent
    );
  }
};
```

#### Inflation Rate
```javascript
const inflationModel = {
  targetRate: 2.0,              // Central bank target
  demandPull: 0,                // Demand-driven inflation
  costPush: 0,                  // Supply-driven inflation
  expectations: 2.0,            // Inflation expectations
  
  calculate() {
    return (this.demandPull + this.costPush + this.expectations) / 3;
  }
};
```

### 2. Economic Sectors

#### Primary Sector (Agriculture, Mining)
```javascript
const primarySector = {
  gdpShare: 0.05,               // 5% of GDP
  employment: 0.03,             // 3% of workforce
  productivity: 1.2,            // Productivity index
  weatherSensitivity: 0.8,      // Weather impact factor
  
  // Sector-specific calculations
  calculateOutput(weather, technology, landUse) {
    return this.productivity * 
           (1 + technology * 0.1) * 
           (1 + weather * this.weatherSensitivity) * 
           landUse;
  }
};
```

#### Secondary Sector (Manufacturing)
```javascript
const secondarySector = {
  gdpShare: 0.25,               // 25% of GDP
  employment: 0.20,             // 20% of workforce
  productivity: 1.0,            // Baseline productivity
  energySensitivity: 0.6,       // Energy cost impact
  
  calculateOutput(energyCosts, skillLevel, infrastructure) {
    return this.productivity * 
           (1 - energyCosts * this.energySensitivity) * 
           (1 + skillLevel * 0.15) * 
           infrastructure;
  }
};
```

#### Tertiary Sector (Services)
```javascript
const tertiarySector = {
  gdpShare: 0.70,               // 70% of GDP
  employment: 0.77,             // 77% of workforce
  productivity: 0.9,            // Service productivity
  technologySensitivity: 0.4,   // Technology adoption impact
  
  calculateOutput(technology, education, urbanization) {
    return this.productivity * 
           (1 + technology * this.technologySensitivity) * 
           (1 + education * 0.2) * 
           urbanization;
  }
};
```

### 3. Fiscal Policy System

#### Taxation
```javascript
const taxationSystem = {
  incomeTax: {
    rates: [0.15, 0.25, 0.35, 0.45],  // Progressive rates
    brackets: [25000, 50000, 100000, 200000],
    
    calculateRevenue(income, population) {
      // Progressive taxation calculation
      let totalRevenue = 0;
      const taxpayers = income * population;
      
      for (let i = 0; i < this.rates.length; i++) {
        const bracket = this.brackets[i];
        const rate = this.rates[i];
        const taxableIncome = Math.min(income, bracket);
        totalRevenue += taxableIncome * rate;
      }
      
      return totalRevenue;
    }
  },
  
  corporateTax: {
    rate: 0.21,                       // Corporate tax rate
    
    calculateRevenue(corporateProfits) {
      return corporateProfits * this.rate;
    }
  },
  
  salesTax: {
    rate: 0.08,                       // VAT/Sales tax rate
    
    calculateRevenue(consumption) {
      return consumption * this.rate;
    }
  }
};
```

#### Government Spending
```javascript
const governmentSpending = {
  categories: {
    infrastructure: {
      spending: 0,
      multiplier: 1.5,              // Economic multiplier effect
      depreciationRate: 0.05        // Annual depreciation
    },
    education: {
      spending: 0,
      multiplier: 1.2,
      longTermEffect: 0.1           // Productivity growth effect
    },
    healthcare: {
      spending: 0,
      multiplier: 1.1,
      productivityEffect: 0.05      // Worker productivity effect
    },
    defense: {
      spending: 0,
      multiplier: 0.8,              // Lower economic multiplier
      stabilityEffect: 0.1          // Political stability effect
    },
    welfare: {
      spending: 0,
      multiplier: 1.3,              // High consumption multiplier
      inequalityEffect: -0.1        // Reduces inequality
    }
  },
  
  calculateMultiplierEffect() {
    let totalEffect = 0;
    for (const category of Object.values(this.categories)) {
      totalEffect += category.spending * category.multiplier;
    }
    return totalEffect;
  }
};
```

### 4. Economic Cycles

#### Business Cycle Model
```javascript
class BusinessCycle {
  constructor() {
    this.phase = 'expansion';     // expansion, peak, contraction, trough
    this.cyclePosition = 0;       // 0-100, position in current cycle
    this.cycleDuration = 8;       // Years for full cycle
    this.amplitude = 0.1;         // Cycle strength (±10% GDP variation)
  }
  
  update(timeStep) {
    this.cyclePosition += timeStep / (this.cycleDuration * 52); // Weekly steps
    
    if (this.cyclePosition >= 1) {
      this.cyclePosition = 0;
    }
    
    // Determine current phase
    if (this.cyclePosition < 0.4) {
      this.phase = 'expansion';
    } else if (this.cyclePosition < 0.5) {
      this.phase = 'peak';
    } else if (this.cyclePosition < 0.9) {
      this.phase = 'contraction';
    } else {
      this.phase = 'trough';
    }
  }
  
  getGDPEffect() {
    const sineWave = Math.sin(this.cyclePosition * 2 * Math.PI);
    return sineWave * this.amplitude;
  }
  
  getUnemploymentEffect() {
    // Unemployment lags GDP by ~6 months
    const laggedPosition = (this.cyclePosition + 0.125) % 1;
    const sineWave = Math.sin(laggedPosition * 2 * Math.PI);
    return -sineWave * 0.03; // ±3% unemployment variation
  }
}
```

### 5. Economic Events

#### Random Economic Shocks
```javascript
const economicEvents = {
  recession: {
    probability: 0.02,            // 2% chance per year
    duration: 6,                  // Months
    gdpImpact: -0.08,            // -8% GDP
    unemploymentImpact: 0.04,     // +4% unemployment
    
    trigger(gameState) {
      gameState.economy.inRecession = true;
      gameState.economy.recessionDuration = this.duration;
      gameState.politics.approval -= 15; // Political impact
    }
  },
  
  oilShock: {
    probability: 0.05,            // 5% chance per year
    duration: 12,                 // Months
    inflationImpact: 0.02,        // +2% inflation
    gdpImpact: -0.02,            // -2% GDP
    
    trigger(gameState) {
      gameState.economy.oilPrices *= 1.5;
      gameState.economy.inflation += this.inflationImpact;
    }
  },
  
  techBoom: {
    probability: 0.03,            // 3% chance per year
    duration: 24,                 // Months
    productivityGrowth: 0.05,     // +5% productivity
    gdpImpact: 0.03,             // +3% GDP
    
    trigger(gameState) {
      gameState.economy.productivity += this.productivityGrowth;
      gameState.sectors.tertiary.growth += 0.02;
    }
  }
};
```

## Policy Effects

### Tax Policy Effects
```javascript
const taxPolicyEffects = {
  incomeTaxIncrease: {
    immediateEffects: {
      revenue: 0.8,               // 80% of theoretical increase (Laffer curve)
      consumption: -0.3,          // 30% reduction in consumption
      approval: -5                // 5 point approval drop
    },
    longTermEffects: {
      inequality: -0.1,           // Reduces inequality
      investment: -0.1            // Reduces private investment
    }
  },
  
  corporateTaxReduction: {
    immediateEffects: {
      revenue: -0.9,              // 90% of theoretical decrease
      investment: 0.4,            // 40% increase in investment
      approval: -2                // Slight approval drop (perceived as pro-business)
    },
    longTermEffects: {
      employment: 0.2,            // Job creation
      productivity: 0.1           // Capital investment effect
    }
  }
};
```

### Spending Policy Effects
```javascript
const spendingPolicyEffects = {
  infrastructureInvestment: {
    immediateEffects: {
      gdp: 0.5,                   // Immediate GDP boost
      employment: 0.3,            // Construction jobs
      debt: 1.0                   // Full cost to debt
    },
    longTermEffects: {
      productivity: 0.1,          // Improved infrastructure
      competitiveness: 0.05,      // Better business environment
      maintenance: 0.02           // Ongoing maintenance costs
    }
  },
  
  educationSpending: {
    immediateEffects: {
      gdp: 0.2,                   // Lower immediate multiplier
      employment: 0.1,            // Teacher jobs
      approval: 3                 // Popular policy
    },
    longTermEffects: {
      productivity: 0.15,         // Skilled workforce
      innovation: 0.1,            // R&D capacity
      socialMobility: 0.1         // Reduced inequality
    }
  }
};
```

## Implementation Examples

### Basic Economic Update Loop
```javascript
class EconomySimulation {
  constructor(initialState) {
    this.state = initialState;
    this.businessCycle = new BusinessCycle();
  }
  
  update(deltaTime) {
    // Update business cycle
    this.businessCycle.update(deltaTime);
    
    // Calculate GDP
    this.updateGDP();
    
    // Calculate unemployment
    this.updateUnemployment();
    
    // Calculate inflation
    this.updateInflation();
    
    // Process policy effects
    this.processPolicyEffects();
    
    // Check for random events
    this.checkRandomEvents();
    
    // Update fiscal position
    this.updateFiscalPosition();
  }
  
  updateGDP() {
    const baseGDP = this.calculateBaseGDP();
    const cycleEffect = this.businessCycle.getGDPEffect();
    const policyEffect = this.calculatePolicyEffects();
    
    this.state.economy.gdp = baseGDP * (1 + cycleEffect + policyEffect);
    this.state.economy.gdpGrowth = (this.state.economy.gdp / this.state.economy.previousGDP - 1) * 100;
  }
  
  updateUnemployment() {
    const naturalRate = 4.5;
    const cycleEffect = this.businessCycle.getUnemploymentEffect();
    const policyEffect = this.calculateUnemploymentPolicyEffect();
    
    this.state.economy.unemployment = Math.max(0, 
      naturalRate + cycleEffect + policyEffect);
  }
  
  updateInflation() {
    const targetInflation = 2.0;
    const demandPressure = this.calculateDemandPressure();
    const supplyShocks = this.calculateSupplyShocks();
    
    this.state.economy.inflation = targetInflation + demandPressure + supplyShocks;
  }
}
```

### Integration with Other Systems
```javascript
// Economic effects on political approval
function calculateEconomicApproval(economyState) {
  const gdpEffect = (economyState.gdpGrowth - 2.0) * 2;      // 2% baseline growth
  const unemploymentEffect = (6.0 - economyState.unemployment) * 1.5;
  const inflationEffect = (2.0 - economyState.inflation) * 1.0;
  
  return gdpEffect + unemploymentEffect + inflationEffect;
}

// Economic effects on global relations
function calculateEconomicDiplomacy(economyState) {
  return {
    tradeAttractiveness: economyState.gdpGrowth / 100,
    aidCapacity: Math.max(0, (economyState.gdp - economyState.debt) * 0.001),
    economicInfluence: Math.log(economyState.gdp) / 10
  };
}
```

## Testing Strategy

### Unit Tests
- Test individual calculation functions
- Verify policy effect calculations
- Test business cycle mechanics
- Validate boundary conditions

### Integration Tests
- Test economic-political interactions
- Verify long-term simulation stability
- Test policy combination effects
- Validate economic event impacts

### Performance Tests
- Benchmark calculation performance
- Test with extreme parameter values
- Verify memory usage patterns
- Test simulation consistency over time

This economic simulation provides a realistic foundation for the political economy game, balancing accuracy with playability while offering meaningful feedback to player decisions.