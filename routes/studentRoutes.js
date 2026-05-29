const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// 1. Require multer
const multer = require('multer');
// 2. Create a multer instance that will handle text-only (non-file) form submissions
const upload = multer();

router.get('/dashboard', studentController.getDashboard);
router.get('/tasks', studentController.viewTasks);
router.get('/tasks/:taskId/submit', studentController.submitTaskForm);

// 3. Use the instance as middleware in your POST route.
// 'upload.none()' will parse the form data and populate req.body
router.post('/tasks/:taskId/submit', upload.none(), studentController.submitTask);

module.exports = router;