import { fetchPage, type FetchPageSuccess } from './fetchPage';
import { discoverInternalPages } from './discoverPages';
import { extractMetadata } from './extractMetadata';
import { extractSocialLinks } from './extractSocialLinks';
import { extractBrandColors } from './extractBrandColors';
import { extractKeyPeople } from './extractKeyPeople';
import { extractOfferings } from './extractOfferings';
import { extractTestimonials } from './extractTestimonials';
import { extractTrustSignals } from './extractTrustSignals';
import { extractYearFounded } from './extractYearFounded';
import { extractLegalEntityType } from './extractLegalEntityType';
import { extractAddress } from './extractAddress';
import { extractFonts } from './extractFonts';
import { extractFoundingStory } from './extractFoundingStory';
import { firstNonEmpty, firstNonNull, longestNonEmpty } from './utils';

import type {
  KnowledgeBaseDraft,
  SocialLink,
  DataQualityFlag,
} from '@/types/knowledge-base';

export async function scrapeWebsite(
  inputUrl: string
): Promise<KnowledgeBaseDraft> {
  let base: URL;
  try {
    base = new URL(inputUrl);
  } catch {
    return emptyDraft(inputUrl, 'failed', [
      { field: '_root', status: 'missing', note: 'Invalid URL' },
    ]);
  }

  const homepage = await fetchPage(base.href);
  if (!homepage.ok) {
    return emptyDraft(base.href, 'failed', [
      {
        field: '_root',
        status: 'missing',
        note: `Could not fetch homepage: ${homepage.message}`,
      },
    ]);
  }

  const internalUrls = discoverInternalPages(homepage.html, homepage.url);
  const internalResults = await Promise.all(
    internalUrls.map((url) => fetchPage(url))
  );
  const successfulInternal = internalResults.filter(
    (result): result is FetchPageSuccess => result.ok
  );
  const failedInternal = internalResults.length - successfulInternal.length;

  const pages = [
    { html: homepage.html, label: 'Homepage' },
    ...successfulInternal.map((result) => ({
      html: result.html,
      label: new URL(result.url).pathname,
    })),
  ];

  const metadata = extractMetadata(homepage.html);
  const combinedHtml = pages.map((page) => page.html).join('\n');

  const draft: Omit<KnowledgeBaseDraft, 'dataQuality'> = {
    sourceUrl: base.href,
    companyName: metadata.companyName,
    scrapeStatus: failedInternal > 0 ? 'partial' : 'success',
    pagesScraped: [
      homepage.url,
      ...successfulInternal.map((result) => result.url),
    ],
    companyFoundation: {
      overview: metadata.overview,
      website: base.origin,
      industry: null,
      businessModel: null,
      companyRole: null,
      yearFounded: firstNonNull(
        pages.map((page) => extractYearFounded(page.html))
      ),
      legalEntityType: extractLegalEntityType(metadata.companyName),
      employeeCount: null,
      mainAddress: firstNonEmpty(
        ...pages.map((page) => extractAddress(page.html))
      ),
      otherLocations: [],
      serviceLocations: [],
      alternativeNames: [],
    },
    positioning: {
      companyPitch: null,
      foundingStory: longestNonEmpty(
        pages.map((page) => extractFoundingStory(page.html))
      ),
    },
    marketAndCustomers: {
      targetBuyers: [],
      customerNeeds: null,
      idealCustomerPersona: null,
      industryGroupings: [],
      industryOutlook: null,
      channels: [],
      funnels: [],
      ctas: [],
      suppliersOrPartners: [],
    },
    brandingAndStyle: {
      writingStyle: null,
      artStyle: null,
      fonts: extractFonts(combinedHtml),
      brandColors: extractBrandColors(combinedHtml),
      logos: metadata.logos,
    },
    onlinePresence: {
      socialLinks: dedupeSocialLinks(
        pages.flatMap((page) => extractSocialLinks(page.html))
      ),
    },
    keyPeople: dedupeByKey(
      pages.flatMap((page) => extractKeyPeople(page.html)),
      (person) => person.name.toLowerCase()
    ),
    offerings: dedupeByKey(
      pages.flatMap((page) => extractOfferings(page.html, page.label)),
      (offering) => offering.name.toLowerCase()
    ),
    testimonials: dedupeByKey(
      pages.flatMap((page) => extractTestimonials(page.html, page.label)),
      (testimonial) => testimonial.quoteText.slice(0, 80).toLowerCase()
    ),
    trustSignals: dedupeByKey(
      pages.flatMap((page) => extractTrustSignals(page.html)),
      (signal) => signal.label.toLowerCase()
    ),
  };

  return { ...draft, dataQuality: { flags: buildDataQualityFlags(draft) } };
}

function dedupeSocialLinks(links: SocialLink[]): SocialLink[] {
  const byPlatform = new Map<string, SocialLink>();
  for (const link of links) {
    if (!byPlatform.has(link.platform)) byPlatform.set(link.platform, link);
  }
  return [...byPlatform.values()];
}

function dedupeByKey<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function emptyDraft(
  sourceUrl: string,
  scrapeStatus: KnowledgeBaseDraft['scrapeStatus'],
  flags: DataQualityFlag[]
): KnowledgeBaseDraft {
  return {
    sourceUrl,
    companyName: null,
    scrapeStatus,
    pagesScraped: [],
    companyFoundation: {
      overview: null,
      website: sourceUrl,
      industry: null,
      businessModel: null,
      companyRole: null,
      yearFounded: null,
      legalEntityType: null,
      employeeCount: null,
      mainAddress: null,
      otherLocations: [],
      serviceLocations: [],
      alternativeNames: [],
    },
    positioning: { companyPitch: null, foundingStory: null },
    marketAndCustomers: {
      targetBuyers: [],
      customerNeeds: null,
      idealCustomerPersona: null,
      industryGroupings: [],
      industryOutlook: null,
      channels: [],
      funnels: [],
      ctas: [],
      suppliersOrPartners: [],
    },
    brandingAndStyle: {
      writingStyle: null,
      artStyle: null,
      fonts: [],
      brandColors: [],
      logos: [],
    },
    onlinePresence: { socialLinks: [] },
    keyPeople: [],
    offerings: [],
    testimonials: [],
    trustSignals: [],
    dataQuality: { flags },
  };
}

function buildDataQualityFlags(
  draft: Omit<KnowledgeBaseDraft, 'dataQuality'>
): DataQualityFlag[] {
  const flags: DataQualityFlag[] = [];
  const flagIfMissing = (field: string, value: unknown) => {
    const isEmpty =
      value === null || (Array.isArray(value) && value.length === 0);
    if (isEmpty) flags.push({ field, status: 'missing' });
  };

  flagIfMissing('companyName', draft.companyName);
  flagIfMissing('companyFoundation.overview', draft.companyFoundation.overview);
  flagIfMissing('companyFoundation.industry', draft.companyFoundation.industry);
  flagIfMissing(
    'companyFoundation.businessModel',
    draft.companyFoundation.businessModel
  );
  flagIfMissing(
    'companyFoundation.yearFounded',
    draft.companyFoundation.yearFounded
  );
  flagIfMissing(
    'companyFoundation.legalEntityType',
    draft.companyFoundation.legalEntityType
  );
  flagIfMissing(
    'companyFoundation.employeeCount',
    draft.companyFoundation.employeeCount
  );
  flagIfMissing(
    'companyFoundation.mainAddress',
    draft.companyFoundation.mainAddress
  );
  flagIfMissing('positioning.companyPitch', draft.positioning.companyPitch);
  flagIfMissing('positioning.foundingStory', draft.positioning.foundingStory);
  flagIfMissing(
    'marketAndCustomers.targetBuyers',
    draft.marketAndCustomers.targetBuyers
  );
  flagIfMissing(
    'marketAndCustomers.customerNeeds',
    draft.marketAndCustomers.customerNeeds
  );
  flagIfMissing(
    'brandingAndStyle.writingStyle',
    draft.brandingAndStyle.writingStyle
  );
  flagIfMissing('brandingAndStyle.fonts', draft.brandingAndStyle.fonts);
  flagIfMissing(
    'brandingAndStyle.brandColors',
    draft.brandingAndStyle.brandColors
  );
  flagIfMissing('brandingAndStyle.logos', draft.brandingAndStyle.logos);
  flagIfMissing('onlinePresence.socialLinks', draft.onlinePresence.socialLinks);
  flagIfMissing('keyPeople', draft.keyPeople);
  flagIfMissing('offerings', draft.offerings);
  flagIfMissing('testimonials', draft.testimonials);
  flagIfMissing('trustSignals', draft.trustSignals);

  return flags;
}
