import { Box, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";

export default function StarRating({ 
  rating, 
  maxRating = 10, 
  size = "medium", 
  showValue = true, 
  onChange,
  disabled = false 
}) {
  const handleStarClick = (clickedRating) => {
    if (!disabled && onChange) {
      onChange(clickedRating);
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= fullStars; i++) {
      stars.push(
        <StarIcon
          key={`full-${i}`}
          onClick={() => handleStarClick(i)}
          sx={{
            color: "gold",
            cursor: disabled ? "default" : "pointer",
            fontSize: size === "small" ? "1rem" : size === "large" ? "2rem" : "1.5rem",
            "&:hover": disabled ? {} : { transform: "scale(1.1)" }
          }}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalfIcon
          key="half"
          onClick={() => handleStarClick(fullStars + 0.5)}
          sx={{
            color: "gold",
            cursor: disabled ? "default" : "pointer",
            fontSize: size === "small" ? "1rem" : size === "large" ? "2rem" : "1.5rem",
            "&:hover": disabled ? {} : { transform: "scale(1.1)" }
          }}
        />
      );
    }

    const emptyStars = maxRating - Math.ceil(rating);
    for (let i = 1; i <= emptyStars; i++) {
      stars.push(
        <StarBorderIcon
          key={`empty-${i}`}
          onClick={() => handleStarClick(Math.ceil(rating) + i)}
          sx={{
            color: "gold",
            cursor: disabled ? "default" : "pointer",
            fontSize: size === "small" ? "1rem" : size === "large" ? "2rem" : "1.5rem",
            "&:hover": disabled ? {} : { transform: "scale(1.1)" }
          }}
        />
      );
    }

    return stars;
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {renderStars()}
      </Box>
      {showValue && (
        <Typography variant="body2" color="text.secondary">
          {rating.toFixed(1)}/{maxRating}
        </Typography>
      )}
    </Box>
  );
}
