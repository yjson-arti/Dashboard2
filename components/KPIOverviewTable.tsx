
import React from 'react';

const SUBSIDIARIES = [
  'SEA', 'SECA', 'SEUK', 'SEG', 'SEF', 
  'SEIB', 'SEI', 'SEBN', 'SEPOL', 'SENA'
];

const METRICS = [
  { label: 'Spend' },
  { label: 'Impression' },
  { label: '50% View' },
  { label: 'Clicks' },
  { label: '75% Views' },
  { label: 'Platform Revenue' },
  { label: 'eStore Revenue' }
];

interface MetricData {
  value: string;
  change: string;
  isPositive: boolean;
}

const generateMetricData = (label: string): MetricData => {
  let value = "";
  const rand = Math.random();
  
  if (label.includes('Revenue') || label.includes('Spend')) {
    if (rand > 0.7) value = `$ ${(rand * 100).toFixed(1)}B`;
    else if (rand > 0.3) value = `$ ${(rand * 500).toFixed(1)}M`;
    else value = `$ ${(rand * 900).toFixed(1)}K`;
  } else {
    if (rand > 0.8) value = `${(rand * 20).toFixed(1)}B`;
    else value = `${(rand * 800).toFixed(1)}M`;
  }

  const changeVal = (Math.random() * 60 - 20).toFixed(1);
  const isPositive = parseFloat(changeVal) > 0;

  return {
    value,
    change: `${isPositive ? '+' : ''}${changeVal}%`,
    isPositive
  };
};

const KPIOverviewTable: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm mb-8 overflow-hidden">
      {/* Title Header */}
      <div className="py-2.5 border-b border-slate-200 bg-white">
        <h2 className="text-center text-sm font-medium text-slate-800">KPIs Overview</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-900">
              <th className="px-4 py-3 text-xs font-medium text-slate-700 border-r border-slate-200 text-center w-32 bg-slate-50">
                Subsidiary
              </th>
              {METRICS.map((metric, idx) => (
                <th 
                  key={idx} 
                  className="px-2 py-3 text-xs font-medium text-slate-700 text-center border-r border-slate-200 last:border-r-0 bg-white"
                >
                  {metric.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SUBSIDIARIES.map((sub, sIdx) => (
              <tr key={sIdx} className="border-b border-slate-400 last:border-b-0 hover:bg-slate-50 transition-colors bg-white">
                <td className="px-4 py-4 text-xs font-bold text-slate-800 border-r border-slate-200">
                  {sub}
                </td>
                {METRICS.map((metric, mIdx) => {
                  const data = generateMetricData(metric.label);
                  return (
                    <td 
                      key={mIdx} 
                      className="px-2 py-3 text-center border-r border-slate-200 last:border-r-0 bg-white"
                    >
                      <div className="text-[13px] font-medium text-slate-900 leading-tight">
                        {data.value}
                      </div>
                      <div className={`text-[11px] font-medium mt-0.5 ${data.isPositive ? 'text-blue-500' : 'text-red-500'}`}>
                        {data.change}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KPIOverviewTable;
