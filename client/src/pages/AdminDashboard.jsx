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
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    department: ''
  });
  const [leaveAction, setLeaveAction] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchLeaves();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await axios.get('/api/leaves/all');
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await axios.post('/api/admin/create-user', userFormData);
      setMessage('User created successfully!');
      setOpenUserDialog(false);
      setUserFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        studentId: '',
        department: ''
      });
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveAction = (leave, action) => {
    setSelectedLeave(leave);
    setLeaveAction(action);
    setComment('');
    setOpenLeaveDialog(true);
  };

  const handleLeaveSubmit = async () => {
    setSubmitting(true);
    setMessage('');

    try {
      await axios.patch(`/api/admin/override-leave/${selectedLeave._id}`, {
        status: leaveAction,
        comment: comment
      });
      
      setMessage(`Leave ${leaveAction} successfully!`);
      setOpenLeaveDialog(false);
      fetchLeaves();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error processing leave');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
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
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, leaves, and system overview.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {dashboardData && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {dashboardData.stats.totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Leaves
                </Typography>
                <Typography variant="h4">
                  {dashboardData.stats.totalLeaves}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Leaves
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {dashboardData.stats.pendingLeaves}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved Leaves
                </Typography>
                <Typography variant="h4" color="success.main">
                  {dashboardData.stats.approvedLeaves}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Users Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Users Management</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenUserDialog(true)}
                >
                  Add User
                </Button>
              </Box>
              
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.slice(0, 5).map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip label={user.role} size="small" />
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <DeleteIcon />
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

        {/* Recent Leaves */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Leave Applications
              </Typography>
              
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaves.slice(0, 5).map((leave) => (
                      <TableRow key={leave._id}>
                        <TableCell>{leave.student.name}</TableCell>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell>
                          <Chip
                            label={leave.status}
                            color={getStatusColor(leave.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {leave.status === 'pending' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  color="success"
                                  size="small"
                                  onClick={() => handleLeaveAction(leave, 'approved')}
                                >
                                  <CheckIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => handleLeaveAction(leave, 'rejected')}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
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

      {/* Create User Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <form onSubmit={handleUserSubmit}>
          <DialogContent>
            {message && (
              <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Full Name"
              name="name"
              value={userFormData.name}
              onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={userFormData.email}
              onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={userFormData.role}
                onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                label="Role"
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="faculty">Faculty</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            {userFormData.role === 'student' && (
              <TextField
                margin="normal"
                fullWidth
                label="Student ID"
                name="studentId"
                value={userFormData.studentId}
                onChange={(e) => setUserFormData({...userFormData, studentId: e.target.value})}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              label="Department"
              name="department"
              value={userFormData.department}
              onChange={(e) => setUserFormData({...userFormData, department: e.target.value})}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={userFormData.password}
              onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={24} /> : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Leave Action Dialog */}
      <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {leaveAction === 'approved' ? 'Approve' : 'Reject'} Leave Application
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
            label={`${leaveAction === 'approved' ? 'Approval' : 'Rejection'} Comment (Optional)`}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Add a comment for the ${leaveAction}...`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLeaveDialog(false)}>Cancel</Button>
          <Button
            onClick={handleLeaveSubmit}
            variant="contained"
            color={leaveAction === 'approved' ? 'success' : 'error'}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : `${leaveAction === 'approved' ? 'Approve' : 'Reject'} Leave`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
