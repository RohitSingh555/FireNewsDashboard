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
  FiEyeOff
} from 'react-icons/fi';
import { useAuth } from '../lib/auth';
import api from '../lib/axios';
import { useEffect, useRef, useState } from 'react';
import FiltersAccordion from '../components/FiltersAccordion';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Sidebar from '../components/Sidebar';
import TopNavigation from '../components/TopNavigation';

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
  const [activeTab, setActiveTab] = React.useState<'view' | 'edit' | 'actions'>('view');
  const [editData, setEditData] = React.useState<any>(null);
  
  React.useEffect(() => {
    if (entry) {
      setEditData({ ...entry });
    }
  }, [entry]);

  if (!open || !entry) return null;
  
  const canEdit = userRole === 'admin' || userRole === 'reporter';
  
  const handleSave = () => {
    onEdit(editData);
    setActiveTab('view');
  };

  const handleChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'view', label: 'View', icon: '👁️' },
    ...(canEdit ? [{ id: 'edit', label: 'Edit', icon: '✏️' }] : []),
    { id: 'actions', label: 'Actions', icon: '⚙️' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-theme-card rounded-2xl shadow-2xl p-8 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-3xl font-bold text-theme-primary mb-2">{entry.title}</h3>
            <div className="flex items-center gap-4 text-sm text-theme-secondary">
              <span className="flex items-center gap-1">
                <FiCalendar className="h-4 w-4" />
                {entry.published_date ? new Date(entry.published_date).toLocaleDateString() : 'No date'}
              </span>
              <span className="flex items-center gap-1">
                <FiFileText className="h-4 w-4" />
                {entry.reporter_name || 'Unknown Reporter'}
              </span>
              <span className="flex items-center gap-1">
                <FiGlobe className="h-4 w-4" />
                {entry.source || 'Unknown Source'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-theme-secondary hover:text-theme-primary text-3xl font-bold">×</button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-theme-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-theme-teal-dark text-white shadow-md'
                  : 'bg-theme-cool-gray-light text-theme-secondary hover:bg-theme-cool-gray-medium'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'view' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-theme-background rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-theme-primary mb-3">Content</h4>
                  <p className="text-theme-secondary leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                </div>

                {entry.url && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Source URL</h4>
                    <a 
                      href={entry.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline break-all"
                    >
                      {entry.url}
                    </a>
                  </div>
                )}

                {entry.tags && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.split(',').map((tag: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 rounded-full text-sm">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Fire Score */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">Fire Related Score</h4>
                  {typeof entry.fire_related_score === 'number' ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{entry.fire_related_score}/10</span>
                        <FiZap className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(entry.fire_related_score / 10) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {entry.fire_related_score >= 8 ? 'High Priority' : 
                         entry.fire_related_score >= 6 ? 'Medium Priority' : 'Low Priority'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <FiAlertTriangle className="h-6 w-6" />
                      <span>Score not available</span>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">Location</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">State:</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">{entry.state || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">County:</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">{entry.county || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified:</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        entry.is_verified 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {entry.is_verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hidden:</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        entry.is_hidden 
                          ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {entry.is_hidden ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'edit' && canEdit && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">Title</label>
                  <input
                    type="text"
                    value={editData?.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-primary focus:ring-2 focus:ring-theme-teal-dark focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">State</label>
                  <input
                    type="text"
                    value={editData?.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-primary focus:ring-2 focus:ring-theme-teal-dark focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">County</label>
                  <input
                    type="text"
                    value={editData?.county || ''}
                    onChange={(e) => handleChange('county', e.target.value)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-primary focus:ring-2 focus:ring-theme-teal-dark focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">Fire Related Score</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={editData?.fire_related_score || ''}
                    onChange={(e) => handleChange('fire_related_score', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-primary focus:ring-2 focus:ring-theme-teal-dark focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">Content</label>
                <textarea
                  value={editData?.content || ''}
                  onChange={(e) => handleChange('content', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-primary focus:ring-2 focus:ring-theme-teal-dark focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-theme-teal-dark text-white rounded-lg hover:bg-theme-teal-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Verification Status */}
                <div className="bg-theme-background rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-theme-primary mb-4">Verification Status</h4>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm px-3 py-2 rounded-lg ${
                      entry.is_verified 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {entry.is_verified ? 'Verified' : 'Not Verified'}
                    </span>
                    <button
                      onClick={() => onToggleVerified(entry.id)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        entry.is_verified 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {entry.is_verified ? 'Unverify' : 'Verify'}
                    </button>
                  </div>
                </div>

                {/* Visibility Status */}
                <div className="bg-theme-background rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-theme-primary mb-4">Visibility Status</h4>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm px-3 py-2 rounded-lg ${
                      entry.is_hidden 
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {entry.is_hidden ? 'Hidden' : 'Visible'}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => onToggleHidden(entry.id)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          entry.is_hidden 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {entry.is_hidden ? 'Show' : 'Hide'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              {canEdit && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">Danger Zone</h4>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onDelete(entry.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete Entry
                    </button>
                    <span className="text-sm text-red-700 dark:text-red-300">
                      This action cannot be undone.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Edit Modal Component
function EditModal({ open, onClose, entry, onSave }: { 
  open: boolean; 
  onClose: () => void; 
  entry: any;
  onSave: (updatedEntry: any) => void;
}) {
  const [formData, setFormData] = useState(entry || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData(entry);
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!open || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold text-gray-900">Edit Fire News Entry</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-bold">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Content */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Published Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Published Date</label>
              <input
                type="datetime-local"
                value={formData.published_date ? new Date(formData.published_date).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleChange('published_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source URL</label>
              <input
                type="url"
                value={formData.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <input
                type="text"
                value={formData.source || ''}
                onChange={(e) => handleChange('source', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Reporter Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reporter Name</label>
              <input
                type="text"
                value={formData.reporter_name || ''}
                onChange={(e) => handleChange('reporter_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fire Related Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fire Related Score (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.fire_related_score || ''}
                onChange={(e) => handleChange('fire_related_score', parseFloat(e.target.value) || null)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Verification Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Result</label>
              <select
                value={formData.verification_result || ''}
                onChange={(e) => handleChange('verification_result', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select verification status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* County */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">County</label>
              <input
                type="text"
                value={formData.county || ''}
                onChange={(e) => handleChange('county', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tags */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags || ''}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="fire, emergency, evacuation, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FiRotateCw className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheckCircle className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminModal({ open, onClose, users, onUpdateRole, onDeleteUser, activeTab, onTabChange, currentUser }: {
  open: boolean;
  onClose: () => void;
  users: any[];
  onUpdateRole: (userId: number, role: string) => void;
  onDeleteUser: (userId: number) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser: any;
}) {
  if (!open) return null;
  
  const adminTabs = [
    { id: 'users', name: 'User Management', icon: FiUsers },
    { id: 'activity', name: 'Activity Log', icon: FiClock },
    { id: 'analytics', name: 'Analytics', icon: FiBarChart },
    { id: 'settings', name: 'Settings', icon: FiSettings }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-theme-teal-dark text-white';
      case 'reporter': return 'bg-theme-success text-white';
      case 'user': return 'bg-theme-cool-gray-light text-theme-primary';
      default: return 'bg-theme-cool-gray-light text-theme-primary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <FiShield className="h-4 w-4 text-blue-600" />;
      case 'reporter': return <FiFileText className="h-4 w-4 text-green-500" />;
      case 'user': return <FiUser className="h-4 w-4 text-gray-500" />;
      default: return <FiUser className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-theme-card rounded-lg shadow-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-theme-primary">Admin Dashboard</h3>
          <button onClick={onClose} className="text-theme-disabled hover:text-theme-secondary text-2xl">×</button>
        </div>
        
        {/* Admin Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-theme-border">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-theme-teal-dark text-white shadow-md'
                    : 'bg-theme-cool-gray-light text-theme-secondary hover:bg-theme-cool-gray-medium'
                }`}
              >
                <Icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-theme-secondary'}`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-theme-primary">User Management</h4>
                <div className="text-sm text-theme-secondary">
                  Total Users: {users.length}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-theme-border">
                  <thead className="bg-theme-teal-light">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-theme-card divide-y divide-theme-border">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-theme-teal-light">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiUser className="h-10 w-10 text-gray-400" />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username || 'N/A'}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-primary">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            {currentUser.id === user.id ? (
                              <span className="text-sm text-theme-secondary italic">Cannot change own role</span>
                            ) : (
                              <select
                                value={user.role}
                                onChange={(e) => onUpdateRole(user.id, e.target.value)}
                                className="text-sm border border-theme-border rounded px-2 py-1 bg-theme-card text-theme-primary"
                              >
                                <option value="user">User</option>
                                <option value="reporter">Reporter</option>
                                <option value="admin">Admin</option>
                              </select>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {currentUser.id === user.id ? (
                            <span className="text-theme-disabled italic">Cannot delete self</span>
                          ) : (
                            <button
                              onClick={() => onDeleteUser(user.id)}
                              className="text-red-500 hover:text-red-600 flex items-center gap-1"
                            >
                              <FiTrash2 className="h-4 w-4 text-red-500" />
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-theme-primary">Activity Log</h4>
              <div className="space-y-3">
                {[
                  { action: 'User Created', user: 'john@example.com', role: 'user', time: '2 hours ago', icon: FiUser },
                  { action: 'Role Updated', user: 'admin@example.com', role: 'admin', time: '1 day ago', icon: FiShield },
                  { action: 'User Promoted', user: 'reporter@example.com', role: 'reporter', time: '3 days ago', icon: FiFileText },
                  { action: 'User Deleted', user: 'olduser@example.com', role: 'user', time: '1 week ago', icon: FiTrash2 }
                ].map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-theme-teal-light rounded-lg">
                      <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-theme-teal-dark" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-theme-primary">{activity.action}</div>
                        <div className="text-sm text-theme-secondary">{activity.user} - {activity.role}</div>
                      </div>
                      <div className="text-sm text-theme-disabled">{activity.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiUsers className="h-6 w-6 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{users.length}</div>
                      <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiFileText className="h-6 w-6 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'reporter').length}</div>
                      <div className="text-sm text-green-600">Reporters</div>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FiShield className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'admin').length}</div>
                      <div className="text-sm text-blue-600">Admins</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Admin Settings</h4>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">System Configuration</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• User registration: Enabled</div>
                    <div>• Email verification: Required</div>
                    <div>• Admin approval: Required for reporters</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Role Permissions</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>• Admin: Full access to all features</div>
                    <div>• Reporter: Can upload and manage news</div>
                    <div>• User: Can view and search news</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VerificationBar({ value }: { value: number }) {
  const percent = Math.max(0, Math.min(10, Number(value))) * 10;
  let barColor = 'bg-gradient-to-r from-blue-500 to-blue-300';
  if (percent < 50) barColor = 'bg-gradient-to-r from-yellow-400 to-yellow-200';
  if (percent < 30) barColor = 'bg-gradient-to-r from-red-500 to-red-200';
  return (
    <div className="w-full flex items-center gap-2">
      <div className="flex-1 h-3 rounded-full bg-gray-200 shadow-inner overflow-hidden">
        <div className={`h-3 rounded-full ${barColor} shadow`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-semibold text-blue-600 ml-2">{value}/10</span>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = require('next/router').useRouter();
  
  // State management
  const [activeTab, setActiveTab] = useState<string>('news');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [fireNewsEntries, setFireNewsEntries] = useState<Array<any>>([]);
  // Use static reporter tabs
  const reporterTabs = ["Tweet", "Web", "Hidden"];
  const [selectedReporter, setSelectedReporter] = useState<string>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState('users');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('published_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [county, setCounty] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [counties, setCounties] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [dateRangeStart, setDateRangeStart] = useState<Date | null>(null);
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  // Note: We'll use the backend to handle filtering and counts

  // Remove fetchReporters and useEffect for reporters

  // Fetch users for admin panel
  useEffect(() => {
    if (adminModalOpen) {
      async function fetchUsers() {
        try {
          const res = await api.get('/admin/users');
          setUsers(res.data);
        } catch (error) {
          console.error('Failed to fetch users:', error);
        }
      }
      fetchUsers();
    }
  }, [adminModalOpen]);

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
    if (activeTab !== 'news') return;
    
    try {
      setNewsLoading(true);
      setNewsError('');
      const params: any = {
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      // Only add parameters if they have values
      if (county) params.county = county;
      if (stateFilter) params.state = stateFilter;
      if (search) params.search = search;
      
      // Add date range filters if set
      if (dateRangeStart) {
        params.start_date = dateRangeStart.toISOString().split('T')[0];
      }
      if (dateRangeEnd) {
        params.end_date = dateRangeEnd.toISOString().split('T')[0];
      }
      
      // Handle hidden filtering
      if (selectedReporter === 'Hidden') {
        params.is_hidden = true;
      } else if (selectedReporter !== 'all') {
        // Map tab names to actual reporter names
        let reporterName = selectedReporter;
        if (selectedReporter === 'Tweet') {
          reporterName = 'Twitter Fire Detection Bot';
        }
        params.reporter_name = reporterName;
        params.is_hidden = false; // Only show non-hidden articles in specific tabs
      } else {
        // For "All Leads" tab, we want to show all non-hidden articles
        // but the count should include hidden articles
        params.is_hidden = false;
      }
      
      console.log('Fetching news with params:', params);
      console.log('Selected reporter:', selectedReporter);
      const res = await api.get('/api/fire-news', { params });
      console.log('News response:', res.data);
      console.log('Items received:', res.data.items.length);
      console.log('Hidden items in response:', res.data.items.filter((item: any) => item.is_hidden).length);
      
      // Apply frontend filtering as fallback to ensure hidden articles don't appear in wrong tabs
      let filteredItems = res.data.items;
      if (selectedReporter === 'Hidden') {
        // Only show hidden articles
        filteredItems = res.data.items.filter((item: any) => item.is_hidden);
        setTotal(filteredItems.length); // For Hidden tab, total = count of hidden items
      } else {
        // For all other tabs, exclude hidden articles
        filteredItems = res.data.items.filter((item: any) => !item.is_hidden);
        if (selectedReporter === 'all') {
          // For "All Leads" tab, total should be the backend total (all articles including hidden)
          setTotal(res.data.total);
        } else {
          // For specific reporter tabs, total = count of filtered items
          setTotal(filteredItems.length);
        }
      }
      
      console.log('Filtered items:', filteredItems.length);
      console.log('Total set to:', selectedReporter === 'all' ? res.data.total : filteredItems.length);
      setFireNewsEntries(filteredItems);
    } catch (err) {
      console.error('Error fetching news:', err);
      setNewsError('Failed to load fire news.');
      setFireNewsEntries([]);
      setTotal(0);
    } finally {
      setNewsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, county, stateFilter, search, selectedReporter, activeTab, dateRangeStart, dateRangeEnd]);

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

  const handleDateRangeChange = (startDate: Date | null, endDate: Date | null) => {
    setDateRangeStart(startDate);
    setDateRangeEnd(endDate);
    setPage(1);
  };

  // Pagination controls
  const totalPages = Math.ceil(total / pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Removed redundant redirect effect since we handle it in the render

  // Delete handlers
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

  const handleDeleteAll = async () => {
    try {
      await api.delete('/api/fire-news/delete-all');
      setFireNewsEntries([]);
      setTotal(0);
      setSelectedIds([]);
    } catch (err) {
      alert('Failed to delete all entries.');
    } finally {
      setDeleteAllModalOpen(false);
    }
  };

  // View and Edit handlers
  const openViewModal = (entry: any) => {
    setSelectedEntry(entry);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedEntry(null);
    setViewModalOpen(false);
  };

  const openEditModal = (entry: any) => {
    setSelectedEntry(entry);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedEntry(null);
    setEditModalOpen(false);
  };

  const handleSaveEdit = async (updatedEntry: any) => {
    try {
      await api.put(`/api/fire-news/${updatedEntry.id}`, updatedEntry);
      setFireNewsEntries(entries => 
        entries.map(e => e.id === updatedEntry.id ? updatedEntry : e)
      );
    } catch (err) {
      alert('Failed to update entry.');
      throw err;
    }
  };

  // Admin handlers
  const handleUpdateRole = async (userId: number, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {
      alert('Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  // Selection handlers
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

  const getTabTitle = () => {
    const titles: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'news': 'Fire News',
      'alerts': 'Alerts',
      'reports': 'Reports',
      'analytics': 'Analytics',
      'map': 'Map View',
      'calendar': 'Calendar',
      'search': 'Advanced Search',
      'bookmarks': 'Bookmarks',
      'favorites': 'Favorites',
      'history': 'History',
      'archive': 'Archive'
    };
    return titles[activeTab] || 'Dashboard';
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-teal-dark mx-auto mb-4"></div>
          <span className="text-theme-teal-dark text-xl font-bold">Loading...</span>
        </div>
      </div>
    );

  // If no user after loading, redirect to login
  if (!user) {
    router.push('/login');
    return null;
  }

    return (
    <div className="min-h-screen w-full flex bg-theme-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAdminModalOpen={() => setAdminModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen overflow-x-auto w-full transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Top Navigation */}
        <TopNavigation
          activeTab={activeTab}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onAdminModalOpen={() => setAdminModalOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Content */}
        <main className="flex-1 flex flex-col p-4 w-full bg-theme-background pt-20">
          {activeTab === 'news' ? (
            <div className="w-full space-y-4">
              

              {/* Filters Accordion */}
              <FiltersAccordion
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                stateFilter={stateFilter}
                onStateChange={(value) => { setStateFilter(value); setPage(1); }}
                county={county}
                onCountyChange={(value) => { setCounty(value); setPage(1); }}
                states={states}
                counties={counties}
                onDateRangeChange={handleDateRangeChange}
              />

              {/* Reporter Tabs */}
              <div className="bg-theme-card rounded-xl shadow-sm border border-theme-border p-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSelectedReporter('all'); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
                      selectedReporter === 'all'
                        ? 'bg-theme-teal-dark text-white border-theme-teal-dark shadow-md'
                        : 'bg-theme-cool-gray-light text-theme-teal-dark border-transparent hover:bg-theme-teal-light hover:text-theme-teal-dark hover:border-theme-teal-medium'
                    }`}
                  >
                    <FiGlobe className={`h-5 w-5 ${selectedReporter === 'all' ? 'text-white' : 'text-blue-600'}`} />
                    All Leads 
                  </button>
                  {reporterTabs.map((reporter) => {
                    const isTweet = reporter === 'Tweet';
                    const isHidden = reporter.toLowerCase().includes('hidden');
                    let Icon = FiGlobe;
                    if (isTweet) Icon = FiMessageSquare;
                    if (isHidden) Icon = FiEyeOff;
                    
                    return (
                      <button
                        key={reporter}
                        onClick={() => { setSelectedReporter(reporter); setPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border-2 ${
                          selectedReporter === reporter
                            ? isHidden 
                              ? 'bg-gray-700 text-gray-100 border-gray-700 shadow-sm'
                              : 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : isHidden
                              ? 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-700 hover:border-gray-300'
                              : 'bg-gray-100 text-blue-600 border-transparent hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${selectedReporter === reporter ? 'text-white' : isHidden ? 'text-gray-600' : 'text-blue-600'}`} />
                        {reporter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedIds.length > 0 && (
                    <button
                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                      onClick={openBulkDeleteModal}
                    >
                      <FiTrash2 className="h-5 w-5" /> Delete Selected ({selectedIds.length})
                    </button>
                  )}
                </div>
                
                
              </div>

              {/* Data Table */}
              <DataTable
                data={fireNewsEntries}
                selectedIds={selectedIds}
                onSelectAll={(checked) => setSelectedIds(checked ? fireNewsEntries.map((n: any) => n.id) : [])}
                onSelectItem={(id, checked) => setSelectedIds(checked ? [...selectedIds, id] : selectedIds.filter(selectedId => selectedId !== id))}
                onSort={handleSort}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onView={openViewModal}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onToggleVerified={async (id) => {
                  try {
                    await api.put(`/api/fire-news/${id}/toggle-verified`);
                    setFireNewsEntries(entries => entries.map(e => e.id === id ? { ...e, is_verified: !e.is_verified } : e));
                  } catch (err) {
                    alert('Failed to toggle verified status.');
                  }
                }}
                onToggleHidden={async (id) => {
                  try {
                    await api.put(`/api/fire-news/${id}/toggle-hidden`);
                    // Refresh the data to reflect the change in the current tab
                    fetchNews();
                  } catch (err) {
                    alert('Failed to toggle hidden status.');
                  }
                }}
                userRole={user.role}
              />

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(total / pageSize)}
                totalItems={total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          ) : (
            <div className="bg-theme-card rounded-2xl shadow-xl border border-theme-border p-6 w-full">
              <div className="text-center text-theme-secondary">
                <FiSettings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold mb-2 text-theme-primary">{getTabTitle()}</h2>
                <p>This section is under development. Please use the navigation to explore other features.</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this entry?"
        title="Delete Entry"
      />
      
      <ConfirmModal
        open={deleteAllModalOpen}
        onClose={() => setDeleteAllModalOpen(false)}
        onConfirm={handleDeleteAll}
        message="Are you sure you want to delete ALL fire news records? This action cannot be undone!"
        title="Delete All Records"
      />
      
      <ConfirmModal
        open={bulkDeleteModalOpen}
        onClose={closeBulkDeleteModal}
        onConfirm={handleBulkDelete}
        message={`Are you sure you want to delete ${selectedIds.length} selected entries?`}
        title="Delete Selected Entries"
      />

      <AdminModal
        open={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        users={users}
        onUpdateRole={handleUpdateRole}
        onDeleteUser={handleDeleteUser}
        activeTab={adminActiveTab}
        onTabChange={setAdminActiveTab}
        currentUser={user}
      />

      <ViewModal
        open={viewModalOpen}
        onClose={closeViewModal}
        entry={selectedEntry}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onToggleVerified={async (id) => {
          try {
            await api.put(`/api/fire-news/${id}/toggle-verified`);
            setFireNewsEntries(entries => entries.map(e => e.id === id ? { ...e, is_verified: !e.is_verified } : e));
          } catch (err) {
            alert('Failed to toggle verified status.');
          }
        }}
        onToggleHidden={async (id) => {
          try {
            await api.put(`/api/fire-news/${id}/toggle-hidden`);
            // Refresh the data to reflect the change in the current tab
            fetchNews();
          } catch (err) {
            alert('Failed to toggle hidden status.');
          }
        }}
        userRole={user.role}
      />

      <EditModal
        open={editModalOpen}
        onClose={closeEditModal}
        entry={selectedEntry}
        onSave={handleSaveEdit}
      />
    </div>
  );
} 