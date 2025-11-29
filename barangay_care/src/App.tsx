import { lazy, Suspense, useContext, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./provider/AuthProvider";
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const MainLayout = lazy(() => import("./layout/Mainlayout"));
const Home = lazy(() => import("./pages/Home"));
const BookAppointments = lazy(() => import("./pages/BookAppointments"));
const HealthRecords = lazy(() => import("./pages/HealthRecords"));
const Teleconsultation = lazy(() => import("./pages/Teleconsultation"));
const AdminTeleconsultation = lazy(
  () => import("./pages/AdminTeleconsultation"),
);
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const AdminChat = lazy(() => import("./pages/AdminChat"));
const ManageAppointment = lazy(() => import("./pages/ManageAppointments"));
const AdminDashboard = lazy(()=>import("./pages/AdminDashboard"))
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-t-green-500 border-gray-300 rounded-full animate-spin"></div>
  </div>
);

function App() {
  const { profile, loading: authLoading } = useContext(AuthContext); // GET ROLE HERE
  const [loading, setLoading] = useState(true);
  const role = profile?.role;

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  if (loading) return <Loader />;

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect based on role */}
            <Route
              index
              element={
                role === "superadmin" ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/home" replace />
                )
              }
            />

            <Route path="home" element={<Home />} />
            <Route path="book-appointment" element={<BookAppointments />} />
            <Route path="health-records" element={<HealthRecords />} />

            {/* Pass UID to Teleconsultation */}
            {profile?.uid ? (
              <Route
                path="teleconsultation"
                element={<Teleconsultation userId={profile.uid} />}
              />
            ) : (
              <Route
                path="teleconsultation"
                element={<div>Loading user...</div>}
              />
            )}

            {/* Only superadmin should access this – optional protection */}
            <Route path="dashboard" element={<AdminDashboard />}/>
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="manage-appointment" element={<ManageAppointment />} />
            {profile?.uid ? (
              <Route
                path="admin-teleconsultation"
                element={<AdminTeleconsultation userId={profile?.uid} />}
              />
            ) : (
              <Route
                path="admin-teleconsultation"
                element={<div>Loading user...</div>}
              />
            )}

            {profile?.uid ? (
              <Route path="admin-chat/:sessionId" element={<AdminChat />} />
            ) : (
              <Route
                path="admin-chat/:sessionId"
                element={<div>Loading user...</div>}
              />
            )}

            <Route path="manage-users" element={<ManageUsers />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
