
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend
} from 'recharts';

const OBJECTIVE_CONFIG = [
  { name: 'Awareness', color: '#60a5fa' },
  { name: 'Evoke', color: '#93c5fd' },
  { name: 'Consideration', color: '#fbbf24' },
  { name: 'Conversion', color: '#22c55e' }
];

const DATA = [
  { objective: 'Awareness', n1_prop: 35, n_prop: 30, n1_spend: 45.2, n_spend: 22.4 },
  { objective: 'Evoke', n1_prop: 25, n_prop: 35, n1_spend: 32.3, n_spend: 32.1 },
  { objective: 'Consideration', n1_prop: 20, n_prop: 15, n1_spend: 25.8, n_spend: 12.3 },
  { objective: 'Conversion', n1_prop: 20, n_prop: 20, n1_spend: 25.8, n_spend: 30.6 },
];

// Data for Slope Chart: needs to be formatted as two points per line
const slopeData = [
  { name: 'N-1', 
    Awareness: 35, Evoke: 25, Consideration: 20, Conversion: 20 
  },
  { name: 'N', 
    Awareness: 30, Evoke: 35, Consideration: 15, Conversion: 20 
  }
];

const BudgetShiftMatrix: React.FC = () => {
  return (
    <section className="mt-16 mb-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Budget Momentum & Mix Shift</h2>
        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] rounded font-black uppercase tracking-wider">Alternative Strategic View</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Mix Shift Slope Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Strategic Mix Shift</h3>
            <p className="text-sm font-bold text-slate-800">Proportion (%) Directionality</p>
          </div>
          
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={slopeData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} 
                />
                <YAxis 
                  hide={true}
                  domain={[0, 45]}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value}%`, '']}
                />
                {OBJECTIVE_CONFIG.map((obj) => (
                  <Line 
                    key={obj.name}
                    type="monotone" 
                    dataKey={obj.name} 
                    stroke={obj.color} 
                    strokeWidth={3} 
                    dot={{ r: 6, fill: obj.color, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                    label={(props: any) => {
                      const { x, y, value, index } = props;
                      if (index === 1) { // Only show on the 'N' side
                        return (
                          <text x={x + 10} y={y} dy={4} fill={obj.color} fontSize={10} fontWeight="bold">
                            {obj.name} ({value}%)
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Volume Comparison Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="mb-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Spend Magnitude</h3>
            <p className="text-sm font-bold text-slate-800">Absolute Spend Comparison ($M)</p>
          </div>
          
          <div className="flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={DATA} 
                layout="vertical"
                margin={{ left: 10, right: 40 }}
                barGap={4}
              >
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="objective" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 'bold', fill: '#475569' }} 
                />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '8px', border: 'none' }}
                   formatter={(val) => [`$${val}M`, '']}
                />
                <Bar dataKey="n1_spend" fill="#e2e8f0" radius={[0, 4, 4, 0]} name="N-1 Spend" barSize={12} />
                <Bar dataKey="n_spend" fill="#10b981" radius={[0, 4, 4, 0]} name="N Spend" barSize={12}>
                  {DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={OBJECTIVE_CONFIG[index].color} />
                  ))}
                </Bar>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Insight Summaries */}
        <div className="grid grid-rows-2 gap-4">
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Focus Expansion</span>
            </div>
            <h4 className="text-xl font-black text-slate-800">Evoke Strategy</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Budget proportion increased from <span className="font-bold">25%</span> to <span className="font-bold text-blue-600">35%</span>. 
              The most significant strategic pivot in period N.
            </p>
          </div>

          <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Efficiency Play</span>
            </div>
            <h4 className="text-xl font-black text-slate-800">Consideration</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Spend optimized by <span className="font-bold text-amber-600">-61.9%</span>. 
              Resources reallocated to Evoke and Conversion stages for better funnel flow.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default BudgetShiftMatrix;
