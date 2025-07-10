import { BaseComponent } from './BaseComponent';
import { Chart } from './Chart';
import { eventSystem } from '../../core/EventSystem';
import { economicSimulation } from '../../core/EconomicSimulation';

/**
 * EconomicsScreen - Detailed economic simulation interface
 * Shows comprehensive economic data, charts, and policy options
 */
export class EconomicsScreen extends BaseComponent {
  constructor() {
    super();
    this.charts = {};
    this.economicData = null;
    this.forecast = null;

    this.initializeScreen();
    this.setupEventListeners();
  }

  /**
   * Initialize the economics screen
   */
  initializeScreen() {
    // Create screen container
    let screenElement = document.querySelector('#screen-economy');
    if (!screenElement) {
      screenElement = this.createElement('div', 'screen');
      screenElement.id = 'screen-economy';

      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.appendChild(screenElement);
      }
    }

    this.element = screenElement;
    this.renderEconomicsScreen();
  }

  /**
   * Render the economics screen content
   */
  renderEconomicsScreen() {
    this.element.innerHTML = `
      <div class="economics-screen">
        <div class="economics-header">
          <h1>Economic Simulation</h1>
          <div class="economic-phase">
            <span class="phase-indicator">Current Phase: <strong id="economic-phase">Expansion</strong></span>
            <span class="phase-duration">Duration: <strong id="phase-duration">0 weeks</strong></span>
          </div>
        </div>

        <div class="economics-content">
          <!-- Key Metrics Dashboard -->
          <div class="metrics-grid">
            <div class="metric-card gdp-card">
              <h3>GDP Growth</h3>
              <div class="metric-value" id="gdp-growth-detailed">2.1%</div>
              <div class="metric-trend" id="gdp-trend">▲ Stable</div>
            </div>
            <div class="metric-card unemployment-card">
              <h3>Unemployment</h3>
              <div class="metric-value" id="unemployment-detailed">6.0%</div>
              <div class="metric-trend" id="unemployment-trend">▼ Decreasing</div>
            </div>
            <div class="metric-card inflation-card">
              <h3>Inflation</h3>
              <div class="metric-value" id="inflation-detailed">2.4%</div>
              <div class="metric-trend" id="inflation-trend">▲ Increasing</div>
            </div>
            <div class="metric-card confidence-card">
              <h3>Economic Confidence</h3>
              <div class="metric-value" id="confidence-detailed">75</div>
              <div class="metric-trend" id="confidence-trend">▲ Positive</div>
            </div>
          </div>

          <!-- Charts Section -->
          <div class="charts-section">
            <div class="chart-container">
              <h3>Economic Trends</h3>
              <div id="economic-trends-chart" class="chart"></div>
            </div>
            <div class="chart-container">
              <h3>Sector Performance</h3>
              <div id="sector-performance-chart" class="chart"></div>
            </div>
          </div>

          <!-- Forecast Section -->
          <div class="forecast-section">
            <h3>Economic Forecast (Next 12 Weeks)</h3>
            <div id="forecast-chart" class="chart"></div>
            <div class="forecast-summary">
              <p id="forecast-summary-text">Economic projections will be displayed here.</p>
            </div>
          </div>

          <!-- Sector Breakdown -->
          <div class="sectors-section">
            <h3>Economic Sectors</h3>
            <div class="sectors-grid">
              <div class="sector-card agriculture-sector">
                <h4>Agriculture</h4>
                <div class="sector-share" id="agriculture-share">5%</div>
                <div class="sector-growth" id="agriculture-growth">+1.2%</div>
              </div>
              <div class="sector-card manufacturing-sector">
                <h4>Manufacturing</h4>
                <div class="sector-share" id="manufacturing-share">25%</div>
                <div class="sector-growth" id="manufacturing-growth">+2.8%</div>
              </div>
              <div class="sector-card services-sector">
                <h4>Services</h4>
                <div class="sector-share" id="services-share">70%</div>
                <div class="sector-growth" id="services-growth">+2.0%</div>
              </div>
            </div>
          </div>

          <!-- Policy Tools -->
          <div class="policy-section">
            <h3>Economic Policy Tools</h3>
            <div class="policy-categories">
              <div class="policy-category fiscal-policies">
                <h4>Fiscal Policies</h4>
                <div class="policy-buttons">
                  <button class="btn btn--primary" id="fiscal-stimulus-btn">Fiscal Stimulus</button>
                  <button class="btn btn--primary" id="tax-cut-btn">Tax Cuts</button>
                  <button class="btn btn--secondary" id="tax-increase-btn">Tax Increase</button>
                  <button class="btn btn--primary" id="infrastructure-btn">Infrastructure Investment</button>
                </div>
              </div>
              
              <div class="policy-category monetary-policies">
                <h4>Monetary Policies</h4>
                <div class="policy-buttons">
                  <button class="btn btn--secondary" id="interest-rate-btn">Adjust Interest Rates</button>
                </div>
              </div>

              <div class="policy-category sector-policies">
                <h4>Sector-Specific Policies</h4>
                <div class="policy-buttons">
                  <button class="btn btn--primary" id="education-investment-btn">Education Investment</button>
                  <button class="btn btn--primary" id="healthcare-investment-btn">Healthcare Investment</button>
                  <button class="btn btn--primary" id="green-energy-btn">Green Energy Initiative</button>
                  <button class="btn btn--primary" id="agricultural-subsidies-btn">Agricultural Subsidies</button>
                </div>
              </div>

              <div class="policy-category trade-regulation">
                <h4>Trade & Regulation</h4>
                <div class="policy-buttons">
                  <button class="btn btn--primary" id="trade-promotion-btn">Trade Promotion</button>
                  <button class="btn btn--secondary" id="regulation-increase-btn">Increase Regulation</button>
                  <button class="btn btn--primary" id="regulation-decrease-btn">Decrease Regulation</button>
                  <button class="btn btn--primary" id="minimum-wage-btn">Minimum Wage Increase</button>
                </div>
              </div>
            </div>
            
            <div class="active-policies">
              <h4>Active Policies</h4>
              <ul id="active-policies-list">
                <li>No active economic policies</li>
              </ul>
            </div>
          </div>

          <!-- Economic Events -->
          <div class="events-section">
            <h3>Recent Economic Events</h3>
            <ul id="economic-events-list" class="events-list">
              <li>Economic simulation initialized</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    this.initializeCharts();
    this.setupPolicyButtons();
  }

  /**
   * Initialize charts
   */
  initializeCharts() {
    // Economic trends chart
    this.charts.trends = new Chart('economic-trends-chart', {
      type: 'line',
      width: 500,
      height: 200,
      title: 'Economic Indicators Over Time',
      data: [
        { name: 'GDP Growth', values: [], color: '#3498db' },
        { name: 'Unemployment', values: [], color: '#e74c3c' },
        { name: 'Inflation', values: [], color: '#f39c12' },
      ],
      showLegend: true,
    });

    // Sector performance chart
    this.charts.sectors = new Chart('sector-performance-chart', {
      type: 'pie',
      width: 300,
      height: 200,
      title: 'Economic Sectors',
      data: [
        { name: 'Agriculture', value: 5 },
        { name: 'Manufacturing', value: 25 },
        { name: 'Services', value: 70 },
      ],
      showLegend: true,
    });

    // Forecast chart
    this.charts.forecast = new Chart('forecast-chart', {
      type: 'line',
      width: 600,
      height: 200,
      title: 'Economic Forecast',
      data: [],
      showLegend: true,
    });
  }

  /**
   * Setup policy button event handlers
   */
  setupPolicyButtons() {
    // Fiscal Policies
    const fiscalBtn = document.getElementById('fiscal-stimulus-btn');
    const taxBtn = document.getElementById('tax-cut-btn');
    const taxIncreaseBtn = document.getElementById('tax-increase-btn');
    const infraBtn = document.getElementById('infrastructure-btn');

    // Monetary Policies
    const interestBtn = document.getElementById('interest-rate-btn');

    // Sector Policies
    const educationBtn = document.getElementById('education-investment-btn');
    const healthcareBtn = document.getElementById('healthcare-investment-btn');
    const greenEnergyBtn = document.getElementById('green-energy-btn');
    const agriSubsidiesBtn = document.getElementById('agricultural-subsidies-btn');

    // Trade & Regulation
    const tradePromotionBtn = document.getElementById('trade-promotion-btn');
    const regIncreaseBtn = document.getElementById('regulation-increase-btn');
    const regDecreaseBtn = document.getElementById('regulation-decrease-btn');
    const minWageBtn = document.getElementById('minimum-wage-btn');

    // Fiscal Policy Handlers
    if (fiscalBtn) {
      this.addEventListener(fiscalBtn, 'click', () => {
        this.implementPolicy('fiscal_stimulus', {
          name: 'Fiscal Stimulus Package',
          amount: 0.02,
          duration: 24,
        });
      });
    }

    if (taxBtn) {
      this.addEventListener(taxBtn, 'click', () => {
        this.implementPolicy('tax_cut', {
          name: 'Tax Cuts',
          amount: 0.015,
          duration: 52,
        });
      });
    }

    if (taxIncreaseBtn) {
      this.addEventListener(taxIncreaseBtn, 'click', () => {
        this.implementPolicy('tax_increase', {
          name: 'Tax Increase',
          amount: 0.02,
          duration: 52,
        });
      });
    }

    if (infraBtn) {
      this.addEventListener(infraBtn, 'click', () => {
        this.implementPolicy('infrastructure_investment', {
          name: 'Infrastructure Investment',
          amount: 0.05,
          duration: 104,
        });
      });
    }

    // Monetary Policy Handlers
    if (interestBtn) {
      this.addEventListener(interestBtn, 'click', () => {
        const change = prompt('Enter interest rate change (e.g., -0.5 for 0.5% decrease):');
        if (change !== null) {
          this.implementPolicy('interest_rate_change', {
            name: `Interest Rate ${parseFloat(change) > 0 ? 'Increase' : 'Decrease'}`,
            change: parseFloat(change) || 0,
            duration: 1,
          });
        }
      });
    }

    // Sector Policy Handlers
    if (educationBtn) {
      this.addEventListener(educationBtn, 'click', () => {
        this.implementPolicy('education_investment', {
          name: 'Education Investment',
          amount: 0.03,
          duration: 78,
        });
      });
    }

    if (healthcareBtn) {
      this.addEventListener(healthcareBtn, 'click', () => {
        this.implementPolicy('healthcare_investment', {
          name: 'Healthcare Investment',
          amount: 0.025,
          duration: 104,
        });
      });
    }

    if (greenEnergyBtn) {
      this.addEventListener(greenEnergyBtn, 'click', () => {
        this.implementPolicy('green_energy_investment', {
          name: 'Green Energy Initiative',
          amount: 0.04,
          duration: 156,
        });
      });
    }

    if (agriSubsidiesBtn) {
      this.addEventListener(agriSubsidiesBtn, 'click', () => {
        this.implementPolicy('agricultural_subsidies', {
          name: 'Agricultural Subsidies',
          amount: 0.006,
          duration: 52,
        });
      });
    }

    // Trade & Regulation Handlers
    if (tradePromotionBtn) {
      this.addEventListener(tradePromotionBtn, 'click', () => {
        this.implementPolicy('trade_promotion', {
          name: 'Trade Promotion Initiative',
          amount: 0.012,
          duration: 39,
        });
      });
    }

    if (regIncreaseBtn) {
      this.addEventListener(regIncreaseBtn, 'click', () => {
        this.implementPolicy('regulation_increase', {
          name: 'Increase Regulations',
          amount: 0.015,
          duration: 26,
        });
      });
    }

    if (regDecreaseBtn) {
      this.addEventListener(regDecreaseBtn, 'click', () => {
        this.implementPolicy('regulation_decrease', {
          name: 'Decrease Regulations',
          amount: 0.02,
          duration: 26,
        });
      });
    }

    if (minWageBtn) {
      this.addEventListener(minWageBtn, 'click', () => {
        this.implementPolicy('minimum_wage_increase', {
          name: 'Minimum Wage Increase',
          amount: 0.008,
          duration: 26,
        });
      });
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    eventSystem.on('economic:update', (event) => {
      this.economicData = event.data;
      this.updateDisplay();
    });

    eventSystem.on('economic:event', (event) => {
      this.addEconomicEvent(event.data);
    });

    eventSystem.on('economic:policy_applied', (_event) => {
      this.updateActivePolicies();
    });
  }

  /**
   * Update the display with current economic data
   */
  updateDisplay() {
    if (!this.economicData) return;

    const { metrics, sectors, cycle } = this.economicData;

    // Update key metrics
    this.updateElement('gdp-growth-detailed', `${metrics.gdpGrowth.toFixed(1)}%`);
    this.updateElement('unemployment-detailed', `${metrics.unemployment.toFixed(1)}%`);
    this.updateElement('inflation-detailed', `${metrics.inflation.toFixed(1)}%`);
    this.updateElement('confidence-detailed', metrics.confidence.toFixed(0));

    // Update business cycle info
    this.updateElement('economic-phase', cycle.phase.charAt(0).toUpperCase() + cycle.phase.slice(1));
    this.updateElement('phase-duration', `${cycle.duration} weeks`);

    // Update sector information
    Object.keys(sectors).forEach((sectorName) => {
      const sector = sectors[sectorName];
      this.updateElement(`${sectorName}-share`, `${(sector.share * 100).toFixed(0)}%`);
      this.updateElement(`${sectorName}-growth`, `${sector.currentGrowth?.toFixed(1) || sector.growth.toFixed(1)}%`);
    });

    // Update trends
    this.updateTrends(metrics);

    // Update sector chart
    this.updateSectorChart(sectors);

    // Update forecast
    this.updateForecast();
  }

  /**
   * Update trends chart
   */
  updateTrends(metrics) {
    // This would ideally store historical data
    // For now, we'll just update with current values
    const trendData = [
      { name: 'GDP Growth', values: [metrics.gdpGrowth] },
      { name: 'Unemployment', values: [metrics.unemployment] },
      { name: 'Inflation', values: [metrics.inflation] },
    ];

    this.charts.trends.updateData(trendData);
  }

  /**
   * Update sector chart
   */
  updateSectorChart(sectors) {
    const sectorData = Object.keys(sectors).map((name) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: sectors[name].share * 100,
    }));

    this.charts.sectors.updateData(sectorData);
  }

  /**
   * Update forecast chart
   */
  updateForecast() {
    this.forecast = economicSimulation.getForecast(12);

    const forecastData = [
      { name: 'GDP Growth', values: this.forecast.gdpGrowth },
      { name: 'Unemployment', values: this.forecast.unemployment },
      { name: 'Inflation', values: this.forecast.inflation },
    ];

    const labels = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);

    this.charts.forecast.updateData(forecastData, labels);

    // Update forecast summary
    const summaryText = this.generateForecastSummary();
    this.updateElement('forecast-summary-text', summaryText);
  }

  /**
   * Generate forecast summary text
   */
  generateForecastSummary() {
    if (!this.forecast) return 'Forecast data not available.';

    const finalGDP = this.forecast.gdpGrowth[this.forecast.gdpGrowth.length - 1];
    const finalUnemployment = this.forecast.unemployment[this.forecast.unemployment.length - 1];
    const finalInflation = this.forecast.inflation[this.forecast.inflation.length - 1];

    let summary = 'Economic forecast shows ';

    if (finalGDP > this.economicData.metrics.gdpGrowth) {
      summary += 'improving growth, ';
    } else {
      summary += 'slowing growth, ';
    }

    if (finalUnemployment < this.economicData.metrics.unemployment) {
      summary += 'decreasing unemployment, ';
    } else {
      summary += 'rising unemployment, ';
    }

    summary += `and inflation ${finalInflation > 3 ? 'above target' : 'near target'}.`;

    return summary;
  }

  /**
   * Implement economic policy
   */
  implementPolicy(type, policy) {
    eventSystem.emit('policy:implemented', {
      policy: { type, ...policy },
    });

    // Add to game events
    eventSystem.emit('economic:event', {
      type: 'policy_implemented',
      message: `Implemented: ${policy.name}`,
      severity: 'info',
    });
  }

  /**
   * Update active policies display
   */
  updateActivePolicies() {
    const economicState = economicSimulation.getEconomicState();
    const policiesList = document.getElementById('active-policies-list');

    if (policiesList) {
      if (economicState.activePolicies === 0) {
        policiesList.innerHTML = '<li>No active economic policies</li>';
      } else {
        policiesList.innerHTML = `<li>${economicState.activePolicies} active economic policies</li>`;
      }
    }
  }

  /**
   * Add economic event to the events list
   */
  addEconomicEvent(event) {
    const eventsList = document.getElementById('economic-events-list');
    if (eventsList) {
      const eventItem = this.createElement('li', `event-${event.severity || 'info'}`, event.message);
      eventsList.insertBefore(eventItem, eventsList.firstChild);

      // Keep only last 10 events
      while (eventsList.children.length > 10) {
        eventsList.removeChild(eventsList.lastChild);
      }
    }
  }

  /**
   * Update element text content safely
   */
  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  /**
   * Show the economics screen
   */
  show() {
    super.show();

    // Update display when screen becomes visible
    this.economicData = economicSimulation.getEconomicState();
    this.updateDisplay();
  }
}

export default EconomicsScreen;
