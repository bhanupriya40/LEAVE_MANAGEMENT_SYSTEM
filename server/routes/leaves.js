const express = require('express');
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { auth, facultyAuth } = require('../middleware/auth');
const { sendLeaveApplicationEmail, sendLeaveStatusEmail } = require('../utils/emailService');

const router = express.Router();

// Apply for leave (Student)
router.post('/apply', auth, [
  body('leaveType').isIn(['sick', 'academic', 'personal', 'emergency']).withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('reason').trim().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters')
], async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can apply for leave' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leaveType, startDate, endDate, reason, facultyId } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Cannot apply for past dates' });
    }

    // Find faculty
    console.log('Student department:', req.user.department);
    const faculty = await User.findOne({ 
      role: 'faculty', 
      department: req.user.department 
    });

    console.log('Found faculty:', faculty ? faculty.name : 'None');

    if (!faculty) {
      return res.status(400).json({ message: 'No faculty found in your department' });
    }

    // Create leave application
    const leave = new Leave({
      student: req.user._id,
      faculty: faculty._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason
    });

    await leave.save();
    await leave.populate('student faculty', 'name email department');

    // Send email notification to faculty
    await sendLeaveApplicationEmail(
      faculty.email,
      req.user.name,
      {
        leaveType,
        startDate: start.toDateString(),
        endDate: end.toDateString(),
        reason
      }
    );

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    console.error('Leave application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's leaves
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ student: req.user._id })
      .populate('faculty', 'name email')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get faculty's pending leaves
router.get('/pending', auth, facultyAuth, async (req, res) => {
  try {
    const leaves = await Leave.find({ 
      faculty: req.user._id, 
      status: 'pending' 
    })
    .populate('student', 'name email studentId department')
    .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get pending leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all leaves for faculty (pending, approved, rejected)
router.get('/faculty-leaves', auth, facultyAuth, async (req, res) => {
  try {
    const leaves = await Leave.find({ 
      faculty: req.user._id
    })
    .populate('student', 'name email studentId department')
    .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get faculty leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject leave
router.patch('/:id/status', auth, facultyAuth, [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, comment } = req.body;
    const leaveId = req.params.id;

    const leave = await Leave.findById(leaveId).populate('student faculty', 'name email');
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    if (leave.faculty._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this leave' });
    }

    leave.status = status;
    leave.facultyComment = comment;
    leave.approvedBy = req.user._id;
    
    if (status === 'approved') {
      leave.approvedAt = new Date();
    } else {
      leave.rejectedAt = new Date();
    }

    await leave.save();

    // Send email notification to student
    await sendLeaveStatusEmail(
      leave.student.email,
      status,
      {
        leaveType: leave.leaveType,
        startDate: leave.startDate.toDateString(),
        endDate: leave.endDate.toDateString(),
        comment
      }
    );

    res.json({
      message: `Leave ${status} successfully`,
      leave
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all leaves (Admin)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const leaves = await Leave.find()
      .populate('student', 'name email studentId department')
      .populate('faculty', 'name email department')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
