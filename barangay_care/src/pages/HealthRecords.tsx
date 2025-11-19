import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../provider/AuthProvider";
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
  rejectionReason?: string;
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

export default function HealthRecords() {
  const { currentUser } = useContext(AuthContext);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // 🔥 Fetch ALL appointments for the user
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "appointments"),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Appointment),
        }))
        .filter((a) => a.requestedBy === currentUser.uid); // Only user’s records

      setAppointments(list);
    });

    return () => unsub();
  }, [currentUser]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#0F8A69] mb-6">
        Appointment Records
      </h1>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointment records found.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white shadow-md rounded-xl p-5 border border-gray-200"
            >
              {/* Title */}
              <h2 className="text-lg font-semibold text-[#0F8A69] mb-2">
                {SERVICE_TYPE_LABELS[appt.serviceType as ServiceType] ||
                  appt.serviceType}
              </h2>

              {/* Basic Details */}
              <div className="text-gray-700 space-y-1">
                <p>
                  <span className="font-semibold">Preferred Date:</span>{" "}
                  {new Date(appt.preferredDateTime).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {appt.location || "N/A"}
                </p>

                <p>
                  <span className="font-semibold">Purpose:</span> {appt.purpose}
                </p>

                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`font-bold ${
                      appt.status === "rejected"
                        ? "text-red-600"
                        : appt.status === "completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {appt.status}
                  </span>
                </p>
              </div>

              {/* 🔥 Rejection Box */}
              {appt.status === "rejected" && appt.rejectionReason && (
                <div className="mt-3 bg-red-50 border border-red-300 text-red-700 p-3 rounded-xl">
                  <p className="font-semibold">Reason for Rejection:</p>
                  <p>{appt.rejectionReason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
