function NotificationCenter({ notifications }) {
  if (!notifications || notifications.length === 0) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  const getNotificationClass = (type) => {
    return `notification notification-${type}`;
  };

  return (
    <div className="notification-center">
      {notifications.map((notification) => (
        <div key={notification.id} className={getNotificationClass(notification.type)}>
          <div className="notification-icon">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="notification-content">
            <p className="notification-message">{notification.message}</p>
            <span className="notification-time">
              {notification.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
