import React, { useState } from 'react';
import { 
  FiHome, 
  FiFileText, 
  FiBell, 
  FiBarChart, 
  FiMap, 
  FiCalendar, 
  FiSearch, 
  FiBookmark, 
  FiHeart, 
  FiClock, 
  FiArchive,
  FiShield,
  FiUsers,
  FiSettings,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiGlobe,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiEdit,
  FiTrash2,
  FiZap
} from 'react-icons/fi';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAdminModalOpen: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  badge?: string;
  requiresRole?: string[];
}

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  onAdminModalOpen, 
  isMobileOpen, 
  onMobileToggle,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiHome,
      color: 'text-blue-500',
      description: 'Overview and analytics'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: FiBell,
      color: 'text-red-500',
      description: 'Emergency notifications',
      badge: '3'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FiBarChart,
      color: 'text-purple-500',
      description: 'Generate and view reports'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: FiTrendingUp,
      color: 'text-green-500',
      description: 'Data insights and trends'
    },
    {
      id: 'map',
      label: 'Map View',
      icon: FiMap,
      color: 'text-indigo-500',
      description: 'Geographic visualization'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: FiCalendar,
      color: 'text-pink-500',
      description: 'Event scheduling'
    },
    {
      id: 'search',
      label: 'Advanced Search',
      icon: FiSearch,
      color: 'text-gray-500',
      description: 'Find specific information'
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: FiBookmark,
      color: 'text-yellow-500',
      description: 'Saved items'
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: FiHeart,
      color: 'text-red-400',
      description: 'Liked content'
    },
    {
      id: 'history',
      label: 'History',
      icon: FiClock,
      color: 'text-gray-400',
      description: 'Recent activity'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: FiArchive,
      color: 'text-gray-300',
      description: 'Archived content'
    }
  ];

  const adminItems: NavItem[] = [
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: FiShield,
      color: 'text-blue-600',
      description: 'System administration',
      requiresRole: ['admin', 'ADMIN']
    },
    {
      id: 'users',
      label: 'User Management',
      icon: FiUsers,
      color: 'text-indigo-500',
      description: 'Manage user accounts',
      requiresRole: ['admin', 'ADMIN']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: FiSettings,
      color: 'text-gray-500',
      description: 'System configuration'
    }
  ];

  const canAccessAdmin = user && (user.role === 'admin' || user.role === 'ADMIN');

  const handleNavClick = (itemId: string) => {
    if (itemId === 'admin') {
      // Navigate to admin page instead of opening modal
      window.location.href = '/admin';
    } else if (itemId === 'dashboard') {
      // Navigate to dashboard page
      window.location.href = '/dashboard';
    } else if (itemId === 'bookmarks') {
      // Navigate to bookmarks page
      window.location.href = '/bookmarks';
    } else {
      onTabChange(itemId);
    }
  };

  const SidebarContent = () => (
    <div 
      className={`h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} bg-theme-card border-r border-theme-border`}
      style={{ isolation: 'isolate' }}
    >
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 border-b border-theme-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex-shrink-0">
            <FiZap className={`${isCollapsed ? 'h-4 w-4' : 'h-6 w-6'} text-white`} />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-xl font-bold text-theme-primary">FireNews</span>
              <p className="text-xs text-theme-secondary">Dashboard</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-theme-hover transition-colors flex-shrink-0 z-10"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <FiChevronRight className="h-7 w-7 text-theme-secondary" />
          ) : (
            <FiChevronLeft className="h-7 w-7 text-theme-secondary" />
          )}
        </button>
      </div>

      {/* Navigation - Scrollable */}
      <nav 
        className="flex-1 overflow-y-auto overflow-x-hidden" 
        style={{ 
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch'
        }}
        onWheel={(e) => {
          // Prevent scroll from bubbling up to parent
          e.stopPropagation();
        }}
      >
        <div className={`space-y-3 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          {/* Main Navigation */}
          <div className="space-y-1">
            <h3 className={`text-xs font-semibold text-theme-secondary uppercase tracking-wider ${isCollapsed ? 'sr-only' : ''}`}>
              Main Navigation
            </h3>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-4'} rounded-xl transition-all duration-200 group relative ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-200 dark:border-blue-700'
                    : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
                }`}
              >
                <item.icon className={`${isCollapsed ? 'h-8 w-8' : 'h-6 w-6'} ${activeTab === item.id ? 'text-blue-600 dark:text-blue-400' : item.color}`} />
                {!isCollapsed && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {isCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Admin Navigation */}
          {canAccessAdmin && (
            <div className="space-y-1 pt-4 border-t border-theme-border">
              <h3 className={`text-xs font-semibold text-theme-secondary uppercase tracking-wider ${isCollapsed ? 'sr-only' : ''}`}>
                Administration
              </h3>
              {adminItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-4'} rounded-xl transition-all duration-200 group ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 shadow-lg border border-blue-200 dark:border-blue-700'
                      : 'text-theme-secondary hover:bg-theme-hover hover:text-theme-primary'
                  }`}
                >
                  <item.icon className={`${isCollapsed ? 'h-8 w-8' : 'h-6 w-6'} ${activeTab === item.id ? 'text-blue-600 dark:text-blue-400' : item.color}`} />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Footer - Fixed */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-theme-border space-y-2 flex-shrink-0`}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-4'} rounded-lg hover:bg-theme-hover transition-colors`}
        >
          {theme === 'dark' ? (
            <FiSun className={`${isCollapsed ? 'h-8 w-8' : 'h-6 w-6'} text-yellow-500`} />
          ) : (
            <FiMoon className={`${isCollapsed ? 'h-8 w-8' : 'h-6 w-6'} text-gray-500`} />
          )}
          {!isCollapsed && (
            <span className="text-theme-secondary">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-theme-primary truncate">
                {user?.email || 'User'}
              </p>
              <p className="text-xs text-theme-secondary capitalize">
                {user?.role || 'user'}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            // Redirect to landing page after logout
            window.location.href = '/';
          }}
          className={`w-full flex items-center gap-3 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-4'} rounded-lg hover:bg-theme-hover transition-colors text-theme-secondary hover:text-theme-primary`}
        >
          <FiLogOut className={`${isCollapsed ? 'h-8 w-8' : 'h-6 w-6'}`} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-screen z-50 bg-theme-card border-r border-theme-border shadow-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${isMobileOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onMobileToggle}
        />
        
        {/* Sidebar */}
        <div className="absolute left-0 top-0 h-full w-64 bg-theme-card border-r border-theme-border shadow-2xl">
          <SidebarContent />
        </div>
      </div>
    </>
  );
} 