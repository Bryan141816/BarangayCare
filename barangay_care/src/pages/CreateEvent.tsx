import { useState, useEffect } from "react";
import { createEvent } from "../service/eventservice";

export default function CreateEventPage() {
  const [eventType, setEventType] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [endTimeOptions, setEndTimeOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  // Generate time options 7AM – 6PM as strings
  const timeOptions = Array.from({ length: 12 }, (_, i) => String(i + 7));

  const formatTime = (hourString: string) => {
    const hour = Number(hourString);
    const suffix = hour >= 12 ? "PM" : "AM";
    const formatted = hour % 12 === 0 ? 12 : hour % 12;
    return `${formatted}:00 ${suffix}`;
  };

  useEffect(() => {
    if (!startTime) {
      setEndTimeOptions([]);
      setEndTime("");
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

  const handleSubmit = async () => {
    // This runs after confirming in the modal
    if (!eventType || !title || !location || !date || !startTime || !endTime) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const eventData = {
      eventType,
      title,
      location,
      date,
      startTime,
      endTime,
    };

    const result = await createEvent(eventData);

    setLoading(false);
    setShowConfirm(false);

    if (result.success) {
      setSuccessMessage("Event created successfully!");

      // Reset form fields
      setEventType("");
      setTitle("");
      setLocation("");
      setDate("");
      setStartTime("");
      setEndTime("");
    } else {
      setErrorMessage(
        typeof result.error === "string"
          ? result.error
          : "Something went wrong.",
      );
    }
  };

  return (
    <div className="p-8 max-w-full mx-auto">
      <h1 className="text-3xl font-bold text-[#0F8A69] mb-6">
        Create Barangay Health Event
      </h1>

      {/* Success Message */}
      {successMessage && (
        <p className="text-green-600 font-medium mb-4">{successMessage}</p>
      )}

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-600 font-medium mb-4">{errorMessage}</p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirm(true);
        }}
        className="bg-white shadow-md rounded-lg p-6 space-y-4"
      >
        {/* Event Type */}
        <div>
          <label className="block mb-1 font-medium">Event Type</label>
          <select
            className="w-full p-2 border rounded-lg"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            required
          >
            <option value="">Select event type</option>
            <option value="Vaccination Drive">Vaccination Drive</option>
            <option value="Medical Mission">Medical Mission</option>
            <option value="Dental Checkup">Dental Checkup</option>
            <option value="Blood Donation">Blood Donation</option>
            <option value="Health Seminar">Health Seminar</option>
            <option value="Nutrition Program">Nutrition Program</option>
            <option value="Prenatal Checkup">Prenatal Checkup</option>
            <option value="Deworming">Deworming Program</option>
            <option value="TB Screening">TB Screening</option>
            <option value="Senior Wellness">
              Senior Citizen Wellness Program
            </option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block mb-1 font-medium">Event Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            placeholder="e.g. Bakuna Kontra Tigdas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            placeholder="Barangay Hall, Covered Court, etc."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
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
            required
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block mb-1 font-medium">Start Time</label>
          <select
            className="w-full p-2 border rounded-lg"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
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
            required
            disabled={!startTime}
          >
            <option value="">Select end time</option>
            {endTimeOptions.map((t) => (
              <option key={t} value={t}>
                {formatTime(t)}
              </option>
            ))}
          </select>

          {!startTime && (
            <p className="text-xs text-gray-500 mt-1">
              Select a start time first.
            </p>
          )}

          {startTime && endTimeOptions.length === 0 && (
            <p className="text-xs text-red-500 mt-1">
              No valid end times — event must be at least 2 hours.
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#0F8A69] hover:bg-[#0D7A5B]"
          }`}
        >
          {loading ? "Saving..." : "Create Event"}
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to create this event?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-[#0F8A69] text-white hover:bg-[#0c7356] transition"
                disabled={loading}
              >
                {loading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
