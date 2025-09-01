import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { user } = useSelector((s) => s.auth);
  const token = localStorage.getItem("token");
  if (!user && !token) return <Navigate to="/login" replace />;
  return children;
}
