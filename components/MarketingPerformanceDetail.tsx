import React, { useMemo } from 'react';
import { CAMPAIGNS, CUSTOMER_TYPES, CONTENTS_OPTIONS } from '../constants';
import { useFilters } from '../contexts/FilterContext';

// Types
interface MetricValue {
  main: string;
  change: string;
  isPositive: boolean;
}

interface DetailRow {
  id: string;
  subsidiary: string;
  country: string;
  objective: string;
  channel: string;
  platform: string;
  campaign: string;
  customerType: string;
  contents: string;
  spend: MetricValue;
  // Core Volume KPI
  impressions: MetricValue;
  engagement: MetricValue;
  views50: MetricValue;
  clicks: MetricValue;
  views75: MetricValue;
  platformRevenue: MetricValue;
  eStoreRevenue: MetricValue;
  // Effectiveness KPI
  ctr: MetricValue;
  vtr50: MetricValue;
  vtr75: MetricValue;
  // Efficiency KPI
  cpm: MetricValue;
  cpe: MetricValue;
  cpc: MetricValue;
  cpv50: MetricValue;
  cpv75: MetricValue;
  platformRoas: MetricValue;
  eStoreRoas: MetricValue;
  
  rowType: 'grand_total' | 'subsidiary' | 'country' | 'objective' | 'channel' | 'data';
}

// Helper to generate random metric
const genMetric = (base: number, format: 'currency' | 'number' | 'percent' | 'decimal', isPositiveChance = 0.5): MetricValue => {
  const isPositive = Math.random() > isPositiveChance;
  const changeVal = (Math.random() * 50 + 0.1).toFixed(1);
  const changeStr = `${isPositive ? '+' : '-'}${changeVal}%`;
  
  let mainStr = '';
  if (format === 'currency') {
    if (base >= 1000000000) mainStr = `$ ${(base / 1000000000).toFixed(1)}B`;
    else if (base >= 1000000) mainStr = `$ ${(base / 1000000).toFixed(1)}M`;
    else if (base >= 1000) mainStr = `$ ${(base / 1000).toFixed(1)}K`;
    else mainStr = `$ ${base.toFixed(2)}`;
  } else if (format === 'number') {
    if (base >= 1000000000) mainStr = `${(base / 1000000000).toFixed(1)}B`;
    else if (base >= 1000000) mainStr = `${(base / 1000000).toFixed(1)}M`;
    else if (base >= 1000) mainStr = `${(base / 1000).toFixed(1)}K`;
    else mainStr = `${base.toFixed(0)}`;
  } else if (format === 'percent') {
    mainStr = `${base.toFixed(2)}%`;
  } else if (format === 'decimal') {
    mainStr = `${base.toFixed(2)}`;
  }

  return {
    main: mainStr,
    change: changeStr,
    isPositive
  };
};

const CHANNEL_PLATFORM_MAP: Record<string, string[]> = {
  "SEARCH": ["GOOGLE ADS", "BING", "SA360"],
  "PMAX": ["GOOGLE ADS"],
  "DISPLAY": ["APEX", "TTD", "DV360", "DIRECT", "YAHOO", "AMAZON", "INDEPENDENT"],
  "SOCIAL": ["META", "TIKTOK", "LINKEDIN", "PINTEREST", "REDDIT", "SNAPCHAT", "X"],
  "VIDEO": ["GOOGLE ADS", "META", "TIKTOK", "DV360"],
  "AUDIO": ["SPOTIFY"],
  "CTV": ["DV360", "TTD", "DIRECT"],
  "OTHERS": ["INDEPENDENT", "DIRECT"]
};

const genFullMetrics = (baseSpend: number) => {
  return {
    spend: genMetric(baseSpend, 'currency', 0.5),
    impressions: genMetric(baseSpend * 100, 'number', 0.5),
    engagement: genMetric(baseSpend * 5, 'number', 0.5),
    views50: genMetric(baseSpend * 10, 'number', 0.5),
    clicks: genMetric(baseSpend * 2, 'number', 0.5),
    views75: genMetric(baseSpend * 8, 'number', 0.5),
    platformRevenue: genMetric(baseSpend * 3, 'currency', 0.5),
    eStoreRevenue: genMetric(baseSpend * 0.5, 'currency', 0.5),
    ctr: genMetric(Math.random() * 2 + 0.1, 'percent', 0.5),
    vtr50: genMetric(Math.random() * 15 + 5, 'percent', 0.5),
    vtr75: genMetric(Math.random() * 10 + 2, 'percent', 0.5),
    cpm: genMetric(Math.random() * 15 + 2, 'currency', 0.5),
    cpe: genMetric(Math.random() * 0.5 + 0.01, 'currency', 0.5),
    cpc: genMetric(Math.random() * 3 + 0.5, 'currency', 0.5),
    cpv50: genMetric(Math.random() * 0.2 + 0.01, 'currency', 0.5),
    cpv75: genMetric(Math.random() * 0.3 + 0.02, 'currency', 0.5),
    platformRoas: genMetric(Math.random() * 5 + 1, 'decimal', 0.5),
    eStoreRoas: genMetric(Math.random() * 2 + 0.1, 'decimal', 0.5),
  };
};

const generateMockData = (): DetailRow[] => {
  const rows: DetailRow[] = [];
  
  // Grand Total
  rows.push({
    id: 'gt',
    subsidiary: 'Grand Total', country: '', objective: '', channel: '', platform: '', campaign: '', customerType: '', contents: '',
    ...genFullMetrics(161400000),
    rowType: 'grand_total'
  });

  const subsidiaries = [
    { name: 'SEA', countries: ['UNITED STATES', 'CANADA'] },
    { name: 'Europe', countries: ['UNITED KINGDOM', 'GERMANY'] }
  ];

  const objectives = ['Awareness', 'Consideration', 'Conversion'];

  let idCounter = 0;

  subsidiaries.forEach(sub => {
    rows.push({
      id: `sub_${idCounter++}`,
      subsidiary: sub.name, country: '', objective: '', channel: '', platform: '', campaign: '', customerType: '', contents: '',
      ...genFullMetrics(80000000),
      rowType: 'subsidiary'
    });

    sub.countries.forEach(country => {
      rows.push({
        id: `cnt_${idCounter++}`,
        subsidiary: '', country: country, objective: '', channel: '', platform: '', campaign: '', customerType: '', contents: '',
        ...genFullMetrics(40000000),
        rowType: 'country'
      });

      objectives.forEach(obj => {
        rows.push({
          id: `obj_${idCounter++}`,
          subsidiary: '', country: '', objective: obj, channel: '', platform: '', campaign: '', customerType: '', contents: '',
          ...genFullMetrics(13000000),
          rowType: 'objective'
        });

        // Pick 3 random channels for this objective
        const availableChannels = Object.keys(CHANNEL_PLATFORM_MAP);
        const shuffledChannels = [...availableChannels].sort(() => 0.5 - Math.random()).slice(0, 3);
        
        shuffledChannels.forEach(channel => {
          rows.push({
            id: `chn_${idCounter++}`,
            subsidiary: '', country: '', objective: '', channel: channel, platform: '', campaign: '', customerType: '', contents: '',
            ...genFullMetrics(4000000),
            rowType: 'channel'
          });

          // Pick 1-2 random platforms for this channel from the map
          const availablePlatforms = CHANNEL_PLATFORM_MAP[channel];
          const numPlatforms = Math.min(availablePlatforms.length, Math.floor(Math.random() * 2) + 1);
          const shuffledPlatforms = [...availablePlatforms].sort(() => 0.5 - Math.random()).slice(0, numPlatforms);

          shuffledPlatforms.forEach(platform => {
            // Pick 2 random customer types
            const shuffledCustTypes = [...CUSTOMER_TYPES].sort(() => 0.5 - Math.random()).slice(0, 2);

            // Force injection for SEA to ensure plenty of examples
            if (sub.name === 'SEA') {
              if (!shuffledCustTypes.includes("New Customer")) {
                shuffledCustTypes.push("New Customer");
              }
            }

            shuffledCustTypes.forEach(custType => {
              // Pick 1 random content and campaign
              let content = CONTENTS_OPTIONS[Math.floor(Math.random() * CONTENTS_OPTIONS.length)];
              
              // Force Paradigm_Portrait for SEA + New Customer
              if (sub.name === 'SEA' && custType === 'New Customer') {
                content = "Paradigm_Portrait";
              }

              const campaign = CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)];

              rows.push({
                id: `dat_${idCounter++}`,
                subsidiary: sub.name, country: country, objective: obj, channel: channel, platform: platform, campaign: campaign, customerType: custType, contents: content,
                ...genFullMetrics(500000),
                rowType: 'data'
              });
            });
          });
        });
      });
    });
  });

  // Add NULL channel at the very bottom
  rows.push({
    id: `chn_${idCounter++}`,
    subsidiary: '', country: '', objective: '', channel: 'NULL', platform: '', campaign: '', customerType: '', contents: '',
    ...genFullMetrics(1000000),
    rowType: 'channel'
  });

  const nullCustTypes = [...CUSTOMER_TYPES].sort(() => 0.5 - Math.random()).slice(0, 2);
  nullCustTypes.forEach(custType => {
    const content = CONTENTS_OPTIONS[Math.floor(Math.random() * CONTENTS_OPTIONS.length)];
    const campaign = CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)];
    rows.push({
      id: `dat_${idCounter++}`,
      subsidiary: 'SEA', country: 'UNITED STATES', objective: 'Awareness', channel: 'NULL', platform: 'NULL', campaign: campaign, customerType: custType, contents: content,
      ...genFullMetrics(250000),
      rowType: 'data'
    });
  });

  return rows;
};

const MarketingPerformanceDetail: React.FC = () => {
  const { filters } = useFilters();
  const allData = useMemo(() => generateMockData(), []);

  const data = useMemo(() => {
    const visibleDataRows = new Set<string>();
    
    // First pass: identify visible data rows
    allData.forEach(row => {
      if (row.rowType === 'data') {
        let isVisible = true;
        if (row.campaign && !filters.campaigns.includes(row.campaign)) isVisible = false;
        if (row.customerType && !filters.customerTypes.includes(row.customerType)) isVisible = false;
        if (row.contents && !filters.contents.includes(row.contents)) isVisible = false;
        if (row.channel && !filters.channels.includes(row.channel)) isVisible = false;
        if (row.platform && !filters.platforms.includes(row.platform)) isVisible = false;
        
        if (isVisible) {
          visibleDataRows.add(row.id);
        }
      }
    });

    // Second pass: iterate backwards to keep headers that have visible children
    const finalRows = [];
    let hasVisibleDataInCurrentChannel = false;
    let hasVisibleDataInCurrentObjective = false;
    let hasVisibleDataInCurrentCountry = false;
    let hasVisibleDataInCurrentSubsidiary = false;
    let hasVisibleDataOverall = false;

    for (let i = allData.length - 1; i >= 0; i--) {
      const row = allData[i];
      
      if (row.rowType === 'data') {
        if (visibleDataRows.has(row.id)) {
          finalRows.unshift(row);
          hasVisibleDataInCurrentChannel = true;
          hasVisibleDataInCurrentObjective = true;
          hasVisibleDataInCurrentCountry = true;
          hasVisibleDataInCurrentSubsidiary = true;
          hasVisibleDataOverall = true;
        }
      } else if (row.rowType === 'channel') {
        if (hasVisibleDataInCurrentChannel) {
          finalRows.unshift(row);
        }
        hasVisibleDataInCurrentChannel = false;
      } else if (row.rowType === 'objective') {
        if (hasVisibleDataInCurrentObjective) {
          finalRows.unshift(row);
        }
        hasVisibleDataInCurrentObjective = false;
      } else if (row.rowType === 'country') {
        if (hasVisibleDataInCurrentCountry) {
          finalRows.unshift(row);
        }
        hasVisibleDataInCurrentCountry = false;
      } else if (row.rowType === 'subsidiary') {
        if (hasVisibleDataInCurrentSubsidiary) {
          finalRows.unshift(row);
        }
        hasVisibleDataInCurrentSubsidiary = false;
      } else if (row.rowType === 'grand_total') {
        if (hasVisibleDataOverall) {
          finalRows.unshift(row);
        }
      }
    }

    return finalRows;
  }, [allData, filters]);

  const renderMetric = (metric: MetricValue) => (
    <div className="flex flex-col items-end justify-center">
      <span className="text-[11px] font-bold text-slate-800">{metric.main}</span>
      <span className={`text-[9px] font-bold ${metric.isPositive ? 'text-blue-500' : 'text-red-500'}`}>
        {metric.change}
      </span>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-8 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col gap-1">
        <h2 className="text-lg font-black text-slate-800">Marketing Performance in Detail</h2>
        <p className="text-[10px] text-slate-400 leading-tight">
          * The colored percentage values shown below each figure represent the change compared to the reference year.
        </p>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-max">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th colSpan={9} className="border-r border-slate-200"></th>
                <th colSpan={7} className="py-2 text-center text-[11px] font-black text-slate-700 border-r border-slate-200">Core Volume KPI</th>
                <th colSpan={3} className="py-2 text-center text-[11px] font-black text-slate-700 border-r border-slate-200">Effectiveness KPI</th>
                <th colSpan={7} className="py-2 text-center text-[11px] font-black text-slate-700">Efficiency KPI</th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] text-slate-600 font-bold">
                <th className="py-3 px-2 text-left w-14">Subsidiary</th>
                <th className="py-3 px-2 text-left w-16">Country</th>
                <th className="py-3 px-2 text-left w-16">Objective</th>
                <th className="py-3 px-2 text-left w-14">Channel</th>
                <th className="py-3 px-2 text-left w-14">Platform</th>
                <th className="py-3 px-2 text-left w-16">Campaign</th>
                <th className="py-3 px-2 text-left w-20">Customer Type</th>
                <th className="py-3 px-2 text-left w-24">Contents</th>
                <th className="py-3 px-2 text-right w-16 border-r border-slate-200">Spend</th>
                
                {/* Core Volume KPI */}
                <th className="py-2 px-1 text-right min-w-[64px]">Impressions</th>
                <th className="py-2 px-1 text-right min-w-[64px]">Engagement</th>
                <th className="py-2 px-1 text-right min-w-[56px]">50% Views</th>
                <th className="py-2 px-1 text-right min-w-[56px]">Clicks</th>
                <th className="py-2 px-1 text-right min-w-[56px]">75% Views</th>
                <th className="py-2 px-1 text-right min-w-[64px]">Platform<br/>Revenue</th>
                <th className="py-2 px-1 text-right min-w-[64px] border-r border-slate-200">eStore<br/>Revenue</th>
                
                {/* Effectiveness KPI */}
                <th className="py-2 px-1 text-right min-w-[48px]">CTR</th>
                <th className="py-2 px-1 text-right min-w-[48px]">VTR50</th>
                <th className="py-2 px-1 text-right min-w-[48px] border-r border-slate-200">VTR75</th>
                
                {/* Efficiency KPI */}
                <th className="py-2 px-1 text-right min-w-[48px]">CPM</th>
                <th className="py-2 px-1 text-right min-w-[48px]">CPE</th>
                <th className="py-2 px-1 text-right min-w-[48px]">CPC</th>
                <th className="py-2 px-1 text-right min-w-[48px]">CPV50</th>
                <th className="py-2 px-1 text-right min-w-[48px]">CPV75</th>
                <th className="py-2 px-1 text-right min-w-[56px]">Platform<br/>ROAS</th>
                <th className="py-2 px-1 text-right min-w-[56px]">eStore<br/>ROAS</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                let rowBg = 'bg-white';
                if (row.rowType === 'grand_total') rowBg = 'bg-slate-50';
                if (row.rowType === 'subsidiary') rowBg = 'bg-blue-50/50';
                
                const isGrand = row.rowType === 'grand_total';
                
                return (
                  <tr key={row.id} className={`border-b border-slate-200 hover:bg-slate-100 transition-colors ${rowBg}`}>
                    <td className={`py-2 px-2 text-[11px] text-slate-800 ${isGrand ? 'font-black' : ''}`}>{row.rowType === 'data' ? '' : row.subsidiary}</td>
                    <td className="py-2 px-2 text-[11px] text-slate-800">{row.rowType === 'data' ? '' : row.country}</td>
                    <td className="py-2 px-2 text-[11px] text-slate-800">{row.rowType === 'data' ? '' : row.objective}</td>
                    <td className="py-2 px-2 text-[11px] text-slate-800">{row.rowType === 'data' ? '' : row.channel}</td>
                    <td className="py-2 px-2 text-[11px] text-slate-800">{row.platform}</td>
                    <td className="py-2 px-2 text-[11px] text-slate-800">{row.campaign}</td>
                    <td className="py-2 px-2 text-[11px] text-slate-800">{row.customerType}</td>
                    <td className="py-2 px-2 text-[11px] text-slate-800">{row.contents}</td>
                    <td className="py-2 px-2 border-r border-slate-200">{renderMetric(row.spend)}</td>
                    
                    <td className="py-1.5 px-1">{renderMetric(row.impressions)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.engagement)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.views50)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.clicks)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.views75)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.platformRevenue)}</td>
                    <td className="py-1.5 px-1 border-r border-slate-200">{renderMetric(row.eStoreRevenue)}</td>
                    
                    <td className="py-1.5 px-1">{renderMetric(row.ctr)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.vtr50)}</td>
                    <td className="py-1.5 px-1 border-r border-slate-200">{renderMetric(row.vtr75)}</td>
                    
                    <td className="py-1.5 px-1">{renderMetric(row.cpm)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.cpe)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.cpc)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.cpv50)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.cpv75)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.platformRoas)}</td>
                    <td className="py-1.5 px-1">{renderMetric(row.eStoreRoas)}</td>
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

export default MarketingPerformanceDetail;
