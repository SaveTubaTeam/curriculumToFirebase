import { db, storage } from "../../firebase.js";
import { encode } from 'blurhash';

async function postDataHard(jsonFile, gradeName, languageCode) {
   const languageArray = ["en", "ru", "kk"];

   //iterating through all languages
   if(languageCode === 'IMAGES') {
      for(const language of languageArray) {
         console.log(`%clanguageCode: ${language}`, "color: #79C2D6; font-weight: bold;");

         for (const chapter of jsonFile) { //iterating through chapters array
            await postChapterData(chapter, gradeName, language);
         }
      }

   //only post through specified language
   } else {
      console.log(`%clanguageCode: ${languageCode}`, "color: #79C2D6; font-weight: bold;");

      for (const chapter of jsonFile) { //iterating through chapters array
         await postChapterData(chapter, gradeName, languageCode);
      }
   }
}


// @param chapter the current chapter object in JSON
async function postChapterData(chapter, gradeName, languageCode) {
   let chapterData = {
      navigation: chapter.navigation,
      title: chapter.title,
      name: chapter.name,
      icon: chapter.icon,
      colorOne: chapter.colorOne,
      colorTwo: chapter.colorTwo,
   }

   await addAttributes(chapter.icon, chapterData, 'icon');

   const chapterReference = db.collection(gradeName).doc(chapterData.navigation);

   try {
      await chapterReference.set(chapterData); //setting chapter metadata
      console.log(`%c${chapterData.navigation} set successfully!`, "color: #4A629F; font-weight: bold;");
   } catch(error) {
      console.error("postChapterData() ERROR:", error);
   }

   for (const lesson of chapter.lessons) { //chapter.lessons is referring to our JSON file's structure
      await postLessonData(lesson, chapterReference, languageCode);
   }
}


//@param {JSON} lesson the current lesson object in JSON
//@param chapterReference a reference to the current chapter within our firebase tree.
async function postLessonData(lesson, chapterReference, languageCode) {
   const lessonData = {
      navigation: lesson.navigation,
      title: lesson.title,
      thumbnail: lesson.thumbnail,
      backgroundColor: lesson.backgroundColor,
   }

   await addAttributes(lesson.thumbnail, lessonData, 'thumbnail');

   const lessonLanguageReference =  chapterReference.collection(lessonData.navigation).doc(languageCode);

   try {
      await lessonLanguageReference.set(lessonData); //setting lessonLanguage metadata
      console.log(`%c\t${lessonData.navigation}-${languageCode} set successfully!`, "color: #439EC1; font-weight: bold;");
   } catch(error) {
      console.error("postLessonData() ERROR:", error)
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

//@param currentObject the current mastery or minigame object
//@param lessonLanguageReference a reference to the current language within our current lesson down our firebase tree.
async function postMasteryAndMinigameData(currentObject, lessonLanguageReference) {
   const masteryAndMinigamesReference = lessonLanguageReference.collection("masteryAndMinigames").doc(currentObject.navigation);

   try{
      const modifiedObject = await modifyMasteryAndMinigameObject(currentObject);

      await masteryAndMinigamesReference.set(modifiedObject);
      console.log(`%c\t\t${modifiedObject.navigation} set successfully!`, "color: #6D90B3; font-weight: bold;");
   } catch(error) {
      console.error("postMasteryAndMinigameData() ERROR:", error);
   }
}

//Sorting, Memory, Mastery, ImageBoom all have images.
//for the purpose of adding two more attributes alongside all 'image' attributes: download urls and blurhashes.
async function modifyMasteryAndMinigameObject(currentObject) {
   if(currentObject.navigation !== "Mastery") {
      await addAttributes(currentObject.icon, currentObject, 'icon');
   }

   if(currentObject.navigation.includes("Memory") || currentObject.navigation.includes("Mastery")) {
      if(currentObject.content) {
         currentObject.content = await iterateThroughArray(currentObject.content);
      }
   } 
   
   else if(currentObject.navigation.includes("Sorting")) {
      currentObject.categories = await iterateThroughArray(currentObject.categories);
   } 
   
   else if(currentObject.navigation.includes("Image Boom")) {
      await addAttributes(currentObject.image, currentObject, 'image');
   }

   return currentObject;
}

//@param {string} filepath 
//@param {string} label either 'icon', 'thumbnail', or 'image' with our current data format. Subject to change.
//this function returns nothing. It modifies the given object on the fly.
async function addAttributes(filePath, object, label) {
   const downloadURL = await fetchDownloadURL(filePath);
   const blurhash = await generateBlurHash(downloadURL);

   const downloadAttribute = `${label}DownloadURL`;
   const blurhashAttribute = `${label}BlurHash`;

   object[downloadAttribute] = downloadURL;
   object[blurhashAttribute] = blurhash;
}

//@param {Object[]} array an array of objects
async function iterateThroughArray(array) {
   const resultArray = await Promise.all(array.map(async(item) => { //here item is an object. we Promise.all to block further code execution while this runs.

      if(item.hasOwnProperty('image')) { //see here for hasOwnProperty(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
         await addAttributes(item.image, item, 'image');
      }

      return item; // Ensure each iteration returns the processed item
   }));

   return resultArray;
}

async function fetchDownloadURL(imageFilePath) {
   const imageRef = storage.child(imageFilePath);

   let downloadURL;
   try {
      console.log(`\t\t\tfetching URL for: ${imageFilePath}`);
      downloadURL = await imageRef.getDownloadURL(); //see here: https://firebase.google.com/docs/storage/web/download-files#web_5
   } catch(error) {
      console.error(`Error fetching download URL for ${imageFilePath}: ${error}`);
   }

   return downloadURL;
}

// Functions to generate BlurHash for an image. Taken from https://github.com/woltapp/blurhash/tree/master/TypeScript
async function generateBlurHash(imageUrl) {
   console.log(`\t\t\tgenerating blurhash for: ${imageUrl}`);
   const image = await loadImage(imageUrl);
   const imageData = getImageData(image);
   return encode(imageData.data, imageData.width, imageData.height, 4, 4);
}

async function loadImage(src) {
   return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; //<-- this sets CORS policy on client-side I believe. See here: https://stackoverflow.com/questions/22097747/how-to-fix-getimagedata-error-the-canvas-has-been-tainted-by-cross-origin-data
      img.onload = () => resolve(img);
      img.onerror = (...args) => reject(args);
      img.src = src;
   });
}

function getImageData(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
};

export default postDataHard;