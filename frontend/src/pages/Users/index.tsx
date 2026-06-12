import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getDashboard } from '../../api/client';
import type { User, DashboardStats } from '../../types';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, CircularProgress, alpha,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <Paper sx={{ p: 1.5, background: 'rgba(18,18,48,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {payload.map((p: any, i: number) => (
          <Typography key={i} variant="caption" sx={{ color: p.color, display: 'block' }}>{p.name}: {p.value}%</Typography>
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
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getUsers(), getDashboard(30)])
      .then(([u, s]) => { setUsers(u.filter((x: User) => x.role === 'manager')); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#6C5CE7' }} /></Box>;

  const chartData = (stats?.manager_stats || []).map((m) => ({
    name: m.manager_name,
    score: Math.round(m.avg_compliance ?? 0),
    talk: Math.round(m.avg_talk_ratio ?? 0),
    calls: m.processed_calls,
  }));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 0.5 }}>Менеджеры</Typography>
        <Typography variant="body2" sx={{ color: alpha('#fff', 0.4) }}>{users.length} человек</Typography>
      </Box>

      {chartData.length > 0 && (
        <Paper sx={{
          p: 3, mb: 3, borderRadius: 3,
          background: 'rgba(18,18,48,0.6)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontSize: 15, fontWeight: 600 }}>Сравнение</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="score" fill="#6C5CE7" radius={[6, 6, 0, 0]} name="Скрипт" />
              <Bar dataKey="talk" fill="#00cec9" radius={[6, 6, 0, 0]} name="Речь" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      <Paper sx={{
        borderRadius: 3, overflow: 'hidden',
        background: 'rgba(18,18,48,0.6)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Имя', 'Email', 'Звонков', 'Скрипт', 'Речь', 'Статус'].map((h) => (
                  <TableCell key={h} sx={{ color: alpha('#fff', 0.4), borderColor: 'rgba(255,255,255,0.06)', fontSize: 12, fontWeight: 500 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const ms = stats?.manager_stats.find((m) => m.manager_id === u.id);
                return (
                  <TableRow
                    key={u.id} hover
                    sx={{ cursor: 'pointer', '&:hover': { background: 'rgba(255,255,255,0.03)' }, '& td': { borderColor: 'rgba(255,255,255,0.04)' } }}
                    onClick={() => navigate(`/users/${u.id}`)}
                  >
                    <TableCell><Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{u.username}</Typography></TableCell>
                    <TableCell sx={{ color: alpha('#fff', 0.5), fontSize: 13 }}>{u.email}</TableCell>
                    <TableCell sx={{ color: alpha('#fff', 0.7), fontSize: 13 }}>{ms?.processed_calls ?? 0} / {ms?.total_calls ?? 0}</TableCell>
                    <TableCell>
                      {ms?.avg_compliance != null ? (
                        <Chip
                          label={`${Math.round(ms.avg_compliance)}%`}
                          size="small"
                          sx={{
                            height: 22, fontSize: 11, fontWeight: 600,
                            background: ms.avg_compliance >= 70 ? 'rgba(0,206,201,0.15)' : ms.avg_compliance >= 40 ? 'rgba(253,203,110,0.15)' : 'rgba(255,118,117,0.15)',
                            color: ms.avg_compliance >= 70 ? '#00cec9' : ms.avg_compliance >= 40 ? '#fdcb6e' : '#ff7675',
                          }}
                        />
                      ) : <Typography sx={{ color: alpha('#fff', 0.3), fontSize: 13 }}>-</Typography>}
                    </TableCell>
                    <TableCell sx={{ color: alpha('#fff', 0.7), fontSize: 13 }}>{ms?.avg_talk_ratio != null ? `${Math.round(ms.avg_talk_ratio)}%` : '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_active ? 'Активен' : 'Нет'}
                        size="small"
                        sx={{ height: 22, fontSize: 11, background: u.is_active ? 'rgba(0,206,201,0.15)' : 'rgba(255,255,255,0.08)', color: u.is_active ? '#00cec9' : alpha('#fff', 0.4) }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
