import { useState, useEffect } from "react";
import { Container, Box, Tabs, Tab, Grid, Button, Snackbar, Alert } from "@mui/material";
import EventCard from "../../components/EventCard/EventCard";
import EmptyState from "../../components/EmptyState/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
// import Loader from "../../components/Loader/Loader";
import axiosInstance from "../../api/axiosInstance";

export default function DashboardPage() {
  const [tab, setTab] = useState(0);
  const [created, setCreated] = useState([]);
  const [joined, setJoined] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [confirm, setConfirm] = useState({ open: false, eventId: null });

  useEffect(() => {
    fetchMe();
  }, []);

  async function fetchMe() {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/users/me");
      setCreated(res.data.createdEvents || []);
      setJoined(res.data.joinedEvents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEvent(eventId) {
    try {
      await axiosInstance.delete(`/events/${eventId}`);
      setCreated((list) => list.filter((e) => e._id !== eventId));
      setSnack({ open: true, message: "Event deleted", severity: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete";
      setSnack({ open: true, message: msg, severity: "error" });
    } finally {
      setConfirm({ open: false, eventId: null });
    }
  }

  const renderCreated = () => {
    if (loading) return "Loading";
    if (!created.length) return <EmptyState title="You haven't created any events yet" actionText="Create Event" onAction={() => (window.location.href="/create-event")} />;
    return (
      <Grid container spacing={3}>
        {created.map((event) => (
          <Grid key={event._id} size={{ xs: 12, sm: 6, md: 4 }}>
            <EventCard
              event={{ ...event, location: { formattedAddress: event.location?.formattedAddress || "-" }, tags: event.tags || [] }}
              actions={
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" size="small" onClick={() => (window.location.href = `/events/${event._id}`)}>Open</Button>
                  <Button variant="contained" color="error" size="small" onClick={() => setConfirm({ open: true, eventId: event._id })}>Delete</Button>
                </Box>
              }
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderJoined = () => {
    if (loading) return <Loader />;
    if (!joined.length) return <EmptyState title="No joined events yet" subtitle="Join events from the home page." actionText="Browse Events" onAction={() => (window.location.href="/")} />;
    return (
      <Grid container spacing={3}>
        {joined.map((event) => (
          <Grid key={event._id} size={{ xs: 12, sm: 6, md: 4 }}>
            <EventCard
              event={{ ...event, location: { formattedAddress: event.location?.formattedAddress || "-" }, tags: event.tags || [] }}
              actions={
                <Button variant="outlined" size="small" onClick={() => (window.location.href = `/events/${event._id}`)}>Open</Button>
              }
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Created" />
          <Tab label="Joined" />
        </Tabs>
      </Box>

      <Box hidden={tab !== 0}>{renderCreated()}</Box>
      <Box hidden={tab !== 1}>{renderJoined()}</Box>

      <ConfirmDialog
        open={confirm.open}
        title="Delete this event?"
        description="This cannot be undone."
        onClose={() => setConfirm({ open: false, eventId: null })}
        onConfirm={() => deleteEvent(confirm.eventId)}
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
