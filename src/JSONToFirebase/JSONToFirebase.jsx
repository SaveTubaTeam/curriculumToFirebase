import FirebaseAuth from "./FirebaseAuth";
import DataForm from "./DataForm";
import { useEffect } from "react";
import { auth } from "../../firebase";

//Auth state observer: https://firebase.google.com/docs/auth/web/start#web_7

function JSONToFirebase() {

   return(
      <>
         <div className="spacer"></div>
         <div className="section">
            <h1>JSONToFirebase</h1>

            <FirebaseAuth />
            <p>
            Sign in with Firebase Auth for read/write access!
            </p>
            <p className="read-the-docs">
            Use the dropdowns below to select and post JSON into Firestore.
            </p>
            <DataForm />
         </div>
      </>
   )
}

export default JSONToFirebase;