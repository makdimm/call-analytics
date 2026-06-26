import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getCalls } from '../../api/client';
import type { DashboardStats, Call } from '../../types';
import {
  Box, Grid, Typography, Paper, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Button,
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const WARMTH_COLORS: Record<string, string> = {
  cold: '#6366f1',
  warm: '#f59e0b',
  hot: '#ef4444',
  non_target: '#9ca3af',
  unknown: '#d1d5db',
};
const CALL_TYPE_LABELS: Record<string, string> = {
  new_lead: 'Новая заявка',
  acceleration: 'Ускорение',
  clarification: 'Уточнение',
  auto_answer: 'Автоответ',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <Paper sx={{ p: 1.5, border: '1px solid #e5e7eb' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#4b5563', mb: 0.5 }}>{label}</Typography>
        {payload.map((p: any, i: number) => (
          <Typography key={i} sx={{ fontSize: 12, color: p.color, display: 'block' }}>
            {p.name}: {typeof p.value === 'number' ? (p.name.includes('%') ? `${Math.round(p.value)}%` : p.value) : p.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

function scoreColor(score: number | null | undefined): string {
  if (score == null) return '#9ca3af';
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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

  const callTypePie = data.call_type_distribution.map((ct) => ({
    name: CALL_TYPE_LABELS[ct.call_type] || ct.call_type,
    value: ct.count,
    avg_fg: ct.avg_fg,
  }));
  const hasCallTypeData = callTypePie.some((d) => d.value > 0);

  const warmthPie = Object.entries(data.warmth_distribution).map(([name, value]) => ({
    name: name === 'cold' ? 'Холодный' : name === 'warm' ? 'Теплый' : name === 'hot' ? 'Горячий' : name === 'non_target' ? 'Нецелевой' : name,
    value,
  }));

  const managerChart = data.manager_stats.map((m) => ({
    name: m.manager_name,
    fg_score: Math.round(m.avg_fg_score ?? 0),
    compliance: Math.round(m.avg_compliance ?? 0),
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
            title="Средний FG"
            value={data.avg_fg_score != null ? `${Math.round(data.avg_fg_score)}%` : '-'}
            icon={<TrendingUpIcon />}
            color="#8b5cf6"
            subtitle={data.failed_calls > 0 ? `${data.failed_calls} ошибок` : undefined}
          />
        </Grid>
      </Grid>

      {/* Charts row 1 */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2, height: '100%' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>
              Соблюдение скрипта
            </Typography>
            {hasComplianceData ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={compliancePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
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

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2, height: '100%' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>
              Типы звонков
            </Typography>
            {hasCallTypeData ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={callTypePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                    {callTypePie.map((_, i) => (
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

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2, height: '100%' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>
              Теплота звонков
            </Typography>
            {warmthPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={warmthPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                    {warmthPie.map((_, i) => (
                      <Cell key={i} fill={WARMTH_COLORS[Object.keys(data.warmth_distribution)[i]] || COLORS[i]} stroke="none" />
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
      </Grid>

      {/* Manager chart */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>
              FG и Compliance по менеджерам
            </Typography>
            {managerChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={managerChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="fg_score" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="FG %" />
                  <Bar dataKey="compliance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Скрипт %" />
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
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2, height: '100%' }}>
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
                    <TableCell>Тип</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>FG</TableCell>
                    <TableCell>Скрипт</TableCell>
                    <TableCell>Дата</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCalls.map((call) => {
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
                            label={CALL_TYPE_LABELS[call.call_type || ''] || call.call_type || '-'}
                            size="small"
                            sx={{ height: 20, fontSize: 10, fontWeight: 600, bgcolor: '#f3f4f6', color: '#6b7280' }}
                          />
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
                        <TableCell sx={{ fontWeight: 600, color: scoreColor(call.fg_score) }}>
                          {call.fg_score != null ? `${Math.round(call.fg_score)}%` : '-'}
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
