import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Snackbar, Alert } from "@mui/material";
import { hideSnackbar } from "../../features/ui/uiSlice";

export default function GlobalSnackbar() {
  const dispatch = useDispatch();
  const { snackbar } = useSelector((s) => s.ui);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    dispatch(hideSnackbar());
  };

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
    </Snackbar>
  );
}
