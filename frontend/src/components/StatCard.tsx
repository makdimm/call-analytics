import { Paper, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
}

export default function StatCard({ title, value, subtitle, icon, color = '#7c4dff' }: Props) {
  return (
    <Paper sx={{ p: 3, background: '#1a1a2e', borderRadius: 3, border: '1px solid #2a2a4a' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="grey.500" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="grey.500">
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && <Box sx={{ color }}>{icon}</Box>}
      </Box>
    </Paper>
  );
}
