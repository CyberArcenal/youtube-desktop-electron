import { useEffect, useState } from 'react';
import { authenticate, isLoggedIn, signOut } from '../services/auth';

export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    const status = await isLoggedIn();
    setLoggedIn(status);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setLoggedIn(false);
  };

  const handleReauth = async () => {
    await authenticate();
    await checkAuth();
  };

  return { loggedIn, loading, checkAuth, handleSignOut, handleReauth };
}