import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  CalendarDaysIcon,
  HeartIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const location = useLocation();

  const items = [
    { name: "Home", path: "/home", icon: <HomeIcon className="w-5 h-5" /> },
    {
      name: "Book Appointment",
      path: "/book-appointment",
      icon: <CalendarDaysIcon className="w-5 h-5" />,
    },
    {
      name: "Health Records",
      path: "/health-records",
      icon: <HeartIcon className="w-5 h-5" />,
    },
    {
      name: "Teleconsultation",
      path: "/teleconsultation",
      icon: <EnvelopeIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-64 h-screen bg-[#0F8A69] text-white p-4 space-y-2">
      {items.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={`
              flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition
              ${isActive ? "bg-[#0a5f49] " : "hover:bg-teal-600"}
            `}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
