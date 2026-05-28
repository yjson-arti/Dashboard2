import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// --- Types ---

type CustomerCategory = 'New Customer' | 'Re-Purchase (Same)' | 'Re-Purchase (GBM)' | 'Re-Purchase (Cross)';

interface CampaignData {
  campaign: string;
  'New Customer': number;
  'Re-Purchase (Same)': number;
  'Re-Purchase (GBM)': number;
  'Re-Purchase (Cross)': number;
}

interface RankedData {
  campaign: string;
  rank1: { name: string; value: number };
  rank2: { name: string; value: number };
  rank3: { name: string; value: number };
  rank4: { name: string; value: number };
}

// --- Constants ---

const CAMPAIGNS = ['Manifesto Launch', 'Ultra Camera', 'Sports Experience', 'Black Friday', 'Holiday'];

const METRICS = [
  'Impressions',
  '# of Acquired Customers',
  'Revenue',
  'CPM',
  'CPV50',
  'CPV75',
  'CPC',
  'Customer Acquisition Cost($)',
  'Revenue per customer ($)',
  'ROAS'
];

const COLORS: Record<string, string> = {
  'New Customer': '#87CEEB', // Sky Blue (Bottom)
  'Re-Purchase (Same)': '#A2D968', // Light Green (Middle)
  'Re-Purchase (GBM)': '#8294C4', // Periwinkle (Top)
  'Re-Purchase (Cross)': '#F08080', // Light Coral (Distinct 4th color)
};

// --- Component ---

const CustomerPerformanceByCampaign: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0]);
  
  const data = React.useMemo(() => {
    const getBaseValue = (metric: string) => {
      switch(metric) {
        case 'Impressions': return 5000000;
        case '# of Acquired Customers': return 1500;
        case 'Revenue': return 200000;
        case 'CPM': return 15;
        case 'CPV50': return 0.05;
        case 'CPV75': return 0.05;
        case 'CPC': return 1.5;
        case 'Customer Acquisition Cost($)': return 45;
        case 'Revenue per customer ($)': return 120;
        case 'ROAS': return 4.5;
        default: return 100;
      }
    };

    const baseValue = getBaseValue(selectedMetric);

    const unsortedData = CAMPAIGNS.map(campaign => {
      // Campaign-specific multipliers to create variance
      let campaignMultiplier = 1;
      let categoryMultipliers = {
        'New Customer': 1,
        'Re-Purchase (Same)': 1,
        'Re-Purchase (GBM)': 1,
        'Re-Purchase (Cross)': 1,
      };

      if (campaign === 'Manifesto Launch') {
        campaignMultiplier = 1.2;
        categoryMultipliers = { 'New Customer': 1.5, 'Re-Purchase (Same)': 0.8, 'Re-Purchase (GBM)': 0.6, 'Re-Purchase (Cross)': 0.5 };
      } else if (campaign === 'Ultra Camera') {
        campaignMultiplier = 0.9;
        categoryMultipliers = { 'New Customer': 0.7, 'Re-Purchase (Same)': 1.4, 'Re-Purchase (GBM)': 0.8, 'Re-Purchase (Cross)': 0.6 };
      } else if (campaign === 'Sports Experience') {
        campaignMultiplier = 0.7;
        categoryMultipliers = { 'New Customer': 0.6, 'Re-Purchase (Same)': 0.7, 'Re-Purchase (GBM)': 1.3, 'Re-Purchase (Cross)': 0.9 };
      } else if (campaign === 'Black Friday') {
        campaignMultiplier = 1.8;
        categoryMultipliers = { 'New Customer': 1.1, 'Re-Purchase (Same)': 0.9, 'Re-Purchase (GBM)': 1.2, 'Re-Purchase (Cross)': 1.6 };
      } else if (campaign === 'Holiday') {
        campaignMultiplier = 1.5;
        categoryMultipliers = { 'New Customer': 1.3, 'Re-Purchase (Same)': 1.1, 'Re-Purchase (GBM)': 1.4, 'Re-Purchase (Cross)': 0.8 };
      }

      const raw = {
        'New Customer': Number((baseValue * campaignMultiplier * categoryMultipliers['New Customer'] * (0.9 + Math.random() * 0.2)).toFixed(2)),
        'Re-Purchase (Same)': Number((baseValue * campaignMultiplier * categoryMultipliers['Re-Purchase (Same)'] * (0.9 + Math.random() * 0.2)).toFixed(2)),
        'Re-Purchase (GBM)': Number((baseValue * campaignMultiplier * categoryMultipliers['Re-Purchase (GBM)'] * (0.9 + Math.random() * 0.2)).toFixed(2)),
        'Re-Purchase (Cross)': Number((baseValue * campaignMultiplier * categoryMultipliers['Re-Purchase (Cross)'] * (0.9 + Math.random() * 0.2)).toFixed(2)),
      };

      const total = Object.values(raw).reduce((sum, val) => sum + val, 0);

      // Sort categories by value descending
      const sorted = Object.entries(raw)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }));

      return {
        campaign,
        total,
        rank1: sorted[0],
        rank2: sorted[1],
        rank3: sorted[2],
        rank4: sorted[3],
      };
    });

    return unsortedData.sort((a, b) => {
      const priority = ['Black Friday', 'Holiday'];
      const aIndex = priority.indexOf(a.campaign);
      const bIndex = priority.indexOf(b.campaign);

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      return b.total - a.total;
    });
  }, [selectedMetric]);

  const categoryTotals = React.useMemo(() => {
    const totals: Record<string, number> = {
      'New Customer': 0,
      'Re-Purchase (Same)': 0,
      'Re-Purchase (GBM)': 0,
      'Re-Purchase (Cross)': 0,
    };

    data.forEach(row => {
      [row.rank1, row.rank2, row.rank3, row.rank4].forEach(rank => {
        if (totals[rank.name] !== undefined) {
          totals[rank.name] += rank.value;
        }
      });
    });

    return totals;
  }, [data]);

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatValue = (value: number) => {
    if (selectedMetric.includes('$') || selectedMetric === 'Revenue' || selectedMetric === 'CPM' || selectedMetric === 'CPC') {
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg text-xs">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const rankKey = entry.dataKey.split('.')[0];
            const realData = entry.payload[rankKey];
            
            return (
              <div key={index} className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[realData.name] }}></div>
                <span className="text-slate-500">{realData.name}:</span>
                <span className="font-bold text-slate-700">{formatValue(realData.value)}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-slate-50">
        {Object.entries(COLORS).map(([name, color]) => (
          <div key={name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }}></div>
            <span className="text-xs font-bold text-slate-500">{name}:</span>
            <span className="text-xs font-black text-slate-800">{formatValue(categoryTotals[name])}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-800">Performance per Customer</h3>
          <p className="text-xs text-slate-500 mt-1">
            Breakdown of customer categories within top 5 campaigns (Sorted by Performance).
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="metric-select" className="text-xs font-bold text-slate-500 uppercase">Primary KPI</label>
          <div className="relative">
            <select
              id="metric-select"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold py-2 pl-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-indigo-500"
            >
              {METRICS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="campaign" 
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend content={<CustomLegend />} />
            {/* Render 4 bars for Rank 1 to Rank 4 */}
            {[1, 2, 3, 4].map(rank => (
              <Bar key={`rank${rank}`} dataKey={`rank${rank}.value`} radius={[4, 4, 0, 0]} legendType="none">
                {data.map((entry, index) => {
                  // @ts-ignore
                  const rankData = entry[`rank${rank}`];
                  return <Cell key={`cell-${index}`} fill={COLORS[rankData.name]} />;
                })}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomerPerformanceByCampaign;
