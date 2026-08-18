// Loading status
export type ScrapeStatus = 'pending' | 'success' | 'partial' | 'failed';

// Flags for scraped fields
export type DataQualityStatus =
  | 'missing'
  | 'low_confidence'
  | 'ai_generated_mock';

// Information about what was flagged
export type DataQualityFlag = {
  field: string;
  status: DataQualityStatus;
  note?: string;
};

// Lists every issue found across a knowledge base
export type DataQualityMeta = {
  flags: DataQualityFlag[];
};

// Company Foundation
export type CompanyFoundation = {
  overview: string | null;
  website: string | null;
  industry: string | null;
  businessModel: string | null;
  companyRole: string | null;
  yearFounded: number | null;
  legalEntityType: string | null;
  employeeCount: number | null;
  mainAddress: string | null;
  otherLocations: string[];
  serviceLocations: string[];
  alternativeNames: string[];
};

// Positioning
export type Positioning = {
  companyPitch: string | null;
  foundingStory: string | null;
};

// Market & Customers
export type MarketAndCustomers = {
  targetBuyers: string[];
  customerNeeds: string | null;
  idealCustomerPersona: string | null;
  industryGroupings: string[];
  industryOutlook: string | null;
  channels: string[];
  funnels: string[];
  ctas: string[];
  suppliersOrPartners: string[];
};

// Branding & Style
export type BrandingAndStyle = {
  writingStyle: string | null;
  artStyle: string | null;
  fonts: string[];
  brandColors: string[];
  logos: string[];
};

// Online Presence
export type SocialPlatform =
  | 'linkedin'
  | 'facebook'
  | 'instagram'
  | 'twitter_x'
  | 'youtube'
  | 'tiktok'
  | 'other';

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

export type OnlinePresence = {
  socialLinks: SocialLink[];
};

// Key People
export type KeyPerson = {
  name: string;
  title: string | null;
  gender: 'male' | 'female' | 'unspecified' | null;
  description: string | null;
};

// Offerings
export type OfferingType = 'product' | 'service' | 'package' | 'subscription';

export type Offering = {
  name: string;
  offeringType: OfferingType;
  category: string | null;
  description: string | null;
  features: string[];
  pricing: string | null;
};

// Testimonials & Social Proof (my custom foundation)
export type Testimonial = {
  quoteText: string;
  authorName: string | null;
  authorTitleOrCompany: string | null;
  sourceContext: string | null;
};

// Trust Signals (my custom foundation)
export type TrustSignalType =
  | 'certification'
  | 'award'
  | 'license'
  | 'membership'
  | 'guarantee'
  | 'other';

export type TrustSignal = {
  label: string;
  type: TrustSignalType;
  issuer: string | null;
  description: string | null;
};

// Saved/Completed Knowledge Base
export type KnowledgeBase = {
  id: string; // Draft omit
  sourceUrl: string;
  companyName: string | null;
  scrapeStatus: ScrapeStatus;
  pagesScraped: string[];
  createdAt: string; // Draft omit
  updatedAt: string; // Draft omit
  companyFoundation: CompanyFoundation;
  positioning: Positioning;
  marketAndCustomers: MarketAndCustomers;
  brandingAndStyle: BrandingAndStyle;
  onlinePresence: OnlinePresence;
  keyPeople: KeyPerson[];
  offerings: Offering[];
  testimonials: Testimonial[];
  trustSignals: TrustSignal[];
  dataQuality: DataQualityMeta;
};

// Knowledge Base draft not yet saved
export type KnowledgeBaseDraft = Omit<
  KnowledgeBase,
  'id' | 'createdAt' | 'updatedAt'
>;
