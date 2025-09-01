import { Box, Card, CardContent, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/auth/authSlice";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { email } = location.state || {};
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  if (!email) {
    navigate("/signup");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setSnack({ open: true, message: "Enter OTP", severity: "error" });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      if (res.data?.success) {
        localStorage.setItem("token", res.data.token);
        dispatch(setUser(res.data));
        setSnack({ open: true, message: "Email verified — welcome!", severity: "success" });
        navigate("/");
      } else {
        setSnack({ open: true, message: res.data?.message || "OTP verification failed", severity: "error" });
      }
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "OTP is invalid or expired", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card sx={{ width: 420, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}>Verify your email</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: "center" }}>
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below to complete signup.
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} fullWidth sx={{ mb: 3 }} />
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? "Verifying..." : "Verify & continue"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
