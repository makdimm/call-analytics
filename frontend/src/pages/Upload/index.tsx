import { useState, useEffect } from 'react';
import { getUsers, uploadCall } from '../../api/client';
import type { User } from '../../types';
import {
  Box, Typography, Paper, Button, Select, MenuItem, FormControl, InputLabel,
  Alert, LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function UploadPage() {
  const [managers, setManagers] = useState<User[]>([]);
  const [managerId, setManagerId] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    getUsers().then((u) => setManagers(u.filter((x: User) => x.role === 'manager'))).catch(console.error);
  }, []);

  const handleUpload = async () => {
    if (!file || !managerId) return;
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('manager_id', String(managerId));
      await uploadCall(form);
      setResult({ ok: true, msg: `Звонок "${file.name}" загружен и отправлен на обработку` });
      setFile(null);
    } catch (err: any) {
      setResult({ ok: false, msg: err?.response?.data?.detail || 'Ошибка загрузки' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Загрузить звонок</Typography>

      <Paper sx={{ p: 4, background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a', maxWidth: 600 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Менеджер</InputLabel>
          <Select value={managerId} label="Менеджер" onChange={(e) => setManagerId(Number(e.target.value))}>
            {managers.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.username} ({m.email})</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            border: '2px dashed #333', borderRadius: 2, p: 4, mb: 3, textAlign: 'center', cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main' },
          }}
          onClick={() => document.getElementById('audio-upload')?.click()}
        >
          <input
            id="audio-upload" type="file" accept="audio/*" hidden
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
          <Typography>{file ? file.name : 'Нажмите, чтобы выбрать аудиофайл'}</Typography>
          <Typography variant="caption" color="grey.500">MP3, WAV, OGG, M4A, FLAC</Typography>
        </Box>

        {uploading && <LinearProgress sx={{ mb: 2 }} />}

        {result && (
          <Alert severity={result.ok ? 'success' : 'error'} sx={{ mb: 2 }}>
            {result.msg}
          </Alert>
        )}

        <Button
          variant="contained" fullWidth size="large" disabled={!file || !managerId || uploading}
          onClick={handleUpload}
          startIcon={<CloudUploadIcon />}
        >
          {uploading ? 'Загрузка...' : 'Загрузить'}
        </Button>
      </Paper>
    </Box>
  );
}
