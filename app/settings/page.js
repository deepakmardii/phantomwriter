'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/app/providers/NotificationProvider';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import UsageStats from '@/app/components/UsageStats';
import LinkedInSettings from '@/app/components/LinkedInSettings';

export default function Settings() {
  const { isAuthenticated, user } = useAuth();
  const { data: session, update } = useSession();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [originalName, setOriginalName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Track if name has been modified
  const isNameChanged = formData.name !== originalName;

  // Track if all password fields are filled
  const arePasswordFieldsComplete = !session?.user?.hasPassword
    ? passwordData.newPassword.trim() !== '' && passwordData.confirmPassword.trim() !== ''
    : passwordData.currentPassword.trim() !== '' &&
      passwordData.newPassword.trim() !== '' &&
      passwordData.confirmPassword.trim() !== '';

  // Update form data when user data is available
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
      }));
      setOriginalName(user.name);
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return <LoadingSpinner message="Loading..." />;
  }

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = e => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: formData.name }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update user details');
      }

      await update({ name: formData.name });
      showNotification('User details updated successfully', 'success');

      router.push('/settings');

      setOriginalName(formData.name);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          // Only include current password if user already has a password
          ...(session?.user?.hasPassword ? { currentPassword: passwordData.currentPassword } : {}),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update password');
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Update session to reflect new password state
      await update({
        ...session,
        user: {
          ...session?.user,
          hasPassword: true,
        },
      });

      showNotification(
        !session?.user?.hasPassword
          ? 'Password set up successfully'
          : 'Password updated successfully',
        'success'
      );
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 sm:py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
          {/* User Details Section */}
          <div className="bg-white px-4 sm:px-6 py-4 sm:py-6 rounded-xl shadow-md border border-gray-200 transition-shadow hover:shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2 block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 ease-in-out hover:border-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sign in method</label>
                  <div className="mt-1">
                    <p className="text-sm text-gray-600">
                      {session?.user?.provider === 'dual'
                        ? 'Google Account and Email/Password'
                        : session?.user?.provider === 'google'
                          ? 'Google Account'
                          : 'Email and Password'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !isNameChanged}
                  className="w-full sm:w-auto flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:translate-y-[-1px]"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="bg-white px-4 sm:px-6 py-4 sm:py-6 rounded-xl shadow-md border border-gray-200 transition-shadow hover:shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              {!session?.user?.hasPassword ? 'Set Up Password' : 'Change Password'}
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {!session?.user?.hasPassword ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-700">
                    Setting up a password will allow you to sign in with your email and password in
                    addition to Google authentication.
                  </p>
                </div>
              ) : null}

              {session?.user?.hasPassword ? (
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="mt-2 block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 ease-in-out hover:border-gray-400"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray rounded-lg shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="mt-2 block w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 ease-in-out hover:border-gray-400"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !arePasswordFieldsComplete}
                  className="w-full sm:w-auto flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:translate-y-[-1px]"
                >
                  {loading
                    ? !session?.user?.hasPassword
                      ? 'Setting up...'
                      : 'Updating...'
                    : !session?.user?.hasPassword
                      ? 'Set Up Password'
                      : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* Usage Statistics Section */}
          <UsageStats />

          {/* LinkedIn Settings Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Social Media</h2>
            <LinkedInSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
