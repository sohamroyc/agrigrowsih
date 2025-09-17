import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
}

const SparklineChart: React.FC<SparklineChartProps> = ({ data, width = 100, height = 30 }) => {
  const { theme } = useTheme();
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      // Invert y-axis for SVG coordinate system
      const y = height - (((d - min) / range) * (height - 4) + 2); // Add padding to avoid touching edges
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const lineColor = theme === 'dark' ? '#34d399' : '#10b981';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SparklineChart;
