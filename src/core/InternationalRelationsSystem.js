/* eslint-disable no-plusplus */
import { eventSystem } from './EventSystem';

/**
 * InternationalRelationsSystem - Advanced diplomatic and global relations simulation
 * Implements realistic international diplomacy, trade, and global event mechanics
 */
export class InternationalRelationsSystem {
  constructor() {
    this.eventSystem = eventSystem;
    this.countries = this.initializeCountries();
    this.relationships = {};
    this.tradeAgreements = [];
    this.treaties = [];
    this.sanctions = [];
    this.conflicts = [];
    this.globalEvents = [];
    this.diplomaticHistory = [];

    // Global economic factors
    this.globalEconomy = {
      growth: 2.5,
      tradeVolume: 100,
      oilPrice: 75,
      commodityPrices: {},
      currencyRates: {},
      globalInflation: 2.2,
    };

    // International organizations
    this.organizations = {
      UN: { membership: true, influence: 0.8, standing: 'good' },
      NATO: { membership: false, influence: 0.0, standing: 'neutral' },
      EU: { membership: false, influence: 0.0, standing: 'neutral' },
      WTO: { membership: true, influence: 0.6, standing: 'good' },
      G7: { membership: false, influence: 0.0, standing: 'neutral' },
      G20: { membership: true, influence: 0.7, standing: 'good' },
    };

    this.setupEventListeners();
  }

  /**
   * Initialize world countries with realistic relationships
   */
  initializeCountries() {
    return {
      USA: {
        name: 'United States',
        economicPower: 95,
        militaryPower: 100,
        diplomaticInfluence: 90,
        politicalSystem: 'democracy',
        region: 'North America',
        gdp: 21000000000000,
        population: 330000000,
        tradeImportance: 85,
      },
      CHN: {
        name: 'China',
        economicPower: 85,
        militaryPower: 80,
        diplomaticInfluence: 75,
        politicalSystem: 'authoritarian',
        region: 'East Asia',
        gdp: 14000000000000,
        population: 1400000000,
        tradeImportance: 90,
      },
      DEU: {
        name: 'Germany',
        economicPower: 70,
        militaryPower: 45,
        diplomaticInfluence: 80,
        politicalSystem: 'democracy',
        region: 'Europe',
        gdp: 4000000000000,
        population: 83000000,
        tradeImportance: 95,
      },
      GBR: {
        name: 'United Kingdom',
        economicPower: 65,
        militaryPower: 60,
        diplomaticInfluence: 85,
        politicalSystem: 'democracy',
        region: 'Europe',
        gdp: 3100000000000,
        population: 67000000,
        tradeImportance: 80,
      },
      JPN: {
        name: 'Japan',
        economicPower: 75,
        militaryPower: 50,
        diplomaticInfluence: 70,
        politicalSystem: 'democracy',
        region: 'East Asia',
        gdp: 5000000000000,
        population: 126000000,
        tradeImportance: 85,
      },
      RUS: {
        name: 'Russia',
        economicPower: 45,
        militaryPower: 85,
        diplomaticInfluence: 60,
        politicalSystem: 'authoritarian',
        region: 'Europe/Asia',
        gdp: 1700000000000,
        population: 146000000,
        tradeImportance: 70,
      },
      IND: {
        name: 'India',
        economicPower: 55,
        militaryPower: 70,
        diplomaticInfluence: 65,
        politicalSystem: 'democracy',
        region: 'South Asia',
        gdp: 3200000000000,
        population: 1380000000,
        tradeImportance: 75,
      },
      FRA: {
        name: 'France',
        economicPower: 60,
        militaryPower: 55,
        diplomaticInfluence: 75,
        politicalSystem: 'democracy',
        region: 'Europe',
        gdp: 2900000000000,
        population: 67000000,
        tradeImportance: 85,
      },
      BRA: {
        name: 'Brazil',
        economicPower: 40,
        militaryPower: 35,
        diplomaticInfluence: 50,
        politicalSystem: 'democracy',
        region: 'South America',
        gdp: 2100000000000,
        population: 212000000,
        tradeImportance: 60,
      },
      CAN: {
        name: 'Canada',
        economicPower: 50,
        militaryPower: 30,
        diplomaticInfluence: 60,
        politicalSystem: 'democracy',
        region: 'North America',
        gdp: 1800000000000,
        population: 38000000,
        tradeImportance: 85,
      },
    };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.eventSystem.on('turn:end', (event) => {
      this.processInternationalTurn(event.data.gameState);
    });

    this.eventSystem.on('diplomatic:action', (event) => {
      this.processDiplomaticAction(event.data);
    });

    this.eventSystem.on('trade:negotiate', (event) => {
      this.negotiateTradeAgreement(event.data);
    });
  }

  /**
   * Process international relations for current turn
   */
  processInternationalTurn(gameState) {
    // Update diplomatic relations
    this.updateDiplomaticRelations(gameState);

    // Process ongoing trade agreements
    this.processTrade(gameState);

    // Process international organizations
    this.processInternationalOrganizations(gameState);

    // Check for international crises
    this.checkForInternationalCrises(gameState);

    // Process ongoing conflicts
    this.processConflicts(gameState);

    // Update global economy
    this.updateGlobalEconomy(gameState);

    // Emit international update
    this.eventSystem.emit('international:update', {
      relationships: this.relationships,
      globalEconomy: this.globalEconomy,
      activeEvents: this.globalEvents,
    });
  }

  /**
   * Update diplomatic relations with realistic factors
   */
  updateDiplomaticRelations(gameState) {
    Object.keys(this.countries).forEach((countryCode) => {
      if (!this.relationships[countryCode]) {
        this.relationships[countryCode] = this.calculateInitialRelation(countryCode, gameState);
      }

      let relationChange = 0;
      const currentRelation = this.relationships[countryCode];

      // Trade effect - countries with trade agreements gradually improve relations
      const hasTrade = this.tradeAgreements.some((a) => a.country === countryCode);
      relationChange += hasTrade ? 0.1 : 0;

      // Ideology alignment effect
      const ideologyAlignment = this.calculateIdeologyAlignment(gameState, countryCode);
      relationChange += (ideologyAlignment - 0.5) * 0.1;

      // Military alliance effect
      const isAlly = this.treaties.some((t) => t.country === countryCode && t.type === 'military');
      relationChange += isAlly ? 0.1 : 0;

      // Sanctions effect
      const hasSanctions = this.sanctions.some((s) => s.target === countryCode);
      relationChange += hasSanctions ? -0.3 : 0;

      // Recent diplomatic incidents
      const recentIncidents = this.getRecentDiplomaticIncidents(gameState, countryCode);
      relationChange += recentIncidents.effect;

      // Common enemies/rivals effect
      const commonEnemiesEffect = this.calculateCommonEnemiesEffect(gameState, countryCode);
      relationChange += commonEnemiesEffect;

      // Economic interdependence
      const tradeInterdependence = this.calculateTradeInterdependence(countryCode, gameState);
      relationChange += tradeInterdependence * 0.05;

      // Regional stability
      const regionalStability = this.calculateRegionalStability(this.countries[countryCode].region);
      relationChange += (regionalStability - 0.5) * 0.02;

      // Regression to mean - relations tend to stabilize around neutral over time
      relationChange += (50 - currentRelation) * 0.01;

      // Random small fluctuations (news events, cultural exchanges, etc.)
      relationChange += (Math.random() - 0.5) * 0.2;

      // Apply the change with bounds
      this.relationships[countryCode] = Math.max(0, Math.min(100, currentRelation + relationChange));

      // Track relation history
      this.trackRelationHistory(countryCode, gameState, relationChange);
    });
  }

  /**
   * Calculate initial relationship based on various factors
   */
  calculateInitialRelation(countryCode, gameState) {
    const country = this.countries[countryCode];
    let baseRelation = 50; // Neutral starting point

    // Political system alignment
    if (country.politicalSystem === gameState.country.politicalSystem) {
      baseRelation += 10;
    } else if ((country.politicalSystem === 'democracy') !== (gameState.country.politicalSystem === 'democracy')) {
      baseRelation -= 5;
    }

    // Economic size similarity (closer sizes = better relations)
    const economicSimilarity = 1 - Math.abs(country.economicPower - gameState.country.economicPower) / 100;
    baseRelation += economicSimilarity * 10;

    // Regional proximity
    if (country.region === gameState.country.region) {
      baseRelation += 15;
    }

    // Historical relationships (simplified)
    const historicalFactor = this.getHistoricalRelationshipFactor(countryCode);
    baseRelation += historicalFactor;

    return Math.max(0, Math.min(100, baseRelation + (Math.random() - 0.5) * 20));
  }

  /**
   * Calculate ideology alignment between countries
   */
  calculateIdeologyAlignment(gameState, countryCode) {
    const country = this.countries[countryCode];
    let alignment = 0.5; // Base neutral

    // Political system compatibility
    if (country.politicalSystem === gameState.country.politicalSystem) {
      alignment += 0.3;
    }

    // Economic policy alignment (simplified)
    const economicAlignment = this.calculateEconomicPolicyAlignment(gameState, countryCode);
    alignment += economicAlignment * 0.2;

    return Math.max(0, Math.min(1, alignment));
  }

  /**
   * Calculate economic policy alignment
   */
  calculateEconomicPolicyAlignment(_gameState, _countryCode) {
    // Simplified calculation based on trade openness, government intervention, etc.
    // This would be more complex in a full implementation
    return 0.5 + (Math.random() - 0.5) * 0.4;
  }

  /**
   * Get recent diplomatic incidents effect
   */
  getRecentDiplomaticIncidents(gameState, countryCode) {
    const recentWeeks = 12; // Look back 3 months
    const incidents = this.diplomaticHistory.filter((incident) => incident.country === countryCode
      && (gameState.time.week - incident.week) <= recentWeeks);

    let totalEffect = 0;
    incidents.forEach((incident) => {
      const ageMultiplier = 1 - ((gameState.time.week - incident.week) / recentWeeks);
      totalEffect += incident.effect * ageMultiplier;
    });

    return { effect: totalEffect };
  }

  /**
   * Calculate common enemies effect
   */
  calculateCommonEnemiesEffect(gameState, countryCode) {
    // Countries with common enemies/rivals tend to have better relations
    // This is a simplified implementation
    let effect = 0;

    // Check for mutual tensions with third countries
    Object.keys(this.relationships).forEach((thirdCountry) => {
      if (thirdCountry !== countryCode) {
        const ourRelation = this.relationships[thirdCountry];
        const theirRelation = this.getCountryRelation(countryCode, thirdCountry);

        // If both have poor relations with a third country, it improves bilateral relations
        if (ourRelation < 40 && theirRelation < 40) {
          effect += 0.02;
        }
      }
    });

    return effect;
  }

  /**
   * Calculate trade interdependence
   */
  calculateTradeInterdependence(countryCode, gameState) {
    const country = this.countries[countryCode];
    const tradeAgreement = this.tradeAgreements.find((a) => a.country === countryCode);

    if (!tradeAgreement) return 0;

    // Calculate trade volume relative to both economies
    const tradeVolume = tradeAgreement.volume || 1000000000; // Default 1B
    const ourGDP = gameState.economy.gdp;
    const theirGDP = country.gdp;

    const tradeImportanceToUs = tradeVolume / ourGDP;
    const tradeImportanceToThem = tradeVolume / theirGDP;

    return (tradeImportanceToUs + tradeImportanceToThem) / 2;
  }

  /**
   * Calculate regional stability
   */
  calculateRegionalStability(region) {
    // Simplified regional stability calculation
    const regionStability = {
      'North America': 0.8,
      Europe: 0.7,
      'East Asia': 0.6,
      'South Asia': 0.5,
      'Middle East': 0.3,
      Africa: 0.4,
      'South America': 0.6,
    };

    return regionStability[region] || 0.5;
  }

  /**
   * Track relationship history
   */
  trackRelationHistory(countryCode, gameState, change) {
    this.diplomaticHistory.push({
      week: gameState.time.week,
      year: gameState.time.year,
      country: countryCode,
      event: 'relation_change',
      effect: change,
      newValue: this.relationships[countryCode],
    });

    // Keep only last 104 weeks (2 years) of history
    if (this.diplomaticHistory.length > 1000) {
      this.diplomaticHistory = this.diplomaticHistory.slice(-1000);
    }
  }

  /**
   * Process trade agreements and their effects
   */
  processTrade(gameState) {
    this.tradeAgreements.forEach((agreement) => {
      // Apply economic benefits
      const tradeBonus = agreement.economicBenefit || 0.02; // 2% GDP boost
      gameState.economy.gdpGrowth += tradeBonus / 52; // Weekly effect

      // Improve relations gradually
      if (this.relationships[agreement.country]) {
        this.relationships[agreement.country] += 0.05;
      }

      // Check for trade disputes
      if (Math.random() < 0.01) { // 1% chance per turn
        this.generateTradeDispute(agreement, gameState);
      }
    });
  }

  /**
   * Generate a trade dispute
   */
  generateTradeDispute(agreement, gameState) {
    const dispute = {
      id: `trade_dispute_${Date.now()}`,
      country: agreement.country,
      type: 'trade_dispute',
      severity: Math.random() * 30 + 10, // 10-40 severity
      description: `Trade dispute with ${this.countries[agreement.country].name} over ${this.getRandomTradeIssue()}`,
      economicImpact: -(Math.random() * 0.01), // Up to 1% negative impact
      startWeek: gameState.time.week,
    };

    this.globalEvents.push(dispute);

    // Immediate effects
    this.relationships[agreement.country] -= 5;
    gameState.economy.gdpGrowth += dispute.economicImpact;

    this.eventSystem.emit('international:trade_dispute', { dispute, agreement });
  }

  /**
   * Get random trade issue for disputes
   */
  getRandomTradeIssue() {
    const issues = [
      'tariff regulations',
      'intellectual property rights',
      'agricultural subsidies',
      'manufacturing standards',
      'currency manipulation concerns',
      'dumping allegations',
      'import quotas',
      'environmental standards',
    ];
    return issues[Math.floor(Math.random() * issues.length)];
  }

  /**
   * Process international organizations
   */
  processInternationalOrganizations(gameState) {
    Object.keys(this.organizations).forEach((orgCode) => {
      const org = this.organizations[orgCode];

      if (org.membership) {
        // Benefits of membership
        gameState.country.diplomaticInfluence += org.influence * 0.01;

        // Costs of membership
        gameState.economy.governmentSpending += 0.0001; // Small cost

        // Check for organization events
        if (Math.random() < 0.02) { // 2% chance per turn
          this.generateOrganizationEvent(orgCode, gameState);
        }
      }
    });
  }

  /**
   * Generate international organization event
   */
  generateOrganizationEvent(orgCode, gameState) {
    const events = {
      UN: [
        { type: 'resolution', description: 'UN Security Council resolution requires your position' },
        { type: 'peacekeeping', description: 'UN peacekeeping mission requests contribution' },
      ],
      WTO: [
        { type: 'ruling', description: 'WTO ruling affects your trade policies' },
        { type: 'negotiation', description: 'New trade round negotiations begin' },
      ],
      G20: [
        { type: 'summit', description: 'G20 summit addresses global economic issues' },
        { type: 'coordination', description: 'Coordinated economic policy response proposed' },
      ],
    };

    const orgEvents = events[orgCode] || [];
    if (orgEvents.length > 0) {
      const event = orgEvents[Math.floor(Math.random() * orgEvents.length)];

      this.globalEvents.push({
        id: `org_event_${Date.now()}`,
        organization: orgCode,
        type: event.type,
        description: event.description,
        startWeek: gameState.time.week,
        requiresResponse: true,
      });

      this.eventSystem.emit('international:organization_event', { organization: orgCode, event });
    }
  }

  /**
   * Check for international crises
   */
  checkForInternationalCrises(gameState) {
    const crisisChance = 0.03; // 3% per turn

    if (Math.random() < crisisChance) {
      this.generateInternationalCrisis(gameState);
    }
  }

  /**
   * Generate international crisis
   */
  generateInternationalCrisis(gameState) {
    const crisisTypes = [
      {
        type: 'regional_conflict',
        description: 'Regional conflict threatens international stability',
        severity: Math.random() * 40 + 30,
        economicImpact: -0.005,
        diplomaticImpact: -2,
      },
      {
        type: 'trade_war',
        description: 'Major trade war between global powers',
        severity: Math.random() * 50 + 25,
        economicImpact: -0.01,
        diplomaticImpact: -1,
      },
      {
        type: 'humanitarian_crisis',
        description: 'Humanitarian crisis requires international response',
        severity: Math.random() * 60 + 20,
        economicImpact: -0.002,
        diplomaticImpact: 1,
      },
    ];

    const crisis = crisisTypes[Math.floor(Math.random() * crisisTypes.length)];
    crisis.id = `intl_crisis_${Date.now()}`;
    crisis.startWeek = gameState.time.week;

    this.globalEvents.push(crisis);

    // Apply immediate effects
    gameState.economy.gdpGrowth += crisis.economicImpact;
    gameState.country.diplomaticInfluence += crisis.diplomaticImpact;

    this.eventSystem.emit('international:crisis', { crisis });
  }

  /**
   * Process ongoing conflicts
   */
  processConflicts(gameState) {
    this.conflicts.forEach((conflict) => {
      conflict.duration++;

      // Apply ongoing effects
      gameState.economy.gdpGrowth -= conflict.economicDrain || 0.001;
      gameState.politics.approval -= conflict.approvalDrain || 0.1;

      // Check for escalation or resolution
      if (Math.random() < 0.05) { // 5% chance for change each turn
        if (Math.random() < 0.3) {
          this.escalateConflict(conflict, gameState);
        } else {
          this.resolveConflict(conflict, gameState);
        }
      }
    });
  }

  /**
   * Update global economy
   */
  updateGlobalEconomy(gameState) {
    // Global growth fluctuations
    this.globalEconomy.growth += (Math.random() - 0.5) * 0.1;
    this.globalEconomy.growth = Math.max(-2, Math.min(5, this.globalEconomy.growth));

    // Oil price fluctuations
    this.globalEconomy.oilPrice += (Math.random() - 0.5) * 5;
    this.globalEconomy.oilPrice = Math.max(30, Math.min(150, this.globalEconomy.oilPrice));

    // Global trade volume
    this.globalEconomy.tradeVolume += (this.globalEconomy.growth / 100) * 2;

    // Apply global effects to domestic economy
    const globalEffect = this.globalEconomy.growth * 0.1; // 10% of global growth affects domestic
    gameState.economy.gdpGrowth += globalEffect / 52; // Weekly effect
  }

  /**
   * Negotiate trade agreement
   */
  negotiateTradeAgreement(data) {
    const { countryCode, terms, gameState } = data;
    const country = this.countries[countryCode];

    if (!country) return false;

    // Calculate success probability
    const relationshipFactor = this.relationships[countryCode] / 100;
    const economicBenefit = this.calculateMutualEconomicBenefit(countryCode, gameState);
    const politicalWill = (gameState.politics.approval / 100) * 0.5 + 0.5;

    const successProbability = (relationshipFactor + economicBenefit + politicalWill) / 3;

    if (Math.random() < successProbability) {
      // Success - create trade agreement
      const agreement = {
        id: `trade_${countryCode}_${Date.now()}`,
        country: countryCode,
        type: terms.type || 'bilateral_trade',
        economicBenefit: economicBenefit * 0.02, // Convert to GDP growth
        volume: this.calculateTradeVolume(countryCode, gameState),
        negotiatedWeek: gameState.time.week,
        terms,
      };

      this.tradeAgreements.push(agreement);

      // Improve relations
      this.relationships[countryCode] += 10;

      // Add to diplomatic history
      this.diplomaticHistory.push({
        week: gameState.time.week,
        year: gameState.time.year,
        country: countryCode,
        event: 'trade_agreement_signed',
        effect: 10,
        details: agreement,
      });

      this.eventSystem.emit('international:trade_agreement_success', { agreement, country });
      return true;
    }
    // Failure
    this.relationships[countryCode] -= 2;

    this.diplomaticHistory.push({
      week: gameState.time.week,
      year: gameState.time.year,
      country: countryCode,
      event: 'trade_negotiation_failed',
      effect: -2,
    });

    this.eventSystem.emit('international:trade_agreement_failed', { countryCode, country });
    return false;
  }

  /**
   * Calculate mutual economic benefit of trade
   */
  calculateMutualEconomicBenefit(countryCode, gameState) {
    const country = this.countries[countryCode];
    const economicSimilarity = 1 - Math.abs(country.economicPower - gameState.country.economicPower) / 100;
    const tradeComplement = country.tradeImportance / 100;

    return (economicSimilarity + tradeComplement) / 2;
  }

  /**
   * Calculate trade volume
   */
  calculateTradeVolume(countryCode, gameState) {
    const country = this.countries[countryCode];
    const baseVolume = Math.min(gameState.economy.gdp, country.gdp) * 0.001; // 0.1% of smaller economy
    const relationshipMultiplier = this.relationships[countryCode] / 100;

    return baseVolume * relationshipMultiplier;
  }

  /**
   * Get country relationship value
   */
  getCountryRelation(_country1, _country2) {
    // Simplified - in a full implementation, this would track bilateral relations
    return 50 + (Math.random() - 0.5) * 40;
  }

  /**
   * Get historical relationship factor
   */
  getHistoricalRelationshipFactor(countryCode) {
    // Simplified historical relationships
    const historicalRelations = {
      USA: 5, // Generally good relations with democracies
      GBR: 10, // Strong historical ties
      CAN: 15, // Very close neighbors
      DEU: 5, // Good modern relations
      FRA: 5, // Good modern relations
      CHN: -5, // Complex relationship
      RUS: -10, // Traditionally tense
    };

    return historicalRelations[countryCode] || 0;
  }

  /**
   * Escalate conflict
   */
  escalateConflict(conflict, _gameState) {
    conflict.severity += 10;
    conflict.economicDrain = (conflict.economicDrain || 0.001) * 1.5;
    conflict.approvalDrain = (conflict.approvalDrain || 0.1) * 1.3;

    this.eventSystem.emit('international:conflict_escalated', { conflict });
  }

  /**
   * Resolve conflict
   */
  resolveConflict(conflict, gameState) {
    const index = this.conflicts.indexOf(conflict);
    if (index > -1) {
      this.conflicts.splice(index, 1);
    }

    // Resolution benefits
    gameState.politics.approval += 2;
    gameState.country.diplomaticInfluence += 1;

    this.eventSystem.emit('international:conflict_resolved', { conflict });
  }

  /**
   * Get international overview
   */
  getInternationalOverview() {
    return {
      relationships: this.relationships,
      tradeAgreements: this.tradeAgreements,
      globalEconomy: this.globalEconomy,
      organizations: this.organizations,
      activeEvents: this.globalEvents,
      conflicts: this.conflicts,
    };
  }
}

// Create and export singleton instance
export const internationalRelationsSystem = new InternationalRelationsSystem();
