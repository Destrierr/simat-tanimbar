import { Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAppStore from "../stores/useAppStore";

export default function ProtectedRoute({ children, role }) {
  const { role: userRole, clearAll } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const expireSession = () => {
      clearAll();
      navigate("/", { replace: true });
    };
    window.addEventListener("auth:expired", expireSession);
    return () => window.removeEventListener("auth:expired", expireSession);
  }, [clearAll, navigate]);

  if (!userRole || !localStorage.getItem("token"))
    return <Navigate to="/" replace />;

  if (role) {
    const roles = Array.isArray(role) ? role : [role];

    if (!roles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
