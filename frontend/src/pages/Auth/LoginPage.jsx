import { Box, Card, CardContent, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/auth/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setSnack({ open: true, message: "Fill both fields", severity: "error" });
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.post("/auth/login", { email: form.email, password: form.password });
      if (res.data?.success) {
        localStorage.setItem("token", res.data.token);
        dispatch(setUser(res.data));
        setSnack({ open: true, message: "Login successful", severity: "success" });
        navigate("/");
      } else {
        setSnack({ open: true, message: res.data?.message || "Login failed", severity: "error" });
      }
    } catch (err) {
      setSnack({ open: true, message: err.response?.data?.message || "Invalid credentials", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card sx={{ width: 420, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}>Login</Typography>
          <form onSubmit={handleSubmit}>
            <TextField label="Email" name="email" fullWidth sx={{ mb: 2 }} value={form.email} onChange={handleChange} />
            <TextField label="Password" name="password" type="password" fullWidth sx={{ mb: 3 }} value={form.password} onChange={handleChange} />
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <Typography sx={{ mt: 2, textAlign: "center", color: "primary.main", cursor: "pointer" }} onClick={() => navigate("/signup")}>
            Create an account
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
