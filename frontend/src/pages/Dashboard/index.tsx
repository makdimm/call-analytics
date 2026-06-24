import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getCalls } from '../../api/client';
import type { DashboardStats, Call } from '../../types';
import { useWebSocket } from '../../contexts/WebSocketContext';
import {
  Box, Grid, Typography, Paper, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Button, LinearProgress,
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import StatCard from '../../components/StatCard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <Paper sx={{ p: 1.5, border: '1px solid #e5e7eb' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#4b5563', mb: 0.5 }}>{label}</Typography>
        {payload.map((p: any, i: number) => (
          <Typography key={i} sx={{ fontSize: 12, color: p.color, display: 'block' }}>
            {p.name}: {p.value}{p.name === 'Скрипт %' || p.name === 'Речь %' ? '%' : ''}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { callProgress } = useWebSocket();

  useEffect(() => {
    Promise.all([getDashboard(30), getCalls({ page_size: 10 })])
      .then(([d, c]) => { setData(d); setRecentCalls(c.items); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );
  if (!data) return <Typography color="error">Не удалось загрузить данные</Typography>;

  const compliancePie = Object.entries(data.compliance_distribution).map(([name, value]) => ({
    name: name === 'compliant' ? 'По скрипту' : name === 'partial' ? 'Частично' : 'Не по скрипту',
    value,
  }));
  const hasComplianceData = compliancePie.some((d) => d.value > 0);

  const managerChart = data.manager_stats.map((m) => ({
    name: m.manager_name,
    score: Math.round(m.avg_compliance ?? 0),
    calls: m.processed_calls,
  }));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          Дашборд
        </Typography>
        <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
          Аналитика звонков за последние 30 дней
        </Typography>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Всего звонков" value={data.total_calls} icon={<PhoneIcon />} color="#3b82f6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Обработано" value={data.processed_calls} icon={<CheckCircleIcon />} color="#10b981" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="В обработке" value={data.pending_calls} icon={<HourglassEmptyIcon />} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Средний скрипт"
            value={data.avg_compliance_score ? `${Math.round(data.avg_compliance_score)}%` : '-'}
            icon={<TrendingUpIcon />}
            color="#8b5cf6"
            subtitle={data.failed_calls > 0 ? `${data.failed_calls} ошибок` : undefined}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2, height: '100%' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>
              Соблюдение скрипта
            </Typography>
            {hasComplianceData ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={compliancePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                    {compliancePie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography sx={{ color: '#d1d5db', fontSize: 36, mb: 1 }}>&mdash;</Typography>
                <Typography sx={{ color: '#9ca3af', fontSize: 13 }}>Нет данных</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2, height: '100%' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>
              Скрипт по менеджерам
            </Typography>
            {managerChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={managerChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Скрипт %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography sx={{ color: '#d1d5db', fontSize: 36, mb: 1 }}>&mdash;</Typography>
                <Typography sx={{ color: '#9ca3af', fontSize: 13 }}>Нет данных</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom row */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>
              Частые слова
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {data.top_keywords.slice(0, 15).map((kw) => (
                <Chip
                  key={kw.word}
                  label={kw.word}
                  size="small"
                  sx={{ bgcolor: '#f3f4f6', color: '#4b5563', fontSize: 12, fontWeight: 500, borderRadius: 1.5 }}
                />
              ))}
              {data.top_keywords.length === 0 && (
                <Typography sx={{ color: '#9ca3af', fontSize: 13, py: 1 }}>Нет данных</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937' }}>
                Последние звонки
              </Typography>
              <Button size="small" onClick={() => navigate('/calls')} disableElevation sx={{ textTransform: 'none', fontSize: 13, color: '#3b82f6', fontWeight: 500 }}>
                Все звонки →
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Менеджер</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Прогресс</TableCell>
                    <TableCell>Скрипт</TableCell>
                    <TableCell>Оценка</TableCell>
                    <TableCell>Дата</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCalls.map((call) => {
                    const prog = callProgress.get(call.id);
                    return (
                      <TableRow
                        key={call.id} hover
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/calls?selected=${call.id}`)}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>
                          {call.manager_name || `#${call.manager_id}`}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={call.status === 'analyzed' ? 'Готов' : call.status === 'failed' ? 'Ошибка' : call.status}
                            size="small"
                            sx={{
                              height: 22, fontSize: 11, fontWeight: 600,
                              bgcolor: call.status === 'analyzed' ? '#ecfdf5' : call.status === 'failed' ? '#fef2f2' : '#fffbeb',
                              color: call.status === 'analyzed' ? '#10b981' : call.status === 'failed' ? '#ef4444' : '#f59e0b',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          {call.status === 'processing' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flex: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={prog?.progress ?? 0}
                                  sx={{ height: 4, borderRadius: 2, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 2 } }}
                                />
                              </Box>
                              <Typography sx={{ fontSize: 11, color: '#6b7280' }}>
                                {prog?.progress ?? 0}%
                              </Typography>
                            </Box>
                          ) : call.status === 'analyzed' || call.status === 'failed' ? (
                            <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>—</Typography>
                          ) : (
                            <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {call.script_compliance && (
                            <Chip
                              label={call.script_compliance === 'compliant' ? '✓' : call.script_compliance === 'partial' ? '~' : '✗'}
                              size="small"
                              sx={{
                                height: 22, minWidth: 28, fontSize: 12, fontWeight: 600,
                                bgcolor: call.script_compliance === 'compliant' ? '#ecfdf5' : call.script_compliance === 'partial' ? '#fffbeb' : '#fef2f2',
                                color: call.script_compliance === 'compliant' ? '#10b981' : call.script_compliance === 'partial' ? '#f59e0b' : '#ef4444',
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: call.compliance_score != null && call.compliance_score >= 70 ? '#10b981' : call.compliance_score != null && call.compliance_score >= 40 ? '#f59e0b' : call.compliance_score != null ? '#ef4444' : '#9ca3af' }}>
                          {call.compliance_score != null ? `${Math.round(call.compliance_score)}%` : '-'}
                        </TableCell>
                        <TableCell sx={{ color: '#9ca3af' }}>
                          {new Date(call.created_at).toLocaleDateString('ru')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
