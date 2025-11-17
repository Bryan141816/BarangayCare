import React from "react";

export default function BookAppointment() {
  return (
    <div>
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-[#0F8A69] mb-6">
        Book Appointment
      </h1>

      {/* Form Container */}
      <div className="bg-white shadow-md rounded-2xl p-8 ">
        {/* Form Fields */}
        <form className="space-y-5">
          {/* Service Type */}

          <select className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69] bg-white">
            <option value="">Select Service Type</option>
            <option value="general-checkup">General Check-up</option>
            <option value="vaccination">Vaccination</option>
            <option value="prenatal">Prenatal Check-up</option>
            <option value="child-health">Child Health Consultation</option>
            <option value="nutrition">Nutrition Assessment</option>
            <option value="bp-check">Blood Pressure Check</option>
            <option value="family-planning">
              Family Planning Consultation
            </option>
            <option value="dental">Dental Check-up</option>
            <option value="senior-wellness">Senior Citizen Wellness</option>
            <option value="wound-care">Wound Care / Dressing</option>
          </select>

          {/* Preferred Date Time */}
          <input
            type="datetime-local"
            placeholder="Select Preferred Date Time"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69]"
          />

          {/* Health Center */}
          <input
            type="text"
            placeholder="Select Health Center"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69]"
          />

          {/* Purpose */}

          <textarea
            rows={8}
            placeholder="Purpose / Reason"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69] resize-none"
          ></textarea>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#0F8A69] hover:bg-[#0c7356] text-white py-3 rounded-lg font-medium transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
