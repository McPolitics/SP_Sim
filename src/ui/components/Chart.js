import { BaseComponent } from './BaseComponent';

/**
 * Chart - Data visualization component for SP_Sim
 * Provides various chart types for displaying game metrics
 */
export class Chart extends BaseComponent {
  constructor(containerId, options = {}) {
    super(containerId);
    this.options = {
      type: 'line', // line, bar, pie, area
      width: 400,
      height: 200,
      data: [],
      labels: [],
      colors: ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6'],
      title: '',
      showGrid: true,
      showAxes: true,
      showLegend: true,
      ...options,
    };

    this.canvas = null;
    this.ctx = null;
    this.initializeChart();
  }

  /**
   * Initialize chart canvas
   */
  initializeChart() {
    if (!this.element) {
      console.error('Chart container element not found');
      return;
    }

    // Create canvas element
    this.canvas = this.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.canvas.style.cssText = `
      max-width: 100%;
      height: auto;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
    `;

    this.element.innerHTML = '';
    this.element.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.render();
  }

  /**
   * Update chart with new data
   */
  updateData(data, labels = null) {
    this.options.data = data;
    if (labels) {
      this.options.labels = labels;
    }
    this.render();
  }

  /**
   * Render the chart
   */
  render() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set up drawing context
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Calculate drawing area (leaving space for title, axes, legend)
    const margins = {
      top: this.options.title ? 30 : 20,
      right: 20,
      bottom: this.options.showAxes ? 40 : 20,
      left: this.options.showAxes ? 50 : 20,
    };

    const chartArea = {
      x: margins.left,
      y: margins.top,
      width: this.canvas.width - margins.left - margins.right,
      height: this.canvas.height - margins.top - margins.bottom,
    };

    // Draw title
    if (this.options.title) {
      this.drawTitle();
    }

    // Draw chart based on type
    switch (this.options.type) {
      case 'line':
        this.drawLineChart(chartArea);
        break;
      case 'bar':
        this.drawBarChart(chartArea);
        break;
      case 'pie':
        this.drawPieChart(chartArea);
        break;
      case 'area':
        this.drawAreaChart(chartArea);
        break;
      default:
        console.warn(`Chart type ${this.options.type} not supported`);
    }

    // Draw axes
    if (this.options.showAxes && this.options.type !== 'pie') {
      this.drawAxes(chartArea);
    }

    // Draw legend
    if (this.options.showLegend) {
      this.drawLegend(chartArea);
    }
  }

  /**
   * Draw chart title
   */
  drawTitle() {
    this.ctx.save();
    this.ctx.font = 'bold 14px Arial';
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.options.title, this.canvas.width / 2, 15);
    this.ctx.restore();
  }

  /**
   * Draw line chart
   */
  drawLineChart(area) {
    const { data } = this.options;
    if (!data.length) return;

    const pointCount = data[0].values ? data[0].values.length : data.length;
    const stepX = area.width / Math.max(1, pointCount - 1);

    // Determine Y-axis range
    const allValues = data.flatMap((series) => (series.values ? series.values : [series]))
      .filter((v) => typeof v === 'number');

    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);
    const rangeY = maxY - minY || 1;

    // Draw grid
    if (this.options.showGrid) {
      this.drawGrid(area, pointCount, 5);
    }

    // Draw data series
    data.forEach((series, seriesIndex) => {
      const color = this.options.colors[seriesIndex % this.options.colors.length];
      const values = series.values || [series];

      this.ctx.save();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      values.forEach((value, index) => {
        const x = area.x + index * stepX;
        const y = area.y + area.height - ((value - minY) / rangeY) * area.height;

        if (index === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      });

      this.ctx.stroke();
      this.ctx.restore();

      // Draw points
      this.ctx.save();
      this.ctx.fillStyle = color;
      values.forEach((value, index) => {
        const x = area.x + index * stepX;
        const y = area.y + area.height - ((value - minY) / rangeY) * area.height;

        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
        this.ctx.fill();
      });
      this.ctx.restore();
    });
  }

  /**
   * Draw bar chart
   */
  drawBarChart(area) {
    const { data } = this.options;
    if (!data.length) return;

    const values = data.map((item) => item.value || item);
    const maxValue = Math.max(...values);
    const barWidth = (area.width / data.length) * 0.8;
    const barSpacing = (area.width / data.length) * 0.2;

    data.forEach((item, index) => {
      const value = item.value || item;
      const barHeight = (value / maxValue) * area.height;
      const x = area.x + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = area.y + area.height - barHeight;

      const color = this.options.colors[index % this.options.colors.length];

      this.ctx.save();
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value label
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.formatNumber(value),
        x + barWidth / 2,
        y - 10,
      );
      this.ctx.restore();
    });
  }

  /**
   * Draw pie chart
   */
  drawPieChart(area) {
    const { data } = this.options;
    if (!data.length) return;

    const values = data.map((item) => item.value || item);
    const total = values.reduce((sum, value) => sum + value, 0);
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;
    const radius = Math.min(area.width, area.height) / 2 - 20;

    let currentAngle = -Math.PI / 2; // Start at top

    data.forEach((item, index) => {
      const value = item.value || item;
      const sliceAngle = (value / total) * 2 * Math.PI;
      const color = this.options.colors[index % this.options.colors.length];

      // Draw slice
      this.ctx.save();
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      this.ctx.closePath();
      this.ctx.fill();

      // Draw slice border
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      this.ctx.restore();

      // Draw percentage label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * radius * 0.7;
      const labelY = centerY + Math.sin(labelAngle) * radius * 0.7;
      const percentage = ((value / total) * 100).toFixed(1);

      this.ctx.save();
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${percentage}%`, labelX, labelY);
      this.ctx.restore();

      currentAngle += sliceAngle;
    });
  }

  /**
   * Draw area chart (filled line chart)
   */
  drawAreaChart(area) {
    const { data } = this.options;
    if (!data.length) return;

    const pointCount = data[0].values ? data[0].values.length : data.length;
    const stepX = area.width / Math.max(1, pointCount - 1);

    const allValues = data.flatMap((series) => (series.values ? series.values : [series]))
      .filter((v) => typeof v === 'number');

    const minY = Math.min(0, ...allValues);
    const maxY = Math.max(...allValues);
    const rangeY = maxY - minY || 1;

    // Draw filled areas
    data.forEach((series, seriesIndex) => {
      const color = this.options.colors[seriesIndex % this.options.colors.length];
      const values = series.values || [series];

      this.ctx.save();
      this.ctx.fillStyle = `${color}40`; // Add transparency
      this.ctx.beginPath();

      // Start from bottom left
      this.ctx.moveTo(area.x, area.y + area.height);

      values.forEach((value, index) => {
        const x = area.x + index * stepX;
        const y = area.y + area.height - ((value - minY) / rangeY) * area.height;
        this.ctx.lineTo(x, y);
      });

      // Close path to bottom right
      this.ctx.lineTo(area.x + (values.length - 1) * stepX, area.y + area.height);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    });

    // Draw line on top
    this.drawLineChart(area);
  }

  /**
   * Draw grid lines
   */
  drawGrid(area, xLines, yLines) {
    this.ctx.save();
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i <= xLines; i += 1) {
      const x = area.x + (i / xLines) * area.width;
      this.ctx.beginPath();
      this.ctx.moveTo(x, area.y);
      this.ctx.lineTo(x, area.y + area.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= yLines; i += 1) {
      const y = area.y + (i / yLines) * area.height;
      this.ctx.beginPath();
      this.ctx.moveTo(area.x, y);
      this.ctx.lineTo(area.x + area.width, y);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Draw axes
   */
  drawAxes(area) {
    this.ctx.save();
    this.ctx.strokeStyle = '#2c3e50';
    this.ctx.lineWidth = 2;

    // Y axis
    this.ctx.beginPath();
    this.ctx.moveTo(area.x, area.y);
    this.ctx.lineTo(area.x, area.y + area.height);
    this.ctx.stroke();

    // X axis
    this.ctx.beginPath();
    this.ctx.moveTo(area.x, area.y + area.height);
    this.ctx.lineTo(area.x + area.width, area.y + area.height);
    this.ctx.stroke();

    this.ctx.restore();

    // Draw labels if available
    if (this.options.labels.length > 0) {
      this.drawAxisLabels(area);
    }
  }

  /**
   * Draw axis labels
   */
  drawAxisLabels(area) {
    this.ctx.save();
    this.ctx.fillStyle = '#2c3e50';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';

    this.options.labels.forEach((label, index) => {
      const x = area.x + (index / (this.options.labels.length - 1)) * area.width;
      const y = area.y + area.height + 15;
      this.ctx.fillText(label, x, y);
    });

    this.ctx.restore();
  }

  /**
   * Draw legend
   */
  drawLegend(area) {
    if (!this.options.data.some((item) => item.name)) return;

    const legendY = area.y + area.height + 30;
    let legendX = area.x;
    const legendItemWidth = 100;

    this.ctx.save();
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'left';

    this.options.data.forEach((item, index) => {
      if (!item.name) return;

      const color = this.options.colors[index % this.options.colors.length];

      // Draw color box
      this.ctx.fillStyle = color;
      this.ctx.fillRect(legendX, legendY - 6, 12, 12);

      // Draw text
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.fillText(item.name, legendX + 16, legendY);

      legendX += legendItemWidth;
    });

    this.ctx.restore();
  }
}

export default Chart;
