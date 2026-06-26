import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Switch, CircularProgress, Alert, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface CriteriaItem {
  id: number;
  key: string;
  label: string;
  description: string | null;
  what_to_check: string | null;
  bad_example: string | null;
  partial_example: string | null;
  good_example: string | null;
  max_score: number;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

const emptyForm = {
  key: '', label: '', description: '', what_to_check: '',
  bad_example: '', partial_example: '', good_example: '',
  max_score: 1, sort_order: 0, is_active: true,
};

export default function CriteriaSettingsPage() {
  const [items, setItems] = useState<CriteriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/criteria/').then((r: any) => { setItems(r.data.items); }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); setError(''); };
  const openEdit = (item: CriteriaItem) => {
    setEditId(item.id);
    setForm({
      key: item.key, label: item.label, description: item.description || '',
      what_to_check: item.what_to_check || '',
      bad_example: item.bad_example || '', partial_example: item.partial_example || '',
      good_example: item.good_example || '',
      max_score: item.max_score, sort_order: item.sort_order, is_active: item.is_active,
    });
    setDialogOpen(true);
    setError('');
  };

  const save = () => {
    if (!form.key || !form.label) { setError('Key и Label обязательны'); return; }
    const promise = editId
      ? api.put(`/criteria/${editId}`, form)
      : api.post('/criteria/', form);
    promise.then(() => { setDialogOpen(false); load(); }).catch((e: any) => setError(e.response?.data?.detail || 'Ошибка'));
  };

  const toggleActive = (item: CriteriaItem) => {
    api.put(`/criteria/${item.id}`, { is_active: !item.is_active }).then(load).catch(console.error);
  };

  const remove = (id: number) => {
    if (!confirm('Удалить критерий?')) return;
    api.delete(`/criteria/${id}`).then(load).catch(console.error);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>Критерии оценки</Typography>
          <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
            Управляйте критериями, которые GPT использует для оценки звонков
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} disableElevation sx={{ bgcolor: '#3b82f6', textTransform: 'none', borderRadius: 1.5 }}>
          Добавить критерий
        </Button>
      </Box>

      <Paper sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Tooltip title="Очередность отображения в GPT-промпте и в интерфейсе. Чем меньше число, тем выше" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Порядок</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Уникальное машинное имя (латиница). Используется в JSON-ответе GPT" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Key</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Название критерия, которое видит пользователь в интерфейсе" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Название</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Вес критерия в итоговом FG Score. Чем выше — тем сильнее влияет на оценку" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Вес</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Выключенные критерии не передаются GPT и не участвуют в оценке" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Активен</Typography>
                  </Tooltip>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Редактировать или удалить критерий" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Действия</Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ color: '#6b7280' }}>{item.sort_order}</TableCell>
                  <TableCell><Chip label={item.key} size="small" sx={{ fontFamily: 'monospace', bgcolor: '#f3f4f6' }} /></TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{item.label}</TableCell>
                  <TableCell><Chip label={item.max_score} size="small" sx={{ bgcolor: '#f3f4f6', fontWeight: 600 }} /></TableCell>
                  <TableCell>
                    <Switch checked={item.is_active} onChange={() => toggleActive(item)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => remove(item.id)} sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Редактировать критерий' : 'Новый критерий'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Уникальный идентификатор на латинице (напр. greeting, speech). Меняется только при создании" arrow>
                <TextField label="Key (машинное имя)" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} size="small" fullWidth disabled={!!editId} />
              </Tooltip>
              <Tooltip title="Название критерия, отображаемое в интерфейсе и в подсказке GPT" arrow>
                <TextField label="Название" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} size="small" fullWidth />
              </Tooltip>
            </Box>
            <Tooltip title="Описание критерия для GPT. Чем подробнее — тем точнее оценка" arrow>
              <TextField label="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} size="small" fullWidth multiline rows={2} />
            </Tooltip>
            <Tooltip title="Конкретные маркеры, на которые GPT должен обращать внимание при оценке" arrow>
              <TextField label="На что смотреть" value={form.what_to_check} onChange={(e) => setForm({ ...form, what_to_check: e.target.value })} size="small" fullWidth multiline rows={2} />
            </Tooltip>
            <Tooltip title="Пример идеального выполнения критерия. GPT ориентируется на этот текст" arrow>
              <TextField label="Оценка ДА (1)" value={form.good_example} onChange={(e) => setForm({ ...form, good_example: e.target.value })} size="small" fullWidth />
            </Tooltip>
            <Tooltip title="Пример частичного выполнения. Что считается 'почти хорошо, но не идеально'" arrow>
              <TextField label="Оценка ПОЛУДА (0.5)" value={form.partial_example} onChange={(e) => setForm({ ...form, partial_example: e.target.value })} size="small" fullWidth />
            </Tooltip>
            <Tooltip title="Пример провала критерия. Когда GPT должен поставить 0" arrow>
              <TextField label="Оценка НЕТ (0)" value={form.bad_example} onChange={(e) => setForm({ ...form, bad_example: e.target.value })} size="small" fullWidth />
            </Tooltip>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Сколько баллов даёт этот критерий в общей сумме FG. Чем выше — тем важнее критерий" arrow>
                <TextField label="Вес (max_score)" type="number" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })} size="small" sx={{ width: 150 }} />
              </Tooltip>
              <Tooltip title="Очередность отображения в интерфейсе и в промпте GPT. Меньше = выше" arrow>
                <TextField label="Порядок сортировки" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} size="small" sx={{ width: 150 }} />
              </Tooltip>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#6b7280' }}>Отмена</Button>
          <Button variant="contained" onClick={save} disableElevation sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>
            {editId ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
