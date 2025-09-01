import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../../api/axiosInstance";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function fetchEvent() {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/events/${id}`);
      setEvent(res.data.event);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinLeave() {
    if (!event) return;
    const joinedBefore = !!event.joined;
    try {
      setMutating(true);
      setEvent((e) => e ? { ...e, joined: !e.joined, attendeeCount: Math.max(0, (e.attendeeCount || 0) + (joinedBefore ? -1 : 1)) } : e);

      if (joinedBefore) {
        await axiosInstance.delete(`/events/${id}/leave`);
        setSnack({ open: true, message: "You left the event", severity: "info" });
      } else {
        await axiosInstance.post(`/events/${id}/join`);
        setSnack({ open: true, message: "You joined the event", severity: "success" });
      }
    } catch (err) {
      setEvent((e) => e ? { ...e, joined: joinedBefore, attendeeCount: Math.max(0, (e.attendeeCount || 0) + (joinedBefore ? 1 : -1)) } : e);
      const msg = err.response?.data?.message || "Action failed";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setMutating(false);
    }
  }

  async function handleDelete() {
    try {
      setMutating(true);
      await axiosInstance.delete(`/events/${id}`);
      setSnack({ open: true, message: "Event deleted", severity: "success" });
      setTimeout(() => navigate("/dashboard"), 400);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete event";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setMutating(false);
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!event) {
    return (
      <Container sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h6" color="error">Event not found</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/")}>Go Home</Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, boxShadow: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
          <Box>
            <Typography variant="h4" gutterBottom>{event.title}</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{event.description}</Typography>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>📅 {new Date(event.date).toLocaleString()}</Typography>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>📍 {event.location?.formattedAddress || "-"}</Typography>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>🏷️ {event.category || "Event"}</Typography>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>⏱️ {event.duration || 60} minutes</Typography>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>👥 Capacity: {event.capacity || "Unlimited"}</Typography>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              💰 {event.entryFee?.isFree ? "Free" : `$${event.entryFee?.amount || 0}`}
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>🎂 {event.ageRestriction || "All Ages"}</Typography>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              📞 Contact: {event.contactPerson?.name || "N/A"} ({event.contactPerson?.email || "N/A"})
            </Typography>
            {event.tags?.length > 0 && (
              <Box sx={{ mb: 1 }}>
                {event.tags.map((tag) => <Chip key={tag} label={tag} sx={{ mr: 0.5, mb: 0.5 }} />)}
              </Box>
            )}
            <Typography variant="caption" color="text.secondary">👥 {event.attendeeCount ?? 0} attending</Typography>
            
            {event.ratings && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  📊 Event Rating: {event.ratings.averageEventRating.toFixed(1)}/10 
                  ({event.ratings.totalFeedbacks} reviews)
                </Typography>
                <Typography variant="subtitle2">
                  👤 Host Rating: {event.ratings.averageHostRating.toFixed(1)}/10
                </Typography>
              </Box>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            {user && event.organizerId === user.id ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/events/${id}/edit`)}
                  disabled={mutating}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setConfirmOpen(true)}
                  disabled={mutating}
                >
                  Delete
                </Button>
              </>
            ) : (
              <Button
                variant={event.joined ? "outlined" : "contained"}
                onClick={handleJoinLeave}
                disabled={mutating}
              >
                {event.joined ? "Leave Event" : "Join Event"}
              </Button>
            )}
          </Stack>
        </Stack>

        {event.ratings?.experiences?.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Recent Experiences</Typography>
            {event.ratings.experiences.slice(0, 3).map((exp, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: "grey.50" }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {exp.attendeeName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {exp.eventExperience}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(exp.submittedAt).toLocaleDateString()}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this event?"
        description="This action cannot be undone."
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />

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
