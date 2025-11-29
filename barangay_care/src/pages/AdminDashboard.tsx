import { useEffect, useState, useRef, useContext } from "react";
import { AuthContext } from "../provider/AuthProvider";
import HeatMap from "@uiw/react-heat-map";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase"; // adjust import

interface Teleconsultation {
  id?: string;
  createdAt: Timestamp;
  status: string;
  // add other fields if needed
}

interface HeatMapData {
  date: string;
  count: number;
}

// Fetch all closed teleconsultations for admin
async function getAllClosedTeleconsultations(): Promise<Teleconsultation[]> {
  const q = query(
    collection(db, "teleconsultations"),
    where("status", "==", "closed"),
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs.map((doc) => {
      const { id: _ignored, ...rest } = doc.data() as Teleconsultation;
      return { id: doc.id, ...rest };
    });
  }
  return [];
}

// Convert teleconsultations to heatmap data for the full year
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

// Admin Dashboard Component
export default function AdminDashboard() {
  const { profile } = useContext(AuthContext);
  const [heatmapData, setHeatmapData] = useState<HeatMapData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [heatmapWidth, setHeatmapWidth] = useState(800);

  useEffect(() => {
    async function fetchData() {
      const closedTelecons = await getAllClosedTeleconsultations();
      const data = convertToHeatMapData(closedTelecons);
      setHeatmapData(data);
    }
    fetchData();
  }, []);

  // Update heatmap width on resize
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setHeatmapWidth(containerRef.current.clientWidth);
      }
      console.log(containerRef.current?.clientWidth);
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const maxCount = Math.max(...heatmapData.map((d) => d.count));

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

      {/* Section Title */}
      <h2 className="mt-6 mb-3 text-lg font-semibold text-[#0F8A69]">
        Teleconsultation Calendar
      </h2>

      {/* Calendar Card */}
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

        {/* Heat Map */}
        <div className="flex justify-center overflow-x-auto p-4">
          <HeatMap
            width={heatmapWidth}
            value={heatmapData}
            startDate={new Date(`${new Date().getFullYear()}/01/01`)}
            legendCellSize={0}
            rectRender={(props, data) => {
              let fillColor = "#e1e4e8"; // gray for 0 counts
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
                    {data.count} Teleconsultation
                    {data.count !== 1 ? "s" : ""} completed
                  </title>
                </rect>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
