import { useState, useRef, useEffect, useContext } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { AuthContext } from "../provider/AuthProvider";
import { logoutUser } from "../service/authservice";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase"; // your firebase config

interface Notification {
  appointmentId: string;
  createdAt: any;
  message: string;
  read: boolean;
  to: string;
}

const Header = () => {
  const { currentUser, profile } = useContext(AuthContext);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Fetch notifications for current user
  useEffect(() => {
    if (!currentUser?.uid) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("to", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = snapshot.docs.map((doc) => ({
        appointmentId: doc.data().appointmentId,
        createdAt: doc.data().createdAt,
        message: doc.data().message,
        read: doc.data().read,
        to: doc.data().to,
      }));
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="bg-[#0F8A69] text-white px-6 py-3 flex items-center justify-between border-b-2 border-white relative">
      {/* Brand */}
      <div className="text-lg font-semibold">BarangayCare</div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notification */}
        {profile && profile.role === "user" && (
          <div className="relative">
            <button
              className="relative p-2 rounded-full hover:bg-teal-600"
              onClick={(e) => {
                e.stopPropagation();
                setNotifOpen(!notifOpen);
                setAvatarOpen(false); // close avatar menu if open
              }}
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div
                ref={notifRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl p-4 text-gray-800 z-50"
              >
                <h4 className="font-semibold mb-2">Notifications</h4>
                {notifications.length === 0 && (
                  <p className="text-gray-500 text-sm">No notifications</p>
                )}
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((notif, idx) => (
                    <li
                      key={idx}
                      className={`p-2 rounded-lg ${
                        !notif.read ? "bg-teal-50 font-semibold" : "bg-gray-100"
                      }`}
                    >
                      <p>{notif.message}</p>
                      <span className="text-xs text-gray-500">
                        {notif.createdAt?.toDate?.().toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Avatar */}
        <div className="relative">
          <div
            className="bg-teal-900 w-8 h-8 rounded-full flex items-center justify-center font-semibold cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setAvatarOpen(!avatarOpen);
              setNotifOpen(false); // close notifications if open
            }}
          >
            {profile?.firstName?.[0] || currentUser?.email?.[0] || "U"}
          </div>

          {/* Avatar Dropdown */}
          {avatarOpen && (
            <div
              ref={avatarRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-3 w-60 bg-white shadow-xl rounded-xl p-4 text-gray-800 z-50"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-teal-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold">
                  {profile?.firstName?.[0] || currentUser?.email?.[0]}
                </div>
                <div>
                  <p className="font-semibold">
                    {profile?.firstName
                      ? `${profile.firstName} ${profile.lastName}`
                      : "User"}
                  </p>
                  <p className="text-sm text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
