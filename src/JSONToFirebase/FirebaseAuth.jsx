import React, { useState, useEffect } from 'react';
import { auth, app, provider } from '../../firebase.js'

/** The whole purpose of this OAuth is to authenticate the Firebase Auth object. 
 * Since Firebase security rules are in place, a valid Auth object allows us to read and write to Firestore and Cloud Storage.
 * @returns two buttons, one for sign in, one for sign out. 
*/
function FirebaseAuth() {
   //for signin button
   const [text, setText] = useState("Firebase Sign In");

   //for signout button
   const [signoutVisible, setSignoutVisible] = useState(false);

   //Please refer to Google OAuth signin w/ firebase: https://firebase.google.com/docs/auth/web/google-signin#web_3
   //we login to the Auth object with OAuth
   async function handleAuthClick() {
      try {
         let result = await auth.signInWithPopup(provider);

         /** @type {firebase.auth.OAuthCredential} */
         let credential = result.credential;
         // This gives you a Google Access Token. You can use it to access the Google API.
         let token = credential.accessToken;

         // The signed-in user info.
         let user = result.user;
         console.log(`User Login Success: ${user.email}`);

         setText("Refresh");
         setSignoutVisible(true);
      } catch(error) {
         console.error(`Error Code: ${error.code} | ${error.message}`);
         console.error(`Login failed with: ${error.email} | ${error.credential}`);
      }
   }

   function handleSignoutClick() {
      try {
         auth.signOut();
         console.log("Signed Out Successfully");
         setSignoutVisible(false);
      } catch(error) {
         console.error(`Error: ${error}`);
      }
   }

   return (
      <div className='form-container'>
         {/* Sign In Button */}
         <button onClick={handleAuthClick}>
            {text}
         </button>
         
         {/* Sign Out Button (only visible after signin success) */}
         <button onClick={handleSignoutClick} style={{ visibility: signoutVisible ? 'visible' : 'hidden' }}>
            Sign Out
         </button>
      </div>
   );
}

export default FirebaseAuth;