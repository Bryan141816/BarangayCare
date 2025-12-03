import {
  addDoc,
  collection,
  Timestamp,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
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
    const apptRef = doc(db, "appointments", id);

    // Get current appointment (to know requestedBy)
    const apptSnap = await getDoc(apptRef);
    if (!apptSnap.exists()) {
      return { success: false, error: "Appointment not found" };
    }

    const apptData = apptSnap.data();
    const userId = apptData.requestedBy; // Who to notify

    // Update appointment
    await updateDoc(apptRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });

    // ---- Create Notification ----
    const message = generateNotificationMessage(data.status);

    if (userId && message) {
      await addDoc(collection(db, "notifications"), {
        to: userId,
        appointmentId: id,
        message: message,
        createdAt: Timestamp.now(),
        read: false,
      });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Helper to generate the message
function generateNotificationMessage(status?: string) {
  switch (status) {
    case "approved":
      return "Your appointment has been approved.";
    case "rejected":
      return "Your appointment was rejected.";
    case "completed":
      return "Your appointment has been marked as completed.";
    case "failed":
      return "Your appointment has been marked as failed.";
    default:
      return "Your appointment has been updated.";
  }
}
