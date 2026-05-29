const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  submissionDate: { type: Date, default: Date.now },
  content: { type: String, required: true },
  fileUrl: { type: String }
});

module.exports = mongoose.model('Submission', submissionSchema);