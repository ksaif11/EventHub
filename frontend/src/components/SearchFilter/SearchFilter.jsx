import React from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Button,
  Paper,
  IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import EventIcon from "@mui/icons-material/Event";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";

const SearchFilter = ({
  searchValue = "",
  onSearchChange = () => {},
  tags = [],
  selectedTag = null,
  onTagChange = () => {},
  timeFilter = "all",
  onTimeFilterChange = () => {},
  onClearFilters = () => {}
}) => {
  const timeFilterOptions = [
    { value: "all", label: "All Events", icon: <AllInclusiveIcon sx={{ fontSize: 18 }} /> },
    { value: "upcoming", label: "Upcoming", icon: <EventIcon sx={{ fontSize: 18 }} /> },
    { value: "today", label: "Today", icon: <TodayIcon sx={{ fontSize: 18 }} /> },
    { value: "past", label: "Past Events", icon: <HistoryIcon sx={{ fontSize: 18 }} /> }
  ];

  const handleClearAll = () => {
    onSearchChange("");
    onTagChange(null);
    onTimeFilterChange("all");
    onClearFilters();
  };

  const hasActiveFilters = searchValue || selectedTag || timeFilter !== "all";

  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        bgcolor: "white",
        border: "1px solid #e0e0e0"
      }}
    >
      {/* Main Search and Filter Row */}
      <Box sx={{ 
        display: "flex", 
        gap: 2, 
        alignItems: "center", 
        flexWrap: { xs: "wrap", md: "nowrap" }
      }}>
        {/* Search Bar */}
        <Box sx={{ 
          position: "relative", 
          flexGrow: 1, 
          minWidth: { xs: "100%", md: 300 },
          order: { xs: 1, md: 1 }
        }}>
          <SearchIcon 
            sx={{ 
              position: "absolute", 
              left: 12, 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "text.secondary",
              zIndex: 1
            }} 
          />
          <TextField
            size="small"
            placeholder="Search events..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                pl: 5,
                borderRadius: 2,
                bgcolor: "#fafafa",
                "&:hover": {
                  bgcolor: "#f5f5f5",
                },
                "&.Mui-focused": {
                  bgcolor: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "primary.main",
                    borderWidth: 2,
                  },
                },
              },
            }}
            fullWidth
          />
        </Box>

        {/* Tag Filter Dropdown */}
        <FormControl 
          size="small" 
          sx={{ 
            minWidth: { xs: "100%", md: 200 },
            order: { xs: 2, md: 2 }
          }}
        >
          <InputLabel 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 0.5,
              color: "text.secondary"
            }}
          >
            <FilterListIcon sx={{ fontSize: 18 }} />
            Tag
          </InputLabel>
          <Select
            value={selectedTag || ""}
            onChange={(e) => onTagChange(e.target.value || null)}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <FilterListIcon sx={{ fontSize: 18 }} />
                Tag
              </Box>
            }
            sx={{
              borderRadius: 2,
              bgcolor: "#fafafa",
              "&:hover": {
                bgcolor: "#f5f5f5",
              },
              "&.Mui-focused": {
                bgcolor: "white",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e0e0e0",
              },
            }}
          >
            <MenuItem value="">
              <Typography variant="body2" color="text.secondary">
                All Tags
              </Typography>
            </MenuItem>
            {tags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                <Typography variant="body2">{tag}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Time Filter Dropdown */}
        <FormControl 
          size="small" 
          sx={{ 
            minWidth: { xs: "100%", md: 180 },
            order: { xs: 3, md: 3 }
          }}
        >
          <InputLabel 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 0.5,
              color: "text.secondary"
            }}
          >
            <EventIcon sx={{ fontSize: 18 }} />
            Time
          </InputLabel>
          <Select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <EventIcon sx={{ fontSize: 18 }} />
                Time
              </Box>
            }
            sx={{
              borderRadius: 2,
              bgcolor: "#fafafa",
              "&:hover": {
                bgcolor: "#f5f5f5",
              },
              "&.Mui-focused": {
                bgcolor: "white",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e0e0e0",
              },
            }}
          >
            {timeFilterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {option.icon}
                  <Typography variant="body2">{option.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <IconButton
            onClick={handleClearAll}
            sx={{ 
              border: "1px solid #e0e0e0", 
              bgcolor: "#fafafa",
              "&:hover": { 
                bgcolor: "#f5f5f5",
                borderColor: "error.main"
              },
              order: { xs: 4, md: 4 }
            }}
            title="Clear all filters"
          >
            <ClearIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          </IconButton>
        )}
      </Box>

      
    </Paper>
  );
};

export default SearchFilter;
