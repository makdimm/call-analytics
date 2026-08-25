import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Alert, ThemeProvider, createTheme, CssBaseline,
  IconButton, InputAdornment, useMediaQuery,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { register as apiRegister } from '../../api/client';

// Дизайн-токены из спецификации ui-designer (стиль Rechka Ai)
const theme = createTheme({
  palette: {
    primary: { main: '#0B5FEA' },
    text: { primary: '#1E2A3B', secondary: '#6F7D91' },
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shape: { borderRadius: 12 },
});

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'register') {
        await apiRegister({ username, email, password, role: 'manager' });
      }
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    '& .MuiInputBase-root': {
      height: 48,
      borderRadius: '12px',
      backgroundColor: '#F4F7FB',
      fontSize: 15,
      transition: 'background-color .16s ease, border-color .16s ease, box-shadow .16s ease',
    },
    '& .MuiInputBase-root:hover': { backgroundColor: '#EEF3FA' },
    '& .MuiInputBase-root.Mui-focused': {
      backgroundColor: '#FFFFFF',
      borderColor: '#0B5FEA',
      boxShadow: '0 0 0 3px rgba(11, 95, 234, 0.12)',
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
    '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0B5FEA' },
    '& .MuiInputLabel-root': { color: '#6F7D91', fontSize: 13, fontWeight: 500 },
    '& .MuiInputLabel-root.Mui-focused': { color: '#0B5FEA' },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', bgcolor: '#FFFFFF' }}>
        {/* Левая брендовая панель */}
        <Box sx={{
          flex: isMobile ? '0 0 auto' : '1 1 50%',
          minHeight: isMobile ? 240 : '100svh',
          bgcolor: '#0A56D6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#FFFFFF', p: isMobile ? '32px 24px' : '48px',
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
              <rect x="6" y="6" width="36" height="36" rx="12" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M15 30V22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M21 34V18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M27 28V14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M33 26V20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <Box component="h1" sx={{ m: 0, fontSize: isMobile ? 26 : 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Audira
            </Box>
          </Box>
        </Box>

        {/* Правая часть с формой */}
        <Box sx={{
          flex: '1 1 50%',
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'center',
          p: isMobile ? '24px' : '48px',
          bgcolor: '#FFFFFF',
        }}>
          <Box component="form" onSubmit={handleSubmit} sx={{
            width: 'min(400px, calc(100vw - 48px))',
            mx: 'auto',
          }}>
            {/* Вкладки */}
            <Box sx={{
              display: 'flex', gap: '24px', height: 40, borderBottom: '1px solid #E7EDF5', mb: '24px',
            }}>
              {(['login', 'register'] as const).map((key) => (
                <Box key={key} onClick={() => { setTab(key); setError(''); }}
                  sx={{
                    position: 'relative', height: 40, px: '2px', cursor: 'pointer',
                    color: tab === key ? '#0B5FEA' : '#8B96A8',
                    fontSize: 15, fontWeight: 600, lineHeight: '40px', userSelect: 'none',
                    '::after': {
                      content: '""', position: 'absolute', left: 0, right: 0, bottom: -1, height: 2,
                      backgroundColor: tab === key ? '#0B5FEA' : 'transparent',
                    },
                  }}>
                  {key === 'login' ? 'Вход' : 'Регистрация'}
                </Box>
              ))}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, fontSize: 13, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            {/* Поля */}
            <Box sx={{ display: 'grid', gap: '16px' }}>
              {tab === 'register' && (
                <TextField
                  fullWidth label="Имя" variant="outlined" size="small"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ваше имя" sx={inputSx} required
                />
              )}
              {tab === 'login' ? (
                <TextField
                  fullWidth label="Логин" variant="outlined" size="small"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin" sx={inputSx} required autoComplete="username"
                />
              ) : (
                <TextField
                  fullWidth label="Электронная почта" type="email" variant="outlined" size="small"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" sx={inputSx} required autoComplete="email"
                />
              )}

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', mb: '8px' }}>
                  <Box sx={{ color: '#6F7D91', fontSize: 13, fontWeight: 500 }}>Пароль</Box>
                  {tab === 'login' && (
                    <Box component="a" href="#" onClick={(e) => e.preventDefault()}
                      sx={{ color: '#6F9EF6', fontSize: 12, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', '&:hover': { color: '#0B5FEA' } }}>
                      Забыли пароль?
                    </Box>
                  )}
                </Box>
                <TextField
                  fullWidth type={showPassword ? 'text' : 'password'} variant="outlined" size="small"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === 'login' ? 'Введите пароль' : 'Создайте пароль'}
                  sx={inputSx} required autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  slotProps={{ input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#7E8DA1' }}>
                          {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  } }}
                />
              </Box>
            </Box>

            <Box sx={{ mt: '24px' }}>
              <Button
                fullWidth type="submit" variant="contained" size="large" disabled={loading}
                disableElevation
                sx={{
                  height: 48, borderRadius: '12px', fontSize: 15, fontWeight: 600,
                  textTransform: 'none', bgcolor: '#0B5FEA',
                  '&:hover': { bgcolor: '#0A53CC' },
                  '&:active': { bgcolor: '#0848B0' },
                  '&:disabled': { bgcolor: '#B7CBF7', color: '#EAF1FF' },
                }}
              >
                {loading ? 'Подождите...' : tab === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
