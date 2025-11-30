# Indoor Plants Collection - CSV to MongoDB Sync Setup

## Overview
The Indoor Plants collection is now connected to the `enutrof_120_plants_final.csv` file. Any updates you make to this CSV file will automatically sync to the MongoDB database on server startup.

## How It Works

### 1. **CSV Data Source**
- Location: `Datasets/enutrof_120_plants_final.csv`
- Contains: Plant names, sale prices, old prices, descriptions, and image URLs
- All CSV data automatically syncs to MongoDB `Indore` collection (category: "indoor")

### 2. **Automatic Sync Process**
- **When**: Server starts up (`npm run dev` or `npm start`)
- **What**: All indoor plant data from CSV is loaded into MongoDB
- **Where**: Stored in `Plant` collection with category "indoor"

### 3. **Data Management**

#### For CSV-Synced Data (Indore Plants):
- **To Update**: Edit the `enutrof_120_plants_final.csv` file directly
- **To Sync**: Restart the server or call `/api/admin/plants/resync-csv` endpoint
- **Cannot Edit**: Via API (protected - shows error message)
- **Cannot Delete**: Via API (protected - shows error message)

#### For Manual Data (Other Categories):
- **Create**: `POST /api/admin/plants`
- **Update**: `POST /api/admin/plants/:id/update`
- **Delete**: `POST /api/admin/plants/:id/delete`

## API Endpoints

### Public Endpoints

```
GET /api/plants/indoor
- Get all indoor plants from CSV sync

GET /api/plants/:category
- Get plants by category (indoor, flowering, outdoor, planters, care-kits)

GET /api/plants/detail/:id
- Get single plant details by ID

GET /api/plants/search/:query
- Search plants by name or description
```

### Admin Endpoints (Requires Authentication)

```
POST /api/admin/plants/resync-csv
- Manually resync CSV data to database

GET /api/admin/plants
- Get all plants for management

POST /api/admin/plants
- Create a new plant manually

POST /api/admin/plants/:id/update
- Update a plant (only manual plants)

POST /api/admin/plants/:id/delete
- Delete a plant (only manual plants)
```

## CSV File Format

The CSV file should have these columns:
```
Title | Sale Price | Old Price | Description | Image URL
```

Example:
```csv
Title,Sale Price,Old Price,Description,Image URL
Calathea Plant,390,,Description here...,https://example.com/image.jpg
Monstera Deliciosa,439,,Description here...,https://example.com/image.jpg
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Set Environment Variables
Create `.env` file in `server/` folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=4000
```

### 3. Start Server
```bash
npm run dev  # For development with nodemon
npm start    # For production
```

The server will automatically sync CSV data on startup.

## Using IndorePlants Component

The `IndorePlants.jsx` component now fetches data from the API:
```jsx
<IndorePlants addToCart={addToCart} />
```

The component:
- Fetches indoor plants from `/api/plants/indoor`
- Displays loading state while fetching
- Shows error message with retry option
- Displays plant images from CSV URLs
- Updates automatically when data changes

## Updating Plants Data

### Option 1: Update CSV (Recommended for Bulk Changes)
1. Edit `Datasets/enutrof_120_plants_final.csv`
2. Restart server
3. Data automatically syncs to MongoDB

### Option 2: Resync via API
```bash
POST /api/admin/plants/resync-csv
Headers: Authorization: Bearer <admin_token>
```

### Option 3: Manual Admin Dashboard
Can be added to AdminDashboard to:
- Upload new CSV file
- Manually resync
- View sync status

## Database Structure

### Plant Document
```javascript
{
  _id: ObjectId,
  name: String,              // Plant name
  category: String,          // "indoor", "flowering", "outdoor", etc
  salePrice: Number,         // Current sale price in INR
  oldPrice: Number,          // Original price (optional)
  description: String,       // HTML description from CSV
  imageUrl: String,          // Image URL from CSV
  csvId: String,             // Reference to CSV row
  syncedFrom: String,        // "csv" or "manual"
  createdAt: Date,
  updatedAt: Date
}
```

## Features

✅ **One-Way Sync**: CSV → MongoDB (no MongoDB → CSV sync)  
✅ **Protected**: CSV data cannot be edited via API  
✅ **Automatic**: Syncs on server startup  
✅ **Manual**: Can resync anytime via admin endpoint  
✅ **Scalable**: Support for multiple categories  
✅ **Error Handling**: Comprehensive logging and error messages  

## Troubleshooting

### "CSV file not found"
- Check file exists at `Datasets/enutrof_120_plants_final.csv`
- Verify file path is correct

### Plants not appearing
1. Check MongoDB connection (MONGO_URI in .env)
2. Check server logs for sync errors
3. Call resync endpoint manually

### "Cannot edit CSV synced plants"
- Normal behavior! Edit the CSV file instead
- Restart server to apply changes

## Next Steps

1. ✅ CSV file configured
2. ✅ Backend API endpoints created
3. ✅ IndorePlants component updated
4. Next: Update other plant category components similarly
5. Optional: Add CSV upload feature to Admin Dashboard
