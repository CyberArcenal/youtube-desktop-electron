import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Video,
  ThumbsUp,
  History,
  Clock,
  Download,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Sun,
  Moon,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onThemeToggle?: () => void;
  theme?: 'light' | 'dark';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onThemeToggle, theme = 'dark' }) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(!isOpen);

  // Listen to isOpen prop to sync collapse state
  useEffect(() => {
    setIsCollapsed(!isOpen);
  }, [isOpen]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onClose && !isCollapsed) onClose(); // notify parent if closing
  };

  const mainLinks = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/subscriptions', label: 'Subscriptions', icon: Compass },
    { path: '/library', label: 'Library', icon: Video },
  ];

  const secondaryLinks = [
    { path: '/liked', label: 'Liked videos', icon: ThumbsUp },
    { path: '/history', label: 'History', icon: History },
    { path: '/watch-later', label: 'Watch later', icon: Clock },
    { path: '/downloads', label: 'Downloads', icon: Download },
  ];

  const bottomLinks = [
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`
        fixed md:relative z-30 h-full bg-[#0f0f0f] border-r border-[#272727]
        transition-all duration-300 ease-in-out flex flex-col
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
    >
      {/* Header with logo and collapse button */}
      <div className={`
        flex items-center h-14 px-4 border-b border-[#272727]
        ${isCollapsed ? 'justify-center' : 'justify-between'}
      `}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">YT</span>
            </div>
            <span className="text-white font-semibold text-lg">YouTube</span>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-full hover:bg-[#272727] text-gray-300 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="space-y-1">
          {mainLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-2.5 transition-colors
                ${isActive ? 'bg-[#272727] text-white' : 'text-gray-300 hover:bg-[#272727] hover:text-white'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? link.label : undefined}
            >
              <link.icon size={22} />
              {!isCollapsed && <span className="text-sm font-medium">{link.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Separator */}
        <div className="my-3 mx-4 h-px bg-[#272727]" />

        {/* Secondary links (only show when expanded, or show icons when collapsed) */}
        <div className="space-y-1">
          {secondaryLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-2.5 transition-colors
                ${isActive ? 'bg-[#272727] text-white' : 'text-gray-300 hover:bg-[#272727] hover:text-white'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? link.label : undefined}
            >
              <link.icon size={20} />
              {!isCollapsed && <span className="text-sm">{link.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Separator */}
        <div className="my-3 mx-4 h-px bg-[#272727]" />

        {/* Settings and bottom links */}
        <div className="space-y-1">
          {bottomLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-2.5 transition-colors
                ${isActive ? 'bg-[#272727] text-white' : 'text-gray-300 hover:bg-[#272727] hover:text-white'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? link.label : undefined}
            >
              <link.icon size={20} />
              {!isCollapsed && <span className="text-sm">{link.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer with user avatar and theme toggle (desktop only when expanded) */}
      {!isCollapsed && (
        <div className="border-t border-[#272727] p-3 space-y-2">
          <button
            onClick={onThemeToggle}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-[#272727] transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button
            onClick={() => {/* sign out logic */}}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-[#272727] transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign out</span>
          </button>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-8 rounded-full bg-[#272727] flex items-center justify-center">
              <User size={16} className="text-gray-300" />
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">Guest</p>
              <p className="text-gray-400 text-xs">Not signed in</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed footer: minimal user icon */}
      {isCollapsed && (
        <div className="border-t border-[#272727] p-3 flex justify-center">
          <button className="p-2 rounded-full hover:bg-[#272727] text-gray-300">
            <User size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;