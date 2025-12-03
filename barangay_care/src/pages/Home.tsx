import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../provider/AuthProvider";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";

// Heroicons
import {
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

interface EventData {
  id: string;
  eventType: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}
interface AppointmentData {
  id: string;
  location: string;
  preferredDateTime: string;
  purpose: string;
  serviceType: string;
  status: string;
}

export default function Home() {
  const { currentUser, profile } = useContext(AuthContext);
  const [events, setEvents] = useState<EventData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);

  const formatTime = (hourString: string) => {
    const hour = Number(hourString);
    const suffix = hour >= 12 ? "PM" : "AM";
    const formatted = hour % 12 === 0 ? 12 : hour % 12;
    return `${formatted}:00 ${suffix}`;
  };

  useEffect(() => {
    // -------------------------------
    // Fetch UPCOMING EVENTS
    // -------------------------------
    const unsubEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventData[];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filtered = list.filter((ev) => {
        const evDate = new Date(ev.date);
        evDate.setHours(0, 0, 0, 0);
        return evDate >= today;
      });

      setEvents(filtered);
    });

    // -------------------------------
    // Fetch UPCOMING APPOINTMENTS
    // -------------------------------
    if (currentUser) {
      const appointmentQuery = query(
        collection(db, "appointments"),
        where("requestedBy", "==", currentUser.uid),
        where("status", "==", "approved"),
      );

      const unsubAppointments = onSnapshot(appointmentQuery, (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AppointmentData[];

        const now = new Date();

        const upcoming = list.filter((a) => {
          const apptDate = new Date(a.preferredDateTime);
          return apptDate >= now;
        });

        // Sort by nearest appointment first
        upcoming.sort(
          (a, b) =>
            new Date(a.preferredDateTime).getTime() -
            new Date(b.preferredDateTime).getTime(),
        );

        setAppointments(upcoming);
      });

      return () => {
        unsubEvents();
        unsubAppointments();
      };
    }

    return () => unsubEvents();
  }, [currentUser]);

  return (
    <div className="flex flex-col w-full bg-[#f1f5f9] p-4">
      {/* Header */}
      <div className="bg-[#0F8A69] text-white rounded-xl p-6 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          HI, {profile?.firstName} {profile?.lastName}
        </h1>
        <span className="opacity-90">
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* ------------------------------ */}
      {/* UPCOMING APPOINTMENT SECTION */}
      {/* ------------------------------ */}
      <h2 className="mt-6 mb-3 text-lg font-semibold text-[#0F8A69]">
        Upcoming Appointment
      </h2>

      {appointments.length === 0 ? (
        <p className="text-gray-500 text-center py-3">
          No upcoming approved appointments.
        </p>
      ) : (
        appointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-white p-5 rounded-xl shadow-md border border-gray-200 mb-4"
          >
            <div className="text-[#0F8A69] font-bold text-sm uppercase tracking-wide mb-2">
              {appt.serviceType}
            </div>

            <div className="flex items-center text-gray-700 mb-2">
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
              <span className="font-medium">{appt.purpose}</span>
            </div>

            <div className="flex items-center text-gray-600 mb-2">
              <CalendarDaysIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
              {new Date(appt.preferredDateTime).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>

            {appt.location && (
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
                {appt.location || "To be assigned"}
              </div>
            )}
          </div>
        ))
      )}

      {/* ------------------------------ */}
      {/* UPCOMING HEALTH EVENTS SECTION */}
      {/* ------------------------------ */}
      <h2 className="mt-6 mb-3 text-lg font-semibold text-[#0F8A69]">
        Upcoming Health Events
      </h2>

      {/* Event Cards */}
      <div className="grid gap-4">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No events available.</p>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              <div className="text-[#0F8A69] font-bold text-sm uppercase tracking-wide mb-2">
                {ev.eventType}
              </div>

              <h3 className="text-lg font-semibold text-gray-800">
                {ev.title}
              </h3>

              <div className="flex items-center mt-2 text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
                <span className="font-medium">{ev.location}</span>
              </div>

              <div className="flex items-center text-gray-600 mt-1">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
                {new Date(ev.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>

              <div className="flex items-center text-gray-600 mt-1">
                <ClockIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
                {formatTime(ev.startTime)} — {formatTime(ev.endTime)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
