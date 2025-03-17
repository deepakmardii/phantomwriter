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
      if (!post.scheduledFor || post.isPublished) return false;
      const postDate = new Date(post.scheduledFor);
      return (
        postDate.getDate() === day &&
        postDate.getMonth() === currentMonth.getMonth() &&
        postDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  const isToday = day => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray">
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-lg">
          <svg
            className="w-6 h-6 text-gray-600"
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
        <h2 className="text-xl font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-lg">
          <svg
            className="w-6 h-6 text-gray-600"
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
          <div key={day} className="text-center text-gray-600 font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <div key={`empty-${index}`} className="h-24 bg-white rounded-lg border border-gray"></div>
        ))}

        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const dayPosts = getDayPosts(day);

          return (
            <div
              key={day}
              className="h-24 bg-white rounded-lg p-2 overflow-y-auto relative border border-gray hover:shadow-sm transition-shadow"
            >
              <div className="text-gray-600 mb-1 flex items-center">
                {day}
                {isToday(day) && <div className="w-2 h-2 rounded-full bg-orange-500 ml-2"></div>}
              </div>
              {dayPosts.map(post => (
                <div
                  key={post._id}
                  className="bg-orange-500/10 p-2 rounded-lg mb-1 text-sm text-gray-700 hover:bg-orange-500/20 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-orange-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs text-gray-600">
                        {new Date(post.scheduledFor).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        post.onDelete?.(post);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Delete scheduled post"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="cursor-pointer" onClick={() => post.onEdit?.(post)}>
                    {post.content.slice(0, 30)}...
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
