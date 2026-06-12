import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography, Button, ThemeProvider,
  createTheme, Divider, Avatar, Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PhoneIcon from '@mui/icons-material/Phone';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const DRAWER_WIDTH = 260;

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6C5CE7', light: '#a29bfe' },
    secondary: { main: '#00cec9' },
    background: { default: '#0a0a1a', paper: 'rgba(18, 18, 48, 0.8)' },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Roboto", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
});

const NAV_ITEMS = [
  { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
  { text: 'Звонки', icon: <PhoneIcon />, path: '/calls' },
];

const ADMIN_ITEMS = [
  { text: 'Загрузить', icon: <CloudUploadIcon />, path: '/upload' },
  { text: 'Google Drive', icon: <CloudSyncIcon />, path: '/gdrive' },
  { text: 'Менеджеры', icon: <PeopleIcon />, path: '/users' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0d0d2b 0%, #1a1a3e 100%)' }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: 18, fontWeight: 800 }}>
          CA
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ color: '#fff', lineHeight: 1.2 }}>Call Analytics</Typography>
          <Typography variant="caption" sx={{ color: 'primary.light', opacity: 0.7 }}>Whisper + GPT</Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{
              borderRadius: 2, mb: 0.5, px: 2, py: 1.5,
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, rgba(108,92,231,0.3) 0%, rgba(108,92,231,0.1) 100%)',
                borderLeft: '3px solid #6C5CE7',
                '&:hover': { background: 'linear-gradient(135deg, rgba(108,92,231,0.35) 0%, rgba(108,92,231,0.15) 100%)' },
              },
              '&:hover': { background: 'rgba(255,255,255,0.04)' },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'rgba(255,255,255,0.4)', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} slotProps={{ primary: { sx: { fontSize: 14, fontWeight: location.pathname === item.path ? 600 : 400 } } }} />
          </ListItemButton>
        ))}
        {isAdmin && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />}
        {isAdmin && ADMIN_ITEMS.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            sx={{
              borderRadius: 2, mb: 0.5, px: 2, py: 1.5,
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, rgba(0,206,201,0.3) 0%, rgba(0,206,201,0.1) 100%)',
                borderLeft: '3px solid #00cec9',
              },
              '&:hover': { background: 'rgba(255,255,255,0.04)' },
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'secondary.main' : 'rgba(255,255,255,0.4)', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} slotProps={{ primary: { sx: { fontSize: 14 } } }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: isAdmin ? 'primary.main' : 'secondary.main', fontSize: 14 }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{user?.username}</Typography>
            <Chip label={isAdmin ? 'РОП' : 'Менеджер'} size="small" sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(255,255,255,0.08)' }} />
          </Box>
        </Box>
        <Button
          fullWidth size="small" variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: 'rgba(255,255,255,0.3)' } }}
        >
          Выйти
        </Button>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #1a0a2e 100%)' }}>
        <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, background: 'rgba(10,10,26,0.8)', backdropFilter: 'blur(20px)', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} />
            <Typography variant="body2" sx={{ mr: 2, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              {user?.username}
            </Typography>
            <Button
              color="inherit" size="small"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}
            >
              Выйти
            </Button>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', background: 'transparent' },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box component="main" sx={{ flexGrow: 1, p: 4, ml: { md: 0 }, mt: 8, minHeight: '100vh', maxWidth: 1400 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
