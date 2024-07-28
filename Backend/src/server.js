const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

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
  'Random': 'Random.py' 
};

app.post('/run-python', (req, res) => {
  const { input, selectedBoxes } = req.body;
  console.log(`Received input: ${input}`);
  console.log(`Received selected boxes: ${selectedBoxes}`);
  const results = [];
  let customQueryResult = '';
  let completed = 0;

  const runScript = (scriptPath, query, box, isCustom = false) => {
    console.log(`Running script for box: ${box} with query: ${query}`);
    const python_process = spawn('python', [scriptPath, query]);

    python_process.stdout.on('data', (data) => {
      console.log(`Received data from ${box} script: ${data.toString()}`);
      const parsedData = JSON.parse(data.toString().replace(/'/g, '"')); // Parse the received JSON data
      if (isCustom) {
        customQueryResult = parsedData;
      } else {
        results.push({ box, result: parsedData });
      }
      completed += 1;
      if (completed === selectedBoxes.length + (input.trim() ? 1 : 0)) {
        if (customQueryResult) {
          results.unshift({ box: 'Custom Query', result: customQueryResult });
        }
        res.status(200).json({ result: results });
      }
    });

    python_process.stderr.on('data', (data) => {
      console.error(`Error from ${box} script: ${data.toString()}`);
      results.push({ box, error: data.toString() });
      completed += 1;
      if (completed === selectedBoxes.length + (input.trim() ? 1 : 0)) {
        if (customQueryResult) {
          results.unshift({ box: 'Custom Query', result: customQueryResult });
        }
        res.status(200).json({ result: results });
      }
    });
  };

  if (input.trim()) {
    runScript(path.join(__dirname, 'python.py'), input, 'Custom Query', true);
  }

  if (selectedBoxes.length === 0 && !input.trim()) {
    // Run the Random script if no boxes are selected and no custom query is given
    runScript(path.join(__dirname, scripts['Random']), '', 'Random');
  } else {
    selectedBoxes.forEach((box) => {
      const scriptPath = path.join(__dirname, scripts[box]);
      const query = queries[box];
      if (fs.existsSync(scriptPath)) {
        runScript(scriptPath, query, box);
      } else {
        results.push({ box, error: `Script for ${box} not found` });
        completed += 1;
        if (completed === selectedBoxes.length + (input.trim() ? 1 : 0)) {
          if (customQueryResult) {
            results.unshift({ box: 'Custom Query', result: customQueryResult });
          }
          res.status(200).json({ result: results });
        }
      }
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
