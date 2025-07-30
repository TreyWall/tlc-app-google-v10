// new-shelf-scanner-admin/src/JobQueuePage.jsx
import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase'; // Assuming firebase initialization is in ../firebase.js or similar
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
  useTheme,
} from '@mui/material';
import { useSnackbar } from 'notistack'; // Import useSnackbar hook

const JobQueuePage = () => {
  const theme = useTheme(); // Access the theme object
  const { enqueueSnackbar } = useSnackbar(); // Use the useSnackbar hook
  const [jobs, setJobs] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingContractors, setLoadingContractors] = useState(true);
  const [error, setError] = useState(null);
  const [assigningJobId, setAssigningJobId] = useState(null); // State to track job being assigned

  useEffect(() => {
    // Set up real-time listener for jobs
    const unsubscribeJobs = firestore.collection('jobs')
      .where('status', 'in', ['pending', 'assigned']) // Listen to pending or assigned jobs
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsData);
        setLoadingJobs(false); // Set loading to false once initial data is received
      }, err => {
        console.error('Error fetching real-time jobs:', err);
        setError('Failed to fetch real-time jobs.');
        enqueueSnackbar(`Failed to fetch jobs: ${err.message}`, { variant: 'error' });
        setLoadingJobs(false);
      });

    // Fetch contractors (users with role 'contractor') - This can remain a one-time fetch unless contractor data changes frequently
    const fetchContractors = async () => {
      try {
        const contractorsCollection = await firestore.collection('users')
          .where('role', '==', 'contractor')
          .get();
        const contractorsData = contractorsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContractors(contractorsData);
      } catch (err) {
        console.error('Error fetching contractors:', err);
        setError('Failed to fetch contractors.');
        enqueueSnackbar(`Error fetching contractors: ${err.message}`, { variant: 'error' });
      } finally {
        setLoadingContractors(false);
      }
    };

    fetchContractors();

    // Unsubscribe from listeners when component unmounts
    return () => {
      unsubscribeJobs();
      // If contractors were real-time, unsubscribe here as well
    };
  }, [enqueueSnackbar]); // Add enqueueSnackbar as a dependency

  const assignContractor = async (jobId, contractorId) => {
    setAssigningJobId(jobId); // Set the job being assigned
    try {
      await firestore.collection('jobs').doc(jobId).update({
        contractorId: contractorId,
        status: 'assigned', // Update job status
      });
      // The real-time listener will update the local state, so no need to manually update jobs here
      enqueueSnackbar(`Job ${jobId} assigned successfully!`, { variant: 'success' });
      console.log(`Job ${jobId} assigned to contractor ${contractorId}`);
    } catch (err) {
      console.error('Error assigning contractor:', err);
      enqueueSnackbar(`Failed to assign contractor: ${err.message}`, { variant: 'error' });
      setError('Failed to assign contractor.'); // Keep internal error state if needed
    } finally {
      setAssigningJobId(null); // Reset the assigning job state
    }
  };

  if (loadingJobs || loadingContractors) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: theme.spacing(4) }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: theme.spacing(3) }}>
      <Typography variant="h4" gutterBottom>
        Job Queue
      </Typography>

      {jobs.length === 0 ? (
        <Typography>No jobs in the queue.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="job queue table">
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned Contractor</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map(job => (
                <TableRow
                  key={job.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {job.title}
                  </TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell>
                    {job.contractorId ? (
                      contractors.find(c => c.id === job.contractorId)?.name || 'Unknown Contractor'
                    ) : (
                      'Unassigned'
                    )}
                  </TableCell>
                  <TableCell>
                    {!job.contractorId && contractors.length > 0 && (
                      <FormControl sx={{ m: theme.spacing(1), minWidth: 120 }} size="small" disabled={assigningJobId === job.id}> {/* Disable while assigning */}
                        <InputLabel id={`assign-contractor-label-${job.id}`}>Assign</InputLabel>
                        <Select
                          labelId={`assign-contractor-label-${job.id}`}
                          id={`assign-contractor-select-${job.id}`}
                          value=""
                          label="Assign"
                          onChange={(e) => assignContractor(job.id, e.target.value)}
                          disabled={assigningJobId === job.id} // Also disable select itself
                        >
                          <MenuItem value="" disabled>
                            Select Contractor
                          </MenuItem>
                          {contractors.map(contractor => (
                            <MenuItem key={contractor.id} value={contractor.id}>
                              {contractor.name || contractor.id}
                            </MenuItem>
                          ))
                          }
                        </Select>
                         {assigningJobId === job.id && (
                          <CircularProgress size={20} sx={{ position: 'absolute', right: 0, top: '50%', marginTop: '-10px', marginRight: '10px' }} /> // Small loading indicator
                        )}
                      </FormControl>
                    )}
                  </TableCell>
                </TableRow>
              ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default JobQueuePage;