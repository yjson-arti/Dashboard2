
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const OBJECTIVE_CONFIG = [
  { name: 'Awareness', color: '#60a5fa' },
  { name: 'Evoke', color: '#93c5fd' },
  { name: 'Consideration', color: '#fbbf24' },
  { name: 'Conversion', color: '#22c55e' },
  { name: 'NULL', color: '#cbd5e1' }
];

const DATA_N_MINUS_1 = [
  { name: 'Awareness', value: 30, spend: 38.7 },
  { name: 'Evoke', value: 25, spend: 32.3 },
  { name: 'Consideration', value: 20, spend: 25.8 },
  { name: 'Conversion', value: 15, spend: 19.4 },
  { name: 'NULL', value: 10, spend: 12.9 },
];

const DATA_N = [
  { name: 'Awareness', value: 25, spend: 24.3 },
  { name: 'Evoke', value: 30, spend: 29.2 },
  { name: 'Consideration', value: 15, spend: 14.6 },
  { name: 'Conversion', value: 20, spend: 19.5 },
  { name: 'NULL', value: 10, spend: 9.8 },
];

const renderOutsideLabel = ({ cx, cy, midAngle, outerRadius, percent, payload }: any) => {
  const RADIAN = Math.PI / 180;
  // Position labels slightly closer to the ring to avoid container clipping
  const radius = outerRadius + 12; 
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const textAnchor = x > cx ? 'start' : 'end';

  return (
    <g>
      <text 
        x={x} 
        y={y} 
        fill="#475569" 
        textAnchor={textAnchor} 
        dominantBaseline="central" 
        className="text-[9px] font-black"
      >
        {`${payload.spend}M (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-slate-200 shadow-lg rounded-md">
        <p className="text-[10px] font-black uppercase text-slate-500">{payload[0].name}</p>
        <p className="text-xs font-bold text-slate-800">{payload[0].value}% Proportion</p>
        <p className="text-[10px] text-slate-400 font-medium">Spend: ${payload[0].payload.spend}M</p>
      </div>
    );
  }
  return null;
};

const SpendAllocationInsight: React.FC = () => {
  return (
    <section className="mt-12 mb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Budget Allocation Strategy</h2>
        <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-[10px] rounded font-black uppercase tracking-wider">Strategic Comparison View</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* 1. Portfolio Mix (Dual Donut Charts) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-visible">
          <div className="flex flex-grow items-center justify-around py-2 gap-2">
            {/* N-1 Chart */}
            <div className="flex flex-col items-center flex-1">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, bottom: 20, left: 30, right: 30 }}>
                    <Pie
                      data={DATA_N_MINUS_1}
                      innerRadius={22}
                      outerRadius={38}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={true}
                      label={renderOutsideLabel}
                    >
                      {DATA_N_MINUS_1.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={OBJECTIVE_CONFIG[index].color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-400">N-1</span>
                </div>
              </div>
            </div>

            {/* N Chart */}
            <div className="flex flex-col items-center flex-1">
              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, bottom: 20, left: 35, right: 35 }}>
                    <Pie
                      data={DATA_N}
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      labelLine={true}
                      label={renderOutsideLabel}
                    >
                      {DATA_N.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={OBJECTIVE_CONFIG[index].color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[12px] font-black text-indigo-600">N</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2 border-t border-slate-50 pt-4">
            {OBJECTIVE_CONFIG.map((obj, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: obj.color }}></div>
                <span className="text-[10px] font-bold text-slate-600">{obj.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Strategic Allocation Table */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="py-3 text-left text-[11px] font-black text-slate-700 uppercase tracking-widest min-w-[120px]">Objective</th>
                  <th className="py-3 text-right text-[11px] font-black text-slate-700 uppercase tracking-widest">Spend(N)</th>
                  <th className="py-3 text-right text-[11px] font-black text-slate-700 uppercase tracking-widest bg-slate-50/50 px-3">VS N-1</th>
                  <th className="py-3 text-right text-[11px] font-black text-slate-700 uppercase tracking-widest">Proportion (N)</th>
                  <th className="py-3 text-right text-[11px] font-black text-slate-700 uppercase tracking-widest bg-slate-50/50 px-3">VS N-1</th>
                </tr>
              </thead>
              <tbody>
                {DATA_N.map((obj, i) => {
                  const prevProp = DATA_N_MINUS_1[i].value;
                  const prevSpend = DATA_N_MINUS_1[i].spend;
                  const propDiff = obj.value - prevProp;
                  const spendDiffPct = ((obj.spend - prevSpend) / prevSpend) * 100;
                  
                  return (
                    <tr key={i} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <td className="py-4 text-[11px] font-bold text-slate-700">{obj.name}</td>
                      <td className="py-4 text-[11px] text-right font-medium text-slate-600">${obj.spend}M</td>
                      <td className={`py-4 text-[10px] text-right font-black px-3 bg-slate-50/30`}>
                        <span className={spendDiffPct >= 0 ? 'text-blue-500' : 'text-red-500'}>
                          {spendDiffPct > 0 ? '+' : ''}{spendDiffPct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 text-[11px] text-right font-black text-slate-900">{obj.value}%</td>
                      <td className={`py-4 text-[10px] text-right font-black px-3 bg-slate-50/30`}>
                        <span className={propDiff >= 0 ? 'text-blue-500' : 'text-red-500'}>
                          {propDiff > 0 ? '+' : ''}{propDiff}%p
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50 font-black border-t border-slate-200">
                  <td className="py-4 px-2 text-[11px] text-slate-800">TOTAL</td>
                  <td className="py-4 px-2 text-[11px] text-right text-slate-800">$ 97.4M</td>
                  <td className="py-4 px-2 text-[11px] text-right text-slate-800 bg-slate-100/30">-</td>
                  <td className="py-4 px-2 text-[11px] text-right text-slate-800">100%</td>
                  <td className="py-4 px-2 text-[11px] text-right text-slate-800 bg-slate-100/30">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SpendAllocationInsight;
