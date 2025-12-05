const csv = require('csv-parser');
const fs = require('fs');

let count = 0;

fs.createReadStream('../Datasets/flowering_plants.csv')
  .pipe(csv())
  .on('data', (row) => {
    if (count < 5) {
      console.log(`\n--- Row ${count + 1} ---`);
      console.log('Keys:', Object.keys(row));
      console.log('Name field:');
      console.log('  exists:', !!row.Name);
      console.log('  value:', JSON.stringify(row.Name));
      console.log('  type:', typeof row.Name);
      console.log('  length:', row.Name ? row.Name.length : 'N/A');
      console.log('  truthiness:', !!row.Name);
      
      if (row.Name) {
        const extractPrice = (priceString) => {
          if (!priceString) return 0;
          const currentPriceMatch = priceString.match(/Current price\s*₹?\s*([\d,]+)/i);
          if (currentPriceMatch) {
            return parseInt(currentPriceMatch[1].replace(/,/g, '')) || 0;
          }
          const currencyMatch = priceString.match(/₹\s*([\d,]+)/);
          if (currencyMatch) {
            return parseInt(currencyMatch[1].replace(/,/g, '')) || 0;
          }
          const numberMatch = priceString.match(/[\d,]+/);
          if (numberMatch) {
            return parseInt(numberMatch[0].replace(/,/g, '')) || 0;
          }
          return 0;
        };
        
        const price = extractPrice(row.Price);
        console.log('Price extracted:', price);
        console.log('Will be added:', !!(row.Name && price > 0));
      }
    }
    count++;
  })
  .on('end', () => {
    console.log(`\nTotal rows: ${count}`);
  });
