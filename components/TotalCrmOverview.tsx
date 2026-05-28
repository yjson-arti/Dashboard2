import React, { useMemo } from 'react';
import { useFilters } from '../contexts/FilterContext';
import { getFilteredLeads, calculateFunnel, LeadRecord } from '../services/crmMockData';
import { COUNTRIES, INDUSTRIES, PRODUCTS } from '../constants';
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
  Line
} from 'recharts';
import { Eye, TrendingUp, Users, Target, Award } from 'lucide-react';

export default function TotalCrmOverview() {
  const { filters } = useFilters();

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return getFilteredLeads(filters);
  }, [filters]);

  // Aggregate global funnel
  const globalFunnel = useMemo(() => {
    return calculateFunnel(filteredLeads);
  }, [filteredLeads]);

  // 1-1. 국가별 리드 Funnel 현황
  const countryFunnelData = useMemo(() => {
    return COUNTRIES.map(country => {
      const countryLeads = filteredLeads.filter(l => l.country === country);
      return {
        country,
        ...calculateFunnel(countryLeads)
      };
    });
  }, [filteredLeads]);

  // 1-2. 산업군 리드 Funnel 현황
  const industryFunnelData = useMemo(() => {
    return INDUSTRIES.map(ind => {
      const indLeads = filteredLeads.filter(l => l.industry === ind);
      return {
        industry: ind,
        ...calculateFunnel(indLeads)
      };
    });
  }, [filteredLeads]);

  // 1-3. 관심 제품 리드 Funnel 현황
  const productFunnelData = useMemo(() => {
    return PRODUCTS.map(prod => {
      const prodLeads = filteredLeads.filter(l => l.product === prod);
      return {
        product: prod,
        ...calculateFunnel(prodLeads)
      };
    });
  }, [filteredLeads]);

  // Global percentages
  const mqlRate = globalFunnel.totalLead ? ((globalFunnel.mql / globalFunnel.totalLead) * 100).toFixed(1) : '0.0';
  const sqlRate = globalFunnel.mql ? ((globalFunnel.sql / globalFunnel.mql) * 100).toFixed(1) : '0.0';
  const closeRate = globalFunnel.totalLead ? ((globalFunnel.sales / globalFunnel.totalLead) * 100).toFixed(1) : '0.0';

  // 1-4. 주별 획득 리드 및 Sales 전환율 트렌드 데이터 (주별 광고/마케팅 편차 및 최종 전환율 연동 보정)
  const weeklyStats = useMemo(() => {
    // 1~12번 주 시뮬레이션
    const weeks = Array.from({ length: 12 }, (_, i) => {
      const weekLabel = `${i + 1}주차`;
      return {
        week: weekLabel,
        totalLead: 0,
        sales: 0,
      };
    });

    // 주별 모객 성과 분포를 자연스러운 캠페인 사이클(피크와 계곡)대로 구현하기 위해 경계선 설정
    // 기본형과 세일즈 성사군에 약간의 편차 필터를 주어 전환율 추이가 리드 유입 흐름에 양의 상관관계를 갖도록 비례 매핑
    const NORMAL_BOUNDARIES = [4, 16, 32, 40, 43, 57, 75, 80, 82, 92, 97, 100];
    const SALES_BOUNDARIES  = [2, 16, 38, 44, 45, 61, 85, 88, 89, 98, 99, 100];

    filteredLeads.forEach(lead => {
      const match = lead.id.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10);
        const isSales = lead.finalStage === 'Sales';
        
        // 고유 ID의 하이브리드 해싱을 통한 결정론적 편차 부여
        const hashVal = (num * 17) % 100;
        let weekIndex = 0;
        
        if (isSales) {
          weekIndex = SALES_BOUNDARIES.findIndex(b => hashVal < b);
        } else {
          weekIndex = NORMAL_BOUNDARIES.findIndex(b => hashVal < b);
        }
        
        if (weekIndex === -1) weekIndex = 11;

        weeks[weekIndex].totalLead++;
        if (isSales) {
          weeks[weekIndex].sales++;
        }
      }
    });

    return weeks.map(w => {
      const rate = w.totalLead ? ((w.sales / w.totalLead) * 100).toFixed(1) : '0.0';
      return {
        name: w.week,
        '획득 리드': w.totalLead,
        'Sales 전환율 (%)': parseFloat(rate)
      };
    });
  }, [filteredLeads]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Target Funnel Summary Widget Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col justify-between" id="kpi-leads">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">전체 유입 리드</span>
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-slate-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900">{globalFunnel.totalLead.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">상담 및 문의 인원</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col justify-between" id="kpi-mql">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">MQL 유효 리드</span>
            <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900">{globalFunnel.mql.toLocaleString()}</span>
            <span className="text-[10px] text-orange-600 font-bold block mt-0.5">전환율 {mqlRate}%</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col justify-between" id="kpi-sql">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">SQL 영업 유효</span>
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900">{globalFunnel.sql.toLocaleString()}</span>
            <span className="text-[10px] text-blue-600 font-bold block mt-0.5">MQL 대비 {sqlRate}%</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-col justify-between" id="kpi-opp">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">Opportunity (견적/매칭)</span>
            <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900">{globalFunnel.opportunity.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">실제 견적 발송 및 상담</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 shadow-xs col-span-2 md:col-span-1 flex flex-col justify-between" id="kpi-sales">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">Sales 최종 전환수</span>
            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-900">{globalFunnel.sales.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">종합 성사율 {closeRate}%</span>
          </div>
        </div>
      </div>

      {/* Weekly Trend Line Chart */}
      <div className="bg-white p-5 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b pb-2">
          <span className="w-1.5 h-3 bg-[#f37321]"></span>
          주별 리드 획득 및 Sales 최종 전환율 트렌드 (Weekly Acquired Leads & Sales Conversion Rate)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyStats} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <YAxis yAxisId="left" stroke="#1e293b" tick={{ fontSize: 10 }} label={{ value: '획득 리드 수 (건)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#1e293b', fontWeight: 'bold' } }} />
              <YAxis yAxisId="right" orientation="right" stroke="#f37321" tick={{ fontSize: 10 }} label={{ value: 'Sales 전환율 (%)', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#f37321', fontWeight: 'bold' } }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '4px', color: '#fff' }}
                labelStyle={{ fontWeight: 'bold', fontSize: 11, color: '#f37321' }}
                itemStyle={{ fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="획득 리드" stroke="#1e293b" strokeWidth={3} activeDot={{ r: 6 }} name="주별 획득 리드 (건)" />
              <Line yAxisId="right" type="monotone" dataKey="Sales 전환율 (%)" stroke="#f37321" strokeWidth={3} dot={{ r: 4 }} name="Sales 전환율 (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 1-1. 국가별 리드 funnel 현황 */}
      <section className="bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-[#1e293b]"></span>
            1-1. 국가별 리드 Funnel 현황 (Lead Funnel by Country)
          </h3>
          <span className="text-[10px] text-slate-400 italic">정렬: 가용 볼륨 순</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-800">
            <thead className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-500 uppercase font-black">
              <tr>
                <th className="px-4 py-3 pl-6">경로 / 국가</th>
                <th className="px-3 py-3 text-center">전체 리드 (Lead)</th>
                <th className="px-3 py-3 text-center">MQL (마케팅 유효)</th>
                <th className="px-3 py-3 text-center">SQL (영업 유효)</th>
                <th className="px-3 py-3 text-center">Opportunity (기회)</th>
                <th className="px-3 py-3 text-center">Sales (세일즈 성사)</th>
                <th className="px-4 py-3 text-right pr-6 min-w-[130px]">최종 전환률 (Sales/Lead)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {countryFunnelData.map((row) => {
                const rowRate = row.totalLead ? ((row.sales / row.totalLead) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={row.country} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 pl-6 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      {row.country}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-slate-700">{row.totalLead.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{row.mql.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{row.sql.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center text-slate-600">{row.opportunity.toLocaleString()}</td>
                    <td className="px-3 py-3 text-center font-bold text-slate-900">{row.sales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden shrink-0">
                          <div className="bg-[#f37321] h-full" style={{ width: `${Math.min(100, parseFloat(rowRate) * 4)}%` }}></div>
                        </div>
                        <span className="font-extrabold text-[11px] text-[#f37321] w-10 text-right">{rowRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 1-2 & 1-3. 산업군 / 관심 제품 리드 Funnel 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1-2. 산업군 리드 Funnel */}
        <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-[#f37321]"></span>
              1-2. 산업군 리드 Funnel 현황
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-[9px] text-slate-500 uppercase font-black">
                <tr>
                  <th className="px-3 py-2 pl-4">산업군</th>
                  <th className="px-2 py-2 text-center">전체 리드</th>
                  <th className="px-2 py-2 text-center">SQL</th>
                  <th className="px-2 py-2 text-center">Sales</th>
                  <th className="px-3 py-2 text-right pr-4">전체 전환률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {industryFunnelData.map((row) => {
                  const rate = row.totalLead ? ((row.sales / row.totalLead) * 100).toFixed(1) : '0';
                  return (
                    <tr key={row.industry} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 pl-4 font-bold text-slate-800 truncate max-w-[150px]">{row.industry}</td>
                      <td className="px-2 py-2.5 text-center text-slate-600">{row.totalLead}</td>
                      <td className="px-2 py-2.5 text-center text-slate-600">{row.sql}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-slate-900">{row.sales}</td>
                      <td className="px-3 py-2.5 text-right pr-4 font-black text-[#f37321]">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 1-3. 관심 제품 리드 Funnel */}
        <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-indigo-700"></span>
              1-3. 관심 제품 리드 Funnel 현황
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-[9px] text-slate-500 uppercase font-black">
                <tr>
                  <th className="px-3 py-2 pl-4">관심 제품</th>
                  <th className="px-2 py-2 text-center">전체 리드</th>
                  <th className="px-2 py-2 text-center">SQL</th>
                  <th className="px-2 py-2 text-center">Sales</th>
                  <th className="px-3 py-2 text-right pr-4">전체 전환률</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productFunnelData.map((row) => {
                  const rate = row.totalLead ? ((row.sales / row.totalLead) * 100).toFixed(1) : '0';
                  return (
                    <tr key={row.product} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 pl-4 font-bold text-slate-800 truncate max-w-[150px]">{row.product}</td>
                      <td className="px-2 py-2.5 text-center text-slate-600">{row.totalLead}</td>
                      <td className="px-2 py-2.5 text-center text-slate-600">{row.sql}</td>
                      <td className="px-2 py-2.5 text-center font-bold text-slate-900">{row.sales}</td>
                      <td className="px-3 py-2.5 text-right pr-4 font-black text-indigo-700">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
