# curriculumToFirebase
A localhost interface for Save Tuba curriculum management. Process Google Doc curriculum files and store them in Firebase or PostgreSQL database.

## Workflow

**Step 1:** Parse Google Doc files to JSON using [curriculumToJSON](#1-curriculumtojson)
**Step 2:** Choose your storage option:
- **Option A:** [JSONToFirebase](#2-jsontofirebase) - Upload to Firebase/Firestore (legacy)
- **Option B:** [jsonToDB](#3-jsontodb) - Upload to PostgreSQL database **(recommended for new projects)**

> **Note:** Future development will focus on PostgreSQL (Option B) as the primary storage solution.

### To get started:
```
git clone https://github.com/SaveTubaTeam/curriculumToFirebase.git
cd ./curriculumToFirebase
npm install
```

### Run the following to open up in localhost:
```
npm run dev
```

## 1. curriculumToJSON (Step 1: Parse & Download)
Google OAuth w/ popup signin to run the Google Workspaces API. Exports SaveTuba's Google Doc curriculum documents into downloadable JSON files. :shipit:

**Process:**
1. Sign in with Lehigh email
2. Select Google Doc curriculum files
3. Parse documents to structured JSON format
4. Download JSON files to your local machine

> [!NOTE]
> Use your **Lehigh email address** to signin. 
> Only users in the **@lehigh.edu** organization can access the API.

## 2. JSONToFirebase (Step 2, Option A: Firebase Storage)
Firebase Auth w/ popup signin to access the Firestore and Cloud Storage bucket APIs. Upload your downloaded JSON curriculum files plus image metadata into Firestore.

**Process:**
1. Sign in with Firebase auth
2. Upload JSON files from Step 1
3. Posts curriculum data to Firestore
4. Manages image metadata in Cloud Storage

> [!IMPORTANT]
> 1. **postDataSoft()** overwrites curriculum content whilst leaving other metadata intact.
> 2. **postDataHard()** wipes and resets all data in the given Grade. Use with caution!
> 3. **Get Image Attributes** accepts a filepath to a preexisting image within our storage bucket and returns two attributes: a downloadURL and a blurhash for the image.

## 3. jsonToDB (Step 2, Option B: PostgreSQL Database)
**Recommended for new projects.** PostgreSQL database module for curriculum storage and management. Upload your downloaded JSON files from Step 1 to a structured database.

> **Note:** This is the primary storage solution for future development. All new projects should use PostgreSQL instead of Firebase.

**Process:**
1. Setup database connection
2. Upload JSON files via web interface
3. Data stored in normalized PostgreSQL tables
4. Multi-language and update-safe operations

**Key Features:**
- Bulk upload via drag & drop web interface
- Multi-language support (English, Russian, Kazakh)  
- Update-safe: re-uploading same content updates existing records
- Database management and inspection tools
- Production-ready with proper error handling

**Quick Start:**
```bash
cd jsonToDB
npm install
cp .env.example .env  # Add database credentials
npm run setup-db
npm start  # Access at http://localhost:3001
```

**Available Commands:**
- `npm start` - Start upload server
- `npm run inspect` - View database contents  
- `npm run check-duplicates` - Check for duplicates

> [!NOTE]
> See `jsonToDB/README.md` for detailed documentation and setup instructions.

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Chrome Extension Errors
**Problem:** `Unchecked runtime.lastError: The message port closed before a response was received`
**Solution:** This is a harmless browser console warning. You can:
- Ignore it - it doesn't affect functionality
- Close developer tools when not debugging
- Disable unnecessary Chrome extensions
- Use incognito mode for testing

#### 2. Google OAuth Issues
**Problem:** Can't access Google Docs API or authentication fails
**Solution:** 
- Ensure you're using your **@lehigh.edu** email address
- Check if your account has proper permissions
- Clear browser cache and cookies
- Try incognito mode

#### 3. Firebase Connection Issues
**Problem:** Firebase authentication or data upload fails
**Solution:**
- Verify Firebase project configuration
- Check if you have proper Firebase permissions
- Ensure environment variables are correctly set
- Try refreshing the page and re-authenticating

#### 4. Database Connection Problems (jsonToDB)
**Problem:** Can't connect to PostgreSQL database
**Solution:**
```bash
# Check if PostgreSQL is running
psql --version

# Test connection manually
psql -h localhost -U your_username -d your_database

# If connection fails, check:
# 1. Database credentials in .env file
# 2. PostgreSQL server is running
# 3. Database exists and user has permissions
```

#### 5. Port Already in Use
**Problem:** `Port 3001 already in use` when starting jsonToDB server
**Solution:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or use a different port by modifying oauth-server.js
```

#### 6. File Upload Issues
**Problem:** JSON files won't upload or show errors
**Solution:**
- Verify JSON file format is valid
- Check file size (should be reasonable)
- Ensure database schema is initialized
- Check server logs for specific error messages
- Try uploading one file at a time first

#### 7. Duplicate Content Issues
**Problem:** Same content appears multiple times in database
**Solution:**
```bash
cd jsonToDB
npm run check-duplicates
# If duplicates found, the system should handle updates automatically
# For manual cleanup:
npm run clean  # WARNING: This deletes all data
npm run setup-db  # Reinitialize
```

#### 8. Environment Setup Issues
**Problem:** Missing environment variables or configuration
**Solution:**
```bash
# For main project - ensure .env contains:
VITE_CLIENT_ID="your_google_client_id"
VITE_API_KEY="your_google_api_key"

# For jsonToDB - ensure .env contains:
DB_HOST=your_database_host
DB_PORT=5432
DB_USER=your_database_user
DB_PASSWORD=your_database_password
POSTGRES_DB=your_database_name
```

#### 9. Import Path Errors (Development)
**Problem:** Module import errors after restructuring
**Solution:** File structure should be:
```
jsonToDB/
├── config/db-connection.js
├── src/helpers/james-db-helper.js
├── src/server/oauth-server.js
└── scripts/*.js
```
Ensure import paths use relative paths like `../../config/db-connection.js`

#### 10. Database Schema Issues
**Problem:** Database operations fail due to missing tables
**Solution:**
```bash
cd jsonToDB
# Reinitialize database schema
npm run setup-db

# Or manually:
psql -d your_database_name -f schema/james-schema.sql
```

### Getting Help

If you encounter issues not covered here:
1. Check server logs for detailed error messages
2. Use browser developer tools to inspect network requests
3. Test database connections manually
4. Verify all environment variables are set correctly
5. Try the process step-by-step rather than all at once