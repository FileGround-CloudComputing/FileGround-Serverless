import firebaseConfig from "./firebaseConfig.js";
import localAdmin from "firebase-admin";
export const admin = localAdmin;
localAdmin.initializeApp(firebaseConfig);
