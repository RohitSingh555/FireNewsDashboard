import React from 'react';
import {
  NewspaperIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  CogIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  FireIcon
} from '@heroicons/react/24/outline';

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
  userRole: string;
  className?: string;
}

function VerificationBar({ value }: { value: number }) {
  const percent = Math.max(0, Math.min(10, Number(value))) * 10;
  let barColor = 'bg-gradient-to-r from-teal-400 to-teal-600';
  if (percent < 50) barColor = 'bg-gradient-to-r from-yellow-400 to-orange-500';
  if (percent < 30) barColor = 'bg-gradient-to-r from-red-500 to-red-600';
  
  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex-1 h-3 rounded-full bg-gray-200 shadow-inner overflow-hidden">
        <div className={`h-3 rounded-full ${barColor} shadow`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-semibold text-teal-600 ml-2">{value}/10</span>
    </div>
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
  userRole,
  className = ''
}: DataTableProps) {
  const canEdit = userRole === 'admin' || userRole === 'reporter';

  return (
    <div className={`bg-theme-card rounded-xl shadow-sm border border-theme-border overflow-hidden ${className}`}>
      <div className="overflow-x-auto w-full">
        <table className="w-full divide-y divide-theme-border">
          <thead className="bg-gradient-to-br from-theme-teal-light to-theme-card">
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
              <th className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider w-48">
                <div className="flex items-center gap-2">Content</div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-bold text-theme-teal-dark uppercase tracking-wider cursor-pointer hover:bg-theme-teal-light transition-colors"
                onClick={() => onSort('fire_related_score')}
              >
                <div className="flex items-center gap-2">
                  <FireIcon className="h-4 w-4" />
                  Score {sortBy === 'fire_related_score' && (sortOrder === 'asc' ? '▲' : '▼')}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-theme-teal-dark uppercase tracking-wider w-32">
                <div className="flex items-center gap-2">Actions</div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-theme-card divide-y divide-theme-border">
            {data.map((entry) => (
              <tr key={entry.id} className="hover:bg-theme-teal-light transition-colors">
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(entry.id)}
                    onChange={(e) => onSelectItem(entry.id, e.target.checked)}
                    className="accent-theme-teal-dark"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-theme-teal-dark max-w-md truncate" title={entry.title}>
                    {entry.title}
                  </div>
                </td>
                <td className="px-4 py-3 text-theme-secondary">
                  {entry.published_date ? new Date(entry.published_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-theme-secondary">{entry.state || '-'}</td>
                <td className="px-4 py-3 text-theme-secondary">{entry.county || '-'}</td>
                <td className="px-4 py-3 text-sm text-theme-primary">
                  <div 
                    className="truncate max-w-xs" 
                    title={entry.content || 'No content'}
                  >
                    {entry.content ? (entry.content.length > 20 ? `${entry.content.substring(0, 20)}...` : entry.content) : 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {typeof entry.fire_related_score === 'number' ? (
                    <VerificationBar value={entry.fire_related_score} />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-theme-teal-light text-theme-secondary">
                      <ExclamationTriangleIcon className="h-4 w-4 text-theme-warning" />
                      N/A
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="inline-flex items-center justify-center p-2 rounded-full bg-theme-teal-dark text-white shadow hover:bg-theme-teal-medium transition-colors"
                      onClick={() => onView(entry)}
                      title="View Details"
                    >
                      <MagnifyingGlassIcon className="h-4 w-4 text-white" />
                    </button>
                    {canEdit && (
                      <button
                        className="inline-flex items-center justify-center p-2 rounded-full bg-theme-success text-white shadow hover:bg-green-600 transition-colors"
                        onClick={() => onEdit(entry)}
                        title="Edit"
                      >
                        <CogIcon className="h-4 w-4 text-white" />
                      </button>
                    )}
                    {canEdit && (
                      <button
                        className="inline-flex items-center justify-center p-2 rounded-full bg-theme-danger text-white shadow hover:bg-red-600 transition-colors"
                        onClick={() => onDelete(entry.id)}
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5 text-white" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <NewspaperIcon className="h-12 w-12 text-theme-disabled mx-auto mb-4" />
          <h3 className="text-lg font-medium text-theme-primary mb-2">No fire news found</h3>
          <p className="text-theme-secondary">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
} 