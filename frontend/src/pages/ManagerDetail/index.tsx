import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getManagerDetail } from '../../api/client';
import type { ManagerDetail as ManagerDetailType } from '../../types';
import {
  Box, Typography, Paper, Grid, Chip, CircularProgress, Button, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import StatCard from '../../components/StatCard';

export default function ManagerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ManagerDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) getManagerDetail(Number(id)).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#6C5CE7' }} /></Box>;
  if (!data) return <Typography color="error">Менеджер не найден</Typography>;

  const { stats, manager } = data;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')} sx={{ color: alpha('#fff', 0.5), mb: 2, textTransform: 'none', '&:hover': { color: '#fff' } }}>
        К списку менеджеров
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', fontSize: 20, fontWeight: 700 }}>
          {manager.username[0].toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>{manager.username}</Typography>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.4) }}>{manager.email}</Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Всего звонков" value={stats.total_calls} icon={<PhoneIcon />} color="#6C5CE7" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Средняя оценка" value={stats.avg_compliance ? `${Math.round(stats.avg_compliance)}%` : '-'} icon={<CheckCircleIcon />} color="#00cec9" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Речь" value={stats.avg_talk_ratio ? `${Math.round(stats.avg_talk_ratio)}%` : '-'} icon={<PhoneIcon />} color="#fdcb6e" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Нарушений" value={stats.non_compliant_count + stats.partial_count} icon={<WarningIcon />} color="#ff7675" />
        </Grid>
      </Grid>

      <Paper sx={{
        p: 3, borderRadius: 3,
        background: 'rgba(18,18,48,0.6)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontSize: 15, fontWeight: 600 }}>Звонки</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Файл', 'Статус', 'Скрипт', 'Оценка', 'Дата'].map((h) => (
                  <TableCell key={h} sx={{ color: alpha('#fff', 0.4), borderColor: 'rgba(255,255,255,0.06)', fontSize: 12 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.recent_calls.map((call) => (
                <TableRow key={call.id} hover sx={{ cursor: 'pointer', '&:hover': { background: 'rgba(255,255,255,0.03)' }, '& td': { borderColor: 'rgba(255,255,255,0.04)' } }} onClick={() => navigate(`/calls?selected=${call.id}`)}>
                  <TableCell sx={{ color: '#fff', fontSize: 13 }}>{call.filename}</TableCell>
                  <TableCell>
                    <Chip label={call.status === 'analyzed' ? 'Готов' : call.status} size="small" sx={{ height: 22, fontSize: 11, background: call.status === 'analyzed' ? 'rgba(0,206,201,0.15)' : 'rgba(255,255,255,0.08)', color: call.status === 'analyzed' ? '#00cec9' : alpha('#fff', 0.5) }} />
                  </TableCell>
                  <TableCell>
                    {call.compliance && (
                      <Chip label={call.compliance === 'compliant' ? 'По скрипту' : '~'} size="small" sx={{ height: 22, fontSize: 11, background: call.compliance === 'compliant' ? 'rgba(0,206,201,0.15)' : 'rgba(253,203,110,0.15)', color: call.compliance === 'compliant' ? '#00cec9' : '#fdcb6e' }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: call.compliance_score != null && call.compliance_score >= 70 ? '#00cec9' : '#fdcb6e', fontSize: 13, fontWeight: 600 }}>
                    {call.compliance_score != null ? `${Math.round(call.compliance_score)}%` : '-'}
                  </TableCell>
                  <TableCell sx={{ color: alpha('#fff', 0.4), fontSize: 12 }}>{new Date(call.created_at).toLocaleString('ru')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
