import React, { useState, useEffect } from 'react';
import { downloadBlob, parseDocument } from './parser.js';

//The RunParser components which calls the script in parser.js is the last functional component at the bottom of this file.

/**
 * @param handleGapiState callback passed in from CurriculumToJSON to track Google API initialization in GoogleDocsAPI 
 * @returns the dropdown to select a curriculum document and the run parser button
*/
function CurriculumForm({ gapiState }) {
   //value refers to the value of the current selection in the dropdown
   const [value, setValue] = useState("");
   //message refers to the status message shown below the form
   const [message, setMessage] = useState(" ");

   //@callback handleChange to track the value change in CurriculumDropdown
   function handleChange(value) { setValue(value); };

   //@callback handleMessage to track the message change in Run Parser
   function handleMessage(message) { setMessage(message); }

   return (
      <>
         <div className='form-container'>
            <CurriculumDropdown value={value} handleChange={handleChange} />
            <RunParser value={value} gapiState={gapiState} handleMessage={handleMessage}/>
         </div>
         <p className="read-the-docs" style={{ color: 'var(--tertiary)', whiteSpace: 'pre-wrap', fontWeight: 550 }}>{message}</p>
      </>
   )
}

/**
 *  @param {string} value the value selected from the dropdown
 * @param handleChange callback passed in from CurriculumForm to handle the current value selection
 * @returns a dropdown form 
*/
function CurriculumDropdown({ value, handleChange }) {
   return (
     <select value={value} onChange={(e) => handleChange(e.target.value)} id="curriculumDropdown">
      <option value="" id="curriculum">Select a Document</option>

      {/* All of the values here are the actual Google Document IDs */}

      {/* 
         en_grade2: 1IA6csdQP48BELPYuAJb0H7Ra8hokaNUSoLnDiAPxboA
         en_grade3: 1TQl5cMtTU3uspW8lWElf7j_VDXLy2vTmtRfzyMY1-uU
         en_grade4: 1EHbPeEnhUn2jXyC8szEc8syVaO5jPvxRmWrOThj3q3Q
         en_grade5 FIELDWORK: 1LWNn-fisUNNUfWmrRInkPTqbguHruN8vI40GUTTAiGE
         en_grade5: 12Jw0Eu4VaJUmFlm9gz1Suy9PTEH80vuKQMEyekMHvHg

         ru_grade2: 1gt3w5-RjsfO1Gpk3_Xou2UmSCf907h4DtAJiwW8gozA
         ru_grade3: 1B5HD6pyL4hsKWvIMfJf5rKSzaH2GEsW2gA8oAnD_sj0
         ru_grade4: 1XxVYou3lMLjxJHppb7lMUAmZ6vwruaOk_TIyzoa4Gd0
         ru_grade5 FIELDWORK: 16WDtyXYHtKsa7IsAAd7nPXVyKskyjA66IBlvrc-u7Z0
         ru_grade5: 1qSKr5fyaH8n8AGbY6_dZHA1YsFtPwObu7AtTyy0WEfE

         kk_grade2: 1G14iV6T-uAsrBBZZpUR3LSPgukgLA5yv0qlevNcCQlQ
         kk_grade3: 1cIPIBxz0_yHW-iJhMt6qVJ0Ni2H_y4mBlsgQvNHuhPo
         kk_grade4: 1oUGSzcQmkHc03QpSirTDhfLb0hDV-kBL0Uz_EWHZfDw
         kk_grade5 FIELDWORK: 1TdTWWhsQIiPzH_JdhxLmmS9xBlVWkDBrh-ylqw07yMY
         kk_grade5: 16wKMZNl3roRL3XtcgrK_eABZJeQ9eJbeh_DJWlWg-8I 
      */}

      <optgroup label="English"></optgroup>
       <option value="1IA6csdQP48BELPYuAJb0H7Ra8hokaNUSoLnDiAPxboA" id="Grade2 English">Grade2 English</option>
       <option value="1TQl5cMtTU3uspW8lWElf7j_VDXLy2vTmtRfzyMY1-uU" id="Grade3 English">Grade3 English</option>
       <option value="1EHbPeEnhUn2jXyC8szEc8syVaO5jPvxRmWrOThj3q3Q" id="Grade4 English">Grade4 English</option>
       <option value="12Jw0Eu4VaJUmFlm9gz1Suy9PTEH80vuKQMEyekMHvHg" id="Grade5 English">Grade5 English</option>

      <optgroup label="Russian"></optgroup>
       <option value="1gt3w5-RjsfO1Gpk3_Xou2UmSCf907h4DtAJiwW8gozA" id="Grade2 Russian">Grade2 Russian</option>
       <option value="1B5HD6pyL4hsKWvIMfJf5rKSzaH2GEsW2gA8oAnD_sj0" id="Grade3 Russian">Grade3 Russian</option>
       <option value="1XxVYou3lMLjxJHppb7lMUAmZ6vwruaOk_TIyzoa4Gd0" id="Grade4 Russian">Grade4 Russian</option>
       <option value="1qSKr5fyaH8n8AGbY6_dZHA1YsFtPwObu7AtTyy0WEfE" id="Grade5 Russian">Grade5 Russian</option>

      <optgroup label="Kazakh"></optgroup>
       <option value="1G14iV6T-uAsrBBZZpUR3LSPgukgLA5yv0qlevNcCQlQ" id="Grade2 Kazakh">Grade2 Kazakh</option>
       <option value="1cIPIBxz0_yHW-iJhMt6qVJ0Ni2H_y4mBlsgQvNHuhPo" id="Grade3 Kazakh">Grade3 Kazakh</option>
       <option value="1oUGSzcQmkHc03QpSirTDhfLb0hDV-kBL0Uz_EWHZfDw" id="Grade4 Kazakh">Grade4 Kazakh</option>
       <option value="16wKMZNl3roRL3XtcgrK_eABZJeQ9eJbeh_DJWlWg-8I" id="Grade5 Kazakh">Grade5 Kazakh</option>
     </select>
   );
}

//@jac927 6/11/24 PLEASE NOTE: Before you start reading code in parser.js, it is heavily recommended that you:
//1. look through the Save Tuba curriculum documents and understand the format of the document (especially minigame format!)
//2. look through the existing Firestore data and understand the JSON format of chapters, lessons, languages, and minigames
//3. see the JSON parser data references in ../data/parser_references
//4. contact jameschang2005@icloud.com for questions

/** 
 * @param {string} value the Google Document ID selected from the dropdown above
 * @param gapiState the Google API Client Object
 * @param handleMessage callback to pass the message state back up to CurriculumForm
 * @returns button w/ onClick event to run parser 
*/
function RunParser({ value, gapiState, handleMessage }) {
   //soft disable button
   const [disabled, setDisabled] = useState(true);
 
   //if the parser is running, we hard disable the Run Parser button
   const [loading, setLoading] = useState(false);
 
   //checking for valid dropdown entry and gapi initialization
   useEffect(() => {
      if (value !== "" && gapiState !== null) {
         setDisabled(false);
         console.log("Run Parser button enabled");
     } else {
         setDisabled(true);
     }
   }, [value, gapiState]);
 
   //called by the Run Parser button onClick
   function handleClick() {
      if (disabled) {
         console.log("parser currently disabled.");
         handleMessage("The 'Run Parser' button is currently disabled. Sign in and select a document to enable the button.");
      } else {
         setLoading(true);
         handleMessage("Loading . . . ");
         console.log(`Document ID: ${value}`);
         getDoc();
      }
   };

   // Function to get the document and then handle the download. Some of this is taken from the getDoc() function in here: https://developers.google.com/docs/api/quickstart/js
   async function getDoc() {
      try {
         const response = await gapi.client.docs.documents.get({
            documentId: value,
         });
         const doc = response.result;
         console.log(`"${doc.title}" found.`);
         
         const jsonContent = parseDocument(doc); //see parser.js
         
         //see here for more info on Blob: https://developer.mozilla.org/en-US/docs/Web/API/Blob
         const blob = new Blob([jsonContent], { type: 'application/json' });
         downloadBlob(blob, doc.title); //see parser.js
 
         handleMessage(`Document "${doc.title}" downloaded as JSON.`);
         setLoading(false);
      } catch (err) {
         console.error(err);
         handleMessage(`Error: ${err.message}`);
         setLoading(false);
      }
   };
 
   return (
      <button disabled={loading} onClick={handleClick} style={{ backgroundColor: 'var(--primary)' }}>
         Run Parser
      </button>
   )
}

export default CurriculumForm;