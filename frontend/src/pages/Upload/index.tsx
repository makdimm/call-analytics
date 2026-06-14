import { useState, useEffect } from 'react';
import { getUsers, uploadCall } from '../../api/client';
import type { User } from '../../types';
import {
  Box, Typography, Paper, Button, Select, MenuItem, FormControl, InputLabel,
  Alert, LinearProgress, alpha,
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
      setResult({ ok: true, msg: `«${file.name}» загружен и отправлен на анализ` });
      setFile(null);
    } catch (err: any) {
      setResult({ ok: false, msg: err?.response?.data?.detail || 'Ошибка загрузки' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 0.5 }}>Загрузить звонок</Typography>
        <Typography variant="body2" sx={{ color: alpha('#fff', 0.4) }}>MP3, WAV, OGG, M4A, FLAC</Typography>
      </Box>

      <Paper sx={{
        p: 4, borderRadius: 3, maxWidth: 600,
        background: 'rgba(18,18,48,0.6)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel sx={{ color: alpha('#fff', 0.5) }}>Менеджер</InputLabel>
          <Select
            value={managerId}
            label="Менеджер"
            onChange={(e) => setManagerId(Number(e.target.value))}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }, color: '#fff' }}
          >
            {managers.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.username}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            border: '2px dashed rgba(108,92,231,0.3)', borderRadius: 2, p: 4, mb: 3,
            textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
            background: 'rgba(108,92,231,0.04)',
            '&:hover': { borderColor: '#6C5CE7', background: 'rgba(108,92,231,0.08)' },
          }}
          onClick={() => document.getElementById('audio-upload')?.click()}
        >
          <input id="audio-upload" type="file" accept="audio/*" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <CloudUploadIcon sx={{ fontSize: 48, color: alpha('#6C5CE7', 0.5), mb: 1 }} />
          <Typography sx={{ color: '#fff' }}>{file ? file.name : 'Нажмите, чтобы выбрать файл'}</Typography>
        </Box>

        {uploading && <LinearProgress sx={{ mb: 2, background: 'rgba(108,92,231,0.15)', '& .MuiLinearProgress-bar': { background: '#6C5CE7' } }} />}

        {result && (
          <Alert severity={result.ok ? 'success' : 'error'} sx={{ mb: 2, background: result.ok ? 'rgba(0,206,201,0.1)' : 'rgba(255,118,117,0.1)', border: `1px solid ${result.ok ? 'rgba(0,206,201,0.2)' : 'rgba(255,118,117,0.2)'}`, color: result.ok ? '#00cec9' : '#ff7675' }}>
            {result.msg}
          </Alert>
        )}

        <Button
          variant="contained" fullWidth size="large"
          disabled={!file || !managerId || uploading}
          onClick={handleUpload}
          startIcon={<CloudUploadIcon />}
          sx={{
            py: 1.5, fontWeight: 600,
            background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
            '&:hover': { background: 'linear-gradient(135deg, #5a4bd1, #8c7ee6)' },
            '&.Mui-disabled': { background: alpha('#6C5CE7', 0.3) },
          }}
        >
          {uploading ? 'Загрузка...' : 'Загрузить и анализировать'}
        </Button>
      </Paper>
    </Box>
  );
}
