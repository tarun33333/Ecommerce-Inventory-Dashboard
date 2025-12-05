import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/App.css";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import ProtectedRoute from "./Components/Routes/ProtectedRoute";
import RoleRoute from "./Components/Routes/RoleRoute";
import { AuthProvider } from "./Components/context/AuthContext";


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />


          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowed={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />


          {/* Manager */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute>
                <RoleRoute allowed={["manager", "admin"]}>
                  <ManagerDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />


          {/* Staff */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <RoleRoute allowed={["staff", "manager", "admin"]}>
                  <StaffDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}