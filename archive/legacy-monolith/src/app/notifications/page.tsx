"use client";

import React from 'react';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const NotificationsPage: React.FC = () => {
  const notifications = [
    {
      id: 1,
      type: 'breaking',
      title: 'Breaking News Alert',
      message: 'Major tech announcement from Silicon Valley shakes up the industry',
      time: '2 minutes ago',
      read: false,
      icon: ExclamationTriangleIcon,
      color: 'text-red-500'
    },
    {
      id: 2,
      type: 'digest',
      title: 'Daily News Digest',
      message: 'Your personalized news digest for today is ready with 12 new articles',
      time: '1 hour ago',
      read: false,
      icon: InformationCircleIcon,
      color: 'text-blue-500'
    },
    {
      id: 3,
      type: 'article',
      title: 'Trending in Technology',
      message: 'AI developments continue to reshape the tech landscape worldwide',
      time: '3 hours ago',
      read: true,
      icon: CheckCircleIcon,
      color: 'text-green-500'
    },
    {
      id: 4,
      type: 'update',
      title: 'Climate Summit Update',
      message: 'Historic climate agreement reached with unprecedented global cooperation',
      time: '5 hours ago',
      read: true,
      icon: InformationCircleIcon,
      color: 'text-blue-500'
    },
    {
      id: 5,
      type: 'recommendation',
      title: 'Recommended for You',
      message: 'Based on your reading history, we have 5 new articles you might like',
      time: '1 day ago',
      read: true,
      icon: CheckCircleIcon,
      color: 'text-green-500'
    }
  ];

  const markAsRead = (id: number) => {
    // In a real app, this would update the notification status
    console.log(`Marking notification ${id} as read`);
  };

  const markAllAsRead = () => {
    // In a real app, this would mark all notifications as read
    console.log('Marking all notifications as read');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <BellIcon className="w-8 h-8 mr-3" />
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Stay updated with your latest news alerts and updates
            </p>
          </div>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-vermillion hover:bg-vermillion/90 text-white font-mono text-xs tracking-wider uppercase transition-colors"
          >
            Mark All as Read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 ${
                  notification.read 
                    ? 'border-gray-300 dark:border-gray-600 opacity-75' 
                    : 'border-vermillion dark:border-vermillion'
                } transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${notification.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          notification.read 
                            ? 'text-gray-600 dark:text-gray-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`mt-1 ${
                          notification.read 
                            ? 'text-gray-500 dark:text-gray-500' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                          {notification.time}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-vermillion rounded-full"></div>
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm text-vermillion hover:underline"
                          >
                            Mark as read
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State (if no notifications) */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We'll notify you when there are updates on your favorite topics.
            </p>
          </div>
        )}

        {/* Settings Link */}
        <div className="mt-8 text-center">
          <button className="text-vermillion hover:underline font-mono text-xs tracking-wider uppercase">
            Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
