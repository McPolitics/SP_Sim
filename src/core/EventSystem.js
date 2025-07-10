/**
 * EventSystem - Centralized event handling and dispatching for SP_Sim
 * Enables loose coupling between game modules through event-driven architecture
 */
export class EventSystem {
  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.isProcessing = false;
  }

  /**
   * Subscribe to an event type
   * @param {string} eventType - The type of event to listen for
   * @param {Function} callback - Function to call when event is dispatched
   * @param {Object} context - Optional context for the callback
   * @returns {Function} Unsubscribe function
   */
  on(eventType, callback, context = null) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const listener = { callback, context };
    this.listeners.get(eventType).push(listener);

    // Return unsubscribe function
    return () => this.off(eventType, callback);
  }

  /**
   * Unsubscribe from an event type
   * @param {string} eventType - The event type to unsubscribe from
   * @param {Function} callback - The callback function to remove
   */
  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;

    const listeners = this.listeners.get(eventType);
    const index = listeners.findIndex((listener) => listener.callback === callback);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // Clean up empty listener arrays
    if (listeners.length === 0) {
      this.listeners.delete(eventType);
    }
  }

  /**
   * Dispatch an event immediately
   * @param {string} eventType - The type of event to dispatch
   * @param {Object} data - Data to pass to event listeners
   */
  emit(eventType, data = {}) {
    if (!this.listeners.has(eventType)) return;

    const event = {
      type: eventType,
      data,
      timestamp: Date.now(),
    };

    const listeners = this.listeners.get(eventType);

    // Create a copy to avoid issues if listeners are modified during iteration
    [...listeners].forEach((listener) => {
      try {
        if (listener.context) {
          listener.callback.call(listener.context, event);
        } else {
          listener.callback(event);
        }
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    });
  }

  /**
   * Queue an event for later processing
   * @param {string} eventType - The type of event to queue
   * @param {Object} data - Data to pass to event listeners
   */
  queue(eventType, data = {}) {
    this.eventQueue.push({
      type: eventType,
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Process all queued events
   */
  processQueue() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      this.emit(event.type, event.data);
    }

    this.isProcessing = false;
  }

  /**
   * Clear all event listeners
   */
  clear() {
    this.listeners.clear();
    this.eventQueue = [];
    this.isProcessing = false;
  }

  /**
   * Get statistics about the event system
   * @returns {Object} Event system statistics
   */
  getStats() {
    return {
      eventTypes: this.listeners.size,
      totalListeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
      queuedEvents: this.eventQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

// Event type constants for better maintainability
export const EVENTS = {
  // Game flow events
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_SAVE: 'game:save',
  GAME_LOAD: 'game:load',
  TURN_START: 'turn:start',
  TURN_END: 'turn:end',

  // Economic events
  ECONOMY_UPDATE: 'economy:update',
  GDP_CHANGE: 'economy:gdp_change',
  UNEMPLOYMENT_CHANGE: 'economy:unemployment_change',
  INFLATION_CHANGE: 'economy:inflation_change',
  POLICY_ECONOMIC_EFFECT: 'economy:policy_effect',

  // Political events
  APPROVAL_CHANGE: 'politics:approval_change',
  ELECTION_CALLED: 'politics:election_called',
  VOTE_SCHEDULED: 'politics:vote_scheduled',
  COALITION_CHANGE: 'politics:coalition_change',
  POLICY_PROPOSED: 'politics:policy_proposed',
  POLICY_PASSED: 'politics:policy_passed',
  POLICY_FAILED: 'politics:policy_failed',

  // Global events
  DIPLOMATIC_CHANGE: 'global:diplomatic_change',
  TRADE_AGREEMENT: 'global:trade_agreement',
  INTERNATIONAL_CRISIS: 'global:international_crisis',
  GLOBAL_EVENT: 'global:event',

  // Scandal events
  SCANDAL_EMERGE: 'scandal:emerge',
  SCANDAL_ESCALATE: 'scandal:escalate',
  SCANDAL_RESOLVE: 'scandal:resolve',
  MEDIA_ATTENTION: 'scandal:media_attention',

  // UI events
  UI_UPDATE: 'ui:update',
  UI_NOTIFICATION: 'ui:notification',
  UI_ERROR: 'ui:error',
};

// Create and export global event system instance
export const eventSystem = new EventSystem();
