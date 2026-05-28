
import React from 'react';

// Platform Colors matching the image and adding Naver
const PLATFORM_COLORS = {
  'Google Ads': '#fcf4a3', // Yellow
  'Meta': '#5d87c1',       // Blue
  'Pinterest': '#dfa67a',  // Orange/Tan
  'Tiktok': '#534c76',     // Deep Purple
  'Naver': '#2db400',      // Green (Naver Brand Color)
};

const PLATFORMS = ['Google Ads', 'Meta', 'Pinterest', 'Tiktok', 'Naver'] as const;

// Helper to parse "0.6 M" to number 0.6
const parseVal = (s: string) => parseFloat(s.split(' ')[0]);

// Mock data for the 4 funnel stages
// Note: Proportion values must sum to 1.0 (100%)
const funnelData = {
  'Awareness': {
    prev: { total: '0.6 M', values: [0.30, 0.30, 0.15, 0.15, 0.10] }, 
    curr: { total: '1.0 M', values: [0.40, 0.35, 0.08, 0.07, 0.10] },
  },
  'Evoke': {
    prev: { total: '0.4 M', values: [0.20, 0.20, 0.20, 0.20, 0.20] },
    curr: { total: '0.7 M', values: [0.30, 0.25, 0.20, 0.15, 0.10] },
  },
  'Consideration': {
    prev: { total: '0.8 M', values: [0.35, 0.15, 0.15, 0.15, 0.20] },
    curr: { total: '1.2 M', values: [0.50, 0.20, 0.10, 0.10, 0.10] },
  },
  'Conversion': {
    prev: { total: '0.3 M', values: [0.10, 0.20, 0.30, 0.20, 0.20] },
    curr: { total: '0.5 M', values: [0.15, 0.30, 0.25, 0.15, 0.15] },
  }
};

interface FunnelChartProps {
  title: string;
  data: typeof funnelData['Awareness'];
  maxOverallValue: number; // For scaling heights across all charts
}

const FunnelChartBlock: React.FC<FunnelChartProps> = ({ title, data, maxOverallValue }) => {
  const BAR_WIDTH = 60;
  const BAR_GAP = 80;
  const BASE_HEIGHT = 280; // Max possible height

  const prevTotalNum = parseVal(data.prev.total);
  const currTotalNum = parseVal(data.curr.total);

  const prevBarHeight = (prevTotalNum / maxOverallValue) * BASE_HEIGHT;
  const currBarHeight = (currTotalNum / maxOverallValue) * BASE_HEIGHT;

  // Calculate cumulative proportions for segmenting
  const getCumulative = (vals: number[]) => {
    let sum = 0;
    return [0, ...vals.map(v => { sum += v; return sum; })];
  };

  const prevProportions = getCumulative(data.prev.values);
  const currProportions = getCumulative(data.curr.values);

  // We align bars at the bottom. 
  // topOffset = BASE_HEIGHT - barHeight
  const prevTop = BASE_HEIGHT - prevBarHeight;
  const currTop = BASE_HEIGHT - currBarHeight;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center relative">
      <h4 className="text-sm font-black text-slate-700 mb-6 uppercase tracking-widest border-b-2 border-indigo-500 pb-1">{title}</h4>
      
      <div className="relative" style={{ width: BAR_WIDTH * 2 + BAR_GAP, height: BASE_HEIGHT + 100 }}>
        
        {/* Connection Lines (SVG) */}
        <svg className="absolute top-[40px] left-0 pointer-events-none" width={BAR_WIDTH * 2 + BAR_GAP} height={BASE_HEIGHT}>
          {prevProportions.map((pProp, i) => {
            // y is distance from the TOP of the SVG area
            const y1 = prevTop + (pProp * prevBarHeight);
            const y2 = currTop + (currProportions[i] * currBarHeight);
            return (
              <line 
                key={i}
                x1={BAR_WIDTH} 
                y1={y1} 
                x2={BAR_WIDTH + BAR_GAP} 
                y2={y2} 
                stroke="#cbd5e1" 
                strokeWidth="1" 
                strokeDasharray="4 2"
              />
            );
          })}
        </svg>

        {/* Total Value Labels - Positioned relative to the bar top */}
        <div className="absolute left-0 w-[60px] text-center text-xs font-black text-slate-800" style={{ top: prevTop + 20 }}>
          {data.prev.total}
        </div>
        <div className="absolute right-0 w-[60px] text-center text-xs font-black text-slate-800" style={{ top: currTop + 20 }}>
          {data.curr.total}
        </div>

        {/* Left Bar (N-1) */}
        <div className="absolute left-0 w-[60px] border border-slate-200 overflow-hidden flex flex-col" style={{ height: prevBarHeight, top: prevTop + 40 }}>
          {data.prev.values.map((val, i) => (
            <div 
              key={i} 
              style={{ 
                height: `${val * 100}%`, 
                backgroundColor: PLATFORM_COLORS[PLATFORMS[PLATFORMS.length - 1 - i]] 
              }}
              className="w-full flex items-center justify-center border-t border-slate-100/10"
            >
              {val > 0.08 && (
                <span className="text-[9px] font-bold text-black opacity-90">{(val * 100).toFixed(0)}%</span>
              )}
            </div>
          ))}
        </div>

        {/* Right Bar (N) */}
        <div className="absolute right-0 w-[60px] border border-slate-200 overflow-hidden flex flex-col" style={{ height: currBarHeight, top: currTop + 40 }}>
          {data.curr.values.map((val, i) => (
            <div 
              key={i} 
              style={{ 
                height: `${val * 100}%`, 
                backgroundColor: PLATFORM_COLORS[PLATFORMS[PLATFORMS.length - 1 - i]] 
              }}
              className="w-full flex items-center justify-center border-t border-slate-100/10"
            >
              {val > 0.08 && (
                <span className="text-[9px] font-bold text-black opacity-90">{(val * 100).toFixed(0)}%</span>
              )}
            </div>
          ))}
        </div>

        {/* N-1 Label at Bottom */}
        <div className="absolute left-0 w-[60px] text-center text-[11px] font-black text-slate-500 uppercase tracking-tighter" style={{ top: BASE_HEIGHT + 50 }}>
          N-1
        </div>
        
        {/* N Label at Bottom */}
        <div className="absolute right-0 w-[60px] text-center text-[11px] font-black text-slate-500 uppercase tracking-tighter" style={{ top: BASE_HEIGHT + 50 }}>
          N
        </div>
      </div>
    </div>
  );
};

const ProportionCharts: React.FC = () => {
  // Find max value for consistent scaling across all funnel steps
  const allTotals = Object.values(funnelData).flatMap(d => [parseVal(d.prev.total), parseVal(d.curr.total)]);
  const maxOverallValue = Math.max(...allTotals);

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Channel Mix by Funnel Stage</h2>
          <p className="text-xs text-slate-500 font-medium">Platform proportion & total volume comparison</p>
        </div>
        
        {/* Expanded Legend with Naver */}
        <div className="flex flex-wrap gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          {PLATFORMS.map(p => (
            <div key={p} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PLATFORM_COLORS[p] }}></div>
              <span className="text-[11px] font-bold text-slate-600">{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FunnelChartBlock title="Awareness" data={funnelData['Awareness']} maxOverallValue={maxOverallValue} />
        <FunnelChartBlock title="Evoke" data={funnelData['Evoke']} maxOverallValue={maxOverallValue} />
        <FunnelChartBlock title="Consideration" data={funnelData['Consideration']} maxOverallValue={maxOverallValue} />
        <FunnelChartBlock title="Conversion" data={funnelData['Conversion']} maxOverallValue={maxOverallValue} />
      </div>
    </div>
  );
};

export default ProportionCharts;
