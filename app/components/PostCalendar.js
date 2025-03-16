'use client';
import { useState } from 'react';

export default function PostCalendar({ posts }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const getDayPosts = day => {
    return posts.filter(post => {
      if (!post.scheduledFor) return false;
      const postDate = new Date(post.scheduledFor);
      return (
        postDate.getDate() === day &&
        postDate.getMonth() === currentMonth.getMonth() &&
        postDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-700 rounded">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-700 rounded">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-gray-400 font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <div key={`empty-${index}`} className="h-24 bg-gray-700/50 rounded"></div>
        ))}

        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const dayPosts = getDayPosts(day);

          return (
            <div key={day} className="h-24 bg-gray-700 rounded p-2 overflow-y-auto">
              <div className="text-gray-400 mb-1">{day}</div>
              {dayPosts.map(post => (
                <div
                  key={post._id}
                  className="bg-blue-600/20 p-2 rounded mb-1 text-sm text-white cursor-pointer hover:bg-blue-600/30 transition-colors"
                  onClick={() => post.onEdit?.(post)}
                >
                  {post.content.slice(0, 30)}...
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
