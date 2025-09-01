import { Box, Typography, Button } from "@mui/material";

export default function EmptyState({ title, subtitle, actionText, onAction }) {
  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Typography variant="h5" gutterBottom>{title}</Typography>
      {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{subtitle}</Typography>}
      {actionText && <Button variant="contained" onClick={onAction}>{actionText}</Button>}
    </Box>
  );
}
