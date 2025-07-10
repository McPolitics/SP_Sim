import { EventSystem, EVENTS } from '../../src/core/EventSystem.js';

describe('EventSystem', () => {
  let eventSystem;

  beforeEach(() => {
    eventSystem = new EventSystem();
  });

  afterEach(() => {
    eventSystem.clear();
  });

  test('should create instance successfully', () => {
    expect(eventSystem).toBeInstanceOf(EventSystem);
    expect(eventSystem.listeners).toBeInstanceOf(Map);
    expect(eventSystem.eventQueue).toEqual([]);
  });

  test('should register event listener', () => {
    const callback = jest.fn();
    eventSystem.on('test', callback);

    expect(eventSystem.listeners.has('test')).toBe(true);
    expect(eventSystem.listeners.get('test')).toHaveLength(1);
  });

  test('should emit events to listeners', () => {
    const callback = jest.fn();
    eventSystem.on('test', callback);

    eventSystem.emit('test', { data: 'test data' });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({
      type: 'test',
      data: { data: 'test data' },
      timestamp: expect.any(Number),
    });
  });

  test('should queue events for later processing', () => {
    const callback = jest.fn();
    eventSystem.on('test', callback);

    eventSystem.queue('test', { queued: true });
    expect(callback).not.toHaveBeenCalled();

    eventSystem.processQueue();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('should unsubscribe event listener', () => {
    const callback = jest.fn();
    const unsubscribe = eventSystem.on('test', callback);

    unsubscribe();
    eventSystem.emit('test');

    expect(callback).not.toHaveBeenCalled();
  });

  test('should handle multiple listeners for same event', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    eventSystem.on('test', callback1);
    eventSystem.on('test', callback2);

    eventSystem.emit('test');

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test('should provide correct statistics', () => {
    eventSystem.on('test1', jest.fn());
    eventSystem.on('test1', jest.fn());
    eventSystem.on('test2', jest.fn());
    eventSystem.queue('test3');

    const stats = eventSystem.getStats();

    expect(stats.eventTypes).toBe(2);
    expect(stats.totalListeners).toBe(3);
    expect(stats.queuedEvents).toBe(1);
    expect(stats.isProcessing).toBe(false);
  });

  test('should handle errors in event listeners gracefully', () => {
    const errorCallback = jest.fn(() => {
      throw new Error('Test error');
    });
    const normalCallback = jest.fn();

    // Mock console.error to suppress output during this test
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => { });

    eventSystem.on('test', errorCallback);
    eventSystem.on('test', normalCallback);

    expect(() => eventSystem.emit('test')).not.toThrow();
    expect(normalCallback).toHaveBeenCalled();

    // Restore the original console.error
    consoleErrorMock.mockRestore();
  });

  test('should clear all listeners and queue', () => {
    eventSystem.on('test', jest.fn());
    eventSystem.queue('test');

    eventSystem.clear();

    expect(eventSystem.listeners.size).toBe(0);
    expect(eventSystem.eventQueue).toHaveLength(0);
  });
});

describe('EVENTS constants', () => {
  test('should have required event constants', () => {
    expect(EVENTS.GAME_START).toBe('game:start');
    expect(EVENTS.GAME_PAUSE).toBe('game:pause');
    expect(EVENTS.TURN_START).toBe('turn:start');
    expect(EVENTS.ECONOMY_UPDATE).toBe('economy:update');
    expect(EVENTS.APPROVAL_CHANGE).toBe('politics:approval_change');
    expect(EVENTS.UI_UPDATE).toBe('ui:update');
  });
});