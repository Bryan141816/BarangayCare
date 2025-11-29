import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

import {
  listenToMessages,
  sendDoctorMessage,
  listenSessionStatus, // <- use live listener
} from "../service/teleconsultation_admin";
import type { Message } from "../service/teleconsultation";

import { PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function AdminChat() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // -----------------------------
  // Listen to messages
  // -----------------------------
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribeMessages = listenToMessages(sessionId, setMessages);
    const unsubscribeStatus = listenSessionStatus(sessionId, (status) => {
      if (status === "closed") {
        setSessionClosed(true);
        setDisabled(true);
      } else {
        setSessionClosed(false);
        setDisabled(false);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeStatus();
    };
  }, [sessionId]);

  // -----------------------------
  // Auto-scroll
  // -----------------------------
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // -----------------------------
  // Auto-resize textarea
  // -----------------------------
  useEffect(() => {
    if (!inputRef.current) return;
    const textarea = inputRef.current;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`; // max 4 lines
  }, [message]);

  // -----------------------------
  // Send message
  // -----------------------------
  const handleSend = async () => {
    if (!message.trim() || !sessionId || sessionClosed) return;
    setDisabled(true);

    try {
      await sendDoctorMessage(sessionId, message);
      setMessage("");
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setDisabled(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="flex flex-col h-full p-6">
      {/* Back button */}
      <div className="flex items-center mb-4">
        <Link
          to="/admin-teleconsultation"
          className="flex items-center text-[#0F8A69] hover:underline font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </Link>
      </div>

      <h1 className="text-xl font-semibold text-[#0F8A69] mb-6">
        Teleconsultation – Chat
      </h1>

      {/* Session closed banner */}
      {sessionClosed && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 font-medium">
          Session Closed
        </div>
      )}

      {/* Chat UI */}
      <div className="flex flex-col flex-1 min-h-0">
        <div
          ref={chatRef}
          className="flex-1 bg-white rounded-xl shadow-md p-6 space-y-4 overflow-y-auto"
        >
          {messages.map((msg) => (
            <div key={msg.id}>
              <div
                className={`flex ${
                  msg.sender === "doctor" || msg.sender === "bot"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`p-4 rounded-xl max-w-xs break-words whitespace-pre-wrap ${
                    msg.sender === "doctor"
                      ? "bg-blue-600 text-white"
                      : msg.sender === "user"
                        ? "bg-[#0F8A69] text-white"
                        : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="relative flex items-center space-x-3 pt-4 shrink-0">
          <textarea
            ref={inputRef}
            placeholder={
              sessionClosed
                ? "Cannot send messages (session closed)"
                : "Write a message"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !disabled &&
                message.trim() &&
                !sessionClosed
              ) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            style={{ resize: "none", overflow: "auto", maxHeight: "6rem" }}
            className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69]"
            disabled={disabled || sessionClosed}
          />

          <button
            onClick={handleSend}
            disabled={disabled || !message.trim() || sessionClosed}
            className={`bg-blue-600 p-3 rounded-lg text-white ${
              disabled || !message.trim() || sessionClosed
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            <PaperAirplaneIcon className="w-6 h-6 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}
