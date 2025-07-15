import { BaseComponent } from './BaseComponent';
import { gameEngine } from '../../core/GameEngine';

export class SettingsScreen extends BaseComponent {
  constructor() {
    super();
    this.settings = this.loadSettings();
    this.initializeScreen();
  }

  loadSettings() {
    return {
      gameSpeed: parseInt(localStorage.getItem('sp_sim_game_speed') || '1000', 10),
      theme: localStorage.getItem('sp_sim_theme') || 'system',
      autoSave: localStorage.getItem('sp_sim_auto_save') !== 'false',
      notifications: localStorage.getItem('sp_sim_notifications') !== 'false',
      autoPause: localStorage.getItem('sp_sim_auto_pause') === 'true',
      soundEffects: localStorage.getItem('sp_sim_sound_effects') !== 'false',
      animationSpeed: localStorage.getItem('sp_sim_animation_speed') || 'normal',
      language: localStorage.getItem('sp_sim_language') || 'en',
      autoAdvanceTurn: localStorage.getItem('sp_sim_auto_advance_turn') === 'true',
      difficultyAdjustments: localStorage.getItem('sp_sim_difficulty_adjust') !== 'false',
    };
  }

  saveSettings() {
    Object.entries(this.settings).forEach(([key, value]) => {
      const storageKey = `sp_sim_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}`;
      localStorage.setItem(storageKey, value.toString());
    });
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
    this.applyTheme();
  }

  render() {
    this.element.innerHTML = `
      <div class="settings-screen">
        <!-- Settings Header -->
        <div class="settings-header">
          <div class="header-content">
            <h1>⚙️ Game Settings</h1>
            <p>Customize your SP_Sim experience</p>
          </div>
          <div class="settings-actions">
            <button class="btn btn--secondary" id="reset-settings">🔄 Reset to Defaults</button>
            <button class="btn btn--secondary" id="export-settings">📤 Export Settings</button>
          </div>
        </div>

        <!-- Settings Tabs -->
        <div class="settings-tabs">
          <button class="tab-btn active" data-tab="display">
            <span class="tab-icon">🎨</span>
            <span class="tab-text">Display</span>
          </button>
          <button class="tab-btn" data-tab="gameplay">
            <span class="tab-icon">🎮</span>
            <span class="tab-text">Gameplay</span>
          </button>
          <button class="tab-btn" data-tab="about">
            <span class="tab-icon">ℹ️</span>
            <span class="tab-text">About</span>
          </button>
        </div>

        <!-- Settings Content -->
        <div class="settings-content">
          <!-- Display Tab -->
          <div class="tab-content active" id="tab-display">
            ${this.renderDisplayTab()}
          </div>

          <!-- Gameplay Tab -->
          <div class="tab-content" id="tab-gameplay">
            ${this.renderGameplayTab()}
          </div>

          <!-- About Tab -->
          <div class="tab-content" id="tab-about">
            ${this.renderAboutTab()}
          </div>
        </div>
      </div>

      <!-- Settings Screen Styles -->
      <style>
        .settings-screen {
          max-width: 1000px;
          margin: 0 auto;
          padding: var(--spacing-lg);
        }

        .settings-header {
          background: linear-gradient(135deg, var(--surface-color) 0%, var(--background-alt) 100%);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-lg);
          box-shadow: var(--shadow-md);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid var(--border-color);
        }

        .header-content h1 {
          margin: 0 0 var(--spacing-sm) 0;
          color: var(--primary-color);
          font-size: 2rem;
          font-weight: 700;
        }

        .header-content p {
          margin: 0;
          color: var(--text-light);
          font-size: 1rem;
        }

        .settings-actions {
          display: flex;
          gap: var(--spacing-sm);
          flex-wrap: wrap;
        }

        .settings-tabs {
          display: flex;
          gap: 0;
          margin-bottom: var(--spacing-lg);
          background: var(--surface-color);
          border-radius: var(--border-radius-lg);
          padding: var(--spacing-xs);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-color);
          overflow-x: auto;
        }

        .tab-btn {
          flex: 1;
          min-width: 120px;
          padding: var(--spacing-md) var(--spacing-lg);
          border: none;
          background: none;
          color: var(--text-light);
          font-weight: 500;
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          white-space: nowrap;
        }

        .tab-btn:hover {
          background: var(--background-alt);
          color: var(--text-color);
        }

        .tab-btn.active {
          background: var(--secondary-color);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .tab-icon {
          font-size: 1.1rem;
        }

        .settings-content {
          background: var(--surface-color);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          min-height: 500px;
        }

        .tab-content {
          display: none;
          padding: var(--spacing-xl);
          animation: fadeInUp 0.3s ease-out;
        }

        .tab-content.active {
          display: block;
        }

        .settings-section {
          margin-bottom: var(--spacing-xl);
        }

        .settings-section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: var(--spacing-lg);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding-bottom: var(--spacing-sm);
          border-bottom: 2px solid var(--border-light);
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .setting-item {
          background: var(--background-alt);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          border: 1px solid var(--border-color);
          transition: all var(--transition-base);
        }

        .setting-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .setting-header {
          margin-bottom: var(--spacing-md);
        }

        .setting-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: var(--spacing-xs);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .setting-description {
          font-size: 0.875rem;
          color: var(--text-light);
          line-height: 1.4;
        }

        .setting-control {
          margin-top: var(--spacing-md);
        }

        .theme-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-sm);
        }

        .theme-option {
          padding: var(--spacing-md);
          border: 2px solid var(--border-color);
          border-radius: var(--border-radius);
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: center;
          background: var(--surface-color);
        }

        .theme-option:hover {
          border-color: var(--secondary-color);
          transform: translateY(-2px);
        }

        .theme-option.active {
          border-color: var(--secondary-color);
          background: var(--secondary-color);
          color: white;
        }

        .theme-preview {
          width: 100%;
          height: 40px;
          border-radius: var(--border-radius-sm);
          margin-bottom: var(--spacing-sm);
          display: flex;
        }

        .theme-light .theme-preview {
          background: linear-gradient(90deg, #f7fafc 0%, #edf2f7 50%, #e2e8f0 100%);
        }

        .theme-dark .theme-preview {
          background: linear-gradient(90deg, #1a202c 0%, #2d3748 50%, #4a5568 100%);
        }

        .theme-system .theme-preview {
          background: linear-gradient(90deg, #f7fafc 0%, #2d3748 50%, #f7fafc 100%);
        }

        .theme-name {
          font-weight: 500;
          font-size: 0.875rem;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--border-color);
          transition: var(--transition-base);
          border-radius: 24px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: var(--transition-base);
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background-color: var(--secondary-color);
        }

        input:checked + .toggle-slider:before {
          transform: translateX(26px);
        }

        .range-slider {
          width: 100%;
          height: 8px;
          border-radius: var(--border-radius);
          background: var(--border-color);
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--secondary-color);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        .range-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--secondary-color);
          cursor: pointer;
          border: none;
          box-shadow: var(--shadow-sm);
        }

        .select-control {
          width: 100%;
          padding: var(--spacing-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          background: var(--surface-color);
          color: var(--text-color);
          font-size: 0.9rem;
        }

        .select-control:focus {
          outline: none;
          border-color: var(--secondary-color);
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .range-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
          font-size: 0.875rem;
          color: var(--text-light);
        }

        .current-value {
          font-weight: 600;
          color: var(--secondary-color);
        }

        .about-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .app-logo {
          font-size: 4rem;
          margin-bottom: var(--spacing-lg);
        }

        .app-version {
          font-size: 1.2rem;
          color: var(--text-light);
          margin-bottom: var(--spacing-lg);
        }

        .app-description {
          font-size: 1rem;
          color: var(--text-color);
          line-height: 1.6;
          margin-bottom: var(--spacing-xl);
        }

        .credits-section {
          background: var(--background-alt);
          border-radius: var(--border-radius);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .credits-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: var(--spacing-md);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .stat-item {
          text-align: center;
          padding: var(--spacing-md);
          background: var(--background-alt);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--secondary-color);
          display: block;
          margin-bottom: var(--spacing-xs);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-light);
        }

        @media (max-width: 768px) {
          .settings-header {
            flex-direction: column;
            gap: var(--spacing-lg);
            text-align: center;
          }

          .settings-actions {
            flex-direction: column;
            width: 100%;
          }

          .settings-tabs {
            overflow-x: auto;
            padding: var(--spacing-xs);
          }

          .tab-btn {
            min-width: 100px;
            padding: var(--spacing-sm);
          }

          .tab-text {
            display: none;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }

          .tab-content {
            padding: var(--spacing-md);
          }

          .theme-selector {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    `;
  }

  renderDisplayTab() {
    return `
      <div class="settings-section">
        <h3 class="section-title">🎨 Appearance</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-header">
              <div class="setting-title">🌙 Theme</div>
              <div class="setting-description">Choose your preferred color scheme</div>
            </div>
            <div class="setting-control">
              <div class="theme-selector">
                <div class="theme-option theme-light ${this.settings.theme === 'light' ? 'active' : ''}" data-theme="light">
                  <div class="theme-preview"></div>
                  <div class="theme-name">Light</div>
                </div>
                <div class="theme-option theme-dark ${this.settings.theme === 'dark' ? 'active' : ''}" data-theme="dark">
                  <div class="theme-preview"></div>
                  <div class="theme-name">Dark</div>
                </div>
                <div class="theme-option theme-system ${this.settings.theme === 'system' ? 'active' : ''}" data-theme="system">
                  <div class="theme-preview"></div>
                  <div class="theme-name">System</div>
                </div>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <div class="setting-title">⚡ Animation Speed</div>
              <div class="setting-description">Control the speed of UI animations</div>
            </div>
            <div class="setting-control">
              <select class="select-control" id="animation-speed">
                <option value="slow" ${this.settings.animationSpeed === 'slow' ? 'selected' : ''}>Slow</option>
                <option value="normal" ${this.settings.animationSpeed === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="fast" ${this.settings.animationSpeed === 'fast' ? 'selected' : ''}>Fast</option>
                <option value="none" ${this.settings.animationSpeed === 'none' ? 'selected' : ''}>Disabled</option>
              </select>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <div class="setting-title">🌐 Language</div>
              <div class="setting-description">Select your preferred language</div>
            </div>
            <div class="setting-control">
              <select class="select-control" id="language-select">
                <option value="en" ${this.settings.language === 'en' ? 'selected' : ''}>English</option>
                <option value="es" ${this.settings.language === 'es' ? 'selected' : ''}>Español</option>
                <option value="fr" ${this.settings.language === 'fr' ? 'selected' : ''}>Français</option>
                <option value="de" ${this.settings.language === 'de' ? 'selected' : ''}>Deutsch</option>
                <option value="pt" ${this.settings.language === 'pt' ? 'selected' : ''}>Português</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderGameplayTab() {
    return `
      <div class="settings-section">
        <h3 class="section-title">🎮 Game Mechanics</h3>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-header">
              <div class="setting-title">⏱️ Game Speed</div>
              <div class="setting-description">Control how fast the game progresses</div>
            </div>
            <div class="setting-control">
              <div class="range-display">
                <span>Slow</span>
                <span class="current-value">${this.settings.gameSpeed}ms</span>
                <span>Fast</span>
              </div>
              <input type="range" class="range-slider" id="game-speed" 
                     min="100" max="5000" step="100" value="${this.settings.gameSpeed}">
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <div class="setting-title">💾 Auto-Save</div>
              <div class="setting-description">Automatically save game progress every few turns</div>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input type="checkbox" id="auto-save" ${this.settings.autoSave ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <div class="setting-title">🔔 Notifications</div>
              <div class="setting-description">Show notifications for important events</div>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input type="checkbox" id="notifications" ${this.settings.notifications ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-header">
              <div class="setting-title">⏸️ Auto-Pause</div>
              <div class="setting-description">Automatically pause when important events occur</div>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input type="checkbox" id="auto-pause" ${this.settings.autoPause ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderAboutTab() {
    return `
      <div class="about-content">
        <div class="app-logo">🏛️</div>
        <h2>SP_Sim</h2>
        <div class="app-version">Version 1.0.0</div>
        <div class="app-description">
          A single-player web-based political economy simulation game where players take on 
          the role of a political leader managing a nation through complex economic, political, 
          and global challenges.
        </div>

        <div class="credits-section">
          <div class="credits-title">Credits</div>
          <p>Developed by the McPolitics team</p>
          <p>Built with modern web technologies</p>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">2024</span>
            <span class="stat-label">Release Year</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">JavaScript</span>
            <span class="stat-label">Technology</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">MIT</span>
            <span class="stat-label">License</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">Open Source</span>
            <span class="stat-label">Type</span>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.settings-screen .tab-btn');
    const tabContents = document.querySelectorAll('.settings-screen .tab-content');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');

        // Update tab buttons
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Update tab content
        tabContents.forEach((content) => content.classList.remove('active'));
        const targetContent = document.getElementById(`tab-${tabId}`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });

    // Theme selector
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach((option) => {
      option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        this.settings.theme = theme;
        this.saveSettings();
        this.applyTheme();

        // Update UI
        themeOptions.forEach((opt) => opt.classList.remove('active'));
        option.classList.add('active');
      });
    });

    // Game speed slider
    const gameSpeedSlider = document.getElementById('game-speed');
    if (gameSpeedSlider) {
      gameSpeedSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        this.settings.gameSpeed = value;
        gameEngine.setGameSpeed(value);
        this.saveSettings();

        // Update display
        const currentValue = document.querySelector('#tab-gameplay .current-value');
        if (currentValue) {
          currentValue.textContent = `${value}ms`;
        }
      });
    }

    // Toggle switches
    const toggles = [
      { id: 'auto-save', setting: 'autoSave' },
      { id: 'auto-pause', setting: 'autoPause' },
      { id: 'notifications', setting: 'notifications' },
    ];

    toggles.forEach(({ id, setting }) => {
      const toggle = document.getElementById(id);
      if (toggle) {
        toggle.addEventListener('change', (e) => {
          this.settings[setting] = e.target.checked;
          this.saveSettings();
        });
      }
    });

    // Select controls
    const animationSpeed = document.getElementById('animation-speed');
    if (animationSpeed) {
      animationSpeed.addEventListener('change', (e) => {
        this.settings.animationSpeed = e.target.value;
        this.saveSettings();
        this.applyAnimationSpeed();
      });
    }

    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.settings.language = e.target.value;
        this.saveSettings();
        // Language change would require page reload in a real implementation
      });
    }

    // Action buttons
    this.setupActionButtons();
  }

  setupActionButtons() {
    // Reset settings
    const resetBtn = document.getElementById('reset-settings');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        // Use window.confirm to avoid linting error
        if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
          this.resetToDefaults();
        }
      });
    }

    // Export settings
    const exportBtn = document.getElementById('export-settings');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportSettings());
    }
  }

  applyTheme() {
    const root = document.documentElement;

    if (this.settings.theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else if (this.settings.theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      // System theme
      root.classList.remove('dark-theme', 'light-theme');
    }
  }

  applyAnimationSpeed() {
    const root = document.documentElement;
    const speeds = {
      slow: '0.4s',
      normal: '0.2s',
      fast: '0.1s',
      none: '0s',
    };

    const speed = speeds[this.settings.animationSpeed] || speeds.normal;
    root.style.setProperty('--transition-base', speed);
    root.style.setProperty('--transition-fast', speed);
    root.style.setProperty('--transition-slow', speed);
  }

  resetToDefaults() {
    this.settings = {
      gameSpeed: 1000,
      theme: 'system',
      autoSave: true,
      notifications: true,
      autoPause: false,
      soundEffects: true,
      animationSpeed: 'normal',
      language: 'en',
      autoAdvanceTurn: false,
      difficultyAdjustments: true,
    };

    this.saveSettings();
    this.applyTheme();
    this.applyAnimationSpeed();
    this.render();
    this.setupEventListeners();
    this.showNotification('Settings reset to defaults', 'success');
  }

  exportSettings() {
    const settingsData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      settings: this.settings,
    };

    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sp_sim_settings_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification('Settings exported successfully', 'success');
  }

  showNotification(message, type = 'info') {
    // Use the app's notification system if available
    if (window.spSimApp) {
      window.spSimApp.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  show() {
    this.render();
    this.setupEventListeners();
    return this.element;
  }
}

export default SettingsScreen;
