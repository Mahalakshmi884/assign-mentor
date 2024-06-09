const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const mentorRoutes = require('./routes/mentor');
const studentRoutes = require('./routes/student');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/mentor-student', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(mentorRoutes);
app.use(studentRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
