import { db } from "../../firebase.js";

//See here for Firestore .update(): https://firebase.google.com/docs/database/web/read-and-write#web_11
//References to a specific document are done by chaining .collection() and .doc()

/**
 * @param {Object} jsonFile the JSON object containing all curriculum content in the specified grade and language
 * @param {string} gradeName a reference to the e.g. 'Grade2', 'Grade3', etc.
 * @param {string} languageCode e.g. 'en', 'kk', 'ru' 
*/
async function postDataSoft(jsonFile, gradeName, languageCode) {
   for (const chapter of jsonFile) { //iterating through chapters array
      await postChapterData(chapter, gradeName, languageCode);
   }
}

/** Note how we do not touch the existing chapter data at all!
 * @param {Object} chapter the current chapter object in JSON 
 * @param {string} gradeName a reference to the e.g. 'Grade2', 'Grade3', etc.
 * @param {string} languageCode e.g. 'en', 'kk', 'ru' 
*/
async function postChapterData(chapter, gradeName, languageCode) {
   const chapterData = chapter;
   const chapterReference = db.collection(gradeName).doc(chapter.navigation);
   
   try {
      const doc = await chapterReference.get();
      if(!doc.exists) {
         console.error(`ERROR ${chapter.navigation} metadata does not exist`);
         return;
      }

      await updateChapterData(chapterData, chapterReference, doc);
   } catch(e) {
      console.error(e);
      return;
   }

   //now iterating through lessons
   for (const lesson of chapter.lessons) { //chapter.lessons is referring to our JSON file's structure
      await postLessonData(lesson, chapterReference, languageCode);
   }
}

/** This modifies certain attributes in the chapter metadata and touches nothing else.
 * @param {Object} chapterData our current chapter object
 * @param chapterReference a reference to the chapter within Firestore
 * @param {Object} doc the document (aka metadata) within our chapterReference
*/
async function updateChapterData(chapterData, chapterReference, doc) {
   try {
      const existingChapterData = doc.data(); //getting the existing data object, no need to await .data() apparently
      existingChapterData.numLessons = chapterData.numLessons;
      await chapterReference.update({ ...existingChapterData }); 
      console.log(`${chapterData.navigation} updated successfully!`);
   } catch(error) {
      console.log("updateChapterData() ERROR:", error)
   }
}

/** Modifies the lesson data by only overwriting text present in the original curriculum Google Docs
 * @param {Object} lesson the current lesson object in JSON
 * @param chapterReference a reference to the current chapter within our firebase tree. 
 * @param {string} languageCode e.g. 'en', 'kk', 'ru' 
*/
async function postLessonData(lesson, chapterReference, languageCode) {
   const lessonData = lesson;
   const lessonLanguageReference =  chapterReference.collection(lessonData.navigation).doc(languageCode);

   try {
      const doc = await lessonLanguageReference.get();
      if(!doc.exists) {
         console.error(`ERROR ${lessonData.navigation}-${languageCode} metadata does not exist`);
         return;
      }

      await updateLessonData(lessonData, lessonLanguageReference, doc, languageCode); //we want to modify only the title attribute

   } catch(e) {
      console.error(e);
      return;
   }

   let duplicates = {} //to count the number of duplicate objects
   let masteryAndMinigames = lesson.content; //in our JSON, lesson.content is the array containing all of the mastery and minigame objects

   //iterating through all the current mastery and minigame objects in our JSON (each object is referred to as 'currentObject' here)
   for (const currentObject of masteryAndMinigames) {
      let currentObjectName = currentObject.navigation

      //first checking for duplicates
      // Initialize this attribute's count to 1 if string is encountered for the first time, otherwise increment this attribute's count
      !duplicates[currentObjectName] ? duplicates[currentObjectName] = 1 : duplicates[currentObjectName]++;

      //if there are duplicates, we change the navigation and title accordingly. duplicates[currentObjectName] is an int
      if (duplicates[currentObjectName] > 1) {
         currentObject.navigation = `${currentObjectName} ${duplicates[currentObjectName]}`;
         currentObject.title = `${currentObject.title}${duplicates[currentObjectName]}`
      }

      await postMasteryAndMinigameData(currentObject, lessonLanguageReference);
   }
}

/** This modifies certain attributes in the lesson metadata and touches nothing else.
 * @param {Object} lessonData our current lessonData object
 * @param lessonLanguageReference a reference to the language of the lesson within Firestore
 * @param {Object} doc the document (aka metadata) within our lessonLanguageReference
 * @param {string} languageCode e.g. 'en', 'kk', 'ru' 
*/
async function updateLessonData(lessonData, lessonLanguageReference, doc, languageCode) {
  try {
     const existingLessonData = doc.data(); //getting the existing data object, no need to await .data() apparently
     existingLessonData.title = lessonData.title; //we want to update the 'title' attribute if the document exists
     existingLessonData.numActivities = lessonData.numActivities;
     await lessonLanguageReference.update({ ...existingLessonData }); 
     console.log(`\t${lessonData.navigation}-${languageCode} updated successfully!`);
  } catch(error) {
     console.log("updateLessonData() ERROR:", error)
  }
}

/** Modifies the mastery or minigame data by only overwriting text present in the original curriculum Google Docs
 * @param {Object} currentObject the current mastery or minigame object within our JSONFile
 * @param lessonLanguageReference a reference to the current language within our current lesson down our firebase tree. 
*/
async function postMasteryAndMinigameData(currentObject, lessonLanguageReference) {
   const masteryAndMinigamesReference = lessonLanguageReference.collection("masteryAndMinigames").doc(currentObject.navigation);

   try{
      const doc = await masteryAndMinigamesReference.get();
      if(!doc.exists) {
         console.error(`ERROR: minigame ${currentObject.navigation} metadata does not exist`);
      }

      await updateMasteryAndMinigameObject(currentObject, masteryAndMinigamesReference, doc);
   } catch(error) {
      console.log("ERROR in postMasteryAndMinigameData:", error)
   }
}

/** We only want update attributes that contain curriculum text. Curriculum text attributes are either 'prompt' or stored within content arrays.
 * This function overlays existing data with the new data in currentObject without touching images.
 * @param {Object} currentObject a reference to our currentObject in the JSONFile
 * @param masteryAndMinigamesReference a reference to our current minigame within firestore
 * @param {Object} doc the document (metadata) stored by the masteryAndMinigamesReference in Firestore
*/
async function updateMasteryAndMinigameObject(currentObject, masteryAndMinigamesReference, doc) {
  try {
     const existingObjectData = doc.data(); //getting the existing data object

     //console.log(existingObjectData);
     //The 'content' attribute applies to Reorder, Quiz, Memory, and Mastery. However, each of these minigames has a differently structured array.
     //Memory, Mastery, and Sorting have content arrays that need to be directly modified element by element because they have images.
     //The Sorting minigame is special because it has two arrays of content: 'categories' and 'options'. Only the 'categories' array contains images
     if(existingObjectData.navigation.includes("Memory") || existingObjectData.navigation.includes("Mastery")) {
         if(existingObjectData.content) {
            existingObjectData.content = updateContent(existingObjectData.content, currentObject.content);
         }
     } 
     
     else if(existingObjectData.navigation.includes("Sorting")) {
        existingObjectData.categories = updateContent(existingObjectData.categories, currentObject.categories);
        existingObjectData.options = currentObject.options;
     } 
     
     else if(existingObjectData.navigation.includes("Reorder") || existingObjectData.navigation.includes("Quiz")){ //case for Reorder and Quiz
        existingObjectData.content = currentObject.content;
     }
     /*  else {
        console.log(`no content attribute for ${existingObjectData.navigation}`);
     } */

     if(existingObjectData.prompt) { //updating the minigame prompt
        existingObjectData.prompt = currentObject.prompt;
     }

     await masteryAndMinigamesReference.update({ ...existingObjectData });
     console.log(`\t\t${currentObject.navigation} successfully updated!`);
  } catch(error) {
     console.log(`updateMasteryAndMinigames() ERROR ${currentObject.navigation}:`, error)
  }
}

/** This updates the content array. The existing content is 'overlaid' with the new content while we preserve images.
 * note: if the length of the minigame array is changed within google docs, we will not see the change reflected in firebase.
 * @param {Object[]} existingContent an array of objects containing the mastery or minigame content
 * @param {Object[]} newContent the new array of objects in our JSONFile
 * @returns {Object[]} result the updated array 
*/
function updateContent(existingContent, newContent) {
   const result = [];

   for(let i=0; i<existingContent.length; i++) { //iterating through the length of existingContent

      if(existingContent[i].hasOwnProperty('image')) { //see here for hasOwnProperty(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
         delete newContent[i]['image']; //delete this property from newContent so it does not override the existing content. See here for the delete keyword: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete
      }

      result.push({ ...existingContent[i], ...newContent[i] }); //we perform a "merge" using object destructuring. order matters here!
   }
   return result;
}

export default postDataSoft;