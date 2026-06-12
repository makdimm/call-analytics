import { useState } from 'react';
import { Box, Typography, Paper, Button, Alert, CircularProgress } from '@mui/material';
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
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Google Drive
      </Typography>

      <Paper sx={{ p: 4, background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a', maxWidth: 600 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Импортировать новые аудиофайлы с Google Drive.
          Файлы будут загружены и автоматически отправлены на транскрибацию и анализ.
        </Typography>

        <Box sx={{ mb: 3, p: 2, background: '#0d0d1a', borderRadius: 2 }}>
          <Typography variant="body2" color="grey.400">
            Поддерживаемые форматы: MP3, WAV, OGG, M4A, FLAC
          </Typography>
        </Box>

        {syncing && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography>Синхронизация...</Typography>
          </Box>
        )}

        {result && <Alert severity="success" sx={{ mb: 2 }}>{result}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={syncing}
          onClick={handleSync}
          startIcon={<CloudSyncIcon />}
          sx={{ py: 1.5 }}
        >
          {syncing ? 'Синхронизация...' : 'Запросить новые файлы'}
        </Button>
      </Paper>
    </Box>
  );
}
