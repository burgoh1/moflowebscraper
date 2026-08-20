import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { DataQualityFlag, ScrapeStatus } from '@/types/knowledge-base';

const SCRAPE_STATUS_LABEL: Record<ScrapeStatus, string> = {
  pending: 'Pending',
  success: 'Success',
  partial: 'Partial',
  failed: 'Failed',
};

const SCRAPE_STATUS_VARIANT: Record<
  ScrapeStatus,
  'default' | 'warning' | 'success' | 'destructive'
> = {
  pending: 'default',
  success: 'success',
  partial: 'warning',
  failed: 'destructive',
};

export function ScrapeStatusBadge({ status }: { status: ScrapeStatus }) {
  return (
    <Badge variant={SCRAPE_STATUS_VARIANT[status]}>
      {SCRAPE_STATUS_LABEL[status]}
    </Badge>
  );
}

const STATUS_LABEL: Record<DataQualityFlag['status'], string> = {
  missing: 'Not found',
  low_confidence: 'Low confidence',
  ai_generated_mock: 'AI-generated (mock)',
};

const STATUS_VARIANT: Record<
  DataQualityFlag['status'],
  'default' | 'warning' | 'info'
> = {
  missing: 'default',
  low_confidence: 'warning',
  ai_generated_mock: 'info',
};

export function FlagBadge({
  flags,
  field,
}: {
  flags: DataQualityFlag[];
  field: string;
}) {
  const flag = flags.find((f) => f.field === field);
  if (!flag) return null;
  return (
    <Badge variant={STATUS_VARIANT[flag.status]}>
      {STATUS_LABEL[flag.status]}
    </Badge>
  );
}

export function FieldRow({
  label,
  field,
  flags,
  children,
}: {
  label: string;
  field?: string;
  flags?: DataQualityFlag[];
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {field && flags ? <FlagBadge flags={flags} field={field} /> : null}
      </div>
      {children}
    </div>
  );
}

export function TextField({
  label,
  field,
  flags,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  field: string;
  flags: DataQualityFlag[];
  value: string | null;
  onChange: (next: string | null) => void;
  placeholder?: string;
}) {
  return (
    <FieldRow label={label} field={field} flags={flags}>
      <Input
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldRow>
  );
}

export function TextAreaField({
  label,
  field,
  flags,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  field: string;
  flags: DataQualityFlag[];
  value: string | null;
  onChange: (next: string | null) => void;
  rows?: number;
}) {
  return (
    <FieldRow label={label} field={field} flags={flags}>
      <Textarea
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldRow>
  );
}

export function NumberField({
  label,
  field,
  flags,
  value,
  onChange,
}: {
  label: string;
  field: string;
  flags: DataQualityFlag[];
  value: number | null;
  onChange: (next: number | null) => void;
}) {
  return (
    <FieldRow label={label} field={field} flags={flags}>
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value === '' ? null : Number(e.target.value))
        }
      />
    </FieldRow>
  );
}

// One item per line while editing. Blank lines are kept as-is here
// cleanup happens once, at save time, in cleanDraftForSave.
export function StringListField({
  label,
  field,
  flags,
  value,
  onChange,
}: {
  label: string;
  field: string;
  flags: DataQualityFlag[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <FieldRow label={label} field={field} flags={flags}>
      <Textarea
        rows={3}
        placeholder="One per line"
        value={value.join('\n')}
        onChange={(e) => onChange(e.target.value.split('\n'))}
      />
    </FieldRow>
  );
}
