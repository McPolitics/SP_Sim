import { modalManager } from '../../src/ui/components/ModalManager';
import { Modal } from '../../src/ui/components/Modal';
import { eventSystem, EVENTS } from '../../src/core/EventSystem';

describe('ModalManager', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    modalManager.cleanup();
  });

  afterEach(() => {
    modalManager.cleanup();
    document.body.innerHTML = '';
  });

  test('should track modals on show and hide', () => {
    const modal = new Modal();
    expect(modalManager.modals.size).toBe(0);

    modal.show();
    expect(modalManager.modals.size).toBe(1);

    modal.hide();
    expect(modalManager.modals.size).toBe(0);
  });

  test('should cleanup modals on game start', () => {
    const modal1 = new Modal();
    const modal2 = new Modal();
    modal1.show();
    modal2.show();

    expect(modalManager.modals.size).toBe(2);

    eventSystem.emit(EVENTS.GAME_START);

    expect(modalManager.modals.size).toBe(0);
    expect(modal1.isOpen).toBe(false);
    expect(modal2.isOpen).toBe(false);
  });
});
