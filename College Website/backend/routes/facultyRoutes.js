const express = require('express');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course'); 
const auth = require('../middleware/authMiddleware'); 
const roles = require('../middleware/roleMiddleware');
const router = express.Router();

// Create faculty
router.post('/', async (req, res) => {
  const faculty = new Faculty({
    name: req.body.name,
    email: req.body.email,
    department: req.body.department,
    courses: req.body.courses,
  });

  try {
    const newFaculty = await faculty.save();
    res.status(201).json(newFaculty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all faculty
router.get('/', async (req, res) => {
  try {
    const faculty = await Faculty.find().populate('courses');
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign course to faculty
router.post('/:facultyId/assign/:courseId', auth, roles('admin'), async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.facultyId);
    const course = await Course.findById(req.params.courseId);

    if (!faculty || !course) {
      return res.status(404).json({ message: 'Faculty or Course not found' });
    }

    if (!faculty.courses.includes(course._id)) {
      faculty.courses.push(course._id);
      await faculty.save();
      return res.status(200).json({ message: 'Course assigned to faculty successfully' });
    } else {
      return res.status(400).json({ message: 'Course already assigned to this faculty' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
