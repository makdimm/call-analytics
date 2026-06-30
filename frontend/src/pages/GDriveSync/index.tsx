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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>Google Drive</Typography>
        <Typography sx={{ color: '#6b7280', fontSize: 14 }}>Импорт аудиофайлов из Google Drive</Typography>
      </Box>

      <Paper sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 2, maxWidth: 520 }}>
        <Typography sx={{ color: '#4b5563', fontSize: 14, mb: 3, lineHeight: 1.7 }}>
          Загрузить новые аудиофайлы из подключённой папки Google Drive.
          Файлы будут автоматически транскрибированы и проанализированы.
        </Typography>

        <Box sx={{ mb: 3, p: 2, borderRadius: 1.5, bgcolor: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
            Поддерживаются: MP3, WAV, OGG, M4A, FLAC
          </Typography>
        </Box>

        {syncing && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <CircularProgress size={16} />
            <Typography sx={{ color: '#6b7280', fontSize: 14 }}>Синхронизация...</Typography>
          </Box>
        )}

        {result && <Alert severity="success" sx={{ mb: 2, fontSize: 13 }}>{result}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>{error}</Alert>}

        <Button
          variant="contained" fullWidth size="large"
          disabled={syncing}
          onClick={handleSync}
          disableElevation
          startIcon={<CloudSyncIcon />}
          sx={{ py: 1.25, fontWeight: 600, fontSize: 14, textTransform: 'none', borderRadius: 1.5 }}
        >
          {syncing ? 'Синхронизация...' : 'Запросить новые файлы'}
        </Button>
      </Paper>
    </Box>
  );
}
