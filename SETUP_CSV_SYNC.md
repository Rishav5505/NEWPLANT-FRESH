# 🌿 CSV to MongoDB Sync - Quick Start Guide

## What's New ✨

Your backend now syncs data from the CSV file (`Datasets/enutrof_120_plants_final.csv`) directly to MongoDB's Indore collection. You only need to update the CSV file, and the rest happens automatically!

## Step-by-Step Setup

### 1️⃣ Install CSV Parser Package
```bash
cd server
npm install csv-parser
```

### 2️⃣ Configure Environment Variables
Make sure your `.env` file in `server/` has:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_SECRET=admin_secret_for_setup
PORT=4000
```

### 3️⃣ Start the Server
```bash
npm run dev
```

When the server starts, it will:
- ✅ Connect to MongoDB
- ✅ Read the CSV file
- ✅ Parse all plant data
- ✅ Sync to Indore collection (category: "indoor")
- ✅ Clear old data and insert fresh data

## How to Use

### 📝 Updating Plant Data

#### Method 1: Edit CSV File (Recommended)
1. Open `Datasets/enutrof_120_plants_final.csv` in Excel or any text editor
2. Update plant names, prices, descriptions, images
3. Save the file
4. Restart server: `npm run dev`
5. ✅ Changes automatically sync to MongoDB!

#### Method 2: Resync via API
If you made changes to CSV but don't want to restart server:

```bash
POST /api/admin/plants/resync-csv
Headers: 
  Authorization: Bearer <your_admin_token>
```

### 🔍 Getting Data

#### Frontend (IndorePlants Component)
```javascript
// Component automatically fetches from:
GET /api/plants/indoor
```

#### Manual API Calls
```bash
# Get all indoor plants
GET http://localhost:4000/api/plants/indoor

# Get plants by category
GET http://localhost:4000/api/plants/flowering
GET http://localhost:4000/api/plants/outdoor
GET http://localhost:4000/api/plants/planters
GET http://localhost:4000/api/plants/care-kits

# Search plants
GET http://localhost:4000/api/plants/search/monstera

# Get single plant
GET http://localhost:4000/api/plants/detail/[PLANT_ID]
```

### ➕ Adding Other Plants (Non-CSV)

For plants not in CSV (Other categories):
```bash
POST /api/admin/plants
Headers: 
  Authorization: Bearer <your_admin_token>
  Content-Type: application/json

Body:
{
  "name": "Rose",
  "category": "flowering",
  "salePrice": 399,
  "oldPrice": 499,
  "description": "Beautiful red roses",
  "imageUrl": "https://example.com/rose.jpg"
}
```

### ✏️ Editing Manual Plants

```bash
POST /api/admin/plants/[PLANT_ID]/update
Headers: 
  Authorization: Bearer <your_admin_token>
  Content-Type: application/json

Body:
{
  "salePrice": 349
}
```

⚠️ **Note**: CSV synced plants cannot be edited via API. Edit the CSV file instead.

### 🗑️ Deleting Manual Plants

```bash
POST /api/admin/plants/[PLANT_ID]/delete
Headers: 
  Authorization: Bearer <your_admin_token>
```

⚠️ **Note**: CSV synced plants cannot be deleted via API.

## CSV File Format

Your CSV must have these exact column names:
```
Title | Sale Price | Old Price | Description | Image URL
```

**Example:**
```csv
Title,Sale Price,Old Price,Description,Image URL
Calathea Plant,390,,Easy Green Touch...,https://cdn.shopify.com/image1.jpg
Monstera Deliciosa,439,,Refresh Your Home...,https://cdn.shopify.com/image2.jpg
Snake Plant,299,,Tough Indoor Plant...,https://cdn.shopify.com/image3.jpg
```

## Data Flow Diagram

```
┌─────────────────────────┐
│ CSV File in Datasets/   │
│ enutrof_120_plants_     │
│ final.csv               │
└────────────┬────────────┘
             │ (Server Startup)
             │ or
             │ (Admin Resync API)
             ▼
┌─────────────────────────┐
│ CSV Parser (csv-parser) │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ MongoDB Plant Collection│
│ Category: "indoor"      │
│ syncedFrom: "csv"       │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Backend API             │
│ /api/plants/indoor      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Frontend IndorePlants   │
│ Component               │
│ (Displays to User)      │
└─────────────────────────┘
```

## Troubleshooting

### ❌ "CSV file not found"
- Check path: `Datasets/enutrof_120_plants_final.csv`
- File should be at root level of plant directory

### ❌ Plants not showing
1. Check if MongoDB is running
2. Verify MONGO_URI in `.env`
3. Check server console for error messages

### ❌ Changes not appearing
1. Make sure you saved the CSV file
2. Restart server: `npm run dev`
3. Or call resync API endpoint

### ❌ Cannot edit plants
- If `syncedFrom: "csv"` - Edit CSV and resync
- If `syncedFrom: "manual"` - Use update API

## File Locations

```
plant/
├── Datasets/
│   └── enutrof_120_plants_final.csv      ← Update this
├── server/
│   ├── .env                              ← Configure this
│   ├── index.js                          ← Main server
│   ├── package.json                      ← csv-parser added
│   ├── models/
│   │   └── Plant.js                      ← New model
│   └── utils/
│       └── csvSync.js                    ← New sync utility
└── src/components/
    └── IndorePlants.jsx                  ← Updated to use API
```

## What Changed?

✅ **Created:**
- `server/models/Plant.js` - Plant database model
- `server/utils/csvSync.js` - CSV parser and sync logic
- API endpoints for plants
- Auto-sync on server startup

✅ **Updated:**
- `server/index.js` - Added plant routes and CSV sync
- `server/package.json` - Added csv-parser dependency
- `src/components/IndorePlants.jsx` - Fetches from API

✅ **Created:**
- `server/CSV_SYNC_README.md` - Detailed documentation

## Next Steps

1. ✅ CSV sync configured
2. ✅ Backend API ready
3. ✅ IndorePlants component updated
4. 📝 Update other plant components similarly (FloweringPlants, OutdoorPlants, etc.)
5. 📝 Optional: Add CSV upload feature to Admin Dashboard

## Support

For detailed information, check: `server/CSV_SYNC_README.md`
