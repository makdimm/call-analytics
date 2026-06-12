import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, TextField, Button, Typography, Alert, ThemeProvider, createTheme, CssBaseline,
} from '@mui/material';

const theme = createTheme({
  palette: { mode: 'dark', primary: { main: '#7c4dff' }, background: { default: '#0d0d1a', paper: '#1a1a2e' } },
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
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d1a' }}>
        <Paper sx={{ p: 5, borderRadius: 4, maxWidth: 420, width: '100%', background: '#1a1a2e' }}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
            Call Analytics
          </Typography>
          <Typography variant="body2" color="grey.500" sx={{ mb: 4 }}>
            Аналитика звонков на базе Whisper + GPT
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Логин" variant="outlined" sx={{ mb: 2 }}
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              fullWidth label="Пароль" type="password" variant="outlined" sx={{ mb: 3 }}
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <Button fullWidth type="submit" variant="contained" size="large" sx={{ py: 1.5 }}>
              Войти
            </Button>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
