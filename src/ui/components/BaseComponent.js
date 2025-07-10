/**
 * BaseComponent - Base class for all UI components in SP_Sim
 * Provides common functionality for event handling and DOM manipulation
 */
export class BaseComponent {
  constructor(elementId) {
    this.element = elementId ? document.getElementById(elementId) : null;
    this.listeners = [];
    this.isVisible = true;
  }

  /**
   * Add event listener and track it for cleanup
   */
  addEventListener(element, event, handler) {
    const listener = { element, event, handler };
    element.addEventListener(event, handler);
    this.listeners.push(listener);
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
  }

  /**
   * Show the component
   */
  show() {
    if (this.element) {
      this.element.classList.remove('hidden');
      this.isVisible = true;
    }
  }

  /**
   * Hide the component
   */
  hide() {
    if (this.element) {
      this.element.classList.add('hidden');
      this.isVisible = false;
    }
  }

  /**
   * Toggle component visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Update component content
   */
  update(_data) {
    // To be implemented by subclasses
    console.warn('update() method not implemented in', this.constructor.name); // eslint-disable-line no-console
  }

  /**
   * Destroy the component and clean up
   */
  destroy() {
    this.removeAllEventListeners();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  /**
   * Set element text content safely
   */
  setTextContent(selector, text) {
    const element = this.element ? this.element.querySelector(selector) : document.querySelector(selector);
    if (element) {
      element.textContent = text;
    }
  }

  /**
   * Set element HTML content safely
   */
  setHTML(selector, html) {
    const element = this.element ? this.element.querySelector(selector) : document.querySelector(selector);
    if (element) {
      element.innerHTML = html;
    }
  }

  /**
   * Add CSS class to element
   */
  addClass(selector, className) {
    const element = this.element ? this.element.querySelector(selector) : document.querySelector(selector);
    if (element) {
      element.classList.add(className);
    }
  }

  /**
   * Remove CSS class from element
   */
  removeClass(selector, className) {
    const element = this.element ? this.element.querySelector(selector) : document.querySelector(selector);
    if (element) {
      element.classList.remove(className);
    }
  }

  /**
   * Format number with thousands separators
   */
  formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  /**
   * Format percentage
   */
  formatPercentage(num, decimals = 1) {
    return `${this.formatNumber(num, decimals)}%`;
  }

  /**
   * Format currency
   */
  formatCurrency(num, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  /**
   * Create and append a DOM element
   */
  createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
  }
}
