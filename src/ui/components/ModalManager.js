export class ModalManager {
  constructor(eventSystem) {
    this.eventSystem = eventSystem;
    this.modals = new Set();

    // Track modals on show/hide
    this.eventSystem.on('modal:show', (event) => {
      if (event.data && event.data.modal) {
        this.modals.add(event.data.modal);
      }
    });

    this.eventSystem.on('modal:hide', (event) => {
      if (event.data && event.data.modal) {
        this.modals.delete(event.data.modal);
      }
    });

    // Cleanup on game start or reset events
    this.eventSystem.on('game:reset', () => {
      this.cleanup();
    });
    this.eventSystem.on('game:start', () => {
      this.cleanup();
    });
  }

  /**
   * Destroy or hide all tracked modals
   */
  cleanup() {
    this.modals.forEach((modal) => {
      if (typeof modal.destroy === 'function') {
        modal.destroy();
      } else if (typeof modal.hide === 'function') {
        modal.hide();
      }
    });
    this.modals.clear();
  }
}

// Export singleton instance using global event system
import { eventSystem } from '../../core/EventSystem';
export const modalManager = new ModalManager(eventSystem);
