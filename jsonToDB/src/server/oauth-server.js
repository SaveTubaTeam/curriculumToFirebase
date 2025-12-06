import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config.js';
import { createDbConnection, executeQuery } from '../../config/db-connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase payload limit for large JSON files
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../../public')));

// Serve the bulk upload page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/bulk-upload.html'));
});

// Serve other pages
app.get('/helper', (req, res) => {
    res.sendFile(path.join(__dirname, 'database-helper.html'));
});

app.get('/oauth', (req, res) => {
    res.sendFile(path.join(__dirname, 'browser-oauth-parser.html'));
});

// Simple endpoint for James's system to save JSON to database
app.post('/api/save-json', async (req, res) => {
    try {
        const { jsonContent, title } = req.body;

        // Parse the JSON content
        const parsedData = JSON.parse(jsonContent);

        // Save to database using James's format
        const { saveJamesFormatToDatabase } = await import('../helpers/james-db-helper.js');
        const result = await saveJamesFormatToDatabase(parsedData, title);

        res.json({
            success: true,
            message: `Successfully saved "${title}" to database`,
            gradeLevelId: result.gradeLevelId,
            chaptersCount: parsedData.chapters?.length || 0
        });

    } catch (error) {
        console.error('Database save error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint to save data using James's exact JSON format
app.post('/api/save-james-format', async (req, res) => {
    try {
        const { doc } = req.body;

        // Use James's original parseDocument logic (import from original parser)
        const { parseDocument } = await import('../src/curriculumToJSON/parser.js');
        const jsonResult = parseDocument(doc);

        // Parse the JSON result  
        const parsedData = JSON.parse(jsonResult);

        // Save to database using James's format
        const { saveJamesFormatToDatabase } = await import('../helpers/james-db-helper.js');
        const result = await saveJamesFormatToDatabase(parsedData, doc.title);

        res.json({
            success: true,
            message: result.message,
            gradeLevelId: result.gradeLevelId,
            chaptersCount: parsedData.chapters?.length || 0
        });

    } catch (error) {
        console.error('James format processing error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint to save parsed data to database (legacy)
app.post('/api/save-parsed-data', async (req, res) => {
    let client;

    try {
        const { title, data, tenantId = 1 } = req.body;

        client = await createDbConnection();

        // Simple implementation: save as a single chapter with the document title
        const chapterResult = await executeQuery(client,
            'INSERT INTO chapters (tenant_id, title, order_index) VALUES ($1, $2, $3) RETURNING id',
            [tenantId, title, 1]
        );

        const chapterId = chapterResult.rows[0].id;

        // Process elements using James's logic pattern
        let currentChapterId = chapterId; // Default chapter created above
        let currentLessonId = null;
        let currentActivityId = null;
        let lessonCount = 0;
        let activityCount = 0;
        let questionCount = 0;

        for (const element of data) {
            // HEADING_2 = New Chapter (James's format)
            if (element.headingStyle === 'HEADING_2') {
                const newChapterResult = await executeQuery(client,
                    'INSERT INTO chapters (tenant_id, title, order_index) VALUES ($1, $2, $3) RETURNING id',
                    [tenantId, element.text, Math.floor(Math.random() * 1000)]
                );
                currentChapterId = newChapterResult.rows[0].id;
                lessonCount = 0;
            }

            // HEADING_3 = New Lesson (James's format)  
            else if (element.headingStyle === 'HEADING_3' && currentChapterId) {
                lessonCount++;
                const lessonResult = await executeQuery(client,
                    'INSERT INTO lessons (chapter_id, title, order_index) VALUES ($1, $2, $3) RETURNING id',
                    [currentChapterId, element.text, lessonCount]
                );
                currentLessonId = lessonResult.rows[0].id;
                activityCount = 0;
            }

            // HEADING_4 = New Activity (James's format with emojis)
            else if (element.headingStyle === 'HEADING_4' && currentLessonId) {
                activityCount++;
                const activityType = detectActivityType(element.text);
                const activityResult = await executeQuery(client,
                    'INSERT INTO activities (lesson_id, type, title, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
                    [currentLessonId, activityType, element.text, activityCount]
                );
                currentActivityId = activityResult.rows[0].id;
                questionCount = 0;
            }

            // Bold text = Question (James's format)
            else if (element.textStyle && element.textStyle.includes('bold') && currentActivityId) {
                questionCount++;
                await executeQuery(client,
                    'INSERT INTO questions (activity_id, prompt, order_index) VALUES ($1, $2, $3)',
                    [currentActivityId, element.text, questionCount]
                );
            }
        }

        function detectActivityType(text) {
            const emojiMap = {
                'graduation': 'Mastery',
                'camera': 'Snapshot',
                'pencil': 'ImageBoom',
                'puzzle': 'Sorting',
                'art': 'Reorder',
                'book': 'Quiz',
                'brain': 'Memory'
            };

            for (const [emoji, type] of Object.entries(emojiMap)) {
                if (text.includes(emoji)) {
                    return type;
                }
            }
            return 'Unknown';
        }

        res.json({
            success: true,
            message: `Successfully saved "${title}" to database`,
            chapterId: chapterId,
            elementsProcessed: data.length
        });

    } catch (error) {
        console.error('Database save error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        if (client) {
            await client.end();
        }
    }
});

// Start server  
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open browser to http://localhost:${PORT} to use James's OAuth parser`);
});