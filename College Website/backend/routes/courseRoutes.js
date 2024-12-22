const express = require('express');
const Course = require('../models/Course');
const Student = require('../models/Student');
const router = express.Router();
const Joi = require('joi');
const auth = require('../middleware/authMiddleware');
const roles = require('../middleware/roleMiddleware');
const User = require('../models/User');


// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Course schema validation
const courseSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(5).required(),
  credits: Joi.number().integer().min(1).required(),
});

// Create a course with validation
router.post('/', async (req, res) => {
  const { error } = courseSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const course = new Course({
    name: req.body.name,
    description: req.body.description,
    credits: req.body.credits,
  });

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a course with validation
router.put('/:id', async (req, res) => {
  const { error } = courseSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.name = req.body.name || course.name;
    course.description = req.body.description || course.description;
    course.credits = req.body.credits || course.credits;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Delete a course
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { name, credits } = req.query;
    const query = {};

    if (name) query.name = { $regex: name, $options: 'i' };  // Case insensitive search
    if (credits) query.credits = credits;

    const courses = await Course.find(query);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get students enrolled in a course 
router.get('/:id/students', auth, roles(['admin', 'faculty']), async (req, res) => { 
  try { 
    const course = await Course.findById(req.params.id); 
    if (!course) { 
      return res.status(404).json({ message: 'Course not found' });
      }
      const students = await Student.find({ courses: course._id }); 
      res.json(students); 
    } catch (err) { 
      res.status(500).json({ message: err.message });
    }
});

// Enroll a student in a course
router.post('/:courseId/enroll/:userId', auth, async (req, res) => {
  console.log("Enrollment request received");
  try {
    const { courseId, userId } = req.params;

    // Find the course by ID
    const course = await Course.findById(courseId);
    console.log('courseId', courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Find the student by ID
    const student = await Student.findById(userId);
    console.log('userId : ', userId);

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Ensure the courses array is initialized
    if (!student.courses) {
      student.courses = [];
    }

    // Check if the student is already enrolled
    if (student.courses.includes(courseId)) {
      console.log(student.courses);
      return res.status(400).json({ message: 'Student already enrolled in this course' });
    }

    // Enroll the student in the course
    student.courses.push(courseId);
    await student.save();
    console.log("userId", userId);
    res.status(200).json({ message: 'Student enrolled successfully' });
  } catch (err) {
    console.error('Error enrolling student:', err); // Log the error
    res.status(500).json({ message: err.message,  });
  }
});


// Example route that only admins and faculty can access
router.get('/admin-dashboard', auth, roles('admin', 'faculty'), (req, res) => {
  res.send('Welcome to the admin dashboard');
});



module.exports = router;
