import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { markReadLocally, markAllReadLocally, NotificationItem, setNotifications, setUnreadCount } from '../reducers/notification.reducer';
import { gqlRequest } from '../utils/api';
import { Link } from '@remix-run/react';
import { toast } from 'sonner';

const NOTIFICATIONS_QUERY = `
  query GetNotifications($limit: Int) {
    notifications(limit: $limit) {
      id
      userId
      type
      payload
      read
      createdAt
      instanceId
    }
  }
`;

const UNREAD_COUNT_QUERY = `
  query GetUnreadCount {
    unreadNotificationCount
  }
`;

const MARK_READ_MUTATION = `
  mutation MarkRead($id: String!) {
    markNotificationRead(id: $id)
  }
`;

const MARK_ALL_READ_MUTATION = `
  mutation MarkAllRead {
    markAllNotificationsRead
  }
`;

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const notifications = useSelector((state: RootState) => state.notification.items);
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Fetch initial notifications and count
    const fetchNotifications = async () => {
      try {
        const [notifsRes, countRes] = await Promise.all([
          gqlRequest(NOTIFICATIONS_QUERY, { limit: 20 }),
          gqlRequest(UNREAD_COUNT_QUERY, {})
        ]);
        
        if (notifsRes.notifications) {
          dispatch(setNotifications(notifsRes.notifications));
        }
        if (countRes.unreadNotificationCount !== undefined) {
          dispatch(setUnreadCount(countRes.unreadNotificationCount));
        }
      } catch (err) {
        toast.error('Failed to fetch notifications');
        // console.error('Failed to fetch notifications', err);
      }
    };
    
    fetchNotifications();
  }, [dispatch, isAuthenticated]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await gqlRequest(MARK_READ_MUTATION, { id });
      dispatch(markReadLocally(id));
    } catch (err) {
      // toast.error('Failed to mark read');
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await gqlRequest(MARK_ALL_READ_MUTATION, {});
      dispatch(markAllReadLocally());
    } catch (err) {
      toast.error('Failed to mark all read');
      console.error('Failed to mark all read', err);
    }
  };

  const renderNotificationContent = (item: NotificationItem) => {
    const payloadInfo = item.payload as any;
    
    switch (item.type) {
      case 'invite_received':
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Project Invitation</span>
            <span className="text-xs text-gray-500 line-clamp-2">
              <span className="font-semibold text-gray-700">{payloadInfo.inviterEmail}</span> invited you to <span className="font-semibold text-gray-700">{payloadInfo.projectName}</span>
            </span>
          </div>
        );
      case 'invite_accepted':
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Invitation Accepted</span>
            <span className="text-xs text-gray-500 line-clamp-2">
              <span className="font-semibold text-gray-700">{payloadInfo.accepterEmail}</span> joined <span className="font-semibold text-gray-700">{payloadInfo.projectName}</span>
            </span>
          </div>
        );
      case 'project_archived':
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-orange-600">Project Archived</span>
            <span className="text-xs text-gray-500 line-clamp-2">
              <span className="font-semibold text-gray-700">{payloadInfo.projectName}</span> has been archived by the owner.
            </span>
          </div>
        );
      case 'project_deleted':
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-red-600">Project Deleted</span>
            <span className="text-xs text-gray-500 line-clamp-2">
              <span className="font-semibold text-gray-700">{payloadInfo.projectName}</span> has been deleted by the owner.
            </span>
          </div>
        );
      default:
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">Notification</span>
            <span className="text-xs text-gray-500 line-clamp-2">You have a new update.</span>
          </div>
        );
    }
  };

  const getLinkForNotification = (item: NotificationItem) => {
    if (item.type === 'invite_received') return '/files?tab=invitations';
    if (item.instanceId && item.type !== 'project_deleted') return `/files/${item.instanceId}`;
    return '#';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Bell className="w-5 h-5 hover:rotate-[15deg] duration-200 delay-50 origin-top" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-[-20%] mt-2 w-80 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center sticky top-0">
            <h3 className="text-sm font-bold text-gray-800 tracking-tight">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                <Bell className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50/50">
                {notifications.map((item) => (
                  <li 
                    key={item.id} 
                    className={`group relative transition-colors ${item.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/40 hover:bg-blue-50/80'}`}
                  >
                    <Link 
                      to={getLinkForNotification(item)}
                      className="block p-4"
                      onClick={() => !item.read && handleMarkRead(item.id, { preventDefault: () => {}, stopPropagation: () => {} } as any)}
                    >
                      <div className="flex items-start gap-3">
                        {!item.read && (
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0 shadow-sm" />
                        )}
                        <div className="flex-1 min-w-0">
                          {renderNotificationContent(item)}
                          <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                            {new Date(item.createdAt).toLocaleString(undefined, { 
                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </Link>
                    {!item.read && (
                      <button 
                        onClick={(e) => handleMarkRead(item.id, e)}
                        className="absolute right-3 top-4 opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-blue-600 transition-all p-1 hover:bg-blue-50 rounded"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
