import { BaseComponent } from './BaseComponent';
import { eventSystem, EVENTS } from '../../core/EventSystem';

/**
 * Timeline - Enhanced timeline visualization component
 * Shows game progression, major events, and save points
 */
export class Timeline extends BaseComponent {
  constructor() {
    super();
    this.gameState = null;
    this.element = null;
    this.isExpanded = false;
    this.maxVisibleWeeks = 52; // Show up to 1 year in timeline

    this.initializeTimeline();
    this.setupEventListeners();
  }

  /**
   * Initialize timeline element
   */
  initializeTimeline() {
    this.element = this.createElement('div', 'timeline-container');
    this.element.innerHTML = `
      <div class="timeline-header">
        <h3 class="timeline-title">
          <span class="timeline-icon">📅</span>
          Game Timeline
        </h3>
        <button class="timeline-toggle btn btn--secondary" type="button">
          <span class="toggle-text">Expand</span>
          <span class="toggle-icon">▼</span>
        </button>
      </div>
      <div class="timeline-content">
        <div class="timeline-controls">
          <div class="timeline-info">
            <span class="current-time">Week 1, Year 1</span>
            <span class="playtime">Playtime: 0 weeks</span>
          </div>
          <div class="timeline-zoom">
            <button class="zoom-btn" data-zoom="week" type="button">Week View</button>
            <button class="zoom-btn active" data-zoom="month" type="button">Month View</button>
            <button class="zoom-btn" data-zoom="year" type="button">Year View</button>
          </div>
        </div>
        <div class="timeline-track">
          <div class="timeline-progress">
            <div class="timeline-line"></div>
            <div class="timeline-markers"></div>
            <div class="timeline-current-marker"></div>
          </div>
          <div class="timeline-events"></div>
        </div>
        <div class="timeline-legend">
          <div class="legend-item">
            <span class="legend-dot event-economic"></span>
            <span>Economic Events</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot event-political"></span>
            <span>Political Events</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot event-save"></span>
            <span>Save Points</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot event-milestone"></span>
            <span>Milestones</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Toggle timeline expansion
    this.addEventListener(this.element, 'click', (e) => {
      if (e.target.closest('.timeline-toggle')) {
        this.toggleTimeline();
      }
    });

    // Zoom controls
    this.addEventListener(this.element, 'click', (e) => {
      if (e.target.classList.contains('zoom-btn')) {
        this.handleZoomChange(e.target.dataset.zoom);
      }
    });

    // Timeline events
    this.addEventListener(this.element, 'click', (e) => {
      if (e.target.closest('.timeline-event')) {
        this.handleEventClick(e.target.closest('.timeline-event'));
      }
    });

    // Listen for game state updates
    eventSystem.on(EVENTS.TURN_END, (event) => {
      this.updateTimeline(event.data.gameState);
    });

    eventSystem.on(EVENTS.GAME_SAVE, (event) => {
      this.addSavePoint(event.data);
    });

    eventSystem.on('economic:event', (event) => {
      this.addTimelineEvent(event.data, 'economic');
    });
  }

  /**
   * Toggle timeline expansion
   */
  toggleTimeline() {
    this.isExpanded = !this.isExpanded;
    const content = this.element.querySelector('.timeline-content');
    const toggleText = this.element.querySelector('.toggle-text');
    const toggleIcon = this.element.querySelector('.toggle-icon');

    if (this.isExpanded) {
      content.style.maxHeight = `${content.scrollHeight}px`;
      toggleText.textContent = 'Collapse';
      toggleIcon.textContent = '▲';
      this.element.classList.add('timeline-expanded');
    } else {
      content.style.maxHeight = '0';
      toggleText.textContent = 'Expand';
      toggleIcon.textContent = '▼';
      this.element.classList.remove('timeline-expanded');
    }
  }

  /**
   * Handle zoom level change
   */
  handleZoomChange(zoomLevel) {
    const zoomBtns = this.element.querySelectorAll('.zoom-btn');
    zoomBtns.forEach((btn) => btn.classList.remove('active'));
    this.element.querySelector(`[data-zoom="${zoomLevel}"]`).classList.add('active');

    this.currentZoom = zoomLevel;
    this.rerenderTimeline();
  }

  /**
   * Update timeline with current game state
   */
  updateTimeline(gameState) {
    this.gameState = gameState;

    // Update time info
    const currentTime = this.element.querySelector('.current-time');
    const playtime = this.element.querySelector('.playtime');

    currentTime.textContent = `Week ${gameState.time.week}, Year ${gameState.time.year}`;

    const totalWeeks = (gameState.time.year - 1) * 52 + gameState.time.week;
    playtime.textContent = `Playtime: ${totalWeeks} weeks`;

    // Update timeline progress
    this.updateTimelineProgress(gameState);

    // Add recent events to timeline
    if (gameState.events && gameState.events.recent) {
      gameState.events.recent.forEach((event) => {
        this.addTimelineEvent(event, event.type || 'general');
      });
    }
  }

  /**
   * Update timeline progress visualization
   */
  updateTimelineProgress(gameState) {
    const currentMarker = this.element.querySelector('.timeline-current-marker');
    const totalWeeks = (gameState.time.year - 1) * 52 + gameState.time.week;

    // Calculate position based on current zoom
    let maxWeeks = this.maxVisibleWeeks;
    if (this.currentZoom === 'week') {
      maxWeeks = 12; // Show 12 weeks
    } else if (this.currentZoom === 'year') {
      maxWeeks = 52 * 4; // Show 4 years
    }

    const progressPercent = Math.min((totalWeeks / maxWeeks) * 100, 100);
    currentMarker.style.left = `${progressPercent}%`;

    // Update timeline markers
    this.updateTimelineMarkers(maxWeeks, gameState);
  }

  /**
   * Update timeline markers for scale reference
   */
  updateTimelineMarkers(maxWeeks, _gameState) {
    const markersContainer = this.element.querySelector('.timeline-markers');
    markersContainer.innerHTML = '';

    let markerInterval;
    if (this.currentZoom === 'week') {
      markerInterval = 1;
    } else if (this.currentZoom === 'month') {
      markerInterval = 4;
    } else {
      markerInterval = 13;
    }

    for (let week = 0; week <= maxWeeks; week += markerInterval) {
      const marker = this.createElement('div', 'timeline-marker');
      marker.style.left = `${(week / maxWeeks) * 100}%`;

      const label = this.createElement('span', 'marker-label');
      if (this.currentZoom === 'year') {
        label.textContent = `Y${Math.floor(week / 52) + 1}`;
      } else {
        label.textContent = `W${week}`;
      }

      marker.appendChild(label);
      markersContainer.appendChild(marker);
    }
  }

  /**
   * Add event to timeline
   */
  addTimelineEvent(eventData, type = 'general') {
    const eventsContainer = this.element.querySelector('.timeline-events');

    const event = this.createElement('div', `timeline-event event-${type}`);
    event.setAttribute('data-event-id', eventData.id || Date.now());
    event.setAttribute('data-tooltip', eventData.description || eventData.title || 'Game Event');

    // Calculate event position
    const eventWeek = eventData.week || (this.gameState
      ? (this.gameState.time.year - 1) * 52 + this.gameState.time.week : 1);

    let maxWeeks;
    if (this.currentZoom === 'week') {
      maxWeeks = 12;
    } else if (this.currentZoom === 'month') {
      maxWeeks = 52;
    } else {
      maxWeeks = 52 * 4;
    }

    const position = Math.min((eventWeek / maxWeeks) * 100, 100);
    event.style.left = `${position}%`;

    // Event content
    const eventDot = this.createElement('div', 'event-dot');
    const eventTooltip = this.createElement('div', 'event-tooltip');
    eventTooltip.textContent = eventData.description || eventData.title || 'Game Event';

    event.appendChild(eventDot);
    event.appendChild(eventTooltip);

    eventsContainer.appendChild(event);

    // Remove old events to keep timeline clean
    this.cleanupOldEvents();
  }

  /**
   * Add save point to timeline
   */
  addSavePoint(saveData) {
    this.addTimelineEvent({
      id: saveData.saveId || `save_${Date.now()}`,
      title: 'Game Saved',
      description: `Save: ${saveData.saveName || 'Unnamed'}`,
      week: this.gameState ? (this.gameState.time.year - 1) * 52 + this.gameState.time.week : 1,
    }, 'save');
  }

  /**
   * Handle timeline event click
   */
  handleEventClick(eventElement) {
    const tooltip = eventElement.querySelector('.event-tooltip');
    if (tooltip) {
      // Toggle tooltip visibility
      tooltip.classList.toggle('visible');

      // Hide other tooltips
      this.element.querySelectorAll('.event-tooltip.visible').forEach((tip) => {
        if (tip !== tooltip) {
          tip.classList.remove('visible');
        }
      });
    }
  }

  /**
   * Clean up old timeline events
   */
  cleanupOldEvents() {
    const events = this.element.querySelectorAll('.timeline-event');
    if (events.length > 50) { // Keep only last 50 events
      Array.from(events)
        .slice(0, events.length - 50)
        .forEach((event) => event.remove());
    }
  }

  /**
   * Re-render timeline with current zoom
   */
  rerenderTimeline() {
    if (this.gameState) {
      this.updateTimeline(this.gameState);
    }
  }

  /**
   * Show timeline (add to DOM)
   */
  show(container) {
    if (container) {
      container.appendChild(this.element);
    }
    return this.element;
  }

  /**
   * Hide timeline
   */
  hide() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Get timeline statistics
   */
  getStats() {
    const events = this.element.querySelectorAll('.timeline-event');
    return {
      totalEvents: events.length,
      economicEvents: this.element.querySelectorAll('.event-economic').length,
      politicalEvents: this.element.querySelectorAll('.event-political').length,
      savePoints: this.element.querySelectorAll('.event-save').length,
      isExpanded: this.isExpanded,
      currentZoom: this.currentZoom,
    };
  }
}

export default Timeline;
