const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedDate: { type: Date, required: true, default: Date.now },
  deadline: { type: Date, required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
});

module.exports = mongoose.model('Task', taskSchema);