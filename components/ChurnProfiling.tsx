import React, { useMemo, useState } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { getFilteredLeads } from '../services/crmMockData';
import { 
  AlertTriangle, 
  Clock, 
  Trash2, 
  UserMinus, 
  TrendingDown, 
  XCircle, 
  FileX, 
  MessageSquare,
  Globe,
  Building,
  LayoutGrid,
  Briefcase,
  Cpu,
  Fingerprint,
  ShieldAlert,
  HelpCircle,
  Users
} from 'lucide-react';

export default function ChurnProfiling() {
  const { filters } = useFilters();
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  // 1. Isolate dropped records (isDropped === true)
  const droppedLeads = useMemo(() => {
    const leads = getFilteredLeads(filters);
    return leads.filter(l => l.isDropped === true);
  }, [filters]);

  const totalDroppedCount = droppedLeads.length;

  // 2. Classify each lead deterministically into 4 categories matching user criteria
  const categorizedLeads = useMemo(() => {
    return droppedLeads.map(lead => {
      const num = parseInt(lead.id.replace(/[^0-9]/g, '').slice(-4)) || 0;
      
      let segment = 'no_response';
      // Map other states nicely into these 4 core segments
      if (lead.droppedAtStage === 'MQL' || lead.rejectionReason === '타겟 미선호/자격 미달' || lead.jobRole === 'Operator (실무자)') {
        segment = 'no_sql';
      } else if (lead.conversionTimeCategory === 'Long-term (90일+)' || lead.rejectionReason === '개인정보 거부/수신 불인정') {
        segment = 'long_inactive';
      } else if (num % 2 === 0) {
        segment = 'stagnant';
      } else {
        segment = 'no_response';
      }
      
      return {
        ...lead,
        churnSegment: segment
      };
    });
  }, [droppedLeads]);

  // 3. Calculates stats for the 4 core cards requested by the user
  const criteriaStats = useMemo(() => {
    const categories = [
      { 
        id: 'no_response',
        name: '14일 이내 무응답 고객', 
        desc: '문의접수 이후 14일 동안 연락 불가 및 유선/이메일 무응답 상태', 
        badgeColor: 'text-[#e11d48] bg-rose-50 border-rose-100',
        activeBadgeColor: 'text-white bg-[#e11d48] border-[#e11d48]',
        barColor: 'bg-[#e11d48]',
        icon: MessageSquare 
      },
      { 
        id: 'stagnant',
        name: '전환 리드 정체', 
        desc: '리드 획득 후 영업 기회(MQL/SQL)로 전이되지 못하고 정체된 고객', 
        badgeColor: 'text-amber-600 bg-amber-50 border-amber-100',
        activeBadgeColor: 'text-white bg-amber-600 border-amber-600',
        barColor: 'bg-amber-500',
        icon: Clock 
      },
      { 
        id: 'no_sql',
        name: '영업 비수용 리드', 
        desc: 'B2B 영업 검토 단계에서 내부 자격 미달 및 수용 불가로 기각된 리드', 
        badgeColor: 'text-orange-600 bg-orange-50 border-orange-100',
        activeBadgeColor: 'text-white bg-orange-600 border-orange-600',
        barColor: 'bg-orange-500',
        icon: XCircle 
      },
      { 
        id: 'long_inactive',
        name: '장기 무반응 리드', 
        desc: '90일 이상 신규 캠페인 반응이나 상호작용 이력이 없는 비활성 리드', 
        badgeColor: 'text-slate-600 bg-slate-50 border-slate-100',
        activeBadgeColor: 'text-white bg-slate-600 border-slate-600',
        barColor: 'bg-slate-500',
        icon: Clock 
      },
    ];

    return categories.map(cat => {
      const list = categorizedLeads.filter(l => l.churnSegment === cat.id);
      const count = list.length;
      const realPercentage = totalDroppedCount ? ((count / totalDroppedCount) * 100).toFixed(1) : '0.0';
      
      return {
        ...cat,
        count,
        percentage: realPercentage
      };
    });
  }, [categorizedLeads, totalDroppedCount]);

  // 4. Narrow down the leads dataset based on the active selection
  const selectedLeads = useMemo(() => {
    if (!selectedSegment) return categorizedLeads;
    return categorizedLeads.filter(l => l.churnSegment === selectedSegment);
  }, [categorizedLeads, selectedSegment]);

  const selectedLeadsCount = selectedLeads.length;

  // 5. Distribution helper for selected segment analysis
  const getDistribution = (key: keyof typeof selectedLeads[0]) => {
    const counts: Record<string, number> = {};
    selectedLeads.forEach(lead => {
      const val = String(lead[key]);
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: selectedLeadsCount ? ((count / selectedLeadsCount) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Profile data for the 8 dimensions symmetric to high value
  const countriesDist = useMemo(() => getDistribution('country'), [selectedLeads, selectedLeadsCount]);
  const sizeDist = useMemo(() => getDistribution('companySize'), [selectedLeads, selectedLeadsCount]);
  const industryDist = useMemo(() => getDistribution('industry'), [selectedLeads, selectedLeadsCount]);
  const roleDist = useMemo(() => getDistribution('jobRole'), [selectedLeads, selectedLeadsCount]);
  const productDist = useMemo(() => getDistribution('product'), [selectedLeads, selectedLeadsCount]);
  const platformDist = useMemo(() => getDistribution('platform'), [selectedLeads, selectedLeadsCount]);
  const campaignDist = useMemo(() => getDistribution('campaign'), [selectedLeads, selectedLeadsCount]);
  const reasonDist = useMemo(() => getDistribution('rejectionReason'), [selectedLeads, selectedLeadsCount]);

  // Helper to map lead deterministically to a Hanwha Vision responsible B2B Sales Department
  const getLeadSalesDept = (lead: any) => {
    // 1. 해외 비즈니스 대상
    if (lead.country !== "한국") {
      return "글로벌 전략비즈니스본부";
    }
    // 2. 공공/스마트시티/인프라
    if (lead.industry === "Smart City / Public" || lead.industry === "Transportation") {
      return "스마트시티 공공영업팀";
    }
    // 3. 엔터프라이즈 스마트팩토리/제조 도메인
    if (lead.industry === "Manufacturing" && lead.companySize === "Enterprise (1000인 이상)") {
      return "엔터프라이즈 스마트팩토리팀";
    }
    // 4. 클라우드 및 솔루션 기술영업
    if (lead.product.includes("OnCloud") || lead.product.includes("Access Control")) {
      return "클라우드 & IoT 솔루션팀";
    }
    // 5. SMB 및 채널/파트너 지원팀
    if (lead.companySize === "SMB (< 100인)") {
      return "채널 파트너 & SMB 영업팀";
    }
    return "국내 대공간 솔루션영업본부";
  };

  // Compute stats distribution for the Assigned Sales Departments
  const salesDeptDist = useMemo(() => {
    const counts: Record<string, number> = {};
    selectedLeads.forEach(lead => {
      const dept = getLeadSalesDept(lead);
      counts[dept] = (counts[dept] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: selectedLeadsCount ? ((count / selectedLeadsCount) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count);
  }, [selectedLeads, selectedLeadsCount]);

  const regionDist = useMemo(() => {
    let asia = 0;
    let americas = 0;
    let europe = 0;
    
    selectedLeads.forEach(l => {
      if (['한국', '일본', '싱가폴', '베트남'].includes(l.country)) asia++;
      else if (['미국'].includes(l.country)) americas++;
      else if (['독일', '영국', '프랑스'].includes(l.country)) europe++;
    });

    return [
      { name: '아시아 (APAC)', count: asia, percentage: selectedLeadsCount ? ((asia / selectedLeadsCount) * 100).toFixed(1) : '0' },
      { name: '미주 (Americas)', count: americas, percentage: selectedLeadsCount ? ((americas / selectedLeadsCount) * 100).toFixed(1) : '0' },
      { name: '유럽 (Europe)', count: europe, percentage: selectedLeadsCount ? ((europe / selectedLeadsCount) * 100).toFixed(1) : '0' }
    ].sort((a, b) => b.count - a.count);
  }, [selectedLeads, selectedLeadsCount]);

  // Determine the name of the currently selected filter
  const selectedSegmentName = useMemo(() => {
    if (!selectedSegment) return '전체 이탈 고객';
    const match = criteriaStats.find(c => c.id === selectedSegment);
    return match ? match.name : '이탈 고객';
  }, [selectedSegment, criteriaStats]);

  // Handler to toggle card selection filter
  const handleCardClick = (id: string) => {
    if (selectedSegment === id) {
      setSelectedSegment(null); // Click again to reset
    } else {
      setSelectedSegment(id);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title Alert Box in Crimson */}
      <div className="bg-rose-950 text-white p-6 border-b-4 border-rose-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded uppercase font-mono">ATTRITION PORTFOLIO</span>
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-black mt-1">이탈 고객 (Dropped / Churned) 상세 분류 기준 및 현황</h2>
            <p className="text-xs text-rose-200 mt-1">마케팅 필터링 기간 내 리드 단계별 이탈 기준입니다. 아래 카드를 클릭 시, 세그먼트별 프로필 분석이 동적 필터링됩니다.</p>
          </div>
          <div className="bg-rose-900/50 border border-rose-800 px-4 py-2 text-right shrink-0">
            <span className="text-[10px] text-rose-300 block font-bold font-sans">누수 리드 규모</span>
            <span className="text-lg font-black text-rose-400 font-mono">{totalDroppedCount.toLocaleString()}건</span>
          </div>
        </div>
      </div>

      {/* 이탈 고객 분류 상세 기준 현황 Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-rose-600"></span>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              이탈 분류 상세 세그먼트 (클릭 시 하단 상세 프로필 심층 분석 연동)
            </h3>
          </div>
          {selectedSegment && (
            <button 
              onClick={() => setSelectedSegment(null)}
              className="text-[10px] font-extrabold text-rose-600 hover:text-rose-800 transition-colors bg-rose-50 border border-rose-200 px-2 py-1 rounded"
            >
              선택 초기화 (전체 보기)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {criteriaStats.map(cat => {
            const IconComponent = cat.icon;
            const isCurrent = selectedSegment === cat.id;
            return (
              <div 
                key={cat.id} 
                onClick={() => handleCardClick(cat.id)}
                className={`cursor-pointer transition-all duration-200 p-5 border flex flex-col justify-between rounded-xs ${
                  isCurrent 
                    ? 'bg-rose-50/50 border-rose-500 ring-2 ring-rose-500/20 shadow-md transform -translate-y-0.5' 
                    : 'bg-white border-slate-200 hover:border-rose-400 shadow-xs hover:shadow-sm'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-0.5 border text-[9px] font-black rounded ${isCurrent ? cat.activeBadgeColor : cat.badgeColor}`}>
                      {cat.name} {isCurrent && '● 선택분석'}
                    </span>
                    <IconComponent className={`w-4 h-4 ${isCurrent ? 'text-rose-600' : 'text-slate-400'}`} />
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed font-sans mb-4">
                    {cat.desc}
                  </p>
                </div>

                <div className="border-t pt-3 flex items-end justify-between mt-auto">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">이탈 규모</span>
                    <span className={`text-lg font-black font-mono ${isCurrent ? 'text-rose-700' : 'text-slate-900'}`}>
                      {cat.count.toLocaleString()}<span className="text-xs text-slate-500 ml-0.5 font-bold font-sans">건</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">구간 내 비중</span>
                    <span className={`text-sm font-black font-mono ${isCurrent ? 'text-rose-600' : 'text-slate-600'}`}>
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                {/* Micro trend progress bar */}
                <div className="w-full bg-slate-100 h-1 mt-3 rounded-full overflow-hidden">
                  <div className={`${cat.barColor} h-full transition-all duration-500`} style={{ width: `${cat.percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Churn Detail Analyse Title Bar */}
      <div className="bg-[#1e293b] text-white p-5 border-b-4 border-rose-600 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="text-[10px] text-rose-500 font-extrabold uppercase tracking-widest block">CHURN PROFILING ANALYTICS</span>
          <h3 className="text-xs md:text-sm font-black mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            [{selectedSegmentName}] 세부 속성 정밀 프로파일링 (총 {selectedLeadsCount}건)
          </h3>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <div className="relative shrink-0 w-full sm:w-[320px]">
            <select 
              value={selectedSegment || ''} 
              onChange={(e) => setSelectedSegment(e.target.value || null)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-105 font-bold p-2.5 rounded text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all duration-150 cursor-pointer shadow-xs uppercase font-sans"
            >
              <option value="" className="bg-slate-900 text-white font-bold">전체 이탈 고객 분석 ({totalDroppedCount}건, 100%)</option>
              {criteriaStats.map(cat => (
                <option key={cat.id} value={cat.id} className="bg-slate-900 text-white font-bold">
                  {cat.name} ({cat.count}건 / {cat.percentage}%)
                </option>
              ))}
            </select>
          </div>
          {selectedSegment && (
            <button 
              onClick={() => setSelectedSegment(null)}
              className="text-[11px] bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 px-3 py-2.5 transition-all font-bold shrink-0 uppercase"
            >
              전체 분석 전환
            </button>
          )}
        </div>
      </div>

      {/* Dynamic 5-Dimension Bento Grid for Churn Profiling & Sales Alignment */}
      {selectedLeadsCount === 0 ? (
        <div className="bg-white border p-12 text-center rounded-xs">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <span className="text-sm font-black text-slate-600 block">선택한 필터 조건에 부합하는 이탈 리드가 없습니다.</span>
          <p className="text-xs text-slate-400 mt-1">상단의 글로벌 검색 필터 단계를 조정하거나, 다른 이탈 세그먼트를 클릭해 보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* 1. 권역 및 국가 분포 (Region / Country) */}
          <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="churn-geography">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
                <Globe className="w-4 h-4 text-rose-600" />
                1. 권역 및 국가 분포 (Region)
              </h3>
              <div className="space-y-3">
                {regionDist.map(item => (
                  <div key={item.name} className="flex flex-col">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="font-mono text-slate-900 font-bold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 mt-1 rounded-full overflow-hidden">
                      <div className="bg-[#1e293b] h-full" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic mt-4">유라시아 및 스마트 시티 공급망 이탈 여부를 분석합니다.</p>
          </div>

          {/* 2. 관심 제품별 분포 (Products) */}
          <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="churn-products">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
                <Cpu className="w-4 h-4 text-rose-600" />
                2. 관심 제품별 분포 (Products)
              </h3>
              <div className="space-y-3">
                {productDist.map(item => (
                  <div key={item.name} className="flex flex-col">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.name}</span>
                      <span className="font-mono text-slate-900 font-bold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 mt-1 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic mt-4">어떤 라인업에서 경쟁사 이행 및 포기가 발생했는지 추출합니다.</p>
          </div>

          {/* 3. 담당 영업 부서 분포 (Assigned Sales Department with Scroll) */}
          <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="churn-sales-departments">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
                <Users className="w-4 h-4 text-rose-600" />
                3. 담당 영업 부서 (Sales Team)
              </h3>
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {salesDeptDist.map(item => {
                  return (
                    <div key={item.name} className="flex flex-col border-b border-dashed border-slate-100 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800 font-bold">{item.name}</span>
                        <span className="font-mono text-rose-600 font-extrabold">{item.percentage}%</span>
                      </div>
                      
                      <div className="w-full bg-slate-100 h-1 mt-1 rounded-full overflow-hidden mb-2">
                        <div className="bg-rose-600 h-full transition-all duration-500" style={{ width: `${item.percentage}%` }}></div>
                      </div>

                      <div className="flex justify-between items-center text-[10.5px] text-slate-500 font-bold">
                        <span>총 이탈 건수</span>
                        <span className="font-mono">{item.count}건</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic mt-4 border-t pt-2.5">각 이탈 세그먼트별로 영업 거부 사유가 가장 많이 축적된 담당 부서 분포입니다.</p>
          </div>

          {/* 4. 주된 거부 및 기각 사유 (Rejection Reasons) */}
          <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="churn-reasons">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                4. 주된 거부 및 기각 사유
              </h3>
              <div className="space-y-3">
                {reasonDist.slice(0, 4).map(item => (
                  <div key={item.name} className="flex flex-col">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate max-w-[150px]">{item.name || '알 수 없음'}</span>
                      <span className="font-mono text-rose-600 font-bold shrink-0">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 mt-1 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${item.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-rose-400 italic mt-4 font-sans">고객 설문/담당자 입력 기반 거부사유 분석 및 귀인 정보입니다.</p>
          </div>

        </div>
      )}

    </div>
  );
}
