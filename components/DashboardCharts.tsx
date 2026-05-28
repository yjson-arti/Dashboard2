import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartSectionProps {
  title: string;
  data: Array<{ name: string; comparison: number; current: number }>;
  color: string;
  valuePrefix?: string;
}

const ChartSection: React.FC<ChartSectionProps> = ({ title, data, color, valuePrefix = '$' }) => {
  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            barGap={8}
            margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
          >
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8' }} 
              tickFormatter={(value) => `${valuePrefix}${value}M`}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              formatter={(value: number) => [`${valuePrefix}${value}M`, '']}
            />
            <Bar dataKey="comparison" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Comparison Period" barSize={32} />
            <Bar dataKey="current" fill={color} radius={[4, 4, 0, 0]} name="Current Period" barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-6 text-[11px] font-medium text-slate-500">
         <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div> Comparison Period
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div> Current Period
         </div>
      </div>
    </div>
  );
};

const DashboardCharts: React.FC = () => {
  // Data updated to include 'Beacon' in the middle
  const spendData = [
    { name: 'Sponsored ads', comparison: 3.6, current: 3.1 },
    { name: 'Beacon', comparison: 1.8, current: 2.4 },
    { name: 'DSP', comparison: 2.5, current: 2.1 },
  ];

  const ntbData = [
    { name: 'Sponsored ads', comparison: 4.4, current: 5.1 },
    { name: 'Beacon', comparison: 2.1, current: 3.5 },
    { name: 'DSP', comparison: 2.8, current: 3.2 },
  ];

  const revenueData = [
    { name: 'Sponsored ads', comparison: 9.0, current: 10.0 },
    { name: 'Beacon', comparison: 4.5, current: 6.2 },
    { name: 'DSP', comparison: 5.2, current: 5.8 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <ChartSection title="Spend" data={spendData} color="#60a5fa" />
      <ChartSection title="NTB Revenue" data={ntbData} color="#86efac" />
      <ChartSection title="Total Revenue" data={revenueData} color="#fbbf24" />
    </div>
  );
};

export default DashboardCharts;