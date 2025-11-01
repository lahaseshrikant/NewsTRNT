'use client';

import AdminGuard from './AdminGuard';
import { useAdmin } from '@/contexts/AdminContext';
import Link from 'next/link';

const AdminDashboard = () => {
  const { logout } = useAdmin();

  const logoFeatures = [
    {
      title: 'Logo Manager',
      description: 'Create, customize, and deploy logos across the platform',
      href: '/admin/logo-manager',
      icon: '🎨',
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Logo History',
      description: 'View complete version history and manage logo changes',
      href: '/admin/logo-history',
      icon: '📋',
      color: 'from-green-500 to-teal-600'
    },
    {
      title: 'Logo Gallery',
      description: 'Browse and manage the complete logo collection',
      href: '/admin/logo-gallery',
      icon: '🖼️',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const contentFeatures = [
    {
      title: 'Content Manager',
      description: 'Create, edit, and manage news articles and content',
      href: '/admin/content',
      icon: '📝',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Categories',
      description: 'Organize content categories and tags',
      href: '/admin/content/categories',
      icon: '📂',
      color: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Web Stories',
      description: 'Manage visual web stories and multimedia content',
      href: '/admin/content/web-stories',
      icon: '�',
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Newsletter',
      description: 'Manage newsletter content and subscriptions',
      href: '/admin/newsletter',
      icon: '�',
      color: 'from-cyan-500 to-blue-600'
    }
  ];

  const systemFeatures = [
    {
      title: 'Analytics',
      description: 'View detailed site analytics and user behavior',
      href: '/admin/analytics',
      icon: '📊',
      color: 'from-violet-500 to-purple-600'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      href: '/admin/users',
      icon: '👥',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      title: 'Moderation',
      description: 'Review and moderate content and user interactions',
      href: '/admin/moderation',
      icon: '🛡️',
      color: 'from-red-500 to-pink-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and maintenance',
      href: '/admin/system',
      icon: '⚙️',
      color: 'from-gray-500 to-slate-600'
    }
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Main Content */}
        <div className="container mx-auto py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome to NewsTRNT Admin</h2>
            <p className="text-blue-100 text-lg">
              The Road Not Taken - Manage your platform with powerful admin tools
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Logo</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Current</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">�</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Articles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" id="articles-count">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" id="users-count">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">Online</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Page Views</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" id="views-count">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">�</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" id="comments-count">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Logo Versions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" id="logo-count">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Processing</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Management Section */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-xl">🎨</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Logo Management</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {logoFeatures.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href}
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-[1.02]">
                    <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                          {feature.icon}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {feature.title}
                          </h4>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        Access Feature
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Content Management Section */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contentFeatures.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href}
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-[1.02]">
                    <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                          {feature.icon}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {feature.title}
                          </h4>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        Access Feature
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* System Management Section */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-xl">🛠️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">System Management</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemFeatures.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href}
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:scale-[1.02]">
                    <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                          {feature.icon}
                        </div>
                        <div className="ml-3">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {feature.title}
                          </h4>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                        Access Feature
                        <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">📊</span>
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Admin panel accessed • Just now
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Logo system initialized • System startup
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Admin authentication enabled • System startup
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  Database connection established • System startup
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
                  AI services initialized • System startup
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🛡️</span>
                System Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Database Status</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                    ✅ Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">API Services</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                    ✅ Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI Processing</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                    🤖 Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Logo System</span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
                    🎨 Ready
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Security</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                    🔒 Secured
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminDashboard;
