import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/layout/AppLayout";

// Import các trang
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects"; // <--- MỚI
import ProjectDetail from "./pages/ProjectDetail"; // <--- MỚI
import AcceptInvite from "./pages/AcceptInvite"; // <--- 1. IMPORT VÀO ĐÂY

// Component bảo vệ Route (Giữ nguyên)
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          {/* 1. Public Route */}
          <Route path="/" element={<Login />} />

          <Route path="/accept-invite" element={<AcceptInvite />} />

          {/* 2. Private Routes (Có Sidebar & Header) */}
          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />

            {/* --- CÁC ROUTE MỚI --- */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Route>

          {/* 3. Fallback: Nhập link linh tinh thì về trang chủ */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
