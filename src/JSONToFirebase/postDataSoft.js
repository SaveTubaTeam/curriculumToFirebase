import { db } from "../../firebase.js";

function postDataSoft(jsonFile, gradeName, languageCode) {
   jsonFile.forEach((chapter) => { //iterating through chapters array
      postChapterData(chapter, gradeName, languageCode); //see below
  })
}

//we do not touch the existing chapter data at all!
// @param chapter the current chapter object in JSON
function postChapterData(chapter, gradeName, languageCode) {
   const chapterReference = db.collection(gradeName).doc(chapter.navigation);

   //first checking for reference existence within db before posting JSON
   chapterReference.get().then((doc) => {
      if(!doc.exists) {
         console.log(`ERROR ${chapter.navigation} metadata does not exist`);
      }
   })

   chapter.lessons.forEach((lesson) => { //chapter.lessons is referring to our JSON file's structure
      postLessonData(lesson, chapterReference, languageCode, chapter.navigation);
   })
}

//@param lesson the current lesson object in JSON
//@param chapterReference a reference to the current chapter within our firebase tree.
function postLessonData(lesson, chapterReference, languageCode, chapterNavigation) {

   const lessonData = {
       navigation: lesson.navigation,
       title: lesson.title,
       thumbnail: lesson.thumbnail,
       backgroundColor: lesson.backgroundColor
   }
   const lessonLanguageReference =  chapterReference.collection(lessonData.navigation).doc(languageCode);

   lessonLanguageReference.get().then((doc) => {
     if(doc.exists) { //we want to modify only the title attribute
        updateLessonData(lessonData, lessonLanguageReference, doc, languageCode, chapterNavigation);
     } else {
        console.log(`ERROR ${lessonData.navigation}-${languageCode} metadata does not exist`);
     }
   });

   let duplicates = {} //to count the number of duplicate objects
   let masteryAndMinigames = lesson.content; //in our JSON, lesson.content is the array containing all of the mastery and minigame objects

   //iterating through all the current mastery and minigame objects in our JSON (each object is referred to as 'currentObject' here)
   masteryAndMinigames.forEach((currentObject) => {
       let currentObjectName = currentObject.navigation

       //first checking for duplicates
       // Initialize this attribute's count to 1 if string is encountered for the first time, otherwise increment this attribute's count
       !duplicates[currentObjectName] ? duplicates[currentObjectName] = 1 : duplicates[currentObjectName]++;

       //if there are duplicates, we change the navigation and title accordingly. duplicates[currentObjectName] is an int
       if (duplicates[currentObjectName] > 1) {
           currentObject.navigation = `${currentObjectName} ${duplicates[currentObjectName]}`;
           currentObject.title = `${currentObject.title}${duplicates[currentObjectName]}`
       }

       postMasteryAndMinigameData(currentObject, lessonLanguageReference);
   })

  // console.log("\t\tmasteryAndMinigames:");
  // lesson.content.forEach((element) => { console.log(`\t\t\t${element.navigation}`); })
}

//@param lessonData a reference to our current lessonData object
//@param lessonLanguageReference a reference to the language of our lesson
//@param doc the document within our lessonLanguageReference
async function updateLessonData(lessonData, lessonLanguageReference, doc, languageCode, chapterNavigation) {
  try {
     const existingLessonData = doc.data(); //getting the existing data object, no need to await .data() apparently
     existingLessonData.title = lessonData.title; //we only want to update the 'title' attribute if the document exists
     await lessonLanguageReference.update({ ...existingLessonData }); 
     console.log(`${chapterNavigation}-${lessonData.navigation}-${languageCode} updated successfully!`);
  } catch(error) {
     console.log("updateLessonData() ERROR:", error)
  }
}

//@param currentObject the current mastery or minigame object within our JSON
//@param lessonLanguageReference a reference to the current language within our current lesson down our firebase tree.
function postMasteryAndMinigameData(currentObject, lessonLanguageReference) {
  const masteryAndMinigamesReference = lessonLanguageReference.collection("masteryAndMinigames").doc(currentObject.navigation);

  try{ 
     masteryAndMinigamesReference.get().then((doc)=> {
        if(doc.exists) { //we only want to modify attributes that refer to texts (e.g. prompts, names, anything that can be translated)
           updateMasteryAndMinigameObject(currentObject, masteryAndMinigamesReference, doc);
        } else {
           console.log(`ERROR: minigame ${currentObject.navigation} metadata does not exist`);
        }
     });
  } catch(error) {
     console.log("ERROR in postMasteryAndMinigameData:", error)
  }
}

//We only want update attributes that contain curriculum text. Curriculum text attributes are either 'prompt' or stored within content arrays.
//This function overlays existing data with the new data in currentObject without touching images.
//@param currentObject a reference to our currentObject
//@param masteryAndMinigamesReference a reference to our current minigame within firestore
//@param doc the document stored by the masteryAndMinigamesReference
async function updateMasteryAndMinigameObject(currentObject, masteryAndMinigamesReference, doc) {
  try {
     const existingObjectData = doc.data(); //getting the existing data object

     //console.log(existingObjectData);
     //The 'content' attribute applies to Reorder, Quiz, Memory, and Mastery. However, each of these minigames has a differently structured array.
     //Memory, Mastery, and Sorting have content arrays that need to be directly modified element by element because they have images.
     //The Sorting minigame is special because it has two arrays of content: 'categories' and 'options'. Only the 'categories' array contains images
     if(existingObjectData.navigation.includes("Memory") || existingObjectData.navigation.includes("Mastery")) {
        existingObjectData.content = updateContent(existingObjectData.content, currentObject.content);
     } else if(existingObjectData.navigation.includes("Sorting")) {
        existingObjectData.categories = updateContent(existingObjectData.categories, currentObject.categories);
        existingObjectData.options = currentObject.options;
     } else if(existingObjectData.navigation.includes("Reorder") || existingObjectData.navigation.includes("Quiz")){ //case for Reorder and Quiz
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

//this updates the content array. The existing content is 'overlaid' with the new content while we preserve images.
//note: if the length of the minigame array is changed within google docs, we will not see the change reflected in firebase.
// @return result the updated array
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