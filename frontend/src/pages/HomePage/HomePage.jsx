import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Skeleton,
  Pagination,
  Chip,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import axiosInstance from "../../api/axiosInstance";
import EventCard from "../../components/EventCard/EventCard";
import SearchFilter from "../../components/SearchFilter/SearchFilter";

const LoadingSkeletons = () => (
  <Grid container spacing={3}>
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
        <Skeleton variant="rectangular" height={300} />
      </Grid>
    ))}
  </Grid>
);

const EmptyState = ({ searchValue, selectedTag, timeFilter }) => {
  const getEmptyStateMessage = useCallback(() => {
    if (searchValue || selectedTag) {
      return "Try adjusting your search or filter criteria";
    }
    
    switch (timeFilter) {
      case "today":
        return "No events happening today. Check upcoming events!";
      case "past":
        return "No past events found. Create the first event in your area!";
      case "all":
        return "No events found. Be the first to create an event!";
      default:
        return "Be the first to create an event in your area!";
    }
  }, [searchValue, selectedTag, timeFilter]);

  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <EventIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
      <Typography variant="h5" gutterBottom color="text.secondary">
        No events found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {getEmptyStateMessage()}
      </Typography>
      <Button 
        variant="contained" 
        size="large"
        onClick={() => window.location.href = "/create-event"}
      >
        Create Your First Event
      </Button>
    </Box>
  );
};

const HeroSection = () => (
  <Box
    sx={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      py: 6,
      mb: 4,
    }}
  >
    <Container>
      <Box sx={{ textAlign: "center", maxWidth: 800, mx: "auto" }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Discover Amazing Events
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Join workshops, meetups, conferences, and social gatherings in your area
        </Typography>
        
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EventIcon />
            <Typography variant="body2">Workshops & Meetups</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOnIcon />
            <Typography variant="body2">Local Events</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <GroupIcon />
            <Typography variant="body2">Community Building</Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
);

export default function HomePage() {
  // Local state management - moved from App.jsx
  const [searchValue, setSearchValue] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [timeFilter, setTimeFilter] = useState("upcoming");
  const [tags, setTags] = useState(["tech", "mern", "fun", "educational", "social-cause"]);
  
  // Component-specific state
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const filteredEvents = useMemo(() => {
    if (!events.length) return [];

    switch (timeFilter) {
      case "today":
        return events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        });
      case "upcoming":
        return events.filter(event => new Date(event.date) > now);
      case "past":
        return events.filter(event => new Date(event.date) < now);
      default:
        return events;
    }
  }, [events, timeFilter, now, today]);

  const searchFilteredEvents = useMemo(() => {
    if (!searchValue.trim()) return filteredEvents;
    
    const searchLower = searchValue.toLowerCase();
    return filteredEvents?.filter(event => 
      event.title?.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }, [filteredEvents, searchValue]);

  const tagFilteredEvents = useMemo(() => {
    if (!selectedTag) return searchFilteredEvents;
    return searchFilteredEvents.filter(event => 
      event.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
    );
  }, [searchFilteredEvents, selectedTag]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(searchValue && { search: searchValue }),
        ...(selectedTag && { tags: selectedTag }),
        ...(timeFilter !== "all" && { timeFilter })
      });

      const response = await axiosInstance.get(`/events?${params}`);
      const { events: fetchedEvents, total, page: currentPage, limit } = response.data;
      
      setEvents(fetchedEvents);
      setTotalPages(Math.ceil(total / limit));
      setTotalEvents(total);

      const uniqueTags = new Set();
      fetchedEvents.forEach(event => {
        event.tags?.forEach(tag => uniqueTags.add(tag));
      });
      setTags(Array.from(uniqueTags));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [page, searchValue, selectedTag, timeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setSelectedTag(null);
    setTimeFilter("upcoming");
  };

  return (
    <Box>
      <HeroSection />
      
      <Container sx={{ mb: 6 }}>
        <SearchFilter
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          timeFilter={timeFilter}
          onTimeFilterChange={setTimeFilter}
          tags={tags}
          onClearFilters={handleClearFilters}
          totalEvents={totalEvents}
        />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">
           Total {tagFilteredEvents.length} events found.
          </Typography>
        </Box>

        {loading ? (
          <LoadingSkeletons />
        ) : tagFilteredEvents.length === 0 ? (
          <EmptyState 
            searchValue={searchValue} 
            selectedTag={selectedTag} 
            timeFilter={timeFilter} 
          />
        ) : (
          <>
            <Grid container spacing={3}>
              {tagFilteredEvents.map((event) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event._id}>
                  <EventCard event={event} />
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
