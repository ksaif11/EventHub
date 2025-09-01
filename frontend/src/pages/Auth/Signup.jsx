import { Box, Card, CardContent, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setSnack({ open: true, message: "All fields required", severity: "error" });
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/request-otp", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (res.data?.success) {
        setSnack({ open: true, message: "OTP sent to your email", severity: "success" });
        navigate("/verify-otp", { state: { email: form.email } });
      } else {
        setSnack({ open: true, message: res.data?.message || "Failed to send OTP", severity: "error" });
      }
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Failed to send OTP", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card sx={{ width: 420, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}>Create account</Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Full name" name="name" fullWidth sx={{ mb: 2 }} value={form.name} onChange={handleChange} />
            <TextField label="Email" name="email" fullWidth sx={{ mb: 2 }} value={form.email} onChange={handleChange} />
            <TextField label="Password" name="password" type="password" fullWidth sx={{ mb: 3 }} value={form.password} onChange={handleChange} />
            <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ py: 1.2 }}>
              {loading ? "Sending OTP..." : "Send verification OTP"}
            </Button>
          </form>
          <Typography sx={{ mt: 2, textAlign: "center", color: "primary.main", cursor: "pointer" }} onClick={() => navigate("/login")}>
            Already have an account? Login
          </Typography>
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
