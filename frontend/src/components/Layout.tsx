import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box, CssBaseline, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, ThemeProvider, createTheme, Divider, Avatar,
  IconButton, AppBar, Paper, BottomNavigation, BottomNavigationAction, useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PhoneIcon from '@mui/icons-material/Phone';
import PeopleIcon from '@mui/icons-material/People';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
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
    h5: { fontWeight: 700, fontSize: 20 },
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
          padding: '10px 12px',
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
    MuiDialog: {
      styleOverrides: {
        paperFullWidth: {
          margin: 8,
        },
      },
    },
  },
});

const ALL_NAV_ITEMS = [
  { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
  { text: 'Звонки', icon: <PhoneIcon />, path: '/calls' },
  { text: 'Загрузить', icon: <CloudUploadIcon />, path: '/upload' },
  { text: 'Менеджеры', icon: <PeopleIcon />, path: '/users' },
  { text: 'Drive', icon: <CloudSyncIcon />, path: '/gdrive' },
  { text: 'Критерии', icon: <SettingsIcon />, path: '/criteria-settings' },
  { text: 'База знаний', icon: <MenuBookIcon />, path: '/knowledge-base' },
];

const NAV_ITEMS = ALL_NAV_ITEMS.slice(0, 2);
const ADMIN_ITEMS = ALL_NAV_ITEMS.slice(2);
const BOTTOM_NAV = ALL_NAV_ITEMS.slice(0, 5); // bottom nav limited to 5

function SidebarContent({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate: (path: string) => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isSelected = (path: string) => location.pathname === path;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
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
          <ListItemButton key={item.text} selected={isSelected(item.path)} onClick={() => onNavigate(item.path)}
            sx={{ borderRadius: 1.5, mb: 0.25, px: 1.5, py: 1,
              '&.Mui-selected': { bgcolor: '#eff6ff', color: '#3b82f6', '&:hover': { bgcolor: '#dbeafe' } },
              '&:hover': { bgcolor: '#f9fafb' },
            }}
          >
            <ListItemIcon sx={{ color: isSelected(item.path) ? '#3b82f6' : '#9ca3af', minWidth: 32, fontSize: 20 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} slotProps={{
              primary: { sx: { fontSize: 13, fontWeight: isSelected(item.path) ? 600 : 400, color: isSelected(item.path) ? '#3b82f6' : '#4b5563' } },
            }} />
          </ListItemButton>
        ))}
        {isAdmin && <Divider sx={{ my: 1 }} />}
        {isAdmin && ADMIN_ITEMS.map((item) => (
          <ListItemButton key={item.text} selected={isSelected(item.path)} onClick={() => onNavigate(item.path)}
            sx={{ borderRadius: 1.5, mb: 0.25, px: 1.5, py: 1,
              '&.Mui-selected': { bgcolor: '#eff6ff', color: '#3b82f6', '&:hover': { bgcolor: '#dbeafe' } },
              '&:hover': { bgcolor: '#f9fafb' },
            }}
          >
            <ListItemIcon sx={{ color: isSelected(item.path) ? '#3b82f6' : '#9ca3af', minWidth: 32, fontSize: 20 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} slotProps={{
              primary: { sx: { fontSize: 13, color: '#4b5563' } },
            }} />
          </ListItemButton>
        ))}
      </List>
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
        <ListItemButton onClick={logout}
          sx={{ borderRadius: 1.5, px: 1.5, py: 0.75, color: '#9ca3af', '&:hover': { bgcolor: '#fef2f2', color: '#ef4444' } }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: 'inherit', fontSize: 18 }}><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Выйти" slotProps={{ primary: { sx: { fontSize: 13 } } }} />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  const goTo = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Mobile: bottom nav + hamburger drawer
  // Desktop: permanent sidebar
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f4f6' }}>
        {/* Mobile: AppBar */}
        {isMobile && (
          <AppBar position="fixed" sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', boxShadow: 'none', zIndex: 1201 }}>
            <Toolbar sx={{ minHeight: 56, px: 2 }}>
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ color: '#374151', mr: 1 }}>
                <MenuIcon />
              </IconButton>
              <Avatar sx={{ bgcolor: '#3b82f6', width: 28, height: 28, fontSize: 11, fontWeight: 700, borderRadius: 1, mr: 1 }}>
                CA
              </Avatar>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#1f2937', flex: 1 }}>
                Call Analytics
              </Typography>
              <Avatar sx={{ width: 26, height: 26, fontSize: 10, bgcolor: '#e5e7eb', color: '#6b7280', borderRadius: 1 }}>
                {user?.username?.[0]?.toUpperCase()}
              </Avatar>
            </Toolbar>
          </AppBar>
        )}

        {/* Mobile: temporary drawer */}
        {isMobile && (
          <Drawer
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            sx={{ '& .MuiDrawer-paper': { width: 260 } }}
          >
            <SidebarContent isAdmin={!!isAdmin} onNavigate={goTo} />
          </Drawer>
        )}

        {/* Desktop: permanent sidebar */}
        {!isMobile && (
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
            <SidebarContent isAdmin={!!isAdmin} onNavigate={goTo} />
          </Drawer>
        )}

        {/* Main content */}
        <Box component="main" sx={{
          flex: 1,
          minWidth: 0,
          pb: isMobile ? 7 : 0, // space for bottom nav
          pt: isMobile ? '56px' : 0,
        }}>
          <Box sx={{
            p: { xs: 2, sm: 3, md: 5 },
            maxWidth: 1280,
          }}>
            {children}
          </Box>
        </Box>

        {/* Mobile: bottom navigation */}
        {isMobile && (
          <Paper sx={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200,
            borderTop: '1px solid #e5e7eb',
          }} elevation={0}>
            <BottomNavigation
              value={BOTTOM_NAV.findIndex((i) => location.pathname === i.path)}
              onChange={(_, idx) => {
                if (idx >= 0 && idx < BOTTOM_NAV.length) navigate(BOTTOM_NAV[idx].path);
              }}
              sx={{
                height: 56,
                '& .MuiBottomNavigationAction-root': {
                  minWidth: 48,
                  '&.Mui-selected': { color: '#3b82f6' },
                },
              }}
            >
              {BOTTOM_NAV.map((item) => (
                <BottomNavigationAction
                  key={item.text}
                  icon={item.icon}
                  label={<Typography sx={{ fontSize: 10 }}>{item.text}</Typography>}
                  sx={{
                    color: location.pathname === item.path ? '#3b82f6' : '#9ca3af',
                    '& .MuiBottomNavigationAction-label': { fontSize: 10, mt: 0.25 },
                  }}
                />
              ))}
            </BottomNavigation>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
}
