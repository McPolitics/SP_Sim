import { BaseComponent } from './BaseComponent';
import { eventSystem } from '../../core/EventSystem';

/**
 * Modal - Reusable modal dialog component
 * Handles various dialog types like confirmations, forms, and info displays
 */
export class Modal extends BaseComponent {
  constructor(options = {}) {
    super();
    this.options = {
      title: 'Dialog',
      content: '',
      type: 'info', // info, confirm, form, custom
      confirmText: 'OK',
      cancelText: 'Cancel',
      showCancel: false,
      onConfirm: null,
      onCancel: null,
      backdrop: true,
      closeable: true,
      ...options,
    };

    this.isOpen = false;
    this.createModal();
  }

  /**
   * Create modal structure
   */
  createModal() {
    // Create modal backdrop
    this.backdrop = this.createElement('div', 'modal-backdrop');
    if (!this.options.backdrop) {
      this.backdrop.style.background = 'transparent';
      this.backdrop.style.pointerEvents = 'none';
    }

    // Create modal container
    this.element = this.createElement('div', 'modal');

    // Create modal content
    this.modalContent = this.createElement('div', 'modal__content');

    // Create header
    this.modalHeader = this.createElement('div', 'modal__header');
    this.modalTitle = this.createElement('h3', 'modal__title', this.options.title);
    this.modalHeader.appendChild(this.modalTitle);

    // Create close button if closeable
    if (this.options.closeable) {
      this.closeButton = this.createElement('button', 'modal__close', '×');
      this.modalHeader.appendChild(this.closeButton);
    }

    // Create body
    this.modalBody = this.createElement('div', 'modal__body');
    this.setContent(this.options.content);

    // Create footer
    this.modalFooter = this.createElement('div', 'modal__footer');
    this.createFooterButtons();

    // Assemble modal
    this.modalContent.appendChild(this.modalHeader);
    this.modalContent.appendChild(this.modalBody);
    this.modalContent.appendChild(this.modalFooter);
    this.element.appendChild(this.modalContent);
    this.backdrop.appendChild(this.element);

    this.setupEventListeners();
    this.hide(); // Start hidden
  }

  /**
   * Create footer buttons based on modal type
   */
  createFooterButtons() {
    this.modalFooter.innerHTML = '';

    if (this.options.showCancel || this.options.type === 'confirm') {
      this.cancelButton = this.createElement('button', 'btn btn--secondary', this.options.cancelText);
      this.modalFooter.appendChild(this.cancelButton);
    }

    this.confirmButton = this.createElement('button', 'btn btn--primary', this.options.confirmText);
    this.modalFooter.appendChild(this.confirmButton);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close button
    if (this.closeButton) {
      this.addEventListener(this.closeButton, 'click', () => {
        this.close();
      });
    }

    // Cancel button
    if (this.cancelButton) {
      this.addEventListener(this.cancelButton, 'click', () => {
        this.cancel();
      });
    }

    // Confirm button
    if (this.confirmButton) {
      this.addEventListener(this.confirmButton, 'click', () => {
        this.confirm();
      });
    }

    // Backdrop click
    if (this.options.backdrop && this.options.closeable) {
      this.addEventListener(this.backdrop, 'click', (e) => {
        if (e.target === this.backdrop) {
          this.close();
        }
      });
    }

    // Escape key
    this.addEventListener(document, 'keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen && this.options.closeable) {
        this.close();
      }
    });
  }

  /**
   * Set modal content
   */
  setContent(content) {
    if (typeof content === 'string') {
      this.modalBody.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.modalBody.innerHTML = '';
      this.modalBody.appendChild(content);
    }
  }

  /**
   * Set modal title
   */
  setTitle(title) {
    this.options.title = title;
    this.modalTitle.textContent = title;
  }

  /**
   * Show the modal
   */
  show() {
    if (this.isOpen) return;

    // Add to DOM
    document.body.appendChild(this.backdrop);

    // Trigger show animation
    requestAnimationFrame(() => {
      this.backdrop.classList.add('modal-backdrop--visible');
      this.element.classList.add('modal--visible');
    });

    this.isOpen = true;

    // Focus first input if it's a form modal
    if (this.options.type === 'form') {
      const firstInput = this.modalBody.querySelector('input, textarea, select');
      if (firstInput) {
        firstInput.focus();
      }
    }

    // Emit event
    eventSystem.emit('modal:show', { modal: this });
  }

  /**
   * Hide the modal
   */
  hide() {
    if (!this.isOpen) return;

    this.backdrop.classList.remove('modal-backdrop--visible');
    this.element.classList.remove('modal--visible');

    // Remove from DOM after animation
    setTimeout(() => {
      if (this.backdrop.parentNode) {
        document.body.removeChild(this.backdrop);
      }
    }, 300);

    this.isOpen = false;

    // Emit event
    eventSystem.emit('modal:hide', { modal: this });
  }

  /**
   * Close modal (same as hide but can be overridden)
   */
  close() {
    this.hide();
  }

  /**
   * Handle confirm action
   */
  confirm() {
    let result = true;

    // If it's a form modal, collect form data
    if (this.options.type === 'form') {
      const formData = this.collectFormData();
      if (this.options.onConfirm) {
        result = this.options.onConfirm(formData);
      }
    } else if (this.options.onConfirm) {
      result = this.options.onConfirm();
    }

    // Close modal if callback returns true or undefined
    if (result !== false) {
      this.hide();
    }
  }

  /**
   * Handle cancel action
   */
  cancel() {
    if (this.options.onCancel) {
      this.options.onCancel();
    }
    this.hide();
  }

  /**
   * Collect form data from modal body
   */
  collectFormData() {
    const formData = {};
    const inputs = this.modalBody.querySelectorAll('input, textarea, select');

    inputs.forEach((input) => {
      const name = input.name || input.id;
      if (name) {
        if (input.type === 'checkbox') {
          formData[name] = input.checked;
        } else if (input.type === 'radio') {
          if (input.checked) {
            formData[name] = input.value;
          }
        } else {
          formData[name] = input.value;
        }
      }
    });

    return formData;
  }

  /**
   * Static method to create quick confirmation dialog
   */
  static confirm(title, message, onConfirm, onCancel) {
    return new Modal({
      title,
      content: `<p>${message}</p>`,
      type: 'confirm',
      confirmText: 'Yes',
      cancelText: 'No',
      showCancel: true,
      onConfirm,
      onCancel,
    }).show();
  }

  /**
   * Static method to create quick alert dialog
   */
  static alert(title, message, onConfirm) {
    return new Modal({
      title,
      content: `<p>${message}</p>`,
      type: 'info',
      confirmText: 'OK',
      onConfirm,
    }).show();
  }

  /**
   * Static method to create quick prompt dialog
   */
  static prompt(title, message, onConfirm, defaultValue = '') {
    const content = `
      <p>${message}</p>
      <input type="text" name="value" value="${defaultValue}" class="form-input" style="width: 100%; margin-top: 10px;">
    `;

    return new Modal({
      title,
      content,
      type: 'form',
      confirmText: 'OK',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm: (formData) => {
        if (onConfirm) {
          onConfirm(formData.value);
        }
        return true;
      },
    }).show();
  }

  /**
   * Destroy modal and clean up
   */
  destroy() {
    this.hide();
    this.removeAllEventListeners();
  }
}

export default Modal;
