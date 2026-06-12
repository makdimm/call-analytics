import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../../api/client';
import { getDashboard } from '../../api/client';
import type { User, DashboardStats } from '../../types';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, CircularProgress,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  const chartData = (stats?.manager_stats || []).map((m) => ({
    name: m.manager_name,
    score: Math.round(m.avg_compliance ?? 0),
    talk: Math.round(m.avg_talk_ratio ?? 0),
    calls: m.processed_calls,
  }));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Менеджеры</Typography>

      {chartData.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Сравнение менеджеров</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis domain={[0, 100]} stroke="#999" />
              <Tooltip />
              <Bar dataKey="score" fill="#7c4dff" radius={[8, 8, 0, 0]} name="Скрипт %" />
              <Bar dataKey="talk" fill="#00e5ff" radius={[8, 8, 0, 0]} name="Речь %" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      <Paper sx={{ background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Звонков</TableCell>
                <TableCell>Скрипт</TableCell>
                <TableCell>Время речи</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => {
                const ms = stats?.manager_stats.find((m) => m.manager_id === u.id);
                return (
                  <TableRow
                    key={u.id} hover sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/users/${u.id}`)}
                  >
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{u.username}</Typography>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{ms?.processed_calls ?? 0} / {ms?.total_calls ?? 0}</TableCell>
                    <TableCell>
                      {ms?.avg_compliance != null ? (
                        <Chip label={`${Math.round(ms.avg_compliance)}%`} size="small" color={ms.avg_compliance >= 70 ? 'success' : ms.avg_compliance >= 40 ? 'warning' : 'error'} />
                      ) : '-'}
                    </TableCell>
                    <TableCell>{ms?.avg_talk_ratio != null ? `${Math.round(ms.avg_talk_ratio)}%` : '-'}</TableCell>
                    <TableCell>
                      <Chip label={u.is_active ? 'Активен' : 'Неактивен'} size="small" color={u.is_active ? 'success' : 'default'} />
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
