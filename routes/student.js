const express = require('express');
const Student = require('../models/student');
const Mentor = require('../models/mentor');
const mongoose = require('mongoose');
const router = express.Router();

// Create a student
router.post('/students', async (req, res) => {
  const { studentName } = req.body;
  if (!studentName) {
    return res.status(400).send({ error: 'Student name is required' });
  }

  const student = new Student({ studentName });
  try {
    await student.save();
    res.status(201).send(student);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Assign or change mentor for a student
router.patch('/students/:id/mentor', async (req, res) => {
  const studentId = req.params.id;
  const { mentorId } = req.body;

  // Log the request data for debugging
  console.log('Student ID:', studentId);
  console.log('Mentor ID:', mentorId);

  if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(mentorId)) {
    return res.status(400).send({ error: 'Invalid student or mentor ID' });
  }

  try {
    const student = await Student.findById(studentId);
    const newMentor = await Mentor.findById(mentorId);

    if (!student) {
      return res.status(404).send({ error: 'Student not found' });
    }

    if (!newMentor) {
      return res.status(404).send({ error: 'Mentor not found' });
    }

    // Remove student from old mentor if exists
    if (student.mentor) {
      const oldMentor = await Mentor.findById(student.mentor);
      oldMentor.students.pull(student._id);
      await oldMentor.save();
    }

    student.mentor = newMentor._id;
    newMentor.students.push(student._id);

    await student.save();
    await newMentor.save();
    res.send(student);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Show previously assigned mentor for a student
router.get('/students/:id/mentor', async (req, res) => {
  const studentId = req.params.id;

  // Log the request data for debugging
  console.log('Student ID:', studentId);

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).send({ error: 'Invalid student ID' });
  }

  try {
    const student = await Student.findById(studentId).populate('mentor');
    if (!student) {
      return res.status(404).send();
    }
    res.send(student.mentor);
  } catch (e) {
    res.status(500).send(e);
  }
});

// Get students without a mentor
router.get('/students/unassigned', async (req, res) => {
  try {
    const students = await Student.find({ mentor: null });
    res.send(students);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
