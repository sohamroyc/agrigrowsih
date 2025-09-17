import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useTheme } from '../hooks/useTheme';

interface PriceHistoryChartProps {
  data: { date: string; price: number }[];
}

const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ data }) => {
  const { t } = useLocalization();
  const { theme } = useTheme();

  if (!data || data.length < 2) {
    return <div className="text-center p-8">{t('not_enough_data_for_chart')}</div>;
  }

  const svgWidth = 600;
  const svgHeight = 300;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Adjust min and max for better visual representation
  const pricePadding = (maxPrice - minPrice) * 0.1;
  const yMin = Math.max(0, minPrice - pricePadding);
  const yMax = maxPrice + pricePadding;

  const getX = (index: number) => (index / (data.length - 1)) * width;
  const getY = (price: number) => height - ((price - yMin) / (yMax - yMin)) * height;

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.price)}`).join(' ');

  const yAxisLabels = [yMin, yMin + (yMax - yMin) / 2, yMax];
  const xAxisLabels = [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]];
  
  const axisColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';


  return (
    <div>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Y-axis grid lines */}
            {yAxisLabels.map((price, i) => (
            <g key={i} transform={`translate(0, ${getY(price)})`}>
                <line x1="0" x2={width} stroke={gridColor} strokeDasharray="2" />
                <text x="-10" y="5" textAnchor="end" fill={axisColor} fontSize="10">
                ₹{Math.round(price)}
                </text>
            </g>
            ))}
            
             {/* X-axis labels */}
            {xAxisLabels.map((d, i) => {
                let index = 0;
                if (i === 1) index = Math.floor(data.length / 2);
                if (i === 2) index = data.length - 1;
                const date = new Date(d.date);
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return (
                    <text key={i} x={getX(index)} y={height + 25} textAnchor="middle" fill={axisColor} fontSize="10">
                        {formattedDate}
                    </text>
                )
            })}
            <text x={width / 2} y={height + 38} textAnchor="middle" fill={axisColor} fontSize="12" fontWeight="medium">{t('last_30_days')}</text>


            {/* Line path */}
            <path d={path} fill="none" stroke="#16a34a" strokeWidth="2" />

            {/* Circles on data points */}
            {data.map((d, i) => (
            <circle
                key={i}
                cx={getX(i)}
                cy={getY(d.price)}
                r="3"
                fill="#16a34a"
                stroke="white"
                strokeWidth="1"
            >
                <title>{t('chart_tooltip', { date: d.date, price: d.price })}</title>
            </circle>
            ))}
        </g>
        </svg>
    </div>
  );
};

export default PriceHistoryChart;