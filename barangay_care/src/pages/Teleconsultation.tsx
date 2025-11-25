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

export default function Teleconsultation({ userId }: TeleconsultationProps) {
  const [selectedType, setSelectedType] = useState<ConsultationType>("General");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<"open" | "active" | "closed">("closed");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const consultationTypes = [
    { name: "General", icon: <ChatBubbleLeftRightIcon className="w-8 h-8" /> },
    { name: "Medicine Question", icon: <BeakerIcon className="w-8 h-8" /> },
    { name: "Symptom Advice", icon: <SparklesIcon className="w-8 h-8" /> },
  ];

  // ------------------ Fetch today's session ------------------
  useEffect(() => {
    async function fetchSession() {
      const session = await getTodaySession(userId);
      if (session) {
        setSessionId(session.id);
        setStatus(session.status);
        setShowTypeSelection(false);
      } else {
        setStatus("closed");
        setShowTypeSelection(false);
      }
    }
    fetchSession();
  }, [userId]);

  // Listen to messages
  useEffect(() => {
    if (!sessionId) return;
    const unsubscribe = listenToMessages(sessionId, setMessages);
    return () => unsubscribe();
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => scrollToBottom(), [messages]);
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // ------------------ Handlers ------------------

  // Handle selecting a consultation type → create session immediately
  const handleSelectType = async (type: ConsultationType) => {
    if (disabled) return;
    setSelectedType(type);
    setDisabled(true);

    try {
      const newSessionId = await createSession(userId, type);
      setSessionId(newSessionId);
      setStatus("open");
      setShowTypeSelection(false);
    } catch (err) {
      console.error("Failed to create session:", err);
    } finally {
      setDisabled(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setDisabled(true);

    try {
      if (!sessionId) return;
      await sendUserMessage(sessionId, message);
      setMessage("");

      setTimeout(async () => {
        try {
          await sendBotReply(
            sessionId!,
            "Thanks for your message. A doctor will assist you shortly.",
          );
        } catch (err) {
          console.error("Bot reply failed:", err);
        } finally {
          setDisabled(false);
        }
      }, 1500);
    } catch (err) {
      console.error("sendUserMessage failed:", err);
      setDisabled(false);
    }
  };

  const handleCancel = async () => {
    if (sessionId) {
      await updateSessionStatus(sessionId, "closed");
    }
    setSessionId(null);
    setMessages([]);
    setMessage("");
    setStatus("closed");
    setShowTypeSelection(false);
    setDisabled(false);
  };

  const handleStartNewSession = () => {
    setShowTypeSelection(true);
  };

  // ------------------ Render ------------------
  return (
    <div className="flex flex-1 h-full flex-col">
      <h1 className="text-xl font-semibold text-[#0F8A69] mb-6">
        Teleconsultation
      </h1>

      <div className="flex flex-col h-full p-6">
        {/* Start new session button */}
        {status === "closed" && !showTypeSelection && (
          <button
            onClick={handleStartNewSession}
            className="bg-[#0F8A69] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#0c7356]"
          >
            Start New Session
          </button>
        )}

        {/* Consultation type selection */}
        {showTypeSelection && (
          <div className="grid grid-cols-3 gap-4 mb-6 mt-4">
            {consultationTypes.map((item) => (
              <div
                key={item.name}
                onClick={() => handleSelectType(item.name as ConsultationType)}
                className={`flex flex-col items-center justify-center border rounded-xl px-6 py-4 cursor-pointer shadow-sm transition
                  ${selectedType === item.name ? "bg-[#0F8A69] text-white" : "bg-white text-[#0F8A69]"}
                  ${disabled ? "opacity-50 pointer-events-none" : ""}`}
              >
                {item.icon}
                <span className="mt-2 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chat for open/active session */}
        {(status === "open" || status === "active") && (
          <div className="flex flex-col flex-1 min-h-0 mt-4">
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

            <div className="flex items-center space-x-3 pt-4 shrink-0">
              <input
                type="text"
                placeholder="Write a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69]"
                disabled={disabled}
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
                onClick={handleCancel}
                className="bg-red-500 p-3 rounded-lg text-white hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
