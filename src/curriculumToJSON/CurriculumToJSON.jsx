import React, { useState } from 'react';
import CurriculumForm from "./CurriculumForm";
import GoogleDocsAPI from "./GoogleDocsAPI";

function CurriculumToJSON() {
   const [gapiState, setGapiState] = useState(null);

   //to track the gapi state in GoogleDocsAPI
   function handleGapiState(gapiClient) { setGapiState(gapiClient); }

   return(
      <div className="section">
         <h1>curriculumToJSON</h1>

         <GoogleDocsAPI handleGapiState={handleGapiState}/>
         <p>
         Sign in to Google Console with your Lehigh account! (NOTE: you need to be added to SaveTuba's Cloud Console project for this to work.)
         </p>

         <p className="read-the-docs">
         Use the dropdowns below to select and convert SaveTuba curriculum documents into JSON.
         </p>
         <CurriculumForm gapiState={gapiState}/>

      </div>
   )
}

export default CurriculumToJSON;