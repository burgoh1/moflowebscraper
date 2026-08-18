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
import { Textarea } from '@/components/ui/textarea';
import { FlagBadge } from './shared';
import type {
  KeyPerson,
  Offering,
  OfferingType,
  Testimonial,
  TrustSignal,
  TrustSignalType,
  DataQualityFlag,
} from '@/types/knowledge-base';

type ListProps<T> = {
  value: T[];
  onChange: (next: T[]) => void;
  flags: DataQualityFlag[];
};

function useListActions<T>(
  value: T[],
  onChange: (next: T[]) => void,
  emptyItem: T
) {
  return {
    update: (index: number, patch: Partial<T>) =>
      onChange(
        value.map((item, i) => (i === index ? { ...item, ...patch } : item))
      ),
    remove: (index: number) => onChange(value.filter((_, i) => i !== index)),
    add: () => onChange([...value, emptyItem]),
  };
}

function ListHeader({
  title,
  description,
  flags,
  field,
}: {
  title: string;
  description: string;
  flags: DataQualityFlag[];
  field: string;
}) {
  return (
    <CardHeader className="flex-row items-center justify-between">
      <div className="flex flex-col gap-1">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <FlagBadge flags={flags} field={field} />
    </CardHeader>
  );
}

const emptyKeyPerson: KeyPerson = {
  name: '',
  title: null,
  gender: null,
  description: null,
};

export function KeyPeopleSection({
  value,
  onChange,
  flags,
}: ListProps<KeyPerson>) {
  const { update, remove, add } = useListActions(
    value,
    onChange,
    emptyKeyPerson
  );
  return (
    <Card>
      <ListHeader
        title="Key People"
        description="Founders, leadership, and other notable team members."
        flags={flags}
        field="keyPeople"
      />
      <CardContent>
        <div className="flex flex-col gap-4">
          {value.map((person, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-md border border-neutral-200 p-3"
            >
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="Name"
                  value={person.name}
                  onChange={(e) => update(index, { name: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
              <Input
                placeholder="Title"
                value={person.title ?? ''}
                onChange={(e) => update(index, { title: e.target.value })}
              />
              <select
                className="h-10 rounded-md border border-neutral-300 bg-white px-2 text-sm"
                value={person.gender ?? ''}
                onChange={(e) =>
                  update(index, {
                    gender: (e.target.value || null) as KeyPerson['gender'],
                  })
                }
              >
                <option value="">Gender not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unspecified">Unspecified</option>
              </select>
              <Textarea
                rows={2}
                placeholder="Description"
                value={person.description ?? ''}
                onChange={(e) => update(index, { description: e.target.value })}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            className="self-start"
          >
            Add person
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const OFFERING_TYPES: OfferingType[] = [
  'product',
  'service',
  'package',
  'subscription',
];
const emptyOffering: Offering = {
  name: '',
  offeringType: 'service',
  category: null,
  description: null,
  features: [],
  pricing: null,
};

export function OfferingsSection({
  value,
  onChange,
  flags,
}: ListProps<Offering>) {
  const { update, remove, add } = useListActions(
    value,
    onChange,
    emptyOffering
  );
  return (
    <Card>
      <ListHeader
        title="Offerings"
        description="Products and services, with features and pricing."
        flags={flags}
        field="offerings"
      />
      <CardContent>
        <div className="flex flex-col gap-4">
          {value.map((offering, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-md border border-neutral-200 p-3"
            >
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="Name"
                  value={offering.name}
                  onChange={(e) => update(index, { name: e.target.value })}
                />
                <select
                  className="h-10 rounded-md border border-neutral-300 bg-white px-2 text-sm"
                  value={offering.offeringType}
                  onChange={(e) =>
                    update(index, {
                      offeringType: e.target.value as OfferingType,
                    })
                  }
                >
                  {OFFERING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
              <Input
                placeholder="Category (e.g. Tax Services)"
                value={offering.category ?? ''}
                onChange={(e) => update(index, { category: e.target.value })}
              />
              <Textarea
                rows={2}
                placeholder="Description"
                value={offering.description ?? ''}
                onChange={(e) => update(index, { description: e.target.value })}
              />
              <Textarea
                rows={2}
                placeholder="Features, one per line"
                value={offering.features.join('\n')}
                onChange={(e) =>
                  update(index, { features: e.target.value.split('\n') })
                }
              />
              <Input
                placeholder="Pricing"
                value={offering.pricing ?? ''}
                onChange={(e) => update(index, { pricing: e.target.value })}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            className="self-start"
          >
            Add offering
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const emptyTestimonial: Testimonial = {
  quoteText: '',
  authorName: null,
  authorTitleOrCompany: null,
  sourceContext: null,
};

export function TestimonialsSection({
  value,
  onChange,
  flags,
}: ListProps<Testimonial>) {
  const { update, remove, add } = useListActions(
    value,
    onChange,
    emptyTestimonial
  );
  return (
    <Card>
      <ListHeader
        title="Testimonials & Social Proof"
        description="Customer quotes and reviews."
        flags={flags}
        field="testimonials"
      />
      <CardContent>
        <div className="flex flex-col gap-4">
          {value.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-md border border-neutral-200 p-3"
            >
              <div className="flex gap-2">
                <Textarea
                  className="flex-1"
                  rows={2}
                  placeholder="Quote"
                  value={testimonial.quoteText}
                  onChange={(e) => update(index, { quoteText: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
              <Input
                placeholder="Author name"
                value={testimonial.authorName ?? ''}
                onChange={(e) => update(index, { authorName: e.target.value })}
              />
              <Input
                placeholder="Author title / company"
                value={testimonial.authorTitleOrCompany ?? ''}
                onChange={(e) =>
                  update(index, { authorTitleOrCompany: e.target.value })
                }
              />
              <Input
                placeholder="Source (e.g. Homepage)"
                value={testimonial.sourceContext ?? ''}
                onChange={(e) =>
                  update(index, { sourceContext: e.target.value })
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            className="self-start"
          >
            Add testimonial
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const TRUST_SIGNAL_TYPES: TrustSignalType[] = [
  'certification',
  'award',
  'license',
  'membership',
  'guarantee',
  'other',
];
const emptyTrustSignal: TrustSignal = {
  label: '',
  type: 'other',
  issuer: null,
  description: null,
};

export function TrustSignalsSection({
  value,
  onChange,
  flags,
}: ListProps<TrustSignal>) {
  const { update, remove, add } = useListActions(
    value,
    onChange,
    emptyTrustSignal
  );
  return (
    <Card>
      <ListHeader
        title="Trust Signals"
        description="Certifications, awards, licenses, and memberships."
        flags={flags}
        field="trustSignals"
      />
      <CardContent>
        <div className="flex flex-col gap-4">
          {value.map((signal, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-md border border-neutral-200 p-3"
            >
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  placeholder="Label"
                  value={signal.label}
                  onChange={(e) => update(index, { label: e.target.value })}
                />
                <select
                  className="h-10 rounded-md border border-neutral-300 bg-white px-2 text-sm"
                  value={signal.type}
                  onChange={(e) =>
                    update(index, { type: e.target.value as TrustSignalType })
                  }
                >
                  {TRUST_SIGNAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
              <Input
                placeholder="Issuer"
                value={signal.issuer ?? ''}
                onChange={(e) => update(index, { issuer: e.target.value })}
              />
              <Textarea
                rows={2}
                placeholder="Description"
                value={signal.description ?? ''}
                onChange={(e) => update(index, { description: e.target.value })}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            className="self-start"
          >
            Add trust signal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
