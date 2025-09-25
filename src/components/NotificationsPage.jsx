import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 1. Saari notifications lao
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data);
        // 2. Page khulte hi sabko 'read' mark kar do
        markAllAsRead(data, user.id);
      }
    }
    setLoading(false);
  };

  const markAllAsRead = async (notifs, userId) => {
    const unreadIds = notifs.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.issue_id) {
      navigate(`/dashboard/issue/${notification.issue_id}`);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading notifications...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">All Notifications</h1>
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <p className="text-gray-800">{notif.message}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">You have no notifications.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
