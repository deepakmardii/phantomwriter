'use client';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function LinkedInShareModal({ post, onClose, onShare, isSharing }) {
  const [content, setContent] = useState(post?.content || '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScheduling, setIsScheduling] = useState(post?.isScheduled || false);
  const [scheduleDate, setScheduleDate] = useState(
    post?.scheduledFor ? new Date(post.scheduledFor).toISOString().split('T')[0] : ''
  );
  const [scheduleTime, setScheduleTime] = useState(
    post?.scheduledFor
      ? new Date(post.scheduledFor)
          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          .padStart(5, '0')
      : ''
  );
  const [timezone, setTimezone] = useState(
    post?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!content.trim()) {
      console.error('Content is required');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);

    if (image) {
      formData.append('image', image);
    }

    // Debug log
    console.log('Form submission:', {
      isScheduling,
      scheduleDate,
      scheduleTime,
      timezone,
    });

    if (isScheduling) {
      if (!scheduleDate || !scheduleTime) {
        console.error('Date and time are required for scheduling');
        return;
      }

      // Create date in selected timezone
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      formData.append('scheduledFor', scheduledDateTime.toISOString());
      formData.append('isScheduled', 'true');
      formData.append('timezone', timezone);
    }

    onShare(formData);
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-gray-800 font-semibold">Share to LinkedIn</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
            disabled={isSharing}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full bg-white border border-gray rounded-lg p-3 min-h-[150px] mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Write your post content..."
            disabled={isSharing}
          />

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Attach Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-500 file:text-white
                hover:file:bg-orange-600
                file:cursor-pointer"
              disabled={isSharing}
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded" />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="flex items-center text-gray-700 mb-4">
              <input
                type="checkbox"
                checked={isScheduling}
                onChange={e => setIsScheduling(e.target.checked)}
                className="mr-2 rounded border-gray accent-orange-500"
              />
              Schedule this post
            </label>

            {isScheduling && (
              <>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-2">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white border border-gray rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required={isScheduling}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-2">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="w-full bg-white border border-gray rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required={isScheduling}
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Please schedule at least 5 minutes in advance
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Timezone</label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full bg-white border border-gray rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required={isScheduling}
                  >
                    {Intl.supportedValuesOf('timeZone').map(tz => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSharing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSharing || (isScheduling && (!scheduleDate || !scheduleTime))}
            >
              {isSharing ? (
                <>
                  <LoadingSpinner className="w-4 h-4" />
                  {isScheduling ? 'Scheduling...' : 'Sharing...'}
                </>
              ) : isScheduling ? (
                'Schedule'
              ) : (
                'Share'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
