import { Platform } from 'react-native';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private static instance: PerformanceMonitor;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string, metadata?: Record<string, any>): void {
    if (__DEV__) {
      this.metrics.set(name, {
        name,
        startTime: performance.now(),
        metadata,
      });
    }
  }

  endMeasure(name: string): void {
    if (__DEV__) {
      const metric = this.metrics.get(name);
      if (metric) {
        metric.endTime = performance.now();
        metric.duration = metric.endTime - metric.startTime;
        console.log(
          `[Performance] ${name}: ${metric.duration.toFixed(2)}ms`,
          metric.metadata,
        );
        this.metrics.delete(name);
      }
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Higher-order function to measure performance of async functions
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>,
): Promise<T> => {
  performanceMonitor.startMeasure(name, metadata);
  try {
    const result = await fn();
    return result;
  } finally {
    performanceMonitor.endMeasure(name);
  }
};

// Higher-order function to measure performance of sync functions
export const measureSync = <T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>,
): T => {
  performanceMonitor.startMeasure(name, metadata);
  try {
    const result = fn();
    return result;
  } finally {
    performanceMonitor.endMeasure(name);
  }
}; 