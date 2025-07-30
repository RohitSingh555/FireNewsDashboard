import * as React from 'react';
import {
  HomeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  NewspaperIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../lib/auth';
import api from '../lib/axios';
import { useEffect, useRef } from 'react';

function ConfirmModal({ open, onClose, onConfirm, message }: { open: boolean; onClose: () => void; onConfirm: () => void; message: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="mb-4 text-gray-800">{message}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

function VerificationBar({ value }: { value: number }) {
  // value: 0-10
  const percent = Math.max(0, Math.min(10, Number(value))) * 10;
  let barColor = 'bg-gradient-to-r from-shopify-blue via-shopify-light-blue to-shopify-pale-blue';
  if (percent < 50) barColor = 'bg-gradient-to-r from-yellow-400 to-yellow-200';
  if (percent < 30) barColor = 'bg-gradient-to-r from-red-500 to-red-200';
  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-gray-200 to-shopify-bg shadow-inner overflow-hidden border border-shopify-pale-blue">
        <div className={`h-3 rounded-full ${barColor} shadow`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-semibold text-shopify-blue ml-2">{value}/10</span>
    </div>
  );
}

function DetailsModal({ open, onClose, entry }: { open: boolean; onClose: () => void; entry: any }) {
  if (!open || !entry) return null;
  
  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    
    // Format dates
    if (key.includes('date') || key.includes('at')) {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return String(value);
      }
    }
    
    // Format URLs
    if (key === 'url' && typeof value === 'string') {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-shopify-blue hover:text-shopify-light-blue underline break-all"
        >
          {value}
        </a>
      );
    }
    
    // Format long text
    if (typeof value === 'string' && value.length > 100) {
      return (
        <div className="max-h-32 overflow-y-auto">
          <span className="whitespace-pre-line break-words">{value}</span>
        </div>
      );
    }
    
    return String(value);
  };

  const getFieldLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      id: 'ID',
      title: 'Title',
      content: 'Content',
      published_date: 'Published Date',
      url: 'URL',
      source: 'Source',
      fire_related_score: 'Fire Related Score',
      verification_result: 'Verification Result',
      verified_at: 'Verified At',
      state: 'State',
      county: 'County',
      city: 'City',
      province: 'Province',
      country: 'Country',
      latitude: 'Latitude',
      longitude: 'Longitude',
      image_url: 'Image URL',
      tags: 'Tags',
      reporter_name: 'Reporter Name',
      created_at: 'Created At',
      updated_at: 'Updated At'
    };
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isImportantField = (key: string) => {
    return ['title', 'content', 'published_date', 'source', 'state', 'county'].includes(key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-shopify-pale-blue w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-shopify-blue to-shopify-light-blue px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <NewspaperIcon className="h-6 w-6 text-white" />
              <h3 className="text-xl font-bold text-white">Fire News Details</h3>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:text-shopify-pale-blue text-2xl font-bold transition-colors duration-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Important Fields */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-shopify-blue border-b border-shopify-pale-blue pb-2">
                Primary Information
              </h4>
              {Object.entries(entry)
                .filter(([key]) => isImportantField(key))
                .map(([key, value]) => (
                  <div key={key} className="bg-shopify-bg rounded-lg p-4 border border-shopify-pale-blue">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-shopify-blue uppercase tracking-wide">
                        {getFieldLabel(key)}
                      </span>
                      <div className="text-shopify-gray-blue">
                        {formatValue(key, value)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Secondary Fields */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-shopify-blue border-b border-shopify-pale-blue pb-2">
                Additional Details
              </h4>
              {Object.entries(entry)
                .filter(([key]) => !isImportantField(key))
                .map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        {getFieldLabel(key)}
                      </span>
                      <div className="text-gray-800 text-sm">
                        {formatValue(key, value)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-shopify-pale-blue">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Close
            </button>
            {entry.url && (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-shopify-blue to-shopify-light-blue text-white hover:from-shopify-light-blue hover:to-shopify-blue transition-all duration-200 font-medium shadow-md"
              >
                View Source
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = require('next/router').useRouter();
  const [fireNewsEntries, setFireNewsEntries] = React.useState<Array<any>>([]);
  const [newsLoading, setNewsLoading] = React.useState(true);
  const [newsError, setNewsError] = React.useState('');
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<number | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = React.useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [detailsEntry, setDetailsEntry] = React.useState<any>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [sortBy, setSortBy] = React.useState('published_date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [county, setCounty] = React.useState('');
  const [stateFilter, setStateFilter] = React.useState('');
  const [counties, setCounties] = React.useState<string[]>([]);
  const [states, setStates] = React.useState<string[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch unique counties and states for filters
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await api.get('/api/fire-news', { params: { page: 1, page_size: 100 } });
        const all = res.data.items;
        setCounties([...new Set(all.map((n: any) => n.county).filter(Boolean))] as string[]);
        setStates([...new Set(all.map((n: any) => n.state).filter(Boolean))] as string[]);
      } catch {}
    }
    fetchFilters();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchInput]);

  // Fetch paginated, filtered, sorted data
  const fetchNews = React.useCallback(async () => {
    try {
      setNewsLoading(true);
      setNewsError('');
      const res = await api.get('/api/fire-news', {
        params: {
          page,
          page_size: pageSize,
          sort_by: sortBy,
          sort_order: sortOrder,
          county: county || undefined,
          state: stateFilter || undefined,
          search: search || undefined,
        },
      });
      setFireNewsEntries(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      setNewsError('Failed to load fire news.');
    } finally {
      setNewsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, county, stateFilter, search]);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  // Sorting handler
  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
    setPage(1);
  };

  // Pagination controls
  const totalPages = Math.ceil(total / pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const openDeleteModal = (id: number) => {
    setDeleteTarget(id);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteModalOpen(false);
  };
  const handleDelete = async () => {
    if (deleteTarget == null) return;
    try {
      await api.delete(`/api/fire-news/${deleteTarget}`);
      setFireNewsEntries(entries => entries.filter(e => e.id !== deleteTarget));
      setSelectedIds(ids => ids.filter(id => id !== deleteTarget));
    } catch (err) {
      alert('Failed to delete entry.');
    } finally {
      closeDeleteModal();
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };
  const selectAll = () => {
    setSelectedIds(fireNewsEntries.map(e => e.id));
  };
  const deselectAll = () => {
    setSelectedIds([]);
  };
  const openBulkDeleteModal = () => setBulkDeleteModalOpen(true);
  const closeBulkDeleteModal = () => setBulkDeleteModalOpen(false);
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/api/fire-news/${id}`)));
      setFireNewsEntries(entries => entries.filter(e => !selectedIds.includes(e.id)));
      setSelectedIds([]);
    } catch (err) {
      alert('Failed to delete selected entries.');
    } finally {
      closeBulkDeleteModal();
    }
  };

  if (loading || !user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-shopify-bg to-shopify-light-blue">
        <span className="text-shopify-blue text-xl font-bold animate-pulse">Loading...</span>
      </div>
    );

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-shopify-bg to-shopify-light-blue overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-shopify-pale-blue shadow-lg p-6 fixed top-0 left-0 h-screen z-30">
        <div className="flex items-center gap-3 mb-10">
          <HomeIcon className="h-8 w-8 text-shopify-blue" />
          <span className="text-2xl font-extrabold text-shopify-blue">FireNews</span>
        </div>
        <nav className="flex flex-col gap-4 flex-1">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-shopify-blue bg-shopify-pale-blue font-semibold">
            <HomeIcon className="h-5 w-5" /> Dashboard
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-shopify-blue hover:bg-shopify-pale-blue">
            <UserCircleIcon className="h-5 w-5" /> Profile
          </button>
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 mt-auto"
            onClick={logout}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" /> Logout
          </button>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen overflow-x-auto w-full">
        {/* Header */}
        <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between border-b border-shopify-pale-blue sticky top-0 left-0 z-20">
          <span className="text-xl font-bold text-shopify-blue">Dashboard</span>
          <span className="text-shopify-gray-blue font-medium">{user.email}</span>
        </header>
        {/* Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-shopify-pale-blue p-4 w-full">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
              <div className="flex items-center gap-3 flex-1">
                <NewspaperIcon className="h-7 w-7 text-shopify-blue" />
                <h2 className="text-2xl font-bold text-shopify-blue">Fire News</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-2 flex-1 justify-end">
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search title or content..."
                  className="px-3 py-2 rounded-lg border border-shopify-pale-blue focus:ring-2 focus:ring-shopify-blue focus:outline-none text-shopify-blue bg-shopify-bg shadow-inner w-full md:w-64"
                />
                <select
                  value={stateFilter}
                  onChange={e => { setStateFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-lg border border-shopify-pale-blue text-shopify-blue bg-shopify-bg shadow-inner"
                >
                  <option value="">All States</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={county}
                  onChange={e => { setCounty(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-lg border border-shopify-pale-blue text-shopify-blue bg-shopify-bg shadow-inner"
                >
                  <option value="">All Counties</option>
                  {counties.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center mb-4 gap-2">
              {selectedIds.length > 0 && (
                <button
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-br from-shopify-blue to-shopify-light-blue text-white shadow-md hover:from-shopify-light-blue hover:to-shopify-blue transition border border-shopify-pale-blue"
                  onClick={() => setBulkDeleteModalOpen(true)}
                >
                  <TrashIcon className="h-5 w-5" /> Delete Selected
                </button>
              )}
            </div>
            <div className="overflow-x-auto w-full">
              <table className="min-w-[900px] w-full divide-y divide-shopify-pale-blue bg-white rounded-xl shadow-lg">
                <thead className="bg-gradient-to-br from-shopify-bg to-shopify-light-blue">
                  <tr>
                    <th className="p-3 text-left text-xs font-bold text-shopify-blue uppercase tracking-wider w-8">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === fireNewsEntries.length && fireNewsEntries.length > 0}
                        onChange={e => setSelectedIds(e.target.checked ? fireNewsEntries.map((n: any) => n.id) : [])}
                        className="accent-shopify-blue"
                      />
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-shopify-blue uppercase tracking-wider cursor-pointer" onClick={() => handleSort('title')}>
                      <span className="flex flex-row items-center gap-1">
                        <NewspaperIcon className="inline h-5 w-5" /> Title {sortBy === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </span>
                    </th>
                    <th
                      className={`p-3 text-left text-xs font-bold text-shopify-blue uppercase tracking-wider cursor-pointer transition-colors duration-150 hover:bg-shopify-bg/60 select-none`}
                      onClick={() => handleSort('published_date')}
                    >
                      <span className="flex flex-row items-center gap-1">
                        <CalendarDaysIcon className="inline h-5 w-5 text-shopify-light-blue" />
                        <span>Published</span>
                        {sortBy === 'published_date' && (
                          <svg
                            className="inline h-4 w-4 ml-1 text-shopify-blue align-middle"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            {sortOrder === 'asc' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 15.75L12 8.25l-7.5 7.5" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 8.25L12 15.75l7.5-7.5" />
                            )}
                          </svg>
                        )}
                      </span>
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-shopify-blue uppercase tracking-wider cursor-pointer" onClick={() => handleSort('state')}>
                      State {sortBy === 'state' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-shopify-blue uppercase tracking-wider cursor-pointer" onClick={() => handleSort('county')}>
                      County {sortBy === 'county' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-shopify-blue uppercase tracking-wider" style={{ width: '350px' }}>Content</th>
                    <th className="p-3 text-left text-xs font-bold text-shopify-blue uppercase tracking-wider cursor-pointer" style={{ width: '200px' }} onClick={() => handleSort('source')}>
                      Source {sortBy === 'source' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="p-3 text-left text-xs font-bold text-shopify-blue uppercase tracking-wider cursor-pointer" onClick={() => handleSort('fire_related_score')}>
                      Verification {sortBy === 'fire_related_score' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </th>
                    <th className="p-3 text-center text-xs font-bold text-shopify-blue uppercase tracking-wider w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-shopify-pale-blue">
                  {fireNewsEntries.map((entry: any) => (
                    <tr key={entry.id} className="hover:bg-shopify-bg/60 transition">
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(entry.id)}
                          onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, entry.id] : selectedIds.filter(id => id !== entry.id))}
                          className="accent-shopify-blue"
                        />
                      </td>
                      <td className="p-3 font-semibold text-shopify-blue max-w-xs truncate whitespace-nowrap" title={entry.title}>{entry.title}</td>
                      <td className="p-3 text-shopify-gray-blue">{entry.published_date ? new Date(entry.published_date).toLocaleDateString() : '-'}</td>
                      <td className="p-3 text-shopify-gray-blue">{entry.state || '-'}</td>
                      <td className="p-3 text-shopify-gray-blue">{entry.county || '-'}</td>
                      <td className="p-3 text-shopify-blue max-w-lg truncate cursor-pointer whitespace-nowrap" title={entry.content} onClick={() => { setDetailsEntry(entry); setDetailsModalOpen(true); }}>
                        {entry.content}
                        <button
                          className="ml-2 text-xs text-shopify-blue underline hover:text-shopify-light-blue"
                          onClick={e => { e.stopPropagation(); setDetailsEntry(entry); setDetailsModalOpen(true); }}
                        >
                          View Details
                        </button>
                      </td>
                      <td className="p-3 text-shopify-blue font-mono max-w-xs truncate whitespace-nowrap" style={{ width: '200px' }} title={entry.source}>{entry.source}</td>
                      <td className="p-3">
                        {typeof entry.fire_related_score === 'number' ? (
                          <VerificationBar value={entry.fire_related_score} />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-shopify-pale-blue text-shopify-blue">
                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" /> N/A
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          className="inline-flex items-center justify-center p-2 rounded-full bg-gradient-to-br from-shopify-blue to-shopify-light-blue text-white shadow hover:from-shopify-light-blue hover:to-shopify-blue border border-shopify-pale-blue"
                          onClick={() => { setDeleteTarget(entry.id); setDeleteModalOpen(true); }}
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-shopify-gray-blue text-sm">
                Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total}
              </div>
              <div className="flex gap-1">
                <button
                  className="px-3 py-1 rounded-l-lg border border-shopify-pale-blue bg-shopify-bg text-shopify-blue disabled:opacity-50"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >Prev</button>
                {pageNumbers.slice(Math.max(0, page - 3), page + 2).map(p => (
                  <button
                    key={p}
                    className={`px-3 py-1 border border-shopify-pale-blue ${p === page ? 'bg-shopify-blue text-white' : 'bg-shopify-bg text-shopify-blue'} font-semibold`}
                    onClick={() => setPage(p)}
                  >{p}</button>
                ))}
                <button
                  className="px-3 py-1 rounded-r-lg border border-shopify-pale-blue bg-shopify-bg text-shopify-blue disabled:opacity-50"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >Next</button>
              </div>
            </div>
            <ConfirmModal
              open={deleteModalOpen}
              onClose={() => setDeleteModalOpen(false)}
              onConfirm={async () => {
                if (deleteTarget !== null) {
                  await handleDelete();
                  setDeleteModalOpen(false);
                }
              }}
              message="Are you sure you want to delete this entry?"
            />
            <ConfirmModal
              open={bulkDeleteModalOpen}
              onClose={() => setBulkDeleteModalOpen(false)}
              onConfirm={async () => {
                await handleBulkDelete();
                setBulkDeleteModalOpen(false);
              }}
              message={`Are you sure you want to delete ${selectedIds.length} selected entries?`}
            />
            <DetailsModal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} entry={detailsEntry} />
          </div>
        </main>
      </div>
    </div>
  );
} 