import { useState } from 'react';
import { Box, Typography, Paper, Button, Alert, CircularProgress, alpha } from '@mui/material';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import api from '../../api/client';

export default function GDriveSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    setError(null);
    try {
      const resp = await api.post('/gdrive/sync');
      setResult(`Импортировано: ${resp.data.imported} файлов`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Ошибка синхронизации');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 0.5 }}>Google Drive</Typography>
        <Typography variant="body2" sx={{ color: alpha('#fff', 0.4) }}>Импорт аудиофайлов из Google Drive</Typography>
      </Box>

      <Paper sx={{
        p: 4, borderRadius: 3, maxWidth: 600,
        background: 'rgba(18,18,48,0.6)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Typography sx={{ color: alpha('#fff', 0.7), mb: 3, lineHeight: 1.7 }}>
          Загрузить новые аудиофайлы из подключённой папки Google Drive.
          Файлы будут автоматически транскрибированы и проанализированы.
        </Typography>

        <Box sx={{ mb: 3, p: 2.5, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.4), fontSize: 13 }}>
            Поддерживаются: MP3, WAV, OGG, M4A, FLAC
          </Typography>
        </Box>

        {syncing && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CircularProgress size={18} sx={{ color: '#6C5CE7' }} />
            <Typography sx={{ color: alpha('#fff', 0.6), fontSize: 14 }}>Синхронизация...</Typography>
          </Box>
        )}

        {result && <Alert sx={{ mb: 2, background: 'rgba(0,206,201,0.1)', border: '1px solid rgba(0,206,201,0.2)', color: '#00cec9' }}>{result}</Alert>}
        {error && <Alert sx={{ mb: 2, background: 'rgba(255,118,117,0.1)', border: '1px solid rgba(255,118,117,0.2)', color: '#ff7675' }}>{error}</Alert>}

        <Button
          variant="contained" fullWidth size="large"
          disabled={syncing}
          onClick={handleSync}
          startIcon={<CloudSyncIcon />}
          sx={{
            py: 1.5, fontWeight: 600,
            background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
            '&:hover': { background: 'linear-gradient(135deg, #5a4bd1, #8c7ee6)' },
            '&.Mui-disabled': { background: alpha('#6C5CE7', 0.3) },
          }}
        >
          {syncing ? 'Синхронизация...' : 'Запросить новые файлы'}
        </Button>
      </Paper>
    </Box>
  );
}
