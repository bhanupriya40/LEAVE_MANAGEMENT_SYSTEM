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
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

const FacultyDashboard = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [action, setAction] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const [pendingResponse, allResponse] = await Promise.all([
        axios.get('/api/leaves/pending'),
        axios.get('/api/leaves/faculty-leaves')
      ]);
      setPendingLeaves(pendingResponse.data);
      setAllLeaves(allResponse.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (leave, actionType) => {
    setSelectedLeave(leave);
    setAction(actionType);
    setComment('');
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage('');

    try {
      await axios.patch(`/api/leaves/${selectedLeave._id}/status`, {
        status: action,
        comment: comment
      });
      
      setMessage(`Leave ${action} successfully!`);
      setOpenDialog(false);
      fetchLeaves();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error processing leave application');
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
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Faculty Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and manage student leave applications.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Leave Applications
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Student ID</TableCell>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Applied On</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingLeaves.map((leave) => (
                      <TableRow key={leave._id}>
                        <TableCell>{leave.student.name}</TableCell>
                        <TableCell>{leave.student.studentId}</TableCell>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell>{dayjs(leave.startDate).format('DD/MM/YYYY')}</TableCell>
                        <TableCell>{dayjs(leave.endDate).format('DD/MM/YYYY')}</TableCell>
                        <TableCell>{leave.duration} days</TableCell>
                        <TableCell>
                          <Tooltip title={leave.reason}>
                            <Typography variant="body2" noWrap>
                              {leave.reason.length > 30 ? `${leave.reason.substring(0, 30)}...` : leave.reason}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{dayjs(leave.createdAt).format('DD/MM/YYYY')}</TableCell>
                        <TableCell>
                          <Tooltip title="Approve">
                            <IconButton
                              color="success"
                              onClick={() => handleAction(leave, 'approved')}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              color="error"
                              onClick={() => handleAction(leave, 'rejected')}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All Leave Applications
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Faculty Comment</TableCell>
                      <TableCell>Processed On</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allLeaves.map((leave) => (
                      <TableRow key={leave._id}>
                        <TableCell>{leave.student.name}</TableCell>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell>{dayjs(leave.startDate).format('DD/MM/YYYY')}</TableCell>
                        <TableCell>{dayjs(leave.endDate).format('DD/MM/YYYY')}</TableCell>
                        <TableCell>
                          <Chip
                            label={leave.status}
                            color={getStatusColor(leave.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{leave.facultyComment || '-'}</TableCell>
                        <TableCell>
                          {leave.approvedAt 
                            ? dayjs(leave.approvedAt).format('DD/MM/YYYY')
                            : leave.rejectedAt 
                            ? dayjs(leave.rejectedAt).format('DD/MM/YYYY')
                            : '-'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {action === 'approved' ? 'Approve' : 'Reject'} Leave Application
        </DialogTitle>
        <DialogContent>
          {message && (
            <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          
          {selectedLeave && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Student:</strong> {selectedLeave.student.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Leave Type:</strong> {selectedLeave.leaveType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Duration:</strong> {selectedLeave.duration} days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Reason:</strong> {selectedLeave.reason}
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label={`${action === 'approved' ? 'Approval' : 'Rejection'} Comment (Optional)`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Add a comment for the ${action}...`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color={action === 'approved' ? 'success' : 'error'}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : `${action === 'approved' ? 'Approve' : 'Reject'} Leave`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FacultyDashboard;
