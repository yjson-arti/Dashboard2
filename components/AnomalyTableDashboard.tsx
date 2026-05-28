import React, { useState, useMemo, useEffect } from 'react';
import { Target, Image as ImageIcon, LayoutTemplate, AlertTriangle, ShieldAlert, CheckCircle2, TrendingUp, TrendingDown, Filter, FileText, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

type CellData = { value: string, diff: number };

interface OverviewRowData {
  label: string;
  total: { spend: CellData, impressions: CellData, clicks: CellData };
  awareness: { spend: CellData, impressions: CellData, views50: CellData };
  consideration: { spend: CellData, clicks: CellData, views75: CellData };
  conversion: { spend: CellData, revenue: CellData };
}

const MOCK_OVERVIEW_DATA: OverviewRowData[] = [
  {
    label: 'Total',
    total: { spend: { value: '$ 523.0M', diff: 21.1 }, impressions: { value: '47.6B', diff: 31.5 }, clicks: { value: '308.7M', diff: -0.2 } },
    awareness: { spend: { value: '$ 217.2M', diff: 119.5 }, impressions: { value: '20.8B', diff: 84.3 }, views50: { value: '6.6B', diff: 148.1 } },
    consideration: { spend: { value: '$ 104.0M', diff: -18.1 }, clicks: { value: '33.8M', diff: -22.0 }, views75: { value: '1.8B', diff: -15.0 } },
    conversion: { spend: { value: '$ 201.8M', diff: -2.0 }, revenue: { value: '$ 262.4M', diff: -10.7 } }
  },
  {
    label: 'Video',
    total: { spend: { value: '$ 320.5M', diff: 25.4 }, impressions: { value: '28.1B', diff: 35.2 }, clicks: { value: '150.2M', diff: -1.5 } },
    awareness: { spend: { value: '$ 140.5M', diff: 125.4 }, impressions: { value: '15.2B', diff: 92.1 }, views50: { value: '6.6B', diff: 148.1 } },
    consideration: { spend: { value: '$ 80.0M', diff: -12.5 }, clicks: { value: '25.0M', diff: -18.2 }, views75: { value: '1.8B', diff: -15.0 } },
    conversion: { spend: { value: '$ 100.0M', diff: -5.4 }, revenue: { value: '$ 120.0M', diff: -12.5 } }
  },
  {
    label: 'Non-Video',
    total: { spend: { value: '$ 202.5M', diff: 15.2 }, impressions: { value: '19.5B', diff: 25.8 }, clicks: { value: '158.5M', diff: 1.2 } },
    awareness: { spend: { value: '$ 76.7M', diff: 108.5 }, impressions: { value: '5.6B', diff: 65.4 }, views50: { value: '-', diff: 0 } },
    consideration: { spend: { value: '$ 24.0M', diff: -32.5 }, clicks: { value: '8.8M', diff: -31.4 }, views75: { value: '-', diff: 0 } },
    conversion: { spend: { value: '$ 101.8M', diff: 1.5 }, revenue: { value: '$ 142.4M', diff: -9.2 } }
  }
];

const MetricCell = ({ data }: { data: CellData }) => {
  if (data.value === '-') return <td className="border border-slate-200 py-4 px-2 text-center align-middle" />;
  
  return (
    <td className="border border-slate-200 py-4 px-2 text-center align-middle">
      <div className="font-black text-slate-900 text-sm md:text-base whitespace-nowrap">{data.value}</div>
      <div className={`text-[10px] font-bold mt-1 tracking-tight whitespace-nowrap ${data.diff > 0 ? 'text-blue-500' : data.diff < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
        4W Mean {data.diff > 0 ? '+' : ''}{data.diff}%
      </div>
    </td>
  );
};

const AnomalyOverviewTable: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans mb-8">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
         <h2 className="text-xl font-black text-slate-800 tracking-tight">Performance Summary vs 4W Mean</h2>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[1200px]">
          <table className="w-full border-collapse">
            <thead className="bg-[#fcfcfc]">
              {/* Top Header Grouping */}
              <tr>
                <th className="border-b border-r border-slate-200 bg-white"></th>
                <th colSpan={3} className="border-b border-r border-slate-200 py-3 text-center text-sm font-black text-slate-800 uppercase tracking-widest bg-white">Total</th>
                <th colSpan={3} className="border-b border-r border-slate-200 py-3 text-center text-sm font-black text-slate-800 uppercase tracking-widest bg-indigo-50/50">Awareness</th>
                <th colSpan={3} className="border-b border-r border-slate-200 py-3 text-center text-sm font-black text-slate-800 uppercase tracking-widest bg-blue-50/50">Consideration</th>
                <th colSpan={2} className="border-b border-slate-200 py-3 text-center text-sm font-black text-slate-800 uppercase tracking-widest bg-emerald-50/50">Conversion</th>
              </tr>
              {/* Secondary Header */}
              <tr className="text-[11px] text-slate-500 font-bold">
                <th className="border-b border-r border-slate-200 bg-white"></th>
                
                {/* Total */}
                <th className="border-b border-r border-slate-200 py-2.5 px-2 bg-white text-center">Spend</th>
                <th className="border-b border-r border-slate-200 py-2.5 px-2 bg-white text-center">Impressions</th>
                <th className="border-b border-r border-slate-200 py-2.5 px-2 bg-white text-center">Clicks</th>
                
                {/* Awareness */}
                <th className="border-b border-r border-slate-200 py-2.5 px-2 bg-indigo-50/50 text-center">Spend</th>
                <th className="border-b border-r border-slate-200 py-2.5 px-2 bg-indigo-50/50 text-center">Impressions</th>
                <th className="border-b border-r border-slate-200 py-2.5 px-2 bg-indigo-50/50 text-center">50% Views</th>
                
                {/* Consideration */}
                <th className="border-b border-r border-slate-200 py-2.5 px-2 bg-blue-50/50 text-center">Spend</th>
                <th className="border-b border-r border-slate-200 py-2.5 px-2 bg-blue-50/50 text-center">Clicks</th>
                <th className="border-b border-r border-slate-200 py-2.5 px-2 bg-blue-50/50 text-center">75% Views</th>
                
                {/* Conversion */}
                <th className="border-b border-r border-slate-200 py-2.5 px-2 bg-emerald-50/50 text-center">Spend</th>
                <th className="border-b border-slate-200 py-2.5 px-2 bg-emerald-50/50 text-center">eStore Revenue</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_OVERVIEW_DATA.map((row, idx) => (
                <tr key={idx} className={`${idx === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                  <td className="border border-slate-200 py-4 px-4 text-center font-black text-slate-800 text-sm">{row.label}</td>
                  
                  {/* Total */}
                  <MetricCell data={row.total.spend} />
                  <MetricCell data={row.total.impressions} />
                  <MetricCell data={row.total.clicks} />
                  
                  {/* Awareness */}
                  <MetricCell data={row.awareness.spend} />
                  <MetricCell data={row.awareness.impressions} />
                  <MetricCell data={row.awareness.views50} />
                  
                  {/* Consideration */}
                  <MetricCell data={row.consideration.spend} />
                  <MetricCell data={row.consideration.clicks} />
                  <MetricCell data={row.consideration.views75} />
                  
                  {/* Conversion */}
                  <MetricCell data={row.conversion.spend} />
                  <MetricCell data={row.conversion.revenue} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StrictKpiCell = ({ name, type, val, diff, alarming = false, rowSpan = 1 }: { name: string, type: 'effect'|'efficiency', val: string, diff: number, alarming?: boolean, rowSpan?: number }) => {
  let isPositiveImpact = false;
  if (name === 'ROAS') {
    isPositiveImpact = diff > 0;
  } else if (type === 'effect') {
    isPositiveImpact = diff > 0;
  } else {
    isPositiveImpact = diff <= 0;
  }

  // Exact Google blue/red matching the screenshot
  const diffColor = isPositiveImpact ? 'text-[#4285F4]' : 'text-[#EA4335]';
  const bgClass = alarming ? 'bg-rose-50/50' : 'bg-white';

  return (
    <td className={`border border-slate-200 py-4 px-2 text-center align-middle ${bgClass}`} rowSpan={rowSpan}>
      <div className="text-[10px] text-slate-500 font-bold mb-0.5 uppercase tracking-wider">{name}</div>
      <div className="font-black text-slate-900 text-sm md:text-base whitespace-nowrap leading-tight">{val}</div>
      <div className={`text-[10px] font-bold mt-1 tracking-tight whitespace-nowrap ${diffColor}`}>
        4W Mean {diff > 0 ? '+' : ''}{diff}%
      </div>
    </td>
  );
};

const PhaseDetailedKPIs: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans mb-8">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
         <h2 className="text-xl font-black text-slate-800 tracking-tight">
            CEJ Phase Core KPIs vs 4W Mean
         </h2>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[1200px]">
          <table className="w-full border-collapse">
            <thead>
              {/* Top Header Grouping */}
              <tr>
                <th className="border-b border-r border-slate-200 bg-white w-24"></th>
                <th colSpan={2} className="border-b border-r border-slate-200 py-3 text-center text-sm font-black text-slate-800 uppercase tracking-widest bg-indigo-50/30">Awareness</th>
                <th colSpan={2} className="border-b border-r border-slate-200 py-3 text-center text-sm font-black text-slate-800 uppercase tracking-widest bg-blue-50/30">Consideration</th>
                <th colSpan={4} className="border-b border-slate-200 py-3 text-center text-sm font-black text-slate-800 uppercase tracking-widest bg-emerald-50/30">Conversion</th>
              </tr>
              {/* Secondary Header */}
              <tr className="text-[11px] text-slate-500 font-bold bg-[#fcfcfc]">
                <th className="border-b border-r border-slate-200 py-2.5 px-2 text-center w-24">KPIs</th>
                
                {/* Awareness */}
                <th className="border-b border-r border-slate-200 py-2.5 px-2 text-center w-36">Effective</th>
                <th className="border-b border-r border-slate-200 py-2.5 px-2 text-center w-36">Efficiency</th>
                
                {/* Consideration */}
                <th className="border-b border-r border-slate-200 py-2.5 px-2 text-center w-36">Effective</th>
                <th className="border-b border-r border-slate-200 py-2.5 px-2 text-center w-36">Efficiency</th>
                
                {/* Conversion */}
                <th className="border-b border-r border-slate-200 py-2.5 px-2 text-center w-32" colSpan={2}>Effective</th>
                <th className="border-b border-slate-200 py-2.5 px-2 text-center w-32" colSpan={2}>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Video */}
              <tr>
                <th className="border border-slate-200 py-4 px-2 text-center font-black text-slate-800 text-xs bg-slate-50">Video</th>
                
                {/* Awareness Video */}
                <StrictKpiCell name="VTR 50" type="effect" val="45.2%" diff={1.2} />
                <StrictKpiCell name="CPV 50" type="efficiency" val="$0.12" diff={-5.4} />

                {/* Consideration Video */}
                <StrictKpiCell name="VTR 75" type="effect" val="31.5%" diff={-4.2} alarming />
                <StrictKpiCell name="CPV 75" type="efficiency" val="$0.28" diff={8.5} alarming />

                {/* Conversion - Spans both rows */}
                <StrictKpiCell name="CVR" type="effect" val="3.2%" diff={-12.5} alarming rowSpan={2} />
                <StrictKpiCell name="CTR" type="effect" val="2.4%" diff={1.1} rowSpan={2} />
                <StrictKpiCell name="CPC" type="efficiency" val="$1.85" diff={8.4} alarming rowSpan={2} />
                <StrictKpiCell name="ROAS" type="efficiency" val="3.8x" diff={-2.4} alarming rowSpan={2} />
              </tr>

              {/* Row 2: Non-Video */}
              <tr>
                <th className="border border-slate-200 py-4 px-2 text-center font-black text-slate-800 text-xs bg-slate-50">Non-Video</th>
                
                {/* Awareness Non-Video */}
                <StrictKpiCell name="CTR" type="effect" val="1.8%" diff={0.5} />
                <StrictKpiCell name="CPM" type="efficiency" val="$12.50" diff={15.2} alarming />

                {/* Consideration Non-Video */}
                <StrictKpiCell name="CTR" type="effect" val="1.5%" diff={0.2} />
                <StrictKpiCell name="CPC" type="efficiency" val="$1.45" diff={-2.1} />
                
                {/* Conversion cells omitted because rowSpan=2 from above row covers them */}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface AnomalyRow {
  id: string;
  subsidiary: string;
  country: string;
  campaign: string;
  cej: string;
  format: string;
  kpi: string;
  kpiType: 'effect' | 'efficiency';
  fourWeekMean: number;
  currentValue: number;
  diffPercent: number;
  status: 'Normal' | 'Spike' | 'Drop';
  isAlarming: boolean;
  action: string;
  actionCategory: 'Media' | 'Targeting' | 'Creative' | 'None';
}

const generateMockAnomalyData = (): AnomalyRow[] => {
  const campaigns = ['Manifesto Launch', 'Ultra Camera', 'Sports Experience', 'Black Friday', 'Holiday'];
  const cejs = ['Awareness', 'Consideration', 'Conversion'];
  const formats = ['Video', 'Non-Video'];
  
  const kpiMap: Record<string, { type: 'effect' | 'efficiency', base: number }> = {
    'VTR 50': { type: 'effect', base: 45 },
    'CPV 50': { type: 'efficiency', base: 0.15 },
    'VTR 75': { type: 'effect', base: 30 },
    'CPV 75': { type: 'efficiency', base: 0.25 },
    'CTR': { type: 'effect', base: 1.2 },
    'CPM': { type: 'efficiency', base: 15 },
    'CPC': { type: 'efficiency', base: 1.5 },
    'CVR': { type: 'effect', base: 8 },
    'ROAS': { type: 'effect', base: 3.5 }
  };

  const getKPIs = (cej: string, format: string) => {
    if (cej === 'Awareness') return format === 'Video' ? ['VTR 50', 'CPV 50'] : ['CTR', 'CPM'];
    if (cej === 'Consideration') return format === 'Video' ? ['VTR 75', 'CPV 75'] : ['CTR', 'CPC'];
    return format === 'Video' ? ['CVR', 'CTR', 'CPC', 'ROAS'] : ['CVR', 'CTR', 'CPC', 'ROAS'];
  };

  const actions = {
    Media: '매체·지면별 성과 편차 식별 및 예산 재배분 점검',
    Targeting: '오디언스 효율 진단 및 타겟 세그먼트 최적화',
    Creative: '소재별 성과 하락 징후 포착 및 고효율 소재 교체',
    None: '지속 모니터링'
  };

  const rows: AnomalyRow[] = [];
  let idCounter = 1;

  campaigns.forEach(campaign => {
    cejs.forEach(cej => {
      formats.forEach(format => {
        const kpis = getKPIs(cej, format);
        kpis.forEach(kpiName => {
          const kpiInfo = kpiMap[kpiName];
          const mean = kpiInfo.base * (0.8 + Math.random() * 0.4);
          
          // Randomly assign anomalies. Most normal, some spike, some drop.
          const rand = Math.random();
          let status: 'Normal' | 'Spike' | 'Drop' = 'Normal';
          let current = mean * (0.9 + Math.random() * 0.2); // normal fluctuation +-10%
          
          if (rand > 0.85) {
            status = 'Spike';
            current = mean * (2 + Math.random() * 3); // 200% - 500% spike
          } else if (rand > 0.7) {
            status = 'Drop';
            current = mean * (0.1 + Math.random() * 0.3); // 10% - 40% drop
          }

          const diffPercent = ((current - mean) / mean) * 100;
          
          let isAlarming = false;
          if (kpiInfo.type === 'efficiency' && status === 'Spike') isAlarming = true; // Cost spike is bad
          if (kpiInfo.type === 'effect' && status === 'Drop') isAlarming = true; // Effect drop is bad

          let actionCategory: 'Media' | 'Targeting' | 'Creative' | 'None' = 'None';
          if (isAlarming) {
            const r = Math.random();
            if (r > 0.66) actionCategory = 'Media';
            else if (r > 0.33) actionCategory = 'Targeting';
            else actionCategory = 'Creative';
          }

          rows.push({
            id: `ANO-${idCounter++}`,
            subsidiary: 'SEA',
            country: 'US',
            campaign,
            cej,
            format,
            kpi: kpiName,
            kpiType: kpiInfo.type,
            fourWeekMean: mean,
            currentValue: current,
            diffPercent,
            status,
            isAlarming,
            action: isAlarming ? actions[actionCategory] : actions.None,
            actionCategory
          });
        });
      });
    });
  });

  return rows;
};

const AnomalyTrendChart: React.FC = () => {
  const [objective, setObjective] = useState<string>('Awareness');
  const [format, setFormat] = useState<string>('Video');
  const [kpi, setKpi] = useState<string>('VTR 50');

  const kpiMap: Record<string, Record<string, { name: string, mean: number, type: 'effect'|'efficiency'|'roas' }[]>> = {
    Awareness: {
      'Video': [
        { name: 'VTR 50', mean: 45.2, type: 'effect' },
        { name: 'CPV 50', mean: 0.12, type: 'efficiency' }
      ],
      'Non-Video': [
        { name: 'CTR', mean: 1.8, type: 'effect' },
        { name: 'CPM', mean: 12.5, type: 'efficiency' }
      ]
    },
    Consideration: {
      'Video': [
        { name: 'VTR 75', mean: 31.5, type: 'effect' },
        { name: 'CPV 75', mean: 0.28, type: 'efficiency' }
      ],
      'Non-Video': [
        { name: 'CTR', mean: 1.5, type: 'effect' },
        { name: 'CPC', mean: 1.45, type: 'efficiency' }
      ]
    },
    Conversion: {
      'Video': [
        { name: 'CVR', mean: 3.2, type: 'effect' },
        { name: 'CTR', mean: 2.4, type: 'effect' },
        { name: 'CPC', mean: 1.85, type: 'efficiency' },
        { name: 'ROAS', mean: 3.8, type: 'roas' }
      ],
      'Non-Video': [
        { name: 'CVR', mean: 3.2, type: 'effect' },
        { name: 'CTR', mean: 2.4, type: 'effect' },
        { name: 'CPC', mean: 1.85, type: 'efficiency' },
        { name: 'ROAS', mean: 3.8, type: 'roas' }
      ]
    }
  };

  useEffect(() => {
    // Reset KPI selection when objective or format changes
    setKpi(kpiMap[objective][format][0].name);
  }, [objective, format]);

  const currentDetails = useMemo(() => {
    return kpiMap[objective][format].find(k => k.name === kpi) || kpiMap[objective][format][0];
  }, [objective, format, kpi]);

  const chartData = useMemo(() => {
    const data = [];
    const base = currentDetails.mean;
    const variance = base * 0.15; // 15% noise
    
    // Generate 28 days of data (4 weeks) ending on Apr 19
    for (let i = 0; i < 28; i++) {
      let val = base + (Math.random() * variance * 2 - variance);
      
      // Introduce an anomaly on week 3 (approx days 19-20)
      if (i === 19 || i === 20) {
        val = currentDetails.type === 'effect' || currentDetails.type === 'roas' ? base * 1.5 : base * 1.6;
      }
      
      const d = new Date(2026, 3, 19); // April 19, 2026
      d.setDate(d.getDate() - (27 - i));
      const m = d.getMonth() + 1;
      const day = d.getDate();
      
      data.push({
        day: `${m}/${day}`,
        value: Number(val.toFixed(2))
      });
    }
    return data;
  }, [currentDetails]);

  const formatYAxis = (val: number) => {
    if (currentDetails.type === 'roas') return `${val}x`;
    if (currentDetails.type === 'effect') return `${val}%`;
    return `$${val}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded-md text-xs">
          <p className="font-bold text-slate-700 mb-1">{label}</p>
          <p className="text-indigo-600 font-black">
            {kpi}: {formatYAxis(payload[0].value)}
          </p>
          <p className="text-slate-500 font-medium mt-1">
            4W Mean: {formatYAxis(currentDetails.mean)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans mb-8">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
         <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="text-indigo-600 w-5 h-5 hidden sm:block" />
            4W Trend Analysis
         </h2>
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              className="bg-white border border-slate-300 text-sm font-bold text-slate-700 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-36"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            >
              <option value="Awareness">Awareness</option>
              <option value="Consideration">Consideration</option>
              <option value="Conversion">Conversion</option>
            </select>
            
            <select 
              className="bg-white border border-slate-300 text-sm font-bold text-slate-700 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-32"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="Video">Video</option>
              <option value="Non-Video">Non-Video</option>
            </select>

            <select 
              className="bg-white border border-slate-300 text-sm font-bold text-slate-700 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-32"
              value={kpi}
              onChange={(e) => setKpi(e.target.value)}
            >
              {kpiMap[objective][format].map(item => (
                <option key={item.name} value={item.name}>{item.name}</option>
              ))}
            </select>
         </div>
      </div>
      
      <div className="p-6 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#64748b' }} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={formatYAxis} 
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={currentDetails.mean} 
              stroke="#94a3b8" 
              strokeDasharray="4 4" 
              label={{ position: 'insideTopLeft', value: `4W Mean: ${formatYAxis(currentDetails.mean)}`, fill: '#64748b', fontSize: 10, offset: 10 }} 
            />
            <Line 
              type="linear" 
              dataKey="value" 
              stroke="#4f46e5" 
              strokeWidth={2.5} 
              dot={{ r: 3, fill: '#4f46e5', strokeWidth: 0 }} 
              activeDot={{ r: 6, fill: '#312e81', stroke: '#fff', strokeWidth: 2 }} 
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AnomalyTableDashboard: React.FC = () => {
  const allData = useMemo(() => generateMockAnomalyData(), []);
  const [filterMode, setFilterMode] = useState<'All' | 'Alarming'>('Alarming');
  const [activeCEJFilter, setActiveCEJFilter] = useState<string>('All');

  const filteredData = useMemo(() => {
    return allData.filter(row => {
      let match = true;
      if (filterMode === 'Alarming' && !row.isAlarming) match = false;
      if (activeCEJFilter !== 'All' && row.cej !== activeCEJFilter) match = false;
      return match;
    }).sort((a, b) => b.diffPercent - a.diffPercent); // sort by extreme differences
  }, [allData, filterMode, activeCEJFilter]);

  const formatValue = (val: number, isEffect: boolean) => {
    return isEffect ? `${val.toFixed(2)}%` : `$${val.toFixed(2)}`;
  };

  return (
    <div className="font-sans">
      <AnomalyOverviewTable />
      
      <PhaseDetailedKPIs />
      
      <AnomalyTrendChart />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Anomaly Detection Log
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            탐지 단위별 이상치(Outlier) 현황 및 대응 가이드 리스트
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-md p-1 shadow-sm">
             <button
                onClick={() => setActiveCEJFilter('All')}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${activeCEJFilter === 'All' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
             >
               All Phases
             </button>
             <button
                onClick={() => setActiveCEJFilter('Awareness')}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${activeCEJFilter === 'Awareness' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
             >
               Awareness
             </button>
             <button
                onClick={() => setActiveCEJFilter('Consideration')}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${activeCEJFilter === 'Consideration' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
             >
               Consideration
             </button>
             <button
                onClick={() => setActiveCEJFilter('Conversion')}
                className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${activeCEJFilter === 'Conversion' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
             >
               Conversion
             </button>
          </div>
          <div className="flex bg-white border border-slate-200 rounded-md p-1 shadow-sm">
            <button
               onClick={() => setFilterMode('All')}
               className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors ${filterMode === 'All' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              전체 로그 보기
            </button>
            <button
               onClick={() => setFilterMode('Alarming')}
               className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors flex items-center gap-1 ${filterMode === 'Alarming' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <AlertTriangle size={12} /> 대응 필요 (Alarm)
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border-t border-slate-200">
        <div className="min-w-[1200px] p-0">
          <table className="w-full border-collapse text-left text-[11px]">
            <thead className="bg-slate-100 border-b-2 border-slate-200 text-slate-500 uppercase tracking-widest font-black sticky top-0">
              <tr>
                <th className="p-3 w-16 text-center border-r border-slate-200">ID</th>
                <th className="p-3 w-40 border-r border-slate-200">Campaign</th>
                <th className="p-3 w-48 border-r border-slate-200">Detection Unit<br/><span className="text-[9px] font-normal tracking-normal text-slate-400 capitalize">CEJ x Format x KPI</span></th>
                <th className="p-3 w-28 text-right border-r border-slate-200">4W Mean</th>
                <th className="p-3 w-28 text-right border-r border-slate-200">Current</th>
                <th className="p-3 w-24 text-center border-r border-slate-200">Diff</th>
                <th className="p-3 w-32 border-r border-slate-200 text-center">Status</th>
                <th className="p-3">Automated Response</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => {
                const getStatusBadge = () => {
                   if (row.status === 'Normal') return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold"><CheckCircle2 size={12}/> Normal</span>;
                   if (row.status === 'Spike') return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-100 text-rose-700 font-bold"><TrendingUp size={12}/> Spike</span>;
                   return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 font-bold"><TrendingDown size={12}/> Drop</span>;
                };

                const getActionIcon = (cat: string) => {
                  switch(cat) {
                    case 'Media': return <LayoutTemplate size={14} className="text-indigo-500" />;
                    case 'Targeting': return <Target size={14} className="text-emerald-500" />;
                    case 'Creative': return <ImageIcon size={14} className="text-amber-500" />;
                    default: return null;
                  }
                };

                return (
                  <tr key={row.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${row.isAlarming ? 'bg-rose-50/20' : 'bg-white'}`}>
                    <td className="p-3 text-center text-slate-400 font-mono text-[10px] border-r border-slate-100">{row.id}</td>
                    <td className="p-3 border-r border-slate-100">
                      <div className="font-bold text-slate-800">{row.campaign}</div>
                      <div className="text-[10px] text-slate-500">{row.subsidiary} / {row.country}</div>
                    </td>
                    <td className="p-3 border-r border-slate-100">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold text-[10px]">{row.cej}</span>
                        <span className="text-slate-300">x</span>
                        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold text-[10px]">{row.format}</span>
                        <span className="text-slate-300">x</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${row.kpiType === 'effect' ? 'bg-[#a8d582]/20 text-[#6a8c4c]' : 'bg-[#7cb5ec]/20 text-[#4a76a5]'}`}>
                          {row.kpi}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-slate-500 border-r border-slate-100">
                       {formatValue(row.fourWeekMean, row.kpiType === 'effect')}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-slate-800 border-r border-slate-100">
                       {formatValue(row.currentValue, row.kpiType === 'effect')}
                    </td>
                    <td className="p-3 text-center font-mono border-r border-slate-100">
                      <span className={`font-bold ${row.diffPercent > 0 ? 'text-rose-600' : row.diffPercent < 0 ? 'text-blue-600' : 'text-slate-500'}`}>
                        {row.diffPercent > 0 ? '+' : ''}{row.diffPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-center border-r border-slate-100">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusBadge()}
                        {row.isAlarming && <span className="text-[9px] text-rose-600 font-black tracking-tighter uppercase whitespace-nowrap">★ Action Req.</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      {row.isAlarming ? (
                        <div className="flex items-start gap-2 bg-white border border-slate-200 p-2 rounded-md shadow-sm">
                          <div className="mt-0.5 bg-slate-50 p-1 rounded border border-slate-100">
                             {getActionIcon(row.actionCategory)}
                          </div>
                          <div>
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-0.5">{row.actionCategory}</div>
                            <div className="font-bold text-slate-800 leading-tight">{row.action}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-400 font-medium italic flex items-center gap-1.5 pl-2">
                           {row.action}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-500 font-medium bg-slate-50">
                    No anomalies found for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AnomalyTableDashboard;
