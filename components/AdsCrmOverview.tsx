import React, { useMemo } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { getFilteredLeads, calculateFunnel, LeadRecord } from '../services/crmMockData';
import { PLATFORMS, CAMPAIGNS } from '../constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { Landmark, Tv, Sparkles, Sliders, Eye, TrendingUp, Users, Target, Award, Coins } from 'lucide-react';

export default function AdsCrmOverview() {
  const { filters } = useFilters();

  const filteredLeads = useMemo(() => {
    return getFilteredLeads(filters);
  }, [filters]);

  const globalFunnel = useMemo(() => {
    return calculateFunnel(filteredLeads);
  }, [filteredLeads]);

  const mqlRate = globalFunnel.totalLead ? ((globalFunnel.mql / globalFunnel.totalLead) * 100).toFixed(1) : '0.0';
  const sqlRate = globalFunnel.mql ? ((globalFunnel.sql / globalFunnel.mql) * 100).toFixed(1) : '0.0';
  const closeRate = globalFunnel.totalLead ? ((globalFunnel.sales / globalFunnel.totalLead) * 100).toFixed(1) : '0.0';

  // 2-1. 유입 매체 별 리드 Funnel 데이터 (광고비 COST 및 SQL/Sales 전환율 연동 보정)
  const mediaFunnelData = useMemo(() => {
    // 7개 매체별 기본 광고비 디스크립션 (단위: 만원)
    const platformBaseCosts: Record<string, number> = {
      "링크드인": 480,       // 고단가 프리미엄 B2B 채널
      "구글 SA": 350,       // 고효율 고관여 검색광고
      "구글 AI MAX": 250,   // 인프라 타겟 미들 채널
      "구글 Pmax": 220,
      "구글 Demand gen": 160,
      "X": 180,             // 저단가 저관여 채널
      "FB": 820             // 고비용 저효율 매체 대표 (의도적으로 높은 비용 & 매우 낮은 전환율 시뮬레이션)
    };

    return PLATFORMS.map(plat => {
      const platLeads = filteredLeads.filter(l => l.platform === plat);
      const funnel = calculateFunnel(platLeads);
      
      const baseCost = platformBaseCosts[plat] || 150;
      // 페이스북(FB)과 X 채널은 리드 1건당 발생하는 마케팅 공수가 크고 허수가 많아 비용 가중치(multiplier)를 부여
      const multiplier = plat === "FB" ? 3.9 : (plat === "X" ? 2.1 : 0.8);
      const finalCost = Math.round(baseCost + (platLeads.length * multiplier));

      // SQL / Leads & Sales / Leads 기준 각각의 직관적 전환율 (%) 산출
      const sqlRate = platLeads.length ? ((funnel.sql / platLeads.length) * 100) : 0;
      const salesRate = platLeads.length ? ((funnel.sales / platLeads.length) * 100) : 0;
      
      // CPA (Cost per Lead) - 만원 단위 변환
      const cpa = platLeads.length ? (finalCost / platLeads.length).toFixed(1) : '0';

      return {
        media: plat,
        ...funnel,
        cost: finalCost,
        sqlRate: parseFloat(sqlRate.toFixed(1)),
        salesRate: parseFloat(salesRate.toFixed(1)),
        cpa
      };
    });
  }, [filteredLeads]);

  // 2-2. 캠페인/프로모션/컨텐츠 별 Funnel 데이터
  const campaignFunnelData = useMemo(() => {
    return CAMPAIGNS.map(camp => {
      const campLeads = filteredLeads.filter(l => l.campaign === camp);
      return {
        campaign: camp,
        ...calculateFunnel(campLeads)
      };
    });
  }, [filteredLeads]);

  // Transform media funnel to chart format
  const mediaChartData = useMemo(() => {
    return mediaFunnelData.map(d => ({
      name: d.media,
      '광고비 (만원)': d.cost,
      '획득 리드': d.totalLead,
      'SQL 전환율 (%)': d.sqlRate,
      'Sales 전환율 (%)': d.salesRate,
      'CPA (만원)': parseFloat(d.cpa)
    }));
  }, [mediaFunnelData]);

  // Best performing, highest spending, and highest conversion marketing channels
  const marketingInsights = useMemo(() => {
    let maxCost = -1;
    let maxCostMedia = "-";
    
    let maxLeads = -1;
    let maxLeadsMedia = "-";
    
    let maxSalesRate = -1;
    let maxSalesRateMedia = "-";
    
    mediaFunnelData.forEach(d => {
      // 1. 최대 광고 소진 매체
      if (d.cost > maxCost) {
        maxCost = d.cost;
        maxCostMedia = d.media;
      }
      
      // 2. 최대 리드 획득 매체
      if (d.totalLead > maxLeads) {
        maxLeads = d.totalLead;
        maxLeadsMedia = d.media;
      }
      
      // 3. 최고 리드 전환율 (Sales / Leads)
      if (d.salesRate > maxSalesRate) {
        maxSalesRate = d.salesRate;
        maxSalesRateMedia = d.media;
      }
    });

    return {
      maxCost: { name: maxCostMedia, cost: maxCost },
      maxLeads: { name: maxLeadsMedia, leads: maxLeads },
      maxSalesRate: { name: maxSalesRateMedia, rate: maxSalesRate.toFixed(1) }
    };
  }, [mediaFunnelData]);

  // 1-4. 주별 광고 집행 및 리드 획득 트렌드 데이터 (자연스러운 캠페일 사이클 편차 구조 정렬)
  const weeklyAdStats = useMemo(() => {
    const weeks = Array.from({ length: 12 }, (_, i) => {
      const weekLabel = `${i + 1}주차`;
      return {
        week: weekLabel,
        totalLead: 0,
      };
    });

    const NORMAL_BOUNDARIES = [4, 16, 32, 40, 43, 57, 75, 80, 82, 92, 97, 100];

    filteredLeads.forEach(lead => {
      const match = lead.id.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10);
        
        // 고유 ID의 하이브리드 해싱을 통한 결정론적 편차 부여 (CRM 전체 통계와 한쌍으로 싱크)
        const hashVal = (num * 17) % 100;
        let weekIndex = NORMAL_BOUNDARIES.findIndex(b => hashVal < b);
        if (weekIndex === -1) weekIndex = 11;

        weeks[weekIndex].totalLead++;
      }
    });

    return weeks.map((w, idx) => {
      // Calculate simulated ad spend based on lead volume with realistic platform costs
      const baseCost = 150 + (idx % 4) * 45 + w.totalLead * 15;
      return {
        name: w.week,
        '획득 리드': w.totalLead,
        '광고 Cost (만원)': Math.round(baseCost),
      };
    });
  }, [filteredLeads]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Target Funnel Summary Widget Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col justify-between" id="ads-kpi-leads">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight font-sans">전체 유입 리드</span>
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900 font-sans">{globalFunnel.totalLead.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">상담 및 문의 인원</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col justify-between" id="ads-kpi-mql">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight font-sans">MQL 유효 리드</span>
            <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900 font-sans">{globalFunnel.mql.toLocaleString()}</span>
            <span className="text-[10px] text-orange-600 font-bold block mt-0.5 font-sans">전환율 {mqlRate}%</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col justify-between" id="ads-kpi-sql">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight font-sans">SQL 영업 유효</span>
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900 font-sans">{globalFunnel.sql.toLocaleString()}</span>
            <span className="text-[10px] text-blue-600 font-bold block mt-0.5 font-sans">MQL 대비 {sqlRate}%</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col justify-between" id="ads-kpi-opp">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight font-sans">OPPORTUNITY (견적/매칭)</span>
            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900 font-sans">{globalFunnel.opportunity.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">실제 견적 발송 및 상담</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs col-span-2 md:col-span-1 flex flex-col justify-between" id="ads-kpi-sales">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight font-sans">SALES 최종 전환수</span>
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900 font-sans">{globalFunnel.sales.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5 font-sans">종합 성사율 {closeRate}%</span>
          </div>
        </div>
      </div>

      {/* Top Marketing Insights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 최대 광고 소진 매체 */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 flex items-center justify-center text-rose-600 rounded">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">최대 광고 소진 매체</div>
            <div className="text-lg font-black text-slate-900 mt-1">{marketingInsights.maxCost.name}</div>
            <div className="text-xs text-rose-600 font-bold mt-0.5">총 {marketingInsights.maxCost.cost.toLocaleString()}만원 소진</div>
          </div>
        </div>

        {/* Card 2: 최대 리드 획득 매체 */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 flex items-center justify-center text-orange-600 rounded">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">최대 리드 획득 매체</div>
            <div className="text-lg font-black text-slate-900 mt-1">{marketingInsights.maxLeads.name}</div>
            <div className="text-xs text-orange-600 font-bold mt-0.5">총 {marketingInsights.maxLeads.leads.toLocaleString()}건 리드 획득</div>
          </div>
        </div>

        {/* Card 3: 최고 리드 전환율 */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 flex items-center justify-center text-blue-600 rounded">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">최고 리드 전환율 (Sales/Leads)</div>
            <div className="text-lg flex items-baseline gap-1 mt-1 font-black text-slate-900">
              {marketingInsights.maxSalesRate.name} <span className="text-xs font-bold text-blue-600">({marketingInsights.maxSalesRate.rate}%)</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">리드 유입 대비 최종 수주력 우수</span>
          </div>
        </div>
      </div>

      {/* 주별 광고 집행 및 리드 획득 트렌드 (광고 Cost & 획득 리드수) */}
      <div className="bg-white p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b pb-2">
          <span className="w-1.5 h-3 bg-[#f37321]"></span>
          주별 광고 집행 금액 및 리드 획득 트렌드 (Weekly Spend & Acquired Leads)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyAdStats} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <YAxis yAxisId="left" stroke="#1e293b" tick={{ fontSize: 10 }} label={{ value: '획득 리드 수 (건)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#1e293b', fontWeight: 'bold' } }} />
              <YAxis yAxisId="right" orientation="right" stroke="#f37321" tick={{ fontSize: 10 }} label={{ value: '광고 Cost (만원)', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#f37321', fontWeight: 'bold' } }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', color: '#fff' }}
                labelStyle={{ fontWeight: 'bold', fontSize: 11, color: '#f37321' }}
                itemStyle={{ fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="right" dataKey="광고 Cost (만원)" fill="#fed7aa" stroke="#f37321" strokeWidth={1} name="광고 Cost (만원)" barSize={28} />
              <Line yAxisId="left" type="monotone" dataKey="획득 리드" stroke="#1e293b" strokeWidth={3} activeDot={{ r: 6 }} name="획득 리드 수 (건)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-1. 유입 매체 별 리드 Funnel & 광고비 ROI 분석 Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="media-efficiency-split-charts">
        {/* Chart A: 매체별 광고비 대비 리드 획득 수 (Cost-to-Leads Gap) */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col mb-4">
            <span className="text-[10px] text-orange-600 font-extrabold tracking-widest uppercase">Chart A • Budget efficiency</span>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-3 bg-[#f37321]"></span>
              매체별 광고 집행 금액 및 리드 획득 성과
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mediaChartData} margin={{ top: 15, right: 10, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 9 }} label={{ value: '집행 광고비 (만원)', angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: '#64748b', fontWeight: 'bold' } }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f37321" tick={{ fontSize: 9 }} label={{ value: '획득 리드 수 (건)', angle: 90, position: 'insideRight', style: { fontSize: 9, fill: '#f37321', fontWeight: 'bold' } }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', color: '#fff', fontSize: 11 }}
                  labelStyle={{ fontWeight: 'bold', color: '#f37321' }}
                />
                <Legend wrapperStyle={{ fontSize: 10, pt: 10 }} />
                <Bar yAxisId="left" dataKey="광고비 (만원)" fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1} name="광고비 (만원)" barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="획득 리드" stroke="#f37321" strokeWidth={3} activeDot={{ r: 5 }} name="획득 리드 수 (건)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: 매체별 CRM 핵심 전환율 비교 (SQL & Sales 전환율) */}
        <div className="bg-white p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col mb-4">
            <span className="text-[10px] text-blue-600 font-extrabold tracking-widest uppercase">Chart B • Funnel Quality</span>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-3 bg-blue-600"></span>
              매체별 SQL 가공률 및 최종 Sales 수주율 (%)
            </h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mediaChartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 9 }} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', color: '#fff', fontSize: 11 }}
                  labelStyle={{ fontWeight: 'bold', color: '#60a5fa' }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="SQL 전환율 (%)" fill="#93c5fd" name="SQL 전환율 (%)" barSize={14} />
                <Bar dataKey="Sales 전환율 (%)" fill="#f37321" name="Sales 전환율 (%)" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="bg-white border border-slate-200 shadow-xs overflow-hidden" id="media-funnel-status-table">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-[#1e293b]"></span>
            2-1. 유입 매체 별 리드 Funnel & 광고 ROI 종합 성적표
          </h3>
          <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded font-black">CPA, SQL%, Sales% 연동</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-black">
              <tr>
                <th className="px-4 py-3 pl-6">매체 구분</th>
                <th className="px-3 py-3 text-center">집행 광고비 (Cost)</th>
                <th className="px-3 py-3 text-center">원형 리드 (Leads)</th>
                <th className="px-3 py-3 text-center">당 평균단가 (CPA)</th>
                <th className="px-3 py-3 text-center">MQL</th>
                <th className="px-3 py-3 text-center">SQL 가공수 (전환율)</th>
                <th className="px-3 py-3 text-center">B2B 기회 (Opportunity)</th>
                <th className="px-4 py-3 text-right pr-6 md:min-w-[140px]">Sales 수주 (최종 전환율)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mediaFunnelData.map((row) => {
                const platSalesRate = row.totalLead ? ((row.sales / row.totalLead) * 100).toFixed(1) : '0.0';
                const isUnderperforming = row.media === "FB" || row.media === "X";
                return (
                  <tr key={row.media} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 pl-6 font-bold text-slate-900 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isUnderperforming ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                      {row.media}
                    </td>
                    <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-800">{row.cost.toLocaleString()} 만원</td>
                    <td className="px-3 py-3.5 text-center text-slate-600 font-mono font-medium">{row.totalLead} 건</td>
                    <td className={`px-3 py-3.5 text-center font-mono font-bold ${isUnderperforming ? 'text-rose-600' : 'text-slate-500'}`}>
                      {row.cpa} 만원
                    </td>
                    <td className="px-3 py-3.5 text-center text-slate-500 font-mono">{row.mql}</td>
                    <td className="px-3 py-3.5 text-center text-slate-705">
                      <span className="font-semibold">{row.sql}</span>
                      <span className="text-[10px] text-blue-600 font-bold ml-1">({row.sqlRate}%)</span>
                    </td>
                    <td className="px-3 py-3.5 text-center text-slate-600 font-mono">{row.opportunity}</td>
                    <td className="px-4 py-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-extrabold font-mono text-slate-900">{row.sales}건</span>
                        <span className={`font-black font-mono text-[11px] px-1.5 py-0.5 rounded ${parseFloat(platSalesRate) >= 10 ? 'bg-emerald-100 text-emerald-800' : (parseFloat(platSalesRate) < 2 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600')}`}>
                          {platSalesRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2-2. 캠페인/ 프로모션/ 콘텐츠 별 Funnel 현황 */}
      <section className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-[#f37321]"></span>
            2-2. 캠페인/ 프로모션/ 콘텐츠 별 Funnel 현황
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-black">
              <tr>
                <th className="px-4 py-3 pl-6">활성 캠페인 및 콘텐츠명</th>
                <th className="px-3 py-3 text-center">전체 리드 (Leads)</th>
                <th className="px-3 py-3 text-center">MQL (마케팅 유효)</th>
                <th className="px-3 py-3 text-center">SQL (영업 유망)</th>
                <th className="px-3 py-3 text-center">Opportunity</th>
                <th className="px-3 py-3 text-center">Sales (계약 계약)</th>
                <th className="px-4 py-3 text-right pr-6 min-w-[130px]">최종 수주률 (Sales/Leads)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaignFunnelData.map((row) => {
                const cmpSalesRate = row.totalLead ? ((row.sales / row.totalLead) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={row.campaign} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 pl-6 font-bold text-slate-900">{row.campaign}</td>
                    <td className="px-3 py-3.5 text-center text-slate-600">{row.totalLead}</td>
                    <td className="px-3 py-3.5 text-center text-slate-500">{row.mql}</td>
                    <td className="px-3 py-3.5 text-center font-semibold text-slate-700">{row.sql}</td>
                    <td className="px-3 py-3.5 text-center text-slate-600">{row.opportunity}</td>
                    <td className="px-3 py-3.5 text-center font-extrabold text-slate-900">{row.sales}</td>
                    <td className="px-4 py-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-250 h-1.5 rounded-full overflow-hidden shrink-0">
                          <div className="bg-indigo-700 h-full" style={{ width: `${Math.min(100, parseFloat(cmpSalesRate) * 5)}%` }}></div>
                        </div>
                        <span className="font-extrabold text-[11px] text-indigo-700 w-10 text-right">{cmpSalesRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
