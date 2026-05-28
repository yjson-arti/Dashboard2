import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface StackedChartProps {
  title: string;
  data: any[];
  hideBeacon?: boolean;
}

// Updated Color Palette: DSP is now Green
const COLORS = {
  'Non-Beacon': '#93c5fd', // Blue 300 (Light Blue)
  'Beacon': '#3b82f6',     // Blue 500 (Medium Blue)
  'DSP': '#22c55e',        // Green 500 (Green)
};

const StackedChart: React.FC<StackedChartProps> = ({ title, data, hideBeacon }) => {
  // Transform data to split Comparison and Current into separate keys
  const transformedData = data.map(item => {
    const isComparison = item.period === 'Comparison';
    const prefix = isComparison ? 'comp_' : 'curr_';
    
    return {
      period: item.period,
      [`${prefix}Non-Beacon`]: item['Non-Beacon'],
      [`${prefix}Beacon`]: item['Beacon'],
      [`${prefix}DSP`]: item['DSP'],
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 w-full text-left">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={transformedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barSize={48}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
            <XAxis 
              dataKey="period" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(val) => `$${val}M`}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              formatter={(value: number, name: string) => {
                // Clean up the name prefix for the tooltip
                const cleanName = name.replace('curr_', '').replace('comp_', '');
                return [`$${value}M`, cleanName];
              }}
            />
            
            {/* 
              Stacking Order (Bottom to Top): Non-Beacon -> Beacon -> DSP
              Note: We set legendType="none" for comparison bars so they don't appear in the legend.
            */}

            {/* 1. Non-Beacon (Bottom) */}
            <Bar dataKey="comp_Non-Beacon" stackId="a" fill={COLORS['Non-Beacon']} legendType="none" />
            <Bar dataKey="curr_Non-Beacon" stackId="a" fill={COLORS['Non-Beacon']} name="Non-Beacon" />

            {/* 2. Beacon (Middle) */}
            {!hideBeacon && <Bar dataKey="comp_Beacon" stackId="a" fill={COLORS['Beacon']} legendType="none" />}
            {!hideBeacon && <Bar dataKey="curr_Beacon" stackId="a" fill={COLORS['Beacon']} name="Beacon" />}

            {/* 3. DSP (Top) */}
            <Bar dataKey="comp_DSP" stackId="a" fill={COLORS['DSP']} radius={[4, 4, 0, 0]} legendType="none" />
            <Bar dataKey="curr_DSP" stackId="a" fill={COLORS['DSP']} name="DSP" radius={[4, 4, 0, 0]} />
            
            <Legend 
              iconType="circle"
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: '11px', paddingTop: '20px', color: '#000000' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const StackedDashboardCharts: React.FC = () => {
  // Spend: Exclude Beacon
  const spendData = [
    { period: 'Comparison', 'Non-Beacon': 3.6, 'DSP': 2.5 },
    { period: 'Current', 'Non-Beacon': 3.1, 'DSP': 2.1 },
  ];

  // NTB Revenue
  const ntbData = [
    { period: 'Comparison', 'Non-Beacon': 4.4, 'Beacon': 2.1, 'DSP': 2.8 },
    { period: 'Current', 'Non-Beacon': 5.1, 'Beacon': 3.5, 'DSP': 3.2 },
  ];

  // Total Revenue
  const revenueData = [
    { period: 'Comparison', 'Non-Beacon': 9.0, 'Beacon': 4.5, 'DSP': 5.2 },
    { period: 'Current', 'Non-Beacon': 10.0, 'Beacon': 6.2, 'DSP': 5.8 },
  ];

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-slate-800">Cumulative Performance</h2>
        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded font-medium">Stacked View</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <StackedChart title="Spend (Excl. Beacon)" data={spendData} hideBeacon={true} />
         <StackedChart title="New-to-brand Revenue" data={ntbData} />
         <StackedChart title="Total Revenue" data={revenueData} />
      </div>
    </div>
  );
};

export default StackedDashboardCharts;