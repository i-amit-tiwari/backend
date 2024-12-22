const express = require('express');
const Student = require('../models/Student');
const Course = require('../models/Course');
const auth = require('../middleware/authMiddleware'); 
const roles = require('../middleware/roleMiddleware');
const router = express.Router();

// Create student
router.post('/', async (req, res) => {
  console.log('Request body:', req.body);

  const student = new Student({
    name: req.body.name,
    email: req.body.email,
    courses: req.body.courses || [],
  });

  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    console.error('Error saving student:', err); 
    res.status(400).json({ message: err.message });
  }
});

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().populate('courses');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enroll in a course 
router.post('/:courseId/enroll/:studentId', auth, roles('student'), async (req, res) => { 
  console.log('Enroll route hit');
  try { 
    const student = await Student.findById(req.params.studentId);
    console.log('Student:', student);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const course = await Course.findById(req.params.courseId);
    console.log('Course:', course); 

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!student.courses.includes(course._id)) { 
      student.courses.push(course._id);
      await student.save(); 
      console.log('Enrollment saved:', student);
      return res.status(200).json({ message: 'Enrolled in course successfully' }); 
    } else { 
      return res.status(400).json({ message: 'Already enrolled in this course' }); 
    } 
  } catch (err) { 
    console.error('Server Error:', err);
    res.status(500).json({ message: 'Server error' });
  } 
});

module.exports = router;
