import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase";
import { updateAppointment } from "../service/appointmentservices";
import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

interface Appointment {
  id: string;
  serviceType: string;
  preferredDateTime: string;
  purpose: string;
  requestedBy: string;
  status:
    | "waiting for approval"
    | "approved"
    | "rejected"
    | "completed"
    | "failed";
  location?: string;
  rejectionReason?: string;
  createdAt?: any;
}

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<
    "" | "approve" | "reject" | "fail" | "complete"
  >("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const statusPriority: Record<Appointment["status"], number> = {
    "waiting for approval": 1,
    approved: 2,
    rejected: 3,
    completed: 4,
    failed: 5,
  };

  useEffect(() => {
    const q = query(
      collection(db, "appointments"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const list: Appointment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Appointment, "id">),
      }));
      list.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);
      setAppointments(list);
    });
    return () => unsub();
  }, []);

  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  const openModal = (appt: Appointment) => {
    setSelected(appt);
    setLocation(appt.location || "");
    setReason(appt.rejectionReason || "");
    setAction("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelected(null);
    setLocation("");
    setReason("");
    setAction("");
    setModalOpen(false);
    setShowConfirm(false);
    setIsLoading(false);
  };

  const handleActionConfirm = async () => {
    if (!selected || !action) return;

    setIsLoading(true);

    try {
      if (action === "approve") {
        if (!location.trim()) {
          alert("Location is required for approval.");
          setIsLoading(false);
          return;
        }
        await updateAppointment(selected.id, { status: "approved", location });
      } else if (action === "reject") {
        if (!reason.trim()) {
          alert("Reason is required for rejection.");
          setIsLoading(false);
          return;
        }
        await updateAppointment(selected.id, {
          status: "rejected",
          rejectionReason: reason,
        });
      } else if (action === "complete") {
        await updateAppointment(selected.id, { status: "completed" });
      } else if (action === "fail") {
        if (!reason.trim()) {
          alert("Reason is required for failing.");
          setIsLoading(false);
          return;
        }
        await updateAppointment(selected.id, {
          status: "failed",
          rejectionReason: reason,
        });
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating appointment.");
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
      closeModal();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#0F8A69] mb-6">
        Manage Appointments
      </h1>

      {/* Filter */}
      <select
        className="border p-2 rounded-lg mb-4"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="all">All</option>
        <option value="waiting for approval">Waiting for Approval</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="completed">Completed</option>
      </select>

      {/* Appointment Cards */}
      <div className="grid gap-4">
        {filteredAppointments.map((a) => (
          <div
            key={a.id}
            className="bg-white p-5 rounded-xl shadow border border-gray-200"
          >
            <h3 className="font-bold text-gray-800 text-lg mb-2">
              {a.serviceType}
            </h3>

            <div className="text-gray-600 space-y-1">
              <div className="flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
                {new Date(a.preferredDateTime).toLocaleString()}
              </div>

              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
                {a.location || "No location yet"}
              </div>

              <p>
                <span className="font-semibold">Purpose:</span> {a.purpose}
              </p>

              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`font-bold ${
                    a.status === "waiting for approval"
                      ? "text-yellow-600"
                      : a.status === "approved"
                        ? "text-blue-600"
                        : a.status === "rejected"
                          ? "text-red-600"
                          : "text-green-600"
                  }`}
                >
                  {a.status}
                </span>
              </p>
            </div>

            <button
              className={`mt-4 px-4 py-2 rounded-lg text-white ${
                a.status === "waiting for approval"
                  ? "bg-[#0F8A69] hover:bg-[#0c7356]"
                  : a.status === "approved"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-default"
              }`}
              onClick={() => {
                if (
                  a.status === "waiting for approval" ||
                  a.status === "approved"
                ) {
                  openModal(a);
                } else {
                  openModal(a);
                }
              }}
            >
              {a.status === "waiting for approval"
                ? "Respond"
                : a.status === "approved"
                  ? "Update"
                  : "View"}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <h2 className="text-xl font-semibold mb-4">
              {selected.status === "waiting for approval" ||
              selected.status === "approved"
                ? "Respond to Appointment"
                : "View Appointment"}
            </h2>

            {/* Form for actions */}
            {(selected.status === "waiting for approval" ||
              selected.status === "approved") && (
              <>
                <label className="block mb-1 font-medium">Action</label>
                <select
                  className="border p-2 rounded-lg w-full mb-4"
                  value={action}
                  onChange={(e) => {
                    const val = e.target.value as
                      | "approve"
                      | "reject"
                      | "complete"
                      | "fail"
                      | "";
                    setAction(val);
                    if (val === "approve") setReason("");
                    if (val === "reject" || val === "fail") setLocation("");
                  }}
                >
                  <option value="">Choose Action</option>
                  {selected.status === "waiting for approval" && (
                    <>
                      <option value="approve">Approve</option>
                      <option value="reject">Reject</option>
                    </>
                  )}
                  {selected.status === "approved" && (
                    <>
                      <option value="complete">Mark as Completed</option>
                      <option value="fail">Mark as Failed</option>
                    </>
                  )}
                </select>

                {/* Conditional Inputs */}
                {action === "approve" && (
                  <>
                    <label className="block mb-1 font-medium">Location</label>
                    <input
                      className="border p-2 rounded-lg w-full mb-4"
                      placeholder="Enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </>
                )}

                {(action === "reject" || action === "fail") && (
                  <>
                    <label className="block mb-1 font-medium">Reason</label>
                    <textarea
                      className="border p-2 rounded-lg w-full mb-4"
                      rows={3}
                      placeholder="Provide a reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </>
                )}

                {action && (
                  <button
                    className={`w-full py-2 rounded-lg text-white ${
                      action === "approve" || action === "complete"
                        ? "bg-[#0F8A69] hover:bg-[#0c7356]"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    onClick={() => setShowConfirm(true)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Proceed"}
                  </button>
                )}
              </>
            )}

            {/* View-only message */}
            {selected.status === "rejected" ||
            selected.status === "completed" ? (
              <p>No further actions available.</p>
            ) : null}

            {/* Close Button */}
            <button
              className="mt-4 w-full bg-gray-300 py-2 rounded-lg"
              onClick={closeModal}
              disabled={isLoading}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to{" "}
              <span className="font-bold">{action}</span> this appointment?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleActionConfirm}
                className="px-4 py-2 rounded-lg bg-[#0F8A69] text-white hover:bg-[#0c7356] transition"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
