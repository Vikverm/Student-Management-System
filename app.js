require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);

// Home page and role selection
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/select-role', (req, res) => {
  res.render('roleSelection');
});

app.post('/select-role', (req, res) => {
  const { role } = req.body;
  if (role === 'teacher') {
    res.redirect('/teacher/dashboard');
  } else {
    res.redirect('/student/dashboard');
  }
});

// Setup default users
// Setup default users
const setupDefaultUsers = async () => {
  try {
    // Clear existing data (optional - remove if you want to keep existing data)
    await Teacher.deleteMany({});
    await Student.deleteMany({});

    // Create 10 teachers
    const teachers = [];
    for (let i = 1; i <= 10; i++) {
      teachers.push({
        name: `Teacher ${i}`,
        email: `teacher${i}@school.com`,
        subject: `Subject ${i % 5 || 5}` // Creates 5 different subjects
      });
    }
    await Teacher.insertMany(teachers);
    console.log(`Created ${teachers.length} teachers`);

    // Create 25 students
      const student = {
        name: `Samim`,
        email: `Samim@school.com`,
        rollNumber: `1`,
        class: "10" // Distributes students across classes
      };
    
    await Student.insertOne(student);
    console.log(`Created ${student} student`);

  } catch (error) {
    console.error("Setup error:", error);
  }
};

// Start server after ensuring database connection and default users
const startServer = async () => {
  try {
    // Wait for MongoDB connection
    await mongoose.connection.once('open', () => {
      console.log('Connected to MongoDB');
    });

    // Setup default users
    await setupDefaultUsers();

    // Start Express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();