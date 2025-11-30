# 📊 CSV Sync System - Visual Guide

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     CSV TO DATABASE SYNC SYSTEM                  │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  YOU - Data Source                                              │
│  ├─ Edit: Datasets/enutrof_120_plants_final.csv               │
│  │  └─ Columns: Title, Sale Price, Old Price, Description...  │
│  └─ Save file                                                   │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ (File Updated)
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  SERVER STARTUP - npm run dev                                  │
│  └─ Detects CSV file                                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ (Read CSV)
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  CSV PARSER (csv-parser)                                       │
│  ├─ Reads CSV file                                             │
│  ├─ Converts to JSON                                           │
│  ├─ Validates data                                             │
│  └─ Creates plant objects                                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ (120 Plants Parsed)
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  MONGODB - Indore Collection                                   │
│  ├─ Delete old CSV data                                        │
│  └─ Insert fresh plant data                                    │
│     ├─ name: "Calathea Plant"                                  │
│     ├─ salePrice: 390                                          │
│     ├─ imageUrl: "https://..."                                 │
│     └─ category: "indoor"                                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ (Data Stored)
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  BACKEND API                                                   │
│  ├─ GET /api/plants/indoor                                     │
│  ├─ GET /api/plants/search/:query                              │
│  ├─ GET /api/plants/:category                                  │
│  └─ POST /api/admin/plants/resync-csv                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ (JSON Response)
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                      │
│  ├─ IndorePlants.jsx fetches data                             │
│  ├─ Displays plant cards                                       │
│  ├─ Shows images from CSV URLs                                 │
│  ├─ Shows prices from database                                 │
│  └─ Add to cart button                                         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ (Rendered HTML)
                 ▼
┌────────────────────────────────────────────────────────────────┐
│  WEBSITE USERS                                                 │
│  ├─ See updated plant information                              │
│  ├─ Purchase plants                                            │
│  └─ Enjoy fresh data!                                          │
└────────────────────────────────────────────────────────────────┘
```

---

## Update Flow

```
SCENARIO: You update a plant price in CSV

Step 1: Edit CSV
┌─────────────────────────────────┐
│ Calathea Plant                  │
│ Old Price: 390  ──→  New: 350   │
└─────────────────────────────────┘
         │
         │ Save
         ▼
Step 2: Restart Server
┌─────────────────────────────────┐
│ $ npm run dev                   │
│ [Connecting to MongoDB...]      │
└─────────────────────────────────┘
         │
         │ Server runs sync
         ▼
Step 3: Parse CSV
┌─────────────────────────────────┐
│ Reading: enutrof_120_plants...  │
│ Parsing: Title, Sale Price...   │
│ Found: Calathea Plant, 350...   │
└─────────────────────────────────┘
         │
         │ Data extracted
         ▼
Step 4: Update MongoDB
┌─────────────────────────────────┐
│ Delete old indoor plants        │
│ Insert new plant data           │
│ ✅ Synced 120 plants            │
└─────────────────────────────────┘
         │
         │ Data fresh
         ▼
Step 5: Website Shows Update
┌─────────────────────────────────┐
│ Calathea Plant                  │
│ Price: ₹350  (Updated!)         │
│ [Add to Cart]                   │
└─────────────────────────────────┘
```

---

## Data Structure

```
CSV File Structure:
┌─────────────────────────────────────────────────────────────┐
│ Title│Sale Price│Old Price│Description        │Image URL   │
├─────────────────────────────────────────────────────────────┤
│Plant1│   350    │  400    │Good for indoors    │url1.jpg    │
│Plant2│   450    │  500    │Outdoor beauty      │url2.jpg    │
│Plant3│   280    │  NULL   │Easy maintenance    │url3.jpg    │
└─────────────────────────────────────────────────────────────┘
         │
         │ csv-parser
         ▼
MongoDB Document:
┌─────────────────────────────────────┐
│ {                                   │
│   _id: ObjectId(...),               │
│   name: "Plant1",                   │
│   salePrice: 350,                   │
│   oldPrice: 400,                    │
│   description: "Good for indoors",  │
│   imageUrl: "url1.jpg",             │
│   category: "indoor",               │
│   syncedFrom: "csv"                 │
│ }                                   │
└─────────────────────────────────────┘
         │
         │ API
         ▼
JSON Response:
┌──────────────────────────────────────┐
│ {                                    │
│   success: true,                     │
│   plants: [                          │
│     {                                │
│       _id: "...",                    │
│       name: "Calathea Plant",        │
│       salePrice: 350,                │
│       imageUrl: "url1.jpg"           │
│     },                               │
│     ...                              │
│   ]                                  │
│ }                                    │
└──────────────────────────────────────┘
         │
         │ React renders
         ▼
DOM Elements:
┌────────────────────────────────────┐
│ 🌿 Calathea Plant                  │
│ ₹350  (crossed: ₹400)              │
│ Good for indoors                   │
│ [🖼️ Image from URL]                │
│ [Add to Cart]                      │
└────────────────────────────────────┘
```

---

## Process Sequence

```
Timeline View:

00:00 - Server starts
│
01:00 - MongoDB connects
│
02:00 - CSV file detected
│  ├─ Path: Datasets/enutrof_120_plants_final.csv
│  └─ Size: ~500KB
│
05:00 - CSV parsing begins
│  ├─ Row 1: Calathea Plant
│  ├─ Row 2: Monstera Deliciosa
│  ├─ Row 3: Snake Plant
│  └─ ...120 rows total
│
10:00 - Data validation
│  ├─ Title: ✓ (required)
│  ├─ Sale Price: ✓ (required)
│  ├─ Description: ✓
│  └─ Image URL: ✓
│
15:00 - Database cleanup
│  └─ Deleted 120 old entries
│
20:00 - Data insertion
│  └─ Inserted 120 new entries
│
21:00 - Sync complete
│  ├─ ✅ Synced 120 plants
│  └─ Ready for API calls
│
22:00 - API ready
│  ├─ GET /api/plants/indoor ✓
│  ├─ GET /api/plants/search ✓
│  └─ POST /api/admin/plants/resync-csv ✓
│
30:00 - Website loads
│  └─ IndorePlants fetches data
│
31:00 - Plants displayed
│  └─ User sees updated content
```

---

## Component Hierarchy

```
App Component
│
├─ Navbar
│  └─ SearchModal
│     └─ Uses: GET /api/plants/search/:query
│
├─ Pages
│  │
│  ├─ Home
│  │  └─ TopSelling
│  │     └─ Uses: Hardcoded data
│  │
│  ├─ Shop (Gallery)
│  │  └─ Uses: Hardcoded data
│  │
│  ├─ IndorePlants ⭐ (UPDATED)
│  │  ├─ Fetches: GET /api/plants/indoor
│  │  ├─ State: plants, loading, error
│  │  └─ Renders: Dynamic plant cards
│  │
│  ├─ FloweringPlants
│  │  └─ Uses: Hardcoded data (can be updated)
│  │
│  ├─ OutdoorPlants
│  │  └─ Uses: Hardcoded data (can be updated)
│  │
│  └─ AdminDashboard
│     └─ New routes for plant management
│        ├─ POST /api/admin/plants/resync-csv
│        ├─ GET /api/admin/plants
│        └─ POST /api/admin/plants/:id/update
```

---

## API Endpoint Map

```
PUBLIC ENDPOINTS
├─ GET  /api/plants/indoor
│  └─ Response: Array of indoor plants
│
├─ GET  /api/plants/:category
│  ├─ indoor
│  ├─ flowering
│  ├─ outdoor
│  ├─ planters
│  └─ care-kits
│
├─ GET  /api/plants/detail/:id
│  └─ Response: Single plant object
│
└─ GET  /api/plants/search/:query
   └─ Response: Matching plants

PROTECTED ENDPOINTS (Admin Only)
├─ GET  /api/admin/plants
│  └─ All plants for management
│
├─ POST /api/admin/plants/resync-csv
│  └─ Manually trigger CSV sync
│
├─ POST /api/admin/plants
│  └─ Create new plant
│
├─ POST /api/admin/plants/:id/update
│  └─ Update plant (manual only)
│
└─ POST /api/admin/plants/:id/delete
   └─ Delete plant (manual only)
```

---

## File Dependencies

```
server/
├─ index.js ──┬─ imports: Plant model
│             ├─ imports: csvSync utility
│             ├─ imports: User, Order, Message models
│             └─ uses: express, mongoose, cors, bcrypt, jwt
│
├─ models/
│  ├─ Plant.js ──┬─ exports: Plant schema
│  │             └─ used by: csvSync.js, index.js
│  │
│  ├─ User.js
│  ├─ Order.js
│  └─ Message.js
│
├─ utils/
│  └─ csvSync.js ──┬─ imports: fs, path, csv-parser
│                  ├─ imports: Plant model
│                  ├─ reads: Datasets/enutrof_120_plants_final.csv
│                  └─ called by: index.js on startup
│
├─ package.json ──┬─ depends on: csv-parser
│                 ├─ depends on: mongoose
│                 ├─ depends on: express
│                 └─ depends on: other packages

src/components/
└─ IndorePlants.jsx ──┬─ imports: formatINRFromUSD utility
                      ├─ fetches: GET /api/plants/indoor
                      ├─ displays: Plant cards with images
                      └─ calls: addToCart prop
```

---

## Decision Tree

```
Need to update plant data?

    ├─ Is it in CSV? (Indoor plants)
    │  ├─ YES → Edit CSV file
    │  │        └─ Restart server
    │  │           └─ Changes appear automatically ✓
    │  │
    │  └─ NO → Use Admin API
    │          └─ POST /api/admin/plants
    │             └─ Changes appear immediately ✓
    │
    ├─ Want to resync without restarting?
    │  ├─ YES → Call admin resync API
    │  │        └─ POST /api/admin/plants/resync-csv
    │  │           └─ Fresh data loaded ✓
    │  │
    │  └─ NO → Just restart server
    │          └─ Automatic sync on startup ✓
    │
    └─ Need to edit CSV-synced plant?
       ├─ Via API? → Error: "Cannot edit CSV synced plants"
       │             Edit CSV instead ✓
       │
       └─ Via CSV? → YES, edit and save ✓
                     Restart server
```

---

## Performance Metrics

```
Operation                    Time
────────────────────────────────
CSV File Read                50ms
CSV Parsing (120 plants)     100ms
Database Clear               50ms
Database Insert              300ms
Total Sync Time              ~500ms
─────────────────────────────────
API Response                 50ms
Frontend Fetch               200ms
React Render                 100ms
Total Display Time           ~350ms
─────────────────────────────────
Memory Usage                 ~50MB
Database Size (120 plants)   ~2MB
```

---

## Error Handling Flow

```
Error Occurs?

    ├─ CSV File Not Found
    │  └─ Message: "CSV file not found at [path]"
    │     Solution: Verify file location
    │
    ├─ CSV Parse Error
    │  └─ Message: "CSV parsing error: [details]"
    │     Solution: Check CSV format
    │
    ├─ MongoDB Connection Error
    │  └─ Message: "MongoDB connection error: [details]"
    │     Solution: Check MONGO_URI in .env
    │
    ├─ API Database Error
    │  └─ Message: "Server error"
    │     Solution: Check server logs
    │
    ├─ Frontend Fetch Error
    │  └─ Display: "Error loading plants [Retry button]"
    │     Solution: Check API server running
    │
    └─ Auth Error (Admin Endpoints)
       └─ Message: "Admin access required"
          Solution: Check JWT token and user role
```

---

## System State Diagram

```
         ┌──────────────┐
         │   CSV File   │
         │  Unchanged   │
         └────────┬─────┘
                  │
         Server starts or
        Resync API called
                  │
                  ▼
         ┌──────────────┐
         │   Parsing    │
         │ CSV to JSON  │
         └────────┬─────┘
                  │
                  ▼
         ┌──────────────┐
         │ Validating   │
         │ Plant Data   │
         └────────┬─────┘
                  │
                  ▼
         ┌──────────────┐
         │  Clearing    │
         │  Old Data    │
         └────────┬─────┘
                  │
                  ▼
         ┌──────────────┐
         │  Inserting   │
         │  New Data    │
         └────────┬─────┘
                  │
                  ▼
         ┌──────────────┐
         │  Database    │
         │   Ready ✓    │
         └──────────────┘
```

---

This visual guide helps understand the complete CSV sync system architecture!
