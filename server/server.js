
const dns = require('node:dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const invoiceRoutes = require('./routes/invoiceRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const paypalRoutes = require('./routes/paypalRoutes');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      process.env.CLIENT_URL,
    ].filter(Boolean),
  })
);

app.use(express.json());

app.use('/api/transactions', transactionRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/invoices', invoiceRoutes);
// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FinPilot Backend!',
    status: 'Server is running successfully'
  });
});

// Health check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FinPilot API is working!'
  });
});

// Server port
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`FinPilot server running on port ${PORT}`);
  });
};

startServer();
