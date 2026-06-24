import { useState, useEffect } from 'react';
import { getUsers, uploadCall } from '../../api/client';
import type { User } from '../../types';
import {
  Box, Typography, Paper, Button, Select, MenuItem, FormControl, InputLabel,
  Alert, LinearProgress, Link,
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
        <Typography variant="h4" sx={{ mb: 0.5 }}>Загрузить звонок</Typography>
        <Typography sx={{ color: '#6b7280', fontSize: 14 }}>MP3, WAV, OGG, M4A, FLAC</Typography>
      </Box>

      <Paper sx={{ p: 4, border: '1px solid #e5e7eb', borderRadius: 2, maxWidth: 520 }}>
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Менеджер</InputLabel>
          <Select
            value={managerId}
            label="Менеджер"
            onChange={(e) => setManagerId(Number(e.target.value))}
          >
            {managers.map((m) => (
              <MenuItem key={m.id} value={m.id}>{m.username}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            border: '2px dashed #d1d5db', borderRadius: 2, p: 4, mb: 3,
            textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
            bgcolor: '#f9fafb',
            '&:hover': { borderColor: '#3b82f6', bgcolor: '#eff6ff' },
          }}
          onClick={() => document.getElementById('audio-upload')?.click()}
        >
          <input id="audio-upload" type="file" accept="audio/*" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <CloudUploadIcon sx={{ fontSize: 36, color: '#9ca3af', mb: 1 }} />
          <Typography sx={{ color: file ? '#1f2937' : '#6b7280', fontSize: 14, fontWeight: file ? 500 : 400 }}>
            {file ? file.name : 'Нажмите, чтобы выбрать файл'}
          </Typography>
          <Typography sx={{ color: '#9ca3af', fontSize: 12, mt: 0.5 }}>
            {file ? `${(file.size / 1024 / 1024).toFixed(1)} МБ` : 'или перетащите файл сюда'}
          </Typography>
        </Box>

        {/* Processing time warning */}
        {file && !uploading && !result && (
          <Box sx={{ mb: 2.5, p: 2, borderRadius: 1.5, bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#92400e', mb: 0.5 }}>
              ⏳ Обратите внимание
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
              Транскрибация Whisper large-v3 на сервере занимает{' '}
              <strong>~5 минут на 1 минуту записи</strong>.
              Статус обработки и прогресс можно отслеживать в{' '}
              <Link href="/calls" sx={{ color: '#b45309', fontWeight: 500 }}>Звонках</Link>.
              Страницу можно закрыть — обработка продолжится в фоне.
            </Typography>
          </Box>
        )}

        {uploading && <LinearProgress sx={{ mb: 2 }} />}

        {result?.ok && (
          <Alert severity="success" sx={{ mb: 2, fontSize: 13 }}>
            {result.msg}
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#92400e', mb: 0.5 }}>
                ⏳ Время обработки
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
                Whisper large-v3 + анализ GPT займут <strong>~5–10 минут на минуту</strong> записи.
                Следите за прогрессом на странице{' '}
                <Link href="/calls" sx={{ color: '#b45309', fontWeight: 500 }}>Звонки</Link>.
              </Typography>
            </Box>
          </Alert>
        )}

        {result && !result.ok && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>
            {result.msg}
          </Alert>
        )}

        <Button
          variant="contained" fullWidth size="large"
          disabled={!file || !managerId || uploading}
          onClick={handleUpload}
          disableElevation
          startIcon={<CloudUploadIcon />}
          sx={{ py: 1.25, fontWeight: 600, fontSize: 14, textTransform: 'none', borderRadius: 1.5 }}
        >
          {uploading ? 'Загрузка...' : 'Загрузить и анализировать'}
        </Button>
      </Paper>
    </Box>
  );
}
