const csv = require('csv-parser');
const fs = require('fs');

let count = 0;
let totalLines = 0;

// Read raw file to count lines
const lines = fs.readFileSync('../Datasets/flowering_plants.csv', 'utf-8').split('\n');
totalLines = lines.length;

console.log('Total file lines:', totalLines);
console.log('Header:', lines[0]);
console.log('\nFirst data line (line 2):');
console.log(lines[1].substring(0, 100));

// Now use csv-parser
const options = {
  separator: ',',
  quote: '"',
  escape: '"'
};

const rows = [];
fs.createReadStream('../Datasets/flowering_plants.csv')
  .pipe(csv(options))
  .on('data', (row) => {
    rows.push(row);
  })
  .on('end', () => {
    console.log('\nCSV parsed rows:', rows.length);
    if (rows.length > 0) {
      console.log('\nFirst parsed row:');
      console.log('Keys:', Object.keys(rows[0]));
      for (const key of Object.keys(rows[0])) {
        const val = rows[0][key];
        console.log(`  ${key}: ${val ? val.substring(0, 50) : 'EMPTY'}`);
      }
    }
  });
