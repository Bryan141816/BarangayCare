import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

interface EventData {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  eventType: string;
  createdAt: any;
}

export default function ManageEvents() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);

  // Form values inside modal
  const [eventType, setEventType] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endTimeOptions, setEndTimeOptions] = useState<string[]>([]);

  const timeOptions = Array.from({ length: 12 }, (_, i) => String(i + 7));

  const formatTime = (hourString: string) => {
    const hour = Number(hourString);
    const suffix = hour >= 12 ? "PM" : "AM";
    const formatted = hour % 12 === 0 ? 12 : hour % 12;
    return `${formatted}:00 ${suffix}`;
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const load = async () => {
      const ref = collection(db, "events");
      const snap = await getDocs(ref);

      const upcoming = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as EventData)
        .filter((e) => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));

      setEvents(upcoming);
      setLoading(false);
    };

    load();
  }, []);

  // Update end time options on start time change
  useEffect(() => {
    if (!startTime) {
      setEndTimeOptions([]);
      return;
    }

    const start = Number(startTime);
    const minimumEnd = start + 2;
    const options = timeOptions.filter((t) => Number(t) >= minimumEnd);

    setEndTimeOptions(options);

    if (endTime && Number(endTime) < minimumEnd) {
      setEndTime("");
    }
  }, [startTime]);

  const openModal = (event: EventData) => {
    setEditingEvent(event);
    setEventType(event.eventType);
    setTitle(event.title);
    setLocation(event.location);
    setDate(event.date);
    setStartTime(event.startTime);
    setEndTime(event.endTime);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;

    await updateDoc(doc(db, "events", editingEvent.id), {
      eventType,
      title,
      location,
      date,
      startTime,
      endTime,
    });

    closeModal();

    // Reload events
    const ref = collection(db, "events");
    const snap = await getDocs(ref);
    const today = new Date().toISOString().split("T")[0];

    const updated = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as EventData)
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    setEvents(updated);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "events", id));
    setEvents(events.filter((e) => e.id !== id));
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-8 max-w-full mx-auto">
      <h1 className="text-3xl font-bold text-[#0F8A69] mb-6">Manage Events</h1>

      <div className="space-y-4">
        {events.map((e) => (
          <div
            key={e.id}
            className="bg-white p-5 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">{e.title}</h2>

              <p className="text-gray-600 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {e.date} — <ClockIcon className="w-5 h-5" />
                {formatTime(e.startTime)} to {formatTime(e.endTime)}
              </p>

              <p className="text-gray-600 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                {e.location}
              </p>

              <p className="text-gray-600 flex items-center gap-2">
                <FolderIcon className="w-5 h-5" />
                {e.eventType}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => openModal(e)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                <PencilSquareIcon className="w-6 h-6" />
              </button>

              <button
                onClick={() => handleDelete(e.id)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                <TrashIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- MODAL ---------------- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-[#0F8A69]">
                Update Event
              </h2>
              <button onClick={closeModal}>
                <XMarkIcon className="w-7 h-7 text-gray-600 hover:text-black" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Event Type */}
              <div>
                <label className="block mb-1 font-medium">Event Type</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option value="">Select event type</option>
                  <option value="Vaccination Drive">Vaccination Drive</option>
                  <option value="Medical Mission">Medical Mission</option>
                  <option value="Dental Checkup">Dental Checkup</option>
                  <option value="Blood Donation">Blood Donation</option>
                  <option value="Health Seminar">Health Seminar</option>
                  <option value="Nutrition Program">Nutrition Program</option>
                  <option value="Prenatal Checkup">Prenatal Checkup</option>
                  <option value="Deworming Program">Deworming Program</option>
                  <option value="TB Screening">TB Screening</option>
                  <option value="Senior Citizen Wellness Program">
                    Senior Citizen Wellness Program
                  </option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block mb-1 font-medium">Event Title</label>
                <input
                  className="w-full p-2 border rounded-lg"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block mb-1 font-medium">Location</label>
                <input
                  className="w-full p-2 border rounded-lg"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Date */}
              <div>
                <label className="block mb-1 font-medium">Event Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block mb-1 font-medium">Start Time</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  <option value="">Select start time</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
              </div>

              {/* End Time */}
              <div>
                <label className="block mb-1 font-medium">End Time</label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={!startTime}
                >
                  <option value="">Select end time</option>
                  {endTimeOptions.map((t) => (
                    <option key={t} value={t}>
                      {formatTime(t)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <button
                onClick={handleUpdate}
                className="w-full py-2 bg-[#0F8A69] text-white rounded-lg hover:bg-[#0d7457]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
