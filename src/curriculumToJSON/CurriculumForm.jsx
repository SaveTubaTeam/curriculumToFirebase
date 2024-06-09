import React, { useState, useEffect } from 'react';

function CurriculumForm({ gapiState }) {
   const [value, setValue] = useState('');

  const handleChange = (value) => { //passed into Dropdown as a prop
    setValue(value);
  };

   return (
      <>
         <div className='form-container'>
            <CurriculumDropdown value={value} handleChange={handleChange} />
            <Submit value={value} gapiState={gapiState}/>
         </div>
         <p className="read-the-docs">result</p>
      </>
   )
}

//handleChange is passed in as a prop. It listens for a value change and calls handleChange in CurriculumForm
function CurriculumDropdown({ value, handleChange }) {
   return (
     <select value={value} onChange={(e) => handleChange(e.target.value)}>
      <option value="">Select a Document</option>

      {/* All of the values here are the actual Google Document IDs */}

      <optgroup label="English"></optgroup>
       <option value="en_grade1">en_grade1</option>
       <option value="en_grade2">en_grade2</option>
       <option value="en_grade3">en_grade3</option>
       <option value="en_grade3">en_grade4</option>
       <option value="en_grade3">en_grade5</option>

      <optgroup label="Russian"></optgroup>
       <option value="ru_grade1">ru_grade1</option>
       <option value="ru_grade2">ru_grade2</option>
       <option value="ru_grade3">ru_grade3</option>
       <option value="ru_grade3">ru_grade4</option>
       <option value="ru_grade3">ru_grade5</option>

      <optgroup label="Kazakh"></optgroup>
       <option value="kk_grade1">kk_grade1</option>
       <option value="kk_grade2">kk_grade2</option>
       <option value="kk_grade3">kk_grade3</option>
       <option value="kk_grade3">kk_grade4</option>
       <option value="kk_grade3">kk_grade5</option>
     </select>
   );
}

function Submit({ value, gapiState }) {
   const [disabled, setDisabled] = useState(true);

   useEffect(() => {
      if (value !== "" && gapiState !== null) {
         setDisabled(false);
         console.log("Submit button enabled");
     } else {
         setDisabled(true);
     }
   }, [value, gapiState])

   const handleClick = () => {
      if (disabled) {
         window.alert("curriculumToJSON: The submit button is disabled. Sign in and select a document to enable the button.");
      } else {
         console.log(`Document ID ${value} entered.`);
      }
   };

   return (
      <button onClick={handleClick}>Submit</button>
   )
}

export default CurriculumForm;