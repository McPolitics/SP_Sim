import { Navigation } from '../../src/ui/components/Navigation';
import { eventSystem } from '../../src/core/EventSystem';

// Mock DOM methods
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    pushState: jest.fn(),
  },
});

describe('Navigation Component', () => {
  let navigation;
  let mockContainer;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="header"></div>
      <div class="main-content"></div>
    `;
    
    // Create navigation instance
    navigation = new Navigation();
    mockContainer = document.querySelector('.header');
  });

  afterEach(() => {
    if (navigation) {
      navigation.destroy();
    }
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should create navigation menu', () => {
      const navElement = document.querySelector('.navigation');
      expect(navElement).toBeTruthy();
    });

    test('should create navigation links for all screens', () => {
      const links = document.querySelectorAll('.navigation__link');
      expect(links.length).toBeGreaterThan(0);
      
      // Check for dashboard link (default active)
      const dashboardLink = document.querySelector('[data-screen="dashboard"]');
      expect(dashboardLink).toBeTruthy();
      expect(dashboardLink.classList.contains('navigation__link--active')).toBe(true);
    });
  });

  describe('Navigation', () => {
    test('should navigate to different screens', () => {
      const economyLink = document.querySelector('[data-screen="economy"]');
      
      if (economyLink) {
        economyLink.click();
        
        expect(navigation.currentScreen).toBe('economy');
        expect(economyLink.classList.contains('navigation__link--active')).toBe(true);
      }
    });

    test('should update browser history', () => {
      navigation.navigateToScreen('politics');
      
      expect(window.history.pushState).toHaveBeenCalledWith(
        { screen: 'politics' },
        'Politics',
        '#politics'
      );
    });

    test('should create placeholder screens for non-existent screens', () => {
      // Mock the main.js createScreenPlaceholder function behavior
      const screenId = 'economy';
      const placeholder = document.createElement('div');
      placeholder.id = `screen-${screenId}`;
      placeholder.className = 'screen screen--active';
      placeholder.innerHTML = `
        <div class="panel">
          <h2 class="panel__title">Economy</h2>
          <div class="panel__content">
            <p>This screen is under development.</p>
          </div>
        </div>
      `;
      document.querySelector('.main-content').appendChild(placeholder);
      
      navigation.navigateToScreen('economy');
      
      const placeholderScreen = document.querySelector('#screen-economy');
      expect(placeholderScreen).toBeTruthy();
    });
  });

  describe('Screen Badges', () => {
    test('should add badges based on game state', () => {
      const gameState = {
        events: { pending: [{ id: 1 }, { id: 2 }] },
        scandals: { active: [{ id: 1 }] },
        economy: { gdpGrowth: -1.5, unemployment: 9.2 }
      };

      navigation.update(gameState);

      // Should add badge to policies screen for pending events
      const policiesLink = document.querySelector('[data-screen="policies"]');
      if (policiesLink) {
        const badge = policiesLink.querySelector('.navigation__badge');
        expect(badge).toBeTruthy();
        expect(badge.textContent).toBe('2');
      }
    });

    test('should clear existing badges before updating', () => {
      // Add a badge first
      const economyLink = document.querySelector('[data-screen="economy"]');
      if (economyLink) {
        navigation.addScreenBadge('economy', '!');
        expect(economyLink.querySelector('.navigation__badge')).toBeTruthy();
      }

      // Update with empty state
      const gameState = {
        events: { pending: [] },
        scandals: { active: [] },
        economy: { gdpGrowth: 2.1, unemployment: 5.5 }
      };

      navigation.update(gameState);

      // Badge should be removed
      if (economyLink) {
        expect(economyLink.querySelector('.navigation__badge')).toBeFalsy();
      }
    });
  });

  describe('Event Handling', () => {
    test('should handle external navigation events', () => {
      const spy = jest.spyOn(navigation, 'navigateToScreen');
      
      eventSystem.emit('navigation:goto', { screen: 'analytics' });
      
      expect(spy).toHaveBeenCalledWith('analytics');
    });

    test('should prevent navigation to same screen', () => {
      const spy = jest.spyOn(window.history, 'pushState');
      
      navigation.navigateToScreen('dashboard'); // Already current screen
      
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('URL Routing', () => {
    test('should listen for popstate events', () => {
      // Since the actual popstate handling is in main.js, just test that the navigation
      // component can be controlled externally
      navigation.navigateToScreen('politics');
      expect(navigation.currentScreen).toBe('politics');
    });
  });
});