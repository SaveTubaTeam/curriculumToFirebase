import React, { useState, useEffect } from 'react';
import { downloadBlob, parseDocument } from './parser.js';

//@param {string} value the Google Document ID selected from the dropdown above
//@param {Google API Client Object} gapiState
//@param handleMessage a function to pass the message state back up to CurriculumForm
function Submit({ value, gapiState, handleMessage }) {
  //soft disable button
  const [disabled, setDisabled] = useState(true);

  //if the parser is running, we hard disable the submit button
  const [loading, setLoading] = useState(false);

  //checking for valid dropdown entry and gapi initialization
  useEffect(() => {
     if (value !== "" && gapiState !== null) {
        setDisabled(false);
        console.log("Submit button enabled");
    } else {
        setDisabled(true);
    }
  }, [value, gapiState])

  function handleClick() {
     if (disabled) {
        handleMessage("The Submit button is currently disabled. Sign in and select a document to enable the Submit button.");
     } else {
        setLoading(true);
        handleMessage("Loading . . . ");
        console.log(`Document ID: ${value}`);
        getDoc();
     }
  };

  // Function to get document and handle the download
  async function getDoc() {
     try {
        const response = await gapi.client.docs.documents.get({
           documentId: value,
        });
        const doc = response.result;
        
        const jsonContent = parseDocument(doc); //see parser.js
        
        const blob = new Blob([jsonContent], { type: 'application/json' });
        downloadBlob(blob, doc.title); //see parser.js

        handleMessage(`Document "${doc.title}" successfully found and downloaded as JSON.`);
        setLoading(false);
     } catch (err) {
        console.error(err);
        handleMessage(`Error: ${err.message}`);
        setLoading(false);
     }
  };

  return (
     <button disabled={loading} onClick={handleClick}>Submit</button>
  )
}

export default Submit;