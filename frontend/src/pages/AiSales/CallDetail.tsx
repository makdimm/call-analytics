import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, CircularProgress, IconButton, Grid, Card, CardContent,
  LinearProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getSalesCall } from '../../api/client';
import type { SalesCall } from '../../types';

const RESULT_COLORS: Record<string, string> = {
  meeting_set: '#10b981',
  interested: '#3b82f6',
  not_interested: '#ef4444',
  callback: '#f59e0b',
  no_answer: '#9ca3af',
};

const RESULT_LABELS: Record<string, string> = {
  meeting_set: 'Встреча',
  interested: 'Интерес',
  not_interested: 'Не интерес',
  callback: 'Перезвон',
  no_answer: 'Нет ответа',
};


export default function AiSalesCallDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [call, setCall] = useState<SalesCall | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSalesCall(parseInt(id))
      .then(setCall)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!call) return <Typography>Звонок не найден</Typography>;

  const conversation = call.conversation || [];
  const quality = call.quality_details || {};

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4">Звонок #{call.id}</Typography>
            <Chip
              label={call.status}
              size="small"
              sx={{
                color: '#fff',
                fontWeight: 600,
                bgcolor: call.status === 'completed' ? '#10b981' : call.status === 'in_progress' ? '#3b82f6' : '#ef4444',
              }}
            />
            {call.result && (
              <Chip
                label={RESULT_LABELS[call.result] || call.result}
                size="small"
                sx={{ color: '#fff', bgcolor: RESULT_COLORS[call.result] || '#9ca3af', fontWeight: 600 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {call.contact?.name || 'Неизвестно'} · {call.phone}
            {call.contact?.company && ` · ${call.contact.company}`}
          </Typography>
        </Box>
      </Box>

      {/* Info cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">Quality Score</Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
              {call.quality_score != null ? `${Math.round(call.quality_score)}` : '—'}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">Длительность</Typography>
            <Typography variant="h5" sx={{ mt: 0.5 }}>
              {call.duration_seconds ? `${Math.round(call.duration_seconds)}с` : '—'}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">Результат</Typography>
            <Typography variant="h6" sx={{ mt: 0.5 }}>
              {call.result ? (RESULT_LABELS[call.result] || call.result) : '—'}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card><CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">Причина</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>{call.result_reason || '—'}</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* Transcript */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Разговор</Typography>
          <Paper sx={{ p: 2, maxHeight: 500, overflow: 'auto' }}>
            {conversation.length === 0 ? (
              <Typography color="text.secondary">Нет данных о разговоре</Typography>
            ) : (
              conversation.map((msg, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    mb: 1.5,
                    justifyContent: msg.speaker === 'salesman' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '80%',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      bgcolor: msg.speaker === 'salesman' ? '#3b82f6' : '#f3f4f6',
                      color: msg.speaker === 'salesman' ? '#fff' : '#1f2937',
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.7, mb: 0.25, display: 'block' }}>
                      {msg.speaker === 'salesman' ? 'Виталий' : call.contact?.name || 'Клиент'}
                    </Typography>
                    <Typography variant="body2">{msg.text}</Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Quality + Summary */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Оценка качества</Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            {quality.script_adherence != null ? (
              <>
                <QualityRow label="Следование скрипту" score={quality.script_adherence} />
                <QualityRow label="Обработка возражений" score={quality.objection_handling} />
                <QualityRow label="Вежливость" score={quality.politeness} />
                <QualityRow label="Достижение цели" score={quality.goal_achievement} />
                <QualityRow label="Вовлечение" score={quality.engagement} />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Детальная оценка недоступна
              </Typography>
            )}
          </Paper>

          {call.summary && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>Саммари</Typography>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2">{call.summary}</Typography>
              </Paper>
            </>
          )}

          {call.script_stage && (
            <Card sx={{ mt: 2 }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary">Этап скрипта</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{call.script_stage}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

function QualityRow({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Typography variant="body2" sx={{ flex: 1, minWidth: 140 }}>{label}</Typography>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={score}
          sx={{
            height: 6, borderRadius: 3,
            bgcolor: '#e5e7eb',
            '& .MuiLinearProgress-bar': { bgcolor: color },
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 28, textAlign: 'right', color }}>
        {Math.round(score)}
      </Typography>
    </Box>
  );
}
