import React from 'react';

interface CustomerTypeData {
  type: string;
  spend: number;
  acquiredCustomers: number;
  impressions: number;
  clicks: number;
  revenue: number;
  visits: number;
  bounces: number;
  transactions: number;
}

const RAW_DATA: CustomerTypeData[] = [
  {
    type: 'New Customer',
    spend: 14800000,
    acquiredCustomers: 62100,
    impressions: 425000000, // Increased impressions to make CPM realistic (~$34)
    clicks: 5820000, // CTR ~1.3%
    revenue: 38200000,
    visits: 4500000,
    bounces: 2700000, // ~60%
    transactions: 112500 // CVR ~2.5%
  },
  {
    type: 'Re-Purchase (Within Same Product)',
    spend: 10400000,
    acquiredCustomers: 48200,
    impressions: 281000000,
    clicks: 3950000,
    revenue: 62800000,
    visits: 3200000,
    bounces: 1280000, // ~40% (Lower bounce for repurchase)
    transactions: 160000 // CVR ~5%
  },
  {
    type: 'Re-Purchase (Within GBM)',
    spend: 8300000,
    acquiredCustomers: 32800,
    impressions: 198000000,
    clicks: 2710000,
    revenue: 41500000,
    visits: 2100000,
    bounces: 945000, // ~45%
    transactions: 84000 // CVR ~4%
  },
  {
    type: 'Re-Purchase (Cross GBM)',
    spend: 5900000,
    acquiredCustomers: 18300,
    impressions: 118000000,
    clicks: 1610000,
    revenue: 24200000,
    visits: 1250000,
    bounces: 625000, // ~50%
    transactions: 43750 // CVR ~3.5%
  }
];

const calculateMetrics = (data: CustomerTypeData) => {
  const cpm = (data.spend / data.impressions) * 1000;
  const cpc = data.spend / data.clicks;
  const ctr = (data.clicks / data.impressions) * 100;
  const cac = data.spend / data.acquiredCustomers;
  const revPerCust = data.revenue / data.acquiredCustomers;
  const visitRate = (data.visits / data.impressions) * 100; // Assuming Visit Rate based on Impressions
  const bounceRate = (data.bounces / data.visits) * 100;
  const cvr = (data.transactions / data.visits) * 100;
  const roas = data.revenue / data.spend;

  return {
    ...data,
    cpm,
    cpc,
    ctr,
    cac,
    revPerCust,
    visitRate,
    bounceRate,
    cvr,
    roas
  };
};

const formatCurrency = (val: number, compact = false) => {
  if (compact) {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  }
  return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString();
};

const formatPercent = (val: number) => `${val.toFixed(2)}%`;

const CustomerTypePerformanceTable: React.FC = () => {
  // Calculate Total Row
  const totalData = RAW_DATA.reduce((acc, curr) => ({
    type: 'Total',
    spend: acc.spend + curr.spend,
    acquiredCustomers: acc.acquiredCustomers + curr.acquiredCustomers,
    impressions: acc.impressions + curr.impressions,
    clicks: acc.clicks + curr.clicks,
    revenue: acc.revenue + curr.revenue,
    visits: acc.visits + curr.visits,
    bounces: acc.bounces + curr.bounces,
    transactions: acc.transactions + curr.transactions
  }), { type: 'Total', spend: 0, acquiredCustomers: 0, impressions: 0, clicks: 0, revenue: 0, visits: 0, bounces: 0, transactions: 0 });

  const rows = [calculateMetrics(totalData), ...RAW_DATA.map(calculateMetrics)];

  const headers = [
    { label: 'CUSTOMER TYPE', key: 'type', align: 'left' },
    { label: 'SPEND', key: 'spend', format: (v: number) => formatCurrency(v, true) },
    { label: '# OF ACQUIRED CUSTOMERS', key: 'acquiredCustomers', format: formatNumber },
    { label: 'IMPRESSIONS', key: 'impressions', format: formatNumber },
    { label: 'CLICKS', key: 'clicks', format: formatNumber },
    { label: 'REVENUE', key: 'revenue', format: (v: number) => formatCurrency(v, true) },
    { label: 'CUSTOMER ACQUISITION COST($)', key: 'cac', format: (v: number) => `$${v.toFixed(2)}` },
    { label: 'REVENUE PER CUSTOMER ($)', key: 'revPerCust', format: (v: number) => `$${v.toFixed(2)}` },
    { label: 'CPM', key: 'cpm', format: (v: number) => `$${v.toFixed(2)}` },
    { label: 'CPC', key: 'cpc', format: (v: number) => `$${v.toFixed(2)}` },
    { label: 'CTR', key: 'ctr', format: formatPercent },
    { label: 'VISIT RATE', key: 'visitRate', format: formatPercent },
    { label: 'BOUNCE RATE', key: 'bounceRate', format: formatPercent },
    { label: 'CVR', key: 'cvr', format: formatPercent },
    { label: 'ROAS', key: 'roas', format: (v: number) => v.toFixed(2) },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-8 overflow-x-auto">
      <h3 className="text-lg font-black text-slate-800 mb-4">Customer Type Performance</h3>
      <div className="min-w-[1400px]">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {headers.map((h, idx) => (
                <th 
                  key={idx} 
                  className={`py-3 px-2 text-[10px] font-black text-slate-600 uppercase tracking-tight border-r border-slate-200 last:border-r-0 ${h.align === 'left' ? 'text-left pl-4' : 'text-right'}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isTotal = row.type === 'Total';
              return (
                <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50 ${isTotal ? 'bg-white font-black' : 'bg-white font-medium text-slate-600'}`}>
                  {headers.map((h, colIdx) => {
                    // @ts-ignore
                    const val = row[h.key];
                    return (
                      <td 
                        key={colIdx} 
                        className={`py-4 px-2 text-xs border-r border-slate-100 last:border-r-0 ${h.align === 'left' ? 'text-left pl-4' : 'text-right'} ${isTotal ? 'text-slate-900' : ''}`}
                      >
                        {h.format ? h.format(val) : val}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTypePerformanceTable;
