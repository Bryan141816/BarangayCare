import React from "react";
import { BellIcon } from "@heroicons/react/24/outline"; // Using Heroicons for the bell

const Header = () => {
  return (
    <nav className="bg-[#0F8A69] text-white px-6 py-3 flex items-center justify-between border-b-2 border-white">
      {/* Brand */}
      <div className="text-lg font-semibold">BarangayCare</div>

      {/* Right side icons */}
      <div className="flex items-center space-x-4">
        {/* Notification */}
        <button className="relative p-2 rounded-full hover:bg-teal-600">
          <BellIcon className="h-6 w-6" />
          {/* Optional: notification dot */}
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-center font-medium">
          B
        </div>
      </div>
    </nav>
  );
};
export default Header;
