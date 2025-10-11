const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'rejected' });

    // Recent leaves
    const recentLeaves = await Leave.find()
      .populate('student', 'name email studentId')
      .populate('faculty', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves
      },
      recentLeaves
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (Admin)
router.post('/create-user', auth, adminAuth, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
  body('studentId').optional().trim(),
  body('department').trim().isLength({ min: 2 }).withMessage('Department must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, studentId, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      studentId: role === 'student' ? studentId : undefined,
      department,
      isEmailVerified: true
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leave statistics by department
router.get('/stats/department', auth, adminAuth, async (req, res) => {
  try {
    const stats = await Leave.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: '$studentInfo'
      },
      {
        $group: {
          _id: '$studentInfo.department',
          totalLeaves: { $sum: 1 },
          approvedLeaves: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pendingLeaves: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          rejectedLeaves: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Department stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Override leave decision (Admin)
router.patch('/override-leave/:id', auth, adminAuth, [
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

    leave.status = status;
    leave.facultyComment = comment;
    leave.approvedBy = req.user._id;
    
    if (status === 'approved') {
      leave.approvedAt = new Date();
    } else {
      leave.rejectedAt = new Date();
    }

    await leave.save();

    res.json({
      message: `Leave ${status} by admin override`,
      leave
    });
  } catch (error) {
    console.error('Override leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
