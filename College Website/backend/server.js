const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

/************* * imported routes files***********************/
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes'); 
const facultyRoutes = require('./routes/facultyRoutes');
const profileRoutes = require('./routes/profileRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/****************Enable CORS for local development*********************/
app.use(cors({ 
  origin: 'http://localhost:3000',
  credentials: true
 }));

app.use(express.json());

/******************************* * Use routes middleware*****************************************/
app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes); 
app.use('/api/faculty', facultyRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to the College Website API');
});


/**********************Connect to MongoDB using Mongoose**************************************/
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));
  
/*****************Error handling middleware*******************/
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
