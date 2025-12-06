import { createDbConnection, executeQuery } from '../config/db-connection.js';

async function inspectDatabase() {
    let client;

    try {
        client = await createDbConnection();

        console.log('🔍 DATABASE STRUCTURE AND CONTENT INSPECTION\n');

        // 1. Count all main entities
        console.log('📊 ENTITY COUNTS:');
        const counts = await Promise.all([
            executeQuery(client, 'SELECT COUNT(*) as count FROM grade_levels'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM chapters'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM lessons'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM activities'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM sorting_categories'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM sorting_items'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM memory_game_items'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM quiz_questions'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM quiz_answer_options')
        ]);

        console.log(`  Grade Levels: ${counts[0].rows[0].count}`);
        console.log(`  Chapters: ${counts[1].rows[0].count}`);
        console.log(`  Lessons: ${counts[2].rows[0].count}`);
        console.log(`  Activities: ${counts[3].rows[0].count}`);
        console.log(`  Sorting Categories: ${counts[4].rows[0].count}`);
        console.log(`  Sorting Items: ${counts[5].rows[0].count}`);
        console.log(`  Memory Game Items: ${counts[6].rows[0].count}`);
        console.log(`  Quiz Questions: ${counts[7].rows[0].count}`);
        console.log(`  Quiz Answer Options: ${counts[8].rows[0].count}\n`);

        // 2. Grade levels with translations
        console.log('📚 GRADE LEVELS:');
        const grades = await executeQuery(client, `
            SELECT 
                gl.id, 
                gl.name as grade_name,
                gl.display_order,
                glt.language_code,
                glt.name as translated_name,
                gl.created_at
            FROM grade_levels gl
            LEFT JOIN grade_level_translations glt ON gl.id = glt.grade_level_id
            ORDER BY gl.display_order, glt.language_code
        `);

        const gradeMap = new Map();
        grades.rows.forEach(row => {
            if (!gradeMap.has(row.id)) {
                gradeMap.set(row.id, {
                    id: row.id,
                    name: row.grade_name,
                    display_order: row.display_order,
                    created_at: row.created_at,
                    translations: []
                });
            }
            if (row.language_code) {
                gradeMap.get(row.id).translations.push({
                    language: row.language_code,
                    name: row.translated_name
                });
            }
        });

        Array.from(gradeMap.values()).forEach(grade => {
            console.log(`  📖 Grade Level ${grade.id}: ${grade.name || 'Unnamed'}`);
            console.log(`     Display Order: ${grade.display_order}`);
            console.log(`     Created: ${new Date(grade.created_at).toLocaleString()}`);
            if (grade.translations.length > 0) {
                console.log('     Translations:');
                grade.translations.forEach(trans => {
                    console.log(`       ${trans.language}: ${trans.name}`);
                });
            }
            console.log();
        });

        // 3. Activity types distribution
        console.log('🎯 ACTIVITY TYPES:');
        const activityTypes = await executeQuery(client,
            'SELECT activity_type, COUNT(*) as count FROM activities GROUP BY activity_type ORDER BY count DESC'
        );

        activityTypes.rows.forEach(row => {
            console.log(`  ${row.activity_type}: ${row.count} activities`);
        });
        console.log();

        // 4. Languages in the system
        console.log('🌐 LANGUAGES:');
        const languages = await executeQuery(client,
            'SELECT code, name, display_order FROM languages ORDER BY display_order'
        );

        languages.rows.forEach(row => {
            console.log(`  ${row.code}: ${row.name} (order: ${row.display_order})`);
        });
        console.log();

        // 5. Most recent grade level structure
        const latestGrade = await executeQuery(client, `
            SELECT id, name, display_order 
            FROM grade_levels 
            ORDER BY created_at DESC 
            LIMIT 1
        `);

        if (latestGrade.rows.length > 0) {
            const gradeId = latestGrade.rows[0].id;
            console.log(`📋 LATEST GRADE LEVEL STRUCTURE (ID: ${gradeId}):`);
            console.log(`Grade: ${latestGrade.rows[0].name}\n`);

            // Get full structure for latest grade
            const structure = await executeQuery(client, `
                SELECT 
                    c.id as chapter_id,
                    ct.title as chapter_title,
                    c.chapter_order,
                    l.id as lesson_id,
                    lt.title as lesson_title,
                    l.lesson_order,
                    a.id as activity_id,
                    at.title as activity_title,
                    a.activity_type,
                    a.activity_order
                FROM chapters c
                JOIN chapter_translations ct ON c.id = ct.chapter_id
                JOIN lessons l ON c.id = l.chapter_id
                JOIN lesson_translations lt ON l.id = lt.lesson_id
                JOIN activities a ON l.id = a.lesson_id
                JOIN activity_translations at ON a.id = at.activity_id
                WHERE c.grade_level_id = $1 
                AND ct.language_code = 'en' 
                AND lt.language_code = 'en' 
                AND at.language_code = 'en'
                ORDER BY c.chapter_order, l.lesson_order, a.activity_order
            `, [gradeId]);

            let currentChapter = '';
            let currentLesson = '';

            structure.rows.forEach(row => {
                if (row.chapter_title !== currentChapter) {
                    console.log(`📖 Chapter ${row.chapter_order}: ${row.chapter_title}`);
                    currentChapter = row.chapter_title;
                    currentLesson = '';
                }

                if (row.lesson_title !== currentLesson) {
                    console.log(`  📝 Lesson ${row.lesson_order}: ${row.lesson_title}`);
                    currentLesson = row.lesson_title;
                }

                console.log(`    🎯 Activity ${row.activity_order}: ${row.activity_title} (${row.activity_type})`);
            });
        }

        await client.end();

    } catch (error) {
        console.error('❌ Inspection error:', error.message);
        if (client) await client.end();
    }
}

inspectDatabase();
