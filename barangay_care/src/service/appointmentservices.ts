
import { addDoc, collection, Timestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

export interface AppointmentData {
  serviceType: string;
  preferredDateTime: string;
  purpose: string;
  requestedBy: string; // UID or email of user
}

export const createAppointment = async (data: AppointmentData) => {
  try {
    const docRef = await addDoc(collection(db, "appointments"), {
      ...data,
      status: "waiting for approval",
      location: "", // empty as requested
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error creating appointment",
    };
  }
};

export const updateAppointment = async (id: string, data: any) => {
  try {
    await updateDoc(doc(db, "appointments", id), {
      ...data,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
