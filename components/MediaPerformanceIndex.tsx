
import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

// --- Types ---

interface PerformanceData {
  region: string;
  subsidiary: string;
  total: number;
  teaser: number;
  preOrder: number;
  launch: number;
  trend: { name: string; value: number }[];
}

interface RegionGroup {
  name: string;
  subsidiaries: string[];
}

// --- Constants & Data ---

const HIERARCHY: RegionGroup[] = [
  {
    name: 'NA',
    subsidiaries: ['SEA', 'SECA']
  },
  {
    name: 'EUROPE',
    subsidiaries: ['SEUK', 'SEG', 'SEF', 'SEIB', 'SEI', 'SEBN', 'SEPOL', 'SENA', 'SEAS', 'SEROM', 'SEAD']
  },
  {
    name: 'LATIN AMERICA',
    subsidiaries: ['SELA', 'SEDA', 'SECH', 'SEPE', 'SECOL']
  },
  {
    name: 'CIS',
    subsidiaries: ['SERC', 'SEUC', 'SEK']
  },
  {
    name: 'MEA',
    subsidiaries: ['SEMENA', 'SEIL', 'SEEG', 'SEPAK', 'SGE', 'SSA']
  },
  {
    name: 'SOUTHWEST ASIA',
    subsidiaries: ['SIEL']
  },
  {
    name: 'SOUTHEAST ASIA',
    subsidiaries: ['SEV', 'SETH', 'SEIN', 'SEM', 'SEP', 'SAVINA']
  },
  {
    name: 'OCEANIA',
    subsidiaries: ['SAU', 'SENZ']
  }
];

const generateScore = () => Math.floor(Math.random() * (300 - 10 + 1)) + 10;

const generateRowData = (region: string, subsidiary: string): PerformanceData => {
  const teaser = generateScore();
  const preOrder = generateScore();
  const launch = generateScore();
  // Total as simple average
  const total = Math.round((teaser + preOrder + launch) / 3);

  return {
    region,
    subsidiary,
    total,
    teaser,
    preOrder,
    launch,
    trend: [
      { name: 'Teaser', value: teaser },
      { name: 'PreOrder', value: preOrder },
      { name: 'Launch', value: launch },
    ]
  };
};

const buildTableData = (): PerformanceData[] => {
  return HIERARCHY.flatMap(group => 
    group.subsidiaries.map(sub => generateRowData(group.name, sub))
  );
};

const DATA = buildTableData();

// --- Components ---

const TrendSparkline = ({ data }: { data: { name: string; value: number }[] }) => {
  const isUp = data[data.length - 1].value >= data[0].value;
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={isUp ? '#22c55e' : '#ef4444'} 
            strokeWidth={2} 
            dot={{ r: 2, fill: isUp ? '#22c55e' : '#ef4444' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ScoreCell = ({ value }: { value: number }) => {
  // Removed color coding logic as requested
  return (
    <span className="font-bold text-slate-800">{value}</span>
  );
};

const MediaPerformanceIndex: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm mb-8 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">MPI Scorecard by Subsidiary</h3>
        {/* Legend removed as color coding is removed */}
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[800px] max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="py-3 px-4 text-left text-[11px] font-black text-slate-600 uppercase tracking-wider border-r border-slate-200">Region</th>
                <th className="py-3 px-4 text-left text-[11px] font-black text-slate-600 uppercase tracking-wider border-r border-slate-200">Subsidiary</th>
                <th className="py-3 px-4 text-center text-[11px] font-black text-slate-800 uppercase tracking-wider border-r border-slate-200 bg-slate-200/50">Total</th>
                <th className="py-3 px-4 text-center text-[11px] font-black text-slate-600 uppercase tracking-wider border-r border-slate-200">Teaser</th>
                <th className="py-3 px-4 text-center text-[11px] font-black text-slate-600 uppercase tracking-wider border-r border-slate-200">Pre-Order</th>
                <th className="py-3 px-4 text-center text-[11px] font-black text-slate-600 uppercase tracking-wider border-r border-slate-200">Launch</th>
                <th className="py-3 px-4 text-center text-[11px] font-black text-slate-600 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody>
              {DATA.map((row, index) => {
                // Calculate RowSpan
                const isRegionFirst = index === 0 || row.region !== DATA[index - 1].region;
                let rowSpan = 1;
                if (isRegionFirst) {
                  rowSpan = DATA.filter(r => r.region === row.region).length;
                }

                return (
                  <tr key={`${row.region}-${row.subsidiary}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    {isRegionFirst && (
                      <td 
                        rowSpan={rowSpan} 
                        className="py-3 px-4 text-[11px] font-black text-slate-700 uppercase align-middle border-r border-slate-200 bg-white"
                      >
                        {row.region}
                      </td>
                    )}
                    <td className="py-3 px-4 text-[11px] font-bold text-slate-600 border-r border-slate-200">
                      {row.subsidiary}
                    </td>
                    <td className="py-3 px-4 text-center border-r border-slate-200 bg-slate-50/50">
                      <ScoreCell value={row.total} />
                    </td>
                    <td className="py-3 px-4 text-center border-r border-slate-200">
                      <ScoreCell value={row.teaser} />
                    </td>
                    <td className="py-3 px-4 text-center border-r border-slate-200">
                      <ScoreCell value={row.preOrder} />
                    </td>
                    <td className="py-3 px-4 text-center border-r border-slate-200">
                      <ScoreCell value={row.launch} />
                    </td>
                    <td className="py-3 px-4 flex justify-center items-center">
                      <TrendSparkline data={row.trend} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MediaPerformanceIndex;
    