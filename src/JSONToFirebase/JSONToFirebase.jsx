

function JSONToPlatform() {
   return(
      <>
         <div className="spacer"></div>
         <div className="section">
            <h1>JSONToPlatform</h1>

            <button onClick={() => setCount((count) => count + 1)}>
               Sign In
            </button>
            <p>
            Sign in with your Lehigh account! (NOTE: you need to be added to SaveTuba's Cloud Console project for this to work.)
            </p>
            <p className="read-the-docs">
            *Use the dropdowns below to select and convert SaveTuba curriculum into JSON via the Google Docs API.
            </p>
         </div>
      </>
   )
}

export default JSONToPlatform;