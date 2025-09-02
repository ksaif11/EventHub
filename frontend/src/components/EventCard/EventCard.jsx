import { memo, useMemo } from "react";
import { Card, CardContent, CardActions, Typography, Button, Box, Chip, Avatar } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const EventCard = memo(({ event, actions }) => {
  const formattedDate = useMemo(() => {
    return new Date(event.date).toLocaleString();
  }, [event.date]);

  const entryFeeDisplay = useMemo(() => {
    return event.entryFee?.isFree ? "Free" : `$${event.entryFee?.amount || 0}`;
  }, [event.entryFee]);

  const displayTags = useMemo(() => {
    return event.tags?.slice(0, 3) || [];
  }, [event.tags]);

  return (
    <Card
      sx={{
        display: "flex", flexDirection: "column", height: "100%",
        boxShadow: 3, transition: "0.25s", "&:hover": { boxShadow: 6 }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>{event.title}</Typography>

        <Typography
          variant="body2"
          sx={{ mb: 2, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          color="text.secondary"
        >
          {event.description}
        </Typography>

        <Typography variant="caption" color="text.secondary">📅 {formattedDate}</Typography>
        <Box mt={0.5}>
          <Typography variant="caption" color="text.secondary">📍 {event.location?.formattedAddress || "-"}</Typography>
        </Box>
        <Box mt={0.5}>
          <Typography variant="caption" color="text.secondary">
            🏷️ {event.category || "Event"} • ⏱️ {event.duration || 60}min • 💰 {entryFeeDisplay}
          </Typography>
        </Box>

        {displayTags.length > 0 && (
          <Box mt={1}>
            {displayTags.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
            ))}
          </Box>
        )}

        {/* Organizer Information and Rating */}
        {event.organizer && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, bgcolor: '#6C47FF', fontSize: '0.75rem' }}>
                  {event.organizer.name?.charAt(0)?.toUpperCase() || event.organizer.email?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="caption" color="text.secondary">
                  {event.organizer.email}
                </Typography>
              </Box>
              {event.ratings && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ fontSize: 16, color: '#ffc107' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {event.ratings.averageHostRating.toFixed(1)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        {actions ? actions : (
          <Button 
            variant="contained" 
            size="small" 
            onClick={() => (window.location.href = `/events/${event._id}`)}
          >
            View Details
          </Button>
        )}
      </CardActions>
    </Card>
  );
});

EventCard.displayName = "EventCard";

export default EventCard;
