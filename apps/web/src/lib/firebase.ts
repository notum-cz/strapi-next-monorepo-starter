import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDWr4nOMngku6o-hxdCuO9hqZDsYR7Qh9U",
  authDomain: "new-world-kids-9a15e.firebaseapp.com",
  projectId: "new-world-kids-9a15e",
  storageBucket: "new-world-kids-9a15e.appspot.com",
  messagingSenderId: "498561609337",
  appId: "1:498561609337:web:91e50988520195c18deea8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
