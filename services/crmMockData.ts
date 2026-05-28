import { 
  COUNTRIES, 
  PLATFORMS, 
  INDUSTRIES, 
  PRODUCTS, 
  CAMPAIGNS, 
  COMPANY_SIZES, 
  JOB_ROLES, 
  CONVERSION_TIME_CATEGORIES, 
  REJECTION_REASONS 
} from '../constants';

export interface LeadRecord {
  id: string;
  country: string;
  platform: string;
  campaign: string;
  industry: string;
  product: string;
  companySize: string;
  jobRole: string;
  isDropped: boolean;
  droppedAtStage: 'Lead' | 'MQL' | 'SQL' | 'Opportunity' | '';
  finalStage: 'Lead' | 'MQL' | 'SQL' | 'Opportunity' | 'Sales';
  conversionTimeDays: number;
  conversionTimeCategory: string;
  rejectionReason: string;
}

// Simple LCG pseudo-random number generator for absolute consistency
function createRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export const generateLeadDatabase = (): LeadRecord[] => {
  const rand = createRandom(54321);
  const records: LeadRecord[] = [];

  const pickWeighted = <T>(items: T[], weights: number[], rVal: number): T => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
    }
    const r = rVal * sum;
    let accum = 0;
    for (let i = 0; i < items.length; i++) {
      accum += weights[i];
      if (r <= accum) return items[i];
    }
    return items[items.length - 1];
  };

  for (let i = 1; i <= 1000; i++) {
    const id = `HVIS-2026-${String(i).padStart(4, '0')}`;

    // Country weighting: KR, US are high volume, SG, VN are medium, EU and JP are medium
    const country = pickWeighted(
      COUNTRIES,
      [0.24, 0.20, 0.12, 0.10, 0.12, 0.08, 0.07, 0.07], // KR, US, JP, SG, VN, DE, UK, FR
      rand()
    );

    // Platform weighting: LinkedIn, Google SA/Pmax are high value for B2B; X, FB are standard
    const platform = pickWeighted(
      PLATFORMS,
      [0.24, 0.14, 0.10, 0.09, 0.05, 0.03, 0.35], // LinkedIn (Increased), Google SA, AI MAX, Pmax, Demand Gen, X, FB (High Volume)
      rand()
    );

    // Campaign matching
    const campaignIndex = Math.floor(rand() * CAMPAIGNS.length);
    const campaign = CAMPAIGNS[campaignIndex];

    // Industry weighting based on Hanwha Vision focus: Smartcity and Manufacturing are strong
    const industry = pickWeighted(
      INDUSTRIES,
      [0.18, 0.26, 0.22, 0.14, 0.10, 0.10], // Retail, Manufacturing, Smart City, Transport, Healthcare, Corporate
      rand()
    );

    // Product of interest
    const product = pickWeighted(
      PRODUCTS,
      [0.32, 0.24, 0.18, 0.14, 0.12], // Network Camera, Wave VMS, AI NVR, OnCloud, Access Control
      rand()
    );

    // Company Size: Enterprise is heavier in B2B
    const companySize = pickWeighted(
      COMPANY_SIZES,
      [0.30, 0.35, 0.35], // SMB, Mid, Enterprise
      rand()
    );

    // Job Roles: IT Manager and Security directors are main purchasers
    const jobRole = pickWeighted(
      JOB_ROLES,
      [0.15, 0.30, 0.27, 0.13, 0.15], // C-Level, Sec Director, IT Manager, Operator, Consultant
      rand()
    );

    // Determine funnel progression based on correlations
    // B2B platforms like LinkedIn & Google SA convert better than FB or X
    let mqlChance = 0.70;
    let sqlChance = 0.50; // of MQL
    let oppChance = 0.45; // of SQL
    let salesChance = 0.40; // of Opportunity

    if (platform === "X" || platform === "FB") {
      mqlChance = 0.55;
      sqlChance = 0.30;
      oppChance = 0.25;
      salesChance = 0.20;
    } else if (platform === "링크드인") {
      mqlChance = 0.82;
      sqlChance = 0.64;
      oppChance = 0.53;
      salesChance = 0.47; // 0.82 * 0.64 * 0.53 * 0.47 = ~13.07% conversion rate (Sales / Lead)
    } else if (platform === "구글 SA") {
      mqlChance = 0.78;
      sqlChance = 0.60;
      oppChance = 0.50;
      salesChance = 0.42; // ~9.8% conversion rate
    } else {
      mqlChance = 0.70;
      sqlChance = 0.50;
      oppChance = 0.45;
      salesChance = 0.38;
    }

    if (companySize === "Enterprise (1000인 이상)") {
      sqlChance += 0.05;
      oppChance += 0.05;
    }

    // Progression loop
    const r1 = rand();
    const r2 = rand();
    const r3 = rand();
    const r4 = rand();

    let finalStage: 'Lead' | 'MQL' | 'SQL' | 'Opportunity' | 'Sales' = 'Lead';
    let isDropped = false;
    let droppedAtStage: 'Lead' | 'MQL' | 'SQL' | 'Opportunity' | '' = '';

    if (r1 < mqlChance) {
      finalStage = 'MQL';
      if (r2 < sqlChance) {
        finalStage = 'SQL';
        if (r3 < oppChance) {
          finalStage = 'Opportunity';
          if (r4 < salesChance) {
            finalStage = 'Sales';
          } else {
            isDropped = true;
            droppedAtStage = 'Opportunity';
          }
        } else {
          isDropped = true;
          droppedAtStage = 'SQL';
        }
      } else {
        isDropped = true;
        droppedAtStage = 'MQL';
      }
    } else {
      isDropped = true;
      droppedAtStage = 'Lead';
    }

    // Determine conversion days: Enterprise sales cycles are longer
    let baseDays = 10;
    if (companySize === "Enterprise (1000인 이상)") baseDays = 45;
    else if (companySize === "Mid-Market (100-1000인)") baseDays = 25;

    let progressionBonus = 5;
    if (finalStage === 'Sales') progressionBonus = 50;
    else if (finalStage === 'Opportunity') progressionBonus = 30;
    else if (finalStage === 'SQL') progressionBonus = 15;

    const conversionTimeDays = Math.round(baseDays + progressionBonus + rand() * 40);

    let conversionTimeCategory = "Fast (< 15일)";
    if (conversionTimeDays > 90) conversionTimeCategory = "Long-term (90일+)";
    else if (conversionTimeDays > 45) conversionTimeCategory = "Gradual (46-90일)";
    else if (conversionTimeDays >= 15) conversionTimeCategory = "Medium (15-45일)";

    // Dropped/Rejection Reason Correlated
    let rejectionReason = "";
    if (isDropped) {
      if (companySize === "SMB (< 100인)") {
        rejectionReason = pickWeighted(REJECTION_REASONS, [0.45, 0.15, 0.15, 0.15, 0.10], rand());
      } else if (companySize === "Enterprise (1000인 이상)") {
        rejectionReason = pickWeighted(REJECTION_REASONS, [0.15, 0.35, 0.30, 0.10, 0.10], rand());
      } else {
        rejectionReason = pickWeighted(REJECTION_REASONS, [0.25, 0.25, 0.20, 0.15, 0.15], rand());
      }
    }

    records.push({
      id,
      country,
      platform,
      campaign,
      industry,
      product,
      companySize,
      jobRole,
      isDropped,
      droppedAtStage,
      finalStage,
      conversionTimeDays,
      conversionTimeCategory,
      rejectionReason
    });
  }

  return records;
};

// Singleton storage of records
const database = generateLeadDatabase();

/**
 * Filter the CRM database using global state filters
 */
export const getFilteredLeads = (filters: {
  countries: string[];
  platforms: string[];
  industries: string[];
  products: string[];
  campaigns: string[];
}): LeadRecord[] => {
  return database.filter(lead => {
    // Exact matching handles array contents
    const matchCountry = filters.countries.includes(lead.country);
    const matchPlatform = filters.platforms.includes(lead.platform);
    const matchIndustry = filters.industries.includes(lead.industry);
    const matchProduct = filters.products.includes(lead.product);
    const matchCampaign = filters.campaigns.includes(lead.campaign);

    return matchCountry && matchPlatform && matchIndustry && matchProduct && matchCampaign;
  });
};

/**
 * Computes lead funnel aggregates for a set of records
 * Stages flow from Total Lead -> MQL -> SQL -> Opportunity -> Sales
 */
export const calculateFunnel = (records: LeadRecord[]) => {
  let totalLead = records.length;
  // Anyone who went beyond Lead is an MQL
  let mql = records.filter(r => r.finalStage !== 'Lead' || (r.isDropped && r.droppedAtStage !== 'Lead')).length;
  // Anyone who went beyond MQL is SQL
  let sql = records.filter(r => 
    r.finalStage === 'SQL' || 
    r.finalStage === 'Opportunity' || 
    r.finalStage === 'Sales' || 
    (r.isDropped && (r.droppedAtStage === 'SQL' || r.droppedAtStage === 'Opportunity'))
  ).length;
  // Anyone who went beyond SQL is Opportunity
  let opportunity = records.filter(r => 
    r.finalStage === 'Opportunity' || 
    r.finalStage === 'Sales' || 
    (r.isDropped && r.droppedAtStage === 'Opportunity')
  ).length;
  // Anyone who reached Sales is Sales
  let sales = records.filter(r => r.finalStage === 'Sales').length;

  return {
    totalLead,
    mql,
    sql,
    opportunity,
    sales
  };
};
