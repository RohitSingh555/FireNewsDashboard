import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, FunnelIcon } from '@heroicons/react/24/outline';
import SearchFilters from './SearchFilters';
import DateFilters from './DateFilters';
import TagFilter from './TagFilter';

interface Tag {
  id: number;
  name: string;
  category?: string;
  color?: string;
}

interface FiltersAccordionProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  stateFilter: string;
  onStateChange: (value: string) => void;
  county: string;
  onCountyChange: (value: string) => void;
  states: string[];
  counties: string[];
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  className?: string;
}

export default function FiltersAccordion({
  searchInput,
  onSearchChange,
  stateFilter,
  onStateChange,
  county,
  onCountyChange,
  states,
  counties,
  onDateRangeChange,
  selectedTags,
  onTagsChange,
  className = ''
}: FiltersAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`bg-theme-card rounded-xl shadow-sm border border-theme-border overflow-hidden ${className}`}>
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-theme-teal-light to-theme-card hover:from-theme-card to-theme-teal-light transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <FunnelIcon className="h-5 w-5 text-theme-teal-dark" />
          <span className="text-lg font-semibold text-theme-primary">Filters & Search</span>
          <span className="text-sm text-white bg-theme-teal-dark px-2 py-1 rounded-full">
            {searchInput || stateFilter || county ? 'Active' : 'All'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-theme-slate transition-transform duration-200" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-theme-slate transition-transform duration-200" />
          )}
        </div>
      </button>

      {/* Accordion Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 space-y-6">
          {/* Search & Location Filters */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
              <SearchFilters
                searchInput={searchInput}
                onSearchChange={onSearchChange}
                stateFilter={stateFilter}
                onStateChange={onStateChange}
                county={county}
                onCountyChange={onCountyChange}
                states={states}
                counties={counties}
              />
            </div>

            {/* Date Filters */}
            <div>
              <DateFilters
                onDateRangeChange={onDateRangeChange}
              />
            </div>
          </div>

          {/* Tag Filters */}
          <div className="border-t border-theme-border pt-6">
            <h3 className="text-sm font-medium text-theme-secondary mb-3">Filter by Tags</h3>
            <TagFilter
              selectedTags={selectedTags}
              onTagsChange={onTagsChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 