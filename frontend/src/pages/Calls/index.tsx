import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCalls, getCall } from '../../api/client';
import type { Call } from '../../types';
import { useWebSocket } from '../../contexts/WebSocketContext';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, TablePagination, CircularProgress, Dialog, DialogTitle,
  DialogContent, IconButton, Grid, LinearProgress,
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
                  <TableCell>Длит.</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Прогресс</TableCell>
                  <TableCell>Скрипт</TableCell>
                  <TableCell>Оценка</TableCell>
                  <TableCell>Дата</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calls.map((call) => {
                  const st = statusStyle(call.status);
                  const prog = callProgress.get(call.id);
                  const isProcessing = call.status === 'processing';
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
                      <TableCell sx={{ color: '#6b7280' }}>
                        {call.duration_seconds ? `${Math.round(call.duration_seconds)}с` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip label={st.label} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: st.bg, color: st.color }} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        {isProcessing ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={prog?.progress ?? 0}
                                sx={{
                                  height: 4, borderRadius: 2,
                                  bgcolor: '#e5e7eb',
                                  '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 2 },
                                }}
                              />
                            </Box>
                            <Typography sx={{ fontSize: 11, color: '#6b7280', minWidth: 28, textAlign: 'right' }}>
                              {prog?.progress ?? 0}%
                            </Typography>
                          </Box>
                        ) : call.status === 'analyzed' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={100}
                                sx={{ height: 4, borderRadius: 2, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 2 } }}
                              />
                            </Box>
                            <Typography sx={{ fontSize: 11, color: '#10b981', minWidth: 28, textAlign: 'right' }}>100%</Typography>
                          </Box>
                        ) : call.status === 'failed' ? (
                          <Typography sx={{ fontSize: 12, color: '#ef4444' }}>—</Typography>
                        ) : (
                          <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>—</Typography>
                        )}
                        {isProcessing && prog?.stage && (
                          <Typography sx={{ fontSize: 11, color: '#6b7280', mt: 0.25 }}>{prog.stage}</Typography>
                        )}
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
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Менеджер</Typography>
                  <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{selectedCall.manager_name}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Статус</Typography>
                  <Chip label={statusStyle(selectedCall.status).label} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: statusStyle(selectedCall.status).bg, color: statusStyle(selectedCall.status).color }} />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Оценка</Typography>
                  <Typography sx={{ fontSize: 22, fontWeight: 700, color: selectedCall.compliance_score != null && selectedCall.compliance_score >= 70 ? '#10b981' : selectedCall.compliance_score != null && selectedCall.compliance_score >= 40 ? '#f59e0b' : selectedCall.compliance_score != null ? '#ef4444' : '#9ca3af' }}>
                    {selectedCall.compliance_score != null ? `${Math.round(selectedCall.compliance_score)}%` : '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Длительность</Typography>
                  <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{selectedCall.duration_seconds ? `${Math.round(selectedCall.duration_seconds)}с` : '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Скрипт</Typography>
                  {selectedCall.script_compliance && (
                    <Chip
                      label={selectedCall.script_compliance === 'compliant' ? 'По скрипту' : selectedCall.script_compliance === 'partial' ? 'Частично' : 'Не по скрипту'}
                      size="small"
                      sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: selectedCall.script_compliance === 'compliant' ? '#ecfdf5' : selectedCall.script_compliance === 'partial' ? '#fffbeb' : '#fef2f2', color: selectedCall.script_compliance === 'compliant' ? '#10b981' : selectedCall.script_compliance === 'partial' ? '#f59e0b' : '#ef4444' }}
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>Речь менеджера</Typography>
                  <Typography sx={{ fontSize: 14, color: '#1f2937' }}>{selectedCall.talk_ratio != null ? `${Math.round(selectedCall.talk_ratio)}%` : '-'}</Typography>
                </Grid>
              </Grid>

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

              {selectedCall.analysis?.summary && (
                <Box sx={{ mb: 2.5, p: 2.5, borderRadius: 2, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#0369a1', mb: 0.5 }}>Саммари</Typography>
                  <Typography sx={{ fontSize: 14, color: '#1f2937', lineHeight: 1.6 }}>{selectedCall.analysis.summary}</Typography>
                </Box>
              )}

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
