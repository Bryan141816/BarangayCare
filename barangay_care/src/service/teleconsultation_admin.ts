
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";

// ---- Type-only imports ----
import type {
  Unsubscribe,
  DocumentData,
} from "firebase/firestore";

// -----------------------------
// Types
// -----------------------------

export interface TeleSession {
  id: string;
  user_id?: string;
  responder_id?: string | null;
  status?: "open" | "active" | "closed";
  createdAt?: any;
  messages?: any[];
  [key: string]: any;
}


type SessionCallback = (sessions: TeleSession[]) => void;

// -----------------------------
// Listen for all OPEN sessions
// -----------------------------
export function listenOpenSessions(callback: SessionCallback): Unsubscribe {
  const q = query(
    collection(db, "teleconsultations"),
    where("status", "==", "open"),
    where("responder_id", "==", null)
  );

  return onSnapshot(q, (snap) => {
    const sessions: TeleSession[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as DocumentData),
    }));
    callback(sessions);
  });
}

// -----------------------------
// Listen for sessions assigned to admin
// -----------------------------
export function listenResponderSessions(
  adminId: string,
  callback: SessionCallback
): Unsubscribe {
  const q = query(
    collection(db, "teleconsultations"),
    where("responder_id", "==", adminId),
    where("status", "==", "active")
  );

  return onSnapshot(q, (snap) => {
    const sessions: TeleSession[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as DocumentData),
    }));
    callback(sessions);
  });
}

// -----------------------------
// Claim a session
// -----------------------------
export async function claimSession(
  sessionId: string,
  adminId: string
): Promise<void> {
  await updateDoc(doc(db, "teleconsultations", sessionId), {
    responder_id: adminId,
    status: "active",
  });
}

