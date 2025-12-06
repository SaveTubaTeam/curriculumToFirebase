import { createDbConnection, executeQuery } from '../config/db-connection.js';

async function cleanDatabase() {
    let client;

    try {
        client = await createDbConnection();

        console.log('🧹 CLEANING DATABASE - REMOVING ALL CURRICULUM DATA\n');

        // Get current counts before cleaning
        console.log('📊 Current Data Before Cleaning:');
        const beforeCounts = await Promise.all([
            executeQuery(client, 'SELECT COUNT(*) as count FROM grade_levels'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM chapters'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM lessons'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM activities'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM sorting_categories'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM memory_game_items'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM quiz_questions')
        ]);

        console.log(`  Grade Levels: ${beforeCounts[0].rows[0].count}`);
        console.log(`  Chapters: ${beforeCounts[1].rows[0].count}`);
        console.log(`  Lessons: ${beforeCounts[2].rows[0].count}`);
        console.log(`  Activities: ${beforeCounts[3].rows[0].count}`);
        console.log(`  Sorting Categories: ${beforeCounts[4].rows[0].count}`);
        console.log(`  Memory Game Items: ${beforeCounts[5].rows[0].count}`);
        console.log(`  Quiz Questions: ${beforeCounts[6].rows[0].count}\n`);

        console.log('🗑️  Starting cleanup process...\n');

        // Delete in reverse order of dependencies (child tables first)
        console.log('1. Cleaning activity-specific data...');
        await executeQuery(client, 'DELETE FROM quiz_answer_option_translations');
        await executeQuery(client, 'DELETE FROM quiz_answer_options');
        await executeQuery(client, 'DELETE FROM quiz_question_translations');
        await executeQuery(client, 'DELETE FROM quiz_questions');

        await executeQuery(client, 'DELETE FROM memory_game_item_translations');
        await executeQuery(client, 'DELETE FROM memory_game_items');

        await executeQuery(client, 'DELETE FROM sorting_item_translations');
        await executeQuery(client, 'DELETE FROM sorting_items');
        await executeQuery(client, 'DELETE FROM sorting_category_translations');
        await executeQuery(client, 'DELETE FROM sorting_categories');

        await executeQuery(client, 'DELETE FROM fill_the_blank_item_translations');
        await executeQuery(client, 'DELETE FROM fill_the_blank_items');

        await executeQuery(client, 'DELETE FROM matching_pair_translations');
        await executeQuery(client, 'DELETE FROM matching_pairs');
        console.log('   ✅ Activity-specific data cleaned');

        console.log('2. Cleaning activities...');
        await executeQuery(client, 'DELETE FROM activity_translations');
        await executeQuery(client, 'DELETE FROM activities');
        console.log('   ✅ Activities cleaned');

        console.log('3. Cleaning lessons...');
        await executeQuery(client, 'DELETE FROM lesson_translations');
        await executeQuery(client, 'DELETE FROM lessons');
        console.log('   ✅ Lessons cleaned');

        console.log('4. Cleaning chapters...');
        await executeQuery(client, 'DELETE FROM chapter_translations');
        await executeQuery(client, 'DELETE FROM chapters');
        console.log('   ✅ Chapters cleaned');

        console.log('5. Cleaning grade levels...');
        await executeQuery(client, 'DELETE FROM grade_level_translations');
        await executeQuery(client, 'DELETE FROM grade_levels');
        console.log('   ✅ Grade levels cleaned');

        // Clean other related tables
        console.log('6. Cleaning other curriculum data...');
        await executeQuery(client, 'DELETE FROM completions');
        await executeQuery(client, 'DELETE FROM assignments');
        await executeQuery(client, 'DELETE FROM assignment_translations');
        console.log('   ✅ Other data cleaned');

        // Reset sequences to start from 1
        console.log('7. Resetting ID sequences...');
        await executeQuery(client, 'ALTER SEQUENCE grade_levels_id_seq RESTART WITH 1');
        await executeQuery(client, 'ALTER SEQUENCE chapters_id_seq RESTART WITH 1');
        await executeQuery(client, 'ALTER SEQUENCE lessons_id_seq RESTART WITH 1');
        await executeQuery(client, 'ALTER SEQUENCE activities_id_seq RESTART WITH 1');
        await executeQuery(client, 'ALTER SEQUENCE sorting_categories_id_seq RESTART WITH 1');
        await executeQuery(client, 'ALTER SEQUENCE sorting_items_id_seq RESTART WITH 1');
        await executeQuery(client, 'ALTER SEQUENCE memory_game_items_id_seq RESTART WITH 1');
        await executeQuery(client, 'ALTER SEQUENCE quiz_questions_id_seq RESTART WITH 1');
        await executeQuery(client, 'ALTER SEQUENCE quiz_answer_options_id_seq RESTART WITH 1');
        console.log('   ✅ ID sequences reset');

        // Get counts after cleaning
        console.log('\n📊 Data After Cleaning:');
        const afterCounts = await Promise.all([
            executeQuery(client, 'SELECT COUNT(*) as count FROM grade_levels'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM chapters'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM lessons'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM activities'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM sorting_categories'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM memory_game_items'),
            executeQuery(client, 'SELECT COUNT(*) as count FROM quiz_questions')
        ]);

        console.log(`  Grade Levels: ${afterCounts[0].rows[0].count}`);
        console.log(`  Chapters: ${afterCounts[1].rows[0].count}`);
        console.log(`  Lessons: ${afterCounts[2].rows[0].count}`);
        console.log(`  Activities: ${afterCounts[3].rows[0].count}`);
        console.log(`  Sorting Categories: ${afterCounts[4].rows[0].count}`);
        console.log(`  Memory Game Items: ${afterCounts[5].rows[0].count}`);
        console.log(`  Quiz Questions: ${afterCounts[6].rows[0].count}`);

        console.log('\n✅ DATABASE SUCCESSFULLY CLEANED!');
        console.log('🎯 Ready for fresh curriculum uploads');
        console.log('\nNote: User accounts, classrooms, and system languages are preserved.');

        await client.end();

    } catch (error) {
        console.error('❌ Cleaning error:', error.message);
        if (client) await client.end();
    }
}

cleanDatabase();
