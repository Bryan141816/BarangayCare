import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase.ts"; // adjust import

interface Teleconsultation {
  id: string;
  createdAt: Timestamp;
  status: string;
  // ...other fields
}

export async function getAllClosedTeleconsultations(): Promise<
  Teleconsultation[]
> {
  const q = query(
    collection(db, "teleconsultations"),
    where("status", "==", "closed"),
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs.map((doc) => {
      const { id: _ignored, ...rest } = doc.data() as Teleconsultation;
      return { id: doc.id, ...rest };
    });
  }
  return [];
}
