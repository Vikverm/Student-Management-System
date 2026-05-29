// const mongoose = require('mongoose');

// const attendanceSchema = new mongoose.Schema({
//   student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
//   date: { type: Date, required: true, default: Date.now },
//   status: { type: String, enum: ['present', 'absent'], required: true },
//   markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true }
// });

// module.exports = mongoose.model('Attendance', attendanceSchema);
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: [true, 'Student ID is required'] 
  },
  date: { 
    type: Date, 
    required: [true, 'Date is required'],
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: {
      values: ['present', 'absent'],
      message: 'Status must be either present or absent'
    },
    required: [true, 'Status is required'] 
  },
  markedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher', 
    required: [true, 'Teacher ID is required'] 
  }
}, {
  timestamps: true
});

// Add compound index to prevent duplicate attendance records
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);