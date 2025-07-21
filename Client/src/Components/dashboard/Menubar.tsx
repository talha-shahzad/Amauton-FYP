// @ts-nocheck
import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom'; 

const drawerWidth = 200;

const Menubar: React.FC = () => {
  const menuItems = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Market Trends', path: '/trends' },
    { text: 'Seller Operations', path: '/seller-operations' },
    { text: 'Settings', path: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        height: '100vh',
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          position: 'relative',
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link} 
            to={item.path}
            sx={{
              my: '1rem',
              '&:hover': {
                backgroundColor: '#fe9a0540',
                borderRadius: '20px',
              },
            }}
          >
            <ListItemText
              primary={item.text}
              sx={{
                color: 'black',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Menubar;
