import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Fade,
  Button,
  Tooltip,
} from '@mui/material';
import { broadcastDbUpdate } from '../utils/broadcast';
import {
  FaUserAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaMapMarkerAlt,
  FaNotesMedical,
  FaTrash,
  FaSyncAlt,
  FaExclamationCircle,
  FaCheckCircle,
  FaUsersSlash,
} from 'react-icons/fa';


const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideInWithBounce {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    60% {
      transform: translateX(-10%);
      opacity: 1;
    }
    80% {
      transform: translateX(5%);
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in-bounce {
    animation: slideInWithBounce 0.6s ease-out;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out;
  }

  .background-fade {
    opacity: 0;
    animation: fadeIn 1s ease-out forwards;
  }

  .background-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('your-background-image-url');  /* Use your desired image URL */
    background-size: cover;
    background-position: center;
    filter: brightness(0.8);
    z-index: -1; /* Keep background behind content */
  }
`;

document.head.appendChild(styleSheet);

export default function PatientList({ db, reload }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  useEffect(() => {
    async function fetchPatients() {
      if (!db) return;
      setLoading(true);
      try {
        const result = await db.query('SELECT * FROM patients ORDER BY id DESC');
        setPatients(result.rows);
        setSnackbar({ open: false, message: '', severity: 'error' });
      } catch (err) {
        setSnackbar({ open: true, message: `Failed to fetch patients: ${err.message}`, severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, [db, reload]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await db.query('DELETE FROM patients WHERE id = $1;', [id]);
      const result = await db.query('SELECT * FROM patients ORDER BY id DESC');
      setPatients(result.rows);
      broadcastDbUpdate();
      setSnackbar({ open: true, message: 'Patient deleted successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: `Failed to delete patient: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-8 mb-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 font-sans animate-fade-in"
      aria-live="polite"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // More transparent background
      }}
    >
      {/* Background fade effect */}
      <div className="background-container background-fade" />

      <Typography
        className="text-3xl font-extrabold mb-2 text-[#1F2937] tracking-wide flex items-center gap-2"
        variant="h4"
        component="h2"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <FaUserAlt className="text-[#0D9488]" size={30} />
        All Patients
      </Typography>
      <Typography
        className="text-sm text-[#6B7280] mb-6 italic"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        View and manage all registered patients.
      </Typography>

      {loading && (
        <Box className="flex justify-center items-center my-8 animate-fade-in">
          <CircularProgress size={48} className="text-[#0D9488]" />
          <Typography
            className="ml-4 text-[#1F2937] font-medium flex items-center gap-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <FaSyncAlt className="animate-spin text-[#0D9488]" />
            Loading patients...
          </Typography>
        </Box>
      )}

      {!loading && patients.length === 0 && (
        <Typography
          className="mt-8 text-center text-[#6B7280] italic flex justify-center items-center gap-2"
          variant="subtitle1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <FaUsersSlash className="text-[#6B7280]" />
          No patients registered yet.
        </Typography>
      )}

      {patients.length > 0 && (
        <TableContainer
          component={Paper}
          className="max-h-[400px] overflow-y-auto mt-6 rounded-lg shadow-inner border border-[#E5E7EB]"
          role="region"
          aria-label="Patient List"
        >
          <Table stickyHeader>
            <TableHead className="bg-[#E6F0FA]">
              <TableRow>
                <TableCell
                  className="font-bold text-[#1F2937] border-b-2 border-[#E5E7EB] py-3"
                  scope="col"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Tooltip title="Patient's full name" arrow>
                    <span className="flex items-center gap-1.5">
                      <FaUserAlt className="text-[#0D9488]" />
                      Name
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell
                  className="font-bold text-[#1F2937] border-b-2 border-[#E5E7EB] py-3"
                  scope="col"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Tooltip title="Patient's age" arrow>
                    <span className="flex items-center gap-1.5">
                      <FaBirthdayCake className="text-[#0D9488]" />
                      Age
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell
                  className="font-bold text-[#1F2937] border-b-2 border-[#E5E7EB] py-3"
                  scope="col"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Tooltip title="Patient's gender" arrow>
                    <span className="flex items-center gap-1.5">
                      <FaVenusMars className="text-[#0D9488]" />
                      Gender
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell
                  className="font-bold text-[#1F2937] border-b-2 border-[#E5E7EB] py-3"
                  scope="col"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Tooltip title="Patient's address" arrow>
                    <span className="flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-[#0D9488]" />
                      Address
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell
                  className="font-bold text-[#1F2937] border-b-2 border-[#E5E7EB] py-3"
                  scope="col"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <Tooltip title="Patient's medical conditions" arrow>
                    <span className="flex items-center gap-1.5">
                      <FaNotesMedical className="text-[#0D9488]" />
                      Medical Conditions
                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell
                  className="font-bold text-[#1F2937] border-b-2 border-[#E5E7EB] py-3"
                  scope="col"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((p, index) => (
                <TableRow
                  key={p.id}
                  className={`hover:bg-[#E6F0FA] transition-colors duration-200 animate-fade-in ${
                    index % 2 === 0 ? 'bg-[#F9FCFF]' : 'bg-white'
                  }`}
                >
                  <TableCell className="text-[#1F2937] py-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {p.name}
                  </TableCell>
                  <TableCell className="text-[#1F2937] py-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {p.age}
                  </TableCell>
                  <TableCell className="text-[#1F2937] py-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {p.gender}
                  </TableCell>
                  <TableCell className="text-[#1F2937] py-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {p.address || '-'}
                  </TableCell>
                  <TableCell className="text-[#1F2937] py-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {p.medical_conditions || '-'}
                  </TableCell>
                  <TableCell className="py-2">
                    <Tooltip title="Delete this patient" arrow>
                      <Button
                        onClick={() => handleDelete(p.id)}
                        disabled={loading}
                        className="text-[#EF4444] hover:text-[#DC2626] border-[#EF4444] hover:border-[#DC2626] hover:bg-[#FEE2E2] font-semibold py-1.5 px-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                        size="small"
                        variant="outlined"
                      >
                        <FaTrash className="text-sm" />
                        Delete
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
        className="animate-slide-in-bounce"
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          icon={snackbar.severity === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
          sx={{
            width: '100%',
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
