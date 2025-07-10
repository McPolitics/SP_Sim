;
(function () {
  System.register(['./core-legacy-oFe7g9uE.js', './ui-legacy-Di__5NtE.js'], function (exports, module) {
    'use strict';

    var eventSystem, EVENTS, gameEngine, economicSimulation, BaseComponent, Dashboard, EconomicsScreen;
    return {
      setters: [module => {
        eventSystem = module.e;
        EVENTS = module.E;
        gameEngine = module.g;
        economicSimulation = module.a;
      }, module => {
        BaseComponent = module.B;
        Dashboard = module.D;
        EconomicsScreen = module.E;
      }],
      execute: function () {
        var __vite_style__ = document.createElement('style');
        __vite_style__.textContent = "* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\n:root {\n  --primary-color: #2c3e50;\n  --secondary-color: #3498db;\n  --accent-color: #e74c3c;\n  --success-color: #27ae60;\n  --warning-color: #f39c12;\n  --background-color: #ecf0f1;\n  --surface-color: #ffffff;\n  --text-color: #2c3e50;\n  --text-light: #7f8c8d;\n  --border-color: #bdc3c7;\n  --shadow-light: 0 2px 4px rgba(0, 0, 0, 0.1);\n  --shadow-medium: 0 4px 8px rgba(0, 0, 0, 0.15);\n  --border-radius: 8px;\n  --spacing-xs: 0.25rem;\n  --spacing-sm: 0.5rem;\n  --spacing-md: 1rem;\n  --spacing-lg: 1.5rem;\n  --spacing-xl: 2rem;\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;\n  line-height: 1.6;\n  color: var(--text-color);\n  background-color: var(--background-color);\n  font-size: 14px;\n}\n\n#app {\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n}\n\n.header {\n  background: var(--primary-color);\n  color: white;\n  padding: var(--spacing-md);\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  box-shadow: var(--shadow-medium);\n}\n.header__title {\n  font-size: 1.5rem;\n  font-weight: 600;\n}\n.header__info {\n  display: flex;\n  gap: var(--spacing-lg);\n  font-size: 0.9rem;\n}\n.header__info span {\n  padding: var(--spacing-xs) var(--spacing-sm);\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: var(--border-radius);\n}\n\n.main-content {\n  flex: 1;\n  padding: var(--spacing-lg);\n  max-width: 1400px;\n  margin: 0 auto;\n  width: 100%;\n}\n\n.dashboard {\n  display: grid;\n  gap: var(--spacing-lg);\n  grid-template-rows: auto 1fr;\n}\n.dashboard__panels {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: var(--spacing-lg);\n}\n\n.panel {\n  background: var(--surface-color);\n  border-radius: var(--border-radius);\n  box-shadow: var(--shadow-light);\n  overflow: hidden;\n}\n.panel__title {\n  background: var(--secondary-color);\n  color: white;\n  padding: var(--spacing-md);\n  font-size: 1rem;\n  font-weight: 500;\n}\n.panel__content {\n  padding: var(--spacing-md);\n}\n\n.metric {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: var(--spacing-sm) 0;\n  border-bottom: 1px solid var(--border-color);\n}\n.metric:last-child {\n  border-bottom: none;\n}\n.metric label {\n  font-weight: 500;\n  color: var(--text-light);\n}\n.metric span {\n  font-weight: 600;\n}\n\n.events-section {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: var(--spacing-lg);\n}\n\n.events-list,\n.decisions-list {\n  list-style: none;\n}\n.events-list li,\n.decisions-list li {\n  padding: var(--spacing-sm);\n  border-bottom: 1px solid var(--border-color);\n  font-size: 0.9rem;\n}\n.events-list li:last-child,\n.decisions-list li:last-child {\n  border-bottom: none;\n}\n\n.decisions-list li {\n  cursor: pointer;\n  transition: background-color 0.2s;\n}\n.decisions-list li:hover {\n  background-color: var(--background-color);\n}\n\n.footer {\n  background: var(--surface-color);\n  border-top: 1px solid var(--border-color);\n  padding: var(--spacing-md);\n}\n\n.game-controls {\n  display: flex;\n  justify-content: center;\n  gap: var(--spacing-md);\n}\n\n.btn {\n  padding: var(--spacing-sm) var(--spacing-md);\n  border: none;\n  border-radius: var(--border-radius);\n  font-size: 0.9rem;\n  font-weight: 500;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n.btn--primary {\n  background: var(--secondary-color);\n  color: white;\n}\n.btn--primary:hover {\n  background: #2980b9;\n}\n.btn--secondary {\n  background: var(--border-color);\n  color: var(--text-color);\n}\n.btn--secondary:hover {\n  background: #95a5a6;\n}\n.btn:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n}\n\n@media (max-width: 768px) {\n  .header {\n    flex-direction: column;\n    gap: var(--spacing-sm);\n  }\n  .header__info {\n    flex-wrap: wrap;\n    justify-content: center;\n  }\n  .dashboard__panels {\n    grid-template-columns: 1fr;\n  }\n  .events-section {\n    grid-template-columns: 1fr;\n  }\n  .game-controls {\n    flex-wrap: wrap;\n    gap: var(--spacing-sm);\n  }\n}\n.navigation__menu {\n  display: flex;\n  list-style: none;\n  gap: var(--spacing-sm);\n  margin: 0;\n  padding: 0;\n}\n.navigation__item {\n  position: relative;\n}\n.navigation__link {\n  display: block;\n  padding: var(--spacing-sm) var(--spacing-md);\n  color: rgba(255, 255, 255, 0.8);\n  text-decoration: none;\n  border-radius: var(--border-radius);\n  transition: all 0.2s;\n  font-size: 0.9rem;\n}\n.navigation__link:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: white;\n}\n.navigation__link--active {\n  background: rgba(255, 255, 255, 0.2);\n  color: white;\n  font-weight: 500;\n}\n.navigation__badge {\n  position: absolute;\n  top: -5px;\n  right: -5px;\n  background: var(--accent-color);\n  color: white;\n  border-radius: 50%;\n  min-width: 18px;\n  height: 18px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 10px;\n  font-weight: bold;\n}\n\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.5);\n  z-index: 9999;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  opacity: 0;\n  visibility: hidden;\n  transition: all 0.3s ease;\n}\n.modal-backdrop--visible {\n  opacity: 1;\n  visibility: visible;\n}\n\n.modal {\n  background: var(--surface-color);\n  border-radius: var(--border-radius);\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);\n  min-width: 300px;\n  max-width: 90vw;\n  max-height: 90vh;\n  transform: scale(0.8) translateY(-50px);\n  transition: all 0.3s ease;\n  overflow: hidden;\n}\n.modal--visible {\n  transform: scale(1) translateY(0);\n}\n.modal__content {\n  display: flex;\n  flex-direction: column;\n  max-height: 90vh;\n}\n.modal__header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: var(--spacing-lg);\n  border-bottom: 1px solid var(--border-color);\n  background: var(--background-color);\n}\n.modal__title {\n  margin: 0;\n  font-size: 1.2rem;\n  color: var(--text-color);\n}\n.modal__close {\n  background: none;\n  border: none;\n  font-size: 1.5rem;\n  cursor: pointer;\n  color: var(--text-light);\n  padding: var(--spacing-xs);\n  width: 30px;\n  height: 30px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 50%;\n  transition: background-color 0.2s;\n}\n.modal__close:hover {\n  background: var(--border-color);\n}\n.modal__body {\n  padding: var(--spacing-lg);\n  overflow-y: auto;\n  flex: 1;\n}\n.modal__footer {\n  display: flex;\n  justify-content: flex-end;\n  gap: var(--spacing-sm);\n  padding: var(--spacing-lg);\n  border-top: 1px solid var(--border-color);\n  background: var(--background-color);\n}\n\n.chart-container {\n  background: var(--surface-color);\n  border-radius: var(--border-radius);\n  padding: var(--spacing-md);\n  box-shadow: var(--shadow-light);\n}\n\n.form-input,\n.form-textarea,\n.form-select {\n  width: 100%;\n  padding: var(--spacing-sm);\n  border: 1px solid var(--border-color);\n  border-radius: var(--border-radius);\n  font-size: 0.9rem;\n  transition: border-color 0.2s;\n}\n.form-input:focus,\n.form-textarea:focus,\n.form-select:focus {\n  outline: none;\n  border-color: var(--secondary-color);\n  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);\n}\n\n.form-group {\n  margin-bottom: var(--spacing-md);\n}\n.form-group label {\n  display: block;\n  margin-bottom: var(--spacing-xs);\n  font-weight: 500;\n  color: var(--text-color);\n}\n\n.screen {\n  display: none;\n}\n.screen--active {\n  display: block;\n}\n\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n@keyframes slideUp {\n  from {\n    transform: translateY(20px);\n    opacity: 0;\n  }\n  to {\n    transform: translateY(0);\n    opacity: 1;\n  }\n}\n.animate-fade-in {\n  animation: fadeIn 0.3s ease;\n}\n\n.animate-slide-up {\n  animation: slideUp 0.3s ease;\n}\n\n.economics-screen {\n  padding: var(--spacing-lg);\n}\n\n.economics-header {\n  margin-bottom: var(--spacing-xl);\n  text-align: center;\n}\n.economics-header h1 {\n  color: var(--primary-color);\n  margin-bottom: var(--spacing-sm);\n}\n\n.economic-phase {\n  display: flex;\n  justify-content: center;\n  gap: var(--spacing-lg);\n  font-size: 0.9rem;\n}\n.economic-phase .phase-indicator {\n  color: var(--text-light);\n}\n.economic-phase .phase-duration {\n  color: var(--text-light);\n}\n\n.metrics-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n  gap: var(--spacing-md);\n  margin-bottom: var(--spacing-xl);\n}\n\n.metric-card {\n  background: var(--surface-color);\n  border-radius: var(--border-radius);\n  padding: var(--spacing-lg);\n  box-shadow: var(--shadow-light);\n  text-align: center;\n}\n.metric-card h3 {\n  margin: 0 0 var(--spacing-sm) 0;\n  color: var(--text-light);\n  font-size: 0.9rem;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n}\n.metric-card .metric-value {\n  font-size: 2rem;\n  font-weight: bold;\n  color: var(--primary-color);\n  margin-bottom: var(--spacing-xs);\n}\n.metric-card .metric-trend {\n  font-size: 0.8rem;\n  color: var(--success-color);\n}\n\n.gdp-card .metric-value {\n  color: var(--secondary-color);\n}\n\n.unemployment-card .metric-value {\n  color: var(--accent-color);\n}\n\n.inflation-card .metric-value {\n  color: var(--warning-color);\n}\n\n.confidence-card .metric-value {\n  color: var(--success-color);\n}\n\n.charts-section {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: var(--spacing-lg);\n  margin-bottom: var(--spacing-xl);\n}\n\n.chart-container {\n  background: var(--surface-color);\n  border-radius: var(--border-radius);\n  padding: var(--spacing-md);\n  box-shadow: var(--shadow-light);\n}\n.chart-container h3 {\n  margin: 0 0 var(--spacing-md) 0;\n  color: var(--primary-color);\n  font-size: 1rem;\n}\n.chart-container .chart {\n  width: 100%;\n  min-height: 200px;\n}\n\n.forecast-section {\n  background: var(--surface-color);\n  border-radius: var(--border-radius);\n  padding: var(--spacing-lg);\n  box-shadow: var(--shadow-light);\n  margin-bottom: var(--spacing-xl);\n}\n.forecast-section h3 {\n  margin: 0 0 var(--spacing-md) 0;\n  color: var(--primary-color);\n}\n.forecast-section .forecast-summary {\n  margin-top: var(--spacing-md);\n  padding: var(--spacing-md);\n  background: var(--background-color);\n  border-radius: var(--border-radius);\n}\n.forecast-section .forecast-summary p {\n  margin: 0;\n  color: var(--text-color);\n  font-style: italic;\n}\n\n.sectors-section {\n  background: var(--surface-color);\n  border-radius: var(--border-radius);\n  padding: var(--spacing-lg);\n  box-shadow: var(--shadow-light);\n  margin-bottom: var(--spacing-xl);\n}\n.sectors-section h3 {\n  margin: 0 0 var(--spacing-md) 0;\n  color: var(--primary-color);\n}\n\n.sectors-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));\n  gap: var(--spacing-md);\n}\n\n.sector-card {\n  background: var(--background-color);\n  border-radius: var(--border-radius);\n  padding: var(--spacing-md);\n  text-align: center;\n}\n.sector-card h4 {\n  margin: 0 0 var(--spacing-sm) 0;\n  color: var(--text-color);\n  font-size: 0.9rem;\n}\n.sector-card .sector-share {\n  font-size: 1.5rem;\n  font-weight: bold;\n  color: var(--secondary-color);\n  margin-bottom: var(--spacing-xs);\n}\n.sector-card .sector-growth {\n  font-size: 0.9rem;\n  color: var(--success-color);\n}\n\n.agriculture-sector .sector-share {\n  color: var(--success-color);\n}\n\n.manufacturing-sector .sector-share {\n  color: var(--secondary-color);\n}\n\n.services-sector .sector-share {\n  color: var(--warning-color);\n}\n\n.policy-section {\n  background: var(--surface-color);\n  border-radius: var(--border-radius);\n  padding: var(--spacing-lg);\n  box-shadow: var(--shadow-light);\n  margin-bottom: var(--spacing-xl);\n}\n.policy-section h3 {\n  margin: 0 0 var(--spacing-md) 0;\n  color: var(--primary-color);\n}\n.policy-section .policy-categories {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: var(--spacing-lg);\n  margin-bottom: var(--spacing-xl);\n}\n.policy-section .policy-category {\n  background: var(--background-color);\n  border-radius: var(--border-radius);\n  padding: var(--spacing-md);\n  border: 1px solid var(--border-color);\n}\n.policy-section .policy-category h4 {\n  margin: 0 0 var(--spacing-sm) 0;\n  color: var(--primary-color);\n  font-size: 0.95rem;\n  font-weight: 600;\n}\n.policy-section .policy-buttons {\n  display: flex;\n  flex-wrap: wrap;\n  gap: var(--spacing-sm);\n  margin-bottom: var(--spacing-lg);\n}\n.policy-section .active-policies h4 {\n  margin: 0 0 var(--spacing-sm) 0;\n  color: var(--text-color);\n  font-size: 0.9rem;\n}\n.policy-section .active-policies ul {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.policy-section .active-policies ul li {\n  padding: var(--spacing-xs) 0;\n  color: var(--text-light);\n  font-size: 0.9rem;\n}\n\n.event-info {\n  color: var(--secondary-color);\n}\n\n.event-warning {\n  color: var(--warning-color);\n}\n\n.event-danger {\n  color: var(--accent-color);\n}\n\n.event-success {\n  color: var(--success-color);\n}\n\n@media (max-width: 768px) {\n  .metrics-grid {\n    grid-template-columns: repeat(2, 1fr);\n  }\n  .charts-section {\n    grid-template-columns: 1fr;\n  }\n  .sectors-grid {\n    grid-template-columns: 1fr;\n  }\n  .economic-phase {\n    flex-direction: column;\n    gap: var(--spacing-sm);\n  }\n  .policy-buttons {\n    flex-direction: column;\n  }\n  .policy-buttons .btn {\n    width: 100%;\n  }\n}\n.text-center {\n  text-align: center;\n}\n\n.text-success {\n  color: var(--success-color);\n}\n\n.text-warning {\n  color: var(--warning-color);\n}\n\n.text-danger {\n  color: var(--accent-color);\n}\n\n.hidden {\n  display: none;\n}\n\n.loading {\n  opacity: 0.6;\n  pointer-events: none;\n}\n\n.flex {\n  display: flex;\n}\n\n.flex-column {\n  flex-direction: column;\n}\n\n.flex-center {\n  align-items: center;\n  justify-content: center;\n}\n\n.gap-sm {\n  gap: var(--spacing-sm);\n}\n\n.gap-md {\n  gap: var(--spacing-md);\n}\n\n.gap-lg {\n  gap: var(--spacing-lg);\n}\n\n.mt-sm {\n  margin-top: var(--spacing-sm);\n}\n\n.mt-md {\n  margin-top: var(--spacing-md);\n}\n\n.mb-sm {\n  margin-bottom: var(--spacing-sm);\n}\n\n.mb-md {\n  margin-bottom: var(--spacing-md);\n}/*$vite$:1*/";
        document.head.appendChild(__vite_style__);
        false              && function polyfill() {
          const relList = document.createElement("link").relList;
          if (relList && relList.supports && relList.supports("modulepreload")) return;
          for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
          new MutationObserver(mutations => {
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
            if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";else fetchOpts.credentials = "same-origin";
            return fetchOpts;
          }
          function processPreload(link) {
            if (link.ep) return;
            link.ep = true;
            const fetchOpts = getFetchOpts(link);
            fetch(link.href, fetchOpts);
          }
        }();

        /**
         * Navigation - Main navigation component for different game screens
         * Handles screen switching and navigation state
         */
        class Navigation extends BaseComponent {
          constructor() {
            super();
            this.currentScreen = 'dashboard';
            this.screens = {
              dashboard: 'Dashboard',
              economy: 'Economy',
              politics: 'Politics',
              global: 'Global Relations',
              policies: 'Policies',
              crisis: 'Crisis Management',
              analytics: 'Analytics'
            };
            this.initializeNavigation();
            this.setupEventListeners();
          }

          /**
           * Initialize navigation elements
           */
          initializeNavigation() {
            // Create navigation if it doesn't exist
            let navElement = document.querySelector('.navigation');
            if (!navElement) {
              navElement = this.createElement('nav', 'navigation');
              const header = document.querySelector('.header');
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
            const navList = this.createElement('ul', 'navigation__menu');
            Object.entries(this.screens).forEach(([screenId, screenName]) => {
              const listItem = this.createElement('li', 'navigation__item');
              const link = this.createElement('a', 'navigation__link', screenName);
              link.setAttribute('href', `#${screenId}`);
              link.setAttribute('data-screen', screenId);
              if (screenId === this.currentScreen) {
                link.classList.add('navigation__link--active');
              }
              listItem.appendChild(link);
              navList.appendChild(listItem);
            });
            this.element.innerHTML = '';
            this.element.appendChild(navList);
          }

          /**
           * Setup event listeners
           */
          setupEventListeners() {
            // Handle navigation clicks
            this.addEventListener(this.element, 'click', e => {
              e.preventDefault();
              const link = e.target.closest('.navigation__link');
              if (link) {
                const screenId = link.getAttribute('data-screen');
                this.navigateToScreen(screenId);
              }
            });

            // Listen for external navigation events
            eventSystem.on('navigation:goto', event => {
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

            // Update active state
            const currentActiveLink = this.element.querySelector('.navigation__link--active');
            if (currentActiveLink) {
              currentActiveLink.classList.remove('navigation__link--active');
            }
            const newActiveLink = this.element.querySelector(`[data-screen="${screenId}"]`);
            if (newActiveLink) {
              newActiveLink.classList.add('navigation__link--active');
            }

            // Update current screen
            const previousScreen = this.currentScreen;
            this.currentScreen = screenId;

            // Emit navigation event
            eventSystem.emit(EVENTS.UI_UPDATE, {
              type: 'navigation',
              from: previousScreen,
              to: screenId,
              screenTitle: this.screens[screenId]
            });

            // Update browser URL without page reload
            if (window.history) {
              window.history.pushState({
                screen: screenId
              }, this.screens[screenId], `#${screenId}`);
            }
            console.log(`Navigated to ${this.screens[screenId]}`);
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
            // Add badge indicators for screens with updates/notifications
            this.updateScreenBadges(gameState);
          }

          /**
           * Update screen badges for notifications
           */
          updateScreenBadges(gameState) {
            // Clear existing badges
            this.element.querySelectorAll('.navigation__badge').forEach(badge => {
              badge.remove();
            });

            // Add badges based on game state
            if (gameState.events.pending.length > 0) {
              this.addScreenBadge('policies', gameState.events.pending.length);
            }
            if (gameState.scandals.active.length > 0) {
              this.addScreenBadge('crisis', gameState.scandals.active.length);
            }

            // Economic alerts
            if (gameState.economy.gdpGrowth < 0 || gameState.economy.unemployment > 8) {
              this.addScreenBadge('economy', '!');
            }
          }

          /**
           * Add a badge to a navigation screen
           */
          addScreenBadge(screenId, content) {
            const link = this.element.querySelector(`[data-screen="${screenId}"]`);
            if (link) {
              const badge = this.createElement('span', 'navigation__badge', content);
              link.appendChild(badge);
            }
          }
        }

        /**
         * Modal - Reusable modal dialog component
         * Handles various dialog types like confirmations, forms, and info displays
         */
        class Modal extends BaseComponent {
          constructor(options = {}) {
            super();
            this.options = {
              title: 'Dialog',
              content: '',
              type: 'info',
              // info, confirm, form, custom
              confirmText: 'OK',
              cancelText: 'Cancel',
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
            // Create modal backdrop
            this.backdrop = this.createElement('div', 'modal-backdrop');
            if (!this.options.backdrop) {
              this.backdrop.style.background = 'transparent';
              this.backdrop.style.pointerEvents = 'none';
            }

            // Create modal container
            this.element = this.createElement('div', 'modal');

            // Create modal content
            this.modalContent = this.createElement('div', 'modal__content');

            // Create header
            this.modalHeader = this.createElement('div', 'modal__header');
            this.modalTitle = this.createElement('h3', 'modal__title', this.options.title);
            this.modalHeader.appendChild(this.modalTitle);

            // Create close button if closeable
            if (this.options.closeable) {
              this.closeButton = this.createElement('button', 'modal__close', '×');
              this.modalHeader.appendChild(this.closeButton);
            }

            // Create body
            this.modalBody = this.createElement('div', 'modal__body');
            this.setContent(this.options.content);

            // Create footer
            this.modalFooter = this.createElement('div', 'modal__footer');
            this.createFooterButtons();

            // Assemble modal
            this.modalContent.appendChild(this.modalHeader);
            this.modalContent.appendChild(this.modalBody);
            this.modalContent.appendChild(this.modalFooter);
            this.element.appendChild(this.modalContent);
            this.backdrop.appendChild(this.element);
            this.setupEventListeners();
            this.hide(); // Start hidden
          }

          /**
           * Create footer buttons based on modal type
           */
          createFooterButtons() {
            this.modalFooter.innerHTML = '';
            if (this.options.showCancel || this.options.type === 'confirm') {
              this.cancelButton = this.createElement('button', 'btn btn--secondary', this.options.cancelText);
              this.modalFooter.appendChild(this.cancelButton);
            }
            this.confirmButton = this.createElement('button', 'btn btn--primary', this.options.confirmText);
            this.modalFooter.appendChild(this.confirmButton);
          }

          /**
           * Setup event listeners
           */
          setupEventListeners() {
            // Close button
            if (this.closeButton) {
              this.addEventListener(this.closeButton, 'click', () => {
                this.close();
              });
            }

            // Cancel button
            if (this.cancelButton) {
              this.addEventListener(this.cancelButton, 'click', () => {
                this.cancel();
              });
            }

            // Confirm button
            if (this.confirmButton) {
              this.addEventListener(this.confirmButton, 'click', () => {
                this.confirm();
              });
            }

            // Backdrop click
            if (this.options.backdrop && this.options.closeable) {
              this.addEventListener(this.backdrop, 'click', e => {
                if (e.target === this.backdrop) {
                  this.close();
                }
              });
            }

            // Escape key
            this.addEventListener(document, 'keydown', e => {
              if (e.key === 'Escape' && this.isOpen && this.options.closeable) {
                this.close();
              }
            });
          }

          /**
           * Set modal content
           */
          setContent(content) {
            if (typeof content === 'string') {
              this.modalBody.innerHTML = content;
            } else if (content instanceof HTMLElement) {
              this.modalBody.innerHTML = '';
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

            // Add to DOM
            document.body.appendChild(this.backdrop);

            // Trigger show animation
            requestAnimationFrame(() => {
              this.backdrop.classList.add('modal-backdrop--visible');
              this.element.classList.add('modal--visible');
            });
            this.isOpen = true;

            // Focus first input if it's a form modal
            if (this.options.type === 'form') {
              const firstInput = this.modalBody.querySelector('input, textarea, select');
              if (firstInput) {
                firstInput.focus();
              }
            }

            // Emit event
            eventSystem.emit('modal:show', {
              modal: this
            });
          }

          /**
           * Hide the modal
           */
          hide() {
            if (!this.isOpen) return;
            this.backdrop.classList.remove('modal-backdrop--visible');
            this.element.classList.remove('modal--visible');

            // Remove from DOM after animation
            setTimeout(() => {
              if (this.backdrop.parentNode) {
                document.body.removeChild(this.backdrop);
              }
            }, 300);
            this.isOpen = false;

            // Emit event
            eventSystem.emit('modal:hide', {
              modal: this
            });
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

            // If it's a form modal, collect form data
            if (this.options.type === 'form') {
              const formData = this.collectFormData();
              if (this.options.onConfirm) {
                result = this.options.onConfirm(formData);
              }
            } else if (this.options.onConfirm) {
              result = this.options.onConfirm();
            }

            // Close modal if callback returns true or undefined
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
            const inputs = this.modalBody.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
              const name = input.name || input.id;
              if (name) {
                if (input.type === 'checkbox') {
                  formData[name] = input.checked;
                } else if (input.type === 'radio') {
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
              content: `<p>${message}</p>`,
              type: 'confirm',
              confirmText: 'Yes',
              cancelText: 'No',
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
              content: `<p>${message}</p>`,
              type: 'info',
              confirmText: 'OK',
              onConfirm
            }).show();
          }

          /**
           * Static method to create quick prompt dialog
           */
          static prompt(title, message, onConfirm, defaultValue = '') {
            const content = `
      <p>${message}</p>
      <input type="text" name="value" value="${defaultValue}" class="form-input" style="width: 100%; margin-top: 10px;">
    `;
            return new Modal({
              title,
              content,
              type: 'form',
              confirmText: 'OK',
              cancelText: 'Cancel',
              showCancel: true,
              onConfirm: formData => {
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
            const style = document.createElement("style");
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
              const policies = [{
                type: "fiscal_stimulus",
                name: "Debug Stimulus",
                amount: 0.03,
                duration: 12
              }, {
                type: "education_investment",
                name: "Debug Education",
                amount: 0.04,
                duration: 24
              }, {
                type: "infrastructure_investment",
                name: "Debug Infrastructure",
                amount: 0.06,
                duration: 36
              }];
              policies.forEach(policy => economicSimulation.applyPolicy(policy));
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
                memory: performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB` : "N/A"
              });
            });
            this.addEventListener(document.getElementById("debug-memory"), "click", () => {
              if (performance.memory) {
                console.log("Memory Usage:", {
                  used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`,
                  total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)}MB`,
                  limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)}MB`
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
            this.eventSystem.on(EVENTS.UI_UPDATE, event => {
              if (event.data.type === "navigation") {
                this.switchToScreen(event.data.to);
              }
            });
            window.addEventListener("popstate", event => {
              const screen = event.state?.screen || "dashboard";
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
            document.querySelectorAll(".screen").forEach(screen => {
              screen.classList.remove("screen--active");
            });
            const targetScreen = document.querySelector(`#screen-${screenId}`);
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
            console.log(`Switched to screen: ${screenId}`);
          }
          /**
           * Create a placeholder screen for future implementation
           */
          createScreenPlaceholder(screenId) {
            const screenName = this.navigation?.screens[screenId] || screenId;
            const placeholder = document.createElement("div");
            placeholder.id = `screen-${screenId}`;
            placeholder.className = "screen screen--active";
            placeholder.innerHTML = `
      <div class="panel">
        <h2 class="panel__title">${screenName}</h2>
        <div class="panel__content">
          <p>This screen is under development and will be available in a future update.</p>
          <p>Screen: <strong>${screenName}</strong></p>
        </div>
      </div>
    `;
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
            this.eventSystem.on(EVENTS.GAME_SAVE, event => {
              this.handleSaveGame(event.data.saveName);
            });
            this.eventSystem.on("ui:load_game_dialog", () => {
              this.showLoadGameDialog();
            });
            this.eventSystem.on("ui:decision_dialog", event => {
              this.showDecisionDialog(event.data.decision);
            });
            this.eventSystem.on(EVENTS.UI_ERROR, event => {
              this.showError(event.data.message);
            });
            this.eventSystem.on(EVENTS.UI_NOTIFICATION, event => {
              this.showNotification(event.data.message, event.data.type);
            });
            document.addEventListener("keydown", event => {
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
            window.addEventListener("error", event => {
              console.error("Unhandled error:", event.error);
              this.showError("An unexpected error occurred. The game has been auto-saved.");
              this.gameEngine.autoSave();
            });
            window.addEventListener("unhandledrejection", event => {
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
            const title = `SP_Sim - Week ${gameState.time.week}, Year ${gameState.time.year}`;
            const approval = `(${gameState.politics.approval}% approval)`;
            document.title = `${title} ${approval}`;
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
              saveListHtml += `
        <div class="save-item" data-save-id="${save.id}">
          <div class="save-name">${save.name}</div>
          <div class="save-date">${date}</div>
        </div>
      `;
            });
            saveListHtml += "</div>";
            const modal = new Modal({
              title: "Load Game",
              content: `
        <p>Select a save to load:</p>
        ${saveListHtml}
        <style>
          .save-list { max-height: 300px; overflow-y: auto; }
          .save-item { 
            padding: 10px; 
            border: 1px solid var(--border-color); 
            margin-bottom: 5px; 
            cursor: pointer; 
            border-radius: 4px;
            transition: background-color 0.2s;
          }
          .save-item:hover { background-color: var(--background-color); }
          .save-item.selected { background-color: var(--secondary-color); color: white; }
          .save-name { font-weight: bold; }
          .save-date { font-size: 0.9em; color: var(--text-light); }
        </style>
      `,
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
              saveItems.forEach(item => {
                item.addEventListener("click", () => {
                  saveItems.forEach(i => i.classList.remove("selected"));
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
              content: `
        <div class="decision-content">
          <p><strong>Decision:</strong> ${decision.description || decision}</p>
          <div class="decision-options">
            <p>How would you like to respond?</p>
          </div>
        </div>
      `,
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
            window.alert(`Error: ${message}`);
          }
          /**
           * Show notification
           */
          showNotification(message, type = "info") {
            console.log(`${type.toUpperCase()}: ${message}`);
            const notification = document.createElement("div");
            notification.className = `notification notification--${type}`;
            notification.textContent = message;
            let backgroundColor;
            if (type === "error") {
              backgroundColor = "#e74c3c";
            } else if (type === "success") {
              backgroundColor = "#27ae60";
            } else {
              backgroundColor = "#3498db";
            }
            notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      background: ${backgroundColor};
      color: white;
      border-radius: 4px;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
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
      }
    };
  });
})();
//# sourceMappingURL=main-legacy-0XW3gKMc.js.map
