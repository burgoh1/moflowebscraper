import type { KnowledgeBaseDraft } from '@/types/knowledge-base';

function cleanString(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function cleanStringList(values: string[]): string[] {
  return values.map((v) => v.trim()).filter(Boolean);
}

// Textareas keep blank lines/entries while the user is actively editing
export function cleanDraftForSave(
  draft: KnowledgeBaseDraft
): KnowledgeBaseDraft {
  return {
    ...draft,
    companyName: cleanString(draft.companyName),
    companyFoundation: {
      ...draft.companyFoundation,
      overview: cleanString(draft.companyFoundation.overview),
      website: cleanString(draft.companyFoundation.website),
      industry: cleanString(draft.companyFoundation.industry),
      businessModel: cleanString(draft.companyFoundation.businessModel),
      companyRole: cleanString(draft.companyFoundation.companyRole),
      legalEntityType: cleanString(draft.companyFoundation.legalEntityType),
      mainAddress: cleanString(draft.companyFoundation.mainAddress),
      otherLocations: cleanStringList(draft.companyFoundation.otherLocations),
      serviceLocations: cleanStringList(
        draft.companyFoundation.serviceLocations
      ),
      alternativeNames: cleanStringList(
        draft.companyFoundation.alternativeNames
      ),
    },
    positioning: {
      companyPitch: cleanString(draft.positioning.companyPitch),
      foundingStory: cleanString(draft.positioning.foundingStory),
    },
    marketAndCustomers: {
      ...draft.marketAndCustomers,
      targetBuyers: cleanStringList(draft.marketAndCustomers.targetBuyers),
      customerNeeds: cleanString(draft.marketAndCustomers.customerNeeds),
      idealCustomerPersona: cleanString(
        draft.marketAndCustomers.idealCustomerPersona
      ),
      industryGroupings: cleanStringList(
        draft.marketAndCustomers.industryGroupings
      ),
      industryOutlook: cleanString(draft.marketAndCustomers.industryOutlook),
      channels: cleanStringList(draft.marketAndCustomers.channels),
      funnels: cleanStringList(draft.marketAndCustomers.funnels),
      ctas: cleanStringList(draft.marketAndCustomers.ctas),
      suppliersOrPartners: cleanStringList(
        draft.marketAndCustomers.suppliersOrPartners
      ),
    },
    brandingAndStyle: {
      ...draft.brandingAndStyle,
      writingStyle: cleanString(draft.brandingAndStyle.writingStyle),
      artStyle: cleanString(draft.brandingAndStyle.artStyle),
      fonts: cleanStringList(draft.brandingAndStyle.fonts),
      brandColors: cleanStringList(draft.brandingAndStyle.brandColors),
      logos: cleanStringList(draft.brandingAndStyle.logos),
    },
    onlinePresence: {
      socialLinks: draft.onlinePresence.socialLinks.filter(
        (link) => link.url.trim().length > 0
      ),
    },
    keyPeople: draft.keyPeople
      .filter((person) => person.name.trim().length > 0)
      .map((person) => ({
        ...person,
        title: cleanString(person.title),
        description: cleanString(person.description),
      })),
    offerings: draft.offerings
      .filter((offering) => offering.name.trim().length > 0)
      .map((offering) => ({
        ...offering,
        category: cleanString(offering.category),
        description: cleanString(offering.description),
        pricing: cleanString(offering.pricing),
        features: cleanStringList(offering.features),
      })),
    testimonials: draft.testimonials
      .filter((testimonial) => testimonial.quoteText.trim().length > 0)
      .map((testimonial) => ({
        ...testimonial,
        authorName: cleanString(testimonial.authorName),
        authorTitleOrCompany: cleanString(testimonial.authorTitleOrCompany),
        sourceContext: cleanString(testimonial.sourceContext),
      })),
    trustSignals: draft.trustSignals
      .filter((signal) => signal.label.trim().length > 0)
      .map((signal) => ({
        ...signal,
        issuer: cleanString(signal.issuer),
        description: cleanString(signal.description),
      })),
  };
}
