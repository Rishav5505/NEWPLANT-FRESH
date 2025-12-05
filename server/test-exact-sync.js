// Test the exact sync function logic
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../Datasets/flowering_plants.csv');

const extractPrice = (priceString) => {
  if (!priceString) return 0;
  
  // For outdoor/flowering CSV format: "Original price ₹ X ... Current price ₹ Y"
  // Match currency symbol with or without spaces
  const currentPriceMatch = priceString.match(/Current price\s*₹?\s*([\d,]+)/i);
  if (currentPriceMatch) {
    return parseInt(currentPriceMatch[1].replace(/,/g, '')) || 0;
  }
  
  // Fallback: extract any number with ₹
  const currencyMatch = priceString.match(/₹\s*([\d,]+)/);
  if (currencyMatch) {
    return parseInt(currencyMatch[1].replace(/,/g, '')) || 0;
  }
  
  // Last resort: extract any number
  const numberMatch = priceString.match(/[\d,]+/);
  if (numberMatch) {
    return parseInt(numberMatch[0].replace(/,/g, '')) || 0;
  }
  
  return 0;
};

let processedCount = 0;
let addedCount = 0;

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    processedCount++;
    
    // Parse CSV row - handle different column names for different CSV files
    const name = row.Title || row.Name || '';
    const priceField = row['Sale Price'] || row['Price'] || '';
    const price = extractPrice(priceField);
    
    if (processedCount <= 3) {
      console.log(`\nRow ${processedCount}:`);
      console.log('  row keys:', Object.keys(row));
      console.log('  row["Name"]:', row['Name']);
      console.log('  row["Price"]:', row['Price']);
      console.log('  JSON.stringify(row):', JSON.stringify(row).substring(0, 100));
    }
    
    if (name && price > 0) {
      addedCount++;
    }
  })
  .on('end', () => {
    console.log(`\n\nTotal processed: ${processedCount}`);
    console.log(`Total added: ${addedCount}`);
  })
  .on('error', (err) => {
    console.error('Error:', err);
  });
