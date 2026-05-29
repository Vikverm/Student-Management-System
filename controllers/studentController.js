const Student = require('../models/Student');
const Task = require('../models/Task');
const Submission = require('../models/Submission');
const Grade = require('../models/Grade');
const Attendance = require('../models/Attendance');

exports.getDashboard = async (req, res) => {
  try {
    // This is your existing logic to get a student
    let student = await Student.findOne();
    if (!student) {
      student = new Student({
        name: "Default Student",
        email: "student@example.com",
        rollNumber: "1001",
        class: "10A"
      });
      await student.save();
    }

    // --- THIS IS THE FIX ---
    // Instead of using req.user.id, which can crash,
    // we use the ID from the student object you already have.
    const studentId = student._id;

    // The rest of your existing queries will now work correctly
    // because studentId is always defined.
    const newTasks = await Task.find({ assignedTo: studentId, status: 'pending' })
      .populate('assignedBy')
      .sort({ deadline: 1 });

    const completedTasks = await Task.find({ assignedTo: studentId, status: 'completed' })
      .populate('assignedBy')
      .sort({ deadline: 1 });

    const grades = await Grade.find({ student: studentId })
      .populate('task')
      .populate('gradedBy');

    const attendance = await Attendance.find({ student: studentId })
      .sort({ date: -1 })
      .limit(30);

    const submissions = await Submission.find({ student: studentId })
      .populate({
        path: 'task',
        populate: {
          path: 'assignedBy',
          select: 'name'
        }
      });
    const successMessage = req.query.success;
    res.render('student/dashboard', {
      student,
      user: req.user, // You can still pass req.user to the view
      newTasks,
      completedTasks,
      submissions,
      grades,
      attendance,
      successMessage
    });
  } catch (error) {
    console.error(error);
    // This will now only catch unexpected errors
    res.status(500).send(error.toString()); // Send a string error instead of {}
  }
};


exports.viewTasks = async (req, res) => {
  try {
    const student = await Student.findOne();
    const tasks = await Task.find({ assignedTo: student._id })
      .populate('assignedBy')
      .sort({ deadline: 1 });

    const tasksWithDetails = await Promise.all(tasks.map(async task => {
      const submission = await Submission.findOne({
        task: task._id,
        student: student._id
      });

      const grade = await Grade.findOne({
        task: task._id,
        student: student._id
      }).populate('gradedBy');

      return {
        ...task.toObject(),
        submission,
        grade
      };
    }));

    res.render('student/viewTasks', {
      student,
      tasks: tasksWithDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

exports.submitTaskForm = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send('Task not found');
    }

    res.render('student/submitTask', { task });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

exports.submitTask = async (req, res) => {
  try {
    // Debugging: Log the entire request body
    console.log('Request Body:', req.body);

    const { taskId } = req.params;
    const content = req.body.content;

    // Basic validation
    if (!content || content.trim() === '') {
      return res.status(400).render('student/submitTask', {
        task: await Task.findById(taskId),
        error: 'Content is required'
      });
    }

    const student = await Student.findOne();
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send('Task not found');
    }

    const submission = new Submission({
      task: taskId,
      student: student._id,
      content: content.trim() // Trim whitespace
    });

    await submission.save();

    // Update task status
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    res.redirect('/student/dashboard?success=Task submitted successfully.');
  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).render('error', {
      message: 'Failed to submit task',
      error
    });
  }
};