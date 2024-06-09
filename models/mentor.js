const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  mentorName: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

module.exports = mongoose.model('Mentor', mentorSchema);
