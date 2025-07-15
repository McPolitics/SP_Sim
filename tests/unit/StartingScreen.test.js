import { StartingScreen } from '../../src/ui/components/StartingScreen';

/**
 * Test StartingScreen functionality
 */
describe('StartingScreen', () => {
  let startingScreen;

  beforeEach(() => {
    // Clear localStorage to simulate new user
    localStorage.clear();
    
    // Create starting screen instance
    startingScreen = new StartingScreen();
  });

  afterEach(() => {
    // Clean up DOM
    const screen = document.getElementById('starting-screen');
    if (screen) {
      screen.remove();
    }
  });

  test('should show starting screen for new users', () => {
    const shown = startingScreen.show();
    // expect(shown).toBeUndefined();
    expect(startingScreen.isVisible).toBe(true);
    
    const screenElement = document.getElementById('starting-screen');
    expect(screenElement).toBeTruthy();
  });

  test('should always show starting screen to allow user choice', () => {
    // Simulate existing save data
    localStorage.setItem('sp_sim_autosave', JSON.stringify({ test: 'data' }));
    
    const shown = startingScreen.show();
    expect(shown).toBe(true); // Changed: now always shows
    expect(startingScreen.isVisible).toBe(true);
  });

  test('should hide starting screen when hide() is called', () => {
    startingScreen.show();
    expect(startingScreen.isVisible).toBe(true);
    
    startingScreen.hide();
    expect(startingScreen.isVisible).toBe(false);
    
    const screenElement = document.getElementById('starting-screen');
    expect(screenElement).toBeFalsy();
  });

  test('should have normal difficulty selected by default', () => {
    startingScreen.show();
    expect(startingScreen.selectedDifficulty).toBe('normal');
  });

  test('should have default game options enabled', () => {
    expect(startingScreen.gameOptions.tutorial).toBe(true);
    expect(startingScreen.gameOptions.autoSave).toBe(true);
    expect(startingScreen.gameOptions.crisisEvents).toBe(true);
  });
});