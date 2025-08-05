import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DateFiltersProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  className?: string;
}

export default function DateFilters({ onDateRangeChange, className = '' }: DateFiltersProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  const handleQuickDateSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setSelectedStartDate(start);
    setSelectedEndDate(end);
    onDateRangeChange(start, end);
  };

  const handleDateClick = (date: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else {
      // Complete selection
      if (date >= selectedStartDate) {
        setSelectedEndDate(date);
        onDateRangeChange(selectedStartDate, date);
        setIsCalendarOpen(false); // Close calendar after selection
      } else {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
        onDateRangeChange(date, selectedStartDate);
        setIsCalendarOpen(false); // Close calendar after selection
      }
    }
  };

  const clearDateRange = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    onDateRangeChange(null, null);
  };

  const handleCalendarToggle = () => {
    if (!isCalendarOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const calendarHeight = 400; // Estimated calendar height
      
      // Check if calendar would go below viewport
      const wouldGoBelow = rect.bottom + calendarHeight > viewportHeight;
      
      setCalendarPosition({
        top: wouldGoBelow ? rect.top + window.scrollY - calendarHeight : rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    setIsCalendarOpen(!isCalendarOpen);
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isDateSelected = (date: Date) => {
    return (selectedStartDate && date.getTime() === selectedStartDate.getTime()) ||
           (selectedEndDate && date.getTime() === selectedEndDate.getTime());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const days: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  }

  return (
    <div className={`bg-theme-card rounded-xl shadow-sm border border-theme-border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-theme-teal-dark" />
          Date Filters
        </h3>
        {(selectedStartDate || selectedEndDate) && (
          <button
            onClick={clearDateRange}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <XMarkIcon className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Quick Date Bookmarks */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-theme-secondary mb-2">Quick Filters</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickDateSelect(1)}
            className="px-3 py-1.5 text-sm bg-theme-teal-dark text-white rounded-lg hover:bg-theme-teal-medium transition-colors border border-theme-teal-dark"
          >
            Yesterday
          </button>
          <button
            onClick={() => handleQuickDateSelect(3)}
            className="px-3 py-1.5 text-sm bg-theme-teal-dark text-white rounded-lg hover:bg-theme-teal-medium transition-colors border border-theme-teal-dark"
          >
            Last 3 Days
          </button>
          <button
            onClick={() => handleQuickDateSelect(7)}
            className="px-3 py-1.5 text-sm bg-theme-teal-dark text-white rounded-lg hover:bg-theme-teal-medium transition-colors border border-theme-teal-dark"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleQuickDateSelect(30)}
            className="px-3 py-1.5 text-sm bg-theme-teal-dark text-white rounded-lg hover:bg-theme-teal-medium transition-colors border border-theme-teal-dark"
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Custom Date Range Button */}
      <div className="border-t border-theme-border pt-4">
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={handleCalendarToggle}
            className="flex items-center justify-between w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div>
              <h4 className="text-sm font-medium text-theme-secondary">Custom Date Range</h4>
              {(selectedStartDate || selectedEndDate) && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedStartDate && selectedEndDate 
                    ? `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`
                    : selectedStartDate 
                    ? `From ${formatDate(selectedStartDate)}`
                    : `Until ${formatDate(selectedEndDate!)}`
                  }
                </p>
              )}
            </div>
            {isCalendarOpen ? (
              <ChevronLeftIcon className="h-4 w-4 text-theme-disabled" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-theme-disabled" />
            )}
          </button>

          {/* Calendar Portal */}
          {isCalendarOpen && typeof window !== 'undefined' && createPortal(
            <div 
              ref={calendarRef}
              className="fixed z-50 bg-theme-card rounded-lg shadow-xl border border-theme-border p-4 min-w-[320px]"
              style={{
                top: `${calendarPosition.top}px`,
                left: `${calendarPosition.left}px`,
                width: `${Math.max(calendarPosition.width, 320)}px`
              }}
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-1 hover:bg-theme-teal-light rounded transition-colors"
                >
                  <ChevronLeftIcon className="h-4 w-4 text-theme-secondary" />
                </button>
                <h5 className="text-sm font-medium text-theme-primary">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h5>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-1 hover:bg-theme-teal-light rounded transition-colors"
                >
                  <ChevronRightIcon className="h-4 w-4 text-theme-secondary" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-theme-disabled text-center py-1">
                    {day}
                  </div>
                ))}
                
                {days.map((date, index) => (
                  <div key={index} className="aspect-square">
                    {date ? (
                      <button
                        onClick={() => handleDateClick(date)}
                        className={`w-full h-full text-sm rounded-md transition-all duration-200 ${
                          isDateSelected(date)
                            ? 'bg-theme-teal-dark text-white font-semibold shadow-md'
                            : isDateInRange(date)
                            ? 'bg-theme-teal-medium text-white'
                            : 'hover:bg-theme-teal-light text-theme-primary'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    ) : (
                      <div className="w-full h-full" />
                    )}
                  </div>
                ))}
              </div>

              {/* Selected Range Display */}
              {(selectedStartDate || selectedEndDate) && (
                <div className="text-xs text-theme-secondary bg-theme-teal-light p-2 rounded-lg">
                  <div className="font-medium mb-1">Selected Range:</div>
                  <div>
                    {selectedStartDate && formatDate(selectedStartDate)}
                    {selectedStartDate && selectedEndDate && ' → '}
                    {selectedEndDate && formatDate(selectedEndDate)}
                    {selectedStartDate && !selectedEndDate && ' (Select end date)'}
                  </div>
                </div>
              )}
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedStartDate || selectedEndDate) && (
        <div className="mt-4 p-3 bg-theme-teal-light rounded-lg border border-theme-border">
          <div className="text-sm text-theme-teal-dark">
            <span className="font-medium">Active Filter:</span>
            <span className="ml-1">
              {selectedStartDate && selectedEndDate 
                ? `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`
                : selectedStartDate 
                ? `From ${formatDate(selectedStartDate)}`
                : `Until ${formatDate(selectedEndDate!)}`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 