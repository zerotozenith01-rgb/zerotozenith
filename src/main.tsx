import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./app/AuthContext";
import App from "./app/App.tsx";
import Dashboard from "./app/Dashboard.tsx";
import LoginPage from "./app/pages/LoginPage.tsx";
import SignupPage from "./app/pages/SignupPage.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);