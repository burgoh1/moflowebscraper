import * as cheerio from 'cheerio';
import type { SocialLink, SocialPlatform } from '@/types/knowledge-base';

const PLATFORM_HOSTNAMES: { pattern: RegExp; platform: SocialPlatform }[] = [
  { pattern: /(^|\.)linkedin\.com$/i, platform: 'linkedin' },
  { pattern: /(^|\.)(facebook\.com|fb\.com)$/i, platform: 'facebook' },
  { pattern: /(^|\.)instagram\.com$/i, platform: 'instagram' },
  { pattern: /(^|\.)(twitter\.com|x\.com)$/i, platform: 'twitter_x' },
  { pattern: /(^|\.)(youtube\.com|youtu\.be)$/i, platform: 'youtube' },
  { pattern: /(^|\.)tiktok\.com$/i, platform: 'tiktok' },
];

// Share buttons/embeds link to these same domains but aren't the company's
// own profile — filter them out before matching platforms.
const SHARE_WIDGET_PATTERN = /\/(sharer|share|intent|dialog)(\/|\?|$)/i;

export function extractSocialLinks(html: string): SocialLink[] {
  const $ = cheerio.load(html);
  const foundByPlatform = new Map<SocialPlatform, string>();

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;

    let url: URL;
    try {
      // no base — a real social link is always a full external URL, never relative
      url = new URL(href);
    } catch {
      return;
    }

    if (SHARE_WIDGET_PATTERN.test(url.pathname + url.search)) return;

    const match = PLATFORM_HOSTNAMES.find(({ pattern }) =>
      pattern.test(url.hostname)
    );
    if (!match || foundByPlatform.has(match.platform)) return;

    foundByPlatform.set(match.platform, url.href);
  });

  return [...foundByPlatform.entries()].map(([platform, url]) => ({
    platform,
    url,
  }));
}
