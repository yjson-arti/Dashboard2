import React, { useState, useMemo } from 'react';
import { 
  Download, 
  TrendingUp, 
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';
import { FilterProvider, useFilters } from './contexts/FilterContext';
import { getFilteredLeads, calculateFunnel } from './services/crmMockData';

import GlobalFilterHeader from './components/GlobalFilterHeader';
import TotalCrmOverview from './components/TotalCrmOverview';
import AdsCrmOverview from './components/AdsCrmOverview';
import HighValueProfiling from './components/HighValueProfiling';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'totals' | 'ads' | 'highValue'>('ads');
  const { filters } = useFilters();

  // Calculated active filtered leads count
  const filteredRecords = useMemo(() => {
    return getFilteredLeads(filters);
  }, [filters]);

  const globalFunnel = useMemo(() => {
    return calculateFunnel(filteredRecords);
  }, [filteredRecords]);

  const handleExportMockData = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredRecords, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `HanwhaVision_CRM_Export_2026.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-orange-250 selection:text-orange-900 pb-16">
      
      {/* Sticky Global Top Filter Rail */}
      <GlobalFilterHeader />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        
        {/* Hanwha Vision Brand Hero Header */}
        <header className="mb-6 bg-white border border-slate-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-[#f37321] tracking-widest uppercase">
              <span className="w-2 h-2 bg-[#f37321] rounded-full animate-ping"></span>
              HANWHA VISION INTEGRATED CRM MOCK-UP
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
              한화비전 마케팅 통합 대시보드
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">국가별 분산 릴리즈 데이터, 유입 매체 퍼포먼스 및 이탈 프로파일을 관장하는 CRM 분석 제어 타워입니다.</p>
          </div>

          {/* Quick Action Rails */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportMockData}
              className="px-3 py-1.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3" />
              JSON 데이터 내보내기
            </button>
          </div>
        </header>

        {/* Major Dashboard Tabs (4 Views conforming strictly to user instruction) */}
        <div className="flex flex-wrap border-b border-slate-200 mb-6 gap-1 md:gap-2">
          <button 
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-2.5 text-xs font-bold transition-all relative top-[1px] flex items-center gap-2 z-10 ${
              activeTab === 'ads' 
                ? 'border-b-2 border-[#f37321] text-slate-900 font-black' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            1. 광고 CRM audience Overview
          </button>

          <button 
            onClick={() => setActiveTab('totals')}
            className={`px-4 py-2.5 text-xs font-bold transition-all relative top-[1px] flex items-center gap-2 z-10 ${
              activeTab === 'totals' 
                ? 'border-b-2 border-[#f37321] text-slate-900 font-black' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            2. Total CRM Audience Overview
          </button>

          <button 
            onClick={() => setActiveTab('highValue')}
            className={`px-4 py-2.5 text-xs font-bold transition-all relative top-[1px] flex items-center gap-2 z-10 ${
              activeTab === 'highValue' 
                ? 'border-b-2 border-[#f37321] text-slate-900 font-black' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            3. Sales / Opportunity 고가치 분석
          </button>
        </div>

        {/* Tab Components */}
        <div className="bg-slate-50 p-2 md:p-1.5">
          {activeTab === 'totals' && <TotalCrmOverview />}
          {activeTab === 'ads' && <AdsCrmOverview />}
          {activeTab === 'highValue' && <HighValueProfiling />}
        </div>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <FilterProvider>
      <AppContent />
    </FilterProvider>
  );
}
