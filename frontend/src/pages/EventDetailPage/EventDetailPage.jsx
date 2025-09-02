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
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar,
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

  // Helper function to check if event is completed (past event)
  const isEventCompleted = (eventDate) => {
    if (!eventDate) return false;
    return new Date(eventDate) < new Date();
  };

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
        <CircularProgress size={60} />
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 4, md: 5 }, 
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            {event.title}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              maxWidth: '800px',
              lineHeight: 1.6
            }}
          >
            {event.description}
          </Typography>
        </Box>
        
        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {user && event.organizerId === user.id ? (
            <>
              <Button
                variant="contained"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                    border: '1px solid rgba(255,255,255,0.5)',
                  }
                }}
                onClick={() => navigate(`/events/${id}/edit`)}
                disabled={mutating}
              >
                Edit Event
              </Button>
              <Button
                variant="contained"
                sx={{ 
                  bgcolor: 'rgba(220,53,69,0.9)',
                  '&:hover': { bgcolor: 'rgba(220,53,69,1)' }
                }}
                onClick={() => setConfirmOpen(true)}
                disabled={mutating}
              >
                Delete Event
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              size="large"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.9)',
                color: '#667eea',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                },
                transition: 'all 0.3s ease'
              }}
              onClick={handleJoinLeave}
              disabled={mutating}
            >
              {event.joined ? "Leave Event" : "Join Event"}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Event Details Grid */}
      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Event Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Date & Time
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.date).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Location
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {event.location?.formattedAddress || "Location TBA"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Category
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {event.category || "General Event"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Duration
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {event.duration || 60} minutes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Capacity
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {event.capacity || "Unlimited"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Entry Fee
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: event.entryFee?.isFree ? '#28a745' : '#dc3545' }}>
                      {event.entryFee?.isFree ? "Free Entry" : `$${event.entryFee?.amount || 0}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Age Restriction
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {event.ageRestriction || "All Ages Welcome"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%', bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Attendees
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#6C47FF' }}>
                      {event.attendeeCount ?? 0} people
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Event Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {event.tags.map((tag) => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      sx={{ 
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        fontWeight: 500,
                        '&:hover': {
                          bgcolor: '#bbdefb',
                          transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                      }} 
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Contact Information */}
            {event.contactPerson && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Contact Information
                </Typography>
                <Card sx={{ bgcolor: '#fff3e0', border: '1px solid #ffcc02' }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {event.contactPerson.name || "Event Organizer"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.contactPerson.email || "Contact information not available"}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Paper>

          {/* Ratings Section */}
          {isEventCompleted(event.date) && event.ratings && (
            <Paper sx={{ p: { xs: 3, sm: 4 }, mt: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Event Ratings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ textAlign: 'center', bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                    <CardContent>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#2e7d32' }}>
                        {event.ratings.averageEventRating.toFixed(1)}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        Event Rating
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.ratings.totalFeedbacks} reviews
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card sx={{ textAlign: 'center', bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
                    <CardContent>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#f57c00' }}>
                        {event.ratings.averageHostRating.toFixed(1)}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        Host Rating
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Based on attendee feedback
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Recent Experiences */}
          {isEventCompleted(event.date) && event.ratings?.experiences?.length > 0 && (
            <Paper sx={{ p: { xs: 3, sm: 4 }, mt: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Recent Experiences
              </Typography>
              {event.ratings.experiences.slice(0, 3).map((exp, index) => (
                <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#6C47FF', mr: 2 }}>
                        {exp.attendeeName?.charAt(0)?.toUpperCase() || 'A'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {exp.attendeeName || "Anonymous"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(exp.submittedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      "{exp.eventExperience}"
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'sticky', top: 24 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Event Summary
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Current Status
              </Typography>
              <Chip 
                label={event.joined ? "You're Attending" : "Open for Registration"} 
                sx={{ 
                  bgcolor: event.joined ? '#e8f5e8' : '#e3f2fd',
                  color: event.joined ? '#2e7d32' : '#1976d2',
                  fontWeight: 600
                }} 
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                {user && event.organizerId === user.id ? (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/events/${id}/edit`)}
                    disabled={mutating}
                    sx={{ py: 1.5 }}
                  >
                    Edit Event Details
                  </Button>
                ) : (
                  <Button
                    variant={event.joined ? "outlined" : "contained"}
                    fullWidth
                    onClick={handleJoinLeave}
                    disabled={mutating}
                    sx={{ py: 1.5 }}
                  >
                    {event.joined ? "Leave Event" : "Join Event"}
                  </Button>
                )}
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Share Event
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Help spread the word about this event by sharing it with friends and family.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

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
