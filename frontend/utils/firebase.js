// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_f221jObfjwEC9iXT4hxMhqrzjaqEt5g",
  authDomain: "multi-agent-ai-36c2d.firebaseapp.com",
  projectId: "multi-agent-ai-36c2d",
  storageBucket: "multi-agent-ai-36c2d.firebasestorage.app",
  messagingSenderId: "97888922085",
  appId: "1:97888922085:web:4f31e88187116551a4e70c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()
