import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

// Pages inside this route are only shown to signed-in users.
export default function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
