function __vite_legacy_guard() {
  import.meta.url;
  import("_").catch(() => 1);
  (async function* () {
  })().next();
}
;
import { e as eventSystem, E as EVENTS, g as gameEngine, a as economicSimulation } from "./core-KNov-pXX.js";
import { B as BaseComponent, D as Dashboard, E as EconomicsScreen } from "./ui-bb_sq3CC.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
class Navigation extends BaseComponent {
  constructor() {
    super();
    this.currentScreen = "dashboard";
    this.screens = {
      dashboard: "Dashboard",
      economy: "Economy",
      politics: "Politics",
      global: "Global Relations",
      policies: "Policies",
      crisis: "Crisis Management",
      analytics: "Analytics"
    };
    this.initializeNavigation();
    this.setupEventListeners();
  }
  /**
   * Initialize navigation elements
   */
  initializeNavigation() {
    let navElement = document.querySelector(".navigation");
    if (!navElement) {
      navElement = this.createElement("nav", "navigation");
      const header = document.querySelector(".header");
      if (header) {
        header.appendChild(navElement);
      }
    }
    this.element = navElement;
    this.renderNavigationMenu();
  }
  /**
   * Render navigation menu
   */
  renderNavigationMenu() {
    const navList = this.createElement("ul", "navigation__menu");
    Object.entries(this.screens).forEach(([screenId, screenName]) => {
      const listItem = this.createElement("li", "navigation__item");
      const link = this.createElement("a", "navigation__link", screenName);
      link.setAttribute("href", "#".concat(screenId));
      link.setAttribute("data-screen", screenId);
      if (screenId === this.currentScreen) {
        link.classList.add("navigation__link--active");
      }
      listItem.appendChild(link);
      navList.appendChild(listItem);
    });
    this.element.innerHTML = "";
    this.element.appendChild(navList);
  }
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.addEventListener(this.element, "click", (e) => {
      e.preventDefault();
      const link = e.target.closest(".navigation__link");
      if (link) {
        const screenId = link.getAttribute("data-screen");
        this.navigateToScreen(screenId);
      }
    });
    eventSystem.on("navigation:goto", (event) => {
      this.navigateToScreen(event.data.screen);
    });
  }
  /**
   * Navigate to a specific screen
   */
  navigateToScreen(screenId) {
    if (!this.screens[screenId] || screenId === this.currentScreen) {
      return;
    }
    const currentActiveLink = this.element.querySelector(".navigation__link--active");
    if (currentActiveLink) {
      currentActiveLink.classList.remove("navigation__link--active");
    }
    const newActiveLink = this.element.querySelector('[data-screen="'.concat(screenId, '"]'));
    if (newActiveLink) {
      newActiveLink.classList.add("navigation__link--active");
    }
    const previousScreen = this.currentScreen;
    this.currentScreen = screenId;
    eventSystem.emit(EVENTS.UI_UPDATE, {
      type: "navigation",
      from: previousScreen,
      to: screenId,
      screenTitle: this.screens[screenId]
    });
    if (window.history) {
      window.history.pushState(
        { screen: screenId },
        this.screens[screenId],
        "#".concat(screenId)
      );
    }
    console.log("Navigated to ".concat(this.screens[screenId]));
  }
  /**
   * Get current screen
   */
  getCurrentScreen() {
    return this.currentScreen;
  }
  /**
   * Update navigation based on game state
   */
  update(gameState) {
    this.updateScreenBadges(gameState);
  }
  /**
   * Update screen badges for notifications
   */
  updateScreenBadges(gameState) {
    this.element.querySelectorAll(".navigation__badge").forEach((badge) => {
      badge.remove();
    });
    if (gameState.events.pending.length > 0) {
      this.addScreenBadge("policies", gameState.events.pending.length);
    }
    if (gameState.scandals.active.length > 0) {
      this.addScreenBadge("crisis", gameState.scandals.active.length);
    }
    if (gameState.economy.gdpGrowth < 0 || gameState.economy.unemployment > 8) {
      this.addScreenBadge("economy", "!");
    }
  }
  /**
   * Add a badge to a navigation screen
   */
  addScreenBadge(screenId, content) {
    const link = this.element.querySelector('[data-screen="'.concat(screenId, '"]'));
    if (link) {
      const badge = this.createElement("span", "navigation__badge", content);
      link.appendChild(badge);
    }
  }
}
class Modal extends BaseComponent {
  constructor(options = {}) {
    super();
    this.options = {
      title: "Dialog",
      content: "",
      type: "info",
      // info, confirm, form, custom
      confirmText: "OK",
      cancelText: "Cancel",
      showCancel: false,
      onConfirm: null,
      onCancel: null,
      backdrop: true,
      closeable: true,
      ...options
    };
    this.isOpen = false;
    this.createModal();
  }
  /**
   * Create modal structure
   */
  createModal() {
    this.backdrop = this.createElement("div", "modal-backdrop");
    if (!this.options.backdrop) {
      this.backdrop.style.background = "transparent";
      this.backdrop.style.pointerEvents = "none";
    }
    this.element = this.createElement("div", "modal");
    this.modalContent = this.createElement("div", "modal__content");
    this.modalHeader = this.createElement("div", "modal__header");
    this.modalTitle = this.createElement("h3", "modal__title", this.options.title);
    this.modalHeader.appendChild(this.modalTitle);
    if (this.options.closeable) {
      this.closeButton = this.createElement("button", "modal__close", "×");
      this.modalHeader.appendChild(this.closeButton);
    }
    this.modalBody = this.createElement("div", "modal__body");
    this.setContent(this.options.content);
    this.modalFooter = this.createElement("div", "modal__footer");
    this.createFooterButtons();
    this.modalContent.appendChild(this.modalHeader);
    this.modalContent.appendChild(this.modalBody);
    this.modalContent.appendChild(this.modalFooter);
    this.element.appendChild(this.modalContent);
    this.backdrop.appendChild(this.element);
    this.setupEventListeners();
    this.hide();
  }
  /**
   * Create footer buttons based on modal type
   */
  createFooterButtons() {
    this.modalFooter.innerHTML = "";
    if (this.options.showCancel || this.options.type === "confirm") {
      this.cancelButton = this.createElement("button", "btn btn--secondary", this.options.cancelText);
      this.modalFooter.appendChild(this.cancelButton);
    }
    this.confirmButton = this.createElement("button", "btn btn--primary", this.options.confirmText);
    this.modalFooter.appendChild(this.confirmButton);
  }
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (this.closeButton) {
      this.addEventListener(this.closeButton, "click", () => {
        this.close();
      });
    }
    if (this.cancelButton) {
      this.addEventListener(this.cancelButton, "click", () => {
        this.cancel();
      });
    }
    if (this.confirmButton) {
      this.addEventListener(this.confirmButton, "click", () => {
        this.confirm();
      });
    }
    if (this.options.backdrop && this.options.closeable) {
      this.addEventListener(this.backdrop, "click", (e) => {
        if (e.target === this.backdrop) {
          this.close();
        }
      });
    }
    this.addEventListener(document, "keydown", (e) => {
      if (e.key === "Escape" && this.isOpen && this.options.closeable) {
        this.close();
      }
    });
  }
  /**
   * Set modal content
   */
  setContent(content) {
    if (typeof content === "string") {
      this.modalBody.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.modalBody.innerHTML = "";
      this.modalBody.appendChild(content);
    }
  }
  /**
   * Set modal title
   */
  setTitle(title) {
    this.options.title = title;
    this.modalTitle.textContent = title;
  }
  /**
   * Show the modal
   */
  show() {
    if (this.isOpen) return;
    document.body.appendChild(this.backdrop);
    requestAnimationFrame(() => {
      this.backdrop.classList.add("modal-backdrop--visible");
      this.element.classList.add("modal--visible");
    });
    this.isOpen = true;
    if (this.options.type === "form") {
      const firstInput = this.modalBody.querySelector("input, textarea, select");
      if (firstInput) {
        firstInput.focus();
      }
    }
    eventSystem.emit("modal:show", { modal: this });
  }
  /**
   * Hide the modal
   */
  hide() {
    if (!this.isOpen) return;
    this.backdrop.classList.remove("modal-backdrop--visible");
    this.element.classList.remove("modal--visible");
    setTimeout(() => {
      if (this.backdrop.parentNode) {
        document.body.removeChild(this.backdrop);
      }
    }, 300);
    this.isOpen = false;
    eventSystem.emit("modal:hide", { modal: this });
  }
  /**
   * Close modal (same as hide but can be overridden)
   */
  close() {
    this.hide();
  }
  /**
   * Handle confirm action
   */
  confirm() {
    let result = true;
    if (this.options.type === "form") {
      const formData = this.collectFormData();
      if (this.options.onConfirm) {
        result = this.options.onConfirm(formData);
      }
    } else if (this.options.onConfirm) {
      result = this.options.onConfirm();
    }
    if (result !== false) {
      this.hide();
    }
  }
  /**
   * Handle cancel action
   */
  cancel() {
    if (this.options.onCancel) {
      this.options.onCancel();
    }
    this.hide();
  }
  /**
   * Collect form data from modal body
   */
  collectFormData() {
    const formData = {};
    const inputs = this.modalBody.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      const name = input.name || input.id;
      if (name) {
        if (input.type === "checkbox") {
          formData[name] = input.checked;
        } else if (input.type === "radio") {
          if (input.checked) {
            formData[name] = input.value;
          }
        } else {
          formData[name] = input.value;
        }
      }
    });
    return formData;
  }
  /**
   * Static method to create quick confirmation dialog
   */
  static confirm(title, message, onConfirm, onCancel) {
    return new Modal({
      title,
      content: "<p>".concat(message, "</p>"),
      type: "confirm",
      confirmText: "Yes",
      cancelText: "No",
      showCancel: true,
      onConfirm,
      onCancel
    }).show();
  }
  /**
   * Static method to create quick alert dialog
   */
  static alert(title, message, onConfirm) {
    return new Modal({
      title,
      content: "<p>".concat(message, "</p>"),
      type: "info",
      confirmText: "OK",
      onConfirm
    }).show();
  }
  /**
   * Static method to create quick prompt dialog
   */
  static prompt(title, message, onConfirm, defaultValue = "") {
    const content = "\n      <p>".concat(message, '</p>\n      <input type="text" name="value" value="').concat(defaultValue, '" class="form-input" style="width: 100%; margin-top: 10px;">\n    ');
    return new Modal({
      title,
      content,
      type: "form",
      confirmText: "OK",
      cancelText: "Cancel",
      showCancel: true,
      onConfirm: (formData) => {
        if (onConfirm) {
          onConfirm(formData.value);
        }
        return true;
      }
    }).show();
  }
  /**
   * Destroy modal and clean up
   */
  destroy() {
    this.hide();
    this.removeAllEventListeners();
  }
}
class DebugPanel extends BaseComponent {
  constructor() {
    super();
    {
      this.initializeDebugPanel();
      this.setupEventListeners();
    }
  }
  /**
   * Initialize the debug panel
   */
  initializeDebugPanel() {
    const debugPanel = this.createElement("div", "debug-panel");
    debugPanel.innerHTML = '\n      <div class="debug-header">\n        <h3>🔧 Debug Panel</h3>\n        <button class="btn btn--small debug-toggle" id="debug-toggle">Hide</button>\n      </div>\n      \n      <div class="debug-content">\n        <div class="debug-section">\n          <h4>Game State</h4>\n          <div class="debug-controls">\n            <button class="btn btn--small" id="debug-advance-time">+10 Weeks</button>\n            <button class="btn btn--small" id="debug-reset-game">Reset Game</button>\n            <button class="btn btn--small" id="debug-save-state">Save State</button>\n          </div>\n          <div class="debug-info">\n            <div>Week: <span id="debug-week">--</span></div>\n            <div>Year: <span id="debug-year">--</span></div>\n            <div>Approval: <span id="debug-approval">--</span>%</div>\n          </div>\n        </div>\n\n        <div class="debug-section">\n          <h4>Economic Testing</h4>\n          <div class="debug-controls">\n            <button class="btn btn--small" id="debug-trigger-boom">Trigger Boom</button>\n            <button class="btn btn--small" id="debug-trigger-recession">Trigger Recession</button>\n            <button class="btn btn--small" id="debug-random-shock">Random Shock</button>\n            <button class="btn btn--small" id="debug-reset-economy">Reset Economy</button>\n          </div>\n          <div class="debug-info">\n            <div>GDP Growth: <span id="debug-gdp">--</span>%</div>\n            <div>Unemployment: <span id="debug-unemployment">--</span>%</div>\n            <div>Cycle: <span id="debug-cycle">--</span></div>\n          </div>\n        </div>\n\n        <div class="debug-section">\n          <h4>Policy Testing</h4>\n          <div class="debug-controls">\n            <button class="btn btn--small" id="debug-all-policies">Apply All Policies</button>\n            <button class="btn btn--small" id="debug-clear-policies">Clear Policies</button>\n            <button class="btn btn--small" id="debug-max-stimulus">Max Stimulus</button>\n          </div>\n          <div class="debug-info">\n            <div>Active Policies: <span id="debug-policies">--</span></div>\n            <div>Confidence: <span id="debug-confidence">--</span></div>\n          </div>\n        </div>\n\n        <div class="debug-section">\n          <h4>Events & Shocks</h4>\n          <div class="debug-controls">\n            <button class="btn btn--small" id="debug-financial-crisis">Financial Crisis</button>\n            <button class="btn btn--small" id="debug-tech-boom">Tech Innovation</button>\n            <button class="btn btn--small" id="debug-natural-disaster">Natural Disaster</button>\n            <button class="btn btn--small" id="debug-clear-shocks">Clear Shocks</button>\n          </div>\n          <div class="debug-info">\n            <div>Active Shocks: <span id="debug-shocks">--</span></div>\n            <div>Recent Events: <span id="debug-events">--</span></div>\n          </div>\n        </div>\n\n        <div class="debug-section">\n          <h4>Performance</h4>\n          <div class="debug-controls">\n            <button class="btn btn--small" id="debug-performance">Log Performance</button>\n            <button class="btn btn--small" id="debug-memory">Memory Usage</button>\n          </div>\n          <div class="debug-info">\n            <div>FPS: <span id="debug-fps">--</span></div>\n            <div>Memory: <span id="debug-memory-usage">--</span>MB</div>\n          </div>\n        </div>\n      </div>\n    ';
    const style = document.createElement("style");
    style.textContent = "\n      .debug-panel {\n        position: fixed;\n        top: 80px;\n        right: 20px;\n        width: 300px;\n        background: rgba(0, 0, 0, 0.9);\n        color: #00ff00;\n        border-radius: 8px;\n        padding: 16px;\n        font-family: 'Courier New', monospace;\n        font-size: 12px;\n        z-index: 10000;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);\n        max-height: 80vh;\n        overflow-y: auto;\n      }\n      \n      .debug-panel.hidden {\n        display: none;\n      }\n      \n      .debug-header {\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        margin-bottom: 16px;\n        border-bottom: 1px solid #333;\n        padding-bottom: 8px;\n      }\n      \n      .debug-header h3 {\n        margin: 0;\n        color: #00ff00;\n        font-size: 14px;\n      }\n      \n      .debug-section {\n        margin-bottom: 16px;\n        border-bottom: 1px solid #333;\n        padding-bottom: 12px;\n      }\n      \n      .debug-section h4 {\n        margin: 0 0 8px 0;\n        color: #ffff00;\n        font-size: 12px;\n      }\n      \n      .debug-controls {\n        display: flex;\n        flex-wrap: wrap;\n        gap: 4px;\n        margin-bottom: 8px;\n      }\n      \n      .debug-controls .btn {\n        font-size: 10px;\n        padding: 4px 8px;\n        background: #333;\n        color: #fff;\n        border: 1px solid #555;\n        border-radius: 4px;\n        cursor: pointer;\n      }\n      \n      .debug-controls .btn:hover {\n        background: #555;\n      }\n      \n      .debug-info {\n        font-size: 10px;\n        line-height: 1.4;\n      }\n      \n      .debug-info div {\n        margin-bottom: 2px;\n      }\n      \n      .debug-toggle {\n        background: #666 !important;\n        color: #fff !important;\n      }\n    ";
    document.head.appendChild(style);
    document.body.appendChild(debugPanel);
    this.element = debugPanel;
    this.setupDebugControls();
  }
  /**
   * Setup debug control handlers
   */
  setupDebugControls() {
    const toggleBtn = document.getElementById("debug-toggle");
    if (toggleBtn) {
      this.addEventListener(toggleBtn, "click", () => {
        this.element.classList.toggle("hidden");
        toggleBtn.textContent = this.element.classList.contains("hidden") ? "Show" : "Hide";
      });
    }
    this.addEventListener(document.getElementById("debug-advance-time"), "click", () => {
      for (let i = 0; i < 10; i += 1) {
        gameEngine.nextTurn();
      }
      this.updateDebugInfo();
    });
    this.addEventListener(document.getElementById("debug-reset-game"), "click", () => {
      if (confirm("Reset game to initial state?")) {
        gameEngine.gameState = gameEngine.createInitialGameState();
        this.updateDebugInfo();
      }
    });
    this.addEventListener(document.getElementById("debug-trigger-boom"), "click", () => {
      economicSimulation.cycle.phase = "expansion";
      economicSimulation.metrics.gdpGrowth = 5;
      economicSimulation.metrics.unemployment = 3.5;
      economicSimulation.metrics.confidence = 90;
      this.updateDebugInfo();
    });
    this.addEventListener(document.getElementById("debug-trigger-recession"), "click", () => {
      economicSimulation.cycle.phase = "recession";
      economicSimulation.metrics.gdpGrowth = -2;
      economicSimulation.metrics.unemployment = 9;
      economicSimulation.metrics.confidence = 25;
      this.updateDebugInfo();
    });
    this.addEventListener(document.getElementById("debug-random-shock"), "click", () => {
      const shock = economicSimulation.generateRandomShock();
      economicSimulation.applyShock(shock);
      this.updateDebugInfo();
    });
    this.addEventListener(document.getElementById("debug-all-policies"), "click", () => {
      const policies = [
        {
          type: "fiscal_stimulus",
          name: "Debug Stimulus",
          amount: 0.03,
          duration: 12
        },
        {
          type: "education_investment",
          name: "Debug Education",
          amount: 0.04,
          duration: 24
        },
        {
          type: "infrastructure_investment",
          name: "Debug Infrastructure",
          amount: 0.06,
          duration: 36
        }
      ];
      policies.forEach((policy) => economicSimulation.applyPolicy(policy));
      this.updateDebugInfo();
    });
    this.addEventListener(document.getElementById("debug-clear-policies"), "click", () => {
      economicSimulation.policies = [];
      this.updateDebugInfo();
    });
    this.addEventListener(document.getElementById("debug-financial-crisis"), "click", () => {
      economicSimulation.applyShock({
        type: "financial_crisis",
        magnitude: 2,
        message: "Debug Financial Crisis",
        severity: "danger"
      });
      this.updateDebugInfo();
    });
    this.addEventListener(document.getElementById("debug-tech-boom"), "click", () => {
      economicSimulation.applyShock({
        type: "tech_innovation",
        magnitude: 1.5,
        message: "Debug Tech Innovation",
        severity: "success"
      });
      this.updateDebugInfo();
    });
    this.addEventListener(document.getElementById("debug-natural-disaster"), "click", () => {
      economicSimulation.applyShock({
        type: "natural_disaster",
        magnitude: 1.2,
        message: "Debug Natural Disaster",
        severity: "danger"
      });
      this.updateDebugInfo();
    });
    this.addEventListener(document.getElementById("debug-clear-shocks"), "click", () => {
      economicSimulation.shocks = [];
      this.updateDebugInfo();
    });
    this.addEventListener(document.getElementById("debug-performance"), "click", () => {
      console.log("Performance Info:", {
        gameState: gameEngine.getGameState(),
        economicState: economicSimulation.getEconomicState(),
        fps: gameEngine.fps,
        memory: performance.memory ? "".concat(Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), "MB") : "N/A"
      });
    });
    this.addEventListener(document.getElementById("debug-memory"), "click", () => {
      if (performance.memory) {
        console.log("Memory Usage:", {
          used: "".concat(Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), "MB"),
          total: "".concat(Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), "MB"),
          limit: "".concat(Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024), "MB")
        });
      }
    });
  }
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    eventSystem.on("economic:update", () => {
      this.updateDebugInfo();
    });
    setInterval(() => {
      this.updateDebugInfo();
    }, 5e3);
  }
  /**
   * Update debug information display
   */
  updateDebugInfo() {
    if (!this.element) return;
    const gameState = gameEngine.getGameState();
    const economicState = economicSimulation.getEconomicState();
    this.updateElement("debug-week", gameState.time.week);
    this.updateElement("debug-year", gameState.time.year);
    this.updateElement("debug-approval", gameState.politics.approval);
    this.updateElement("debug-gdp", economicState.metrics.gdpGrowth.toFixed(1));
    this.updateElement("debug-unemployment", economicState.metrics.unemployment.toFixed(1));
    this.updateElement("debug-cycle", economicState.cycle.phase);
    this.updateElement("debug-confidence", economicState.metrics.confidence.toFixed(0));
    this.updateElement("debug-policies", economicState.activePolicies);
    this.updateElement("debug-shocks", economicState.activeShocks);
    this.updateElement("debug-fps", gameEngine.fps || 0);
    if (performance.memory) {
      this.updateElement("debug-memory-usage", Math.round(performance.memory.usedJSHeapSize / 1024 / 1024));
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
class SPSimApp {
  constructor() {
    this.gameEngine = gameEngine;
    this.eventSystem = eventSystem;
    this.dashboard = null;
    this.navigation = null;
    this.economicsScreen = null;
    this.debugPanel = null;
    this.currentScreen = "dashboard";
    this.isInitialized = false;
  }
  /**
   * Initialize the application
   */
  async initialize() {
    try {
      console.log("🎮 Starting SP_Sim - Political Economy Simulation");
      this.gameEngine.initialize();
      this.initializeUI();
      this.setupEventListeners();
      this.setupErrorHandling();
      this.gameEngine.start();
      this.isInitialized = true;
      console.log("✅ SP_Sim initialized successfully");
      this.updateUI();
    } catch (error) {
      console.error("❌ Failed to initialize SP_Sim:", error);
      this.showError("Failed to initialize game. Please refresh the page.");
    }
  }
  /**
   * Initialize UI components
   */
  initializeUI() {
    this.navigation = new Navigation();
    this.dashboard = new Dashboard();
    this.economicsScreen = new EconomicsScreen();
    {
      this.debugPanel = new DebugPanel();
      console.log("🔧 Debug panel enabled");
    }
    this.setupScreenManagement();
    console.log("✅ UI components initialized");
  }
  /**
   * Setup screen management
   */
  setupScreenManagement() {
    this.eventSystem.on(EVENTS.UI_UPDATE, (event) => {
      if (event.data.type === "navigation") {
        this.switchToScreen(event.data.to);
      }
    });
    window.addEventListener("popstate", (event) => {
      var _a;
      const screen = ((_a = event.state) == null ? void 0 : _a.screen) || "dashboard";
      this.switchToScreen(screen, false);
    });
    const hash = window.location.hash.replace("#", "");
    if (hash && this.navigation.screens[hash]) {
      this.switchToScreen(hash, false);
    }
  }
  /**
   * Switch to a different screen
   */
  switchToScreen(screenId, _updateHistory = true) {
    if (this.currentScreen === screenId) return;
    document.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.remove("screen--active");
    });
    const targetScreen = document.querySelector("#screen-".concat(screenId));
    if (targetScreen) {
      targetScreen.classList.add("screen--active");
      if (screenId === "economy" && this.economicsScreen) {
        this.economicsScreen.show();
      }
    } else {
      this.createScreenPlaceholder(screenId);
    }
    this.currentScreen = screenId;
    if (this.navigation) {
      this.navigation.currentScreen = screenId;
    }
    console.log("Switched to screen: ".concat(screenId));
  }
  /**
   * Create a placeholder screen for future implementation
   */
  createScreenPlaceholder(screenId) {
    var _a;
    const screenName = ((_a = this.navigation) == null ? void 0 : _a.screens[screenId]) || screenId;
    const placeholder = document.createElement("div");
    placeholder.id = "screen-".concat(screenId);
    placeholder.className = "screen screen--active";
    placeholder.innerHTML = '\n      <div class="panel">\n        <h2 class="panel__title">'.concat(screenName, '</h2>\n        <div class="panel__content">\n          <p>This screen is under development and will be available in a future update.</p>\n          <p>Screen: <strong>').concat(screenName, "</strong></p>\n        </div>\n      </div>\n    ");
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.appendChild(placeholder);
    }
  }
  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    this.eventSystem.on(EVENTS.GAME_START, () => {
      this.updateUI();
    });
    this.eventSystem.on(EVENTS.TURN_END, () => {
      this.updateUI();
    });
    this.eventSystem.on("game:pause_toggle", () => {
      this.handlePauseToggle();
    });
    this.eventSystem.on(EVENTS.GAME_SAVE, (event) => {
      this.handleSaveGame(event.data.saveName);
    });
    this.eventSystem.on("ui:load_game_dialog", () => {
      this.showLoadGameDialog();
    });
    this.eventSystem.on("ui:decision_dialog", (event) => {
      this.showDecisionDialog(event.data.decision);
    });
    this.eventSystem.on(EVENTS.UI_ERROR, (event) => {
      this.showError(event.data.message);
    });
    this.eventSystem.on(EVENTS.UI_NOTIFICATION, (event) => {
      this.showNotification(event.data.message, event.data.type);
    });
    document.addEventListener("keydown", (event) => {
      this.handleKeyboard(event);
    });
    window.addEventListener("beforeunload", () => {
      this.gameEngine.autoSave();
    });
    window.addEventListener("focus", () => {
      if (this.isInitialized && this.gameEngine.isPaused) ;
    });
    window.addEventListener("blur", () => {
      if (this.isInitialized && this.gameEngine.isRunning) ;
    });
  }
  /**
   * Setup error handling
   */
  setupErrorHandling() {
    window.addEventListener("error", (event) => {
      console.error("Unhandled error:", event.error);
      this.showError("An unexpected error occurred. The game has been auto-saved.");
      this.gameEngine.autoSave();
    });
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      this.showError("An unexpected error occurred. The game has been auto-saved.");
      this.gameEngine.autoSave();
    });
  }
  /**
   * Handle keyboard shortcuts
   */
  handleKeyboard(event) {
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
      return;
    }
    switch (event.key) {
      case " ":
        event.preventDefault();
        this.handlePauseToggle();
        break;
      case "n":
        event.preventDefault();
        if (this.gameEngine.isPaused) {
          this.gameEngine.nextTurn();
        }
        break;
      case "s":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.handleSaveGame();
        }
        break;
      case "l":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.showLoadGameDialog();
        }
        break;
    }
  }
  /**
   * Update UI with current game state
   */
  updateUI() {
    const gameState = this.gameEngine.getGameState();
    if (this.dashboard) {
      this.dashboard.update(gameState);
    }
    const title = "SP_Sim - Week ".concat(gameState.time.week, ", Year ").concat(gameState.time.year);
    const approval = "(".concat(gameState.politics.approval, "% approval)");
    document.title = "".concat(title, " ").concat(approval);
  }
  /**
   * Handle pause/resume toggle
   */
  handlePauseToggle() {
    if (this.gameEngine.isPaused) {
      this.gameEngine.resume();
      this.updatePauseButton("Pause");
    } else {
      this.gameEngine.pause();
      this.updatePauseButton("Resume");
    }
  }
  /**
   * Update pause button text
   */
  updatePauseButton(text) {
    const pauseBtn = document.getElementById("pause-btn");
    if (pauseBtn) {
      pauseBtn.textContent = text;
    }
  }
  /**
   * Handle save game
   */
  handleSaveGame(requestedSaveName = null) {
    let saveName = requestedSaveName;
    if (!saveName) {
      saveName = window.prompt("Enter a name for your save:");
      if (saveName === null) return;
    }
    const success = this.gameEngine.saveGame(saveName);
    if (success) {
      this.showNotification("Game saved successfully!", "success");
    } else {
      this.showError("Failed to save game.");
    }
  }
  /**
   * Show load game dialog
   */
  showLoadGameDialog() {
    const saves = this.gameEngine.saveSystem.getAllSaves();
    if (saves.length === 0) {
      Modal.alert("No Saves Found", "No saved games were found.", () => {
        this.showNotification("No saved games found.", "info");
      });
      return;
    }
    let saveListHtml = '<div class="save-list">';
    saves.forEach((save, _index) => {
      const date = new Date(save.timestamp).toLocaleString();
      saveListHtml += '\n        <div class="save-item" data-save-id="'.concat(save.id, '">\n          <div class="save-name">').concat(save.name, '</div>\n          <div class="save-date">').concat(date, "</div>\n        </div>\n      ");
    });
    saveListHtml += "</div>";
    const modal = new Modal({
      title: "Load Game",
      content: "\n        <p>Select a save to load:</p>\n        ".concat(saveListHtml, "\n        <style>\n          .save-list { max-height: 300px; overflow-y: auto; }\n          .save-item { \n            padding: 10px; \n            border: 1px solid var(--border-color); \n            margin-bottom: 5px; \n            cursor: pointer; \n            border-radius: 4px;\n            transition: background-color 0.2s;\n          }\n          .save-item:hover { background-color: var(--background-color); }\n          .save-item.selected { background-color: var(--secondary-color); color: white; }\n          .save-name { font-weight: bold; }\n          .save-date { font-size: 0.9em; color: var(--text-light); }\n        </style>\n      "),
      confirmText: "Load",
      cancelText: "Cancel",
      showCancel: true,
      onConfirm: () => {
        const selected = document.querySelector(".save-item.selected");
        if (!selected) {
          this.showNotification("Please select a save to load.", "warning");
          return false;
        }
        const saveId = selected.getAttribute("data-save-id");
        const success = this.gameEngine.loadGame(saveId);
        if (success) {
          this.showNotification("Game loaded successfully!", "success");
          this.updateUI();
        } else {
          this.showError("Failed to load game.");
        }
        return true;
      }
    });
    modal.show();
    setTimeout(() => {
      const saveItems = document.querySelectorAll(".save-item");
      saveItems.forEach((item) => {
        item.addEventListener("click", () => {
          saveItems.forEach((i) => i.classList.remove("selected"));
          item.classList.add("selected");
        });
      });
    }, 100);
  }
  /**
   * Show decision dialog
   */
  showDecisionDialog(decision) {
    const modal = new Modal({
      title: "Political Decision",
      content: '\n        <div class="decision-content">\n          <p><strong>Decision:</strong> '.concat(decision.description || decision, '</p>\n          <div class="decision-options">\n            <p>How would you like to respond?</p>\n          </div>\n        </div>\n      '),
      confirmText: "Approve",
      cancelText: "Reject",
      showCancel: true,
      onConfirm: () => {
        this.eventSystem.emit("decision:response", {
          decision,
          response: "approve"
        });
        this.showNotification("Decision approved.", "success");
        return true;
      },
      onCancel: () => {
        this.eventSystem.emit("decision:response", {
          decision,
          response: "reject"
        });
        this.showNotification("Decision rejected.", "info");
      }
    });
    modal.show();
  }
  /**
   * Show error message
   */
  showError(message) {
    console.error(message);
    window.alert("Error: ".concat(message));
  }
  /**
   * Show notification
   */
  showNotification(message, type = "info") {
    console.log("".concat(type.toUpperCase(), ": ").concat(message));
    const notification = document.createElement("div");
    notification.className = "notification notification--".concat(type);
    notification.textContent = message;
    let backgroundColor;
    if (type === "error") {
      backgroundColor = "#e74c3c";
    } else if (type === "success") {
      backgroundColor = "#27ae60";
    } else {
      backgroundColor = "#3498db";
    }
    notification.style.cssText = "\n      position: fixed;\n      top: 20px;\n      right: 20px;\n      padding: 12px 16px;\n      background: ".concat(backgroundColor, ";\n      color: white;\n      border-radius: 4px;\n      z-index: 10000;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.2);\n    ");
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3e3);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const app = new SPSimApp();
  app.initialize();
  window.spSimApp = app;
});
export {
  __vite_legacy_guard
};
//# sourceMappingURL=main-C9ICOfMw.js.map
