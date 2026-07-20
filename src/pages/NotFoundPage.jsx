import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();
  const home = user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <p className="text-7xl font-black text-primary-700 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to={user ? home : '/login'}
          className="inline-flex items-center justify-center px-6 py-3 bg-primary-700 text-white text-sm font-semibold rounded-xl hover:bg-primary-800"
        >
          {user ? 'Back to dashboard' : 'Go to login'}
        </Link>
      </div>
    </div>
  );
}
