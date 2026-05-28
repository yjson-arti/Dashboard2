import React, { useState, useMemo } from 'react';
import { Target, Image as ImageIcon, LayoutTemplate, Activity, AlertTriangle, TrendingUp, TrendingDown, ArrowRight, ShieldAlert, CheckCircle2, ArrowDown, ArrowUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Cell } from 'recharts';

type CEJType = 'Awareness' | 'Consideration' | 'Conversion';
type FormatType = 'Video' | 'Non-Video' | 'All';

interface KPIOption {
  name: string;
  type: 'effect' | 'efficiency'; // effect = 효과 (higher is better), efficiency = 효율 (lower is better)
}

const KPI_MAPPING: Record<CEJType, Record<FormatType, KPIOption[]>> = {
  Awareness: {
    Video: [{ name: 'VTR 50', type: 'effect' }, { name: 'CPV 50', type: 'efficiency' }],
    'Non-Video': [{ name: 'CTR', type: 'effect' }, { name: 'CPM', type: 'efficiency' }],
    All: []
  },
  Consideration: {
    Video: [{ name: 'VTR 75', type: 'effect' }, { name: 'CPV 75', type: 'efficiency' }],
    'Non-Video': [{ name: 'CTR', type: 'effect' }, { name: 'CPC', type: 'efficiency' }],
    All: []
  },
  Conversion: {
    Video: [{ name: 'CVR', type: 'effect' }, { name: 'CTR', type: 'effect' }, { name: 'CPC', type: 'efficiency' }, { name: 'ROAS', type: 'effect' }],
    'Non-Video': [{ name: 'CVR', type: 'effect' }, { name: 'CTR', type: 'effect' }, { name: 'CPC', type: 'efficiency' }, { name: 'ROAS', type: 'effect' }],
    All: [{ name: 'CVR', type: 'effect' }, { name: 'CTR', type: 'effect' }, { name: 'CPC', type: 'efficiency' }, { name: 'ROAS', type: 'effect' }]
  }
};

const RESPONSE_PLAYBOOK = {
  Media: {
    title: '미디어 (Media)',
    icon: <LayoutTemplate size={18} />,
    steps: ['매체·지면별 성과 편차 식별', '비효율 예산 재배분 권고', '미디어 믹스 변동로그 감지']
  },
  Targeting: {
    title: '타겟팅 (Targeting)',
    icon: <Target size={18} />,
    steps: ['오디언스별 효율·확장성 진단', '타겟 세그먼트 최적화 제언', '타겟 설정 변경 여부 추적']
  },
  Creative: {
    title: '소재 (Creative)',
    icon: <ImageIcon size={18} />,
    steps: ['소재별 성과 하락 징후 포착', '고효율 소재 교체/확대 권고', '소재 ID별 노출 비중 모니터링']
  }
};

const AnomalyDetectionDashboard: React.FC = () => {
  const [activeCEJ, setActiveCEJ] = useState<CEJType>('Consideration');
  const [activeFormat, setActiveFormat] = useState<FormatType>('Video');
  
  const availableKPIs = KPI_MAPPING[activeCEJ][activeFormat]?.length > 0 
    ? KPI_MAPPING[activeCEJ][activeFormat] 
    : KPI_MAPPING[activeCEJ]['All'];
    
  const [activeKPI, setActiveKPI] = useState<string>(availableKPIs[1]?.name || availableKPIs[0]?.name);

  // Auto-update KPI if it doesn't exist in new selection
  useMemo(() => {
    if (!availableKPIs.find(k => k.name === activeKPI)) {
      setActiveKPI(availableKPIs[0]?.name);
    }
  }, [availableKPIs, activeKPI]);

  // Generate mock data for the selected KPI
  const mockData = useMemo(() => {
    const isEfficiency = availableKPIs.find(k => k.name === activeKPI)?.type === 'efficiency';
    
    // Simulate a scenario based on selection
    // Let's make "Consideration x Video x CPV 75" show a "Sudden Drop" (green flag for efficiency)
    // And another KPI show a "Sudden Spike"
    
    let chartData = [];
    let anomalyStatus: 'drop' | 'spike' | 'normal' = 'normal';
    let mean = 100;
    
    if (activeKPI.includes('CPV') || activeKPI.includes('CPC')) {
      // Create a "Sudden Spike" scenario for cost (BAD) OR "Sudden Drop" based on random or specific
      if (activeCEJ === 'Consideration' && activeFormat === 'Video') {
        mean = 130;
        anomalyStatus = 'drop'; // Example from slide: 130 -> 20
        chartData = [
          { name: '4W Mean', value: mean, label: '4W Mean' },
          { name: 'Current', value: 20, label: activeKPI }
        ];
      } else {
        mean = 72;
        anomalyStatus = 'spike'; // Example from slide: 72 -> 300
        chartData = [
          { name: '4W Mean', value: mean, label: '4W Mean' },
          { name: 'Current', value: 300, label: activeKPI }
        ];
      }
    } else {
      // VTR, CTR, CVR, ROAS
      mean = 5.2; // roughly 5.2%
      anomalyStatus = 'drop'; // drop in effectiveness (BAD)
      chartData = [
        { name: '4W Mean', value: mean, label: '4W Mean' },
        { name: 'Current', value: 1.1, label: activeKPI }
      ];
    }
    
    const maxBound = mean * 4; // x4 threshold
    const minBound = mean * 0.5; // x0.5 threshold

    return {
      chartData,
      anomalyStatus,
      mean,
      maxBound,
      minBound,
      isEfficiency
    };
  }, [activeCEJ, activeFormat, activeKPI, availableKPIs]);

  // Derived state styling
  const isAlarming = (mockData.anomalyStatus === 'spike' && mockData.isEfficiency) || (mockData.anomalyStatus === 'drop' && !mockData.isEfficiency);
  const StatusIcon = isAlarming ? AlertTriangle : CheckCircle2;
  const statusColor = isAlarming ? 'text-rose-500' : 'text-emerald-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      <div className="bg-slate-900 border-b border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="text-indigo-400 w-5 h-5" />
          <h2 className="text-xl font-black tracking-tight text-white">Anomaly Detection Process</h2>
        </div>
        <p className="text-sm text-slate-300 font-medium">자동화 초석 마련을 위한 탐지 단위 x 방법론 및 검증 프로세스</p>
      </div>

      <div className="p-6">
        {/* Step 1: Detection Unit */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <h3 className="text-lg font-black text-slate-800">탐지 단위 (Detection Unit)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CEJ Selection */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">CEJ Phase</div>
              <div className="flex flex-col gap-2">
                {(['Awareness', 'Consideration', 'Conversion'] as CEJType[]).map(cej => (
                  <button
                    key={cej}
                    onClick={() => setActiveCEJ(cej)}
                    className={`px-3 py-2 text-sm font-bold rounded-md text-left transition-all ${activeCEJ === cej ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50'}`}
                  >
                    {cej}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Format</div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveFormat('Video')}
                  className={`px-3 py-2 text-sm font-bold rounded-md text-left transition-all ${activeFormat === 'Video' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'}`}
                >
                  Video
                </button>
                <button
                  onClick={() => setActiveFormat('Non-Video')}
                  className={`px-3 py-2 text-sm font-bold rounded-md text-left transition-all ${activeFormat === 'Non-Video' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'}`}
                >
                  Non-Video
                </button>
                {activeCEJ === 'Conversion' && (
                  <button
                    onClick={() => setActiveFormat('All')}
                    className={`px-3 py-2 text-sm font-bold rounded-md text-left transition-all ${activeFormat === 'All' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'}`}
                  >
                    Video & Non-Video
                  </button>
                )}
              </div>
            </div>

            {/* KPI Selection */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">KPI</div>
              <div className="flex flex-wrap gap-2">
                {availableKPIs.map(kpi => (
                  <button
                    key={kpi.name}
                    onClick={() => setActiveKPI(kpi.name)}
                    className={`px-4 py-3 text-sm font-bold rounded-md flex-1 min-w-[100px] flex flex-col items-center justify-center transition-all ${activeKPI === kpi.name ? 'border-2 border-indigo-600 bg-indigo-50 shadow-sm' : 'border border-slate-200 bg-white hover:border-indigo-300'}`}
                  >
                    <span className={`text-[10px] mb-1 px-1.5 py-0.5 rounded-sm ${kpi.type === 'effect' ? 'bg-[#a8d582]/20 text-[#6a8c4c]' : 'bg-[#7cb5ec]/20 text-[#4a76a5]'}`}>
                      {kpi.type === 'effect' ? '효과' : '효율'}
                    </span>
                    <span className={activeKPI === kpi.name ? 'text-indigo-900' : 'text-slate-600'}>{kpi.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Step 2: Methodology */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <h3 className="text-lg font-black text-slate-800">탐지 방법론 (Methodology)</h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5 mb-5 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full">2-1</span>
                최근 4W 추이 및 피어 그룹 기준 이상치 선별
              </h4>
              
              <div className="h-64 mt-4 relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: 600, fontSize: 13}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 'bold' }} />
                    
                    {/* Normal Range Shading */}
                    {/* @ts-ignore - recharts typing issue with fill on ReferenceArea */}
                    <ReferenceArea y1={mockData.minBound} y2={mockData.maxBound} fill="#f1f5f9" fillOpacity={0.5} />
                    <ReferenceLine y={mockData.maxBound} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} label={{ position: 'insideTopLeft', value: '피어 그룹 수용 범위 (x4)', fill: '#64748B', fontSize: 11, fontWeight: 'bold' }} />
                    <ReferenceLine y={mockData.minBound} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} label={{ position: 'insideBottomLeft', value: '피어 그룹 수용 범위 (x0.5)', fill: '#64748B', fontSize: 11, fontWeight: 'bold' }} />
                    
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {mockData.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#94A3B8' : (mockData.anomalyStatus === 'spike' ? '#EF4444' : '#3B82F6')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 shadow-sm bg-white px-3 py-1.5 rounded-full border border-slate-200">
                  <div className={`w-3 h-3 rounded-full ${statusColor} bg-current`}></div>
                  <span className="text-xs font-bold text-slate-700">현재 상태:</span>
                  <span className={`text-xs font-black ${statusColor}`}>
                    {mockData.anomalyStatus === 'spike' ? '급등 (Spike)' : mockData.anomalyStatus === 'drop' ? '급락 (Drop)' : '정상 (Normal)'}
                  </span>
                </div>
                {isAlarming && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full border border-rose-200">
                    <ShieldAlert size={14} />
                    <span className="text-xs font-bold">대응 필요 (Action Required)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-5 shadow-sm text-white relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500 rounded-full opacity-20 blur-xl"></div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">2-2</span>
                지표 상관관계 기반 이상 원인 가설 도출
              </h4>
              
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-6">
                <div className="flex-1 bg-white/10 rounded-lg p-3 border border-white/10 backdrop-blur-sm">
                  <div className="text-[10px] text-indigo-300 font-bold uppercase mb-1">이상치 시나리오</div>
                  <div className="flex justify-center items-center gap-2 mb-2 bg-slate-900/50 p-2 rounded">
                    <span className="font-bold text-sm bg-indigo-500/30 px-2 py-0.5 rounded">{activeCEJ.substring(0, 7)}.</span>
                    <span className="text-xs text-slate-400">x</span>
                    <span className="font-bold text-sm bg-indigo-500/30 px-2 py-0.5 rounded">{activeFormat}</span>
                  </div>
                  
                  <div className="flex justify-around items-center mt-3 relative">
                    <div className="flex flex-col items-center">
                       {mockData.anomalyStatus === 'drop' ? <ArrowDown className="text-blue-400 mb-1" size={24} /> : <ArrowUp className="text-rose-400 mb-1" size={24} />}
                       <span className="text-xs font-bold bg-slate-900/50 px-2 py-1 rounded">{activeKPI}</span>
                       <span className={`text-[10px] uppercase font-black tracking-wider mt-1 ${mockData.anomalyStatus === 'drop' ? 'text-blue-400' : 'text-rose-400'}`}>
                         {mockData.anomalyStatus === 'drop' ? '급락' : '급등'}
                       </span>
                    </div>
                    
                    <div className="text-indigo-400/50 font-black text-xl italic">&</div>
                    
                    <div className="flex flex-col items-center opacity-70">
                       {mockData.anomalyStatus === 'spike' ? <ArrowDown className="text-blue-400 mb-1" size={24} /> : <ArrowUp className="text-rose-400 mb-1" size={24} />}
                       <span className="text-xs font-bold bg-slate-900/50 px-2 py-1 rounded">관련 지표</span>
                       <span className={`text-[10px] uppercase font-black tracking-wider mt-1 ${mockData.anomalyStatus === 'spike' ? 'text-blue-400' : 'text-rose-400'}`}>
                         {mockData.anomalyStatus === 'spike' ? '급락' : '급등'}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex justify-center items-center px-2">
                  <ArrowRight className="text-slate-500" strokeWidth={3} />
                </div>

                <div className="flex-1 bg-indigo-600/20 rounded-lg p-3 border border-indigo-500/30">
                  <div className="text-[10px] text-indigo-300 font-bold uppercase mb-2">원인 분석 가설</div>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-1.5">
                      <LayoutTemplate className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0" />
                      <span className="font-semibold text-slate-200">클릭 위주 매체 비중 과다 여부 점검 必</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Target className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                      <span className="font-semibold text-slate-200">타겟 풀 확장 통한 경쟁 완화 권고</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                      <span className="font-semibold text-slate-200">고성과 소재 기준 재정립 必</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Response */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <h3 className="text-lg font-black text-slate-800">대응 방법론 (Response Strategy)</h3>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 h-[calc(100%-40px)] shadow-inner">
               <div className="flex justify-between items-center text-xs font-black text-slate-400 uppercase tracking-widest px-4 pb-3 border-b border-slate-200 mb-4">
                 <div className="w-[80px]">구분</div>
                 <div className="flex-1 flex justify-between pr-4">
                   <div className="flex items-center gap-1">원인 분석<ArrowRight size={12}/></div>
                   <div className="flex items-center gap-1">개선안 발송<ArrowRight size={12}/></div>
                   <div className="flex items-center gap-1">이행 센싱</div>
                 </div>
               </div>

               <div className="space-y-4">
                 {Object.entries(RESPONSE_PLAYBOOK).map(([key, category]) => (
                   <div key={key} className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 group-hover:bg-indigo-500 transition-colors"></div>
                     {/* Category Label */}
                     <div className="flex md:flex-col items-center md:items-start md:w-[80px] shrink-0 gap-2 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 pt-1">
                       <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                         {category.icon}
                       </div>
                       <span className="text-xs font-black text-slate-700 leading-tight">{category.title.split(' ')[0]}<br className="hidden md:block"/><span className="text-[10px] font-bold text-slate-400 uppercase">{category.title.split(' ')[1].replace(/[()]/g, '')}</span></span>
                     </div>
                     
                     {/* Steps */}
                     <div className="flex-1 flex flex-col sm:flex-row justify-between sm:items-center gap-y-3 sm:gap-x-4 pl-0 md:pl-2">
                        {category.steps.map((step, idx) => (
                           <div key={idx} className="flex-1 text-[11px] font-bold text-slate-700 flex items-center gap-2">
                             {/* Mobile visual connection */}
                             <div className="sm:hidden w-1.5 h-1.5 rounded-full bg-indigo-300 shrink-0"></div>
                             {step}
                           </div>
                        ))}
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                 <h5 className="text-xs font-black text-indigo-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Target size={14} />
                   자동화 파이프라인 (Pipeline Target)
                 </h5>
                 <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                   위 정의된 탐지 규칙 및 대응 플레이북은 주간 리포팅 및 실시간 대시보드 경고 시스템에 자동으로 연동되어, 이상치 발생 즉시 담당자에게 슬랙(Slack) 및 메일을 통한 원인 분석 및 최적화 제안을 발송합니다.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetectionDashboard;
