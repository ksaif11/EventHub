import { useState, useEffect } from "react";
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
} from "@mui/material";

export default function PlaceAutocompleteInput({
  value,
  onSelect,
  error,
  helperText,
  label = "Search address",
  ...textProps
}) {
  const [query, setQuery] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    if (query.length < 3) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`,
        {
          signal: controller.signal,
          headers: {
            "Accept-Language": "en",
            "User-Agent": "your-app-name/1.0",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setResults(data.slice(0, 5));
        })
        .catch((err) => {
          if (err.name !== "AbortError") console.error(err);
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const handleSelect = (place) => {
    const formattedAddress = place.display_name;
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    onSelect({ formattedAddress, lat, lng });
    setQuery(formattedAddress);
    setResults([]);
  };

  return (
    <div style={{ position: "relative" }}>
      <TextField
        label={label}
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        error={!!error}
        helperText={error ? helperText : helperText || ""}
        InputProps={{
          endAdornment: loading ? <CircularProgress size={20} /> : null,
        }}
        {...textProps}
      />

      {results.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            zIndex: 10,
            width: "100%",
            maxHeight: 200,
            overflowY: "auto",
            mt: 0.5,
          }}
        >
          {results.map((place) => (
            <List key={place.place_id} disablePadding>
              <ListItem button onClick={() => handleSelect(place)}>
                <ListItemText primary={place.display_name} />
              </ListItem>
            </List>
          ))}
        </Paper>
      )}
    </div>
  );
}
