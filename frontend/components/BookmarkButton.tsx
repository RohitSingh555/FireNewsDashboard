import React, { useState, useEffect } from 'react';
import { BookmarkIcon, BookmarkSlashIcon } from '@heroicons/react/24/outline';
import api from '../lib/axios';

interface BookmarkButtonProps {
  newsId: number;
  dataType: string; // 'fire_news' or 'emergency_911'
  className?: string;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export default function BookmarkButton({ 
  newsId, 
  dataType, 
  className = '',
  onBookmarkChange 
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBookmarkStatus();
  }, [newsId, dataType]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await api.get(`/api/bookmarks/check/${newsId}?data_type=${dataType}`);
      setIsBookmarked(response.data.is_bookmarked);
      onBookmarkChange?.(response.data.is_bookmarked);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        await api.delete(`/api/bookmarks/news/${newsId}?data_type=${dataType}`);
        setIsBookmarked(false);
        onBookmarkChange?.(false);
      } else {
        // Add bookmark
        await api.post('/api/bookmarks/', {
          news_id: newsId,
          data_type: dataType
        });
        setIsBookmarked(true);
        onBookmarkChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-teal-dark ${
        isBookmarked 
          ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
      } ${className}`}
      title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : isBookmarked ? (
        <BookmarkSlashIcon className="h-4 w-4" />
      ) : (
        <BookmarkIcon className="h-4 w-4" />
      )}
    </button>
  );
} 