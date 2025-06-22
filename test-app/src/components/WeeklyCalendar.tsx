'use client';

import { useState, useEffect } from 'react';

interface WeeklyCalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

export default function WeeklyCalendar({ onDateSelect, selectedDate }: WeeklyCalendarProps) {
  const [weekDates, setWeekDates] = useState<Array<{
    date: string;
    day: string;
    dayName: string;
    isToday: boolean;
    isPast: boolean;
  }>>([]);

  useEffect(() => {
    const generateWeekDates = () => {
      const today = new Date();
      const dates: Array<{
        date: string;
        day: string;
        dayName: string;
        isToday: boolean;
        isPast: boolean;
      }> = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // YYYY-MM-DD format
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const day = date.getDate().toString();
        const isToday = i === 0;
        const isPast = false; // All dates are in the future since we start from today
        
        dates.push({
          date: dateStr,
          day,
          dayName,
          isToday,
          isPast
        });
      }
      
      setWeekDates(dates);
    };

    generateWeekDates();
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Pickup Date</h3>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((dateInfo) => (
          <button
            key={dateInfo.date}
            onClick={() => onDateSelect(dateInfo.date)}
            disabled={dateInfo.isPast}
            className={`
              p-3 rounded-lg text-center transition-colors
              ${dateInfo.isPast 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'hover:bg-blue-50 cursor-pointer'
              }
              ${selectedDate === dateInfo.date
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-50 text-gray-900'
              }
              ${dateInfo.isToday && selectedDate !== dateInfo.date
                ? 'ring-2 ring-blue-300'
                : ''
              }
            `}
          >
            <div className="text-xs font-medium mb-1">{dateInfo.dayName}</div>
            <div className="text-lg font-semibold">{dateInfo.day}</div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Select a date to see available time slots
      </div>
    </div>
  );
} 