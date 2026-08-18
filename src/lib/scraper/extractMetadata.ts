import * as cheerio from 'cheerio';
import { firstNonEmpty, asString, extractOrganizationJsonLd } from './utils';

export type ExtractedMetadata = {
  companyName: string | null;
  overview: string | null;
  logos: string[];
};

export function extractMetadata(html: string): ExtractedMetadata {
  const $ = cheerio.load(html);
  const org = extractOrganizationJsonLd($);

  const companyName = firstNonEmpty(
    asString(org?.name),
    $('meta[property="og:site_name"]').attr('content'),
    $('title').first().text().split(/[-|–]/)[0]
  );

  const overview = firstNonEmpty(
    asString(org?.description),
    $('meta[name="description"]').attr('content'),
    $('meta[property="og:description"]').attr('content')
  );

  const logos = [
    jsonLdLogoUrl(org?.logo),
    $('meta[property="og:image"]').attr('content'),
  ].filter((url): url is string => Boolean(url?.trim()));

  return { companyName, overview, logos };
}

// JSON-LD logo can be a plain URL string or an ImageObject with a .url field.
function jsonLdLogoUrl(logo: unknown): string | undefined {
  if (typeof logo === 'string') return logo;
  if (logo && typeof logo === 'object' && 'url' in logo) {
    return asString((logo as { url: unknown }).url);
  }
  return undefined;
}
