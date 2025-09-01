import { memo, useMemo } from "react";
import { Card, CardContent, CardActions, Typography, Button, Box, Chip } from "@mui/material";

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
