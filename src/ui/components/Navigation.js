import { BaseComponent } from './BaseComponent';
import { eventSystem, EVENTS } from '../../core/EventSystem';

/**
 * Navigation - Main navigation component for different game screens
 * Handles screen switching and navigation state
 */
export class Navigation extends BaseComponent {
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
      analytics: 'Analytics',
      help: 'Help Guide',
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
    this.addEventListener(this.element, 'click', (e) => {
      e.preventDefault();
      const link = e.target.closest('.navigation__link');
      if (link) {
        const screenId = link.getAttribute('data-screen');
        this.navigateToScreen(screenId);
      }
    });

    // Listen for external navigation events
    eventSystem.on('navigation:goto', (event) => {
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
      screenTitle: this.screens[screenId],
    });

    // Update browser URL without page reload
    if (window.history) {
      window.history.pushState(
        { screen: screenId },
        this.screens[screenId],
        `#${screenId}`,
      );
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
    this.element.querySelectorAll('.navigation__badge').forEach((badge) => {
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

export default Navigation;
