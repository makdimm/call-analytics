import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, TextField, IconButton, CircularProgress, Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../api/client';

interface Message {
  speaker: 'salesman' | 'client';
  text: string;
}

export default function AiSalesManualChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [contactName, setContactName] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [firstLoading, setFirstLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = async () => {
    if (!contactName.trim()) return;
    setFirstLoading(true);
    setStarted(true);
    try {
      // First call: no user message, AI starts
      const { data } = await api.post('/sales/simulate/respond', {
        contact_name: contactName.trim(),
        conversation: [],
        message: 'Начни разговор',
      });
      setMessages([{ speaker: 'salesman', text: data.reply }]);
    } catch (e: any) {
      console.error(e);
      setStarted(false);
    }
    setFirstLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');

    const updatedConv = [...messages, { speaker: 'client' as const, text: userMsg }];
    setMessages(updatedConv);
    setLoading(true);

    try {
      const { data } = await api.post('/sales/simulate/respond', {
        contact_name: contactName.trim(),
        conversation: updatedConv.map(m => ({ speaker: m.speaker, text: m.text })),
        message: userMsg,
      });
      setMessages(prev => [...prev, { speaker: 'salesman', text: data.reply }]);
    } catch (e: any) {
      console.error(e);
      setMessages(prev => [...prev, { speaker: 'salesman', text: '⚠️ Ошибка связи' }]);
    }
    setLoading(false);
  };

  const reset = () => {
    setMessages([]);
    setInput('');
    setStarted(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (started) sendMessage();
      else startConversation();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/ai-sales')}><ArrowBackIcon /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4">Ручная симуляция</Typography>
          <Typography variant="body2" color="text.secondary">
            Ты — клиент, AI — Виталий из «Дикие продажи»
          </Typography>
        </Box>
        {started && (
          <Button startIcon={<RefreshIcon />} onClick={reset} color="warning" variant="outlined" size="small">
            Сбросить
          </Button>
        )}
      </Box>

      <Paper sx={{
        height: 'calc(100vh - 280px)', minHeight: 400,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Chat header */}
        {!started ? (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 2 }}>
            <SmartToyIcon sx={{ fontSize: 64, color: '#3b82f6', opacity: 0.3 }} />
            <Typography variant="h6" color="text.secondary">
              Чат с AI-продажником
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, textAlign: 'center', maxWidth: 400 }}>
              Ты играешь роль клиента. AI (Виталий) звонит тебе и ведёт скрипт продажи.
              Отвечай как настоящий клиент — соглашайся, возражай, отказывайся.
            </Typography>
            <TextField
              label="Имя клиента"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              onKeyDown={handleKeyDown}
              size="small"
              sx={{ width: 300 }}
              autoFocus
            />
            <Button
              variant="contained"
              onClick={startConversation}
              disabled={!contactName.trim() || firstLoading}
              startIcon={firstLoading ? <CircularProgress size={16} /> : <SmartToyIcon />}
            >
              {firstLoading ? 'Звоню...' : 'Начать разговор'}
            </Button>
          </Box>
        ) : (
          <>
            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f9fafb' }}>
              {messages.map((msg, i) => (
                <Box key={i} sx={{
                  display: 'flex',
                  mb: 2,
                  justifyContent: msg.speaker === 'salesman' ? 'flex-start' : 'flex-end',
                }}>
                  <Box sx={{
                    display: 'flex',
                    gap: 1,
                    maxWidth: '75%',
                    flexDirection: msg.speaker === 'salesman' ? 'row' : 'row-reverse',
                  }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: msg.speaker === 'salesman' ? '#3b82f6' : '#10b981',
                      color: '#fff', flexShrink: 0,
                    }}>
                      {msg.speaker === 'salesman' ? <SmartToyIcon sx={{ fontSize: 16 }} /> : <PersonIcon sx={{ fontSize: 16 }} />}
                    </Box>
                    <Box sx={{
                      px: 2, py: 1.5, borderRadius: 2,
                      bgcolor: msg.speaker === 'salesman' ? '#fff' : '#dcfce7',
                      border: '1px solid',
                      borderColor: msg.speaker === 'salesman' ? '#e5e7eb' : '#bbf7d0',
                    }}>
                      <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, mb: 0.25, display: 'block' }}>
                        {msg.speaker === 'salesman' ? 'Виталий (AI)' : contactName}
                      </Typography>
                      <Typography variant="body2">{msg.text}</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: '#3b82f6', color: '#fff',
                  }}>
                    <SmartToyIcon sx={{ fontSize: 16 }} />
                  </Box>
                  <Box sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: '#fff', border: '1px solid #e5e7eb' }}>
                    <CircularProgress size={16} />
                  </Box>
                </Box>
              )}
              <div ref={bottomRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb', bgcolor: '#fff' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Напиши реплику клиента..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  multiline
                  maxRows={3}
                />
                <IconButton
                  color="primary"
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
