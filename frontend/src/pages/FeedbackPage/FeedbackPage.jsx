import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import StarRating from "../../components/StarRating/StarRating";
import axiosInstance from "../../api/axiosInstance";

export default function FeedbackPage() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canProvideFeedback, setCanProvideFeedback] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [formData, setFormData] = useState({
    hostRating: 0,
    eventRating: 0,
    hostFeedback: "",
    eventExperience: "",
  });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    validateFeedbackAccess();
  }, [eventId, token]);

  const validateFeedbackAccess = async () => {
    try {
      setLoading(true);

      if (token) {
        const tokenRes = await axiosInstance.post("/feedback/validate-token", { token });
        setEventDetails(tokenRes.data);
        setCanProvideFeedback(true);
      } else {
        const attendanceRes = await axiosInstance.get(`/feedback/${eventId}/validate-attendance`);
        setEventDetails(attendanceRes.data);
        setCanProvideFeedback(true);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Unable to access feedback form";
      setSnack({ open: true, message, severity: "error" });
      setTimeout(() => navigate("/"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (type, value) => {
    setFormData(prev => ({ ...prev, [type]: value }));
  };

  const handleTextChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.hostRating === 0 || formData.eventRating === 0) {
      setSnack({ open: true, message: "Please provide ratings for both host and event", severity: "error" });
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        eventId,
        hostRating: formData.hostRating,
        eventRating: formData.eventRating,
        hostFeedback: formData.hostFeedback,
        eventExperience: formData.eventExperience,
        ...(token && { token })
      };

      await axiosInstance.post("/feedback/submit", payload);

      setSnack({ open: true, message: "Feedback submitted successfully!", severity: "success" });
      setTimeout(() => navigate(`/events/${eventId}`), 2000);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to submit feedback";
      setSnack({ open: true, message, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!canProvideFeedback) {
    return (
      <Container sx={{ textAlign: "center", mt: 6 }}>
        <Alert severity="error">You cannot provide feedback for this event.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, boxShadow: 4, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Share Your Experience
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          We'd love to hear about your experience at "{eventDetails?.eventTitle || "this event"}".
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Rate the Host
            </Typography>
            <Box sx={{ mb: 2 }}>
              <StarRating
                rating={formData.hostRating}
                onChange={(value) => handleRatingChange("hostRating", value)}
                maxRating={5}
                size="large"
              />
            </Box>
            <TextField
              label="Host Feedback (optional)"
              multiline
              rows={3}
              fullWidth
              value={formData.hostFeedback}
              onChange={handleTextChange("hostFeedback")}
              placeholder="Share your thoughts about the host..."
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Rate the Event
            </Typography>
            <Box sx={{ mb: 2 }}>
              <StarRating
                rating={formData.eventRating}
                onChange={(value) => handleRatingChange("eventRating", value)}
                maxRating={5}
                size="large"
              />
            </Box>
            <TextField
              label="Event Experience (optional)"
              multiline
              rows={4}
              fullWidth
              value={formData.eventExperience}
              onChange={handleTextChange("eventExperience")}
              placeholder="Tell us about your overall experience..."
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/events/${eventId}`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </Box>
        </form>
      </Paper>

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
    </Container>
  );
}
