import { useEffect, useState } from "react";
import {
  listenOpenSessions,
  listenResponderSessions,
  claimSession,
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

  // Helper: Attach user profile to sessions

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

  useEffect(() => {
    // Build today's date in YYYYMMDD format
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const todayIdPrefix = `${yyyy}${mm}${dd}`; // e.g. "20251127"

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

    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, [userId]);

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
              onClick={() => claimSession(s.id, userId)}
              className="mt-3 bg-[#0F8A69] text-white py-2 px-4 rounded-lg"
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
    </div>
  );
}
