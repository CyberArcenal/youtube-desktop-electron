// src/renderer/components/Shared/NotificationDrawer.tsx
import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCheck, Trash2, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// --- Types ---
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'purchase' | 'sale';
  isRead: boolean;
  createdAt: Date;
  metadata?: any;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

// --- Mock API service (replace with real backend later) ---
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New subscriber!',
    message: 'CyberArcenal just subscribed to your channel. Thank you!',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Video uploaded',
    message: 'Your video "Electron + React + Tailwind Setup" has finished processing and is now live.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Comment on your video',
    message: 'User123 commented: "Awesome tutorial, very helpful!"',
    type: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'YouTube Update',
    message: 'New features available: improved player and dark mode optimizations. Check them out!',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const notificationAPI = {
  getAll: async (params: { limit: number; offset: number }) => {
    await delay(500);
    const all = [...mockNotifications];
    const paginated = all.slice(params.offset, params.offset + params.limit);
    return { status: true, data: paginated, message: 'OK' };
  },
  getUnreadCount: async () => {
    await delay(200);
    const count = mockNotifications.filter(n => !n.isRead).length;
    return { status: true, data: count };
  },
  markAsRead: async (id: string) => {
    await delay(300);
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) notification.isRead = true;
    return { status: true, message: 'Marked as read' };
  },
  markAllAsRead: async () => {
    await delay(300);
    mockNotifications.forEach(n => n.isRead = true);
    return { status: true, message: 'All marked as read' };
  },
  delete: async (id: string) => {
    await delay(300);
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index !== -1) mockNotifications.splice(index, 1);
    return { status: true, message: 'Deleted' };
  },
};

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const limit = 15;

  // Reset when drawer opens
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setNotifications([]);
      fetchUnreadCount();
    }
  }, [isOpen]);

  // Fetch notifications when page changes
  useEffect(() => {
    if (!isOpen) return;
    fetchNotifications(page === 1);
  }, [page, isOpen]);

  const fetchNotifications = async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationAPI.getAll({
        limit,
        offset: (page - 1) * limit,
      });
      if (response.status) {
        const newItems = response.data;
        setNotifications(prev => (reset ? newItems : [...prev, ...newItems]));
        setHasMore(newItems.length === limit);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.status) {
        setUnreadCount(response.data);
        onUnreadCountChange?.(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await notificationAPI.markAsRead(id);
      if (response.status) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
        const newUnreadCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnreadCount);
        onUnreadCountChange?.(newUnreadCount);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead();
      if (response.status) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        onUnreadCountChange?.(0);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    try {
      const response = await notificationAPI.delete(id);
      if (response.status) {
        const wasUnread = notifications.find(n => n.id === id)?.isRead === false;
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (wasUnread) {
          const newUnreadCount = Math.max(0, unreadCount - 1);
          setUnreadCount(newUnreadCount);
          onUnreadCountChange?.(newUnreadCount);
        }
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(p => p + 1);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const getTypeIcon = (type: Notification['type']) => {
    const colorMap = {
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      purchase: 'bg-purple-500',
      sale: 'bg-green-500',
    };
    return <div className={`w-2 h-2 rounded-full ${colorMap[type] || 'bg-gray-500'}`} />;
  };

  const isLongMessage = (msg: string) => msg.length > 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0f0f0f] border-l border-[#272727] shadow-xl transform transition-transform duration-300 ease-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#272727]">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-red-400">
                    ({unreadCount} unread)
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-[#272727] transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex justify-end p-2 border-b border-[#272727]">
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-400 hover:bg-[#272727] rounded-full transition disabled:opacity-40"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            </div>
          )}

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-red-500" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-gray-400">{error}</p>
                <button
                  onClick={() => {
                    setPage(1);
                    setNotifications([]);
                    fetchNotifications(true);
                  }}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-full text-sm"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                <p className="text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  When you get notifications, they'll appear here.
                </p>
              </div>
            ) : (
              <>
                {notifications.map(notification => {
                  const expanded = expandedIds.has(notification.id);
                  const longMessage = isLongMessage(notification.message);

                  return (
                    <div
                      key={notification.id}
                      className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                        notification.isRead
                          ? 'border-[#272727] bg-[#1a1a1a]'
                          : 'border-red-500/50 bg-[#1a1a1a] shadow-sm'
                      } hover:bg-[#252525]`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              notification.isRead ? 'text-gray-300' : 'text-white'
                            }`}
                          >
                            {notification.title}
                          </p>

                          <div className="mt-1">
                            <p
                              className={`text-xs text-gray-400 ${
                                !expanded ? 'line-clamp-2' : ''
                              }`}
                            >
                              {notification.message}
                            </p>
                            {longMessage && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleExpanded(notification.id);
                                }}
                                className="mt-1 text-xs text-red-400 hover:underline flex items-center gap-1"
                              >
                                {expanded ? (
                                  <>
                                    Show less <ChevronUp className="w-3 h-3" />
                                  </>
                                ) : (
                                  <>
                                    Read more <ChevronDown className="w-3 h-3" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(notification.createdAt, {
                              addSuffix: true,
                            })}
                          </p>

                          {notification.metadata && expanded && (
                            <div className="mt-2 text-xs text-gray-400 bg-[#0f0f0f] p-2 rounded border border-[#272727]">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(notification.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-1 rounded hover:bg-[#333]"
                              title="Mark as read"
                            >
                              <CheckCheck className="w-4 h-4 text-green-500" />
                            </button>
                          )}
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            className="p-1 rounded hover:bg-[#333]"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full py-2 text-sm text-red-400 hover:bg-[#272727] rounded-full transition disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      'Load more'
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};