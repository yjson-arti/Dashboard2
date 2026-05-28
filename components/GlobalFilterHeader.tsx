import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES, PLATFORMS, INDUSTRIES, PRODUCTS, CAMPAIGNS } from '../constants';
import { useFilters } from '../contexts/FilterContext';
import { Sliders, RefreshCw, Layers, MapPin, MonitorPlay, FolderGit } from 'lucide-react';
import hanwhaLogo from '../src/assets/images/hanwha_logo_1779704652311.png';

const DropdownFilter = ({ 
  label, 
  options, 
  selected, 
  onChange,
  icon: Icon
}: { 
  label: string; 
  options: string[]; 
  selected: string[]; 
  onChange: (selected: string[]) => void;
  icon: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selected);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempSelected(selected);
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (!isOpen) {
      setTempSelected(selected);
      setSearchTerm('');
    }
    setIsOpen(!isOpen);
  };

  const handleApply = () => {
    onChange(tempSelected);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const toggleSelection = (option: string) => {
    setTempSelected(prev => 
      prev.includes(option) 
        ? prev.filter(c => c !== option)
        : [...prev, option]
    );
  };

  const isAllSelected = tempSelected.length === options.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setTempSelected([]);
    } else {
      setTempSelected(options);
    }
  };

  const filteredOptions = options.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
  const displayValue = selected.length === options.length ? '전체 선택' : selected.length === 1 ? selected[0] : `선택됨 (${selected.length})`;

  return (
    <div className="relative flex flex-col px-3 border-r border-slate-700/50 last:border-r-0" ref={dropdownRef}>
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3 text-[#f37321]" />}
        {label}
      </span>
      <button 
        onClick={handleOpen}
        className="w-44 h-8 bg-[#1e293b] border border-slate-700 text-[12px] text-left px-2.5 flex items-center justify-between text-slate-200 hover:border-[#f37321] transition-colors mt-1 rounded shadow-inner"
      >
        <span className="truncate font-medium">{displayValue}</span>
        <svg className="w-2.5 h-2.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-3 mt-1.5 w-52 bg-[#1e293b] border border-slate-700 shadow-2xl z-50 flex flex-col rounded overflow-hidden">
          <div className="p-2 border-b border-slate-800 bg-[#0f172a]">
            <input 
              type="text" 
              placeholder="검색어 입력..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 text-slate-200 px-2 py-1 text-xs outline-none focus:border-[#f37321] rounded"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-2 bg-[#0f172a] flex flex-col gap-1 custom-scrollbar">
            {searchTerm === '' && (
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1 rounded transition-colors text-slate-300">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={toggleAll}
                  className="rounded border-slate-700 text-[#f37321] focus:ring-[#f37321] bg-[#1e293b]"
                />
                <span className="text-xs font-semibold">(전체 선택)</span>
              </label>
            )}
            {filteredOptions.map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1 rounded transition-colors text-slate-300">
                <input 
                  type="checkbox" 
                  checked={tempSelected.includes(option)}
                  onChange={() => toggleSelection(option)}
                  className="rounded border-slate-700 text-[#f37321] focus:ring-[#f37321] bg-[#1e293b]"
                />
                <span className="text-xs truncate">{option}</span>
              </label>
            ))}
          </div>
          <div className="flex p-2 gap-2 bg-[#1e293b] border-t border-slate-800">
            <button 
              onClick={handleCancel}
              className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-bold transition-colors rounded"
            >
              취소
            </button>
            <button 
              onClick={handleApply}
              className="flex-1 py-1 bg-[#f37321] hover:bg-[#ff7900] text-white text-[11px] font-black transition-colors rounded"
            >
              적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function GlobalFilterHeader() {
  const { filters, setFilters } = useFilters();

  const handleReset = () => {
    setFilters({
      countries: COUNTRIES,
      platforms: PLATFORMS,
      industries: INDUSTRIES,
      products: PRODUCTS,
      campaigns: CAMPAIGNS,
    });
  };

  return (
    <div className="bg-[#0f172a] text-slate-100 border-b border-slate-800 sticky top-0 z-40 px-4 md:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
      
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        {/* Soft custom Hanwha amber logo box replaced with image */}
        <div className="w-14 h-14 bg-white flex items-center justify-center rounded overflow-hidden shadow-lg shadow-orange-950/20 p-1">
          <img 
            src={hanwhaLogo} 
            alt="Hanwha Logo" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <span className="text-[10px] text-[#f37321] font-black tracking-widest block uppercase">Hanwha Vision</span>
          <h1 className="text-sm font-black tracking-tight leading-none text-slate-50">글로벌 마케팅 및 CRM 통합 뷰어</h1>
        </div>
      </div>

      {/* Dynamic Filter Controls */}
      <div className="flex flex-wrap items-center bg-[#0f172a]/60 gap-1 md:gap-2">
        <DropdownFilter 
          label="통합 국가" 
          options={COUNTRIES} 
          selected={filters.countries} 
          onChange={(val) => setFilters(prev => ({ ...prev, countries: val }))}
          icon={MapPin}
        />
        <DropdownFilter 
          label="유입 매체" 
          options={PLATFORMS}
          selected={filters.platforms}
          onChange={(val) => setFilters(prev => ({ ...prev, platforms: val }))}
          icon={Layers}
        />
        <DropdownFilter 
          label="고객 산업군" 
          options={INDUSTRIES} 
          selected={filters.industries} 
          onChange={(val) => setFilters(prev => ({ ...prev, industries: val }))}
          icon={Sliders}
        />
        <DropdownFilter 
          label="관심 고유제품" 
          options={PRODUCTS} 
          selected={filters.products} 
          onChange={(val) => setFilters(prev => ({ ...prev, products: val }))}
          icon={MonitorPlay}
        />
        <DropdownFilter 
          label="운영 캠페인" 
          options={CAMPAIGNS} 
          selected={filters.campaigns} 
          onChange={(val) => setFilters(prev => ({ ...prev, campaigns: val }))}
          icon={FolderGit}
        />

        {/* Reset */}
        <button 
          onClick={handleReset}
          className="ml-3 p-2 bg-[#1e293b] border border-slate-700 hover:border-[#f37321] transition-colors rounded text-slate-400 hover:text-white"
          title="필터 초기화"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
