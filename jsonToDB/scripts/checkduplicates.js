import { createDbConnection, executeQuery } from '../config/db-connection.js';

async function checkDuplicates() {
    let client;

    try {
        client = await createDbConnection();

        console.log('Checking for duplicates...\n');

        // Check Grade 2 specifically
        const grade2Check = await executeQuery(client, `
            SELECT gl.id, gl.name, gl.display_order, COUNT(*) as count
            FROM grade_levels gl
            WHERE gl.display_order = 2
            GROUP BY gl.id, gl.name, gl.display_order
        `);

        console.log('GRADE 2 ENTRIES:');
        grade2Check.rows.forEach(row => {
            console.log(`  Grade Level ID: ${row.id}, Name: ${row.name}, Count: ${row.count}`);
        });

        // Check chapters in Grade 2
        const chaptersCheck = await executeQuery(client, `
            SELECT c.id, c.chapter_order, ct.title, COUNT(*) as count
            FROM chapters c
            JOIN chapter_translations ct ON c.id = ct.chapter_id
            JOIN grade_levels gl ON c.grade_level_id = gl.id
            WHERE gl.display_order = 2 AND ct.language_code = 'en'
            GROUP BY c.id, c.chapter_order, ct.title
            ORDER BY c.chapter_order
        `);

        console.log('\nGRADE 2 CHAPTERS:');
        chaptersCheck.rows.forEach(row => {
            console.log(`  Chapter ${row.chapter_order}: "${row.title}" (ID: ${row.id})`);
        });

        // Check for duplicate chapter orders
        const duplicateChapters = await executeQuery(client, `
            SELECT c.chapter_order, COUNT(*) as count
            FROM chapters c
            JOIN grade_levels gl ON c.grade_level_id = gl.id
            WHERE gl.display_order = 2
            GROUP BY c.chapter_order
            HAVING COUNT(*) > 1
        `);

        if (duplicateChapters.rows.length > 0) {
            console.log('\nDUPLICATE CHAPTER ORDERS FOUND:');
            duplicateChapters.rows.forEach(row => {
                console.log(`  Chapter order ${row.chapter_order}: ${row.count} entries`);
            });
        } else {
            console.log('\nNo duplicate chapter orders found');
        }

        // Total counts
        const totalCounts = await executeQuery(client, `
            SELECT 
                COUNT(DISTINCT gl.id) as grade_levels,
                COUNT(DISTINCT c.id) as chapters,
                COUNT(DISTINCT l.id) as lessons,
                COUNT(DISTINCT a.id) as activities
            FROM grade_levels gl
            LEFT JOIN chapters c ON gl.id = c.grade_level_id
            LEFT JOIN lessons l ON c.id = l.chapter_id
            LEFT JOIN activities a ON l.id = a.lesson_id
            WHERE gl.display_order = 2
        `);

        console.log('\nGRADE 2 TOTALS:');
        const totals = totalCounts.rows[0];
        console.log(`  Grade Levels: ${totals.grade_levels}`);
        console.log(`  Chapters: ${totals.chapters}`);
        console.log(`  Lessons: ${totals.lessons}`);
        console.log(`  Activities: ${totals.activities}`);

    } catch (error) {
        console.error('Error checking duplicates:', error);
    } finally {
        if (client) {
            await client.end();
        }
    }
}

checkDuplicates();