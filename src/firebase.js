import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBXIpZblwc9Ymi75-J3XWsn9F8aHz4NSzI",
  authDomain: "boslocker.firebaseapp.com",
  projectId: "boslocker",
  storageBucket: "boslocker.appspot.com",
  messagingSenderId: "47602734565",
  appId: "1:47602734565:web:7b9e14c0ff059f7d820b0c",
  measurementId: "G-V0RTN83N1D",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export const storage = getStorage(app);

export default app;
