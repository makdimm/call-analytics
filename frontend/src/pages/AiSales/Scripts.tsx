import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tooltip, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getSalesScripts, createSalesScript, updateSalesScript, deleteSalesScript } from '../../api/client';
import type { SalesScript } from '../../types';

export default function AiSalesScripts() {
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<SalesScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editScript, setEditScript] = useState<SalesScript | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getSalesScripts();
      setScripts(data.items);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditScript(null);
    setName('');
    setDescription('');
    setDialogOpen(true);
  };

  const openEdit = (s: SalesScript) => {
    setEditScript(s);
    setName(s.name);
    setDescription(s.description || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editScript) {
        await updateSalesScript(editScript.id, { name, description });
      } else {
        await createSalesScript({
          name,
          description,
          script_data: { stages: [], greeting: '', voice: {}, qualification_criteria: {} },
        });
      }
      setDialogOpen(false);
      load();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить скрипт?')) return;
    await deleteSalesScript(id);
    load();
  };

  const handleDuplicate = async (s: SalesScript) => {
    await createSalesScript({
      name: `${s.name} (копия)`,
      description: s.description,
      script_data: s.script_data,
    });
    load();
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/ai-sales')}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4">Скрипты продаж</Typography>
          <Typography variant="body2" color="text.secondary">Редактирование скриптов для обзвона</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Создать скрипт
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Этапов</TableCell>
                <TableCell>Обновлён</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scripts.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{s.name}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {s.description?.slice(0, 80)}{s.description && s.description.length > 80 ? '...' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>{s.script_data?.stages?.length || 0}</TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(s.updated_at).toLocaleDateString('ru-RU')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Редактировать"><IconButton size="small" onClick={() => openEdit(s)}>
                      <EditIcon fontSize="small" />
                    </IconButton></Tooltip>
                    <Tooltip title="Копировать"><IconButton size="small" onClick={() => handleDuplicate(s)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton></Tooltip>
                    <Tooltip title="Удалить"><IconButton size="small" color="error" onClick={() => handleDelete(s.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {scripts.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>Нет скриптов</Typography>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editScript ? 'Редактировать скрипт' : 'Новый скрипт'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Название"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Описание"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
