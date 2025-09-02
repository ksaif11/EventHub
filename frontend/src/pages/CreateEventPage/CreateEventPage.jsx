import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import PlaceAutocompleteInput from "../../components/PlaceAutocompleteInput/PlaceAutocompleteInput";
import { validateCreateEventForm, normalizeTagsInput } from "../../utils/validators";
import axiosInstance from "../../api/axiosInstance";

const steps = ["Basic Info", "Details", "Location", "Contact"];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [shareLink, setShareLink] = useState("");

  const [values, setValues] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    duration: 60,
    capacity: 10,
    location: { formattedAddress: "", lat: null, lng: null },
    tagsInput: "",
    entryFee: { isFree: true, amount: 0 },
    ageRestriction: "All Ages",
    contactPerson: { name: "", email: "", phone: "" },
  });

  const tags = useMemo(
    () => normalizeTagsInput(values.tagsInput),
    [values.tagsInput]
  );

  const handleChange = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleNestedChange = (parentField, childField) => (e) => {
    setValues((v) => ({
      ...v,
      [parentField]: {
        ...v[parentField],
        [childField]: e.target.value
      }
    }));
    if (errors[parentField]) {
      setErrors(prev => ({ ...prev, [parentField]: "" }));
    }
  };

  const handleAddressSelect = (addr) => {
    setValues((v) => ({ ...v, location: addr }));
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: "" }));
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setSnack({
        open: true,
        message: "Link copied to clipboard",
        severity: "success",
      });
    } catch {
      setSnack({
        open: true,
        message: "Failed to copy link",
        severity: "error",
      });
    }
  };

  const handleNext = () => {
    const currentStepErrors = validateCurrentStep();
    if (Object.keys(currentStepErrors).length === 0) {
      setActiveStep((prev) => prev + 1);
    } else {
      setErrors(currentStepErrors);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateCurrentStep = () => {
    const stepErrors = {};
    
    switch (activeStep) {
      case 0:
        if (!values.title?.trim()) stepErrors.title = "Title is required";
        if (!values.description?.trim()) stepErrors.description = "Description is required";
        if (!values.category) stepErrors.category = "Category is required";
        break;
      case 1:
        if (!values.duration || values.duration < 15) stepErrors.duration = "Duration must be at least 15 minutes";
        if (!values.capacity || values.capacity < 1) stepErrors.capacity = "Capacity must be at least 1";
        if (!values.date) stepErrors.date = "Date & time is required";
        break;
      case 2:
        if (!values.location?.formattedAddress?.trim()) stepErrors.location = "Location is required";
        break;
      case 3:
        if (!values.contactPerson?.name?.trim()) stepErrors.contactPerson = "Contact person name is required";
        if (!values.contactPerson?.email?.trim()) stepErrors.contactPerson = "Contact person email is required";
        else if (!/^\S+@\S+\.\S+$/.test(values.contactPerson.email)) stepErrors.contactPerson = "Contact person email must be valid";
        break;
    }
    
    return stepErrors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      title: values.title?.trim(),
      description: values.description?.trim(),
      category: values.category,
      date: values.date,
      duration: parseInt(values.duration),
      capacity: parseInt(values.capacity),
      location: values.location,
      tags,
      entryFee: values.entryFee,
      ageRestriction: values.ageRestriction,
      contactPerson: {
        name: values.contactPerson.name?.trim(),
        email: values.contactPerson.email?.trim(),
        phone: values.contactPerson.phone?.trim(),
      },
    };

    const validationErrors = validateCreateEventForm(payload);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSnack({
        open: true,
        message: "Please fix the errors above",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/events", payload);
      
      if (res.data?.eventId) {
        const link = `${window.location.origin}/events/${res.data.eventId}`;
        setShareLink(link);
        setSnack({
          open: true,
          message: "Event created successfully!",
          severity: "success",
        });
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create event";
      setSnack({
        open: true,
        message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              label="Event Title"
              fullWidth
              value={values.title}
              onChange={handleChange("title")}
              error={!!errors.title}
              helperText={errors.title}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={values.description}
              onChange={handleChange("description")}
              error={!!errors.description}
              helperText={errors.description}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                value={values.category}
                onChange={handleChange("category")}
                label="Category"
              >
                <MenuItem value="Meetup">Meetup</MenuItem>
                <MenuItem value="Workshop">Workshop</MenuItem>
                <MenuItem value="Conference">Conference</MenuItem>
                <MenuItem value="Social">Social</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box>
            <TextField
              label="Date & Time"
              type="datetime-local"
              fullWidth
              value={values.date}
              onChange={handleChange("date")}
              error={!!errors.date}
              helperText={errors.date}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              fullWidth
              value={values.duration}
              onChange={handleChange("duration")}
              error={!!errors.duration}
              helperText={errors.duration}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Capacity"
              type="number"
              fullWidth
              value={values.capacity}
              onChange={handleChange("capacity")}
              error={!!errors.capacity}
              helperText={errors.capacity}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Age Restriction</InputLabel>
              <Select
                value={values.ageRestriction}
                onChange={handleChange("ageRestriction")}
                label="Age Restriction"
              >
                <MenuItem value="All Ages">All Ages</MenuItem>
                <MenuItem value="18+">18+</MenuItem>
                <MenuItem value="21+">21+</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box>
            <PlaceAutocompleteInput
              label="Location"
              value={values.location?.formattedAddress}
              onSelect={handleAddressSelect}
              error={!!errors.location}
              helperText={errors.location}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Tags (comma-separated)"
              fullWidth
              value={values.tagsInput}
              onChange={handleChange("tagsInput")}
              placeholder="tech, networking, fun"
              sx={{ mb: 2 }}
            />
            {tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} sx={{ mr: 0.5, mb: 0.5 }} />
                ))}
              </Box>
            )}
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={values.entryFee.isFree}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        entryFee: { ...v.entryFee, isFree: e.target.checked },
                      }))
                    }
                  />
                }
                label="Free Event"
              />
            </Box>
            {!values.entryFee.isFree && (
              <TextField
                label="Entry Fee ($)"
                type="number"
                fullWidth
                value={values.entryFee.amount}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    entryFee: { ...v.entryFee, amount: parseFloat(e.target.value) || 0 },
                  }))
                }
                sx={{ mb: 2 }}
              />
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            <TextField
              label="Contact Person Name"
              fullWidth
              value={values.contactPerson.name}
              onChange={handleNestedChange("contactPerson", "name")}
              error={!!errors.contactPerson}
              helperText={errors.contactPerson}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Contact Person Email"
              fullWidth
              value={values.contactPerson.email}
              onChange={handleNestedChange("contactPerson", "email")}
              error={!!errors.contactPerson}
              helperText={errors.contactPerson}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Contact Person Phone (optional)"
              fullWidth
              value={values.contactPerson.phone}
              onChange={handleNestedChange("contactPerson", "phone")}
              sx={{ mb: 2 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  if (shareLink) {
    return (
      <Container sx={{ mt: 4, mb: 6 }}>
        <Paper sx={{ p: 4, textAlign: "center", maxWidth: 600, mx: "auto" }}>
          <Typography variant="h4" gutterBottom>
            Event Created Successfully!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your event has been created and is now live. Share the link below with others:
          </Typography>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              value={shareLink}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={copyShareLink}>
              Copy Link
            </Button>
          </Box>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="outlined" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button variant="contained" onClick={() => navigate(shareLink)}>
              View Event
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Create New Event
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Fill out the form below to create your event. You can preview and edit it later.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={onSubmit}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Event"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
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
