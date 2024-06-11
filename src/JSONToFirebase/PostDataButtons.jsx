import React, { useState, useEffect, useContext } from 'react';
import FunctionContext from './FunctionContext';
import postDataSoft from './postDataSoft.js';
import postDataHard from './postDataHard.js';

import en_grade2 from "../data/en_grade2.json"
import en_grade3 from "../data/en_grade3.json"
import en_grade4 from "../data/en_grade4.json"
import en_grade5 from "../data/en_grade5.json"
import ru_grade2 from "../data/ru_grade2.json"
import ru_grade3 from "../data/ru_grade3.json"
import ru_grade4 from "../data/ru_grade4.json"
import ru_grade5 from "../data/ru_grade5.json"
import kk_grade2 from "../data/kk_grade2.json"
import kk_grade3 from "../data/kk_grade3.json"
import kk_grade4 from "../data/kk_grade4.json"
import kk_grade5 from "../data/kk_grade5.json"
import IMAGES_grade2 from "../data/IMAGES_grade2.json"
import IMAGES_grade3 from "../data/IMAGES_grade3.json"
import IMAGES_grade4 from "../data/IMAGES_grade4.json"
import IMAGES_grade5 from "../data/IMAGES_grade5.json"

/** 
 * @param {string} value a string representing the name of the JSON file object
 * @returns {Object} parameters an object containing the necessary postData function parameters 
*/
function getParameters(value) {
   const data = {
      'en_grade2': en_grade2,
      'en_grade3': en_grade3,
      'en_grade4': en_grade4,
      'en_grade5': en_grade5,
      'ru_grade2': ru_grade2,
      'ru_grade3': ru_grade3,
      'ru_grade4': ru_grade4,
      'ru_grade5': ru_grade5,
      'kk_grade2': kk_grade2,
      'kk_grade3': kk_grade3,
      'kk_grade4': kk_grade4,
      'kk_grade5': kk_grade5,
      'IMAGES_grade2': IMAGES_grade2,
      'IMAGES_grade3': IMAGES_grade3,
      'IMAGES_grade4': IMAGES_grade4,
      'IMAGES_grade5': IMAGES_grade5,
   }

   const parameters = {
      value: value,
      jsonFile: data[value],
      gradeName: capitalizeFirstLetter(value.split('_')[1]), //right side of split
      languageCode: value.split('_')[0], //left side of split 
   };

   return parameters;
}

function capitalizeFirstLetter(word) {
   return word.charAt(0).toUpperCase() + word.slice(1);
}

/** This component calls postDataSoft to update all curriculum data in Firestore without replacing chapter metadata and all image metadata.
 * @param {string} softValue the value of the dropdown form selection for this function
 * @param handleMessageOne a callback to display the status of the function
 * @returns a button that calls postDataSoft on click. 
*/
function PostDataSoft({ softValue, handleMessageOne}) {
   //we use this loading variable to detect if either postDataSoft or postDataHard is currently posting to Firebase, and we disable buttons if so.
   const loading = useContext(FunctionContext);

   //to track postDataSoft function params
   const [parameters, setParameters] = useState(null);

   //checking for a valid dropdown form entry
   useEffect(() => {
      if(softValue) {
         setParameters(getParameters(softValue));
      }
   }, [softValue]);

   async function handleClick() {
      if(softValue) {
         handleMessageOne("Running . . . ");
         console.log("%cButtons temporarily locked. Running postDataSoft.", 'font-weight: bold;');
         console.table(parameters);

         try {
            await postDataSoft(parameters.jsonFile.chapters, parameters.gradeName, parameters.languageCode);
            console.log("%cButtons unlocked. postDataSoft() successful.", 'font-weight: bold;');
            handleMessageOne(`${parameters.value} successfully posted`);
         } catch (error) {
            console.error("Error posting data:", error);
            handleMessageOne("Failed to post data.");
         }

      } else {
         console.log("postDataSoft() currently disabled");
         handleMessageOne("The 'postDataSoft()' button is currently disabled. Sign in and select a file to enable the button.");
      }
   }

   return (
      <button disabled={loading} style={{ backgroundColor: 'var(--primary)' }} onClick={handleClick}>
         postDataSoft()
      </button>
   )
}


/** 
 * This component calls postDataHard to hard post all curriculum data in Firestore, essentially wiping and resetting everything.
 * postDataHard.js also adds two important attributes to all image metadata: a blurhash and a downloadURL to the image in our Cloud Storage bucket under assets/
 * @param {string} hardValue the value of the dropdown form selection for this function
 * @param handleMessageTwo a callback to display the status of the function
 * @returns a button that calls postDataHard on click. 
*/
function PostDataHard({ hardValue, handleMessageTwo}) {
   //we use this loading variable to detect if either postDataSoft or postDataHard is currently posting to Firebase, and we disable buttons if so.
   const loading = useContext(FunctionContext);

   //to track postDataSoft function params
   const [parameters, setParameters] = useState(null);

   //checking for a valid dropdown form entry
   useEffect(() => {
      if(hardValue) {
         setParameters(getParameters(hardValue));
      }
   }, [hardValue]);

   async function handleClick() {
      if(hardValue) {
         handleMessageTwo("Running . . . ");
         console.log("%cButtons temporarily locked. Running postDataHard.", 'font-weight: bold;');
         console.table(parameters);

         try {
            await postDataHard(parameters.jsonFile.chapters, parameters.gradeName, parameters.languageCode);
            console.log("%cButtons unlocked. postDataHard() successful.", 'font-weight: bold;');
            handleMessageTwo(`${parameters.value} successfully posted`);
         } catch (error) {
            console.error("Error posting data:", error);
            handleMessageTwo("Failed to post data.");
         }

      } else {
         console.log("postDataHard() currently disabled");
         handleMessageTwo("The 'postDataHard()' button is currently disabled. Sign in and select a file to enable the button.");
      }
   }

   return (
      <button disabled={loading} style={{ backgroundColor: 'var(--primary)' }} onClick={handleClick}>
         postDataHard()
      </button>
   )
}

export { PostDataSoft, PostDataHard }