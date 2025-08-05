import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import api from '../lib/axios';

interface Tag {
  id: number;
  name: string;
  category?: string;
  color?: string;
}

interface TagFilterProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  className?: string;
}

export default function TagFilter({ 
  selectedTags, 
  onTagsChange, 
  className = "" 
}: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch all available tags
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/tags', {
          params: { page_size: 100, is_active: true }
        });
        setAvailableTags(response.data.tags || []);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setAvailableTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleTagToggle = (tag: Tag) => {
    const isSelected = selectedTags.find(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  const handleDropdownToggle = () => {
    if (!showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 400; // Estimated dropdown height
      
      // Check if dropdown would go below viewport
      const wouldGoBelow = rect.bottom + dropdownHeight > viewportHeight;
      
      setDropdownPosition({
        top: wouldGoBelow ? rect.top + window.scrollY - dropdownHeight : rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setSearchTerm('');
      setFilteredTags(availableTags);
    }
  };

  // Filter tags based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTags(availableTags);
    } else {
      const filtered = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tag.category && tag.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredTags(filtered);
    }
  }, [searchTerm, availableTags]);

  const groupedTags = filteredTags.reduce((acc, tag) => {
    const category = tag.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  return (
    <div className={`relative ${className}`}>
      {/* Filter Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleDropdownToggle}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
          selectedTags.length > 0
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <FunnelIcon className="h-4 w-4" />
        <span>Tags</span>
        {selectedTags.length > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
            {selectedTags.length}
          </span>
        )}
      </button>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                color: tag.color || '#374151',
                border: `1px solid ${tag.color || '#d1d5db'}`
              }}
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleTagToggle(tag)}
                className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAllTags}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Dropdown Portal */}
      {showDropdown && typeof window !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${Math.max(dropdownPosition.width, 320)}px`
            }}
          >
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Filter by Tags</h3>
              <p className="text-xs text-gray-500 mt-1">
                Select tags to filter the news entries
              </p>
              
              {/* Search Input */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <span className="ml-2 text-sm text-gray-500">Loading tags...</span>
              </div>
            ) : (
              <div className="p-3">
                {Object.entries(groupedTags).map(([category, tags]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                      {category}
                    </h4>
                    <div className="space-y-1">
                      {tags.map((tag) => {
                        const isSelected = selectedTags.find(t => t.id === tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagToggle(tag)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded text-left hover:bg-gray-50 ${
                              isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            <div
                              className={`w-3 h-3 rounded-full border ${
                                isSelected ? 'border-blue-600' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: tag.color || '#6b7280' }}
                            ></div>
                            <span className="flex-1">{tag.name}</span>
                            {isSelected && (
                              <span className="text-blue-600">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Click outside to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        </>,
        document.body
      )}
    </div>
  );
} 