import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface SchoolChartProps {
  type: 'line' | 'bar' | 'doughnut';
  data: any;
  options?: any;
  height?: number;
}

export const SchoolChart: React.FC<SchoolChartProps> = ({ type, data, options, height = 240 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: options?.plugins?.legend?.display ?? true,
            position: options?.plugins?.legend?.position ?? 'top',
            labels: {
              boxWidth: 12,
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 11,
              },
            },
          },
          tooltip: {
            backgroundColor: '#1E293B',
            padding: 10,
            cornerRadius: 8,
            titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
            bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
          },
        },
        ...options,
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [type, data, options]);

  return (
    <div style={{ height: `${height}px`, width: '100%' }} className="relative">
      <canvas ref={canvasRef} />
    </div>
  );
};
