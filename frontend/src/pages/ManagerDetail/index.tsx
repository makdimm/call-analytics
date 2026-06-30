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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import MicIcon from '@mui/icons-material/Mic';
import StatCard from '../../components/StatCard';

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
          <StatCard title="Средняя оценка" value={stats.avg_compliance ? `${Math.round(stats.avg_compliance)}%` : '-'} icon={<CheckCircleIcon />} color="#10b981" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Речь менеджера" value={stats.avg_talk_ratio ? `${Math.round(stats.avg_talk_ratio)}%` : '-'} icon={<MicIcon />} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Нарушений" value={stats.non_compliant_count + stats.partial_count} icon={<WarningIcon />} color="#ef4444" />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#1f2937', mb: 2 }}>Звонки</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Файл</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Скрипт</TableCell>
                <TableCell>Оценка</TableCell>
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
                      label={call.status === 'analyzed' ? 'Готов' : call.status}
                      size="small"
                      sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: call.status === 'analyzed' ? '#ecfdf5' : '#f3f4f6', color: call.status === 'analyzed' ? '#10b981' : '#6b7280' }}
                    />
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
                  <TableCell sx={{ fontWeight: 600, color: call.compliance_score != null && call.compliance_score >= 70 ? '#10b981' : call.compliance_score != null && call.compliance_score >= 40 ? '#f59e0b' : call.compliance_score != null ? '#ef4444' : '#9ca3af' }}>
                    {call.compliance_score != null ? `${Math.round(call.compliance_score)}%` : '-'}
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
