import React from 'react';
import { MagnifyingGlassIcon, MapPinIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface SearchFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  stateFilter: string;
  onStateChange: (value: string) => void;
  county: string;
  onCountyChange: (value: string) => void;
  states: string[];
  counties: string[];
  className?: string;
}

export default function SearchFilters({
  searchInput,
  onSearchChange,
  stateFilter,
  onStateChange,
  county,
  onCountyChange,
  states,
  counties,
  className = ''
}: SearchFiltersProps) {
  return (
    <div className={`bg-theme-card rounded-xl shadow-sm border border-theme-border p-4 ${className}`}>
      

      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search by Title or Content
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search fire news..."
            className="w-full pl-10 pr-4 py-3 border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-teal-dark focus:border-transparent text-theme-primary bg-theme-card"
          />
        </div>
      </div>

      {/* Location Filters */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-theme-secondary flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-theme-teal-dark" />
          Location Filters
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              State
            </label>
            <select
              value={stateFilter}
              onChange={(e) => onStateChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-teal-dark focus:border-transparent bg-theme-card text-theme-primary"
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              County
            </label>
            <select
              value={county}
              onChange={(e) => onCountyChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-teal-dark focus:border-transparent bg-theme-card text-theme-primary"
            >
              <option value="">All Counties</option>
              {counties.map(countyName => (
                <option key={countyName} value={countyName}>{countyName}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Quick Actions
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onSearchChange('')}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Search
              </button>
              <button
                onClick={() => {
                  onStateChange('');
                  onCountyChange('');
                }}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchInput || stateFilter || county) && (
        <div className="mt-4 p-3 bg-theme-teal-light rounded-lg border border-theme-border">
          <div className="text-sm text-theme-teal-dark">
            <span className="font-medium">Active Filters:</span>
            <div className="mt-1 space-y-1">
              {searchInput && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-theme-teal-dark text-white px-2 py-1 rounded">
                    Search: "{searchInput}"
                  </span>
                </div>
              )}
              {stateFilter && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-theme-teal-dark text-white px-2 py-1 rounded">
                    State: {stateFilter}
                  </span>
                </div>
              )}
              {county && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-theme-teal-dark text-white px-2 py-1 rounded">
                    County: {county}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 