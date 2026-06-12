import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCalls, getCall } from '../../api/client';
import type { Call } from '../../types';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, TablePagination, CircularProgress, Dialog, DialogTitle,
  DialogContent, IconButton, Grid,
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
    if (selectedId) {
      getCall(Number(selectedId)).then(setSelectedCall).catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    getCalls({ page: page + 1, page_size: pageSize })
      .then((data) => { setCalls(data.items); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const statusColor = (s: string) => {
    switch (s) {
      case 'analyzed': return 'success';
      case 'failed': return 'error';
      case 'processing': case 'transcribed': return 'info';
      default: return 'default';
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'uploaded': return 'Загружен';
      case 'processing': return 'Обработка...';
      case 'transcribed': return 'Расшифрован';
      case 'analyzed': return 'Готов';
      case 'failed': return 'Ошибка';
      default: return s;
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>Звонки</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
      ) : (
        <Paper sx={{ background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Файл</TableCell>
                  <TableCell>Менеджер</TableCell>
                  <TableCell>Длительность</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Скрипт</TableCell>
                  <TableCell>Оценка</TableCell>
                  <TableCell>Дата</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calls.map((call) => (
                  <TableRow
                    key={call.id} hover sx={{ cursor: 'pointer' }}
                    onClick={() => { setSelectedCall(call); setSearchParams({ selected: String(call.id) }); }}
                  >
                    <TableCell>{call.original_filename}</TableCell>
                    <TableCell>{call.manager_name || `#${call.manager_id}`}</TableCell>
                    <TableCell>{call.duration_seconds ? `${Math.round(call.duration_seconds)}с` : '-'}</TableCell>
                    <TableCell>
                      <Chip label={statusLabel(call.status)} size="small" color={statusColor(call.status)} />
                    </TableCell>
                    <TableCell>
                      {call.script_compliance && (
                        <Chip
                          label={call.script_compliance === 'compliant' ? 'По скрипту' : call.script_compliance === 'partial' ? 'Частично' : 'Не по скрипту'}
                          size="small"
                          color={call.script_compliance === 'compliant' ? 'success' : call.script_compliance === 'partial' ? 'warning' : 'error'}
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
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[pageSize]}
          />
        </Paper>
      )}

      {/* Call detail dialog */}
      <Dialog open={!!selectedCall} onClose={() => { setSelectedCall(null); setSearchParams({}); }} maxWidth="md" fullWidth>
        {selectedCall && (
          <>
            <DialogTitle>
              {selectedCall.original_filename}
              <IconButton onClick={() => { setSelectedCall(null); setSearchParams({}); }} sx={{ position: 'absolute', right: 8, top: 8 }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={4}><Typography variant="body2" color="grey.500">Менеджер</Typography><Typography>{selectedCall.manager_name}</Typography></Grid>
                <Grid size={4}><Typography variant="body2" color="grey.500">Статус</Typography><Chip label={statusLabel(selectedCall.status)} size="small" color={statusColor(selectedCall.status)} /></Grid>
                <Grid size={4}><Typography variant="body2" color="grey.500">Оценка</Typography><Typography>{selectedCall.compliance_score != null ? `${Math.round(selectedCall.compliance_score)}%` : '-'}</Typography></Grid>
                <Grid size={4}><Typography variant="body2" color="grey.500">Длительность</Typography><Typography>{selectedCall.duration_seconds ? `${Math.round(selectedCall.duration_seconds)}с` : '-'}</Typography></Grid>
                <Grid size={4}><Typography variant="body2" color="grey.500">Скрипт</Typography>
                  {selectedCall.script_compliance && (
                    <Chip
                      label={selectedCall.script_compliance === 'compliant' ? 'По скрипту' : selectedCall.script_compliance === 'partial' ? 'Частично' : 'Не по скрипту'}
                      size="small" color={selectedCall.script_compliance === 'compliant' ? 'success' : 'warning'}
                    />
                  )}
                </Grid>
                <Grid size={4}><Typography variant="body2" color="grey.500">Соотношение речи</Typography><Typography>{selectedCall.talk_ratio != null ? `${Math.round(selectedCall.talk_ratio)}%` : '-'}</Typography></Grid>
              </Grid>

              {selectedCall.analysis?.summary && (
                <Box sx={{ mb: 2, p: 2, background: '#0d0d1a', borderRadius: 2 }}>
                  <Typography variant="body2" color="grey.500" gutterBottom>Саммари</Typography>
                  <Typography>{selectedCall.analysis.summary}</Typography>
                </Box>
              )}

              {selectedCall.transcript && (
                <Box>
                  <Typography variant="body2" color="grey.500" gutterBottom>Транскрипция</Typography>
                  <Paper sx={{ p: 2, background: '#0d0d1a', maxHeight: 300, overflow: 'auto', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13 }}>
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
