import React, { useState, useEffect, createContext, useContext } from 'react';

const FunctionContext = createContext(); //tracks loading state to disable buttons if something is already

//For clarification: the variable prefixes 'soft' and 'hard' are for organizational purposes.
//These variables with 'soft' and 'hard' prefixes refer to their respective functions (postDataSoft, postDataHard)
function DataForm() {
   const [softValue, setSoftValue] = useState("");
   const [hardValue, setHardValue] = useState("");
   const [messageOne, setMessageOne] = useState(" ");
   const [messageTwo, setMessageTwo] = useState(" ");

   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if(messageOne.includes("Loading") || messageTwo.includes("Loading")) {
         setLoading(true);
      }
   }, [messageOne, messageTwo])

   //to track the value change in SoftDataDropdown
   function handleChangeSoftDropdown(softValue) { setSoftValue(softValue); };
   //to track the message change in postDataSoft
   function handleMessageOne(messageOne) { setMessageOne(messageOne); }

   //to track the value change in HardDataDropdown
   function handleChangeHardDropdown(hardValue) { setHardValue(hardValue); };
   //to track the message change in postDataHard
   function handleMessageTwo(messageTwo) { setMessageTwo(messageTwo); }

   return (
      <FunctionContext.Provider value={loading}>
         {/* postDataSoft form */}
         <div className='form-container'>
            <SoftDataDropdown softValue={softValue} handleChangeSoftDropdown={handleChangeSoftDropdown} />
            <PostDataSoft softValue={softValue} handleMessageOne={handleMessageOne}/>
            <p className="read-the-docs" style={{ color: 'var(--secondary)', whiteSpace: 'pre-wrap', fontWeight: 550 }}>{` ← this keeps chapter metadata and image metadata intact`}</p>
         </div>
         <p className="read-the-docs" style={{ color: 'var(--tertiary)', whiteSpace: 'pre-wrap', fontWeight: 550 }}>{messageOne}</p>

         {/* postDataHard form */}
         <div className='form-container'>
            <HardDataDropdown hardValue={hardValue} handleChangeHardDropdown={handleChangeHardDropdown} />
            <PostDataHard hardValue={hardValue} handleMessageTwo={handleMessageTwo}/>
            <p className="read-the-docs" style={{ color: 'var(--secondary)', whiteSpace: 'pre-wrap', fontWeight: 550 }}>{` ← this wipes and resets all data in the specified language`}</p>
         </div>
         <p className="read-the-docs" style={{ color: 'var(--tertiary)', whiteSpace: 'pre-wrap', fontWeight: 550 }}>{messageTwo}</p>
      </FunctionContext.Provider>
   )
}

function SoftDataDropdown({ softValue, handleChangeSoftDropdown }) {
   return (
     <select value={softValue} onChange={(e) => handleChangeSoftDropdown(e.target.value)} id="softDataDropdown">
      <option value="" id="dataSoft">Select a JSON File for postDataSoft()</option>

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

function HardDataDropdown({ hardValue, handleChangeHardDropdown }) {
   return (
     <select value={hardValue} onChange={(e) => handleChangeHardDropdown(e.target.value)} id="hardDataDropdown">
      <option value="" id="dataHard">Select a JSON File for postDataHard()</option>

       <option value="IMAGES_grade2" id="IMAGES_grade2">IMAGES_grade2.json</option>
       <option value="IMAGES_grade3" id="IMAGES_grade3">IMAGES_grade3.json</option>
       <option value="IMAGES_grade4" id="IMAGES_grade4">IMAGES_grade4.json</option>
       <option value="IMAGES_grade5" id="IMAGES_grade5">IMAGES_grade5.json</option>
     </select>
   );
}

function PostDataSoft({ softValue, handleMessageOne}) {
   const loading = useContext(FunctionContext);

   return (
      <button disabled={loading} style={{ backgroundColor: 'var(--primary)' }}>
         postDataSoft()
      </button>
   )
}

function PostDataHard({ hardValue, handleMessageTwo}) {
   const loading = useContext(FunctionContext);

   return (
      <button disabled={loading} style={{ backgroundColor: 'var(--primary)' }}>
         postDataHard()
      </button>
   )
}

export default DataForm;