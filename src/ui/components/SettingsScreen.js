import { BaseComponent } from './BaseComponent';
import { gameEngine } from '../../core/GameEngine';

export class SettingsScreen extends BaseComponent {
  constructor() {
    super();
    this.initializeScreen();
  }

  initializeScreen() {
    let screenElement = document.querySelector('#screen-settings');
    if (!screenElement) {
      screenElement = this.createElement('div', 'screen');
      screenElement.id = 'screen-settings';
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.appendChild(screenElement);
      }
    }

    this.element = screenElement;
    this.render();
    this.setupEventListeners();
  }

  render() {
    const speed = gameEngine.gameSpeed;
    this.element.innerHTML = `
      <div class="panel">
        <h2 class="panel__title">Settings</h2>
        <div class="panel__content">
          <div class="form-group">
            <label for="setting-game-speed">Game Speed (${speed} ms per turn)</label>
            <input type="range" id="setting-game-speed" class="form-input" min="100" max="5000" step="100" value="${speed}">
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const input = this.element.querySelector('#setting-game-speed');
    if (input) {
      this.addEventListener(input, 'input', (e) => {
        const value = parseInt(e.target.value, 10);
        gameEngine.setGameSpeed(value);
        localStorage.setItem('sp_sim_game_speed', value);
        const label = this.element.querySelector('label[for="setting-game-speed"]');
        if (label) label.textContent = `Game Speed (${value} ms per turn)`;
      });
    }
  }
}

export default SettingsScreen;
