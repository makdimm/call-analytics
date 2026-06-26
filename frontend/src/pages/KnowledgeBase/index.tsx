import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Switch, CircularProgress, Alert, Select, MenuItem,
  InputLabel, FormControl, LinearProgress, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';

interface KBEntry {
  id: number;
  title: string;
  content: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const CATEGORIES = ['general', 'product', 'script', 'objections', 'competitors', 'faq'];
const CATEGORY_LABELS: Record<string, string> = {
  general: 'Общее', product: 'Продукт', script: 'Скрипт',
  objections: 'Возражения', competitors: 'Конкуренты', faq: 'Частые вопросы',
};

const emptyForm = {
  title: '', content: '', category: 'general', sort_order: 0, is_active: true,
};

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState('general');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const load = () => {
    setLoading(true);
    const params: any = {};
    if (search) params.search = search;
    if (filterCat) params.category = filterCat;
    api.get('/knowledge/', { params }).then((r: any) => setItems(r.data.items)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, [search, filterCat]);

  const openNew = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); setError(''); };
  const openEdit = (item: KBEntry) => {
    setEditId(item.id);
    setForm({ title: item.title, content: item.content, category: item.category, sort_order: item.sort_order, is_active: item.is_active });
    setDialogOpen(true);
    setError('');
  };

  const save = () => {
    if (!form.title || !form.content) { setError('Название и содержание обязательны'); return; }
    const promise = editId
      ? api.put(`/knowledge/${editId}`, form)
      : api.post('/knowledge/', form);
    promise.then(() => { setDialogOpen(false); load(); }).catch((e: any) => setError(e.response?.data?.detail || 'Ошибка'));
  };

  const toggleActive = (item: KBEntry) => {
    api.put(`/knowledge/${item.id}`, { is_active: !item.is_active }).then(load).catch(console.error);
  };

  const remove = (id: number) => {
    if (!confirm('Удалить запись?')) return;
    api.delete(`/knowledge/${id}`).then(load).catch(console.error);
  };

  const handleUpload = async () => {
    if (!uploadFile) { setError('Выберите файл'); return; }
    const allowed = ['.pdf', '.docx', '.txt', '.md'];
    const ext = '.' + uploadFile.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      setError(`Неподдерживаемый формат. Допустимы: ${allowed.join(', ')}`);
      return;
    }

    setUploading(true);
    setUploadProgress('Загрузка...');
    setError('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', uploadCategory);
    if (uploadTitle) formData.append('title', uploadTitle);

    try {
      const res = await api.post('/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadProgress(`Готово! Извлечено ${res.data.content_length} символов`);
      setTimeout(() => {
        setUploadOpen(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadProgress('');
        setUploading(false);
        load();
      }, 1500);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Ошибка загрузки');
      setUploading(false);
      setUploadProgress('');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>База знаний компании</Typography>
          <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
            Информация, которую GPT учитывает при анализе звонков
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined" startIcon={<UploadFileIcon />} onClick={() => { setUploadOpen(true); setError(''); setUploadFile(null); setUploadTitle(''); }}
            disableElevation sx={{ textTransform: 'none', borderRadius: 1.5, borderColor: '#d1d5db', color: '#374151' }}
          >
            Загрузить файл
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} disableElevation sx={{ bgcolor: '#3b82f6', textTransform: 'none', borderRadius: 1.5 }}>
            Добавить вручную
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          size="small" placeholder="Поиск..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <SearchIcon sx={{ mr: 1, color: '#9ca3af', fontSize: 20 }} /> } }}
          sx={{ minWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Категория</InputLabel>
          <Select value={filterCat} label="Категория" onChange={(e) => setFilterCat(e.target.value)}>
            <MenuItem value="">Все</MenuItem>
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{CATEGORY_LABELS[c] || c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Tooltip title="Название записи в базе знаний" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Название</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Категория: Общее / Продукт / Скрипт / Возражения / Конкуренты / FAQ" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Категория</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Содержимое записи (обрезано до 500 символов). Эта информация подмешивается в промпт GPT" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Содержание</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Выключенные записи не передаются GPT" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Активна</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Редактировать или удалить запись" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Действия</Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{item.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={CATEGORY_LABELS[item.category] || item.category}
                      size="small"
                      sx={{ bgcolor: '#f3f4f6', fontSize: 11, fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6b7280' }}>
                    {item.content}
                  </TableCell>
                  <TableCell>
                    <Switch checked={item.is_active} onChange={() => toggleActive(item)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => remove(item.id)} sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#9ca3af' }}>
                    База знаний пуста. Добавьте информацию о продукте, скриптах и возражениях.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Text entry dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Редактировать запись' : 'Новая запись'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Название" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} size="small" fullWidth />
            <FormControl size="small" fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select value={form.category} label="Категория" onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{CATEGORY_LABELS[c] || c}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Содержание"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              size="small" fullWidth multiline rows={8}
              placeholder="Полный текст информации, которую должен учитывать асессор при анализе..."
            />
            <TextField label="Порядок" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} size="small" sx={{ width: 120 }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#6b7280' }}>Отмена</Button>
          <Button variant="contained" onClick={save} disableElevation sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>
            {editId ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onClose={() => { if (!uploading) setUploadOpen(false); }} maxWidth="sm" fullWidth>
        <DialogTitle>Загрузить документ</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="outlined" component="label" sx={{ textTransform: 'none', p: 3, borderStyle: 'dashed', borderRadius: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <UploadFileIcon sx={{ fontSize: 40, color: '#9ca3af', mb: 1 }} />
                <Typography sx={{ color: '#374151', fontWeight: 500 }}>
                  {uploadFile ? uploadFile.name : 'Нажмите, чтобы выбрать файл'}
                </Typography>
                <Typography sx={{ color: '#9ca3af', fontSize: 12, mt: 0.5 }}>
                  PDF, DOCX, TXT, MD
                </Typography>
              </Box>
              <input type="file" hidden accept=".pdf,.docx,.txt,.md" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
            </Button>
            <TextField
              label="Название (если не указать — из имени файла)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              size="small" fullWidth
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select value={uploadCategory} label="Категория" onChange={(e) => setUploadCategory(e.target.value)}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{CATEGORY_LABELS[c] || c}</MenuItem>)}
              </Select>
            </FormControl>
            {uploading && (
              <Box sx={{ width: '100%' }}>
                <LinearProgress sx={{ height: 4, borderRadius: 2 }} />
                <Typography sx={{ fontSize: 12, color: '#6b7280', mt: 0.5 }}>{uploadProgress}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setUploadOpen(false)} disabled={uploading} sx={{ textTransform: 'none', color: '#6b7280' }}>Отмена</Button>
          <Button variant="contained" onClick={handleUpload} disabled={!uploadFile || uploading} disableElevation sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>
            {uploading ? 'Загрузка...' : 'Загрузить и извлечь текст'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
