import React, { useMemo } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { CAMPAIGNS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, Area, AreaChart, LabelList } from 'recharts';
import { Target, TrendingUp, AlertCircle, Layers, Lightbulb, ArrowRight, ArrowRightLeft } from 'lucide-react';

const MmmPerformanceDashboard: React.FC = () => {
  const { filters } = useFilters();

  const selectedCampaignName = useMemo(() => {
    if (filters.campaigns.length === 1) return filters.campaigns[0];
    if (filters.campaigns.length === CAMPAIGNS.length) return 'All Campaigns Active';
    return 'Multiple Campaigns Selected';
  }, [filters.campaigns]);

  // Mock data tailored for MMM comparison across channels for the selected campaign
  const mmmData = useMemo(() => {
    const data = [
      { channel: 'SOCIAL', targetSpend: 4.5, actualSpend: 3.8, targetImp: 300, actualImp: 285, targetClicks: 15, actualClicks: 14.2, target50V: 120, actual50V: 135, target75V: 80, actual75V: 70, targetEstore: 5.0, actualEstore: 4.1, targetRev: 500, actualRev: 620 },
      { channel: 'VIDEO', targetSpend: 2.8, actualSpend: 2.95, targetImp: 200, actualImp: 210, targetClicks: 10, actualClicks: 10.5, target50V: 80, actual50V: 85, target75V: 50, actual75V: 48, targetEstore: 3.5, actualEstore: 3.8, targetRev: 350, actualRev: 330 },
      { channel: 'SEARCH', targetSpend: 7.55, actualSpend: 4.61, targetImp: 400, actualImp: 355.2, targetClicks: 25, actualClicks: 17.8, target50V: 158.7, actual50V: 140.8, target75V: 120, actual75V: 92, targetEstore: 6.8, actualEstore: 5.1, targetRev: 640, actualRev: 712 },
      { channel: 'CTV', targetSpend: 3.0, actualSpend: 2.5, targetImp: 150, actualImp: 160, targetClicks: 8, actualClicks: 9.2, target50V: 60, actual50V: 65, target75V: 40, actual75V: 45, targetEstore: 2.0, actualEstore: 2.3, targetRev: 250, actualRev: 290 },
      { channel: 'PMAX', targetSpend: 1.5, actualSpend: 1.3, targetImp: 100, actualImp: 95, targetClicks: 5, actualClicks: 4.8, target50V: 45, actual50V: 42, target75V: 30, actual75V: 28, targetEstore: 1.5, actualEstore: 1.4, targetRev: 180, actualRev: 165 },
      { channel: 'DISPLAY', targetSpend: 1.2, actualSpend: 1.1, targetImp: 200, actualImp: 185, targetClicks: 6, actualClicks: 5.5, target50V: 20, actual50V: 18, target75V: 10, actual75V: 8, targetEstore: 1.0, actualEstore: 0.9, targetRev: 120, actualRev: 105 },
      { channel: 'AUDIO', targetSpend: 0.8, actualSpend: 0.9, targetImp: 50, actualImp: 52, targetClicks: 1, actualClicks: 1.1, target50V: 40, actual50V: 41, target75V: 35, actual75V: 36, targetEstore: 0.5, actualEstore: 0.6, targetRev: 80, actualRev: 95 },
    ];
    return data.sort((a, b) => b.targetSpend - a.targetSpend);
  }, [selectedCampaignName]); // Renders new mock state upon campaign selection if we wanted to dynamically alter it

  // Refactored data for 100% Stacked Bar comparison
  const mixChartData = useMemo(() => {
    const tSum = 21.35; // Total Target
    const aSum = 17.16; // Total Actual
    return [
      {
        category: 'MMM Target Mix',
        SEARCH: (7.55/tSum)*100, PMAX: (1.5/tSum)*100, SOCIAL: (4.5/tSum)*100, DISPLAY: (1.2/tSum)*100, VIDEO: (2.8/tSum)*100, CTV: (3.0/tSum)*100, AUDIO: (0.8/tSum)*100
      },
      {
        category: 'Actual Executed',
        SEARCH: (4.61/aSum)*100, PMAX: (1.3/aSum)*100, SOCIAL: (3.8/aSum)*100, DISPLAY: (1.1/aSum)*100, VIDEO: (2.95/aSum)*100, CTV: (2.5/aSum)*100, AUDIO: (0.9/aSum)*100
      }
    ];
  }, [selectedCampaignName]);

  const totalStackedVerticalData = useMemo(() => [
    { name: 'Target', SEARCH: 7.55, PMAX: 1.5, SOCIAL: 4.5, DISPLAY: 1.2, VIDEO: 2.8, CTV: 3.0, AUDIO: 0.8, total: 21.35 },
    { name: 'Actual', SEARCH: 4.61, PMAX: 1.3, SOCIAL: 3.8, DISPLAY: 1.1, VIDEO: 2.95, CTV: 2.5, AUDIO: 0.9, total: 17.16 }
  ], [selectedCampaignName]);

  const CHANNEL_COLORS: Record<string, string> = {
    SEARCH: '#3b82f6', PMAX: '#8b5cf6', SOCIAL: '#ec4899', DISPLAY: '#f59e0b', VIDEO: '#ef4444', CTV: '#10b981', AUDIO: '#64748b'
  };

  // Baseline vs Incremental Mock Data
  const contributionData = useMemo(() => [
    { week: 'W1', Base: 40, SEARCH: 10, PMAX: 12, SOCIAL: 8, OTHERS: 5 },
    { week: 'W2', Base: 40, SEARCH: 12, PMAX: 15, SOCIAL: 10, OTHERS: 8 },
    { week: 'W3', Base: 40, SEARCH: 11, PMAX: 14, SOCIAL: 7, OTHERS: 6 },
    { week: 'W4', Base: 40, SEARCH: 14, PMAX: 18, SOCIAL: 11, OTHERS: 7 },
    { week: 'W5', Base: 40, SEARCH: 15, PMAX: 20, SOCIAL: 12, OTHERS: 8 },
  ], [selectedCampaignName]);

  const [selectedMetric, setSelectedMetric] = React.useState<'Revenue' | 'Spend'>('Revenue');

  const trendsData = useMemo(() => {
    const rawData = [
      { week: 'W1', targetRoas: 4.0, actualRoas: 3.8, targetRev: 80, actualRev: 75, targetSpend: 20, actualSpend: 19.7 },
      { week: 'W2', targetRoas: 4.0, actualRoas: 4.1, targetRev: 80, actualRev: 85, targetSpend: 20, actualSpend: 20.7 },
      { week: 'W3', targetRoas: 4.0, actualRoas: 3.9, targetRev: 80, actualRev: 78, targetSpend: 20, actualSpend: 20.0 },
      { week: 'W4', targetRoas: 4.0, actualRoas: 4.2, targetRev: 80, actualRev: 90, targetSpend: 20, actualSpend: 21.4 },
      { week: 'W5', targetRoas: 4.0, actualRoas: 4.4, targetRev: 80, actualRev: 95, targetSpend: 20, actualSpend: 21.5 },
    ];

    let cumTargetRev = 0;
    let cumActualRev = 0;
    let cumTargetSpend = 0;
    let cumActualSpend = 0;

    return rawData.map(d => {
      cumTargetRev += d.targetRev;
      cumActualRev += d.actualRev;
      cumTargetSpend += d.targetSpend;
      cumActualSpend += d.actualSpend;
      return {
        ...d,
        cumTargetRev,
        cumActualRev,
        cumTargetSpend,
        cumActualSpend
      };
    });
  }, []);

  const fPct = (val: number) => `${val.toFixed(1)}%`;
  const fCur = (val: number) => `$${val.toFixed(1)}M`;
  const fNum = (val: number) => val.toFixed(2);

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 mb-2">Campaign MMM Execution Context: <span className="text-indigo-600">{selectedCampaignName}</span></h2>
        <p className="text-[12px] text-slate-500 font-medium">Tracking Marketing Mix Modeling (MMM) target allocations versus actual campaign execution. Identify performance gaps to easily re-allocate strategies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MMM vs Actual Mix Chart (100% Stacked) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              Budget Allocation Mix (%)
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">100% Stacked breakdown of channel investment composition.</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mixChartData} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 100]} />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#334155' }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: number) => `${val.toFixed(1)}%`} />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingTop: '10px' }} 
                  payload={
                    mmmData.map(d => ({
                      id: d.channel,
                      type: 'circle',
                      value: d.channel,
                      color: CHANNEL_COLORS[d.channel]
                    }))
                  }
                />
                
                {mmmData.map((d) => d.channel).map((channel) => (
                  <Bar key={channel} dataKey={channel} stackId="a" fill={CHANNEL_COLORS[channel]} maxBarSize={40}>
                    <LabelList 
                      dataKey={channel} 
                      position="center" 
                      fill="#ffffff" 
                      fontSize={10} 
                      fontWeight={700}
                      formatter={(val: number) => val >= 4 ? `${val.toFixed(1)}%` : ''} 
                    />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-1">
          <div className="flex flex-col mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                Cumulative Trend (Target vs Actual)
              </h3>
              <select 
                value={selectedMetric} 
                onChange={(e) => setSelectedMetric(e.target.value as 'Revenue' | 'Spend')}
                className="text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 outline-none focus:border-indigo-500"
              >
                <option value="Revenue">Revenue</option>
                <option value="Spend">Spend</option>
              </select>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Tracking {selectedMetric} accumulation over time.</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                
                {selectedMetric === 'Revenue' ? (
                  <>
                    <Area type="monotone" dataKey="cumActualRev" name="Actual Cum. Rev ($)" fill="#bae6fd" stroke="#0284c7" strokeWidth={2} />
                    <Line type="monotone" dataKey="cumTargetRev" name="Target Cum. Rev ($)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </>
                ) : (
                  <>
                    <Area type="monotone" dataKey="cumActualSpend" name="Actual Cum. Spend ($)" fill="#c7d2fe" stroke="#4f46e5" strokeWidth={2} />
                    <Line type="monotone" dataKey="cumTargetSpend" name="Target Cum. Spend ($)" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Allocation Gap with Total Separation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" />
            Allocation Gap: Target vs Actual (Spend)
          </h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Comparison separated into aggregated Total (left) and individual channel gaps (right) to maintain accurate Y-axis scaling.</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 h-72">
          {/* Left: Total Stacked */}
          <div className="w-full lg:w-1/4 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 pb-4 lg:pb-0 lg:pr-6">
            <h4 className="text-[11px] font-bold text-slate-600 mb-2 text-center">Total Spend</h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={totalStackedVerticalData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#334155' }} />
                  <YAxis tickFormatter={(val) => `$${val}M`} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: number) => `$${val.toFixed(2)}M`} />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '9px', fontWeight: 600, paddingTop: '10px' }} 
                    payload={
                      mmmData.map(d => ({
                        id: d.channel,
                        type: 'circle',
                        value: d.channel,
                        color: CHANNEL_COLORS[d.channel]
                      }))
                    }
                  />
                  
                  {mmmData.map((d) => d.channel).map((channel, index) => {
                    const isTopBar = index === mmmData.length - 1;
                    return (
                      <Bar key={channel} dataKey={channel} stackId="a" fill={CHANNEL_COLORS[channel]} maxBarSize={48}>
                        <LabelList 
                          dataKey={channel} 
                          position="center" 
                          fill="#ffffff" 
                          fontSize={10} 
                          fontWeight={700}
                          formatter={(val: number) => val >= 1.5 ? `$${val.toFixed(1)}M` : ''} 
                        />
                        {isTopBar && (
                          <LabelList 
                            dataKey="total" 
                            position="top" 
                            fill="#334155" 
                            fontSize={11} 
                            fontWeight={800}
                            formatter={(val: number) => `$${val.toFixed(2)}M`} 
                          />
                        )}
                      </Bar>
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Individual Channels Grouped */}
          <div className="w-full lg:w-3/4 flex flex-col">
            <h4 className="text-[11px] font-bold text-slate-600 mb-2 pl-2">Individual Channel Gap</h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mmmData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="channel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                  <YAxis tickFormatter={(val) => `$${val}M`} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(val: number) => `$${val.toFixed(2)}M`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, marginTop: '10px' }} />
                  <Bar dataKey="targetSpend" name="MMM Target Spend" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={28}>
                    <LabelList dataKey="targetSpend" position="top" fill="#64748B" fontSize={10} fontWeight={700} formatter={(val: number) => `$${val.toFixed(2)}M`} />
                  </Bar>
                  <Bar dataKey="actualSpend" name="Actual Spend" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={28}>
                    <LabelList dataKey="actualSpend" position="top" fill="#4F46E5" fontSize={10} fontWeight={700} formatter={(val: number) => `$${val.toFixed(2)}M`} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Baseline vs Incremental Contribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              Baseline vs Incremental Contribution
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Revenue composition showing core brand demand (Baseline) + Marketing uplift (Incremental).</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={contributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
                
                <Area type="monotone" dataKey="Base" stackId="1" stroke="#cbd5e1" fill="#e2e8f0" name="Baseline (Organic)" />
                <Area type="monotone" dataKey="SOCIAL" stackId="1" stroke="#ec4899" fill={CHANNEL_COLORS.SOCIAL} />
                <Area type="monotone" dataKey="SEARCH" stackId="1" stroke="#3b82f6" fill={CHANNEL_COLORS.SEARCH} />
                <Area type="monotone" dataKey="PMAX" stackId="1" stroke="#8b5cf6" fill={CHANNEL_COLORS.PMAX} />
                <Area type="monotone" dataKey="OTHERS" stackId="1" stroke="#94a3b8" fill="#cbd5e1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Optimization Recommender */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              AI Optimization Recommender
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Suggested budget shifts based on channel saturation and target performance gaps.</p>
          </div>
          
          <div className="flex-1 flex flex-col gap-3">
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-lg flex items-start gap-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-md shrink-0 mt-1">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  High Priority Shift <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] rounded-full">+$42.5K EST. LIFT</span>
                </h4>
                <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                  <span className="font-bold text-slate-800">SOCIAL</span> is under-indexing vs target spend (13.5% vs 20%) and efficiency is dropping. <span className="font-bold text-slate-800">PMAX</span> is performing at optimal ROAS (5.3) without saturation exhaustion.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500"></span>SOCIAL (-$15K)</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500"></span>PMAX (+$15K)</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-4">
              <div className="p-2 bg-slate-200 text-slate-600 rounded-md shrink-0 mt-1">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  Re-calibrate Search Volume
                </h4>
                <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed">
                  <span className="font-bold text-slate-800">SEARCH</span> is over-invested globally (+3.5%p gap). Diminishing returns curve suggests shifting excess to awareness or retargeting channels like CTV if top-funnel starts drying up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target vs Actual Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-600" />
            Channel Performance & ROI Gap Analysis
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200">
                <th className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-200 min-w-24">Channel</th>
                <th className="py-3 px-2 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center border-r border-slate-200" colSpan={3}>SPEND</th>
                <th className="py-3 px-2 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center border-r border-slate-200" colSpan={3}>IMPRESSIONS</th>
                <th className="py-3 px-2 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center border-r border-slate-200" colSpan={3}>CLICKS</th>
                <th className="py-3 px-2 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center border-r border-slate-200" colSpan={3}>50% VIEWS</th>
                <th className="py-3 px-2 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center border-r border-slate-200" colSpan={3}>75% VIEWS</th>
                <th className="py-3 px-2 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center border-r border-slate-200" colSpan={3}>PLATFORM ESTORE</th>
                <th className="py-3 px-2 text-[10px] font-black text-slate-700 uppercase tracking-widest text-center" colSpan={3}>ESTORE REVENUE</th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-bold text-slate-600 shadow-[inset_0_1px_rgba(0,0,0,0.02)]">
                <th className="py-2 px-4 border-r border-slate-200"></th>
                {/* SPEND */}
                <th className="py-2 px-1 xl:px-2 text-center">Target</th><th className="py-2 px-1 xl:px-2 text-center">Actual</th><th className="py-2 px-1 xl:px-2 text-center border-r border-slate-200 text-slate-400">Achv.</th>
                {/* IMP */}
                <th className="py-2 px-1 xl:px-2 text-center">Target</th><th className="py-2 px-1 xl:px-2 text-center">Actual</th><th className="py-2 px-1 xl:px-2 text-center border-r border-slate-200 text-slate-400">Achv.</th>
                {/* CLK */}
                <th className="py-2 px-1 xl:px-2 text-center">Target</th><th className="py-2 px-1 xl:px-2 text-center">Actual</th><th className="py-2 px-1 xl:px-2 text-center border-r border-slate-200 text-slate-400">Achv.</th>
                {/* 50% */}
                <th className="py-2 px-1 xl:px-2 text-center">Target</th><th className="py-2 px-1 xl:px-2 text-center">Actual</th><th className="py-2 px-1 xl:px-2 text-center border-r border-slate-200 text-slate-400">Achv.</th>
                {/* 75% */}
                <th className="py-2 px-1 xl:px-2 text-center">Target</th><th className="py-2 px-1 xl:px-2 text-center">Actual</th><th className="py-2 px-1 xl:px-2 text-center border-r border-slate-200 text-slate-400">Achv.</th>
                {/* ESTORE */}
                <th className="py-2 px-1 xl:px-2 text-center">Target</th><th className="py-2 px-1 xl:px-2 text-center">Actual</th><th className="py-2 px-1 xl:px-2 text-center border-r border-slate-200 text-slate-400">Achv.</th>
                {/* REV */}
                <th className="py-2 px-1 xl:px-2 text-center">Target</th><th className="py-2 px-1 xl:px-2 text-center">Actual</th><th className="py-2 px-1 xl:px-2 text-center text-slate-400">Achv.</th>
              </tr>
            </thead>
            <tbody>
              {mmmData.map((row, i) => {
                const renderMetric = (target: number, actual: number, format: (v: number) => string, borderRight = true) => {
                  const achv = Math.round((actual / target) * 100);
                  return (
                    <React.Fragment>
                      <td className="py-2.5 px-1 xl:px-2 text-center text-[10px] font-medium text-slate-500">{format(target)}</td>
                      <td className="py-2.5 px-1 xl:px-2 text-center text-[10px] font-black text-slate-800">{format(actual)}</td>
                      <td className={`py-2.5 px-1 xl:px-2 text-center text-[10px] font-bold ${borderRight ? 'border-r border-slate-200 bg-slate-50/30' : 'bg-slate-50/30'}`}>
                        <span className={achv >= 100 ? 'text-emerald-500' : 'text-red-500'}>{achv}%</span>
                      </td>
                    </React.Fragment>
                  );
                };

                return (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors bg-white">
                    <td className="py-3 px-4 font-black text-[11px] text-slate-800 border-r border-slate-200">{row.channel}</td>
                    {renderMetric(row.targetSpend, row.actualSpend, (v) => `$${v}M`)}
                    {renderMetric(row.targetImp, row.actualImp, (v) => `${v}M`)}
                    {renderMetric(row.targetClicks, row.actualClicks, (v) => `${v}M`)}
                    {renderMetric(row.target50V, row.actual50V, (v) => `${v}M`)}
                    {renderMetric(row.target75V, row.actual75V, (v) => `${v}M`)}
                    {renderMetric(row.targetEstore, row.actualEstore, (v) => `${v}M`)}
                    {renderMetric(row.targetRev, row.actualRev, (v) => `$${v}K`, false)}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MmmPerformanceDashboard;
