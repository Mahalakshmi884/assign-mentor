const express = require('express');
const Mentor = require('../models/mentor');
const Student = require('../models/student');
const mongoose = require('mongoose');
const router = express.Router();

// Create a mentor
router.post('/mentors', async (req, res) => {
  const { mentorName } = req.body;
  if (!mentorName) {
    return res.status(400).send({ error: 'Mentor name is required' });
  }

  const mentor = new Mentor({ mentorName });
  try {
    await mentor.save();
    res.status(201).send(mentor);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Assign multiple students to a mentor
router.post('/mentors/:id/students', async (req, res) => {
  const mentorId = req.params.id;
  const { studentIds } = req.body;

  // Log the request data for debugging
  console.log('Mentor ID:', mentorId);
  console.log('Student IDs:', studentIds);

  if (!studentIds || !Array.isArray(studentIds)) {
    return res.status(400).send({ error: 'studentIds must be an array of student IDs' });
  }

  if (!mongoose.Types.ObjectId.isValid(mentorId)) {
    return res.status(400).send({ error: 'Invalid mentor ID' });
  }

  try {
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).send({ error: 'Mentor not found' });
    }

    const validStudentIds = studentIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const students = await Student.find({ _id: { $in: validStudentIds }, mentor: null });

    if (students.length === 0) {
      return res.status(404).send({ error: 'No unassigned students found' });
    }

    students.forEach(student => {
      student.mentor = mentor._id;
      mentor.students.push(student._id);
      student.save();
    });

    await mentor.save();
    res.send(mentor);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Show all students for a particular mentor
router.get('/mentors/:id/students', async (req, res) => {
  const mentorId = req.params.id;
  
  // Log the request data for debugging
  console.log('Mentor ID:', mentorId);

  if (!mongoose.Types.ObjectId.isValid(mentorId)) {
    return res.status(400).send({ error: 'Invalid mentor ID' });
  }

  try {
    const mentor = await Mentor.findById(mentorId).populate('students');
    if (!mentor) {
      return res.status(404).send();
    }
    res.send(mentor.students);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
