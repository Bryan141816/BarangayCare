import {
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  SparklesIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";

export default function Teleconsultation() {
  const consultationTypes = [
    {
      name: "General",
      icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />,
    },
    {
      name: "Medicine Question",
      icon: <BeakerIcon className="w-8 h-8" />,
    },
    {
      name: "Symptom Advice",
      icon: <SparklesIcon className="w-8 h-8" />,
    },
  ];

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-[#0F8A69] mb-6">
        Teleconsultation
      </h1>

      {/* Consultation Type */}

      {/* Consultation Type */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {consultationTypes.map((item, index) => (
          <div
            key={index}
            className={`
        flex flex-col items-center justify-center border rounded-xl px-6 py-4 
        cursor-pointer shadow-sm
        ${
          item.name === "Medicine Question"
            ? "bg-[#0F8A69] text-white"
            : "bg-white text-[#0F8A69]"
        }
      `}
          >
            {item.icon}
            <span className="mt-2 font-medium">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-xl shadow-md p-6  space-y-6">
        {/* User message (right) */}
        <div className="flex justify-end">
          <div className="bg-[#0F8A69] text-white p-4 rounded-xl max-w-xs">
            Hello po, I was prescribed Amoxicillin 500mg. How many days should I
            take it?
          </div>
        </div>

        <p className="text-right text-xs text-gray-500">2:10 PM</p>

        {/* Bot reply (left) */}
        <div className="flex">
          <div className="bg-gray-200 text-gray-700 p-4 rounded-xl max-w-xs">
            Hi! For most infections, Amoxicillin 500mg is taken every 8 hours (3
            times a day) for 7 days, unless your doctor advised otherwise. Make
            sure to finish the full course even if you feel better.
          </div>
        </div>

        <p className="text-left text-xs text-gray-500">2:11 PM</p>

        {/* Input Area */}
        <div className="flex items-center space-x-3 pt-4">
          <input
            type="text"
            placeholder="Write a message"
            className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69]"
          />
          <button className="bg-[#0F8A69] p-3 rounded-lg text-white hover:bg-[#0c7356]">
            <PaperAirplaneIcon className="w-6 h-6 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}
