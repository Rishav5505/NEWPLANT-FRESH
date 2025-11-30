const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Plant = require('../models/Plant');

// CSV file paths for different categories
const CSV_PATHS = {
  indoor: path.join(__dirname, '../../Datasets/IndoorCollection1.csv'),
  flowering: path.join(__dirname, '../../Datasets/FloweringPlant1.xlsx')
};

// Store for debouncing file changes
let syncTimeouts = {};
let watchers = {};

// Parse and sync CSV data to MongoDB Indore collection
async function syncCSVToDatabase(category = 'indoor') {
  try {
    const filePath = CSV_PATHS[category];
    
    if (!fs.existsSync(filePath)) {
      console.error(`CSV file not found at ${filePath}`);
      return { success: false, message: 'CSV file not found' };
    }

    const plants = [];
    
    // Read CSV file
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Parse CSV row
          const plant = {
            name: row.Title || '',
            category: category, // All CSV data goes to 'indoor' category
            salePrice: parseInt(row['Sale Price']) || 0,
            oldPrice: row['Old Price'] ? parseInt(row['Old Price']) : null,
            description: row.Description || '',
            imageUrl: row['Image URL'] || '',
            csvId: row.Title || '', // Use Title as unique identifier
            syncedFrom: 'csv'
          };
          plants.push(plant);
        })
        .on('end', async () => {
          try {
            // Clear existing indoor plants from CSV
            await Plant.deleteMany({ category: category, syncedFrom: 'csv' });
            
            // Insert new plants from CSV
            if (plants.length > 0) {
              await Plant.insertMany(plants);
              console.log(`✅ Synced ${plants.length} plants from CSV to database`);
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
async function resyncCSV() {
  try {
    const result = await syncCSVToDatabase('indoor');
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

module.exports = { syncCSVToDatabase, resyncCSV, watchCSVFile, stopWatchingCSVFile };
