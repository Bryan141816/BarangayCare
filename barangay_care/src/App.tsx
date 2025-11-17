import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
// Lazy load the Login page
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const MainLayout = lazy(() => import("./layout/Mainlayout"));
const Home = lazy(() => import("./pages/Home"));
const BookAppointments = lazy(() => import("./pages/BookAppointments"));
const HealthRecords = lazy(() => import("./pages/HealthRecords"));
const Teleconsultation = lazy(() => import("./pages/Teleconsultation"));
const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-t-green-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="book-appointment" element={<BookAppointments />} />
            <Route path="health-records" element={<HealthRecords />} />
            <Route path="teleconsultation" element={<Teleconsultation />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
