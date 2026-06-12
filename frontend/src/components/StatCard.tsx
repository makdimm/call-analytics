import { Paper, Typography, Box, alpha } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
  gradient?: string;
}

export default function StatCard({ title, value, subtitle, icon, color = '#6C5CE7', gradient }: Props) {
  const bgGradient = gradient || `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`;

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: bgGradient,
        border: `1px solid ${alpha(color, 0.15)}`,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: alpha(color, 0.3),
          boxShadow: `0 8px 32px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="caption" sx={{ color: alpha(color, 0.7), fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff', mt: 0.5, lineHeight: 1.1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: alpha(color, 0.5), mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box sx={{
            p: 1.5, borderRadius: 2, background: alpha(color, 0.12),
            color, display: 'flex', opacity: 0.8,
          }}>
            {icon}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
