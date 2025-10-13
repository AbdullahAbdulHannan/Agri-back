import React from 'react';
import { Fab, Badge, Tooltip } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';

const ChatButton = ({ onClick, hasUnreadMessages = false }) => {
  return (
    <Tooltip title="AgriBazaar Assistant" placement="left">
      <Fab
        color="primary"
        aria-label="chat"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: '#4CAF50',
          '&:hover': {
            bgcolor: '#45a049'
          },
          zIndex: 999
        }}
      >
        <Badge
          color="error"
          variant="dot"
          invisible={!hasUnreadMessages}
        >
          <ChatIcon />
        </Badge>
      </Fab>
    </Tooltip>
  );
};

export default ChatButton;
