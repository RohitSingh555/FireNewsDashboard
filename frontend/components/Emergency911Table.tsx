import React, { useState, useEffect } from 'react';
import {
  PhoneIcon,
  MapPinIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon as AlertIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import api from '../lib/axios';

interface Emergency911Data {
  id: number;
  title: string;
  incident_date: string | null;
  station_name: string | null;
  city: string | null;
  county: string | null;
  address: string | null;
  context: string | null;
  verified_address: string | null;
  latitude: number | null;
  longitude: number | null;
  address_accuracy_score: number | null;
  reporter_name: string | null;
  incident_type: string | null;
  priority_level: string | null;
  response_time: number | null;
  units_dispatched: string | null;
  status: string | null;
  notes: string | null;
  is_verified: boolean;
  is_hidden: boolean;
  created_at: string | null;
  updated_at: string | null;
}

interface Emergency911Response {
  total: number;
  page: number;
  page_size: number;
  items: Emergency911Data[];
}

interface Emergency911TableProps {
  data: Emergency911Data[];
  selectedIds: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: number, checked: boolean) => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onView: (item: any) => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  onToggleVerified: (id: number) => void;
  onToggleHidden: (id: number) => void;
  userRole: string;
}

// Progress Bar Component for Address Accuracy Score
function AccuracyBar({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-500 text-sm">N/A</span>;
  }
  
  const percent = Math.max(0, Math.min(100, value * 100));
  let barColor = 'bg-gradient-to-r from-green-400 to-green-600';
  if (percent < 50) barColor = 'bg-gradient-to-r from-yellow-400 to-orange-500';
  if (percent < 30) barColor = 'bg-gradient-to-r from-red-500 to-red-600';
  
  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex-1 h-3 rounded-full bg-gray-200 shadow-inner overflow-hidden">
        <div className={`h-3 rounded-full ${barColor} shadow transition-all duration-500 ease-out`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 ml-2">{percent.toFixed(1)}%</span>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ isVerified, isHidden }: { isVerified: boolean; isHidden: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`status-badge flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isVerified 
          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 shadow-sm' 
          : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border border-gray-200'
      }`}>
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
          isVerified ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`} />
        {isVerified ? 'Verified' : 'Unverified'}
      </div>
      
      {isHidden && (
        <div className="status-badge flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200 shadow-sm animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Hidden
        </div>
      )}
    </div>
  );
}

// Action Button Component
function ActionButton({ 
  isActive, 
  onClick, 
  activeIcon: ActiveIcon, 
  inactiveIcon: InactiveIcon, 
  activeColor, 
  inactiveColor, 
  tooltip 
}: {
  isActive: boolean;
  onClick: () => void;
  activeIcon: React.ComponentType<any>;
  inactiveIcon: React.ComponentType<any>;
  activeColor: string;
  inactiveColor: string;
  tooltip: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-teal-dark ${
        isActive ? activeColor : inactiveColor
      }`}
      title={tooltip}
    >
      {isActive ? <ActiveIcon className="h-4 w-4 text-white" /> : <InactiveIcon className="h-4 w-4 text-gray-600" />}
    </button>
  );
}

// Helper function to extract state from address
function extractStateFromAddress(address: string | null): string {
  if (!address) return '-';
  
  // Common patterns for extracting state from address
  const statePatterns = [
    /,\s*([A-Z]{2})\s*,?\s*USA?$/i,  // "33725 Walker Road, Ohio, USA" -> "Ohio"
    /,\s*([A-Z]{2})\s*$/i,           // "123 Main St, CA" -> "CA"
    /\s+([A-Z]{2})\s+\d{5}/i,        // "123 Main St CA 90210" -> "CA"
  ];
  
  for (const pattern of statePatterns) {
    const match = address.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  // If no pattern matches, try to extract the last part before "USA" or the last comma-separated part
  const parts = address.split(',').map(part => part.trim());
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 2]; // Second to last part
    if (lastPart && lastPart.length <= 20) { // Reasonable state name length
      return lastPart;
    }
  }
  
  return '-';
}

export default function Emergency911Table({
  data,
  selectedIds,
  onSelectAll,
  onSelectItem,
  onSort,
  sortBy,
  sortOrder,
  onView,
  onEdit,
  onDelete,
  onToggleVerified,
  onToggleHidden,
  userRole
}: Emergency911TableProps) {
  const isAdmin = userRole === 'admin';

  const handleRowClick = (entry: any, event: React.MouseEvent) => {
    // Don't open modal if clicking on checkbox or action buttons
    if ((event.target as HTMLElement).closest('input[type="checkbox"]') || 
        (event.target as HTMLElement).closest('button')) {
      return;
    }
    onView(entry);
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  return (
    <div className="bg-theme-card rounded-xl shadow-sm border border-theme-border overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-theme-border">
          <thead className="bg-gradient-to-br from-theme-teal-light to-theme-card sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.length > 0}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="accent-theme-teal-dark"
                />
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider cursor-pointer hover:bg-theme-teal-light transition-colors"
                onClick={() => onSort('title')}
              >
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4" />
                  Title {getSortIcon('title')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider cursor-pointer hover:bg-theme-teal-light transition-colors"
                onClick={() => onSort('incident_date')}
              >
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4" />
                  Published {getSortIcon('incident_date')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4" />
                  State
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  County
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider cursor-pointer hover:bg-theme-teal-light transition-colors"
                onClick={() => onSort('address_accuracy_score')}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Score {getSortIcon('address_accuracy_score')}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider w-32">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Status
                </div>
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider w-24">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    Verify
                  </div>
                </th>
              )}
              {isAdmin && (
                <th className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider w-24">
                  <div className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4" />
                    Visibility
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-theme-card divide-y divide-theme-border">
            {data.map((entry) => (
              <tr 
                key={entry.id} 
                className="hover:bg-gradient-to-r hover:from-theme-teal-light/50 hover:to-transparent transition-all duration-300 cursor-pointer group"
                onClick={(e) => handleRowClick(entry, e)}
              >
                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(entry.id)}
                    onChange={(e) => onSelectItem(entry.id, e.target.checked)}
                    className="accent-theme-teal-dark transform scale-110 transition-transform duration-200 hover:scale-125 focus:ring-2 focus:ring-theme-teal-dark focus:ring-offset-2"
                  />
                </td>
                
                <td className="px-4 py-3">
                  <div className="max-w-md">
                    <div className="font-semibold text-theme-teal-dark max-w-md truncate group-hover:text-theme-teal-medium transition-colors duration-200" title={entry.title}>
                      {entry.title}
                    </div>
                    {entry.context && (
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2" title={entry.context}>
                        {entry.context}
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-3 text-theme-secondary">
                  {formatDate(entry.incident_date || entry.created_at)}
                </td>
                
                <td className="px-4 py-3 text-theme-secondary">
                  {extractStateFromAddress(entry.address)}
                </td>
                
                <td className="px-4 py-3 text-theme-secondary">
                  {entry.county || '-'}
                </td>
                
                <td className="px-4 py-3">
                  {typeof entry.address_accuracy_score === 'number' ? (
                    <div className="cursor-pointer transform transition-transform duration-200 hover:scale-105">
                      <AccuracyBar value={entry.address_accuracy_score} />
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-theme-teal-light text-theme-secondary">
                      <ExclamationTriangleIcon className="h-4 w-4 text-theme-warning" />
                      N/A
                    </span>
                  )}
                </td>
                
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge isVerified={entry.is_verified} isHidden={entry.is_hidden} />
                </td>
                
                {isAdmin && (
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <ActionButton
                      isActive={entry.is_verified}
                      onClick={() => onToggleVerified(entry.id)}
                      activeIcon={CheckCircleIcon}
                      inactiveIcon={XCircleIcon}
                      activeColor="bg-green-500"
                      inactiveColor="bg-gray-100 hover:bg-gray-200"
                      tooltip={entry.is_verified ? 'Click to unverify' : 'Click to verify'}
                    />
                  </td>
                )}
                
                {isAdmin && (
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <ActionButton
                      isActive={entry.is_hidden}
                      onClick={() => onToggleHidden(entry.id)}
                      activeIcon={EyeSlashIcon}
                      inactiveIcon={EyeIcon}
                      activeColor="bg-gray-600"
                      inactiveColor="bg-gray-100 hover:bg-gray-200"
                      tooltip={entry.is_hidden ? 'Click to show' : 'Click to hide'}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="relative">
            <PhoneIcon className="h-16 w-16 text-theme-disabled mx-auto mb-6 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-theme-teal-light to-transparent rounded-full blur-xl opacity-30 animate-pulse-glow" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary mb-3">No 911 emergency data found</h3>
          <p className="text-theme-secondary max-w-md mx-auto">
            Try adjusting your filters or search terms to find relevant 911 emergency entries.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-theme-teal-medium rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-theme-teal-medium rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-theme-teal-medium rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 