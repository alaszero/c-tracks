import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Machinery from "@/pages/Machinery";
import Projects from "@/pages/Projects";
import Services from "@/pages/Services";
import Invoices from "@/pages/Invoices";
import Expenses from "@/pages/Expenses";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import AdminPanel from "@/pages/AdminPanel";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <AuthLayout />,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      {
        path: "machinery",
        element: (
          <ProtectedRoute resource="machinery">
            <Machinery />
          </ProtectedRoute>
        ),
      },
      {
        path: "projects",
        element: (
          <ProtectedRoute resource="projects">
            <Projects />
          </ProtectedRoute>
        ),
      },
      {
        path: "services",
        element: (
          <ProtectedRoute resource="services">
            <Services />
          </ProtectedRoute>
        ),
      },
      {
        path: "invoices",
        element: (
          <ProtectedRoute resource="invoices">
            <Invoices />
          </ProtectedRoute>
        ),
      },
      {
        path: "expenses",
        element: (
          <ProtectedRoute resource="expenses">
            <Expenses />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute resource="reports">
            <Reports />
          </ProtectedRoute>
        ),
      },
      { path: "settings", element: <Settings /> },
      { path: "admin", element: <AdminPanel /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
