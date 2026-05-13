// src/renderer/components/AuthGuard.tsx
import React, { useEffect, useState } from 'react';
import { authenticate, isLoggedIn } from '../../services/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await isLoggedIn();
        setIsAuthenticated(loggedIn);
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-[#1f1f1f] rounded-full p-4 mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
        <p className="text-gray-400 mb-6">Please sign in to YouTube to view your playlists</p>
        <button
          onClick={() => authenticate()}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white text-sm transition"
        >
          Sign in with YouTube
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;