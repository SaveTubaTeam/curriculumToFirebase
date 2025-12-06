import { createDbConnection, executeQuery } from '../../config/db-connection.js';

function getGradeDisplayOrder(grade) {
    switch (grade) {
        case 'Grade 2': return 2;
        case 'Grade 3': return 3;
        case 'Grade 4': return 4;
        case 'Grade 5': return 5;
        default: return 1;
    }
}

function extractGradeAndLanguage(title) {
    const cleanTitle = title.toLowerCase();

    let grade = 'Unknown';
    if (cleanTitle.includes('grade2') || cleanTitle.includes('grade_2') || cleanTitle.includes('grade 2')) {
        grade = 'Grade 2';
    } else if (cleanTitle.includes('grade3') || cleanTitle.includes('grade_3') || cleanTitle.includes('grade 3')) {
        grade = 'Grade 3';
    } else if (cleanTitle.includes('grade4') || cleanTitle.includes('grade_4') || cleanTitle.includes('grade 4')) {
        grade = 'Grade 4';
    } else if (cleanTitle.includes('grade5') || cleanTitle.includes('grade_5') || cleanTitle.includes('grade 5')) {
        grade = 'Grade 5';
    }

    let language = 'English';
    let languageCode = 'en';
    if (cleanTitle.includes('en_') || cleanTitle.includes('english')) {
        language = 'English';
        languageCode = 'en';
    } else if (cleanTitle.includes('ru_') || cleanTitle.includes('russian')) {
        language = 'Russian';
        languageCode = 'ru';
    } else if (cleanTitle.includes('kk_') || cleanTitle.includes('kazakh')) {
        language = 'Kazakh';
        languageCode = 'kk';
    }

    return { grade, language, languageCode };
}

export async function saveJamesFormatToDatabase(docData, documentTitle) {
    let client;

    try {
        client = await createDbConnection();

        const { grade, language, languageCode } = extractGradeAndLanguage(documentTitle);

        await executeQuery(client,
            'INSERT INTO languages (code, name, display_order) VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING',
            [languageCode, language, 1]
        );

        const gradeDisplayOrder = getGradeDisplayOrder(grade);
        let gradeResult = await executeQuery(client,
            'SELECT id FROM grade_levels WHERE display_order = $1',
            [gradeDisplayOrder]
        );

        let gradeLevelId;
        if (gradeResult.rows.length > 0) {
            gradeLevelId = gradeResult.rows[0].id;
            await executeQuery(client,
                `INSERT INTO grade_level_translations (grade_level_id, language_code, name) 
                 VALUES ($1, $2, $3) ON CONFLICT (grade_level_id, language_code) DO NOTHING`,
                [gradeLevelId, languageCode, grade]
            );
        } else {
            gradeResult = await executeQuery(client,
                'INSERT INTO grade_levels (name, display_order) VALUES ($1, $2) RETURNING id',
                [grade, gradeDisplayOrder]
            );
            gradeLevelId = gradeResult.rows[0].id;

            await executeQuery(client,
                `INSERT INTO grade_level_translations (grade_level_id, language_code, name) 
                 VALUES ($1, $2, $3)`,
                [gradeLevelId, languageCode, grade]
            );
        }

        if (docData.chapters && Array.isArray(docData.chapters)) {
            for (let i = 0; i < docData.chapters.length; i++) {
                const chapter = docData.chapters[i];

                let chapterResult = await executeQuery(client,
                    'SELECT id FROM chapters WHERE grade_level_id = $1 AND chapter_order = $2',
                    [gradeLevelId, i + 1]
                );

                let chapterId;
                if (chapterResult.rows.length > 0) {
                    chapterId = chapterResult.rows[0].id;

                    await executeQuery(client,
                        'UPDATE chapters SET icon_url = $1, color_scheme = $2 WHERE id = $3',
                        [
                            chapter.icon || 'assets/cotton.png',
                            `${chapter.colorOne || 'lightblue'},${chapter.colorTwo || 'darkblue'}`,
                            chapterId
                        ]
                    );

                    await executeQuery(client,
                        `INSERT INTO chapter_translations (chapter_id, language_code, title, name) 
                         VALUES ($1, $2, $3, $4)
                         ON CONFLICT (chapter_id, language_code) 
                         DO UPDATE SET title = EXCLUDED.title, name = EXCLUDED.name`,
                        [chapterId, languageCode, chapter.title || '', chapter.name || chapter.title || '']
                    );
                } else {
                    chapterResult = await executeQuery(client,
                        `INSERT INTO chapters (grade_level_id, chapter_order, icon_url, color_scheme) 
                         VALUES ($1, $2, $3, $4) RETURNING id`,
                        [
                            gradeLevelId,
                            i + 1,
                            chapter.icon || 'assets/cotton.png',
                            `${chapter.colorOne || 'lightblue'},${chapter.colorTwo || 'darkblue'}`
                        ]
                    );
                    chapterId = chapterResult.rows[0].id;

                    await executeQuery(client,
                        `INSERT INTO chapter_translations (chapter_id, language_code, title, name) 
                         VALUES ($1, $2, $3, $4)`,
                        [chapterId, languageCode, chapter.title || '', chapter.name || chapter.title || '']
                    );
                }

                if (chapter.lessons && Array.isArray(chapter.lessons)) {
                    for (let j = 0; j < chapter.lessons.length; j++) {
                        const lesson = chapter.lessons[j];

                        let lessonResult = await executeQuery(client,
                            'SELECT id FROM lessons WHERE chapter_id = $1 AND lesson_order = $2',
                            [chapterId, j + 1]
                        );

                        let lessonId;
                        if (lessonResult.rows.length > 0) {
                            lessonId = lessonResult.rows[0].id;

                            await executeQuery(client,
                                'UPDATE lessons SET thumbnail_url = $1, background_color = $2 WHERE id = $3',
                                [
                                    lesson.thumbnail || 'assets/cotton.png',
                                    lesson.backgroundColor || '#ffffff',
                                    lessonId
                                ]
                            );

                            await executeQuery(client,
                                `INSERT INTO lesson_translations (lesson_id, language_code, title) 
                                 VALUES ($1, $2, $3)
                                 ON CONFLICT (lesson_id, language_code)
                                 DO UPDATE SET title = EXCLUDED.title`,
                                [lessonId, languageCode, lesson.title || '']
                            );
                        } else {
                            lessonResult = await executeQuery(client,
                                `INSERT INTO lessons (chapter_id, lesson_order, thumbnail_url, background_color) 
                                 VALUES ($1, $2, $3, $4) RETURNING id`,
                                [
                                    chapterId,
                                    j + 1,
                                    lesson.thumbnail || 'assets/cotton.png',
                                    lesson.backgroundColor || '#ffffff'
                                ]
                            );
                            lessonId = lessonResult.rows[0].id;

                            await executeQuery(client,
                                `INSERT INTO lesson_translations (lesson_id, language_code, title) 
                                 VALUES ($1, $2, $3)`,
                                [lessonId, languageCode, lesson.title || '']
                            );
                        }

                        if (lesson.content && Array.isArray(lesson.content)) {
                            for (let k = 0; k < lesson.content.length; k++) {
                                const activity = lesson.content[k];

                                let activityTypeName = 'General';
                                if (activity.categories) activityTypeName = 'Sorting';
                                else if (activity.options) activityTypeName = 'Quiz';
                                else if (activity.content && Array.isArray(activity.content)) activityTypeName = 'Memory';

                                let activityResult = await executeQuery(client,
                                    'SELECT id FROM activities WHERE lesson_id = $1 AND activity_order = $2',
                                    [lessonId, k + 1]
                                );

                                let activityId;
                                if (activityResult.rows.length > 0) {
                                    activityId = activityResult.rows[0].id;

                                    await executeQuery(client,
                                        'UPDATE activities SET activity_type = $1, icon_url = $2, background_color = $3 WHERE id = $4',
                                        [
                                            activityTypeName,
                                            activity.icon || 'assets/cotton.png',
                                            activity.backgroundColor || 'lightgray',
                                            activityId
                                        ]
                                    );

                                    await executeQuery(client,
                                        `INSERT INTO activity_translations (activity_id, language_code, title, prompt) 
                                         VALUES ($1, $2, $3, $4)
                                         ON CONFLICT (activity_id, language_code)
                                         DO UPDATE SET title = EXCLUDED.title, prompt = EXCLUDED.prompt`,
                                        [activityId, languageCode, activity.title || '', activity.prompt || '']
                                    );

                                    // ADD THIS: Handle updates for existing activities
                                    if (activityTypeName === 'Quiz' && activity.options) {
                                        // Update existing quiz or create if doesn't exist
                                        let questionResult = await executeQuery(client,
                                            'SELECT id FROM quiz_questions WHERE activity_id = $1',
                                            [activityId]
                                        );

                                        let questionId;
                                        if (questionResult.rows.length > 0) {
                                            questionId = questionResult.rows[0].id;
                                            await executeQuery(client,
                                                `INSERT INTO quiz_question_translations (quiz_question_id, language_code, question_text) 
                                                 VALUES ($1, $2, $3)
                                                 ON CONFLICT (quiz_question_id, language_code)
                                                 DO UPDATE SET question_text = EXCLUDED.question_text`,
                                                [questionId, languageCode, activity.prompt || '']
                                            );
                                        } else {
                                            questionResult = await executeQuery(client,
                                                `INSERT INTO quiz_questions (activity_id, question_order) 
                                                 VALUES ($1, $2) RETURNING id`,
                                                [activityId, 1]
                                            );
                                            questionId = questionResult.rows[0].id;
                                            await executeQuery(client,
                                                `INSERT INTO quiz_question_translations (quiz_question_id, language_code, question_text) 
                                                 VALUES ($1, $2, $3)`,
                                                [questionId, languageCode, activity.prompt || '']
                                            );
                                        }

                                        // Update/create answer options
                                        for (let optIndex = 0; optIndex < activity.options.length; optIndex++) {
                                            let optionResult = await executeQuery(client,
                                                'SELECT id FROM quiz_answer_options WHERE quiz_question_id = $1 AND option_order = $2',
                                                [questionId, optIndex + 1]
                                            );

                                            let optionId;
                                            if (optionResult.rows.length > 0) {
                                                optionId = optionResult.rows[0].id;
                                                await executeQuery(client,
                                                    'UPDATE quiz_answer_options SET is_correct = $1 WHERE id = $2',
                                                    [optIndex === 0, optionId]
                                                );
                                                await executeQuery(client,
                                                    `INSERT INTO quiz_answer_option_translations (quiz_answer_option_id, language_code, option_text) 
                                                     VALUES ($1, $2, $3)
                                                     ON CONFLICT (quiz_answer_option_id, language_code)
                                                     DO UPDATE SET option_text = EXCLUDED.option_text`,
                                                    [optionId, languageCode, activity.options[optIndex]]
                                                );
                                            } else {
                                                optionResult = await executeQuery(client,
                                                    `INSERT INTO quiz_answer_options (quiz_question_id, option_order, is_correct) 
                                                     VALUES ($1, $2, $3) RETURNING id`,
                                                    [questionId, optIndex + 1, optIndex === 0]
                                                );
                                                optionId = optionResult.rows[0].id;
                                                await executeQuery(client,
                                                    `INSERT INTO quiz_answer_option_translations (quiz_answer_option_id, language_code, option_text) 
                                                     VALUES ($1, $2, $3)`,
                                                    [optionId, languageCode, activity.options[optIndex]]
                                                );
                                            }
                                        }

                                        // Clean up extra options
                                        await executeQuery(client,
                                            'DELETE FROM quiz_answer_options WHERE quiz_question_id = $1 AND option_order > $2',
                                            [questionId, activity.options.length]
                                        );
                                    }

                                    if (activityTypeName === 'Memory' && activity.content) {
                                        for (let memIndex = 0; memIndex < activity.content.length; memIndex++) {
                                            const memoryItem = activity.content[memIndex];

                                            let itemResult = await executeQuery(client,
                                                'SELECT id FROM memory_game_items WHERE activity_id = $1 AND item_order = $2',
                                                [activityId, memIndex + 1]
                                            );

                                            if (itemResult.rows.length > 0) {
                                                const itemId = itemResult.rows[0].id;
                                                await executeQuery(client,
                                                    'UPDATE memory_game_items SET image_url = $1 WHERE id = $2',
                                                    [memoryItem.image || '', itemId]
                                                );
                                                await executeQuery(client,
                                                    `INSERT INTO memory_game_item_translations (item_id, language_code, item_name) 
                                                     VALUES ($1, $2, $3)
                                                     ON CONFLICT (item_id, language_code) 
                                                     DO UPDATE SET item_name = EXCLUDED.item_name`,
                                                    [itemId, languageCode, memoryItem.name || '']
                                                );
                                            } else {
                                                const newItemResult = await executeQuery(client,
                                                    `INSERT INTO memory_game_items (activity_id, item_order, image_url) 
                                                     VALUES ($1, $2, $3) RETURNING id`,
                                                    [activityId, memIndex + 1, memoryItem.image || '']
                                                );
                                                const newItemId = newItemResult.rows[0].id;
                                                await executeQuery(client,
                                                    `INSERT INTO memory_game_item_translations (item_id, language_code, item_name) 
                                                     VALUES ($1, $2, $3)`,
                                                    [newItemId, languageCode, memoryItem.name || '']
                                                );
                                            }
                                        }

                                        // Clean up extra memory items
                                        await executeQuery(client,
                                            'DELETE FROM memory_game_items WHERE activity_id = $1 AND item_order > $2',
                                            [activityId, activity.content.length]
                                        );
                                    }

                                    if (activityTypeName === 'Sorting' && activity.categories) {
                                        for (let catIndex = 0; catIndex < activity.categories.length; catIndex++) {
                                            const category = activity.categories[catIndex];

                                            let categoryResult = await executeQuery(client,
                                                'SELECT id FROM sorting_categories WHERE activity_id = $1 AND category_order = $2',
                                                [activityId, catIndex + 1]
                                            );

                                            let categoryId;
                                            if (categoryResult.rows.length > 0) {
                                                categoryId = categoryResult.rows[0].id;
                                                await executeQuery(client,
                                                    `INSERT INTO sorting_category_translations (category_id, language_code, name) 
                                                     VALUES ($1, $2, $3)
                                                     ON CONFLICT (category_id, language_code) 
                                                     DO UPDATE SET name = EXCLUDED.name`,
                                                    [categoryId, languageCode, category.name || '']
                                                );
                                            } else {
                                                categoryResult = await executeQuery(client,
                                                    `INSERT INTO sorting_categories (activity_id, category_order) 
                                                     VALUES ($1, $2) RETURNING id`,
                                                    [activityId, catIndex + 1]
                                                );
                                                categoryId = categoryResult.rows[0].id;
                                                await executeQuery(client,
                                                    `INSERT INTO sorting_category_translations (category_id, language_code, name) 
                                                     VALUES ($1, $2, $3)`,
                                                    [categoryId, languageCode, category.name || '']
                                                );
                                            }

                                            // Update/create sorting items
                                            if (category.items) {
                                                for (let itemIndex = 0; itemIndex < category.items.length; itemIndex++) {
                                                    let sortingItemResult = await executeQuery(client,
                                                        'SELECT id FROM sorting_items WHERE category_id = $1 AND item_order = $2',
                                                        [categoryId, itemIndex + 1]
                                                    );

                                                    if (sortingItemResult.rows.length > 0) {
                                                        const sortingItemId = sortingItemResult.rows[0].id;
                                                        await executeQuery(client,
                                                            `INSERT INTO sorting_item_translations (item_id, language_code, text) 
                                                             VALUES ($1, $2, $3)
                                                             ON CONFLICT (item_id, language_code)
                                                             DO UPDATE SET text = EXCLUDED.text`,
                                                            [sortingItemId, languageCode, category.items[itemIndex]]
                                                        );
                                                    } else {
                                                        const newSortingItemResult = await executeQuery(client,
                                                            `INSERT INTO sorting_items (category_id, item_order) 
                                                             VALUES ($1, $2) RETURNING id`,
                                                            [categoryId, itemIndex + 1]
                                                        );
                                                        const newSortingItemId = newSortingItemResult.rows[0].id;
                                                        await executeQuery(client,
                                                            `INSERT INTO sorting_item_translations (item_id, language_code, text) 
                                                             VALUES ($1, $2, $3)`,
                                                            [newSortingItemId, languageCode, category.items[itemIndex]]
                                                        );
                                                    }
                                                }

                                                // Clean up extra sorting items
                                                await executeQuery(client,
                                                    'DELETE FROM sorting_items WHERE category_id = $1 AND item_order > $2',
                                                    [categoryId, category.items.length]
                                                );
                                            }
                                        }

                                        // Clean up extra categories
                                        await executeQuery(client,
                                            'DELETE FROM sorting_categories WHERE activity_id = $1 AND category_order > $2',
                                            [activityId, activity.categories.length]
                                        );
                                    }
                                } else {
                                    activityResult = await executeQuery(client,
                                        `INSERT INTO activities (lesson_id, activity_type, activity_order, icon_url, background_color) 
                                         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                                        [
                                            lessonId,
                                            activityTypeName,
                                            k + 1,
                                            activity.icon || 'assets/cotton.png',
                                            activity.backgroundColor || 'lightgray'
                                        ]
                                    );
                                    activityId = activityResult.rows[0].id;

                                    await executeQuery(client,
                                        `INSERT INTO activity_translations (activity_id, language_code, title, prompt) 
                                         VALUES ($1, $2, $3, $4)`,
                                        [activityId, languageCode, activity.title || '', activity.prompt || '']
                                    );

                                    // Create new activity content (existing logic)
                                    if (activityTypeName === 'Quiz' && activity.options) {
                                        const questionResult = await executeQuery(client,
                                            `INSERT INTO quiz_questions (activity_id, question_order) 
                                             VALUES ($1, $2) RETURNING id`,
                                            [activityId, 1]
                                        );
                                        const questionId = questionResult.rows[0].id;

                                        await executeQuery(client,
                                            `INSERT INTO quiz_question_translations (quiz_question_id, language_code, question_text) 
                                             VALUES ($1, $2, $3)`,
                                            [questionId, languageCode, activity.prompt || '']
                                        );

                                        for (let optIndex = 0; optIndex < activity.options.length; optIndex++) {
                                            const optionResult = await executeQuery(client,
                                                `INSERT INTO quiz_answer_options (quiz_question_id, option_order, is_correct) 
                                                 VALUES ($1, $2, $3) RETURNING id`,
                                                [questionId, optIndex + 1, optIndex === 0]
                                            );
                                            const optionId = optionResult.rows[0].id;

                                            await executeQuery(client,
                                                `INSERT INTO quiz_answer_option_translations (quiz_answer_option_id, language_code, option_text) 
                                                 VALUES ($1, $2, $3)`,
                                                [optionId, languageCode, activity.options[optIndex]]
                                            );
                                        }
                                    } else if (activityTypeName === 'Memory' && activity.content) {
                                        for (let memIndex = 0; memIndex < activity.content.length; memIndex++) {
                                            const memoryItem = activity.content[memIndex];

                                            const itemResult = await executeQuery(client,
                                                `INSERT INTO memory_game_items (activity_id, item_order, image_url) 
                                                 VALUES ($1, $2, $3) RETURNING id`,
                                                [activityId, memIndex + 1, memoryItem.image || '']
                                            );
                                            const itemId = itemResult.rows[0].id;

                                            await executeQuery(client,
                                                `INSERT INTO memory_game_item_translations (item_id, language_code, item_name) 
                                                 VALUES ($1, $2, $3)`,
                                                [itemId, languageCode, memoryItem.name || '']
                                            );
                                        }
                                    } else if (activityTypeName === 'Sorting' && activity.categories) {
                                        for (let catIndex = 0; catIndex < activity.categories.length; catIndex++) {
                                            const category = activity.categories[catIndex];

                                            const categoryResult = await executeQuery(client,
                                                `INSERT INTO sorting_categories (activity_id, category_order) 
                                                 VALUES ($1, $2) RETURNING id`,
                                                [activityId, catIndex + 1]
                                            );
                                            const categoryId = categoryResult.rows[0].id;

                                            await executeQuery(client,
                                                `INSERT INTO sorting_category_translations (category_id, language_code, name) 
                                                 VALUES ($1, $2, $3)`,
                                                [categoryId, languageCode, category.name || '']
                                            );

                                            if (category.items) {
                                                for (let itemIndex = 0; itemIndex < category.items.length; itemIndex++) {
                                                    const itemResult = await executeQuery(client,
                                                        `INSERT INTO sorting_items (category_id, item_order) 
                                                         VALUES ($1, $2) RETURNING id`,
                                                        [categoryId, itemIndex + 1]
                                                    );
                                                    const itemId = itemResult.rows[0].id;

                                                    await executeQuery(client,
                                                        `INSERT INTO sorting_item_translations (item_id, language_code, text) 
                                                         VALUES ($1, $2, $3)`,
                                                        [itemId, languageCode, category.items[itemIndex]]
                                                    );
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Clean up extra activities
                        if (lesson.content && Array.isArray(lesson.content)) {
                            await executeQuery(client,
                                'DELETE FROM activities WHERE lesson_id = $1 AND activity_order > $2',
                                [lessonId, lesson.content.length]
                            );
                        }
                    }
                }

                // Clean up extra lessons
                if (chapter.lessons && Array.isArray(chapter.lessons)) {
                    await executeQuery(client,
                        'DELETE FROM lessons WHERE chapter_id = $1 AND lesson_order > $2',
                        [chapterId, chapter.lessons.length]
                    );
                }
            }
        }

        return {
            success: true,
            gradeLevelId: gradeLevelId,
            message: `Successfully saved "${documentTitle}" to database`
        };

    } catch (error) {
        console.error('Database save error:', error);
        throw error;
    } finally {
        if (client) {
            await client.end();
        }
    }
}

export async function getJamesFormatFromDatabase(gradeLevelId, languageCode = 'en') {
    let client;

    try {
        client = await createDbConnection();

        const gradeResult = await executeQuery(client,
            `SELECT gl.id, glt.name 
             FROM grade_levels gl 
             JOIN grade_level_translations glt ON gl.id = glt.grade_level_id 
             WHERE gl.id = $1 AND glt.language_code = $2`,
            [gradeLevelId, languageCode]
        );

        if (gradeResult.rows.length === 0) {
            throw new Error('Grade level not found');
        }

        const gradeInfo = gradeResult.rows[0];

        const chaptersResult = await executeQuery(client,
            `SELECT c.id, c.chapter_order, c.icon_url, c.color_scheme,
                    ct.title, ct.name
             FROM chapters c
             JOIN chapter_translations ct ON c.id = ct.chapter_id
             WHERE c.grade_level_id = $1 AND ct.language_code = $2
             ORDER BY c.chapter_order`,
            [gradeLevelId, languageCode]
        );

        const chapters = [];
        for (const chapterRow of chaptersResult.rows) {
            const lessonsResult = await executeQuery(client,
                `SELECT l.id, l.lesson_order, l.thumbnail_url, l.background_color,
                        lt.title
                 FROM lessons l
                 JOIN lesson_translations lt ON l.id = lt.lesson_id
                 WHERE l.chapter_id = $1 AND lt.language_code = $2
                 ORDER BY l.lesson_order`,
                [chapterRow.id, languageCode]
            );

            const lessons = [];
            for (const lessonRow of lessonsResult.rows) {
                const activitiesResult = await executeQuery(client,
                    `SELECT a.id, a.activity_type, a.activity_order, a.icon_url, a.background_color,
                            at.title, at.prompt
                     FROM activities a
                     JOIN activity_translations at ON a.id = at.activity_id
                     WHERE a.lesson_id = $1 AND at.language_code = $2
                     ORDER BY a.activity_order`,
                    [lessonRow.id, languageCode]
                );

                const content = [];
                for (const activityRow of activitiesResult.rows) {
                    const activity = {
                        title: activityRow.title,
                        icon: activityRow.icon_url,
                        backgroundColor: activityRow.background_color,
                        prompt: activityRow.prompt,
                        type: activityRow.activity_type
                    };

                    if (activityRow.activity_type === 'Quiz') {
                        const questionsResult = await executeQuery(client,
                            `SELECT qq.id, qqt.question_text 
                             FROM quiz_questions qq
                             JOIN quiz_question_translations qqt ON qq.id = qqt.quiz_question_id
                             WHERE qq.activity_id = $1 AND qqt.language_code = $2`,
                            [activityRow.id, languageCode]
                        );

                        if (questionsResult.rows.length > 0) {
                            const questionId = questionsResult.rows[0].id;
                            const optionsResult = await executeQuery(client,
                                `SELECT qao.option_order, qaot.option_text 
                                 FROM quiz_answer_options qao
                                 JOIN quiz_answer_option_translations qaot ON qao.id = qaot.quiz_answer_option_id
                                 WHERE qao.quiz_question_id = $1 AND qaot.language_code = $2
                                 ORDER BY qao.option_order`,
                                [questionId, languageCode]
                            );
                            activity.options = optionsResult.rows.map(row => row.option_text);
                        }
                    } else if (activityRow.activity_type === 'Memory') {
                        const memoryItemsResult = await executeQuery(client,
                            `SELECT mgi.item_order, mgi.image_url, mgit.item_name
                             FROM memory_game_items mgi
                             JOIN memory_game_item_translations mgit ON mgi.id = mgit.item_id
                             WHERE mgi.activity_id = $1 AND mgit.language_code = $2
                             ORDER BY mgi.item_order`,
                            [activityRow.id, languageCode]
                        );
                        activity.content = memoryItemsResult.rows.map(row => ({
                            name: row.item_name,
                            image: row.image_url
                        }));
                    } else if (activityRow.activity_type === 'Sorting') {
                        const categoriesResult = await executeQuery(client,
                            `SELECT sc.id, sc.category_order, sct.name
                             FROM sorting_categories sc
                             JOIN sorting_category_translations sct ON sc.id = sct.category_id
                             WHERE sc.activity_id = $1 AND sct.language_code = $2
                             ORDER BY sc.category_order`,
                            [activityRow.id, languageCode]
                        );

                        activity.categories = [];
                        for (const categoryRow of categoriesResult.rows) {
                            const itemsResult = await executeQuery(client,
                                `SELECT si.item_order, sit.text
                                 FROM sorting_items si
                                 JOIN sorting_item_translations sit ON si.id = sit.item_id
                                 WHERE si.category_id = $1 AND sit.language_code = $2
                                 ORDER BY si.item_order`,
                                [categoryRow.id, languageCode]
                            );

                            activity.categories.push({
                                name: categoryRow.name,
                                items: itemsResult.rows.map(row => row.text)
                            });
                        }
                    }

                    content.push(activity);
                }

                lessons.push({
                    title: lessonRow.title,
                    thumbnail: lessonRow.thumbnail_url,
                    backgroundColor: lessonRow.background_color,
                    numActivities: content.length,
                    content: content
                });
            }

            const colors = chapterRow.color_scheme ? chapterRow.color_scheme.split(',') : ['lightblue', 'darkblue'];

            chapters.push({
                title: chapterRow.title,
                name: chapterRow.name,
                icon: chapterRow.icon_url,
                colorOne: colors[0] || 'lightblue',
                colorTwo: colors[1] || 'darkblue',
                numLessons: lessons.length,
                lessons: lessons
            });
        }

        return {
            title: `${gradeInfo.name} Curriculum`,
            grade: gradeInfo.name,
            language: languageCode,
            chapters: chapters
        };

    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    } finally {
        if (client) {
            await client.end();
        }
    }
}