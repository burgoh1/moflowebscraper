'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TextField,
  TextAreaField,
  NumberField,
  StringListField,
  FieldRow,
} from './shared';
import type {
  CompanyFoundation,
  Positioning,
  MarketAndCustomers,
  BrandingAndStyle,
  OnlinePresence,
  SocialLink,
  SocialPlatform,
  DataQualityFlag,
} from '@/types/knowledge-base';

type SectionProps<T> = {
  value: T;
  onChange: (next: T) => void;
  flags: DataQualityFlag[];
};

export function CompanyFoundationSection({
  value,
  onChange,
  flags,
}: SectionProps<CompanyFoundation>) {
  const set = <K extends keyof CompanyFoundation>(
    key: K,
    next: CompanyFoundation[K]
  ) => onChange({ ...value, [key]: next });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Foundation</CardTitle>
        <CardDescription>
          Overview, identity, and location details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TextAreaField
          label="Overview"
          field="companyFoundation.overview"
          flags={flags}
          value={value.overview}
          onChange={(v) => set('overview', v)}
        />
        <TextField
          label="Website"
          field="companyFoundation.website"
          flags={flags}
          value={value.website}
          onChange={(v) => set('website', v)}
        />
        <TextField
          label="Industry"
          field="companyFoundation.industry"
          flags={flags}
          value={value.industry}
          onChange={(v) => set('industry', v)}
        />
        <TextAreaField
          label="Business Model"
          field="companyFoundation.businessModel"
          flags={flags}
          value={value.businessModel}
          onChange={(v) => set('businessModel', v)}
        />
        <TextField
          label="Company Role"
          field="companyFoundation.companyRole"
          flags={flags}
          value={value.companyRole}
          onChange={(v) => set('companyRole', v)}
        />
        <NumberField
          label="Year Founded"
          field="companyFoundation.yearFounded"
          flags={flags}
          value={value.yearFounded}
          onChange={(v) => set('yearFounded', v)}
        />
        <TextField
          label="Legal Entity Type"
          field="companyFoundation.legalEntityType"
          flags={flags}
          value={value.legalEntityType}
          onChange={(v) => set('legalEntityType', v)}
        />
        <NumberField
          label="Employee Count"
          field="companyFoundation.employeeCount"
          flags={flags}
          value={value.employeeCount}
          onChange={(v) => set('employeeCount', v)}
        />
        <TextField
          label="Main Address"
          field="companyFoundation.mainAddress"
          flags={flags}
          value={value.mainAddress}
          onChange={(v) => set('mainAddress', v)}
        />
        <StringListField
          label="Other Locations"
          field="companyFoundation.otherLocations"
          flags={flags}
          value={value.otherLocations}
          onChange={(v) => set('otherLocations', v)}
        />
        <StringListField
          label="Service Locations"
          field="companyFoundation.serviceLocations"
          flags={flags}
          value={value.serviceLocations}
          onChange={(v) => set('serviceLocations', v)}
        />
        <StringListField
          label="Alternative Names"
          field="companyFoundation.alternativeNames"
          flags={flags}
          value={value.alternativeNames}
          onChange={(v) => set('alternativeNames', v)}
        />
      </CardContent>
    </Card>
  );
}

export function PositioningSection({
  value,
  onChange,
  flags,
}: SectionProps<Positioning>) {
  const set = <K extends keyof Positioning>(key: K, next: Positioning[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Positioning</CardTitle>
        <CardDescription>Pitch and founding story.</CardDescription>
      </CardHeader>
      <CardContent>
        <TextAreaField
          label="Company Pitch"
          field="positioning.companyPitch"
          flags={flags}
          value={value.companyPitch}
          onChange={(v) => set('companyPitch', v)}
          rows={4}
        />
        <TextAreaField
          label="Founding Story"
          field="positioning.foundingStory"
          flags={flags}
          value={value.foundingStory}
          onChange={(v) => set('foundingStory', v)}
          rows={4}
        />
      </CardContent>
    </Card>
  );
}

export function MarketAndCustomersSection({
  value,
  onChange,
  flags,
}: SectionProps<MarketAndCustomers>) {
  const set = <K extends keyof MarketAndCustomers>(
    key: K,
    next: MarketAndCustomers[K]
  ) => onChange({ ...value, [key]: next });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market &amp; Customers</CardTitle>
        <CardDescription>Who they sell to and how.</CardDescription>
      </CardHeader>
      <CardContent>
        <StringListField
          label="Target Buyers"
          field="marketAndCustomers.targetBuyers"
          flags={flags}
          value={value.targetBuyers}
          onChange={(v) => set('targetBuyers', v)}
        />
        <TextAreaField
          label="Customer Needs"
          field="marketAndCustomers.customerNeeds"
          flags={flags}
          value={value.customerNeeds}
          onChange={(v) => set('customerNeeds', v)}
        />
        <TextAreaField
          label="Ideal Customer Persona"
          field="marketAndCustomers.idealCustomerPersona"
          flags={flags}
          value={value.idealCustomerPersona}
          onChange={(v) => set('idealCustomerPersona', v)}
        />
        <StringListField
          label="Industry Groupings"
          field="marketAndCustomers.industryGroupings"
          flags={flags}
          value={value.industryGroupings}
          onChange={(v) => set('industryGroupings', v)}
        />
        <TextAreaField
          label="Industry Outlook"
          field="marketAndCustomers.industryOutlook"
          flags={flags}
          value={value.industryOutlook}
          onChange={(v) => set('industryOutlook', v)}
        />
        <StringListField
          label="Channels"
          field="marketAndCustomers.channels"
          flags={flags}
          value={value.channels}
          onChange={(v) => set('channels', v)}
        />
        <StringListField
          label="Funnels"
          field="marketAndCustomers.funnels"
          flags={flags}
          value={value.funnels}
          onChange={(v) => set('funnels', v)}
        />
        <StringListField
          label="CTAs"
          field="marketAndCustomers.ctas"
          flags={flags}
          value={value.ctas}
          onChange={(v) => set('ctas', v)}
        />
        <StringListField
          label="Suppliers / Partners"
          field="marketAndCustomers.suppliersOrPartners"
          flags={flags}
          value={value.suppliersOrPartners}
          onChange={(v) => set('suppliersOrPartners', v)}
        />
      </CardContent>
    </Card>
  );
}

export function BrandingAndStyleSection({
  value,
  onChange,
  flags,
}: SectionProps<BrandingAndStyle>) {
  const set = <K extends keyof BrandingAndStyle>(
    key: K,
    next: BrandingAndStyle[K]
  ) => onChange({ ...value, [key]: next });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding &amp; Style</CardTitle>
        <CardDescription>Voice, visuals, and brand assets.</CardDescription>
      </CardHeader>
      <CardContent>
        <TextAreaField
          label="Writing Style"
          field="brandingAndStyle.writingStyle"
          flags={flags}
          value={value.writingStyle}
          onChange={(v) => set('writingStyle', v)}
        />
        <TextAreaField
          label="Art Style"
          field="brandingAndStyle.artStyle"
          flags={flags}
          value={value.artStyle}
          onChange={(v) => set('artStyle', v)}
        />
        <StringListField
          label="Fonts"
          field="brandingAndStyle.fonts"
          flags={flags}
          value={value.fonts}
          onChange={(v) => set('fonts', v)}
        />
        <StringListField
          label="Brand Colors (hex)"
          field="brandingAndStyle.brandColors"
          flags={flags}
          value={value.brandColors}
          onChange={(v) => set('brandColors', v)}
        />
        <StringListField
          label="Logos (URLs)"
          field="brandingAndStyle.logos"
          flags={flags}
          value={value.logos}
          onChange={(v) => set('logos', v)}
        />
      </CardContent>
    </Card>
  );
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  'linkedin',
  'facebook',
  'instagram',
  'twitter_x',
  'youtube',
  'tiktok',
  'other',
];

export function OnlinePresenceSection({
  value,
  onChange,
  flags,
}: SectionProps<OnlinePresence>) {
  const updateLink = (index: number, patch: Partial<SocialLink>) =>
    onChange({
      socialLinks: value.socialLinks.map((link, i) =>
        i === index ? { ...link, ...patch } : link
      ),
    });
  const removeLink = (index: number) =>
    onChange({ socialLinks: value.socialLinks.filter((_, i) => i !== index) });
  const addLink = () =>
    onChange({
      socialLinks: [...value.socialLinks, { platform: 'other', url: '' }],
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Online Presence</CardTitle>
        <CardDescription>Social media profiles.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldRow
          label="Social Links"
          field="onlinePresence.socialLinks"
          flags={flags}
        >
          <div className="flex flex-col gap-2">
            {value.socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <select
                  className="h-10 rounded-md border border-neutral-300 bg-white px-2 text-sm"
                  value={link.platform}
                  onChange={(e) =>
                    updateLink(index, {
                      platform: e.target.value as SocialPlatform,
                    })
                  }
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
                <Input
                  className="flex-1"
                  value={link.url}
                  onChange={(e) => updateLink(index, { url: e.target.value })}
                  placeholder="https://..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeLink(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLink}
              className="self-start"
            >
              Add social link
            </Button>
          </div>
        </FieldRow>
      </CardContent>
    </Card>
  );
}
