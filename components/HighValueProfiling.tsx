import React, { useMemo } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { getFilteredLeads } from '../services/crmMockData';
import { Globe, Building, LayoutGrid, Briefcase, Cpu, Fingerprint, ShieldAlert, CalendarRange } from 'lucide-react';

export default function HighValueProfiling() {
  const { filters } = useFilters();

  // 1. Extract premium records (Opportunity & Sales)
  const premiumLeads = useMemo(() => {
    const leads = getFilteredLeads(filters);
    return leads.filter(l => l.finalStage === 'Sales' || l.finalStage === 'Opportunity');
  }, [filters]);

  const totalPremiumCount = premiumLeads.length;

  // Helper helper to get percentage distribution
  const getDistribution = (key: keyof typeof premiumLeads[0]) => {
    const counts: Record<string, number> = {};
    premiumLeads.forEach(lead => {
      const val = String(lead[key]);
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalPremiumCount ? ((count / totalPremiumCount) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Profile data for the 8 requested dimensions
  const countriesDist = useMemo(() => getDistribution('country'), [premiumLeads]);
  const sizeDist = useMemo(() => getDistribution('companySize'), [premiumLeads]);
  const industryDist = useMemo(() => getDistribution('industry'), [premiumLeads]);
  const roleDist = useMemo(() => getDistribution('jobRole'), [premiumLeads]);
  const productDist = useMemo(() => getDistribution('product'), [premiumLeads]);
  const platformDist = useMemo(() => getDistribution('platform'), [premiumLeads]);
  const campaignDist = useMemo(() => getDistribution('campaign'), [premiumLeads]);
  const durationDist = useMemo(() => getDistribution('conversionTimeCategory'), [premiumLeads]);

  // Aggregate Regions manually for country/region analyze
  const regionDist = useMemo(() => {
    let asia = 0;
    let americas = 0;
    let europe = 0;
    
    premiumLeads.forEach(l => {
      if (['한국', '일본', '싱가폴', '베트남'].includes(l.country)) asia++;
      else if (['미국'].includes(l.country)) americas++;
      else if (['독일', '영국', '프랑스'].includes(l.country)) europe++;
    });

    return [
      { name: '아시아 (APAC)', count: asia, percentage: totalPremiumCount ? ((asia / totalPremiumCount) * 100).toFixed(1) : '0' },
      { name: '미주 (Americas)', count: americas, percentage: totalPremiumCount ? ((americas / totalPremiumCount) * 100).toFixed(1) : '0' },
      { name: '유럽 (Europe)', count: europe, percentage: totalPremiumCount ? ((europe / totalPremiumCount) * 100).toFixed(1) : '0' }
    ].sort((a, b) => b.count - a.count);
  }, [premiumLeads]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Profiling Title Overlay */}
      <div className="bg-[#1e293b] text-white p-6 border-b-4 border-[#f37321]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] text-[#f37321] font-black uppercase tracking-widest block">CUSTOMER PROFILING ENGINE</span>
            <h2 className="text-xl font-black mt-1">Sales & Opportunity 고가치 세그먼트 분석</h2>
            <p className="text-xs text-slate-400 mt-1">최종 계약 체결(Sales) 및 견적 조율 단계(Opportunity)의 정예 잠재고객 총 <span className="text-[#f37321] font-bold">{totalPremiumCount}명</span>의 공통 프로필 분석입니다.</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-4 py-2 text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-bold">VIP 전사 오퍼튜니티 기여도</span>
            <span className="text-lg font-black text-[#f37321] font-mono">{(totalPremiumCount * 0.42).toFixed(1)}% <span className="text-xs text-white">Conversion Rate</span></span>
          </div>
        </div>
      </div>

      {/* Symmetric 2x4 Bento Grid for all 8 analytical dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* 1. 권역 및 국가 분포 (Region / Country) */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="profile-geography">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
              <Globe className="w-4 h-4 text-slate-600" />
              1. 권역 및 국가 분포 (Region)
            </h3>
            <div className="space-y-3">
              {regionDist.map(item => (
                <div key={item.name} className="flex flex-col">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-mono text-slate-900 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 mt-1">
                    <div className="bg-[#1e293b] h-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic mt-4">유럽 권역 기여가 점진적으로 확산 중입니다.</p>
        </div>
        
        {/* 2. 회사 규모 (Company Size) */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="profile-company">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
              <Building className="w-4 h-4 text-slate-600" />
              2. 회사 규모 (Company Size)
            </h3>
            <div className="space-y-3">
              {sizeDist.map(item => (
                <div key={item.name} className="flex flex-col">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-mono text-slate-900 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 mt-1">
                    <div className="bg-[#f37321] h-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic mt-4">엔터프라이즈급 의사결정 비중이 매우 높습니다.</p>
        </div>

        {/* 3. 산업군 요약 (Industry) */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="profile-industry">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
              <LayoutGrid className="w-4 h-4 text-slate-600" />
              3. 핵심 고객 산업군 (Industry)
            </h3>
            <div className="space-y-3">
              {industryDist.slice(0, 4).map(item => (
                <div key={item.name} className="flex flex-col">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 font-bold">{item.name}</span>
                    <span className="font-mono text-slate-900 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 mt-1">
                    <div className="bg-[#1e293b] h-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic mt-4">제조/인프라 가치가 시장을 지배합니다.</p>
        </div>

        {/* 4. 직무/직급 (Job Roles) */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="profile-roles">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
              <Briefcase className="w-4 h-4 text-slate-600" />
              4. 직무 및 직급 분포 (Job Role)
            </h3>
            <div className="space-y-3">
              {roleDist.map(item => (
                <div key={item.name} className="flex flex-col">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-mono text-slate-900 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 mt-1">
                    <div className="bg-slate-400 h-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic mt-4">실수요자인 IT 및 개발 매니저 기여가 돋보입니다.</p>
        </div>

        {/* 5. 관심 제품별 분포 (Core Products) */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="profile-products">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
              <Cpu className="w-4 h-4 text-slate-600" />
              5. 주요 관심 제품 (Core Products)
            </h3>
            <div className="space-y-3">
              {productDist.map(item => (
                <div key={item.name} className="flex flex-col">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-mono text-slate-900 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 mt-1">
                    <div className="bg-[#f37321] h-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic mt-4">스마트 AI 카메라 및 VMS 결합 수요가 메인입니다.</p>
        </div>

        {/* 6. 주요 유입 매체 (Media Platform) */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="profile-platforms">
          <div>
            <h3 className="text-xs font-black text-[#1e293b] uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
              <Fingerprint className="w-4 h-4 text-slate-600" />
              6. 주요 유입 매체 (Media Platform)
            </h3>
            <div className="space-y-3">
              {platformDist.slice(0, 4).map(item => (
                <div key={item.name} className="flex flex-col">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 font-bold">{item.name}</span>
                    <span className="font-mono text-slate-900 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 mt-1">
                    <div className="bg-[#1e293b] h-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic mt-4">유기적 B2B 미디어 매널 효과가 탄탄합니다.</p>
        </div>

        {/* 7. 유입 캠페인 및 콘텐츠 */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="profile-campaigns">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
              <ShieldAlert className="w-4 h-4 text-slate-600" />
              7. 유입 캠페인 및 콘텐츠
            </h3>
            <div className="space-y-3">
              {campaignDist.slice(0, 3).map(item => (
                <div key={item.name} className="flex flex-col">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 truncate max-w-[150px]">{item.name}</span>
                    <span className="font-mono text-slate-900 font-bold shrink-0">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 mt-1">
                    <div className="bg-slate-400 h-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic mt-4">엑스포 참여 및 솔루션 세미나 영향도가 보입니다.</p>
        </div>

        {/* 8. 수주 성사 소요 기간 (Time to Close) */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between" id="profile-duration">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b pb-2">
              <CalendarRange className="w-4 h-4 text-slate-600" />
              8. 수주 성사 소요 기간 (Time)
            </h3>
            <div className="space-y-3">
              {durationDist.map(item => (
                <div key={item.name} className="flex flex-col">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-mono text-slate-950 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 mt-1">
                    <div className="bg-[#f37321] h-full" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic mt-4 font-sans">고가치 영업 기회 성사에는 평균 45일이 쇼요됩니다.</p>
        </div>

      </div>

    </div>
  );
}
