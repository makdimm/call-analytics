import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCalls, getCall } from '../../api/client';
import type { Call } from '../../types';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, TablePagination, CircularProgress, Dialog, DialogTitle,
  DialogContent, IconButton, Grid, alpha,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageSize = 20;

  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) getCall(Number(selectedId)).then(setSelectedCall).catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    getCalls({ page: page + 1, page_size: pageSize })
      .then((data) => { setCalls(data.items); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const statusStyle = (s: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      analyzed: { bg: 'rgba(0,206,201,0.15)', color: '#00cec9', label: 'Готов' },
      failed: { bg: 'rgba(255,118,117,0.15)', color: '#ff7675', label: 'Ошибка' },
      processing: { bg: 'rgba(108,92,231,0.15)', color: '#a29bfe', label: 'Обработка...' },
      transcribed: { bg: 'rgba(253,203,110,0.15)', color: '#fdcb6e', label: 'Расшифрован' },
      uploaded: { bg: 'rgba(255,255,255,0.08)', color: alpha('#fff', 0.5), label: 'Загружен' },
    };
    return map[s] || { bg: 'rgba(255,255,255,0.08)', color: alpha('#fff', 0.5), label: s };
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', mb: 0.5 }}>Звонки</Typography>
        <Typography variant="body2" sx={{ color: alpha('#fff', 0.4) }}>
          {total} звонков · {calls.filter((c) => c.status === 'analyzed').length} проанализировано
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#6C5CE7' }} /></Box>
      ) : (
        <Paper sx={{
          borderRadius: 3, overflow: 'hidden',
          background: 'rgba(18,18,48,0.6)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Файл', 'Менеджер', 'Длит.', 'Статус', 'Скрипт', 'Оценка', 'Дата'].map((h) => (
                    <TableCell key={h} sx={{ color: alpha('#fff', 0.4), borderColor: 'rgba(255,255,255,0.06)', fontSize: 12, fontWeight: 500 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {calls.map((call) => {
                  const st = statusStyle(call.status);
                  return (
                    <TableRow
                      key={call.id} hover
                      sx={{ cursor: 'pointer', '&:hover': { background: 'rgba(255,255,255,0.03)' }, '& td': { borderColor: 'rgba(255,255,255,0.04)' } }}
                      onClick={() => { setSelectedCall(call); setSearchParams({ selected: String(call.id) }); }}
                    >
                      <TableCell sx={{ color: '#fff', fontSize: 13 }}>{call.original_filename}</TableCell>
                      <TableCell sx={{ color: alpha('#fff', 0.7), fontSize: 13 }}>{call.manager_name || `#${call.manager_id}`}</TableCell>
                      <TableCell sx={{ color: alpha('#fff', 0.5), fontSize: 13 }}>{call.duration_seconds ? `${Math.round(call.duration_seconds)}с` : '-'}</TableCell>
                      <TableCell>
                        <Chip label={st.label} size="small" sx={{ height: 22, fontSize: 11, fontWeight: 500, background: st.bg, color: st.color }} />
                      </TableCell>
                      <TableCell>
                        {call.script_compliance && (
                          <Chip
                            label={call.script_compliance === 'compliant' ? '✓' : call.script_compliance === 'partial' ? '~' : '✗'}
                            size="small"
                            sx={{ height: 22, minWidth: 28, fontSize: 12, fontWeight: 600, background: call.script_compliance === 'compliant' ? 'rgba(0,206,201,0.15)' : 'rgba(253,203,110,0.15)', color: call.script_compliance === 'compliant' ? '#00cec9' : '#fdcb6e' }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ color: call.compliance_score != null && call.compliance_score >= 70 ? '#00cec9' : call.compliance_score != null ? '#fdcb6e' : alpha('#fff', 0.3), fontSize: 13, fontWeight: 600 }}>
                        {call.compliance_score != null ? `${Math.round(call.compliance_score)}%` : '-'}
                      </TableCell>
                      <TableCell sx={{ color: alpha('#fff', 0.4), fontSize: 12 }}>{new Date(call.created_at).toLocaleDateString('ru')}</TableCell>
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
            rowsPerPage={pageSize}
            rowsPerPageOptions={[pageSize]}
            sx={{ color: alpha('#fff', 0.5), borderColor: 'rgba(255,255,255,0.06)' }}
          />
        </Paper>
      )}

      {/* Detail dialog */}
      <Dialog
        open={!!selectedCall} onClose={() => { setSelectedCall(null); setSearchParams({}); }}
        maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, background: 'rgba(18,18,48,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' } } }}
      >
        {selectedCall && (
          <>
            <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {selectedCall.original_filename}
              <IconButton onClick={() => { setSelectedCall(null); setSearchParams({}); }} sx={{ position: 'absolute', right: 8, top: 8, color: alpha('#fff', 0.4) }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ py: 3 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), display: 'block', mb: 0.5 }}>Менеджер</Typography>
                  <Typography sx={{ color: '#fff', fontSize: 14 }}>{selectedCall.manager_name}</Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), display: 'block', mb: 0.5 }}>Статус</Typography>
                  <Chip label={statusStyle(selectedCall.status).label} size="small" sx={{ height: 22, fontSize: 11, background: statusStyle(selectedCall.status).bg, color: statusStyle(selectedCall.status).color }} />
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), display: 'block', mb: 0.5 }}>Оценка</Typography>
                  <Typography sx={{ color: selectedCall.compliance_score != null && selectedCall.compliance_score >= 70 ? '#00cec9' : '#fdcb6e', fontSize: 18, fontWeight: 700 }}>
                    {selectedCall.compliance_score != null ? `${Math.round(selectedCall.compliance_score)}%` : '-'}
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), display: 'block', mb: 0.5 }}>Длительность</Typography>
                  <Typography sx={{ color: '#fff', fontSize: 14 }}>{selectedCall.duration_seconds ? `${Math.round(selectedCall.duration_seconds)}с` : '-'}</Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), display: 'block', mb: 0.5 }}>Скрипт</Typography>
                  {selectedCall.script_compliance && (
                    <Chip
                      label={selectedCall.script_compliance === 'compliant' ? 'По скрипту' : selectedCall.script_compliance === 'partial' ? 'Частично' : 'Не по скрипту'}
                      size="small" sx={{ height: 22, fontSize: 11, background: selectedCall.script_compliance === 'compliant' ? 'rgba(0,206,201,0.15)' : 'rgba(253,203,110,0.15)', color: selectedCall.script_compliance === 'compliant' ? '#00cec9' : '#fdcb6e' }}
                    />
                  )}
                </Grid>
                <Grid size={4}>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), display: 'block', mb: 0.5 }}>Речь менеджера</Typography>
                  <Typography sx={{ color: '#fff', fontSize: 14 }}>{selectedCall.talk_ratio != null ? `${Math.round(selectedCall.talk_ratio)}%` : '-'}</Typography>
                </Grid>
              </Grid>

              {selectedCall.analysis?.summary && (
                <Box sx={{ mb: 2, p: 2.5, borderRadius: 2, background: 'rgba(108,92,231,0.08)', border: '1px solid rgba(108,92,231,0.15)' }}>
                  <Typography variant="caption" sx={{ color: alpha('#a29bfe', 0.7), display: 'block', mb: 0.5, fontWeight: 600 }}>Саммари</Typography>
                  <Typography sx={{ color: '#fff', fontSize: 14 }}>{selectedCall.analysis.summary}</Typography>
                </Box>
              )}

              {selectedCall.transcript && (
                <Box>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.4), display: 'block', mb: 1, fontWeight: 500 }}>Транскрипция</Typography>
                  <Paper sx={{
                    p: 2.5, maxHeight: 300, overflow: 'auto', borderRadius: 2,
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), whiteSpace: 'pre-wrap', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.7 }}>
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
