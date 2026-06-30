import { Paper, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
}

export default function StatCard({ title, value, subtitle, icon, color }: Props) {
  const accent = color || '#3b82f6';

  return (
    <Paper sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1f2937', lineHeight: 1.1, mb: subtitle ? 0.25 : 0 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box sx={{
            p: 1, borderRadius: 1.5, bgcolor: '#f3f4f6', color: accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, ml: 1,
          }}>
            {icon}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
