import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  className?: string;
}

const statusOptions = [
  { value: '', label: 'All Statuses', color: 'bg-gray-100 text-gray-700' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'resolved', label: 'Resolved', color: 'bg-blue-100 text-blue-700' },
  { value: 'new', label: 'New', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
];

export default function StatusFilter({ selectedStatus, onStatusChange, className = '' }: StatusFilterProps) {
  const selectedOption = statusOptions.find(option => option.value === selectedStatus) || statusOptions[0];

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <FiFilter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Status:</span>
        
        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Clear button */}
        {selectedStatus && (
          <button
            onClick={() => onStatusChange('')}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Clear status filter"
          >
            <FiX className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Selected status badge */}
      {selectedStatus && (
        <div className="mt-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedOption.color}`}>
            {selectedOption.label}
          </span>
        </div>
      )}
    </div>
  );
} 