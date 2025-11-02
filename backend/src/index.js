const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Create MariaDB connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mariadb',  // container name from docker-compose
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'example',
  database: process.env.DB_NAME || 'fintrack',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Import and use routes
const createTransactionsRouter = require('./routes/transactions');
const transactionsRouter = createTransactionsRouter(pool);
app.use('/api/transactions', transactionsRouter);

// Default route
app.get('/', (req, res) => {
  res.send('Finance Tracker API is running...');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
