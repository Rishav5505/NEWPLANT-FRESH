const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../Datasets/flowering_plants.csv');

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    console.log('Type of row:', typeof row);
    console.log('Constructor:', row.constructor.name);
    console.log('Object.keys:', Object.keys(row));
    console.log('Object.getOwnPropertyNames:', Object.getOwnPropertyNames(row));
    
    const descriptor = Object.getOwnPropertyDescriptor(row, 'Name');
    console.log('Descriptor for "Name":', descriptor);
    
    // Try using Object.getOwnPropertyNames and accessing that way
    const names = Object.getOwnPropertyNames(row);
    if (names.length > 0) {
      console.log('First property name:', names[0]);
      console.log('First property value:', row[names[0]]);
    }
    
    process.exit(0);
  });
