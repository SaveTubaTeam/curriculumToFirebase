import React, { useState, useEffect } from 'react';

//initial setup: https://developers.google.com/docs/api/quickstart/js
//Most of this file is boilerplate from the above link, adapted for React

//Set to client ID and API key from the SaveTuba Developer Console. User must be in the @lehigh.edu organization!!
//2022: 218900793188-bhpi2n0amicsorbpogfpe6vs5q2t0jed.apps.googleusercontent.com
const CLIENT_ID = '218900793188-0krdujh2ub4j1bkiddti006k2cste6jo.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCa8CJLDlxZav6LylYflDDQQbL_m8tTZGs';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://docs.googleapis.com/$discovery/rest?version=v1';

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/documents.readonly';

/** This component handles signing into the Google Cloud Console API
 * @param handleGapiState callback passed in from CurriculumToJSON
 * @returns two buttons, one to sign in, one to sign out 
*/
function GoogleDocsAPI({ handleGapiState }) {
   //to track API initialization
   const [gapiInited, setGapiInited] = useState(false);
   const [gisInited, setGisInited] = useState(false);
   const [tokenClient, setTokenClient] = useState(null);

   //for sign-in button
   const [isAuthorized, setIsAuthorized] = useState(false);
   const [text, setText] = useState("Google Console Sign In");

   //for sign-out button
   const [signoutVisible, setSignoutVisible] = useState(false);

   //dynamically injecting these script tags into index.html upon initial render.
   useEffect(() => {
      // Load Google API client library
      const scriptApi = document.createElement("script");
      scriptApi.src = "https://apis.google.com/js/api.js";
      scriptApi.onload = () => gapiLoaded(); //callback function
      document.body.appendChild(scriptApi);
  
      // Load Google Identity Services library
      const scriptIdentity = document.createElement("script");
      scriptIdentity.src = "https://accounts.google.com/gsi/client";
      scriptIdentity.onload = () => gisLoaded(); //callback function
      document.body.appendChild(scriptIdentity);
   }, []);

   /**
    * This useEffect enables user interaction after all libraries are loaded.
    * It is a substitute for maybeEnableButtons() from the boilerplate so that the stateful check works with React.
    */
   useEffect(() => {
      if(gapiInited && gisInited) { 
         setIsAuthorized(true); 
         console.log("Enabled Google API signin buttons");
      }
   }, [gapiInited, gisInited]);

   /**
    * Callback after api.js is loaded.
    */
   function gapiLoaded() {
      gapi.load('client', initializeGapiClient);
   }

   /**
    * Callback after the API client is loaded. Loads the discovery doc to initialize the API.
    */
   async function initializeGapiClient() {
      await gapi.client.init({
         apiKey: API_KEY,
         discoveryDocs: [DISCOVERY_DOC],
      });
      setGapiInited(true);
      console.log("GAPI client initialized");
   }

   /**
    * Callback after Google Identity Services are loaded.
    */
   function gisLoaded() {
      const result = google.accounts.oauth2.initTokenClient({
         client_id: CLIENT_ID,
         scope: SCOPES,
         callback: '', // defined later
      });
      setTokenClient(result);
      setGisInited(true);
      console.log("Google Identity Services initialized.");
   }
  
   /**
    *  Sign in the user upon button click.
    */
   function handleAuthClick() {
      if (!tokenClient) {
         console.error("Token client is not initialized.");
         return;
      }

      tokenClient.callback = async (response) => {
         if (response.error !== undefined) { throw (response); }
         
         setText("Refresh");
         setSignoutVisible(true);
         handleGapiState(gapi.client);
         console.log("Successfully signed into Google API");
      };
   
      if (gapi.client.getToken() === null) {
         // Prompt the user to select a Google Account and ask for consent to share their data
         // when establishing a new session.
         tokenClient.requestAccessToken({prompt: 'consent'});
      } else {
         // Skip display of account chooser and consent dialog for an existing session.
         tokenClient.requestAccessToken({prompt: ''});
      }
   }

   /**
    *  Sign out the user upon button click.
    */
   function handleSignoutClick() {
      const token = gapi.client.getToken();
      if (token !== null) {
         google.accounts.oauth2.revoke(token.access_token);
         gapi.client.setToken('');
         setText("Google Console Sign In");
         setSignoutVisible(false);
      }
      console.log("Signed out of Google API");
   }

   return (
      <div className='form-container'>
         {/* Sign In Button */}
         <button onClick={handleAuthClick} style={{ visibility: isAuthorized ? 'visible' : 'hidden' }} disabled={!isAuthorized}>
            {text}
         </button>
        
         {/* Sign Out Button (only visible after signin success) */}
         <button onClick={handleSignoutClick} style={{ visibility: signoutVisible ? 'visible' : 'hidden' }}>
            Sign Out
         </button>
      </div>
    );
}

export default GoogleDocsAPI;