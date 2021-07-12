import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyAD40Wr8TwVoxmefm4E9de9vfpBDES4yC8",
    authDomain: "videocall-1661f.firebaseapp.com",
    projectId: "videocall-1661f",
    storageBucket: "videocall-1661f.appspot.com",
    messagingSenderId: "312753857966",
    appId: "1:312753857966:web:3a14ca8c6922b0e6fad43f"
});

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();

export { db, auth }
