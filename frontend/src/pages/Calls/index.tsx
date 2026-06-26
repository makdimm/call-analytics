import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCalls, getCall } from '../../api/client';
import type { Call } from '../../types';
import { useWebSocket } from '../../contexts/WebSocketContext';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, TablePagination, CircularProgress, Dialog, DialogTitle,
  DialogContent, IconButton, Grid, LinearProgress, Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PAGE_SIZE = 20;

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  analyzed: { bg: '#ecfdf5', color: '#10b981', label: 'Готов' },
  failed: { bg: '#fef2f2', color: '#ef4444', label: 'Ошибка' },
  processing: { bg: '#eff6ff', color: '#3b82f6', label: 'Обработка...' },
  transcribed: { bg: '#fffbeb', color: '#f59e0b', label: 'Расшифрован' },
  uploaded: { bg: '#f3f4f6', color: '#6b7280', label: 'Загружен' },
};

const CALL_TYPE_LABELS: Record<string, string> = {
  new_lead: 'Новая заявка',
  acceleration: 'Ускорение',
  clarification: 'Уточнение',
  auto_answer: 'Автоответ',
};

const WARMTH_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  cold: { label: 'Холодный', color: '#6366f1', bg: '#eef2ff' },
  warm: { label: 'Теплый', color: '#f59e0b', bg: '#fffbeb' },
  hot: { label: 'Горячий', color: '#ef4444', bg: '#fef2f2' },
  non_target: { label: 'Нецелевой', color: '#9ca3af', bg: '#f3f4f6' },
};

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

const TONE_LABELS: Record<string, string> = {
  friendly: 'Дружелюбный',
  neutral: 'Нейтральный',
  pushy: 'Навязчивый',
  uncertain: 'Неуверенный',
  interested: 'Заинтересован',
  irritated: 'Раздражен',
  negative: 'Негативный',
};

function scoreColor(score: number | null | undefined): string {
  if (score == null) return '#9ca3af';
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function CriteriaBar({ label, value }: { label: string; value: number }) {
  const pct = value * 100;
  const hue = value >= 0.8 ? '#10b981' : value >= 0.4 ? '#f59e0b' : '#ef4444';
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
        <Typography sx={{ fontSize: 13, color: '#374151' }}>{label}</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: hue }}>
          {value === 1 ? 'Да' : value === 0.5 ? 'ПолуДа' : 'Нет'}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6, borderRadius: 3, bgcolor: '#e5e7eb',
          '& .MuiLinearProgress-bar': { bgcolor: hue, borderRadius: 3 },
        }}
      />
    </Box>
  );
}

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { callProgress } = useWebSocket();

  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) getCall(Number(selectedId)).then(setSelectedCall).catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    getCalls({ page: page + 1, page_size: PAGE_SIZE })
      .then((data) => { setCalls(data.items); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const closeDialog = () => {
    setSelectedCall(null);
    setSearchParams({});
  };

  const statusStyle = (s: string) => STATUS_CONFIG[s] || { bg: '#f3f4f6', color: '#6b7280', label: s };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>Звонки</Typography>
        <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
          {total} звонков · {calls.filter((c) => c.status === 'analyzed').length} проанализировано
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : (
        <Paper sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Файл</TableCell>
                  <TableCell>Менеджер</TableCell>
                  <TableCell>
                    <Tooltip title="Тип звонка: Новая заявка / Ускорение / Уточнение / Автоответ" arrow>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Тип</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>Длит.</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>
                    <Tooltip title="FG Score — итоговая оценка качества звонка. Сумма баллов по всем критериям / max × 100" arrow>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>FG</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Оценка следования скрипту продаж" arrow>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Скрипт</Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>Дата</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calls.map((call) => {
                  const st = statusStyle(call.status);
                  return (
                    <TableRow
                      key={call.id} hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => { setSelectedCall(call); setSearchParams({ selected: String(call.id) }); }}
                    >
                      <TableCell sx={{ fontWeight: 500, color: '#1f2937' }}>
                        {call.original_filename}
                      </TableCell>
                      <TableCell sx={{ color: '#4b5563' }}>
                        {call.manager_name || `#${call.manager_id}`}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={CALL_TYPE_LABELS[call.call_type || ''] || call.call_type || '-'}
                          size="small"
                          sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: '#f3f4f6', color: '#6b7280' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#6b7280' }}>
                        {call.duration_seconds ? `${Math.round(call.duration_seconds)}с` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip label={st.label} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: st.bg, color: st.color }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: scoreColor(call.fg_score) }}>
                        {call.fg_score != null ? `${Math.round(call.fg_score)}%` : '-'}
                      </TableCell>
                      <TableCell>
                        {call.script_compliance && (
                          <Chip
                            label={call.script_compliance === 'compliant' ? 'По скрипту' : call.script_compliance === 'partial' ? 'Частично' : 'Не по скрипту'}
                            size="small"
                            sx={{
                              height: 22, fontSize: 11, fontWeight: 600,
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
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={PAGE_SIZE}
            rowsPerPageOptions={[PAGE_SIZE]}
            sx={{ color: '#6b7280', borderTop: '1px solid #e5e7eb' }}
          />
        </Paper>
      )}

      {/* Detail dialog */}
      <Dialog
        open={!!selectedCall} onClose={closeDialog}
        maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2 } } }}
      >
        {selectedCall && (
          <>
            <DialogTitle sx={{ borderBottom: '1px solid #e5e7eb', pr: 6 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{selectedCall.original_filename}</Typography>
              <IconButton onClick={closeDialog} sx={{ position: 'absolute', right: 8, top: 8, color: '#9ca3af' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Менеджер</Typography>
                  <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{selectedCall.manager_name}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Статус</Typography>
                  <Chip label={statusStyle(selectedCall.status).label} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: statusStyle(selectedCall.status).bg, color: statusStyle(selectedCall.status).color }} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Tooltip title="FG Score — итоговая оценка звонка %. Сумма баллов по критериям / максимум × 100" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>FG Оценка</Typography>
                  </Tooltip>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, color: scoreColor(selectedCall.fg_score) }}>
                    {selectedCall.fg_score != null ? `${Math.round(selectedCall.fg_score)}%` : '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Tooltip title="Compliance — оценка соблюдения скрипта продаж (0-100%)" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Compliance</Typography>
                  </Tooltip>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, color: scoreColor(selectedCall.compliance_score) }}>
                    {selectedCall.compliance_score != null ? `${Math.round(selectedCall.compliance_score)}%` : '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Tooltip title="Тип звонка: Новая заявка (первичный), Ускорение (клиент в работе), Уточнение, Автоответ (нецелевой)" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Тип звонка</Typography>
                  </Tooltip>
                  <Chip label={CALL_TYPE_LABELS[selectedCall.call_type || ''] || selectedCall.call_type || '-'} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: '#f3f4f6', color: '#6b7280' }} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Tooltip title="Теплота клиента: Холодный / Теплый / Горячий / Нецелевой" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Теплота</Typography>
                  </Tooltip>
                  {selectedCall.warmth && WARMTH_LABELS[selectedCall.warmth] ? (
                    <Chip label={WARMTH_LABELS[selectedCall.warmth].label} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: WARMTH_LABELS[selectedCall.warmth].bg, color: WARMTH_LABELS[selectedCall.warmth].color }} />
                  ) : <Typography sx={{ fontSize: 14, color: '#9ca3af' }}>-</Typography>}
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Длительность</Typography>
                  <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{selectedCall.duration_seconds ? `${Math.round(selectedCall.duration_seconds)}с` : '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Tooltip title="Процент времени звонка, в течение которого говорит менеджер (а не клиент)" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Речь менеджера</Typography>
                  </Tooltip>
                  <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{selectedCall.talk_ratio != null ? `${Math.round(selectedCall.talk_ratio)}%` : '-'}</Typography>
                </Grid>
                {selectedCall.manager_tone && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Тон менеджера</Typography>
                    <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{TONE_LABELS[selectedCall.manager_tone] || selectedCall.manager_tone}</Typography>
                  </Grid>
                )}
                {selectedCall.client_tone && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Тон клиента</Typography>
                    <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{TONE_LABELS[selectedCall.client_tone] || selectedCall.client_tone}</Typography>
                  </Grid>
                )}
                {selectedCall.objection_count != null && (
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Tooltip title="Количество и типы возражений клиента, зафиксированные GPT" arrow>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Возражения</Typography>
                  </Tooltip>
                    <Typography sx={{ fontSize: 14, color: '#1f2937' }}>
                      {selectedCall.objection_count > 0 ? `${selectedCall.objection_count} шт.` : 'Нет'}
                      {selectedCall.objection_types?.length ? ` (${selectedCall.objection_types.join(', ')})` : ''}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Criteria scores */}
              {selectedCall.criteria_scores && Object.keys(selectedCall.criteria_scores).length > 0 && (
                <Box sx={{ mb: 2.5, p: 2.5, borderRadius: 2, bgcolor: '#fafafa', border: '1px solid #e5e7eb' }}>
                  <Tooltip title="Оценка каждого критерия: зелёный = ДА (1), жёлтый = ПОЛУДА (0.5), красный = НЕТ (0). Чем выше вес критерия, тем сильнее он влияет на итоговый FG" arrow>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 2 }}>
                      Оценка по критериям
                    </Typography>
                  </Tooltip>
                  <Grid container spacing={2}>
                    {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
                      const val = (selectedCall.criteria_scores as Record<string, number>)[key];
                      if (val === undefined) return null;
                      return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={key}>
                          <CriteriaBar label={label} value={val} />
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {selectedCall.status === 'processing' && (
                <Box sx={{ mb: 2.5, p: 2.5, borderRadius: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <CircularProgress size={16} sx={{ color: '#3b82f6' }} />
                    <Typography sx={{ fontSize: 13, color: '#0369a1', fontWeight: 500 }}>
                      {callProgress.get(selectedCall.id)?.stage || 'Обработка...'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={callProgress.get(selectedCall.id)?.progress ?? 0}
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 3 } }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                      {callProgress.get(selectedCall.id)?.progress ?? 0}%
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Summary */}
              {selectedCall.analysis?.summary && (
                <Box sx={{ mb: 2.5, p: 2.5, borderRadius: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#0369a1', mb: 0.5 }}>Саммари</Typography>
                  <Typography sx={{ fontSize: 14, color: '#1f2937', lineHeight: 1.6 }}>{selectedCall.analysis.summary}</Typography>
                </Box>
              )}

              {/* Strengths & Growth Areas */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {selectedCall.strengths && selectedCall.strengths.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#166534', mb: 1 }}>✅ Сильные стороны</Typography>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {selectedCall.strengths.map((s, i) => (
                          <li key={i}><Typography sx={{ fontSize: 13, color: '#166534' }}>{s}</Typography></li>
                        ))}
                      </ul>
                    </Box>
                  </Grid>
                )}
                {selectedCall.growth_areas && selectedCall.growth_areas.length > 0 && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fffbeb', border: '1px solid #fde68a' }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#92400e', mb: 1 }}>📈 Что улучшить</Typography>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {selectedCall.growth_areas.map((s, i) => (
                          <li key={i}><Typography sx={{ fontSize: 13, color: '#92400e' }}>{s}</Typography></li>
                        ))}
                      </ul>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Analysis details */}
              {selectedCall.analysis?.compliance && (
                <Box sx={{ mb: 2.5, p: 2.5, borderRadius: 2, bgcolor: '#fafafa', border: '1px solid #e5e7eb' }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#374151', mb: 1 }}>Детали анализа</Typography>
                  {selectedCall.analysis.compliance?.details && (
                    <Typography sx={{ fontSize: 13, color: '#6b7280', mb: 1 }}>{selectedCall.analysis.compliance.details}</Typography>
                  )}
                  {selectedCall.analysis.recommendations && (
                    <Box sx={{ mt: 1 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', mb: 0.5 }}>Рекомендации:</Typography>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {selectedCall.analysis.recommendations.map((r: string, i: number) => (
                          <li key={i}><Typography sx={{ fontSize: 13, color: '#6b7280' }}>{r}</Typography></li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Box>
              )}

              {/* Transcript */}
              {selectedCall.transcript && (
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1 }}>Транскрипция</Typography>
                  <Paper sx={{
                    p: 2.5, maxHeight: 300, overflow: 'auto', borderRadius: 2,
                    bgcolor: '#f9fafb', border: '1px solid #e5e7eb',
                  }}>
                    <Typography sx={{
                      color: '#374151', fontSize: 13, whiteSpace: 'pre-wrap',
                      fontFamily: '"JetBrains Mono", "Inter", monospace', lineHeight: 1.7,
                    }}>
                      {selectedCall.transcript}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
