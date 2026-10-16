import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../ui/pages/LoginPage";
import DashboardPage from "../ui/pages/DashboardPage";
import AssetsPage from "../ui/pages/AssetsPage";
import AssetDetailPage from "../ui/pages/AssetDetailPage";
import ReportsPage from "../ui/pages/ReportsPage";
import UsersPage from "../ui/pages/UsersPage";
import KecamatanPage from "../ui/pages/KecamatanPage";
import ProtectedRoute from "./ProtectedRoute";
import WorkspaceLayout from "../ui/layouts/WorkspaceLayout";

function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/" element={<LoginPage />} />

      {/* WORKSPACE */}
      <Route
        element={
          <ProtectedRoute role={["admin", "operator", "viewer"]}>
            <WorkspaceLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        <Route
          path="/users"
          element={
            <ProtectedRoute role={["admin"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kecamatan"
          element={
            <ProtectedRoute role={["admin"]}>
              <KecamatanPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
