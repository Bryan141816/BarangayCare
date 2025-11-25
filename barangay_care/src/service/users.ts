
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: string;
  age?: number;
  birthday?: string;
  address?: string;
  role?: string;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data() as UserProfile;
}
