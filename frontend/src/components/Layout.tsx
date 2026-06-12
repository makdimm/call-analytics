import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography, Button, ThemeProvider,
  createTheme, Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PhoneIcon from '@mui/icons-material/Phone';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const DRAWER_WIDTH = 240;

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7c4dff' },
    secondary: { main: '#00e5ff' },
    background: { default: '#0d0d1a', paper: '#1a1a2e' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
});

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
    { text: 'Звонки', icon: <PhoneIcon />, path: '/calls' },
    ...(isAdmin ? [{ text: 'Загрузить', icon: <CloudUploadIcon />, path: '/upload' }] : []),
    ...(isAdmin ? [{ text: 'Google Drive', icon: <CloudSyncIcon />, path: '/gdrive' }] : []),
    ...(isAdmin ? [{ text: 'Менеджеры', icon: <PeopleIcon />, path: '/users' }] : []),
  ];

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
          Call Analytics
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{ mx: 1, borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'grey.500' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, background: '#12122a' }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              Call Analytics
            </Typography>
            <Typography variant="body2" sx={{ mr: 2, color: 'grey.400' }}>
              {user?.username} ({user?.role === 'admin' ? 'РОП' : 'Менеджер'})
            </Typography>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
              Выйти
            </Button>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: 0 }, mt: 8, minHeight: '100vh' }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
