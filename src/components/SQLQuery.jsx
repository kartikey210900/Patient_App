import { useState } from 'react';
import {
  TextField,
  Button,
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
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  FaDatabase,
  FaPlay,
  FaEraser,
  FaSyncAlt,
  FaTable,
  FaCheckCircle,
  FaExclamationCircle,
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

export default function SQLQuery({ db }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [inlineError, setInlineError] = useState('');

  async function runQuery(e) {
    e.preventDefault();
    setInlineError('');
    if (!query.trim()) {
      setInlineError('Query cannot be empty');
      setSnackbar({ open: true, message: 'Query cannot be empty', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await db.query(query);
      setResult(res.rows);
      setSnackbar({ open: true, message: 'Query executed successfully!', severity: 'success' });
    } catch (err) {
      setResult(null);
      setSnackbar({ open: true, message: `Query failed: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setInlineError('');
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-8 mb-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 font-sans animate-fade-in"
      aria-live="polite"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)', 
      }}
    >
      {}
      <div className="background-container background-fade" />

      <Typography
        className="text-3xl font-extrabold mb-2 text-[#1F2937] tracking-wide flex items-center gap-2"
        variant="h4"
        component="h2"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <FaDatabase className="text-[#0D9488]" size={30} />
        Run Raw SQL Query
      </Typography>
      <Typography
        className="text-sm text-[#6B7280] mb-6 italic"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        Execute custom SQL queries on the patient database.
      </Typography>

      <form onSubmit={runQuery} className="flex flex-col gap-6" noValidate>
        <Tooltip title="Enter a valid SQL query (e.g., SELECT * FROM patients)" arrow>
          <TextField
            label="SQL Query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
            multiline
            rows={5}
            placeholder="e.g., SELECT * FROM patients;"
            variant="filled"
            InputProps={{
              className:
                'bg-white shadow-inner rounded-lg font-mono text-base placeholder:text-[#6B7280] focus:ring-2 focus:ring-[#0D9488] transition-all',
              startAdornment: (
                <InputAdornment position="start">
                  <FaDatabase className="text-[#0D9488]" />
                </InputAdornment>
              ),
            }}
            aria-label="SQL Query Input"
            error={!!inlineError}
            helperText={inlineError}
            inputProps={{ style: { fontFamily: "'Inter', sans-serif" } }}
            className="rounded-lg transition-all focus-within:ring-2 focus-within:ring-[#0D9488]"
          />
        </Tooltip>
        <Box className="flex justify-end gap-4">
          <Tooltip title="Execute the SQL query" arrow>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              className="bg-[#0D9488] hover:bg-[#0B8276] text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaPlay />}
            >
              Run Query
            </Button>
          </Tooltip>
          <Tooltip title="Clear the query and results" arrow>
            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={loading}
              className="border-[#0D9488] text-[#0D9488] hover:bg-[#E6F5EA] hover:border-[#0B8276] font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <FaEraser />
              Clear Results
            </Button>
          </Tooltip>
        </Box>
      </form>

      {loading && (
        <Box className="flex justify-center items-center my-8 animate-fade-in">
          <CircularProgress size={48} className="text-[#0D9488]" />
          <Typography
            className="ml-4 text-[#1F2937] font-medium flex items-center gap-2"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <FaSyncAlt className="animate-spin text-[#0D9488]" />
            Executing query...
          </Typography>
        </Box>
      )}

      {result && result.length > 0 && (
        <TableContainer
          component={Paper}
          className="max-h-[360px] overflow-y-auto mt-6 rounded-lg shadow-inner border border-[#E5E7EB]"
          role="region"
          aria-label="SQL Query Results"
        >
          <Table stickyHeader>
            <TableHead className="bg-[#E6F0FA]">
              <TableRow>
                {Object.keys(result[0]).map((col) => (
                  <TableCell
                    key={col}
                    className="font-bold text-[#1F2937] border-b-2 border-[#E5E7EB] py-3"
                    scope="col"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {result.map((row, idx) => (
                <TableRow
                  key={idx}
                  className={`hover:bg-[#E6F0FA] transition-colors duration-200 animate-fade-in ${
                    idx % 2 === 0 ? 'bg-[#F9FCFF]' : 'bg-white'
                  }`}
                >
                  {Object.values(row).map((val, j) => (
                    <TableCell
                      key={j}
                      className="text-[#1F2937] whitespace-pre-wrap py-2"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {val?.toString() || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {result && result.length === 0 && !loading && (
        <Typography
          className="mt-8 text-center text-[#6B7280] italic flex justify-center items-center gap-2"
          variant="subtitle1"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <FaTable className="text-[#6B7280]" />
          No results found.
        </Typography>
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
