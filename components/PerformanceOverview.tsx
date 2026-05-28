
import React from 'react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface TrendData {
  day: string;
  current: number;
  comparison: number;
}

const generateTrendData = (base: number): TrendData[] => {
  return Array.from({ length: 31 }, (_, i) => ({
    day: `D+${i}`,
    current: base * (0.8 + Math.random() * 0.4) * (1 + i/60),
    comparison: base * (1.1 + Math.random() * 0.3) * (1 + i/80),
  }));
};

const STAGES = [
  { 
    name: 'Total', 
    metrics: ['Spend', 'Impressions', 'Clicks'],
    data: [
      { n: '$ 65.4M', comp: '-49.9%', isPos: false, nMinus1: '$ 130.5M' },
      { n: '24.6B', comp: '-32.5%', isPos: false, nMinus1: '36.4B' },
      { n: '217.3M', comp: '-24.8%', isPos: false, nMinus1: '288.8M' }
    ],
    trendBase: 2000
  },
  { 
    name: 'Reach', 
    metrics: ['Spend', 'Impressions', 'Unique Reach'],
    data: [
      { n: '$ 32.1M', comp: '-45.2%', isPos: false, nMinus1: '$ 58.6M' },
      { n: '18.4B', comp: '-28.1%', isPos: false, nMinus1: '25.6B' },
      { n: '1.2B', comp: '+5.4%', isPos: true, nMinus1: '1.14B' }
    ],
    trendBase: 1200
  },
  { 
    name: 'Awareness', 
    metrics: ['Spend', 'Impressions', '50% Views'],
    data: [
      { n: '$ 22.4M', comp: '-59.6%', isPos: false, nMinus1: '$ 55.5M' },
      { n: '15.7B', comp: '-34.5%', isPos: false, nMinus1: '23.9B' },
      { n: '2.0B', comp: '-48.0%', isPos: false, nMinus1: '3.8B' }
    ],
    trendBase: 1000
  },
  { 
    name: 'Evoke', 
    metrics: ['Spend', 'Impressions', '50% Views'],
    data: [
      { n: '$ 18.2M', comp: '-42.1%', isPos: false, nMinus1: '$ 31.4M' },
      { n: '12.4B', comp: '-12.5%', isPos: false, nMinus1: '14.2B' },
      { n: '1.8B', comp: '-30.0%', isPos: false, nMinus1: '2.6B' }
    ],
    trendBase: 800
  },
  { 
    name: 'Consideration', 
    metrics: ['Spend', 'Clicks', '75% Views'],
    data: [
      { n: '$ 12.3M', comp: '-61.9%', isPos: false, nMinus1: '$ 32.3M' },
      { n: '108.1M', comp: '+24.5%', isPos: true, nMinus1: '86.8M' },
      { n: '285.5M', comp: '-61.0%', isPos: false, nMinus1: '731.1M' }
    ],
    trendBase: 500
  },
  { 
    name: 'Conversion', 
    metrics: ['Spend', 'Platform Revenue', 'eStore Revenue'],
    data: [
      { n: '$ 30.6M', comp: '-28.4%', isPos: false, nMinus1: '$ 42.8M' },
      { n: '$ 361.2M', comp: '-32.3%', isPos: false, nMinus1: '$ 533.7M' },
      { n: '$ 128.9M', comp: '+17.8%', isPos: true, nMinus1: '$ 109.5M' }
    ],
    trendBase: 1500
  }
];

const PerformanceOverview: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-8 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col gap-1">
        <h2 className="text-lg font-black text-slate-800">Performance Overview</h2>
        <p className="text-[10px] text-slate-400 leading-tight">
          * Platform Revenue is recorded on the execution platform. eStore Revenue is sourced from eStore BI.<br/>
          * Background highlights removed for clean viewing.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1600px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="w-32 bg-slate-50 border-r border-slate-200"></th>
                {STAGES.map(stage => (
                  <th key={stage.name} colSpan={3} className="py-2 text-sm font-black text-slate-800 border-r border-slate-200">
                    {stage.name}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-slate-200">
                <th className="bg-white border-r border-slate-200"></th>
                {STAGES.map(stage => (
                  <React.Fragment key={`${stage.name}-metrics`}>
                    {stage.metrics.map((m, idx) => {
                      return (
                        <th 
                          key={m} 
                          className={`py-3 text-[11px] font-bold text-slate-500 uppercase tracking-tight 
                            ${idx === 2 ? 'border-r border-slate-200' : ''}
                          `}
                        >
                          {m}
                        </th>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* N Row */}
              <tr className="border-b border-slate-200">
                <td className="p-4 bg-white border-r border-slate-200 text-center font-black text-slate-700 text-sm">
                  N
                </td>
                {STAGES.map(stage => (
                  <React.Fragment key={`${stage.name}-n-data`}>
                    {stage.data.map((d, idx) => {
                      return (
                        <td 
                          key={idx} 
                          className={`p-4 text-center ${idx === 2 ? 'border-r border-slate-200' : ''}`}
                        >
                          <div className="text-base font-black text-slate-800">{d.n}</div>
                          <div className={`text-[10px] font-bold ${d.isPos ? 'text-blue-500' : 'text-red-500'}`}>
                            N-1 {d.comp}
                          </div>
                        </td>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tr>
              {/* N-1 Row */}
              <tr className="border-b border-slate-200">
                <td className="p-4 bg-white border-r border-slate-200 text-center font-black text-slate-700 text-sm">
                  N-1
                </td>
                {STAGES.map(stage => (
                  <React.Fragment key={`${stage.name}-n1-data`}>
                    {stage.data.map((d, idx) => {
                      return (
                        <td 
                          key={idx} 
                          className={`p-4 text-center ${idx === 2 ? 'border-r border-slate-200' : ''}`}
                        >
                          <div className="text-base font-black text-slate-700">{d.nMinus1}</div>
                        </td>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tr>
              {/* Trend Row */}
              <tr>
                <td className="p-4 bg-white border-r border-slate-200 text-center font-bold text-slate-600 text-xs">
                  Spend Trend
                </td>
                {STAGES.map(stage => (
                  <td key={`${stage.name}-trend`} colSpan={3} className="p-4 border-r border-slate-200 h-32">
                    <div className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={generateTrendData(stage.trendBase)}>
                          <XAxis 
                            dataKey="day" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: '#94a3b8' }}
                            interval={4}
                            dy={5}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: '#94a3b8' }}
                            tickFormatter={(v) => `$ ${v}`}
                          />
                          <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                          <Line type="monotone" dataKey="comparison" stroke="#cbd5e1" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div className="flex justify-center gap-8 py-3 bg-white border-t border-slate-200 text-[11px] font-black text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-blue-500"></div> N
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-slate-300"></div> N-1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOverview;
