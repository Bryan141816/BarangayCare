import React from "react";

export default function HealthRecords() {
  // Fake sample health record data
  const records = [
    {
      title: "Check Up",
      location: "Check Up Location/Hospital",
      date: "Nov 1 2025",
    },
    {
      title: "Check Up",
      location: "Check Up Location/Hospital",
      date: "Nov 1 2025",
    },
    {
      title: "Check Up",
      location: "Check Up Location/Hospital",
      date: "Nov 1 2025",
    },
  ];

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-[#0F8A69] mb-6">
        Health Records
      </h1>

      {/* Record List */}
      <div className="space-y-4 ">
        {records.map((record, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-xl p-5 flex justify-between items-start"
          >
            <div>
              <h2 className="text-[#0F8A69] font-semibold text-lg">
                {record.title}
              </h2>
              <p className="text-gray-600 text-sm">{record.location}</p>
            </div>

            <span className="text-gray-600 text-sm">{record.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
