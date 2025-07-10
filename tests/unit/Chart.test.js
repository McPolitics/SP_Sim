import { Chart } from '../../src/ui/components/Chart';

// Mock canvas context
const mockContext = {
  clearRect: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  arc: jest.fn(),
  closePath: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 50 })),
  set fillStyle(value) { this._fillStyle = value; },
  get fillStyle() { return this._fillStyle; },
  set strokeStyle(value) { this._strokeStyle = value; },
  get strokeStyle() { return this._strokeStyle; },
  set lineWidth(value) { this._lineWidth = value; },
  get lineWidth() { return this._lineWidth; },
  set font(value) { this._font = value; },
  get font() { return this._font; },
  set textAlign(value) { this._textAlign = value; },
  get textAlign() { return this._textAlign; },
  set textBaseline(value) { this._textBaseline = value; },
  get textBaseline() { return this._textBaseline; }
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn(() => mockContext)
});

describe('Chart Component', () => {
  let chart;
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test-chart"></div>';
    container = document.getElementById('test-chart');
    
    // Reset mock functions
    Object.values(mockContext).forEach(method => {
      if (typeof method === 'function') {
        method.mockClear();
      }
    });
  });

  afterEach(() => {
    if (chart) {
      chart.destroy();
    }
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    test('should create chart with default options', () => {
      chart = new Chart('test-chart');
      
      expect(chart.options.type).toBe('line');
      expect(chart.options.width).toBe(400);
      expect(chart.options.height).toBe(200);
      expect(chart.canvas).toBeTruthy();
      expect(chart.ctx).toBe(mockContext);
    });

    test('should create chart with custom options', () => {
      chart = new Chart('test-chart', {
        type: 'bar',
        width: 600,
        height: 300,
        title: 'Test Chart',
        colors: ['#ff0000', '#00ff00']
      });

      expect(chart.options.type).toBe('bar');
      expect(chart.options.width).toBe(600);
      expect(chart.options.height).toBe(300);
      expect(chart.options.title).toBe('Test Chart');
      expect(chart.options.colors).toEqual(['#ff0000', '#00ff00']);
    });

    test('should handle missing container element', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      chart = new Chart('non-existent');
      
      expect(consoleSpy).toHaveBeenCalledWith('Chart container element not found');
      consoleSpy.mockRestore();
    });
  });

  describe('Data Updates', () => {
    beforeEach(() => {
      chart = new Chart('test-chart');
    });

    test('should update chart data', () => {
      const renderSpy = jest.spyOn(chart, 'render');
      const newData = [10, 20, 30, 40];
      const newLabels = ['A', 'B', 'C', 'D'];

      chart.updateData(newData, newLabels);

      expect(chart.options.data).toEqual(newData);
      expect(chart.options.labels).toEqual(newLabels);
      expect(renderSpy).toHaveBeenCalled();
    });

    test('should update data without labels', () => {
      const newData = [5, 15, 25];
      chart.updateData(newData);

      expect(chart.options.data).toEqual(newData);
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      chart = new Chart('test-chart', {
        data: [10, 20, 30],
        labels: ['A', 'B', 'C']
      });
    });

    test('should clear canvas before rendering', () => {
      chart.render();
      
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 200);
    });

    test('should draw title when provided', () => {
      chart.options.title = 'Test Chart Title';
      chart.render();
      
      expect(mockContext.fillText).toHaveBeenCalledWith('Test Chart Title', 200, 15);
    });

    test('should call appropriate draw method based on chart type', () => {
      const lineChartSpy = jest.spyOn(chart, 'drawLineChart');
      chart.options.type = 'line';
      chart.render();
      expect(lineChartSpy).toHaveBeenCalled();

      const barChartSpy = jest.spyOn(chart, 'drawBarChart');
      chart.options.type = 'bar';
      chart.render();
      expect(barChartSpy).toHaveBeenCalled();

      const pieChartSpy = jest.spyOn(chart, 'drawPieChart');
      chart.options.type = 'pie';
      chart.render();
      expect(pieChartSpy).toHaveBeenCalled();

      const areaChartSpy = jest.spyOn(chart, 'drawAreaChart');
      chart.options.type = 'area';
      chart.render();
      expect(areaChartSpy).toHaveBeenCalled();
    });
  });

  describe('Line Chart', () => {
    beforeEach(() => {
      chart = new Chart('test-chart', {
        type: 'line',
        data: [{ values: [10, 20, 30, 15] }],
        labels: ['A', 'B', 'C', 'D']
      });
    });

    test('should draw line chart with correct data', () => {
      chart.render();
      
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    test('should draw points on the line', () => {
      chart.render();
      
      expect(mockContext.arc).toHaveBeenCalled();
      expect(mockContext.fill).toHaveBeenCalled();
    });
  });

  describe('Bar Chart', () => {
    beforeEach(() => {
      chart = new Chart('test-chart', {
        type: 'bar',
        data: [
          { value: 10, name: 'A' },
          { value: 20, name: 'B' },
          { value: 30, name: 'C' }
        ]
      });
    });

    test('should draw bar chart with rectangles', () => {
      chart.render();
      
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    test('should draw value labels on bars', () => {
      chart.render();
      
      expect(mockContext.fillText).toHaveBeenCalledWith('10', expect.any(Number), expect.any(Number));
      expect(mockContext.fillText).toHaveBeenCalledWith('20', expect.any(Number), expect.any(Number));
      expect(mockContext.fillText).toHaveBeenCalledWith('30', expect.any(Number), expect.any(Number));
    });
  });

  describe('Pie Chart', () => {
    beforeEach(() => {
      chart = new Chart('test-chart', {
        type: 'pie',
        data: [
          { value: 30, name: 'A' },
          { value: 50, name: 'B' },
          { value: 20, name: 'C' }
        ]
      });
    });

    test('should draw pie chart with arcs', () => {
      chart.render();
      
      expect(mockContext.arc).toHaveBeenCalled();
      expect(mockContext.fill).toHaveBeenCalled();
    });

    test('should draw percentage labels', () => {
      chart.render();
      
      expect(mockContext.fillText).toHaveBeenCalledWith('30.0%', expect.any(Number), expect.any(Number));
      expect(mockContext.fillText).toHaveBeenCalledWith('50.0%', expect.any(Number), expect.any(Number));
      expect(mockContext.fillText).toHaveBeenCalledWith('20.0%', expect.any(Number), expect.any(Number));
    });
  });

  describe('Grid and Axes', () => {
    beforeEach(() => {
      chart = new Chart('test-chart', {
        data: [10, 20, 30],
        showGrid: true,
        showAxes: true
      });
    });

    test('should draw grid when enabled', () => {
      const gridSpy = jest.spyOn(chart, 'drawGrid');
      chart.render();
      
      expect(gridSpy).toHaveBeenCalled();
    });

    test('should draw axes when enabled', () => {
      const axesSpy = jest.spyOn(chart, 'drawAxes');
      chart.render();
      
      expect(axesSpy).toHaveBeenCalled();
    });

    test('should draw axis labels when labels provided', () => {
      chart.options.labels = ['A', 'B', 'C'];
      const labelsSpy = jest.spyOn(chart, 'drawAxisLabels');
      chart.render();
      
      expect(labelsSpy).toHaveBeenCalled();
    });
  });

  describe('Legend', () => {
    beforeEach(() => {
      chart = new Chart('test-chart', {
        data: [
          { name: 'Series 1', values: [10, 20] },
          { name: 'Series 2', values: [15, 25] }
        ],
        showLegend: true
      });
    });

    test('should draw legend when enabled and data has names', () => {
      const legendSpy = jest.spyOn(chart, 'drawLegend');
      chart.render();
      
      expect(legendSpy).toHaveBeenCalled();
    });

    test('should draw legend items', () => {
      chart.render();
      
      expect(mockContext.fillText).toHaveBeenCalledWith('Series 1', expect.any(Number), expect.any(Number));
      expect(mockContext.fillText).toHaveBeenCalledWith('Series 2', expect.any(Number), expect.any(Number));
    });
  });

  describe('Error Handling', () => {
    test('should handle empty data gracefully', () => {
      chart = new Chart('test-chart', { data: [] });
      
      expect(() => chart.render()).not.toThrow();
    });

    test('should warn about unsupported chart types', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      chart = new Chart('test-chart', { type: 'unsupported' });
      chart.render();
      
      expect(consoleSpy).toHaveBeenCalledWith('Chart type unsupported not supported');
      consoleSpy.mockRestore();
    });
  });
});