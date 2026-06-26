import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCall } from '../../api/client';
import type { Call } from '../../types';
import {
  Box, Typography, Paper, Grid, Chip, CircularProgress, Button, Avatar,
  LinearProgress, Tooltip, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';

const STATUS_LABEL: Record<string, string> = {
  analyzed: 'Проанализирован',
  failed: 'Ошибка',
  processing: 'Обработка...',
  transcribed: 'Расшифрован',
  uploaded: 'Загружен',
};
const STATUS_COLOR: Record<string, string> = {
  analyzed: '#10b981', failed: '#ef4444', processing: '#3b82f6',
  transcribed: '#f59e0b', uploaded: '#6b7280',
};
const STATUS_BG: Record<string, string> = {
  analyzed: '#ecfdf5', failed: '#fef2f2', processing: '#eff6ff',
  transcribed: '#fffbeb', uploaded: '#f3f4f6',
};

const CALL_TYPE_LABELS: Record<string, string> = {
  new_lead: 'Новая заявка', acceleration: 'Ускорение',
  clarification: 'Уточнение', auto_answer: 'Автоответ',
};
const WARMTH_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  cold: { label: 'Холодный', color: '#6366f1', bg: '#eef2ff' },
  warm: { label: 'Теплый', color: '#f59e0b', bg: '#fffbeb' },
  hot: { label: 'Горячий', color: '#ef4444', bg: '#fef2f2' },
  non_target: { label: 'Нецелевой', color: '#9ca3af', bg: '#f3f4f6' },
};
const COMPLIANCE_LABEL: Record<string, string> = {
  compliant: 'По скрипту', partial: 'Частично', non_compliant: 'Не по скрипту',
};
const TONE_LABELS: Record<string, string> = {
  friendly: 'Дружелюбный', neutral: 'Нейтральный',
  pushy: 'Навязчивый', uncertain: 'Неуверенный',
  interested: 'Заинтересован', irritated: 'Раздражен', negative: 'Негативный',
};

const CRITERIA_CONFIG: Record<string, { label: string; desc: string }> = {
  greeting: { label: 'Приветствие', desc: 'Полное приветствие, имя, компания' },
  speech: { label: 'Речь', desc: 'Чёткая, без паразитов' },
  initiative: { label: 'Инициатива', desc: 'Управление диалогом' },
  programming: { label: 'Программирование', desc: 'Перехват → цель → вопрос' },
  qualification: { label: 'Квалификация', desc: 'Выявление потребностей' },
  pain: { label: 'Боль', desc: 'Вопросы на проблему клиента' },
  product: { label: 'Продукт', desc: 'Презентация с выгодами' },
  expertise: { label: 'Экспертность', desc: 'Кейсы, опыт, уверенность' },
  closing: { label: 'Закрытие', desc: 'На сделку / на шаг' },
  push: { label: 'Дожим', desc: 'Отработка возражений' },
  next_step: { label: 'След. шаг', desc: 'Дата и время касания' },
  framing: { label: 'Фрейминг', desc: 'Подстройка под клиента' },
};

function scoreColor(s: number | null | undefined): string {
  if (s == null) return '#9ca3af';
  if (s >= 70) return '#10b981';
  if (s >= 40) return '#f59e0b';
  return '#ef4444';
}

function CriteriaScoreBar({ score, label, desc }: { score: number; label: string; desc: string }) {
  const pct = score * 100;
  const color = score >= 0.8 ? '#10b981' : score >= 0.4 ? '#f59e0b' : '#ef4444';
  const grade = score === 1 ? 'Да' : score === 0.5 ? 'ПолуДа' : 'Нет';
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Tooltip title={desc} arrow>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</Typography>
        </Tooltip>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color }}>{grade}</Typography>
      </Box>
      <LinearProgress
        variant="determinate" value={pct}
        sx={{ height: 8, borderRadius: 4, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 } }}
      />
    </Box>
  );
}

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) getCall(Number(id)).then(setCall).catch(() => setError('Звонок не найден')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error || !call) return <Typography color="error" sx={{ p: 4 }}>{error || 'Ошибка'}</Typography>;

  const cs = call.criteria_scores || {};
  const a = call.analysis || {};

  return (
    <Box>
      {/* Header */}
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/calls')}
        sx={{ color: '#6b7280', mb: 2, textTransform: 'none', '&:hover': { color: '#1f2937' } }}>
        К списку звонков
      </Button>

      <Paper sx={{ p: 3, mb: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <Grid container spacing={3} sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#3b82f6', borderRadius: 1.5, width: 48, height: 48 }}>
                <PhoneIcon />
              </Avatar>
              <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                <Typography variant="h5" sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  '@media (max-width: 600px)': {
                    whiteSpace: 'normal',
                    wordBreak: 'break-all',
                    fontSize: 16,
                  },
                }}>
                  {call.original_filename}
                </Typography>
                <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
                  Менеджер: {call.manager_name || `ID ${call.manager_id}`}
                  {call.duration_seconds ? ` · ${Math.round(call.duration_seconds)}с` : ''}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { md: 'flex-end' }, flexWrap: 'wrap' }}>
              <Chip label={STATUS_LABEL[call.status] || call.status} size="small"
                sx={{ height: 26, fontSize: 12, fontWeight: 600, bgcolor: STATUS_BG[call.status] || '#f3f4f6', color: STATUS_COLOR[call.status] || '#6b7280' }} />
              {call.call_type && <Chip label={CALL_TYPE_LABELS[call.call_type] || call.call_type} size="small"
                sx={{ height: 26, fontSize: 12, fontWeight: 600, bgcolor: '#f3f4f6', color: '#6b7280' }} />}
              {call.warmth && WARMTH_LABELS[call.warmth] &&
                <Chip label={WARMTH_LABELS[call.warmth].label} size="small"
                  sx={{ height: 26, fontSize: 12, fontWeight: 600, bgcolor: WARMTH_LABELS[call.warmth].bg, color: WARMTH_LABELS[call.warmth].color }} />}
              {call.script_compliance &&
                <Chip label={COMPLIANCE_LABEL[call.script_compliance] || call.script_compliance} size="small"
                  sx={{
                    height: 26, fontSize: 12, fontWeight: 600,
                    bgcolor: call.script_compliance === 'compliant' ? '#ecfdf5' : call.script_compliance === 'partial' ? '#fffbeb' : '#fef2f2',
                    color: call.script_compliance === 'compliant' ? '#10b981' : call.script_compliance === 'partial' ? '#f59e0b' : '#ef4444',
                  }} />}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Scores row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>FG Score</Typography>
            <Typography sx={{ fontSize: 36, fontWeight: 700, color: scoreColor(call.fg_score), lineHeight: 1.2 }}>
              {call.fg_score != null ? `${Math.round(call.fg_score)}%` : '-'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.5 }}>Итоговая оценка</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Compliance</Typography>
            <Typography sx={{ fontSize: 36, fontWeight: 700, color: scoreColor(call.compliance_score), lineHeight: 1.2 }}>
              {call.compliance_score != null ? `${Math.round(call.compliance_score)}%` : '-'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.5 }}>Следование скрипту</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Речь менеджера</Typography>
            <Typography sx={{ fontSize: 36, fontWeight: 700, color: '#3b82f6', lineHeight: 1.2 }}>
              {call.talk_ratio != null ? `${Math.round(call.talk_ratio)}%` : '-'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.5 }}>% времени звонка</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #e5e7eb', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Возражения</Typography>
            <Typography sx={{ fontSize: 36, fontWeight: 700, color: call.objection_count && call.objection_count > 0 ? '#f59e0b' : '#10b981', lineHeight: 1.2 }}>
              {call.objection_count ?? 0}
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.5 }}>
              {call.objection_types?.length ? call.objection_types.join(', ') : 'нет возражений'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main content: 2 columns */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Left: Criteria */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1f2937', mb: 2.5 }}>
              Оценка по критериям
            </Typography>
            {Object.keys(cs).length > 0 ? (
              Object.entries(CRITERIA_CONFIG).map(([key, cfg]) => {
                const val = cs[key];
                if (val === undefined) return null;
                return <CriteriaScoreBar key={key} score={val} label={cfg.label} desc={cfg.desc} />;
              })
            ) : (
              <Typography sx={{ color: '#9ca3af' }}>Нет данных</Typography>
            )}
          </Paper>
        </Grid>

        {/* Right: Summary + Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2, mb: 2.5 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1f2937', mb: 2 }}>
              Детали
            </Typography>
            <Grid container spacing={2}>
              {call.manager_tone && (
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', mb: 0.25 }}>Тон менеджера</Typography>
                  <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{TONE_LABELS[call.manager_tone] || call.manager_tone}</Typography>
                </Grid>
              )}
              {call.client_tone && (
                <Grid size={{ xs: 6 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', mb: 0.25 }}>Тон клиента</Typography>
                  <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{TONE_LABELS[call.client_tone] || call.client_tone}</Typography>
                </Grid>
              )}
              {call.manager_tone && call.client_tone && <Grid size={{ xs: 12 }}><Divider /></Grid>}
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', mb: 0.25 }}>Дата звонка</Typography>
                <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{new Date(call.created_at).toLocaleString('ru')}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', mb: 0.25 }}>Обработан</Typography>
                <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{call.processed_at ? new Date(call.processed_at).toLocaleString('ru') : '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', mb: 0.25 }}>Источник</Typography>
                <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{call.source === 'upload' ? 'Загрузка' : call.source === 'google_drive' ? 'Google Drive' : call.source || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', mb: 0.25 }}>Длительность</Typography>
                <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{call.duration_seconds ? `${Math.round(call.duration_seconds)}с` : '-'}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Strengths & Growth */}
          {(call.strengths?.length || call.growth_areas?.length) && (
            <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
              <Grid container spacing={2}>
                {call.strengths && call.strengths.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#166534', mb: 1.5 }}>
                      ✅ Сильные стороны
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {call.strengths.map((s, i) => (
                        <li key={i}><Typography sx={{ fontSize: 13, color: '#374151', mb: 0.75 }}>{s}</Typography></li>
                      ))}
                    </ul>
                  </Grid>
                )}
                {call.growth_areas && call.growth_areas.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#92400e', mb: 1.5 }}>
                      📈 Что улучшить
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {call.growth_areas.map((s, i) => (
                        <li key={i}><Typography sx={{ fontSize: 13, color: '#374151', mb: 0.75 }}>{s}</Typography></li>
                      ))}
                    </ul>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Summary */}
      {a.summary && (
        <Paper sx={{ p: 3, mb: 3, border: '1px solid #bae6fd', borderRadius: 2, bgcolor: '#f0f9ff' }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#0369a1', textTransform: 'uppercase', mb: 0.75 }}>Саммари</Typography>
          <Typography sx={{ fontSize: 14, color: '#1f2937', lineHeight: 1.7 }}>{a.summary}</Typography>
        </Paper>
      )}

      {/* Compliance details */}
      {a.compliance?.details && (
        <Paper sx={{ p: 3, mb: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>Детали анализа</Typography>
          <Typography sx={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{a.compliance.details}</Typography>
          {a.recommendations && a.recommendations.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', mb: 0.5 }}>Рекомендации:</Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {a.recommendations.map((r: string, i: number) => (
                  <li key={i}><Typography sx={{ fontSize: 13, color: '#6b7280' }}>{r}</Typography></li>
                ))}
              </ul>
            </Box>
          )}
        </Paper>
      )}

      {/* Keywords */}
      {call.keywords_found && call.keywords_found.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1.5 }}>Ключевые слова</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {call.keywords_found.map((kw, i) => (
              <Chip key={i} label={kw} size="small" sx={{ bgcolor: '#f3f4f6', color: '#4b5563', fontSize: 12, fontWeight: 500, borderRadius: 1.5 }} />
            ))}
          </Box>
        </Paper>
      )}

      {/* Full transcript */}
      {call.transcript && (
        <Paper sx={{ borderRadius: 2, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb', bgcolor: '#f9fafb' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
              📝 Полная транскрипция
            </Typography>
          </Box>
          <Box sx={{ p: 3, maxHeight: 500, overflow: 'auto', bgcolor: '#fafafa' }}>
            <Typography sx={{
              fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.8,
              fontFamily: '"JetBrains Mono", "Inter", monospace',
            }}>
              {call.transcript}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
