import React, { useState, useEffect } from 'react';
import Submit from './Submit.jsx';

function CurriculumForm({ gapiState }) {
   const [value, setValue] = useState("");
   const [message, setMessage] = useState("");

   function handleChange(value) { //passed into Dropdown as a prop
      setValue(value);
   };

   function handleMessage(message) {
      setMessage(message);
   }

   return (
      <>
         <div className='form-container'>
            <CurriculumDropdown value={value} handleChange={handleChange} />
            <Submit value={value} gapiState={gapiState} handleMessage={handleMessage}/>
         </div>
         <p className="read-the-docs" style={{ color: 'var(--tertiary)', whiteSpace: 'pre-wrap', fontWeight: 550 }}>{message}</p>
      </>
   )
}

//handleChange is passed in as a prop. It listens for a value change and calls handleChange in CurriculumForm
function CurriculumDropdown({ value, handleChange }) {
   return (
     <select value={value} onChange={(e) => handleChange(e.target.value)}>
      <option value="">Select a Document</option>

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
       <option value="1IA6csdQP48BELPYuAJb0H7Ra8hokaNUSoLnDiAPxboA">en_grade2</option>
       <option value="1TQl5cMtTU3uspW8lWElf7j_VDXLy2vTmtRfzyMY1-uU">en_grade3</option>
       <option value="1EHbPeEnhUn2jXyC8szEc8syVaO5jPvxRmWrOThj3q3Q">en_grade4</option>
       <option value="12Jw0Eu4VaJUmFlm9gz1Suy9PTEH80vuKQMEyekMHvHg">en_grade5</option>

      <optgroup label="Russian"></optgroup>
       <option value="1gt3w5-RjsfO1Gpk3_Xou2UmSCf907h4DtAJiwW8gozA">ru_grade2</option>
       <option value="1B5HD6pyL4hsKWvIMfJf5rKSzaH2GEsW2gA8oAnD_sj0">ru_grade3</option>
       <option value="1XxVYou3lMLjxJHppb7lMUAmZ6vwruaOk_TIyzoa4Gd0">ru_grade4</option>
       <option value="1qSKr5fyaH8n8AGbY6_dZHA1YsFtPwObu7AtTyy0WEfE">ru_grade5</option>

      <optgroup label="Kazakh"></optgroup>
       <option value="1G14iV6T-uAsrBBZZpUR3LSPgukgLA5yv0qlevNcCQlQ">kk_grade2</option>
       <option value="1cIPIBxz0_yHW-iJhMt6qVJ0Ni2H_y4mBlsgQvNHuhPo">kk_grade3</option>
       <option value="1oUGSzcQmkHc03QpSirTDhfLb0hDV-kBL0Uz_EWHZfDw">kk_grade4</option>
       <option value="16wKMZNl3roRL3XtcgrK_eABZJeQ9eJbeh_DJWlWg-8I">kk_grade5</option>
     </select>
   );
}

export default CurriculumForm;