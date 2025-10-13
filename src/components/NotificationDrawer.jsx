import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
  Badge,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';

const NotificationDrawer = ({
  open,
  onClose,
  notifications = [],
  onDelete,
  onMarkAsRead,
  loading = false
}) => {
  const navigate = useNavigate();

  const handleNotificationClick = useCallback((notification) => {
    // Mark as read when clicked
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification._id);
    }

    // Navigate to the link if available
    const link = notification.link || (notification.meta && notification.meta.link);
    if (link) {
      navigate(link, { state: notification.meta });
      if (onClose) onClose();
    } else if (notification.meta && notification.meta.auctionId) {
      // Fallback for notifications with auctionId in meta
      navigate(`/auction-details/${notification.meta.auctionId}`, { state: notification.meta });
      if (onClose) onClose();
    }
  }, [navigate, onMarkAsRead, onClose]);
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Content */}
        {loading ? (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body1" color="textSecondary">No notifications</Typography>
          </Box>
        ) : (
          <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {notifications.map((notif) => (
              <React.Fragment key={notif._id || notif.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notif._id || notif.id);
                      }}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      bgcolor: notif.isRead ? 'transparent' : 'action.hover',
                      '&:hover': {
                        bgcolor: notif.isRead ? 'action.hover' : 'action.selected',
                      },
                    }}
                  >
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      <Badge
                        color="primary"
                        variant="dot"
                        invisible={notif.isRead}
                      >
                        <CircleNotificationsIcon
                          color={notif.type === 'order' ? 'success' :
                            notif.type === 'bid' ? 'warning' :
                              notif.type === 'payment' ? 'info' : 'action'}
                          fontSize="small"
                        />
                      </Badge>
                    </Box>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notif.isRead ? 'normal' : 'medium',
                            color: 'text.primary'
                          }}
                        >
                          {notif.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: 'block',
                              wordWrap: 'break-word',
                              whiteSpace: 'normal',
                              overflow: 'visible',
                            }}
                          >
                            {notif.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {notif.timeAgo}
                          </Typography>
                        </>
                      }
                      primaryTypographyProps={{
                        sx: { mb: 0.5 }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;
