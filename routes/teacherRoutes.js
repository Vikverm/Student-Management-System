const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

router.get('/dashboard', teacherController.getDashboard);
router.get('/tasks', teacherController.viewTasks);
router.get('/tasks/add', teacherController.addTaskForm);
router.post('/tasks/add', teacherController.addTask);
router.get('/tasks/:taskId/submissions', teacherController.viewSubmissions);
router.get('/attendance/mark', teacherController.markAttendanceForm);
router.post('/attendance/mark', teacherController.markAttendance);
router.post('/attendance/mark', async (req, res, next) => {
  try {
    await teacherController.markAttendance(req, res);
  } catch (error) {
    const students = await Student.find();
    res.render('teacher/markAttendance', { 
      students,
      error: error.message 
    });
  }
});
router.get('/tasks/:taskId/grade/:studentId', teacherController.gradeSubmissionForm);
router.post('/tasks/:taskId/grade/:studentId', teacherController.gradeSubmission);
router.post('/tasks/:taskId/complete', teacherController.completeTask);
router.post('/tasks/:taskId/delete', teacherController.deleteTask);

module.exports = router;