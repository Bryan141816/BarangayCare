import React from "react";

export default function Home() {
  const user = {
    name: "Example User",
    date: "Nov 6 2025",
  };

  const vaccinationAlert = {
    title: "Vaccination Event",
    location: "Location",
    schedule: "Nov 7 2025 8-12 AM",
  };

  return (
    <div className="flex flex-col w-full bg-[#f1f5f9]">
      {/* Header Card */}
      <div className="bg-[#0F8A69] text-white rounded-xl border border-[#0A7C5D] shadow-md p-6 flex items-center justify-between ">
        <h1 className="text-xl font-semibold">HI, {user.name}</h1>
        <span className="text-md">{user.date}</span>
      </div>

      {/* Section Title */}
      <h2 className="mt-6 mb-3 text-lg font-semibold text-[#0F8A69]">
        Vaccination Alert
      </h2>

      {/* Alert Box */}
      <div className="bg-white p-6 rounded-xl shadow-md  space-y-4">
        {/* Event Row */}
        <div className="bg-[#79B8A9] text-white rounded-lg p-4 flex justify-between items-center">
          <span className="font-medium">{vaccinationAlert.title}</span>
          <span className="opacity-90">{vaccinationAlert.location}</span>
          <span className="opacity-90">{vaccinationAlert.schedule}</span>
        </div>

        {/* Placeholder second row */}
        <div className="bg-[#79B8A9] rounded-lg p-4 h-10"></div>
      </div>
    </div>
  );
}
