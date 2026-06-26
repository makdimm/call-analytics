import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getDashboard } from '../../api/client';
import { api } from '../../api/client';
import type { User, DashboardStats } from '../../types';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, CircularProgress, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <Paper sx={{ p: 1.5, border: '1px solid #e5e7eb' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#4b5563', mb: 0.5 }}>{label}</Typography>
        {payload.map((p: any, i: number) => (
          <Typography key={i} sx={{ fontSize: 12, color: p.color, display: 'block' }}>
            {p.name}: {p.value}%
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '123456' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([getUsers(), getDashboard(30)])
      .then(([u, s]) => { setUsers(u.filter((x: User) => x.role === 'manager')); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => { setDialogOpen(true); setForm({ username: '', email: '', password: '123456' }); setError(''); };

  const addManager = () => {
    if (!form.username || !form.email) { setError('Имя и email обязательны'); return; }
    api.post('/users/', { ...form, role: 'manager' })
      .then(() => { setDialogOpen(false); load(); })
      .catch((e: any) => setError(e.response?.data?.detail || 'Ошибка'));
  };

  const removeManager = (user: User) => {
    if (!confirm(`Удалить менеджера "${user.username}"? Звонки тоже удалятся.`)) return;
    api.delete(`/users/${user.id}`)
      .then(load)
      .catch((e: any) => alert(e.response?.data?.detail || 'Ошибка удаления'));
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  const chartData = (stats?.manager_stats || []).map((m) => ({
    name: m.manager_name,
    score: Math.round(m.avg_compliance ?? 0),
    talk: Math.round(m.avg_talk_ratio ?? 0),
    fg: Math.round(m.avg_fg_score ?? 0),
    calls: m.processed_calls,
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>Менеджеры</Typography>
          <Typography sx={{ color: '#6b7280', fontSize: 14 }}>{users.length} человек</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} disableElevation sx={{ bgcolor: '#3b82f6', textTransform: 'none', borderRadius: 1.5 }}>
          Добавить менеджера
        </Button>
      </Box>

      {chartData.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>Сравнение</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="fg" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="FG" />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Скрипт" />
              <Bar dataKey="talk" fill="#10b981" radius={[4, 4, 0, 0]} name="Речь" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      <Paper sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Звонков</TableCell>
                <TableCell>FG</TableCell>
                <TableCell>Скрипт</TableCell>
                <TableCell>Речь</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const ms = stats?.manager_stats.find((m) => m.manager_id === u.id);
                return (
                  <TableRow
                    key={u.id} hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/users/${u.id}`)}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>
                        {u.username}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#4b5563' }}>{u.email}</TableCell>
                    <TableCell sx={{ color: '#4b5563' }}>{ms?.processed_calls ?? 0} / {ms?.total_calls ?? 0}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: ms?.avg_fg_score != null && ms.avg_fg_score >= 70 ? '#10b981' : ms?.avg_fg_score != null && ms.avg_fg_score >= 40 ? '#f59e0b' : ms?.avg_fg_score != null ? '#ef4444' : '#9ca3af' }}>
                      {ms?.avg_fg_score != null ? `${Math.round(ms.avg_fg_score)}%` : '-'}
                    </TableCell>
                    <TableCell>
                      {ms?.avg_compliance != null ? (
                        <Chip
                          label={`${Math.round(ms.avg_compliance)}%`}
                          size="small"
                          sx={{
                            height: 22, fontSize: 11, fontWeight: 600,
                            bgcolor: ms.avg_compliance >= 70 ? '#ecfdf5' : ms.avg_compliance >= 40 ? '#fffbeb' : '#fef2f2',
                            color: ms.avg_compliance >= 70 ? '#10b981' : ms.avg_compliance >= 40 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      ) : <Typography sx={{ color: '#9ca3af', fontSize: 13 }}>-</Typography>}
                    </TableCell>
                    <TableCell sx={{ color: '#4b5563' }}>{ms?.avg_talk_ratio != null ? `${Math.round(ms.avg_talk_ratio)}%` : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_active ? 'Активен' : 'Нет'}
                        size="small"
                        sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: u.is_active ? '#ecfdf5' : '#f3f4f6', color: u.is_active ? '#10b981' : '#9ca3af' }}
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={() => removeManager(u)} sx={{ color: '#ef4444' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новый менеджер</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Typography sx={{ color: '#ef4444', mb: 2, fontSize: 13 }}>{error}</Typography>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Имя пользователя" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} size="small" fullWidth />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} size="small" fullWidth />
            <TextField label="Пароль" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} size="small" fullWidth type="password" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#6b7280' }}>Отмена</Button>
          <Button variant="contained" onClick={addManager} disableElevation sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>Создать</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
