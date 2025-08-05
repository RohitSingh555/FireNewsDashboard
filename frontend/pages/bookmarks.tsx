import * as React from 'react';
import {
  FiHome,
  FiUser,
  FiLogOut,
  FiCheckCircle,
  FiXCircle,
  FiGlobe,
  FiCalendar,
  FiFileText,
  FiTrash2,
  FiAlertTriangle,
  FiRotateCw,
  FiSearch,
  FiUsers,
  FiShield,
  FiSettings,
  FiMessageSquare,
  FiTrendingUp,
  FiClock,
  FiBarChart,
  FiBell,
  FiZap,
  FiEyeOff,
  FiTag,
  FiEye,
  FiEdit,
  FiPhone,
  FiMapPin,
  FiBookmark,
  FiBookmarkCheck
} from 'react-icons/fi';
import { useAuth } from '../lib/auth';
import api from '../lib/axios';
import { useEffect, useRef, useState } from 'react';
import DataTable from '../components/DataTable';
import Emergency911Table from '../components/Emergency911Table';
import Pagination from '../components/Pagination';
import Sidebar from '../components/Sidebar';
import TopNavigation from '../components/TopNavigation';
import TagSelector from '../components/TagSelector';
import SearchFilters from '../components/SearchFilters';
import DateFilters from '../components/DateFilters';
import TagFilter from '../components/TagFilter';

interface Tag {
  id: number;
  name: string;
  category?: string;
  color?: string;
}

interface BookmarkData {
  id: number;
  user_id: number;
  news_id: number;
  data_type: string;
  created_at: string;
  news: any;
}

// Modal Components
function ConfirmModal({ open, onClose, onConfirm, message, title = "Confirm Action" }: { 
  open: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  message: string;
  title?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="mb-4 text-gray-600">{message}</div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// View Modal Component
function ViewModal({ 
  open, 
  onClose, 
  entry, 
  onEdit, 
  onDelete, 
  onToggleVerified,
  onToggleHidden,
  userRole 
}: { 
  open: boolean; 
  onClose: () => void; 
  entry: any;
  onEdit: (entry: any) => void;
  onDelete: (id: number) => void;
  onToggleVerified: (id: number) => void;
  onToggleHidden: (id: number) => void;
  userRole: string;
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState<any>(null);

  useEffect(() => {
    if (open && entry) {
      setEditedEntry({ ...entry });
      setEditingTags(entry.tags ? entry.tags.split(',').map((tag: string) => tag.trim()) : []);
    }
  }, [open, entry]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/api/tags');
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, []);

  const handleSave = async () => {
    try {
      const updatedEntry = {
        ...editedEntry,
        tags: editingTags.join(', ')
      };
      
      await api.put(`/api/fire-news/${entry.id}`, updatedEntry);
      setIsEditing(false);
      onClose();
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditedEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = () => {
    onDelete(entry.id);
    onClose();
  };

  if (!open || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Entry' : 'View Entry'}
          </h3>
          <div className="flex gap-2">
            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => onToggleVerified(entry.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    entry.is_verified 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {entry.is_verified ? 'Unverify' : 'Verify'}
                </button>
                <button
                  onClick={() => onToggleHidden(entry.id)}
                  className={`px-3 py-1 rounded text-sm ${
                    entry.is_hidden 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {entry.is_hidden ? 'Show' : 'Hide'}
                </button>
              </>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
              >
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </button>
            )}
            <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm">
              Close
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            {isEditing ? (
              <input
                type="text"
                value={editedEntry.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            ) : (
              <p className="text-gray-900">{entry.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            {isEditing ? (
              <input
                type="text"
                value={editedEntry.source || ''}
                onChange={(e) => handleChange('source', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            ) : (
              <p className="text-gray-900">{entry.source || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Published Date</label>
            {isEditing ? (
              <input
                type="datetime-local"
                value={editedEntry.published_date ? new Date(editedEntry.published_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleChange('published_date', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            ) : (
              <p className="text-gray-900">
                {entry.published_date ? new Date(entry.published_date).toLocaleDateString() : '-'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            {isEditing ? (
              <input
                type="text"
                value={editedEntry.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            ) : (
              <p className="text-gray-900">{entry.state || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            {isEditing ? (
              <input
                type="text"
                value={editedEntry.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            ) : (
              <p className="text-gray-900">{entry.city || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
            {isEditing ? (
              <input
                type="text"
                value={editedEntry.county || ''}
                onChange={(e) => handleChange('county', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            ) : (
              <p className="text-gray-900">{entry.county || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            {isEditing ? (
              <TagSelector
                selectedTags={editingTags}
                onTagsChange={setEditingTags}
                availableTags={tags}
              />
            ) : (
              <p className="text-gray-900">{entry.tags || '-'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            {isEditing ? (
              <input
                type="url"
                value={editedEntry.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            ) : (
              <p className="text-gray-900">
                {entry.url ? (
                  <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {entry.url}
                  </a>
                ) : '-'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          {isEditing ? (
            <textarea
              value={editedEntry.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={6}
              className="w-full p-2 border border-gray-300 rounded"
            />
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">{entry.content || '-'}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookmarksPage() {
  const { user, logout } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fire_news');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    fetchBookmarks();
  }, [activeTab]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/bookmarks/?data_type=${activeTab}`);
      setBookmarks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedIds([]);
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(bookmarks.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleView = (entry: any) => {
    setSelectedEntry(entry);
    setViewModalOpen(true);
  };

  const handleEdit = (entry: any) => {
    setSelectedEntry(entry);
    setViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setEntryToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      try {
        await api.delete(`/api/bookmarks/${entryToDelete}`);
        await fetchBookmarks();
        setSelectedIds(prev => prev.filter(id => id !== entryToDelete));
      } catch (error) {
        console.error('Error deleting bookmark:', error);
      }
    }
    setDeleteModalOpen(false);
    setEntryToDelete(null);
  };

  const handleToggleVerified = async (id: number) => {
    try {
      const bookmark = bookmarks.find(b => b.id === id);
      if (bookmark) {
        await api.put(`/api/fire-news/${bookmark.news_id}`, {
          ...bookmark.news,
          is_verified: !bookmark.news.is_verified
        });
        await fetchBookmarks();
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const handleToggleHidden = async (id: number) => {
    try {
      const bookmark = bookmarks.find(b => b.id === id);
      if (bookmark) {
        await api.put(`/api/fire-news/${bookmark.news_id}`, {
          ...bookmark.news,
          is_hidden: !bookmark.news.is_hidden
        });
        await fetchBookmarks();
      }
    } catch (error) {
      console.error('Error toggling hidden status:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedIds) {
        await api.delete(`/api/bookmarks/${id}`);
      }
      await fetchBookmarks();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error bulk deleting bookmarks:', error);
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const news = bookmark.news;
    const searchLower = searchInput.toLowerCase();
    return (
      news.title?.toLowerCase().includes(searchLower) ||
      news.content?.toLowerCase().includes(searchLower) ||
      news.source?.toLowerCase().includes(searchLower) ||
      news.state?.toLowerCase().includes(searchLower) ||
      news.city?.toLowerCase().includes(searchLower) ||
      news.county?.toLowerCase().includes(searchLower)
    );
  });

  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    const aValue = a.news[sortBy];
    const bValue = b.news[sortBy];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const paginatedBookmarks = sortedBookmarks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getTabTitle = () => {
    switch (activeTab) {
      case 'fire_news':
        return 'Fire News Bookmarks';
      case 'emergency_911':
        return '911 Emergency Bookmarks';
      default:
        return 'Bookmarks';
    }
  };

  if (!user) {
    return <div>Please log in to view bookmarks.</div>;
  }

  return (
    <div className="min-h-screen bg-theme-background">
      <Sidebar
        activeTab="bookmarks"
        onTabChange={() => {}}
        onAdminModalOpen={() => {}}
        isMobileOpen={false}
        onMobileToggle={() => {}}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />
      
      <div className="ml-64">
        <TopNavigation user={user} onLogout={logout} />
        
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-theme-primary mb-2">
              <FiBookmark className="inline mr-3 text-theme-teal-dark" />
              {getTabTitle()}
            </h1>
            <p className="text-theme-secondary">
              Manage your saved news items and emergency alerts
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-theme-border">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleTabChange('fire_news')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'fire_news'
                      ? 'border-theme-teal-dark text-theme-teal-dark'
                      : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-border'
                  }`}
                >
                  <FiFileText className="inline mr-2" />
                  Fire News
                </button>
                <button
                  onClick={() => handleTabChange('emergency_911')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'emergency_911'
                      ? 'border-theme-teal-dark text-theme-teal-dark'
                      : 'border-transparent text-theme-secondary hover:text-theme-primary hover:border-theme-border'
                  }`}
                >
                  <FiPhone className="inline mr-2" />
                  911 Emergency
                </button>
              </nav>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary" />
                  <input
                    type="text"
                    placeholder="Search bookmarks..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-theme-border rounded-lg bg-theme-card text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-teal-dark focus:border-transparent"
                  />
                </div>
              </div>
              
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Delete Selected ({selectedIds.length})
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-teal-dark"></div>
            </div>
          ) : (
            <div>
              {activeTab === 'fire_news' ? (
                <DataTable
                  data={paginatedBookmarks.map(b => b.news)}
                  selectedIds={selectedIds}
                  onSelectAll={handleSelectAll}
                  onSelectItem={handleSelectItem}
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleVerified={handleToggleVerified}
                  onToggleHidden={handleToggleHidden}
                  userRole={user.role}
                />
              ) : (
                <Emergency911Table
                  data={paginatedBookmarks.map(b => b.news)}
                  selectedIds={selectedIds}
                  onSelectAll={handleSelectAll}
                  onSelectItem={handleSelectItem}
                  onSort={handleSort}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleVerified={handleToggleVerified}
                  onToggleHidden={handleToggleHidden}
                  userRole={user.role}
                />
              )}

              {filteredBookmarks.length > pageSize && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredBookmarks.length / pageSize)}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        entry={selectedEntry}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleVerified={handleToggleVerified}
        onToggleHidden={handleToggleHidden}
        userRole={user.role}
      />

      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to remove this bookmark? This action cannot be undone."
        title="Remove Bookmark"
      />
    </div>
  );
} 