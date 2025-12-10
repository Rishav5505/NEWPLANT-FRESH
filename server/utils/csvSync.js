const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Plant = require('../models/Plant');

// CSV file paths for different categories
const CSV_PATHS = {
  indoor: path.join(__dirname, '../../Datasets/IndoorCollection1.csv'),
  flowering: path.join(__dirname, '../../Datasets/flowering_plants.csv'),
  planters: path.join(__dirname, '../../Datasets/Planter and pots.csv'),
  'care-kits': path.join(__dirname, '../../Datasets/carekits.csv'),
  outdoor: path.join(__dirname, '../../Datasets/outdoor_plants.csv')
};

// Store for debouncing file changes
let syncTimeouts = {};
let watchers = {};

// Parse and sync CSV data to MongoDB
async function syncCSVToDatabase(category = 'indoor') {
  try {
    const filePath = CSV_PATHS[category];
    
    if (!fs.existsSync(filePath)) {
      console.error(`CSV file not found at ${filePath}`);
      return { success: false, message: 'CSV file not found' };
    }

    const plants = [];
    
    // Helper function to extract price from formatted string
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
    
    // Read CSV file
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Handle BOM in CSV headers - csv-parser may include BOM character in first key
          // Get the actual keys, handling BOM prefix
          const rowKeys = Object.keys(row);
          const cleanRow = {};
          
          for (const key of rowKeys) {
            // Remove BOM character (U+FEFF) if present
            const cleanKey = key.replace(/^\uFEFF/, '');
            cleanRow[cleanKey] = row[key];
          }
          
          // Parse CSV row - handle different column names for different CSV files
          const name = cleanRow.Title || cleanRow.Name || '';
          const priceField = cleanRow['Sale Price'] || cleanRow['Price'] || '';
          const price = extractPrice(priceField);
          
          const plant = {
            name: name,
            category: category,
            salePrice: price,
            oldPrice: cleanRow['Old Price'] ? extractPrice(cleanRow['Old Price']) : null,
            description: cleanRow.Description || '',
            imageUrl: cleanRow['Image URL'] || '',
            csvId: name, // Use Title/Name as unique identifier
            syncedFrom: 'csv'
          };
          
          // Only add if it has a name and price
          if (plant.name && plant.salePrice > 0) {
            plants.push(plant);
          }
        })
        .on('end', async () => {
          try {
            // Clear existing plants from CSV for this category
            await Plant.deleteMany({ category: category, syncedFrom: 'csv' });
            
            // Insert new plants from CSV
            if (plants.length > 0) {
              await Plant.insertMany(plants);
              console.log(`✅ Synced ${plants.length} ${category} plants from CSV to database`);
            }
            
            resolve({ 
              success: true, 
              message: `Synced ${plants.length} plants from CSV`,
              count: plants.length
            });
          } catch (err) {
            console.error('Error inserting plants:', err);
            reject({ success: false, message: 'Error inserting plants', error: err.message });
          }
        })
        .on('error', (err) => {
          console.error('CSV parsing error:', err);
          reject({ success: false, message: 'CSV parsing error', error: err.message });
        });
    });
  } catch (err) {
    console.error('Sync error:', err);
    return { success: false, message: 'Sync error', error: err.message };
  }
}

// Manual resync endpoint
async function resyncCSV(category = 'indoor') {
  try {
    const result = await syncCSVToDatabase(category);
    return result;
  } catch (err) {
    return { success: false, message: 'Resync error', error: err.message };
  }
}

// Start watching all CSV/XLSX files for changes
function watchCSVFile() {
  try {
    Object.keys(CSV_PATHS).forEach(category => {
      const filePath = CSV_PATHS[category];
      
      // Close existing watcher if any
      if (watchers[category]) {
        watchers[category].close();
      }

      // Create new watcher
      watchers[category] = fs.watch(filePath, { persistent: true }, (eventType, filename) => {
        if (eventType === 'change') {
          console.log(`📝 ${category.toUpperCase()} file changed, re-syncing...`);
          
          // Clear previous timeout for this category
          clearTimeout(syncTimeouts[category]);
          
          // Debounce - wait 2 seconds before syncing
          syncTimeouts[category] = setTimeout(async () => {
            try {
              const result = await syncCSVToDatabase(category);
              if (result.success) {
                console.log(`✅ ${category.toUpperCase()} sync successful: ${result.count} plants updated`);
              }
            } catch (err) {
              console.error(`Real-time sync error for ${category}:`, err);
            }
          }, 2000);
        }
      });

      console.log(`👁️ ${category.toUpperCase()} file watcher started - monitoring ${filePath}`);
    });
  } catch (err) {
    console.error('Error setting up file watchers:', err);
  }
}

// Stop watching all CSV/XLSX files
function stopWatchingCSVFile() {
  Object.keys(watchers).forEach(category => {
    if (watchers[category]) {
      watchers[category].close();
      watchers[category] = null;
    }
  });
  
  Object.keys(syncTimeouts).forEach(category => {
    if (syncTimeouts[category]) {
      clearTimeout(syncTimeouts[category]);
      syncTimeouts[category] = null;
    }
  });
  
  console.log('🛑 All file watchers stopped');
}

module.exports = { syncCSVToDatabase, resyncCSV, watchCSVFile, stopWatchingCSVFile, CSV_PATHS };
