import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboard, getCalls } from '../../api/client';
import type { DashboardStats, Call } from '../../types';
import {
  Box, Grid, Typography, Paper, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Alert,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorIcon from '@mui/icons-material/Error';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/StatCard';

const COLORS = ['#7c4dff', '#00e5ff', '#ff6b6b', '#ffd93d', '#6bcb77'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getDashboard(30), getCalls({ page_size: 10 })])
      .then(([d, c]) => {
        setData(d);
        setRecentCalls(c.items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Не удалось загрузить данные</Alert>;

  const compliancePie = Object.entries(data.compliance_distribution).map(([name, value]) => ({
    name: name === 'compliant' ? 'По скрипту' : name === 'partial' ? 'Частично' : 'Не по скрипту',
    value,
  }));

  const managerChart = data.manager_stats.map((m) => ({
    name: m.manager_name,
    score: Math.round(m.avg_compliance ?? 0),
    calls: m.processed_calls,
  }));

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Дашборд
      </Typography>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Всего звонков" value={data.total_calls} icon={<PhoneIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Обработано" value={data.processed_calls} icon={<CheckCircleIcon />} color="#00e5ff" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="В очереди" value={data.pending_calls} icon={<HourglassEmptyIcon />} color="#ffd93d" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Ошибки" value={data.failed_calls} icon={<ErrorIcon />} color="#ff6b6b" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Compliance pie */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Соблюдение скрипта</Typography>
            {compliancePie.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={compliancePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {compliancePie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography sx={{ color: "grey.500", textAlign: "center", py: 4 }}>Нет данных</Typography>
            )}
          </Paper>
        </Grid>

        {/* Manager bar chart */}
        {user?.role === 'admin' && (
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Скрипт по менеджерам</Typography>
              {managerChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={managerChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis domain={[0, 100]} stroke="#999" />
                    <Tooltip />
                    <Bar dataKey="score" fill="#7c4dff" radius={[8, 8, 0, 0]} name="Скрипт %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ color: "grey.500", textAlign: "center", py: 4 }}>Нет данных</Typography>
              )}
            </Paper>
          </Grid>
        )}

        {/* Keywords */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Частые слова</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {data.top_keywords.slice(0, 15).map((kw) => (
                <Chip key={kw.word} label={`${kw.word} (${kw.count})`} size="small" variant="outlined" color="primary" />
              ))}
              {data.top_keywords.length === 0 && (
                <Typography variant="body2" color="grey.500">Нет данных</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent calls */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Последние звонки</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Менеджер</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Скрипт</TableCell>
                    <TableCell>Оценка</TableCell>
                    <TableCell>Дата</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCalls.map((call) => (
                    <TableRow
                      key={call.id} hover sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/calls?selected=${call.id}`)}
                    >
                      <TableCell>{call.manager_name || `#${call.manager_id}`}</TableCell>
                      <TableCell>
                        <Chip
                          label={call.status === 'analyzed' ? 'Готов' : call.status === 'failed' ? 'Ошибка' : call.status}
                          size="small"
                          color={call.status === 'analyzed' ? 'success' : call.status === 'failed' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        {call.script_compliance && (
                          <Chip
                            label={call.script_compliance === 'compliant' ? '✓' : call.script_compliance === 'partial' ? '~' : '✗'}
                            size="small"
                            color={call.script_compliance === 'compliant' ? 'success' : call.script_compliance === 'partial' ? 'warning' : 'error'}
                          />
                        )}
                      </TableCell>
                      <TableCell>{call.compliance_score != null ? `${Math.round(call.compliance_score)}%` : '-'}</TableCell>
                      <TableCell>{new Date(call.created_at).toLocaleDateString('ru')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
