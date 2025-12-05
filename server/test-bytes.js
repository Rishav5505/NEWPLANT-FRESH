const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../Datasets/flowering_plants.csv');

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    const keys = Object.keys(row);
    const actualKeyAtIndex0 = keys[0];
    const literalName = 'Name';
    
    console.log('Key from Object.keys[0]:', actualKeyAtIndex0);
    console.log('Length:', actualKeyAtIndex0.length);
    console.log('Char codes:', Array.from(actualKeyAtIndex0).map(c => c.charCodeAt(0)));
    console.log('');
    console.log('Literal "Name"');
    console.log('Length:', literalName.length);
    console.log('Char codes:', Array.from(literalName).map(c => c.charCodeAt(0)));
    console.log('');
    console.log('Are they equal?', actualKeyAtIndex0 === literalName);
    console.log('Value via keys[0]:', row[actualKeyAtIndex0]);
    console.log('Value via "Name":', row['Name']);
    
    process.exit(0);
  });
