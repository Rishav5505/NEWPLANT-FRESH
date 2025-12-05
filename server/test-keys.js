const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../Datasets/flowering_plants.csv');

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    console.log('Keys:', Object.keys(row));
    console.log('Values:');
    for (const [key, value] of Object.entries(row)) {
      const displayVal = value ? value.substring(0, 40) : 'undefined';
      console.log(`  "${key}": "${displayVal}"`);
    }
    process.exit(0);
  });
