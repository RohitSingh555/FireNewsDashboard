import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../lib/axios';

interface Tag {
  id: number;
  name: string;
  category?: string;
  color?: string;
  description?: string;
}

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
  className?: string;
}

export default function TagSelector({ 
  selectedTags, 
  onTagsChange, 
  placeholder = "Search or add tags...",
  className = "" 
}: TagSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch tag suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get('/api/tags/search', {
        params: { q: query, limit: 10 }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleAddTag = (tag: Tag) => {
    if (!selectedTags.find(t => t.id === tag.id)) {
      onTagsChange([...selectedTags, tag]);
    }
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleRemoveTag = (tagId: number) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleCreateNewTag = async () => {
    if (!searchTerm.trim()) return;

    try {
      const response = await api.post('/api/tags', {
        name: searchTerm.trim(),
        category: 'custom'
      });
      
      const newTag = response.data;
      handleAddTag(newTag);
    } catch (error) {
      console.error('Error creating new tag:', error);
      // If tag already exists, try to find it and add it
      const existingTag = suggestions.find(tag => 
        tag.name.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      if (existingTag) {
        handleAddTag(existingTag);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleAddTag(suggestions[0]);
      } else if (searchTerm.trim()) {
        handleCreateNewTag();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
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
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 ml-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-sm border-0 focus:ring-0 focus:outline-none"
          />
          {searchTerm.trim() && (
            <button
              type="button"
              onClick={handleCreateNewTag}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-r-lg"
              title="Create new tag"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || isSearching) && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {isSearching ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                <span className="ml-2">Searching...</span>
              </div>
            ) : (
              <>
                {suggestions.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    disabled={selectedTags.find(t => t.id === tag.id)}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color || '#6b7280' }}
                    ></div>
                    <span className="flex-1">{tag.name}</span>
                    {tag.category && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {tag.category}
                      </span>
                    )}
                    {selectedTags.find(t => t.id === tag.id) && (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                  </button>
                ))}
                {searchTerm.trim() && !suggestions.find(tag => 
                  tag.name.toLowerCase() === searchTerm.trim().toLowerCase()
                ) && (
                  <button
                    type="button"
                    onClick={handleCreateNewTag}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 text-blue-600 flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Create "{searchTerm.trim()}"</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
} 