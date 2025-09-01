import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function ConfirmDialog({ open, title, description, confirmText="Confirm", cancelText="Cancel", onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      {description && (
        <DialogContent>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose} variant="outlined">{cancelText}</Button>
        <Button onClick={onConfirm} variant="contained" color="error">{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
}
