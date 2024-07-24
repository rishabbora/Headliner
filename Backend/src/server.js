const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const queries = {
  'Finance News': 'Finance News',
  'US News': 'US News Today',
  'International News': 'International News',
  'Foreign Policy': 'Foreign Policy News',
  'Stock Market': 'Stock Market News',
  'Sports': 'Sports News',
};

const scripts = {
  'Finance': 'Finance.py',
  'US News': 'USNews.py',
  'International News': 'InternationalNews.py',
  'Foreign Policy': 'ForeignPolicy.py',
  'Stock Market': 'StockMarket.py',
  'Sports': 'Sports.py',
};

app.post('/run-python', (req, res) => {
  const { input, selectedBoxes } = req.body;
  console.log(`Received input: ${input}`);
  console.log(`Received selected boxes: ${selectedBoxes}`);
  const results = [];
  let completed = 0;

  const runScript = (scriptPath, query, box) => {
    console.log(`Running script for box: ${box} with query: ${query}`);
    const python_process = spawn('python', [scriptPath, query]);

    python_process.stdout.on('data', (data) => {
      console.log(`Received data from ${box} script: ${data.toString()}`);
      results.push({ box, result: data.toString() });
      completed += 1;
      if (completed === selectedBoxes.length + 1) {
        res.status(200).json({ result: results });
      }
    });

    python_process.stderr.on('data', (data) => {
      console.error(`Error from ${box} script: ${data.toString()}`);
      results.push({ box, error: data.toString() });
      completed += 1;
      if (completed === selectedBoxes.length + 1) {
        res.status(200).json({ result: results });
      }
    });
  };

  runScript(path.join(__dirname, 'python.py'), input || 'Default Query', 'Custom Query');

  selectedBoxes.forEach((box) => {
    const scriptPath = path.join(__dirname, scripts[box]);
    const query = queries[box];
    if (fs.existsSync(scriptPath)) {
      runScript(scriptPath, query, box);
    } else {
      results.push({ box, error: `Script for ${box} not found` });
      completed += 1;
      if (completed === selectedBoxes.length + 1) {
        res.status(200).json({ result: results });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
