import { useState, useEffect, useRef } from "react";
import {
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  SparklesIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  createSession,
  listenToMessages,
  sendUserMessage,
  sendBotReply,
  updateSessionStatus,
} from "../service/teleconsultation";
import type { ConsultationType, Message } from "../service/teleconsultation";

export interface TeleconsultationProps {
  userId: string;
}

// ------------------ Fetch today's open/active session ------------------
export async function getTodaySession(userId: string) {
  const startOfDay = Timestamp.fromDate(
    new Date(new Date().setHours(0, 0, 0, 0)),
  );
  const endOfDay = Timestamp.fromDate(
    new Date(new Date().setHours(23, 59, 59, 999)),
  );

  const q = query(
    collection(db, "teleconsultations"),
    where("userId", "==", userId),
    where("status", "in", ["open", "active"]),
    where("createdAt", ">=", startOfDay),
    where("createdAt", "<=", endOfDay),
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docData = snapshot.docs[0];
    return { id: docData.id, ...(docData.data() as any) };
  }
  return null;
}

// ------------------ Fetch closed sessions ------------------
export async function getClosedSessions(userId: string) {
  const q = query(
    collection(db, "teleconsultations"),
    where("userId", "==", userId),
    where("status", "==", "closed"),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as { id: string; type?: ConsultationType; createdAt: Timestamp }[];
}

// ------------------ Component ------------------
export default function Teleconsultation({ userId }: TeleconsultationProps) {
  const [selectedType, setSelectedType] = useState<ConsultationType>("General");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"open" | "active" | "closed">("closed");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [disabled, setDisabled] = useState(false);

  const [closedSessions, setClosedSessions] = useState<
    { id: string; type?: ConsultationType; createdAt: Timestamp }[]
  >([]);
  const [viewingClosedSession, setViewingClosedSession] = useState(false);

  // Confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"start" | "end" | null>(
    null,
  );

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const consultationTypes = [
    { name: "General", icon: <ChatBubbleLeftRightIcon className="w-6 h-6" /> },
    { name: "Medicine Question", icon: <BeakerIcon className="w-6 h-6" /> },
    { name: "Symptom Advice", icon: <SparklesIcon className="w-6 h-6" /> },
  ];

  // ------------------ Fetch sessions ------------------
  useEffect(() => {
    async function fetchSession() {
      try {
        const session = await getTodaySession(userId);
        if (session) {
          setSessionId(session.id);
          setStatus(session.status);
          setSelectedType(session.type || "General");
        } else {
          setStatus("closed");
          setSelectedType("General");
        }

        const closed = await getClosedSessions(userId);
        setClosedSessions(closed);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    }
    fetchSession();
  }, [userId]);

  // Listen to messages
  useEffect(() => {
    if (!sessionId || viewingClosedSession) return;
    const unsubscribe = listenToMessages(sessionId, setMessages);
    return () => unsubscribe();
  }, [sessionId, viewingClosedSession]);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (!chatInputRef.current) return;
    const textarea = chatInputRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
  }, [message]);

  // ------------------ Handlers ------------------
  const handleStartSession = async () => {
    if (disabled || sessionId) return;
    setDisabled(true);
    try {
      const newSessionId = await createSession(userId, selectedType);
      setSessionId(newSessionId);
      setStatus("open");
    } catch (err) {
      console.error("Failed to create session:", err);
    } finally {
      setDisabled(false);
      setConfirmOpen(false);
      setConfirmAction(null);
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    setDisabled(true);
    try {
      await updateSessionStatus(sessionId, "closed");
      setSessionId(null);
      setMessages([]);
      setMessage("");
      setStatus("closed");
      setSelectedType("General");
      setViewingClosedSession(false);
    } catch (err) {
      console.error("Failed to end session:", err);
    } finally {
      setDisabled(false);
      setConfirmOpen(false);
      setConfirmAction(null);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !sessionId) return;
    setDisabled(true);

    try {
      await sendUserMessage(sessionId, message);
      setMessage("");

      const botAlreadyReplied = messages.some((msg) => msg.sender === "bot");
      if (!botAlreadyReplied) {
        setTimeout(async () => {
          try {
            await sendBotReply(
              sessionId,
              "Thanks for your message. Our support personnel will assist you shortly.",
            );
          } catch (err) {
            console.error("Bot reply failed:", err);
          } finally {
            setDisabled(false);
          }
        }, 1500);
      } else {
        setDisabled(false);
      }
    } catch (err) {
      console.error("sendUserMessage failed:", err);
      setDisabled(false);
    }
  };

  const handleViewClosedSession = async (id: string) => {
    setSessionId(id);
    setViewingClosedSession(true);
    setStatus("closed"); // read-only
    const snapshot = await getDocs(
      collection(db, "teleconsultations", id, "messages"),
    );
    setMessages(
      snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          sender: data.sender ?? "user",
          text: data.text ?? "",
          timestamp: data.timestamp ?? null,
        } as Message;
      }),
    );
  };

  const handleBack = () => {
    setSessionId(null);
    setMessages([]);
    setViewingClosedSession(false);
    setStatus("closed");
  };

  const openConfirmModal = (action: "start" | "end") => {
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  // ------------------ Render ------------------
  return (
    <div className="flex flex-1 h-full flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#0F8A69]">
          Teleconsultation
        </h1>
        {viewingClosedSession && (
          <button
            onClick={handleBack}
            className="text-[#0F8A69] hover:text-[#0c7356] font-medium"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Consultation type selection + Start button */}
      {status === "closed" && !sessionId && !viewingClosedSession && (
        <div>
          <h2 className="text-lg font-semibold text-[#0F8A69] mb-4">
            Select Consultation Type
          </h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {consultationTypes.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelectedType(item.name as ConsultationType)}
                className={`flex flex-col items-center justify-center py-10 rounded-lg transition
                  ${selectedType === item.name ? "bg-[#0F8A69] text-white" : "bg-white text-[#0F8A69]"}`}
              >
                {item.icon}
                <span className="mt-1 font-medium text-sm">{item.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => openConfirmModal("start")}
            disabled={disabled}
            className="w-full bg-[#0F8A69] text-white py-3 rounded-lg font-medium hover:bg-[#0c7356] disabled:opacity-50"
          >
            Start Teleconsultation
          </button>

          {/* Closed sessions */}
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Past Sessions</h2>
            {closedSessions.length === 0 && (
              <p className="text-gray-500">No past sessions.</p>
            )}
            <div className="space-y-3">
              {closedSessions.map((s) => {
                const createdAtDate = s.createdAt?.toDate
                  ? s.createdAt.toDate()
                  : new Date();
                const formattedDate = createdAtDate.toLocaleString();

                return (
                  <button
                    key={s.id}
                    onClick={() => handleViewClosedSession(s.id)}
                    className="w-full text-left border p-3 rounded-lg hover:bg-gray-100"
                  >
                    <div className="flex justify-between">
                      <span>
                        {s.type || "General"} - {s.id.slice(-6)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formattedDate}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Chat messages */}
      {(status === "open" || status === "active" || sessionId) && (
        <div className="flex flex-col flex-1 min-h-0 mb-4">
          <div
            ref={chatContainerRef}
            className="flex-1 bg-white rounded-xl shadow-md p-6 space-y-4 overflow-y-auto"
          >
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-4 rounded-xl max-w-xs break-words whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-[#0F8A69] text-white"
                        : msg.sender === "doctor"
                          ? "bg-blue-200 text-blue-900"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat input */}
          {status !== "closed" && !viewingClosedSession && (
            <div className="relative flex items-center space-x-3 pt-4 shrink-0">
              <textarea
                ref={chatInputRef}
                placeholder="Write a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !disabled &&
                    message.trim()
                  ) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
                style={{ resize: "none", overflow: "auto", maxHeight: "6rem" }}
                className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69]"
              />

              <button
                onClick={handleSend}
                disabled={disabled || !message.trim()}
                className={`bg-[#0F8A69] p-3 rounded-lg text-white hover:bg-[#0c7356] ${
                  disabled || !message.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <PaperAirplaneIcon className="w-6 h-6 rotate-45" />
              </button>

              <button
                onClick={() => openConfirmModal("end")}
                className="bg-red-500 p-3 rounded-lg text-white hover:bg-red-600"
              >
                End Session
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------ CONFIRMATION MODAL ------------------ */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {confirmAction === "start"
                ? "Start Teleconsultation"
                : "End Session"}
            </h2>
            <p className="mb-6 text-gray-700">
              {confirmAction === "start"
                ? "Are you sure you want to start a new teleconsultation?"
                : "Are you sure you want to end this session? You won't be able to send messages after ending."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={disabled}
              >
                Cancel
              </button>
              <button
                onClick={
                  confirmAction === "start"
                    ? handleStartSession
                    : handleEndSession
                }
                className="px-4 py-2 rounded-lg bg-[#0F8A69] text-white hover:bg-[#0c7356]"
                disabled={disabled}
              >
                {disabled ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
