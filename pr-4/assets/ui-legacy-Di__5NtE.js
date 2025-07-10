;
(function () {
  System.register(['./core-legacy-oFe7g9uE.js'], function (exports, module) {
    'use strict';

    var eventSystem, EVENTS, economicSimulation;
    return {
      setters: [module => {
        eventSystem = module.e;
        EVENTS = module.E;
        economicSimulation = module.a;
      }],
      execute: function () {
        /**
         * BaseComponent - Base class for all UI components in SP_Sim
         * Provides common functionality for event handling and DOM manipulation
         */
        class BaseComponent {
          constructor(elementId) {
            this.element = elementId ? document.getElementById(elementId) : null;
            this.listeners = [];
            this.isVisible = true;
          }

          /**
           * Add event listener and track it for cleanup
           */
          addEventListener(element, event, handler) {
            const listener = {
              element,
              event,
              handler
            };
            element.addEventListener(event, handler);
            this.listeners.push(listener);
          }

          /**
           * Remove all event listeners
           */
          removeAllEventListeners() {
            this.listeners.forEach(({
              element,
              event,
              handler
            }) => {
              element.removeEventListener(event, handler);
            });
            this.listeners = [];
          }

          /**
           * Show the component
           */
          show() {
            if (this.element) {
              this.element.classList.remove('hidden');
              this.isVisible = true;
            }
          }

          /**
           * Hide the component
           */
          hide() {
            if (this.element) {
              this.element.classList.add('hidden');
              this.isVisible = false;
            }
          }

          /**
           * Toggle component visibility
           */
          toggle() {
            if (this.isVisible) {
              this.hide();
            } else {
              this.show();
            }
          }

          /**
           * Update component content
           */
          update(_data) {
            // To be implemented by subclasses
            console.warn('update() method not implemented in', this.constructor.name); // eslint-disable-line no-console
          }

          /**
           * Destroy the component and clean up
           */
          destroy() {
            this.removeAllEventListeners();
            if (this.element && this.element.parentNode) {
              this.element.parentNode.removeChild(this.element);
            }
          }

          /**
           * Set element text content safely
           */
          setTextContent(selector, text) {
            const element = this.element ? this.element.querySelector(selector) : document.querySelector(selector);
            if (element) {
              element.textContent = text;
            }
          }

          /**
           * Set element HTML content safely
           */
          setHTML(selector, html) {
            const element = this.element ? this.element.querySelector(selector) : document.querySelector(selector);
            if (element) {
              element.innerHTML = html;
            }
          }

          /**
           * Add CSS class to element
           */
          addClass(selector, className) {
            const element = this.element ? this.element.querySelector(selector) : document.querySelector(selector);
            if (element) {
              element.classList.add(className);
            }
          }

          /**
           * Remove CSS class from element
           */
          removeClass(selector, className) {
            const element = this.element ? this.element.querySelector(selector) : document.querySelector(selector);
            if (element) {
              element.classList.remove(className);
            }
          }

          /**
           * Format number with thousands separators
           */
          formatNumber(num, decimals = 0) {
            return new Intl.NumberFormat('en-US', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals
            }).format(num);
          }

          /**
           * Format percentage
           */
          formatPercentage(num, decimals = 1) {
            return `${this.formatNumber(num, decimals)}%`;
          }

          /**
           * Format currency
           */
          formatCurrency(num, currency = 'USD') {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency,
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(num);
          }

          /**
           * Create and append a DOM element
           */
          createElement(tag, className = '', content = '') {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (content) element.textContent = content;
            return element;
          }
        }
        exports("B", BaseComponent);

        /**
         * Dashboard - Main game interface component
         * Handles display of economic, political, and global indicators
         */
        class Dashboard extends BaseComponent {
          constructor() {
            super();
            this.initializeElements();
            this.setupEventListeners();
          }

          /**
           * Initialize dashboard elements
           */
          initializeElements() {
            // Header elements
            this.gameTimeElement = document.getElementById('game-time');
            this.approvalRatingElement = document.getElementById('approval-rating');
            this.nextElectionElement = document.getElementById('next-election');

            // Economic panel elements
            this.gdpGrowthElement = document.getElementById('gdp-growth');
            this.unemploymentElement = document.getElementById('unemployment');
            this.inflationElement = document.getElementById('inflation');
            this.nationalDebtElement = document.getElementById('national-debt');

            // Political panel elements
            this.coalitionSupportElement = document.getElementById('coalition-support');
            this.oppositionElement = document.getElementById('opposition');
            this.independentsElement = document.getElementById('independents');
            this.nextVoteElement = document.getElementById('next-vote');

            // Global panel elements
            this.intlStandingElement = document.getElementById('intl-standing');
            this.tradeBalanceElement = document.getElementById('trade-balance');
            this.diplomaticRelationsElement = document.getElementById('diplomatic-relations');

            // Events and decisions
            this.recentEventsElement = document.getElementById('recent-events');
            this.pendingDecisionsElement = document.getElementById('pending-decisions');

            // Game controls
            this.pauseBtn = document.getElementById('pause-btn');
            this.nextTurnBtn = document.getElementById('next-turn-btn');
            this.saveBtn = document.getElementById('save-btn');
            this.loadBtn = document.getElementById('load-btn');
          }

          /**
           * Setup event listeners
           */
          setupEventListeners() {
            // Listen for game state updates
            eventSystem.on(EVENTS.UI_UPDATE, event => {
              this.update(event.data.gameState);
            });
            eventSystem.on(EVENTS.TURN_END, event => {
              this.update(event.data.gameState);
            });

            // Game control buttons
            if (this.pauseBtn) {
              this.addEventListener(this.pauseBtn, 'click', () => {
                this.handlePauseToggle();
              });
            }
            if (this.nextTurnBtn) {
              this.addEventListener(this.nextTurnBtn, 'click', () => {
                eventSystem.emit(EVENTS.GAME_START); // Trigger next turn
              });
            }
            if (this.saveBtn) {
              this.addEventListener(this.saveBtn, 'click', () => {
                this.handleSaveGame();
              });
            }
            if (this.loadBtn) {
              this.addEventListener(this.loadBtn, 'click', () => {
                this.handleLoadGame();
              });
            }
          }

          /**
           * Update dashboard with current game state
           */
          update(gameState) {
            this.updateHeader(gameState);
            this.updateEconomicPanel(gameState);
            this.updatePoliticalPanel(gameState);
            this.updateGlobalPanel(gameState);
            this.updateEvents(gameState);
          }

          /**
           * Update header information
           */
          updateHeader(gameState) {
            if (this.gameTimeElement) {
              this.gameTimeElement.textContent = `Week ${gameState.time.week}, Year ${gameState.time.year}`;
            }
            if (this.approvalRatingElement) {
              const {
                approval
              } = gameState.politics;
              this.approvalRatingElement.textContent = `Approval: ${this.formatPercentage(approval)}`;

              // Add color coding
              this.approvalRatingElement.className = '';
              if (approval >= 60) {
                this.approvalRatingElement.classList.add('text-success');
              } else if (approval >= 40) ;else {
                this.approvalRatingElement.classList.add('text-danger');
              }
            }
            if (this.nextElectionElement) {
              const election = gameState.politics.nextElection;
              const weeksUntil = (election.year - gameState.time.year) * 52 + (election.week - gameState.time.week);
              this.nextElectionElement.textContent = `Next Election: ${weeksUntil}w`;
            }
          }

          /**
           * Update economic panel
           */
          updateEconomicPanel(gameState) {
            const {
              economy
            } = gameState;
            if (this.gdpGrowthElement) {
              const growth = economy.gdpGrowth;
              this.gdpGrowthElement.textContent = `${growth >= 0 ? '+' : ''}${this.formatNumber(growth, 1)}%`;
              this.gdpGrowthElement.className = growth >= 0 ? 'text-success' : 'text-danger';
            }
            if (this.unemploymentElement) {
              this.unemploymentElement.textContent = this.formatPercentage(economy.unemployment);
            }
            if (this.inflationElement) {
              const {
                inflation
              } = economy;
              this.inflationElement.textContent = this.formatPercentage(inflation, 1);
              this.inflationElement.className = '';
              if (inflation > 4) {
                this.inflationElement.classList.add('text-warning');
              } else if (inflation < 1) {
                this.inflationElement.classList.add('text-danger');
              }
            }
            if (this.nationalDebtElement) {
              const debtRatio = gameState.country.debt / gameState.country.gdp * 100;
              this.nationalDebtElement.textContent = `${this.formatPercentage(debtRatio)} of GDP`;
              if (debtRatio > 90) {
                this.nationalDebtElement.className = 'text-danger';
              } else if (debtRatio > 70) {
                this.nationalDebtElement.className = 'text-warning';
              } else {
                this.nationalDebtElement.className = '';
              }
            }
          }

          /**
           * Update political panel
           */
          updatePoliticalPanel(gameState) {
            const {
              politics
            } = gameState;
            if (this.coalitionSupportElement) {
              const coalitionSupport = politics.coalition.reduce((sum, party) => sum + party.support, 0);
              this.coalitionSupportElement.textContent = this.formatPercentage(coalitionSupport);
            }
            if (this.oppositionElement) {
              const oppositionSupport = politics.opposition.reduce((sum, party) => sum + party.support, 0);
              this.oppositionElement.textContent = this.formatPercentage(oppositionSupport);
            }
            if (this.independentsElement) {
              const totalSupport = [...politics.coalition, ...politics.opposition].reduce((sum, party) => sum + party.support, 0);
              const independents = Math.max(0, 100 - totalSupport);
              this.independentsElement.textContent = this.formatPercentage(independents);
            }
            if (this.nextVoteElement) {
              this.nextVoteElement.textContent = politics.nextVote ? politics.nextVote : 'None scheduled';
            }
          }

          /**
           * Update global panel
           */
          updateGlobalPanel(gameState) {
            const {
              global
            } = gameState;
            if (this.intlStandingElement) {
              this.intlStandingElement.textContent = global.internationalStanding;
            }
            if (this.tradeBalanceElement) {
              const balance = global.tradeBalance;
              this.tradeBalanceElement.textContent = `${this.formatCurrency(balance / 1000000000, 'USD')}B`;
              this.tradeBalanceElement.className = balance >= 0 ? 'text-success' : 'text-danger';
            }
            if (this.diplomaticRelationsElement) {
              const avgRelation = Object.values(global.relations).reduce((sum, val) => sum + val, 0) / Object.values(global.relations).length;
              this.diplomaticRelationsElement.textContent = this.formatNumber(avgRelation);
            }
          }

          /**
           * Update events and decisions
           */
          updateEvents(gameState) {
            // Update recent events
            if (this.recentEventsElement) {
              this.recentEventsElement.innerHTML = '';
              const events = gameState.events.recent.slice(-5); // Show last 5 events

              if (events.length === 0) {
                const li = this.createElement('li', '', 'No recent events');
                this.recentEventsElement.appendChild(li);
              } else {
                events.forEach(event => {
                  const li = this.createElement('li', '', event.description || event);
                  this.recentEventsElement.appendChild(li);
                });
              }
            }

            // Update pending decisions
            if (this.pendingDecisionsElement) {
              this.pendingDecisionsElement.innerHTML = '';
              const decisions = gameState.events.pending;
              if (decisions.length === 0) {
                const li = this.createElement('li', '', 'No pending decisions');
                this.pendingDecisionsElement.appendChild(li);
              } else {
                decisions.forEach(decision => {
                  const li = this.createElement('li', 'decision-item', decision.description || decision);
                  this.addEventListener(li, 'click', () => {
                    this.handleDecisionClick(decision);
                  });
                  this.pendingDecisionsElement.appendChild(li);
                });
              }
            }
          }

          /**
           * Handle pause/resume toggle
           */
          handlePauseToggle() {
            // This will be handled by the main game controller
            eventSystem.emit('game:pause_toggle');
          }

          /**
           * Handle save game
           */
          handleSaveGame() {
            const saveName = prompt('Enter a name for your save:');
            if (saveName !== null) {
              eventSystem.emit(EVENTS.GAME_SAVE, {
                saveName
              });
            }
          }

          /**
           * Handle load game
           */
          handleLoadGame() {
            // This would typically open a load game dialog
            // For now, we'll just emit an event
            eventSystem.emit('ui:load_game_dialog');
          }

          /**
           * Handle decision click
           */
          handleDecisionClick(decision) {
            // This would typically open a decision dialog
            eventSystem.emit('ui:decision_dialog', {
              decision
            });
            console.log('Decision clicked:', decision);
          }
        }
        exports("D", Dashboard);

        /**
         * Chart - Data visualization component for SP_Sim
         * Provides various chart types for displaying game metrics
         */
        class Chart extends BaseComponent {
          constructor(containerId, options = {}) {
            super(containerId);
            this.options = {
              type: 'line',
              // line, bar, pie, area
              width: 400,
              height: 200,
              data: [],
              labels: [],
              colors: ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6'],
              title: '',
              showGrid: true,
              showAxes: true,
              showLegend: true,
              ...options
            };
            this.canvas = null;
            this.ctx = null;
            this.initializeChart();
          }

          /**
           * Initialize chart canvas
           */
          initializeChart() {
            if (!this.element) {
              console.error('Chart container element not found');
              return;
            }

            // Create canvas element
            this.canvas = this.createElement('canvas');
            this.canvas.width = this.options.width;
            this.canvas.height = this.options.height;
            this.canvas.style.cssText = `
      max-width: 100%;
      height: auto;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
    `;
            this.element.innerHTML = '';
            this.element.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');
            this.render();
          }

          /**
           * Update chart with new data
           */
          updateData(data, labels = null) {
            this.options.data = data;
            if (labels) {
              this.options.labels = labels;
            }
            this.render();
          }

          /**
           * Render the chart
           */
          render() {
            if (!this.ctx) return;

            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Set up drawing context
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Calculate drawing area (leaving space for title, axes, legend)
            const margins = {
              top: this.options.title ? 30 : 20,
              right: 20,
              bottom: this.options.showAxes ? 40 : 20,
              left: this.options.showAxes ? 50 : 20
            };
            const chartArea = {
              x: margins.left,
              y: margins.top,
              width: this.canvas.width - margins.left - margins.right,
              height: this.canvas.height - margins.top - margins.bottom
            };

            // Draw title
            if (this.options.title) {
              this.drawTitle();
            }

            // Draw chart based on type
            switch (this.options.type) {
              case 'line':
                this.drawLineChart(chartArea);
                break;
              case 'bar':
                this.drawBarChart(chartArea);
                break;
              case 'pie':
                this.drawPieChart(chartArea);
                break;
              case 'area':
                this.drawAreaChart(chartArea);
                break;
              default:
                console.warn(`Chart type ${this.options.type} not supported`);
            }

            // Draw axes
            if (this.options.showAxes && this.options.type !== 'pie') {
              this.drawAxes(chartArea);
            }

            // Draw legend
            if (this.options.showLegend) {
              this.drawLegend(chartArea);
            }
          }

          /**
           * Draw chart title
           */
          drawTitle() {
            this.ctx.save();
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.options.title, this.canvas.width / 2, 15);
            this.ctx.restore();
          }

          /**
           * Draw line chart
           */
          drawLineChart(area) {
            const {
              data
            } = this.options;
            if (!data.length) return;
            const pointCount = data[0].values ? data[0].values.length : data.length;
            const stepX = area.width / Math.max(1, pointCount - 1);

            // Determine Y-axis range
            const allValues = data.flatMap(series => series.values ? series.values : [series]).filter(v => typeof v === 'number');
            const minY = Math.min(...allValues);
            const maxY = Math.max(...allValues);
            const rangeY = maxY - minY || 1;

            // Draw grid
            if (this.options.showGrid) {
              this.drawGrid(area, pointCount, 5);
            }

            // Draw data series
            data.forEach((series, seriesIndex) => {
              const color = this.options.colors[seriesIndex % this.options.colors.length];
              const values = series.values || [series];
              this.ctx.save();
              this.ctx.strokeStyle = color;
              this.ctx.lineWidth = 2;
              this.ctx.beginPath();
              values.forEach((value, index) => {
                const x = area.x + index * stepX;
                const y = area.y + area.height - (value - minY) / rangeY * area.height;
                if (index === 0) {
                  this.ctx.moveTo(x, y);
                } else {
                  this.ctx.lineTo(x, y);
                }
              });
              this.ctx.stroke();
              this.ctx.restore();

              // Draw points
              this.ctx.save();
              this.ctx.fillStyle = color;
              values.forEach((value, index) => {
                const x = area.x + index * stepX;
                const y = area.y + area.height - (value - minY) / rangeY * area.height;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
              });
              this.ctx.restore();
            });
          }

          /**
           * Draw bar chart
           */
          drawBarChart(area) {
            const {
              data
            } = this.options;
            if (!data.length) return;
            const values = data.map(item => item.value || item);
            const maxValue = Math.max(...values);
            const barWidth = area.width / data.length * 0.8;
            const barSpacing = area.width / data.length * 0.2;
            data.forEach((item, index) => {
              const value = item.value || item;
              const barHeight = value / maxValue * area.height;
              const x = area.x + index * (barWidth + barSpacing) + barSpacing / 2;
              const y = area.y + area.height - barHeight;
              const color = this.options.colors[index % this.options.colors.length];
              this.ctx.save();
              this.ctx.fillStyle = color;
              this.ctx.fillRect(x, y, barWidth, barHeight);

              // Draw value label
              this.ctx.fillStyle = '#2c3e50';
              this.ctx.textAlign = 'center';
              this.ctx.fillText(this.formatNumber(value), x + barWidth / 2, y - 10);
              this.ctx.restore();
            });
          }

          /**
           * Draw pie chart
           */
          drawPieChart(area) {
            const {
              data
            } = this.options;
            if (!data.length) return;
            const values = data.map(item => item.value || item);
            const total = values.reduce((sum, value) => sum + value, 0);
            const centerX = area.x + area.width / 2;
            const centerY = area.y + area.height / 2;
            const radius = Math.min(area.width, area.height) / 2 - 20;
            let currentAngle = -Math.PI / 2; // Start at top

            data.forEach((item, index) => {
              const value = item.value || item;
              const sliceAngle = value / total * 2 * Math.PI;
              const color = this.options.colors[index % this.options.colors.length];

              // Draw slice
              this.ctx.save();
              this.ctx.fillStyle = color;
              this.ctx.beginPath();
              this.ctx.moveTo(centerX, centerY);
              this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
              this.ctx.closePath();
              this.ctx.fill();

              // Draw slice border
              this.ctx.strokeStyle = '#ffffff';
              this.ctx.lineWidth = 2;
              this.ctx.stroke();
              this.ctx.restore();

              // Draw percentage label
              const labelAngle = currentAngle + sliceAngle / 2;
              const labelX = centerX + Math.cos(labelAngle) * radius * 0.7;
              const labelY = centerY + Math.sin(labelAngle) * radius * 0.7;
              const percentage = (value / total * 100).toFixed(1);
              this.ctx.save();
              this.ctx.fillStyle = '#ffffff';
              this.ctx.font = 'bold 10px Arial';
              this.ctx.textAlign = 'center';
              this.ctx.fillText(`${percentage}%`, labelX, labelY);
              this.ctx.restore();
              currentAngle += sliceAngle;
            });
          }

          /**
           * Draw area chart (filled line chart)
           */
          drawAreaChart(area) {
            const {
              data
            } = this.options;
            if (!data.length) return;
            const pointCount = data[0].values ? data[0].values.length : data.length;
            const stepX = area.width / Math.max(1, pointCount - 1);
            const allValues = data.flatMap(series => series.values ? series.values : [series]).filter(v => typeof v === 'number');
            const minY = Math.min(0, ...allValues);
            const maxY = Math.max(...allValues);
            const rangeY = maxY - minY || 1;

            // Draw filled areas
            data.forEach((series, seriesIndex) => {
              const color = this.options.colors[seriesIndex % this.options.colors.length];
              const values = series.values || [series];
              this.ctx.save();
              this.ctx.fillStyle = `${color}40`; // Add transparency
              this.ctx.beginPath();

              // Start from bottom left
              this.ctx.moveTo(area.x, area.y + area.height);
              values.forEach((value, index) => {
                const x = area.x + index * stepX;
                const y = area.y + area.height - (value - minY) / rangeY * area.height;
                this.ctx.lineTo(x, y);
              });

              // Close path to bottom right
              this.ctx.lineTo(area.x + (values.length - 1) * stepX, area.y + area.height);
              this.ctx.closePath();
              this.ctx.fill();
              this.ctx.restore();
            });

            // Draw line on top
            this.drawLineChart(area);
          }

          /**
           * Draw grid lines
           */
          drawGrid(area, xLines, yLines) {
            this.ctx.save();
            this.ctx.strokeStyle = '#e0e0e0';
            this.ctx.lineWidth = 1;

            // Vertical lines
            for (let i = 0; i <= xLines; i += 1) {
              const x = area.x + i / xLines * area.width;
              this.ctx.beginPath();
              this.ctx.moveTo(x, area.y);
              this.ctx.lineTo(x, area.y + area.height);
              this.ctx.stroke();
            }

            // Horizontal lines
            for (let i = 0; i <= yLines; i += 1) {
              const y = area.y + i / yLines * area.height;
              this.ctx.beginPath();
              this.ctx.moveTo(area.x, y);
              this.ctx.lineTo(area.x + area.width, y);
              this.ctx.stroke();
            }
            this.ctx.restore();
          }

          /**
           * Draw axes
           */
          drawAxes(area) {
            this.ctx.save();
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 2;

            // Y axis
            this.ctx.beginPath();
            this.ctx.moveTo(area.x, area.y);
            this.ctx.lineTo(area.x, area.y + area.height);
            this.ctx.stroke();

            // X axis
            this.ctx.beginPath();
            this.ctx.moveTo(area.x, area.y + area.height);
            this.ctx.lineTo(area.x + area.width, area.y + area.height);
            this.ctx.stroke();
            this.ctx.restore();

            // Draw labels if available
            if (this.options.labels.length > 0) {
              this.drawAxisLabels(area);
            }
          }

          /**
           * Draw axis labels
           */
          drawAxisLabels(area) {
            this.ctx.save();
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.options.labels.forEach((label, index) => {
              const x = area.x + index / (this.options.labels.length - 1) * area.width;
              const y = area.y + area.height + 15;
              this.ctx.fillText(label, x, y);
            });
            this.ctx.restore();
          }

          /**
           * Draw legend
           */
          drawLegend(area) {
            if (!this.options.data.some(item => item.name)) return;
            const legendY = area.y + area.height + 30;
            let legendX = area.x;
            const legendItemWidth = 100;
            this.ctx.save();
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'left';
            this.options.data.forEach((item, index) => {
              if (!item.name) return;
              const color = this.options.colors[index % this.options.colors.length];

              // Draw color box
              this.ctx.fillStyle = color;
              this.ctx.fillRect(legendX, legendY - 6, 12, 12);

              // Draw text
              this.ctx.fillStyle = '#2c3e50';
              this.ctx.fillText(item.name, legendX + 16, legendY);
              legendX += legendItemWidth;
            });
            this.ctx.restore();
          }
        }

        /**
         * EconomicsScreen - Detailed economic simulation interface
         * Shows comprehensive economic data, charts, and policy options
         */
        class EconomicsScreen extends BaseComponent {
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
              data: [{
                name: 'GDP Growth',
                values: [],
                color: '#3498db'
              }, {
                name: 'Unemployment',
                values: [],
                color: '#e74c3c'
              }, {
                name: 'Inflation',
                values: [],
                color: '#f39c12'
              }],
              showLegend: true
            });

            // Sector performance chart
            this.charts.sectors = new Chart('sector-performance-chart', {
              type: 'pie',
              width: 300,
              height: 200,
              title: 'Economic Sectors',
              data: [{
                name: 'Agriculture',
                value: 5
              }, {
                name: 'Manufacturing',
                value: 25
              }, {
                name: 'Services',
                value: 70
              }],
              showLegend: true
            });

            // Forecast chart
            this.charts.forecast = new Chart('forecast-chart', {
              type: 'line',
              width: 600,
              height: 200,
              title: 'Economic Forecast',
              data: [],
              showLegend: true
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
                  duration: 24
                });
              });
            }
            if (taxBtn) {
              this.addEventListener(taxBtn, 'click', () => {
                this.implementPolicy('tax_cut', {
                  name: 'Tax Cuts',
                  amount: 0.015,
                  duration: 52
                });
              });
            }
            if (taxIncreaseBtn) {
              this.addEventListener(taxIncreaseBtn, 'click', () => {
                this.implementPolicy('tax_increase', {
                  name: 'Tax Increase',
                  amount: 0.02,
                  duration: 52
                });
              });
            }
            if (infraBtn) {
              this.addEventListener(infraBtn, 'click', () => {
                this.implementPolicy('infrastructure_investment', {
                  name: 'Infrastructure Investment',
                  amount: 0.05,
                  duration: 104
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
                    duration: 1
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
                  duration: 78
                });
              });
            }
            if (healthcareBtn) {
              this.addEventListener(healthcareBtn, 'click', () => {
                this.implementPolicy('healthcare_investment', {
                  name: 'Healthcare Investment',
                  amount: 0.025,
                  duration: 104
                });
              });
            }
            if (greenEnergyBtn) {
              this.addEventListener(greenEnergyBtn, 'click', () => {
                this.implementPolicy('green_energy_investment', {
                  name: 'Green Energy Initiative',
                  amount: 0.04,
                  duration: 156
                });
              });
            }
            if (agriSubsidiesBtn) {
              this.addEventListener(agriSubsidiesBtn, 'click', () => {
                this.implementPolicy('agricultural_subsidies', {
                  name: 'Agricultural Subsidies',
                  amount: 0.006,
                  duration: 52
                });
              });
            }

            // Trade & Regulation Handlers
            if (tradePromotionBtn) {
              this.addEventListener(tradePromotionBtn, 'click', () => {
                this.implementPolicy('trade_promotion', {
                  name: 'Trade Promotion Initiative',
                  amount: 0.012,
                  duration: 39
                });
              });
            }
            if (regIncreaseBtn) {
              this.addEventListener(regIncreaseBtn, 'click', () => {
                this.implementPolicy('regulation_increase', {
                  name: 'Increase Regulations',
                  amount: 0.015,
                  duration: 26
                });
              });
            }
            if (regDecreaseBtn) {
              this.addEventListener(regDecreaseBtn, 'click', () => {
                this.implementPolicy('regulation_decrease', {
                  name: 'Decrease Regulations',
                  amount: 0.02,
                  duration: 26
                });
              });
            }
            if (minWageBtn) {
              this.addEventListener(minWageBtn, 'click', () => {
                this.implementPolicy('minimum_wage_increase', {
                  name: 'Minimum Wage Increase',
                  amount: 0.008,
                  duration: 26
                });
              });
            }
          }

          /**
           * Setup event listeners
           */
          setupEventListeners() {
            eventSystem.on('economic:update', event => {
              this.economicData = event.data;
              this.updateDisplay();
            });
            eventSystem.on('economic:event', event => {
              this.addEconomicEvent(event.data);
            });
            eventSystem.on('economic:policy_applied', _event => {
              this.updateActivePolicies();
            });
          }

          /**
           * Update the display with current economic data
           */
          updateDisplay() {
            if (!this.economicData) return;
            const {
              metrics,
              sectors,
              cycle
            } = this.economicData;

            // Update key metrics
            this.updateElement('gdp-growth-detailed', `${metrics.gdpGrowth.toFixed(1)}%`);
            this.updateElement('unemployment-detailed', `${metrics.unemployment.toFixed(1)}%`);
            this.updateElement('inflation-detailed', `${metrics.inflation.toFixed(1)}%`);
            this.updateElement('confidence-detailed', metrics.confidence.toFixed(0));

            // Update business cycle info
            this.updateElement('economic-phase', cycle.phase.charAt(0).toUpperCase() + cycle.phase.slice(1));
            this.updateElement('phase-duration', `${cycle.duration} weeks`);

            // Update sector information
            Object.keys(sectors).forEach(sectorName => {
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
            const trendData = [{
              name: 'GDP Growth',
              values: [metrics.gdpGrowth]
            }, {
              name: 'Unemployment',
              values: [metrics.unemployment]
            }, {
              name: 'Inflation',
              values: [metrics.inflation]
            }];
            this.charts.trends.updateData(trendData);
          }

          /**
           * Update sector chart
           */
          updateSectorChart(sectors) {
            const sectorData = Object.keys(sectors).map(name => ({
              name: name.charAt(0).toUpperCase() + name.slice(1),
              value: sectors[name].share * 100
            }));
            this.charts.sectors.updateData(sectorData);
          }

          /**
           * Update forecast chart
           */
          updateForecast() {
            this.forecast = economicSimulation.getForecast(12);
            const forecastData = [{
              name: 'GDP Growth',
              values: this.forecast.gdpGrowth
            }, {
              name: 'Unemployment',
              values: this.forecast.unemployment
            }, {
              name: 'Inflation',
              values: this.forecast.inflation
            }];
            const labels = Array.from({
              length: 12
            }, (_, i) => `Week ${i + 1}`);
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
              policy: {
                type,
                ...policy
              }
            });

            // Add to game events
            eventSystem.emit('economic:event', {
              type: 'policy_implemented',
              message: `Implemented: ${policy.name}`,
              severity: 'info'
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
        exports("E", EconomicsScreen);
      }
    };
  });
})();
//# sourceMappingURL=ui-legacy-Di__5NtE.js.map
