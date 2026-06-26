import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBXVX8Xv6fXz8WGHITGQbtyMDa_Qfc7RDQ",
  authDomain: "smartlearn-a8430.firebaseapp.com",
  projectId: "smartlearn-a8430",
  storageBucket: "smartlearn-a8430.firebasestorage.app",
  messagingSenderId: "978756197426",
  appId: "1:978756197426:web:7bb7510f7796dcaef7b02b"
};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app