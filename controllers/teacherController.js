const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');

// exports.getDashboard = async (req, res) => {
//   try {
//     // In a real app, you'd get the teacher ID from session/auth
//     const teacher = await Teacher.findOne(); // Just getting the first teacher for demo
//     const students = await Student.find();
//     const tasks = await Task.find({ assignedBy: teacher._id })
//       .populate('assignedTo')
//       .sort({ deadline: 1 });

//     res.render('teacher/dashboard', { teacher, students, tasks });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Server Error');
//   }
// };



exports.getDashboard = async (req, res) => {
  try {
    // Try to find a teacher or create one if none exists
    let teacher = await Teacher.findOne();

    if (!teacher) {
      // Create a default teacher if none exists
      teacher = new Teacher({
        name: "Default Teacher",
        email: "teacher@example.com",
        subject: "Computer Science"
      });
      await teacher.save();
    }

    const students = await Student.find();
    const tasks = await Task.find({ assignedBy: teacher._id })
      .populate('assignedTo')
      .sort({ deadline: 1 });

    const successMessage = req.query.success;

    res.render('teacher/dashboard', { teacher, students, tasks, successMessage });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

exports.addTaskForm = async (req, res) => {
  try {
    const students = await Student.find();
    res.render('teacher/addTask', { students });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.addTask = async (req, res) => {
  try {
    const { title, description, deadline, assignedTo } = req.body;
    const teacher = await Teacher.findOne(); // Demo - get first teacher

    const newTask = new Task({
      title,
      description,
      deadline,
      assignedBy: teacher._id,
      assignedTo
    });

    await newTask.save();
    res.redirect('/teacher/dashboard?success=Task has been assigned!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.viewTasks = async (req, res) => {
  try {
    const teacher = await Teacher.findOne(); // Demo - get first teacher
    const tasks = await Task.find({ assignedBy: teacher._id })
      .populate('assignedTo')
      .sort({ deadline: 1 });

    res.render('teacher/viewTasks', { teacher, tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.viewSubmissions = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId).populate('assignedTo');
    const submissions = await Submission.find({ task: taskId })
      .populate('student');

    res.render('teacher/viewSubmissions', { task, submissions });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.markAttendanceForm = async (req, res) => {
  try {
    const students = await Student.find();
    res.render('teacher/markAttendance', { students });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// In your controller file

exports.markAttendance = async (req, res) => {
  try {
    const attendanceData = req.body.attendance;
    const teacher = await Teacher.findOne();

    if (!teacher) {
      return res.status(400).send('No teacher found');
    }

    const attendanceRecords = [];
    const errors = [];

    const serverTime = new Date();

    for (const studentId in attendanceData) {
      try {
        const student = await Student.findById(studentId);
        if (!student) {
          errors.push(`Student not found: ${studentId}`);
          continue;
        }

        const status = attendanceData[studentId];
        const attendance = new Attendance({
          student: studentId,
          date: serverTime, // Use the reliable server time.
          status,
          markedBy: teacher._id
        });

        await attendance.save();
        attendanceRecords.push(attendance);
      } catch (error) {
        errors.push(`Error for student ${studentId}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.error('Attendance errors:', errors);
      return res.status(207).json({
        message: 'Partial success, some records failed validation.',
        saved: attendanceRecords.length,
        errors
      });
    }

    res.redirect('/teacher/dashboard?success=Attendance has been marked successfully!');
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).send(`Attendance failed: ${error.message}`);
  }
};

exports.gradeSubmissionForm = async (req, res) => {
  try {
    const { taskId, studentId } = req.params;
    const task = await Task.findById(taskId);
    const student = await Student.findById(studentId);
    const submission = await Submission.findOne({ task: taskId, student: studentId });
    const existingGrade = await Grade.findOne({ task: taskId, student: studentId });

    res.render('teacher/gradeSubmission', {
      task,
      student,
      submission,
      existingGrade
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { taskId, studentId } = req.params;
    const { marks, remarks } = req.body;
    const teacher = await Teacher.findOne(); // Demo - get first teacher

    // Check if grade already exists
    const existingGrade = await Grade.findOne({ task: taskId, student: studentId });

    if (existingGrade) {
      // Update existing grade
      existingGrade.marks = marks;
      existingGrade.remarks = remarks;
      await existingGrade.save();
    } else {
      // Create new grade
      const newGrade = new Grade({
        student: studentId,
        task: taskId,
        marks,
        remarks,
        gradedBy: teacher._id
      });
      await newGrade.save();
    }

    // Optionally mark task as completed
    if (req.body.markCompleted === 'on') {
      await Task.findByIdAndUpdate(taskId, { status: 'completed' });
    }

    res.redirect(`/teacher/tasks/${taskId}/submissions`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
exports.completeTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    await Task.findByIdAndUpdate(taskId, { status: 'completed' });
    res.redirect('/teacher/tasks');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    await Task.findByIdAndDelete(taskId);
    // Also delete related submissions and grades
    await Submission.deleteMany({ task: taskId });
    await Grade.deleteMany({ task: taskId });
    res.redirect('/teacher/tasks');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};