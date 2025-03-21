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
    <div className="bg-white rounded-lg shadow-sm border border-gray">
      {/* Month Navigation */}
      <div className="flex justify-between items-center p-4 border-b border-gray">
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

      {/* Desktop Calendar View */}
      <div className="hidden sm:block p-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-gray-600 font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {[...Array(firstDayOfMonth)].map((_, index) => (
            <div
              key={`empty-${index}`}
              className="h-24 bg-white rounded-lg border border-gray"
            ></div>
          ))}

          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const dayPosts = getDayPosts(day);

            return (
              <div
                key={day}
                className="h-24 bg-white rounded-lg p-2 overflow-y-auto relative border border-gray hover:shadow-sm transition-shadow"
              >
                <div className="text-gray-600 mb-2 flex items-center">
                  {day}
                  {isToday(day) && <div className="w-2 h-2 rounded-full bg-orange-500 ml-2"></div>}
                </div>
                {dayPosts.map(post => (
                  <div
                    key={post._id}
                    className="bg-orange-500/10 p-2 rounded-lg mb-2 text-sm text-gray-700 hover:bg-orange-500/20 transition-colors cursor-pointer"
                    onClick={() => post.onEdit?.(post)}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-orange-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-600">
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
                        className="text-red-400 hover:text-red-300 transition-colors p-1.5"
                        title="Delete scheduled post"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
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
                    <div>{post.content.slice(0, 30)}...</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile List View */}
      <div className="sm:hidden">
        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const dayPosts = getDayPosts(day);

          if (dayPosts.length === 0) return null;

          return (
            <div key={day} className="border-b border-gray last:border-b-0">
              <div className="flex items-center px-4 py-3 bg-gray-50">
                <span className="font-medium">
                  {new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  ).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {isToday(day) && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                    Today
                  </span>
                )}
              </div>
              {dayPosts.map(post => (
                <div
                  key={post._id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => post.onEdit?.(post)}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-orange-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-600">
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
                      className="text-red-400 hover:text-red-300 transition-colors p-2 -mr-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
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
                  <div className="text-gray-700">{post.content}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
