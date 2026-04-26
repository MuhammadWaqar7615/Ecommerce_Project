const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorResponse } = require('./utils/apiResponse');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/vendor', require('./routes/vendorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/password', require('./routes/passwordRoutes'));
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  errorResponse(res, 'Route not found', 404);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  errorResponse(res, err.message || 'Server error', 500);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});