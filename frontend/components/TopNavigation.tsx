import React, { useState } from 'react';
import { 
  FiSearch, 
  FiBell, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiSun, 
  FiMoon, 
  FiMenu,
  FiPlus,
  FiFilter,
  FiDownload,
  FiUpload,
  FiRotateCw,
  FiZap,
  FiHelpCircle
} from 'react-icons/fi';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import ImportModal from './ImportModal';

interface TopNavigationProps {
  activeTab: string;
  onMobileMenuToggle: () => void;
  onAdminModalOpen: () => void;
  isSidebarCollapsed?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onImportSuccess?: () => void;
}

export default function TopNavigation({ 
  activeTab, 
  onMobileMenuToggle, 
  onAdminModalOpen,
  isSidebarCollapsed = false,
  searchQuery = '',
  onSearchChange,
  onImportSuccess
}: TopNavigationProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const notifications = [
    { id: 1, title: 'New fire alert', message: 'Wildfire detected in Northern California', time: '2 min ago', type: 'alert' },
    { id: 2, title: 'System update', message: 'Database maintenance completed', time: '1 hour ago', type: 'info' },
    { id: 3, title: 'New report', message: 'Monthly analytics report ready', time: '3 hours ago', type: 'success' }
  ];

  const quickActions = [
    { label: 'Add News', icon: FiPlus, action: () => console.log('Add news') },
    { label: 'Export Data', icon: FiDownload, action: () => console.log('Export') },
    { label: 'Import Data', icon: FiUpload, action: () => setShowImportModal(true) },
    { label: 'Refresh', icon: FiRotateCw, action: () => console.log('Refresh') }
  ];

  const getTabTitle = () => {
    const titles: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'news': 'Fire News',
      'reports': 'Reports',
      'analytics': 'Analytics',
      'calendar': 'Calendar',
      'bookmarks': 'Bookmarks',
    };
    return titles[activeTab] || 'Dashboard';
  };

  return (
    <>
      <header className={`fixed top-0 right-0 z-40 bg-theme-card border-b border-theme-border shadow-sm transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:left-16' : 'lg:left-64'
      } left-0`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-theme-hover transition-colors"
          >
            <FiMenu className="h-6 w-6 text-theme-secondary" />
          </button>

          {/* Logo and Title */}
          {/* <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <FiZap className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-theme-primary">{getTabTitle()}</h1>
              <p className="text-sm text-theme-secondary">Fire News Dashboard</p>
            </div>
          </div> */}
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-secondary" />
            <input
              type="text"
              placeholder="Search news, alerts, reports..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-primary placeholder-theme-secondary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-1">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="p-2 rounded-lg hover:bg-theme-hover transition-colors"
                title={action.label}
              >
                <action.icon className="h-5 w-5 text-theme-secondary" />
              </button>
            ))}
          </div>

          {/* Help Button */}
          <button
            onClick={() => window.location.href = '/documentation'}
            className="p-2 rounded-lg hover:bg-theme-hover transition-colors"
            title="Documentation & Help"
          >
            <FiHelpCircle className="h-5 w-5 text-blue-500" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-theme-hover transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <FiSun className="h-5 w-5 text-yellow-500" />
            ) : (
              <FiMoon className="h-5 w-5 text-theme-secondary" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-theme-hover transition-colors relative"
              title="Notifications"
            >
              <FiBell className="h-5 w-5 text-theme-secondary" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-theme-card rounded-lg shadow-lg border border-theme-border z-50">
                <div className="p-4 border-b border-theme-border">
                  <h3 className="text-lg font-semibold text-theme-primary">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border-b border-theme-border hover:bg-theme-hover transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'alert' ? 'bg-red-500' :
                          notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-theme-primary">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-theme-secondary mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-theme-secondary mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-theme-border">
                  <button className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-theme-hover transition-colors"
            >
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-theme-primary">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-theme-secondary capitalize">
                  {user?.role || 'user'}
                </p>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-theme-card rounded-lg shadow-lg border border-theme-border z-50">
                <div className="p-4 border-b border-theme-border">
                  <p className="text-sm font-medium text-theme-primary">
                    {user?.email || 'User'}
                  </p>
                  <p className="text-xs text-theme-secondary capitalize">
                    {user?.role || 'user'}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      if (user?.role === 'admin' || user?.role === 'ADMIN') {
                        // Navigate to admin page instead of opening modal
                        window.location.href = '/admin';
                      }
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-theme-secondary hover:bg-theme-hover rounded-lg transition-colors"
                  >
                    <FiUser className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-theme-secondary hover:bg-theme-hover rounded-lg transition-colors"
                  >
                    <FiSettings className="h-4 w-4" />
                    Settings
                  </button>
                  <hr className="my-2 border-theme-border" />
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      // Redirect to landing page after logout
                      window.location.href = '/';
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <FiLogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-secondary" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-primary placeholder-theme-secondary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </header>

    {/* Import Modal */}
    <ImportModal
      open={showImportModal}
      onClose={() => setShowImportModal(false)}
      onSuccess={() => {
        setShowImportModal(false);
        if (onImportSuccess) {
          onImportSuccess();
        }
      }}
    />
    </>
  );
} 