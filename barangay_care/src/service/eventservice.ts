
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase"; // adjust path if needed

export interface EventData {
  eventType: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const createEvent = async (event: EventData) => {
  try {
    const docRef = await addDoc(collection(db, "events"), {
      ...event,
      createdAt: Timestamp.now(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error };
  }
};
