import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getManagerDetail } from '../../api/client';
import type { ManagerDetail as ManagerDetailType } from '../../types';
import {
  Box, Typography, Paper, Grid, Chip, CircularProgress, Button, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MicIcon from '@mui/icons-material/Mic';
import StatCard from '../../components/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';

const CRITERIA_LABELS: Record<string, string> = {
  greeting: 'Приветствие',
  speech: 'Речь',
  initiative: 'Инициатива',
  programming: 'Программирование',
  qualification: 'Квалификация',
  pain: 'Боль',
  product: 'Продукт',
  expertise: 'Экспертность',
  closing: 'Закрытие',
  push: 'Дожим',
  next_step: 'След. шаг',
  framing: 'Фрейминг',
};

const CALL_TYPE_LABELS: Record<string, string> = {
  new_lead: 'Новая заявка',
  acceleration: 'Ускорение',
  clarification: 'Уточнение',
  auto_answer: 'Автоответ',
};

function scoreColor(score: number | null | undefined): string {
  if (score == null) return '#9ca3af';
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <Paper sx={{ p: 1.5, border: '1px solid #e5e7eb' }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#4b5563', mb: 0.5 }}>{label}</Typography>
        {payload.map((p: any, i: number) => (
          <Typography key={i} sx={{ fontSize: 12, color: p.color }}>
            {p.name}: {typeof p.value === 'number' ? `${(p.value * 100).toFixed(0)}%` : p.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

export default function ManagerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ManagerDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) getManagerDetail(Number(id)).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!data) return <Typography color="error">Менеджер не найден</Typography>;

  const { stats, manager } = data;
  const criteriaAvg = stats.criteria_avg;
  const criteriaChartData = criteriaAvg
    ? Object.entries(CRITERIA_LABELS)
        .filter(([key]) => (criteriaAvg as any)[key] != null)
        .map(([key, label]) => ({ name: label, value: (criteriaAvg as any)[key] }))
    : [];

  const callTypeChart = stats.call_type_breakdown.map((ct) => ({
    name: CALL_TYPE_LABELS[ct.call_type] || ct.call_type,
    count: ct.count,
    avg_fg: ct.avg_fg ? Math.round(ct.avg_fg) : 0,
  }));

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/users')}
        sx={{ color: '#6b7280', mb: 2, textTransform: 'none', fontSize: 13, fontWeight: 500, '&:hover': { color: '#1f2937' } }}
      >
        К списку менеджеров
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar sx={{ width: 44, height: 44, bgcolor: '#3b82f6', fontSize: 18, fontWeight: 700, borderRadius: 1.5 }}>
          {manager.username[0].toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.25 }}>{manager.username}</Typography>
          <Typography sx={{ color: '#6b7280', fontSize: 14 }}>{manager.email}</Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Всего звонков" value={stats.total_calls} icon={<PhoneIcon />} color="#3b82f6" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Средний FG" value={stats.avg_fg_score != null ? `${Math.round(stats.avg_fg_score)}%` : '-'} icon={<TrendingUpIcon />} color="#8b5cf6" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Речь менеджера" value={stats.avg_talk_ratio ? `${Math.round(stats.avg_talk_ratio)}%` : '-'} icon={<MicIcon />} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Нарушений" value={stats.non_compliant_count + stats.partial_count} icon={<WarningIcon />} color="#ef4444" />
        </Grid>
      </Grid>

      {/* Criteria avg chart */}
      {criteriaChartData.length > 0 && (
        <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2, mb: 3 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>
            Средние оценки по критериям
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={criteriaChartData} margin={{ left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
              <YAxis domain={[0, 1]} stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Средняя оценка" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Call type breakdown */}
      {callTypeChart.length > 0 && (
        <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2, mb: 3 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>
            Распределение по типам звонков
          </Typography>
          <Grid container spacing={2}>
            {callTypeChart.map((ct) => (
              <Grid size={{ xs: 6, sm: 3 }} key={ct.name}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f9fafb', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 13, color: '#6b7280', mb: 0.5 }}>{ct.name}</Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{ct.count}</Typography>
                  {ct.avg_fg > 0 && (
                    <Typography sx={{ fontSize: 12, color: scoreColor(ct.avg_fg), mt: 0.25 }}>
                      FG {ct.avg_fg}%
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Calls table */}
      <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>Звонки</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Файл</TableCell>
                <TableCell>Тип</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>FG</TableCell>
                <TableCell>Скрипт</TableCell>
                <TableCell>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recent_calls.map((call) => (
                <TableRow
                  key={call.id} hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/calls?selected=${call.id}`)}
                >
                  <TableCell sx={{ fontWeight: 500, color: '#1f2937' }}>{call.filename}</TableCell>
                  <TableCell>
                    <Chip
                      label={CALL_TYPE_LABELS[call.call_type || ''] || call.call_type || '-'}
                      size="small"
                      sx={{ height: 20, fontSize: 10, fontWeight: 600, bgcolor: '#f3f4f6', color: '#6b7280' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={call.status === 'analyzed' ? 'Готов' : call.status}
                      size="small"
                      sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: call.status === 'analyzed' ? '#ecfdf5' : '#f3f4f6', color: call.status === 'analyzed' ? '#10b981' : '#6b7280' }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: scoreColor(call.fg_score) }}>
                    {call.fg_score != null ? `${Math.round(call.fg_score)}%` : '-'}
                  </TableCell>
                  <TableCell>
                    {call.compliance && (
                      <Chip
                        label={call.compliance === 'compliant' ? 'По скрипту' : call.compliance === 'partial' ? 'Частично' : 'Не по скрипту'}
                        size="small"
                        sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: call.compliance === 'compliant' ? '#ecfdf5' : call.compliance === 'partial' ? '#fffbeb' : '#fef2f2', color: call.compliance === 'compliant' ? '#10b981' : call.compliance === 'partial' ? '#f59e0b' : '#ef4444' }}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: '#9ca3af' }}>
                    {new Date(call.created_at).toLocaleString('ru')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
