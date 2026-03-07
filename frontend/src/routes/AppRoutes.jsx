import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AdminDashboard from "../pages/admin/AdminDashboard";
import BankDashboard from "../pages/bank/BankDashboard";

const AppRoutes = ({ user }) => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/admin-dashboard"
        element={
          user?.role === "admin"
            ? <AdminDashboard />
            : <Navigate to="/" />
        }
      />

      <Route
        path="/bank-dashboard"
        element={
          user?.role === "bank"
            ? <BankDashboard />
            : <Navigate to="/" />
        }
      />
    </Routes>
  );
};

export default AppRoutes;