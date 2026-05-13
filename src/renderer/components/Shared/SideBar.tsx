// src/renderer/components/Shared/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  ChevronLeft,
  ChevronRight,
  User,
  Sun,
  Moon,
  Youtube,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onThemeToggle?: () => void;
  theme?: "light" | "dark";
  onProfileClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onThemeToggle,
  theme = "dark",
  onProfileClick,
}) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(!isOpen);

  // Sync internal collapse state with external isOpen prop
  useEffect(() => {
    setIsCollapsed(!isOpen);
  }, [isOpen]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onClose && !newState) onClose(); // notify parent when expanding? Actually onClose is for mobile. We'll just call it when sidebar is open and we collapse? Let's keep simple.
    if (!newState && onClose) onClose(); // if we are expanding (collapsed = false) then we might want to close mobile overlay? okay.
  };

  // Navigation items (YouTube sections)
  const mainLinks = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/subscriptions", label: "Subscriptions", icon: Compass },
    { path: "/library", label: "Library", icon: Video },
  ];

  const secondaryLinks = [
    { path: "/liked", label: "Liked videos", icon: ThumbsUp },
    { path: "/history", label: "History", icon: History },
    { path: "/watch-later", label: "Watch later", icon: Clock },
    { path: "/downloads", label: "Downloads", icon: Download },
  ];

  const bottomLinks = [{ path: "/settings", label: "Settings", icon: Settings }];

  // Helper to determine active styling
  const getLinkClass = ({ isActive }: { isActive: boolean }) => `
    group flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all duration-200
    ${isActive 
      ? "bg-[var(--primary-soft)] text-[var(--primary-color)] font-medium" 
      : "text-[var(--text-secondary)] hover:bg-[var(--card-secondary-bg)] hover:text-[var(--text-primary)]"
    }
    ${isCollapsed ? "justify-center" : ""}
  `;

  return (
    <aside
      className={`
        fixed md:relative z-30 h-full sidebar
        transition-all duration-300 ease-in-out flex flex-col
        ${isCollapsed ? "w-20" : "w-64"}
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      {/* Header with gradient background (stashify style) */}
      <div
        className={`
          sidebar-header flex items-center h-14 px-4
          ${isCollapsed ? "justify-center" : "justify-between"}
        `}
      >
        {!isCollapsed && (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
              <Youtube size={18} className="text-white" />
            </div>
            <span className="text-white font-semibold text-lg">YouTube</span>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {/* Primary section */}
        <div className="space-y-1">
          {mainLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={getLinkClass} title={isCollapsed ? link.label : undefined}>
              <link.icon size={22} />
              {!isCollapsed && <span className="text-sm">{link.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Separator */}
        <div className="h-px bg-[var(--border-color)] mx-2" />

        {/* Secondary section */}
        <div className="space-y-1">
          {secondaryLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={getLinkClass} title={isCollapsed ? link.label : undefined}>
              <link.icon size={20} />
              {!isCollapsed && <span className="text-sm">{link.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Separator */}
        <div className="h-px bg-[var(--border-color)] mx-2" />

        {/* Settings */}
        <div className="space-y-1">
          {bottomLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={getLinkClass} title={isCollapsed ? link.label : undefined}>
              <link.icon size={20} />
              {!isCollapsed && <span className="text-sm">{link.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer section – user, theme, sign out */}
      {!isCollapsed ? (
        <div className="border-t border-[var(--border-color)] p-3 space-y-2">
          <button
            onClick={onThemeToggle}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--card-secondary-bg)] hover:text-[var(--text-primary)] transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <button
            onClick={() => {/* sign out logic */}}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--card-secondary-bg)] hover:text-[var(--text-primary)] transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Sign out</span>
          </button>
          <button
            onClick={onProfileClick}
            className="flex items-center gap-3 w-full hover:bg-[var(--card-secondary-bg)] rounded-lg p-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--card-secondary-bg)] flex items-center justify-center">
              <User size={16} className="text-[var(--text-secondary)]" />
            </div>
            <div className="text-sm text-left">
              <p className="text-[var(--text-primary)] font-medium">Guest</p>
              <p className="text-[var(--text-tertiary)] text-xs">Not signed in</p>
            </div>
          </button>
        </div>
      ) : (
        // Collapsed footer – only avatar icon
        <div className="border-t border-[var(--border-color)] p-3 flex justify-center">
          <button
            onClick={onProfileClick}
            className="p-2 rounded-full hover:bg-[var(--card-secondary-bg)] text-[var(--text-secondary)] transition-colors"
            aria-label="Profile"
          >
            <User size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;