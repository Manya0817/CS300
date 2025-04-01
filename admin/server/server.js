
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const app = express();
const adminRoutes = require('./routes/adminRoutes');
const examRoutes = require('./routes/examRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/admin', adminRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api', tokenRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Event Ease Admin API' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});