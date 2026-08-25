import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Button, Chip, CircularProgress, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Select, MenuItem, InputLabel, FormControl, Snackbar, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { getSalesCampaign, getSalesContacts, getSalesCalls,
  addContactsToCampaign, startCampaign, pauseCampaign, simulateCall, getCampaignContacts } from '../../api/client';
import type { SalesCampaign, SalesContact, SalesCall } from '../../types';

const RESULT_COLORS: Record<string, string> = {
  meeting_set: '#10b981',
  interested: '#3b82f6',
  not_interested: '#ef4444',
  callback: '#f59e0b',
  no_answer: '#9ca3af',
};

const RESULT_LABELS: Record<string, string> = {
  meeting_set: 'Встреча',
  interested: 'Интерес',
  not_interested: 'Не интерес',
  callback: 'Перезвон',
  no_answer: 'Нет ответа',
};

export default function AiSalesCampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<SalesCampaign | null>(null);
  const [calls, setCalls] = useState<SalesCall[]>([]);
  const [campaignContacts, setCampaignContacts] = useState<SalesContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [simDialog, setSimDialog] = useState(false);
  const [addContactDialog, setAddContactDialog] = useState(false);
  const [allContacts, setAllContacts] = useState<SalesContact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [simContactId, setSimContactId] = useState<number | ''>('');
  const [simPersonality, setSimPersonality] = useState('нейтральный, но занятой предприниматель');
  const [simObjections, setSimObjections] = useState('');
  const [simRunning, setSimRunning] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const campaignId = parseInt(id || '0');

  const load = async () => {
    setLoading(true);
    try {
      const [camp, callsData, contactsData] = await Promise.all([
        getSalesCampaign(campaignId),
        getSalesCalls({ campaign_id: campaignId, page_size: 50 }),
        getCampaignContacts(campaignId),
      ]);
      setCampaign(camp);
      setCalls(callsData.items);
      setCampaignContacts(contactsData.items);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (campaignId) load(); }, [campaignId]);

  const openSimDialog = () => {
    if (campaignContacts.length === 0) {
      setSnack({ msg: 'Добавьте контакты в кампанию', severity: 'error' });
      return;
    }
    setSimContactId(campaignContacts[0].id);
    setSimDialog(true);
  };

  const runSimulation = async () => {
    if (!simContactId) return;
    setSimRunning(true);
    try {
      const result = await simulateCall({
        campaign_id: campaignId,
        contact_id: simContactId as number,
        simulation: {
          name: campaignContacts.find(c => c.id === simContactId)?.name || 'Клиент',
          personality: simPersonality,
          objections: simObjections.split('\n').filter(Boolean),
          max_turns: 20,
        },
      });
      setSnack({ msg: `Симуляция завершена! Quality Score: ${result.quality_score ?? '—'}`, severity: 'success' });
      setSimDialog(false);
      load();
    } catch (e: any) {
      setSnack({ msg: `Ошибка: ${e?.response?.data?.detail || e.message}`, severity: 'error' });
    }
    setSimRunning(false);
  };

  const openAddContacts = async () => {
    const data = await getSalesContacts({ page_size: 200 });
    setAllContacts(data.items);
    setSelectedContactIds([]);
    setAddContactDialog(true);
  };

  const handleAddContacts = async () => {
    await addContactsToCampaign(campaignId, selectedContactIds);
    setSnack({ msg: `Добавлено ${selectedContactIds.length} контактов`, severity: 'success' });
    setAddContactDialog(false);
    load();
  };

  if (loading && !campaign) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!campaign) return <Typography>Кампания не найдена</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/ai-sales')}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4">{campaign.name}</Typography>
            <Chip
              label={campaign.status}
              size="small"
              sx={{
                color: '#fff',
                bgcolor: campaign.status === 'active' ? '#10b981' : campaign.status === 'paused' ? '#f59e0b' : '#9ca3af',
                fontWeight: 600,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Скрипт: {campaign.script?.name || `ID ${campaign.script_id}`}
            {' · '}{campaign.contact_count ?? 0} контактов · {campaign.call_count ?? 0} звонков
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<PersonAddIcon />} onClick={openAddContacts}>
            Контакты
          </Button>
          <Button variant="contained" startIcon={<SmartToyIcon />} onClick={openSimDialog}>
            Симуляция
          </Button>
          {campaign.status === 'draft' && (
            <Button color="success" variant="outlined" startIcon={<PlayArrowIcon />}
              onClick={async () => { await startCampaign(campaignId); load(); }}>
              Запустить
            </Button>
          )}
          {campaign.status === 'active' && (
            <Button color="warning" variant="outlined" startIcon={<PauseIcon />}
              onClick={async () => { await pauseCampaign(campaignId); load(); }}>
              Пауза
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">Всего контактов</Typography>
            <Typography variant="h5">{campaignContacts.length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">Звонков</Typography>
            <Typography variant="h5">{calls.length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">Встреч назначено</Typography>
            <Typography variant="h5" color="success.main">
              {calls.filter(c => c.result === 'meeting_set').length}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">Средний Quality Score</Typography>
            <Typography variant="h5">
              {calls.length > 0
                ? Math.round(calls.reduce((s, c) => s + (c.quality_score || 0), 0) / calls.length * 10) / 10
                : '—'}
            </Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Calls table */}
      <Typography variant="h6" sx={{ mb: 1 }}>Звонки</Typography>
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Контакт</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Результат</TableCell>
                <TableCell>Этап</TableCell>
                <TableCell>Quality</TableCell>
                <TableCell>Длит.</TableCell>
                <TableCell>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calls.map((c) => (
                <TableRow key={c.id} hover sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/ai-sales/calls/${c.id}`)}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.contact?.name || '—'}</Typography>
                    {c.contact?.company && (
                      <Typography variant="caption" color="text.secondary">{c.contact.company}</Typography>
                    )}
                  </TableCell>
                  <TableCell><Typography variant="body2">{c.phone}</Typography></TableCell>
                  <TableCell>
                    {c.result && (
                      <Chip
                        label={RESULT_LABELS[c.result] || c.result}
                        size="small"
                        sx={{ color: '#fff', bgcolor: RESULT_COLORS[c.result] || '#9ca3af', fontWeight: 600 }}
                      />
                    )}
                  </TableCell>
                  <TableCell><Typography variant="caption">{c.script_stage || '—'}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {c.quality_score != null ? `${Math.round(c.quality_score)}` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {c.duration_seconds ? `${Math.round(c.duration_seconds)}с` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(c.created_at).toLocaleString('ru-RU')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {calls.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    Нет звонков. Нажмите «Симуляция» чтобы создать первый.
                  </Typography>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Simulation dialog */}
      <Dialog open={simDialog} onClose={() => !simRunning && setSimDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Симуляция звонка</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Контакт</InputLabel>
            <Select
              value={simContactId}
              label="Контакт"
              onChange={(e) => setSimContactId(e.target.value as number)}
            >
              {campaignContacts.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name || c.phone} {c.company ? `(${c.company})` : ''}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Характер клиента"
            fullWidth
            value={simPersonality}
            onChange={(e) => setSimPersonality(e.target.value)}
            sx={{ mb: 2 }}
            helperText="Опишите поведение клиента"
          />
          <TextField
            label="Возражения (по одному на строку)"
            fullWidth
            multiline
            rows={3}
            value={simObjections}
            onChange={(e) => setSimObjections(e.target.value)}
            placeholder="У нас уже есть поставщик&#10;Слишком дорого&#10;Не сейчас, через месяц"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSimDialog(false)} disabled={simRunning}>Отмена</Button>
          <Button variant="contained" onClick={runSimulation} disabled={simRunning || !simContactId}>
            {simRunning ? <><CircularProgress size={16} sx={{ mr: 1 }} />Запуск...</> : 'Запустить симуляцию'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add contacts dialog */}
      <Dialog open={addContactDialog} onClose={() => setAddContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить контакты</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Выберите контакты</InputLabel>
            <Select
              multiple
              value={selectedContactIds}
              label="Выберите контакты"
              onChange={(e) => setSelectedContactIds(e.target.value as number[])}
              renderValue={(selected) => `${selected.length} выбрано`}
            >
              {allContacts.filter(ac => !campaignContacts.find(cc => cc.id === ac.id)).map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name || c.phone} {c.company ? `(${c.company})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddContactDialog(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleAddContacts} disabled={selectedContactIds.length === 0}>
            Добавить
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
