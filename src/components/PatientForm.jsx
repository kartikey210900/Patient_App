import { useState } from "react";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Fade,
  Typography,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { persistDB } from "../db/pglite";
import { broadcastDbUpdate } from "../utils/broadcast";
import {
  FaUserAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkerAlt,
  FaNotesMedical,
  FaCheck,
  FaUndo,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

// Animation styles (unchanged)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideInWithBounce {
    0% { transform: translateX(100%); opacity: 0; }
    60% { transform: translateX(-10%); opacity: 1; }
    80% { transform: translateX(5%); }
    100% { transform: translateX(0); opacity: 1; }
  }
  .animate-slide-in-bounce { animation: slideInWithBounce 0.6s ease-out; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fadeIn 0.8s ease-out; }

  .background-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('your-background-image-url'); /* Add your background image URL */
    background-size: cover;
    background-position: center;
    filter: brightness(0.6);
    z-index: -1;
  }
`;

document.head.appendChild(styleSheet);

export default function PatientForm({ db, idb, onChange }) {
  const [patient, setPatient] = useState({
    name: "",
    age: "",
    gender: "",
    address: "",
    medical_conditions: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const validateForm = () => {
    const errors = {};
    if (!patient.name.trim()) errors.name = "Name is required";
    if (!patient.age) errors.age = "Age is required";
    else if (isNaN(patient.age) || patient.age <= 0 || patient.age > 150) {
      errors.age = "Age must be a number between 1 and 150";
    }
    if (!patient.gender) errors.gender = "Gender is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatient({ ...patient, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { name, age, gender, address, medical_conditions } = patient;
      console.log("Inserting patient:", { name, age, gender, address, medical_conditions });

      await db.query(
        `
        INSERT INTO patients (name, age, gender, address, medical_conditions)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          name.trim(),
          parseInt(age, 10),
          gender,
          address.trim(),
          medical_conditions.trim(),
        ]
      );

      await persistDB(db, idb);
      broadcastDbUpdate();

      setPatient({
        name: "",
        age: "",
        gender: "",
        address: "",
        medical_conditions: "",
      });
      setFormErrors({});
      if (onChange) onChange();
      setSnackbar({
        open: true,
        message: "Patient registered successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Insert error:", err);
      setSnackbar({
        open: true,
        message: `Failed to register patient: ${err.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPatient({
      name: "",
      age: "",
      gender: "",
      address: "",
      medical_conditions: "",
    });
    setFormErrors({});
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-8 mb-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 font-sans max-w-lg mx-auto animate-fade-in"
      aria-live="polite"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.7)", 
      }}
    >
      {}
      <div className="background-container" />

      <Typography
        className="text-3xl font-extrabold mb-2 text-[#1F2937] tracking-wide flex items-center gap-2"
        variant="h4"
        component="h2"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <FaUserAlt className="text-[#0D9488]" size={30} />
        Register New Patient
      </Typography>
      <Typography
        className="text-sm text-[#6B7280] mb-6 italic"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Fill in the details to add a new patient to the system.
      </Typography>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Tooltip title="Enter patient's full name" arrow>
            <TextField
              label="Name"
              name="name"
              value={patient.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.name}
              helperText={formErrors.name}
              variant="filled"
              InputProps={{
                style: { fontFamily: "'Inter', sans-serif" },
                startAdornment: (
                  <InputAdornment position="start">
                    <FaUserAlt className="text-[#0D9488]" size={20} />
                  </InputAdornment>
                ),
              }}
              className="rounded-lg transition-all focus-within:ring-2 focus-within:ring-[#0D9488]"
            />
          </Tooltip>
          <Tooltip title="Enter patient's age (1-150)" arrow>
            <TextField
              label="Age"
              name="age"
              type="number"
              value={patient.age}
              onChange={handleChange}
              fullWidth
              required
              error={!!formErrors.age}
              helperText={formErrors.age}
              variant="filled"
              inputProps={{
                min: 1,
                max: 150,
                style: { fontFamily: "'Inter', sans-serif" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaBirthdayCake className="text-[#0D9488]" size={20} />
                  </InputAdornment>
                ),
              }}
              className="rounded-lg transition-all focus-within:ring-2 focus-within:ring-[#0D9488]"
            />
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Tooltip title="Select patient's gender" arrow>
            <FormControl
              fullWidth
              required
              error={!!formErrors.gender}
              variant="filled"
              className="rounded-lg transition-all focus-within:ring-2 focus-within:ring-[#0D9488]"
            >
              <InputLabel style={{ fontFamily: "'Inter', sans-serif" }}>
                Gender
              </InputLabel>
              <Select
                name="gender"
                value={patient.gender}
                onChange={handleChange}
                label="Gender"
                style={{ fontFamily: "'Inter', sans-serif" }}
                startAdornment={
                  <InputAdornment position="start">
                    <FaVenusMars className="text-[#0D9488] mr-2" size={20} />
                  </InputAdornment>
                }
              >
                <MenuItem value="" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Select Gender
                </MenuItem>
                <MenuItem value="Male" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Male
                </MenuItem>
                <MenuItem value="Female" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Female
                </MenuItem>
                <MenuItem value="Other" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Other
                </MenuItem>
              </Select>
              {formErrors.gender && (
                <Typography
                  color="error"
                  variant="caption"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {formErrors.gender}
                </Typography>
              )}
            </FormControl>
          </Tooltip>
          <Tooltip title="Enter patient's address (optional)" arrow>
            <TextField
              label="Address"
              name="address"
              value={patient.address}
              onChange={handleChange}
              fullWidth
              variant="filled"
              InputProps={{
                style: { fontFamily: "'Inter', sans-serif" },
                startAdornment: (
                  <InputAdornment position="start">
                    <FaMapMarkerAlt className="text-[#0D9488]" size={20} />
                  </InputAdornment>
                ),
              }}
              className="rounded-lg transition-all focus-within:ring-2 focus-within:ring-[#0D9488]"
            />
          </Tooltip>
        </div>
        <TextField
          label="Medical Conditions"
          name="medical_conditions"
          value={patient.medical_conditions}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          variant="filled"
          InputProps={{
            style: { fontFamily: "'Inter', sans-serif" },
            startAdornment: (
              <InputAdornment position="start">
                <FaNotesMedical className="text-[#0D9488]" size={20} />
              </InputAdornment>
            ),
          }}
          className="rounded-lg transition-all focus-within:ring-2 focus-within:ring-[#0D9488]"
        />
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            className="bg-[#0D9488] hover:bg-[#0B8276] text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaCheck />}
          >
            Register Patient
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
            className="border-[#0D9488] text-[#0D9488] hover:bg-[#E6F5EA] hover:border-[#0B8276] font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <FaUndo />
            Reset Form
          </Button>
        </div>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Fade}
        className="animate-slide-in-bounce"
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          icon={snackbar.severity === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
          sx={{
            width: "100%",
            fontFamily: "'Inter', sans-serif",
            backgroundColor: snackbar.severity === "success" ? "#0D9488" : "#EF4444",
            color: "#fff",
            border: "1px solid",
            borderColor: snackbar.severity === "success" ? "#0B8276" : "#DC2626",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
