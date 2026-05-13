// src/renderer/hooks/useProfileView.ts
import { useState } from 'react';
import { authenticate, isLoggedIn, signOut } from '../services/auth';

interface UserInfo {
  name: string;
  email?: string;
  avatar?: string;
  channelId?: string;
}

interface UseProfileViewReturn {
  isOpen: boolean;
  loading: boolean;
  loggedIn: boolean;
  userInfo: UserInfo | null;
  open: () => Promise<void>;
  close: () => void;
  handleSignOut: () => Promise<void>;
  handleReauth: () => Promise<void>;
}

export const useProfileView = (): UseProfileViewReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const loginStatus = await isLoggedIn();
      setLoggedIn(loginStatus);
      if (loginStatus) {
        const info = await window.backendAPI.getUserInfo();
        setUserInfo(info || { name: 'YouTube User' });
      } else {
        setUserInfo(null);
      }
    } catch (err) {
      console.error('Failed to fetch profile data', err);
      setLoggedIn(false);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const open = async () => {
    setIsOpen(true);
    await fetchData();
  };

  const close = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setLoggedIn(false);
    setUserInfo(null);
    close();
    // Optionally reload page
    window.location.reload();
  };

  const handleReauth = async () => {
    await authenticate();
    await fetchData();
  };

  return {
    isOpen,
    loading,
    loggedIn,
    userInfo,
    open,
    close,
    handleSignOut,
    handleReauth,
  };
};