
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import type { DocumentData, QuerySnapshot, Unsubscribe } from "firebase/firestore";


// ------------------ Types ------------------

export type Message = {
  id?: string;
  sender: "user" | "bot" | "doctor";
  text: string;
  timestamp: any; // Firestore timestamp
};

export type ConsultationType =
  | "General"
  | "Medicine Question"
  | "Symptom Advice";



// ------------------ Firestore helpers ------------------

// Create a new session
export async function createSession(
  userId: string,
  selectedType: ConsultationType,
): Promise<string> {
  if (!userId) throw new Error("Cannot create session: userId is undefined");

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const sessionId = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate(),
  )}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  await setDoc(doc(db, "teleconsultations", sessionId), {
    userId,
    type: selectedType,
    status: "open",
    responder_id: null,
    createdAt: serverTimestamp(),
  });

  return sessionId;
}

// Send user message
export async function sendUserMessage(
  sessionId: string,
  text: string,
): Promise<void> {
  if (!sessionId)
    throw new Error("Cannot send message: sessionId is undefined");

  await addDoc(collection(db, "teleconsultations", sessionId, "messages"), {
    sender: "user",
    text,
    timestamp: serverTimestamp(),
  });
}

// Send bot reply
export async function sendBotReply(
  sessionId: string,
  text: string,
): Promise<void> {
  if (!sessionId)
    throw new Error("Cannot send bot reply: sessionId is undefined");

  await addDoc(collection(db, "teleconsultations", sessionId, "messages"), {
    sender: "bot",
    text,
    timestamp: serverTimestamp(),
  });
}

// Listen to messages in real-time
export function listenToMessages(
  sessionId: string,
  callback: (messages: Message[]) => void,
): Unsubscribe {
  if (!sessionId)
    throw new Error("Cannot listen to messages: sessionId is undefined");

  const q = query(
    collection(db, "teleconsultations", sessionId, "messages"),
    orderBy("timestamp", "asc"),
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages: Message[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Message, "id">),
    }));
    callback(messages);
  });
}

// Update session status
export async function updateSessionStatus(
  sessionId: string,
  status: "open" | "active" | "closed",
) {
  if (!sessionId)
    throw new Error("Cannot update status: sessionId is undefined");

  await setDoc(
    doc(db, "teleconsultations", sessionId),
    { status },
    { merge: true },
  );
}
