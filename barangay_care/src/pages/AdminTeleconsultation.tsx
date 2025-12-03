import { useEffect, useState } from "react";
import {
  listenOpenSessions,
  listenResponderSessions,
  claimSession,
  getClosedSessionsForAdmin,
} from "../service/teleconsultation_admin";
import type { TeleSession } from "../service/teleconsultation_admin";

import { Link } from "react-router-dom";
import { getUserProfile, type UserProfile } from "../service/users";

interface AdminTeleconsultationProps {
  userId: string;
}

interface SessionWithUser extends TeleSession {
  user?: UserProfile | null;
}

export default function AdminTeleconsultation({
  userId,
}: AdminTeleconsultationProps) {
  const [openSessions, setOpenSessions] = useState<SessionWithUser[]>([]);
  const [mySessions, setMySessions] = useState<SessionWithUser[]>([]);
  const [closedSessions, setClosedSessions] = useState<SessionWithUser[]>([]);

  const [modalSession, setModalSession] = useState<SessionWithUser | null>(
    null,
  );
  const [isClaiming, setIsClaiming] = useState(false);

  // ---------------- Helper: Attach user profile ----------------
  async function attachUsers(
    sessions: TeleSession[],
  ): Promise<SessionWithUser[]> {
    const results = await Promise.all(
      sessions.map(async (s) => {
        const uid = (s as any).user_id || (s as any).userId;
        const user = uid ? await getUserProfile(uid) : null;
        return { ...s, user };
      }),
    );
    return results;
  }

  // ---------------- Fetch sessions ----------------
  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const todayIdPrefix = `${yyyy}${mm}${dd}`;

    const unsub1 = listenOpenSessions(async (sessions) => {
      const todaySessions = sessions.filter((s) =>
        String(s.id).startsWith(todayIdPrefix),
      );
      const enriched = await attachUsers(todaySessions);
      setOpenSessions(enriched);
    });

    const unsub2 = listenResponderSessions(userId, async (sessions) => {
      const todaySessions = sessions.filter((s) =>
        String(s.id).startsWith(todayIdPrefix),
      );
      const enriched = await attachUsers(todaySessions);
      setMySessions(enriched);
    });

    const fetchClosed = async () => {
      const closed = await getClosedSessionsForAdmin(userId);
      const enriched = await attachUsers(closed);
      setClosedSessions(enriched);
    };
    fetchClosed();

    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, [userId]);

  // ---------------- Handle claim session ----------------
  const handleConfirmClaim = (session: SessionWithUser) => {
    setModalSession(session);
  };

  const handleClaimSession = async () => {
    if (!modalSession) return;

    setIsClaiming(true);
    try {
      await claimSession(modalSession.id, userId);

      setModalSession(null);
    } catch (err) {
      console.error("Failed to claim session:", err);
      alert("Failed to claim session. It may have already been claimed.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-[#0F8A69] mb-6">
        Admin – Teleconsultations
      </h1>

      {/* Open Sessions */}
      <h2 className="text-lg font-medium mb-3">Unassigned Sessions</h2>
      <div className="space-y-3">
        {openSessions.length === 0 && (
          <p className="text-gray-500">No unassigned sessions.</p>
        )}
        {openSessions.map((s) => (
          <div key={s.id} className="border p-4 rounded-lg">
            <p>
              <strong>User:</strong>{" "}
              {s.user ? `${s.user.firstName} ${s.user.lastName}` : s.user_id}
            </p>
            <p>
              <strong>Type:</strong> {s.type || "N/A"}
            </p>
            <button
              onClick={() => handleConfirmClaim(s)}
              className="mt-3 py-2 px-4 rounded-lg text-white bg-[#0F8A69] hover:bg-[#0c7356]"
            >
              Claim Session
            </button>
          </div>
        ))}
      </div>

      {/* My Active Sessions */}
      <h2 className="text-lg font-medium mt-8 mb-3">My Active Sessions</h2>
      <div className="space-y-3">
        {mySessions.length === 0 && (
          <p className="text-gray-500">You don't have active sessions.</p>
        )}
        {mySessions.map((s) => (
          <div key={s.id} className="border p-4 rounded-lg">
            <p>
              <strong>User:</strong>{" "}
              {s.user ? `${s.user.firstName} ${s.user.lastName}` : s.user_id}
            </p>
            <p>
              <strong>Type:</strong> {s.type || "N/A"}
            </p>
            <Link
              to={`/admin-chat/${s.id}`}
              className="mt-3 block bg-blue-600 text-white py-2 px-4 rounded-lg text-center"
            >
              Open Chat
            </Link>
          </div>
        ))}
      </div>

      {/* Closed Sessions */}
      <h2 className="text-lg font-medium mt-8 mb-3">
        Closed Sessions (History)
      </h2>
      <div className="space-y-3">
        {closedSessions.length === 0 && (
          <p className="text-gray-500">No closed sessions yet.</p>
        )}
        {closedSessions.map((s) => (
          <div key={s.id} className="border p-4 rounded-lg">
            <p>
              <strong>User:</strong>{" "}
              {s.user ? `${s.user.firstName} ${s.user.lastName}` : s.user_id}
            </p>
            <p>
              <strong>Type:</strong> {s.type || "N/A"}
            </p>
            <Link
              to={`/admin-chat/${s.id}`}
              className="mt-3 block bg-gray-600 text-white py-2 px-4 rounded-lg text-center"
            >
              View Chat
            </Link>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {modalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Claim
            </h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to claim the session for{" "}
              <strong>
                {modalSession.user
                  ? `${modalSession.user.firstName} ${modalSession.user.lastName}`
                  : modalSession.user_id}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => !isClaiming && setModalSession(null)}
                className={`px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 ${
                  isClaiming ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleClaimSession}
                className={`px-4 py-2 rounded-lg bg-[#0F8A69] text-white hover:bg-[#0c7356] ${
                  isClaiming ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={isClaiming}
              >
                {isClaiming ? "Claiming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
