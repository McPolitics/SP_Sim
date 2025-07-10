import { eventSystem, EVENTS } from './EventSystem';

/**
 * EconomicSimulation - Models economic metrics and their interactions
 * Implements GDP, unemployment, inflation, and economic cycles
 */
export class EconomicSimulation {
  constructor() {
    this.metrics = {
      gdp: 1000000000000, // $1 trillion baseline
      gdpGrowth: 2.1,
      unemployment: 6.0,
      inflation: 2.4,
      interestRate: 3.5,
      consumerSpending: 0.65, // 65% of GDP
      governmentSpending: 0.20, // 20% of GDP
      investment: 0.18, // 18% of GDP
      netExports: -0.03, // -3% of GDP (trade deficit)
      productivity: 1.0, // Baseline productivity index
      confidence: 75, // Consumer/business confidence (0-100)
    };

    this.sectors = {
      agriculture: { share: 0.05, growth: 1.2, volatility: 0.15 },
      manufacturing: { share: 0.25, growth: 2.8, volatility: 0.10 },
      services: { share: 0.70, growth: 2.0, volatility: 0.05 },
    };

    this.cycle = {
      phase: 'expansion', // recession, trough, expansion, peak
      duration: 0, // weeks in current phase
      intensity: 0.5, // 0-1 scale
    };

    this.shocks = [];
    this.policies = [];

    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    eventSystem.on(EVENTS.TURN_END, () => {
      this.updateEconomy();
    });

    eventSystem.on('policy:implemented', (event) => {
      this.applyPolicy(event.data.policy);
    });

    eventSystem.on('economic:shock', (event) => {
      this.applyShock(event.data.shock);
    });
  }

  /**
   * Update economic metrics each turn
   */
  updateEconomy() {
    // Update business cycle
    this.updateBusinessCycle();

    // Calculate sector performance
    this.updateSectors();

    // Update core metrics
    this.updateGDP();
    this.updateUnemployment();
    this.updateInflation();
    this.updateConfidence();

    // Apply any active policies
    this.applyActivePolicies();

    // Check for automatic events
    this.checkEconomicEvents();

    // Emit economic update event
    eventSystem.emit('economic:update', {
      metrics: { ...this.metrics },
      sectors: { ...this.sectors },
      cycle: { ...this.cycle },
    });
  }

  /**
   * Update business cycle
   */
  updateBusinessCycle() {
    this.cycle.duration += 1;

    // Business cycle transitions based on duration and economic conditions
    switch (this.cycle.phase) {
      case 'expansion':
        if (this.cycle.duration > 104 || this.metrics.inflation > 4.5) { // 2 years or high inflation
          this.cycle.phase = 'peak';
          this.cycle.duration = 0;
          this.cycle.intensity = Math.min(1.0, this.cycle.intensity + 0.1);
        } else {
          this.cycle.intensity = Math.min(1.0, this.cycle.intensity + 0.02);
        }
        break;

      case 'peak':
        if (this.cycle.duration > 8 || this.metrics.unemployment > 7.5) { // 2 months or high unemployment
          this.cycle.phase = 'recession';
          this.cycle.duration = 0;
          this.cycle.intensity = Math.max(0.1, this.cycle.intensity - 0.1);
        }
        break;

      case 'recession':
        if (this.cycle.duration > 52 || this.metrics.gdpGrowth > 0) { // 1 year or positive growth
          this.cycle.phase = 'trough';
          this.cycle.duration = 0;
          this.cycle.intensity = Math.max(0.1, this.cycle.intensity - 0.02);
        } else {
          this.cycle.intensity = Math.max(0.1, this.cycle.intensity - 0.03);
        }
        break;

      case 'trough':
        if (this.cycle.duration > 12 || this.metrics.confidence > 60) { // 3 months or improving confidence
          this.cycle.phase = 'expansion';
          this.cycle.duration = 0;
          this.cycle.intensity = Math.min(1.0, this.cycle.intensity + 0.05);
        }
        break;

      default:
        // Unknown phase, default to expansion
        this.cycle.phase = 'expansion';
        this.cycle.duration = 0;
        break;
    }
  }

  /**
   * Update sector performance
   */
  updateSectors() {
    Object.keys(this.sectors).forEach((sectorName) => {
      const sector = this.sectors[sectorName];

      // Base growth with cycle effects
      let { growth } = sector;

      // Apply business cycle effects
      const cycleEffect = this.getCycleEffect();
      growth *= cycleEffect;

      // Add volatility
      const volatility = (Math.random() - 0.5) * sector.volatility * 2;
      growth += volatility;

      // Update sector metrics
      sector.currentGrowth = growth;
      sector.cycleEffect = cycleEffect;
    });
  }

  /**
   * Update GDP and GDP growth
   */
  updateGDP() {
    // Calculate weighted sector growth
    let weightedGrowth = 0;
    Object.keys(this.sectors).forEach((sectorName) => {
      const sector = this.sectors[sectorName];
      weightedGrowth += sector.share * (sector.currentGrowth || sector.growth);
    });

    // Apply productivity effects
    const productivityEffect = (this.metrics.productivity - 1.0) * 0.5;
    weightedGrowth += productivityEffect;

    // Apply confidence effects
    const confidenceEffect = (this.metrics.confidence - 50) / 100;
    weightedGrowth += confidenceEffect;

    // Update GDP growth (annualized from quarterly)
    this.metrics.gdpGrowth = this.smoothUpdate(this.metrics.gdpGrowth, weightedGrowth, 0.3);

    // Update actual GDP
    const weeklyGrowthRate = this.metrics.gdpGrowth / 52 / 100;
    this.metrics.gdp *= (1 + weeklyGrowthRate);
  }

  /**
   * Update unemployment rate
   */
  updateUnemployment() {
    // Okun's Law: unemployment inversely related to GDP growth
    const targetUnemployment = 6.0 - (this.metrics.gdpGrowth - 2.0) * 0.4;

    // Business cycle effects
    let cycleAdjustment = 0;
    switch (this.cycle.phase) {
      case 'recession':
        cycleAdjustment = 0.5;
        break;
      case 'trough':
        cycleAdjustment = 0.2;
        break;
      case 'expansion':
        cycleAdjustment = -0.3;
        break;
      case 'peak':
        cycleAdjustment = -0.1;
        break;
      default:
        cycleAdjustment = 0;
        break;
    }

    const adjustedTarget = Math.max(3.0, Math.min(12.0, targetUnemployment + cycleAdjustment));
    this.metrics.unemployment = this.smoothUpdate(this.metrics.unemployment, adjustedTarget, 0.2);
  }

  /**
   * Update inflation rate
   */
  updateInflation() {
    // Phillips Curve: inverse relationship with unemployment
    const demandPullInflation = Math.max(0, (7.0 - this.metrics.unemployment) * 0.3);

    // Cost-push inflation from business cycle
    const costPushInflation = this.cycle.intensity * 0.8;

    // Money supply effects (simplified)
    const monetaryInflation = (this.metrics.interestRate < 2.0) ? 0.5 : -0.2;

    const targetInflation = 2.0 + demandPullInflation + costPushInflation + monetaryInflation;

    // Add some volatility
    const volatility = (Math.random() - 0.5) * 0.4;
    const adjustedTarget = Math.max(0, targetInflation + volatility);

    this.metrics.inflation = this.smoothUpdate(this.metrics.inflation, adjustedTarget, 0.25);
  }

  /**
   * Update consumer and business confidence
   */
  updateConfidence() {
    let confidenceChange = 0;

    // Economic performance effects
    if (this.metrics.gdpGrowth > 3.0) confidenceChange += 2;
    else if (this.metrics.gdpGrowth < 0) confidenceChange -= 3;

    if (this.metrics.unemployment < 5.0) confidenceChange += 1;
    else if (this.metrics.unemployment > 8.0) confidenceChange -= 2;

    if (this.metrics.inflation > 4.0) confidenceChange -= 2;
    else if (this.metrics.inflation < 1.0) confidenceChange -= 1;

    // Business cycle effects
    switch (this.cycle.phase) {
      case 'expansion':
        confidenceChange += 1;
        break;
      case 'recession':
        confidenceChange -= 2;
        break;
      case 'trough':
        confidenceChange += 0.5; // Recovery hope
        break;
      default:
        break;
    }

    // Random events
    confidenceChange += (Math.random() - 0.5) * 2;

    this.metrics.confidence = Math.max(0, Math.min(100, this.metrics.confidence + confidenceChange));
  }

  /**
   * Apply economic policy
   */
  applyPolicy(policy) {
    this.policies.push({
      ...policy,
      duration: policy.duration || 12, // weeks
      implementedWeek: 0,
    });

    // Immediate effects
    switch (policy.type) {
      case 'fiscal_stimulus':
        this.metrics.confidence += 5;
        this.metrics.governmentSpending += policy.amount || 0.02;
        break;
      case 'tax_cut':
        this.metrics.confidence += 3;
        this.metrics.consumerSpending += policy.amount || 0.01;
        break;
      case 'tax_increase':
        this.metrics.confidence -= 4;
        this.metrics.consumerSpending -= policy.amount || 0.015;
        break;
      case 'interest_rate_change':
        this.metrics.interestRate += policy.change || 0;
        break;
      case 'infrastructure_investment':
        this.metrics.productivity += policy.amount || 0.05;
        this.sectors.manufacturing.growth += policy.amount || 0.5;
        break;
      case 'education_investment':
        this.metrics.productivity += policy.amount || 0.03;
        this.sectors.services.growth += policy.amount || 0.3;
        break;
      case 'healthcare_investment':
        this.metrics.productivity += policy.amount || 0.02;
        this.metrics.confidence += 3;
        break;
      case 'green_energy_investment':
        this.sectors.manufacturing.growth += policy.amount || 0.4;
        this.metrics.productivity += policy.amount || 0.04;
        break;
      case 'trade_promotion':
        this.metrics.netExports += policy.amount || 0.01;
        this.sectors.manufacturing.growth += policy.amount || 0.3;
        break;
      case 'regulation_increase':
        this.sectors.services.growth -= policy.amount || 0.2;
        this.metrics.confidence -= 2;
        break;
      case 'regulation_decrease':
        this.sectors.services.growth += policy.amount || 0.3;
        this.metrics.confidence += 2;
        break;
      case 'agricultural_subsidies':
        this.sectors.agriculture.growth += policy.amount || 0.5;
        this.metrics.governmentSpending += policy.amount || 0.005;
        break;
      case 'minimum_wage_increase':
        this.metrics.consumerSpending += policy.amount || 0.008;
        this.metrics.confidence += 2;
        this.metrics.inflation += policy.amount || 0.3;
        break;
      default:
        break;
    }

    eventSystem.emit('economic:policy_applied', {
      policy,
      newMetrics: { ...this.metrics },
    });
  }

  /**
   * Apply active policies each turn
   */
  applyActivePolicies() {
    this.policies = this.policies.filter((policy) => {
      policy.implementedWeek += 1;

      // Apply ongoing effects
      if (policy.ongoingEffects) {
        Object.keys(policy.ongoingEffects).forEach((metric) => {
          if (this.metrics[metric] !== undefined) {
            this.metrics[metric] += policy.ongoingEffects[metric];
          }
        });
      }

      // Remove expired policies
      return policy.implementedWeek < policy.duration;
    });
  }

  /**
   * Apply economic shock
   */
  applyShock(shock) {
    this.shocks.push(shock);

    switch (shock.type) {
      case 'oil_price_spike':
        this.metrics.inflation += shock.magnitude || 1.0;
        this.metrics.confidence -= shock.magnitude * 5 || 10;
        break;
      case 'financial_crisis':
        this.metrics.confidence -= shock.magnitude * 20 || 30;
        this.cycle.phase = 'recession';
        this.cycle.duration = 0;
        break;
      case 'trade_war':
        this.metrics.netExports -= shock.magnitude || 0.02;
        this.sectors.manufacturing.growth -= shock.magnitude || 1.0;
        break;
      case 'pandemic':
        this.metrics.gdpGrowth -= shock.magnitude || 5.0;
        this.metrics.unemployment += shock.magnitude || 3.0;
        this.sectors.services.growth -= shock.magnitude || 3.0;
        break;
      case 'supply_chain_disruption':
        this.sectors.manufacturing.growth -= shock.magnitude;
        this.sectors.services.growth -= shock.magnitude * 0.5;
        this.metrics.inflation += shock.magnitude * 0.3;
        break;
      case 'commodity_price_spike':
        this.metrics.inflation += shock.magnitude;
        this.sectors.agriculture.growth -= shock.magnitude * 0.8;
        this.metrics.confidence -= shock.magnitude * 3;
        break;
      case 'currency_fluctuation':
        this.metrics.netExports += (Math.random() - 0.5) * shock.magnitude * 0.02;
        this.metrics.inflation += shock.magnitude * 0.2;
        break;
      case 'tech_innovation':
        this.metrics.productivity += shock.magnitude * 0.1;
        this.sectors.services.growth += shock.magnitude;
        this.metrics.confidence += shock.magnitude * 5;
        break;
      case 'natural_disaster':
        this.metrics.gdpGrowth -= shock.magnitude;
        this.sectors.agriculture.growth -= shock.magnitude * 1.5;
        this.metrics.confidence -= shock.magnitude * 8;
        break;
      case 'geopolitical_tension':
        this.metrics.confidence -= shock.magnitude * 6;
        this.metrics.netExports -= shock.magnitude * 0.01;
        this.metrics.investment -= shock.magnitude * 0.01;
        break;
      default:
        break;
    }

    eventSystem.emit('economic:shock_applied', {
      shock,
      newMetrics: { ...this.metrics },
    });
  }

  /**
   * Check for automatic economic events
   */
  checkEconomicEvents() {
    const events = [];

    // High inflation warning
    if (this.metrics.inflation > 4.0 && Math.random() < 0.1) {
      events.push({
        type: 'high_inflation_warning',
        message: `Inflation has reached ${this.metrics.inflation.toFixed(1)}%. Consider monetary policy adjustments.`,
        severity: 'warning',
      });
    }

    // Recession warning
    if (this.metrics.gdpGrowth < -1.0 && this.cycle.phase !== 'recession') {
      events.push({
        type: 'recession_warning',
        message: 'Economic indicators suggest a recession. GDP growth is negative.',
        severity: 'danger',
      });
    }

    // Low unemployment celebration
    if (this.metrics.unemployment < 4.0 && Math.random() < 0.05) {
      events.push({
        type: 'low_unemployment',
        message: `Unemployment has dropped to ${this.metrics.unemployment.toFixed(1)}%. Conditions are favorable.`,
        severity: 'success',
      });
    }

    // Economic boom detection
    if (this.metrics.gdpGrowth > 4.0 && this.metrics.unemployment < 5.0 && Math.random() < 0.08) {
      events.push({
        type: 'economic_boom',
        message: `Economic boom detected! GDP growth at ${this.metrics.gdpGrowth.toFixed(1)}% with low unemployment.`,
        severity: 'success',
      });
    }

    // Deflation warning
    if (this.metrics.inflation < 0.5 && Math.random() < 0.06) {
      events.push({
        type: 'deflation_risk',
        message: `Deflation risk: Inflation is only ${this.metrics.inflation.toFixed(1)}%. Consider stimulus measures.`,
        severity: 'warning',
      });
    }

    // Stagflation detection
    if (this.metrics.inflation > 3.5 && this.metrics.unemployment > 7.0
        && this.metrics.gdpGrowth < 1.0 && Math.random() < 0.1) {
      events.push({
        type: 'stagflation',
        message: 'Stagflation detected: High inflation and unemployment with low growth. '
          + 'Difficult policy choices ahead.',
        severity: 'danger',
      });
    }

    // Interest rate milestones
    if (this.metrics.interestRate <= 0.5 && Math.random() < 0.05) {
      events.push({
        type: 'zero_interest_rate',
        message: 'Interest rates near zero. Traditional monetary policy effectiveness limited.',
        severity: 'warning',
      });
    }

    // Sector-specific events
    Object.keys(this.sectors).forEach((sectorName) => {
      const sector = this.sectors[sectorName];

      // Sector boom
      if (sector.currentGrowth > 5.0 && Math.random() < 0.04) {
        events.push({
          type: 'sector_boom',
          message: `${sectorName.charAt(0).toUpperCase() + sectorName.slice(1)} sector `
            + `experiencing rapid growth at ${sector.currentGrowth.toFixed(1)}%.`,
          severity: 'success',
        });
      }

      // Sector decline
      if (sector.currentGrowth < -2.0 && Math.random() < 0.06) {
        events.push({
          type: 'sector_decline',
          message: `${sectorName.charAt(0).toUpperCase() + sectorName.slice(1)} sector `
            + `declining at ${sector.currentGrowth.toFixed(1)}%. May need targeted support.`,
          severity: 'warning',
        });
      }
    });

    // Random economic shocks (Week 8 feature)
    if (Math.random() < 0.02) { // 2% chance per week
      const shockType = this.generateRandomShock();
      if (shockType) {
        events.push(shockType);
        this.applyShock(shockType);
      }
    }

    // Confidence milestones
    if (this.metrics.confidence > 85 && Math.random() < 0.03) {
      events.push({
        type: 'high_confidence',
        message: `Consumer confidence at ${this.metrics.confidence.toFixed(0)}%. `
          + 'Strong economic sentiment boosting spending.',
        severity: 'success',
      });
    }

    if (this.metrics.confidence < 30 && Math.random() < 0.05) {
      events.push({
        type: 'confidence_crisis',
        message: `Consumer confidence plummeted to ${this.metrics.confidence.toFixed(0)}%. `
          + 'Economic uncertainty affecting all sectors.',
        severity: 'danger',
      });
    }

    // Emit events
    events.forEach((event) => {
      eventSystem.emit('economic:event', event);
    });
  }

  /**
   * Generate random economic shock (Week 8 feature)
   */
  generateRandomShock() {
    const shocks = [
      {
        type: 'supply_chain_disruption',
        message: 'Global supply chain disruption affecting manufacturing and services.',
        severity: 'warning',
        magnitude: 0.5 + Math.random() * 1.0,
      },
      {
        type: 'commodity_price_spike',
        message: 'Commodity prices surge affecting production costs and inflation.',
        severity: 'warning',
        magnitude: 0.3 + Math.random() * 0.7,
      },
      {
        type: 'currency_fluctuation',
        message: 'Major currency fluctuation impacting trade balance and imports.',
        severity: 'info',
        magnitude: 0.2 + Math.random() * 0.5,
      },
      {
        type: 'tech_innovation',
        message: 'Technological breakthrough boosting productivity in key sectors.',
        severity: 'success',
        magnitude: 0.3 + Math.random() * 0.4,
      },
      {
        type: 'natural_disaster',
        message: 'Natural disaster affecting regional economic activity.',
        severity: 'danger',
        magnitude: 0.4 + Math.random() * 0.8,
      },
      {
        type: 'geopolitical_tension',
        message: 'Geopolitical tensions affecting trade and investor confidence.',
        severity: 'warning',
        magnitude: 0.3 + Math.random() * 0.6,
      },
    ];

    return shocks[Math.floor(Math.random() * shocks.length)];
  }

  /**
   * Get business cycle effect multiplier
   */
  getCycleEffect() {
    switch (this.cycle.phase) {
      case 'expansion':
        return 1.0 + (this.cycle.intensity * 0.2);
      case 'peak':
        return 1.1;
      case 'recession':
        return 0.8 - (this.cycle.intensity * 0.3);
      case 'trough':
        return 0.7;
      default:
        return 1.0;
    }
  }

  /**
   * Smooth update utility for gradual changes
   */
  smoothUpdate(current, target, speed) {
    return current + (target - current) * speed;
  }

  /**
   * Get current economic state
   */
  getEconomicState() {
    return {
      metrics: { ...this.metrics },
      sectors: { ...this.sectors },
      cycle: { ...this.cycle },
      activePolicies: this.policies.length,
      activeShocks: this.shocks.length,
    };
  }

  /**
   * Get economic forecast
   */
  getForecast(weeksAhead = 12) {
    // Simple linear projection based on current trends
    const forecast = {
      gdpGrowth: [],
      unemployment: [],
      inflation: [],
    };

    let currentGDP = this.metrics.gdpGrowth;
    let currentUnemployment = this.metrics.unemployment;
    let currentInflation = this.metrics.inflation;

    for (let week = 1; week <= weeksAhead; week += 1) {
      // Simple trend continuation with some mean reversion
      currentGDP = this.smoothUpdate(currentGDP, 2.1, 0.05); // Mean revert to 2.1%
      currentUnemployment = this.smoothUpdate(currentUnemployment, 6.0, 0.03); // Mean revert to 6%
      currentInflation = this.smoothUpdate(currentInflation, 2.0, 0.04); // Mean revert to 2%

      forecast.gdpGrowth.push(Number(currentGDP.toFixed(2)));
      forecast.unemployment.push(Number(currentUnemployment.toFixed(1)));
      forecast.inflation.push(Number(currentInflation.toFixed(1)));
    }

    return forecast;
  }
}

// Create and export global economic simulation instance
export const economicSimulation = new EconomicSimulation();
