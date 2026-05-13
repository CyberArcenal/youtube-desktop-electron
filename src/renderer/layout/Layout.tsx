// src/renderer/layout/Layout.tsx
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import TopBar from "../components/Shared/TopBar";
import Sidebar from "../components/Shared/SideBar";
import { useThemeStore } from "../store/themeStore";
import ProfileViewDialog from "../components/Shared/ProfileModal";
import { useProfileView } from "../hooks/useProfileView";

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const profileView = useProfileView();

  // Apply theme class on mount and when theme changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onThemeToggle={toggleTheme}
        theme={theme}
        onProfileClick={profileView.open}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onThemeToggle={toggleTheme}
          onProfileClick={profileView.open}
        />
        <main className="flex-1 overflow-y-auto bg-[#0f0f0f] px-4 py-6">
          <Outlet />
        </main>
      </div>
      <ProfileViewDialog hook={profileView} />
    </div>
  );
};

export default Layout;
