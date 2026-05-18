const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const { errorResponse } = require('./utils/apiResponse');

connectDB();

const app = express();

app.use(cors());

// Stripe webhook needs raw body BEFORE JSON parsing middleware
// Mount webhook routes with raw body parser
const webhookRouter = express.Router();
webhookRouter.use(express.raw({type: 'application/json'}));
webhookRouter.use(require('./routes/webhookRoutes'));
app.use('/api/webhook', webhookRouter);

// JSON parsing for other routes
app.use(express.json());

// Initialize Passport middleware
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/vendor', require('./routes/vendorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/password', require('./routes/passwordRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Auth error handler
app.get('/auth-error', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Authentication failed. Please try again.',
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Root - return server identity so hitting base URL confirms server
const pkg = require('./package.json');
app.get('/', (req, res) => {
  res.json({
    success: true,
    server: process.env.SERVER_NAME || pkg.name || 'backend',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
  });
});

app.use('/uploads', express.static('uploads'));

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