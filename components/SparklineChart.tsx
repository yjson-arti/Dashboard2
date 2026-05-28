import React from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendDataPoint } from '../types';

interface SparklineChartProps {
  data: TrendDataPoint[];
}

const SparklineChart: React.FC<SparklineChartProps> = ({ data }) => {
  return (
    <div className="h-24 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="day" 
            hide={true} 
          />
          <YAxis hide={true} domain={['dataMin', 'dataMax']} />
          <Tooltip 
            contentStyle={{ fontSize: '12px', borderRadius: '4px', padding: '4px' }}
            itemStyle={{ padding: 0 }}
          />
          {/* Current Period - Blue */}
          <Line 
            type="monotone" 
            dataKey="current" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={false} 
          />
          {/* Comparison Period - Grey */}
          <Line 
            type="monotone" 
            dataKey="comparison" 
            stroke="#cbd5e1" 
            strokeWidth={2} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center items-center gap-4 mt-1 text-[10px] text-gray-500">
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-sm"></div> Current Period
         </div>
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-300 rounded-sm"></div> Comparison Period
         </div>
      </div>
    </div>
  );
};

export default SparklineChart;