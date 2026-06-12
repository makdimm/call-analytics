import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, ThemeProvider, createTheme,
  CssBaseline, alpha, Avatar,
} from '@mui/material';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';

const theme = createTheme({
  palette: { mode: 'dark', primary: { main: '#6C5CE7' }, background: { default: '#0a0a1a', paper: 'rgba(18,18,48,0.8)' } },
  shape: { borderRadius: 12 },
});

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #1a0a2e 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,206,201,0.1) 0%, transparent 70%)' }} />

        <Paper sx={{
          p: 5, borderRadius: 4, maxWidth: 420, width: '100%',
          background: 'rgba(18,18,48,0.7)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)',
          position: 'relative', zIndex: 1,
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ mx: 'auto', mb: 2, width: 56, height: 56, bgcolor: 'primary.main', background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' }}>
              <PhoneInTalkIcon />
            </Avatar>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff' }}>
              Call Analytics
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.4), mt: 1 }}>
              Транскрибация и анализ звонков
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2, background: alpha('#ff6b6b', 0.1), border: '1px solid rgba(255,107,107,0.2)', color: '#ff6b6b' }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Логин" variant="outlined" sx={{ mb: 2 }}
              value={username} onChange={(e) => setUsername(e.target.value)}
              slotProps={{ input: { sx: { bgcolor: 'rgba(255,255,255,0.04)', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } } } }}
            />
            <TextField
              fullWidth label="Пароль" type="password" variant="outlined" sx={{ mb: 3 }}
              value={password} onChange={(e) => setPassword(e.target.value)}
              slotProps={{ input: { sx: { bgcolor: 'rgba(255,255,255,0.04)', '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } } } }}
            />
            <Button
              fullWidth type="submit" variant="contained" size="large"
              sx={{
                py: 1.5, fontWeight: 600, fontSize: 16,
                background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                '&:hover': { background: 'linear-gradient(135deg, #5a4bd1, #8c7ee6)' },
              }}
            >
              Войти
            </Button>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
