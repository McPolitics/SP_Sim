import { BaseComponent } from './BaseComponent';
import { eventSystem } from '../../core/EventSystem';
import { economicSimulation } from '../../core/EconomicSimulation';
import { gameEngine } from '../../core/GameEngine';

/**
 * DebugPanel - Development testing features
 * Only shown when debug mode is enabled
 */
export class DebugPanel extends BaseComponent {
  constructor() {
    super();

    // Only initialize if debug mode is enabled
    // eslint-disable-next-line no-undef
    if (typeof __ENABLE_DEBUG__ !== 'undefined' && __ENABLE_DEBUG__) {
      this.initializeDebugPanel();
      this.setupEventListeners();
    }
  }

  /**
   * Initialize the debug panel
   */
  initializeDebugPanel() {
    // Create debug panel container
    const debugPanel = this.createElement('div', 'debug-panel');
    debugPanel.innerHTML = `
      <div class="debug-header">
        <h3>🔧 Debug Panel</h3>
        <button class="btn btn--small debug-toggle" id="debug-toggle">Hide</button>
      </div>
      
      <div class="debug-content">
        <div class="debug-section">
          <h4>Game State</h4>
          <div class="debug-controls">
            <button class="btn btn--small" id="debug-advance-time">+10 Weeks</button>
            <button class="btn btn--small" id="debug-reset-game">Reset Game</button>
            <button class="btn btn--small" id="debug-save-state">Save State</button>
          </div>
          <div class="debug-info">
            <div>Week: <span id="debug-week">--</span></div>
            <div>Year: <span id="debug-year">--</span></div>
            <div>Approval: <span id="debug-approval">--</span>%</div>
          </div>
        </div>

        <div class="debug-section">
          <h4>Economic Testing</h4>
          <div class="debug-controls">
            <button class="btn btn--small" id="debug-trigger-boom">Trigger Boom</button>
            <button class="btn btn--small" id="debug-trigger-recession">Trigger Recession</button>
            <button class="btn btn--small" id="debug-random-shock">Random Shock</button>
            <button class="btn btn--small" id="debug-reset-economy">Reset Economy</button>
          </div>
          <div class="debug-info">
            <div>GDP Growth: <span id="debug-gdp">--</span>%</div>
            <div>Unemployment: <span id="debug-unemployment">--</span>%</div>
            <div>Cycle: <span id="debug-cycle">--</span></div>
          </div>
        </div>

        <div class="debug-section">
          <h4>Policy Testing</h4>
          <div class="debug-controls">
            <button class="btn btn--small" id="debug-all-policies">Apply All Policies</button>
            <button class="btn btn--small" id="debug-clear-policies">Clear Policies</button>
            <button class="btn btn--small" id="debug-max-stimulus">Max Stimulus</button>
          </div>
          <div class="debug-info">
            <div>Active Policies: <span id="debug-policies">--</span></div>
            <div>Confidence: <span id="debug-confidence">--</span></div>
          </div>
        </div>

        <div class="debug-section">
          <h4>Events & Shocks</h4>
          <div class="debug-controls">
            <button class="btn btn--small" id="debug-financial-crisis">Financial Crisis</button>
            <button class="btn btn--small" id="debug-tech-boom">Tech Innovation</button>
            <button class="btn btn--small" id="debug-natural-disaster">Natural Disaster</button>
            <button class="btn btn--small" id="debug-clear-shocks">Clear Shocks</button>
          </div>
          <div class="debug-info">
            <div>Active Shocks: <span id="debug-shocks">--</span></div>
            <div>Recent Events: <span id="debug-events">--</span></div>
          </div>
        </div>

        <div class="debug-section">
          <h4>Performance</h4>
          <div class="debug-controls">
            <button class="btn btn--small" id="debug-performance">Log Performance</button>
            <button class="btn btn--small" id="debug-memory">Memory Usage</button>
          </div>
          <div class="debug-info">
            <div>FPS: <span id="debug-fps">--</span></div>
            <div>Memory: <span id="debug-memory-usage">--</span>MB</div>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .debug-panel {
        position: fixed;
        top: 80px;
        right: 20px;
        width: 300px;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        border-radius: 8px;
        padding: 16px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .debug-panel.hidden {
        display: none;
      }
      
      .debug-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        border-bottom: 1px solid #333;
        padding-bottom: 8px;
      }
      
      .debug-header h3 {
        margin: 0;
        color: #00ff00;
        font-size: 14px;
      }
      
      .debug-section {
        margin-bottom: 16px;
        border-bottom: 1px solid #333;
        padding-bottom: 12px;
      }
      
      .debug-section h4 {
        margin: 0 0 8px 0;
        color: #ffff00;
        font-size: 12px;
      }
      
      .debug-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 8px;
      }
      
      .debug-controls .btn {
        font-size: 10px;
        padding: 4px 8px;
        background: #333;
        color: #fff;
        border: 1px solid #555;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .debug-controls .btn:hover {
        background: #555;
      }
      
      .debug-info {
        font-size: 10px;
        line-height: 1.4;
      }
      
      .debug-info div {
        margin-bottom: 2px;
      }
      
      .debug-toggle {
        background: #666 !important;
        color: #fff !important;
      }
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(debugPanel);
    this.element = debugPanel;

    this.setupDebugControls();
  }

  /**
   * Setup debug control handlers
   */
  setupDebugControls() {
    // Toggle visibility
    const toggleBtn = document.getElementById('debug-toggle');
    if (toggleBtn) {
      this.addEventListener(toggleBtn, 'click', () => {
        this.element.classList.toggle('hidden');
        toggleBtn.textContent = this.element.classList.contains('hidden') ? 'Show' : 'Hide';
      });
    }

    // Game state controls
    this.addEventListener(document.getElementById('debug-advance-time'), 'click', () => {
      for (let i = 0; i < 10; i += 1) {
        gameEngine.nextTurn();
      }
      this.updateDebugInfo();
    });

    this.addEventListener(document.getElementById('debug-reset-game'), 'click', () => {
      // eslint-disable-next-line no-restricted-globals
      if (confirm('Reset game to initial state?')) {
        gameEngine.gameState = gameEngine.createInitialGameState();
        this.updateDebugInfo();
      }
    });

    // Economic controls
    this.addEventListener(document.getElementById('debug-trigger-boom'), 'click', () => {
      economicSimulation.cycle.phase = 'expansion';
      economicSimulation.metrics.gdpGrowth = 5.0;
      economicSimulation.metrics.unemployment = 3.5;
      economicSimulation.metrics.confidence = 90;
      this.updateDebugInfo();
    });

    this.addEventListener(document.getElementById('debug-trigger-recession'), 'click', () => {
      economicSimulation.cycle.phase = 'recession';
      economicSimulation.metrics.gdpGrowth = -2.0;
      economicSimulation.metrics.unemployment = 9.0;
      economicSimulation.metrics.confidence = 25;
      this.updateDebugInfo();
    });

    this.addEventListener(document.getElementById('debug-random-shock'), 'click', () => {
      const shock = economicSimulation.generateRandomShock();
      economicSimulation.applyShock(shock);
      this.updateDebugInfo();
    });

    // Policy controls
    this.addEventListener(document.getElementById('debug-all-policies'), 'click', () => {
      const policies = [
        {
          type: 'fiscal_stimulus', name: 'Debug Stimulus', amount: 0.03, duration: 12,
        },
        {
          type: 'education_investment', name: 'Debug Education', amount: 0.04, duration: 24,
        },
        {
          type: 'infrastructure_investment', name: 'Debug Infrastructure', amount: 0.06, duration: 36,
        },
      ];

      policies.forEach((policy) => economicSimulation.applyPolicy(policy));
      this.updateDebugInfo();
    });

    this.addEventListener(document.getElementById('debug-clear-policies'), 'click', () => {
      economicSimulation.policies = [];
      this.updateDebugInfo();
    });

    // Shock controls
    this.addEventListener(document.getElementById('debug-financial-crisis'), 'click', () => {
      economicSimulation.applyShock({
        type: 'financial_crisis',
        magnitude: 2.0,
        message: 'Debug Financial Crisis',
        severity: 'danger',
      });
      this.updateDebugInfo();
    });

    this.addEventListener(document.getElementById('debug-tech-boom'), 'click', () => {
      economicSimulation.applyShock({
        type: 'tech_innovation',
        magnitude: 1.5,
        message: 'Debug Tech Innovation',
        severity: 'success',
      });
      this.updateDebugInfo();
    });

    this.addEventListener(document.getElementById('debug-natural-disaster'), 'click', () => {
      economicSimulation.applyShock({
        type: 'natural_disaster',
        magnitude: 1.2,
        message: 'Debug Natural Disaster',
        severity: 'danger',
      });
      this.updateDebugInfo();
    });

    this.addEventListener(document.getElementById('debug-clear-shocks'), 'click', () => {
      economicSimulation.shocks = [];
      this.updateDebugInfo();
    });

    // Performance controls
    this.addEventListener(document.getElementById('debug-performance'), 'click', () => {
      console.log('Performance Info:', {
        gameState: gameEngine.getGameState(),
        economicState: economicSimulation.getEconomicState(),
        fps: gameEngine.fps,
        memory: performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A',
      });
    });

    this.addEventListener(document.getElementById('debug-memory'), 'click', () => {
      if (performance.memory) {
        console.log('Memory Usage:', {
          used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`,
          total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)}MB`,
          limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
        });
      }
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    eventSystem.on('economic:update', () => {
      this.updateDebugInfo();
    });

    // Update debug info every 5 seconds
    setInterval(() => {
      this.updateDebugInfo();
    }, 5000);
  }

  /**
   * Update debug information display
   */
  updateDebugInfo() {
    if (!this.element) return;

    const gameState = gameEngine.getGameState();
    const economicState = economicSimulation.getEconomicState();

    // Game state
    this.updateElement('debug-week', gameState.time.week);
    this.updateElement('debug-year', gameState.time.year);
    this.updateElement('debug-approval', gameState.politics.approval);

    // Economic state
    this.updateElement('debug-gdp', economicState.metrics.gdpGrowth.toFixed(1));
    this.updateElement('debug-unemployment', economicState.metrics.unemployment.toFixed(1));
    this.updateElement('debug-cycle', economicState.cycle.phase);
    this.updateElement('debug-confidence', economicState.metrics.confidence.toFixed(0));

    // Policies and shocks
    this.updateElement('debug-policies', economicState.activePolicies);
    this.updateElement('debug-shocks', economicState.activeShocks);

    // Performance
    this.updateElement('debug-fps', gameEngine.fps || 0);
    if (performance.memory) {
      this.updateElement('debug-memory-usage', Math.round(performance.memory.usedJSHeapSize / 1024 / 1024));
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
}

export default DebugPanel;
