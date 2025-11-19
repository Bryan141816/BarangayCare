import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase"

export interface SignupData {
  firstName: string;
  lastName: string;
  address: string;
  age: number;
  gender: string;
  birthday: string;
  email: string;
  password: string;
  role: string;
}

export const registerUser = async (data: SignupData) => {
  try {
    const { email, password, ...profile } = data;

    // 1. Create user in Firebase Auth
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // 2. Create user document in Firestore
    await setDoc(doc(db, "users", uid), {
      uid,
      email,
      ...profile,
      role: "user",
      createdAt: new Date(),
    });

    return { success: true, uid };
  } catch (error: any) {
    console.error("Error registering user:", error);
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    return {
      success: true,
      user: userCred.user,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Login failed",
    };
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
