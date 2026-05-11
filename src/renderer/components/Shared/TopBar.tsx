import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Mic, Bell, Sun, Moon, User } from 'lucide-react';
import UpdateNotifier from './UpdateNotifier';

interface TopBarProps {
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar, theme, onThemeToggle }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#0f0f0f] border-b border-[#272727] px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        {/* Left section: menu button + logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-[#272727] text-white transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:flex items-center gap-1 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">YT</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">YouTube</span>
          </div>
        </div>

        {/* Center: search bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search
                size={20}
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isSearchFocused ? 'text-red-500' : 'text-gray-400'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search"
                className="w-full bg-[#121212] border border-[#303030] rounded-full py-2 pl-10 pr-14 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#272727]"
                aria-label="Voice search"
              >
                <Mic size={18} className="text-gray-300" />
              </button>
            </div>
          </form>
        </div>

        {/* Right section: icons (theme, update, notification, user) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-full hover:bg-[#272727] text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <UpdateNotifier />

          <button className="p-2 rounded-full hover:bg-[#272727] text-white">
            <Bell size={20} />
          </button>

          <button className="p-1 rounded-full hover:bg-[#272727]">
            <div className="w-8 h-8 rounded-full bg-[#3f3f3f] flex items-center justify-center">
              <User size={18} className="text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;