import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../provider/AuthProvider";
import { createAppointment } from "../service/appointmentservices";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";

interface Appointment {
  id: string;
  serviceType: string;
  preferredDateTime: string;
  purpose: string;
  requestedBy: string;
  status: string;
  location?: string;
  createdAt?: any;
}

const SERVICE_TYPES = {
  GENERAL_CHECKUP: "general-checkup",
  VACCINATION: "vaccination",
  PRENATAL: "prenatal",
  CHILD_HEALTH: "child-health",
  NUTRITION: "nutrition",
  BP_CHECK: "bp-check",
  FAMILY_PLANNING: "family-planning",
  DENTAL: "dental",
  SENIOR_WELLNESS: "senior-wellness",
  WOUND_CARE: "wound-care",
} as const;

type ServiceType = (typeof SERVICE_TYPES)[keyof typeof SERVICE_TYPES];

// Display names for UI
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [SERVICE_TYPES.GENERAL_CHECKUP]: "General Check-up",
  [SERVICE_TYPES.VACCINATION]: "Vaccination",
  [SERVICE_TYPES.PRENATAL]: "Prenatal Check-up",
  [SERVICE_TYPES.CHILD_HEALTH]: "Child Health Consultation",
  [SERVICE_TYPES.NUTRITION]: "Nutrition Assessment",
  [SERVICE_TYPES.BP_CHECK]: "Blood Pressure Check",
  [SERVICE_TYPES.FAMILY_PLANNING]: "Family Planning",
  [SERVICE_TYPES.DENTAL]: "Dental Check-up",
  [SERVICE_TYPES.SENIOR_WELLNESS]: "Senior Citizen Wellness",
  [SERVICE_TYPES.WOUND_CARE]: "Wound Care / Dressing",
};
export default function BookAppointment() {
  const { currentUser } = useContext(AuthContext);

  const [serviceType, setServiceType] = useState("");
  const [preferredDateTime, setPreferredDateTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [latestAppointment, setLatestAppointment] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!serviceType || !preferredDateTime || !purpose.trim()) {
      setErrorMessage("All fields are required.");
      return;
    }

    const appointmentData = {
      serviceType,
      preferredDateTime,
      purpose,
      requestedBy: currentUser?.uid || "unknown-user",
    };

    const result = await createAppointment(appointmentData);

    if (result.success) {
      setSuccessMessage("Appointment request submitted successfully!");
      setServiceType("");
      setPreferredDateTime("");
      setPurpose("");
    } else {
      setErrorMessage(result.error);
    }
  };

  // 🔥 Fetch latest non-closed appointment
  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => {
        const data = doc.data() as Appointment;

        // remove id if exists in doc data
        const { id: _, ...rest } = data;

        return {
          id: doc.id,
          ...rest,
        };
      }) as Appointment[];

      const activeAppointments = list.filter(
        (a) => a.status !== "closed" && a.requestedBy === currentUser?.uid,
      );

      setLatestAppointment(activeAppointments[0] || null);
    });

    return () => unsub();
  }, [currentUser]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#0F8A69] mb-6">
        Book Appointment
      </h1>

      {/* If APPOINTMENT EXISTS -> SHOW CARD */}
      {latestAppointment ? (
        <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-[#0F8A69] mb-3">
            Your Latest Appointment
          </h2>

          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-semibold">Service:</span>{" "}
              {
                SERVICE_TYPE_LABELS[
                  latestAppointment.serviceType as ServiceType
                ]
              }
            </p>
            <p>
              <span className="font-semibold">Preferred Date & Time:</span>{" "}
              {new Date(latestAppointment.preferredDateTime).toLocaleString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                },
              )}
            </p>
            <p>
              <span className="font-semibold">Purpose:</span>{" "}
              {latestAppointment.purpose}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={`font-bold ${
                  latestAppointment.status === "waiting for approval"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {latestAppointment.status}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ERROR */}
          {errorMessage && (
            <p className="text-red-600 font-medium mb-3">{errorMessage}</p>
          )}

          {/* SUCCESS */}
          {successMessage && (
            <p className="text-green-600 font-medium mb-3">{successMessage}</p>
          )}

          {/* FORM */}
          <div className="bg-white shadow-md rounded-2xl p-8">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <select
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69] bg-white"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
              >
                <option value="">Select Service Type</option>
                <option value="general-checkup">General Check-up</option>
                <option value="vaccination">Vaccination</option>
                <option value="prenatal">Prenatal Check-up</option>
                <option value="child-health">Child Health Consultation</option>
                <option value="nutrition">Nutrition Assessment</option>
                <option value="bp-check">Blood Pressure Check</option>
                <option value="family-planning">Family Planning</option>
                <option value="dental">Dental Check-up</option>
                <option value="senior-wellness">Senior Citizen Wellness</option>
                <option value="wound-care">Wound Care / Dressing</option>
              </select>

              <input
                type="datetime-local"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69]"
                value={preferredDateTime}
                onChange={(e) => setPreferredDateTime(e.target.value)}
                required
              />

              <textarea
                rows={5}
                placeholder="Purpose / Reason"
                className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#0F8A69] resize-none"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              ></textarea>

              <button
                type="submit"
                className="w-full bg-[#0F8A69] hover:bg-[#0c7356] text-white py-3 rounded-lg font-medium transition"
              >
                Submit
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
