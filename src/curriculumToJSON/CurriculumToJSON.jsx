import React, { useState } from 'react';
import CurriculumForm from "./CurriculumForm";
import GoogleDocsAPI from "./GoogleDocsAPI";

function CurriculumToJSON() {
   const [gapiState, setGapiState] = useState(null);

   //@callback handleGapiState to track the gapi state in GoogleDocsAPI component
   function handleGapiState(gapiClient) { 
      setGapiState(gapiClient); 
   }

   return(
      <div className="section">
         <h1>curriculumToJSON</h1>

         <GoogleDocsAPI handleGapiState={handleGapiState}/>
         <p style={{ whiteSpace: 'pre-wrap' }}>
            Sign in with your Lehigh account to access the Google Workspaces API! (NOTE: you must be added to SaveTuba's Cloud Console project for this to work.)
         </p>

         <p className="read-the-docs">
            Use the dropdown below to download SaveTuba Curriculum Google Documents as JSON.
         </p>
         <CurriculumForm gapiState={gapiState}/>

      </div>
   )
}

export default CurriculumToJSON;