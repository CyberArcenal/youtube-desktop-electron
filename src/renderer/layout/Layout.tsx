import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../components/Shared/TopBar';
import Sidebar from '../components/Shared/SideBar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onThemeToggle={toggleTheme} theme={theme} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} theme={theme} onThemeToggle={toggleTheme} />
        <main className="flex-1 overflow-y-auto bg-[#0f0f0f] px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;