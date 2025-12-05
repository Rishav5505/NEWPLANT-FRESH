const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../Datasets/flowering_plants.csv');

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    const nameKey = 'Name';
    
    console.log('Direct access row["Name"]:', row['Name']);
    console.log('Variable access row[nameKey]:', row[nameKey]);
    console.log('Dot notation row.Name:', row.Name);
    
    const keys = Object.keys(row);
    console.log('Via keys[0] (row[keys[0]]):', row[keys[0]]);
    
    // Try using for...in
    let found = false;
    for (const key in row) {
      if (key === 'Name') {
        console.log('Found via for...in, value:', row[key]);
        found = true;
        break;
      }
    }
    if (!found) console.log('Name not found via for...in');
    
    process.exit(0);
  });
