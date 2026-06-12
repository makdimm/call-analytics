import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getManagerDetail } from '../../api/client';
import { ManagerDetail as ManagerDetailType } from '../../types';
import {
  Box, Typography, Paper, Grid, Chip, CircularProgress, Alert, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StatCard from '../../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ManagerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ManagerDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getManagerDetail(Number(id))
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!data) return <Alert severity="error">Менеджер не найден</Alert>;

  const { stats, manager } = data;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/users')} sx={{ mb: 2 }}>
        К списку менеджеров
      </Button>

      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        {manager.username}
      </Typography>
      <Typography variant="body2" color="grey.500" sx={{ mb: 3 }}>
        {manager.email}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Всего звонков" value={stats.total_calls} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Средняя оценка" value={stats.avg_compliance ? `${Math.round(stats.avg_compliance)}%` : '-'} color="#00e5ff" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Средняя речь" value={stats.avg_talk_ratio ? `${Math.round(stats.avg_talk_ratio)}%` : '-'} color="#ffd93d" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Нарушений" value={stats.non_compliant_count} color="#ff6b6b" />
        </Grid>
      </Grid>

      {/* Recent calls */}
      <Paper sx={{ p: 3, background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Звонки</Typography>
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
                <TableRow key={call.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/calls?selected=${call.id}`)}>
                  <TableCell>{call.filename}</TableCell>
                  <TableCell>
                    <Chip
                      label={call.status === 'analyzed' ? 'Готов' : call.status}
                      size="small"
                      color={call.status === 'analyzed' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {call.compliance && (
                      <Chip
                        label={call.compliance === 'compliant' ? '✓' : '~'}
                        size="small"
                        color={call.compliance === 'compliant' ? 'success' : 'warning'}
                      />
                    )}
                  </TableCell>
                  <TableCell>{call.compliance_score != null ? `${Math.round(call.compliance_score)}%` : '-'}</TableCell>
                  <TableCell>{new Date(call.created_at).toLocaleString('ru')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
