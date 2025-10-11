const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendLeaveApplicationEmail = async (facultyEmail, studentName, leaveDetails) => {
  const subject = 'New Leave Application';
  const html = `
    <h2>New Leave Application</h2>
    <p><strong>Student:</strong> ${studentName}</p>
    <p><strong>Leave Type:</strong> ${leaveDetails.leaveType}</p>
    <p><strong>Start Date:</strong> ${leaveDetails.startDate}</p>
    <p><strong>End Date:</strong> ${leaveDetails.endDate}</p>
    <p><strong>Reason:</strong> ${leaveDetails.reason}</p>
    <p>Please log in to review and approve/reject this leave application.</p>
  `;
  
  await sendEmail(facultyEmail, subject, html);
};

const sendLeaveStatusEmail = async (studentEmail, status, leaveDetails) => {
  const subject = `Leave Application ${status}`;
  const html = `
    <h2>Leave Application ${status}</h2>
    <p>Your leave application has been <strong>${status}</strong>.</p>
    <p><strong>Leave Type:</strong> ${leaveDetails.leaveType}</p>
    <p><strong>Start Date:</strong> ${leaveDetails.startDate}</p>
    <p><strong>End Date:</strong> ${leaveDetails.endDate}</p>
    ${leaveDetails.comment ? `<p><strong>Comment:</strong> ${leaveDetails.comment}</p>` : ''}
  `;
  
  await sendEmail(studentEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendLeaveApplicationEmail,
  sendLeaveStatusEmail
};
