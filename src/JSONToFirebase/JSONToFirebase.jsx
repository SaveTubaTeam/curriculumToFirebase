import FirebaseAuth from "./FirebaseAuth";
import JSONForm from "./JSONForm";

//Auth state observer: https://firebase.google.com/docs/auth/web/start#web_7

function JSONToFirebase() {

   return(
      <>
         <div className="spacer"></div>
         <div className="section">
            <h1>JSONToFirebase</h1>

            <FirebaseAuth />
            <p>
               Sign in with OAuth for Firebase read/write access!
            </p>
            <p className="read-the-docs">
               Use the dropdowns below to post JSON files to Firestore.
            </p>
            <JSONForm />
         </div>
      </>
   )
}

export default JSONToFirebase;