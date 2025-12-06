# JSON to Database Module

**Primary storage solution for Save Tuba curriculum management.** Converts curriculum JSON files to PostgreSQL database with multi-language support, update-safe operations, and comprehensive error handling.

> **Note:** This PostgreSQL solution is the recommended approach for all new projects and future development. It replaces Firebase/Firestore as the primary storage backend.

## Project Structure

```
jsonToDB/
├── config/
│   └── db-connection.js         # Database connection configuration
├── src/
│   ├── helpers/
│   │   └── james-db-helper.js   # Main database operations
│   └── server/
│       └── oauth-server.js      # API server for bulk uploads
├── scripts/
│   ├── checkduplicates.js       # Check for duplicate content
│   ├── inspect-database.js      # Inspect database contents
│   └── clean-database.js        # Clean database (use with caution)
├── schema/
│   └── james-schema.sql         # Database schema definition
├── public/
│   └── bulk-upload.html         # Web interface for bulk uploads
└── package.json                 # Dependencies and scripts
```

## Quick Start

1. **Setup:**
   ```bash
   npm install
   cp .env.example .env  # Add your database credentials
   npm run setup-db
   ```

2. **Run:**
   ```bash
   npm start
   # Open http://localhost:3001
   ```

## Commands

- `npm start` - Start server
- `npm run inspect` - View database contents
- `npm run check-duplicates` - Check for duplicates
- `npm run clean` - Clear database (CAUTION!)

## Features

- Update-safe operations (no duplicates on re-upload)
- Multi-language support (English, Russian, Kazakh)
- Multiple activity types (Quiz, Memory, Sorting, General)
- Web interface for file uploads
- Built-in database inspection tools

## Usage Notes

- Never commit `.env` files with credentials
- Use proper file naming: `language_gradeN.json`
- Default port is 3001
- `npm run clean` deletes all data

## How it works

1. Upload curriculum JSON files via web interface
2. System detects grade level and language from filename
3. Creates structured database with chapters, lessons, activities
4. Handles translations and different activity types automatically
5. Updates existing content instead of creating duplicates

## Setup and Configuration

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)

### Installation
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Configuration
Edit `.env` file with your database settings:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
POSTGRES_DB=your_database_name
```

### Database Setup
```bash
# Create database
createdb your_database_name

# Initialize schema
npm run setup-db

# Start server
npm start
```

## Common Issues

### Database Connection Failed
- Check PostgreSQL is running: `brew services start postgresql`
- Verify credentials in `.env` file
- Test connection: `psql -h localhost -U your_username -d your_database`

### Server Won't Start
- Port 3001 in use: Kill process with `lsof -i :3001` then `kill -9 [PID]`
- Change port in `src/server/oauth-server.js` if needed

### Upload Failures
- Use proper file naming: `en_grade2.json`, `ru_grade3.json`
- Validate JSON format before upload
- Check server console for error details

### Import Errors
Ensure file structure matches:
```
jsonToDB/
├── config/db-connection.js
├── src/helpers/james-db-helper.js
└── src/server/oauth-server.js
```

### Database Issues
- Missing tables: Run `npm run setup-db`
- Check duplicates: Run `npm run check-duplicates`
- Clean restart: `npm run clean` then `npm run setup-db`