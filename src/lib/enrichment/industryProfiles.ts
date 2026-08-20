// Keyword-matched stand-ins for what /prompts/industry-classification-prompt.md
// and /prompts/market-and-customers-prompt.md would return from a real LLM call.
// Deliberately simple: this is a rule-based mock, not a classifier.

export type IndustryProfile = {
  industry: string;
  businessModelTemplate: (companyName: string) => string;
  targetBuyers: string[];
  customerNeeds: string;
};

export const DEFAULT_PROFILE: IndustryProfile = {
  industry: 'Professional Services',
  businessModelTemplate: (name) =>
    `${name} appears to operate a direct-to-customer service model, based on the offerings listed on their site.`,
  targetBuyers: ['General consumers', 'Small businesses'],
  customerNeeds:
    'Customers likely need a reliable, trustworthy provider for the services this company advertises on its website.',
};

const INDUSTRY_PROFILES: { keywords: string[]; profile: IndustryProfile }[] = [
  {
    keywords: ['tax', 'accounting', 'bookkeeping', 'cpa', 'payroll'],
    profile: {
      industry: 'Accounting & Tax Services',
      businessModelTemplate: (name) =>
        `${name} provides fee-for-service accounting and tax work to individuals and small businesses, likely billed per engagement or on retainer.`,
      targetBuyers: ['Individuals filing taxes', 'Small business owners'],
      customerNeeds:
        'Customers need help staying tax-compliant, minimizing tax liability, and keeping accurate financial records without hiring in-house staff.',
    },
  },
  {
    keywords: ['well', 'drilling', 'pump', 'groundwater', 'irrigation'],
    profile: {
      industry: 'Water Well Drilling and Services',
      businessModelTemplate: (name) =>
        `${name} provides project-based and service-call work — drilling, installation, and maintenance — billed per job or under a maintenance contract.`,
      targetBuyers: ['Rural homeowners', 'Agricultural operations'],
      customerNeeds:
        'Customers need a dependable water supply and want an experienced provider to navigate permitting, drilling, and ongoing maintenance for them.',
    },
  },
  {
    keywords: ['real estate', 'realtor', 'listing', 'homes for sale', 'condo', 'penthouse'],
    profile: {
      industry: 'Real Estate',
      businessModelTemplate: (name) =>
        `${name} operates on a commission-based brokerage model, representing buyers and/or sellers of property.`,
      targetBuyers: ['Home buyers', 'Home sellers'],
      customerNeeds:
        'Customers need an experienced local agent to guide pricing, negotiation, and paperwork through a high-stakes transaction.',
    },
  },
  {
    keywords: ['insurance', 'policy', 'coverage', 'premium', 'underwrit'],
    profile: {
      industry: 'Insurance',
      businessModelTemplate: (name) =>
        `${name} operates as an insurance agency, placing policies with carriers on behalf of clients, typically earning commission on premiums.`,
      targetBuyers: ['Individuals and families', 'Small business owners'],
      customerNeeds:
        'Customers need help understanding coverage options and finding the right policy at the right price without navigating multiple carriers themselves.',
    },
  },
  {
    keywords: ['pest', 'termite', 'exterminator', 'rodent', 'infestation'],
    profile: {
      industry: 'Pest Control Services',
      businessModelTemplate: (name) =>
        `${name} provides one-time and recurring pest control service visits, typically billed per treatment or on a maintenance plan.`,
      targetBuyers: ['Residential homeowners', 'Commercial property owners'],
      customerNeeds:
        'Customers need pests or infestations eliminated safely and want ongoing protection against future problems.',
    },
  },
  {
    keywords: ['monitoring', 'sensor', 'dashboard', 'iot', 'real-time data'],
    profile: {
      industry: 'IoT / Remote Monitoring Technology',
      businessModelTemplate: (name) =>
        `${name} likely sells hardware plus an ongoing software/monitoring subscription, possibly through channel partners.`,
      targetBuyers: ['Facility or operations managers', 'Technology-forward SMBs'],
      customerNeeds:
        'Customers need early warning of equipment or system failures so they can shift from reactive to proactive maintenance.',
    },
  },
];

// Naive keyword scoring over combined offering + overview text — a stand-in
// for the LLM call described in industry-classification-prompt.md.
export function classifyIndustry(text: string): IndustryProfile {
  const lower = text.toLowerCase();
  let best: { profile: IndustryProfile; score: number } | null = null;

  for (const { keywords, profile } of INDUSTRY_PROFILES) {
    const score = keywords.reduce(
      (count, keyword) => count + (lower.includes(keyword) ? 1 : 0),
      0
    );
    if (score > 0 && (!best || score > best.score)) {
      best = { profile, score };
    }
  }

  return best?.profile ?? DEFAULT_PROFILE;
}
