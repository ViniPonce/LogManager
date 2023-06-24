const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/logs', (req, res) => {
  const { logType } = req.query;
  let query = '';

  switch (logType) {
    case 'deliveryservicememoryusage':
      query = 'SELECT * FROM deliveryservicememoryusage ORDER BY timestamp DESC LIMIT 0, 100';
      break;
    case 'awmdetectionlog':
      query = 'SELECT * FROM onofflog ORDER BY timestamp DESC LIMIT 0, 250';
      break;

    default:
      res.status(400).json({ error: 'Invalid Log Type' });
      return;
  }

  db.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error searching log files' });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
