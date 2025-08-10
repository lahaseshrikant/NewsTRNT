import React, { useEffect } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  inp?: number;
}

const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const metrics: PerformanceMetrics = {};

    // LCP - Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            metrics.lcp = entry.startTime;
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // CLS - Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          metrics.cls = clsValue;
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        // FCP - First Contentful Paint
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });

        // Report metrics after page load
        window.addEventListener('load', () => {
          setTimeout(() => {
            if (process.env.NODE_ENV === 'development') {
              console.group('🚀 Performance Metrics');
              console.log(`LCP: ${metrics.lcp?.toFixed(2)}ms`, 
                metrics.lcp && metrics.lcp < 2500 ? '✅' : '❌');
              console.log(`CLS: ${metrics.cls?.toFixed(3)}`, 
                metrics.cls && metrics.cls < 0.1 ? '✅' : '❌');
              console.log(`FCP: ${metrics.fcp?.toFixed(2)}ms`, 
                metrics.fcp && metrics.fcp < 1800 ? '✅' : '❌');
              console.groupEnd();
            }
          }, 3000);
        });

        return () => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          fcpObserver.disconnect();
        };
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }, []);

  return null;
};

export default PerformanceMonitor;
