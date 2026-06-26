import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, CssBaseline, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, ThemeProvider, createTheme, Divider, Avatar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PhoneIcon from '@mui/icons-material/Phone';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import LogoutIcon from '@mui/icons-material/Logout';

const SIDEBAR_WIDTH = 220;

const theme = createTheme({
  palette: {
    primary: { main: '#3b82f6' },
    text: { primary: '#1f2937', secondary: '#6b7280' },
    background: { default: '#f3f4f6', paper: '#ffffff' },
    divider: '#e5e7eb',
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h4: { fontWeight: 700, fontSize: 24, letterSpacing: '-0.03em' },
    h6: { fontWeight: 600, fontSize: 15 },
    body2: { fontSize: 13 },
    caption: { fontSize: 12 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: 12,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root:hover': {
            backgroundColor: '#f9fafb',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '10px 16px',
          fontSize: 13,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

const NAV_ITEMS = [
  { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
  { text: 'Звонки', icon: <PhoneIcon />, path: '/calls' },
];

const ADMIN_ITEMS = [
  { text: 'Загрузить', icon: <CloudUploadIcon />, path: '/upload' },
  { text: 'Google Drive', icon: <CloudSyncIcon />, path: '/gdrive' },
  { text: 'Менеджеры', icon: <PeopleIcon />, path: '/users' },
  { text: 'Критерии', icon: <DashboardIcon />, path: '/criteria-settings' },
  { text: 'База знаний', icon: <DashboardIcon />, path: '/knowledge-base' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const isSelected = (path: string) => location.pathname === path;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
      {/* Logo area */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: '#3b82f6', width: 32, height: 32, fontSize: 13, fontWeight: 700, borderRadius: 1.5 }}>
          CA
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: '#1f2937' }}>
            Call Analytics
          </Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.2 }}>
            OpenAI Whisper API + GPT
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.text}
            selected={isSelected(item.path)}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 1.5, mb: 0.25, px: 1.5, py: 1,
              '&.Mui-selected': {
                bgcolor: '#eff6ff',
                color: '#3b82f6',
                '&:hover': { bgcolor: '#dbeafe' },
              },
              '&:hover': { bgcolor: '#f9fafb' },
            }}
          >
            <ListItemIcon sx={{
              color: isSelected(item.path) ? '#3b82f6' : '#9ca3af',
              minWidth: 32, fontSize: 20,
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} slotProps={{
              primary: { sx: { fontSize: 13, fontWeight: isSelected(item.path) ? 600 : 400, color: isSelected(item.path) ? '#3b82f6' : '#4b5563' } },
            }} />
          </ListItemButton>
        ))}

        {isAdmin && <Divider sx={{ my: 1 }} />}

        {isAdmin && ADMIN_ITEMS.map((item) => (
          <ListItemButton
            key={item.text}
            selected={isSelected(item.path)}
            onClick={() => navigate(item.path)}
            sx={{
              borderRadius: 1.5, mb: 0.25, px: 1.5, py: 1,
              '&.Mui-selected': {
                bgcolor: '#eff6ff',
                color: '#3b82f6',
                '&:hover': { bgcolor: '#dbeafe' },
              },
              '&:hover': { bgcolor: '#f9fafb' },
            }}
          >
            <ListItemIcon sx={{
              color: isSelected(item.path) ? '#3b82f6' : '#9ca3af',
              minWidth: 32, fontSize: 20,
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} slotProps={{
              primary: { sx: { fontSize: 13, color: '#4b5563' } },
            }} />
          </ListItemButton>
        ))}
      </List>

      {/* User section at bottom */}
      <Divider />
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: '#e5e7eb', color: '#6b7280', borderRadius: 1.5 }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.username}</Typography>
            <Typography sx={{ fontSize: 11, color: '#9ca3af', lineHeight: 1.2 }}>
              {isAdmin ? 'Администратор' : 'Менеджер'}
            </Typography>
          </Box>
        </Box>
        <ListItemButton
          onClick={logout}
          sx={{ borderRadius: 1.5, px: 1.5, py: 0.75, color: '#9ca3af', '&:hover': { bgcolor: '#fef2f2', color: '#ef4444' } }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: 'inherit', fontSize: 18 }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Выйти" slotProps={{ primary: { sx: { fontSize: 13 } } }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f4f6' }}>
        {/* Permanent sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, borderRight: '1px solid #e5e7eb', bgcolor: '#fff' },
          }}
          open
        >
          <Toolbar />
          {drawer}
        </Drawer>

        {/* Main content */}
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ p: 5, maxWidth: 1280 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
