import React, { useState, useRef, useEffect, useContext } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { AuthContext } from "../provider/AuthProvider";
import { logoutUser } from "../service/authservice";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { currentUser, profile } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <nav className="bg-[#0F8A69] text-white px-6 py-3 flex items-center justify-between border-b-2 border-white relative">
      {/* Brand */}
      <div className="text-lg font-semibold">BarangayCare</div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-teal-600">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Avatar + Menu Wrapper */}
        <div className="relative">
          {/* Avatar */}
          <div
            className="bg-teal-900 w-8 h-8 rounded-full flex items-center justify-center font-semibold cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering outside click
              setOpen(!open);
            }}
          >
            {profile?.firstName?.[0] || currentUser?.email?.[0] || "U"}
          </div>

          {/* Floating Menu */}
          {open && (
            <div
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-3 w-60 bg-white shadow-xl rounded-xl p-4 text-gray-800 z-50"
            >
              {/* Email / Info */}
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

              {/* Logout Button */}
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
