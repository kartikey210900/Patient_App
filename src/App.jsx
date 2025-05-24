import { useEffect, useState, useCallback } from 'react';
import { initDB } from './db/pglite';
import { onDbUpdate } from './utils/broadcast';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import SQLQuery from './components/SQLQuery';
import {
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Fade,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Fab,
} from '@mui/material';
import { FaHospital, FaExclamationTriangle, FaArrowUp } from 'react-icons/fa';
import { MdSync } from 'react-icons/md';

// Import the hospital background image from src/assets
import hospitalBackground from './assets/online-marketing-hIgeoQjS_iE-unsplash.jpg';

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(120%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slideIn 0.6s ease-out;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-pulse-custom {
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fadeIn 0.8s ease-out;
  }

  .background-hospital {
    position: relative;
    background-image: url(${hospitalBackground});
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    background-repeat: no-repeat;
    filter: brightness(0.95) contrast(1.1); 
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .background-hospital::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4); /* Darker overlay for better contrast */
    z-index: 1;
    border-radius: 8px;
  }

  .background-hospital > * {
    position: relative;
    z-index: 2;
  }

  /* Add subtle hover effect for buttons or any interactive elements */
  .hover-effect:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  /* Styling for headings and subheadings */
  .heading-text {
    font-size: 2.5rem;
    color: #ffffff;
    font-weight: 600;
    text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
    margin-bottom: 1rem;
  }

  .subheading-text {
    font-size: 1.2rem;
    color: #f0f0f0;
    text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.3);
  }

  /* Add some smooth transitions for background and content */
  .content-wrapper {
    transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
  }

  .content-wrapper:hover {
    transform: scale(1.05);
    opacity: 0.9;
  }

  /* Add smooth fade-in animation for content */
  .content-appear {
    animation: fadeIn 1s ease-in-out;
  }
  
  /* Add smooth transitions for cards */
  .card {
    transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  }
  .card:hover {
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.2);
    transform: translateY(-5px);
  }
`;

document.head.appendChild(styleSheet);


function App() {
  const [db, setDb] = useState(null);
  const [idb, setIdb] = useState(null);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [showBackToTop, setShowBackToTop] = useState(false);

  const setupDB = useCallback(async () => {
    setLoading(true);
    try {
      const { db, idb } = await initDB();
      setDb(db);
      setIdb(idb);
      setError(null);
      setSnackbar({ open: true, message: 'Database initialized successfully!', severity: 'success' });
    } catch (err) {
      console.error('Database initialization failed:', err);
      setError(err.message);
      setSnackbar({ open: true, message: `Database initialization failed: ${err.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setupDB();
  }, [setupDB]);

  useEffect(() => {
    const cleanup = onDbUpdate(() => {
      setupDB();
      setReload((r) => r + 1);
    });
    return cleanup;
  }, [setupDB]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDataChange = () => setReload((r) => r + 1);

  const handleRefresh = () => {
    setupDB();
    setReload((r) => r + 1);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      className={`min-h-screen pt-20 background-hospital transition-opacity duration-500 font-sans ${
        loading || error ? 'opacity-50' : 'opacity-100'
      }`}
      aria-live="polite"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <AppBar
        position="fixed"
        className="bg-gradient-to-r from-[#0D9488] to-[#0B8276] text-white shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1"
      >
        <Toolbar className="flex justify-between">
          <div className="flex items-center gap-3">
            <FaHospital className="text-white text-3xl animate-pulse-custom" />
            <Typography variant="h6" component="h1" className="text-white font-semibold tracking-wide">
              Patient Registration Portal
            </Typography>
          </div>
          <Tooltip title="Refresh Database" arrow>
            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              className="bg-white text-[#0D9488] hover:bg-[#0D9488] hover:text-white transition-all animate-pulse-custom"
              aria-label="Refresh Database"
            >
              <MdSync className="text-2xl" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <main className="container mx-auto px-4 mt-8">
        {loading && (
          <Box className="flex justify-center items-center min-h-[50vh] animate-fade-in">
            <CircularProgress size={60} className="text-[#0D9488]" />
            <Typography variant="h6" className="ml-6 text-[#1F2937] font-medium flex items-center gap-2">
              <MdSync className="animate-spin text-[#0D9488]" />
              Loading Database...
            </Typography>
          </Box>
        )}

        {error && !loading && (
          <Box className="flex justify-center items-center min-h-[50vh] animate-fade-in">
            <Typography variant="h6" className="text-[#EF4444] font-semibold flex items-center gap-3">
              <FaExclamationTriangle className="text-[#EF4444] text-2xl" />
              Error: {error}
            </Typography>
          </Box>
        )}

        {!loading && !error && db && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 animate-fade-in">
              <PatientForm db={db} idb={idb} onChange={handleDataChange} />
              <PatientList db={db} reload={reload} />
            </div>
            <hr className="border-t border-[#E5E7EB] my-8" />
            <div className="animate-fade-in">
              <SQLQuery db={db} />
            </div>
          </div>
        )}
      </main>

      {showBackToTop && (
        <Fab
          size="medium"
          onClick={handleBackToTop}
          className="fixed bottom-8 right-8 bg-[#0D9488] hover:bg-[#0B8276] text-white shadow-lg hover:shadow-xl transition-all animate-pulse-custom"
          aria-label="Scroll to Top"
        >
          <FaArrowUp />
        </Fab>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Fade}
        className="animate-slide-in"
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            fontFamily: "'Inter', sans-serif",
            backgroundColor: snackbar.severity === 'error' ? '#EF4444' : '#0D9488',
            color: '#fff',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;