import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getCalls } from '../../api/client';
import type { DashboardStats, Call } from '../../types';
import {
  Box, Grid, Typography, Paper, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, alpha, Button,
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

const COLORS = ['#6C5CE7', '#00cec9', '#ff7675', '#fdcb6e'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <Paper sx={{ p: 1.5, background: 'rgba(18,18,48,0.95)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
        <Typography variant="caption" sx={{ color: '#fff', fontWeight: 600 }}>{label}</Typography>
        {payload.map((p: any, i: number) => (
          <Typography key={i} variant="caption" sx={{ color: p.color, display: 'block' }}>
            {p.name}: {p.value}{p.name === 'score' || p.name === 'Скрипт %' ? '%' : ''}
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

  useEffect(() => {
    Promise.all([getDashboard(30), getCalls({ page_size: 10 })])
      .then(([d, c]) => { setData(d); setRecentCalls(c.items); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress sx={{ color: '#6C5CE7' }} />
    </Box>
  );

  if (!data) return <Typography color="error">Не удалось загрузить данные</Typography>;

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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 0.5 }}>
          Дашборд
        </Typography>
        <Typography variant="body2" sx={{ color: alpha('#fff', 0.4) }}>
          Аналитика звонков за последние 30 дней
        </Typography>
      </Box>

      {/* Stats grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Всего звонков" value={data.total_calls} icon={<PhoneIcon />} color="#6C5CE7" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Обработано" value={data.processed_calls} icon={<CheckCircleIcon />} color="#00cec9" gradient="linear-gradient(135deg, rgba(0,206,201,0.15) 0%, rgba(0,206,201,0.05) 100%)" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="В обработке" value={data.pending_calls} icon={<HourglassEmptyIcon />} color="#fdcb6e" gradient="linear-gradient(135deg, rgba(253,203,110,0.15) 0%, rgba(253,203,110,0.05) 100%)" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Средний скрипт" value={data.avg_compliance_score ? `${Math.round(data.avg_compliance_score)}%` : '-'} icon={<TrendingUpIcon />} color="#ff7675" gradient="linear-gradient(135deg, rgba(255,118,117,0.15) 0%, rgba(255,118,117,0.05) 100%)" subtitle={data.failed_calls > 0 ? `${data.failed_calls} ошибок` : undefined} />
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Compliance pie */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{
            p: 3, borderRadius: 3, background: 'rgba(18,18,48,0.6)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.06)', height: '100%',
          }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontSize: 15, fontWeight: 600 }}>
              Соблюдение скрипта
            </Typography>
            {compliancePie.some((d) => d.value > 0) ? (
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
              <Typography sx={{ color: alpha('#fff', 0.3), textAlign: 'center', py: 6 }}>Нет данных</Typography>
            )}
          </Paper>
        </Grid>

        {/* Manager bar chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{
            p: 3, borderRadius: 3, background: 'rgba(18,18,48,0.6)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.06)', height: '100%',
          }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontSize: 15, fontWeight: 600 }}>
              Скрипт по менеджерам
            </Typography>
            {managerChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={managerChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="score" fill="#6C5CE7" radius={[6, 6, 0, 0]} name="Скрипт %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography sx={{ color: alpha('#fff', 0.3), textAlign: 'center', py: 6 }}>Нет данных</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom row */}
      <Grid container spacing={2.5}>
        {/* Keywords */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{
            p: 3, borderRadius: 3, background: 'rgba(18,18,48,0.6)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontSize: 15, fontWeight: 600 }}>
              Частые слова
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {data.top_keywords.slice(0, 15).map((kw) => (
                <Chip
                  key={kw.word}
                  label={`${kw.word}`}
                  size="small"
                  sx={{
                    background: alpha('#6C5CE7', 0.15), color: '#a29bfe', border: 'none',
                    fontWeight: 500, fontSize: 12,
                  }}
                />
              ))}
              {data.top_keywords.length === 0 && (
                <Typography sx={{ color: alpha('#fff', 0.3), py: 2, fontSize: 13 }}>Нет данных</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent calls */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{
            p: 3, borderRadius: 3, background: 'rgba(18,18,48,0.6)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>
                Последние звонки
              </Typography>
              <Button size="small" onClick={() => navigate('/calls')} sx={{ color: alpha('#fff', 0.5), textTransform: 'none', fontSize: 13 }}>
                Все звонки →
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: alpha('#fff', 0.4), borderColor: 'rgba(255,255,255,0.06)', fontSize: 12 }}>Менеджер</TableCell>
                    <TableCell sx={{ color: alpha('#fff', 0.4), borderColor: 'rgba(255,255,255,0.06)', fontSize: 12 }}>Статус</TableCell>
                    <TableCell sx={{ color: alpha('#fff', 0.4), borderColor: 'rgba(255,255,255,0.06)', fontSize: 12 }}>Скрипт</TableCell>
                    <TableCell sx={{ color: alpha('#fff', 0.4), borderColor: 'rgba(255,255,255,0.06)', fontSize: 12 }}>Оценка</TableCell>
                    <TableCell sx={{ color: alpha('#fff', 0.4), borderColor: 'rgba(255,255,255,0.06)', fontSize: 12 }}>Дата</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCalls.map((call) => (
                    <TableRow
                      key={call.id} hover
                      sx={{ cursor: 'pointer', '&:hover': { background: 'rgba(255,255,255,0.03)' }, '& td': { borderColor: 'rgba(255,255,255,0.04)' } }}
                      onClick={() => navigate(`/calls?selected=${call.id}`)}
                    >
                      <TableCell sx={{ color: '#fff', fontSize: 13 }}>{call.manager_name || `#${call.manager_id}`}</TableCell>
                      <TableCell>
                        <Chip
                          label={call.status === 'analyzed' ? 'Готов' : call.status === 'failed' ? 'Ошибка' : call.status}
                          size="small"
                          sx={{
                            height: 22, fontSize: 11, fontWeight: 500,
                            background: call.status === 'analyzed' ? alpha('#00cec9', 0.15) : call.status === 'failed' ? alpha('#ff7675', 0.15) : alpha('#fdcb6e', 0.15),
                            color: call.status === 'analyzed' ? '#00cec9' : call.status === 'failed' ? '#ff7675' : '#fdcb6e',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>
                        {call.script_compliance && (
                          <Chip
                            label={call.script_compliance === 'compliant' ? '✓' : call.script_compliance === 'partial' ? '~' : '✗'}
                            size="small"
                            sx={{
                              height: 22, minWidth: 28, fontSize: 12, fontWeight: 600,
                              background: call.script_compliance === 'compliant' ? alpha('#00cec9', 0.15) : call.script_compliance === 'partial' ? alpha('#fdcb6e', 0.15) : alpha('#ff7675', 0.15),
                              color: call.script_compliance === 'compliant' ? '#00cec9' : call.script_compliance === 'partial' ? '#fdcb6e' : '#ff7675',
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ color: call.compliance_score != null && call.compliance_score >= 70 ? '#00cec9' : call.compliance_score != null && call.compliance_score >= 40 ? '#fdcb6e' : alpha('#fff', 0.5), fontSize: 13, fontWeight: 500 }}>
                        {call.compliance_score != null ? `${Math.round(call.compliance_score)}%` : '-'}
                      </TableCell>
                      <TableCell sx={{ color: alpha('#fff', 0.4), fontSize: 12 }}>
                        {new Date(call.created_at).toLocaleDateString('ru')}
                      </TableCell>
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
