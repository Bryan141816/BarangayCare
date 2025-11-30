import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  addDoc,
  doc,
  orderBy,
  getDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

// Import the REAL Message interface so types match
import type { Message } from "./teleconsultation";

// -----------------------------
// Types
// -----------------------------
export interface TeleSession {
  id: string;
  user_id?: string;
  responder_id?: string | null;
  status?: "open" | "active" | "closed";
  createdAt?: any;
  messages?: Message[];
  [key: string]: any;
}

type SessionCallback = (sessions: TeleSession[]) => void;

// -----------------------------
// Listen for all OPEN sessions
// -----------------------------
export function listenOpenSessions(callback: SessionCallback) {
  const q = query(
    collection(db, "teleconsultations"),
    where("status", "==", "open"),
    where("responder_id", "==", null),
  );

  return onSnapshot(q, (snap) => {
    const sessions: TeleSession[] = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(sessions);
  });
}

// -----------------------------
// Listen for sessions assigned to admin
// -----------------------------
export function listenResponderSessions(
  adminId: string,
  callback: SessionCallback,
) {
  const q = query(
    collection(db, "teleconsultations"),
    where("responder_id", "==", adminId),
    where("status", "==", "active"),
  );

  return onSnapshot(q, (snap) => {
    const sessions: TeleSession[] = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(sessions);
  });
}

// -----------------------------
// Listen to messages inside a session
// -----------------------------
export function listenToMessages(
  sessionId: string,
  callback: (messages: Message[]) => void,
) {
  const q = query(
    collection(db, "teleconsultations", sessionId, "messages"),
    orderBy("timestamp", "asc"),
  );

  return onSnapshot(q, (snap) => {
    const messages: Message[] = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Message[];

    callback(messages);
  });
}
export async function getSessionStatus(
  sessionId: string,
): Promise<"open" | "active" | "closed" | null> {
  try {
    const docRef = doc(db, "teleconsultations", sessionId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.status ?? null;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Failed to get session status:", err);
    return null;
  }
}
// -----------------------------
// Listen to session status changes
// -----------------------------
export function listenSessionStatus(
  sessionId: string,
  callback: (status: "open" | "active" | "closed" | null) => void,
) {
  const docRef = doc(db, "teleconsultations", sessionId);

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback(data.status ?? null);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

// -----------------------------
// Doctor sends a message
// -----------------------------
export async function sendDoctorMessage(
  sessionId: string,
  text: string,
): Promise<void> {
  const messagesRef = collection(
    db,
    "teleconsultations",
    sessionId,
    "messages",
  );

  await addDoc(messagesRef, {
    sender: "doctor",
    text,
    timestamp: serverTimestamp(),
  });
}

// -----------------------------
// Claim a session
// -----------------------------
export async function claimSession(sessionId: string, adminId: string) {
  await updateDoc(doc(db, "teleconsultations", sessionId), {
    responder_id: adminId,
    status: "active",
  });
}

// -----------------------------
// Get all closed sessions assigned to a specific admin
// -----------------------------
export async function getClosedSessionsForAdmin(
  adminId: string,
): Promise<TeleSession[]> {
  const q = query(
    collection(db, "teleconsultations"),
    where("status", "==", "closed"),
    where("responder_id", "==", adminId),
  );

  const snap = await getDocs(q);

  if (snap.empty) return [];

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as TeleSession[];
}
