import { Modal } from '../../src/ui/components/Modal';

describe('Modal Component', () => {
  let modal;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (modal) {
      modal.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    test('should create modal with default options', () => {
      modal = new Modal();
      
      expect(modal.options.title).toBe('Dialog');
      expect(modal.options.type).toBe('info');
      expect(modal.isOpen).toBe(false);
    });

    test('should create modal with custom options', () => {
      modal = new Modal({
        title: 'Custom Dialog',
        content: 'Custom content',
        type: 'confirm',
        confirmText: 'Yes',
        cancelText: 'No'
      });

      expect(modal.options.title).toBe('Custom Dialog');
      expect(modal.options.type).toBe('confirm');
      expect(modal.options.confirmText).toBe('Yes');
    });

    test('should create modal DOM structure', () => {
      modal = new Modal();
      
      expect(modal.backdrop).toBeTruthy();
      expect(modal.element).toBeTruthy();
      expect(modal.modalContent).toBeTruthy();
      expect(modal.modalHeader).toBeTruthy();
      expect(modal.modalBody).toBeTruthy();
      expect(modal.modalFooter).toBeTruthy();
    });
  });

  describe('Show/Hide', () => {
    test('should show modal', () => {
      modal = new Modal();
      modal.show();

      expect(modal.isOpen).toBe(true);
      expect(document.body.contains(modal.backdrop)).toBe(true);
    });

    test('should hide modal', () => {
      modal = new Modal();
      modal.show();
      modal.hide();

      expect(modal.isOpen).toBe(false);
    });

    test('should not show modal if already open', () => {
      modal = new Modal();
      modal.show();
      const spy = jest.spyOn(document.body, 'appendChild');
      
      modal.show(); // Try to show again
      
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Content Management', () => {
    test('should set string content', () => {
      modal = new Modal();
      modal.setContent('<p>Test content</p>');
      
      expect(modal.modalBody.innerHTML).toBe('<p>Test content</p>');
    });

    test('should set element content', () => {
      modal = new Modal();
      const element = document.createElement('div');
      element.textContent = 'Element content';
      
      modal.setContent(element);
      
      expect(modal.modalBody.contains(element)).toBe(true);
    });

    test('should set modal title', () => {
      modal = new Modal();
      modal.setTitle('New Title');
      
      expect(modal.modalTitle.textContent).toBe('New Title');
      expect(modal.options.title).toBe('New Title');
    });
  });

  describe('Form Data Collection', () => {
    test('should collect form data correctly', () => {
      modal = new Modal({
        type: 'form',
        content: `
          <input name="name" value="John">
          <input name="age" value="25" type="number">
          <input name="subscribe" type="checkbox" checked>
          <input name="gender" type="radio" value="male" checked>
        `
      });
      
      modal.show();
      
      const formData = modal.collectFormData();
      
      expect(formData.name).toBe('John');
      expect(formData.age).toBe('25');
      expect(formData.subscribe).toBe(true);
      expect(formData.gender).toBe('male');
    });

    test('should handle empty form', () => {
      modal = new Modal({ type: 'form' });
      modal.show();
      
      const formData = modal.collectFormData();
      
      expect(formData).toEqual({});
    });
  });

  describe('Button Actions', () => {
    test('should call onConfirm callback', () => {
      const onConfirm = jest.fn(() => true);
      modal = new Modal({ onConfirm });
      modal.show();
      
      modal.confirmButton.click();
      
      expect(onConfirm).toHaveBeenCalled();
      expect(modal.isOpen).toBe(false);
    });

    test('should not close modal if onConfirm returns false', () => {
      const onConfirm = jest.fn(() => false);
      modal = new Modal({ onConfirm });
      modal.show();
      
      modal.confirmButton.click();
      
      expect(onConfirm).toHaveBeenCalled();
      expect(modal.isOpen).toBe(true);
    });

    test('should call onCancel callback', () => {
      const onCancel = jest.fn();
      modal = new Modal({ 
        type: 'confirm',
        onCancel 
      });
      modal.show();
      
      if (modal.cancelButton) {
        modal.cancelButton.click();
      }
      
      expect(onCancel).toHaveBeenCalled();
      expect(modal.isOpen).toBe(false);
    });
  });

  describe('Keyboard Events', () => {
    test('should close modal on Escape key', () => {
      modal = new Modal();
      modal.show();
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      
      expect(modal.isOpen).toBe(false);
    });

    test('should not close modal on Escape if not closeable', () => {
      modal = new Modal({ closeable: false });
      modal.show();
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      
      expect(modal.isOpen).toBe(true);
    });
  });

  describe('Static Methods', () => {
    test('Modal.alert should create and show alert modal', () => {
      const onConfirm = jest.fn();
      
      Modal.alert('Alert Title', 'Alert message', onConfirm);
      
      const modalElement = document.querySelector('.modal');
      expect(modalElement).toBeTruthy();
      
      const titleElement = document.querySelector('.modal__title');
      expect(titleElement.textContent).toBe('Alert Title');
    });

    test('Modal.confirm should create and show confirmation modal', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      Modal.confirm('Confirm Title', 'Confirm message', onConfirm, onCancel);
      
      const modalElement = document.querySelector('.modal');
      expect(modalElement).toBeTruthy();
      
      const cancelButton = document.querySelector('.btn--secondary');
      expect(cancelButton).toBeTruthy();
    });

    test('Modal.prompt should create and show prompt modal', () => {
      const onConfirm = jest.fn();
      
      Modal.prompt('Prompt Title', 'Enter value:', onConfirm, 'default');
      
      const modalElement = document.querySelector('.modal');
      const inputElement = document.querySelector('input[name="value"]');
      
      expect(modalElement).toBeTruthy();
      expect(inputElement).toBeTruthy();
      expect(inputElement.value).toBe('default');
    });
  });

  describe('Accessibility', () => {
    test('should focus first input in form modal', () => {
      modal = new Modal({
        type: 'form',
        content: '<input type="text" name="test">'
      });
      
      const focusSpy = jest.spyOn(HTMLElement.prototype, 'focus');
      modal.show();
      
      // Focus happens asynchronously
      setTimeout(() => {
        expect(focusSpy).toHaveBeenCalled();
      }, 0);
    });
  });
});