import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Chip, CircularProgress, Grid, Card, CardContent,
  IconButton, Tooltip, TablePagination, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { getSalesCampaigns, getSalesScripts, getSalesStats, createSalesCampaign, startCampaign, pauseCampaign } from '../../api/client';
import type { SalesCampaign, SalesScript, SalesStats } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  draft: '#9ca3af',
  active: '#10b981',
  paused: '#f59e0b',
  completed: '#3b82f6',
};

export default function AiSalesDashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<SalesCampaign[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [scripts, setScripts] = useState<SalesScript[]>([]);
  const [newName, setNewName] = useState('');
  const [newScriptId, setNewScriptId] = useState<number | ''>('');
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [cData, sData, scData] = await Promise.all([
        getSalesCampaigns({ page: page + 1, page_size: 20 }),
        getSalesStats(),
        getSalesScripts(),
      ]);
      setCampaigns(cData.items);
      setTotal(cData.total);
      setStats(sData);
      setScripts(scData.items);
    } catch (e) {
      console.error('Failed to load AI Sales data', e);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleStart = async (id: number) => {
    await startCampaign(id);
    load();
  };

  const handlePause = async (id: number) => {
    await pauseCampaign(id);
    load();
  };

  if (loading && campaigns.length === 0) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon sx={{ fontSize: 28 }} /> AI-продажи
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Симуляция и анализ холодных звонков
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<SmartToyIcon />} onClick={() => navigate('/ai-sales/chat')}
          sx={{ mr: 1 }}>
          Чат
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={async () => {
          if (scripts.length === 0) { const d = await getSalesScripts(); setScripts(d.items); }
          setNewName(''); setNewScriptId(''); setCreateOpen(true);
        }}>
          Новая кампания
        </Button>
      </Box>

      {/* Stats cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary">Всего звонков</Typography>
                <Typography variant="h5">{stats.total_calls}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary">Средний Quality Score</Typography>
                <Typography variant="h5">{stats.avg_quality_score ?? '—'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary">Кампаний</Typography>
                <Typography variant="h5">{stats.total_campaigns}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Card>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary">Контактов</Typography>
                <Typography variant="h5">{stats.total_contacts}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Campaigns table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Скрипт</TableCell>
                <TableCell align="center">Контактов</TableCell>
                <TableCell align="center">Звонков</TableCell>
                <TableCell>Создана</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/ai-sales/campaigns/${c.id}`)}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={c.status}
                      size="small"
                      sx={{ color: '#fff', bgcolor: STATUS_COLORS[c.status] || '#9ca3af', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{c.script?.name || `ID: ${c.script_id}`}</Typography>
                  </TableCell>
                  <TableCell align="center">{c.contact_count ?? 0}</TableCell>
                  <TableCell align="center">{c.call_count ?? 0}</TableCell>
                  <TableCell>
                    <Typography variant="caption">{new Date(c.created_at).toLocaleDateString('ru-RU')}</Typography>
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Просмотр"><IconButton size="small" onClick={() => navigate(`/ai-sales/campaigns/${c.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton></Tooltip>
                    {c.status === 'draft' && (
                      <Tooltip title="Запустить"><IconButton size="small" color="success" onClick={() => handleStart(c.id)}>
                        <PlayArrowIcon fontSize="small" />
                      </IconButton></Tooltip>
                    )}
                    {c.status === 'active' && (
                      <Tooltip title="Пауза"><IconButton size="small" color="warning" onClick={() => handlePause(c.id)}>
                        <PauseIcon fontSize="small" />
                      </IconButton></Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      Нет кампаний. Создайте первую!
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
        />
      </Paper>

      {/* Create campaign dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новая кампания</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Название кампании"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            select
            label="Скрипт"
            fullWidth
            value={newScriptId}
            onChange={(e) => setNewScriptId(Number(e.target.value))}
          >
            {scripts.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={async () => {
            if (!newName.trim() || !newScriptId) return;
            try {
              await createSalesCampaign({ name: newName, script_id: newScriptId });
              setCreateOpen(false);
              setSnack({ msg: 'Кампания создана', severity: 'success' });
              load();
            } catch (e: any) {
              setSnack({ msg: `Ошибка: ${e?.response?.data?.detail || e.message}`, severity: 'error' });
            }
          }} disabled={!newName.trim() || !newScriptId}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack ? <Alert severity={snack.severity} onClose={() => setSnack(null)}>{snack.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  );
}
