import { useEffect, useState } from 'react';
import { LeadFilters, LeadStatus, LeadSource } from '../../types';
import { Select, Button } from '../ui';
import { useDebounce } from '../../hooks/useDebounce';

interface LeadFiltersProps {
  filters: LeadFilters;
  onFiltersChange: (filters: Partial<LeadFilters>) => void;
  onReset: () => void;
  isLoading: boolean;
}

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

const sortOptions = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const LeadFiltersComponent = ({ filters, onFiltersChange, onReset, isLoading }: LeadFiltersProps) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const nextSearch = debouncedSearch.trim();
    if (nextSearch !== (filters.search || '')) {
      onFiltersChange({ search: nextSearch, page: 1 });
    }
  }, [debouncedSearch, filters.search, onFiltersChange]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Search
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="w-40">
          <Select
            label="Status"
            value={filters.status || ''}
            onChange={(event) => onFiltersChange({ status: event.target.value as LeadStatus | '', page: 1 })}
            options={statusOptions}
            placeholder="All Statuses"
          />
        </div>

        <div className="w-40">
          <Select
            label="Source"
            value={filters.source || ''}
            onChange={(event) => onFiltersChange({ source: event.target.value as LeadSource | '', page: 1 })}
            options={sourceOptions}
            placeholder="All Sources"
          />
        </div>

        <div className="w-36">
          <Select
            label="Sort"
            value={filters.sort || 'latest'}
            onChange={(event) => onFiltersChange({ sort: event.target.value as 'latest' | 'oldest', page: 1 })}
            options={sortOptions}
            placeholder=""
          />
        </div>

        <div className="pb-0.5">
          <Button variant="ghost" size="md" onClick={onReset} disabled={isLoading}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadFiltersComponent;