import pg from 'pg';
import dotenv from 'dotenv';

// Load .env from parent directory (curriculumToFirebase folder)
dotenv.config();

const { Client } = pg;

// Database connection configuration
const dbConfig = {
    user: process.env.DB_USER || process.env.POSTGRES_USER,
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
    host: process.env.DB_HOST || process.env.POSTGRES_URL || 'localhost',
    port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'savetubadb'
};

// Create and export database client
export async function createDbConnection() {
    const client = new Client(dbConfig);
    await client.connect();
    return client;
}

// Helper function to execute queries
export async function executeQuery(client, query, params = []) {
    try {
        const result = await client.query(query, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}