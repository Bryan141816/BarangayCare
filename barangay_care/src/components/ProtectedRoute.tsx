import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../provider/AuthProvider";
import type { ReactElement } from "react";
const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
