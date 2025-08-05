import React, { useState } from 'react';
import {
  NewspaperIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  FireIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  SignalIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import BookmarkButton from './BookmarkButton';

interface DataTableProps {
  data: any[];
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
  className?: string;
}

// Helper function to round up fire related scores
function roundFireScore(score: number | null | undefined): number {
  if (score === null || score === undefined) return 0;
  
  // If it's already an integer, return as is
  if (Number.isInteger(score)) return score;
  
  // If it's a float less than 1, multiply by 10 and round up
  if (score < 1) {
    return Math.ceil(score * 10);
  }
  
  // If it's a float >= 1, round up to the nearest integer
  return Math.ceil(score);
}

function VerificationBar({ value }: { value: number }) {
  const roundedValue = roundFireScore(value);
  const percent = Math.max(0, Math.min(100, roundedValue * 10));
  
  // Color logic based on score
  let strokeColor = '#10b981'; // teal-500
  let bgColor = '#ecfdf5'; // teal-50
  let textColor = '#059669'; // teal-600
  
  if (percent < 50) {
    strokeColor = '#f59e0b'; // amber-500
    bgColor = '#fffbeb'; // amber-50
    textColor = '#d97706'; // amber-600
  }
  if (percent < 30) {
    strokeColor = '#ef4444'; // red-500
    bgColor = '#fef2f2'; // red-50
    textColor = '#dc2626'; // red-600
  }
  
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 50 50">
          {/* Background circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="transparent"
            className="opacity-30"
          />
          {/* Progress circle */}
          <circle
            cx="25"
            cy="25"
            r={radius}
            stroke={strokeColor}
            strokeWidth="4"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-xs font-bold"
            style={{ color: textColor }}
          >
            {roundedValue}
          </span>
        </div>
      </div>
    </div>
  );
}

// Beautiful Animated Status Badge Component
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

// Beautiful Source Badge Component with Icons
function SourceBadge({ reporterName, source }: { reporterName: string; source?: string }) {
  const getSourceConfig = (reporter: string) => {
    const lowerReporter = reporter?.toLowerCase() || '';
    
    if (lowerReporter.includes('twitter') || lowerReporter.includes('bot')) {
      return {
        icon: () => (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        ),
        label: 'Twitter/X',
        bgColor: 'bg-gradient-to-r from-blue-100 to-cyan-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500'
      };
    }
    
    if (lowerReporter === '911' || lowerReporter.includes('emergency')) {
      return {
        icon: ExclamationTriangleIcon,
        label: '911 Emergency',
        bgColor: 'bg-gradient-to-r from-red-100 to-pink-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500'
      };
    }
    
    if (lowerReporter === 'web' || lowerReporter.includes('web')) {
      return {
        icon: GlobeAltIcon,
        label: 'Web Source',
        bgColor: 'bg-gradient-to-r from-green-100 to-emerald-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        iconColor: 'text-green-500'
      };
    }
    
    if (lowerReporter.includes('news') || lowerReporter.includes('media')) {
      return {
        icon: NewspaperIcon,
        label: 'News Media',
        bgColor: 'bg-gradient-to-r from-purple-100 to-indigo-100',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        iconColor: 'text-purple-500'
      };
    }
    
    if (lowerReporter.includes('official') || lowerReporter.includes('gov')) {
      return {
        icon: BuildingOfficeIcon,
        label: 'Official',
        bgColor: 'bg-gradient-to-r from-gray-100 to-slate-100',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200',
        iconColor: 'text-gray-500'
      };
    }
    
    // Default for unknown sources
    return {
      icon: UserIcon,
      label: reporter || 'Unknown',
      bgColor: 'bg-gradient-to-r from-orange-100 to-amber-100',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-500'
    };
  };

  const config = getSourceConfig(reporterName);
  const IconComponent = config.icon;

  return (
    <div className="flex items-center gap-2">
      <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
      <span className="text-sm font-medium text-gray-700">{config.label}</span>
    </div>
  );
}

// Minimal Action Button Component
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
      className={`group relative p-2 rounded-lg transition-all duration-200 ease-out ${
        isActive 
          ? `${activeColor} shadow-sm` 
          : `${inactiveColor} hover:shadow-sm`
      }`}
      title={tooltip}
    >
      <div className="relative">
        {isActive ? (
          <ActiveIcon className="h-4 w-4 text-white transition-all duration-200" />
        ) : (
          <InactiveIcon className="h-4 w-4 text-gray-500 transition-all duration-200" />
        )}
      </div>
    </button>
  );
}

// Beautiful Custom Tooltip Component
function InfoTooltip({ children, content }: { children: React.ReactNode; content: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div 
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible && (
        <div 
          className="fixed z-[9999] animate-fade-in pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-xl shadow-2xl border border-gray-700/50 p-3 max-w-xs">
            <div className="flex items-start gap-2">
              <InformationCircleIcon className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="leading-relaxed">
                {content}
              </div>
            </div>
            {/* Arrow pointing up */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 w-3 h-3 bg-gray-900/95 rotate-45" />
          </div>
        </div>
      )}
    </>
  );
}

export default function DataTable({
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
  userRole,
  className = ''
}: DataTableProps) {
  const canEdit = userRole === 'admin' || userRole === 'reporter';
  const isAdmin = userRole === 'admin';

  const handleRowClick = (entry: any, event: React.MouseEvent) => {
    // Don't open modal if clicking on checkbox or action buttons
    if ((event.target as HTMLElement).closest('input[type="checkbox"]') || 
        (event.target as HTMLElement).closest('button')) {
      return;
    }
    onView(entry);
  };

  const getScoreTooltip = (score: number) => {
    const roundedScore = roundFireScore(score);
    if (roundedScore >= 8) return "High Priority - Strong fire-related content";
    if (roundedScore >= 6) return "Medium Priority - Moderate fire-related content";
    if (roundedScore >= 4) return "Low Priority - Weak fire-related content";
    return "Very Low Priority - Minimal fire-related content";
  };

  return (
    <div className={`bg-theme-card rounded-xl shadow-sm border border-theme-border overflow-hidden ${className}`}>
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
                  <NewspaperIcon className="h-4 w-4" />
                  Title {sortBy === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider cursor-pointer hover:bg-theme-teal-light transition-colors"
                onClick={() => onSort('published_date')}
              >
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4" />
                  Published {sortBy === 'published_date' && (sortOrder === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider cursor-pointer hover:bg-theme-teal-light transition-colors"
                onClick={() => onSort('state')}
              >
                <div className="flex items-center gap-2">
                  State {sortBy === 'state' && (sortOrder === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider cursor-pointer hover:bg-theme-teal-light transition-colors"
                onClick={() => onSort('county')}
              >
                <div className="flex items-center gap-2">
                  County {sortBy === 'county' && (sortOrder === 'asc' ? '▲' : '▼')}
                </div>
              </th>

              <th 
                className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider cursor-pointer hover:bg-theme-teal-light transition-colors"
                onClick={() => onSort('reporter_name')}
              >
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="h-4 w-4" />
                  Source {sortBy === 'reporter_name' && (sortOrder === 'asc' ? '▲' : '▼')}
                  <InfoTooltip content={
                    <div>
                      <div className="font-semibold text-blue-400 mb-1">Data Source</div>
                      <div className="text-gray-300 text-xs">
                        Origin of the fire news: Twitter Bot, Web Sources, 911 Emergency, News Media, Official Sources
                      </div>
                    </div>
                  }>
                    <InformationCircleIcon 
                      className="h-5 w-5 text-theme-secondary hover:text-theme-teal-dark transition-colors cursor-help" 
                    />
                  </InfoTooltip>
                </div>
              </th>

              <th 
                className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider cursor-pointer hover:bg-theme-teal-light transition-colors"
                onClick={() => onSort('fire_related_score')}
                title="Click to sort by fire-related score"
              >
                <div className="flex items-center gap-2">
                  <FireIcon className="h-4 w-4" />
                  Score {sortBy === 'fire_related_score' && (sortOrder === 'asc' ? '▲' : '▼')}
                  <InfoTooltip content={
                    <div>
                      <div className="font-semibold text-blue-400 mb-1">Fire Related Score</div>
                      <div className="text-gray-300 text-xs">
                        AI analysis of fire relevance: 8-10 (High), 6-7 (Medium), 4-5 (Low), 0-3 (Very Low)
                      </div>
                    </div>
                  }>
                    <InformationCircleIcon 
                      className="h-5 w-5 text-theme-secondary hover:text-theme-teal-dark transition-colors cursor-help" 
                    />
                  </InfoTooltip>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider w-32">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Status
                  <InfoTooltip content={
                    <div>
                      <div className="font-semibold text-blue-400 mb-1">Content Status</div>
                      <div className="text-gray-300 text-xs">
                        Verification & visibility: Verified (confirmed), Unverified (pending), Hidden (not public)
                      </div>
                    </div>
                  }>
                    <InformationCircleIcon 
                      className="h-5 w-5 text-theme-secondary hover:text-theme-teal-dark transition-colors cursor-help" 
                    />
                  </InfoTooltip>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider w-20">
                <div className="flex items-center gap-2">
                  <BookmarkButton newsId={0} dataType="fire_news" className="hidden" />
                  <span>Bookmark</span>
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
                  {entry.url ? (
                    <a 
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-theme-teal-dark max-w-md truncate group-hover:text-theme-teal-medium hover:underline transition-colors duration-200 flex items-center gap-1"
                      title={`${entry.title} - Click to open source article`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {entry.title}
                      <span className="text-xs text-theme-secondary opacity-60">↗</span>
                    </a>
                  ) : (
                    <div className="font-semibold text-theme-teal-dark max-w-md truncate group-hover:text-theme-teal-medium transition-colors duration-200" title={entry.title}>
                      {entry.title}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-theme-secondary">
                  {(entry.published_date || entry.incident_date) ? new Date(entry.published_date || entry.incident_date).toLocaleDateString('en-US') : '-'}
                </td>
                <td className="px-4 py-3 text-theme-secondary">{entry.state || '-'}</td>
                <td className="px-4 py-3 text-theme-secondary">{entry.county || '-'}</td>
                <td className="px-4 py-3">
                  <SourceBadge reporterName={entry.reporter_name} source={entry.source} />
                </td>
                <td className="px-4 py-3">
                  {typeof entry.fire_related_score === 'number' ? (
                    <div 
                      className="cursor-pointer transform transition-transform duration-200 hover:scale-105"
                      title={getScoreTooltip(entry.fire_related_score)}
                    >
                      <VerificationBar value={entry.fire_related_score} />
                    </div>
                  ) : typeof entry.address_accuracy_score === 'number' ? (
                    <div 
                      className="cursor-pointer transform transition-transform duration-200 hover:scale-105"
                      title={`Address Accuracy Score: ${(entry.address_accuracy_score * 100).toFixed(1)}%`}
                    >
                      <div className="w-full flex items-center gap-2">
                        <div className="flex-1 h-3 rounded-full bg-gray-200 shadow-inner overflow-hidden">
                          <div className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow transition-all duration-500 ease-out" 
                               style={{ width: `${entry.address_accuracy_score * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-blue-600 ml-2">{(entry.address_accuracy_score * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-theme-teal-light text-theme-secondary">
                      <ExclamationTriangleIcon className="h-4 w-4 text-theme-warning" />
                      N/A
                    </span>
                  )}
                </td>
                
                {/* Status Column */}
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge isVerified={entry.is_verified} isHidden={entry.is_hidden} />
                </td>
                
                {/* Bookmark Column */}
                <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <BookmarkButton 
                    newsId={entry.id} 
                    dataType="fire_news"
                    onBookmarkChange={(isBookmarked) => {
                      // Optional: Add any additional logic when bookmark status changes
                    }}
                  />
                </td>
                
                {/* Verify Action Column - Admin Only */}
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
                
                {/* Visibility Action Column - Admin Only */}
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
            <NewspaperIcon className="h-16 w-16 text-theme-disabled mx-auto mb-6 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-theme-teal-light to-transparent rounded-full blur-xl opacity-30 animate-pulse-glow" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary mb-3">No fire news found</h3>
          <p className="text-theme-secondary max-w-md mx-auto">
            Try adjusting your filters or search terms to find relevant fire news entries.
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