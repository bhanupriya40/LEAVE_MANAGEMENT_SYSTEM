import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

const StudentDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: null,
    endDate: null,
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/api/leaves/my-leaves');
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (field) => (date) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await axios.post('/api/leaves/apply', {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString()
      });
      
      setMessage('Leave application submitted successfully!');
      setOpenDialog(false);
      setFormData({
        leaveType: '',
        startDate: null,
        endDate: null,
        reason: ''
      });
      fetchLeaves();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error submitting leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Student Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your leave applications and track their status.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">My Leave Applications</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                  >
                    Apply for Leave
                  </Button>
                </Box>
                
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Leave Type</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Applied On</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaves.map((leave) => (
                        <TableRow key={leave._id}>
                          <TableCell>{leave.leaveType}</TableCell>
                          <TableCell>{dayjs(leave.startDate).format('DD/MM/YYYY')}</TableCell>
                          <TableCell>{dayjs(leave.endDate).format('DD/MM/YYYY')}</TableCell>
                          <TableCell>{leave.duration} days</TableCell>
                          <TableCell>
                            <Chip
                              label={leave.status}
                              color={getStatusColor(leave.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{dayjs(leave.createdAt).format('DD/MM/YYYY')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Applications: {leaves.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending: {leaves.filter(l => l.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved: {leaves.filter(l => l.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected: {leaves.filter(l => l.status === 'rejected').length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Apply for Leave</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {message && (
                <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Leave Type</InputLabel>
                <Select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  label="Leave Type"
                >
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="academic">Academic Leave</MenuItem>
                  <MenuItem value="personal">Personal Leave</MenuItem>
                  <MenuItem value="emergency">Emergency Leave</MenuItem>
                </Select>
              </FormControl>

              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={handleDateChange('startDate')}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />

              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={handleDateChange('endDate')}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />

              <TextField
                margin="normal"
                fullWidth
                multiline
                rows={4}
                name="reason"
                label="Reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Please provide a detailed reason for your leave application..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? <CircularProgress size={24} /> : 'Submit Application'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default StudentDashboard;
