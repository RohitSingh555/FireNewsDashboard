import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiClock, 
  FiBarChart, 
  FiSettings, 
  FiShield, 
  FiFileText, 
  FiUser, 
  FiTrash2,
  FiEdit,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { useAuth } from '../lib/auth';
import api from '../lib/axios';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';

interface AdminPageProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function AdminPage({ activeTab = 'admin', onTabChange }: AdminPageProps) {
  const { user, loading } = useAuth();
  const [adminActiveTab, setAdminActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const adminTabs = [
    { id: 'users', name: 'User Management', icon: FiUsers },
    { id: 'activity', name: 'Activity Log', icon: FiClock },
    { id: 'analytics', name: 'Analytics', icon: FiBarChart },
    { id: 'settings', name: 'Settings', icon: FiSettings }
  ];

  // Fetch users for admin panel
  useEffect(() => {
    if (user?.role === 'admin') {
      async function fetchUsers() {
        try {
          const res = await api.get('/admin/users');
          setUsers(res.data);
        } catch (error: any) {
          console.error('Failed to fetch users:', error);
          if (error.response?.status === 401) {
            console.error('Unauthorized: User may not have admin privileges or endpoint may not exist');
          }
          setUsers([]);
        }
      }
      fetchUsers();
    }
  }, [user?.role]);

  // Fetch activity logs for admin panel
  useEffect(() => {
    if (user?.role === 'admin' && adminActiveTab === 'activity') {
      async function fetchActivityLogs() {
        try {
          const res = await api.get('/api/admin/activity-logs');
          setActivityLogs(res.data);
        } catch (error: any) {
          console.error('Failed to fetch activity logs:', error);
          setActivityLogs([]);
        }
      }
      fetchActivityLogs();
    }
  }, [user?.role, adminActiveTab]);

  const handleUpdateRole = async (userId: number, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
    } catch (err) {
      alert('Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-600 text-white';
      case 'reporter': return 'bg-green-600 text-white';
      case 'user': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <FiShield className="h-4 w-4 text-blue-600" />;
      case 'reporter': return <FiFileText className="h-4 w-4 text-green-500" />;
      case 'user': return <FiUser className="h-4 w-4 text-gray-500" />;
      default: return <FiUser className="h-4 w-4 text-gray-500" />;
    }
  };

  // Check if user has admin access
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-teal-dark mx-auto mb-4"></div>
          <span className="text-theme-teal-dark text-xl font-bold">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-background">
        <div className="text-center">
          <FiShield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-theme-primary mb-2">Access Denied</h1>
          <p className="text-theme-secondary">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-theme-background">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange || (() => {})}
        onAdminModalOpen={() => {}} // No-op since we're already in admin
        isMobileOpen={isMobileMenuOpen}
        onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen overflow-x-auto w-full transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Top Navigation */}
        <TopNavigation
          activeTab={activeTab}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onAdminModalOpen={() => {}} // No-op since we're already in admin
          isSidebarCollapsed={isSidebarCollapsed}
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
        />

        {/* Content */}
        <main className="flex-1 flex flex-col p-4 w-full bg-theme-background pt-20">
          <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-theme-primary">Admin Dashboard</h1>
                <p className="text-theme-secondary mt-1">Manage users, view analytics, and configure system settings</p>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="bg-theme-card rounded-xl shadow-sm border border-theme-border p-4">
              <div className="flex space-x-1 mb-6 border-b border-theme-border">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAdminActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                        adminActiveTab === tab.id
                          ? 'bg-theme-teal-dark text-white shadow-md'
                          : 'bg-theme-cool-gray-light text-theme-secondary hover:bg-theme-cool-gray-medium'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${adminActiveTab === tab.id ? 'text-white' : 'text-theme-secondary'}`} />
                      {tab.name}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="overflow-y-auto">
                {adminActiveTab === 'users' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold text-theme-primary">User Management</h4>
                      <div className="text-sm text-theme-secondary">
                        Total Users: {users.length}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-theme-teal-light">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-theme-card divide-y divide-theme-border">
                          {users.map((userItem) => (
                            <tr key={userItem.id} className="hover:bg-theme-teal-light">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FiUser className="h-10 w-10 text-gray-400" />
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-theme-primary">
                                      {userItem.first_name} {userItem.last_name}
                                    </div>
                                    <div className="text-sm text-theme-secondary">
                                      @{userItem.username}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-theme-primary">{userItem.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={userItem.role}
                                  onChange={(e) => handleUpdateRole(userItem.id, e.target.value)}
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userItem.role)}`}
                                >
                                  <option value="user">User</option>
                                  <option value="reporter">Reporter</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  userItem.is_active 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                }`}>
                                  {userItem.is_active ? (
                                    <>
                                      <FiCheckCircle className="h-3 w-3 mr-1" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <FiXCircle className="h-3 w-3 mr-1" />
                                      Inactive
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleDeleteUser(userItem.id)}
                                  className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                  disabled={userItem.id === user?.id}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'activity' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold text-theme-primary">Activity Log</h4>
                      <div className="text-sm text-theme-secondary">
                        Total Activities: {activityLogs.length}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-theme-border">
                        <thead className="bg-theme-teal-light">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Action</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-theme-teal-dark uppercase tracking-wider">Details</th>
                          </tr>
                        </thead>
                        <tbody className="bg-theme-card divide-y divide-theme-border">
                          {activityLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-theme-teal-light">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  log.action_type === 'user_login' ? 'bg-green-100 text-green-800' :
                                  log.action_type === 'user_created' ? 'bg-blue-100 text-blue-800' :
                                  log.action_type === 'news_uploaded' ? 'bg-purple-100 text-purple-800' :
                                  log.action_type === 'user_logout' ? 'bg-gray-100 text-gray-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {log.action_type.replace('_', ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-theme-primary">{log.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-theme-secondary">{log.user_email || 'Anonymous'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-theme-secondary">
                                  {new Date(log.created_at).toLocaleString()}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-theme-secondary max-w-xs truncate" title={log.details}>
                                  {log.details || '-'}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {activityLogs.length === 0 && (
                      <div className="text-center py-8 text-theme-secondary">
                        <FiClock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No activity logs found.</p>
                      </div>
                    )}
                  </div>
                )}

                {adminActiveTab === 'analytics' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-theme-primary">Analytics</h4>
                    <div className="text-center py-8 text-theme-secondary">
                      <FiBarChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Analytics dashboard coming soon...</p>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'settings' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-theme-primary">Settings</h4>
                    <div className="text-center py-8 text-theme-secondary">
                      <FiSettings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>System settings coming soon...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 