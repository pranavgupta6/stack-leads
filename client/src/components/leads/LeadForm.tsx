import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, Button } from '../ui';
import { Lead, CreateLeadDto } from '../../types';

interface LeadFormProps {
  onSubmit: (data: CreateLeadDto) => Promise<void>;
  defaultValues?: Partial<Lead>;
  isSubmitting: boolean;
  submitLabel?: string;
}

const leadFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Please enter a valid email').trim(),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']),
  source: z.enum(['Website', 'Instagram', 'Referral']),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Lost', label: 'Lost' },
];

const sourceOptions = [
  { value: 'Website', label: 'Website' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Referral', label: 'Referral' },
];

const LeadForm = ({ onSubmit, defaultValues, isSubmitting, submitLabel }: LeadFormProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      status: defaultValues?.status || 'New',
      source: defaultValues?.source || 'Website',
    },
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      status: defaultValues?.status || 'New',
      source: defaultValues?.source || 'Website',
    });
  }, [defaultValues, reset]);

  const handleFormSubmit = async (data: LeadFormData) => {
    await onSubmit(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleFormSubmit)}>
      <Input label="Name" placeholder="Enter lead name" {...register('name')} error={errors.name?.message} />
      <Input
        label="Email"
        type="email"
        placeholder="lead@example.com"
        {...register('email')}
        error={errors.email?.message}
      />
      <Select
        label="Status"
        {...register('status')}
        options={statusOptions}
        placeholder="Select status"
        error={errors.status?.message}
      />
      <Select
        label="Source"
        {...register('source')}
        options={sourceOptions}
        placeholder="Select source"
        error={errors.source?.message}
      />
      <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
        {submitLabel || 'Save Lead'}
      </Button>
    </form>
  );
};

export default LeadForm;