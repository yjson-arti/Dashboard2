import React from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DATA = [
  { 
    name: 'Flagship - S25', 
    values: [2403318, 2447171, 823041, null, null, null, null, null, null, null, null, null] 
  },
  { 
    name: "Null", 
    values: [426975, 1312414, 491548, null, null, null, null, null, null, null, null, null] 
  },
  { 
    name: "Always On", 
    values: [32011, 95359, 46985, null, null, null, null, null, null, null, null, null] 
  },
  { 
    name: "Gaming Experience", 
    values: [1053, 2807, 826, null, null, null, null, null, null, null, null, null] 
  },
  { 
    name: 'Black Friday', 
    values: [0, 0, 0, null, null, null, null, null, null, null, null, null] 
  },
];

const MAX_VALUE = 2500000; // Adjusted for the new data range

const formatValue = (val: number | null) => {
  if (val === null) return '';
  if (val === 0) return '$0';
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
};

const getColor = (value: number | null) => {
  if (value === null) return '#f8fafc'; // slate-50
  if (value === 0) return '#f1f5f9'; // slate-100
  
  // Logarithmic scale for better visualization of widely varying data
  // log(1) = 0, log(85M) ~ 18.25
  const minLog = 0;
  const maxLog = Math.log(MAX_VALUE);
  const valLog = Math.log(value > 0 ? value : 1);
  
  const ratio = Math.max(0, Math.min((valLog - minLog) / (maxLog - minLog), 1));
  
  // Blue scale: Light (95%) to Dark (40%)
  const lightness = 95 - (ratio * 55); 
  return `hsl(217, 91%, ${lightness}%)`;
};

const CampaignHeatmap: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-8 overflow-x-auto">
      <h3 className="text-lg font-black text-slate-800 mb-6">Campaign Performance Heatmap</h3>
      <div className="min-w-[1000px]">
        {/* Header */}
        <div className="flex mb-4">
          <div className="w-48 shrink-0"></div>
          <div className="flex-1 grid grid-cols-12 gap-2">
            {MONTHS.map(m => (
              <div key={m} className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{m}</div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {DATA.map((row, idx) => (
            <div key={row.name} className="flex items-center group">
              {/* Label */}
              <div className="w-48 shrink-0 flex items-center gap-3 pr-4">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 group-hover:scale-110 transition-transform"></div>
                <span className="text-xs font-bold text-slate-600 truncate" title={row.name}>{row.name}</span>
              </div>
              
              {/* Cells */}
              <div className="flex-1 grid grid-cols-12 gap-2">
                {row.values.map((val, vIdx) => (
                  <div 
                    key={vIdx}
                    className="h-9 rounded-md flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105 hover:shadow-sm cursor-default"
                    style={{ 
                      backgroundColor: getColor(val),
                      color: val && val > 300000 ? 'white' : '#334155'
                    }}
                    title={val !== null ? val.toLocaleString() : ''}
                  >
                    {formatValue(val)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-8 flex items-center gap-4 pl-48">
          <span className="text-xs font-bold text-slate-600 uppercase">KPI Scale</span>
          <div className="w-64 h-4 rounded bg-gradient-to-r from-slate-100 to-blue-600 relative border border-slate-100"></div>
          <div className="flex justify-between w-64 text-[10px] text-slate-400 font-medium absolute mt-8 ml-[74px]">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignHeatmap;
