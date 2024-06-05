import { initializeApp } from 'firebase/app';
import { getStorage  } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCa8CJLDlxZav6LylYflDDQQbL_m8tTZGs", //This is the Google Cloud Console browser key inside of project savetuba-5e519
  authDomain: "savetuba-5e519.firebaseapp.com",
  projectId: "savetuba-5e519",
  storageBucket: "savetuba-5e519.appspot.com",
  messagingSenderId: "218900793188",
  appId: "1:218900793188:web:a1cc3aa38d180fc6815c71"
 };
 
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app); //getting a reference to the root of our Cloud Storage bucket