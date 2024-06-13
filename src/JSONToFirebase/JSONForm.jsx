import React, { useState, useEffect } from 'react';
import { PostDataSoft, PostDataHard } from './PostDataButtons';
import FunctionContext from './FunctionContext';
import getImageAttributes from './getImageAttributes';

/** For clarification: the variable prefixes 'soft' and 'hard' are for organizational purposes.
 * These variables with 'soft' and 'hard' prefixes refer to their respective functions (postDataSoft, postDataHard)
 * @returns Three forms: two dropdown forms for postDataSoft and postDataHard, each a postData button, 
 *          and one input form to get a specified image's downloadURL and blurhash.
*/
function JSONForm() {
   //for postDataSoft
   const [softValue, setSoftValue] = useState("");
   const [messageOne, setMessageOne] = useState(" "); //to display postDataSoft status

   //for postDataHard
   const [hardValue, setHardValue] = useState("");
   const [messageTwo, setMessageTwo] = useState(" "); //to display postDataHard status

   //for getImageAttributes
   const [inputValue, setInputValue] = useState("");
   const [downloadURL, setDownloadURL] = useState(" ");
   const [blurhash, setBlurHash] = useState(" ");

   //loading state used to track if postData scripts are running.
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if(messageOne.includes("Running") || messageTwo.includes("Running")) {
         setLoading(true);
      } else {
         setLoading(false);
      }
   }, [messageOne, messageTwo])

   //@callback handleChangeSoftDropdown to track the value change in SoftDataDropdown
   function handleChangeSoftDropdown(softValue) { setSoftValue(softValue); };
   //@callback handleMessageOne to track the message change in postDataSoft
   function handleMessageOne(messageOne) { setMessageOne(messageOne); }

   //@callback handleChangeHardDropdown to track the value change in HardDataDropdown
   function handleChangeHardDropdown(hardValue) { setHardValue(hardValue); };
   //@callback handleMessageTwo to track the message change in postDataHard
   function handleMessageTwo(messageTwo) { setMessageTwo(messageTwo); }

   //@callback handleInputChange to track the filepath input change
   function handleInputChange(event) { setInputValue(event.target.value);};

   return (
      /* note how we pass the loading variable into this context */
      <FunctionContext.Provider value={loading}>
         {/* postDataSoft form */}
         <div className='form-container'>
            <SoftDataDropdown softValue={softValue} handleChangeSoftDropdown={handleChangeSoftDropdown} />
            <PostDataSoft softValue={softValue} handleMessageOne={handleMessageOne}/>
            <p className="read-the-docs" style={{ color: 'var(--secondary)', whiteSpace: 'nowrap', fontWeight: 550 }}>{` ← this keeps chapter metadata and image metadata intact`}</p>
         </div>
         <p className="read-the-docs" style={{ color: 'var(--tertiary)', whiteSpace: 'pre-wrap', fontWeight: 550 }}>{messageOne}</p>

         {/* postDataHard form */}
         <div className='form-container'>
            <HardDataDropdown hardValue={hardValue} handleChangeHardDropdown={handleChangeHardDropdown} />
            <PostDataHard hardValue={hardValue} handleMessageTwo={handleMessageTwo}/>
            <p className="read-the-docs" style={{ color: 'var(--secondary)', whiteSpace: 'nowrap', fontWeight: 550 }}>{` ← this wipes and resets all data in all languages`}</p>
         </div>
         <p className="read-the-docs" style={{ color: 'var(--tertiary)', whiteSpace: 'pre-wrap', fontWeight: 550 }}>{messageTwo}</p>

         {/* image input form */}
         <div className='form-container'>
            <input value={inputValue} onChange={handleInputChange} />
            <button 
               style={{ backgroundColor: 'var(--primary)' }} 
               onClick={async() => {
                  try {
                     const result = await getImageAttributes(inputValue);
                     setDownloadURL(result[0]);
                     setBlurHash(result[1]);
                  } catch (error) {
                     console.error("Error while fetching image attributes:", error);
                  }
               }} 
               disabled={loading}>
                  Get Image Attributes
            </button>
         </div>
         <p className="read-the-docs" style={{ color: 'var(--tertiary)', whiteSpace: 'pre-wrap', fontWeight: 550 }}>{`${downloadURL}`}</p>
         <p className="read-the-docs" style={{ color: 'var(--tertiary)', whiteSpace: 'pre-wrap', fontWeight: 550 }}>{`blurhash: ${blurhash}`}</p>
      </FunctionContext.Provider>
   )
}

/**
 * @param {string} softValue the value selected in this dropdown
 * @param handleChangeSoftDropdown callback passed in from JSONForm to handle the current value selection 
 * @returns a dropdown with all JSON language file options
*/
function SoftDataDropdown({ softValue, handleChangeSoftDropdown }) {
   return (
     <select value={softValue} onChange={(e) => handleChangeSoftDropdown(e.target.value)} id="softDataDropdown">
      <option value="" id="dataSoft">Select a JSON File to postDataSoft()</option>

      <optgroup label="English"></optgroup>
       <option value="en_grade2" id="en_grade2">en_grade2.json</option>
       <option value="en_grade3" id="en_grade3">en_grade3.json</option>
       <option value="en_grade4" id="en_grade4">en_grade4.json</option>
       <option value="en_grade5" id="en_grade5">en_grade5.json</option>

      <optgroup label="Russian"></optgroup>
       <option value="ru_grade2" id="ru_grade2">ru_grade2.json</option>
       <option value="ru_grade3" id="ru_grade3">ru_grade3.json</option>
       <option value="ru_grade4" id="ru_grade4">ru_grade4.json</option>
       <option value="ru_grade5" id="ru_grade5">ru_grade5.json</option>

      <optgroup label="Kazakh"></optgroup>
       <option value="kk_grade2" id="kk_grade2">kk_grade2.json</option>
       <option value="kk_grade3" id="kk_grade3">kk_grade3.json</option>
       <option value="kk_grade4" id="kk_grade4">kk_grade4.json</option>
       <option value="kk_grade5" id="kk_grade5">kk_grade5.json</option>
     </select>
   );
}

/** 
 * @param {string} hardValue the value selected in this dropdown
 * @param handleChangeHardDropdown callback passed in from JSONForm to handle the current value selection 
 * @returns a dropdown with all JSON IMAGE file options
*/
function HardDataDropdown({ hardValue, handleChangeHardDropdown }) {
   return (
     <select value={hardValue} onChange={(e) => handleChangeHardDropdown(e.target.value)} id="hardDataDropdown">
      <option value="" id="dataHard">Select a JSON File to postDataHard()</option>

       <option value="IMAGES_grade2" id="IMAGES_grade2">IMAGES_grade2.json</option>
       <option value="IMAGES_grade3" id="IMAGES_grade3">IMAGES_grade3.json</option>
       <option value="IMAGES_grade4" id="IMAGES_grade4">IMAGES_grade4.json</option>
       <option value="IMAGES_grade5" id="IMAGES_grade5">IMAGES_grade5.json</option>
     </select>
   );
}

export default JSONForm;