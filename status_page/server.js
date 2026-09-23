const express = require('express');
const { Pool } = require('pg');
const http = require('http');

const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
const port = 3001;

const pool = new Pool({
  host: process.env.PGHOST || 'database',
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: 5432,
});

const checkService = (url) => {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 401 ? 'up' : 'degraded');
    });
    
    req.on('error', () => resolve('down'));
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve('down');
    });
  });
};

app.get('/api/health', async (req, res) => {
  const status = {
    database: 'down',
    frontend: 'down',
    backend: 'down',
    timestamp: new Date().toISOString()
  };

  try {
    const dbRes = await pool.query('SELECT 1');
    if (dbRes.rowCount === 1) status.database = 'up';
  } catch (err) {
    status.database = 'down'; 
  }

  status.frontend = await checkService('http://frontend:3000');

  status.backend = await checkService('http://backend:3000');

  const isHealthy = status.database === 'up' && status.frontend === 'up' && status.backend === 'up';
  
  res.status(isHealthy ? 200 : 503).json(status);
});

app.listen(port, () => {
  console.log(`Status page health server running on port ${port}`);
});