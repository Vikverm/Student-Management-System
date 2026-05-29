const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  marks: { type: Number, required: true },
  remarks: { type: String },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  gradedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grade', gradeSchema);