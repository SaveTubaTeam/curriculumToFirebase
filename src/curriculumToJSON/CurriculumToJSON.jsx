import React, { useState } from 'react';
import CurriculumForm from "./CurriculumForm";
import GoogleDocsAPI from "./GoogleDocsAPI";

function CurriculumToJSON() {
   const [gapiState, setGapiState] = useState(null);

   function handleGapiState(value) {
      setGapiState(value);
   }

   return(
      <div className="section">
         <h1>curriculumToJSON</h1>
         <div className="card">

         <GoogleDocsAPI handleGapiState={handleGapiState}/>
         <p>
         Sign in to the Google Workspaces API with your Lehigh account! (NOTE: you need to be added to SaveTuba's Cloud Console project for this to work.)
         </p>
         </div>

         <p className="read-the-docs">
         Use the dropdowns below to select and convert SaveTuba curriculum documents into JSON.
         </p>
         <CurriculumForm gapiState={gapiState}/>

      </div>
   )
}

export default CurriculumToJSON;