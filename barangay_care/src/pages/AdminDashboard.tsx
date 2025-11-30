import { useEffect, useState, useRef, useContext } from "react";
import { AuthContext } from "../provider/AuthProvider";
import HeatMap from "@uiw/react-heat-map";
import {
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { collection, getDocs, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface Teleconsultation {
  id?: string;
  createdAt: Timestamp;
  status: string;
}

interface HeatMapData {
  date: string;
  count: number;
}

interface EventData {
  id?: string;
  createdAt: Timestamp;
}

interface EventDataFull {
  id: string;
  eventType: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface AppointmentData {
  id?: string;
  status: string;
}

// Fetch all closed teleconsultations
async function getAllClosedTeleconsultations(): Promise<Teleconsultation[]> {
  const snapshot = await getDocs(collection(db, "teleconsultations"));
  return snapshot.docs
    .map((doc) => doc.data() as Teleconsultation)
    .filter((tc) => tc.status === "closed");
}

// Fetch all events
async function getAllEvents(): Promise<EventData[]> {
  const snapshot = await getDocs(collection(db, "events"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as EventData),
  }));
}

// Fetch all appointments
async function getAllAppointments(): Promise<AppointmentData[]> {
  const snapshot = await getDocs(collection(db, "appointments"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as AppointmentData),
  }));
}

// Convert teleconsultations to heatmap data
function convertToHeatMapData(telecons: Teleconsultation[]): HeatMapData[] {
  const counts: Record<string, number> = {};
  telecons.forEach((tc) => {
    const dateStr = tc.createdAt
      .toDate()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "/");
    counts[dateStr] = (counts[dateStr] || 0) + 1;
  });

  const year = new Date().getFullYear();
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);
  const allDates: HeatMapData[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "/");
    allDates.push({ date: dateStr, count: counts[dateStr] || 0 });
  }
  return allDates;
}

// Convert events to daily counts for line chart
function convertEventsToDailyCounts(events: EventData[]) {
  const counts: Record<string, number> = {};
  events.forEach((ev) => {
    const dateStr = ev.createdAt
      .toDate()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "/");
    counts[dateStr] = (counts[dateStr] || 0) + 1;
  });

  const sortedDates = Object.keys(counts).sort();
  const data = sortedDates.map((date) => counts[date]);
  return { labels: sortedDates, data };
}

// Convert appointments to status counts for pie chart
function convertAppointmentsToStatusCounts(appointments: AppointmentData[]) {
  const statusMap: Record<string, number> = {
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Completed: 0,
    Failed: 0,
  };

  appointments.forEach((ap) => {
    switch (ap.status.toLowerCase()) {
      case "waiting for approval":
        statusMap.Pending += 1;
        break;
      case "approved":
        statusMap.Approved += 1;
        break;
      case "rejected":
        statusMap.Rejected += 1;
        break;
      case "completed":
        statusMap.Completed += 1;
        break;
      case "failed":
        statusMap.Failed += 1;
        break;
      default:
        break;
    }
  });

  return statusMap;
}

export default function AdminDashboard() {
  const { profile } = useContext(AuthContext);

  const [heatmapData, setHeatmapData] = useState<HeatMapData[]>([]);
  const [eventData, setEventData] = useState<{
    labels: string[];
    data: number[];
  }>({ labels: [], data: [] });
  const [appointmentStatusCounts, setAppointmentStatusCounts] = useState<
    Record<string, number>
  >({
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Completed: 0,
    Failed: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [heatmapWidth, setHeatmapWidth] = useState(800);

  const [events, setEvents] = useState<EventDataFull[]>([]);

  const formatTime = (hourString: string) => {
    const hour = Number(hourString);
    const suffix = hour >= 12 ? "PM" : "AM";
    const formatted = hour % 12 === 0 ? 12 : hour % 12;
    return `${formatted}:00 ${suffix}`;
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as EventDataFull[];

      // Filter: only show events that are TODAY or in the FUTURE
      const today = new Date();
      today.setHours(0, 0, 0, 0); // normalize

      const filtered = list.filter((ev) => {
        const evDate = new Date(ev.date);
        evDate.setHours(0, 0, 0, 0);

        return evDate >= today; // keep only upcoming events
      });

      setEvents(filtered);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const telecons = await getAllClosedTeleconsultations();
      setHeatmapData(convertToHeatMapData(telecons));

      const events = await getAllEvents();
      setEventData(convertEventsToDailyCounts(events));

      const appointments = await getAllAppointments();
      setAppointmentStatusCounts(
        convertAppointmentsToStatusCounts(appointments),
      );
    }
    fetchData();
  }, []);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current)
        setHeatmapWidth(containerRef.current.clientWidth);
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const maxCount = Math.max(...heatmapData.map((d) => d.count));

  const lineChartData = {
    labels: eventData.labels,
    datasets: [
      {
        label: "Events per Day",
        data: eventData.data,
        borderColor: "#0F8A69",
        backgroundColor: "rgba(15, 138, 105, 0.3)",
        tension: 0.3,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Daily Events Created" },
    },
  };

  const pieChartData = {
    labels: Object.keys(appointmentStatusCounts),
    datasets: [
      {
        data: Object.values(appointmentStatusCounts),
        backgroundColor: [
          "#FBBF24", // Pending
          "#0F8A69", // Approved
          "#EF4444", // Rejected
          "#6366F1", // Completed
          "#9CA3AF", // Failed
        ],
        borderWidth: 1,
        spacing: 4, // space between slices
        cutout: "70%",
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" as const },
      title: { display: true, text: "Appointments by Status" },
    },
  };

  return (
    <div className="flex flex-col w-full bg-[#f1f5f9] p-4 min-h-screen">
      {/* Header */}
      <div className="bg-[#0F8A69] text-white rounded-xl p-6 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          HI, {profile?.firstName} {profile?.lastName}
        </h1>
        <span className="opacity-90">
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
      {/* Events & Appointments Section */}

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-[#0F8A69]">
          Data Overview
        </h2>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col lg:flex-row gap-6">
          {/* Left: Line Chart */}
          <div className="flex-1 ">
            <Line
              data={lineChartData}
              options={lineChartOptions}
              height={100}
            />
          </div>

          <div className="flex-1 h-64 flex justify-center items-center">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* Teleconsultation Calendar Section */}
      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-[#0F8A69]">
          Teleconsultation Calendar
        </h2>
        <div
          ref={containerRef}
          className="bg-white rounded-xl shadow-md border border-gray-200 p-6 overflow-x-auto"
        >
          <div className="flex items-center space-x-2 mb-4">
            <CalendarDaysIcon className="w-6 h-6 text-[#0F8A69]" />
            <h3 className="text-gray-800 text-lg font-semibold">
              Consultation Activity Overview
            </h3>
          </div>

          <div className="flex justify-center overflow-x-auto p-4">
            <HeatMap
              width={heatmapWidth}
              value={heatmapData}
              startDate={new Date(`${new Date().getFullYear()}/01/01`)}
              legendCellSize={0}
              rectSize={20}
              rectRender={(props, data) => {
                let fillColor = "#e1e4e8";
                if (data.count > 0 && maxCount > 0) {
                  const intensity = Math.min(
                    0.1 + (data.count / maxCount) * 0.9,
                    1,
                  );
                  fillColor = `rgba(0, 128, 0, ${intensity})`;
                }
                return (
                  <rect {...props} fill={fillColor}>
                    <title>
                      {data.count} Teleconsultation{data.count !== 1 ? "s" : ""}{" "}
                      completed
                    </title>
                  </rect>
                );
              }}
            />
          </div>
        </div>
      </div>
      <h2 className="mt-6 mb-3 text-lg font-semibold text-[#0F8A69]">
        Upcoming Health Events
      </h2>

      {/* Event Cards */}
      <div className="grid gap-4">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No events available.</p>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition"
            >
              {/* Event Type */}
              <div className="text-[#0F8A69] font-bold text-sm uppercase tracking-wide mb-2">
                {ev.eventType}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-800">
                {ev.title}
              </h3>

              {/* Location */}
              <div className="flex items-center mt-2 text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
                <span className="font-medium">{ev.location}</span>
              </div>

              {/* Date */}
              <div className="flex items-center text-gray-600 mt-1">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
                {new Date(ev.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>

              {/* Time */}
              <div className="flex items-center text-gray-600 mt-1">
                <ClockIcon className="w-5 h-5 mr-2 text-[#0F8A69]" />
                {formatTime(ev.startTime)} — {formatTime(ev.endTime)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
