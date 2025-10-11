# Leave Management System

A comprehensive leave management system for students and faculty with admin-level monitoring and automatic email notifications.

## Features

### 👥 User Roles and Features

#### 🧑‍🎓 Student Module
- Login/Signup with email verification
- Dashboard showing leave balance and history
- Apply for leave with different types (sick, academic, personal, emergency)
- Track status of applied leaves
- Receive email notifications for leave status updates

#### 👩‍🏫 Faculty Module
- Login via registered email
- Dashboard showing pending leave requests
- Approve or reject student leave requests
- Add comments to leave decisions
- Receive email notifications for new applications

#### 👨‍💼 Admin Module
- Secure admin login
- Dashboard with comprehensive statistics
- User management (add/remove faculty/students)
- Approve/Reject faculty leaves
- Override any leave decision
- Generate reports and analytics

## Tech Stack

- **Frontend**: React with Vite, Material-UI
- **Backend**: Node.js with Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT tokens
- **Email**: Nodemailer with Gmail

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leaveManagementSystem
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leave_management
   JWT_SECRET=your_jwt_secret_key_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 5173).

## Usage

1. **Access the application**: Open http://localhost:5173 in your browser
2. **Register**: Create accounts for students, faculty, or admin
3. **Login**: Use your credentials to access the appropriate dashboard
4. **Students**: Apply for leaves and track their status
5. **Faculty**: Review and approve/reject student leave applications
6. **Admin**: Manage users and oversee the entire system

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Leaves
- `POST /api/leaves/apply` - Apply for leave (Student)
- `GET /api/leaves/my-leaves` - Get student's leaves
- `GET /api/leaves/pending` - Get pending leaves (Faculty)
- `PATCH /api/leaves/:id/status` - Approve/Reject leave
- `GET /api/leaves/all` - Get all leaves (Admin)

### Users
- `GET /api/users` - Get all users (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `POST /api/admin/create-user` - Create user (Admin)
- `PATCH /api/admin/override-leave/:id` - Override leave decision

## Email Configuration

The system uses Gmail for sending notifications. To set up:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in the `EMAIL_PASS` environment variable

## Database Schema

### User Model
- name, email, password, role
- studentId (for students)
- department
- email verification fields

### Leave Model
- student, faculty references
- leaveType, startDate, endDate, reason
- status, facultyComment, approvedBy
- timestamps

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
