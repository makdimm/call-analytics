import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, ThemeProvider, createTheme,
  CssBaseline,
} from '@mui/material';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';

const theme = createTheme({
  palette: {
    primary: { main: '#3b82f6' },
    text: { primary: '#1f2937', secondary: '#6b7280' },
    background: { default: '#f3f4f6', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h4: { fontWeight: 700, fontSize: 24, letterSpacing: '-0.03em' },
  },
  shape: { borderRadius: 8 },
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
        bgcolor: '#f3f4f6',
      }}>
        <Paper sx={{
          p: 5, maxWidth: 380, width: '100%',
          border: '1px solid #e5e7eb',
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: 2, bgcolor: '#3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2, color: '#fff',
            }}>
              <PhoneInTalkIcon />
            </Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              Call Analytics
            </Typography>
            <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
              Транскрибация и анализ звонков
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Логин" variant="outlined" size="small" sx={{ mb: 2 }}
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              fullWidth label="Пароль" type="password" variant="outlined" size="small" sx={{ mb: 3 }}
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              fullWidth type="submit" variant="contained" size="large"
              disableElevation
              sx={{ py: 1.25, fontWeight: 600, fontSize: 14, textTransform: 'none', borderRadius: 1.5 }}
            >
              Войти
            </Button>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
