import React, { useState, useEffect } from "react";
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

  // Generate time options 7AM – 6PM as STRINGS
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!eventType || !title || !location || !date || !startTime || !endTime) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    const eventData = {
      eventType,
      title,
      location,
      date,
      startTime,
      endTime,
    };

    setLoading(true);

    const result = await createEvent(eventData);

    setLoading(false);

    if (result.success) {
      setSuccessMessage("Event created successfully!");
      setErrorMessage("");

      // Optional reset for form fields
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
        onSubmit={handleSubmit}
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
    </div>
  );
}
