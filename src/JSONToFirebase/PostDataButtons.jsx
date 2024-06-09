import React, { useState, useEffect, useContext } from 'react';
import FunctionContext from './FunctionContext';
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

//@param {string} value a string representing the name of the JSON file object
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

   const result = {
      jsonFile: data[value],
      gradeName: capitalizeFirstLetter(value.split('_')[1]), //right side of split
      languageCode: value.split('_')[0], //left side of split 
   };

   return result;
}

function capitalizeFirstLetter(word) {
   return word.charAt(0).toUpperCase() + word.slice(1);
}

function PostDataSoft({ softValue, handleMessageOne}) {
   const loading = useContext(FunctionContext);
   const [result, setResult] = useState(null);

   useEffect(() => {
      if(softValue) {
         setResult(getParameters(softValue));
      }
   }, [softValue]);

   function handleClick() {
      if(softValue) {
         handleMessageOne("Loading . . . ");
         console.log(`Running postDataSoft w/ Parameters: ${result.jsonFile.chapters} | ${result.gradeName} | ${result.languageCode}`);
         postDataSoft(result.jsonFile.chapters, result.gradeName, result.languageCode);
      } else {
         handleMessageOne("The postDataSoft() button is currently disabled. Sign in and select a document to enable the button.");
      }
   }

   return (
      <button disabled={loading} style={{ backgroundColor: 'var(--primary)' }} onClick={handleClick}>
         postDataSoft()
      </button>
   )
}

function PostDataHard({ hardValue, handleMessageTwo}) {
   const loading = useContext(FunctionContext);
   const [result, setResult] = useState(null);

   useEffect(() => {
      if(hardValue) {
         setResult(getParameters(hardValue));
      }
   }, [hardValue]);

   function handleClick() {
      if(softValue) {
         handleMessageTwo("Loading . . . ");
         console.log(`Running postDataHard w/ Parameters: ${result.jsonFile.chapters} | ${result.gradeName} | ${result.languageCode}`);
         postDataSoft(result.jsonFile.chapters, result.gradeName, result.languageCode);
      } else {
         handleMessageTwo("The postDataHard() button is currently disabled. Sign in and select a document to enable the button.");
      }
   }

   return (
      <button disabled={loading} style={{ backgroundColor: 'var(--primary)' }} onClick={handleClick}>
         postDataHard()
      </button>
   )
}

export { PostDataSoft, PostDataHard }