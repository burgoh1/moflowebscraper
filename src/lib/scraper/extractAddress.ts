import * as cheerio from 'cheerio';
import { asString, extractOrganizationJsonLd } from './utils';

const STREET_ADDRESS_PATTERN =
  /\d{1,6}\s+[A-Za-z0-9.'\s]{2,40}(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|suite|ste|highway|hwy)\.?,?\s+[A-Za-z\s]{2,30},\s*[A-Z]{2}\s*\d{5}(-\d{4})?/i;

export function extractAddress(html: string): string | null {
  const $ = cheerio.load(html);

  const org = extractOrganizationJsonLd($);
  const jsonLdAddress = jsonLdAddressString(org?.address);
  if (jsonLdAddress) return jsonLdAddress;

  const bodyText = $('body').text().replace(/\s+/g, ' ');
  const match = STREET_ADDRESS_PATTERN.exec(bodyText);
  return match ? match[0].trim() : null;
}

// schema.org address can be a plain string or a PostalAddress object.
function jsonLdAddressString(address: unknown): string | undefined {
  if (typeof address === 'string') return address;
  if (address && typeof address === 'object') {
    const a = address as Record<string, unknown>;
    const parts = [
      asString(a.streetAddress),
      asString(a.addressLocality),
      asString(a.addressRegion),
      asString(a.postalCode),
    ].filter((part): part is string => Boolean(part));
    return parts.length > 0 ? parts.join(', ') : undefined;
  }
  return undefined;
}
